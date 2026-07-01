import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Poinçon (punch) du planificateur. Le TRAVAILLEUR CONNECTÉ pointe sur une tâche planifiée :
//  - POST {action:'in', jobId, projectId, projectNumber, siteId, jobTitle} -> ouvre un poinçon
//  - POST {action:'out', punchId} -> ferme, calcule les heures (arrondi 15 min) et les INJECTE dans SA
//    feuille de temps de la semaine (timesheets + timesheet_entries), rattachées au projet -> réel live.
//  - GET -> poinçon(s) ouvert(s) du travailleur connecté.
// Tenant + personne = SESSION (jamais le client) — anti-IDOR. Table fermée à l'anon.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const round15 = (h: number) => Math.round(Math.max(0, h) * 4) / 4; // 0,25 h

function weekBounds(d: Date) {
  const day = d.getDay();                       // 0 dim .. 6 sam
  const mon = new Date(d); mon.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return { weekStart: iso(mon), weekEnd: iso(sun), today: iso(d) };
}

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data } = await supabaseAdmin.from('time_punches')
    .select('*').eq('tenant_id', u.tenant_id).eq('person_id', u.id).is('punched_out_at', null)
    .order('punched_in_at', { ascending: false });
  return NextResponse.json({ ok: true, open: data || [] });
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const name = (u as any).name || (u.email || '').split('@')[0];
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

  if (body.action === 'in') {
    // Évite les poinçons ouverts en double sur la même tâche.
    const { data: dup } = await supabaseAdmin.from('time_punches').select('id')
      .eq('tenant_id', tenant).eq('person_id', u.id).eq('job_id', body.jobId || '').is('punched_out_at', null).maybeSingle();
    if (dup) return NextResponse.json({ ok: true, id: dup.id, already: true });
    const { data, error } = await supabaseAdmin.from('time_punches').insert({
      tenant_id: tenant, person_id: u.id, person_name: name, person_email: u.email || null,
      job_id: body.jobId || null, project_id: body.projectId || null, project_number: body.projectNumber || null,
      site_id: body.siteId || null, punched_in_at: new Date().toISOString(),
    }).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  }

  if (body.action === 'out') {
    if (!body.punchId) return NextResponse.json({ error: 'punchId requis' }, { status: 400 });
    const { data: punch } = await supabaseAdmin.from('time_punches').select('*')
      .eq('id', body.punchId).eq('tenant_id', tenant).eq('person_id', u.id).maybeSingle();
    if (!punch) return NextResponse.json({ error: 'Poinçon introuvable' }, { status: 404 });
    if (punch.punched_out_at) return NextResponse.json({ ok: true, hours: punch.hours, already: true });

    const now = new Date();
    const hours = round15((now.getTime() - new Date(punch.punched_in_at).getTime()) / 3_600_000);
    await supabaseAdmin.from('time_punches').update({ punched_out_at: now.toISOString(), hours }).eq('id', punch.id);

    // Injection dans la feuille de temps de la semaine du travailleur (création si absente).
    const { weekStart, weekEnd, today } = weekBounds(now);
    let { data: sheet } = await supabaseAdmin.from('timesheets').select('id')
      .eq('tenant_id', tenant).eq('employee_id', u.id).eq('period_start', weekStart).maybeSingle();
    if (!sheet) {
      const ins = await supabaseAdmin.from('timesheets').insert({
        tenant_id: tenant, employee_id: u.id, employee_email: u.email || null, employee_name: name,
        period_start: weekStart, period_end: weekEnd, status: 'draft',
      }).select('id').single();
      sheet = ins.data;
    }
    if (sheet && hours > 0) {
      // On CUMULE les heures du jour sur une ligne existante. L'éditeur pouvant avoir PLUSIEURS lignes
      // le même jour (projets/tâches différents), `maybeSingle()` plantait (« multiple rows ») → 500 au
      // poinçon sortie. On prend la 1re ligne du jour via limit(1).
      const { data: exRows } = await supabaseAdmin.from('timesheet_entries').select('id, hrs_regular, project_id, project_number')
        .eq('timesheet_id', sheet.id).eq('tenant_id', tenant).eq('date', today).order('id').limit(1);
      const ex = (exRows || [])[0];
      // project_number est NOT NULL en base (defaut '') -> on coalesce a '' (un NULL ferait echouer
      // l'insertion en SILENCE = le temps ne remontait pas sur la feuille). project_id est nullable.
      let wErr: any = null;
      if (ex) {
        const r = await supabaseAdmin.from('timesheet_entries').update({
          hrs_regular: round15(Number(ex.hrs_regular || 0) + hours),
          project_id: ex.project_id || punch.project_id || null,
          project_number: ex.project_number || punch.project_number || '',
        }).eq('id', ex.id);
        wErr = r.error;
      } else {
        const r = await supabaseAdmin.from('timesheet_entries').insert({
          timesheet_id: sheet.id, tenant_id: tenant, date: today, category: 'project',
          project_id: punch.project_id || null, project_number: punch.project_number || '',
          hrs_regular: hours, hrs_overtime: 0, hrs_premium: 0,
        });
        wErr = r.error;
      }
      if (wErr) return NextResponse.json({ error: `Heures non enregistrées sur la feuille de temps : ${wErr.message}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, hours, timesheetId: sheet?.id });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
