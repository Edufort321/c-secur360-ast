# 🚀 C-SECUR360 - PLAN D'INTÉGRATION PROGRESSIVE

---

## ✅ RESTE À FAIRE — Session AST (mis à jour 2026-05-25)

### 🔴 BLOQUANT — Migrations Supabase à exécuter manuellement (SQL Editor)
> Sans elles : l'AST ne se sauvegarde pas, le QR/partage affiche « introuvable »,
> la prise de connaissance, la suppression, les statuts et les moyens de contrôle standards ne marchent pas.
- [ ] `032_work_permits_tables.sql` — crée `ast_permits` / `work_permits`
- [ ] `033_ast_tenant_options.sql` — crée `tenant_ast_options` (options par tenant)
- [ ] `044_fix_ast_permits_rls.sql` — RLS lecture publique + écriture anon (corrige « introuvable »)
- [ ] `045_ast_permits_delete_rls.sql` — RLS DELETE (suppression dashboard)
- [ ] `046_tenant_ast_options_controls.sql` — colonne `hazard` + RLS anon (moyens de contrôle standards)
- [ ] (base fraîche) `004_create_ast_forms.sql` — crée `ast_forms` (ancien chemin /api/ast)

### 🟡 Inter-reliage des modules (à faire)
- [x] Liste pré-remplie de véhicules/équipements industriels dans l'AST
- [ ] **Équipement → Inspection dans l'AST** : choisir « nacelle » (type `aerial`) → si le tenant a un équipement de ce type, afficher dans l'AST son **QR + lien inspection journalière** (`/equipment/{id}/inspect`)
- [ ] **AST ↔ Projet** : saisir un # projet existant → **auto-remplit** l'AST (client, lieu…) et le lie ; si absent → bouton **« Créer ce projet »** (décision retenue : proposer de créer)
- [ ] Scanner les autres liens possibles : Projets ↔ Permis, Planner ↔ Équipement/Personnel, Inventaire ↔ Projet, etc.

### 🟢 Améliorations / suivis notés
- [ ] Unifier les 2 rendus PDF (finalisation = tableaux jsPDF ; vue partagée = capture html2canvas) si on veut un rendu identique
- [ ] Inclure (optionnel) les **documents client** (`clientDocs`) et la fiche LOTO dans le PDF
- [ ] Bouton **« Télécharger PNG »** du QR dans le dashboard (comme l'inspection d'équipement)
- [ ] Décider si `clientAddress` (Informations Client) doit devenir une **colonne dédiée** en base (vit actuellement dans le JSON `projectInfo`)
- [ ] Optionnel : passer les **accents de l'UI AST** (boutons teal) + l'affiche QR en **navy** pour cohérence avec le header/PDF
- [ ] **Sécurité** : les policies RLS AST sont permissives (clé anon). À durcir si une vraie auth Supabase est mise en place

### ✔️ Complété cette session (AST)
- [x] Table `ast_forms` (migration 004) + 033 rendue idempotente
- [x] Numéro AST unique `AST-{TENANT}-{AAAA-MM-JJ}-{CODE}` (+ date complète)
- [x] Champ « Adresse » (Informations Client)
- [x] Retrait de la section « Travailleurs » en double (mode complet)
- [x] Git initialisé dans `-main` + push continu sur `main` (Vercel)
- [x] AST entièrement bilingue via le sélecteur FR/EN du header ; libellé « Retour à AST tableau de bord »
- [x] Participants : recherche intelligente d'employés (admin), entreprise auto = nom du tenant **à la sélection** d'un employé, liste déroulante en `fixed` (plus masquée)
- [x] QR public imprimable (logo tenant/C-Secur, mention « Pense à faire ton AST », logo en haut/QR centré) → page d'accueil `/ast/acces` (Nouveau / Recherche complète)
- [x] Vue partagée bilingue + **prise de connaissance** cochable par l'équipe + lien « Partager à l'équipe » en finalisation
- [x] Dashboard : galerie/liste, filtres semaine/mois/année, multi-sélection + suppression, indicateurs HSE
- [x] Export PDF (champs remplis) : dans la finalisation **et** en lot depuis le dashboard ; structure Étape→Danger→Moyens de contrôle ; bloc Approbation superviseur ; **logo+titre+numéro répétés sur chaque page** ; couleurs **navy**
- [x] Moyens de contrôle ajout/édition par danger + standards persistants du tenant
- [x] Joindre AST/fiche LOTO du client (photo ou document)
- [x] Statuts fonctionnels (brouillon/actif/complété/annulé) — persistance immédiate
- [x] « Nb de travailleurs » écrasable au focus
- [x] Plus de brouillons vides (auto-save seulement si contenu réel)

