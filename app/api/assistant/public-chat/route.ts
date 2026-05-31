import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PUBLIC_SYSTEM_PROMPT, PUBLIC_CONTACT_EMAIL } from '@/lib/assistant/public-knowledge';
import { getClientIp, checkPublicQuota } from '@/lib/assistant/public-guard';

// Chatbot PUBLIC (marketing). Visiteurs anonymes. Coût borné (quota avant appel, max_tokens court,
// prompt caching). Ne JAMAIS throw vers le client : toujours un message de repli propre.
export const dynamic = 'force-dynamic';

const REPLY_QUOTA = `Beaucoup de questions en ce moment ! Pour une démonstration ou une réponse rapide, écrivez-nous à ${PUBLIC_CONTACT_EMAIL}.`;
const REPLY_FALLBACK = `Je ne peux pas répondre pour l'instant. Pour une démonstration ou toute question, écrivez-nous à ${PUBLIC_CONTACT_EMAIL}.`;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  // Quota AVANT tout appel IA -> zéro requête facturée si dépassé.
  if (!checkPublicQuota(ip).ok) return NextResponse.json({ reply: REPLY_QUOTA });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ reply: REPLY_FALLBACK });

  let messages: any[] = [];
  try { ({ messages } = await req.json()); } catch { /* corps invalide */ }

  // Borne l'historique (8 derniers) et la taille d'entrée (1000 chars).
  const safe = (Array.isArray(messages) ? messages : [])
    .slice(-8)
    .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content || '').slice(0, 1000) }))
    .filter((m: any) => m.content);
  if (!safe.length) return NextResponse.json({ reply: `Bonjour ! Je peux vous présenter C-Secur360 et organiser une démo. Que souhaitez-vous savoir ?` });

  try {
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 350,
      // Prompt caching sur le system prompt (réduit le coût des tokens d'entrée répétés).
      system: [{ type: 'text', text: PUBLIC_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: safe as any,
    });
    const reply = (resp.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim();
    return NextResponse.json({ reply: reply || REPLY_FALLBACK });
  } catch {
    return NextResponse.json({ reply: REPLY_FALLBACK });
  }
}
