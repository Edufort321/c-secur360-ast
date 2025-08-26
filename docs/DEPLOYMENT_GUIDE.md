# 🚀 GUIDE DE DÉPLOIEMENT - MODULE RH SÉCURISÉ

## 📋 Checklist de Déploiement

### 1. **Préparation Supabase** (5 min)

#### Vérifier la connexion Supabase
```bash
# Vérifier que Supabase CLI est installé
supabase --version

# Se connecter à votre projet Supabase
supabase login

# Lier le projet local
supabase link --project-ref VOTRE_PROJECT_REF
```

#### Variables d'environnement requises
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.votre-projet.supabase.co:5432/postgres

# Pour le chiffrement (IMPORTANT: Changer en production!)
ENCRYPTION_KEY=your-secure-256-bit-key-change-in-production
```

### 2. **Déploiement des Migrations** (5 min)

#### Appliquer les migrations HR
```bash
# Appliquer toutes les migrations en attente
supabase db push

# Ou migration spécifique
supabase migration up --file 20240826_secure_hr_module.sql
supabase migration up --file 20240826_security_encryption.sql
```

#### Vérifier les tables créées
```sql
-- Dans le Dashboard Supabase > SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'employees', 
  'employee_safety_records', 
  'client_billing_profiles',
  'tenant_settings',
  'project_billing_overrides',
  'wip_calculations'
);
```

### 3. **Configuration Sécurité** (10 min)

#### Activer RLS (Row Level Security)
```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%employee%' OR tablename LIKE '%billing%';
```

#### Configurer la clé de chiffrement
```sql
-- Dans Supabase Dashboard > Settings > Database > Configuration
-- Ajouter la variable app.encryption_key
```

#### Créer les rôles utilisateurs
```sql
-- Ajouter des colonnes role aux users existants si nécessaire
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Mettre à jour un utilisateur admin pour tests
UPDATE users SET role = 'client_admin' WHERE email = 'votre-email@example.com';
```

### 4. **Tests API** (15 min)

#### Collection Postman/Thunder Client

**Base URL**: `https://votre-site.vercel.app/api/hr`

**Headers requis**:
```
Content-Type: application/json
x-tenant-id: demo
```

#### Test 1: Créer un employé
```http
POST /employees
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone_number": "514-555-0123",
  "emergency_contact_name": "Marie Dupont",
  "emergency_contact_phone": "514-555-0124",
  "employee_number": "EMP001",
  "department": "Construction",
  "position": "Ouvrier",
  "role": "worker"
}
```

#### Test 2: Récupérer les employés
```http
GET /employees?includeSafety=true
```

#### Test 3: Créer profil de facturation
```http
POST /billing
{
  "rate_normal": 150.00,
  "rate_overtime_1_5": 225.00,
  "rate_overtime_2_0": 300.00,
  "per_diem_rate": 80.00,
  "currency": "CAD",
  "invoice_prefix": "CSR"
}
```

#### Test 4: Vérifier certifications
```http
GET /certifications?employee_id=EMPLOYEE_UUID&check_expiring=true
```

#### Test 5: Validation AST
```http
POST /certifications
{
  "employee_id": "EMPLOYEE_UUID",
  "required_certifications": ["chariot_elevateur", "travail_hauteur"],
  "strict_mode": true
}
```

### 5. **Configuration Production** (10 min)

#### Vercel Environment Variables
```bash
# Dans Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=production-url
SUPABASE_SERVICE_ROLE_KEY=production-key
ENCRYPTION_KEY=secure-production-key-256-bits
NODE_ENV=production
```

#### Configuration tenant par défaut
```sql
-- Créer tenant de démo si pas existant
INSERT INTO tenants (id, subdomain, companyName, plan, isActive)
VALUES ('demo', 'demo', 'Demo Company', 'premium', true)
ON CONFLICT (id) DO NOTHING;

-- Créer utilisateur admin demo
INSERT INTO users (email, name, role, tenantId)
VALUES ('admin@demo.com', 'Admin Demo', 'client_admin', 'demo')
ON CONFLICT (email) DO NOTHING;
```

### 6. **Vérification Fonctionnelle** (10 min)

#### Dashboard Supabase
1. **Tables**: Vérifier que toutes les tables sont créées
2. **RLS**: Confirmer que les policies sont actives
3. **Functions**: Tester les fonctions PostgreSQL
4. **Indexes**: Vérifier les performance indexes

#### Tests Vercel
1. **Build**: Confirmer que le build passe
2. **API**: Tester les endpoints via navigateur
3. **Logs**: Vérifier les logs d'erreur Vercel
4. **Performance**: Mesurer temps de réponse API

## 🔧 **Dépannage Courant**

### Erreur Migration
```bash
# Si migration échoue
supabase db reset --debug
supabase db push --debug
```

### Erreur RLS
```sql
-- Désactiver temporairement RLS pour debug
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
-- Puis réactiver
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
```

### Erreur Chiffrement
```sql
-- Vérifier l'extension pgcrypto
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Si pas installé
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Erreur API Vercel
- Vérifier les variables d'environnement
- Confirmer que les imports Supabase sont corrects
- Tester les endpoints individuellement

## ✅ **Validation Déploiement**

- [ ] Migrations appliquées sans erreur
- [ ] Tables créées avec RLS activé
- [ ] Variables d'environnement configurées
- [ ] API endpoints fonctionnels
- [ ] Tests Postman passent
- [ ] Build Vercel successful
- [ ] Logs sans erreur critique

## 📊 **Monitoring Post-Déploiement**

### Métriques à surveiller
- Temps de réponse API (<200ms)
- Taux d'erreur (<1%)
- Utilisation base de données
- Logs d'authentification RLS

### Alertes recommandées
- Échec de build Vercel
- Erreurs 500 fréquentes
- Certifications expirantes
- Calculs WIP défaillants

---

**🎯 Objectif**: Module RH opérationnel en production avec sécurité maximale!