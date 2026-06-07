import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/apiAuth';

// Catalogue des forfaits Assistant IA (jetons) — affichés comme cartes de prix publiques
// (table ai_plans, migration 132) et ajustables ici par l'admin. Clé service -> bypass RLS.

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const { data, error } = await supabaseAdmin.from('ai_plans').select('*').order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const plans = (data || []).map((p: any) => ({
    id: p.id,
    name_fr: p.name_fr,
    name_en: p.name_en,
    price_cents: Number(p.price_cents ?? 0),
    note_fr: p.note_fr ?? '',
    note_en: p.note_en ?? '',
    sort_order: Number(p.sort_order ?? 0),
    active: p.active !== false,
  }));
  return NextResponse.json({ plans });
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const { id, price_cents, name_fr, name_en, note_fr, note_en, active, sort_order } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const updates: any = { updated_at: new Date().toISOString() };
  if (price_cents !== undefined) updates.price_cents = Math.max(0, Math.round(Number(price_cents) || 0));
  if (name_fr !== undefined) updates.name_fr = String(name_fr);
  if (name_en !== undefined) updates.name_en = String(name_en);
  if (note_fr !== undefined) updates.note_fr = String(note_fr);
  if (note_en !== undefined) updates.note_en = String(note_en);
  if (active !== undefined) updates.active = Boolean(active);
  if (sort_order !== undefined) updates.sort_order = Math.round(Number(sort_order) || 0);
  const { error } = await supabaseAdmin.from('ai_plans').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
