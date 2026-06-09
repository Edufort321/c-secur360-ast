import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { syncProjectCommission } from '@/lib/commission';

// Synchronisation de la commission de vente — exécutée SERVEUR (service role), car elle lit les
// grilles salariales / le personnel et écrit les feuilles de temps (données sensibles fermées à
// l'anon). Scopée au tenant de la SESSION (anti-fuite inter-tenant).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ ok: false, msg: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ ok: false, msg: 'JSON invalide' }, { status: 400 }); }
  const project = body.project;
  if (!project?.id) return NextResponse.json({ ok: false, msg: 'projet requis' }, { status: 400 });
  const r = await syncProjectCommission(supabaseAdmin, acc.tenant, project);
  return NextResponse.json(r);
}
