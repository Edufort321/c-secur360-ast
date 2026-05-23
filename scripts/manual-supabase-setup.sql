-- =====================================================
-- SUPABASE SETUP MANUEL - VERSION DÉMO
-- À copier/coller dans Supabase SQL Editor
-- =====================================================

-- 1. Créer une fonction pour exécuter du SQL (si pas disponible)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
END;
$$;

-- 2. Supprimer et recréer la table ast_forms avec structure démo
DROP TABLE IF EXISTS ast_forms CASCADE;

CREATE TABLE ast_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Informations projet (version démo)
  project_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  work_location TEXT NOT NULL,
  client_rep TEXT,
  emergency_number TEXT,
  
  -- Numérotation AST (format démo générique)
  ast_number TEXT NOT NULL,  -- Format: AST-2025-001
  client_reference TEXT,     -- Référence client optionnelle
  
  work_description TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  
  -- Données structurées JSON
  general_info JSONB,
  team_discussion JSONB,
  isolation JSONB,
  hazards JSONB,
  control_measures JSONB,
  workers JSONB,
  photos JSONB,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activer RLS et créer policy permissive pour démo
ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;

-- Policy permissive pour démonstration
CREATE POLICY "demo_ast_access" ON ast_forms
  FOR ALL USING (true);
  
-- 4. Index pour performance
CREATE INDEX IF NOT EXISTS idx_ast_forms_tenant_id ON ast_forms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX IF NOT EXISTS idx_ast_forms_created_at ON ast_forms(created_at);

-- 5. Commentaires pour clarifier la structure
COMMENT ON TABLE ast_forms IS 'Table AST pour version démo - pas de données sensibles';
COMMENT ON COLUMN ast_forms.ast_number IS 'Numéro AST format démo: AST-YYYY-XXX';
COMMENT ON COLUMN ast_forms.tenant_id IS 'ID tenant démo (ex: demo, client-test)';

-- 6. Insérer un AST de test pour validation
INSERT INTO ast_forms (
  tenant_id,
  user_id,
  project_number,
  client_name,
  work_location,
  ast_number,
  work_description,
  status,
  general_info
) VALUES (
  'demo',
  'system',
  'DEMO-2025-001',
  'Client Démonstration',
  'Site de démonstration C-Secur360',
  'AST-2025-001',
  'AST de validation pour démonstration du système',
  'draft',
  '{"datetime": "2025-01-01T12:00:00Z", "language": "fr", "demo": true}'::jsonb
);

-- 7. Vérification finale
SELECT 
  'Table ast_forms créée avec succès' as message,
  count(*) as nombre_ast,
  array_agg(ast_number) as numeros_ast
FROM ast_forms 
WHERE tenant_id = 'demo';

-- =====================================================
-- FIN DU SETUP - La table est maintenant prête !
-- =====================================================