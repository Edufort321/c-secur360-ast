# 🗂️ Refonte du formulaire de planification — « Mandat » (ex-Job)

> Module : `components/planner` · Formulaire cible : `modules/NewJob/JobModal.jsx` (7450 lignes).
> Décidé : renommer **Job → Mandat** ; refonte **par phases** ; conserver **toutes** les fonctions actuelles + plus ; appliquer les bonnes pratiques web.
> Dernière mise à jour : 2026-05-29.

## 🎯 Objectif et architecture cible (séparation par rôle)
Scinder le mégaformulaire monolithique en **deux niveaux** alignés sur les rôles :

1. **Formulaire « Mandat » — création par Coordonnateur et + (`estCoordonnateur`/`canModify`)**
   Vue légère, rapide, « divulgation progressive ». Contient :
   - Identification (n° de mandat auto, nom, description, client, projet, lieu, succursale en charge).
   - Cadre temporel (dates/heures début-fin, priorité, statut, budget).
   - **Ressources globales** (personnel, équipements, sous-traitants requis ; nombre de personnel requis).
   - **Liste de préparation** matériel / ressources / équipement (source : Ressources, Inventaire, ou texte libre ; quantité, statut).
   - Désignation du **responsable** de l'événement.

2. **Événement (occurrence planifiée) — détail par le Responsable (+ coordonnateur)**
   Ouvert depuis le calendrier. Le responsable y **monte son Gantt** et exécute :
   - Étapes / sous-tâches hiérarchiques (WBS), durées, progression.
   - **Cascade** (dépendances FS/SS/FF/SF + lead/lag) et **travaux parallèles**.
   - **Chemin critique** (CPM) avec surbrillance.
   - Horaires par jour / équipe / individu, équipes numérotées.
   - Fichiers/photos, récurrence, baseline.

