# Checklist de mise en PRODUCTION — C-Secur360 (#44)

> Audit go-live 2026-06-20. Next.js + Supabase + Stripe + Vercel. À tenir à jour avant chaque passage prod.

## ✅ Déjà OK (vérifié)
- **`.env.local` n'est PAS suivi par git** (`.gitignore` couvre `.env*` et `.env*.local`). Les secrets locaux ne sont pas dans la répo.
- **Webhook Stripe** : signature vérifiée strictement (`/api/webhooks/stripe`) + repli sur clé Connect.
- **Layout `[tenant]`** : `force-dynamic` (évite le 404 tenant connu).
- **Tables très sensibles déjà verrouillées** REVOKE anon + routes service_role : users/salaires/RH (143-147), `employee_bank_accounts` (218), actionnaires/banking (197), `hse_incident` (258).
- **CSP** : `upgrade-insecure-requests` présent ; source maps prod désactivés.

## 🔧 Correctifs de code appliqués (par Claude, ce commit)
- **Fail-secure SMS** : `/api/sms/send` n'utilise plus de repli `service_role → anon` (clé service_role exclusivement).

## ⚠️ À FAIRE PAR ERIC avant go-live (humain — clés/décisions prod)

### Stripe (passer en LIVE)
1. Dashboard Stripe **prod** : créer les prix live (mensuel, annuel, add-ons site) → copier les `price_…` live.
2. `STRIPE_SECRET_KEY` = `sk_live_…` (et non `sk_test_…`).
3. Endpoint webhook `/api/webhooks/stripe` + événements (`checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.*`, `account.updated`) → `STRIPE_WEBHOOK_SECRET`.
4. Test : 1 paiement réel en prod → vérifier qu'il tombe sur les **vrais prix** dans le Dashboard.

### Variables d'environnement Vercel (Production)
- Vérifier via **`/api/system/status`** (protégé admin) → `missing = 0` sur les « mustHave ».
- **Obligatoires serveur** : `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY/ANNUAL/ADDON_*`, `STRIPE_ACCOUNT_COUNTRY`, `TWILIO_*`, `OWNER_MOBILE`, `PUBLIC_CONTACT_NUMBER`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `ADMIN_DASHBOARD_PASSWORD`, `CSECUR360_SYNC_SECRET`, `CERDIA_COMMERCE_URL`, **`CRON_SECRET` (32+ car. aléatoire)**.
- **Client** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.
- ⚠️ Régénérer en prod les secrets « par défaut/faibles » : `CSECUR360_SYNC_SECRET` (était `csecur360-cerdia-bridge`).
- `CERDIA_COMMERCE_URL` : pointer l'URL prod (pas `localhost:3001`).

### Supabase
- Appliquer toutes les migrations (`schema_migrations` à jour ; dernier numéro = 261).
- Pour les migrations HSE récentes : **260 + 261** (257/258/259 déjà appliquées).

## 🧱 Chantier séparé (NE PAS bricoler à la hâte) — RLS DB-enforced
Les tables **opérationnelles** (`gl_*`, `commerce_invoices`, `timesheets`, `poste_salary_grids`…) sont en RLS permissive `USING(true)` → **isolation applicative** (`.eq('tenant_id')`) par design actuel. Passer en RLS *DB-enforced* exige le **tenant dans l'auth (JWT/claim)** — c'est un **projet auth dédié**, pas un quick-fix (un REVOKE anon brut casserait les lectures client). Voir mémoire « Audit contamination inter-tenant ».
Mitigation actuelle : les données VRAIMENT sensibles (salaires/banking/RH/actionnaires/incidents santé) sont déjà passées en service_role.

## 📋 Recommandé (post-lancement, non bloquant)
- Rate-limiting persistant (Vercel KV/Upstash) sur `/api/demo/start`, `/api/public/resolve-org`, `/api/assistant/public-chat` (actuellement in-memory, perdu au redéploiement).
- Logging structuré (Sentry) à la place des `console.log` sur webhook/billing.
- `/api/sms/send` : TODO `tenant_id:'default'` → vrai tenant depuis la session.
- Monitoring + alertes billing + vérifier la rétention des backups Supabase.
