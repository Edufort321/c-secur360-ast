// Pièces jointes de PROJET : documents reçus du client (bon de commande, contrat, devis signé, plans…).
// Upload vers le bucket Storage 'project-documents' (public en lecture) ; repli base64 si le bucket est
// indisponible (mode local / migration 211 non appliquée). Table project_attachments (RLS permissive).
import { supabase } from '@/lib/supabase';

export type ProjectAttachmentType = 'bon_commande' | 'contrat' | 'devis_signe' | 'document_client' | 'autre';

export type ProjectAttachment = {
  id?: string;
  tenant_id?: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  attachment_type?: ProjectAttachmentType | string;
  uploaded_by?: string | null;
  created_at?: string;
};

export const PROJECT_ATTACHMENT_TYPES: { value: ProjectAttachmentType; fr: string; en: string }[] = [
  { value: 'bon_commande', fr: 'Bon de commande', en: 'Purchase order' },
  { value: 'contrat', fr: 'Contrat', en: 'Contract' },
  { value: 'devis_signe', fr: 'Devis / soumission signé', en: 'Signed quote' },
  { value: 'document_client', fr: 'Document client', en: 'Client document' },
  { value: 'autre', fr: 'Autre', en: 'Other' },
];

export async function getProjectAttachments(tenant: string, projectId: string): Promise<ProjectAttachment[]> {
  try {
    const { data } = await supabase.from('project_attachments').select('*')
      .eq('tenant_id', tenant).eq('project_id', projectId).order('created_at', { ascending: false });
    return (data || []) as ProjectAttachment[];
  } catch { return []; }
}

export async function uploadProjectAttachment(
  tenant: string, projectId: string, file: File, attachmentType: ProjectAttachmentType | string = 'document_client', uploadedBy?: string | null,
): Promise<{ row?: ProjectAttachment; error?: any }> {
  let url = '';
  try {
    const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
    const path = `${tenant}/${projectId}/${crypto.randomUUID()}-${safe}`;
    const up = await supabase.storage.from('project-documents').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
    if (!up.error) url = supabase.storage.from('project-documents').getPublicUrl(path).data.publicUrl;
  } catch { /* bucket absent -> repli base64 */ }
  if (!url) {
    url = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = e => resolve(e.target?.result as string); r.onerror = reject; r.readAsDataURL(file); });
  }
  const { data, error } = await supabase.from('project_attachments').insert({
    tenant_id: tenant, project_id: projectId, file_name: file.name, file_url: url,
    file_type: file.type || null, file_size: file.size || null, attachment_type: attachmentType, uploaded_by: uploadedBy || null,
  }).select('*').single();
  return { row: data as ProjectAttachment, error };
}

export async function deleteProjectAttachment(tenant: string, id: string): Promise<{ error?: any }> {
  const { error } = await supabase.from('project_attachments').delete().eq('tenant_id', tenant).eq('id', id);
  return { error };
}
