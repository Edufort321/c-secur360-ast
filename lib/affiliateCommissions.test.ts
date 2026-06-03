// Tests unitaires des helpers de commissions d'affiliation (#63).
// fetch simule ; aucune dependance serveur/DB. Lancer : npm test
import { describe, it, expect, vi, afterEach } from 'vitest';
import { listCommissions, getVendorFiche, isContractActive, yearsElapsed, indexedAmount, projectNextCommission } from './affiliateCommissions';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

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
