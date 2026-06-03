'use client';

// Panneau « Non-conformités & anomalies » — vue d'ensemble agrégée de tous les modules.
// Visibilité : coordination et plus voient TOUT ; sinon l'utilisateur voit seulement
// les items où SON NOM (ou courriel) apparaît dans le formulaire.
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, Wrench, FileWarning, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Severity = 'red' | 'orange';
type Item = {
  key: string; module: string; icon: 'ast' | 'inspection' | 'incident';
  title: string; detail: string; severity: Severity; href: string; names: string[]; date?: string;
};

export function AnomaliesPanel({ tenant }: { tenant: string }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [canSeeAll, setCanSeeAll] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      // 1. Identité + niveau d'accès
      let myName = '', myEmail = '', role = '';
      try {
        const me = await fetch('/api/auth/me').then(r => r.json()).catch(() => null);
        if (me?.user) { myName = me.user.name || ''; myEmail = me.user.email || ''; role = me.user.role || ''; }
      } catch { /* anonyme */ }
      let niveau = '';
      if (myEmail) {
        try {
          const { data: p } = await supabase.from('planner_personnel').select('niveauAcces, name').eq('tenant_id', tenant).ilike('email', myEmail).maybeSingle();
          if (p) { niveau = p.niveauAcces || ''; if (!myName) myName = p.name || ''; }
        } catch { /* table absente */ }
      }
      const seeAll = role === 'client_admin' || role === 'super_admin' || niveau === 'coordination' || niveau === 'administration';
      if (active) setCanSeeAll(seeAll);

      const out: Item[] = [];
      const norm = (s: string) => (s || '').trim().toLowerCase();
      const meKeys = [norm(myName), norm(myEmail)].filter(Boolean);

      // 2. AST non-conformes / correctifs
      try {
        const { data } = await supabase.from('ast_permits').select('permit_number, data, updated_at').eq('tenant_id', tenant);
        for (const r of (data || []) as any[]) {
          const d = r.data || {};
          const v = d.supervisorSigStatus;
          if (v !== 'nonconform' && v !== 'corrective') continue;
          const names: string[] = [];
          if (d.supervisor) names.push(d.supervisor);
          if (d.supervisorSigName) names.push(d.supervisorSigName);
          (d.participants || []).forEach((p: any) => p?.name && names.push(p.name));
          (d.jobSteps || []).forEach((s: any) => s?.responsible && names.push(s.responsible));
          out.push({
            key: `ast_${r.permit_number}`, module: 'AST', icon: 'ast',
            title: `AST ${r.permit_number || ''} — ${v === 'nonconform' ? 'Non-conformité' : 'Correctif requis'}`,
            detail: d.projectInfo?.client || d.client || d.projectInfo?.location || '',
            severity: v === 'nonconform' ? 'red' : 'orange', href: `/${tenant}/ast`, names, date: r.updated_at,
          });
        }
      } catch { /* table absente */ }

      // 3. Inspections d'équipement non-conformes / retrait / conditionnel
      try {
        const { data } = await supabase.from('equipment_inspections')
          .select('inspection_number, equipment_name, inspector_name, overall_result, inspection_date')
          .eq('tenant_id', tenant);
        for (const r of (data || []) as any[]) {
          const res = r.overall_result;
          if (res !== 'non_conforme' && res !== 'retrait' && res !== 'conditionnel') continue;
          const label = res === 'retrait' ? 'Retrait immédiat' : res === 'non_conforme' ? 'Non-conforme' : 'Conditionnel';
          out.push({
            key: `insp_${r.inspection_number}`, module: 'Inspection', icon: 'inspection',
            title: `Inspection ${r.equipment_name || r.inspection_number || ''} — ${label}`,
            detail: r.inspector_name ? `Inspecteur : ${r.inspector_name}` : '',
            severity: res === 'conditionnel' ? 'orange' : 'red', href: `/${tenant}/inspections`,
            names: r.inspector_name ? [r.inspector_name] : [], date: r.inspection_date,
          });
        }
      } catch { /* table absente */ }

      // 4. Incidents / passé-proche (incident_reports, ou near_miss_events selon le schéma)
      const pushIncident = (r: any, declarant: string) => {
        const t = r.incident_type || r.type || 'incident';
        const isNear = t === 'near_miss' || (Number(r.severity_level) > 0 && Number(r.severity_level) < 4);
        out.push({
          key: `inc_${r.id}`, module: isNear ? 'Passé-proche' : 'Incident', icon: 'incident',
          title: isNear ? 'Déclaration passé-proche' : `Incident (${t})`,
          detail: (r.data?.description || r.description || '').slice(0, 80),
          severity: isNear ? 'orange' : 'red', href: `/${tenant}/near-miss`,
          names: [declarant, r.data?.declarant, r.data?.reporter_name].filter(Boolean), date: r.incident_date || r.created_at,
        });
      };
      try {
        const { data, error } = await supabase.from('incident_reports').select('id, incident_type, status, data, created_at').eq('tenant_id', tenant);
        if (!error) for (const r of (data || []) as any[]) { if (r.status !== 'closed') pushIncident(r, r.data?.declarant || r.data?.reporter_name || ''); }
        else {
          const { data: nm } = await supabase.from('near_miss_events').select('*').eq('tenant_id', tenant);
          for (const r of (nm || []) as any[]) pushIncident(r, r.reporter_name || '');
        }
      } catch { /* aucune table d'incident */ }

      // 5. Filtrage selon visibilité
      const filtered = seeAll ? out : out.filter(it => it.names.some(n => meKeys.includes(norm(n))));
      // Tri : rouge d'abord, puis par date desc
      filtered.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'red' ? -1 : 1) || String(b.date || '').localeCompare(String(a.date || '')));
      if (active) { setItems(filtered); setLoading(false); }
    })();
    return () => { active = false; };
  }, [tenant]);

  const ICON = { ast: ShieldAlert, inspection: Wrench, incident: FileWarning };

  if (loading) return (
    <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" size={16} /> Chargement des anomalies…</div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
          <AlertTriangle size={18} className="text-amber-500" /> Non-conformités &amp; anomalies
          {items.length > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/20 dark:text-red-300">{items.length}</span>}
        </h2>
        <span className="text-[11px] text-gray-400">{canSeeAll ? 'Vue coordination (tout le tenant)' : 'Mes dossiers'}</span>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={16} /> Aucune non-conformité à traiter.
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(it => {
            const Icon = ICON[it.icon];
            return (
              <Link key={it.key} href={it.href}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition hover:shadow-sm ${it.severity === 'red' ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'}`}>
                <Icon size={16} className={it.severity === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{it.title}</div>
                  {it.detail && <div className="truncate text-xs text-gray-500 dark:text-gray-400">{it.detail}</div>}
                </div>
                <span className="shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-700/60 dark:text-gray-300">{it.module}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
