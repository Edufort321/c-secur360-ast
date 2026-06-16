// Pièces jointes MULTIPLES d'une transaction (migration 187). Le fichier est téléversé via uploadReceipt
// (bucket transaction-receipts), puis une ligne référence l'URL. Le comptable y accède via file_url.
import { supabase } from '@/lib/supabase';

export type TxnAttachment = {
  id?: string; transaction_id?: string; file_name: string; file_url: string; file_type?: string | null; file_size?: number | null;
};

export async function getAttachments(tenant: string, transactionId: string): Promise<TxnAttachment[]> {
  if (!transactionId) return [];
  const { data } = await supabase.from('transaction_attachments').select('*').eq('tenant_id', tenant).eq('transaction_id', transactionId).order('created_at');
  return (data || []) as TxnAttachment[];
}

export async function addAttachment(tenant: string, transactionId: string, a: TxnAttachment): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase.from('transaction_attachments').insert({
    tenant_id: tenant, transaction_id: transactionId, file_name: a.file_name, file_url: a.file_url,
    file_type: a.file_type ?? null, file_size: a.file_size ?? null,
  }).select('id').single();
  return { id: data?.id, error: error?.message };
}

export async function deleteAttachment(tenant: string, id: string): Promise<void> {
  await supabase.from('transaction_attachments').delete().eq('id', id).eq('tenant_id', tenant);
}
