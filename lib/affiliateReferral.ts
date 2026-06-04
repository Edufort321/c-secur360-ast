// Parrainage co-vendeur (#78) — code/lien unique par vendeur + attribution des inscriptions.
// Acces via l'API admin gardee (/api/admin/affiliate-referral). Table : vendors.referral_code + tenants.referred_by (migration 126).

export interface ReferredTenant {
  tenant_id: string;
  tenant_name: string;
  created_at: string | null;
}

export interface VendorReferral {
  vendor_id: string;
  referral_code: string | null;
  referred: ReferredTenant[];
}

/** Construit le lien de parrainage public a partir d'un code. Pur (testable). */
export function referralLink(code: string | null | undefined, origin = ''): string {
  if (!code) return '';
  const base = (origin || '').replace(/\/+$/, '');
  return `${base}/signup?ref=${encodeURIComponent(code)}`;
}

/** Normalise une base de code a partir d'un nom (minuscules alphanum + tirets). Pur (testable). */
export function slugifyCode(name: string): string {
  return (name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'vendeur';
}

/** Code + inscriptions attribuees d'un vendeur. */
export async function getReferral(vendorId: string): Promise<VendorReferral> {
  const res = await fetch(`/api/admin/affiliate-referral?vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement du parrainage');
  const d = await res.json();
  return { vendor_id: vendorId, referral_code: d.referral_code ?? null, referred: d.referred ?? [] };
}

/** Genere (ou regenere) le code de parrainage unique d'un vendeur. */
export async function generateReferral(vendorId: string): Promise<string> {
  const res = await fetch('/api/admin/affiliate-referral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate', vendorId }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de generation du code');
  return (await res.json()).referral_code;
}

/** Attribue un tenant a un vendeur a partir d'un code de parrainage (inscription via le lien). */
export async function attributeTenant(code: string, tenantId: string): Promise<{ vendor_id: string; vendor_name: string }> {
  const res = await fetch('/api/admin/affiliate-referral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'attribute', code, tenantId }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Erreur d'attribution");
  return res.json();
}
