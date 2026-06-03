/**
 * Pousser les nouvelles tables via l'API Supabase
 * Utilise des insertions directes et des RPC functions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 PUSH NOUVELLES TABLES VIA SUPABASE API');
console.log('=' .repeat(60));

async function pushTablesViaAPI() {
  try {
    console.log('\n🔍 ÉTAPE 1: Test connexion et état actuel...');
    
    // Test connexion
    const { data: testData, error: testError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);
    
    if (testError) {
      throw new Error(`Connexion échouée: ${testError.message}`);
    }
    
    console.log('✅ Connexion Supabase valide');
    
    // Vérifier état actuel ast_forms
    const { data: astData, error: astError } = await supabase
      .from('ast_forms')
      .select('*')
      .limit(1);
    
    if (astError) {
      console.log(`⚠️ ast_forms erreur: ${astError.message}`);
    } else {
      console.log(`📊 ast_forms actuel: ${astData.length} entrée(s)`);
      if (astData.length > 0) {
        const columns = Object.keys(astData[0]);
        console.log(`📋 ${columns.length} colonnes détectées: ${columns.join(', ')}`);
      }
    }
    
    console.log('\n🔧 ÉTAPE 2: Création fonction pour exécuter DDL...');
    
    // Essayer de créer une fonction RPC pour exécuter du DDL
    const createRPCFunction = `
      CREATE OR REPLACE FUNCTION execute_ddl_statement(sql_statement TEXT)
      RETURNS TEXT AS $$
      BEGIN
        EXECUTE sql_statement;
        RETURN 'SUCCESS: ' || sql_statement;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Utiliser fetch direct pour créer la fonction
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_ddl_statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ 
          sql_statement: createRPCFunction
        })
      });
      
      if (response.ok) {
        console.log('✅ Fonction DDL créée');
      } else {
        const error = await response.text();
        console.log('⚠️ Fonction DDL non créée:', error);
      }
    } catch (e) {
      console.log('⚠️ Exception fonction DDL:', e.message);
    }
    
    console.log('\n📊 ÉTAPE 3: Approche alternative - Validation structure existante...');
    
    // Essayer d'insérer un AST test pour voir les colonnes manquantes
    const testAST = {
      tenant_id: 'demo',
      user_id: 'test-validation',
      project_number: 'VALIDATION-' + Date.now(),
      client_name: 'Test Structure API',
      work_location: 'Site Test API',
      ast_number: 'AST-API-' + Date.now(),
      work_description: 'Test validation structure via API',
      status: 'draft',
      general_info: {
        test: true,
        method: 'api_validation',
        datetime: new Date().toISOString()
      }
    };
    
    console.log('🧪 Test insertion AST pour détecter structure...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('ast_forms')
      .insert(testAST)
      .select();
    
    if (insertError) {
      console.log(`❌ Insertion échouée: ${insertError.message}`);
      console.log('💡 Cela confirme que la structure ast_forms est incomplète');
      
      // Analyser l'erreur pour identifier les colonnes manquantes
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('🔍 Colonnes manquantes détectées dans l\'erreur');
      }
      
      return {
        success: false,
        structureIncomplete: true,
        error: insertError.message,
        needsManualSQL: true
      };
      
    } else {
      console.log('✅ Insertion réussie - structure correcte!');
      console.log(`📄 AST créé avec ID: ${insertData[0].id}`);
      
      // Structure existante, vérifier les données
      const { data: allASTs, error: allError } = await supabase
        .from('ast_forms')
        .select('*')
        .eq('tenant_id', 'demo');
      
      if (!allError) {
        console.log(`📊 ${allASTs.length} AST(s) total pour tenant demo`);
      }
      
      return {
        success: true,
        structureCorrect: true,
        demoASTCount: allASTs.length,
        newASTId: insertData[0].id
      };
    }
    
  } catch (error) {
    console.error('💥 ERREUR API:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function createMissingColumns() {
  console.log('\n🔧 ÉTAPE 4: Tentative création colonnes manquantes...');
  
  // Liste des colonnes essentielles pour ast_forms
  const requiredColumns = [
    'id UUID DEFAULT gen_random_uuid() PRIMARY KEY',
    'tenant_id TEXT NOT NULL',
    'user_id TEXT NOT NULL', 
    'project_number TEXT NOT NULL',
    'client_name TEXT NOT NULL',
    'work_location TEXT NOT NULL',
    'ast_number TEXT NOT NULL',
    'work_description TEXT NOT NULL',
    'status TEXT DEFAULT \'draft\'',
    'general_info JSONB',
    'team_discussion JSONB',
    'isolation JSONB',
    'hazards JSONB',
    'control_measures JSONB',
    'workers JSONB',
    'photos JSONB',
    'created_at TIMESTAMPTZ DEFAULT NOW()',
    'updated_at TIMESTAMPTZ DEFAULT NOW()'
  ];
  
  console.log(`📋 ${requiredColumns.length} colonnes à vérifier/créer`);
  
  // Essayer de créer une à une via ALTER TABLE (probablement échouera)
  for (const column of requiredColumns.slice(1, 5)) { // Test quelques colonnes
    const columnName = column.split(' ')[0];
    const columnDef = column.substring(columnName.length + 1);
    
    try {
      const alterSQL = `ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS ${columnName} ${columnDef}`;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_ddl_statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ 
          sql_statement: alterSQL
        })
      });
      
      if (response.ok) {
        const result = await response.text();
        console.log(`✅ ${columnName}: ${result}`);
      } else {
        console.log(`❌ ${columnName}: Échec`);
      }
      
    } catch (e) {
      console.log(`⚠️ ${columnName}: ${e.message}`);
    }
  }
  
  return { attempted: true };
}

pushTablesViaAPI()
  .then(async (result) => {
    if (result.success) {
      console.log('\n🎉 STRUCTURE AST_FORMS FONCTIONNELLE!');
      console.log(`📊 ${result.demoASTCount} AST(s) pour tenant demo`);
      if (result.newASTId) {
        console.log(`🆔 Nouvel AST créé: ${result.newASTId}`);
      }
      
      console.log('\n✅ L\'API AST peut maintenant fonctionner!');
      
    } else if (result.structureIncomplete) {
      console.log('\n❌ STRUCTURE INCOMPLÈTE CONFIRMÉE');
      console.log('💡 La table ast_forms existe mais sans les bonnes colonnes');
      
      // Essayer l'approche alternative
      await createMissingColumns();
      
      console.log('\n📋 SOLUTION RECOMMANDÉE:');
      console.log('1. Exécuter le SQL de fix-ast-forms-structure.js dans Supabase Dashboard');
      console.log('2. Ou demander l\'exécution manuelle du DDL');
      
    } else {
      console.log('\n❌ ÉCHEC VALIDATION');
      console.log(`Erreur: ${result.error}`);
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec complet:', error);
    process.exit(1);
  });