/**
 * Créer ou corriger la table ast_forms avec la structure complète
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 CRÉATION/CORRECTION TABLE AST_FORMS');
console.log('=' .repeat(50));

async function createASTFormsTable() {
  try {
    console.log('\n🗑️ Suppression de la table existante...');
    
    // On va recréer la table complètement
    const dropTableSQL = `
      DROP TABLE IF EXISTS ast_forms CASCADE;
    `;
    
    console.log('\n🏗️ Création de la table avec structure complète...');
    
    const createTableSQL = `
      CREATE TABLE ast_forms (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        project_number TEXT NOT NULL,
        client_name TEXT NOT NULL,
        work_location TEXT NOT NULL,
        client_rep TEXT,
        emergency_number TEXT,
        ast_mdl_number TEXT NOT NULL,
        ast_client_number TEXT,
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
      
      -- Enable RLS
      ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for tenant access (permissive pour les tests)
      CREATE POLICY "ast_forms_tenant_access" ON ast_forms
        FOR ALL USING (true);
        
      -- Index pour performance
      CREATE INDEX IF NOT EXISTS idx_ast_forms_tenant_id ON ast_forms(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_ast_forms_created_at ON ast_forms(created_at);
    `;
    
    console.log('📝 Exécution du SQL de création...');
    console.log('SQL à exécuter:');
    console.log(createTableSQL);
    
    // Note: Supabase ne permet pas toujours d'exécuter du DDL via l'API
    // Il faut l'exécuter manuellement dans le SQL Editor de Supabase
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('🔧 Veuillez exécuter le SQL suivant dans Supabase SQL Editor:');
    console.log('=' .repeat(50));
    console.log(dropTableSQL);
    console.log(createTableSQL);
    console.log('=' .repeat(50));
    
    // Test si la table existe après création manuelle
    console.log('\n🔍 Test de la table...');
    
    try {
      const { data, error } = await supabase
        .from('ast_forms')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Table pas encore créée:', error.message);
      } else {
        console.log('✅ Table accessible!');
      }
    } catch (e) {
      console.log('❌ Table pas encore accessible:', e.message);
    }
    
    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Copiez le SQL ci-dessus');
    console.log('2. Ouvrez Supabase Dashboard');
    console.log('3. Allez dans SQL Editor');
    console.log('4. Collez et exécutez le SQL');
    console.log('5. Relancez ce script pour tester');

  } catch (error) {
    console.error('💥 ERREUR:', error.message);
  }
}

createASTFormsTable()
  .then(() => {
    console.log('\n🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec:', error);
    process.exit(1);
  });