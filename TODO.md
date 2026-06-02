# C-Secur360 — TODO (tâches restantes) — maj 2026-06-02

> Branches : `feat/modular-foundation` (mirror `main`). Build avant chaque push : `npx tsc --noEmit` (TSC=0) **puis** `npx next build`. **Stop `next dev` (port 3000) avant tout build** (sinon `.next` se corrompt). Messages de commit ASCII sans accents ni guillemets doubles internes. Commit + push sur **les 2 branches** après chaque tâche.

## 🔀 Répartition 2 agents (zéro conflit de fichiers)
- **Agent PLANNER** — UNIQUEMENT `components/planner/**`. Tâches : **#34 (R14)**, **#6 (P5)**. Ne touche PAS `app/[tenant]/admin/**`, `app/[tenant]/timesheets/**`, `lib/**`, `supabase/**`. Travaille dans un **worktree séparé** (`.next` + git isolés).
- **Agent PRINCIPAL** — `app/[tenant]/timesheets/**`, `app/[tenant]/admin/**`, `lib/**`, `supabase/migrations/**`. Tâches : **#44, #45, #46, #47, #49, #35, #17, #19**.

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

## 🗄️ Migrations Supabase
- **107** — `timesheets` colonnes manquantes + RLS permissive + `user_id` nullable (corrige 400). Exécuter si pas déjà fait.
- 101–106 confirmées poussées.

---
_(Historique détaillé de la session AST archivé dans l'historique git — versions précédentes de ce fichier.)_
