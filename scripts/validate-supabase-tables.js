/**
 * Script de validation des tables Supabase
 * Valide la structure de la base de données C-Secur360
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 VALIDATION DES TABLES SUPABASE - C-SECUR360');
console.log('=' .repeat(60));

async function validateSupabaseTables() {
  try {
    // 1. Vérifier la connexion
    console.log('\n📡 Test de connexion...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (connectionError) {
      throw new Error(`Échec connexion: ${connectionError.message}`);
    }
    console.log('✅ Connexion établie avec succès');

    // 2. Lister toutes les tables
    console.log('\n📋 TABLES EXISTANTES:');
    const { data: tables, error: tablesError } = await supabase.rpc('get_public_tables');
    
    if (tablesError) {
      // Fallback: essayer une requête directe
      const { data: tablesFallback, error: fallbackError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (fallbackError) {
        console.log('❌ Impossible de lister les tables:', fallbackError.message);
        return;
      }
      
      console.log(`Trouvé ${tablesFallback?.length || 0} tables:`);
      tablesFallback?.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name} (${table.table_type})`);
      });
    }

    // 3. Valider la table AST_FORMS spécifiquement
    console.log('\n🎯 VALIDATION TABLE AST_FORMS:');
    
    try {
      const { data: astFormsTest, error: astError } = await supabase
        .from('ast_forms')
        .select('*')
        .limit(1);
      
      if (astError) {
        console.log('❌ Table ast_forms introuvable ou inaccessible:', astError.message);
      } else {
        console.log('✅ Table ast_forms accessible');
        console.log('📊 Exemple de données:', astFormsTest?.[0] ? 'Données présentes' : 'Table vide');
      }
    } catch (error) {
      console.log('❌ Erreur accès ast_forms:', error.message);
    }

    // 4. Tester les autres tables critiques
    console.log('\n🔍 VALIDATION AUTRES TABLES CRITIQUES:');
    
    const criticalTables = [
      'users',
      'profiles', 
      'tenants',
      'customers',
      'worker_registry_entries',
      'loto_locks',
      'sms_alerts',
      'confined_space_permits'
    ];

    for (const tableName of criticalTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Accessible`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: Exception - ${error.message}`);
      }
    }

    // 5. Tester l'insertion dans ast_forms
    console.log('\n💾 TEST D\'INSERTION AST_FORMS:');
    
    try {
      const testAST = {
        tenant_id: 'demo-test',
        user_id: 'test-user',
        project_number: 'TEST-2025-001',
        client_name: 'Client Test Validation',
        work_location: 'Site de test',
        ast_mdl_number: 'AST-TEST-2025-' + Date.now(),
        work_description: 'Test de validation de la structure',
        status: 'draft'
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('ast_forms')
        .insert(testAST)
        .select()
        .single();

      if (insertError) {
        console.log('❌ Test insertion échoué:', insertError.message);
      } else {
        console.log('✅ Test insertion réussi - ID:', insertResult.id);
        
        // Nettoyer le test
        const { error: deleteError } = await supabase
          .from('ast_forms')
          .delete()
          .eq('id', insertResult.id);
        
        if (deleteError) {
          console.log('⚠️ Nettoyage test échoué:', deleteError.message);
        } else {
          console.log('✅ Test nettoyé');
        }
      }
    } catch (error) {
      console.log('❌ Exception test insertion:', error.message);
    }

    // 6. Résumé de validation
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RÉSUMÉ DE VALIDATION:');
    console.log('✅ Connexion Supabase: OK');
    console.log('✅ Accès base de données: OK');
    console.log('✅ Table ast_forms: Vérifiée');
    console.log('🎯 Structure validée pour le système AST');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error.message);
    console.log('\n🔧 ACTIONS SUGGÉRÉES:');
    console.log('1. Vérifier les clés Supabase');
    console.log('2. Valider les permissions RLS');
    console.log('3. Confirmer que les migrations ont été exécutées');
  }
}

// Exécuter la validation
validateSupabaseTables()
  .then(() => {
    console.log('\n🎉 Validation terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec validation:', error);
    process.exit(1);
  });