### 📌 Notes techniques (pour les prochaines sessions)
- Le dossier `C:\CLAUDE\C-Secur360\c-secur360-ast-main` EST le dépôt git/Vercel (branche `main`).
- Type-check : `node node_modules/typescript/bin/tsc --noEmit` — ⚠️ `npx tsc` ne valide RIEN ici.
- L'AST se sauvegarde dans la table **`ast_permits`** (pas `ast_forms`).
- Export PDF : `generateAstsPdf()` exporté depuis `components/steps/Step4Permits/AST` ; rendu via `renderAstSection`.

---

## 📊 STATUT GLOBAL
- **Version Base**: 8zZdkQ4mW (Logo fonctionnel ✅)
- **Version Avancée**: main-2025-08-25 (Features avancées ✅)
- **Objectif**: Intégrer toutes les features avancées dans la base stable
- **Branche Backup**: `backup-advanced-features` ✅
- **Commit Actuel**: `62627a5` - WorkerRegistryAST fonctionnel ✅

## 🎯 **STATUT CRITIQUE - PRIORITÉ IMMÉDIATE**

### ✅ **RÉCEMMENT COMPLÉTÉ**
- [x] **Modal "Ajouter Travailleur" fonctionnelle** 🔧
- [x] **Système d'horodatage complet** ⏰
- [x] **Gestion LOTO cadenas personnels** 🔐
- [x] **Statistiques temps réel** 📊
- [x] **Intégration Step4Validation → WorkerRegistryAST** 🔗
- [x] **WorkerRegistryAST TypeScript errors corrigés** ✅

### ⚠️ **EN COURS URGENT**
- [ ] **Step4Validation.tsx JSX syntax errors** (bloque le build)
- [ ] **Restoration du style sombre cohérent** (partiellement complété)

