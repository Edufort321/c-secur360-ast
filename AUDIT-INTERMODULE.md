# 🔎 Audit global de la logique inter-module — C-Secur360

> Objectif : cartographier comment les modules s'interconnectent, repérer duplications/silos/incohérences, évaluer la généricité « tout type de projet », et combler les écarts de bonnes pratiques Gantt. Date : 2026-05-30.

## 1. Inventaire des modules (registre `lib/modules/registry.ts`)
`admin · projects · ast · permits · accidents · near_miss · planner · inventory · equipment · inspections · timesheets · logbook · todo`. Activation par tenant via `tenant_modules` (`useEntitlements`).

## 2. Trois architectures coexistent (constat clé)
1. **Hub Projets (migration 010)** — backbone d'interconnexion *prévu* :
   - `projects` (statut `soumission`→…, `submission_number`, `po_amount`, `project_type`, `pricing_mode`, `estimate` JSONB, `global_price`), `clients`, `sites`.
   - `labor_rates` (rate_regular/overtime/premium, `effective_date`, code), `rate_settings` (category/key/value), `project_materials` → `inv_items`.
   - FK `project_id` posées sur `ast_forms`, `confined_space_permits`, et (si vides) `timesheet_entries`, `planned_assignments`, `vehicle_logs`, `inv_transactions`. + `tenant_integrations`/`integration_sync_log` (ERP).
2. **Sous-système Planificateur (`planner_*`)** — *autonome*, peu relié au hub :
   - `planner_jobs` (mandats), `planner_personnel`, `planner_equipements`, `planner_conges`, `planner_postes`, `planner_succursales`, `planner_departements`.
   - Lien au hub : **faible** — j'ai ajouté `planner_jobs."projectId"` (TEXT, migration 089) mais le hub utilise `projects.id` (UUID) ; pas de FK.
3. **Comptabilité (`gl_*`, migrations 085-088) + Facturation commerce (`commerce_*`, 086-087)** :
   - `gl_accounts/journals/entries/lines`, `commerce_invoices/transactions`, alimentés par ventes + paie. Reliés aux feuilles de temps (timesheets) mais **pas** au hub Projets ni au planner.

## 3. Matrice d'interconnexion (réel vs visé)
| Lien | État actuel | Cible |
|---|---|---|
| AST / Permits → Projets | ✅ FK `project_id` (010) | OK |
| Timesheets/Assignations/Véhicules → Projets | ⚠️ FK conditionnelle (si table vide à la migration) | À fiabiliser |
| Inventaire → Projets | ✅ `project_materials` → `inv_items` | OK |
| **Planner (mandats) → Projets** | ❌ `projectId` TEXT non-FK, pas de transfert soumission→projet câblé | **À unifier** |
| **Soumissions (090) ↔ Projets/labor_rates** | ❌ **duplication** (voir §4) | **À réconcilier** |
| Soumission/Planner → Facturation/Compta | ❌ non câblé | À bâtir (S5 + convergence) |
| Personnel planner ↔ Personnel admin (planner_personnel) | ⚠️ deux notions de personnel | À clarifier |

## 4. ⚠️ Duplications / incohérences à trancher
1. **Taux** : `catalogue_taux` (090, mon ajout : MO bureau/chantier + mult_supp/maj) **vs** `labor_rates` (010 : regular/overtime/premium par code + effective_date) **vs** `rate_settings` (010 : category/key/value). Trois sources de taux. → **Décider une source de vérité** (recommandation §6).
2. **Soumission** : `soumissions`/`soumission_items`/`soumission_lignes` (090) **vs** `projects` (010 : `status='soumission'`, `submission_number`, `estimate` JSONB). Deux modèles de devis. → réconcilier : la soumission (090) doit *devenir/alimenter* un `projects` (transfert), pas vivre en parallèle.
3. **project_id type** : UUID (hub) vs TEXT (`planner_jobs.projectId`, 089). → aligner sur UUID + FK.
4. **Personnel** : `planner_personnel` (planner) vs `users`/profils RH (admin). Risque de double saisie (déjà noté dans [[comptabilite-fiscal-canada-ref]]).
5. **Matériel** : `project_materials`/`inv_items` (hub) vs `preparation` JSONB (planner_jobs) vs `event_resources` (pointage, planifié). → converger vers `inv_items`.

## 5. Généricité « tout type de projet »
- `projects.project_type` (défaut `budgetaire`) + `pricing_mode` (`ventile`/`global`) : **déjà générique** ✅.
- Soumission (090) : catégories MO Bureau/Chantier + Voyagement/Subsistance/Hébergement/Matériaux = **assez universelles**, pas de hardcoding métier ✅. _Amélioration : rendre les catégories/labels configurables par tenant pour couvrir tout secteur._
- Planner (mandats) : générique (pas de dépendance métier). ✅
- **Action** : exposer `project_type` à la création (mandat/soumission) et permettre des catégories de lignes personnalisables.

## 6. Recommandations (réconciliation) — par priorité
1. **Source de vérité des taux** : promouvoir **`catalogue_taux` versionné** (année/révision) comme catalogue *de soumission*, et **migrer/aligner** `labor_rates` (paie/réel) pour s'y référer ou inversement. Au minimum : documenter qui sert à quoi (catalogue = devis ; labor_rates = paie réelle) et éviter double saisie.
2. **Soumission → Projet** : à l'acceptation, une `soumission` **crée un `projects`** (status `soumission`→`actif`, `submission_number`=numéro, `estimate` rempli) et pose `soumissions.project_id`. Le planner recherche alors par `project_number` (flux déjà spécifié).
3. **Aligner `planner_jobs.projectId`** sur `projects.id` (UUID) + FK ; le mandat devient un « événement » d'un projet.
4. **Converger vers Facturation/Compta** : `projects` (devis + réel) → `commerce_invoices` → `gl_entries` (vente→GL déjà livré). Brancher temps (timesheets/pointage) + matériel (`project_materials`) sur la facture.
5. **Unifier le matériel** sur `inv_items` (préparation planner + event_resources → références inventaire).

## 7. Bonnes pratiques Gantt — écarts (vs recherche web)
| Pratique | État | Action |
|---|---|---|
| Dépendances FS/SS/FF/SF + lag | ✅ (P3) | — |
| Chemin critique (CPM) | ✅ (P3, corrigé) | — |
| Travaux parallèles | ✅ (P3, corrigé) | — |
| Baseline | ✅ | — |
| Progression (%) | ✅ | — |
| **Création de dépendance par glisser** (drag-to-link) | ❌ | À ajouter (survol → poignée → flèche) |
| **Nivellement de ressources** (parallèle/séquentiel selon personnel dispo) | ❌ | S4b (déjà spécifié) |
| **Jalons (milestones)** | ❌ | Ajouter type « jalon » (durée 0) |
| **Codes couleur** par priorité/critique | ⚠️ partiel | Renforcer la légende |
| **Lead/lag visibles** | ⚠️ modèle ok, UI à exposer | UI lead/lag par dépendance |
| **Export Gantt** (PDF/image) | ❌ | À ajouter (réutiliser jsPDF) |

## 8. Prochaines étapes proposées
- Avant de bâtir l'UI Soumission (S2), **arbitrer §6.1 et §6.2** (source des taux + relation soumission/projets) pour ne pas figer une duplication.
- Puis S2 (UI) → S4 (pré-montage Gantt + nivellement S4b) → S5 (convergence Facturation), en s'appuyant sur le hub `projects`.
- Compléter les écarts Gantt (§7) au fil de S4.
