'use client';

// #57 — Matrice de permissions éditable par niveau (Guide des niveaux d'accès).
// Pour chaque capacité, on choisit le NIVEAU MINIMAL requis (tier). Persisté dans tenant_permissions.
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { CAPABILITIES, getTenantPermissions, saveTenantPermission, type Capability, type PermMap } from '@/lib/permissions';

// Niveaux (Guide des niveaux d'accès) — tier 1..8.
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

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Pour chaque capacité, choisissez le NIVEAU MINIMAL requis (Guide des niveaux d’accès). Tout employé de ce niveau ou supérieur y a accès. En mode « Modifier ses informations », un employé ne peut pas éditer ce qui dépasse son niveau.', 'For each capability, pick the MINIMUM level required (Access levels guide). Any employee at that level or above gets access. In self-edit mode, an employee cannot edit what is above their level.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40">
            <tr><th className="px-4 py-2 flex items-center gap-1.5"><ShieldCheck size={14} /> {tr('Capacité', 'Capability')}</th><th className="px-4 py-2">{tr('Niveau minimal requis', 'Minimum level required')}</th></tr>
          </thead>
          <tbody>
            {CAPABILITIES.map(c => (
              <tr key={c.key} className="border-t border-gray-100 dark:border-gray-700/50">
                <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{tr(c.fr, c.en)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <select value={perms[c.key]} disabled={!canEdit} onChange={e => onChange(c.key, Number(e.target.value))}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 disabled:opacity-60">
                      {LEVELS.map(l => <option key={l.tier} value={l.tier}>{l.emoji} {tr(l.fr, l.en)} (niv. {l.tier}+)</option>)}
                    </select>
                    {savingKey === c.key && <Loader2 size={14} className="animate-spin text-gray-400" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
