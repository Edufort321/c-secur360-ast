# 🔒 TODO Sécurité — C-Secur360 (audit lecture seule, branche feat/modular-foundation)

> Audit reçu 2026-05-30. Les correctifs CERDIA équivalents sont déjà en prod — réutiliser les mêmes patterns. **Rien ne doit être exposé publiquement avant les points 🔴.**

## 🔴 BLOQUANT — avant toute exposition publique

### RLS multi-tenant (LE PLUS GRAVE — fuite de données entre tenants)
- [ ] **#9** — ~78 policies `USING (true)` sur tables sensibles (`soumissions`, `catalogue_taux`, `gl_*`, `commerce_*`, `planner_*`, `clients`, `timesheets`, HR). RLS activée mais **zéro protection** → tout tenant lit/modifie les autres. → Remplacer par `USING (tenant_id = <tenant courant>)`. Migrations : 085:153, 086:73, 087:51, 090:84, etc. ⚠️ Nécessite un **mécanisme de tenant courant** en RLS (claim JWT / `current_setting`) — design requis (ne pas casser le filtrage applicatif existant).
- [ ] **#10** — DEFAULT tenant dangereux : 016_inventory (`DEFAULT 'cerdia'`), 026_confined_space:14 (`DEFAULT ''`). → Retirer les DEFAULT (insert sans tenant doit ÉCHOUER, pas contaminer). Réf. correctif CERDIA migration 208.

### Authentification routes API (BOLA — OWASP #1)
- [ ] **#1** — `app/api/admin/users/route.ts` (GET/POST/PATCH/DELETE) : aucune auth → n'importe qui CRUD des comptes admin. → Vérif `super_admin` en tête de chaque handler.
- [ ] **#2** — `app/api/admin/tenants/route.ts:6` : secret hardcodé `'csecur360-cerdia-bridge'` en fallback. → Fail-secure : `if (!process.env.CSECUR360_SYNC_SECRET) return 401`, jamais de fallback.
- [ ] **#3** — `app/api/admin/landing-slides/route.ts` : CRUD sans auth → défaçage du site public. → Auth super_admin.
- [ ] **#4** — `app/api/admin/modules/route.ts:4` + `app/api/admin/vendors/route.ts:4` : même secret hardcodé. → Fail-secure.

### Service role / secrets
- [x] **#5** — `lib/supabaseAdmin.ts` : **CORRIGÉ** — plus de fallback anon en **runtime production** (throw si service_role absent) ; fallback toléré en dev/build avec avertissement.
- [ ] **#6** — `middleware.ts:6-9` : lit les sessions avec service_role (bypass RLS). → Clé restreinte / RLS stricte sur `auth_sessions`.
- [~] **#7** — `app/admin/dashboard/page.tsx` : **mot de passe retiré du bundle client** — vérification déplacée vers `/api/admin/dashboard-auth` (lit `ADMIN_DASHBOARD_PASSWORD`, fail-closed). ⚠️ **Ajouter `ADMIN_DASHBOARD_PASSWORD` dans Vercel + `.env.local`** sinon login refusé. _Reste (durcissement) : sessionStorage trivialement falsifiable → migrer vers JWT httpOnly + middleware (#19)._
- [ ] **#8** — `app/api/admin/billing/cron/route.ts:11` : auth ignorée si `NODE_ENV !== 'production'`. → Exiger le secret dans TOUS les environnements.

## 🟠 CRITIQUE — avant prod
- [x] **#11** — `lib/soumissions.ts` : `delete().eq('soumission_id', id)` sans tenant_id → suppression cross-tenant. → `.eq('tenant_id', tenant)` **CORRIGÉ**.
- [x] **#12** — `lib/invoicing.ts:100` : delete `commerce_invoice_items` sans tenant. → `.eq('tenant_id', tenant)` **CORRIGÉ**.
- [ ] **#13** — `app/api/billing/create-checkout-session/route.ts:48` : accepte un `customerId` arbitraire. → Vérifier caller = customer ou super_admin.
- [ ] **#14** — `app/api/ast/route.ts` : crée un AST sans vérifier `userId = caller`. → Valider l'identité.
- [ ] **#15** — `app/api/admin/upload/route.ts` : aucune validation MIME/extension serveur. → Valider type + bucket privé.
- [ ] **#16** — `app/api/chat/assistant/route.ts` : IA sans rate-limit → facture exploitable. → Auth + quota/user.
- [ ] **#17** — `app/api/sms/send/route.ts:59` : rate-limit en mémoire (Map) + pas de check tenant. → Redis/DB + scope tenant.

## 🟡 MOYEN / nettoyage
- [x] **#18** — `app/api/test-supabase` + `app/api/db/init` : **SUPPRIMÉS**.
- [ ] **#19** — `app/api/system/status/route.ts:14` : expose quelles clés env sont configurées. → Restreindre super_admin.
- [ ] **#20** — `app/api/weather/route.ts` : pas de rate-limit public. → Limiter par IP.
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
