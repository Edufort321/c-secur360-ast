# C-Secur360 — Plan d'intégration modulaire (Planner + Inventaire)

> Statut : **plan validé, avant code.** Dernière mise à jour : 2026-05-21.

## 1. Vision produit

SaaS **multi-tenant modulaire** + **plateforme inter-connectée pilotée par le Projet**.

Modules au départ — **AST**, **Planner**, **Inventaire**, **Projets/Core** — chacun **activable indépendamment par tenant** selon l'abonnement. Les modules non souscrits sont **visibles mais verrouillés** (🔒 grisés) avec un **modal d'upsell** (prix + checkout Stripe). Gestion centralisée via dashboard. **Architecture extensible** : ajouter un module futur ne doit toucher aucune plomberie.

**Colonne vertébrale = le Projet.** Un projet (moteur reconstruit depuis `app.html` « IPS – Gestion de Projet ») porte un **# unique** qui circule : Projet → **Job** (planificateur, planifié avec le #) → **AST** (pré-rempli avec les données du projet) → **feuille de temps** → **facturation**. Le matériel projet est relié à l'**inventaire** (`inv_items`).

**Adaptabilité** : aucune donnée métier en dur. Taux (`labor_rates`, `rate_settings`), statuts, types et catalogues sont **configurables par tenant** → la plateforme s'adapte à différents types d'entreprises. Un « tenant tout inclus » dispose d'un **moteur initial** (catalogue matériel + taux pré-remplis, ré-éditables) mais tout fonctionne aussi **à vide**.

**Greffage ERP** : `projects.source_system`/`external_id`/`external_data` + table `tenant_integrations` + `integration_sync_log` permettent de pousser/tirer projets, matériel et factures vers un ERP externe (Sage, Dynamics, QuickBooks, API custom).

## 2. Décisions figées

| Sujet | Décision |
|---|---|
| Stratégie | Port **natif complet** en Next.js/TS (pas d'îlot Vite, pas d'iframe) |
| Source de vérité données | **Supabase** (Prisma défini mais non utilisé au runtime) |
| Catalogue modules | Table DB `modules` + registre code `lib/modules/registry.ts` |
| AST | **Module à part entière** (gated comme les autres) |
| Module verrouillé | **Modal d'upsell** in-context |
| Planner | **Remplacer** le prototype existant par le port de `planner-master` |
| Inventaire | Nouveau, porté depuis `c-secur-inventory-main` |
| Tables modules | Namespacées `planner_*` / `inventory_*`, avec `tenant_id` + RLS |
| `tenant_modules.module_key` | **TEXTE LIBRE** (pas de CHECK enum → pas de migration par module) |
| Offline-first (v1) | Abandonné en v1 → Supabase direct ; réintroduit plus tard |
| Auth | Réelle (cookie/session AST), fin du mock & du localStorage-auth |

## 3. État des lieux (repos sous `C:\CLAUDE\`)

- **`c-secur360-ast-main`** — l'app en ligne. Next.js 14 App Router, TS, multi-tenant `app/[tenant]/...`. Auth = cookie `auth_token` → table `auth_sessions`, vérif rôle dans `middleware.ts` (pose `x-user-id/-role/-email/-tenant`). Menu : `components/layout/DashboardSidebar.tsx`. UI : `components/ui/{Button,Card}.tsx`. Billing Stripe déjà présent : tables `customers/subscriptions/invoices`, API `app/api/billing/*`, page `app/[tenant]/pricing`, `app/admin/billing`. Tenant : `id, subdomain, companyName, plan, isActive`. **⚠️ pas un dépôt git.**
  - Planner existant = `app/[tenant]/planificateur/page.tsx` → `components/planificateur/PlanificateurFullscreen.tsx` (956 l., **prototype localStorage, user mocké**) → à remplacer.
- **`c-secur360-planner-master`** — React+Vite SPA. Tables : jobs, personnel, equipements, postes, succursales, conges, departements. `JobModal.jsx` = **7195 lignes** (port incrémental). recharts, contextes Theme/Language, auth localStorage factice, `import.meta.env.VITE_*`.
- **`c-secur-inventory-main`** — React+Vite SPA. Tables : items, item_locations, departments, categories, movements, users. Browser-only : html5-qrcode, qrcode.react, jspdf, html2canvas, xlsx (→ dynamic import `ssr:false`). `App.jsx` monolithe ~7000 l., auth factice.

## 4. Couche entitlements (cœur extensible)

