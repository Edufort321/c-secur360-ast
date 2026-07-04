import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/apiAuth';

// NB : la page publique lit la table landing_testimonials directement (lecture seule).
// Cette route est réservée à l'admin -> toutes les ÉCRITURES sont protégées (anti-défacement).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const { data, error } = await supabaseAdmin
    .from('landing_testimonials').select('*').order('sort_order').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const body = await req.json();
  const { error } = await supabaseAdmin.from('landing_testimonials').insert(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const { id, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('landing_testimonials').update(rest).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('landing_testimonials').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
