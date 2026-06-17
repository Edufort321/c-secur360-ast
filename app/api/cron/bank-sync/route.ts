import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { flinksConfigured } from '@/lib/flinks';
import { syncBankConnection } from '@/lib/bankSync';

// CRON : synchronise toutes les connexions bancaires actives (Flinks) → bank_statement_lines.
// Protégé par CRON_SECRET. Ne fait rien si Flinks n'est pas configuré.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!flinksConfigured()) return NextResponse.json({ ok: true, skipped: 'flinks-not-configured' });
  const { data: conns } = await supabaseAdmin.from('bank_connections').select('*').eq('status', 'active');
  let inserted = 0, synced = 0;
  for (const c of (conns as any[]) || []) { try { inserted += (await syncBankConnection((c as any).tenant_id, c)).inserted; synced++; } catch { /* marqué en erreur dans le helper */ } }
  return NextResponse.json({ ok: true, connections: synced, inserted });
}
