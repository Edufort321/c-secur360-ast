/**
 * Créer table ast_forms pour VERSION DÉMO (sans références réelles)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🎯 CRÉATION TABLE AST_FORMS - VERSION DÉMO');
console.log('=' .repeat(50));

async function createDemoASTTable() {
  
  const createTableSQL = `
    -- Recréer la table pour version démo
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
    
    -- Enable RLS
    ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
    
    -- Policy permissive pour démo
    CREATE POLICY "demo_ast_access" ON ast_forms
      FOR ALL USING (true);
      
    -- Index pour performance
    CREATE INDEX IF NOT EXISTS idx_ast_forms_tenant_id ON ast_forms(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_ast_forms_ast_number ON ast_forms(ast_number);
    CREATE INDEX IF NOT EXISTS idx_ast_forms_created_at ON ast_forms(created_at);
    
    -- Commentaires pour clarifier
    COMMENT ON TABLE ast_forms IS 'Table AST pour version démo - pas de données sensibles';
    COMMENT ON COLUMN ast_forms.ast_number IS 'Numéro AST format démo: AST-YYYY-XXX';
    COMMENT ON COLUMN ast_forms.tenant_id IS 'ID tenant démo (ex: demo, client-test)';
  `;
  
  console.log('📋 SQL POUR VERSION DÉMO:');
  console.log('=' .repeat(50));
  console.log(createTableSQL);
  console.log('=' .repeat(50));
  
  console.log('\n⚠️  IMPORTANT - VERSION DÉMO:');
  console.log('🔧 Veuillez exécuter ce SQL dans Supabase SQL Editor');
  console.log('✅ Plus de référence MDL');
  console.log('✅ Format générique: ast_number = AST-YYYY-XXX');  
  console.log('✅ Adapté pour démonstration');
  
  // Test basique de la table
  try {
    const { data, error } = await supabase
      .from('ast_forms')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('\n❌ Table pas encore mise à jour:', error.message);
    } else {
      console.log('\n✅ Table accessible (structure actuelle)');
    }
  } catch (e) {
    console.log('\n❌ Table pas accessible:', e.message);
  }
  
  console.log('\n📋 APRÈS EXÉCUTION DU SQL:');
  console.log('1. La colonne ast_mdl_number sera remplacée par ast_number');
  console.log('2. Format démo: AST-2025-001, AST-2025-002, etc.');
  console.log('3. Plus de références à des noms réels');
  console.log('4. Prêt pour démonstration client');
}

createDemoASTTable()
  .then(() => {
    console.log('\n🎉 Préparation terminée - Exécutez le SQL dans Supabase');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });