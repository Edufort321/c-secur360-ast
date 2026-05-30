# 💰 Soumission → Catalogue de taux → Planificateur → Facturation (chaîne devis/réel)

> Capture des exigences client. Relie : module Projets/Soumissions, Catalogue de taux, Planificateur (pré-montage Gantt), et **convergence vers l'Admin Facturation**. Voir [[TODO-REFONTE-PLANIFICATEUR]] et [[TODO-FILE-ATTENTE]].
> Dernière mise à jour : 2026-05-30.

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

## 📅 Pré-montage du Planificateur depuis la soumission (interconnexion clé)
Quand un mandat/projet provient d'une soumission, le **portrait du Gantt est pré-monté** à partir des items :
- Chaque **ligne de travail** (MO Chantier « Travaux N », MO Bureau « Préparation/Gestion/Rédaction ») devient une **étape Gantt** :
  - `text` = description de la ligne ; regroupées sous l'**item** (ex. « Item 1 — Entretien ») comme tâche parent.
  - **durée** = heures planifiées (Rég + Supp + Maj) ; **nombre de personnes** = `Tech` ; conserver supp/maj pour la paie/coût.
- Le planner **tient compte du nombre d'heures planifiées et du nombre de personnes par item** selon la **durée de l'arrêt** (shutdown) gérée à la création de la planif (répartition des heures sur la fenêtre d'arrêt → personnel requis, cf. calculs bidirectionnels heures↔personnel déjà présents).
- L'utilisateur ajuste ensuite dépendances (cascade), parallélisme et horaires dans le Gantt.

## 🔁 Convergence vers l'Admin Facturation
« Tout transite vers l'admin Facturation » : **soumission (devis)** + **temps réel (pointage)** + **matériel/équipements** → consolidés dans **Facturation** → écriture vente→GL (Comptabilité). Comparaison **devis vs réel** (heures/personnes/coûts planifiés de la soumission vs pointés).

## 📋 Phases proposées
- [ ] **S1** — Modèle de données soumission (items/catégories/lignes MO+coûts) + catalogue de taux versionné (année/révision) + RLS. Migration dédiée.
- [ ] **S2** — UI soumission (saisie items → MO Bureau/Chantier/Voyagement/Subsistance/Hébergement/Matériaux, lignes Tech/Rég/Supp/Maj/Montant, totaux live depuis le catalogue).
- [ ] **S3** — Révision de soumission (réviser au taux actuel, archivage, versions).
- [ ] **S4** — Pré-montage du Gantt planificateur depuis les items de la soumission (étapes = lignes, durée=heures, personnes=Tech, parent=item, prise en compte durée d'arrêt).
- [ ] **S4b — Planification selon le personnel disponible (nivellement de ressources)** : décider si des travaux se font **en parallèle** ou **l'un après l'autre** selon le **personnel disponible** (capacité vs `Tech` requis par étape, en tenant compte des congés/affectations existantes). Assez de personnel pour tous les `Tech` requis simultanément → parallèle ; sinon → séquencer (ou échelonner) automatiquement, avec ajustement manuel possible. S'appuie sur la logique parallèle/cascade (P3) + dispo personnel (planner_personnel/congés).
  - **Sélecteur de mode en haut des items/travaux** : **En suite** (séquentiel) · **Parallèle** · **Custom**. Applique le mode à toutes les étapes de l'item d'un coup (en suite = dépendances FS en chaîne ; parallèle = démarrage simultané sous réserve du personnel ; custom = configuration manuelle des dépendances/parallélisme conservée). Le mode « Parallèle » respecte le nivellement (S4b) si le personnel est insuffisant.
- [ ] **S5** — Convergence Facturation : soumission + temps + matériel → module Facturation → vente→GL ; rapport devis vs réel.

## ❓ Décisions
1. La soumission vit-elle dans le **module Projets** existant (table `projects`/`projects.facture` JSONB) ou dans de **nouvelles tables** dédiées (recommandé pour la structure hiérarchique + versions) ?
2. `Maj` (heures majorées) = quel multiplicateur vs `Supp` ? (à relier aux `time_types` de la paie, cf. TODO-POINTAGE.)
3. La « durée de l'arrêt » est-elle une **fenêtre de dates** du mandat, ou un champ distinct (nb d'heures/jours d'arrêt) ?
4. Le pré-montage Gantt crée-t-il **une étape par ligne** (Travaux 1..6) sous un parent **Item**, ou un niveau supplémentaire par catégorie (MO Bureau / MO Chantier) ?
