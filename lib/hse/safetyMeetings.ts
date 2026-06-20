// Module HSE — causeries sécurité (TBM/toolbox) + observations comportementales (BBS).
// Données opérationnelles (RLS permissive), scopées par tenant côté app. Nourrissent les indicateurs
// LEADING (TBM / ASA) du tableau de bord, et se gèrent dans l'onglet « Causeries & observations ».
import { supabase } from '@/lib/supabase';

export type HseMeetingKind = 'tbm' | 'observation';
export type HseSafetyMeeting = {
  id?: string; tenant_id?: string; kind: HseMeetingKind; meeting_date: string;
  location?: string | null; topic?: string | null; attendees?: string | null; notes?: string | null; created_by?: string | null;
};

export async function getSafetyMeetings(tenant: string): Promise<HseSafetyMeeting[]> {
  const { data } = await supabase.from('hse_safety_meeting').select('*').eq('tenant_id', tenant).order('meeting_date', { ascending: false });
  return (data || []) as HseSafetyMeeting[];
}

export async function saveSafetyMeeting(tenant: string, m: HseSafetyMeeting): Promise<{ error?: string }> {
  const row: any = {
    tenant_id: tenant, kind: m.kind === 'observation' ? 'observation' : 'tbm', meeting_date: m.meeting_date,
    location: m.location || null, topic: m.topic || null, attendees: m.attendees || null, notes: m.notes || null, updated_at: new Date().toISOString(),
  };
  if (m.id) { const { error } = await supabase.from('hse_safety_meeting').update(row).eq('id', m.id).eq('tenant_id', tenant); return { error: error?.message }; }
  const { error } = await supabase.from('hse_safety_meeting').insert({ ...row, created_by: m.created_by || null });
  return { error: error?.message };
}

export async function deleteSafetyMeeting(tenant: string, id: string): Promise<void> {
  await supabase.from('hse_safety_meeting').delete().eq('id', id).eq('tenant_id', tenant);
}
