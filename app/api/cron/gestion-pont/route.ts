import { NextRequest, NextResponse } from 'next/server';
import { envoyerAGestion } from '@/lib/gestionPont';
import { requireAdmin } from '@/lib/apiAuth';

// PONT VERS CERDIA GESTION (lib/gestionPont.ts) : chaque jour (vercel.json, CRON_SECRET), et à la demande d'un super-admin
// (POST, { essai: true } pour l'essai à blanc). Idempotent : Gestion ignore ce qu'il a déjà reçu.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const s = process.env.CRON_SECRET;
  if (!s || req.headers.get('authorization') !== `Bearer ${s}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try { return NextResponse.json(await envoyerAGestion(false)); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const b = await req.json().catch(() => ({}));
  try { return NextResponse.json(await envoyerAGestion(b?.essai === true)); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
