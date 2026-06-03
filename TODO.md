# C-Secur360 — TODO (tâches restantes) — maj 2026-06-02

> Branches : `feat/modular-foundation` (mirror `main`). Build avant chaque push : `npx tsc --noEmit` (TSC=0) **puis** `npx next build`. **Stop `next dev` (port 3000) avant tout build** (sinon `.next` se corrompt). Messages de commit ASCII sans accents ni guillemets doubles internes. Commit + push sur **les 2 branches** après chaque tâche.

## ⚙️ RÈGLES GLOBALES (TOUS les agents)
1. **Commit** : 1 commit **atomique par tâche** (build vert TSC=0 + `next build` avant de committer), push après chaque tâche, message ASCII préfixé du n° de tâche, jamais de code cassé.
2. **Champs numériques écrasables** : tout champ nombre/quantité/montant doit être **sélectionné au clic** (`onFocus={(e)=>e.target.select()}`) pour être écrasé directement ; un **0 par défaut ne doit jamais bloquer la saisie**. Auditer sa zone et appliquer partout.
3. **Build discipline** : stop `next dev` (port 3000) du worktree avant de builder.

## 🔀 Répartition 3 agents (zéro conflit de fichiers — chacun son worktree/branche)
- **Agent PRINCIPAL (patron / intégrateur)** — `app/[tenant]/timesheets/**`, `app/[tenant]/admin/**`, `lib/**`, `supabase/migrations/**`. Tâches : **#45, #46, #47, #35, #17, #19** + #49 (parties timesheets/admin). Merge les branches des autres agents dans `feat/modular-foundation` + `main`.
- **Agent PLANNER** (branche `agent-planner`) — UNIQUEMENT `components/planner/**`. Tâches : **#34 (R14)**, **#6 (P5)**.
- **Agent UI/MODULES** (branche `agent-ui`) — `components/BackButton.tsx` (nouveau), `app/[tenant]/projects/**`, `app/[tenant]/clients/**`, `components/steps/**` (AST), `components/inventory/**`, `components/soumissions/**`, `components/bons/**`. Tâche : **#49** (composant Retour partagé + application dans CES pages). Ne touche PAS planner, timesheets, `admin/page.tsx`, `lib/**`, `supabase/**`.
- **Agent AFFILIATION** (branche `agent-affiliation`) — `app/auth/admin/**`, `app/api/admin/affiliate-contract/**` (nouveau), `components/admin/AffiliateContract.tsx` (nouveau), `lib/affiliateContract.ts` (nouveau), `supabase/migrations/120_affiliate_contracts.sql` (nouveau, n° 120 réservé). Tâche : **#51**. Ne touche PAS `app/[tenant]/admin/page.tsx`, timesheets, planner, autres `lib/*` existants, migrations < 120.

