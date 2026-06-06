import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Mouvement de stock depuis la fiche publique scannee (caméra native -> /scan/[tenant]/[id]).
// Requiert une session valide (cookie auth_token) appartenant au tenant (ou super_admin).
// Source de verite = snapshot inventory_state.data (meme modele que le module Inventaire) :
// on lit, on applique l'entree (+) / la sortie (-) sur la bonne succursale, on append le
// mouvement, puis on reecrit le snapshot. L'app le relira a l'ouverture (pas de realtime sur le snapshot).

export const dynamic = 'force-dynamic';

type Json = any;

function num(v: any): number { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export async function POST(req: NextRequest) {
  // 1) Authentification (le middleware skippe /api/, on lit le cookie nous-memes).
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

  const { data: session } = await supabaseAdmin
    .from('auth_sessions')
    .select('users!inner(id, email, name, role, tenant_id)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  const user = (session?.users as any) || null;
  if (!user) return NextResponse.json({ error: 'Session expiree' }, { status: 401 });

  // 2) Corps de la requete.
  let body: Json;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }); }
  const tenant = String(body.tenant || '').trim();
  const itemId = String(body.itemId ?? '').trim();
  const departmentCode = body.departmentCode != null ? String(body.departmentCode) : null;
  const type = body.type === 'exit' ? 'exit' : 'entry';
  const quantity = Math.abs(num(body.quantity));
  const reason = String(body.reason || '').slice(0, 300);
  const projectCode = body.projectCode != null ? String(body.projectCode).slice(0, 100) : '';

  if (!tenant || !itemId) return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 });
  if (!(quantity > 0)) return NextResponse.json({ error: 'Quantite invalide' }, { status: 400 });

  // 3) Autorisation tenant : super_admin partout, sinon le tenant doit correspondre.
  if (user.role !== 'super_admin' && String(user.tenant_id) !== tenant) {
    return NextResponse.json({ error: 'Acces refuse a ce tenant' }, { status: 403 });
  }

  // 4) Charger le snapshot.
  const { data: row, error: loadErr } = await supabaseAdmin
    .from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
  if (loadErr) return NextResponse.json({ error: 'Lecture inventaire impossible' }, { status: 500 });
  const snapshot = (row?.data as Json) || {};
  const items: Json[] = Array.isArray(snapshot.items) ? snapshot.items : [];
  const movements: Json[] = Array.isArray(snapshot.movements) ? snapshot.movements : [];
  const departments: Json[] = Array.isArray(snapshot.departments) ? snapshot.departments : [];

  const idx = items.findIndex(i => String(i.id) === itemId || i.code === itemId);
  if (idx === -1) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
  const item = { ...items[idx] };

  const delta = type === 'exit' ? -quantity : quantity;
  let movementDepartment: string | null = null;

  // 5) Appliquer le delta : sur la succursale ciblee (multi-emplacement) ou sur la quantite globale.
  if (item.isMultiLocation && Array.isArray(item.locations) && departmentCode) {
    const deptName = departments.find(d => d.code === departmentCode)?.name;
    const li = item.locations.findIndex((l: Json) => l.departmentCode === departmentCode || l.department === deptName);
    if (li === -1) return NextResponse.json({ error: `Succursale ${departmentCode} introuvable pour cet article` }, { status: 400 });
    const loc = item.locations[li];
    const newLocQty = num(loc.quantity) + delta;
    if (newLocQty < 0) return NextResponse.json({ error: 'Stock insuffisant', available: num(loc.quantity) }, { status: 409 });
    const locations = [...item.locations];
    locations[li] = { ...loc, quantity: newLocQty };
    item.locations = locations;
    item.quantity = locations.reduce((s: number, l: Json) => s + num(l.quantity), 0);
    movementDepartment = loc.department || deptName || null;
  } else {
    const newQty = num(item.quantity) + delta;
    if (newQty < 0) return NextResponse.json({ error: 'Stock insuffisant', available: num(item.quantity) }, { status: 409 });
    item.quantity = newQty;
  }

  // 6) Append du mouvement (meme forme que addMovement cote app).
  const movement = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    itemId: item.id,
    itemName: item.name,
    department: movementDepartment || undefined,
    departmentCode: departmentCode || undefined,
    quantity,
    reason,
    projectCode,
    source: 'scan-public',
    user: user.name || user.email || 'scan',
    timestamp: new Date().toISOString(),
  };

  const newItems = [...items];
  newItems[idx] = item;
  const newSnapshot = { ...snapshot, items: newItems, movements: [movement, ...movements] };

  // 7) Reecrire le snapshot.
  const { error: saveErr } = await supabaseAdmin
    .from('inventory_state')
    .upsert({ tenant_id: tenant, data: newSnapshot, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  if (saveErr) return NextResponse.json({ error: 'Sauvegarde impossible : ' + saveErr.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    itemId: item.id,
    quantity: item.quantity,
    locationQuantity: movementDepartment != null && Array.isArray(item.locations)
      ? num(item.locations.find((l: Json) => (l.department === movementDepartment))?.quantity)
      : item.quantity,
    type,
    by: movement.user,
  });
}
