// Export PDF d'une feuille de temps — même apparence que les autres modules (logo tenant, en-tête,
// jspdf-autotable). Heures seulement (aucun montant de salaire : la paie est au module Paie) ; les
// dépenses (remboursements) figurent dans leur propre tableau. Importé dynamiquement (await import).
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF, loadImg, drawHeader, drawTitle, applyFooters } from '@/lib/pdf/letterhead';

type Tr = (fr: string, en: string) => string;

const money = (n: number) => `${(Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const h1 = (n: number) => (Number(n) || 0).toLocaleString('fr-CA', { maximumFractionDigits: 2 });

const fmtDate = (d?: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';

export interface TsEntry {
  date: string; category: string; project_number?: string; project_title?: string; recurring_task_name?: string;
  description?: string; hrs_regular?: number; hrs_overtime?: number; hrs_premium?: number; km?: number;
  allowances?: { name: string }[];
}
export interface TsExpense {
  date: string; category?: string; supplier?: string; description?: string; total?: number; reimbursable?: boolean; receipt_url?: string;
}

export async function exportTimesheetPdf(opts: {
  tr: Tr; logoUrl?: string;
  sheet: { employee_name?: string; period_start?: string; period_end?: string; status?: string };
  entries: TsEntry[]; expenses?: TsExpense[];
}) {
  const { tr, logoUrl, sheet } = opts;
  const entries = (opts.entries || []).filter(e =>
    Number(e.hrs_regular) || Number(e.hrs_overtime) || Number(e.hrs_premium) || Number(e.km) ||
    (e.allowances && e.allowances.length) || (e.description && e.description.trim()) || e.project_number || e.recurring_task_name,
  ).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const expenses = (opts.expenses || []).filter(x => Number(x.total) > 0 || (x.description && x.description.trim()) || x.receipt_url);

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = PDF.W; const M = PDF.M; // socle DGA (612, 42)
  const logo = await loadImg(logoUrl || '/c-secur360-logo.png');
  const period = (sheet.period_start && sheet.period_end)
    ? `${new Date(sheet.period_start + 'T00:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })} → ${new Date(sheet.period_end + 'T00:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : '';
  const STATUS_LBL: Record<string, string> = { draft: tr('En cours', 'In progress'), submitted: tr('Soumise', 'Submitted'), approved: tr('Validée', 'Approved'), verified: tr('Vérifiée', 'Verified'), paid: tr('Payée', 'Paid'), rejected: tr('Refusée', 'Rejected') };
  const rightLines = [`${tr('Période', 'Period')} : ${period}`, `${tr('Statut', 'Status')} : ${STATUS_LBL[sheet.status || ''] || sheet.status || '—'}`];

  // En-tête de page FIDÈLE DGA (logo ratio + méta + filet) — redessiné à chaque page par autoTable.
  const pageHeader = () => drawHeader(doc, { logo, rightLines });
  let y = pageHeader();
  y = drawTitle(doc, y, tr('Feuille de temps', 'Timesheet'), sheet.employee_name || '—');

  const label = (e: TsEntry) => e.category === 'project'
    ? [e.project_number, e.project_title].filter(Boolean).join(' — ') || tr('Projet', 'Project')
    : e.category === 'task' ? (e.recurring_task_name || tr('Tâche', 'Task')) : (e.recurring_task_name || e.category || '—');

  // ── Tableau des heures (par jour) ──
  let tReg = 0, tSup = 0, tMaj = 0, tKm = 0;
  const rows = entries.map(e => {
    const reg = Number(e.hrs_regular) || 0, sup = Number(e.hrs_overtime) || 0, maj = Number(e.hrs_premium) || 0, km = Number(e.km) || 0;
    tReg += reg; tSup += sup; tMaj += maj; tKm += km;
    const allow = (e.allowances || []).map(a => a.name).join(', ');
    return [fmtDate(e.date), label(e), [e.description, allow ? `(${allow})` : ''].filter(Boolean).join(' '), reg || '', sup || '', maj || '', km || ''];
  });
  autoTable(doc, {
    startY: y, head: [[tr('Date', 'Date'), tr('Projet / Tâche', 'Project / Task'), tr('Description', 'Description'), tr('Rég.', 'Reg.'), tr('Supp.', 'OT'), tr('Maj.', 'Prem.'), 'Km']],
    body: rows.length ? rows : [['—', '—', tr('Aucune heure saisie', 'No hours entered'), '', '', '', '']],
    foot: [[tr('Totaux', 'Totals'), '', '', h1(tReg), h1(tSup), h1(tMaj), h1(tKm)]],
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: [60, 60, 60], textColor: 255 },        // gris DGA
    footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
    margin: { left: M, right: M, top: 56 },
    didDrawPage: (data: any) => { if (data.pageNumber > 1) pageHeader(); },
  });
  y = (doc as any).lastAutoTable?.finalY ?? y;

  // Résumé heures
  const totH = tReg + tSup + tMaj;
  doc.setFontSize(10); doc.setTextColor(30); doc.setFont('helvetica', 'bold');
  doc.text(`${tr('Total des heures', 'Total hours')} : ${h1(totH)} h   ·   ${tr('Km', 'Km')} : ${h1(tKm)}`, M, y + 20);
  doc.setFont('helvetica', 'normal');
  y += 34;

  // ── Tableau des dépenses (remboursements) ──
  if (expenses.length) {
    let tExp = 0;
    const exRows = expenses.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map(x => {
      const t = Number(x.total) || 0; tExp += t;
      return [fmtDate(x.date), x.category || '—', x.supplier || '—', x.description || '—', x.reimbursable !== false ? tr('Oui', 'Yes') : tr('Non', 'No'), x.receipt_url ? '✓' : '—', money(t)];
    });
    autoTable(doc, {
      startY: y, head: [[tr('Date', 'Date'), tr('Catégorie', 'Category'), tr('Fournisseur', 'Supplier'), tr('Description', 'Description'), tr('Refact.', 'Billable'), tr('Reçu', 'Receipt'), tr('Total', 'Total')]],
      body: exRows,
      foot: [[tr('Total dépenses', 'Total expenses'), '', '', '', '', '', money(tExp)]],
      styles: { fontSize: 8.5, cellPadding: 4 },
      headStyles: { fillColor: [90, 90, 90], textColor: 255 },       // gris (dépenses)
      footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: 'bold' },
      columnStyles: { 6: { halign: 'right' } },
      margin: { left: M, right: M, top: 56 },
      didDrawPage: (data: any) => { if (data.pageNumber > 1) pageHeader(); },
    });
    y = (doc as any).lastAutoTable?.finalY ?? y;
  }

  // ── Bloc signatures (employé + approbation client) — à faire signer ──
  const Hp0 = doc.internal.pageSize.getHeight();
  y += 30;
  if (y > Hp0 - 110) { doc.addPage(); y = 60; }
  const colW = (W - 2 * M - 30) / 2;
  const sigCol = (x: number, titre: string, nom: string) => {
    if (nom) { doc.setFontSize(9.5); doc.setTextColor(60); doc.text(nom, x, y + 12); }
    doc.setDrawColor(150); doc.setLineWidth(0.6); doc.line(x, y + 28, x + colW, y + 28);
    doc.setFontSize(8.5); doc.setTextColor(120); doc.text(titre, x, y + 40);
    doc.text(tr('Date :', 'Date:'), x, y + 58); doc.line(x + 36, y + 56, x + colW, y + 56);
  };
  doc.setFont('helvetica', 'normal');
  sigCol(M, tr("Signature de l'employé", 'Employee signature'), sheet.employee_name || '');
  sigCol(M + colW + 30, tr('Signature du client (approbation)', 'Client signature (approval)'), '');
  y += 70;

  // ── Pied de page numéroté (socle partagé DGA) ──
  applyFooters(doc, tr('Heures seulement — les montants de paie figurent au module Paie.', 'Hours only — pay amounts are in the Payroll module.'));

  const safeName = (sheet.employee_name || 'employe').replace(/\s+/g, '_').slice(0, 30);
  doc.save(`feuille-de-temps-${safeName}-${sheet.period_start || ''}.pdf`);
}
