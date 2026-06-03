'use client';

// Garde d'accès module réutilisable : un module n'est visible/accessible que si le tenant y est abonné
// (tenant_modules.enabled). À utiliser dans les pages de module pour bloquer aussi l'accès direct par URL.
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ModuleAccess = 'loading' | 'enabled' | 'locked';

// defaultEnabled : pour les modules de base (déjà déployés partout) on tolère l'accès si aucune ligne
// n'existe ; pour un module vendu à l'unité (ex. dga), mettre false -> verrouillé tant que non coché.
export function useModuleEnabled(tenant: string, moduleKey: string, defaultEnabled = false): ModuleAccess {
  const [state, setState] = useState<ModuleAccess>('loading');
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('tenant_modules')
          .select('enabled')
          .eq('tenant_id', tenant)
          .eq('module_key', moduleKey)
          .maybeSingle();
        if (!alive) return;
        if (error) { setState(defaultEnabled ? 'enabled' : 'locked'); return; }
        if (data) { setState(data.enabled ? 'enabled' : 'locked'); return; }
        setState(defaultEnabled ? 'enabled' : 'locked');
      } catch {
        if (alive) setState(defaultEnabled ? 'enabled' : 'locked');
      }
    })();
    return () => { alive = false; };
  }, [tenant, moduleKey, defaultEnabled]);
  return state;
}
