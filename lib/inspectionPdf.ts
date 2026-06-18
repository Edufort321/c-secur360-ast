// PDF d'une FEUILLE D'INSPECTION (module Maintenance, phase 4). Socle de marque commun (letterhead DGA)
// + style éditable par module (pdfStyleFor(tenant,'inspection')). Rend sections + points, résultats,
// anomalies (détail) et photos. Page-break automatique.
import { PDF, loadImg, drawHeader, drawTitle, applyFooters } from '@/lib/pdf/letterhead';
import { pdfStyleFor } from '@/lib/pdfStyle';
import { RESULT_META, type InspectionSubmission } from '@/lib/inspectionForms';

const ANSWER_LABEL: Record<string, string> = { conforme: 'Conforme', non_conforme: 'NON CONFORME', na: 'S.O.' };

export async function exportInspectionPdf(tenant: string, sub: InspectionSubmission, opts?: { logoUrl?: string | null; tenantName?: string }): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const st = await pdfStyleFor(tenant, 'inspection').catch(() => null as any);
  const accent: [number, number, number] = st?.accent || [39, 125, 161];
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = PDF.W, M = PDF.M;
  const logo = await loadImg(opts?.logoUrl || '/c-secur360-logo.png');

  const date = (sub.created_at || '').slice(0, 10);
  const rm = sub.overall_result ? RESULT_META[sub.overall_result] : null;
  const header = () => drawHeader(doc, { logo, rightLines: [opts?.tenantName || '', sub.equipment_name || ''].filter(Boolean) as string[], accent, ruleWidth: st?.ruleWidth, showRule: st?.showRule });
  let y = header();
  y = drawTitle(doc, y, sub.template_name || 'Inspection', [sub.equipment_name, date].filter(Boolean).join(' · '), accent, st?.titleSize, st?.subtitleSize);

  const newPageIfNeeded = (need: number) => { if (y + need > PDF.H - 50) { doc.addPage(); y = header() + 6; } };

  // Bandeau résultat + méta
  doc.setFontSize(10); doc.setTextColor(60);
  const meta = [`Inspecteur : ${sub.inspector_name || '—'}`, `Anomalies : ${sub.anomalies_count || 0}`].join('     ');
  doc.text(meta, M, y);
  if (rm) {
    const label = (rm.fr || '').toUpperCase();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    const col: [number, number, number] = rm.color === 'emerald' ? [42, 157, 143] : rm.color === 'amber' ? [233, 161, 50] : [220, 38, 38];
    doc.setTextColor(...col); doc.text(label, W - M, y, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
  }
  y += 18;

  const tpl = sub.template_snapshot;
  const answers = sub.answers || {};
  for (const s of (tpl?.sections || [])) {
    newPageIfNeeded(30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...accent);
    doc.text(s.title || 'Section', M, y); y += 4;
    doc.setDrawColor(...accent); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 12;
    doc.setTextColor(40);

    for (const it of (s.items || [])) {
      const a: any = answers[it.id] || {};
      const isFail = (it.type === 'pass_fail' && a.value === 'non_conforme') || (it.type === 'checkbox' && a.value === false);
      let valTxt = '';
      if (it.type === 'pass_fail') valTxt = ANSWER_LABEL[a.value] || '—';
      else if (it.type === 'checkbox') valTxt = a.value === true ? 'Oui' : a.value === false ? 'Non' : '—';
      else valTxt = (a.value ?? '') === '' ? '—' : String(a.value);

      newPageIfNeeded(20);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(40);
      const label = `${it.label || '(point)'}${it.critical ? ' [critique]' : ''}${it.withdrawal ? ' [retrait]' : ''}`;
      const labelLines = doc.splitTextToSize(label, W - 2 * M - 110);
      doc.text(labelLines, M, y);
      doc.setFont('helvetica', 'bold');
      if (isFail) doc.setTextColor(220, 38, 38); else doc.setTextColor(90);
      doc.text(valTxt, W - M, y, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(40);
      y += Math.max(14, labelLines.length * 12);

      // Détail d'anomalie
      if (a.detail) {
        newPageIfNeeded(16);
        doc.setFontSize(9); doc.setTextColor(150, 40, 40);
        const dl = doc.splitTextToSize(`↳ ${a.detail}`, W - 2 * M - 12);
        doc.text(dl, M + 12, y); y += dl.length * 11 + 2;
        doc.setTextColor(40); doc.setFontSize(10);
      }
      // Photos d'anomalie
      const photos: string[] = Array.isArray(a.photos) ? a.photos : [];
      if (photos.length) {
        newPageIfNeeded(86);
        let px = M + 12;
        for (const url of photos.slice(0, 4)) {
          try { const img = await loadImg(url); if (img) { doc.addImage(img, 'JPEG', px, y, 80, 80); px += 88; } } catch { /* ignore photo */ }
        }
        y += 88;
      }
    }
    y += 6;
  }

  if (sub.notes) {
    newPageIfNeeded(30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...accent); doc.text('Notes', M, y); y += 14;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60); doc.setFontSize(10);
    const nl = doc.splitTextToSize(sub.notes, W - 2 * M); doc.text(nl, M, y);
  }

  applyFooters(doc, `${opts?.tenantName || 'C-Secur360'} · Inspection ${sub.template_name || ''} · ${date}`);
  doc.save(`Inspection-${(sub.template_name || 'feuille').replace(/[^\w]+/g, '_')}-${date}.pdf`);
}
