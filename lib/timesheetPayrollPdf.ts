// Registre de paie PRO (#43) — document « banque » de l'admin paie. Style DGA/letterhead (logo tenant,
// en-tête + filet, pied numéroté). Un tableau = une ligne par employé, colonnes FIXES (0,00 $ si rien) :
// heures, rémunération brute, avantages, retenues fédéral/Québec, déduction véhicule, salaire net,
// dépenses remboursables, TOTAL À VERSER. Ligne de totaux. Export en lot (semaine) ou individuel.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF, loadImg, drawHeader, drawTitle, applyFooters } from '@/lib/pdf/letterhead';
import type { PayrollRow } from '@/lib/payroll';

type Tr = (fr: string, en: string) => string;
const money = (n: number) => `${(Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const h1 = (n: number) => (Number(n) || 0).toLocaleString('fr-CA', { maximumFractionDigits: 2 });

export async function exportPayrollRegisterPdf(opts: {
  tr: Tr; logoUrl?: string; tenantName?: string; periodLabel?: string; rows: PayrollRow[];
  accent?: [number, number, number]; style?: { accent: [number, number, number]; ruleWidth: number; titleSize: number; subtitleSize: number; showRule: boolean };
}) {
  const { tr, rows } = opts;
  const st = opts.style;
  const accent = st?.accent || opts.accent;
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' });
  const W = doc.internal.pageSize.getWidth(); const M = PDF.M;
  const logo = await loadImg(opts.logoUrl || '/c-secur360-logo.png');

  const rightLines = [
    opts.tenantName || 'Registre de paie',
    `${tr('Période', 'Period')} : ${opts.periodLabel || '—'}`,
    `${tr('Généré le', 'Generated')} : ${new Date().toLocaleDateString('fr-CA')}`,
  ];
  const pageHeader = () => drawHeader(doc, { logo, rightLines, accent, ruleWidth: st?.ruleWidth, showRule: st?.showRule });
  let y = pageHeader();
  y = drawTitle(doc, y, tr('Registre de paie', 'Payroll register'), `${rows.length} ${tr('employé(s)', 'employee(s)')} · ${opts.periodLabel || ''}`, accent, st?.titleSize, st?.subtitleSize);

  const sum = (k: keyof PayrollRow) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const head = [[
    tr('Employé', 'Employee'), tr('Rég.', 'Reg.'), tr('Supp.', 'OT'), tr('Maj.', 'DT'), tr('Taux', 'Rate'),
    tr('Rémunération', 'Gross'), tr('Avantages', 'Benefits'), tr('Ret. féd.', 'Fed.'), tr('Ret. QC', 'QC'),
    tr('Déd. véh.', 'Veh.'), tr('Net', 'Net'), tr('Dépenses', 'Expenses'), tr('À VERSER', 'TO PAY'),
  ]];
  const body = rows.map(r => [
    r.employeeName, h1(r.hrsReg), h1(r.hrsOt), h1(r.hrsDt), money(r.rate),
    money(r.gross), money(r.allowances), money(r.fedDed), money(r.qcDed),
    money(r.vehDed), money(r.net), money(r.reimbursable), money(r.totalToPay),
  ]);
  const foot = [[
    tr('TOTAUX', 'TOTALS'), h1(sum('hrsReg')), h1(sum('hrsOt')), h1(sum('hrsDt')), '',
    money(sum('gross')), money(sum('allowances')), money(sum('fedDed')), money(sum('qcDed')),
    money(sum('vehDed')), money(sum('net')), money(sum('reimbursable')), money(sum('totalToPay')),
  ]];

  autoTable(doc, {
    startY: y, head, body, foot, theme: 'grid',
    margin: { left: M, right: M, top: 60 },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, lineColor: PDF.colors.line, lineWidth: 0.4, textColor: PDF.colors.gray },
    headStyles: { fillColor: [245, 245, 245], textColor: PDF.colors.ink, fontStyle: 'bold', halign: 'right' },
    footStyles: { fillColor: [235, 235, 235], textColor: PDF.colors.ink, fontStyle: 'bold', halign: 'right' },
    columnStyles: { 0: { halign: 'left', cellWidth: 120 } },
    bodyStyles: { halign: 'right' },
    didParseCell: (d: any) => { if (d.column.index === 0) d.cell.styles.halign = 'left'; },
    didDrawPage: () => { pageHeader(); },
  });

  const total = sum('totalToPay');
  let yy = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 24 : y + 24;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...PDF.colors.ink);
  doc.text(`${tr('TOTAL DES DÉPÔTS', 'TOTAL DEPOSITS')} : ${money(total)}`, W - M, yy, { align: 'right' });
  yy += 26;
  // Bloc signature (approbation paie — interne).
  doc.setDrawColor(...PDF.colors.line); doc.setLineWidth(0.6);
  doc.line(M, yy + 24, M + 220, yy + 24);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...PDF.colors.grayMid);
  doc.text(tr('Approuvé par (administrateur paie)', 'Approved by (payroll admin)'), M, yy + 36);
  doc.text(tr('Date :', 'Date:'), M + 260, yy + 36);
  doc.setDrawColor(...PDF.colors.line); doc.line(M + 290, yy + 24, M + 440, yy + 24);

  applyFooters(doc, tr('Registre de paie — document interne confidentiel. Montants nets + remboursements de dépenses pour dépôt direct.', 'Payroll register — confidential internal document. Net amounts + expense reimbursements for direct deposit.'));
  const fileName = `registre_paie_${(opts.periodLabel || '').replace(/[^0-9A-Za-z]+/g, '_') || 'periode'}.pdf`;
  doc.save(fileName);
}
