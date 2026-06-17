'use client';
// Modèles d'export PDF (#55) — fondation. Le socle de marque est commun (style DGA/letterhead) ; ici on
// règle la COULEUR D'ACCENT par module (en-tête/titre des PDF). « Unifier tout » applique une seule
// couleur partout. La config est lue par les exporteurs via pdfAccentFor (adoption progressive).
import React, { useEffect, useState } from 'react';
import { Loader2, Save, FileText, Wand2 } from 'lucide-react';
import { PDF_MODULES, DEFAULT_ACCENT, getPdfStyles, savePdfStyles, type PdfStyles } from '@/lib/pdfStyle';

type Tr = (fr: string, en: string) => string;

export function PdfStylesManager({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [styles, setStyles] = useState<PdfStyles>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [unifyColor, setUnifyColor] = useState(DEFAULT_ACCENT);

  useEffect(() => { getPdfStyles(tenant).then(s => { setStyles(s); setLoading(false); }, () => setLoading(false)); }, [tenant]);

  const accentOf = (key: string) => (styles.modules as any)?.[key]?.accent || DEFAULT_ACCENT;
  const setAccent = (key: string, hex: string) => setStyles(s => ({ ...s, modules: { ...(s.modules || {}), [key]: { ...((s.modules as any)?.[key] || {}), accent: hex } } as any }));
  const unifyAll = () => setStyles(s => ({ ...s, modules: Object.fromEntries(PDF_MODULES.map(m => [m.key, { accent: unifyColor }])) as any }));

  async function save() {
    setSaving(true); setNotice(null);
    try { const { error } = await savePdfStyles(tenant, styles); if (error) throw error; setNotice(tr('Modèles PDF enregistrés ✓', 'PDF templates saved ✓')); }
    catch (e: any) { setNotice('Erreur (migration 216 ?) : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Tous les exports PDF partagent le même modèle de marque (style DGA : logo, en-tête, pied numéroté). Vous réglez ici la COULEUR D’ACCENT par module. « Unifier tout » applique une seule couleur partout.', 'All PDF exports share the same brand template (DGA style). Set the ACCENT COLOR per module here. “Unify all” applies one color everywhere.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}

      {/* Couleur du HEADER principal du site (pour s'accorder au logo du tenant) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Couleur du header du site', 'Site header color')}</div>
            <div className="text-xs text-gray-500">{tr('La barre du haut de l’application (pour s’accorder à votre logo). Vide = gris par défaut.', 'The app top bar (to match your logo). Empty = default dark.')}</div>
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(styles.brand_color || '') ? styles.brand_color! : '#111827'} disabled={!canEdit} onChange={e => setStyles(s => ({ ...s, brand_color: e.target.value }))} className="h-8 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" />
            {styles.brand_color && canEdit && <button onClick={() => setStyles(s => { const { brand_color, ...rest } = s; return rest; })} className="text-xs font-semibold text-gray-400 hover:text-gray-600">{tr('Réinit.', 'Reset')}</button>}
          </div>
        </div>
        {/* Aperçu de la barre */}
        <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-white" style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(styles.brand_color || '') ? styles.brand_color : '#111827' }}>
          <span className="text-[11px] font-bold">LOGO</span><span className="text-[10px] opacity-70">{tr('Aperçu du header', 'Header preview')}</span>
        </div>
      </div>

      {/* Unifier tout */}
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{tr('Unifier toutes les couleurs', 'Unify all colors')}</span>
          <input type="color" value={unifyColor} onChange={e => setUnifyColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" />
          <button onClick={unifyAll} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"><Wand2 size={14} /> {tr('Appliquer à tous les modules', 'Apply to all modules')}</button>
        </div>
      )}

      {/* Couleur par module + aperçu de l'en-tête */}
      <div className="grid gap-3 sm:grid-cols-2">
        {PDF_MODULES.map(m => {
          const accent = accentOf(m.key);
          return (
            <div key={m.key} className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100"><FileText size={14} /> {tr(m.fr, m.en)}</span>
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(accent) ? accent : DEFAULT_ACCENT} disabled={!canEdit} onChange={e => setAccent(m.key, e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-gray-300 disabled:opacity-50 dark:border-gray-600" />
              </div>
              {/* Aperçu : en-tête PDF stylisé (logo + filet d'accent + titre) */}
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between bg-white px-3 py-2 dark:bg-gray-900">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">LOGO</span>
                  <span className="text-[9px] text-gray-400">{tr('Document', 'Document')}</span>
                </div>
                <div style={{ height: 2, background: accent }} />
                <div className="bg-white px-3 py-2 dark:bg-gray-900">
                  <div className="text-sm font-extrabold" style={{ color: accent }}>{tr(m.fr, m.en)}</div>
                  <div className="text-[10px] text-gray-400">{tr('Sous-titre · client · date', 'Subtitle · client · date')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      )}
      <p className="text-[11px] text-gray-400">{tr('La couleur est appliquée progressivement aux exports (le socle de marque reste identique partout).', 'Color is applied progressively to exports (the brand base stays identical everywhere).')}</p>
    </div>
  );
}
