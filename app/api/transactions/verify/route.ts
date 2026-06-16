import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';

// « Vérifier IA » d'une transaction : l'utilisateur remplit, l'IA vérifie la COHÉRENCE comptable/fiscale
// et renvoie des CORRECTIONS concrètes. Proxy SERVEUR (clé Anthropic jamais côté navigateur), budget IA
// scopé au tenant de la session. Comptabilité d'EXERCICE, QC : TPS 5 % / TVQ 9,975 %.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-20250514';

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const txn = body.transaction;
  if (!txn || typeof txn !== 'object') return NextResponse.json({ error: 'transaction requise' }, { status: 400 });

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); }

  const system = [
    ANTI_INJECTION,
    `Tu es un assistant COMPTABLE et FISCAL pour une entreprise canadienne (Québec : TPS 5 %, TVQ 9,975 % ; comptabilité d'EXERCICE). On te fournit une TRANSACTION (revenu OU dépense) avec son en-tête et ses lignes (description, compte du grand livre choisi, montant, catégorie de taxe). VÉRIFIE la cohérence et propose des CORRECTIONS PRÉCISES :
1. Le COMPTE du grand livre de chaque ligne correspond-il à la nature décrite ? (ex. « essence » -> charge véhicule, pas fournitures de bureau).
2. La CATÉGORIE DE TAXE (taxable / détaxé / exonéré) est-elle plausible pour cette dépense/ce revenu ?
3. Le CALCUL des taxes (TPS/TVQ) est-il cohérent avec la base taxable et la province ?
4. Le SENS (revenu vs dépense) et le signe des montants.
5. Présence d'un FOURNISSEUR/CLIENT et d'une PIÈCE JUSTIFICATIVE (reçu) pour une dépense.
6. Montants anormaux / suspects.
Réponds UNIQUEMENT en JSON valide, sans texte autour, de la forme :
{"ok": true|false, "summary": "phrase courte", "issues": [{"severity":"error|warning|info","field":"champ ou ligne concernée","message":"problème","suggestion":"correction concrète"}]}
Si tout est correct : ok=true, issues=[]. Sois CONCIS, CONCRET, en FRANÇAIS.`,
  ].join('\n');

  const userMsg = `Transaction à vérifier (province ${txn.province || 'QC'}, type ${txn.txn_type || 'expense'}) :\n${JSON.stringify(txn).slice(0, 6000)}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, messages: [{ role: 'user', content: userMsg }] }),
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'transactions', cost, { feature: 'verify' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    // Extrait le JSON (tolère d'éventuels ```json … ``` ou texte parasite).
    let result: any = null;
    const m = text.match(/\{[\s\S]*\}/);
    try { result = JSON.parse(m ? m[0] : text); } catch { result = { ok: false, summary: 'Réponse IA illisible.', issues: [], raw: text.slice(0, 500) }; }
    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}
