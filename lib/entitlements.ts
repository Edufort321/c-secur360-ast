'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Modules activés pour un tenant (depuis tenant_modules). null = chargement.
// Fallback : si la table est vide/inaccessible, renvoie null (l'appelant peut décider d'un défaut).
export function useEntitlements(tenant: string): string[] | null {
  const [enabled, setEnabled] = useState<string[] | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('tenant_modules').select('module_key, enabled').eq('tenant_id', tenant).eq('enabled', true);
        if (active) setEnabled((data || []).map((r: any) => r.module_key));
      } catch {
        if (active) setEnabled([]);
      }
    })();
    return () => { active = false; };
  }, [tenant]);
  return enabled;
}
