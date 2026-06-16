# Stripe — Validation webhook + Intégration Connect (encaissement par tenant)

> But : chaque tenant (incl. CERDIA Commerce) encaisse SES clients via Stripe ; commission plateforme automatique.

## 1. Validation de l'existant (✅ fait)
- **SDK** `stripe@16` installé. Init : `new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })`.
- **Webhook plateforme** : `app/api/webhooks/stripe/route.ts`
  - Lit le **corps brut** (`request.text()`) — requis pour la signature en App Router. ✅
  - **Vérifie la signature** `stripe-signature` avec `STRIPE_WEBHOOK_SECRET` (`stripe.webhooks.constructEvent`). ✅
  - Gère déjà : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.*`, `mandate.updated` (PAD/ACSS).
  - **Extensible** : on branchera `checkout.session.completed` sur `session.metadata.kind === 'commerce_invoice'` → marque la facture du tenant **payée** + écriture d'**encaissement au GL**. Les autres cas (billing plateforme) restent intacts.
- **Modèle retenu : DIRECT CHARGES** (code mis à jour). La session de paiement est créée **sur le compte connecté du tenant** (`{ stripeAccount }`). Le **tenant** est le commerçant officiel : il paie les frais Stripe et porte les litiges/remboursements ; la plateforme prélève `application_fee_amount` (sa commission). Les abonnements **C-Secur360** (billing plateforme) restent du Stripe standard sur le compte plateforme — inchangé.

## 2. À CONFIGURER côté Stripe (Eric) — AVANT le passage en réel

### Écran « Connect Overview » : quel modèle cliquer ?
- Choisir **« Créer une plateforme »** (PAS « place de marché »). « Place de marché » = la plateforme encaisse puis reverse (destination/separate charges, plateforme commerçante + responsable des litiges) — ce n'est pas ce qu'on veut. « Plateforme » = comptes connectés indépendants qui encaissent eux-mêmes = **direct charges**.
- Type de compte connecté : **Express** (onboarding hébergé par Stripe via Account Links — c'est ce que code `/api/stripe/connect/onboard`). PAS Standard, PAS Custom.

### Flux de fonds exact (direct charge, ex. facture 100 $)
1. Le client du tenant paie **100 $ au compte connecté du tenant** (tenant = commerçant officiel).
2. **Stripe** prélève ses frais (~2,9 % + 0,30 $) **sur le compte du tenant**.
3. **Plateforme (CERDIA)** prélève sa commission `application_fee_amount = total × STRIPE_PLATFORM_FEE_BPS/10000`, transférée du compte tenant vers la plateforme.
4. Le tenant reçoit : `100 $ − frais Stripe − commission plateforme`. Litiges/remboursements = **sur le tenant**.

### Étapes dashboard
1. **Activer Connect** → « Créer une plateforme » → comptes **Express**. Renseigner le profil plateforme (nom, logo, support) = ce que voient tes tenants à l'onboarding.
2. **Clés LIVE** : `sk_live_…` → **`STRIPE_SECRET_KEY`** (Vercel, Production).
3. **Endpoint webhook** : *Developers → Webhooks → Add endpoint*
   - URL : **`https://www.c-secur360.ca/api/webhooks/stripe`**
   - **IMPORTANT** : cocher l'option **« Listen to events on Connected accounts »** sur CE MÊME endpoint → un seul endpoint, un seul `whsec_…`, reçoit à la fois tes events plateforme ET les events des comptes connectés (direct charges). Pas d'endpoint séparé, pas de flag `connect:true` dans le code.
   - Événements à cocher : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.created/updated/deleted`, `mandate.updated`, **`account.updated`** (suivi onboarding Connect), et (utile) `payment_intent.succeeded`, `payout.paid`.
   - Copier le **Signing secret** (`whsec_…`) → **`STRIPE_WEBHOOK_SECRET`** (Vercel, Production).
   - *(Optionnel)* Si tu préfères un endpoint Connect **séparé** (même URL, autre secret), mets-le dans **`STRIPE_WEBHOOK_SECRET_CONNECT`** — le code essaie les deux signatures.
4. **`STRIPE_CONNECT_CLIENT_ID` (`ca_…`) : PAS nécessaire.** Il ne sert qu'aux comptes **Standard** (OAuth). On utilise **Express + Account Links** → aucun `ca_…` requis.
5. **Variables d'env Vercel (Production)** :
   - `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET` (live), `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL` (plans plateforme), `STRIPE_PLATFORM_FEE_BPS` (commission, optionnel ; 0/absent = aucune), `STRIPE_WEBHOOK_SECRET_CONNECT` (optionnel).
   - Redéployer après modification (sinon les nouvelles clés ne sont pas prises).

## 3. Code livré (#34) ✅
- **Onboarding tenant** : `POST /api/stripe/connect/onboard` → crée/retrouve un compte Connect **Express** + **account link** ; stocke `stripe_account_id` dans `company_settings` (jamais de clé secrète). `GET ?tenant=` → statut `{connected, chargesEnabled}`. Bouton **« Connecter Stripe »** dans Admin → Factures.
- **Bouton « Payer »** (visible quand `chargesEnabled`) : `POST /api/stripe/connect/pay` → Checkout **direct charge** sur le compte du tenant (`{ stripeAccount }`) + `application_fee_amount` = `total × STRIPE_PLATFORM_FEE_BPS/10000` → ouvre l'URL de paiement.
- **Webhook** (`app/api/webhooks/stripe/route.ts`, même endpoint, écoute aussi les comptes connectés) :
  - `checkout.session.completed` avec `metadata.kind==='commerce_invoice'` → `setInvoiceStatus(tenant,id,'paid')` (auto-poste vente + encaissement au GL, idempotent) + stocke `stripe_payment_intent`.
  - `account.updated` → met `company_settings.stripe_charges_enabled` à jour.
  - Vérification de signature : `STRIPE_WEBHOOK_SECRET` puis repli `STRIPE_WEBHOOK_SECRET_CONNECT` si défini.
- **Migration 196** : `company_settings.stripe_account_id` + `stripe_charges_enabled` + `commerce_invoices.stripe_payment_intent`.
- **Env optionnelle** : `STRIPE_PLATFORM_FEE_BPS` (commission plateforme en points de base ; 0/absent = pas de commission).

## 4. Test recommandé (réel, petit montant)
1. Connecter le compte Stripe d'un tenant (onboarding Express).
2. Émettre une facture, cliquer **Payer**, payer un **petit montant réel** (ex. 1,00 $).
3. Vérifier : facture **payée**, **écriture d'encaissement au GL**, commission plateforme reçue, événement reçu (Dashboard → Webhooks → tentatives 200 OK).
