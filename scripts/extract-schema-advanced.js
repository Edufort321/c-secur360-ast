/**
 * Extraction avancée du schéma Supabase via SQL direct
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('📊 EXTRACTION AVANCÉE SCHÉMA SUPABASE');
console.log('=' .repeat(60));

async function extractCompleteSchema() {
  try {
    console.log('\n🔍 ÉTAPE 1: Découverte via information_schema...');
    
    // Créer d'abord une fonction SQL pour exécuter nos requêtes
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION get_table_structure()
      RETURNS TABLE(
        table_name TEXT,
        column_name TEXT,
        data_type TEXT,
        is_nullable TEXT,
        column_default TEXT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          c.table_name::TEXT,
          c.column_name::TEXT,
          c.data_type::TEXT,
          c.is_nullable::TEXT,
          c.column_default::TEXT
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    console.log('🔧 Création fonction d\'extraction...');
    
    // Utiliser fetch direct pour créer la fonction
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: createFunctionSQL })
      });
      
      if (response.ok) {
        console.log('✅ Fonction créée');
      } else {
        const error = await response.text();
        console.log('⚠️ Création fonction échouée:', error);
      }
    } catch (e) {
      console.log('⚠️ Exception création fonction:', e.message);
    }
    
    // Essayons maintenant d'utiliser la fonction
    try {
      const { data: structureData, error: structureError } = await supabase
        .rpc('get_table_structure');
      
      if (structureData && !structureError) {
        console.log(`✅ Structure récupérée: ${structureData.length} colonnes`);
        
        // Organiser par table
        const tableStructures = {};
        structureData.forEach(row => {
          if (!tableStructures[row.table_name]) {
            tableStructures[row.table_name] = [];
          }
          tableStructures[row.table_name].push({
            column: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === 'YES',
            default: row.column_default
          });
        });
        
        console.log('\n📋 TABLES DÉCOUVERTES VIA INFORMATION_SCHEMA:');
        const tableNames = Object.keys(tableStructures).sort();
        tableNames.forEach((tableName, index) => {
          const columns = tableStructures[tableName];
          console.log(`  ${index + 1}. ${tableName} - ${columns.length} colonnes`);
        });
        
        // Sauvegarder la structure complète
        const completeSchema = {
          timestamp: new Date().toISOString(),
          extraction_method: 'information_schema_sql',
          supabase_url: supabaseUrl,
          total_tables: tableNames.length,
          tables: tableStructures,
          table_list: tableNames
        };
        
        const fs = require('fs');
        fs.writeFileSync('./complete-schema-structure.json', JSON.stringify(completeSchema, null, 2));
        
        console.log('\n📁 Schéma complet sauvegardé: complete-schema-structure.json');
        console.log(`🎯 TOTAL DÉCOUVERT: ${tableNames.length} tables`);
        
        return { tables: tableNames, structures: tableStructures };
        
      } else {
        console.log('❌ Fonction get_table_structure échouée:', structureError?.message);
      }
    } catch (e) {
      console.log('❌ Exception utilisation fonction:', e.message);
    }
    
    console.log('\n🔄 FALLBACK: Requête SQL directe...');
    
    // Fallback: requête SQL plus simple
    const simpleTableQuery = `
      SELECT DISTINCT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    try {
      // Utiliser fetch direct pour la requête
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: simpleTableQuery })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Requête SQL directe réussie');
        console.log('Résultat:', result);
      } else {
        const error = await response.text();
        console.log('❌ Requête SQL directe échouée:', error);
      }
    } catch (e) {
      console.log('❌ Exception requête directe:', e.message);
    }
    
    console.log('\n📋 MÉTHODE ALTERNATIVE: Test manuel des tables connues...');
    
    // Liste complète des tables possibles d'après votre documentation
    const knownTables = [
      // Tables utilisateurs et rôles
      'users', 'user_roles', 'user_profile_payroll', 'profiles', 'roles', 
      'role_permissions', 'permissions',
      
      // Tables facturation
      'customers', 'invoices', 'payment_methods', 'billing_events', 
      'checkout_sessions', 'subscriptions', 'entitlements',
      
      // Tables inventaire
      'inv_items', 'inv_locations', 'inv_stock', 'inv_transactions',
      
      // Tables configuration
      'client_billing_configs', 'confined_spaces', 'price_adjustments', 
      'price_config', 'per_diem_logs', 'per_diem_rules',
      
      // Tables véhicules
      'vehicles', 'vehicle_assignments', 'vehicle_logs',
      
      // Tables planification
      'planned_assignments', 'timesheet_entries', 'timesheets',
      
      // Tables système
      'audit_logs', 'expenses', 'tenants',
      
      // Tables AST
      'ast_forms', 'confined_space_permits', 'worker_registry_entries',
      
      // Autres
      'near_miss_events', 'employees', 'employee_safety_records'
    ];
    
    console.log(`🎯 Test de ${knownTables.length} tables connues...`);
    
    const foundTables = [];
    const detailedResults = {};
    
    // Test par chunks
    const chunkSize = 5;
    for (let i = 0; i < knownTables.length; i += chunkSize) {
      const chunk = knownTables.slice(i, i + chunkSize);
      
      const promises = chunk.map(async (tableName) => {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(1);
          
          if (!error) {
            console.log(`  ✅ ${tableName}: ${count || 0} entrées`);
            foundTables.push(tableName);
            
            detailedResults[tableName] = {
              count: count || 0,
              columns: data && data.length > 0 ? Object.keys(data[0]) : [],
              accessible: true
            };
            return tableName;
          }
          return null;
        } catch (e) {
          return null;
        }
      });
      
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏆 RÉSULTATS FINAUX');
    console.log('=' .repeat(60));
    
    console.log(`\n✅ TABLES ACCESSIBLES (${foundTables.length}):`);
    foundTables.sort().forEach((table, index) => {
      const details = detailedResults[table];
      console.log(`  ${index + 1}. ${table.padEnd(25)} - ${details.count} entrées, ${details.columns.length} colonnes`);
    });
    
    // Sauvegarder les résultats finaux
    const finalResults = {
      timestamp: new Date().toISOString(),
      method: 'comprehensive_manual_test',
      supabase_url: supabaseUrl,
      total_found: foundTables.length,
      tables_found: foundTables,
      table_details: detailedResults,
      notes: 'Test exhaustif de toutes les tables connues'
    };
    
    const fs = require('fs');
    fs.writeFileSync('./final-schema-discovery.json', JSON.stringify(finalResults, null, 2));
    
    console.log(`\n📁 Résultats sauvegardés: final-schema-discovery.json`);
    
    return finalResults;
    
  } catch (error) {
    console.error('💥 ERREUR EXTRACTION:', error.message);
    throw error;
  }
}

extractCompleteSchema()
  .then((results) => {
    console.log(`\n🎉 EXTRACTION TERMINÉE - ${results.total_found} tables découvertes`);
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Vérifier final-schema-discovery.json');
    console.log('2. Corriger ast_forms pour enregistrement AST');
    console.log('3. Tester création AST avec structure corrigée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec extraction:', error);
    process.exit(1);
  });