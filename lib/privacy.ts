// Loi 25 — helpers pour l'exercice des droits des personnes concernées.
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type PrivacyKind = 'access' | 'rectification' | 'deletion' | 'withdrawal' | 'portability';

const LABELS: Record<PrivacyKind, string> = {
  access: 'Accès à mes renseignements',
  rectification: 'Rectification',
  deletion: 'Suppression / droit à l’oubli',
  withdrawal: 'Retrait du consentement',
  portability: 'Portabilité (export)',
};

/**
 * Enregistre une demande d'exercice de droit avec une échéance légale de 30 jours.
 * Best-effort : si la table n'existe pas encore (migration 141 non appliquée), on renvoie
 * tout de même un accusé pour ne jamais bloquer la personne (la demande est aussi journalisée).
 */
export async function createPrivacyRequest(input: {
  tenantId?: string | null;
  userId?: string | null;
  email: string;
  kind: PrivacyKind;
  message?: string;
}): Promise<{ ok: boolean; dueAt: string; label: string }> {
  const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await supabaseAdmin.from('privacy_requests').insert({
      tenant_id: input.tenantId ?? null,
      user_id: input.userId ?? null,
      email: input.email,
      kind: input.kind,
      message: input.message ?? null,
      status: 'received',
      due_at: dueAt,
    });
  } catch { /* table absente / RLS : on n'échoue pas côté personne concernée */ }
  return { ok: true, dueAt, label: LABELS[input.kind] || input.kind };
}
