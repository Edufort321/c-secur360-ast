'use client';

// Panneau « Non-conformités & anomalies » — vue d'ensemble agrégée de tous les modules.
// Visibilité : coordination et plus voient TOUT ; sinon l'utilisateur voit seulement
// les items où SON NOM (ou courriel) apparaît dans le formulaire.
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, Wrench, FileWarning, CheckCircle2, Loader2, Archive, ArchiveRestore, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRealtime } from '@/lib/useRealtime';

type Severity = 'red' | 'orange';
type Item = {
  key: string; module: string; icon: 'ast' | 'inspection' | 'incident';
  title: string; detail: string; severity: Severity; href: string; names: string[]; date?: string;
};

export function AnomaliesPanel({ tenant }: { tenant: string }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [canSeeAll, setCanSeeAll] = useState(false);
  const [archived, setArchived] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [me, setMe] = useState('');

  const load = useCallback(async () => {
    {
      const active = true;
      setLoading(true);
      // 1. Identité + niveau d'accès
      let myName = '', myEmail = '', role = '';
      try {
        const me = await fetch('/api/auth/me').then(r => r.json()).catch(() => null);
        if (me?.user) { myName = me.user.name || ''; myEmail = me.user.email || ''; role = me.user.role || ''; }
      } catch { /* anonyme */ }
      if (active) setMe(myEmail || myName || '');
      // Anomalies archivées (rangées) — on les masque par défaut.
      try {
        const { data: arch } = await supabase.from('dashboard_archived_anomalies').select('item_key').eq('tenant_id', tenant);
        if (active) setArchived(new Set((arch || []).map((a: any) => a.item_key)));
      } catch { /* table absente avant migration 134 */ }
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
            // Deep-link DIRECT vers la fiche AST concernée (au lieu de la liste générique).
            severity: v === 'nonconform' ? 'red' : 'orange', href: `/${tenant}/ast/view/${encodeURIComponent(r.permit_number || '')}`, names, date: r.updated_at,
          });
        }
      } catch { /* table absente */ }

      // 3. Inspections d'équipement non-conformes / retrait / conditionnel
      try {
        const { data } = await supabase.from('equipment_inspections')
          .select('id, inspection_number, equipment_name, inspector_name, overall_result, inspection_date')
          .eq('tenant_id', tenant);
        for (const r of (data || []) as any[]) {
          const res = r.overall_result;
          if (res !== 'non_conforme' && res !== 'retrait' && res !== 'conditionnel') continue;
          const label = res === 'retrait' ? 'Retrait immédiat' : res === 'non_conforme' ? 'Non-conforme' : 'Conditionnel';
          out.push({
            key: `insp_${r.inspection_number}`, module: 'Inspection', icon: 'inspection',
            title: `Inspection ${r.equipment_name || r.inspection_number || ''} — ${label}`,
            detail: r.inspector_name ? `Inspecteur : ${r.inspector_name}` : '',
            // Deep-link DIRECT vers l'inspection concernée (sinon repli sur la liste).
            severity: res === 'conditionnel' ? 'orange' : 'red', href: r.id ? `/${tenant}/inspections/${r.id}` : `/${tenant}/inspections`,
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
        // Lecture via route SERVEUR (tables fermées à l'anon) — scopée au tenant de session.
        const res = await fetch('/api/incidents/summary', { credentials: 'include' });
        const j: any = res.ok ? await res.json() : {};
        const incidents = (j.incidents || []) as any[];
        if (incidents.length) { for (const r of incidents) { if (r.status !== 'closed') pushIncident(r, r.data?.declarant || r.data?.reporter_name || ''); } }
        else { for (const r of ((j.nearMiss || []) as any[])) pushIncident(r, r.reporter_name || ''); }
      } catch { /* aucune table d'incident */ }

      // 5. Filtrage selon visibilité
      const filtered = seeAll ? out : out.filter(it => it.names.some(n => meKeys.includes(norm(n))));
      // Tri : rouge d'abord, puis par date desc
      filtered.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'red' ? -1 : 1) || String(b.date || '').localeCompare(String(a.date || '')));
      if (active) { setItems(filtered); setLoading(false); }
    }
  }, [tenant]);

  useEffect(() => { load(); }, [load]);
  // Synchro temps réel : recharge le panneau quand un module change (migration 109 requise).
  useRealtime(['ast_permits', 'equipment_inspections', 'incident_reports'], tenant, load);

  const [archiveErr, setArchiveErr] = useState<string | null>(null);
  const archive = useCallback(async (key: string) => {
    setArchived(prev => { const n = new Set(prev); n.add(key); return n; }); // optimiste
    // L'archivage DOIT persister : on remonte l'erreur (ex. RLS/migration) au lieu de l'avaler — sinon
    // l'anomalie « revient » au rechargement sans qu'on sache pourquoi.
    const { error } = await supabase.from('dashboard_archived_anomalies').upsert({ tenant_id: tenant, item_key: key, archived_by: me }, { onConflict: 'tenant_id,item_key' });
    if (error) { setArchiveErr(`Archivage non enregistré : ${error.message} (appliquez la migration 189).`); setArchived(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    else setArchiveErr(null);
  }, [tenant, me]);
  const restore = useCallback(async (key: string) => {
    setArchived(prev => { const n = new Set(prev); n.delete(key); return n; }); // optimiste
    try { await supabase.from('dashboard_archived_anomalies').delete().eq('tenant_id', tenant).eq('item_key', key); }
    catch { /* noop */ }
  }, [tenant]);

  const ICON = { ast: ShieldAlert, inspection: Wrench, incident: FileWarning };
  const visible = items.filter(it => showArchived ? archived.has(it.key) : !archived.has(it.key));
  const archivedCount = items.filter(it => archived.has(it.key)).length;
  const activeCount = items.length - archivedCount;

  if (loading) return (
    <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" size={16} /> Chargement des anomalies…</div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
          <AlertTriangle size={18} className="text-amber-500" /> Non-conformités &amp; anomalies
          {activeCount > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/20 dark:text-red-300">{activeCount}</span>}
        </h2>
        <div className="flex items-center gap-2">
          {archivedCount > 0 && (
            <button onClick={() => setShowArchived(s => !s)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${showArchived ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <Archive size={12} /> {showArchived ? 'Masquer' : 'Archivées'} ({archivedCount})
            </button>
          )}
          <span className="text-[11px] text-gray-400">{canSeeAll ? 'Vue coordination (tout le tenant)' : 'Mes dossiers'}</span>
        </div>
      </div>
      {/* Façade : nombre par CATÉGORIE (selon la vue active/archivée). */}
      {(() => {
        const src = items.filter(it => showArchived ? archived.has(it.key) : !archived.has(it.key));
        const byCat = src.reduce((m: Record<string, { n: number; red: number }>, it) => { (m[it.module] ||= { n: 0, red: 0 }); m[it.module].n++; if (it.severity === 'red') m[it.module].red++; return m; }, {});
        const cats = Object.entries(byCat);
        if (!cats.length) return null;
        return (
          <div className="mb-3 flex flex-wrap gap-2">
            {cats.map(([mod, c]) => (
              <span key={mod} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                {mod} <span className={`rounded-full px-1.5 text-[10px] text-white ${c.red ? 'bg-red-600' : 'bg-amber-500'}`}>{c.n}</span>
              </span>
            ))}
          </div>
        );
      })()}
      {archiveErr && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">⚠️ {archiveErr}</div>}
      {visible.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={16} /> {showArchived ? 'Aucune anomalie archivée.' : 'Aucune non-conformité à traiter.'}
        </div>
      ) : (
        <div className="space-y-1.5">
          {visible.map(it => {
            const Icon = ICON[it.icon];
            return (
              <div key={it.key}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${it.severity === 'red' ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'}`}>
                <Icon size={16} className={it.severity === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} />
                <Link href={it.href} className="group flex min-w-0 flex-1 items-center gap-2 hover:opacity-80" title="Visionner le dossier">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{it.title}</div>
                    {it.detail && <div className="truncate text-xs text-gray-500 dark:text-gray-400">{it.detail}</div>}
                  </div>
                  <Eye size={14} className="shrink-0 text-gray-400 opacity-0 transition group-hover:opacity-100" />
                </Link>
                <span className="shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-700/60 dark:text-gray-300">{it.module}</span>
                {showArchived ? (
                  <button onClick={() => restore(it.key)} title="Restaurer (réafficher)"
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white/60 hover:text-blue-600 dark:hover:bg-gray-700/60"><ArchiveRestore size={15} /></button>
                ) : (
                  <button onClick={() => archive(it.key)} title="Archiver (ranger, ne plus voir)"
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white/60 hover:text-gray-700 dark:hover:bg-gray-700/60"><Archive size={15} /></button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!showArchived && activeCount === 0 && archivedCount > 0 && (
        <p className="mt-2 text-center text-[11px] text-gray-400">{archivedCount} anomalie(s) archivée(s) — clique « Archivées » pour les revoir.</p>
      )}
    </div>
  );
}
