'use client';

// #57 — Matrice de permissions éditable par niveau (Guide des niveaux d'accès).
// RH : pour chaque capacité, le NIVEAU MINIMAL requis (tier). Persisté dans tenant_permissions.
// MODULES : par module/sous-module, un seuil VOIR et un seuil ÉDITER (tier 0 = Externe / QR public).
//   tier < Voir = BLOQUÉ ; Voir ≤ tier < Éditer = LECTURE SEULE ; tier ≥ Éditer = ÉDITION.
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { CAPABILITIES, MODULE_ROWS, viewCap, editCap, getTenantPermissions, saveTenantPermission, type Capability, type PermMap } from '@/lib/permissions';

// Niveaux (Guide des niveaux d'accès) — tier 1..8 (+ tier 0 « Externe » pour les modules QR).
const LEVELS = [
  { tier: 1, emoji: '👁️', fr: 'Consultation', en: 'View only' },
  { tier: 2, emoji: '✏️', fr: 'Modification', en: 'Edit' },
  { tier: 3, emoji: '🗓️', fr: 'Coordination', en: 'Coordinate' },
  { tier: 4, emoji: '⚙️', fr: 'Administration', en: 'Admin' },
  { tier: 5, emoji: '💵', fr: 'Admin paie', en: 'Payroll admin' },
  { tier: 6, emoji: '🤝', fr: 'RH', en: 'HR' },
  { tier: 7, emoji: '🏢', fr: 'Direction', en: 'Management' },
  { tier: 8, emoji: '👑', fr: 'Super-utilisateur', en: 'Super-user' },
];
const EXT_LEVEL = { tier: 0, emoji: '🌐', fr: 'Externe (QR)', en: 'External (QR)' };

export function PermissionsMatrix({ tenant, tr, canEdit }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean }) {
  const [perms, setPerms] = useState<PermMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => { const p = await getTenantPermissions(tenant); if (active) { setPerms(p); setLoading(false); } })();
    return () => { active = false; };
  }, [tenant]);

  async function onChange(cap: Capability, minTier: number) {
    if (!perms) return;
    setPerms({ ...perms, [cap]: minTier });
    setSavingKey(cap); setNotice(null);
    try { await saveTenantPermission(tenant, cap, minTier); setNotice(tr('Enregistré ✓', 'Saved ✓')); }
    catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSavingKey(null); }
  }

  if (loading || !perms) return <div className="flex items-center gap-2 p-6 text-gray-500"><Loader2 className="animate-spin" size={18} /> {tr('Chargement…', 'Loading…')}</div>;

  const TierSelect = ({ cap, includeExt }: { cap: string; includeExt?: boolean }) => (
    <div className="flex items-center gap-1.5">
      <select value={perms[cap]} disabled={!canEdit} onChange={e => onChange(cap, Number(e.target.value))}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800 disabled:opacity-60">
        {(includeExt ? [EXT_LEVEL, ...LEVELS] : LEVELS).map(l => <option key={l.tier} value={l.tier}>{l.emoji} {tr(l.fr, l.en)}{l.tier > 0 ? ` (niv. ${l.tier}+)` : ''}</option>)}
      </select>
      {savingKey === cap && <Loader2 size={13} className="animate-spin text-gray-400" />}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Le tenant gère ici les niveaux d’accès. RH : niveau minimal par capacité. MODULES : seuil « Voir » et « Éditer » par module/sous-module — sous le seuil Voir = BLOQUÉ, entre Voir et Éditer = LECTURE SEULE, au-dessus = ÉDITION. Le niveau « Externe (QR) » autorise les personnes non connectées (ex. scan d’un AST/permis).',
            'The tenant manages access levels here. HR: minimum level per capability. MODULES: a “View” and an “Edit” threshold per module/sub-module — below View = BLOCKED, between View and Edit = READ-ONLY, above = EDIT. The “External (QR)” level allows non-logged-in people (e.g. scanning a JSA/permit).')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}

      {/* MODULES — Voir / Éditer par module et sous-module */}
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-200"><ShieldCheck size={15} /> {tr('Accès aux modules', 'Module access')}</h3>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40">
              <tr><th className="px-4 py-2">{tr('Module / sous-module', 'Module / sub-module')}</th><th className="px-4 py-2">👁️ {tr('Voir (min.)', 'View (min.)')}</th><th className="px-4 py-2">✏️ {tr('Éditer (min.)', 'Edit (min.)')}</th></tr>
            </thead>
            <tbody>
              {MODULE_ROWS.map(r => (
                <tr key={`${r.modKey}:${r.sub || ''}`} className="border-t border-gray-100 dark:border-gray-700/50">
                  <td className={`px-4 py-2 font-medium text-gray-800 dark:text-gray-100 ${r.isSub ? 'pl-8 text-gray-600 dark:text-gray-300' : ''}`}>{r.emoji} {tr(r.fr, r.en)}{r.externalCapable && !r.isSub ? <span className="ml-1.5 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" title={tr('Édition externe possible (QR)', 'External edit possible (QR)')}>QR</span> : null}</td>
                  <td className="px-4 py-2"><TierSelect cap={viewCap(r.modKey, r.sub)} includeExt={r.externalCapable} /></td>
                  <td className="px-4 py-2"><TierSelect cap={editCap(r.modKey, r.sub)} includeExt={r.externalCapable} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RH — capacités historiques (niveau minimal unique) */}
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-200"><ShieldCheck size={15} /> {tr('Capacités RH', 'HR capabilities')}</h3>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40">
              <tr><th className="px-4 py-2">{tr('Capacité', 'Capability')}</th><th className="px-4 py-2">{tr('Niveau minimal requis', 'Minimum level required')}</th></tr>
            </thead>
            <tbody>
              {CAPABILITIES.map(c => (
                <tr key={c.key} className="border-t border-gray-100 dark:border-gray-700/50">
                  <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{tr(c.fr, c.en)}</td>
                  <td className="px-4 py-2"><TierSelect cap={c.key} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
