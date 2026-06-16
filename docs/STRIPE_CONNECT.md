# Stripe — Validation webhook + Intégration Connect (encaissement par tenant)

> But : chaque tenant (incl. CERDIA Commerce) encaisse SES clients via Stripe ; commission plateforme automatique.

## 1. Validation de l'existant (✅ fait)
- **SDK** `stripe@16` installé. Init : `new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })`.
- **Webhook plateforme** : `app/api/webhooks/stripe/route.ts`
  - Lit le **corps brut** (`request.text()`) — requis pour la signature en App Router. ✅
  - **Vérifie la signature** `stripe-signature` avec `STRIPE_WEBHOOK_SECRET` (`stripe.webhooks.constructEvent`). ✅
  - Gère déjà : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.*`, `mandate.updated` (PAD/ACSS).
  - **Extensible** : on branchera `checkout.session.completed` sur `session.metadata.kind === 'commerce_invoice'` → marque la facture du tenant **payée** + écriture d'**encaissement au GL**. Les autres cas (billing plateforme) restent intacts.
- **Destination charges** (Connect) : la session est créée PAR la plateforme avec `transfer_data.destination = <compte du tenant>` → l'événement revient sur **ce même endpoint** (pas de webhook « connected account » séparé à gérer).

## 2. À CONFIGURER côté Stripe (Eric) — AVANT le passage en réel
1. **Activer Connect** : Dashboard Stripe → *Connect* → activer, type **Express** (onboarding hébergé par Stripe).
   - Renseigner le profil plateforme (nom, logo, support) → c'est ce que voient tes tenants à l'onboarding.
2. **Basculer en clés LIVE** (fin des tests) :
   - Récupérer la **clé secrète LIVE** (`sk_live_…`) → variable d'env **`STRIPE_SECRET_KEY`** (Vercel, Production).
3. **Endpoint webhook** : Dashboard → *Developers → Webhooks → Add endpoint*
   - URL : **`https://www.c-secur360.ca/api/webhooks/stripe`**
   - Événements à cocher : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.created/updated/deleted`, `mandate.updated`, **`account.updated`** (suivi de l'onboarding Connect d'un tenant).
   - Copier le **Signing secret** (`whsec_…`) → variable d'env **`STRIPE_WEBHOOK_SECRET`** (Vercel, Production).
4. **Variables d'env Vercel (Production)** à confirmer :
   - `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET` (live), `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL` (plans plateforme).
   - Redéployer après modification (sinon les nouvelles clés ne sont pas prises).

## 3. Code livré (#34) ✅
- **Onboarding tenant** : `POST /api/stripe/connect/onboard` → crée/retrouve un compte Connect **Express** + **account link** ; stocke `stripe_account_id` dans `company_settings` (jamais de clé secrète). `GET ?tenant=` → statut `{connected, chargesEnabled}`. Bouton **« Connecter Stripe »** dans Admin → Factures.
- **Bouton « Payer »** (visible quand `chargesEnabled`) : `POST /api/stripe/connect/pay` → Checkout *destination charge* (`transfer_data.destination` = compte du tenant) + `application_fee_amount` = `total × STRIPE_PLATFORM_FEE_BPS/10000` → ouvre l'URL de paiement.
- **Webhook** (`app/api/webhooks/stripe/route.ts`) :
  - `checkout.session.completed` avec `metadata.kind==='commerce_invoice'` → `setInvoiceStatus(tenant,id,'paid')` (auto-poste vente + encaissement au GL, idempotent) + stocke `stripe_payment_intent`.
  - `account.updated` → met `company_settings.stripe_charges_enabled` à jour.
- **Migration 196** : `company_settings.stripe_account_id` + `stripe_charges_enabled` + `commerce_invoices.stripe_payment_intent`.
- **Env optionnelle** : `STRIPE_PLATFORM_FEE_BPS` (commission plateforme en points de base ; 0/absent = pas de commission).

## 4. Test recommandé (réel, petit montant)
1. Connecter le compte Stripe d'un tenant (onboarding Express).
2. Émettre une facture, cliquer **Payer**, payer un **petit montant réel** (ex. 1,00 $).
3. Vérifier : facture **payée**, **écriture d'encaissement au GL**, commission plateforme reçue, événement reçu (Dashboard → Webhooks → tentatives 200 OK).
