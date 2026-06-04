// Tests unitaires du parrainage co-vendeur (#78). fetch simule ; aucune dependance serveur/DB.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { referralLink, slugifyCode, getReferral, generateReferral, attributeTenant } from './affiliateReferral';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('referralLink', () => {
  it('construit /signup?ref= avec le code encode', () => {
    expect(referralLink('sofia-ab12', 'https://app.test')).toBe('https://app.test/signup?ref=sofia-ab12');
    expect(referralLink('a b', 'https://app.test/')).toBe('https://app.test/signup?ref=a%20b'); // origin sans slash final
  });
  it('retourne une chaine vide sans code', () => {
    expect(referralLink(null, 'https://x')).toBe('');
    expect(referralLink('', 'https://x')).toBe('');
  });
});

describe('slugifyCode', () => {
  it('normalise accents, espaces et symboles', () => {
    expect(slugifyCode('Éric Dufort')).toBe('eric-dufort');
    expect(slugifyCode('  Acme & Co!! ')).toBe('acme-co');
  });
  it('repli sur « vendeur » si vide', () => {
    expect(slugifyCode('')).toBe('vendeur');
    expect(slugifyCode('***')).toBe('vendeur');
  });
});

describe('getReferral', () => {
  it('normalise le bundle (code + inscriptions)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ referral_code: 'c1', referred: [{ tenant_id: 't' }] }) });
    vi.stubGlobal('fetch', fetchMock);
    const r = await getReferral('v 1');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/affiliate-referral?vendorId=v%201');
    expect(r.referral_code).toBe('c1');
    expect(r.referred).toHaveLength(1);
  });
  it('valeurs par defaut si cles absentes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    const r = await getReferral('v');
    expect(r).toEqual({ vendor_id: 'v', referral_code: null, referred: [] });
  });
});

describe('generateReferral / attributeTenant', () => {
  it('generate POST action generate et retourne le code', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ referral_code: 'sofia-ab12' }) });
    vi.stubGlobal('fetch', fetchMock);
    const code = await generateReferral('v1');
    expect(code).toBe('sofia-ab12');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ action: 'generate', vendorId: 'v1' });
  });

  it('attribute POST action attribute avec code+tenantId', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ vendor_id: 'v1', vendor_name: 'Sofia' }) });
    vi.stubGlobal('fetch', fetchMock);
    const res = await attributeTenant('sofia-ab12', 'acme');
    expect(res).toEqual({ vendor_id: 'v1', vendor_name: 'Sofia' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ action: 'attribute', code: 'sofia-ab12', tenantId: 'acme' });
  });

  it('propage l\'erreur serveur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Code de parrainage inconnu' }) }));
    await expect(attributeTenant('x', 'y')).rejects.toThrow('Code de parrainage inconnu');
  });
});
