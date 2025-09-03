/**
 * Analyser et lister toutes les tables existantes dans Supabase
 * Puis recréer le protocole complet
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 ANALYSE COMPLÈTE SUPABASE - C-SECUR360');
console.log('=' .repeat(60));

async function analyzeSupabase() {
  try {
    console.log('\n📋 ÉTAPE 1: DÉCOUVERTE DES TABLES EXISTANTES');
    
    // Liste des tables qu'on s'attend à trouver d'après le code
    const expectedTables = [
      'ast_forms',
      'users', 
      'profiles',
      'tenants',
      'customers',
      'worker_registry_entries',
      'loto_locks',
      'sms_alerts',
      'confined_space_permits',
      'near_miss_events',
      'employees',
      'employee_safety_records',
      'client_billing_profiles',
      'tenant_settings',
      'project_billing_overrides',
      'wip_calculations',
      'wip_calculation_logs'
    ];
    
    console.log('🎯 Tables attendues d\'après le code:');
    expectedTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    
    console.log('\n🔍 Test de chaque table...');
    
    const existingTables = [];
    const missingTables = [];
    const tableDetails = {};
    
    for (const tableName of expectedTables) {
      try {
        console.log(`\n📊 Test: ${tableName}`);
        
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
          missingTables.push(tableName);
        } else {
          console.log(`  ✅ ${tableName}: ${count || 0} entrées`);
          existingTables.push(tableName);
          
          // Récupérer la structure si il y a des données
          if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            tableDetails[tableName] = {
              count: count || 0,
              columns: columns,
              sample: data[0]
            };
            console.log(`     Colonnes: ${columns.join(', ')}`);
          } else {
            tableDetails[tableName] = {
              count: count || 0,
              columns: [],
              sample: null
            };
          }
        }
        
        // Petit délai pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (e) {
        console.log(`  ❌ ${tableName}: Exception - ${e.message}`);
        missingTables.push(tableName);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RÉSUMÉ DE L\'ANALYSE:');
    console.log('=' .repeat(60));
    
    console.log(`\n✅ TABLES EXISTANTES (${existingTables.length}):`);
    existingTables.forEach((table, index) => {
      const details = tableDetails[table];
      console.log(`  ${index + 1}. ${table} - ${details.count} entrées, ${details.columns.length} colonnes`);
    });
    
    console.log(`\n❌ TABLES MANQUANTES (${missingTables.length}):`);
    missingTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    
    console.log('\n📋 DÉTAILS DES STRUCTURES:');
    Object.entries(tableDetails).forEach(([tableName, details]) => {
      console.log(`\n🔹 ${tableName.toUpperCase()}:`);
      console.log(`   Entrées: ${details.count}`);
      console.log(`   Colonnes: ${details.columns.join(', ') || 'Structure inconnue'}`);
      if (details.sample) {
        console.log(`   Exemple:`, JSON.stringify(details.sample, null, 2).substring(0, 200) + '...');
      }
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('🚀 PLAN DE RECONSTRUCTION:');
    console.log('=' .repeat(60));
    
    if (missingTables.length > 0) {
      console.log('📋 TABLES À CRÉER:');
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    }
    
    if (existingTables.length > 0) {
      console.log('🔧 TABLES À VÉRIFIER/CORRIGER:');
      existingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    }
    
    // Générer le protocole complet
    console.log('\n📝 GÉNÉRATION DU PROTOCOLE SUPABASE...');
    
    const protocol = {
      timestamp: new Date().toISOString(),
      supabase_url: supabaseUrl,
      existing_tables: existingTables,
      missing_tables: missingTables,
      table_details: tableDetails,
      total_tables: expectedTables.length,
      success_rate: `${Math.round((existingTables.length / expectedTables.length) * 100)}%`
    };
    
    // Sauvegarder le protocole
    const fs = require('fs');
    fs.writeFileSync('./supabase-protocol.json', JSON.stringify(protocol, null, 2));
    
    console.log('✅ Protocole sauvegardé dans: supabase-protocol.json');
    
    return {
      existingTables,
      missingTables,
      tableDetails
    };
    
  } catch (error) {
    console.error('💥 ERREUR ANALYSE:', error.message);
    throw error;
  }
}

// Fonction pour recréer les tables manquantes
async function recreateTables(analysis) {
  console.log('\n🔧 ÉTAPE 2: RÉCRÉATION DES TABLES MANQUANTES');
  
  // Commencer par ast_forms qui est critique
  if (analysis.missingTables.includes('ast_forms') || 
      !analysis.tableDetails['ast_forms']?.columns.includes('ast_number')) {
    
    console.log('\n🎯 Récréation table ast_forms (VERSION DÉMO)...');
    
    const createASTFormsSQL = `
      DROP TABLE IF EXISTS ast_forms CASCADE;
      
      CREATE TABLE ast_forms (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        project_number TEXT NOT NULL,
        client_name TEXT NOT NULL,
        work_location TEXT NOT NULL,
        client_rep TEXT,
        emergency_number TEXT,
        ast_number TEXT NOT NULL,
        client_reference TEXT,
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
      
      ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "demo_ast_access" ON ast_forms FOR ALL USING (true);
      
      CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
      CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
    `;
    
    console.log('📝 SQL pour ast_forms généré');
    console.log('⚠️  Ce SQL doit être exécuté manuellement dans Supabase Dashboard');
  }
  
  console.log('\n✅ Analyse terminée - Voir supabase-protocol.json pour détails complets');
}

// Exécuter l'analyse
analyzeSupabase()
  .then((analysis) => {
    return recreateTables(analysis);
  })
  .then(() => {
    console.log('\n🎉 ANALYSE ET PROTOCOLE COMPLÉTÉS');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec:', error);
    process.exit(1);
  });