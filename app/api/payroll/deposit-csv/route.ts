// Export DÉPÔT DIRECT de la paie (#52 phase 1) — CSV générique de dépôt. Le seul endroit où les numéros
// de compte sont lus EN CLAIR (service_role), pour bâtir le fichier remis à la banque. Gating = canHr.
// Reçoit la liste des montants à verser (calculés côté client depuis le registre de paie) + joint les
// coordonnées bancaires. Aucun fichier n'est stocké (minimisation Loi 25). Phase 2 = format CPA-005 par banque.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Item = { personnel_id: string; name: string; amount: number };

const esc = (v: any) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const f2 = (v: number) => (Math.round((Number(v) || 0) * 100) / 100).toFixed(2);
const digits = (s?: string | null) => String(s || '').replace(/\D/g, '');

// POST { tenant, items:[{personnel_id,name,amount}], periodLabel? } -> { ok, csv, missing[], count, total }
export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const items: Item[] = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: 'Aucun montant à verser.' }, { status: 400 });
  const periodLabel = String(body.periodLabel || '').slice(0, 60);

  // Agrège par employé (un employé peut avoir plusieurs feuilles dans la période).
  const byEmp = new Map<string, { name: string; amount: number }>();
  for (const it of items) {
    const pid = String(it.personnel_id || '');
    if (!pid) continue;
    const cur = byEmp.get(pid) || { name: it.name || '', amount: 0 };
    cur.amount += Number(it.amount) || 0; if (it.name) cur.name = it.name;
    byEmp.set(pid, cur);
  }
  const pids = [...byEmp.keys()];
  const { data, error } = await supabaseAdmin.from('employee_bank_accounts')
    .select('personnel_id, account_holder, institution_number, transit_number, account_number')
    .eq('tenant_id', tenant).in('personnel_id', pids.length ? pids : ['__none__']);
  if (error) return NextResponse.json({ error: error.message + ' (migration 218 appliquée ?)' }, { status: 500 });
  const bank = new Map<string, any>((data || []).map((r: any) => [r.personnel_id, r]));

  const headers = ['Bénéficiaire', 'N° institution', 'N° transit', 'N° compte', 'Montant', 'Référence'];
  const lines = [headers.join(',')];
  const missing: string[] = [];
  let total = 0, count = 0;
  for (const [pid, emp] of byEmp) {
    if ((Number(emp.amount) || 0) <= 0) continue;
    const b = bank.get(pid);
    const inst = digits(b?.institution_number), transit = digits(b?.transit_number), account = digits(b?.account_number);
    if (!inst || !transit || !account) { missing.push(emp.name || pid); continue; }
    lines.push([esc(b?.account_holder || emp.name), inst, transit, account, f2(emp.amount), esc(periodLabel)].join(','));
    total += Number(emp.amount) || 0; count++;
  }
  lines.push(['TOTAL', '', '', '', f2(total), esc(`${count} dépôt(s)`)].join(','));
  const csv = '﻿' + lines.join('\r\n');
  return NextResponse.json({ ok: true, csv, missing, count, total: Math.round(total * 100) / 100 });
}
