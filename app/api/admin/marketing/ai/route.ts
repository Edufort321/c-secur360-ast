import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ANTI_INJECTION } from '@/lib/aiGuard';

// IA du Studio MARKETING (espace /admin, réservé super-admin). Clé Anthropic CÔTÉ SERVEUR, prompt
// construit ici (le client n'envoie que des paramètres). Le prompt IMPOSE les normes légales :
//   • Vidéo : aucune donnée client réelle ; toute allégation chiffrée doit être démontrable (LPC).
//   • Courriel : éléments LCAP obligatoires (identité, adresse, désabonnement) ; pas de promesse non prouvée.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(apiKey: string, system: string, prompt: string) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 2048, system, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }] }),
  });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 200)}`); }
  const data = await resp.json();
  const txt = (data?.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
  const clean = txt.replace(/```json|```/g, '').trim();
  const m = clean.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m ? m[0] : clean); } catch { throw new Error('Réponse IA illisible'); }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = String(body.action || '');

  const system = [
    ANTI_INJECTION,
    "Tu es un directeur marketing B2B SaaS au Québec, expert en conformité LCAP/CASL, Loi 25 (RLRQ c P-39.1) et Loi sur la concurrence.",
    "Règles ABSOLUES, non négociables : (1) aucune donnée client réelle ou nominative ; utiliser des exemples fictifs crédibles. (2) Toute allégation chiffrée (« -70 % », « 3x plus vite ») n'est admise que si l'utilisateur fournit une source ; sinon la signaler comme NON DÉMONTRÉE. (3) Pour un courriel commercial : inclure systématiquement identité de l'expéditeur, adresse postale et mécanisme de désabonnement. (4) Ne jamais encourager le scraping ni l'envoi sans consentement.",
  ].join('\n');

  try {
    if (action === 'script') {
      const moduleName = String(body.module || 'Module C-Secur360').slice(0, 120);
      const duree = String(body.duree || '60 s').slice(0, 40);
      const ton = String(body.ton || 'Dynamique').slice(0, 40);
      const message = String(body.message || '').slice(0, 600);
      const prompt = `Écris le SCRIPT et le STORYBOARD d'une courte vidéo de démonstration produit pour le module « ${moduleName} » de la plateforme SST C-Secur360.
Durée cible : ${duree}. Ton : ${ton}. Message clé à démontrer À L'ÉCRAN : "${message}".
La vidéo est une capture d'écran d'un COMPTE DE DÉMONSTRATION à données fictives crédibles (ex. « Poste Bécancour T-4 »), jamais de vraies données client.
Découpe en 4 à 7 scènes. Pour chaque scène : un titre court, une durée en secondes, les effets (parmi: curseur, zoom, sous-titres) et une voix off d'une phrase.
Repère toute allégation chiffrée non démontrable dans le message et liste-la dans "warnings".
Retourne UNIQUEMENT ce JSON (sans texte autour) :
{"scenes":[{"title":"...","seconds":8,"fx":["zoom","curseur"],"voiceover":"..."}],"warnings":["allégation à sourcer ..."],"totalSeconds":60}`;
      const out = await callClaude(apiKey, system, prompt);
      return NextResponse.json({ ok: true, ...out });
    }

    if (action === 'email') {
      const moduleName = String(body.module || 'Module C-Secur360').slice(0, 120);
      const segment = String(body.segment || 'PME').slice(0, 120);
      const angle = String(body.angle || '').slice(0, 600);
      const prompt = `Rédige un courriel de PROSPECTION B2B conforme LCAP pour promouvoir le module « ${moduleName} » de C-Secur360, destiné au segment « ${segment} ».
Angle d'accroche : "${angle}".
Le courriel s'adresse à des prospects DÉJÀ CONSENTANTS (exprès ou tacite valide). Pas de promesse chiffrée non prouvée.
Inclure OBLIGATOIREMENT, sous forme de champs distincts à insérer : un bloc identité expéditeur, l'adresse postale (placeholder « [Adresse postale C-Secur360] ») et une ligne de désabonnement (« [Lien de désabonnement] »).
Retourne UNIQUEMENT ce JSON (sans texte autour) :
{"subjectA":"...","subjectB":"...","body":"corps du courriel (tutoiement professionnel, court)","footer":"identité + [Adresse postale C-Secur360] + [Lien de désabonnement]","compliance":["rappel LCAP/Loi 25 pertinent"]}`;
      const out = await callClaude(apiKey, system, prompt);
      return NextResponse.json({ ok: true, ...out });
    }

    return NextResponse.json({ error: 'action inconnue (script|email)' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 502 });
  }
}
