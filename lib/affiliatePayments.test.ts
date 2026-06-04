// Tests unitaires des paiements de commission d'affiliation (#69).
// Helpers purs (totaux, mapping depense) + wrappers reseau (fetch simule). Lancer : npm test
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  summarizePayments, paymentToExpense, paymentsToExpenses, COMMISSION_EXPENSE_ACCOUNT,
  markCommissionPaid, cancelPayment, listPayments, listCommissionExpenses,
  type AffiliateCommissionPayment,
} from './affiliatePayments';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const comm = (over: Partial<any> = {}) => ({ id: 'c', vendor_id: 'v', tenant_id: 't', amount: 100, status: 'pending', due_date: null, paid_at: null, period_start: null, period_end: null, created_at: '', vendor_name: 'V', tenant_name: 'T', ...over });
const pay = (over: Partial<AffiliateCommissionPayment> = {}): AffiliateCommissionPayment => ({ id: 'p', commission_id: 'c', vendor_id: 'v', tenant_id: 't', due_date: null, amount: 50, method: null, reference: null, paid_at: '2026-06-01T12:00:00Z', status: 'paid', notes: null, created_at: '2026-06-01T12:00:00Z', vendor_name: 'Sofia', tenant_name: 'Acme', ...over });

describe('summarizePayments', () => {
  it('classe les commissions en du (echue) vs a venir, et somme les paiements', () => {
    const today = '2026-06-03';
    const commissions = [
      comm({ amount: 100, due_date: '2026-05-01' }),  // echue -> du
      comm({ amount: 200, due_date: '2026-12-01' }),  // future -> a venir
      comm({ amount: 40, due_date: null }),           // sans echeance -> a venir
      comm({ amount: 999, status: 'paid', due_date: '2026-05-01' }), // payee -> ignoree
    ];
    const payments = [pay({ amount: 70, status: 'paid' }), pay({ amount: 5, status: 'cancelled' })];
    const t = summarizePayments(commissions as any, payments, today);
    expect(t.due).toBe(100);
    expect(t.upcoming).toBe(240);
    expect(t.paid).toBe(70);
  });

  it('une echeance pile aujourd\'hui compte comme due', () => {
    const t = summarizePayments([comm({ amount: 100, due_date: '2026-06-03' })] as any, [], '2026-06-03');
    expect(t.due).toBe(100);
    expect(t.upcoming).toBe(0);
  });
});

describe('paymentToExpense / paymentsToExpenses', () => {
  it('mappe un paiement vers une depense sur le compte 5050', () => {
    const e = paymentToExpense(pay({ amount: 80, reference: 'VIR-1', vendor_name: 'Sofia', tenant_name: 'Acme' }));
    expect(e.account_code).toBe('5050');
    expect(e.account_code).toBe(COMMISSION_EXPENSE_ACCOUNT.code);
    expect(e.amount).toBe(80);
    expect(e.date).toBe('2026-06-01');
    expect(e.reference).toBe('VIR-1');
    expect(e.description).toContain('Sofia');
    expect(e.description).toContain('Acme');
  });

  it('n\'expose que les paiements regles', () => {
    const list = paymentsToExpenses([pay({ status: 'paid' }), pay({ id: 'x', status: 'cancelled' })]);
    expect(list).toHaveLength(1);
  });
});

describe('markCommissionPaid', () => {
  it('POST action pay avec la commission et retourne le paiement', async () => {
    const payment = pay();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ payment }) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await markCommissionPaid('c1', { method: 'virement', reference: 'R1' });
    expect(res).toEqual(payment);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/affiliate-payments');
    expect(init.method).toBe('POST');
    const sent = JSON.parse(init.body);
    expect(sent).toMatchObject({ action: 'pay', commission_id: 'c1', method: 'virement', reference: 'R1' });
  });

  it('propage l\'erreur serveur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'deja payee' }) }));
    await expect(markCommissionPaid('c1')).rejects.toThrow('deja payee');
  });
});

describe('cancelPayment', () => {
  it('POST action cancel avec le payment_id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await cancelPayment('p9');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ action: 'cancel', payment_id: 'p9' });
  });
});

describe('listPayments / listCommissionExpenses', () => {
  it('liste les paiements avec filtres encodes', async () => {
    const payments = [pay()];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ payments }) });
    vi.stubGlobal('fetch', fetchMock);
    const res = await listPayments({ vendorId: 'v 1' });
    expect(res).toEqual(payments);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-payments?vendorId=v+1');
  });

  it('demande la vue depenses via view=expenses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ expenses: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    await listCommissionExpenses({ tenantId: 'acme' });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-payments?tenantId=acme&view=expenses');
  });

  it('retourne un tableau vide si la cle est absente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    expect(await listPayments()).toEqual([]);
  });
});
