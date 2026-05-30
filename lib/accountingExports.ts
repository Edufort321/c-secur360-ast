// Exports comptables — CSV (Excel fr-CA) et PDF (jsPDF + autotable).
// Balance de verification, grand livre, etats financiers (resultats + bilan).
// Les donnees sont fournies par l'onglet Comptabilite (deja chargees) pour eviter un re-fetch.
import { getCompanySettings } from '@/lib/invoicing';
import type { GLAccount } from '@/lib/accounting';

export type Balances = Record<string, { debit: number; credit: number }>;

const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const num = (n: number) => (Number(n) || 0).toFixed(2);

// ── CSV (separateur ';' + BOM pour Excel francophone) ────────────────────────
function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const content = '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');
  triggerDownload(filename, new Blob([content], { type: 'text/csv;charset=utf-8;' }));
}
function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Calcul des soldes nets par type (meme logique que l'onglet) ──────────────
function netByType(accounts: GLAccount[], bal: Balances, type: string) {
  return accounts.filter(a => a.type === type).map(a => {
    const b = bal[a.id] || { debit: 0, credit: 0 };
    const amt = (type === 'asset' || type === 'expense') ? b.debit - b.credit : b.credit - b.debit;
    return { a, amt };
  }).filter(r => Math.abs(r.amt) > 0.005);
}
const sum = (rows: { amt: number }[]) => rows.reduce((s, r) => s + r.amt, 0);

function trialRows(accounts: GLAccount[], bal: Balances) {
  return accounts
    .map(a => ({ a, d: bal[a.id]?.debit || 0, c: bal[a.id]?.credit || 0 }))
    .filter(r => r.d !== 0 || r.c !== 0)
    .map(r => { const net = r.d - r.c; return { a: r.a, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 }; });
}

// ── En-tete PDF reutilisable (titre + raison sociale + date) ──────────────────
async function pdfHeader(tenant: string, doc: any, title: string): Promise<number> {
  const company = await getCompanySettings(tenant);
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(20);
  doc.text(company?.legal_name || 'Etats comptables', M, 44);
  doc.setFontSize(13); doc.setTextColor(60);
  doc.text(title, M, 64);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(110);
  doc.text(`Genere le ${new Date().toISOString().slice(0, 10)}`, W - M, 44, { align: 'right' });
  return 84;
}

// ── BALANCE DE VERIFICATION ──────────────────────────────────────────────────
export function exportTrialBalanceCsv(accounts: GLAccount[], bal: Balances): void {
  const rows = trialRows(accounts, bal);
  const out: (string | number)[][] = [['Code', 'Compte', 'Debit', 'Credit']];
  rows.forEach(r => out.push([r.a.code, r.a.name, num(r.debit), num(r.credit)]));
  out.push(['', 'TOTAL', num(sum(rows.map(r => ({ amt: r.debit })))), num(sum(rows.map(r => ({ amt: r.credit }))))]);
  downloadCsv('Balance-verification.csv', out);
}
export async function exportTrialBalancePdf(tenant: string, accounts: GLAccount[], bal: Balances): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const y = await pdfHeader(tenant, doc, 'Balance de verification');
  const rows = trialRows(accounts, bal);
  const totD = rows.reduce((s, r) => s + r.debit, 0), totC = rows.reduce((s, r) => s + r.credit, 0);
  autoTable(doc, {
    startY: y,
    head: [['Code', 'Compte', 'Debit', 'Credit']],
    body: rows.map(r => [r.a.code, r.a.name, mny(r.debit), mny(r.credit)]),
    foot: [['', 'TOTAL', mny(totD), mny(totC)]],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    footStyles: { fillColor: [243, 244, 246], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });
  doc.save('Balance-verification.pdf');
}

// ── GRAND LIVRE ───────────────────────────────────────────────────────────────
export function exportLedgerCsv(ledger: any[]): void {
  const out: (string | number)[][] = [['Date', 'N°', 'Description', 'Reference', 'Code', 'Compte', 'Debit', 'Credit']];
  for (const e of ledger) {
    for (const l of (e.gl_lines || [])) {
      out.push([e.entry_date, e.entry_number || '', e.description || '', e.reference || '', l.gl_accounts?.code || '', l.gl_accounts?.name || '', num(l.debit), num(l.credit)]);
    }
  }
  downloadCsv('Grand-livre.csv', out);
}
export async function exportLedgerPdf(tenant: string, ledger: any[]): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const y = await pdfHeader(tenant, doc, 'Grand livre');
  const body: any[] = [];
  for (const e of ledger) {
    (e.gl_lines || []).forEach((l: any, i: number) => {
      body.push([
        i === 0 ? e.entry_date : '', i === 0 ? (e.description || '') : '',
        l.gl_accounts ? `${l.gl_accounts.code} ${l.gl_accounts.name}` : '',
        Number(l.debit) > 0 ? mny(l.debit) : '', Number(l.credit) > 0 ? mny(l.credit) : '',
      ]);
    });
  }
  autoTable(doc, {
    startY: y,
    head: [['Date', 'Description', 'Compte', 'Debit', 'Credit']],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });
  doc.save('Grand-livre.pdf');
}

