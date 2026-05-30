// Rapports fiscaux (Phase 5) — agregats pour les declarations canadiennes.
//  - Sommaire TPS/TVQ : taxe percue (2100/2110) vs CTI/RTI (1200/1210) -> net a remettre.
//  - Avantage automobile (TP-41.C / RC18) : droit d'usage + fonctionnement par vehicule employeur,
//    a reporter sur RL-1 case W et T4 code 34 (l'employe le recoit via son feuillet, pas le TP-41).
//  - Base T4 / RL-1 par employe : revenu d'emploi + commissions + avantage automobile.
// Sources des montants : grand livre (085) et feuilles de temps. Calculs ARC alignes sur lib/constants/arc.ts.
import { supabase } from '@/lib/supabase';
import { getCompanySettings } from '@/lib/invoicing';
import { ARC_2026 } from '@/lib/constants/arc';

const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const num = (n: number) => (Number(n) || 0).toFixed(2);

// ── 1. SOMMAIRE TPS/TVQ ──────────────────────────────────────────────────────
export type TaxSummary = {
  year: number;
  gstCollected: number; gstItc: number; gstNet: number;     // TPS/TVH percue, CTI, net a remettre
  qstCollected: number; qstItc: number; qstNet: number;     // TVQ percue, RTI, net a remettre
};
export async function getTaxSummary(tenant: string, year: number): Promise<TaxSummary> {
  const { data, error } = await supabase.from('gl_lines')
    .select('debit, credit, gl_accounts!inner(code), gl_entries!inner(posted, tenant_id, entry_date)')
    .eq('tenant_id', tenant);
  if (error) throw error;
  let gstCollected = 0, gstItc = 0, qstCollected = 0, qstItc = 0;
  for (const l of (data || []) as any[]) {
    const e = l.gl_entries;
    if (!e?.posted) continue;
    if (!String(e.entry_date || '').startsWith(String(year))) continue;
    const code = (l.gl_accounts as any)?.code;
    const d = Number(l.debit) || 0, c = Number(l.credit) || 0;
    if (code === '2100') gstCollected += c - d;          // passif : credit augmente
    else if (code === '2110') qstCollected += c - d;
    else if (code === '1200') gstItc += d - c;           // actif : debit augmente
    else if (code === '1210') qstItc += d - c;
  }
  return {
    year,
    gstCollected, gstItc, gstNet: gstCollected - gstItc,
    qstCollected, qstItc, qstNet: qstCollected - qstItc,
  };
}

// ── 2. AVANTAGE AUTOMOBILE (TP-41.C) ─────────────────────────────────────────
export type VehicleBenefit = {
  unit_number: string; employee_name: string; regime: string; isSales: boolean;
  prix: number; bail: number; moisDispo: number; kmPerso: number;
  standby: number; operating: number; total: number;       // total = case W / code 34
};
export async function getVehicleBenefits(tenant: string, year: number): Promise<VehicleBenefit[]> {
  const [vRes, tRes] = await Promise.all([
    supabase.from('vehicles').select('*').eq('tenant_id', tenant),
    supabase.from('timesheets').select('employee_name, total_km_personal, period_start, status').eq('tenant_id', tenant).in('status', ['approved', 'paid']),
  ]);
  // Km personnels par employe (annee), depuis les feuilles de temps
  const kmByName: Record<string, number> = {};
  for (const s of (tRes.data || [])) {
    if (new Date((s as any).period_start).getFullYear() !== year) continue;
    const name = (s as any).employee_name || '';
    kmByName[name] = (kmByName[name] || 0) + (Number((s as any).total_km_personal) || 0);
  }
  const out: VehicleBenefit[] = [];
  for (const v of (vRes.data || []) as any[]) {
    if (v.regime === 'B_personnel') continue;             // vehicule perso de l'employe -> allocation km, pas un avantage
    if (v.vehicle_class === 'specialise') continue;       // probablement non « automobile » (exempt)
    const prix = Number(v.purchase_price) || 0;
    const bail = Number(v.monthly_lease_cost) || 0;
    if (prix <= 0 && bail <= 0) continue;
    const moisDispo = 12;
    const kmPerso = kmByName[v.employee_name || ''] || 0;
    // Droit d'usage (standby) : bail = 2/3 x min(bail, plafond) x mois ; achat = 2 %/mois x prix
    const standby = bail > 0
      ? Math.round(ARC_2026.standby_lease_frac * Math.min(bail, ARC_2026.bail_cap) * moisDispo)
      : Math.round(ARC_2026.standby_monthly * prix * moisDispo);
    // Frais de fonctionnement : km perso x taux (vendeur d'autos a un taux reduit)
    const opRate = v.is_sales_employee ? ARC_2026.operating_sales : ARC_2026.operating_per_km;
    const operating = Math.round(kmPerso * opRate);
    if (standby + operating <= 0) continue;
    out.push({
      unit_number: v.unit_number || '', employee_name: v.employee_name || '', regime: v.regime || '',
      isSales: !!v.is_sales_employee, prix, bail, moisDispo, kmPerso,
      standby, operating, total: standby + operating,
    });
  }
  return out.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
}

