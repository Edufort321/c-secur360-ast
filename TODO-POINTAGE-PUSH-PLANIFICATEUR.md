# ⏱️ Roadmap — Pointage « Push », présence QR, facturation, paie & stats (planificateur)

> Sous-système adjacent à la refonte du formulaire Mandat ([[TODO-REFONTE-PLANIFICATEUR]]).
> Source : spécification fournie par le client (conversation de cadrage). Stack existante : Next.js + Supabase + React, conventions du repo.
> Principe transverse : **une seule fonction d'agrégation** réutilisée partout (contrôleur, module projet, feuille de temps client, paie, stats) pour des chiffres concordants. Tout horodatage en **timestamptz UTC**, affiché en heure locale. Conditionner les liens aux **modules activés** (`useEntitlements`).

## 🎯 Vision d'ensemble (chaîne complète)
Pointage push (in/out) → ajustement travailleur → validation superviseur → flag facturable par tâche → compilation temps + ressources filtrée jour/quart → contrôleur + module projet → sorties **feuille de temps client** (facturable seulement) et **feuille de paie** (tout, approuvé). En parallèle : **présence QR** (sécurité/conformité), **alertes d'heures max**, **répertoire de stats**.

## 🗃️ Modèle de données (nouvelles tables Supabase)
- **time_entries** : id, project_id, event_id (nullable), worker_id, punch_in_at, punch_out_at, duration_raw_seconds, duration_rounded_minutes, source ('app'|'qr_scan'), status ('active'|'pending_review'|'approved'|'rejected'), work_date, shift, created_at, updated_at.
  - Ajustement : is_adjusted, adjusted_punch_in_at, adjusted_punch_out_at, adjustment_reason, adjusted_by, adjusted_at. **Ne jamais écraser** punch_in_at/punch_out_at (piste d'audit) ; durée facturable = valeurs ajustées si présentes, sinon réelles.
  - Validation : reviewed_by, reviewed_at, rejection_reason.
  - **Index unique partiel** : `unique (worker_id) where status = 'active'` (un seul punch actif par travailleur ; passer à `(worker_id, project_id)` si besoin futur).
- **time_rounding_rules** : id, org_id/tenant_id, interval_minutes (check 15|30), mode ('nearest'|'up'|'down', défaut nearest), grace_minutes (défaut 0), updated_at. Défaut : 15 min, nearest.
- **event_resources** (réutiliser si existe) : id, event_id, resource_type ('material'|'equipment'|'other'), label, quantity, unit, unit_cost (nullable), is_billable (hérite de la tâche, surchargeable), work_date, shift, entered_by, created_at.
- **attendance_logs** : id, project_id, event_id (nullable), person_id (nullable), person_type ('employee'|'subcontractor'|'client_rep'), display_name, company, check_in_at, check_out_at, status ('on_site'|'left'), source ('qr_scan'), created_at. Un seul log on_site actif par personne/projet.
- **hour_limit_rules** : id, scope ('client'|'internal'), org_id/client_id, max_hours_continuous, warning_threshold_pct (ex. 90), applies_to (types de personnes), active. La règle la plus stricte (client vs interne) l'emporte.
- **notification_queue** : id, time_entry_id, recipient_id, channel ('email'|'sms'), template, status ('pending'|'sent'|'failed'), error, created_at, sent_at. Clé unique (time_entry_id + template) pour l'idempotence.
- **notification_preferences** : user_id, email_enabled, sms_enabled, phone_number.
- Flag tâche/événement : is_billable (défaut true), billable_set_by, billable_set_at.

## 📋 PHASES
### PP1 — Pointage Push in/out + arrondi
- [ ] Tables time_entries + time_rounding_rules + RLS (travailleur = ses entrées ; admin = org ; règles lecture org / écriture admin).
- [ ] Module partagé `roundDuration(rawMinutes, {intervalMinutes, mode, graceMinutes})` (nearest=Math.round, up=ceil, down=floor ; appliquer la grâce avant arrondi).
- [ ] Deep link QR événement `/[tenant]/planificateur/event/{event_id}?action=punch` → résout project_id, affiche écran pointage.
- [ ] Push In (insert status='active', source app|qr_scan ; gérer l'erreur d'unicité = punch déjà actif). Push Out (set punch_out_at, calcule raw + rounded, statut → pending_review).
- [ ] Idempotence : réouverture/rescan d'un punch actif → afficher « en cours » + bouton Push Out (pas de doublon).
- [ ] Écran admin règle d'arrondi (intervalle 15/30, mode, grâce).

### PP2 — Ajustement travailleur + validation superviseur
- [ ] UI « Corriger » (heures début/fin + raison obligatoire) → champs adjusted_*, repasse en pending_review.
- [ ] File d'attente superviseur : réel vs ajusté côte à côte, raison, Approuver/Rejeter (lot), rejection_reason. RLS : superviseur change le statut mais pas les horodatages ; pas d'auto-approbation.
- [ ] Une entrée approved re-corrigée → repasse pending_review.

### PP3 — Banner imprimable
- [ ] Composant accessible du projet et de l'événement : titre + n° projet + lieu en grand + **QR de l'événement**. Bouton Imprimer → window.print() avec `@media print` (A4, masquer nav/contrôles). Pour affichage chantier/cartable.

### PP4 — Facturation sélective + ressources + compilation
- [ ] Flag is_billable par tâche/événement (bascule superviseur). Seules les tâches facturables alimentent la feuille de temps client (le reste reste en paie/interne).
- [ ] event_resources (matériel/équipement/autre) avec is_billable surchargeable, work_date, shift.
- [ ] work_date + shift ('day'|'evening'|'night' selon quarts définis) sur time_entries et event_resources.
- [ ] Fonction d'agrégation paramétrable (project_id, plage de dates, shift, is_billable) — **réutilisée** par contrôleur, module projet, feuille de temps client, paie, stats.
- [ ] Affichage **contrôleur** (transversal : totaux projet/jour/quart, facturable vs non) + **module projet** (détail projet, total facturable → feuille client).

### PP5 — Sorties : feuille de temps client + feuille de paie
- [ ] Feuille de temps client : groupée par projet (titre+n°+lieu), lignes travailleur/date/heures effectives/durée arrondie, exportable/imprimable, **sans détail paie**.
- [ ] Feuille de paie : groupée par travailleur puis période de paie, total minutes arrondies approuvées, ventilation par projet, filtre plage de dates.

### PP6 — Présence QR + heures max + flags
- [ ] attendance_logs + vue temps réel « qui est sur place » (type, entreprise, arrivée, durée live, compteur, filtres) dans module projet et vue événement.
- [ ] QR : employés via profil ; sous-traitants/représentants client via QR généré (badge rattaché projet/événement).
- [ ] hour_limit_rules (client + interne, la plus stricte gagne) configurables module projet + administration. États ok/warning/violation.
- [ ] Flags visuels dashboard/contrôleur (vert/ambre/rouge + badge violations) et flag rouge sur l'événement en violation. Notifier le superviseur (cf. PP7).

### PP7 — Notifications équipe (courriel / SMS)
- [ ] Déclencheurs : pending_review → superviseur ; approbation/rejet → travailleur ; (option) punch actif trop long → rappel.
- [ ] Deep links : superviseur `/[tenant]/planificateur/reviews/{id}` ; travailleur `/[tenant]/planificateur/time-entries/{id}`.
- [ ] Edge function `notify-time-entry` (trigger Postgres sur changement de status OU worker sur notification_queue, retry). Respecter notification_preferences. Secrets (Resend/SendGrid, Twilio) en env de l'edge function, jamais côté client.
- [ ] **Réutiliser l'infra SMS Twilio existante** du projet (routes `/api/sms/*`, TwilioContext) si possible.

### PP8 — Répertoire de statistiques (global + par événement)
- [ ] Par événement : heures totales, facturable vs non, nb travailleurs, ressources consommées, durée calendaire vs heures travaillées.
- [ ] Global : nb jobs/événements (période/division/client), heures totales ventilées, **taux d'occupation** (base 40 h configurable), classements (projets chronophages, travailleurs actifs, répartition par quart).
- [ ] Taux occupation = heures travaillées / (seuil_normal × nb semaines, prorata). Seuil configurable (40/37.5/35 h). Exports CSV + graphiques.

## 🔗 Interconnexions
- **Projets** : time_entries.project_id ; compilation alimente le module projet + `projects_actuals` ; lieu/QR depuis le projet.
- **Feuilles de temps (timesheets) & Paie** : les minutes approuvées alimentent la feuille de paie ; pont vers le module Paie & Avantages existant.
- **Comptabilité / Facturation** : feuille de temps client facturable → facturation projet → écriture vente→GL (modules déjà livrés).
- **Personnel (planner_personnel)** : worker_id, rôles (superviseur), profils QR.
- **Évaluation employé** : primes/commissions/ajustements (voir §19 ci-dessous) alimentent la paie.

## 📝 Notes module Évaluation & Paie (à traiter dans leurs modules)
- **§19 Cohérence grille ↔ évaluation** : le formulaire d'évaluation se génère depuis la **grille du poste** (source unique) ; valider qu'aucun critère n'est manquant/orphelin ; bloquer la finalisation d'une évaluation incomplète ; **versionner la grille** (l'évaluation reste liée à sa version). Table d'ajustements `evaluation_adjustments` (base_salary|bonus|commission|other, montant ou %, date d'effet, raison, approbation, statut, extensible) → alimente la paie avec date d'effet.
- **§20 Horaires/statuts/primes de paie** : `pay_type` ('hourly'|'salaried') + hourly_rate / annual_salary + `overtime_eligible` ; `time_types` (regular/overtime/double_time/holiday/night_shift… avec multiplicateur, règles de bascule configurables admin, ex. >40 h/sem → 1,5× au QC) ; `position_premiums` rattachées au **poste** (shift/on_call/hazard/responsibility, condition) appliquées automatiquement ; paie = heures ventilées par type × taux (ou salaire réparti) + primes de poste + ajustements évaluation, **ligne détaillée par composante**.
- ⚠️ **Sensibilité paie** : taux/seuils/admissibilité doivent être **validés par RH/paie** (normes du travail), pas figés en dur. Système configurable + auditable.

## ❓ DÉCISIONS À TRANCHER avant implémentation (questions du cadrage)
1. **Arrondi facturation vs paie** : un seul arrondi partagé, ou deux règles distinctes (ex. client 30 min plafond, paie 15 min au plus proche) ?
2. **Période de paie** : hebdo / 2 semaines / bimensuelle — config admin ici, ou déjà gérée ailleurs dans C-Secur360 ?
3. **Quarts de travail** : déjà définis (jour/soir/nuit + plages) ou config admin à créer ? Pointage à cheval sur 2 quarts → au quart de début ou découpé ?
4. **Coût ressources** : unit_cost visible sur la feuille de temps client (montant facturé) ou quantités seulement (prix ajouté en facturation) ?
5. **Flag facturable** : ressource facturable même si la tâche ne l'est pas (et inverse) ? (hypothèse : hérite de la tâche, surchargeable).
6. **Heures max** : continues depuis l'arrivée, ou cumul sur fenêtre glissante (ex. X h / 24 h, type fatigue/conduite) ?
7. **QR sous-traitants/représentants** : badge permanent par entreprise ou généré par événement ? Enregistrement au 1er scan ou pré-enregistré ?
8. **Scan unique** push + présence, ou séparés (présent sans temps facturable démarré) ? (hypothèse : séparés).
9. **Occupation** : dénominateur = heures travaillées approuvées ou heures de présence ? Surplus plafonné à 100 % + indicateur « heures sup » séparé, ou dépasse 100 % ? Périmètre 40 h par travailleur, et/ou par équipe/division ?
10. **Commissions de vente** (évaluation) : calculées depuis une source de ventes par employé, ou saisies manuellement ?
11. **Notifications** : courriel + SMS dès le départ, ou courriel d'abord (pas de coût Twilio) ?
