// Fiche d'équipement EXPORTABLE (inspection) — sections au choix (cases à cocher) :
// fiche, rapport d'anomalies, photos, historique des inspections, pièces jointes.
// Socle de marque unifié (#55) : letterhead DGA + accent du module « inspection ».
import { PDF, drawHeader, drawTitle, applyFooters, loadImg } from '@/lib/pdf/letterhead';
import { pdfStyleFor } from '@/lib/pdfStyle';
import { INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS } from '@/components/InspectionForm/checklists';

export type EquipmentSheetSections = { fiche?: boolean; anomalies?: boolean; photos?: boolean; history?: boolean; attachments?: boolean };

const RESULT_FR: Record<string, string> = { conforme: 'Conforme', conditionnel: 'Conditionnel', non_conforme: 'Non conforme', retrait: 'Retrait immédiat', incomplete: 'En cours' };
const RESULT_EN: Record<string, string> = { conforme: 'Compliant', conditionnel: 'Conditional', non_conforme: 'Non-conforming', retrait: 'Immediate withdrawal', incomplete: 'In progress' };

export async function generateEquipmentSheetPdf(opts: {
  equipment: any; inspections: any[]; tenant: string; lang?: 'fr' | 'en';
  logoUrl?: string | null; sections: EquipmentSheetSections; companyName?: string;
}): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const fr = (opts.lang || 'fr') === 'fr';
  const L = (a: string, b: string) => (fr ? a : b);
  const eq = opts.equipment || {};
  const inspections = opts.inspections || [];
  const sec = opts.sections || {};
  const { M, W, H } = PDF;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const style = await pdfStyleFor(opts.tenant, 'inspection');
  const accent = style.accent;
  const logo = await loadImg(opts.logoUrl || '/c-secur360-logo.png');

  const typeLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === eq.equipment_type)?.label ?? eq.equipment_type ?? '';
  const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === eq.inspection_frequency)?.[fr ? 'label' : 'labelEn'] ?? '';
  const rightLines = [opts.companyName || 'C-Secur360', `${L('Équipement', 'Equipment')} : ${eq.equipment_name || '—'}`, eq.equipment_serial ? `SN ${eq.equipment_serial}` : ''];

  const header = () => drawHeader(doc, { logo, rightLines, accent, ruleWidth: style.ruleWidth, showRule: style.showRule });
  let y = header();
  y = drawTitle(doc, y, L("Fiche d'équipement", 'Equipment sheet'), `${typeLabel}${eq.equipment_location ? ' · ' + eq.equipment_location : ''}`, accent, style.titleSize, style.subtitleSize);

  const ensure = (need: number) => { if (y + need > H - 50) { doc.addPage(); y = header(); } };
  const sectionTitle = (t: string) => { ensure(28); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(accent[0], accent[1], accent[2]); doc.text(t, M, y); y += 6; doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(style.ruleWidth || 0.6); doc.line(M, y, W - M, y); y += 14; doc.setTextColor(40); };
  const kv = (label: string, val: string) => { ensure(16); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(110); doc.text(label, M, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(30); doc.text(String(val || '—'), M + 150, y, { maxWidth: W - M - (M + 150) } as any); y += 15; };

  // ── FICHE ─────────────────────────────────────────────────────────────────
  if (sec.fiche !== false) {
    sectionTitle(L('Fiche de l\'équipement', 'Equipment data'));
    kv(L('Nom', 'Name'), eq.equipment_name);
    kv(L('Type', 'Type'), typeLabel);
    kv(L('No de série', 'Serial no.'), eq.equipment_serial);
    kv(L('Emplacement', 'Location'), eq.equipment_location);
    kv(L('Province', 'Province'), eq.province);
    kv(L('Fréquence d\'inspection', 'Inspection frequency'), freqLabel);
    if (eq.notes) kv('Notes', eq.notes);
  }

  // ── HISTORIQUE DES INSPECTIONS ──────────────────────────────────────────────
  if (sec.history) {
    sectionTitle(L('Historique des inspections', 'Inspection history'));
    if (!inspections.length) { ensure(14); doc.setFontSize(9); doc.setTextColor(150); doc.text(L('Aucune inspection enregistrée.', 'No inspection recorded.'), M, y); y += 14; }
    else {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(90); ensure(14);
      const cols = [M, M + 90, M + 230, M + 360, M + 470];
      doc.text('#', cols[0], y); doc.text('Date', cols[1], y); doc.text(L('Résultat', 'Result'), cols[2], y); doc.text(L('Inspecteur', 'Inspector'), cols[3], y); doc.text(L('NC', 'NC'), cols[4], y); y += 4;
      doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 10;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(50);
      for (const ins of inspections) {
        ensure(14);
        const res = fr ? (RESULT_FR[ins.overall_result] || ins.overall_result || '—') : (RESULT_EN[ins.overall_result] || ins.overall_result || '—');
        doc.text(String(ins.inspection_number || '—'), cols[0], y, { maxWidth: 85 } as any);
        doc.text(ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString('fr-CA') : '—', cols[1], y);
        doc.text(String(res), cols[2], y, { maxWidth: 125 } as any);
        doc.text(String(ins.inspector_name || '—'), cols[3], y, { maxWidth: 105 } as any);
        doc.text(String((ins.non_conformities || []).length || 0), cols[4], y);
        y += 14;
      }
    }
  }

  // ── RAPPORT D'ANOMALIES ─────────────────────────────────────────────────────
  if (sec.anomalies) {
    sectionTitle(L('Rapport d\'anomalies', 'Anomaly report'));
    const withNc = inspections.filter(i => (i.non_conformities || []).length > 0);
    if (!withNc.length) { ensure(14); doc.setFontSize(9); doc.setTextColor(150); doc.text(L('Aucune anomalie relevée.', 'No anomaly found.'), M, y); y += 14; }
    else for (const ins of withNc) {
      ensure(20); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(70);
      doc.text(`${ins.inspection_number || '—'} · ${ins.inspection_date ? new Date(ins.inspection_date).toLocaleDateString('fr-CA') : ''}`, M, y); y += 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      for (const nc of (ins.non_conformities || [])) {
        ensure(13);
        const tag = nc.withdrawal ? '⛔ ' : nc.critical ? '⚠️ ' : '• ';
        doc.setTextColor(nc.withdrawal ? 153 : nc.critical ? 200 : 60, nc.withdrawal ? 27 : nc.critical ? 80 : 60, nc.withdrawal ? 27 : 6);
        doc.text(`${tag}${nc.label || ''}`, M + 8, y, { maxWidth: W - 2 * M - 8 } as any); y += 12;
        const ca = (ins.corrective_actions || {})[nc.id];
        if (ca && (ca.note || ca.deadline || ca.assigned)) {
          ensure(12); doc.setTextColor(110); doc.setFontSize(8);
          const parts = [ca.note, ca.deadline ? `${L('échéance', 'due')}: ${ca.deadline}` : '', ca.assigned ? `${L('assigné', 'assigned')}: ${ca.assigned}` : ''].filter(Boolean).join('  ·  ');
          doc.text(`↳ ${parts}`, M + 16, y, { maxWidth: W - 2 * M - 16 } as any); y += 12; doc.setFontSize(8.5);
        }
      }
      y += 4;
    }
  }

  // ── PHOTOS / PIÈCES JOINTES ─────────────────────────────────────────────────
  if (sec.photos || sec.attachments) {
    const urls: string[] = [];
    (eq.equipment_photos || []).forEach((u: string) => u && urls.push(u));
    for (const ins of inspections) {
      (ins.equipment_photos || []).forEach((u: string) => u && urls.push(u));
      Object.values(ins.item_photos || {}).forEach((u: any) => { if (typeof u === 'string' && u) urls.push(u); });
    }
    const uniq = [...new Set(urls)];
    sectionTitle(L('Photos & pièces jointes', 'Photos & attachments'));
    if (!uniq.length) { ensure(14); doc.setFontSize(9); doc.setTextColor(150); doc.text(L('Aucune photo ou pièce jointe.', 'No photo or attachment.'), M, y); y += 14; }
    else {
      const cw = (W - 2 * M - 12) / 2, ch = 120; let col = 0;
      for (const u of uniq) {
        const img = await loadImg(u);
        if (!img) continue;
        if (col === 0) ensure(ch + 10);
        const x = M + col * (cw + 12);
        try { doc.addImage(img, 'JPEG', x, y, cw, ch, undefined, 'FAST'); } catch { try { doc.addImage(img, 'PNG', x, y, cw, ch); } catch { /* skip */ } }
        col++;
        if (col >= 2) { col = 0; y += ch + 12; }
      }
      if (col === 1) y += ch + 12;
    }
  }

  applyFooters(doc, `${opts.companyName || 'C-Secur360'} · ${L('Fiche', 'Sheet')} ${eq.equipment_name || ''}${eq.equipment_serial ? ' · SN ' + eq.equipment_serial : ''}`);
  const base = String(eq.equipment_serial || eq.equipment_name || 'equipement').replace(/[^\w.-]+/g, '_');
  doc.save(`fiche-${base}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
