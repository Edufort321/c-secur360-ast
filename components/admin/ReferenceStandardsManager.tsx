'use client';
// Normes de référence (Système) : saisir EN ARRIÈRE-PLAN les seuils de norme (percentiles DGA en tête) →
// le moteur les utilise PARTOUT (rapport DGA, sévérité). Remplace les valeurs publiées simplifiées par les
// VRAIES valeurs validées (norme IEEE C57.104-2019 payante). Une fois « validé », le verdict DGA n'affiche
// plus « à valider » pour ce tenant. Extensible à d'autres normes.
import { useEffect, useState } from 'react';
import { Loader2, Save, BookCheck } from 'lucide-react';
import { getReferenceStandards, saveReferenceStandards } from '@/lib/referenceStandards';
import { PERCENTILES } from '@/lib/dga/severity2019';
import { DEFAULT_T4_BOUNDS } from '@/lib/dga/triangle4';

type Tr = (f: string, e: string) => string;
const GASES = ['H2', 'CH4', 'C2H6', 'C2H4', 'C2H2', 'CO'];
const GAS_LBL: Record<string, string> = { H2: 'H₂', CH4: 'CH₄', C2H6: 'C₂H₆', C2H4: 'C₂H₄', C2H2: 'C₂H₂', CO: 'CO' };
// Frontières du Triangle de Duval 4 (% des gaz) — libellés FR.
const T4_KEYS: { k: keyof typeof DEFAULT_T4_BOUNDS; fr: string; en: string }[] = [
  { k: 'c2h6_pd', fr: '%C₂H₆ max — zone PD', en: '%C₂H₆ max — PD zone' },
  { k: 'ch4_pd', fr: '%CH₄ max — zone PD', en: '%CH₄ max — PD zone' },
  { k: 'ch4_c', fr: '%CH₄ seuil — zone C (carbonisation)', en: '%CH₄ threshold — C zone' },
  { k: 'c2h6_o', fr: '%C₂H₆ seuil — zone O (surchauffe)', en: '%C₂H₆ threshold — O zone' },
  { k: 'h2_o', fr: '%H₂ max — zone O (surchauffe)', en: '%H₂ max — O zone' },
];

