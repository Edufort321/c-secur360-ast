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

## 3. Ce que je construis ensuite (code #34)
- **Onboarding tenant** : route `POST /api/stripe/connect/onboard` → crée un compte Connect Express + **account link** (lien d'onboarding) ; stocke `stripe_account_id` dans `company_settings`. Bouton **« Connecter Stripe »** dans Admin (paramètres société).
- **Bouton « Payer » sur la facture** : route `POST /api/stripe/connect/pay` → Checkout *destination charge* vers le compte du tenant + `application_fee_amount` (ta commission) → retourne l'URL de paiement.
- **Webhook** : branche `commerce_invoice` (payée → statut + écriture GL) et `account.updated` (active le tenant quand `charges_enabled`).
- **Migration** : `company_settings.stripe_account_id` + `stripe_charges_enabled`.

## 4. Test recommandé (réel, petit montant)
1. Connecter le compte Stripe d'un tenant (onboarding Express).
2. Émettre une facture, cliquer **Payer**, payer un **petit montant réel** (ex. 1,00 $).
3. Vérifier : facture **payée**, **écriture d'encaissement au GL**, commission plateforme reçue, événement reçu (Dashboard → Webhooks → tentatives 200 OK).
