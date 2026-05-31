import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Liste des leads démo (nom + courriel + usage). Réservé à l'admin (cookie dashboard / super_admin / secret sync).
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const { data, error } = await supabaseAdmin
    .from('demo_sessions')
    .select('email, name, status, attempts, total_seconds, first_seen, last_start, session_expires_at')
    .order('first_seen', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data || [] });
}
