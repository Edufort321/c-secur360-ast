// Prévision de trésorerie 13 SEMAINES (#43 BLOC B) — solde courant + encaissements AR attendus +
// encaissements récurrents − décaissements estimés, par scénario (optimiste/réaliste/pessimiste).
// Le moteur `projectCashflow` est PUR (testable) ; `getCashForecast` rassemble les données.
import type { RecurringSub } from '@/lib/recurring';
// supabase est importé DYNAMIQUEMENT dans getCashForecast (garde projectCashflow pur et testable).
const monthlyAmount = (s: RecurringSub) => (s.status === 'active' ? (s.interval === 'annual' ? (Number(s.amount) || 0) / 12 : (Number(s.amount) || 0)) : 0);

export type Scenario = 'optimistic' | 'realistic' | 'pessimistic';
export type WeekProjection = { week: number; from: string; inflow: number; outflow: number; balance: number };
export type Flow = { dateIso: string; amount: number; probability?: number };

const PROB_ADJ: Record<Scenario, number> = { optimistic: 1.0, realistic: 0.9, pessimistic: 0.75 };
const addDaysIso = (iso: string, days: number) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

export function projectCashflow(opts: {
  startingCash: number; startIso: string; inflows: Flow[]; outflows: Flow[]; scenario: Scenario; weeks?: number;
}): WeekProjection[] {
  const weeks = opts.weeks || 13;
  const adj = PROB_ADJ[opts.scenario];
  let balance = opts.startingCash;
  const out: WeekProjection[] = [];
  for (let w = 0; w < weeks; w++) {
    const from = addDaysIso(opts.startIso, w * 7); const to = addDaysIso(opts.startIso, (w + 1) * 7);
    const inflow = opts.inflows.filter(f => f.dateIso >= from && f.dateIso < to).reduce((s, f) => s + f.amount * (f.probability ?? 1) * adj, 0);
    const outflow = opts.outflows.filter(f => f.dateIso >= from && f.dateIso < to).reduce((s, f) => s + f.amount, 0);
    balance += inflow - outflow;
    out.push({ week: w + 1, from, inflow: Math.round(inflow), outflow: Math.round(outflow), balance: Math.round(balance) });
  }
  return out;
}

// Probabilité d'encaissement d'une facture selon son statut/retard.
const arProbability = (status: string) => (status === 'paid' ? 1 : status === 'sent' ? 0.85 : 0.6);

export async function getCashForecast(tenant: string, opts: { startingCash: number; weeklyOutflow?: number; scenario?: Scenario; todayIso?: string }): Promise<WeekProjection[]> {
  const { supabase } = await import('@/lib/supabase');
  const today = opts.todayIso || new Date().toISOString().slice(0, 10);
  const horizon = addDaysIso(today, 13 * 7);
  const inflows: Flow[] = [];

  // 1. Encaissements AR : factures non payées avec une échéance dans l'horizon (retard → cette semaine).
  try {
    const { data } = await supabase.from('commerce_invoices').select('total, subtotal, status, due_date').eq('tenant_id', tenant).not('status', 'in', '("paid","cancelled","draft")');
    for (const iv of ((data as any[]) || [])) {
      const amt = Number(iv.total) || Number(iv.subtotal) || 0; if (amt <= 0) continue;
      let due = iv.due_date ? String(iv.due_date).slice(0, 10) : today;
      if (due < today) due = today;               // en retard → encaissement attendu dès cette semaine
      if (due > horizon) continue;
      inflows.push({ dateIso: due, amount: amt, probability: arProbability(iv.status) });
    }
  } catch { /* ignore */ }

  // 2. Encaissements RÉCURRENTS : abonnements actifs facturés dans l'horizon (par période).
  try {
    const { data } = await supabase.from('recurring_subscriptions').select('*').eq('tenant_id', tenant).eq('status', 'active');
    for (const s of ((data as RecurringSub[]) || [])) {
      let d = (s.next_billing_date && String(s.next_billing_date).slice(0, 10)) || today;
      const per = monthlyAmount(s);
      // ajoute chaque échéance jusqu'à l'horizon (mensuel → +1 mois, annuel → +12 mois)
      for (let i = 0; i < 4 && d <= horizon; i++) {
        if (d >= today) inflows.push({ dateIso: d, amount: Number(s.amount) || per, probability: 0.95 });
        const dt = new Date(d + 'T00:00:00'); dt.setMonth(dt.getMonth() + (s.interval === 'annual' ? 12 : 1)); d = dt.toISOString().slice(0, 10);
      }
    }
  } catch { /* ignore */ }

  // 3. Décaissements : run-rate hebdomadaire estimé (charges moyennes), réparti chaque semaine.
  const outflows: Flow[] = [];
  const weekly = Math.max(0, Number(opts.weeklyOutflow) || 0);
  if (weekly > 0) for (let w = 0; w < 13; w++) outflows.push({ dateIso: addDaysIso(today, w * 7 + 3), amount: weekly });

  return projectCashflow({ startingCash: opts.startingCash, startIso: today, inflows, outflows, scenario: opts.scenario || 'realistic' });
}
