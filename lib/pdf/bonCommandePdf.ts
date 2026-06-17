/**
 * Générateur PDF professionnel pour un Bon de commande (achat fournisseur).
 * Même mise en page que les PDF Projet/Soumission (bande foncée, sections, tableaux).
 */
import { computeBonTotal, lineReception, bonStatusLabel, type BonCommande } from '@/lib/bonsCommande';

const PAGE_W = 210, PAGE_H = 297, ML = 15, MR = 15;
const CW = PAGE_W - ML - MR;
const COL = {
  primary: [15, 82, 186] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  emerald: [5, 150, 105] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
};
type Doc = any;
const $ = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

async function loadLogo(url: string): Promise<string | null> {
  try {
    const res = await fetch(url); if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>(resolve => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(blob); });
  } catch { return null; }
}
function drawHeader(doc: Doc, logo: string | null, title: string, subtitle: string, accent?: [number, number, number]) {
  doc.setFillColor(...COL.dark); doc.rect(0, 0, PAGE_W, 22, 'F');
  if (logo) { try { doc.addImage(logo, 'PNG', ML, 4, 0, 14); } catch { /* ignore */ } }
  else { doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...COL.white); doc.text('C-Secur360', ML, 14); }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...COL.white); doc.text(title, PAGE_W - MR, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(148, 163, 184); doc.text(subtitle, PAGE_W - MR, 17, { align: 'right' });
  // Filet d'accent du module (Modèles PDF) — défaut bleu.
  doc.setDrawColor(...(accent || COL.primary)); doc.setLineWidth(1); doc.line(0, 22, PAGE_W, 22);
}
function drawFooter(doc: Doc, n: number, total: number) {
  doc.setDrawColor(...COL.light); doc.setLineWidth(0.3); doc.line(ML, PAGE_H - 10, PAGE_W - MR, PAGE_H - 10);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL.gray);
  doc.text('C-Secur360 · Bon de commande généré le ' + new Date().toLocaleDateString('fr-CA'), ML, PAGE_H - 6);
  doc.text(`Page ${n} / ${total}`, PAGE_W - MR, PAGE_H - 6, { align: 'right' });
}
function sectionTitle(doc: Doc, label: string, y: number): number {
  doc.setFillColor(...COL.light); doc.rect(ML, y, CW, 6.5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...COL.dark); doc.text(label.toUpperCase(), ML + 3, y + 4.5);
  return y + 6.5 + 2;
}
function kvRow(doc: Doc, label: string, value: string, x: number, y: number) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...COL.gray); doc.text(label, x, y);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL.dark); doc.text(value || '—', x, y + 4);
  return y + 10;
}
function tableRow(doc: Doc, cells: { text: string; w: number; align?: 'left' | 'right' | 'center'; color?: [number, number, number] }[], y: number, bg?: [number, number, number], textColor?: [number, number, number], bold?: boolean) {
  const rowH = 6.5;
  if (bg) { doc.setFillColor(...bg); doc.rect(ML, y, CW, rowH, 'F'); }
  doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(8);
  let x = ML;
  for (const c of cells) {
    doc.setTextColor(...(c.color ?? textColor ?? COL.dark));
    const align = c.align || 'left';
    const tx = align === 'right' ? x + c.w - 2 : align === 'center' ? x + c.w / 2 : x + 2;
    doc.text(c.text, tx, y + 4.3, { align });
    x += c.w;
  }
  return y + rowH;
}
function checkPage(doc: Doc, y: number, needed = 12): number { if (y + needed > PAGE_H - 15) { doc.addPage(); return 28; } return y; }

