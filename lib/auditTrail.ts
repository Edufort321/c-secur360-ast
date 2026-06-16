// Journal d'audit des DONNÉES SENSIBLES (finance / RH / actionnaires) — table audit_log (migration 198).
// Distinct de lib/audit.ts (audit d'INFRA : stripe/twilio/vercel → system_audit_logs).
// Écriture SERVEUR (service_role) uniquement. Best-effort : ne JAMAIS faire échouer l'action métier.
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type AuditEntry = {
  tenant: string; actorId?: string | null; actorEmail?: string | null;
  action: string; entityType: string; entityId?: string | null; summary?: string | null;
  meta?: Record<string, any>; ip?: string | null;
};

export async function logAudit(e: AuditEntry): Promise<void> {
  try {
    await supabaseAdmin.from('audit_log').insert({
      tenant_id: e.tenant, actor_id: e.actorId || null, actor_email: e.actorEmail || null,
      action: e.action, entity_type: e.entityType, entity_id: e.entityId || null,
      summary: e.summary || null, meta: e.meta || {}, ip: e.ip || null,
    });
  } catch { /* best-effort : l'audit ne bloque jamais l'action */ }
}

/** Adresse IP best-effort (derrière le proxy Vercel). */
export function clientIp(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
}
