# 📋 File d'attente des demandes — C-Secur360 (index maître)

> Mise à jour au fil de l'eau. Source de vérité pour le suivi ; les détails techniques sont dans les TODO spécialisées référencées. Commit + push après chaque tâche (feat/modular-foundation + main).
> Dernière mise à jour : 2026-05-30.

## ✅ Terminé
- [x] Module comptable : Transactions (achats→GL + reçus), exports PDF/CSV (balance/GL/états), rapports fiscaux (TPS/TVQ, TP-41.C, base T4/RL-1, retenues). Migrations 087/088.
- [x] PWA : manifest **tenant-aware** → ouverture sur l'auth du tenant (`/{tenant}/login`) au lieu de la page publique.
- [x] Admin responsive : vue **cartes + hamburger sous 1024px** (lisibilité demi-écran).
- [x] Planificateur **P1** : correctif sauvegarde (`saveJob` manquant dans `useAppData`).
- [x] Planificateur **P2** : renommage **Job → Mandat**, onglets responsives (menu déroulant <1024px), débordements Gantt, validation de sauvegarde renforcée.
- [x] Planificateur **P3** : Gantt — cascade (FS/SS/FF/SF + lag), travaux parallèles, chemin critique (CPM), priorité ; correction des bugs d'ID et du template WBS.
- [x] Retrait du bandeau codé en dur « Commerce CERDIA » dans l'onglet Facturation du tenant.

## 🔜 En attente — Refonte planificateur (voir `TODO-REFONTE-PLANIFICATEUR.md`)
- [x] **P4.0** — Sauvegarde **tolérante aux colonnes manquantes** (retrait auto + retry) → ajouter des champs ne casse plus l'enregistrement avant migration.
- [x] **P4.1** — Désignation du **Responsable** (éditable coordonnateur+, lecture seule sinon) + câblage `estCoordonnateur` ; migration 089 (responsableId/projectId/clientId/astId/lieuLat/lieuLng). Reste : gating lecture seule exhaustif des sections Mandat pour non-coordonnateur (à finaliser avec le découpage P5).
- [ ] **P4** — Interconnexions (conditionnées aux modules activés `useEntitlements`) : Projets, Clients, Inventaire, Personnel/Congés, Équipements/Véhicules.
- [ ] **P4** — **Endroit des travaux + Google Maps** (géocodage à la saisie ; préremplissage depuis Projets si module activé).
- [ ] **P4** — **Lien AST** si module débarré : rattacher/créer une AST préremplie avant travaux.
- [ ] **P4** — **Pièces jointes** : documentation projet + photos (DropZone/carrousel, JSONB documents/photos).
- [ ] **P5** — Nettoyage : supprimer doublons morts (JobModal/components/Modals + .backup + _temp), réduire les `console.log`, découper le mégafichier, divulgation progressive poussée.

## 🔜 En attente — Soumission / Catalogue de taux / Facturation (voir `TODO-SOUMISSION-CATALOGUE-FACTURATION.md`)
- [ ] **Structure de soumission** hiérarchique : Item → MO Bureau / MO Chantier / Voyagement / Subsistance / Hébergement / Matériaux → lignes (Description, Tech, Rég, Supp, Maj, Montant).
- [ ] **Catalogue de taux** versionné par année + révisions (« rév. 1 2026 » / nouvelle année), restructurable, historisé.
- [ ] **Révision de soumission** : « réviser au taux actuel » → archive l'ancienne, nouvelle version active re-tarifée avec ajouts/mises à jour.
- [ ] **Pré-montage du Gantt depuis la soumission** : items/travaux → étapes (durée=heures, personnes=Tech, parent=item), selon la durée d'arrêt.
- [ ] **Planif selon personnel dispo** (nivellement) + **sélecteur de mode en haut des items** : En suite · Parallèle · Custom.
- [ ] **Convergence Facturation** : soumission (devis) + temps (pointage) + matériel → module **Facturation** → vente→GL ; rapport devis vs réel.

## 🔜 En attente — Pointage « push » & paie (voir `TODO-POINTAGE-PUSH-PLANIFICATEUR.md`)
- [ ] PP1 Pointage push in/out (app + QR) + arrondi 15/30 configurable.
- [ ] PP2 Ajustement travailleur + validation superviseur.
- [ ] PP3 Banner imprimable (titre/n°/lieu + QR).
- [ ] PP4 Facturation sélective + ressources event + compilation jour/quart.
- [ ] PP5 Feuille de temps client + feuille de paie.
- [ ] PP6 Présence QR + heures max + flags.
- [ ] PP7 Notifications courriel/SMS.
- [ ] PP8 Répertoire de stats (occupation 40 h).
- [ ] ⚠️ **11 décisions à trancher** (listées en fin de `TODO-POINTAGE-PUSH-PLANIFICATEUR.md`) avant d'implémenter ce sous-système.

## 🗂️ TODO spécialisées
- `TODO-REFONTE-PLANIFICATEUR.md` — refonte formulaire Mandat (P1-P5) + stratégie d'interconnexion.
- `TODO-POINTAGE-PUSH-PLANIFICATEUR.md` — pointage/présence/paie/stats + décisions.
- `TODO-REPRISE-COMPTA.md` — module comptable/fiscal (livré).
