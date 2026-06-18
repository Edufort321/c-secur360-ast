'use client';
// Annuaire du tenant pour les recherches dynamiques inter-module (EntitySearch) : personnel (planner_personnel
// via /api/permits/espace-clos/people — id, nom, rôle) + projets (projects — n° + titre). Aucune donnée
// sensible. Utilisé par les permis, accidents, etc. La saisie LIBRE reste permise (sous-traitant/tiers).
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { EntityOption } from '@/components/ui/EntitySearch';

export function useTenantDirectory(tenant?: string): { personnel: EntityOption[]; projects: EntityOption[]; suppliers: EntityOption[] } {
  const [personnel, setPersonnel] = useState<EntityOption[]>([]);
  const [projects, setProjects] = useState<EntityOption[]>([]);
  const [suppliers, setSuppliers] = useState<EntityOption[]>([]);
  useEffect(() => {
    if (!tenant) return;
    let active = true;
    fetch(`/api/permits/espace-clos/people?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { people: [] }))
      .then(j => { if (active) setPersonnel((j.people || []).filter((p: any) => p.name).map((p: any) => ({ id: p.id, label: p.name, sub: p.role || '' }))); })
      .catch(() => {});
    supabase.from('projects').select('id, project_number, title').eq('tenant_id', tenant).order('created_at', { ascending: false })
      .then(({ data }) => { if (active) setProjects((data || []).filter((p: any) => p.project_number || p.title).map((p: any) => ({ id: p.id, label: p.project_number || p.title || '', sub: p.project_number ? (p.title || '') : '' }))); }, () => {});
    // Fournisseurs (achat/contractant) — best-effort.
    supabase.from('suppliers').select('id, name, contact_name').eq('tenant_id', tenant).order('name')
      .then(({ data }) => { if (active) setSuppliers((data || []).filter((s: any) => s.name).map((s: any) => ({ id: s.id, label: s.name, sub: s.contact_name || '' }))); }, () => {});
    return () => { active = false; };
  }, [tenant]);
  return { personnel, projects, suppliers };
}
