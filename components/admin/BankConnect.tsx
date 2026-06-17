'use client';
// Connexion bancaire temps réel (Flinks) : widget Connect (iframe) → LoginId → synchro automatique
// des opérations vers le rapprochement. Env-gated : invisible/inactif tant que Flinks n'est pas configuré.
import { useEffect, useState } from 'react';
import { Loader2, Landmark, RefreshCw, Trash2, Link2 } from 'lucide-react';

type Tr = (f: string, e: string) => string;
type Conn = { id: string; institution?: string; account_mask?: string; status: string; last_sync_at?: string; last_error?: string; treasury_account_id?: string };

export function BankConnect({ tenant, tr, accounts, onSynced }: { tenant: string; tr: Tr; accounts: { id: string; name: string; last4?: string }[]; onSynced?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [connectUrl, setConnectUrl] = useState('');
  const [conns, setConns] = useState<Conn[]>([]);
  const [showWidget, setShowWidget] = useState(false);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { const r = await fetch(`/api/bank?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }); const j = await r.json(); setConfigured(!!j.configured); setConnectUrl(j.connectUrl || ''); setConns(j.connections || []); }
    catch { /* noop */ }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  // Le widget Flinks publie un message contenant le LoginId une fois la banque authentifiée.
  useEffect(() => {
    if (!showWidget) return;
    async function onMsg(e: MessageEvent) {
      const d: any = e.data || {};
      const loginId = d.loginId || d.LoginId || d.loginID;
      if (!loginId) return;
      setShowWidget(false); setBusy(true); setNotice(null);
      try {
        const r = await fetch('/api/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, action: 'connect', loginId, institution: d.institution || d.Institution || null, treasury_account_id: target || null }) });
        const j = await r.json(); if (!r.ok) throw new Error(j.error);
        setNotice(tr(`Banque connectée — ${j.inserted || 0} opération(s) importée(s).`, `Bank connected — ${j.inserted || 0} transaction(s) imported.`)); await load(); onSynced?.();
      } catch (e: any) { setNotice(e?.message); }
      setBusy(false);
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [showWidget, target, tenant]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sync(id?: string) {
    setBusy(true); setNotice(null);
    try { const r = await fetch('/api/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, action: 'sync', connectionId: id }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setNotice(tr(`${j.inserted || 0} nouvelle(s) opération(s).`, `${j.inserted || 0} new transaction(s).`)); await load(); onSynced?.(); }
    catch (e: any) { setNotice(e?.message); } finally { setBusy(false); }
  }
  async function disconnect(id: string) {
    if (!confirm(tr('Déconnecter cette banque ?', 'Disconnect this bank?'))) return;
    try { await fetch('/api/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, action: 'disconnect', connectionId: id }) }); await load(); } catch (e: any) { setNotice(e?.message); }
  }

  if (loading) return <div className="flex items-center gap-2 p-3 text-sm text-gray-400"><Loader2 className="animate-spin" size={15} /> {tr('Chargement…', 'Loading…')}</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"><Landmark size={16} className="text-indigo-600" /> {tr('Connexion bancaire (temps réel)', 'Bank connection (real-time)')}</div>
      {!configured ? (
        <p className="mt-1 text-xs text-gray-500">{tr('Synchro automatique non configurée (agrégateur Flinks). Pour l’activer : créer un compte Flinks et poser les clés FLINKS_* (voir docs/BANK_AGGREGATOR.md). En attendant, utilisez l’import CSV.', 'Auto-sync not configured (Flinks aggregator). To enable: create a Flinks account and set FLINKS_* keys (see docs/BANK_AGGREGATOR.md). Meanwhile, use CSV import.')}</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-gray-500">{tr('Connectez votre banque : les opérations se synchronisent automatiquement dans le rapprochement.', 'Connect your bank: transactions auto-sync into reconciliation.')}</p>
          {notice && <div className="mt-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select value={target} onChange={e => setTarget(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800">
              <option value="">{tr('Compte cible (optionnel)', 'Target account (optional)')}</option>
              {accounts.map(a => <option key={a.id} value={a.id}>🏦 {a.name}{a.last4 ? ` ••${a.last4}` : ''}</option>)}
            </select>
            <button onClick={() => { setShowWidget(true); setNotice(null); }} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">{busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} {tr('Connecter ma banque', 'Connect my bank')}</button>
          </div>

          {conns.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {conns.map(c => (
                <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-700">
                  <span className={`h-2 w-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{c.institution || tr('Banque', 'Bank')}{c.account_mask ? ` ••${String(c.account_mask).slice(-4)}` : ''}</span>
                  {c.last_sync_at && <span className="text-[11px] text-gray-400">{tr('synchro', 'synced')} {new Date(c.last_sync_at).toLocaleString('fr-CA')}</span>}
                  {c.status === 'error' && c.last_error && <span className="text-[11px] text-rose-500" title={c.last_error}>⚠ {tr('erreur', 'error')}</span>}
                  <span className="ml-auto flex gap-3 text-xs">
                    <button onClick={() => sync(c.id)} disabled={busy} className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline disabled:opacity-40"><RefreshCw size={12} /> {tr('Synchroniser', 'Sync')}</button>
                    <button onClick={() => disconnect(c.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showWidget && connectUrl && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowWidget(false)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-800" onClick={e => e.stopPropagation()} style={{ height: 620 }}>
            <button onClick={() => setShowWidget(false)} className="absolute right-2 top-2 z-10 rounded-full bg-black/40 px-2 py-0.5 text-sm text-white">×</button>
            <iframe src={connectUrl} className="h-full w-full border-0" title="Flinks Connect" />
          </div>
        </div>
      )}
    </div>
  );
}
