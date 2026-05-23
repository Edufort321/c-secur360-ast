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
        const { data } = await supabase
          .from('sites').select('id, name, code').eq('tenant_id', tenant).eq('is_active', true).order('name');
        if (active) setSites((data as any) || []);
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
