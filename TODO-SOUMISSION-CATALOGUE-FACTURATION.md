# 💰 Soumission → Catalogue de taux → Planificateur → Facturation (chaîne devis/réel)

> Capture des exigences client. Relie : module Projets/Soumissions, Catalogue de taux, Planificateur (pré-montage Gantt), et **convergence vers l'Admin Facturation**. Voir [[TODO-REFONTE-PLANIFICATEUR]] et [[TODO-FILE-ATTENTE]].
> Dernière mise à jour : 2026-06-01.

## ✅ Avancement 2026-06-01 (refonte catalogue + consolidation soumission)
**Fait :**
- **Soumission déplacée dans Projets** (`/projets/soumissions`) ; **catalogue géré en Admin** (onglet « Catalogue de taux »). Doublons supprimés (ancien onglet Soumission projet + ancien `SoumissionTab` `labor_rates` + `SoumissionsModule` admin legacy). Composant partagé `components/soumissions/SoumissionsModule.tsx` (prop `allowed`).
- **« Taux & catalogue » complet déplacé sous Admin** (`/admin/taux`) et retiré de Projets (redirect). Lien « Catalogue » des Soumissions ouvre l'onglet admin via `?tab=soumissions`.
- **Multi-catalogues** : liste à l'ouverture, **dupliquer** (pré-rempli), **supprimer**, **préféré ★** ; **sélecteur de catalogue** dans la soumission (préféré 1er puis chrono).
- **Catalogue auto-contenu** (« + Nouveau ») : MO bureau/chantier + **temps demi (1½) + double (2×)**, km, subsistance (5h/12h/15h/nuitée), hébergement, **catalogue matériel** (coûtant/**marge %**/vente bidirectionnels + marge globale « appliquer à tous »), **surcharge carburant** (prix de base + paliers prix→%), **niveaux d'approbation**, **barèmes additionnels libres classés par catégorie**.
- **Libellés éditables** propagés à l'affichage de la soumission ; barème **regroupé par section** (MO/Voyagement/Subsistance/Hébergement).
- **Champs numériques robustes** (`numInput`) : acceptent `.` ou `,`, décimales, 0 sélectionné au focus. `saveCatalogue` **résilient** (retire les colonnes manquantes avant l'exécution des migrations).
- **Salaire d'évaluation → Taux horaire de Paie** ; **×OT / ×DT activables** par employé (Paie & avantages).
- Coût de vente = catalogue (soumission/facture forfaitaire) ; coût réel = taux employé (feuilles de temps) — bien séparés.

**Migrations à exécuter dans Supabase** (ordre) : `060` (employee_profiles) · `076` + `083` (éval) · `101` (preferred) · `102` (extras+labels) · `103` (materials/fuel/approvals) · `104` (OT/DT toggle) · `105` (custom_rates).

**Reste (prochaine session) :**
- [ ] **Auto-injection des taux du catalogue dans les bonnes sections de la soumission** : chaque taux (classé par catégorie) doit pré-remplir/alimenter la section correspondante des lignes de soumission (km→Voyagement, subsistance→Subsistance, matériel→Matériaux via sélecteur, barèmes additionnels→leur catégorie). Fondation posée (classement par catégorie) ; reste le câblage côté éditeur de lignes.


## 🧱 Structure d'une soumission (modèle de données)
Une soumission est **hiérarchique** : `Soumission → Items → Catégories → Lignes`.

- **Item** (ex. « Item 1 — Entretien »), rattaché à une **année** (ex. 2026) et un total $.
- **Catégories** par item :
  - **MO Bureau** (main-d'œuvre bureau)
  - **MO Chantier** (main-d'œuvre chantier)
  - **Voyagement**, **Subsistance**, **Hébergement**, **Matériaux** (lignes de coûts)
- **Ligne de main-d'œuvre** : `Description | Tech (nb de personnes) | Rég (h régulières) | Supp (h supplémentaires) | Maj (h majorées) | Montant`.
  - Exemple MO Bureau : Préparation (1 tech, 8 h) ; Gestion (1 tech, 12 h, 0,5 supp) ; Rédaction (1 tech, 4 h).
  - Exemple MO Chantier : Travaux 1 (1 tech, 8 h, 4 supp) ; Travaux 2 (4 tech, 8 h, 6 supp) ; Travaux 3 (2 tech, 6 h) ; Travaux 4 (6 tech, 8 h, 2 supp) ; Travaux 5 (4 tech, 8 h, 2 supp) ; Travaux 6 (2 tech, 8 h, 2 supp).
- **Lignes de coûts** (Voyagement/Subsistance/Hébergement/Matériaux) : description, quantité, coût.
- **Somme calculée** par item et total soumission (« provient de soumission »).
- Tarifs issus du **catalogue de taux** (voir plus bas) selon l'année/révision.

## 🗓️ Catalogue de taux (versionné)
- Paramétrable par l'utilisateur, **enregistré par année** avec **révisions** (« rév. 1 2026 », ou nouvelle année). Restructurable. Historique conservé.
- Une soumission référence la **version de catalogue** utilisée (taux MO bureau/chantier, majorations supp/maj, taux voyagement/subsistance/hébergement, matériaux).

## ♻️ Révision de soumission
- Mode « **réviser au taux actuel** » : réviser p. ex. une soumission **2025 → 2026** re-tarife les lignes sur le **catalogue courant**.
- L'**ancienne version s'archive**, une **nouvelle version active** apparaît avec mes **ajouts / mises à jour de prix**. Lien `parent ↔ révisions`, numéro de révision.

## 🔌 Modules indépendants & flux d'entrée dans la planification
Les modules sont **indépendants** (gate via `useEntitlements` : `soumission`/`projects`/`planner`). Deux chemins de création d'un mandat :
1. **Depuis une soumission transférée en projet** (si le tenant a Soumission + Projets) :
   - Une soumission **transférée en projet** rend son **numéro de projet recherchable dans la planification** (champ de recherche du mandat).
   - Sélectionner ce numéro **préremplit tout d'un coup** : identification, client, lieu, dates/durée d'arrêt, et **pré-montage du Gantt** depuis les items (cf. ci-dessous).
2. **Sinon — création de A à Z (custom)** : si pas de soumission (ou module absent), création **manuelle complète** du mandat comme aujourd'hui (aucun préremplissage imposé).
> Le préremplissage est donc **optionnel et conditionnel** ; le mode custom reste toujours disponible.

## 📅 Pré-montage du Planificateur depuis la soumission (interconnexion clé)
Quand un mandat/projet provient d'une soumission, le **portrait du Gantt est pré-monté** à partir des items :
- Chaque **ligne de travail** (MO Chantier « Travaux N », MO Bureau « Préparation/Gestion/Rédaction ») devient une **étape Gantt** :
  - `text` = description de la ligne ; regroupées sous l'**item** (ex. « Item 1 — Entretien ») comme tâche parent.
  - **durée** = heures planifiées (Rég + Supp + Maj) ; **nombre de personnes** = `Tech` ; conserver supp/maj pour la paie/coût.
- Le planner **tient compte du nombre d'heures planifiées et du nombre de personnes par item** selon la **durée de l'arrêt** (shutdown) gérée à la création de la planif (répartition des heures sur la fenêtre d'arrêt → personnel requis, cf. calculs bidirectionnels heures↔personnel déjà présents).
- L'utilisateur ajuste ensuite dépendances (cascade), parallélisme et horaires dans le Gantt.

## 💸 Commission de vente au transfert (interconnexion poste/grille)
Réutiliser le mécanisme existant : `poste_salary_grids.commission_enabled/pct/basis(gross|net|margin|custom)/threshold/cap` + `lib/commission.ts` (projet `status='vente'` + `primary_seller_id` → commission calculée selon la grille du vendeur, reportée sur sa **feuille de temps** `total_commissions/commission_details` + historique `project_commissions`). Migration 069 / 077.
- **À l'acceptation (transfert soumission → projet)** : si le **vendeur** (l'utilisateur dont le **poste a la fonction commission**, `commission_enabled`) est rattaché, poser `projects.primary_seller_id` + `status='vente'` puis appeler `lib/commission.ts` → la commission s'applique automatiquement.
- Le **vendeur** = créateur de la soumission (ou champ « vendeur » sélectionnable). → stocker le vendeur sur la soumission (`seller_id`) pour le propager au projet.
- ❓ À confirmer : vendeur = créateur de la soumission, ou sélection explicite ? Base de commission (`po`/`net`/`margin`) = montant de la soumission acceptée.

## 🔁 Convergence vers l'Admin Facturation
« Tout transite vers l'admin Facturation » : **soumission (devis)** + **temps réel (pointage)** + **matériel/équipements** → consolidés dans **Facturation** → écriture vente→GL (Comptabilité). Comparaison **devis vs réel** (heures/personnes/coûts planifiés de la soumission vs pointés).

## 📋 Phases proposées
- [x] **S1** — Modèle de données (migration 090 : `catalogue_taux`, `soumissions`, `soumission_items`, `soumission_lignes`) + service `lib/soumissions.ts` (calcul, CRUD, révision, `accepterSoumission` → projet).
- [x] **S2** — UI : onglet admin **Soumissions** (`SoumissionsModule`) — liste + éditeur Item→catégories→lignes (Tech/Rég/Supp/Maj ou Qté/Unité/Coût), totaux live ; sous-onglet **Catalogue de taux**.
- [x] **S3** — Révision « au taux actuel » (`reviseSoumission` : archive l'originale + nouvelle révision re-tarifée) + bouton Réviser ; Accepter → Projet (`accepterSoumission`).
- [ ] **S4** — Pré-montage du Gantt planificateur depuis les items de la soumission (étapes = lignes, durée=heures, personnes=Tech, parent=item, prise en compte durée d'arrêt).
- [ ] **S4b — Planification selon le personnel disponible (nivellement de ressources)** : décider si des travaux se font **en parallèle** ou **l'un après l'autre** selon le **personnel disponible** (capacité vs `Tech` requis par étape, en tenant compte des congés/affectations existantes). Assez de personnel pour tous les `Tech` requis simultanément → parallèle ; sinon → séquencer (ou échelonner) automatiquement, avec ajustement manuel possible. S'appuie sur la logique parallèle/cascade (P3) + dispo personnel (planner_personnel/congés).
  - **Sélecteur de mode en haut des items/travaux** : **En suite** (séquentiel) · **Parallèle** · **Custom**. Applique le mode à toutes les étapes de l'item d'un coup (en suite = dépendances FS en chaîne ; parallèle = démarrage simultané sous réserve du personnel ; custom = configuration manuelle des dépendances/parallélisme conservée). Le mode « Parallèle » respecte le nivellement (S4b) si le personnel est insuffisant.
- [ ] **S5** — Convergence Facturation : soumission + temps + matériel → module Facturation → vente→GL ; rapport devis vs réel.

## 🔢 Numérotation (spec client)
Format : **`<PREFIX><AA><NNN><SUFFIXE>`**
- **PREFIX** = initiales du **site du tenant de l'utilisateur** (ex. « CERDIA Sherbrooke » → `CS`).
- **AA** = 2 derniers chiffres de l'année courante (2026 → `26`).
- **NNN** = séquentiel, débute à `001`, **toujours croissant** (monotone).
- **SUFFIXE** = **`S`** pour soumission, **`P`** lors du **transfert en projet**.
- Exemples : `CS26001S` (1ʳᵉ soumission), `CS26001P` (1ᵉʳ projet).
- ⚠️ **Compteurs séparés** soumission vs projet : le n° n'est **pas forcément identique** entre une soumission et le projet issu (il y a normalement **plus de soumissions que de conversions**). À la conversion, le projet reçoit le **prochain n° de la séquence projet** (suffixe P), pas le n° de la soumission.
- Générateur automatique des deux côtés (soumission à la création ; projet au transfert), basé sur la liste actuelle.
- ❓ **À préciser** : PREFIX = initiales du **site** (nom du site, ex. mots → initiales) OU **1ʳᵉ lettre tenant + 1ʳᵉ lettre site** ? Et **quel site** quand l'utilisateur en a plusieurs (succursale assignée ? sélection ?). Source du site = `sites`/`planner_succursales` ?

## 📊 Dashboard projet — stats de gestion (spec client)
- **Taux de conversion** soumission → projet (nb projets / nb soumissions, par période/année/site/client).
- Ensemble des **stats de performance** utiles à un bon gestionnaire : nb soumissions (par statut), montant total soumissionné vs accepté, délai moyen soumission→acceptation, valeur moyenne de projet, pipeline (brouillon/envoyée/acceptée), top clients, marge devis vs réel (quand le réel arrive via temps/pointage + matériel), occupation/charge.
- À afficher dans le **dashboard du module Projets** (et/ou contrôleur). Réutiliser une fonction d'agrégation unique.

## ✅ Décisions (tranchées 2026-05-30)
1. **Nouvelles tables dédiées** : `catalogue_taux`, `soumissions`, `soumission_items`, `soumission_lignes` (+ versions/révisions). Migration 090.
2. `Maj` = **multiplicateur configurable, défaut 2,0×** ; `Supp` = 1,5×. Stockés dans le catalogue (`mult_supp`, `mult_maj`).
3. « Durée d'arrêt » = **fenêtre de dates du mandat** `[dateDebut, dateFin]` ; les heures de la soumission s'y répartissent.
4. Pré-montage Gantt : **Item = tâche parent, chaque ligne = étape enfant** (2 niveaux).