// ── 3. BASE T4 / RL-1 PAR EMPLOYE ─────────────────────────────────────────────
export type EmployeeFiscal = {
  employee_name: string; employee_email: string;
  employmentIncome: number;   // revenu d'emploi verse (case 14 T4 / case A RL-1)
  commissions: number;        // commissions (case 42 T4 / case M RL-1)
  vehicleBenefit: number;     // avantage automobile (code 34 T4 / case W RL-1)
  federalDeductions: number;  // retenues fed cumulees (2200)
  quebecDeductions: number;   // retenues QC cumulees (2210)
  periods: number;
};
export async function getT4RL1Base(tenant: string, year: number): Promise<EmployeeFiscal[]> {
  const { data } = await supabase.from('timesheets').select('*').eq('tenant_id', tenant).in('status', ['approved', 'paid']);
  const benefits = await getVehicleBenefits(tenant, year);
  const byName: Record<string, EmployeeFiscal> = {};
  for (const s of (data || []) as any[]) {
    if (new Date(s.period_start).getFullYear() !== year) continue;
    const name = s.employee_name || s.employee_email || '';
    if (!byName[name]) byName[name] = { employee_name: s.employee_name || '', employee_email: s.employee_email || '', employmentIncome: 0, commissions: 0, vehicleBenefit: 0, federalDeductions: 0, quebecDeductions: 0, periods: 0 };
    byName[name].employmentIncome += Number(s.total_amount) || 0;
    byName[name].commissions += Number(s.total_commissions) || 0;
    byName[name].federalDeductions += Number(s.federal_deductions) || 0;
    byName[name].quebecDeductions += Number(s.quebec_deductions) || 0;
    byName[name].periods += 1;
  }
  for (const b of benefits) { if (byName[b.employee_name]) byName[b.employee_name].vehicleBenefit += b.total; }
  return Object.values(byName).sort((a, b) => a.employee_name.localeCompare(b.employee_name));
}

// ── EXPORTS (CSV Excel fr-CA + PDF) ──────────────────────────────────────────
function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const content = '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
async function pdfDoc(tenant: string, title: string, sub: string) {
  const company = await getCompanySettings(tenant);
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(20);
  doc.text(company?.legal_name || 'Rapport fiscal', 40, 44);
  doc.setFontSize(13); doc.setTextColor(60); doc.text(title, 40, 64);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(110);
  doc.text(sub, 40, 80);
  doc.text(`Genere le ${new Date().toISOString().slice(0, 10)}`, W - 40, 44, { align: 'right' });
  return { doc, autoTable, startY: 96 };
}

