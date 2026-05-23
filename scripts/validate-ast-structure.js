/**
 * Validation de la structure ast_forms après correction
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('✅ VALIDATION STRUCTURE AST_FORMS');
console.log('=' .repeat(50));

async function validateASTStructure() {
  try {
    console.log('\n🔍 TEST 1: Vérification table ast_forms...');
    
    const { data: astData, error: astError } = await supabase
      .from('ast_forms')
      .select('*')
      .limit(1);
    
    if (astError) {
      console.log('❌ Erreur accès ast_forms:', astError.message);
      return { success: false, error: astError.message };
    }
    
    console.log('✅ Table ast_forms accessible');
    console.log(`📊 ${astData.length} entrée(s) trouvée(s)`);
    
    if (astData.length > 0) {
      const columns = Object.keys(astData[0]);
      console.log(`📋 ${columns.length} colonnes détectées:`);
      columns.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col}`);
      });
      
      // Vérifier les colonnes essentielles
      const requiredColumns = [
        'id', 'tenant_id', 'user_id', 'project_number', 'client_name',
        'work_location', 'ast_number', 'work_description', 'status'
      ];
      
      console.log('\n🎯 VALIDATION COLONNES ESSENTIELLES:');
      const missingColumns = [];
      
      requiredColumns.forEach(col => {
        if (columns.includes(col)) {
          console.log(`  ✅ ${col}`);
        } else {
          console.log(`  ❌ ${col} - MANQUANT`);
          missingColumns.push(col);
        }
      });
      
      if (missingColumns.length === 0) {
        console.log('\n🎉 STRUCTURE AST_FORMS VALIDÉE!');
        
        // Test d'insertion
        console.log('\n🔍 TEST 2: Test création AST...');
        
        const testAST = {
          tenant_id: 'demo',
          user_id: 'test-user',
          project_number: `TEST-${Date.now()}`,
          client_name: 'Client Test Validation',
          work_location: 'Site Test',
          ast_number: `AST-TEST-${Date.now()}`,
          work_description: 'Test de validation structure AST',
          status: 'draft',
          general_info: {
            test: true,
            datetime: new Date().toISOString(),
            validation: 'structure_test'
          }
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('ast_forms')
          .insert(testAST)
          .select();
        
        if (insertError) {
          console.log('❌ Erreur test insertion:', insertError.message);
          return { success: false, error: insertError.message };
        }
        
        console.log('✅ Test insertion réussi!');
        console.log(`📄 AST créé avec ID: ${insertData[0].id}`);
        
        // Test de récupération pour tenant demo
        console.log('\n🔍 TEST 3: Récupération AST tenant demo...');
        
        const { data: demoASTs, error: demoError } = await supabase
          .from('ast_forms')
          .select('*')
          .eq('tenant_id', 'demo');
        
        if (demoError) {
          console.log('❌ Erreur récupération demo:', demoError.message);
        } else {
          console.log(`✅ ${demoASTs.length} AST(s) trouvé(s) pour tenant demo`);
          demoASTs.forEach((ast, index) => {
            console.log(`  ${index + 1}. ${ast.ast_number} - ${ast.client_name}`);
          });
        }
        
        return { 
          success: true, 
          columns: columns.length,
          testASTId: insertData[0].id,
          demoCount: demoASTs.length 
        };
        
      } else {
        console.log(`\n❌ ${missingColumns.length} colonne(s) manquante(s)`);
        return { success: false, missingColumns };
      }
      
    } else {
      console.log('⚠️ Table vide, impossible de déterminer la structure');
      console.log('💡 Essayons de créer un AST test...');
      
      // Tentative d'insertion directe pour tester la structure
      const testAST = {
        tenant_id: 'demo',
        user_id: 'validation-test',
        project_number: 'VALIDATION-001',
        client_name: 'Test Structure',
        work_location: 'Site Validation',
        ast_number: 'AST-VALIDATION-001',
        work_description: 'Test pour valider structure table',
        status: 'draft'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('ast_forms')
        .insert(testAST)
        .select();
      
      if (insertError) {
        console.log('❌ Structure incorrecte:', insertError.message);
        return { success: false, error: insertError.message };
      }
      
      console.log('✅ Structure validée par insertion réussie!');
      return { success: true, testCreated: true };
    }
    
  } catch (error) {
    console.error('💥 ERREUR VALIDATION:', error.message);
    return { success: false, error: error.message };
  }
}

validateASTStructure()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 VALIDATION RÉUSSIE!');
      console.log('📋 Structure ast_forms correcte pour enregistrement AST');
      
      if (result.columns) {
        console.log(`📊 ${result.columns} colonnes validées`);
      }
      if (result.testASTId) {
        console.log(`🆔 AST test créé: ${result.testASTId}`);
      }
      if (result.demoCount !== undefined) {
        console.log(`📄 ${result.demoCount} AST(s) pour tenant demo`);
      }
      
      console.log('\n✅ L\'API AST peut maintenant fonctionner correctement!');
    } else {
      console.log('\n❌ VALIDATION ÉCHOUÉE');
      console.log('💡 Exécutez le SQL de fix-ast-forms-structure.js dans Supabase Dashboard');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec validation:', error);
    process.exit(1);
  });