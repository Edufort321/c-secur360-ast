import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/apiAuth';

// Liste des tenants (sous-domaines) ayant une DEMANDE d'ajustement de forfait IA en attente,
// ou dont le forfait est ÉPUISÉ -> carte rouge « ajustement token requis » dans la liste clients.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  try {
    const { data } = await supabaseAdmin.from('ai_budgets').select('*');
    const AI_MARGIN = 0.30;
    const requested: string[] = [];
    const exhausted: string[] = [];
    for (const r of (data || []) as any[]) {
      const tier = Number(r.tier_cents) || 0;
      const used = Number(r.used_cents) || 0;
      if (r.renewal_requested === true) requested.push(r.tenant_id);
      if (tier > 0 && used >= Math.round(tier * (1 - AI_MARGIN))) exhausted.push(r.tenant_id);
    }
    return NextResponse.json({ requested, exhausted });
  } catch {
    return NextResponse.json({ requested: [], exhausted: [] });
  }
}
