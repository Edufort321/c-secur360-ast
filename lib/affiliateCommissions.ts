// Commissions d'affiliation co-vendeur (#63) — types + helpers d'acces (via l'API admin gardee).
// Importable client. La table source : vendor_commissions (migration 057), enrichie cote serveur
// du nom du vendeur et du client affilie. Le « contrat actif » provient de tenant_affiliate_contracts (migration 120).
import type { AffiliateContract } from '@/lib/affiliateContract';

export interface AffiliateCommission {
  id: string;
  vendor_id: string;
  tenant_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | string;
  due_date: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  vendor_name: string | null;   // joint cote serveur
  tenant_name: string;          // joint cote serveur (client affilie)
}

export interface VendorClient {
  tenant_id: string;
  tenant_name: string;
  created_at: string | null;
  contract: AffiliateContract | null;   // contrat d'affiliation du client (null si aucun)
}

export interface VendorFiche {
  vendor: { id: string; name: string; email?: string | null; phone?: string | null; commission_rate?: number; is_active?: boolean; notes?: string | null } | null;
  clients: VendorClient[];
  commissions: AffiliateCommission[];
}

/** Liste des commissions (toutes, ou filtrees par statut) triees par echeance — pour le tableau de bord. */
export async function listCommissions(status?: string): Promise<AffiliateCommission[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`/api/admin/affiliate-commissions${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement des commissions');
  return (await res.json()).commissions || [];
}

/** Bundle « fiche vendeur » : vendeur + clients affilies (avec contrat) + commissions. */
export async function getVendorFiche(vendorId: string): Promise<VendorFiche> {
  const res = await fetch(`/api/admin/affiliate-commissions?vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement de la fiche vendeur');
  const d = await res.json();
  return { vendor: d.vendor ?? null, clients: d.clients ?? [], commissions: d.commissions ?? [] };
}

/** Un contrat est « actif » lorsqu'il est signe. */
export const isContractActive = (c: AffiliateContract | null | undefined): boolean => c?.status === 'signe';