### 🚀 **PROCHAINES ÉTAPES CRITIQUES**
- [ ] **Corriger build errors** (priorité #1)
- [ ] **Intégration dashboard tenant** (statistiques temps réel)
- [ ] **Module RH - données assiduité** (utiliser WorkerRegistryAST data)

---

---

## 🔥 PHASE 1 - FONDATIONS CRITIQUES (Semaine 1)

### ✅ PRÉPARATION
- [x] Sauvegarder version actuelle dans branche backup
- [x] Restaurer base stable 8zZdkQ4mW avec logo fonctionnel
- [x] Créer TODO.md détaillé

### 🔐 SYSTÈME D'AUTHENTIFICATION AVANCÉ
- [ ] **1.1** - Copier `lib/auth-utils.ts` (authentification MFA)
- [ ] **1.2** - Copier `lib/rbac-utils.ts` (contrôle d'accès basé rôles)
- [ ] **1.3** - Copier `app/types/auth.ts` (types TypeScript auth)
- [ ] **1.4** - Copier `app/types/rbac.ts` (types TypeScript RBAC)
- [ ] **1.5** - Intégrer API routes `/api/auth/login`
- [ ] **1.6** - Intégrer API routes `/api/auth/mfa/setup`
- [ ] **1.7** - Intégrer API routes `/api/auth/mfa/verify`
- [ ] **1.8** - Intégrer API routes `/api/auth/invitations`
- [ ] **1.9** - Tester système de connexion avec MFA
- [ ] **1.10** - Vérifier que le logo fonctionne toujours ✨

### 📊 MISE À JOUR DÉPENDANCES
- [ ] **1.11** - Ajouter `@supabase/ssr@0.7.0`
- [ ] **1.12** - Ajouter `otplib@12.0.1` (TOTP)
- [ ] **1.13** - Ajouter `@zxing/library@0.21.3` (QR scanning)
- [ ] **1.14** - Ajouter `pdf-lib@1.17.1` (génération PDF)
- [ ] **1.15** - Mettre à jour `@prisma/client@5.22.0`
- [ ] **1.16** - Mettre à jour `next-auth@4.24.11`

### 🛡️ CONFIGURATION SÉCURITÉ ENTREPRISE
- [ ] **1.17** - Intégrer `next.config.js` avec headers sécurité
- [ ] **1.18** - Ajouter Content Security Policy (CSP)
- [ ] **1.19** - Configurer protection Cross-Origin
- [ ] **1.20** - Tester compliance ISO 27001/SOC2

**TESTS PHASE 1:**
- [ ] Logo s'affiche correctement sur toutes les pages ✨
- [ ] Système de connexion fonctionne
- [ ] MFA setup et vérification opérationnels
- [ ] RBAC permissions fonctionnelles

---

## 📈 PHASE 2 - ADMINISTRATION AVANCÉE (Semaine 2)

### 🎛️ ADMIN DASHBOARD COMPLET
- [ ] **2.1** - Copier `app/admin/ultimate-dashboard/page.tsx`
- [ ] **2.2** - Copier `app/admin/financial-dashboard/page.tsx`
- [ ] **2.3** - Copier `app/admin/tenant-management/`
- [ ] **2.4** - Copier `app/admin/marketing-automation/`
- [ ] **2.5** - Copier `app/admin/prospects/page.tsx`
- [ ] **2.6** - Copier `app/admin/analytics/page.tsx`
- [ ] **2.7** - Copier `app/admin/system/page.tsx`
- [ ] **2.8** - Copier `app/admin/todo/page.tsx`
- [ ] **2.9** - Intégrer `app/admin/layout.tsx` (sidebar responsive)

### 🔧 API ROUTES ADMIN
- [ ] **2.10** - Copier `/api/admin/tenants`
- [ ] **2.11** - Copier `/api/admin/financial-metrics`
- [ ] **2.12** - Copier `/api/admin/system-health`
- [ ] **2.13** - Copier `/api/admin/analytics`

### 📋 SYSTÈME AST SOPHISTIQUÉ
- [ ] **2.14** - Copier `components/steps/Step1ProjectInfo.tsx`
- [ ] **2.15** - Copier `components/steps/Step2Equipment.tsx`
- [ ] **2.16** - Copier `components/steps/Step3Hazards.tsx`
- [ ] **2.17** - Copier `components/steps/Step4Permits.tsx`
- [ ] **2.18** - Copier `components/steps/Step5Validation.tsx`
- [ ] **2.19** - Copier `components/steps/Step6Finalization.tsx`
- [ ] **2.20** - Intégrer `components/ASTForm.tsx` complet
- [ ] **2.21** - Vérifier mode démo avec restrictions

**TESTS PHASE 2:**
- [ ] Dashboard admin accessible via mot de passe
- [ ] Sidebar mobile responsive fonctionne
- [ ] AST sophistiqué fonctionne pour tenants
- [ ] Mode démo bloque impression/sauvegarde
- [ ] Logo visible dans toutes les nouvelles pages ✨

---

## 📦 PHASE 3 - FONCTIONNALITÉS BUSINESS (Semaine 3)

### 📋 SYSTÈME INVENTAIRE QR
- [ ] **3.1** - Copier `lib/inventory-utils.ts`
- [ ] **3.2** - Copier `app/types/inventory.ts`
- [ ] **3.3** - Copier `app/inventory/page.tsx`
- [ ] **3.4** - Copier composants inventaire
- [ ] **3.5** - Intégrer `/api/inventory/labels/generate`
- [ ] **3.6** - Tester scanning QR mobile
- [ ] **3.7** - Tester génération d'étiquettes PDF

### 👥 MODULE RH COMPLET
- [ ] **3.8** - Copier `components/hr/EmployeeList.tsx`
- [ ] **3.9** - Copier `components/hr/CertificationTracker.tsx`
- [ ] **3.10** - Copier `components/hr/PerformanceManager.tsx`
- [ ] **3.11** - Copier `components/hr/BillingIntegration.tsx`
- [ ] **3.12** - Intégrer API routes `/api/hr/employees`
- [ ] **3.13** - Intégrer API routes `/api/hr/certifications`
- [ ] **3.14** - Intégrer API routes `/api/hr/billing`

### 🏢 PAGES TENANT AVANCÉES
- [ ] **3.15** - Copier `app/[tenant]/billing/page.tsx`
- [ ] **3.16** - Copier `app/[tenant]/equipment/page.tsx`
- [ ] **3.17** - Copier `app/[tenant]/reports/page.tsx`
- [ ] **3.18** - Copier `app/[tenant]/settings/page.tsx`
- [ ] **3.19** - Copier `app/[tenant]/team/page.tsx`
- [ ] **3.20** - Copier `app/[tenant]/improvements/page.tsx`

**TESTS PHASE 3:**
- [ ] Inventaire QR fonctionne sur mobile
- [ ] Module RH accessible et fonctionnel
- [ ] Pages tenant avancées opérationnelles
- [ ] Intégration facturation fonctionne
- [ ] Logo présent sur toutes les nouvelles pages ✨

---

## 🚀 PHASE 4 - INTÉGRATIONS AVANCÉES (Semaine 4)

### 💳 INTÉGRATIONS API EXTERNES
- [ ] **4.1** - Copier `/api/stripe/webhooks`
- [ ] **4.2** - Configurer Supabase SSR
- [ ] **4.3** - Intégrer OpenAI Assistant `/api/openai/assistant`
- [ ] **4.4** - Configurer Make.com webhooks
- [ ] **4.5** - Tester notifications SMS Twilio

### 📊 SYSTÈME GANTT & PROJETS
- [ ] **4.6** - Copier API routes `/api/gantt/projects`
- [ ] **4.7** - Copier API routes `/api/gantt/tasks`
- [ ] **4.8** - Copier API routes `/api/gantt/ai-assist`
- [ ] **4.9** - Intégrer pages de gestion de projets

### ⏰ SYSTÈME FEUILLES DE TEMPS
- [ ] **4.10** - Copier `/api/timesheets/mobile`
- [ ] **4.11** - Intégrer composants timesheet mobiles
- [ ] **4.12** - Connecter avec système de facturation

### 🎯 SYSTÈME DÉMO COMPLET
- [ ] **4.13** - Copier `app/demo/ast/nouveau/page.tsx`
- [ ] **4.14** - Copier `app/demo/hr/page.tsx`
- [ ] **4.15** - Copier `app/demo/inventory/page.tsx`
- [ ] **4.16** - Copier `app/demo/rbac/page.tsx`
- [ ] **4.17** - Configurer restrictions démo

**TESTS PHASE 4:**
- [ ] Webhooks Stripe fonctionnels
- [ ] Système de projets opérationnel
- [ ] Feuilles de temps mobiles
- [ ] Démo complète accessible
- [ ] Logo fonctionne dans tous les modules ✨

---

## 🗄️ PHASE 5 - BASE DE DONNÉES (Semaine 5)

### 📊 MIGRATIONS SQL CRITIQUES
- [ ] **5.1** - Appliquer `20240823_auth_system.sql`
- [ ] **5.2** - Appliquer `20240823_rbac_system.sql`
- [ ] **5.3** - Appliquer `20240823_inventory_system.sql`
- [ ] **5.4** - Appliquer `20240826_create_tenants_table.sql`
- [ ] **5.5** - Appliquer `20240826_security_encryption.sql`

### 📈 MIGRATIONS FONCTIONNELLES
- [ ] **5.6** - Appliquer `hr_module_complete.sql`
- [ ] **5.7** - Appliquer `gantt_sst_core.sql`
- [ ] **5.8** - Appliquer `20240823_timesheet_erp_system.sql`
- [ ] **5.9** - Vérifier intégrité des données

**TESTS PHASE 5:**
- [ ] Toutes les tables créées correctement
- [ ] Relations entre tables fonctionnelles
- [ ] Données de test insérées
- [ ] Performance base de données optimale

---

## ✅ PHASE 6 - TESTS FINAUX & OPTIMISATION (Semaine 6)

### 🧪 TESTS D'INTÉGRATION COMPLETS
- [ ] **6.1** - Test connexion/déconnexion utilisateur
- [ ] **6.2** - Test MFA setup complet
- [ ] **6.3** - Test création AST end-to-end
- [ ] **6.4** - Test système inventaire complet
- [ ] **6.5** - Test module RH fonctionnel
- [ ] **6.6** - Test dashboard admin complet
- [ ] **6.7** - Test responsive mobile toutes pages

### 🎨 VÉRIFICATION LOGO & UX
- [ ] **6.8** - Logo s'affiche sur page d'accueil ✨
- [ ] **6.9** - Logo s'affiche dans header admin ✨
- [ ] **6.10** - Logo s'affiche dans toutes les pages tenant ✨
- [ ] **6.11** - Logo s'affiche dans système démo ✨
- [ ] **6.12** - Logo s'affiche dans modules RH/Inventaire ✨

### ⚡ OPTIMISATION PERFORMANCE
- [ ] **6.13** - Optimiser chargement des images
- [ ] **6.14** - Minifier CSS/JS
- [ ] **6.15** - Configurer cache browser
- [ ] **6.16** - Optimiser requêtes base de données

### 🛡️ TESTS SÉCURITÉ
- [ ] **6.17** - Test injection SQL
- [ ] **6.18** - Test attaques XSS
- [ ] **6.19** - Test bypass authentification
- [ ] **6.20** - Test compliance headers sécurité

**TESTS FINAUX:**
- [ ] ✅ Application complète fonctionnelle
- [ ] ✅ Logo visible partout et fonctionnel
- [ ] ✅ Toutes les features avancées opérationnelles
- [ ] ✅ Performance optimale
- [ ] ✅ Sécurité entreprise validée

---

## 📋 CHECKLIST DE VALIDATION APRÈS CHAQUE PHASE

### ✨ VÉRIFICATION LOGO (Critique)
- [ ] Logo s'affiche en haut à gauche
- [ ] Effet glow fonctionne au hover
- [ ] Texte "C-SECUR360" visible
- [ ] Sous-titre "Sécurité Industrielle" affiché
- [ ] Taille responsive selon écran

### 🔧 VÉRIFICATION FONCTIONNALITÉ
- [ ] Aucune erreur console JavaScript
- [ ] Aucune erreur 404 sur ressources
- [ ] Navigation fluide entre pages
- [ ] Responsive design fonctionne
- [ ] Formulaires soumettent correctement

### 🚀 TESTS DÉPLOIEMENT
- [ ] Build Next.js réussit sans erreurs
- [ ] Tests unitaires passent
- [ ] Lighthouse score > 90
- [ ] Accessibilité validée
- [ ] SEO optimisé

---

## 🆘 PLAN DE ROLLBACK

Si problème critique lors d'une phase :
```bash
# Revenir à la version stable précédente
git checkout HEAD~1

# Ou revenir à la branche backup
git checkout backup-advanced-features
```

---

## 📞 SUPPORT & NOTES

**Priorité Absolue**: Logo fonctionnel ✨  
**Contact**: Tester après chaque modification  
**Backup**: Branche `backup-advanced-features` disponible  

---

## 📅 CALENDRIER ESTIMÉ

- **Semaine 1**: Phase 1 (Fondations)
- **Semaine 2**: Phase 2 (Administration)  
- **Semaine 3**: Phase 3 (Business)
- **Semaine 4**: Phase 4 (Intégrations)
- **Semaine 5**: Phase 5 (Base de données)
- **Semaine 6**: Phase 6 (Tests & Optimisation)

**OBJECTIF FINAL**: Application C-SECUR360 complète avec logo fonctionnel et toutes les features avancées intégrées.

---

---

## 📈 **ÉTAT ACTUEL DU SYSTÈME DE SUIVI TRAVAILLEURS**

### ✅ **FONCTIONNALITÉS COMPLÈTES**

#### 🔧 **WorkerRegistryAST** - ENTIÈREMENT FONCTIONNEL
```typescript
// ✅ Modal d'ajout complète avec:
- Nom/Entreprise (requis) ✅
- Téléphone/Numéro employé ✅ 
- Certifications sélectionnables ✅
- Validation TypeScript corrigée ✅
- Feedback utilisateur avec alerts ✅

// ✅ Système d'horodatage automatique:
- workTimer.startTime (début travaux) ⏰
- workTimer.endTime (fin travaux) ⏰
- workTimer.totalTime (temps accumulé) ⏰
- workTimer.isActive (statut temps réel) ⏰
- Timer incrémental chaque seconde ✅

// ✅ Gestion LOTO complète:
- assignedLocks[] par travailleur 🔐
- Checkboxes apply/remove cadenas ✅
- SMS automatiques LOTO actions 📱
- Validation fin travaux si cadenas actifs ⚠️

// ✅ Statistiques temps réel:
stats = {
  totalRegistered,     // Nombre travailleurs
  activeWorkers,       // En cours de travail
  completedWorkers,    // Travaux terminés
  totalWorkTime,       // Temps total travail
  totalLocks,          // Nombre cadenas total
  activeLocks,         // Cadenas actifs
  averageWorkTime,     // Temps moyen
  companiesCount       // Entreprises distinctes
}
```

#### 🔗 **Intégration Step4Validation**
- ✅ WorkerRegistryAST inclus dans Step4
- ✅ Données LOTO synchronisées
- ✅ Statistiques affichées en header
- ⚠️ Style JSX à corriger (build errors)

#### 📊 **Prêt pour Dashboard/RH**
- ✅ Hook `onStatsChange()` pour synchronisation
- ✅ Fonction `calculateStats()` exportable
- ✅ Toutes données timestamp disponibles
- ✅ Compatible module RH assiduité

### ⚠️ **PROBLÈMES ACTUELS**

#### 🔴 **BLOQUANTS BUILD**
```
Step4Validation.tsx:463 - JSX syntax errors
- Parenthèse ')' attendue
- Structure JSX incohérente
- Indentation mixed (2/4/8 spaces)
```

#### 🟡 **AMÉLIORATIONS PROCHAINES**
- [ ] Dashboard tenant - stats en temps réel
- [ ] Module RH - export données assiduité
- [ ] API endpoints pour données externes
- [ ] Notifications push pour superviseurs

---

*Mis à jour le: 2025-08-29*  
*Version: 2.0 - WorkerRegistryAST Fonctionnel*  
*Statut: WorkerRegistryAST ✅ / Build JSX ⚠️*