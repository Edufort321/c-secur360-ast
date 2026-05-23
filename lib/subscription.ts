// Calcul de l'état d'abonnement à partir des dates (utilisable serveur ET client).
// Règles : rappel `reminder_days` avant la refacturation, `grace_days` de grâce après,
// puis blocage. Une refacturation/un paiement repousse `next_billing_date`.

export type SubStatus = 'active' | 'reminder' | 'grace' | 'blocked' | 'none';

export interface SubRow {
  next_billing_date?: string | null;
  grace_days?: number | null;
  reminder_days?: number | null;
  status?: string | null;
}

export interface SubState {
  status: SubStatus;
  nextBilling: string | null;
  daysUntilBilling: number | null; // négatif = échéance dépassée
  graceEndsAt: string | null;
  blocked: boolean;
}

const DAY = 86400000;

export function computeSubState(sub: SubRow | null | undefined): SubState {
  // Statut métier explicite "blocked" force le blocage
  if (sub?.status === 'blocked') {
    return { status: 'blocked', nextBilling: sub.next_billing_date ?? null, daysUntilBilling: null, graceEndsAt: null, blocked: true };
  }
  if (!sub || !sub.next_billing_date) {
    return { status: 'none', nextBilling: null, daysUntilBilling: null, graceEndsAt: null, blocked: false };
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nb = new Date(sub.next_billing_date);
  const reminder = sub.reminder_days ?? 60;
  const grace = sub.grace_days ?? 30;
  const graceEnd = new Date(nb); graceEnd.setDate(graceEnd.getDate() + grace);
  const daysUntilBilling = Math.ceil((nb.getTime() - today.getTime()) / DAY);

  let status: SubStatus = 'active';
  if (today.getTime() > graceEnd.getTime()) status = 'blocked';
  else if (today.getTime() > nb.getTime()) status = 'grace';
  else if (daysUntilBilling <= reminder) status = 'reminder';

  return {
    status,
    nextBilling: sub.next_billing_date,
    daysUntilBilling,
    graceEndsAt: graceEnd.toISOString().slice(0, 10),
    blocked: status === 'blocked',
  };
}
