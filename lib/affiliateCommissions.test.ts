// Tests unitaires des helpers de commissions d'affiliation (#63).
// fetch simule ; aucune dependance serveur/DB. Lancer : npm test
import { describe, it, expect, vi, afterEach } from 'vitest';
import { listCommissions, getVendorFiche, isContractActive, yearsElapsed, indexedAmount, projectNextCommission, commissionReminders } from './affiliateCommissions';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const c = (over: any = {}) => ({ id: 'x', vendor_id: 'v', tenant_id: 't', amount: 100, status: 'pending', due_date: null, paid_at: null, period_start: null, period_end: null, created_at: '', vendor_name: 'V', tenant_name: 'T', ...over });

describe('commissionReminders (#70)', () => {
  const today = '2026-06-03';
  it('classe en retard vs echeance proche, ignore payees/lointaines/sans echeance', () => {
    const list = commissionReminders([
      c({ id: 'late', due_date: '2026-05-20' }),         // retard
      c({ id: 'soon', due_date: '2026-06-20' }),         // dans 17 j -> proche
      c({ id: 'far', due_date: '2026-12-01' }),          // > 30 j -> ignore
      c({ id: 'paid', due_date: '2026-05-20', status: 'paid' }), // payee -> ignore
      c({ id: 'nodate', due_date: null }),               // sans echeance -> ignore
    ], { today });
    expect(list.map(r => r.commission.id)).toEqual(['late', 'soon']);
    expect(list[0].bucket).toBe('overdue');
    expect(list[0].daysUntil).toBeLessThan(0);
    expect(list[1].bucket).toBe('soon');
  });

  it('respecte la fenetre withinDays et trie par urgence', () => {
    const list = commissionReminders([
      c({ id: 'd10', due_date: '2026-06-13' }),
      c({ id: 'd3', due_date: '2026-06-06' }),
    ], { today, withinDays: 7 });
    expect(list.map(r => r.commission.id)).toEqual(['d3']); // d10 hors fenetre 7 j
  });
});

describe('indexation inflation (#70)', () => {
  it('yearsElapsed compte les annees revolues a la date anniversaire', () => {
    expect(yearsElapsed('2020-06-15', '2024-06-15')).toBe(4);   // pile l'anniversaire
    expect(yearsElapsed('2020-06-15', '2024-06-14')).toBe(3);   // veille -> pas encore
    expect(yearsElapsed('2020-06-15', '2020-06-15')).toBe(0);
    expect(yearsElapsed(null, '2024-01-01')).toBe(0);
  });

  it('indexedAmount compose l\'inflation et arrondit au cent', () => {
    expect(indexedAmount(100, 0, 5)).toBe(100);        // 0 % -> inchange
    expect(indexedAmount(100, 10, 1)).toBe(110);
    expect(indexedAmount(100, 10, 2)).toBe(121);
    expect(indexedAmount(200, 2.5, 0)).toBe(200);      // 0 periode -> base
  });

  it('projectNextCommission indexe d\'une periode', () => {
    expect(projectNextCommission(1000, 3)).toBe(1030);
    expect(projectNextCommission(0, 5)).toBe(0);
  });
});

describe('isContractActive', () => {
  it('vrai seulement si le contrat est signe', () => {
    expect(isContractActive({ status: 'signe' } as any)).toBe(true);
    expect(isContractActive({ status: 'brouillon' } as any)).toBe(false);
    expect(isContractActive({ status: 'resilie' } as any)).toBe(false);
    expect(isContractActive(null)).toBe(false);
    expect(isContractActive(undefined)).toBe(false);
  });
});

describe('listCommissions', () => {
  it('appelle l\'endpoint sans filtre et retourne le tableau', async () => {
    const commissions = [{ id: '1', amount: 100, status: 'pending' }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ commissions }) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await listCommissions();
    expect(res).toEqual(commissions);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-commissions');
  });

  it('transmet le filtre de statut dans l\'URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ commissions: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await listCommissions('pending');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-commissions?status=pending');
  });

  it('retourne un tableau vide si la cle commissions est absente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    expect(await listCommissions()).toEqual([]);
  });

  it('leve une erreur explicite si la reponse n\'est pas ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Acces refuse' }) }));
    await expect(listCommissions()).rejects.toThrow('Acces refuse');
  });
});

describe('getVendorFiche', () => {
  it('encode le vendorId et normalise le bundle retourne', async () => {
    const bundle = { vendor: { id: 'v 1', name: 'Sofia' }, clients: [{ tenant_id: 'a' }], commissions: [{ id: 'c1' }] };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(bundle) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await getVendorFiche('v 1');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-commissions?vendorId=v%201');
    expect(res.vendor?.name).toBe('Sofia');
    expect(res.clients).toHaveLength(1);
    expect(res.commissions).toHaveLength(1);
  });

  it('fournit des valeurs par defaut si le serveur omet des cles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    const res = await getVendorFiche('x');
    expect(res).toEqual({ vendor: null, clients: [], commissions: [] });
  });
});
