import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Liste légère des analyses DGA d'un tenant + résumé d'un dossier, pour les EMBARQUER dans un autre
// document (ex. rapport terrain). Scopé au tenant de SESSION (anti-fuite). Les valeurs de
// diagnostic (condition/duval/fault/tdcg) sont déjà stockées sur dga_measures — pas de recalcul.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const dossierId = new URL(req.url).searchParams.get('dossierId');

  if (dossierId) {
    const { data: dossier } = await supabaseAdmin.from('dga_dossiers')
      .select('id, ident, serie, client, kv, mva, oil_type, manufacturer, year, extra')
      .eq('tenant_id', tenant).eq('id', dossierId).maybeSingle();
    if (!dossier) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
    const { data: measures } = await supabaseAdmin.from('dga_measures')
      .select('id, sample_date, h2, ch4, c2h6, c2h4, c2h2, co, co2, tdcg, condition, duval, fault, flag, ai_summary')
      .eq('tenant_id', tenant).eq('dossier_id', dossierId).order('sample_date', { ascending: false }).limit(1);
    const m: any = (measures || [])[0] || null;
    const ex: any = dossier.extra || {};
    const summary = {
      dossierId: dossier.id,
      equipment: dossier.ident || '',
      serial: dossier.serie || '',
      location: dossier.client || '',
      kv: dossier.kv ?? null, mva: dossier.mva ?? null,
      projectNo: ex.project_no || '',
      analysisDate: m?.sample_date || '',
      gases: m ? { h2: m.h2, ch4: m.ch4, c2h6: m.c2h6, c2h4: m.c2h4, c2h2: m.c2h2, co: m.co, co2: m.co2 } : null,
      tdcg: m?.tdcg ?? null,
      condition: (m && m.condition != null) ? Number(m.condition) + 1 : null, // 0-3 -> Condition 1-4
      duval: m?.duval || '',
      fault: m?.fault || '',
      flag: m?.flag || '',
      aiSummary: m?.ai_summary || '',
      recommendation: ex.manual_reco_fr || ex.manual_reco_en || '',
      nextDate: ex.next_date_manual || '',
    };
    return NextResponse.json({ ok: true, summary });
  }

  const { data } = await supabaseAdmin.from('dga_dossiers')
    .select('id, ident, serie, client, kv, mva').eq('tenant_id', tenant).order('ident').limit(1000);
  return NextResponse.json({ ok: true, dossiers: (data || []).map((d: any) => ({ id: d.id, ident: d.ident || '', serie: d.serie || '', client: d.client || '', kv: d.kv, mva: d.mva })) });
}
