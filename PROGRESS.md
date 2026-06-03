# 📍 ÉTAT D'AVANCEMENT — à lire en début de session (toute machine)

> Source de vérité de « où on en est ». Mis à jour au fil de l'eau. Le CODE voyage par **git** (pas besoin de Google Drive). Ce fichier + `INTEGRATION_PLAN.md` = le contexte complet.

## 🔴 ÉTAT LIVE — 2026-05-22 (session 2/3) — dernier push ~c88606d

### 🔴🔴 SÉCURITÉ — À CORRIGER EN PREMIER
Le WebSocket realtime montre un JWT **`role:service_role`** → **`NEXT_PUBLIC_SUPABASE_ANON_KEY` = clé service_role** (exposée navigateur, RLS contournée = FAILLE). FIX : mettre la clé **anon public** dans `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local` + Vercel), garder service_role UNIQUEMENT dans `SUPABASE_SERVICE_ROLE_KEY` (serveur), et **régénérer (rotate)** la clé service_role dans Supabase.

### Apps portées (lift-and-shift) — toutes montées, build OK, routes 200
- **INVENTAIRE v1** : `components/inventory/**`, monté `app/[tenant]/inventory/page.tsx` (dynamic ssr:false → Root.jsx → App). Auth pontée, import.meta→process.env, CSS scopé `.inventory-app`, header interne retiré → PortalHeader + hamburger « Menu inventaire », thème/langue pontés (Root SyncHostPrefs), PWA déplacé au portail (app/manifest.ts + public/sw.js + components/InstallPWA.tsx).
- **PLANNER v1** : `components/planner/**`, monté `app/[tenant]/planificateur/page.tsx` (dynamic ssr:false → App `.planner-app`). Login interne BYPASSÉ (admin par défaut). import.meta→process.env, imports config en alias `@/`, **constants.js = celui de la RACINE du projet planner** (pas src/config), DEFAULT_PERSONNEL vidé, CSS scopé `.planner-app` via layout, logo→/logo.png, **3 fichiers reconvertis UTF-8 (windows-1252)**. v1 garde son propre Header (toolbar module).
- **PROJET (moteur intégré, PAS d'iframe)** : app.html = vanilla JS (soumission.js absent mais logique inline dans app.html → analysée). `SoumissionTab.tsx` REBÂTI fidèle (taux IT, MO bureau prépa/gestion/rédaction + chantier, voyagement, subsistance 5h/12h/15h/nuitée, hébergement, matériaux, prix soumissionné + marge%, formules exactes) — **générique, AUCUNE réf IPS, défauts à 0, catalogue vide** (tenant configure via /projects/taux). Onglets Projet/Taux/Soumission/Temps/Coûts + lien Projet↔AST (compteur AST). RESTE : Feuille de temps enrichie (surcharge km, multi-feuilles, forfaitaire), Coûts/préfacturation+répartition, export Excel.

### ⚠️ MIGRATIONS SQL À EXÉCUTER (SQL editor, ordre, idempotentes)
011, 012, 013, 014 (rattrapage colonnes), 015 (projects.actuals), 016 (tables inventaire VIDES + tenant_id). ⏳ À CRÉER : migration **schéma Planner** (jobs/personnel/equipements/postes/succursales/conges/departements — VIDES + tenant_id ; sinon 404 → pas de persistance planner).

### Reste v2 (inventaire & planner)
Scoping `tenant_id/site_id` dans les lib supabase des apps portées ; injecter vrai user hôte ; planner : header unifié + pont thème/langue + réutiliser le client supabase hôte (« Multiple GoTrueClient »).

### Dev local (⚠️ NE JAMAIS lancer `npm run build` pendant `npm run dev` → corrompt `.next`)
Redémarrage propre : `Get-Process node | Stop-Process -Force` ; `Remove-Item -Recurse -Force .next` ; `npm run dev`.

## Reprendre sur une nouvelle machine
```bash
git clone https://github.com/Edufort321/c-secur360-ast.git
cd c-secur360-ast
git checkout feat/modular-foundation
npm install
# Recréer .env.local (NON versionné — clés). Soit:
#   vercel env pull .env.local        (si CLI Vercel liée au projet cerdia/c-secur360)
# soit le créer à la main avec :
#   NEXT_PUBLIC_SUPABASE_URL=https://nzjjgcccxlqhbtpitmpo.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon publique, Supabase > Settings > API>
#   SUPABASE_SERVICE_ROLE_KEY=<clé service_role secrète, même page>
#   DATABASE_URL=postgresql://...
npm run dev   # http://localhost:3000
```
Scripts utiles : `node -r dotenv/config scripts/seed-admin.mjs dotenv_config_path=.env.local` (compte admin), `... scripts/seed-cerdia.mjs ...` (tenant CERDIA).

## Contexte
- **Supabase** : projet existant `nzjjgcccxlqhbtpitmpo` (« C-Secur360 »). Migrations 007–010 **appliquées**. Auth via `auth_sessions` + table `users`, middleware en `SUPABASE_SERVICE_ROLE_KEY`.
- **Déploiement** : GitHub `Edufort321/c-secur360-ast` → Vercel `cerdia/c-secur360` (auto-deploy). On bosse sur la branche `feat/modular-foundation` (preview), **pas** sur `main` (prod c-secur360.ca) sans feu vert.
- **Tenant de dev** : **CERDIA** (`id=cerdia`), admin `eric.dufort@cerdia.ai` (super_admin). Mot de passe : voir `ADMIN_PASSWORD` (non versionné). Portail : `/cerdia/modules`. Login : `/auth/admin`.

## Décisions clés
1. **Repo UNIQUE** : porter planner + inventory DANS ce repo (pas de déploiements séparés). Objectif user : « tout modifié à 1 endroit ». Sources : `C:\CLAUDE\c-secur360-planner-master`, `C:\CLAUDE\c-secur-inventory-main`.
2. **Plateforme modulaire** : modules activables par tenant (gating + upsell). CERDIA = tout activé ; `demo` = vitrine du verrouillage. Registre : `lib/modules/registry.ts`.
3. **Thème** : tout en CLAIR par défaut + toggle **Jour/Nuit** (header). Deux mécanismes : Tailwind `.dark` (écrans en classes) + `data-theme` (variables CSS de `design-system.css`, pour les écrans inline-styled comme ASTForm). **i18n FR/EN** global (`LanguageContext`) — traduction à compléter partout.
4. **Hub Projet** (`/[tenant]/projects`) = moteur central (reconstruit depuis `C:\CLAUDE\app.html` IPS) ; `project_number` circule → job/AST/feuille de temps/facture.

## ✅ Fait
- Auth réelle (`lib/auth.ts`, `lib/supabaseAdmin.ts`, `/api/auth/{login,logout,me}`, page `/auth/admin`), mdp en dur retirés (landing + admin dashboard).
- `PortalHeader` (logo officiel, Jour/Nuit, FR/EN, hamburger nav modules).
- `/[tenant]/modules` = **tableau de bord** : sidebar pleine hauteur sticky (modules + statut ; masquée en mobile → hamburger header). Stats **par statut** : Projets (soumission/en cours/facturé + montants $ + total), AST (brouillon/en cours/terminé/approuvé + total). N'affiche QUE les modules **activés** du tenant. Placeholders `/inventory` + `/inspections` (registre passé en `available`, plus de « Bientôt »). Gating+upsell, i18n+dark, pleine largeur.
  - **KPI par carte (spec user)** — chaque carte affiche ses stats comme AST :
    - Projets : soumission/en cours/facturé + montants $.
    - AST : par statut (brouillon/en cours/terminé/approuvé).
    - Permis : par statut (`confined_space_permits.status`).
    - **Accidents + Presque-accidents = UNE carte combinée** (mini-dashboard) : décompte quasi vs accident + **nombre annuel** (source `near_miss_events` ; accident vs quasi via `severity_level`, table accidents = mock actuellement).
    - Planificateur : nb jobs en cours, % occupation, contraintes à visualiser (`planned_assignments`).
    - Inventaire : nb articles / alertes stock. Inspections : à venir.
- **Layout PLEINE LARGEUR responsive** (plus de `max-w-6xl` ; PortalHeader inclus). Règle design : utiliser tout l'écran selon le device ; sidebar → hamburger en mobile.
- `/[tenant]/projects` = **SQUELETTE seulement** (liste + création basique + persistance). ⚠️ NE contient PAS encore les vraies fonctionnalités IPS.

## ⚠️ ÉTAT RÉEL DES MODULES (important)
Ce qui est fait = **fondation/échafaudage**, PAS les fonctionnalités métier. Les 3 modules sont des **coquilles** à remplir en portant les apps sources :
- **Projets** : page basique. À PORTER depuis `C:\CLAUDE\app.html` (« IPS – Gestion de Projet », 5847 l.) → soumission (main-d'œuvre bureau/chantier, voyagement, subsistance, hébergement, matériaux), taux (`labor_rates`/`rate_settings`), feuille de temps, coûts (estimé vs réel), export Excel.
- **Planner** : route existe (prototype mock). À PORTER depuis `C:\CLAUDE\c-secur360-planner-master`.
- **Inventory** : pas construit. À PORTER depuis `C:\CLAUDE\c-secur-inventory-main`.
- **AST** : module existant fonctionnel et complet — style/langue unifiés.
- **Permis** : existant et **espace clos BIEN AVANCÉ** (table `confined_space_permits`, route `/permits`) — vraie feature, à unifier style/langue (NE PAS reconstruire).
- **Accidents** (`/accidents`) & **Presque-accidents** (`/near-miss`) : routes existantes — à vérifier/unifier.
- **Inspections d'équipement** : NOUVEAU module planifié (registre `status:'soon'`, basePath `inspections`). Spéc : inspections normalisées à **fréquence personnalisable** (ex. lift quotidien), **formulaire via scan QR**, par type d'équipement ; **vendable aux compagnies de location**. Lien possible avec inventory (équipements).
- Modules ajoutés au registre `lib/modules/registry.ts` : projects, ast, permits, accidents, near_miss, planner, inventory, inspections.
- Tenant CERDIA créé + lié ; `validTenants` mis à jour (middleware + layout).
- AST liste convertie clair+dark ; ASTForm branché sur langue globale + ancien header retiré (gardé n° AST auto).
- Migrations 007–010 (auth_sessions, align inv_*/planned_assignments, hub projects/clients/sites).

## 🛠️ DEUX ADMINS DISTINCTS (ne pas mélanger)
- **Super-admin (TON admin)** = `/admin/dashboard` (hors tenant) = **moteur de création des tenants** (Panneau multi-clients). Restylé : PortalHeader mode super-admin (tenant optionnel) + thème clair. API `/api/admin/tenants` (GET liste + POST création tenant+tenant_modules+admin). ⏳ RESTE : câbler le formulaire de création (handleCreateClient encore mock) au POST + rendre la validation des tenants DB-driven (layout `[tenant]` + middleware `validTenants` codés en dur → lire la table `tenants`).
- **Admin tenant** = `/[tenant]/admin` = "autre chose" (couche tenant) : ébauche faite (onglets Abonnement [prix+cases+escompte cumulatif 5%/module add., plafond 30%] / Profils [API /api/admin/users] / Facturation). À retravailler selon le besoin réel.

## ⚠️ MIGRATION À EXÉCUTER : `011_modules_entitlements.sql`
Crée `modules` (catalogue + prix), `tenant_modules` (activation/abonnement), `billing_config` (escompte) + seed catalogue + **CERDIA = tous modules activés**. À lancer dans le SQL editor Supabase. Tant qu'elle n'est pas exécutée : l'onglet Abonnement affiche "catalogue vide" et le gating reste sur la liste codée `ENABLED_BY_TENANT`.

## 🌐 EXIGENCE TRANSVERSALE : MULTI-SITE (user 2026-05-22)
Tout le site des tenants doit fonctionner pour des tenants **multi-site** (un tenant = plusieurs `sites`). Le planner et l'inventaire sources gèrent déjà le multi-site (`site_id`, `inv_locations.site_id`). À prévoir : table `sites` (créée), page de gestion (`/[tenant]/sites` existe), **sélecteur de site global** (SiteContext, comme le menu modules) offrant **« Tous les sites » OU un site précis** (si tenant multi-site), **scoping `site_id`** des données + filtrage des stats par site. À intégrer en portant planner/inventaire et dans le dashboard.

## ⏭️ ORDRE DE TRAVAIL (à suivre dans cet ordre)
1. **PROJETS — moteur IPS** (`app/[tenant]/projects`, source `C:\CLAUDE\app.html`) — PRIORITÉ car le `project_number` alimente tout le reste. État :
   1a. ✅ Onglet Projet (en-tête, champs IPS, save) + page détail `/projects/[id]` + liste cliquable
   1b. ✅ Taux & catalogue (`/projects/taux` : labor_rates + rate_settings + inv_items + seed défauts IPS)
   1c. ✅ Onglet Soumission v1 (`components/projet/SoumissionTab.tsx` : items + main-d'œuvre via taux + matériel via catalogue + totaux, persisté `projects.estimate`). RESTE : voyagement / subsistance / hébergement (sections IPS).
   1d. ✅ Feuille de temps (`components/projet/TempsTab.tsx` : heures réelles via taux + km + matériel, persisté `projects.actuals`, migration 015). RESTE : lier `timesheet_entries` + module paie #21.
   1e. ✅ Coûts (`components/projet/CoutsTab.tsx` : estimé vs réel + écart % + marge). RESTE : export Excel.
   1f. ⏳ Interconnexion : Projet → Job (planner) → AST (pré-rempli) → feuille de temps → facture (#10)
   - ⚠️ Migrations SQL editor : 011/012/013 + **014 (rattrapage colonnes)** + **015 (projects.actuals)**.
2. **PLANNER** (`app/[tenant]/planificateur`, source `c-secur360-planner-master`) : data layer tenant-scoped → calendrier → JobModal (par morceaux) → ressources/congés.
3. **INVENTORY** (`app/[tenant]/inventory`, source `c-secur-inventory-main`) : découper App.jsx ; QR/PDF/xlsx en `dynamic ssr:false`.
4. **Gating réel** : brancher sur la table `tenant_modules` (au lieu de la liste `ENABLED_BY_TENANT` codée) + dashboard de gestion.
5. **i18n + dark complets** sur TOUS les écrans restants (dashboards, sous-pages AST).
6. **INSPECTIONS d'équipement** (nouveau module : fréquences custom, formulaire QR, vendable location).
7. **Facturation + ERP** (Stripe par module, connecteurs `tenant_integrations`).
8. **Merge prod** : `feat/modular-foundation` → `main` (sur feu vert).

> Règle : un module à fond avant de passer au suivant. Commit/push fréquent sur la branche (preview Vercel vérifie le build). Jamais sur `main` sans validation.

## ⚠️ Notes
- Migrations worker_registry (`20241222`/`20250822`) cassées (syntaxe MySQL) → ne pas `supabase db push` ; appliquer le SQL à la main.
- `.env.local` jamais commité. La `service_role` a transité par chat → envisager rotation.
