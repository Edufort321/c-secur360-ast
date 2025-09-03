/**
 * Pousser les tables via requêtes SQL directes
 */

const https = require('https');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

console.log('🔥 PUSH DIRECT SQL VERS SUPABASE');
console.log('=' .repeat(50));

// Fonction pour exécuter du SQL brut
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'nzjjgcccxlqhbtpitmpo.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: data });
        } else {
          resolve({ success: false, error: data, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function directSQLPush() {
  try {
    console.log('\n🗑️ Étape 1: DROP TABLE...');
    
    const dropSQL = `DROP TABLE IF EXISTS ast_forms CASCADE;`;
    
    const dropResult = await executeSQL(dropSQL);
    if (dropResult.success) {
      console.log('✅ Table supprimée');
    } else {
      console.log('⚠️ Drop échoué:', dropResult.error);
    }
    
    console.log('\n🏗️ Étape 2: CREATE TABLE...');
    
    const createSQL = `
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
    `;
    
    const createResult = await executeSQL(createSQL);
    if (createResult.success) {
      console.log('✅ Table créée');
    } else {
      console.log('❌ Création échouée:', createResult.error);
    }
    
    console.log('\n🔒 Étape 3: RLS et Policies...');
    
    const securitySQL = `
      ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "demo_ast_access" ON ast_forms
        FOR ALL USING (true);
        
      CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
      CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
    `;
    
    const securityResult = await executeSQL(securitySQL);
    if (securityResult.success) {
      console.log('✅ Sécurité configurée');
    } else {
      console.log('⚠️ Sécurité échouée:', securityResult.error);
    }
    
    // Alternative: Utilisons l'API REST directement
    console.log('\n🧪 Étape 4: Test via API REST...');
    
    const testData = {
      tenant_id: 'demo',
      user_id: 'test',
      project_number: 'DEMO-001', 
      client_name: 'Client Test',
      work_location: 'Site Test',
      ast_number: 'AST-2025-001',
      work_description: 'Test direct API'
    };
    
    // Test avec fetch/API REST
    const insertResult = await new Promise((resolve, reject) => {
      const postData = JSON.stringify(testData);
      
      const options = {
        hostname: 'nzjjgcccxlqhbtpitmpo.supabase.co',
        port: 443,
        path: '/rest/v1/ast_forms',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({ 
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data,
            status: res.statusCode
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
    
    if (insertResult.success) {
      console.log('✅ Test insertion réussi !');
      console.log('✅ Données:', JSON.parse(insertResult.data));
    } else {
      console.log('❌ Test insertion échoué:', insertResult.data);
      console.log('❌ Status:', insertResult.status);
    }
    
  } catch (error) {
    console.error('💥 ERREUR:', error.message);
  }
  
  console.log('\n📋 RÉSUMÉ:');
  console.log('Si les étapes ci-dessus ont réussi:');
  console.log('✅ Table ast_forms créée avec structure démo');
  console.log('✅ Format: ast_number (AST-YYYY-XXX)');
  console.log('✅ Prêt pour tests avec tenant demo');
}

directSQLPush()
  .then(() => {
    console.log('\n🎉 Push direct terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur push direct:', error);
    process.exit(1);
  });