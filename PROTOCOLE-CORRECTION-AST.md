# 🚨 PROTOCOLE CORRECTION AST_FORMS - C-SECUR360

## DIAGNOSTIC COMPLET
**Date:** 2025-09-03  
**Problème:** Table `ast_forms` existe mais sans structure (0 colonnes)  
**Impact:** Impossible d'enregistrer les formulaires AST dans Supabase  

### 📊 DÉCOUVERTE SUPABASE
- ✅ **34 tables** découvertes au total (vs 12 initialement)
- ❌ **ast_forms** : 0 colonnes, 0 entrées
- ✅ **tenants** : 3 entrées avec tenant 'demo' disponible
- ✅ **profiles** : 1 entrée active

## 🎯 SOLUTION IMMÉDIATE

### ÉTAPE 1: Exécuter SQL dans Supabase Dashboard
```sql
-- Recréation complète table ast_forms avec structure pour démo
DROP TABLE IF EXISTS ast_forms CASCADE;

CREATE TABLE ast_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  project_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  work_location TEXT NOT NULL,
  client_rep TEXT,
  emergency_number TEXT,
  ast_number TEXT NOT NULL,        -- FORMAT DÉMO: AST-2025-001
  client_reference TEXT,
  work_description TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  general_info JSONB,
  team_discussion JSONB,
  isolation JSONB,
  hazards JSONB,
  control_measures JSONB,
  workers JSONB,
  photos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS et policies pour ast_forms
ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_ast_access" ON ast_forms FOR ALL USING (true);

-- Index pour performance
CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX idx_ast_forms_created_at ON ast_forms(created_at);

-- Insertion test pour démonstration
INSERT INTO ast_forms (
  tenant_id, user_id, project_number, client_name, work_location,
  ast_number, work_description, status, general_info
) VALUES (
  'demo', 'system', 'DEMO-2025-001', 'Client Démonstration',
  'Site de démonstration C-Secur360', 'AST-2025-001',
  'AST de validation pour démonstration du système', 'draft',
  '{"datetime": "2025-01-01T12:00:00Z", "language": "fr", "demo": true}'::jsonb
);
```

### ÉTAPE 2: Validation Structure
Exécuter le script de validation:
```bash
node scripts/validate-ast-structure.js
```

### ÉTAPE 3: Test API AST
Une fois la structure corrigée, l'API `/api/ast` devrait fonctionner:
- ✅ POST: Création nouveaux AST
- ✅ GET: Récupération AST par tenant
- ✅ Format démo: AST-2025-001, AST-2025-002...

## 📋 ÉTAT ACTUEL DU CODE

### ✅ Fichiers Déjà Corrigés
- `lib/supabase.ts` - Functions CRUD pour AST avec format démo
- `app/api/ast/route.ts` - API Supabase (remplace Prisma)
- `app/[tenant]/ast/page.tsx` - Interface AST avec recherche
- `.env.local` - Clés Supabase mises à jour

### ⏳ Tests Requis Après Correction
1. **Création AST**: Nouveau formulaire → Supabase
2. **Liste AST**: Affichage AST tenant demo
3. **Recherche AST**: Fonction de recherche par numéro
4. **Format démo**: Numérotation AST-YYYY-XXX

## 🔧 SCRIPTS DISPONIBLES

### Scripts de Diagnostic
- `scripts/discover-all-tables.js` - Découverte complète tables
- `scripts/extract-schema-advanced.js` - Extraction schéma avancée
- `scripts/validate-ast-structure.js` - Validation structure ast_forms

### Scripts de Correction  
- `scripts/fix-ast-forms-structure.js` - Génère SQL correction
- `scripts/recreate-all-tables.sql` - Recréation tables complètes

## 📊 RÉSULTATS ATTENDUS

Après correction SQL dans Supabase Dashboard:
```
✅ Table ast_forms: 21 colonnes actives
✅ Policy RLS: Accès démonstration activé  
✅ Index: Performance optimisée
✅ Test AST: Entrée de validation présente
✅ API fonctionnelle: Création/lecture AST
```

## 🎯 PROCHAINES ÉTAPES

1. **IMMÉDIAT**: Exécuter SQL dans Supabase Dashboard
2. **VALIDATION**: Tester scripts de validation
3. **FONCTIONNEL**: Créer AST via interface web
4. **INTÉGRATION**: Réintégrer autres modules avancés

---

**ACCÈS SUPABASE:**  
URL: https://supabase.com/dashboard/project/nzjjgcccxlqhbtpitmpo  
Utilisateur: Edufort321 / 321MdlTamara!$  

**COMMANDE RAPIDE:**
```bash
# Validation rapide après correction SQL
cd "C:\C-Secur360\c-secur360\c-secur360-ast-main-2025-08-25"
node scripts/validate-ast-structure.js
```