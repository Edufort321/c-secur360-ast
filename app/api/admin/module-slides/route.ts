import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('module_key');
  let q = supabaseAdmin.from('module_slides').select('*').order('sort_order');
  if (key) q = q.eq('module_key', key) as typeof q;
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error } = await supabaseAdmin.from('module_slides').insert(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const { id, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('module_slides').update(rest).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('module_slides').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
