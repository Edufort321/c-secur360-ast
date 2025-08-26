# Guide d'Exécution des Migrations SQL Supabase

## 🚀 Migrations à Exécuter

### 1. Migration Authentification (`20240823_auth_system.sql`)
- **Tables:** `users`, `auth_sessions`, `auth_audit_logs`, `password_reset_tokens`
- **Fonctionnalités:** Authentification sécurisée + TOTP/MFA
- **Compte Admin:** `admin@c-secur360.ca` / `TempPassword123!`

### 2. Migration RBAC (`20240823_rbac_system.sql`)
- **Tables:** `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permission_overrides`, `user_security_settings`, `audit_access_grants`, `user_invitations`
- **Fonctionnalités:** Système de rôles et permissions granulaires avec portées

### 3. Migration ERP (`20240823_timesheet_erp_system.sql`)
- **Tables:** `user_profile_payroll`, `user_sites`, `vehicles`, `vehicle_assignments`, `vehicle_maintenance`, `timesheet_entries`, `planned_work_sessions`, `expense_entries`, `client_billing_configs`, `billing_codes`, `per_diem_rules`, `cross_enterprise_ast_participants`, `system_audit_logs`, `twilio_logs`, `worker_registry`
- **Fonctionnalités:** Feuilles de temps, véhicules, facturation, planification

## 📋 Procédure d'Exécution

### Étape 1: Accès à Supabase Dashboard
1. Aller sur https://app.supabase.com
2. Sélectionner le projet C-Secur360
3. Aller dans `SQL Editor`

### Étape 2: Exécution Séquentielle
**IMPORTANT:** Exécuter dans cet ordre exact :

1. **Première migration:** `20240823_auth_system.sql`
2. **Deuxième migration:** `20240823_rbac_system.sql`  
3. **Troisième migration:** `20240823_timesheet_erp_system.sql`

### Étape 3: Vérification après chaque migration
- Vérifier dans `Table Editor` que toutes les tables sont créées
- Vérifier dans `Authentication > Settings` que les policies RLS sont actives
- Vérifier les données de test dans les tables `roles` et `permissions`

## ✅ Tables à Vérifier (30+ tables total)

### Tables d'Authentification (4)
- [x] `users` - Utilisateurs avec TOTP
- [x] `auth_sessions` - Sessions actives
- [x] `auth_audit_logs` - Audit authentification
- [x] `password_reset_tokens` - Tokens reset password

### Tables RBAC (8)
- [x] `roles` - Rôles modèles (10 rôles système)
- [x] `permissions` - Permissions granulaires (35+ permissions)
- [x] `role_permissions` - Attribution permissions aux rôles
- [x] `user_roles` - Rôles utilisateurs avec portée
- [x] `user_permission_overrides` - Surcharges fines
- [x] `user_security_settings` - Restrictions d'accès
- [x] `audit_access_grants` - Audit changements droits
- [x] `user_invitations` - Invitations employés

### Tables ERP/Timesheet (15+)
- [x] `user_profile_payroll` - Profils paie employés
- [x] `user_sites` - Associations employé-site
- [x] `vehicles` - Flotte véhicules
- [x] `vehicle_assignments` - Attribution véhicules
- [x] `vehicle_maintenance` - Maintenance véhicules
- [x] `timesheet_entries` - Feuilles de temps
- [x] `planned_work_sessions` - Planification Gantt
- [x] `expense_entries` - Dépenses employés
- [x] `client_billing_configs` - Config facturation
- [x] `billing_codes` - Codes facturation
- [x] `per_diem_rules` - Règles indemnités
- [x] `cross_enterprise_ast_participants` - Interop AST
- [x] `system_audit_logs` - Audit système global
- [x] `twilio_logs` - Logs SMS/Voice
- [x] `worker_registry` - Registre travailleurs AST

### Existing Prisma Tables (3)
- [x] `tenants` - Multi-tenant (existant)
- [x] `ast_forms` - Formulaires AST (existant)  
- [x] `near_miss_events` - Événements presque-accidents (existant)

## 🔍 Vérifications Post-Migration

### 1. Indexes et Clés Étrangères
- Vérifier tous les indexes de performance sont créés
- Vérifier toutes les relations FK sont établies

### 2. Policies RLS
- Vérifier RLS activé sur toutes les tables sensibles
- Tester les policies d'accès par rôle

### 3. Triggers et Fonctions
- Vérifier triggers d'audit automatique
- Tester fonctions utilitaires (`user_has_permission()`, etc.)

### 4. Données Initiales (Seeds)
- **Rôles:** 10 rôles système (owner, client_admin, site_manager, etc.)
- **Permissions:** 35+ permissions modulaires
- **Admin:** Compte `admin@c-secur360.ca` créé

## 🚨 Points Critiques
- **Ordre d'exécution:** Respecter l'ordre des migrations (dépendances)
- **RLS:** Toutes les tables sensibles ont RLS activé
- **Audit:** Tous les changements d'accès sont tracés automatiquement
- **Performance:** Indexes créés pour requêtes fréquentes
- **Sécurité:** MFA obligatoire, policies strictes par défaut

## 📞 Support
Si erreurs durant la migration, vérifier:
1. Ordre d'exécution respecté
2. Pas de conflits de noms de tables
3. Droits suffisants sur la base
4. Quota Supabase non dépassé