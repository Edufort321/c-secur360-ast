'use client';
// Modèles d'export PDF (#55). Socle de marque commun = style DGA/letterhead. On règle ici un STYLE PAR
// DÉFAUT (unifié) + des overrides PAR EXPORT : couleur d'accent, couleur secondaire, épaisseur des
// filets/séparateurs, taille des titres, affichage du filet. Mode « Unifié » = tous les modules suivent
// le défaut. Couleur du header du site aussi réglable. Lu par les exporteurs via pdfStyleFor.
import React, { useEffect, useState } from 'react';
import { Loader2, Save, FileText } from 'lucide-react';
import { PDF_MODULES, BASE_KNOBS, getPdfStyles, savePdfStyles, type PdfStyles, type PdfStyleKnobs } from '@/lib/pdfStyle';

type Tr = (fr: string, en: string) => string;

export function PdfStylesManager({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [styles, setStyles] = useState<PdfStyles>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { getPdfStyles(tenant).then(s => { setStyles(s); setLoading(false); }, () => setLoading(false)); }, [tenant]);

  const def: PdfStyleKnobs = styles.default || {};
  const setDef = (patch: Partial<PdfStyleKnobs>) => setStyles(s => ({ ...s, default: { ...(s.default || {}), ...patch } }));
  const modAccent = (key: string) => (styles.modules as any)?.[key]?.accent || def.accent || BASE_KNOBS.accent;
  const setModAccent = (key: string, hex: string) => setStyles(s => ({ ...s, modules: { ...(s.modules || {}), [key]: { ...((s.modules as any)?.[key] || {}), accent: hex } } as any }));
  const col = (v?: string, fb = '#000000') => (/^#[0-9a-f]{6}$/i.test(v || '') ? v! : fb);

  async function save() {
    setSaving(true); setNotice(null);
    try { const { error } = await savePdfStyles(tenant, styles); if (error) throw error; setNotice(tr('Modèles PDF enregistrés ✓', 'PDF templates saved ✓')); }
    catch (e: any) { setNotice('Erreur (migration 216 ?) : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  const unified = styles.unified !== false ? styles.unified === true : false;
  const accentD = col(def.accent, BASE_KNOBS.accent);
  const accent2D = col(def.accent2, BASE_KNOBS.accent2);
  const ruleW = def.ruleWidth ?? BASE_KNOBS.ruleWidth;
  const titleS = def.titleSize ?? BASE_KNOBS.titleSize;
  const showR = def.showRule !== false;

  const Preview = ({ accent, accent2, rw, ts, show, label }: { accent: string; accent2: string; rw: number; ts: number; show: boolean; label: string }) => (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-white px-3 py-2 dark:bg-gray-900"><span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">LOGO</span><span className="text-[9px] text-gray-400">{tr('Document', 'Document')}</span></div>
      {show && <div style={{ height: Math.max(1, rw * 1.2), background: accent }} />}
      <div className="bg-white px-3 py-2 dark:bg-gray-900">
        <div className="font-extrabold" style={{ color: accent, fontSize: ts }}>{label}</div>
        <div className="text-[10px]" style={{ color: accent2 }}>{tr('Sous-titre · client · date', 'Subtitle · client · date')}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Réglez le STYLE PAR DÉFAUT (unifié) ci-dessous ; activez la personnalisation par export pour varier la couleur d’accent module par module.', 'Set the DEFAULT (unified) style below; enable per-export customization to vary the accent color by module.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}

      {/* Couleur du HEADER du site */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><div className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Couleur du header du site', 'Site header color')}</div><div className="text-xs text-gray-500">{tr('Barre du haut de l’application (pour s’accorder au logo).', 'App top bar (to match your logo).')}</div></div>
          <div className="flex items-center gap-2">
            <input type="color" value={col(styles.brand_color, '#111827')} disabled={!canEdit} onChange={e => setStyles(s => ({ ...s, brand_color: e.target.value }))} className="h-8 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" />
            {styles.brand_color && canEdit && <button onClick={() => setStyles(s => { const { brand_color, ...rest } = s; return rest; })} className="text-xs font-semibold text-gray-400 hover:text-gray-600">{tr('Réinit.', 'Reset')}</button>}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-white" style={{ backgroundColor: col(styles.brand_color, '#111827') }}><span className="text-[11px] font-bold">LOGO</span><span className="text-[10px] opacity-70">{tr('Aperçu du header', 'Header preview')}</span></div>
      </div>

      {/* STYLE PAR DÉFAUT (mise en page) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Style par défaut (mise en page)', 'Default style (layout)')}</h3>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <input type="checkbox" disabled={!canEdit} checked={!!styles.unified} onChange={e => setStyles(s => ({ ...s, unified: e.target.checked }))} />
            {tr('Unifié (appliquer à tous les modules)', 'Unified (apply to all modules)')}
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Couleur d’accent', 'Accent color')}<input type="color" disabled={!canEdit} value={accentD} onChange={e => setDef({ accent: e.target.value })} className="h-7 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" /></label>
            <label className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Couleur secondaire', 'Secondary color')}<input type="color" disabled={!canEdit} value={accent2D} onChange={e => setDef({ accent2: e.target.value })} className="h-7 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" /></label>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Épaisseur des séparateurs', 'Separator width')} : {ruleW} pt
              <input type="range" min={0.4} max={4} step={0.2} disabled={!canEdit} value={ruleW} onChange={e => setDef({ ruleWidth: Number(e.target.value) })} className="mt-1 w-full" /></label>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Taille du titre', 'Title size')} : {titleS} pt
              <input type="range" min={10} max={22} step={1} disabled={!canEdit} value={titleS} onChange={e => setDef({ titleSize: Number(e.target.value) })} className="mt-1 w-full" /></label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300"><input type="checkbox" disabled={!canEdit} checked={showR} onChange={e => setDef({ showRule: e.target.checked })} /> {tr('Afficher le filet sous l’en-tête', 'Show rule under header')}</label>
          </div>
          <Preview accent={accentD} accent2={accent2D} rw={ruleW} ts={titleS} show={showR} label={tr('Titre du document', 'Document title')} />
        </div>
      </div>

      {/* PERSONNALISATION PAR EXPORT (couleur d'accent par module) — masquée si unifié */}
      {!styles.unified && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Couleur d’accent par export', 'Accent color per export')}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {PDF_MODULES.map(m => {
              const a = col(modAccent(m.key), BASE_KNOBS.accent);
              return (
                <div key={m.key} className="rounded-xl border border-gray-200 p-2 dark:border-gray-700">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200"><FileText size={12} /> {tr(m.fr, m.en)}</span>
                    <input type="color" disabled={!canEdit} value={a} onChange={e => setModAccent(m.key, e.target.value)} className="h-6 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600" />
                  </div>
                  <div style={{ height: Math.max(1, ruleW * 1.2), background: a }} />
                  <div className="px-1 pt-1 text-xs font-extrabold" style={{ color: a }}>{tr(m.fr, m.en)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {canEdit && <div className="flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button></div>}
      <p className="text-[11px] text-gray-400">{tr('Appliqué aux exports : soumission, facture, paie, feuille de temps, projet, bon de commande, DGA et inspection. Le rapport terrain garde son propre thème de couleurs intégré. Le socle DGA reste identique partout.', 'Applied to exports: quote, invoice, payroll, timesheet, project, PO, DGA and inspection. The field report keeps its own built-in color theme. The DGA base stays identical everywhere.')}</p>
    </div>
  );
}
