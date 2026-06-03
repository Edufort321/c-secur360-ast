'use client';

// #74 — Partage API selectif par module (ERP). Le client active une cle + choisit les modules
// que son serveur/ERP peut pomper en lecture seule via /api/erp/[module].
import React, { useEffect, useState } from 'react';
import { Loader2, KeyRound, Copy, RefreshCw, Plug, Check, Power } from 'lucide-react';
import { ERP_MODULES, getErpConfig, ensureErpKey, rotateErpKey, setErpEnabled, setErpModule, type ErpConfig, type ErpModuleKey } from '@/lib/erpSharing';

export function ErpSharing({ tenant, tr, canEdit }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean }) {
  const [cfg, setCfg] = useState<ErpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.c-secur360.com';

  useEffect(() => { (async () => { setCfg(await getErpConfig(tenant)); setLoading(false); })(); }, [tenant]);

  async function activate() { setBusy('activate'); setCfg(await ensureErpKey(tenant)); setBusy(null); }
  async function rotate() {
    if (!confirm(tr('Regenerer la cle ? L ancienne cessera immediatement de fonctionner.', 'Rotate the key? The old one stops working immediately.'))) return;
    setBusy('rotate'); const k = await rotateErpKey(tenant); setCfg(c => c ? { ...c, api_key: k, enabled: true } : c); setBusy(null);
  }
  async function toggleEnabled() { if (!cfg) return; setBusy('enabled'); const v = !cfg.enabled; await setErpEnabled(tenant, v); setCfg({ ...cfg, enabled: v }); setBusy(null); }
  async function toggleModule(m: ErpModuleKey) { if (!cfg) return; setBusy(m); const modules = await setErpModule(tenant, m, !cfg.modules[m]); setCfg({ ...cfg, modules }); setBusy(null); }
  function copy(text: string, id: string) { navigator.clipboard?.writeText(text); setCopied(id); setTimeout(() => setCopied(c => c === id ? null : c), 1500); }

  if (loading || !cfg) return <div className="flex items-center gap-2 p-6 text-gray-500"><Loader2 className="animate-spin" size={18} /> {tr('Chargement…', 'Loading…')}</div>;

  const masked = cfg.api_key ? cfg.api_key.slice(0, 8) + '…' + cfg.api_key.slice(-4) : '';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        <Plug size={15} className="mr-1 inline" />
        {tr('Partage API en lecture seule : votre serveur/ERP pompe vos donnees par module avec une cle dediee. Aucune ecriture possible. Complete la « Connexion ERP » configuree par votre fournisseur.',
            'Read-only API sharing: your server/ERP pulls your data per module with a dedicated key. No writes possible. Complements the ERP connection set by your provider.')}
      </div>

      {!cfg.api_key ? (
        <button onClick={activate} disabled={!canEdit || busy === 'activate'} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {busy === 'activate' ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} {tr('Activer le partage API', 'Enable API sharing')}
        </button>
      ) : (
        <>
          {/* Cle + coupe-circuit */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100"><KeyRound size={15} /> {tr('Cle API', 'API key')}</h3>
              <button onClick={toggleEnabled} disabled={!canEdit || busy === 'enabled'} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${cfg.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                <Power size={12} /> {cfg.enabled ? tr('Actif', 'Active') : tr('Suspendu', 'Suspended')}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 min-w-[12rem] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm dark:border-gray-700 dark:bg-gray-900/40">{reveal ? cfg.api_key : masked}</code>
              <button onClick={() => setReveal(r => !r)} className="rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600">{reveal ? tr('Masquer', 'Hide') : tr('Voir', 'Show')}</button>
              <button onClick={() => copy(cfg.api_key, 'key')} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600">{copied === 'key' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />} {tr('Copier', 'Copy')}</button>
              <button onClick={rotate} disabled={!canEdit || busy === 'rotate'} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">{busy === 'rotate' ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {tr('Regenerer', 'Rotate')}</button>
            </div>
            <p className="mt-2 text-xs text-gray-400">{tr('Conservez cette cle secrete. En-tete :', 'Keep this key secret. Header:')} <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">x-api-key: {masked}</code></p>
          </div>

          {/* Modules partages */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Modules partages', 'Shared modules')}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {ERP_MODULES.map(m => {
                const on = !!cfg.modules[m.key];
                return (
                  <div key={m.key} className={`flex items-start justify-between gap-2 rounded-xl border p-3 ${on ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{tr(m.fr, m.en)}</div>
                      <div className="text-xs text-gray-400">{tr(m.descFr, m.descEn)}</div>
                      {on && <code className="mt-1 block break-all text-[11px] text-blue-600 dark:text-blue-300">GET {origin}/api/erp/{m.key}</code>}
                    </div>
                    <button onClick={() => toggleModule(m.key)} disabled={!canEdit || busy === m.key} className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'} disabled:opacity-50`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exemple d appel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Exemple (cURL)', 'Example (cURL)')}</h3>
              <button onClick={() => copy(`curl -H "x-api-key: ${cfg.api_key}" ${origin}/api/erp/financial`, 'curl')} className="inline-flex items-center gap-1 text-xs text-blue-600">{copied === 'curl' ? <Check size={13} /> : <Copy size={13} />} {tr('Copier', 'Copy')}</button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">{`curl -H "x-api-key: ${reveal ? cfg.api_key : masked}" \\
  "${origin}/api/erp/financial?limit=500&offset=0"`}</pre>
            <p className="mt-2 text-xs text-gray-400">{tr('Pagination : ?limit (max 2000) & ?offset. Reponse JSON groupee par ressource.', 'Pagination: ?limit (max 2000) & ?offset. JSON response grouped by resource.')}</p>
          </div>
        </>
      )}
    </div>
  );
}
