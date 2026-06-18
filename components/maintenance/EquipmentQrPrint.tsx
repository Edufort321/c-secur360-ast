'use client';
// Impression QR PRO des fiches d'équipement — réutilise le générateur d'étiquettes de l'INVENTAIRE
// (jsPDF + QR, formats Avery, aperçu/imprimer/télécharger). Le QR pointe vers la page publique de scan
// /scan/[tenant]/[id] (alerte bris/maintenance + infos). Multi-formats + copies, comme l'inventaire.
import { useMemo, useState } from 'react';
import { X, Printer, Eye, Download, Loader2, QrCode } from 'lucide-react';
import { generateLabelsPdf, formatList } from '@/components/inventory/lib/labelPdf';
import type { SEquip } from '@/lib/serviceTree';

type Tr = (fr: string, en: string) => string;

export default function EquipmentQrPrint({ tenant, items, tr, onClose }: { tenant: string; items: SEquip[]; tr: Tr; onClose: () => void }) {
  const formats = useMemo(() => formatList(), []);
  const [formatKey, setFormatKey] = useState(formats[0]?.key || 'avery5160');
  const [copies, setCopies] = useState(1);
  const [busy, setBusy] = useState<'' | 'print' | 'preview' | 'pdf'>('');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const labels = useMemo(() => {
    const out: any[] = [];
    for (const e of items) for (let c = 0; c < Math.max(1, copies); c++) {
      out.push({
        name: e.name, code: e.serial || '', location: e.location || '',
        url: `${origin}/scan/${tenant}/${e.id}`,
        min: e.brand || '', max: e.model || '',
      });
    }
    return out;
  }, [items, copies, origin, tenant]);

  async function run(mode: 'print' | 'preview' | 'pdf') {
    setBusy(mode);
    try {
      await generateLabelsPdf(labels, {
        formatKey, print: mode === 'print', preview: mode === 'preview',
        filename: `qr-equipements-${tenant}.pdf`,
      });
    } catch { /* ignore */ }
    finally { setBusy(''); }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-white"><QrCode size={18} className="text-orange-600" /> {tr('Imprimer les QR', 'Print QR codes')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <p className="mb-3 text-xs text-gray-500">{items.length} {tr('équipement(s) sélectionné(s)', 'equipment selected')} · {labels.length} {tr('étiquette(s)', 'label(s)')}</p>

        <label className="block text-xs font-semibold text-gray-500">{tr('Format d’étiquette', 'Label format')}
          <select value={formatKey} onChange={e => setFormatKey(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm dark:border-gray-600 dark:bg-gray-700">
            {formats.map(f => <option key={f.key} value={f.key}>{f.name} — {f.desc} ({f.perPage}/{tr('feuille', 'sheet')})</option>)}
          </select>
        </label>

        <label className="mt-3 block text-xs font-semibold text-gray-500">{tr('Copies par équipement', 'Copies per equipment')}
          <input type="number" min={1} max={50} value={copies} onChange={e => setCopies(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-24 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
        </label>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button onClick={() => run('preview')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300">{busy === 'preview' ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} {tr('Aperçu', 'Preview')}</button>
          <button onClick={() => run('pdf')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300">{busy === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF</button>
          <button onClick={() => run('print')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy === 'print' ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} {tr('Imprimer', 'Print')}</button>
        </div>
        <p className="mt-2 text-[11px] text-gray-400">{tr('Le QR ouvre la page publique de scan (alerte bris/maintenance + infos). Marque/Modèle affichés sur l’étiquette.', 'QR opens the public scan page (breakdown/maintenance alert + info). Brand/Model shown on the label.')}</p>
      </div>
    </div>
  );
}
