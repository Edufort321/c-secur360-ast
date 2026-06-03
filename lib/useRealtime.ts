'use client';

// Hook d'abonnement Supabase Realtime réutilisable.
// S'abonne aux changements (INSERT/UPDATE/DELETE) d'une ou plusieurs tables, filtrés par tenant,
// et appelle onChange (anti-rebond) à chaque événement. Nécessite Realtime activé côté DB
// (migration 109 : tables dans la publication supabase_realtime).
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtime(tables: string[], tenant: string | undefined, onChange: () => void) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const key = tables.join(',');
  useEffect(() => {
    if (!tables.length) return;
    let timer: any;
    const fire = () => { clearTimeout(timer); timer = setTimeout(() => cb.current(), 400); }; // anti-rebond
    const channel = supabase.channel(`rt_${key}_${tenant || 'all'}_${Math.random().toString(36).slice(2, 7)}`);
    for (const t of tables) {
      channel.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: t, ...(tenant ? { filter: `tenant_id=eq.${tenant}` } : {}) },
        fire
      );
    }
    channel.subscribe();
    return () => { clearTimeout(timer); try { supabase.removeChannel(channel); } catch { /* noop */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tenant]);
}