### Schéma DB (migrations Supabase, `supabase/migrations/`)
```sql
-- Catalogue des modules (gérable via dashboard, ajout sans redéploiement)
CREATE TABLE modules (
  key             text PRIMARY KEY,        -- 'ast' | 'planner' | 'inventory' | <futur>
  name_fr         text NOT NULL,
  name_en         text NOT NULL,
  description_fr  text,
  description_en  text,
  stripe_product_id text,
  icon_key        text,                    -- résolu par le registre code
  base_path       text NOT NULL,           -- segment de route sous /[tenant]/
  min_role        text DEFAULT 'user',
  sort_order      int  DEFAULT 0,
  is_active       boolean DEFAULT true
);

-- Entitlement par tenant
CREATE TABLE tenant_modules (
  tenant_id   text NOT NULL,
  module_key  text NOT NULL,               -- TEXTE LIBRE, pas de CHECK enum
  enabled     boolean DEFAULT false,
  source      text DEFAULT 'manual',       -- 'subscription' | 'manual' | 'trial'
  expires_at  timestamptz,
  PRIMARY KEY (tenant_id, module_key)
);
-- + RLS : lecture par membres du tenant ; écriture service_role / super_admin
```

### Registre code (`lib/modules/registry.ts`)
Seulement le non-stockable-en-DB : icône lucide, composant lazy, guard.
```ts
export const moduleRegistry = {
  ast:       { icon: Shield,   load: () => import('@/app/[tenant]/ast/AstModule') },
  planner:   { icon: Calendar, load: () => import('@/components/planner') },
  inventory: { icon: Package,  load: () => import('@/components/inventory') },
} satisfies Record<string, ModuleUI>;
```

### Accès
- `lib/entitlements.ts` → `getTenantModules(tenantId)` (merge catalogue `modules` × `tenant_modules`).
- `hooks/useEntitlements()` (client) → `{ ast:true, planner:false, ... }`.
- **Sidebar, route guards, pricing** itèrent le catalogue. Ajouter un module = `INSERT modules` + 1 entrée registre + pages sous `app/[tenant]/<base_path>/`.

## 5. Phasage

### Phase 0 — Fondations
- `git init` + .gitignore + commit initial (sécurité/rollback).
- **Auth réelle** : `lib/auth.ts` `getCurrentUser()` (lit headers middleware), `app/api/me/route.ts`, `hooks/useCurrentUser.ts`. Retirer le user mocké.
- **Entitlements** : migrations `modules` + `tenant_modules` (+ RLS), seed des 3 modules, `lib/entitlements.ts`, `lib/modules/registry.ts`, `hooks/useEntitlements.ts`.
- **Migrations data modules** : tables `planner_*` et `inventory_*` (tenant_id + RLS).

### Phase 1 — Gating UI (testable avec AST seul activé)
- Sidebar : afficher tous les modules ; verrouiller (🔒, grisé) ceux désactivés.
- **Modal d'upsell** (prix + bouton checkout Stripe).
- **Route guards** : page d'un module désactivé → bloque + propose l'upsell (sécurité serveur, pas seulement UI).

### Phase 2 — Port Planner (remplace l'existant)
- Data layer tenant-scoped (Supabase direct, sans offline en v1).
- Contextes Theme/Language en providers `'use client'`.
- Port JSX→TSX incrémental : `PlanificateurFinal` → `JobModal` (par morceaux) → `Resource/*` → `CongesModal` → `Dashboard` (recharts).
- Auth réelle + permissions (`niveauAcces`). Supprimer `PlanificateurFullscreen.tsx` + auth localStorage.

### Phase 3 — Port Inventaire
- Routes `app/[tenant]/inventory/` (+ `/scan`, `/admin`).
- Découper `App.jsx` monolithe en pages.
- `dynamic(..., { ssr:false })` pour html5-qrcode / qrcode.react / jspdf / html2canvas / xlsx.
- Data tenant-scoped (`inventory_*`), auth réelle.

### Phase 4 — Billing par module
- 1 Stripe Product par module (prix mensuel/annuel) → `modules.stripe_product_id`.
- Webhook Stripe + `api/billing/sync` → met à jour `tenant_modules.enabled` (source `subscription`).
- Self-serve : modal d'upsell → checkout → retour → module débloqué.
- Override super_admin (dashboard) : activer/désactiver pour essais/gratuités.

### Phase 5 — Finitions
- i18n FR/EN aligné, thème/UI unifiés (`Button`/`Card`), tests multi-tenant × multi-module, nettoyage fichiers temporaires.

## 6. Risques
- `JobModal` 7195 l. = principal poste d'effort → port incrémental.
- Réintroduction offline-first (post-v1) = complexité ; assumé hors v1.
- Tables namespacées vs consolidation future avec personnel/équipement AST.
- Cohérence des `tenant_id` (cuid côté Tenant) entre Prisma et tables Supabase.
