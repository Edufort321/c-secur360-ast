'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Site = { id: string; name: string; code?: string | null };

const SiteCtx = createContext<{
  sites: Site[];
  siteId: string;          // 'all' ou un id de site
  setSiteId: (s: string) => void;
  loading: boolean;
}>({ sites: [], siteId: 'all', setSiteId: () => {}, loading: true });

export function SiteProvider({ tenant, children }: { tenant: string; children: React.ReactNode }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteIdState] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`cs-site-${tenant}`) : null;
    if (saved) setSiteIdState(saved);
    (async () => {
      try {
        // Source UNIQUE = planner_succursales (le vrai système de sites, hiérarchique, géré en admin et
        // lié aux modules : equipment.site_id, DGA…). On expose les SITES racines (parent_id null) ;
        // l'ancienne table `sites` n'était pas alignée avec les site_id des modules.
        const { data } = await supabase
          .from('planner_succursales').select('id, name, code, parent_id').eq('tenant_id', tenant).order('name');
        const roots = ((data as any[]) || []).filter(r => !r.parent_id).map(r => ({ id: r.id, name: r.name, code: r.code }));
        if (active) setSites(roots);
      } catch {
        if (active) setSites([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenant]);

  const setSiteId = (s: string) => {
    setSiteIdState(s);
    if (typeof window !== 'undefined') localStorage.setItem(`cs-site-${tenant}`, s);
  };

  return <SiteCtx.Provider value={{ sites, siteId, setSiteId, loading }}>{children}</SiteCtx.Provider>;
}

export const useSite = () => useContext(SiteCtx);
