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
- **Agent 1** ✅ RÉACTIVÉ — **#89 DGA gestion des actifs** (migration 117 dga_assets + lib/dga/assets.ts + components/dga/AssetsPanel + sélecteur d'actif). Voir BRIEF_AGENT1.md. Zone DGA actifs (disjointe).
- **Agent 2** ✅ RÉACTIVÉ — **#90 DGA tendances/graphiques + rapport PDF + triangle Duval SVG** (components/dga/DuvalTriangle, Trends ; lib/dga/trends, report). Voir BRIEF_AGENT2.md. Zone DGA rapports (disjointe). Inventaire repris par patron.
- **Agent 3 (Affiliation)** ✅ ACTIF : #75 (corrections contrat), #69, #70, **#78** (lien parrainage + attribution inscriptions, mig ≥126), **#79** (tableau de bord vendeur KPIs) — voir BRIEF_AGENT3.md. Zone : `app/admin/commissions/**`, `app/admin/vendors/**`, `app/admin/affiliate-contracts/**`, `app/api/admin/affiliate-*`, `components/admin/AffiliateContract.tsx`, `lib/affiliate*`, migrations ≥120.
- **Agent 4 (Incidents)** ✅ ACTIF : #67, #71, **#80** (CAPA actions correctives, mig ≥127), **#81** (enquête causale 5 pourquoi + témoins/photos) — voir BRIEF_AGENT4.md. Zone : `app/[tenant]/accidents/**`, `app/[tenant]/near-miss/**`, `components/IncidentReport/**`, migrations ≥127.

### 🔁 Règle file : ≥2 tâches/agent. 4 agents actifs. Profondeur — A1:1 (#89) · A2:1 (#90) · A3:6 (#75,#69,#70,#78,#79,#87) · A4:5 (#67,#71,#80,#81,#88) · Patron : moteur DGA avancé ✅, #86 garde modules, #54/#68 inventaire, #76 trad admin, sécu #17/#19, paie #45/#47.
- ✅ **Modules à la carte** : mécanique en place (registre + tenant_modules.enabled + garde `useModuleEnabled`). **DGA en construction complète** : moteur IEEE+Duval+Rogers+IEC+KeyGas (patron, fait) · actifs (A1 #89) · tendances/PDF/triangle (A2 #90). Migrations 116 (faite à exécuter) + 117 (A1).
- **Patron** : ✅#46,#64,#65,#66,#57(Phase 1),#73(RH hub 360),#74(partage API ERP),#77(relance leads démo),fix client(+mig 113),**#55 persistance inventaire(+mig 115)** · en cours **#76** (traduction FR/EN admin, passe 1 faite) · reste #56+scanner+QR inventaire, #45 (dépenses→compta), #47 (paie par poste), #57 Phase 2, #59 (temps réel), **#19** (rotation service_role + mdp admin), #17 (RLS). #35/#50 ✅.

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

## 🗄️ Migrations Supabase — ✅ TOUTES EXÉCUTÉES (confirmé 2026-06-03)
- 107–115 exécutées (dont 111 RH, 112 API ERP, 113 clients, 114 relance démo, 115 inventory_state).
- Agents : 120 (affiliate_contracts) exécutée ; 125 (#69), 128 (conges), + 126/127 (à venir #78/#80) à exécuter au fil des merges.

---
_(Historique détaillé de la session AST archivé dans l'historique git — versions précédentes de ce fichier.)_
