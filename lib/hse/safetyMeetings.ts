// Module HSE — causeries sécurité (TBM/toolbox) + observations comportementales (BBS).
// Données opérationnelles (RLS permissive), scopées par tenant côté app. Nourrissent les indicateurs
// LEADING (TBM / ASA) du tableau de bord, et se gèrent dans l'onglet « Causeries & observations ».
// v2 : multi-lignes (participants + points abordés) + médias (audio/vidéo/lien Teams) + transcription.
import { supabase } from '@/lib/supabase';

export type HseMeetingKind = 'tbm' | 'observation';
export type HseParticipant = { name: string; role?: string; present?: boolean; signature?: string };
export type HsePoint = { text: string };
export type HseMediaKind = 'audio' | 'video' | 'link';
export type HseMedia = { kind: HseMediaKind; url: string; label?: string; path?: string };

export type HseSafetyMeeting = {
  id?: string; tenant_id?: string; kind: HseMeetingKind; meeting_date: string;
  location?: string | null; topic?: string | null; attendees?: string | null; notes?: string | null; created_by?: string | null;
  participants?: HseParticipant[]; points?: HsePoint[]; media?: HseMedia[];
  meeting_url?: string | null; transcript?: string | null; duration_min?: number | null;
};

export async function getSafetyMeetings(tenant: string): Promise<HseSafetyMeeting[]> {
  const { data } = await supabase.from('hse_safety_meeting').select('*').eq('tenant_id', tenant).order('meeting_date', { ascending: false });
  return (data || []).map(normalize) as HseSafetyMeeting[];
}

// Lecture résiliente : si la migration 263 n'est pas encore appliquée, les colonnes jsonb sont absentes.
function normalize(r: any): HseSafetyMeeting {
  return {
    ...r,
    participants: Array.isArray(r?.participants) ? r.participants : [],
    points: Array.isArray(r?.points) ? r.points : [],
    media: Array.isArray(r?.media) ? r.media : [],
  };
}

export async function saveSafetyMeeting(tenant: string, m: HseSafetyMeeting): Promise<{ error?: string; id?: string }> {
  const now = new Date().toISOString();
  const row: any = {
    tenant_id: tenant, kind: m.kind === 'observation' ? 'observation' : 'tbm', meeting_date: m.meeting_date,
    location: m.location || null, topic: m.topic || null, attendees: m.attendees || null, notes: m.notes || null, updated_at: now,
    participants: m.participants || [], points: m.points || [], media: m.media || [],
    meeting_url: m.meeting_url || null, transcript: m.transcript || null,
    duration_min: m.duration_min ?? null,
  };
  if (m.id) {
    const { error } = await supabase.from('hse_safety_meeting').update(row).eq('id', m.id).eq('tenant_id', tenant);
    return { error: error?.message, id: m.id };
  }
  const { data, error } = await supabase.from('hse_safety_meeting').insert({ ...row, created_by: m.created_by || null }).select('id').single();
  return { error: error?.message, id: data?.id };
}

export async function deleteSafetyMeeting(tenant: string, id: string): Promise<void> {
  await supabase.from('hse_safety_meeting').delete().eq('id', id).eq('tenant_id', tenant);
}

// Téléverse un média de causerie (audio/vidéo) dans le bucket public 'hse-meetings' et renvoie son URL.
export async function uploadMeetingMedia(tenant: string, blob: Blob, ext: string): Promise<{ url?: string; path?: string; error?: string }> {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${tenant}/${stamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('hse-meetings').upload(path, blob, { upsert: false, contentType: blob.type || undefined });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from('hse-meetings').getPublicUrl(path);
    return { url: data.publicUrl, path };
  } catch (e: any) { return { error: e?.message || 'upload' }; }
}
