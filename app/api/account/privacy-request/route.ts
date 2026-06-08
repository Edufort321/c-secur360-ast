import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { createPrivacyRequest, PrivacyKind } from '@/lib/privacy';
import { audit } from '@/lib/audit';

// Loi 25 — Dépôt d'une demande d'exercice de droit (accès, rectification, suppression,
// retrait du consentement, portabilité). Enregistrée avec échéance légale de 30 jours.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const KINDS: PrivacyKind[] = ['access', 'rectification', 'deletion', 'withdrawal', 'portability'];

export async function POST(req: NextRequest) {
  const me = await getSessionUser(req);
  let body: any = {};
  try { body = await req.json(); } catch { /* corps optionnel */ }

  const kind = String(body.kind || '') as PrivacyKind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: 'Type de demande invalide' }, { status: 400 });

  // Courriel : celui de la session si connecté, sinon fourni (permet une demande hors session).
  const email = (me?.email || String(body.email || '')).trim();
  if (!email) return NextResponse.json({ error: 'Courriel requis' }, { status: 400 });

  const res = await createPrivacyRequest({
    tenantId: me?.tenant_id ?? (body.tenant || null),
    userId: me?.id ?? null,
    email,
    kind,
    message: typeof body.message === 'string' ? body.message.slice(0, 4000) : undefined,
  });

  try { await audit('account', 'privacy_request', { email, kind }); } catch { /* ignore */ }

  return NextResponse.json({
    ok: true,
    dueAt: res.dueAt,
    message: `Demande « ${res.label} » reçue. Nous y répondrons d’ici le ${new Date(res.dueAt).toLocaleDateString('fr-CA')} (délai légal de 30 jours). Une copie est transmise au responsable de la protection des renseignements personnels.`,
  });
}
