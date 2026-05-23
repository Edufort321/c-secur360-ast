/**
 * Diagnostic du problème de sauvegarde AST
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNzEyNzMsImV4cCI6MjA1MDY0NzI3M30.yXrJcNEanEb7MmT4fJTqM15vf1KOxZR_LpQ6XEOhQ2U';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA3MTI3MywiZXhwIjoyMDUwNjQ3MjczfQ.H4Tf-_Uz5tqF5BLOF4H0UYfhwbQWBQu4V93fHl9oLYk';

console.log('🔍 DIAGNOSTIC PROBLÈME SAUVEGARDE AST');
console.log('=' .repeat(60));

async function diagnosticAST() {
  // 1. Test avec clé ANON (comme l'app web)
  console.log('\n📱 TEST AVEC CLÉ ANON (comme l\'application web):');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('ast_forms')
      .select('id, tenant_id, client_name')
      .limit(3);
    
    if (anonError) {
      console.log('❌ Clé ANON - Erreur:', anonError.message);
      console.log('   Code:', anonError.code);
      console.log('   Détails:', anonError.details);
      console.log('   Hint:', anonError.hint);
    } else {
      console.log('✅ Clé ANON - Lecture OK:', anonData?.length || 0, 'entrées');
    }
  } catch (e) {
    console.log('❌ Clé ANON - Exception:', e.message);
  }

  // 2. Test avec clé SERVICE (admin)
  console.log('\n🔧 TEST AVEC CLÉ SERVICE (admin):');
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  try {
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('ast_forms')
      .select('id, tenant_id, client_name')
      .limit(3);
    
    if (serviceError) {
      console.log('❌ Clé SERVICE - Erreur:', serviceError.message);
    } else {
      console.log('✅ Clé SERVICE - Lecture OK:', serviceData?.length || 0, 'entrées');
    }
  } catch (e) {
    console.log('❌ Clé SERVICE - Exception:', e.message);
  }

  // 3. Test insertion avec ANON
  console.log('\n💾 TEST INSERTION AVEC CLÉ ANON:');
  
  const testTenantsToTry = ['demo', 'test', 'cerdia-admin'];
  
  for (const tenantToTest of testTenantsToTry) {
    console.log(`\n🎯 Test tenant: ${tenantToTest}`);
    
    const testAST = {
      tenant_id: tenantToTest,
      user_id: 'user-diagnostic-test',
      project_number: `DIAG-${Date.now()}`,
      client_name: `🧪 Test Diagnostic ${tenantToTest}`,
      work_location: 'Site de diagnostic',
      ast_mdl_number: `AST-${tenantToTest.toUpperCase()}-2025-${Date.now()}`,
      work_description: `Test diagnostic pour tenant ${tenantToTest}`,
      status: 'draft'
    };

    try {
      const { data: insertData, error: insertError } = await supabaseAnon
        .from('ast_forms')
        .insert(testAST)
        .select('id, ast_mdl_number')
        .single();

      if (insertError) {
        console.log(`   ❌ Insertion ${tenantToTest}:`, insertError.message);
        console.log(`      Code:`, insertError.code);
        console.log(`      Hint:`, insertError.hint || 'Aucun');
      } else {
        console.log(`   ✅ Insertion ${tenantToTest} réussie:`, insertData.ast_mdl_number);
        
        // Nettoyer immédiatement
        const { error: deleteError } = await supabaseAnon
          .from('ast_forms')
          .delete()
          .eq('id', insertData.id);
          
        console.log(`   🗑️  Nettoyage:`, deleteError ? `Échec - ${deleteError.message}` : 'OK');
      }
    } catch (e) {
      console.log(`   ❌ Exception ${tenantToTest}:`, e.message);
    }
  }

  // 4. Test insertion avec SERVICE KEY
  console.log('\n🔧 TEST INSERTION AVEC CLÉ SERVICE:');
  
  const testASTService = {
    tenant_id: 'diagnostic-service',
    user_id: 'admin-diagnostic-test', 
    project_number: `ADMIN-DIAG-${Date.now()}`,
    client_name: '🔧 Test Admin Service',
    work_location: 'Test admin',
    ast_mdl_number: `AST-ADMIN-2025-${Date.now()}`,
    work_description: 'Test avec clé service role',
    status: 'draft'
  };

  try {
    const { data: serviceInsert, error: serviceInsertError } = await supabaseService
      .from('ast_forms')
      .insert(testASTService)
      .select('id, ast_mdl_number')
      .single();

    if (serviceInsertError) {
      console.log('❌ Insertion SERVICE:', serviceInsertError.message);
    } else {
      console.log('✅ Insertion SERVICE réussie:', serviceInsert.ast_mdl_number);
      
      // Nettoyer
      const { error: deleteError } = await supabaseService
        .from('ast_forms')
        .delete()
        .eq('id', serviceInsert.id);
        
      console.log('🗑️  Nettoyage SERVICE:', deleteError ? `Échec - ${deleteError.message}` : 'OK');
    }
  } catch (e) {
    console.log('❌ Exception SERVICE:', e.message);
  }

  // 5. Recommandations
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 DIAGNOSTIC TERMINÉ');
  console.log('\n💡 RECOMMANDATIONS:');
  console.log('1. Si SERVICE key fonctionne mais pas ANON → Problème RLS');
  console.log('2. Si aucune ne fonctionne → Problème de clés/permissions');
  console.log('3. Si certains tenants fonctionnent → Utiliser ceux-là');
  console.log('4. Vérifier les politiques RLS dans Supabase dashboard');
  console.log('=' .repeat(60));
}

diagnosticAST();