// ── ETATS FINANCIERS (resultats + bilan) ─────────────────────────────────────
export function exportStatementsCsv(accounts: GLAccount[], bal: Balances): void {
  const rev = netByType(accounts, bal, 'revenue'), exp = netByType(accounts, bal, 'expense');
  const asset = netByType(accounts, bal, 'asset'), liab = netByType(accounts, bal, 'liability'), eq = netByType(accounts, bal, 'equity');
  const net = sum(rev) - sum(exp);
  const out: (string | number)[][] = [['Etat des resultats', '', '']];
  out.push(['Code', 'Compte', 'Montant']);
  out.push(['', 'PRODUITS', '']); rev.forEach(r => out.push([r.a.code, r.a.name, num(r.amt)]));
  out.push(['', 'Total des produits', num(sum(rev))]);
  out.push(['', 'CHARGES', '']); exp.forEach(r => out.push([r.a.code, r.a.name, num(r.amt)]));
  out.push(['', 'Total des charges', num(sum(exp))]);
  out.push(['', 'Resultat net', num(net)]);
  out.push(['', '', '']);
  out.push(['Bilan', '', '']);
  out.push(['', 'ACTIF', '']); asset.forEach(r => out.push([r.a.code, r.a.name, num(r.amt)]));
  out.push(['', "Total de l'actif", num(sum(asset))]);
  out.push(['', 'PASSIF', '']); liab.forEach(r => out.push([r.a.code, r.a.name, num(r.amt)]));
  out.push(['', 'Total du passif', num(sum(liab))]);
  out.push(['', 'CAPITAUX PROPRES', '']); eq.forEach(r => out.push([r.a.code, r.a.name, num(r.amt)]));
  out.push(['', 'Total des capitaux', num(sum(eq))]);
  out.push(['', 'Passif + Capitaux + Resultat net', num(sum(liab) + sum(eq) + net)]);
  downloadCsv('Etats-financiers.csv', out);
}
export async function exportStatementsPdf(tenant: string, accounts: GLAccount[], bal: Balances): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  let y = await pdfHeader(tenant, doc, 'Etats financiers');
  const rev = netByType(accounts, bal, 'revenue'), exp = netByType(accounts, bal, 'expense');
  const asset = netByType(accounts, bal, 'asset'), liab = netByType(accounts, bal, 'liability'), eq = netByType(accounts, bal, 'equity');
  const net = sum(rev) - sum(exp);
  const section = (title: string, rows: { a: GLAccount; amt: number }[], totalLabel: string, total: number) => {
    autoTable(doc, {
      startY: y,
      head: [[title, '']],
      body: rows.length ? rows.map(r => [`${r.a.code}  ${r.a.name}`, mny(r.amt)]) : [['—', '']],
      foot: [[totalLabel, mny(total)]],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [55, 65, 81], textColor: 255 },
      footStyles: { fillColor: [243, 244, 246], textColor: 20, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 40, right: 40 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  };
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(40); doc.text('Etat des resultats', 40, y); y += 8;
  section('Produits', rev, 'Total des produits', sum(rev));
  section('Charges', exp, 'Total des charges', sum(exp));
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(net >= 0 ? 16 : 200, net >= 0 ? 122 : 30, 60);
  doc.text(`Resultat net : ${mny(net)}`, 40, y + 4); y += 22;
  doc.setTextColor(40); doc.setFontSize(12); doc.text('Bilan', 40, y); y += 8;
  section('Actif', asset, "Total de l'actif", sum(asset));
  section('Passif', liab, 'Total du passif', sum(liab));
  section('Capitaux propres', eq, 'Total des capitaux', sum(eq));
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(40);
  doc.text(`Passif + Capitaux + Resultat net : ${mny(sum(liab) + sum(eq) + net)}`, 40, y + 4);
  doc.save('Etats-financiers.pdf');
}
