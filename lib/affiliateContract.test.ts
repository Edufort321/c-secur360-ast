// Tests unitaires de la lib des contrats d'affiliation co-vendeur (#51).
// Couvre la logique pure (defaultContract / defaultClauses) et les wrappers reseau (get/save/list)
// avec fetch simule. Aucune dependance serveur/DB. Lancer : npm test
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  defaultContract, defaultClauses, getContract, saveContract, listContracts, deleteContract,
  type AffiliateContract,
} from './affiliateContract';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('defaultContract', () => {
  it('applique les valeurs par defaut attendues', () => {
    const c = defaultContract('acme');
    expect(c.tenant_id).toBe('acme');
    expect(c.commission_pct).toBe(20);
    expect(c.inflation_pct).toBe(0);
    expect(c.recurrence).toBe('annuelle');
    expect(c.status).toBe('brouillon');
    expect(c.start_date).toBeNull();
    expect(c.signed_at).toBeNull();
    expect(c.vendor_name).toBe('');
    expect(c.clauses.length).toBeGreaterThan(0);
  });

  it('reprend les options fournies (vendeur, commission, date de debut)', () => {
    const c = defaultContract('acme', { vendor_name: 'Jean Vendeur', vendor_email: 'j@v.com', commission_pct: 15, start_date: '2024-01-15' });
    expect(c.vendor_name).toBe('Jean Vendeur');
    expect(c.vendor_email).toBe('j@v.com');
    expect(c.commission_pct).toBe(15);
    expect(c.start_date).toBe('2024-01-15');
    // les clauses generees refletent le vendeur et la commission
    expect(c.clauses).toContain('Jean Vendeur');
    expect(c.clauses).toContain('15 %');
  });
});

describe('defaultClauses', () => {
  it('contient les parties, la commission et la juridiction Quebec', () => {
    const txt = defaultClauses({ vendor_name: 'Sofia', commission_pct: 20, recurrence: 'annuelle' });
    expect(txt).toContain("CONTRAT D'AFFILIATION");
    expect(txt).toContain('Commerce CERDIA');
    expect(txt).toContain('Sofia');
    expect(txt).toContain('20 %');
    expect(txt.toLowerCase()).toContain('quebec');
  });

  it('couvre les 10 clauses standard', () => {
    const txt = defaultClauses({});
    for (const heading of [
      '1. OBJET', '2. COMMISSION', '3. RECURRENCE', '4. RENOUVELLEMENT', '5. RESILIATION',
      '6. MODALITES DE PAIEMENT', '7. CONFIDENTIALITE', '8. NON-SOLLICITATION',
      '9. RESILIATION POUR FAUTE', '10. JURIDICTION',
    ]) {
      expect(txt).toContain(heading);
    }
  });

  it('la clause de resiliation pour faute permet de cesser les commissions si le vendeur nuit a l\'entreprise', () => {
    const txt = defaultClauses({});
    expect(txt).toContain('RESILIATION POUR FAUTE');
    expect(txt.toLowerCase()).toContain('nuit a l\'entreprise');
    expect(txt.toLowerCase()).toContain('cesser tout versement futur de commission');
  });

  it('formule l\'indexation differemment selon l\'inflation', () => {
    expect(defaultClauses({ inflation_pct: 0 })).toContain("non indexee a l'inflation");
    const indexed = defaultClauses({ inflation_pct: 2.5 });
    expect(indexed).toContain('indexee annuellement');
    expect(indexed).toContain('2,5 %'); // format fr-CA : virgule decimale
  });

  it('remplace le vendeur manquant par un libelle neutre', () => {
    expect(defaultClauses({})).toContain('le Vendeur');
  });
});

describe('getContract', () => {
  it('encode le tenantId dans l\'URL et retourne le JSON', async () => {
    const payload = { tenant_id: 'a b', commission_pct: 20 };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await getContract('a b');
    expect(res).toEqual(payload);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenantId=a%20b');
  });

  it('leve une erreur explicite quand la reponse n\'est pas ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Acces refuse' }) }));
    await expect(getContract('x')).rejects.toThrow('Acces refuse');
  });
});

describe('saveContract', () => {
  it('POST le contrat en JSON et retourne la ligne enregistree', async () => {
    const body: AffiliateContract = defaultContract('acme', { commission_pct: 18 });
    const saved = { ...body, id: 'uuid-1' };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(saved) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await saveContract(body);
    expect(res).toEqual(saved);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/affiliate-contract');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body).commission_pct).toBe(18);
  });

  it('propage le message d\'erreur du serveur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'DB down' }) }));
    await expect(saveContract(defaultContract('x'))).rejects.toThrow('DB down');
  });
});

describe('listContracts', () => {
  it('appelle l\'endpoint sans tenantId et retourne le tableau', async () => {
    const rows = [{ tenant_id: 'a', tenant_name: 'A inc', status: 'signe' }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(rows) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await listContracts();
    expect(res).toEqual(rows);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-contract');
  });
});

describe('deleteContract', () => {
  it('appelle DELETE avec le tenantId encode', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await deleteContract('a b');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/affiliate-contract?tenantId=a%20b');
    expect(init.method).toBe('DELETE');
  });

  it('propage l\'erreur serveur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'refus' }) }));
    await expect(deleteContract('x')).rejects.toThrow('refus');
  });
});
