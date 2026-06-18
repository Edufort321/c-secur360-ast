// Registre de paie (#43) — agrège, pour des feuilles de temps données, la rémunération (heures × taux),
// les avantages, les retenues à la source (fédéral/Québec), la déduction véhicule, le NET à verser, et
// les DÉPENSES remboursables. Sert à l'export CSV/PDF « banque » de l'admin paie. Colonnes toujours
// présentes (0,00 $ si rien) pour un registre fixe et professionnel.
import { supabase } from '@/lib/supabase';

export type PayrollRow = {
  id: string; employeeId: string; employeeName: string; employeeEmail: string;
  periodStart: string; periodEnd: string; status: string; week: number;
  hrsReg: number; hrsOt: number; hrsDt: number; rate: number;
  gross: number;          // rémunération brute (heures × taux + multiplicateurs)
  allowances: number;     // avantages/primes
  fedDed: number; qcDed: number; vehDed: number;
  net: number;            // salaire net à verser (timesheets.total_amount)
  reimbursable: number;   // dépenses remboursables (timesheet_expenses.total où reimbursable)
  totalToPay: number;     // net + remboursements = montant du dépôt
};

const n = (v: any) => Number(v) || 0;
const r2 = (v: number) => Math.round(v * 100) / 100;

export function isoWeekNum(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

/** Construit les lignes de paie pour des feuilles, en chargeant les profils (taux) + dépenses remboursables. */
export async function buildPayrollRows(tenant: string, sheets: any[]): Promise<PayrollRow[]> {
  if (!sheets.length) return [];
  const empIds = [...new Set(sheets.map(s => s.employee_id).filter(Boolean))];
  const sheetIds = sheets.map(s => s.id);
  const [profRes, expRes] = await Promise.all([
    supabase.from('employee_profiles').select('employee_id, hourly_rate, ot_multiplier, dt_multiplier').eq('tenant_id', tenant).in('employee_id', empIds.length ? empIds : ['__none__']),
    supabase.from('timesheet_expenses').select('timesheet_id, total, reimbursable').in('timesheet_id', sheetIds.length ? sheetIds : ['__none__']),
  ]);
  const profMap: Record<string, any> = Object.fromEntries(((profRes.data as any[]) || []).map(p => [p.employee_id, p]));
  const reimbMap: Record<string, number> = {};
  for (const e of ((expRes.data as any[]) || [])) {
    if (e.reimbursable === false) continue;
    reimbMap[String(e.timesheet_id)] = (reimbMap[String(e.timesheet_id)] || 0) + n(e.total);
  }
  return sheets.map(s => {
    const prof = profMap[s.employee_id] || {};
    const rate = n(prof.hourly_rate);
    const ot = n(prof.ot_multiplier) || 1.5;
    const dt = n(prof.dt_multiplier) || 2;
    const hrsReg = n(s.total_regular), hrsOt = n(s.total_overtime), hrsDt = n(s.total_premium);
    const gross = r2(hrsReg * rate + hrsOt * rate * ot + hrsDt * rate * dt);
    const allowances = r2(n(s.total_allowances) + n(s.total_bonuses));
    const reimbursable = r2(reimbMap[String(s.id)] || 0);
    const net = r2(n(s.total_amount));
    return {
      id: String(s.id), employeeId: String(s.employee_id || ''), employeeName: s.employee_name || '—', employeeEmail: s.employee_email || '',
      periodStart: s.period_start, periodEnd: s.period_end, status: s.status, week: isoWeekNum(s.period_start),
      hrsReg, hrsOt, hrsDt, rate, gross, allowances,
      fedDed: r2(n(s.federal_deductions)), qcDed: r2(n(s.quebec_deductions)), vehDed: r2(n(s.vehicle_deduction)),
      net, reimbursable, totalToPay: r2(net + reimbursable),
    };
  });
}

const CSV_HEADERS = [
  'Employé', 'Courriel', 'Période', 'Début', 'Fin', 'Statut',
  'Hrs régulières', 'Hrs supplémentaires', 'Hrs majorées', 'Taux $/h',
  'Rémunération brute', 'Avantages', 'Retenues fédéral', 'Retenues Québec', 'Déduction véhicule',
  'Salaire net', 'Dépenses remboursables', 'TOTAL À VERSER',
];

/** CSV organisé (registre de paie). Colonnes fixes, montants à 2 décimales, BOM UTF-8 pour Excel. */
export function buildPayrollCsv(rows: PayrollRow[]): string {
  const esc = (v: any) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const f2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2);
  const lines = [CSV_HEADERS.join(',')];
  for (const r of rows) {
    lines.push([
      esc(r.employeeName), esc(r.employeeEmail), `P.${r.week}`, r.periodStart, r.periodEnd, r.status,
      f2(r.hrsReg), f2(r.hrsOt), f2(r.hrsDt), f2(r.rate),
      f2(r.gross), f2(r.allowances), f2(r.fedDed), f2(r.qcDed), f2(r.vehDed),
      f2(r.net), f2(r.reimbursable), f2(r.totalToPay),
    ].join(','));
  }
  // Ligne de totaux
  const sum = (k: keyof PayrollRow) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  lines.push([
    'TOTAUX', '', '', '', '', '',
    f2(sum('hrsReg')), f2(sum('hrsOt')), f2(sum('hrsDt')), '',
    f2(sum('gross')), f2(sum('allowances')), f2(sum('fedDed')), f2(sum('qcDed')), f2(sum('vehDed')),
    f2(sum('net')), f2(sum('reimbursable')), f2(sum('totalToPay')),
  ].join(','));
  return '﻿' + lines.join('\r\n');
}

export function downloadCsv(filename: string, csv: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
