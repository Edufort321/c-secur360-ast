'use client';

// #DGA — Panneau « Import par courriel » (instructions d'integration cote TENANT).
// Le tenant y trouve son adresse dediee, l'active, gere la liste blanche d'expediteurs et suit le
// journal des courriels recus. Les rapports DGA envoyes a cette adresse sont importes automatiquement
// et apparaissent EN DIRECT dans le module (temps reel). Lecture pour tous ; edition reservee admin.
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Copy, Check, Inbox, ShieldCheck, Cpu, Loader2 } from 'lucide-react';

const STATUS_STYLE: Record<string, { fr: string; en: string; cls: string }> = {
  imported: { fr: 'Importé', en: 'Imported', cls: 'bg-emerald-100 text-emerald-700' },
  ignored: { fr: 'Ignoré', en: 'Ignored', cls: 'bg-slate-100 text-slate-500' },
  rejected: { fr: 'Rejeté', en: 'Rejected', cls: 'bg-amber-100 text-amber-700' },
  error: { fr: 'Erreur', en: 'Error', cls: 'bg-rose-100 text-rose-700' },
  received: { fr: 'Reçu', en: 'Received', cls: 'bg-sky-100 text-sky-700' },
};

export function InboundSetup({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<any>(null);
  const [log, setLog] = useState<any[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [senders, setSenders] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Indice si l'API echoue parce que les tables n'existent pas encore (migration 153 non appliquee).
  const migHint = (e: string) => /(relation|exist|table|schema|column|dga_inbound)/i.test(e || '') ? tr(' — la migration 153 est-elle appliquée dans Supabase ?', ' — is migration 153 applied in Supabase?') : '';

  async function load() {
    setLoading(true); setMsg(null);
    try {
      const r = await fetch('/api/dga/inbound', { credentials: 'include' });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.config) { setCfg(j.config); setSenders((j.config.allow_senders || []).join('\n')); setLog(j.log || []); setCanEdit(!!j.canEdit); }
      else setMsg({ ok: false, text: tr('Chargement impossible : ', 'Load failed: ') + (j.error || `HTTP ${r.status}`) + migHint(j.error) });
    } catch (e: any) { setMsg({ ok: false, text: tr('Erreur réseau au chargement.', 'Network error on load.') }); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function save(patch: any) {
    setSaving(true); setMsg(null);
    try {
      const r = await fetch('/api/dga/inbound', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.config) {
        setCfg(j.config); setSenders((j.config.allow_senders || []).join('\n'));
        setMsg({ ok: true, text: tr('Réglages enregistrés ✓', 'Settings saved ✓') });
        setTimeout(() => setMsg(null), 3000);
      } else {
        const e = j.error || `HTTP ${r.status}`;
        const extra = r.status === 403 ? tr(' (rôle administrateur requis)', ' (admin role required)') : migHint(e);
        setMsg({ ok: false, text: tr('Échec de l’enregistrement : ', 'Save failed: ') + e + extra });
      }
    } catch (e: any) { setMsg({ ok: false, text: tr('Erreur réseau : ', 'Network error: ') + (e?.message || '') }); }
    setSaving(false);
  }
  function saveAll() {
    const list = senders.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    save({ enabled: cfg?.enabled, auto_create: cfg?.auto_create, allow_senders: list });
  }
  const addr = cfg?.address || '';
  function copy() { try { navigator.clipboard.writeText(addr); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }

  const Toggle = ({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <button type="button" disabled={disabled} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300'} ${disabled ? 'opacity-50' : ''}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <Inbox size={20} className="text-rose-600" /> {tr('Import des DGA par courriel', 'DGA email import')}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>

        {/* Drapeau de confirmation / erreur d'enregistrement */}
        {msg && (
          <div className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
            {msg.ok ? <Check size={16} /> : <span>⚠</span>}{msg.text}
          </div>
        )}

        {loading ? <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div> : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {tr('Faites parvenir vos rapports DGA (PDF) à votre adresse dédiée. Chaque courriel reçu est analysé : s\'il contient des données DGA, les transformateurs et mesures sont importés automatiquement (diagnostics IEEE/Duval calculés) et apparaissent en direct ici. Un courriel sans DGA est ignoré.',
                'Send your DGA reports (PDF) to your dedicated address. Every received email is analyzed: if it contains DGA data, transformers and measurements are imported automatically (IEEE/Duval diagnostics computed) and appear live here. An email without DGA is ignored.')}
            </p>

            {/* Adresse dediee */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{tr('Votre adresse d\'import', 'Your import address')}</div>
              <div className="flex flex-wrap items-center gap-2">
                <code className="flex-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-800 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">{addr || '—'}</code>
                <button onClick={copy} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                  {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? tr('Copié', 'Copied') : tr('Copier', 'Copy')}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tr('Activer l\'import par courriel', 'Enable email import')}</span>
                <Toggle on={!!cfg?.enabled} disabled={!canEdit || saving} onChange={v => { setCfg({ ...cfg, enabled: v }); save({ enabled: v, auto_create: cfg?.auto_create, allow_senders: senders.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) }); }} />
              </div>
            </div>

            {/* Instructions d'installation */}
            <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><ShieldCheck size={16} className="text-emerald-600" /> {tr('Étapes d\'installation', 'Setup steps')}</div>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
                <li>{tr('Copiez l\'adresse ci-dessus.', 'Copy the address above.')}</li>
                <li>{tr('Dans votre laboratoire / logiciel d\'analyse (InsideView, Morgan Schaffer, ou autre) ou votre moniteur, ajoutez cette adresse comme destinataire des rapports PDF — ou faites simplement suivre vos courriels de rapport à cette adresse.', 'In your lab / analysis software (InsideView, Morgan Schaffer, or other) or your monitor, add this address as a recipient of the PDF reports — or simply forward your report emails to this address.')}</li>
                <li>{tr('Ajoutez les expéditeurs autorisés ci-dessous (par sécurité, seuls eux peuvent injecter des données).', 'Add the allowed senders below (for security, only they can inject data).')}</li>
                <li>{tr('Activez l\'import. Envoyez un rapport de test : il apparaîtra dans la liste des transformateurs en quelques secondes.', 'Enable import. Send a test report: it will appear in the transformer list within seconds.')}</li>
              </ol>
            </div>

            {/* Liste blanche + auto-creation */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{tr('Expéditeurs autorisés', 'Allowed senders')}</label>
                <textarea value={senders} disabled={!canEdit} onChange={e => setSenders(e.target.value)} rows={4}
                  placeholder={tr('un par ligne — courriel ou @domaine\nex. labo@morganschaffer.com\nex. @insideview.com', 'one per line — email or @domain\ne.g. lab@morganschaffer.com\ne.g. @insideview.com')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900" />
                <p className="mt-1 text-[11px] text-slate-400">{tr('Vide = accepter tous les expéditeurs (déconseillé).', 'Empty = accept all senders (not recommended).')}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tr('Créer les transformateurs absents', 'Create missing transformers')}</span>
                  <Toggle on={cfg?.auto_create !== false} disabled={!canEdit || saving} onChange={v => setCfg({ ...cfg, auto_create: v })} />
                </div>
                <p className="text-[11px] text-slate-400">{tr('Désactivé : les mesures ne sont ajoutées qu\'aux transformateurs déjà existants (rien de nouveau n\'est créé).', 'Off: measurements are only added to existing transformers (nothing new is created).')}</p>
                {canEdit && (
                  <button onClick={saveAll} disabled={saving} className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">
                    {saving ? tr('Enregistrement…', 'Saving…') : tr('Enregistrer', 'Save')}
                  </button>
                )}
              </div>
            </div>

            {/* Journal d'activite */}
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{tr('Activité récente', 'Recent activity')}</div>
              {log.length === 0 ? <p className="text-sm text-slate-400">{tr('Aucun courriel reçu pour l\'instant.', 'No email received yet.')}</p> : (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800"><tr>
                      <th className="px-3 py-2 font-medium">{tr('Date', 'Date')}</th>
                      <th className="px-3 py-2 font-medium">{tr('Expéditeur', 'Sender')}</th>
                      <th className="px-3 py-2 font-medium">{tr('État', 'Status')}</th>
                      <th className="px-3 py-2 font-medium">{tr('Détail', 'Detail')}</th>
                    </tr></thead>
                    <tbody>
                      {log.map((l: any) => { const s = STATUS_STYLE[l.status] || STATUS_STYLE.received; const cnt = (l.created || l.merged || l.measures) ? ` (${l.created}+/${l.merged}~/${l.measures}m)` : ''; return (
                        <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="whitespace-nowrap px-3 py-2 text-slate-500">{new Date(l.created_at).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', { dateStyle: 'short', timeStyle: 'short' })}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{l.from_addr || '—'}</td>
                          <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{tr(s.fr, s.en)}</span></td>
                          <td className="px-3 py-2 text-slate-500">{(l.detail || '').slice(0, 60)}{l.status === 'imported' ? cnt : ''}</td>
                        </tr>
                      ); })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Note prospective : analyseurs en continu (Phase 2) */}
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="mb-1 flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300"><Cpu size={15} /> {tr('À venir — analyseurs de gaz en continu', 'Coming soon — continuous gas analyzers')}</div>
              {tr('Connexion des moniteurs DGA en ligne (GE, Vaisala, Doble/Morgan Schaffer, MR, Camlin, Qualitrol…) par Modbus / DNP3 / IEC 61850 via une passerelle, avec ingestion temps réel et alarmes automatiques. Les instructions de raccordement seront publiées ici.',
                'Connect online DGA monitors (GE, Vaisala, Doble/Morgan Schaffer, MR, Camlin, Qualitrol…) via Modbus / DNP3 / IEC 61850 through a gateway, with real-time ingestion and automatic alarms. Connection instructions will be published here.')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
