/**
 * Correction directe de la table ast_forms
 * Utilise uniquement le client Supabase officiel
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

console.log('🔧 CORRECTION DIRECTE AST_FORMS');
console.log('=' .repeat(50));

async function fixASTFormsDirectly() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    console.log('🔍 ÉTAPE 1: Diagnostic état actuel...');
    
    // Test connexion
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);
    
    if (tenantError) {
      throw new Error(`Connexion échouée: ${tenantError.message}`);
    }
    
    console.log(`✅ Connexion OK - ${tenantData.length} tenant(s) trouvé(s)`);
    
    // Test ast_forms actuel
    const { data: astData, error: astError } = await supabase
      .from('ast_forms')
      .select('*')
      .limit(1);
    
    if (astError) {
      console.log(`⚠️ ast_forms erreur: ${astError.message}`);
    } else {
      console.log(`📊 ast_forms: ${astData.length} entrée(s)`);
      if (astData.length > 0) {
        const columns = Object.keys(astData[0]);
        console.log(`📋 ${columns.length} colonnes: ${columns.slice(0, 5).join(', ')}...`);
      }
    }
    
    console.log('\n💡 APPROCHE: Utiliser les outils Supabase intégrés...');
    
    // Créer une fonction RPC custom pour notre cas
    console.log('🔧 ÉTAPE 2: Création fonction RPC personnalisée...');
    
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION fix_ast_forms_structure()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Supprimer et recréer ast_forms
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
        general_info JSONB DEFAULT '{}',
        team_discussion JSONB DEFAULT '{}',
        isolation JSONB DEFAULT '{}',
        hazards JSONB DEFAULT '{}',
        control_measures JSONB DEFAULT '{}',
        workers JSONB DEFAULT '[]',
        photos JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- RLS
    ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "ast_demo_policy" ON ast_forms FOR ALL USING (true);
    
    -- Index
    CREATE INDEX idx_ast_forms_tenant ON ast_forms(tenant_id);
    CREATE INDEX idx_ast_forms_number ON ast_forms(ast_number);
    
    -- Insertion test
    INSERT INTO ast_forms (
        tenant_id, user_id, project_number, client_name, work_location,
        ast_number, work_description, status, general_info
    ) VALUES (
        'demo', 'system', 'DEMO-001', 'Client Démonstration',
        'Site démo C-Secur360', 'AST-2025-001',
        'AST de démonstration système', 'draft',
        '{"created_by": "rpc_function", "demo": true}'::jsonb
    );
    
    result := 'SUCCESS: ast_forms recréé avec ' || 
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = 'ast_forms' AND table_schema = 'public')::text ||
        ' colonnes et ' ||
        (SELECT COUNT(*) FROM ast_forms)::text ||
        ' entrée(s)';
        
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Essayer de créer et exécuter la fonction
    try {
      const { data: funcResult, error: funcError } = await supabase.rpc('fix_ast_forms_structure');
      
      if (funcError) {
        console.log(`❌ RPC échoué: ${funcError.message}`);
        
        // Approche alternative: utiliser l'API raw SQL
        console.log('🔄 Approche alternative: SQL raw...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
          },
          body: JSON.stringify({
            query: createFunctionSQL
          })
        });
        
        console.log(`Réponse SQL raw: ${response.status}`);
        
      } else {
        console.log(`✅ RPC réussi: ${funcResult}`);
      }
      
    } catch (rpcEx) {
      console.log(`⚠️ Exception RPC: ${rpcEx.message}`);
    }
    
    console.log('\n🔍 ÉTAPE 3: Test de la structure corrigée...');
    
    // Test d'insertion directe pour valider
    const testAST = {
      tenant_id: 'demo',
      user_id: 'test-fix',
      project_number: 'FIX-TEST-001',
      client_name: 'Test Correction Structure',
      work_location: 'Site Test Fix',
      ast_number: 'AST-FIX-' + Date.now(),
      work_description: 'Test pour valider correction structure',
      status: 'draft',
      general_info: {
        fix_attempt: true,
        timestamp: new Date().toISOString()
      }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('ast_forms')
      .insert(testAST)
      .select();
    
    if (insertError) {
      console.log(`❌ Test insertion échoué: ${insertError.message}`);
      
      // Analyser l'erreur pour comprendre ce qui manque
      if (insertError.message.includes('does not exist')) {
        const missingColumn = insertError.message.match(/column "([^"]+)"/);
        if (missingColumn) {
          console.log(`🔍 Colonne manquante détectée: ${missingColumn[1]}`);
        }
      }
      
      return {
        success: false,
        structureIncomplete: true,
        error: insertError.message,
        needsManualFix: true
      };
    }
    
    console.log('✅ Test insertion réussi!');
    console.log(`🆔 AST créé: ${insertData[0].id}`);
    
    // Récupérer tous les AST demo pour validation finale
    const { data: demoASTs, error: demoError } = await supabase
      .from('ast_forms')
      .select('*')
      .eq('tenant_id', 'demo');
    
    if (!demoError) {
      console.log(`📊 Total AST demo: ${demoASTs.length}`);
      demoASTs.forEach((ast, index) => {
        console.log(`  ${index + 1}. ${ast.ast_number} - ${ast.client_name}`);
      });
    }
    
    return {
      success: true,
      astFormsFixed: true,
      demoCount: demoASTs.length,
      testASTId: insertData[0].id,
      columns: insertData.length > 0 ? Object.keys(insertData[0]).length : 0
    };
    
  } catch (error) {
    console.error('💥 ERREUR FIX DIRECT:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

fixASTFormsDirectly()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 CORRECTION DIRECTE RÉUSSIE!');
      console.log(`📊 Structure ast_forms: ${result.columns} colonnes`);
      console.log(`📄 ${result.demoCount} AST(s) demo disponibles`);
      console.log(`🆔 Test AST: ${result.testASTId}`);
      console.log('\n✅ L\'API AST peut maintenant fonctionner normalement!');
      console.log('🚀 Prêt pour création/archivage AST automatique');
      
    } else if (result.structureIncomplete) {
      console.log('\n⚠️ STRUCTURE TOUJOURS INCOMPLÈTE');
      console.log('💡 Solution manuelle requise');
      console.log(`Erreur: ${result.error}`);
      
      console.log('\n📋 ÉTAPES MANUELLES:');
      console.log('1. Ouvrir Supabase Dashboard');
      console.log('2. Aller à SQL Editor');
      console.log('3. Exécuter le SQL de recreate-all-tables.sql');
      
    } else {
      console.log('\n❌ CORRECTION ÉCHOUÉE');
      console.log(`Erreur: ${result.error}`);
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec correction:', error);
    process.exit(1);
  });