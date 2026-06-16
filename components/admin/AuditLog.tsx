'use client';
// Journal d'audit des données sensibles (finance/RH/actionnaires) — lecture seule, réservé
// direction/super_user. Trace qui a consulté/modifié l'info bancaire, les dividendes, la cap table…
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

type Tr = (f: string, e: string) => string;
type Entry = { id: string; created_at: string; actor_email?: string; action: string; entity_type: string; entity_id?: string; summary?: string; ip?: string };

const ACTION_LABEL: Record<string, [string, string]> = {
  reveal_banking: ['Consultation info bancaire', 'Banking info viewed'],
  update_banking: ['Modification info bancaire', 'Banking info edited'],
  declare_dividend: ['Déclaration de dividende', 'Dividend declared'],
  pay_dividend: ['Versement de dividende', 'Dividend paid'],
  cancel_dividend: ['Annulation de dividende', 'Dividend cancelled'],
  share_txn: ['Mouvement d\'actions', 'Share transaction'],
};
const ACTION_COLOR: Record<string, string> = {
  reveal_banking: 'bg-amber-100 text-amber-700', update_banking: 'bg-orange-100 text-orange-700',
  declare_dividend: 'bg-blue-100 text-blue-700', pay_dividend: 'bg-emerald-100 text-emerald-700',
  cancel_dividend: 'bg-gray-100 text-gray-600', share_txn: 'bg-violet-100 text-violet-700',
};

export function AuditLog({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entity, setEntity] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`/api/audit?tenant=${encodeURIComponent(tenant)}${entity ? `&entity=${entity}` : ''}`, { credentials: 'include' });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      setEntries(j.entries || []);
    } catch (e: any) { setErr(e?.message); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant, entity]);

  const fmt = (s: string) => { try { return new Date(s).toLocaleString('fr-CA'); } catch { return s; } };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"><ShieldCheck size={16} className="text-emerald-600" /> {tr('Journal d\'audit', 'Audit log')}</span>
        <select value={entity} onChange={e => setEntity(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
          <option value="">{tr('Tout', 'All')}</option>
          <option value="shareholder_banking">{tr('Info bancaire', 'Banking')}</option>
          <option value="dividend">{tr('Dividendes', 'Dividends')}</option>
          <option value="share_txn">{tr('Actions', 'Shares')}</option>
        </select>
        <button onClick={load} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"><RefreshCw size={12} /> {tr('Rafraîchir', 'Refresh')}</button>
      </div>
      {err && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20">{err}</div>}

      {loading ? <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div> :
        entries.length === 0 ? <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune entrée.', 'No entry.')}</div> : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-700"><th className="px-3 py-2">{tr('Date', 'Date')}</th><th>{tr('Utilisateur', 'User')}</th><th>{tr('Action', 'Action')}</th><th>{tr('Détail', 'Detail')}</th><th>IP</th></tr></thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">{fmt(e.created_at)}</td>
                    <td className="text-gray-700 dark:text-gray-200">{e.actor_email || '—'}</td>
                    <td><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ACTION_COLOR[e.action] || 'bg-gray-100 text-gray-600'}`}>{tr(...(ACTION_LABEL[e.action] || [e.action, e.action]))}</span></td>
                    <td className="text-xs text-gray-500">{e.summary || '—'}</td>
                    <td className="text-xs text-gray-400">{e.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
