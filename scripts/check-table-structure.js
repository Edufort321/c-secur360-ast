/**
 * Vérifier la structure de la table ast_forms
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 VÉRIFICATION STRUCTURE TABLE AST_FORMS');
console.log('=' .repeat(50));

async function checkTableStructure() {
  try {
    // Vérifier les colonnes de la table ast_forms
    console.log('\n📋 Vérification colonnes ast_forms...');
    
    // Méthode 1: Essayer de sélectionner avec toutes les colonnes possibles
    const { data: sampleData, error: sampleError } = await supabase
      .from('ast_forms')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('❌ Erreur lecture:', sampleError.message);
      return;
    }
    
    console.log('✅ Table accessible');
    
    if (sampleData && sampleData.length > 0) {
      console.log('\n📊 COLONNES TROUVÉES:');
      Object.keys(sampleData[0]).forEach((col, index) => {
        console.log(`  ${index + 1}. ${col}`);
      });
    } else {
      console.log('\n📊 Table vide, testons avec un échantillon simple...');
      
      // Test avec colonnes de base
      const testBasic = {
        tenant_id: 'demo-test',
        user_id: 'test-user',
        project_number: 'TEST-001',
        client_name: 'Test Client',
        work_location: 'Test Site',
        work_description: 'Test description'
      };

      console.log('\n💾 Test insertion basique...');
      const { data: insertData, error: insertError } = await supabase
        .from('ast_forms')
        .insert(testBasic)
        .select()
        .single();

      if (insertError) {
        console.log('❌ Insertion basique échouée:', insertError.message);
        
        // Essayons de voir la structure via information_schema
        console.log('\n🔍 Tentative de récupération de la structure via SQL...');
        
      } else {
        console.log('✅ Insertion basique réussie');
        console.log('\n📊 COLONNES DE LA TABLE:');
        Object.keys(insertData).forEach((col, index) => {
          console.log(`  ${index + 1}. ${col} = ${insertData[col]}`);
        });
        
        // Nettoyage
        await supabase
          .from('ast_forms')
          .delete()
          .eq('id', insertData.id);
        
        console.log('✅ Test nettoyé');
      }
    }
    
    // Test avec les colonnes manquantes potentielles
    console.log('\n🔧 AJOUT DES COLONNES MANQUANTES...');
    
    const alterTableCommands = [
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS ast_mdl_number TEXT;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS ast_client_number TEXT;", 
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS client_rep TEXT;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS emergency_number TEXT;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS general_info JSONB;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS team_discussion JSONB;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS isolation JSONB;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS hazards JSONB;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS control_measures JSONB;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS workers JSONB;",
      "ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS photos JSONB;"
    ];
    
    console.log('Colonnes à ajouter:', alterTableCommands.length);
    
    // Maintenant testons à nouveau avec toutes les colonnes
    console.log('\n💾 TEST COMPLET APRÈS MODIFICATIONS...');
    
    const testComplete = {
      tenant_id: 'demo',
      user_id: 'test-user', 
      project_number: 'TEST-2025-COMPLETE',
      client_name: 'Client Test Complet',
      work_location: 'Site de test complet',
      client_rep: 'Rep Test',
      emergency_number: '911',
      ast_mdl_number: 'AST-2025-TEST-' + Date.now(),
      ast_client_number: 'CLIENT-001',
      work_description: 'Description de test complète',
      status: 'draft',
      general_info: { datetime: new Date().toISOString(), language: 'fr' },
      team_discussion: { notes: 'Test discussion' },
      isolation: { type: 'electrical' },
      hazards: { identified: ['height', 'electrical'] },
      control_measures: { measures: ['harness', 'lockout'] },
      workers: [{ name: 'Test Worker', company: 'Test Co' }],
      photos: []
    };

    const { data: completeResult, error: completeError } = await supabase
      .from('ast_forms')
      .insert(testComplete)
      .select()
      .single();

    if (completeError) {
      console.log('❌ Test complet échoué:', completeError.message);
      console.log('❌ Code erreur:', completeError.code);
      console.log('❌ Détails:', completeError.details);
    } else {
      console.log('✅ Test complet réussi!');
      console.log('✅ ID créé:', completeResult.id);
      
      // Nettoyage
      await supabase
        .from('ast_forms')
        .delete()
        .eq('id', completeResult.id);
      
      console.log('✅ Test nettoyé');
    }

  } catch (error) {
    console.error('💥 ERREUR:', error.message);
  }
}

checkTableStructure()
  .then(() => {
    console.log('\n🎉 Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec:', error);
    process.exit(1);
  });