### 📥 Correctifs routés (file par agent) — maj 2026-06-03 (tout mergé sur main)
- **Agent 1 (Planner)** : ✅#34, ✅#6 mergés · reste **#52** (calendrier: mois=tâches dessous / grille=retirer du dessus), **#53** (traduction FR/EN), **#60** (révision vue mobile calendrier + mode jour/nuit + responsive vue grille).
- **Agent 2 (UI/Modules)** ⚠️ FIGÉ ~15 h (dernier push #49) — relancer d'urgence, voir BRIEF_AGENT2.md : **#55 EN PREMIER** (persistance Supabase `items`/`item_locations`, fin du localStorage silencieux), **#56 + scanner** (stand/hors-app = fiche produit + prix vendant + qté dispo en lecture ; via app = mouvements entrée/sortie→qté→OK), **QR style AST/Inspection imprimable multi-format étiquette** (réutiliser le générateur QR existant), **#54** (mobile), **#58** (min/max + champs écrasables), **#61** (bilingue header ⊂ #68), **#62** (timer gaz espace clos), **#68** (dédoublonnage + interconnexion hôte).
- **Agent 3 (Affiliation)** : ✅#51, ✅#63 mergés · **#75** (corrections contrat : client par défaut, courriel sans repli sur l'admin, bouton Supprimer, clause résiliation si le vendeur nuit, 2 logos C-Secur haut-gauche + Cerdia bas-centre — voir BRIEF_AGENT3.md) · #69 (en cours, branche #69c poussée non mergée), #70. Zone : `app/admin/commissions/**`, `app/admin/vendors/**`, `app/admin/affiliate-contracts/**`, `app/api/admin/affiliate-*`, `components/admin/AffiliateContract.tsx`, `lib/affiliate*`.
- **Agent 4 (Incidents)** : ✅ near-miss mergé · reste **#67** (module Accidents/Incidents complet), **#71** (dashboard analytique incidents + export déclaration réglementaire). Zone : `app/[tenant]/accidents/**`, `app/[tenant]/near-miss/**`, `components/IncidentReport/**`.

### 🔁 Règle file : chaque agent garde ≥2 tâches en attente (le patron réalimente). Profondeur actuelle — A1:2 (#60 en cours,#72 poussé) · A2:7 (FIGÉ — relancer) · A3:3 (#75,#69,#70) · A4:2 (#67,#71).
- **Patron** : ✅#46,#64,#65,#66,#57(Phase 1),#73(RH hub 360),#74(partage API ERP),fix enregistrement client (+migration 113) · reste **#76** (traduction FR/EN admin), #45 (dépenses→compta), #47 (paie par poste), #57 Phase 2 (gates+self-edit), #59 (propager temps réel), **#19** (rotation service_role + mdp admin — relancé par Agent 1), #17 (durcir RLS). #35/#50 ✅.

### 📌 Suivi d'avancement (maj continue par le patron)
| # | Tâche | Agent | Statut |
|---|---|---|---|
| 42 | Masquer $ employé + taux user | Principal | ✅ |
| 48 | Taux dérivé évaluation | Principal | ✅ |
| 43 | 7 jours | Principal | ✅ |
| 44 | Dépenses + reçu | Principal | ✅ |
| 45 | Dépenses → compta/taxes | Principal | ⏳ en cours |
| 46 | Conditions de grille | Principal | ⏯️ à faire |
| 47 | Paie par poste + GL | Principal | ⏯️ bloqué par 45,46 |
| 35 | R15 Transactions | Principal | ⏯️ à faire |
| 17/19 | Sécurité RLS / service-role | Principal | ⏯️ avant prod |
| 34 | R14 Optimiseur IA | Planner | ⏯️ assigné |
| 6 | P5 Nettoyage planner | Planner | ⏯️ assigné |
| 49 | Bouton Retour (zone modules) | UI/Modules | ⏯️ assigné |

---

## 🧾 Feuilles de temps / Paie / Comptabilité (Agent PRINCIPAL)
- [ ] **#44** — Ligne **Dépense avec pièce jointe** (reçu) en remplacement/complément de « matériel » : catégorie + montant + sous-total + taxes (TPS/TVQ) + fournisseur + upload reçu (Storage).
- [ ] **#45** — **Dépenses → comptabilité** : à l'approbation, écritures GL avec codes de taxe par juridiction (CTI/ITC, RTI/ITR QC), remboursable employé. Règles ARC : n° TPS fournisseur, seuil 100$, conservation 6 ans, 50% repas. *(bloqué par #44)*
- [ ] **#46** — **Conditions de grille** dans la feuille : primes/per-diem/km/seuils OT-DT par grille/poste (lier `timesheets.poste_id` + `planner_personnel.current_grid_id`) ; allocations/bonus par grille (aujourd'hui globaux).
- [ ] **#47** — **Paie par poste** : run depuis feuilles approuvées, classé par poste ; brut/net (retenues féd/QC) ; bulletin (employé voit le sien) ; écriture GL salaires par poste. *(bloqué par #45, #46)*

## 🧭 UI / Navigation (Agent PRINCIPAL)
- [ ] **#49** — Bouton **Retour** sous le header principal (ne pas cacher le logo) + toujours `router.back()`. Scanner TOUS les « Retour » et uniformiser.

## 💳 Admin (Agent PRINCIPAL)
- [ ] **#35 (R15)** — Refonte module **Transactions** : sélecteurs revenu/dépense + taxe, dashboard comptes, contrôle bancaire, normes fiscales par province, lien comptabilité.

## 🔒 Sécurité — avant prod (Agent PRINCIPAL)
- [ ] **#17** — RLS multi-tenant (USING(true) + DEFAULT tenant → fuite inter-tenant). Durcir.
- [ ] **#19** — Service-role fallback + mot de passe admin en clair à éliminer.

## 🗓️ Planificateur (Agent PLANNER)
- [ ] **#34 (R14)** — Optimiseur IA : brancher `optimizePersonnelAssignment()` (JobModal.jsx) sur les **vraies évaluations** (`planner_personnel.skill_scores` pondéré par `poste_salary_grids.skill_form`, ou `skill_score` de `employee_evaluations`). Équilibrer par score réel + afficher le score de chaque suggestion. Déterministe (pas de LLM).
- [ ] **#6 (P5)** — Nettoyage planificateur : doublons morts, `console.log`, découper PlanificateurFinal/JobModal. Zéro régression.

## ⏸️ Bloqué (décisions requises)
- [ ] **#10 (PP1-PP8)** — Pointage push : bloqué par 11 décisions (modèle de données, déclencheurs).

---

## ✅ Fait récemment
Catalogue standardisé + soumission + inventaire · R4 appro · R5 bons de commande · audit cartes dashboard · feuilles de temps (schéma 107, accès semaines, bascule superviseur, auth maison, fix 400/RLS) · planner Mois+mes tâches · onglet Personnel planifié · AST cartes mobiles · R9 contrôle intelligent · #37 Excel équipements · #38 taux planner · accès employés (création/login/suspendre/supprimer) · **#42 masquer $ employé** · **#48 taux dérivé éval** · **#43 7 jours**.

## 🗄️ Migrations Supabase (à exécuter dans Supabase)
- **113** — alignement table `clients` (colonnes plates manquantes, address JSONB→TEXT, RLS WITH CHECK) → **corrige l'enregistrement client**. ⚠️ À EXÉCUTER.
- **112** — `tenant_api_keys` (partage API ERP #74). À exécuter.
- **111** — `hr_documents` / `hr_certifications` / `hr_onboarding` (RH hub #73). À exécuter.
- **110** — `tenant_permissions` (#57). · **108** — `timesheet_expenses` (#44).
- **107** — `timesheets` colonnes + RLS + `user_id` nullable. · 101–106 confirmées poussées. · 109/079 confirmées.
- Agents : 120 (affiliate_contracts), 125 (#69 commissions, agent 3), 128 (planner_conges, agent admin) — à exécuter selon merge.

---
_(Historique détaillé de la session AST archivé dans l'historique git — versions précédentes de ce fichier.)_
