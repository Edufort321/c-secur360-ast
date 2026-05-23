# Schéma Supabase — modèle de données & index des migrations

> Les définitions SQL sont désormais des **migrations numérotées** dans
> `supabase/migrations/` (source de vérité unique). Ce dossier ne contient plus
> que cette documentation du modèle.

## Migrations net-new (à appliquer dans l'ordre)

| # | Fichier | Rôle |
|---|---|---|
| 007 | `007_identity_auth_sessions.sql` | `auth_sessions` (débloque `middleware.ts`) + note consolidation `profiles`→`users` |
| 008 | `008_inventory_alignment.sql` | ALTER `inv_*` réels : `tenant_id`, `cost_price`/`sale_price`, `inv_categories` |
| 009 | `009_planner_alignment.sql` | ALTER `planned_assignments` réel : `tenant_id` + `planner_leaves` (congés) |
| 010 | `010_core_projects_hub.sql` | Pivot : `clients`, `sites`, `projects`, `labor_rates`, `rate_settings`, `project_materials`, ERP + normalisation `project_id` (uuid + FK) |

(001–006 + `worker_registry_*` = migrations existantes, non modifiées.)

## Contexte

La DB live (projet C-Secur360) a **34 tables** : suite field-service + facturation +
RBAC + paie déjà en place. Le SQL historique du repo était périmé. On **ne reconstruit
pas — on s'aligne et on complète**. Seul vrai manque : aucune table
`projects`/`clients`/`sites`, alors que `project_id`/`client_id`/`site_id` sont des clés
« molles » (sans FK) utilisées partout. La migration 010 comble ce manque.

## Modèle validé (2026-05-21)

| Concept | Réalité | Décision |
|---|---|---|
| **tenant** | `tenants.id` (texte) | ancrage unique `tenant_id` partout |
| ancien `client_id` (uuid) de `inv_*` | = le tenant (`app/utils/compliance.ts:120`) | + `tenant_id` ajouté |
| **client final** | en dur (`data/clients`) | table `clients` → `projects.end_client_id` |
| **site** | mock (`MultiSiteManager`) | table `sites` → `projects.site_id` |
| **projet** | inexistant (clé molle) | table `projects` (hub, `project_number` = le #) |
| **identité** | `users` (texte, vide) vs `profiles` (uuid, ignorée) | identité = `users` ; `profiles` consolidée |
| **auth** | `middleware.ts` attend `auth_sessions` (absente) ; login en dur | `auth_sessions` + login bcrypt (à coder) |

### Interconnexion (le # circule)
```
projects.project_number ──┬─→ planned_assignments.project_id   (planning)
                          ├─→ timesheet_entries.project_id      (feuille de temps)
                          ├─→ ast_forms.project_id              (AST pré-rempli)
                          ├─→ inv_transactions.project_id       (matériel consommé)
                          └─→ vehicle_logs.project_id           (déplacements)
project_materials ──→ inv_items                                 (estimé/réel ↔ inventaire)
```
`project_id` est normalisé en **uuid + FK → projects(id)** (tables vides → sans risque).

## Application

- **CLI** : `supabase db push` applique les migrations en attente (007→010) dans l'ordre.
- **SQL Editor** : coller le contenu de chaque fichier, dans l'ordre 007→008→009→010.

Les blocs de conversion `project_id` sont **gardés** (ne s'exécutent que si la table
est vide → `RAISE NOTICE` sinon). Aujourd'hui l'opérationnel est vide → sûr.

## Sécurité (dette connue)

Policies `FOR ALL USING (true)` (héritées de l'existant) = pas d'isolation tenant au
niveau DB. À durcir par scoping `tenant_id` après branchement de l'auth réelle.
Scoping applicatif (`.eq('tenant_id', …)`) obligatoire en attendant.
