import { NextRequest, NextResponse } from 'next/server';
import { recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';

// #DGA — Traduction du commentaire/recommandation expert (FR <-> EN), pour le mode
// « traduction auto selon la langue du header ». Proxy serveur (clé non exposée).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const text = String(body.text || '').trim();
  const target = body.target === 'en' ? 'en' : 'fr';
  const tenant = String(body.tenant || '').trim();
  if (!text) return NextResponse.json({ ok: true, text: '' });

  const langName = target === 'en' ? 'English' : 'français';
  const system = `Tu es un traducteur technique (diagnostic d'huile de transformateur, DGA, normes IEEE/IEC/ASTM). Traduis fidèlement le texte vers ${langName}, en conservant le ton d'ingénieur, la terminologie normalisée et la mise en forme (sauts de ligne, tirets). Réponds UNIQUEMENT avec la traduction, sans préambule ni guillemets.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1536, system, messages: [{ role: 'user', content: text }] }),
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents('claude-sonnet-4-20250514', data?.usage); if (cost > 0) await recordAiUsage(tenant, 'dga', cost, { feature: 'translate' }); } catch { /* best-effort */ } }
    const out = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    return NextResponse.json({ ok: true, text: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur traduction' }, { status: 500 });
  }
}
