# 🔄 Reprise rapide — Module comptable/fiscal (C-Secur360)

> Dernière mise à jour : 2026-05-29 · Dernier commit : `d06ff31` · Branches `feat/modular-foundation` **et** `main` synchronisées sur origin.

## ⚠️ À FAIRE EN PREMIER — exécuter dans Supabase (SQL Editor)
Le code est tolérant mais les modules restent inactifs tant que les migrations ne sont pas passées :
- **085_accounting_core.sql** → active l'onglet **Comptabilité** (plan comptable, écritures, taxes, périodes).
- **086_commerce_invoicing.sql** → active l'onglet **Factures**.
- **087_commerce_transactions.sql** → active l'onglet **Transactions** (dépenses/achats + bucket Storage `transaction-receipts` pour les reçus).
- **088_timesheet_source_deductions.sql** → colonnes `federal_deductions`/`quebec_deductions` sur `timesheets` (ventilation des retenues à la source dans la paie + colonnes des rapports T4/RL-1).
- **074 à 084** (toujours en attente) : bonus, skill_form, eval profile, commission timesheet, max_sites, access_password, equipements site/photo, approvals, next_eval_date, eval scores, hr_items.
- Après 085, dans l'app : onglet **Comptabilité → « Initialiser le plan comptable »** (appelle `seed_accounting_defaults(tenant)`).

## ✅ Ce qui est FAIT (module comptable complet et fonctionnel)
Cycle partie double : **ventes + paie → grand livre immuable → balance + bilan + résultats**.
- **Socle** (085) : `gl_accounts`, `gl_journals`, `gl_periods`, `gl_tax_codes`, `gl_entries`, `gl_lines` ; trigger équilibre Σdébits=Σcrédits ; immuabilité + contre-passation ; seed plan PME + taxes par province.
- **Service** `lib/accounting.ts` : seed, getAccounts, getTaxCodes, getLedger, getTrialBalance, createEntry, reverseEntry.
- **Onglet Comptabilité** (`AccountingModule` dans `app/[tenant]/admin/page.tsx`) : sous-onglets **Plan · Grand livre · Balance · États · Nouvelle écriture** + bouton « Synchroniser la paie ».
- **Paie auto** `lib/accountingAuto.ts` : `syncPayrollEntries` (idempotent par feuille de temps approuvée/payée → DR salaires/commissions, CR net + déduction véhicule).
- **Facturation** (086) `lib/invoicing.ts` + onglet **Factures** (`InvoicingModule`) : taxes multi-province (TPS/TVH/TVQ/PST/RST), numérotation séquentielle, totaux live, paramètres entreprise.
  - **Comptabiliser** = écriture vente→GL (DR 1100, CR 4000 + taxes).
  - **Payée** = vente (si besoin) + encaissement (DR 1000, CR 1100), idempotent.
  - **PDF** `lib/invoicePdf.ts` (logo, n° TPS/TVQ, taxes).
- **États financiers** : résultats (produits−charges) + bilan (actif/passif/capitaux), contrôle d'équilibre.
- Aussi cette session : #13 cohérence véhicule (ARC 2026 centralisés `lib/constants/arc.ts`), #14 onglet Carnet de bord (`LogbookModule`).

## ✅ FAIT cette session (tâches 1 à 3 livrées, push sur les deux branches)
1. **Module Transaction** (dépenses/achats) — migration 087, `lib/transactions.ts`, onglet **Transactions** (`TransactionsModule`) : saisie multi-lignes ventilées par compte de charge, taxes CTI/RTI, pièces jointes (`uploadReceipt` → Storage + repli base64), `postTransactionPurchase` (achat→GL : DR charges + 1200 CTI + 1210 RTI + PST en charge, CR 1000/2000) + `postTransactionPayment` (paiement fournisseur), idempotents.
2. **Exports** PDF/CSV — `lib/accountingExports.ts` : balance, grand livre, états financiers ; boutons CSV/PDF contextuels dans l'onglet Comptabilité.
3. **Phase 5 — rapports fiscaux** — `lib/fiscalReports.ts` + onglet **Rapports fiscaux** (`FiscalReportsModule`) :
   - **Sommaire TPS/TVQ** par année (taxe perçue 2100/2110 vs CTI/RTI 1200/1210 → net à remettre) + export.
   - **Avantage automobile (TP-41.C)** par véhicule employeur (droit d'usage + fonctionnement, ARC 2026, km perso depuis feuilles de temps) → report RL-1 case W / T4 code 34 + export.
   - **Base T4 / RL-1** par employé (revenu d'emploi + commissions + avantage auto + retenues féd./QC) + export.
   - **Retenues à la source** : migration 088 (`federal_deductions`/`quebec_deductions`) + ventilation dans `postTimesheetPayroll` (CR 2300 net + CR 2200 fédéral + CR 2210 QC), rétrocompatible.

## ▶️ PROCHAINES TÂCHES (reste)
1. **Affiner** : PST/RST provincial dans un compte de taxe distinct (regroupé pour l'instant avec TPS/TVH dans 2100 côté facture ; déjà capitalisé en charge côté transaction).
2. **Génération XML** des feuillets T4/RL-1 (obligatoire dès le 6e feuillet, schémas ARC et RQ distincts) — pour l'instant la base est exportée en CSV/PDF.
3. **Saisie des retenues** sur la feuille de temps (UI paie) pour alimenter `federal_deductions`/`quebec_deductions` (table prête via 088).

## 🧠 Mémoire (rechargée automatiquement à la prochaine session)
- `comptabilite-fiscal-canada-ref` — normes fiscales CA 2026 (T4/RL-1, TP-41.C, taux taxes par province, retenues, archi partie double, modules CERDIA, sources officielles).
- `admin-chantier-etat` — état complet du chantier + file de tâches.
- `push-after-each-task` — workflow git.

## 🛠️ Workflow (à respecter)
- Travailler dans `C:\C-Secur360\c-secur360-ast-feat-modular-foundation`.
- `npx tsc --noEmit` = **0 erreur** avant chaque push.
- **Commit + push après CHAQUE tâche** sur les deux branches :
  `git push origin feat/modular-foundation && git push origin feat/modular-foundation:main`
- Messages de commit en ASCII (éviter les accents — le shell PowerShell/here-string les casse).
- Réf. projet à porter : `C:\CERDIA\investissement-cerdia-main` (modules Transaction + Facture, déjà analysés — voir mémoire).
