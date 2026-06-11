# Interconnexion du TEMPS — spec & plan

**Vision (Eric) :** le **temps** est le fil conducteur. Il est saisi dans la **feuille de temps**
(chaque ligne associée à un **projet/soumission** OU à une **tâche récurrente** définie par le tenant),
puis il **remonte partout** : fiche/dashboard **projet**, **facturation**, **paie**, **planificateur**.
Confidentialité : la feuille de temps est **strictement personnelle** (aucune contamination entre
utilisateurs ; les montants $ ne s'affichent pas dans la feuille — la paie est ailleurs).

## Pivot
- **`projects`** (clé `project_number` / `id`) = hub : soumission → projet → planificateur → temps → facturation.
- **`tenant_recurring_tasks`** (NOUVEAU) = catalogue de tâches récurrentes défini par le tenant
  (ex. bureau, atelier, soumission, administration, formation…). Une ligne de temps non liée à un
  projet est liée à une de ces tâches.

## Ce qui EXISTE déjà
- **Feuille de temps** (`app/[tenant]/timesheets/[id]/page.tsx`) : lignes avec `category`
  (`project|admin|atelier|autre`) + **sélecteur de projet** par ligne ; **plusieurs lignes/jour** ;
  dépenses (table `timesheet_expenses`, ont un `project_id`, liées à la feuille). Scoping personnel
  (liste + garde de propriété sur la fiche). Heures seulement (montants masqués).
- **Projects (hub)** (`projects`, migration 010) : `project_number`, `title`, `client_name`, `estimate`…
- **Planificateur** : `planner_jobs.projectId` (TEXT, **pas** FK) + récurrence **au niveau du job**.
- **Admin → Employés & Accès** (`admin/page.tsx`, composant `Employes` ~ligne 3620) : 4 sous-onglets
  `personnel | postes | sousclasses | comptes`.
- **Paie** : onglet admin `paie` ; `labor_rates`, `employee_profiles` (taux horaire), totaux de feuille.
- **Facturation** : `lib/invoicing.ts`, onglet `factures`.

## Ce qui MANQUE (à construire)
1. **Catalogue de tâches récurrentes** : table `tenant_recurring_tasks` + **5e sous-onglet** « Tâches
   récurrentes » dans Employés & Accès (CRUD : nom, code, actif, ordre, facturable oui/non).
2. **Lien feuille de temps → tâche récurrente** : `timesheet_entries.recurring_task_id` + sélecteur
   par ligne « Projet **ou** Tâche » (quand `category != project`, choisir une tâche du catalogue).
3. **Lien planificateur → projet / tâche récurrente** : `planner_jobs.recurring_task_id` + aligner
   `planner_jobs.projectId` sur `projects.id` (UUID + FK — déjà recommandé dans `AUDIT-INTERMODULE.md`).
4. **Remontée du temps au PROJET** :
   - **Vue « Heures du projet »** : toutes les heures saisies (tous employés) regroupées par projet
     → base de **facturation** (heures × taux).
   - **Stats temps dans le dashboard projet** : heures cumulées (reg/OT/premium), par employé, coût
     (réservé admin).
5. **Dépenses liées à la LIGNE** : `timesheet_expenses.entry_id` (en + de `timesheet_id`) → remontée
   des dépenses au bon projet/tâche.
6. **Facturation** : heures facturables par projet (× taux grille) ; dépenses refacturables.
7. **Paie** : confirmer que les heures/totaux remontent correctement (déjà via totaux de feuille).

## Plan par PHASES
- **P1 — Catalogue de tâches récurrentes** *(fondation)* : migration `tenant_recurring_tasks` +
  `lib/recurringTasks.ts` + sous-onglet admin CRUD.
- **P2 — Association feuille de temps** : `recurring_task_id` sur la ligne + sélecteur Projet/Tâche +
  dépense liée à la ligne (`entry_id`).
- **P3 — Association planificateur** : job → projet/tâche ; `projectId` en UUID + FK ; le planning
  d'un projet/tâche pré-remplit la feuille (interconnexion descendante).
- **P4 — Remontée projet** : vue « Heures du projet » + bloc stats temps dans le dashboard projet.
- **P5 — Facturation** : heures (× taux) + dépenses refacturables par projet → factures.

## Décisions à confirmer avec Eric
- **Taux pour facturation** : `catalogue_taux` (devis) vs `labor_rates` (paie réel) — lequel pour
  refacturer le temps au client ? (par défaut : taux de facturation du projet/soumission.)
- **Tâche récurrente facturable ?** : certaines tâches (ex. « soumission », « administration ») sont
  internes (non facturables) ; flag `billable` par tâche.
- **Granularité dépense** : à la ligne (P2) — confirmer.
