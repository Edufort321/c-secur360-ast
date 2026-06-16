import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Onboarding Stripe Connect (Express) d'un TENANT : crée/retrouve son compte connecté + lien d'onboarding.
// On ne stocke que stripe_account_id (jamais de clé secrète). Super_admin peut cibler le tenant de la page.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const effTenant = (u: any, t?: string | null) => (u?.role === 'super_admin' && t ? String(t) : (u?.tenant_id || ''));

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY).' }, { status: 503 });
  let body: any = {}; try { body = await req.json(); } catch { /* vide */ }
  const tenant = effTenant(u, body.tenant);
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  try {
    const { data: cs } = await supabaseAdmin.from('company_settings').select('stripe_account_id, email, legal_name').eq('tenant_id', tenant).maybeSingle();
    let accountId = cs?.stripe_account_id as string | undefined;
    if (!accountId) {
      const acct = await stripe.accounts.create({
        type: 'express', country: 'CA', email: cs?.email || undefined,
        business_profile: { name: cs?.legal_name || tenant },
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { tenant },
      });
      accountId = acct.id;
      // Persiste l'id de compte (update si la ligne existe, sinon insert).
      const upd = await supabaseAdmin.from('company_settings').update({ stripe_account_id: accountId, updated_at: new Date().toISOString() }).eq('tenant_id', tenant).select('tenant_id');
      if (!upd.data || !upd.data.length) await supabaseAdmin.from('company_settings').insert({ tenant_id: tenant, stripe_account_id: accountId });
    }
    const origin = req.headers.get('origin') || new URL(req.url).origin;
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/${tenant}/admin?tab=factures&stripe=refresh`,
      return_url: `${origin}/${tenant}/admin?tab=factures&stripe=done`,
      type: 'account_onboarding',
    });
    return NextResponse.json({ ok: true, url: link.url, accountId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur Stripe' }, { status: 400 });
  }
}

// GET ?tenant= : statut de connexion (compte + paiements actifs).
export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effTenant(u, new URL(req.url).searchParams.get('tenant'));
  const { data: cs } = await supabaseAdmin.from('company_settings').select('stripe_account_id, stripe_charges_enabled').eq('tenant_id', tenant).maybeSingle();
  return NextResponse.json({ connected: !!cs?.stripe_account_id, chargesEnabled: !!cs?.stripe_charges_enabled });
}
