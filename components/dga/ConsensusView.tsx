'use client';
// Vue COMPLÉMENTAIRE du DGA — méthodes d'interprétation NON-Duval + consensus. Le tenant clique l'onglet
// et voit : verdict auto-sélectionné (méthode primaire choisie par arbre de règles), tableau par méthode
// (Gaz clés / Doernenburg / Rogers / IEC 60599 / CO₂-CO / Duval), désaccords et points non concluants.
import React from 'react';
import { autoDiagnose } from '@/lib/dga/autoSelect';
import { faultFamily, type DGAGases } from '@/lib/dga/methods';

const FAMILY_STYLE: Record<string, { bg: string; fg: string }> = {
  arc: { bg: '#F09595', fg: '#501313' },
  thermique: { bg: '#EF9F27', fg: '#633806' },
  pd: { bg: '#B5D4F4', fg: '#0C447C' },
  papier: { bg: '#C0DD97', fg: '#173404' },
  normal: { bg: '#9FE1CB', fg: '#04342C' },
  autre: { bg: '#e5e7eb', fg: '#374151' },
};

const FAMILY_EN: Record<string, string> = { arc: 'Arc / high-energy discharge', thermique: 'Thermal fault', pd: 'Partial discharges', papier: 'Paper degradation (cellulose)', normal: 'No significant fault', autre: 'Undetermined' };
const CONF_EN: Record<string, string> = { 'élevée': 'high', 'moyenne': 'medium', 'faible': 'low' };

export function ConsensusView({ gases, duvalTriangle1, lang = 'fr' }: { gases: DGAGases & { O2?: number; N2?: number }; duvalTriangle1?: string | null; lang?: 'fr' | 'en' }) {
  const EN = lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const dx = autoDiagnose(gases);
  const famStyle = dx.verdict.family ? FAMILY_STYLE[dx.verdict.family] : null;
  const famLabel = dx.verdict.family ? (EN ? (FAMILY_EN[dx.verdict.family] || dx.verdict.label) : dx.verdict.label) : tr('Indéterminé', 'Undetermined');
  const conf = EN ? (CONF_EN[dx.verdict.confidence] || dx.verdict.confidence) : dx.verdict.confidence;
  const confColor = dx.verdict.confidence === 'élevée' ? '#15803d' : dx.verdict.confidence === 'moyenne' ? '#c0651a' : '#b91c1c';

  return (
    <div className="space-y-3">
      {!dx.reliable && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">{tr('Gaz sous les seuils — diagnostic non fiable, re-test recommandé.', 'Gases below thresholds — unreliable diagnosis, re-test recommended.')}</div>
      )}

      {/* Verdict auto-sélectionné */}
      <div className="rounded-xl p-4" style={{ background: (famStyle?.bg || '#e5e7eb') + '33' }}>
        <div className="flex flex-wrap items-center gap-3">
          {famStyle && <span style={{ background: famStyle.bg, color: famStyle.fg }} className="rounded-lg px-3 py-1.5 text-sm font-bold">{dx.verdict.fault || dx.verdict.family}</span>}
          <div>
            <div className="text-base font-extrabold text-gray-900 dark:text-gray-100">{famLabel}</div>
            <div className="text-xs text-gray-500">{dx.transformerType !== 'unknown' ? `${dx.transformerType === 'sealed' ? tr('Scellé', 'Sealed') : tr('Respirant', 'Free-breathing')} · ` : ''}{tr('Méthode primaire', 'Primary method')} : <b>{dx.primaryMethod}</b></div>
          </div>
          <span className="ml-auto text-sm font-bold" style={{ color: confColor }}>{tr('Confiance', 'Confidence')} {conf} · {tr('consensus', 'consensus')} {Math.round(dx.consensus.agreement * 100)}%</span>
        </div>
      </div>

      {/* Tableau par méthode */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40"><tr><th className="px-3 py-2">{tr('Méthode', 'Method')}</th><th className="px-3 py-2">{tr('Verdict', 'Verdict')}</th><th className="px-3 py-2">{tr('Détail', 'Detail')}</th></tr></thead>
          <tbody>
            {dx.consensus.methods.map((m, i) => {
              const fam = m.fault ? faultFamily(m.fault) : null;
              const st = fam ? FAMILY_STYLE[fam] : null;
              return (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700/50" style={{ opacity: m.valid && m.fault ? 1 : 0.65 }}>
                  <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">{m.method}</td>
                  <td className="px-3 py-2"><span className="rounded px-2 py-0.5 text-xs font-bold" style={{ background: st ? st.bg : '#fff', color: st ? st.fg : '#888', border: st ? 'none' : '0.5px solid #ccc' }}>{m.fault ?? (m.valid ? tr('non concluant', 'inconclusive') : 'n/a')}</span></td>
                  <td className="px-3 py-2 text-xs text-gray-500">{m.label}{m.note ? ` — ${m.note}` : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dx.consensus.disagreement.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-300"><b>{tr('Désaccords', 'Disagreements')}</b> : {dx.consensus.disagreement.join(' · ')} — {tr("à corréler avec Duval (méthode de référence pour l'arc).", 'correlate with Duval (reference method for arcing).')}</div>
      )}
      {dx.consensus.nonConclusive.length > 0 && (
        <div className="text-xs text-gray-500">{tr('Non concluant', 'Inconclusive')} : {dx.consensus.nonConclusive.join(', ')} — {tr('limite connue (souvent ratios hors plage avec arc), pas un désaccord.', 'known limitation (often out-of-range ratios with arcing), not a disagreement.')}</div>
      )}
      <p className="text-[11px] italic text-gray-400">{tr('Diagnostic assisté par ordinateur, déterministe. À valider par une personne qualifiée (équipement sous tension). Seuils IEEE C57.104 / IEC 60599 (réf. publiques), à confirmer contre la norme officielle.', 'Deterministic computer-assisted diagnosis. To be validated by a qualified person (energized equipment). IEEE C57.104 / IEC 60599 thresholds (public refs), to confirm against the official standard.')}</p>
    </div>
  );
}

export default ConsensusView;
