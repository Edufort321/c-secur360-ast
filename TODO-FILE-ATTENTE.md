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
- [ ] **P4** — Séparation par rôle : formulaire **Mandat** (coordonnateur+) vs **Événement** (responsable monte son Gantt). Permissions.
- [ ] **P4** — Interconnexions (conditionnées aux modules activés `useEntitlements`) : Projets, Clients, Inventaire, Personnel/Congés, Équipements/Véhicules.
- [ ] **P4** — **Endroit des travaux + Google Maps** (géocodage à la saisie ; préremplissage depuis Projets si module activé).
- [ ] **P4** — **Lien AST** si module débarré : rattacher/créer une AST préremplie avant travaux.
- [ ] **P4** — **Pièces jointes** : documentation projet + photos (DropZone/carrousel, JSONB documents/photos).
- [ ] **P5** — Nettoyage : supprimer doublons morts (JobModal/components/Modals + .backup + _temp), réduire les `console.log`, découper le mégafichier, divulgation progressive poussée.

## 🔜 En attente — Catalogue de taux & soumissions (NOUVEAU, → converge vers Admin Facturation)
- [ ] **Catalogue de taux** paramétrable par l'utilisateur, **enregistré par année** avec **révisions** (ex. « rév. 1 2026 » ou nouvelle année). Restructurable. Historique des versions.
- [ ] **Révision de soumission** : mode « **réviser au taux actuel** ». Réviser p. ex. une soumission 2025 en 2026 → l'**ancienne s'archive**, une **nouvelle version active** apparaît avec mes ajouts / mises à jour de prix (re-tarifée sur le catalogue courant). Lien version parent ↔ révisions.
- [ ] **Convergence Facturation** : « **tout transite vers l'admin Facturation** » — taux, soumissions, temps (pointage), matériel/équipements → consolidés dans le module **Facturation** (puis écriture vente→GL côté Comptabilité). Point de convergence unique des sorties facturables.

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