export function exportTaxSummaryCsv(s: TaxSummary): void {
  downloadCsv(`Sommaire-taxes-${s.year}.csv`, [
    ['Sommaire TPS/TVQ', String(s.year)],
    ['', 'Montant'],
    ['TPS/TVH percue (taxe a payer)', num(s.gstCollected)],
    ['TPS/TVH payee (CTI a recuperer)', num(s.gstItc)],
    ['TPS/TVH nette a remettre', num(s.gstNet)],
    ['TVQ percue (taxe a payer)', num(s.qstCollected)],
    ['TVQ payee (RTI a recuperer)', num(s.qstItc)],
    ['TVQ nette a remettre', num(s.qstNet)],
  ]);
}
export async function exportTaxSummaryPdf(tenant: string, s: TaxSummary): Promise<void> {
  const { doc, autoTable, startY } = await pdfDoc(tenant, 'Sommaire TPS/TVQ', `Annee ${s.year}`);
  autoTable(doc, {
    startY,
    head: [['', 'Montant']],
    body: [
      ['TPS/TVH percue (taxe a payer)', mny(s.gstCollected)],
      ['TPS/TVH payee (CTI a recuperer)', mny(s.gstItc)],
      ['TPS/TVH nette a remettre', mny(s.gstNet)],
      ['TVQ percue (taxe a payer)', mny(s.qstCollected)],
      ['TVQ payee (RTI a recuperer)', mny(s.qstItc)],
      ['TVQ nette a remettre', mny(s.qstNet)],
    ],
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });
  doc.save(`Sommaire-taxes-${s.year}.pdf`);
}

export function exportVehicleBenefitsCsv(rows: VehicleBenefit[], year: number): void {
  const out: (string | number)[][] = [['N° unite', 'Employe', 'Regime', 'Prix/Bail', 'Km perso', 'Droit usage', 'Fonctionnement', 'Avantage total (case W / code 34)']];
  rows.forEach(r => out.push([r.unit_number, r.employee_name, r.regime, num(r.bail > 0 ? r.bail : r.prix), r.kmPerso, num(r.standby), num(r.operating), num(r.total)]));
  out.push(['', '', '', '', '', '', 'TOTAL', num(rows.reduce((s, r) => s + r.total, 0))]);
  downloadCsv(`Avantage-automobile-${year}.csv`, out);
}
export async function exportVehicleBenefitsPdf(tenant: string, rows: VehicleBenefit[], year: number): Promise<void> {
  const { doc, autoTable, startY } = await pdfDoc(tenant, 'Avantage automobile (TP-41.C)', `Annee ${year} — a reporter sur RL-1 case W et T4 code 34`);
  autoTable(doc, {
    startY,
    head: [['Unite', 'Employe', 'Km perso', 'Droit usage', 'Fonctionnement', 'Avantage']],
    body: rows.map(r => [r.unit_number, r.employee_name, String(r.kmPerso), mny(r.standby), mny(r.operating), mny(r.total)]),
    foot: [['', '', '', '', 'TOTAL', mny(rows.reduce((s, r) => s + r.total, 0))]],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    footStyles: { fillColor: [243, 244, 246], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });
  doc.save(`Avantage-automobile-${year}.pdf`);
}

export function exportT4RL1Csv(rows: EmployeeFiscal[], year: number): void {
  const out: (string | number)[][] = [['Employe', 'Courriel', 'Revenu emploi (case 14/A)', 'Commissions (case 42/M)', 'Avantage auto (code 34/case W)', 'Retenues fed (2200)', 'Retenues QC (2210)', 'Periodes']];
  rows.forEach(r => out.push([r.employee_name, r.employee_email, num(r.employmentIncome), num(r.commissions), num(r.vehicleBenefit), num(r.federalDeductions), num(r.quebecDeductions), r.periods]));
  downloadCsv(`Base-T4-RL1-${year}.csv`, out);
}
export async function exportT4RL1Pdf(tenant: string, rows: EmployeeFiscal[], year: number): Promise<void> {
  const { doc, autoTable, startY } = await pdfDoc(tenant, 'Base T4 / RL-1 par employe', `Annee ${year} — transmission XML obligatoire des le 6e feuillet`);
  autoTable(doc, {
    startY,
    head: [['Employe', 'Revenu emploi', 'Commissions', 'Avantage auto', 'Ret. fed', 'Ret. QC']],
    body: rows.map(r => [r.employee_name, mny(r.employmentIncome), mny(r.commissions), mny(r.vehicleBenefit), mny(r.federalDeductions), mny(r.quebecDeductions)]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    margin: { left: 40, right: 40 },
  });
  doc.save(`Base-T4-RL1-${year}.pdf`);
}