export function ReferenceStandardsManager({ tenant, tr, canEdit, userEmail }: { tenant: string; tr: Tr; canEdit: boolean; userEmail?: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, { p90: string; p95: string }>>({});
  const [t4, setT4] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState(false);
  const [meta, setMeta] = useState<{ validated_by?: string; validated_at?: string; note?: string }>({});
  const inp = 'w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-sm dark:border-gray-700 dark:bg-gray-800';

  useEffect(() => {
    getReferenceStandards(tenant).then(rs => {
      const dp = rs.dga_percentiles || {};
      const r: Record<string, { p90: string; p95: string }> = {};
      for (const g of GASES) {
        const v = dp[g]?._default || (PERCENTILES as any)._default[g];   // pré-rempli avec les valeurs publiées
        r[g] = { p90: String(v?.p90 ?? ''), p95: String(v?.p95 ?? '') };
      }
      const tb = rs.dga_t4_bounds || {};
      const t4r: Record<string, string> = {};
      for (const { k } of T4_KEYS) t4r[k] = String((tb as any)[k] ?? DEFAULT_T4_BOUNDS[k]);
      setRows(r); setT4(t4r); setMeta(rs._meta || {}); setValidated(!!rs._meta?.validated_at); setLoading(false);
    }, () => setLoading(false));
  }, [tenant]);

  async function save() {
    setSaving(true); setNotice(null);
    const dga_percentiles: any = {};
    for (const g of GASES) {
      const p90 = Number(rows[g]?.p90), p95 = Number(rows[g]?.p95);
      if (isFinite(p90) && isFinite(p95) && p95 >= p90) dga_percentiles[g] = { _default: { p90, p95 } };
    }
    const _meta = validated
      ? { validated_by: meta.validated_by || userEmail || '', validated_at: meta.validated_at || new Date().toISOString().slice(0, 10), note: meta.note || '' }
      : { ...meta, validated_at: undefined };
    const dga_t4_bounds: any = {};
    for (const { k } of T4_KEYS) { const v = Number(t4[k]); if (isFinite(v)) dga_t4_bounds[k] = v; }
    const rs = await getReferenceStandards(tenant);
    const { error } = await saveReferenceStandards(tenant, { ...rs, dga_percentiles, dga_t4_bounds, _meta });
    setNotice(error ? 'Erreur : ' + error : tr('Normes enregistrées ✓ — appliquées partout au prochain chargement.', 'Standards saved ✓ — applied everywhere on next load.'));
    setSaving(false);
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Saisissez ici les seuils de NORME (valeurs officielles validées). Ils sont lus en arrière-plan par les moteurs et propagés partout — ici, les percentiles de sévérité DGA (IEEE C57.104-2019, Table 1 = 90ᵉ / Table 2 = 95ᵉ). Pré-remplis avec les valeurs publiées simplifiées ; remplacez-les par vos valeurs validées.', 'Enter the STANDARD thresholds (official validated values). They are read by the engines and propagated everywhere — here, the DGA severity percentiles (IEEE C57.104-2019, Table 1 = 90th / Table 2 = 95th). Prefilled with published simplified values; replace with your validated values.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Percentiles de sévérité DGA (ppm)', 'DGA severity percentiles (ppm)')}</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400"><th className="px-4 py-2">{tr('Gaz', 'Gas')}</th><th className="px-4 text-right">90ᵉ (p90) — {tr('statut 2', 'status 2')}</th><th className="px-4 text-right">95ᵉ (p95) — {tr('statut 3', 'status 3')}</th></tr></thead>
          <tbody>
            {GASES.map(g => (
              <tr key={g} className="border-t border-gray-50 dark:border-gray-700/50">
                <td className="px-4 py-2 font-mono font-semibold">{GAS_LBL[g]}</td>
                <td className="px-4 py-2 text-right"><input type="number" value={rows[g]?.p90 ?? ''} disabled={!canEdit} onChange={e => setRows(r => ({ ...r, [g]: { ...r[g], p90: e.target.value } }))} className={inp} /></td>
                <td className="px-4 py-2 text-right"><input type="number" value={rows[g]?.p95 ?? ''} disabled={!canEdit} onChange={e => setRows(r => ({ ...r, [g]: { ...r[g], p95: e.target.value } }))} className={inp} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-[11px] text-gray-400">{tr('Valeur ≥ p90 → statut 2 (intermédiaire) ; ≥ p95 → statut 3 (élevé). La grille fine par O₂/N₂ × âge reste possible (édition JSON avancée à venir).', 'Value ≥ p90 → status 2 (intermediate); ≥ p95 → status 3 (high). Fine grid by O₂/N₂ × age remains possible (advanced JSON editing later).')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Frontières du Triangle de Duval 4 (% des gaz)', 'Duval Triangle 4 zone boundaries (% of gases)')}</div>
        <table className="w-full text-sm">
          <tbody>
            {T4_KEYS.map(({ k, fr, en }) => (
              <tr key={k} className="border-t border-gray-50 dark:border-gray-700/50">
                <td className="px-4 py-2">{tr(fr, en)}</td>
                <td className="px-4 py-2 text-right"><input type="number" value={t4[k] ?? ''} disabled={!canEdit} onChange={e => setT4(s => ({ ...s, [k]: e.target.value }))} className={inp} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-[11px] text-gray-400">{tr('Le Triangle 4 raffine les défauts BASSE température (PD/T1/T2). Valeurs publiées par défaut — à confirmer contre la norme officielle. Le Triangle 5 (haute T) sera ajouté quand les coordonnées officielles seront fournies.', 'Triangle 4 refines LOW-temperature faults (PD/T1/T2). Published default values — confirm against the official standard. Triangle 5 (high-T) will be added once official coordinates are provided.')}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"><input type="checkbox" disabled={!canEdit} checked={validated} onChange={e => setValidated(e.target.checked)} className="accent-emerald-600" /> <BookCheck size={15} className="text-emerald-600" /> {tr('Valeurs validées par une personne qualifiée', 'Values validated by a qualified person')}</label>
        {validated && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Validé par', 'Validated by')}<input value={meta.validated_by || ''} onChange={e => setMeta(m => ({ ...m, validated_by: e.target.value }))} placeholder={userEmail} className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800" /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Date', 'Date')}<input type="date" value={meta.validated_at || ''} onChange={e => setMeta(m => ({ ...m, validated_at: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800" /></label>
          </div>
        )}
        <p className="mt-2 text-[11px] text-gray-400">{tr('Une fois validées, les fiches DGA n’affichent plus « à valider » pour ce tenant (le verdict utilise vos valeurs).', 'Once validated, DGA sheets no longer show “to validate” for this tenant (the verdict uses your values).')}</p>
      </div>

      {canEdit && <div className="flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button></div>}
    </div>
  );
}
