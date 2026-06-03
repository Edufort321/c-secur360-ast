'use client';

// Module externe DGA — Diagnostic de gaz dissous. Intégré au tenant, style commun (header FR/EN +
// jour/nuit). Visible/accessible uniquement si abonné (tenant_modules.enabled via useModuleEnabled).
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModuleEnabled } from '@/lib/modules/useModuleEnabled';
import { supabase } from '@/lib/supabase';
import { diagnoseFull, type GasInput } from '@/lib/dga/diagnose';
import { FlaskConical, Lock, Loader2, Save, Activity, History } from 'lucide-react';

const GASES: { key: keyof GasInput; label: string }[] = [
  { key: 'h2', label: 'H₂' }, { key: 'ch4', label: 'CH₄' }, { key: 'c2h6', label: 'C₂H₆' },
  { key: 'c2h4', label: 'C₂H₄' }, { key: 'c2h2', label: 'C₂H₂' }, { key: 'co', label: 'CO' }, { key: 'co2', label: 'CO₂' },
];
const COND_COLOR: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  4: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function DgaPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = String(params?.tenant || '');
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const access = useModuleEnabled(tenant, 'dga', false);

  const [asset, setAsset] = useState('');
  const [sampleDate, setSampleDate] = useState('');
  const [gas, setGas] = useState<GasInput>({ h2: 0, ch4: 0, c2h6: 0, c2h4: 0, c2h2: 0, co: 0, co2: 0 });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const result = useMemo(() => diagnoseFull(gas), [gas]);

  async function loadHistory() {
    const { data } = await supabase.from('dga_analyses').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(20);
    setHistory(data || []);
  }
  useEffect(() => { if (access === 'enabled') loadHistory(); /* eslint-disable-next-line */ }, [access, tenant]);

  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
  const setG = (k: keyof GasInput, v: string) => setGas(g => ({ ...g, [k]: v === '' ? 0 : Number(v) }));

  async function save() {
    if (!asset.trim()) { setNotice(tr('Indiquez l’équipement.', 'Enter the asset.')); return; }
    setSaving(true); setNotice(null);
    const payload: any = {
      tenant_id: tenant, asset_name: asset.trim(), sample_date: sampleDate || null,
      ...gas, tdcg: result.tdcg, condition: result.condition, duval: result.duval,
      fault: tr(result.fault.fr, result.fault.en), notes: notes || null,
    };
    const { error } = await supabase.from('dga_analyses').insert(payload);
    if (error) setNotice('Erreur : ' + error.message);
    else { setNotice(tr('Analyse enregistrée ✓', 'Analysis saved ✓')); loadHistory(); }
    setSaving(false);
  }

  if (access === 'loading') {
    return (<div className="min-h-screen bg-gray-100 dark:bg-gray-900"><PortalHeader tenant={tenant} /><div className="grid place-items-center py-32 text-gray-400"><Loader2 className="animate-spin" /></div></div>);
  }
  if (access === 'locked') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <PortalHeader tenant={tenant} />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <Lock className="mx-auto text-gray-400" size={40} />
          <h1 className="mt-4 text-xl font-bold">{tr('Module non activé', 'Module not enabled')}</h1>
          <p className="mt-2 text-sm text-gray-500">{tr('Le module Diagnostic DGA n’est pas inclus dans votre abonnement. Contactez votre administrateur pour l’activer.', 'The DGA Diagnostic module is not included in your subscription. Contact your administrator to enable it.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <BackButton fallback={`/${tenant}/modules`} />
        <div className="mt-3 mb-5 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white"><FlaskConical size={18} /></span>
          <div>
            <h1 className="text-xl font-extrabold">{tr('Diagnostic DGA', 'DGA Diagnostic')}</h1>
            <p className="text-xs text-gray-500">{tr('Analyse de gaz dissous — IEEE C57.104 + Triangle de Duval', 'Dissolved gas analysis — IEEE C57.104 + Duval Triangle')}</p>
          </div>
        </div>

        {notice && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{notice}</div>}

        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          {/* Saisie */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Équipement', 'Asset')}</span>
                <input className={inp} value={asset} onFocus={e => e.target.select()} onChange={e => setAsset(e.target.value)} placeholder={tr('Transfo T1 — poste Nord', 'Transformer T1 — North station')} /></label>
              <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Date d’échantillon', 'Sample date')}</span>
                <input type="date" className={inp} value={sampleDate} onChange={e => setSampleDate(e.target.value)} /></label>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GASES.map(g => (
                <label key={g.key} className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{g.label} <span className="text-gray-400">(ppm)</span></span>
                  <input type="number" min="0" className={inp} value={gas[g.key] === 0 ? '' : gas[g.key]} placeholder="0" onFocus={e => e.target.select()} onChange={e => setG(g.key, e.target.value)} />
                </label>
              ))}
            </div>
            <label className="mt-4 block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Notes', 'Notes')}</span>
              <textarea className={`${inp} h-20 resize-y`} value={notes} onChange={e => setNotes(e.target.value)} /></label>
            <button onClick={save} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {tr('Enregistrer l’analyse', 'Save analysis')}
            </button>
          </div>

          {/* Résultat live */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold"><Activity size={15} /> {tr('Diagnostic', 'Diagnosis')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40">
                <span className="text-xs text-gray-500">TDCG</span><span className="font-bold">{Math.round(result.tdcg).toLocaleString('fr-CA')} ppm</span>
              </div>
              <div className="text-center">
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${COND_COLOR[result.condition]}`}>{tr('Condition IEEE', 'IEEE Condition')} {result.condition}/4</span>
              </div>
              <div className="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-700">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">{tr('Zone Duval', 'Duval zone')}</div>
                <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{result.duval}</div>
                <div className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{tr(result.fault.fr, result.fault.en)}</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
                <strong>{tr('Recommandation', 'Recommendation')} :</strong> {tr(result.recommendation.fr, result.recommendation.en)}
              </div>
              {/* Méthodes complémentaires (Rogers / IEC 60599 / gaz dominant) */}
              <div className="space-y-1.5 border-t border-gray-100 pt-2 dark:border-gray-700">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">{tr('Méthodes', 'Methods')}</div>
                {result.methods.map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{m.name}</span>
                    <span className="text-right text-gray-700 dark:text-gray-200">{tr(m.fault.fr, m.fault.en)}{m.detail && m.detail !== '—' ? <span className="block text-[10px] text-gray-400">{m.detail}</span> : null}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">{tr('Indicatif — à confirmer par laboratoire et suivi de tendance.', 'Indicative — confirm with lab and trend analysis.')}</p>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold"><History size={15} /> {tr('Historique', 'History')} ({history.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-400"><tr>
                <th className="px-2 py-1">{tr('Équipement', 'Asset')}</th><th className="px-2 py-1">{tr('Date', 'Date')}</th>
                <th className="px-2 py-1">TDCG</th><th className="px-2 py-1">IEEE</th><th className="px-2 py-1">Duval</th><th className="px-2 py-1">{tr('Défaut', 'Fault')}</th>
              </tr></thead>
              <tbody>
                {history.length === 0 && <tr><td colSpan={6} className="px-2 py-4 text-center text-gray-400">{tr('Aucune analyse.', 'No analysis yet.')}</td></tr>}
                {history.map(h => (
                  <tr key={h.id} className="border-t border-gray-100 dark:border-gray-700/50">
                    <td className="px-2 py-1.5 font-medium">{h.asset_name}</td>
                    <td className="px-2 py-1.5 text-gray-500">{h.sample_date || (h.created_at || '').slice(0, 10)}</td>
                    <td className="px-2 py-1.5">{Math.round(h.tdcg || 0)}</td>
                    <td className="px-2 py-1.5"><span className={`rounded px-1.5 py-0.5 text-xs font-bold ${COND_COLOR[h.condition || 1]}`}>{h.condition}</span></td>
                    <td className="px-2 py-1.5 font-semibold text-rose-600 dark:text-rose-400">{h.duval}</td>
                    <td className="px-2 py-1.5 text-gray-600 dark:text-gray-300">{h.fault}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
