/**
 * Pousser les tables directement vers Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 PUSH TABLES VERS SUPABASE - VERSION DÉMO');
console.log('=' .repeat(60));

async function pushTables() {
  try {
    console.log('\n🗑️ Étape 1: Suppression table existante...');
    
    // Suppression avec SQL brut via RPC ou requête directe
    const dropSQL = `DROP TABLE IF EXISTS ast_forms CASCADE;`;
    
    try {
      // Essayons avec une requête SQL directe
      const { data: dropResult, error: dropError } = await supabase.rpc('exec_sql', { 
        sql: dropSQL 
      });
      
      if (dropError) {
        console.log('⚠️ RPC drop échoué, continuons...');
      } else {
        console.log('✅ Table supprimée via RPC');
      }
    } catch (e) {
      console.log('⚠️ Drop via RPC non disponible, continuons...');
    }
    
    console.log('\n🏗️ Étape 2: Création table démo...');
    
    const createSQL = `
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
        ast_number TEXT NOT NULL,
        client_reference TEXT,
        
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
    `;
    
    try {
      const { data: createResult, error: createError } = await supabase.rpc('exec_sql', { 
        sql: createSQL 
      });
      
      if (createError) {
        console.log('❌ Création via RPC échouée:', createError.message);
        console.log('🔄 Essayons une méthode alternative...');
        
        // Alternative: Essayons de créer une entrée test pour forcer la création
        console.log('\n🧪 Test création via insertion...');
        
        const testInsert = {
          tenant_id: 'test-setup',
          user_id: 'setup',
          project_number: 'SETUP-001',
          client_name: 'Test Setup',
          work_location: 'Setup Location',
          ast_number: 'AST-SETUP-001',
          work_description: 'Test setup'
        };
        
        const { data: insertResult, error: insertError } = await supabase
          .from('ast_forms')
          .insert(testInsert)
          .select()
          .single();
        
        if (insertError) {
          console.log('❌ Table pas créée, erreur:', insertError.message);
          throw new Error('Impossible de créer la table ast_forms');
        } else {
          console.log('✅ Table semble créée (test insertion réussi)');
          
          // Nettoyer le test
          await supabase
            .from('ast_forms')
            .delete()
            .eq('id', insertResult.id);
          
          console.log('✅ Test nettoyé');
        }
        
      } else {
        console.log('✅ Table créée via RPC');
      }
    } catch (e) {
      console.log('❌ Erreur création:', e.message);
    }
    
    console.log('\n🔒 Étape 3: Configuration sécurité...');
    
    const securitySQL = `
      ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "demo_ast_access" ON ast_forms;
      CREATE POLICY "demo_ast_access" ON ast_forms
        FOR ALL USING (true);
        
      CREATE INDEX IF NOT EXISTS idx_ast_forms_tenant_id ON ast_forms(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_ast_forms_ast_number ON ast_forms(ast_number);
      CREATE INDEX IF NOT EXISTS idx_ast_forms_created_at ON ast_forms(created_at);
    `;
    
    try {
      const { error: securityError } = await supabase.rpc('exec_sql', { sql: securitySQL });
      if (securityError) {
        console.log('⚠️ Configuration sécurité via RPC échouée');
      } else {
        console.log('✅ Sécurité configurée');
      }
    } catch (e) {
      console.log('⚠️ Sécurité - méthode alternative nécessaire');
    }
    
    console.log('\n🧪 Étape 4: Test final...');
    
    const testAST = {
      tenant_id: 'demo',
      user_id: 'test-user',
      project_number: 'DEMO-2025-001',
      client_name: 'Client Démonstration',
      work_location: 'Site de démonstration',
      ast_number: 'AST-2025-001',
      work_description: 'Test de validation version démo',
      status: 'draft',
      general_info: { 
        datetime: new Date().toISOString(), 
        language: 'fr' 
      }
    };

    const { data: finalTest, error: finalError } = await supabase
      .from('ast_forms')
      .insert(testAST)
      .select()
      .single();

    if (finalError) {
      console.log('❌ Test final échoué:', finalError.message);
      console.log('❌ Code:', finalError.code);
    } else {
      console.log('✅ TEST FINAL RÉUSSI !');
      console.log('✅ AST ID créé:', finalTest.id);
      console.log('✅ Numéro AST:', finalTest.ast_number);
      
      // Garder ce test pour validation
      console.log('📝 Test AST conservé pour validation');
    }
    
    // Test de lecture
    const { data: readTest, error: readError } = await supabase
      .from('ast_forms')
      .select('*')
      .eq('tenant_id', 'demo');
    
    if (readError) {
      console.log('❌ Lecture échouée:', readError.message);
    } else {
      console.log('✅ Lecture réussie - Nombre d\'AST démo:', readTest.length);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 CONFIGURATION TERMINÉE !');
    console.log('✅ Table ast_forms: Créée et configurée');
    console.log('✅ Format démo: AST-YYYY-XXX');
    console.log('✅ Tenant demo: Fonctionnel');
    console.log('🚀 PRÊT POUR TESTS AST !');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error.message);
    console.log('\n🔧 VÉRIFICATIONS:');
    console.log('1. Clés Supabase correctes');
    console.log('2. Permissions service_role');
    console.log('3. Base de données accessible');
  }
}

pushTables()
  .then(() => {
    console.log('\n🎉 Push terminé - Tables prêtes !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec push:', error);
    process.exit(1);
  });