import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Alerte de maintenance PUBLIQUE (scan QR par un externe, SANS login). On vérifie côté serveur que
// l'équipement autorise les alertes publiques (equipment.public_alerts_enabled) avant d'insérer.
// Anti-abus : rate-limit par IP. Service_role (l'anon n'écrit pas directement la table).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const hits = new Map<string, { n: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now(); const b = hits.get(ip);
  if (!b || now > b.reset) { hits.set(ip, { n: 1, reset: now + 60_000 }); return false; }
  b.n++; return b.n > 6; // max 6 alertes/min/IP
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    if (rateLimited(ip)) return NextResponse.json({ error: 'Trop de requêtes — réessayez dans un instant.' }, { status: 429 });

    let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
    const tenant = String(body.tenant || '').trim();
    const equipmentId = String(body.equipment_id || '').trim();
    const description = String(body.description || '').trim();
    const alertType = ['bris', 'maintenance', 'autre'].includes(body.alert_type) ? body.alert_type : 'bris';
    if (!tenant || !equipmentId) return NextResponse.json({ error: 'Équipement requis' }, { status: 400 });
    if (description.length < 3) return NextResponse.json({ error: 'Décrivez le problème.' }, { status: 400 });

    // L'équipement doit exister ET autoriser les alertes publiques.
    const { data: eq } = await supabaseAdmin.from('equipment').select('id, equipment_name, public_alerts_enabled').eq('id', equipmentId).eq('tenant_id', tenant).maybeSingle();
    if (!eq) return NextResponse.json({ error: 'Équipement introuvable.' }, { status: 404 });
    if (!(eq as any).public_alerts_enabled) return NextResponse.json({ error: 'Les alertes publiques sont désactivées pour cet équipement.' }, { status: 403 });

    const { error } = await supabaseAdmin.from('maintenance_alerts').insert({
      tenant_id: tenant, equipment_id: equipmentId, equipment_name: (eq as any).equipment_name || null,
      alert_type: alertType, reporter_name: String(body.reporter_name || '').slice(0, 120) || null,
      reporter_phone: String(body.reporter_phone || '').slice(0, 40) || null,
      description: description.slice(0, 2000), status: 'new',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 });
  }
}
