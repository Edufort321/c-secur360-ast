# Audit du module financier — C-Secur360
**Date :** 2026-06-19 · **Périmètre :** comptabilité (GL), revenus, dépenses, paie, taxes, immobilisations, états financiers, contrôles, multi-devise, clôture.
**Référentiels :** double-entrée, ASPE, ARC (T4127 122ᵉ / GST-HST), Revenu Québec (TP-1015.F / TVQ).
**Méthode :** cartographie du code (4 explorations parallèles) + **vérification manuelle des constats critiques** dans les sources.

> ⚠️ **Correction d'un faux positif** : une exploration a signalé un « double-comptabilisation des abonnements Stripe ». **Vérification faite** : `handleInvoicePaid` (webhook) n'écrit que dans les tables de facturation plateforme (`invoices`/`subscriptions`/`customers`) et **ne touche pas au GL**. Le paiement d'une facture tenant passe par `setInvoiceStatus('paid')` → vente sur « sent », encaissement sur « paid », idempotent par `gl_entry_id`. **Pas de double comptabilisation.** Constat retiré.

---

## Verdict global
**Fondation solide, prête pour la PME ; écarts matériels à corriger avant un audit externe.**
Le cœur double-entrée est verrouillé au niveau base (triggers d'équilibre + immutabilité + verrouillage de période), le plan comptable canadien est complet, le moteur de paie (retenues) est conforme et testé. Les écarts portent surtout sur la **complétude des écritures automatiques** (charges employeur, amortissement, remises de taxe) et des **fonctions de contrôle** (notes de crédit, paiements partiels, numérotation des écritures).

---

## 1. Plan comptable & structure GL — ✅ Solide
- Tables `gl_accounts / gl_journals / gl_periods / gl_tax_codes / gl_entries / gl_lines` (mig 085). `NUMERIC(14,2)`, contrainte `NOT (debit>0 AND credit>0)`, montants ≥ 0.
- Plan PME canadien complet seedé idempotemment (`seed_accounting_defaults`) : actifs 1000–1500, passifs 2000–2400, capitaux 3000–3300, produits 4000/4100, charges 5000–5900.
- Journaux VEN/ACH/PAY/BNK/OD. Codes de taxe par juridiction (GST 5 %, QST 9,975 %, HST 13–15 %) liés aux comptes collectés/payés.
- **Écart mineur** : `parent_id` (hiérarchie) présent mais jamais validé ni utilisé dans les totaux. `code` libre (pas de contrainte `^[0-9]{4}$`).

## 2. Intégrité double-entrée — ✅ Solide (meilleur point)
- Trigger `gl_check_balanced` : Σdébits = Σcrédits exigé sur écriture postée (rejette déséquilibrée/vide).
- Trigger `gl_protect_posted` : écriture postée **immuable** (pas d'édition/suppression ; seul `reversed_by_id` autorisé) → contre-passation obligatoire.
- Trigger `gl_block_closed_period` (mig 183) : **anti-antidatage** sur période fermée, au niveau base.
- Idempotence par `(source_type, source_id)` sur tout l'auto-posting. Contre-passation (`reverseEntry`) conserve la piste.
- **Écarts** : (a) `entry_number` jamais renseigné — l'ordre repose sur `entry_date` + UUID (un auditeur externe attend une **numérotation séquentielle**) ; (b) `reverseEntry` sans garde anti-double-contre-passation ; (c) pas d'index composé `(tenant_id, source_type, source_id)` → coûteux en synchro de masse.

## 3. Cycle des revenus — 🟡 Bon, trous de complétude
- Facturation `commerce_invoices` + items, taxes par province (pas de taxe-sur-taxe), numérotation séquentielle `F-AAAA-NNN`, statuts draft→sent→paid→cancelled.
- Comptabilité d'**exercice** : `postInvoiceSale` (DR 1100 / CR 4000 + taxes) sur « sent », `postInvoicePayment` (DR 1000 / CR 1100) sur « paid ». AR aging (`agingReports`). Abonnements récurrents + cron + Stripe Connect.
- **Écarts** :
  - **Pas de notes de crédit / remboursements** (annulation = suppression, sans contre-écriture liée à la facture d'origine).
  - **Paiements partiels non suivis** (statut binaire payé/non payé) → AR aging binaire.
  - `revenue_category` **non mappé à un compte GL** (tout le revenu → 4000). *Par conception* : la ventilation par classe est lue depuis les sous-registres (`revenueByClass`), pas le GL — acceptable, mais le GL reste « plat ».
  - **À surveiller (introduit récemment)** : « Marquer payé » (`/api/recurring/pay`, crée une transaction de revenu) **et** « Facturer » (`/api/recurring/invoice`, crée une facture) sur **le même abonnement** comptabiliseraient le revenu deux fois. Garde-fou d'usage à documenter/verrouiller.

## 4. Cycle des dépenses — 🟡 Bon
- `commerce_transactions` + items, taxes récupérables (CTI 1200 / RTI 1210), PST non récupérable capitalisé en charge. `postTransactionPurchase` (exercice) + `postTransactionPayment` (règlement AP). 5 `settlement_kind` (standard/remboursement/investissement/avance investisseur/paiement en actions) bien routés.
- Bons de commande : destination (stock/projet/consommable/capex/revente) → écriture GL à la réception + appariement 3 voies (commandé/reçu/synchro). Import bancaire CSV/OFX tolérant + rapprochement flou + dédup FITID.
- **Écarts** : (a) **pas de `due_date`** sur `commerce_transactions` → vieillissement AP basé sur la date d'écriture, pas les conditions de paiement ; (b) dédup CSV bancaire sans `external_id` (risque de doublon hors OFX) ; (c) `account_code` d'une ligne non validé contre le plan comptable ; (d) sync inventaire « best-effort » silencieuse.

## 5. Paie & charges sociales — 🟠 Moteur conforme, **GL incomplet (P1)**
- `lib/payrollTax.ts` : RRQ/RRQ2, RQAP, AE, impôts féd + QC, abattement 16,5 %, déduction du travailleur QC, params **2025/2026 éditables**, références T4127 (122ᵉ) / TP-1015.F, **tests 7/7**. Export bancaire CPA-005 + CSV.
- **ÉCART MAJEUR (vérifié)** : `postTimesheetPayroll` ne poste QUE le côté employé (DR 5000 / CR 2300 net / CR 2200 féd / CR 2210 QC / CR 5200 véhicule). **Les cotisations EMPLOYEUR (RRQ/AE/RQAP/FSS/CNESST) sont calculées (`erTotal`, `totalEmployerCost`) mais JAMAIS comptabilisées.** Le compte **5100 « Charges sociales employeur » reste vide**, et les passifs de remise employeur n'existent pas.
  - *Impact* : charges sous-évaluées, passifs de remise absents → résultat surévalué, conformité de remise non traçable.
  - *Correctif* : après la paie de base, poster DR 5100 / CR passifs employeur (2320 RRQ-emp, 2330 AE-emp, 2340 RQAP-emp, 2350 FSS, 2360 CNESST) — équilibré, idempotent.
- Autres : avantage automobile imposable calculé (`getVehicleBenefits`) **mais pas porté à la paie/au GL** (T4 case 34 « sur papier ») ; tables `payroll_runs/payroll_lines` (mig 223) sans UI de cycle ; CPA-005 **à valider avec un fichier test Desjardins**.

## 6. Taxes & fiscalité — 🟠 Calcul OK, **remise non outillée (P1)**
- Taux 13 provinces/territoires corrects ; détaxé vs exonéré distingués ; CTI/RTI sur comptes 1200/1210, taxe perçue sur 2100/2110 ; `getTaxRemittance` calcule le net à remettre (mensuel/trimestriel/annuel).
- **ÉCARTS** :
  - **Aucune écriture ni suivi de remise** : `getTaxRemittance` calcule mais ne **poste pas** (DR 2100/2110 / CR 1000) et il n'existe **aucune table d'échéances/statut de remise** → risque de **pénalités ARC/RQ**.
  - **XML T4/RL-1 absent** (CSV/PDF seulement) ; production électronique obligatoire ≥ 6 feuillets.
  - HST logé sur 2100/1200 comme la TPS (pas de compte HST distinct) ; PST récupérable selon province non géré (toujours capitalisé).

## 7. Immobilisations & amortissement — 🔴 **Incomplet (P1/P2)**
- `lib/assets.ts` : registre `company_assets` (mig 206), `annualDepreciation` = linéaire `(coût − valeur résiduelle) / durée`.
- **ÉCARTS (vérifiés)** :
  - **Amortissement jamais comptabilisé** : aucun appel `createEntry` vers 5600 ; **aucun compte d'amortissement cumulé** (1550…). `assetsBookValue` = somme des coûts (sans déduire le cumul) → **valeur nette au bilan fausse**.
  - **Pas de DPA / règle du demi-année** (livre vs fiscal), pas de gain/perte à la disposition, pas de seuil de capitalisation, pas d'accrual mensuel/trimestriel.
  - *Correctif minimal* : créer comptes d'amortissement cumulé par catégorie, poster périodiquement DR 5600 / CR 15xx, déduire le cumul de la valeur nette.

## 8. États financiers & reporting — 🟡 Bon, flux manquant
- **Résultat** et **Bilan** exportés (CSV/PDF, `accountingExports`) avec contrôle d'équilibre. Analytics riches (`financialAnalytics` : marge brute, EBITDA, croissance plafonnée, drill-down, `revenueByClass`) + couche **honnêteté des données** (`dataQuality`). Prévision de trésorerie 13 semaines + métriques SaaS (MRR/ARR/churn/NRR/runway).
- **Écarts** : (a) **pas d'état des flux de trésorerie historique** (seulement prévision) ; (b) pas de comparatif période-sur-période sur l'état formel ; (c) pas de reporting par centre de coût/projet dans le GL.

## 9. Multi-devise & FX — 🟡 Conversion OK, réévaluation absente
- `lib/currency.ts` : devise de base par tenant, taux manuels, `toBase`. `applyFx` convertit les lignes au point d'écriture et rééquilibre l'arrondi sur une ligne.
- **Écarts** : (a) **pas de réévaluation FX** (gains/pertes de change non réalisés sur AR/AP) ; (b) résidu d'arrondi affecté arbitrairement à une ligne plutôt qu'à un compte « écart de change » dédié ; (c) taux manuels (pas de flux live).

## 10. Contrôles internes, piste d'audit, RLS — 🟡 Bon (app), RLS à durcir
- **Séparation des tâches** : 8 niveaux d'accès (consultation→super-utilisateur) ; salaires/finances réservés au palier ≥ 5 ; résolution **serveur** (`/api/me/access`). Double piste d'audit : `system_audit_logs` (infra) et `audit_log` (mig 198, actions sensibles finance/RH/actionnaires, REVOKE anon).
- **Écarts** : (a) **RLS permissive** (`USING(true)`) sur les tables GL → isolation **applicative** seulement (chantier auth JWT/claim déjà documenté) ; (b) audit « best-effort » (n'échoue jamais → action possible sans trace) ; (c) `created_by` souvent nul ; (d) pas de workflow d'approbation d'écriture.

## 11. Clôture périodique & export comptable — 🟡 Verrou OK, clôture manuelle
- Périodes ouvrables/fermables (`upsertPeriod/setPeriodStatus`) + verrou base (mig 183). **Lien comptable lecture seule** par jeton (`accountant_tokens`, mig 184) → export Journal + Balance (CSV/JSON). Module de **réconciliation** (`reconciliation.ts`) : balance de vérification, factures/transactions non postées, orphelins GL, cohérence AR/stock/banque.
- **Écarts** : (a) **pas de clôture annuelle automatique** (écritures de clôture résultat → BNR) ; (b) pas de checklist de clôture bloquante ; (c) pas de report d'ouverture.

---

## Gap analysis priorisée

### P1 — Justesse des états financiers & conformité — ✅ CORRIGÉ (2026-06-19)
| # | Écart | Section | État |
|---|-------|---------|------|
| P1-1 | **Charges sociales employeur** | §5 | ✅ Le run de paie (`/api/payroll/run`) ISOLE les cotisations employeur en **5100** (DR 5000 brut + DR 5100). *Nuance vérifiée : le run les comptabilisait déjà mais AGRÉGÉES dans 5000 ; désormais isolées. Le chemin legacy `postTimesheetPayroll` reste côté employé seulement.* |
| P1-2 | **Amortissement** | §7 | ✅ DR 5600 / CR 1590 par bien et exercice (`lib/depreciation` pur+testé, `financeP1Server.postDepreciationForYear`, `/api/accounting/depreciate`, bouton + valeur nette + cumul dans Immobilisations ; table `asset_depreciation` mig 242). |
| P1-3 | **Remises TPS/TVQ** | §6 | ✅ DR 2100/2110 / CR banque par période + suivi (`computeRemittance` depuis le GL, `/api/accounting/tax-remittance`, bouton « Comptabiliser la remise » dans Fiscalité ; table `tax_remittances` mig 242). |

> Comptes 1590/5600 créés à la volée. Tout idempotent. **À valider par une personne qualifiée** avant la 1re clôture réelle. Migration **242** à appliquer.

### P2 — Contrôles & complétude
| # | Écart | Section | Effort |
|---|-------|---------|--------|
| P2-1 | **Notes de crédit / remboursements** (contre-écriture liée à la facture) | §3 | M |
| P2-2 | **Paiements partiels** (historique + statut intermédiaire, AR aging par stade) | §3 | M |
| P2-3 | **`due_date` sur transactions** → vieillissement AP par conditions de paiement | §4 | S |
| P2-4 | **Numérotation séquentielle des écritures** (`entry_number` auto) | §2 | S |
| P2-5 | **Avantage automobile** porté à la paie/au GL (T4 case 34) | §5 | S |
| P2-6 | **XML T4/RL-1** pour télétransmission ARC/RQ | §6 | L |
| P2-7 | **DPA / demi-année** (amortissement fiscal distinct du comptable) | §7 | M |

### P3 — Renforcement / nice-to-have
| # | Écart | Section |
|---|-------|---------|
| P3-1 | **RLS DB-enforced** sur tables GL (défense en profondeur ; chantier auth) | §10 |
| P3-2 | **État des flux de trésorerie** historique (exploitation/investissement/financement) | §8 |
| P3-3 | **Réévaluation FX** + compte « écart de change » dédié | §9 |
| P3-4 | Index `(tenant_id, source_type, source_id)` ; validation `account_code` ; `created_by` obligatoire | §2/§4 |
| P3-5 | **Clôture annuelle automatique** (écritures de clôture → BNR) + checklist bloquante | §11 |
| P3-6 | Dédup CSV bancaire (`external_id`) ; garde « Marquer payé » vs « Facturer » (anti-double-revenu) | §4/§3 |

**Légende effort** : S ≈ ½ j · M ≈ 1–2 j · L ≈ 3 j+ (à valider par personne qualifiée en comptabilité/fiscalité).

---

## Recommandation
Attaquer **P1-1 → P1-3** d'abord (ce sont les seuls écarts qui **faussent réellement les états financiers** : charges & passifs employeur sous-évalués, actif immobilisé surévalué, risque de pénalités de remise). Puis P2 (contrôles attendus par un auditeur : notes de crédit, paiements partiels, numérotation). P3 = robustesse/conformité avancée. Chaque correctif touchant les calculs fiscaux/comptables doit être **validé par une personne qualifiée** avant mise en prod.
