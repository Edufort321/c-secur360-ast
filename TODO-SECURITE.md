# 🔒 TODO Sécurité — C-Secur360 (audit lecture seule, branche feat/modular-foundation)

> Audit reçu 2026-05-30. Les correctifs CERDIA équivalents sont déjà en prod — réutiliser les mêmes patterns. **Rien ne doit être exposé publiquement avant les points 🔴.**

## 🔴 BLOQUANT — avant toute exposition publique

### RLS multi-tenant (LE PLUS GRAVE — fuite de données entre tenants)
- [ ] **#9** — ~78 policies `USING (true)` sur tables sensibles (`soumissions`, `catalogue_taux`, `gl_*`, `commerce_*`, `planner_*`, `clients`, `timesheets`, HR). RLS activée mais **zéro protection** → tout tenant lit/modifie les autres. → Remplacer par `USING (tenant_id = <tenant courant>)`. Migrations : 085:153, 086:73, 087:51, 090:84, etc. ⚠️ Nécessite un **mécanisme de tenant courant** en RLS (claim JWT / `current_setting`) — design requis (ne pas casser le filtrage applicatif existant).
- [ ] **#10** — DEFAULT tenant dangereux : 016_inventory (`DEFAULT 'cerdia'`), 026_confined_space:14 (`DEFAULT ''`). → Retirer les DEFAULT (insert sans tenant doit ÉCHOUER, pas contaminer). Réf. correctif CERDIA migration 208.

### Authentification routes API (BOLA — OWASP #1) — ✅ CORRIGÉ
Helper partagé **`lib/apiAuth.ts`** → `requireAdmin(req)` : cookie httpOnly du dashboard (jeton dérivé de `ADMIN_DASHBOARD_PASSWORD`) **OU** session `super_admin` **OU** secret de sync (`CSECUR360_SYNC_SECRET`, fail-secure). Appliqué à tous les handlers.
- [x] **#1** — `users` (GET/POST/PATCH/DELETE) → `requireAdmin`.
- [x] **#2** — `tenants` : secret hardcodé retiré (fail-secure), `requireAdmin` sur GET/POST/DELETE, sync sortant seulement si secret présent.
- [x] **#3** — `landing-slides` (GET/POST/PUT/DELETE) → `requireAdmin` (la page publique lit la table directement, pas cette route).
- [x] **#4** — `modules` + `vendors` : secret hardcodé retiré, `requireAdmin` sur tous les handlers.
> Le dashboard super-admin pose un **cookie httpOnly** via `/api/admin/dashboard-auth` (plus de gate sessionStorage falsifiable comme seule barrière). ⚠️ Requiert `ADMIN_DASHBOARD_PASSWORD` en env.

### Service role / secrets
- [x] **#5** — `lib/supabaseAdmin.ts` : **CORRIGÉ** — plus de fallback anon en **runtime production** (throw si service_role absent) ; fallback toléré en dev/build avec avertissement.
- [ ] **#6** — `middleware.ts:6-9` : lit les sessions avec service_role (bypass RLS). → Clé restreinte / RLS stricte sur `auth_sessions`.
- [~] **#7** — `app/admin/dashboard/page.tsx` : **mot de passe retiré du bundle client** — vérification déplacée vers `/api/admin/dashboard-auth` (lit `ADMIN_DASHBOARD_PASSWORD`, fail-closed). ⚠️ **Ajouter `ADMIN_DASHBOARD_PASSWORD` dans Vercel + `.env.local`** sinon login refusé. _Reste (durcissement) : sessionStorage trivialement falsifiable → migrer vers JWT httpOnly + middleware (#19)._
- [x] **#8** — `cron/route.ts` : **CORRIGÉ** — `CRON_SECRET` requis dans tous les environnements (Bearer), bypass `force` retiré. ⚠️ Ajouter `CRON_SECRET` en env.

## 🟠 CRITIQUE — avant prod
- [x] **#11** — `lib/soumissions.ts` : `delete().eq('soumission_id', id)` sans tenant_id → suppression cross-tenant. → `.eq('tenant_id', tenant)` **CORRIGÉ**.
- [x] **#12** — `lib/invoicing.ts:100` : delete `commerce_invoice_items` sans tenant. → `.eq('tenant_id', tenant)` **CORRIGÉ**.
- [ ] **#13** — `create-checkout-session` : accepte un `customerId` arbitraire. → Vérifier caller = customer ou super_admin. _DIFFÉRÉ : nécessite le mapping client Stripe ↔ tenant (travail dédié)._
- [x] **#14** — `ast/route.ts` : **CORRIGÉ** — `userId` vient de la **session** (`getSessionUser`), jamais du client ; vide = création QR publique anonyme (flux intentionnel).
- [x] **#15** — `admin/upload` : **CORRIGÉ** — `requireAdmin` + allowlist MIME (images/pdf) + taille max 10 Mo + chemin assaini (anti path-traversal) + bucket assaini.
- [ ] **#16** — `chat/assistant` : IA sans rate-limit. → _Sera traité avec la refonte chatbots (`TODO-CHATBOTS-IA.md` #21/#22, auth + quota)._
- [~] **#17** — `sms/send` : rate-limit en mémoire **présent** (10/min). _Reste : store partagé (Redis/DB) + scope tenant (infra, différé)._

## 🟡 MOYEN / nettoyage
- [x] **#18** — `app/api/test-supabase` + `app/api/db/init` : **SUPPRIMÉS**.
- [x] **#19** — `system/status` : **CORRIGÉ** — `requireAdmin` (n'expose plus la config env publiquement).
- [x] **#20** — `weather` : **CORRIGÉ** — rate-limit par IP (30/min, en mémoire ; Redis/DB en suivi).
- [ ] **#21** — `middleware.ts:207` : regex routes publiques contournables (`//login`). → Normaliser les paths.

## 🌐 CONFORMITÉ WEB (déploiement public)
- [ ] **#22** — Headers HTTP de sécurité ABSENTS (`next.config.js`) : HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP. → `async headers()`.
- [ ] **#23** — SEO : pas de `app/robots.ts` ni `app/sitemap.ts`. → Créer (bloquer /admin, /api, dashboards).
- [ ] **#24** — Metadata incomplet (`app/layout.tsx`) : manque metadataBase, openGraph, robots, canonical.
- [ ] **#25** — Pas de `noindex` sur layouts admin/dashboard. → `generateMetadata()`.
- [ ] **#26** — Bannière cookies (Loi 25/RGPD) absente. → À prévoir avant analytics.
- [ ] **#27** — Page `/privacy` absente. → Créer (Loi 25/RGPD).

## ✅ Déjà bon
bcrypt mots de passe · tokens de session opaques · cookies httpOnly/sameSite · webhooks Stripe vérifiés · `images.remotePatterns` sans wildcard · aucun tracker tiers.

## 🎯 Ordre d'attaque recommandé
1. **#9 + #10** (RLS + DEFAULT tenant) — fuite inter-tenant, le pire. *Design tenant-courant requis.*
2. **#1-#4** (routes admin sans auth) + **#7** (mot de passe en dur).
3. **#5, #6, #8** (service role / cron).
4. 🟠 #13-#17, puis 🟡 #18-#21, puis 🌐 #22-#27.