> Principe directeur (bonnes pratiques) : **une seule interface fluide** par niveau, pas de saut entre vues ; **divulgation progressive** (l'avancé est replié dans des sections/hamburgers) ; affectations explicites (qui, échéance, « définition de terminé »).

## ✅ Inventaire des fonctions ACTUELLES à conserver (zéro régression)
Onglets : **Formulaire · Gantt · Ressources · Fichiers · Récurrence · Équipes**.
- Identification + cadre temporel + heures planifiées (+ inclure fins de semaine), clients, projets, notes.
- Étapes du projet : hiérarchie récursive, durée, priorité, progression, ressources assignées, dépendances, parallélisme, indicateur chemin critique, ajout sous-tâche, config avancée, suppression.
- Détection de conflits complète : équipements hors service (critique), congés approuvés / maintenances (haute), demandes de congé en attente (moyenne), autres (normale) + navigation vers le job en conflit.
- Gantt hiérarchique avancé : échelle de temps réaliste (heures/dates), flèches de dépendances (SVG), templates WBS, contrôles de vue (jour/…), mode automatique, baseline, alerte dépassement timeline, stats avancées.
- Calculs : chemin critique CPM, bidirectionnels heures/personnel, validation timeline + solutions, dates de tâches avec dépendances, génération échelle Gantt, positionnement des tâches.
- Préparation : items depuis Ressources / Inventaire / texte libre ; type, statut, quantité.
- Ressources : personnel, équipements, sous-traitants (ajout à la volée), gestion des équipes (membres, ajout).
- Horaires par jour : global / par département / individuel, navigation par onglets, stats personnel (vue globale + par département), contrôles globaux.
- Fichiers : documents + photos (DropZone, FilePreview, carrousel).
- Récurrence ; Équipes numérotées + auto-génération + assignations.

## 🔬 Bonnes pratiques retenues (recherche web, mai 2026)
- **Formulaire** : divulgation progressive / multi-étapes, interface unique et fluide (planifier + dispo + heures au même endroit), testabilité d'usage, affectation = attentes + échéance + définition de « terminé ». (UX4Sight, Harris Constructors, Slack, Eleken time-picker)
- **Gantt** : créer une dépendance par **glisser** (survol → cercle → flèche vers la cible) ; **surbrillance du chemin critique** activable ; **parallélisme** via prédécesseur partagé ou dépendance **Start-to-Start** (chevauchement) ; **codes couleur** pour tâches critiques ; chart **accessible/partageable**, mise à jour régulière. (Airtable, monday, Smartsheet, Teamhood, ProjectManager, TeamGantt)
- **Dépendances** : 4 types **FS** (défaut), **SS**, **FF**, **SF** ; **lead** (chevauchement) / **lag** (délai) ; **tampons** sur les tâches critiques ; relations claires pour l'allocation des ressources. (Asana, Kantata, Ganttic, ProofHub, Moovila, Microsoft Project)

## 🔗 Stratégie d'interconnexion complète
**Principe de garde** : chaque lien/onglet n'apparaît que si le module est **débarré** pour le tenant — via `useEntitlements(tenant)` (table `tenant_modules`). Clés : `projects, ast, inventory, equipment, timesheets, logbook, inspections, planner`. Dégradation propre si module absent ou clé externe (Google Maps) manquante.
**Règle de données** : **référence (id)** pour la navigation/synchro **+ snapshot** pour l'historique immuable (ex. `client_snapshot`). **Permissions** : coordonnateur+ crée les liens structurants (projet, client, AST, préparation) ; le responsable consomme/exécute (Gantt, avancement).

| Module (clé) | Entrant → préremplit le mandat | Sortant ← le mandat alimente |
|---|---|---|
| **Projets** (`projects`) | client, **lieu/adresse (Google Maps)**, budget, cadre de dates, n° projet | mandat = tâche planifiée du projet ; heures/coûts → `projects_actuals` ; budget vs réel |
| **Clients** (`clients`) | coordonnées (id + `client_snapshot`) | facturation, historique client |
| **AST** (`ast`) | AST existante rattachée | **créer/rattacher une AST préremplie avant travaux** (lieu, client, personnel, équipements, dates) — lien bidirectionnel `ast_id` |
| **Inventaire** (`inventory`) | catalogue matériel pour la **liste de préparation** | réservation / sortie de stock à la confirmation (item_id + quantité) |
| **Personnel** (`planner_personnel`) | ressources humaines, rôles (coordonnateur/responsable), succursale/dépt, dispo | assignations + heures planifiées |
| **Congés** (`planner_conges`) | détection de conflits de disponibilité | — |
| **Équipements/Véhicules** (`equipment`) | ressources matérielles + conflits (hors service/maintenance) | réservation ; véhicules → carnet de bord (km/avantages) |
| **Feuilles de temps** (`timesheets`) | — | heures planifiées (Gantt) = référence ; comparaison planifié vs réel ; pont Paie |
| **Facturation / Comptabilité** | — | heures + matériel + sous-traitants → facturation projet + écriture vente→GL |
| **Inspections** (`inspections`) | équipements du mandat à inspecter | — |
| **Tableau de bord** | — | agrégation (charge, conflits, avancement, chemin critique) |

**Ajouts modèle de données (migration future)** : `planner_jobs.project_id`, `client_id`, `ast_id`, `responsable_id` ; liens inventaire dans `preparation` (JSONB déjà présent). Adresse/lieu géocodés (lat/lng) optionnels.

## 📋 PLAN PAR PHASES (commit + push après chaque phase)

### P1 — Sauvegarde fonctionnelle ⛔ BLOQUANT  ✅ FAIT
- [x] Bug : `appData.saveJob` est **undefined** (le hook expose `addJob`/`updateJob`/`deleteJob` mais pas `saveJob`), alors que `App.jsx` et `PlanificateurFinal` l'utilisent comme handler `onSave`/`onSaveJob` → la sauvegarde d'un mandat ne fait rien.
- [x] Ajouter `saveJob` dans `useAppData` (route add/update selon existence, comme `savePersonnel`) + l'exporter.

### P2 — Renommage + mise en page + condensation (hamburgers) + débordements  ✅ FAIT
- [x] Renommer **Job → Mandat** dans l'UI (titre modal, libellés Numéro/Nom, confirm suppression, message récurrence). Identifiants de code inchangés.
- [x] Onglets responsives : rangée complète ≥1024px, **menu déroulant donnant accès à TOUS les onglets sous 1024px** (au lieu de l'ancien comportement qui forçait Gantt et bloquait la navigation mobile).
- [x] Suppression de l'effet qui forçait l'onglet Gantt sous 640px.
- [x] Débordements Gantt : retrait du `minWidth:800px` sur le viewport de l'aperçu (scroll interne maîtrisé, contenu 1200px conservé) ; vue « côte à côte » étapes|Gantt qui **s'empile sous 1024px** (`lg:grid-cols-2`).
- [x] Validation de sauvegarde renforcée : champs requis nommés, contrôle cohérence des dates, garde si `onSave` absent, notification de succès, bascule auto vers l'onglet Formulaire en cas d'erreur.
- [ ] (Reporté P5) Condenser davantage les fonctions avancées dans des sections repliables (divulgation progressive poussée).

### P3 — Gantt : cascade, travaux parallèles, priorité (fiabilisation)
- [ ] Modèle de dépendances complet : types **FS/SS/FF/SF** + **lead/lag**.
- [ ] Recalcul automatique des dates en cascade (décalage des successeurs).
- [ ] Travaux parallèles (prédécesseur partagé / SS) lisibles dans le Gantt.
- [ ] Chemin critique (CPM) recalculé + surbrillance ; priorité visible (couleur).
- [ ] Création/édition de dépendance par interaction directe (glisser) si faisable.

### P4 — Séparation par rôle (Mandat vs Événement) + interconnexion des modules
- [ ] Extraire le **formulaire Mandat léger** (coordonnateur+) : identification, dates, ressources, **liste de préparation**, désignation du responsable.
- [ ] Vue **Événement** (responsable) : Gantt + horaires + équipes + avancement.
- [ ] Gates de permission (`estCoordonnateur`/`canModify` vs responsable).
- [x] **Interconnexion (FAIT)** : autocomplete Clients + Projets relie maintenant le mandat aux ENREGISTREMENTS (`clientId` via `clients.id` ou `projects.end_client_id`, `projectId` via `projects.id`) — plus seulement le texte. `prefillFromProject` lie aussi le client. Inventaire (table `items`) et Ressources (planner_personnel/planner_equipements) déjà câblés dans la liste de préparation. Badges « Liens actifs » (Projet/Client/AST) avec détachement. Persistance via colonnes 089 (column-strip tolérant). _Pont Facturation/Comptabilité : via le transfert soumission→projet existant._
- [x] **Lien AST (FAIT)** (si le module AST est **activé** pour le tenant — vérif entitlement `tenant_modules`) : section « Analyse sécurité (AST) » visible seulement si activé ; rattacher une AST existante (50 dernières) OU créer une AST **préremplie** (lieu, client, date, nb travailleurs) via `/ast/nouveau?...` (la page lit les query params -> `initialData.taskInfo`). Si AST non activé : section masquée.
- [x] **Documentation de projet en pièces jointes** (P4.5 FAIT) : onglet Fichiers fonctionnel ; `handleFilesAdded` ne conserve que les champs sérialisables (le File brut cassait le JSONB) → persistance propre dans `documents`/`photos`. _Optimisation à venir : upload Supabase Storage au lieu du data URL base64._
- [x] **Endroit des travaux + Google Maps (FAIT)** : champ « Endroit des travaux » + lien « Voir sur Google Maps » + carte intégrée (API Embed) + **autocomplete d'adresse (Places JS API)** via `lib/googleMaps.ts` (chargeur unique, callback-ref, restriction pays CA) qui **géocode** la sélection dans `lieuLat/lieuLng` (badge « Coordonnées enregistrées » ; embed utilise les coords si dispo). L'édition manuelle réinitialise les coords. **Préremplissage depuis Projets/Clients** : adresse/lieu remplis via l'autocomplete client/projet et `prefillFromProject`. Sans `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` : champ texte simple + lien Maps. Colonnes `lieuLat/lieuLng` (089).

### P4 — Météo (planner + AST)
- [ ] Afficher la **météo de l'endroit des travaux** aux dates du mandat (prévisions si dans la fenêtre, sinon note saisonnière) dans le planificateur, ET les **conditions météo** dans l'**AST** (évaluation des dangers). Clé **`WEATHER_API_KEY`** = **secret serveur** (pas de `NEXT_PUBLIC_`) → fetch via une **route API** `/api/weather?lat=&lng=&date=` (ne jamais exposer la clé côté client). Clé déjà dans Vercel (statut « Needs Attention » → valider). S'appuie sur `lieuLat/lieuLng` (089).

### P5 — Nettoyage + polish UX
- [ ] Supprimer les doublons morts : `components/planner/components/Modals/JobModal.jsx`, `.backup`, `_temp`.
- [ ] Découper le mégafichier en sous-composants (Form, Gantt, Ressources, Préparation, Horaires) pour la maintenabilité.
- [ ] Revue d'accessibilité, états de chargement/sauvegarde, retours visuels.

## 🔌 Sous-système associé
Voir **`TODO-POINTAGE-PUSH-PLANIFICATEUR.md`** : pointage « push » in/out (app + QR), ajustement travailleur, validation superviseur, banner imprimable, facturation sélective + ressources, présence QR + heures max, notifications, répertoire de stats (occupation 40 h), et notes Évaluation/Paie (primes, commissions, types de temps). Contient les **décisions à trancher** avant implémentation.

## 🛠️ Règles de travail
- `npx tsc --noEmit` = 0 erreur + build OK avant chaque push.
- Commit + push après CHAQUE phase sur `feat/modular-foundation` ET `main`.
- Messages de commit en ASCII sans accents.
