'use client';
// Alertes & seuils (#36) : configuration des règles (seuils financiers + canaux in-app/courriel/SMS)
// et historique des notifications déclenchées. Réservé direction/super_user.
import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Bell, Mail, MessageSquare, Monitor } from 'lucide-react';

type Tr = (f: string, e: string) => string;
type Rule = { id?: string; metric: string; threshold: number; channels: string[]; recipient_email?: string | null; recipient_phone?: string | null; enabled?: boolean; last_fired_at?: string | null };
type Notif = { id: string; title: string; body?: string; severity: string; created_at: string; read_at?: string | null };

const METRICS: { v: string; fr: string; en: string; unit: string }[] = [
  { v: 'cash_below', fr: 'Trésorerie sous', en: 'Cash below', unit: '$' },
  { v: 'margin_pct_below', fr: 'Marge sous', en: 'Margin below', unit: '%' },
  { v: 'ar_overdue_above', fr: 'Recevables en retard au-dessus de', en: 'Overdue AR above', unit: '$' },
  { v: 'ebitda_below', fr: 'EBITDA sous', en: 'EBITDA below', unit: '$' },
  { v: 'altman_below', fr: 'Score Altman Z″ sous', en: 'Altman Z″ below', unit: '' },
];
const metricLabel = (v: string, tr: Tr) => { const m = METRICS.find(x => x.v === v); return m ? `${tr(m.fr, m.en)}${m.unit ? ` (${m.unit})` : ''}` : v; };

export function AlertsModule({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [edit, setEdit] = useState<Rule | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  async function load() {
    setLoading(true);
    try {
      const [r, n] = await Promise.all([
        fetch(`/api/alerts?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }).then(x => x.json()),
        fetch(`/api/notifications?limit=30`, { credentials: 'include' }).then(x => x.json()),
      ]);
      setRules(r.rules || []); setNotifs(n.entries || []);
    } catch (e: any) { setNotice(e?.message); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  async function save() {
    if (!edit) return;
    try {
      const r = await fetch('/api/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, rule: edit }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      setEdit(null); setNotice(tr('Règle enregistrée.', 'Rule saved.')); await load();
    } catch (e: any) { setNotice(e?.message); }
  }
  async function remove(id?: string) {
    if (!id || !confirm(tr('Supprimer cette règle ?', 'Delete this rule?'))) return;
    try { await fetch('/api/alerts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, id }) }); await load(); } catch (e: any) { setNotice(e?.message); }
  }
  function toggleChannel(c: string) {
    if (!edit) return;
    const has = edit.channels.includes(c);
    setEdit({ ...edit, channels: has ? edit.channels.filter(x => x !== c) : [...edit.channels, c] });
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20">{notice}</div>}

      {/* Règles de seuils */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"><Bell size={16} className="text-amber-500" /> {tr('Règles de seuils', 'Threshold rules')}</div>
          {canEdit && !edit && <button onClick={() => setEdit({ metric: 'cash_below', threshold: 0, channels: ['in_app'], enabled: true })} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={14} /> {tr('Nouvelle règle', 'New rule')}</button>}
        </div>

        {edit && (
          <div className="mb-3 grid gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Condition', 'Condition')}<select value={edit.metric} onChange={e => setEdit({ ...edit, metric: e.target.value })} className={`mt-1 w-full ${inputCls}`}>{METRICS.map(m => <option key={m.v} value={m.v}>{metricLabel(m.v, tr)}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Seuil', 'Threshold')}<input type="number" value={edit.threshold} onChange={e => setEdit({ ...edit, threshold: Number(e.target.value) })} className={`mt-1 w-full ${inputCls}`} /></label>
            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-gray-500">{tr('Canaux', 'Channels')}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {([['in_app', Monitor, tr('In-app', 'In-app')], ['email', Mail, tr('Courriel', 'Email')], ['sms', MessageSquare, 'SMS']] as const).map(([c, Icon, lbl]) => (
                  <button key={c} type="button" onClick={() => toggleChannel(c)} className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold ${edit.channels.includes(c) ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20' : 'border-gray-200 text-gray-500 dark:border-gray-600'}`}><Icon size={12} /> {lbl}</button>
                ))}
              </div>
            </div>
            {edit.channels.includes('email') && <label className="text-xs font-semibold text-gray-500">{tr('Courriel destinataire', 'Recipient email')}<input value={edit.recipient_email || ''} onChange={e => setEdit({ ...edit, recipient_email: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>}
            {edit.channels.includes('sms') && <label className="text-xs font-semibold text-gray-500">{tr('Téléphone destinataire', 'Recipient phone')}<input value={edit.recipient_phone || ''} onChange={e => setEdit({ ...edit, recipient_phone: e.target.value })} placeholder="+1..." className={`mt-1 w-full ${inputCls}`} /></label>}
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500"><input type="checkbox" checked={edit.enabled !== false} onChange={e => setEdit({ ...edit, enabled: e.target.checked })} /> {tr('Active', 'Enabled')}</label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button onClick={() => setEdit(null)} className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
              <button onClick={save} className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">{tr('Enregistrer', 'Save')}</button>
            </div>
          </div>
        )}

        {rules.length === 0 ? <div className="text-sm text-gray-400">{tr('Aucune règle. Crée un seuil pour être alerté (trésorerie, marge, EBITDA, recevables, Altman).', 'No rule. Add a threshold to get alerted.')}</div> : (
          <div className="space-y-1.5">
            {rules.map(r => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-700">
                <span className={`h-2 w-2 rounded-full ${r.enabled !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="font-semibold text-gray-800 dark:text-gray-100">{metricLabel(r.metric, tr)} {r.threshold.toLocaleString('fr-CA')}</span>
                <span className="flex gap-1">{r.channels.map(c => <span key={c} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-700">{c === 'in_app' ? 'in-app' : c}</span>)}</span>
                {r.last_fired_at && <span className="text-[11px] text-amber-600">{tr('déclenché', 'fired')} {new Date(r.last_fired_at).toLocaleDateString('fr-CA')}</span>}
                {canEdit && <span className="ml-auto flex gap-3"><button onClick={() => setEdit(r)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button><button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button></span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des notifications */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">{tr('Notifications récentes', 'Recent notifications')}</div>
        {notifs.length === 0 ? <div className="text-sm text-gray-400">{tr('Aucune notification.', 'No notification.')}</div> : (
          <div className="space-y-1.5">
            {notifs.map(n => (
              <div key={n.id} className={`rounded-lg px-3 py-2 text-sm ${n.severity === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20' : n.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700/40'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{n.title}</span>
                  <span className="text-[11px] text-gray-400">{new Date(n.created_at).toLocaleString('fr-CA')}</span>
                </div>
                {n.body && <div className="text-xs text-gray-500">{n.body}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
