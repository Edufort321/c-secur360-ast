'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Modules activés pour un tenant (depuis tenant_modules). null = chargement.
// S'abonne aux changements Realtime — se met à jour sans rechargement de page.
export function useEntitlements(tenant: string): string[] | null {
  const [enabled, setEnabled] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;

    async function fetch() {
      try {
        const { data } = await supabase
          .from('tenant_modules')
          .select('module_key, enabled')
          .eq('tenant_id', tenant)
          .eq('enabled', true);
        if (active) setEnabled((data || []).map((r: any) => r.module_key));
      } catch {
        if (active) setEnabled(null);
      }
    }

    fetch();

    // Écoute les INSERT/UPDATE/DELETE sur tenant_modules pour ce tenant
    const channel = supabase
      .channel(`entitlements:${tenant}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenant_modules', filter: `tenant_id=eq.${tenant}` },
        () => { if (active) fetch(); }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [tenant]);

  return enabled;
}
