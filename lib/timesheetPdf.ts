// Export PDF d'une feuille de temps — même apparence que les autres modules (logo tenant, en-tête,
// jspdf-autotable). Heures seulement (aucun montant de salaire : la paie est au module Paie) ; les
// dépenses (remboursements) figurent dans leur propre tableau. Importé dynamiquement (await import).
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Tr = (fr: string, en: string) => string;
type Logo = { data: string; w: number; h: number };

const money = (n: number) => `${(Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const h1 = (n: number) => (Number(n) || 0).toLocaleString('fr-CA', { maximumFractionDigits: 2 });

async function loadImageData(url: string): Promise<Logo | null> {
  try {
    const res = await fetch(url); if (!res.ok) return null;
    const blob = await res.blob();
    const data: string = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(blob); });
    const dims = await new Promise<{ w: number; h: number }>(resolve => { const img = new Image(); img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight }); img.onerror = () => resolve({ w: 0, h: 0 }); img.src = data; });
    return dims.w ? { data, w: dims.w, h: dims.h } : null;
  } catch { return null; }
}
async function drawLogo(doc: jsPDF, logoUrl: string | undefined, x: number, topY: number): Promise<number> {
  let logo = logoUrl ? await loadImageData(logoUrl) : null;
  if (!logo) logo = await loadImageData('/c-secur360-logo.png');
  if (!logo) return x;
  const h = 36; const w = Math.min((logo.w / logo.h) * h, 150);
  const fmt = logo.data.includes('image/png') ? 'PNG' : 'JPEG';
  try { doc.addImage(logo.data, fmt, x, topY, w, h); } catch { return x; }
  return x + w + 14;
}

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
  const W = doc.internal.pageSize.getWidth(); const M = 40;
  let y = 48;

  const tx = await drawLogo(doc, logoUrl, M, y - 16);
  doc.setFontSize(16); doc.setTextColor(30);
  doc.text(tr('Feuille de temps', 'Timesheet'), tx, y);
  doc.setFontSize(13); doc.setTextColor(124, 58, 237);
  doc.text(sheet.employee_name || '—', tx, y + 18);
  doc.setFontSize(9); doc.setTextColor(120);
  const period = (sheet.period_start && sheet.period_end)
    ? `${new Date(sheet.period_start + 'T00:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })} → ${new Date(sheet.period_end + 'T00:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : '';
  doc.text(`${tr('Période', 'Period')} : ${period}`, tx, y + 32);
  const STATUS_LBL: Record<string, string> = { draft: tr('En cours', 'In progress'), submitted: tr('Soumise', 'Submitted'), approved: tr('Validée', 'Approved'), verified: tr('Vérifiée', 'Verified'), paid: tr('Payée', 'Paid'), rejected: tr('Refusée', 'Rejected') };
  doc.text(`${tr('Statut', 'Status')} : ${STATUS_LBL[sheet.status || ''] || sheet.status || '—'}    ${tr('Généré le', 'Generated')} ${new Date().toLocaleDateString('fr-CA')}`, tx, y + 44);
  y += 64;

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
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    footStyles: { fillColor: [243, 240, 255], textColor: 30, fontStyle: 'bold' },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
    margin: { left: M, right: M },
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
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      footStyles: { fillColor: [236, 253, 245], textColor: 30, fontStyle: 'bold' },
      columnStyles: { 6: { halign: 'right' } },
      margin: { left: M, right: M },
    });
    y = (doc as any).lastAutoTable?.finalY ?? y;
  }

  // ── Pied de page ──
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    const Hp = doc.internal.pageSize.getHeight();
    doc.setFontSize(7.5); doc.setTextColor(150);
    doc.text(tr('Heures seulement — les montants de paie figurent au module Paie.', 'Hours only — pay amounts are in the Payroll module.'), M, Hp - 22);
    doc.text(`C-Secur360   ·   ${p} / ${total}`, W - M, Hp - 14, { align: 'right' });
  }

  const safeName = (sheet.employee_name || 'employe').replace(/\s+/g, '_').slice(0, 30);
  doc.save(`feuille-de-temps-${safeName}-${sheet.period_start || ''}.pdf`);
}