export async function exportBonCommandePdf(opts: {
  bon: BonCommande; tenant: string; tenantLogoUrl?: string | null;
  projectLabel?: string | null; lang?: 'fr' | 'en';
}): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc: Doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const fr = opts.lang !== 'en';
  const tr = (f: string, e: string) => (fr ? f : e);
  const b = opts.bon;
  const logo = await loadLogo(opts.tenantLogoUrl || '/logo.png');
  const totals = computeBonTotal(b.items || [], b.province || 'QC');
  const anyRecu = (b.items || []).some(l => (Number(l.recu) || 0) > 0);
  const accent = await import('@/lib/pdfStyle').then(m => m.pdfAccentFor(opts.tenant, 'bon_commande')).catch(() => undefined);

  drawHeader(doc, logo, tr('Bon de commande', 'Purchase order'), `${b.numero} · ${opts.tenant} · ${new Date().toLocaleDateString('fr-CA')}`, accent);

  // ── Bloc fournisseur / projet / statut ─────────────────────────────────────
  let y = 28;
  y = sectionTitle(doc, tr('Informations', 'Information'), y);
  const col = CW / 3;
  const fields: [string, string][] = [
    [tr('Numéro', 'Number'), b.numero],
    [tr('Fournisseur', 'Supplier'), b.supplier || '—'],
    [tr('Statut', 'Status'), bonStatusLabel(b.status, fr)],
    [tr('Contact', 'Contact'), b.supplier_contact || '—'],
    [tr('Projet', 'Project'), opts.projectLabel || '—'],
    [tr('Date prévue', 'Expected'), b.expected_date || '—'],
  ];
  let c = 0, rowY = y, maxY = y;
  fields.forEach(([label, val]) => {
    kvRow(doc, label, val, ML + c * col, rowY);
    maxY = Math.max(maxY, rowY + 10); c++;
    if (c >= 3) { c = 0; rowY = maxY; }
  });
  y = maxY + 4;

  // ── Tableau des articles (avec contrôle de réception si applicable) ─────────
  y = sectionTitle(doc, tr('Articles commandés', 'Ordered items'), y);
  const cw = anyRecu
    ? [22, CW - 22 - 18 - 18 - 24 - 26, 18, 18, 24, 26]   // code, désignation, qté, reçu, coût, montant
    : [26, CW - 26 - 20 - 18 - 28 - 28, 20, 18, 28, 28];
  const headers = anyRecu
    ? [tr('Code', 'Code'), tr('Désignation', 'Designation'), tr('Cmd', 'Ord'), tr('Reçu', 'Rcvd'), tr('Coût u.', 'Unit'), tr('Montant', 'Amount')]
    : [tr('Code', 'Code'), tr('Désignation', 'Designation'), tr('Qté', 'Qty'), tr('Unité', 'Unit'), tr('Coût u.', 'Unit'), tr('Montant', 'Amount')];
  y = tableRow(doc, headers.map((h, i) => ({ text: h, w: cw[i], align: (i >= 2 ? 'right' : 'left') as any })), y, COL.primary, COL.white, true);

  (b.items || []).forEach((l, i) => {
    y = checkPage(doc, y);
    const amount = (Number(l.quantite) || 0) * (Number(l.cout_unitaire) || 0);
    const rec = lineReception(l);
    const recColor = rec === 'over' ? COL.red : rec === 'partial' ? COL.amber : rec === 'complete' ? COL.emerald : COL.gray;
    const cells = anyRecu
      ? [
          { text: l.code || '—', w: cw[0] },
          { text: l.designation || '—', w: cw[1] },
          { text: String(Number(l.quantite) || 0), w: cw[2], align: 'right' as const },
          { text: String(Number(l.recu) || 0), w: cw[3], align: 'right' as const, color: recColor },
          { text: $(Number(l.cout_unitaire) || 0), w: cw[4], align: 'right' as const },
          { text: $(amount), w: cw[5], align: 'right' as const },
        ]
      : [
          { text: l.code || '—', w: cw[0] },
          { text: l.designation || '—', w: cw[1] },
          { text: String(Number(l.quantite) || 0), w: cw[2], align: 'right' as const },
          { text: l.unite || '', w: cw[3], align: 'right' as const },
          { text: $(Number(l.cout_unitaire) || 0), w: cw[4], align: 'right' as const },
          { text: $(amount), w: cw[5], align: 'right' as const },
        ];
    y = tableRow(doc, cells, y, i % 2 === 0 ? COL.white : COL.light);
  });

  // ── Totaux ──────────────────────────────────────────────────────────────────
  y += 4; y = checkPage(doc, y, 30);
  const totW = 80, totX = PAGE_W - MR - totW;
  ([
    [tr('Sous-total', 'Subtotal'), $(totals.subtotal), false],
    [tr('Taxes', 'Taxes'), $(totals.taxes), false],
    [tr('TOTAL', 'TOTAL'), $(totals.total), true],
  ] as [string, string, boolean][]).forEach(([label, val, bold]) => {
    doc.setFillColor(...(bold ? COL.dark : COL.light)); doc.rect(totX, y, totW, 7, 'F');
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 9 : 8);
    doc.setTextColor(...(bold ? COL.white : COL.dark));
    doc.text(label, totX + 3, y + 4.7); doc.text(val, PAGE_W - MR - 2, y + 4.7, { align: 'right' });
    y += 7;
  });

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (b.notes) {
    y += 8; y = checkPage(doc, y, 24);
    doc.setDrawColor(...COL.light); doc.setLineWidth(0.3); doc.line(ML, y, PAGE_W - MR, y); y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...COL.gray); doc.text(tr('NOTES', 'NOTES'), ML, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...COL.dark);
    doc.text(doc.splitTextToSize(b.notes, CW) as string[], ML, y);
  }

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { doc.setPage(i); drawFooter(doc, i, totalPages); }
  doc.save(`bon-commande-${b.numero}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
