// Rapport d'inspection de routine en PDF (jsPDF). En-tête équipement + date/inspecteur,
// checklist par catégorie (statut Conforme/Anomalie/N/A + mesures/options + note), aide IA.
import { INSPECTION_CHECKLIST, il } from './inspection';
import type { Inspection } from './dossiers';

const IN = 72;
const STATUS_LABEL: Record<string, { fr: string; en: string; rgb: [number, number, number] }> = {
  conforme: { fr: 'Conforme', en: 'Compliant', rgb: [42, 157, 143] },
  anomalie: { fr: 'ANOMALIE', en: 'ANOMALY', rgb: [220, 38, 38] },
  na: { fr: 'N/A', en: 'N/A', rgb: [120, 120, 120] },
  '': { fr: '—', en: '—', rgb: [160, 160, 160] },
};

async function loadLogo(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try { const r = await fetch(url); const b = await r.blob(); return await new Promise(res => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.onerror = () => res(null); fr.readAsDataURL(b); }); }
  catch { return null; }
}

export async function generateInspectionPdf(opts: { dossier: any; inspection: Inspection; logoUrl?: string | null; lang?: 'fr' | 'en'; tenant?: string }) {
  const { default: jsPDF } = await import('jspdf');
  const fr = (opts.lang || 'fr') === 'fr';
  const L = (a: string, b: string) => (fr ? a : b);
  const d = opts.dossier || {};
  const ins = opts.inspection;
  const res = ins.results || {};
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(); const Hp = doc.internal.pageSize.getHeight(); const M = 42;
  const logo = await loadLogo(opts.logoUrl || '/c-secur360-logo.png');
  // Style du module 'inspection' (Modèles PDF) — accent (titre/filet/bandes de catégorie) + épaisseur.
  // Sans tenant, on garde l'aspect historique (titre gris foncé, bandes bleu-sarcelle 39,125,161).
  let ACCENT: [number, number, number] = [39, 125, 161]; let RW = 1; let TITLE: [number, number, number] = [20, 20, 20];
  if (opts.tenant) {
    try {
      const { pdfStyleFor } = await import('@/lib/pdfStyle');
      const st = await pdfStyleFor(opts.tenant, 'inspection');
      if (st?.accent) { ACCENT = st.accent; TITLE = st.accent; RW = st.ruleWidth || 1; }
    } catch { /* défaut */ }
  }
  let y = 0;

  const header = () => {
    if (logo) { try { doc.addImage(logo, 'PNG', M, 22, 0, 24); } catch { /* ignore */ } }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...TITLE);
    doc.text(L("RAPPORT D'INSPECTION DE ROUTINE", 'ROUTINE INSPECTION REPORT'), W - M, 30, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90);
    doc.text(`${d.ident || '—'}${d.serie ? '  ·  SN ' + d.serie : ''}${d.kv ? '  ·  ' + d.kv + ' kV' : ''}`, W - M, 44, { align: 'right' });
    doc.setDrawColor(...ACCENT); doc.setLineWidth(RW); doc.line(M, 52, W - M, 52);
    y = 70;
  };
  const ensure = (h: number) => { if (y + h > Hp - 40) { doc.addPage(); header(); } };

  header();

  // Bloc info inspection
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(20);
  doc.text(`${L("Date d'inspection", 'Inspection date')} : ${ins.date || '—'}`, M, y);
  doc.text(`${L('Inspecteur', 'Inspector')} : ${ins.inspector || '—'}`, M + 240, y);
  y += 14;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90);
  const anomCount = Object.values(res).filter((r: any) => r?.status === 'anomalie').length;
  doc.text(`${L('Anomalies relevées', 'Anomalies found')} : ${anomCount}`, M, y);
  y += 16;

  INSPECTION_CHECKLIST.forEach(cat => {
    ensure(28);
    // Bandeau catégorie (accent du module)
    doc.setFillColor(...ACCENT); doc.rect(M, y - 9, W - 2 * M, 16, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(255);
    doc.text(il(cat, opts.lang), M + 6, y + 2); y += 16;

    cat.items.forEach(it => {
      const r: any = res[it.key] || {};
      ensure(16);
      const st = r.status || '';
      const sl = STATUS_LABEL[st] || STATUS_LABEL[''];
      // libellé
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(40);
      const label = il(it, opts.lang);
      doc.text(doc.splitTextToSize(label, W - 2 * M - 150)[0], M + 6, y + 2);
      // statut (couleur)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(sl.rgb[0], sl.rgb[1], sl.rgb[2]);
      doc.text(L(sl.fr, sl.en), W - M - 120, y + 2);
      // mesures/options
      const parts: string[] = [];
      (it.inputs || []).forEach(inp => {
        const v = r.inputs?.[inp.key];
        if (v == null || v === '' || v === false) return;
        if (inp.kind === 'bool') parts.push(il(inp, opts.lang));
        else if (inp.kind === 'select') { const c = inp.choices?.find(x => x.value === v); parts.push(`${il(inp, opts.lang)}: ${c ? il(c, opts.lang) : v}`); }
        else parts.push(`${il(inp, opts.lang)}: ${v}${inp.unit ? ' ' + inp.unit : ''}`);
      });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(110);
      if (parts.length) { doc.text(parts.join('  ·  '), W - M - 116, y + 2, { align: 'left' }); }
      y += 12;
      if (r.note) { ensure(11); doc.setFontSize(7.5); doc.setTextColor(150); doc.text(doc.splitTextToSize('• ' + r.note, W - 2 * M - 12), M + 14, y); y += 10; }
      doc.setDrawColor(238); doc.line(M + 6, y - 4, W - M, y - 4);
    });
    y += 6;
  });

  // Aide IA
  const advice = opts.lang === 'en' ? ins.advice?.en : ins.advice?.fr;
  if (advice) {
    ensure(40);
    doc.setFillColor(124, 58, 237); doc.rect(M, y - 9, W - 2 * M, 16, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(255);
    doc.text(L('Aide technique IA — correctifs', 'AI technical aid — corrective actions'), M + 6, y + 2); y += 18;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(40);
    doc.splitTextToSize(advice, W - 2 * M).forEach((line: string) => { ensure(11); doc.text(line, M + 6, y); y += 11; });
  }

  const base = (d.serie || d.ident || 'transfo').toString().trim().replace(/[^\w.-]+/g, '_');
  doc.save(`inspection-${base}-${ins.date || ''}.pdf`);
}
