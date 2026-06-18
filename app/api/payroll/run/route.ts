// Paie réelle (#43) — PERSISTANCE d'un run de paie + écriture comptable optionnelle. Gating = canHr.
// Reçoit les lignes calculées (cf. /api/payroll/calculate), enregistre payroll_runs + payroll_lines,
// et (si postGl) passe UNE écriture de paie ÉQUILIBRÉE au grand livre :
//   DR 5000 Salaires            = brut + cotisations employeur (charge totale)
//   CR 2300 Net à payer         = net versé aux employés
//   CR 2200 Retenues fédéral    = impôt fédéral + AE (employé+employeur) + impôt additionnel
//   CR 2210 Retenues Québec     = impôt QC + RRQ + RQAP (employé+employeur) + FSS + CNESST + 1 %
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAccounts, createEntry } from '@/lib/accounting';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const r2 = (v: number) => Math.round((Number(v) || 0) * 100) / 100;
const num = (v: any) => Number(v) || 0;

// POST { tenant, run:{period_start,period_end,pay_date?,frequency,tax_year,notes?}, lines:[...], postGl? }
export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const run = body.run || {};
  const lines: any[] = Array.isArray(body.lines) ? body.lines : [];
  if (!run.period_start || !run.period_end) return NextResponse.json({ error: 'Période manquante.' }, { status: 400 });
  if (!lines.length) return NextResponse.json({ error: 'Aucune ligne de paie.' }, { status: 400 });

  // Totaux serveur (ne pas faire confiance au client).
  const sum = (k: string) => r2(lines.reduce((a, l) => a + num(l[k]), 0));
  const totals = {
    gross: sum('gross'), deductions: sum('total_deductions'), net: sum('net_pay'),
    er: sum('er_total'), toPay: sum('total_to_pay'),
  };

  // 1) En-tête du run.
  const { data: runRow, error: runErr } = await supabaseAdmin.from('payroll_runs').insert({
    tenant_id: tenant, period_start: run.period_start, period_end: run.period_end,
    pay_date: run.pay_date || null, frequency: run.frequency || 'biweekly', tax_year: Number(run.tax_year || 2026),
    status: 'approved', employee_count: lines.length,
    total_gross: totals.gross, total_deductions: totals.deductions, total_net: totals.net, total_employer: totals.er,
    notes: run.notes || null, created_by: (acc as any).email || (acc as any).user_id || null,
  }).select('id').single();
  if (runErr) return NextResponse.json({ error: runErr.message + ' (migration 223 appliquée ?)' }, { status: 500 });
  const runId = runRow!.id;

  // 2) Lignes.
  const lineRows = lines.map(l => ({
    run_id: runId, tenant_id: tenant, personnel_id: l.personnel_id || null, employee_name: l.employee_name || null,
    gross: num(l.gross), allowances: num(l.allowances), reimbursable: num(l.reimbursable),
    qpp: num(l.qpp), ei: num(l.ei), qpip: num(l.qpip), federal_tax: num(l.federal_tax), quebec_tax: num(l.quebec_tax), extra_tax: num(l.extra_tax),
    total_deductions: num(l.total_deductions), net_pay: num(l.net_pay), total_to_pay: num(l.total_to_pay),
    er_qpp: num(l.er_qpp), er_ei: num(l.er_ei), er_qpip: num(l.er_qpip), er_fss: num(l.er_fss), er_cnesst: num(l.er_cnesst), er_wsdrf: num(l.er_wsdrf), er_total: num(l.er_total),
    detail: l.detail || null,
  }));
  const { error: lineErr } = await supabaseAdmin.from('payroll_lines').insert(lineRows);
  if (lineErr) return NextResponse.json({ error: lineErr.message }, { status: 500 });

  // 3) Écriture comptable (optionnelle).
  let glEntryId: string | null = null;
  if (body.postGl) {
    try {
      const accs = await getAccounts(tenant);
      const m: Record<string, string> = {}; for (const a of accs) m[a.code] = a.id;
      if (m['5000'] && m['2300'] && m['2200'] && m['2210']) {
        const grossT = sum('gross'), erT = sum('er_total'), netT = sum('net_pay');
        const fedRemit = r2(sum('federal_tax') + sum('ei') + sum('er_ei') + sum('extra_tax'));
        const qcRemit = r2(sum('quebec_tax') + sum('qpp') + sum('qpip') + sum('er_qpp') + sum('er_qpip') + sum('er_fss') + sum('er_cnesst') + sum('er_wsdrf'));
        const glLines = [
          { account_id: m['5000'], debit: r2(grossT + erT), credit: 0, description: 'Salaires et charges sociales' },
          { account_id: m['2300'], debit: 0, credit: netT, description: 'Net à payer aux employés' },
          { account_id: m['2200'], debit: 0, credit: fedRemit, description: 'Retenues à la source — fédéral (impôt/AE)' },
          { account_id: m['2210'], debit: 0, credit: qcRemit, description: 'Retenues à la source — Québec (impôt/RRQ/RQAP/FSS/CNESST)' },
        ];
        const entryId = await createEntry(tenant, {
          entry_date: run.pay_date || run.period_end,
          description: `Paie ${run.period_start} → ${run.period_end} (${lines.length} employé(s))`,
          reference: `PAY-${String(runId).slice(0, 8)}`, journal_code: 'PAY',
          source_type: 'payroll_run', source_id: runId, lines: glLines,
        } as any);
        glEntryId = entryId as any;
        if (glEntryId) await supabaseAdmin.from('payroll_runs').update({ gl_entry_id: glEntryId }).eq('id', runId);
      }
    } catch (e: any) {
      // L'écriture comptable ne doit pas bloquer la paie : on retourne le run avec un avertissement.
      return NextResponse.json({ ok: true, runId, totals, glWarning: e?.message || 'Comptabilisation échouée (run enregistré).' });
    }
  }

  return NextResponse.json({ ok: true, runId, glEntryId, totals });
}
