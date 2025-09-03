/**
 * Pousser tables via Supabase Management API
 * Utilise l'API de gestion pour exécuter du SQL directement
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Informations de connexion Supabase
const supabaseProjectId = 'nzjjgcccxlqhbtpitmpo';
const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

console.log('🚀 PUSH TABLES VIA MANAGEMENT API');
console.log('=' .repeat(60));

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`);
  
  try {
    // Essayer l'endpoint SQL direct
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (response.ok) {
      console.log('✅ SQL exécuté avec succès');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.log(`❌ Échec: ${errorText}`);
      
      // Essayer une autre approche avec l'endpoint SQL
      const response2 = await fetch(`${supabaseUrl}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sql',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: sql
      });
      
      if (response2.ok) {
        console.log('✅ SQL exécuté via endpoint /sql');
        return { success: true };
      } else {
        const error2Text = await response2.text();
        console.log(`❌ Échec endpoint /sql: ${error2Text}`);
        return { success: false, error: error2Text };
      }
    }
    
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function pushTablesDirectly() {
  try {
    console.log('🔍 ÉTAPE 1: Test connexion Supabase...');
    
    // Test connexion basique
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/tenants?select=*&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    
    if (!testResponse.ok) {
      throw new Error('Connexion Supabase échouée');
    }
    
    console.log('✅ Connexion Supabase validée');
    
    // SQL pour recréer ast_forms
    const createASTFormsSQL = `
-- Recréation complète table ast_forms
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
  ast_number TEXT NOT NULL UNIQUE,
  client_reference TEXT,
  work_description TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
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

-- RLS et policies
ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre tout (démo)
CREATE POLICY "demo_ast_full_access" ON ast_forms 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Index pour performance
CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX idx_ast_forms_created_at ON ast_forms(created_at DESC);
CREATE INDEX idx_ast_forms_status ON ast_forms(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ast_forms_updated_at 
  BEFORE UPDATE ON ast_forms 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE ast_forms IS 'Formulaires AST - Analyses Sécuritaires du Travail';
COMMENT ON COLUMN ast_forms.ast_number IS 'Numéro AST format: AST-YYYY-XXX';
COMMENT ON COLUMN ast_forms.status IS 'Statut: draft, active, completed, archived';
    `;
    
    console.log('🔧 ÉTAPE 2: Recréation table ast_forms...');
    
    // Essayer plusieurs méthodes pour exécuter le SQL
    let sqlResult = await executeSQL(createASTFormsSQL, 'Recréation ast_forms');
    
    if (!sqlResult.success) {
      console.log('⚠️ Méthode API échouée, essayons par requêtes individuelles...');
      
      // Essayer requête par requête
      const sqlCommands = [
        'DROP TABLE IF EXISTS ast_forms CASCADE;',
        `CREATE TABLE ast_forms (
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
        );`,
        'ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;',
        'CREATE POLICY "demo_ast_access" ON ast_forms FOR ALL USING (true);'
      ];
      
      for (const [index, command] of sqlCommands.entries()) {
        console.log(`🔧 Commande ${index + 1}/${sqlCommands.length}...`);
        const result = await executeSQL(command, `Exécution commande ${index + 1}`);
        if (result.success) {
          console.log(`✅ Commande ${index + 1} réussie`);
        } else {
          console.log(`❌ Commande ${index + 1} échouée: ${result.error}`);
        }
      }
    }
    
    console.log('\n🔍 ÉTAPE 3: Validation structure créée...');
    
    // Vérifier la structure
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Test d'insertion pour valider la structure
    const testAST = {
      tenant_id: 'demo',
      user_id: 'system-push',
      project_number: 'PUSH-TEST-001',
      client_name: 'Test Push Direct',
      work_location: 'Site Test Push',
      ast_number: 'AST-PUSH-' + Date.now(),
      work_description: 'AST de test pour validation push direct',
      status: 'draft',
      general_info: {
        method: 'direct_push',
        timestamp: new Date().toISOString(),
        test: true
      }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('ast_forms')
      .insert(testAST)
      .select();
    
    if (insertError) {
      console.log(`❌ Test insertion échoué: ${insertError.message}`);
      return {
        success: false,
        error: insertError.message,
        needsManualExecution: true
      };
    }
    
    console.log('✅ Test insertion réussi!');
    console.log(`📄 AST créé avec ID: ${insertData[0].id}`);
    
    // Vérifier toutes les données
    const { data: allASTs, error: allError } = await supabase
      .from('ast_forms')
      .select('*')
      .eq('tenant_id', 'demo');
    
    if (!allError) {
      console.log(`📊 ${allASTs.length} AST(s) total pour tenant demo`);
      allASTs.forEach((ast, index) => {
        console.log(`  ${index + 1}. ${ast.ast_number} - ${ast.client_name}`);
      });
    }
    
    return {
      success: true,
      astFormsWorking: true,
      demoASTCount: allASTs.length,
      newASTId: insertData[0].id
    };
    
  } catch (error) {
    console.error('💥 ERREUR PUSH DIRECT:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

pushTablesDirectly()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 PUSH DIRECT RÉUSSI!');
      console.log(`📊 ${result.demoASTCount} AST(s) pour tenant demo`);
      console.log(`🆔 Nouveau test AST: ${result.newASTId}`);
      console.log('\n✅ Table ast_forms entièrement fonctionnelle!');
      console.log('🚀 L\'API AST peut maintenant enregistrer les formulaires!');
      
    } else if (result.needsManualExecution) {
      console.log('\n⚠️ PUSH AUTOMATIQUE IMPOSSIBLE');
      console.log('💡 Exécution manuelle requise dans Supabase Dashboard');
      console.log(`Erreur: ${result.error}`);
      
    } else {
      console.log('\n❌ PUSH ÉCHOUÉ');
      console.log(`Erreur: ${result.error}`);
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec complet push:', error);
    process.exit(1);
  });