// Paie réelle (#43) — CALCUL des retenues à la source + cotisations employeur (aperçu, sans persistance).
// Gating = canHr (donnée salaire sensible, service_role). Charge les réglages de paie du tenant + le profil
// fiscal de chaque employé, exécute le moteur lib/payrollTax, renvoie les lignes calculées + totaux.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computePayroll, paramsForYear, PERIODS_PER_YEAR, type PayFrequency, type PayrollYearParams } from '@/lib/payrollTax';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Item = { personnel_id: string; name?: string; gross: number; allowances?: number; reimbursable?: number };

const r2 = (v: number) => Math.round((Number(v) || 0) * 100) / 100;

/** Construit les PARAMÈTRES effectifs du tenant : params de l'année + taux employeur + surcharge JSON. */
function effectiveParams(settings: any, year: number): PayrollYearParams {
  const base = paramsForYear(year);
  const employer = {
    fssRate: settings?.fss_rate != null ? Number(settings.fss_rate) : base.employer.fssRate,
    cnesstRate: settings?.cnesst_rate != null ? Number(settings.cnesst_rate) : base.employer.cnesstRate,
    wsdrfRate: settings?.wsdrf_rate != null ? Number(settings.wsdrf_rate) : base.employer.wsdrfRate,
    wsdrfThreshold: settings?.wsdrf_threshold != null ? Number(settings.wsdrf_threshold) : base.employer.wsdrfThreshold,
  };
  const ov = settings?.params_override && typeof settings.params_override === 'object' ? settings.params_override : null;
  return { ...base, ...(ov || {}), employer } as PayrollYearParams;
}

// POST { tenant, items:[{personnel_id,name,gross,allowances?,reimbursable?}], frequency?, year? }
//   -> { ok, frequency, year, lines:[...], totals:{...} }
export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const items: Item[] = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: 'Aucun employé à calculer.' }, { status: 400 });

  // Réglages de paie du tenant (best-effort : si migration 223 absente, on utilise les défauts).
  let settings: any = null;
  try {
    const { data } = await supabaseAdmin.from('payroll_settings').select('*').eq('tenant_id', tenant).maybeSingle();
    settings = data;
  } catch { /* table absente -> défauts */ }

  const frequency: PayFrequency = (body.frequency || settings?.pay_frequency || 'biweekly') as PayFrequency;
  const year = Number(body.year || settings?.tax_year || 2026);
  const params = effectiveParams(settings, year);

  // Profils fiscaux des employés.
  const pids = [...new Set(items.map(i => String(i.personnel_id)).filter(Boolean))];
  let profMap = new Map<string, any>();
  try {
    const { data } = await supabaseAdmin.from('employee_profiles')
      .select('employee_id, claim_federal, claim_quebec, extra_tax_per_period, deductions_annual, exempt_cpp, exempt_ei, pay_frequency')
      .eq('tenant_id', tenant).in('employee_id', pids.length ? pids : ['__none__']);
    profMap = new Map((data || []).map((p: any) => [String(p.employee_id), p]));
  } catch { /* colonnes absentes -> défauts moteur */ }

  const lines = items.map(it => {
    const prof = profMap.get(String(it.personnel_id)) || {};
    const freq: PayFrequency = (prof.pay_frequency || frequency) as PayFrequency;
    const res = computePayroll({
      periodGross: Number(it.gross) || 0,
      frequency: freq, params,
      claimFederal: prof.claim_federal != null ? Number(prof.claim_federal) : undefined,
      claimQuebec: prof.claim_quebec != null ? Number(prof.claim_quebec) : undefined,
      deductionsAnnual: prof.deductions_annual != null ? Number(prof.deductions_annual) : undefined,
      extraTaxPerPeriod: prof.extra_tax_per_period != null ? Number(prof.extra_tax_per_period) : undefined,
      exemptCpp: !!prof.exempt_cpp, exemptEi: !!prof.exempt_ei,
    });
    const allowances = r2(it.allowances || 0), reimbursable = r2(it.reimbursable || 0);
    return {
      personnel_id: String(it.personnel_id), employee_name: it.name || '—',
      frequency: freq, gross: res.gross, allowances, reimbursable,
      qpp: res.qpp, ei: res.ei, qpip: res.qpip, federal_tax: res.federalTax, quebec_tax: res.quebecTax, extra_tax: res.extraTax,
      total_deductions: res.totalDeductions, net_pay: res.netPay,
      total_to_pay: r2(res.netPay + allowances + reimbursable),
      er_qpp: res.employer.qpp, er_ei: res.employer.ei, er_qpip: res.employer.qpip,
      er_fss: res.employer.fss, er_cnesst: res.employer.cnesst, er_wsdrf: res.employer.wsdrf, er_total: res.employer.total,
      detail: res,
    };
  });

  const sum = (k: string) => r2(lines.reduce((a, l: any) => a + (Number(l[k]) || 0), 0));
  const totals = {
    count: lines.length,
    gross: sum('gross'), allowances: sum('allowances'), reimbursable: sum('reimbursable'),
    qpp: sum('qpp'), ei: sum('ei'), qpip: sum('qpip'), federal_tax: sum('federal_tax'), quebec_tax: sum('quebec_tax'),
    total_deductions: sum('total_deductions'), net_pay: sum('net_pay'), total_to_pay: sum('total_to_pay'),
    er_total: sum('er_total'), employer_cost: r2(sum('gross') + sum('er_total')),
  };

  return NextResponse.json({ ok: true, frequency, year, periodsPerYear: PERIODS_PER_YEAR[frequency], lines, totals });
}
