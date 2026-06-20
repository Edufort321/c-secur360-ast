// Module HSE — pièces jointes des registres/incidents. Deux modes (anti-doublon) :
//   • LIER un document DÉJÀ existant (projet, inspection…) → aucune copie, juste une référence.
//   • TÉLÉVERSER un nouveau fichier → passe par la route service_role /api/hse/attachments (bucket privé).
// Les pièces `sensitive` (santé) ne sont servies/affichées qu'aux profils RH/admin (filtrage côté route + UI).
import { supabase } from '@/lib/supabase';

export type HseEntity = 'incident' | 'register_entry';
export type HseAttachment = {
  id?: string; tenant_id?: string; entity_type: HseEntity; entity_id: string;
  file_name: string; storage_path?: string | null; file_url?: string | null;
  source_module?: string; source_ref_id?: string | null; mime_type?: string | null; file_size?: number | null;
  sensitive?: boolean; uploaded_by?: string | null; created_at?: string;
};

/** Liste les pièces d'une entité. includeSensitive=false masque les documents santé (non-RH). */
export async function listAttachments(tenant: string, entityType: HseEntity, entityId: string, includeSensitive = true): Promise<HseAttachment[]> {
  let q = supabase.from('hse_attachment').select('*').eq('tenant_id', tenant).eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false });
  if (!includeSensitive) q = q.eq('sensitive', false);
  const { data } = await q;
  return (data || []) as HseAttachment[];
}

/** LIER un document existant (anti-doublon) — pas de téléversement. */
export async function linkExistingDocument(tenant: string, a: HseAttachment): Promise<{ error?: string }> {
  const { error } = await supabase.from('hse_attachment').upsert({
    tenant_id: tenant, entity_type: a.entity_type, entity_id: a.entity_id,
    file_name: a.file_name, file_url: a.file_url || null, storage_path: null,
    source_module: a.source_module || 'autre', source_ref_id: a.source_ref_id || null,
    mime_type: a.mime_type || null, file_size: a.file_size ?? null,
    sensitive: !!a.sensitive, uploaded_by: a.uploaded_by || null,
  }, { onConflict: 'tenant_id,entity_type,entity_id,source_module,source_ref_id' });
  return { error: error?.message };
}

/** Enregistre une pièce TÉLÉVERSÉE (storage_path déjà obtenu via la route service_role). */
export async function recordUploadedAttachment(tenant: string, a: HseAttachment): Promise<{ error?: string }> {
  const { error } = await supabase.from('hse_attachment').insert({
    tenant_id: tenant, entity_type: a.entity_type, entity_id: a.entity_id, file_name: a.file_name,
    storage_path: a.storage_path || null, file_url: null, source_module: 'upload', source_ref_id: null,
    mime_type: a.mime_type || null, file_size: a.file_size ?? null, sensitive: !!a.sensitive, uploaded_by: a.uploaded_by || null,
  });
  return { error: error?.message };
}

export async function deleteAttachment(tenant: string, id: string): Promise<void> {
  await supabase.from('hse_attachment').delete().eq('id', id).eq('tenant_id', tenant);
}

/**
 * Sources DÉJÀ existantes liables à un registre/incident (anti-doublon). Best-effort par module.
 * Retourne des documents candidats (projet, inspection) que l'utilisateur peut LIER sans re-téléverser.
 */
export type LinkableDoc = { source_module: string; source_ref_id: string; file_name: string; file_url?: string | null; context?: string };
export async function findLinkableDocuments(tenant: string, opts: { projectId?: string | null } = {}): Promise<LinkableDoc[]> {
  const out: LinkableDoc[] = [];
  // Documents de projet déjà téléversés (réutilisables tels quels).
  try {
    let q = supabase.from('project_attachments').select('id, file_name, file_url, attachment_type, project_id').eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(50);
    if (opts.projectId) q = q.eq('project_id', opts.projectId);
    const { data } = await q;
    for (const d of (data || []) as any[]) out.push({ source_module: 'project', source_ref_id: String(d.id), file_name: d.file_name, file_url: d.file_url, context: d.attachment_type });
  } catch { /* best-effort */ }
  return out;
}
