import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TENANT_SYSTEM_PROMPT } from '@/lib/assistant/knowledge-base';
import { requireAIUser } from '@/lib/auth/ai-guard';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';

// Assistant TENANT (interne). Auth OBLIGATOIRE + quota par utilisateur. Ne lit aucune donnée tenant.
// Jamais throw vers le client : message de repli propre.
export const dynamic = 'force-dynamic';

const REPLY_FALLBACK = "Je ne peux pas répondre pour l'instant. Réessayez plus tard ou consultez votre responsable HSE/SST.";

export async function POST(req: NextRequest) {
  // Auth + quota AVANT tout appel IA.
  const gate = await requireAIUser(req, 'text');
  if (!gate.ok) return gate.res;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ reply: REPLY_FALLBACK });

  let messages: any[] = [];
  let tenant = '';
  try { const body = await req.json(); messages = body.messages; tenant = String(body.tenant || '').trim(); } catch { /* corps invalide */ }
  // Forfait IA : si le tenant a un forfait epuise, l'assistant est en pause.
  if (tenant) { try { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ reply: "Le forfait d'assistance IA est épuisé. Demandez un renouvellement dans Administration → Abonnement." }); } catch { /* ignore */ } }

  const safe = (Array.isArray(messages) ? messages : [])
    .slice(-10)
    .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content || '').slice(0, 2000) }))
    .filter((m: any) => m.content);
  if (!safe.length) return NextResponse.json({ reply: 'Bonjour ! Je peux vous aider à utiliser C-Secur360 (AST, permis, planificateur…). Que souhaitez-vous faire ?' });

  try {
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: [{ type: 'text', text: TENANT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: safe as any,
    });
    if (tenant) { try { const cost = aiCallCostCents('claude-haiku-4-5-20251001', (resp as any).usage); if (cost > 0) await recordAiUsage(tenant, 'assistant', cost, { feature: 'chat' }); } catch { /* best-effort */ } }
    const reply = (resp.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
    return NextResponse.json({ reply: reply || REPLY_FALLBACK });
  } catch (e) {
    console.error('[tenant-chat] erreur Anthropic:', e);
    return NextResponse.json({ reply: REPLY_FALLBACK });
  }
}
