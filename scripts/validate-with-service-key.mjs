/**
 * Validation avec la clé service role
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 VALIDATION AVEC CLÉ SERVICE ROLE');
console.log('=' .repeat(60));

async function validateWithServiceKey() {
  try {
    // Test direct sur ast_forms
    console.log('\n🎯 TEST AST_FORMS AVEC SERVICE KEY:');
    
    const { data: astData, error: astError } = await supabase
      .from('ast_forms')
      .select('id, tenant_id, client_name, ast_mdl_number, status, created_at')
      .limit(5);
    
    if (astError) {
      console.log('❌ Erreur ast_forms:', astError.message);
      console.log('   Code:', astError.code);
      console.log('   Hint:', astError.hint || 'Aucun indice');
    } else {
      console.log('✅ ast_forms ACCESSIBLE !');
      console.log('📊 Entrées trouvées:', astData?.length || 0);
      
      if (astData && astData.length > 0) {
        console.log('\n📋 AST EXISTANTS:');
        astData.forEach((ast, index) => {
          console.log(`   ${index + 1}. ${ast.ast_mdl_number} - ${ast.client_name}`);
          console.log(`      Tenant: ${ast.tenant_id} | Status: ${ast.status}`);
          console.log(`      Créé: ${new Date(ast.created_at).toLocaleDateString()}`);
          console.log('');
        });
      }
    }
    
    // Test des autres tables
    console.log('🔍 AUTRES TABLES CRITIQUES:');
    
    const tables = ['confined_space_permits', 'worker_registry_entries', 'loto_locks'];
    
    for (const tableName of tables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: ${count || 0} entrées`);
        }
      } catch (e) {
        console.log(`❌ ${tableName}: ${e.message}`);
      }
    }
    
    // Lister toutes les tables disponibles
    console.log('\n📋 LISTE DE TOUTES LES TABLES:');
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_list');
      
      if (tablesError) {
        console.log('❌ Impossible de lister les tables:', tablesError.message);
        
        // Fallback : essayer quelques tables communes
        const commonTables = [
          'ast_forms', 'users', 'profiles', 'tenants', 'customers',
          'confined_space_permits', 'worker_registry_entries', 
          'loto_locks', 'sms_alerts', 'energy_types'
        ];
        
        console.log('\n🔍 TEST TABLES COMMUNES:');
        for (const table of commonTables) {
          try {
            const { error } = await supabase
              .from(table)
              .select('*')
              .limit(0);
            
            console.log(error ? `❌ ${table}` : `✅ ${table}`);
          } catch (e) {
            console.log(`❌ ${table}`);
          }
        }
      } else {
        tables?.forEach(table => {
          console.log(`✅ ${table}`);
        });
      }
    } catch (e) {
      console.log('❌ Erreur listage tables:', e.message);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 ANALYSE TERMINÉE');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('💥 ERREUR:', error.message);
  }
}

validateWithServiceKey();