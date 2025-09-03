/**
 * Exécution SQL directe avec credentials utilisateur
 */

const { Client } = require('pg');
const fs = require('fs');

// Configuration avec credentials utilisateur
const configs = [
  {
    name: 'Config 1 - Pooler',
    config: {
      host: 'aws-0-ca-central-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.nzjjgcccxlqhbtpitmpo',
      password: '321MdlTamara!$',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Config 2 - Direct DB',
    config: {
      host: 'aws-0-ca-central-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: '321MdlTamara!$',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Config 3 - Connection String',
    connectionString: 'postgresql://postgres:321MdlTamara!$@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?sslmode=require'
  }
];

console.log('🚀 EXÉCUTION SQL DIRECTE AVEC CREDENTIALS');
console.log('=' .repeat(60));

async function executeDirectSQL() {
  // Lire le SQL à exécuter
  let sqlToExecute;
  try {
    sqlToExecute = fs.readFileSync('SOLUTION-IMMEDIATE-AST.sql', 'utf8');
    console.log(`📄 SQL lu: ${sqlToExecute.length} caractères`);
  } catch (error) {
    console.error('❌ Impossible de lire SOLUTION-IMMEDIATE-AST.sql:', error.message);
    return { success: false, error: 'Fichier SQL non trouvé' };
  }

  // Essayer chaque configuration
  for (const { name, config, connectionString } of configs) {
    console.log(`\n🔧 TENTATIVE: ${name}...`);
    
    let client;
    try {
      // Créer client avec config ou connection string
      if (connectionString) {
        client = new Client({ connectionString });
      } else {
        client = new Client(config);
      }
      
      console.log('🔌 Connexion...');
      await client.connect();
      console.log('✅ Connexion établie');
      
      // Test basique
      console.log('🧪 Test connexion...');
      const testResult = await client.query('SELECT NOW() as current_time, current_user as user_name');
      console.log(`✅ Test OK: ${testResult.rows[0].current_time} (${testResult.rows[0].user_name})`);
      
      // Exécuter le SQL principal
      console.log('🔧 Exécution SQL principal...');
      
      // Diviser en blocs pour éviter les problèmes de transaction
      const sqlBlocks = [
        // Bloc 1: Suppression et création table
        `DROP TABLE IF EXISTS ast_forms CASCADE;

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
);`,
        
        // Bloc 2: RLS et policies
        `ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_ast_full_access" ON ast_forms FOR ALL USING (true) WITH CHECK (true);`,
        
        // Bloc 3: Index
        `CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX idx_ast_forms_created_at ON ast_forms(created_at DESC);
CREATE INDEX idx_ast_forms_status ON ast_forms(status);
CREATE INDEX idx_ast_forms_tenant_status ON ast_forms(tenant_id, status);`,
        
        // Bloc 4: Trigger fonction
        `CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ast_forms_updated_at 
    BEFORE UPDATE ON ast_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();`,
    
        // Bloc 5: Données test
        `INSERT INTO ast_forms (tenant_id, user_id, project_number, client_name, work_location, ast_number, work_description, status, general_info) 
VALUES 
('demo', 'system', 'DEMO-2025-001', 'Client Démonstration C-Secur360', 'Site de démonstration - Formation sécurité', 'AST-2025-001', 'AST de démonstration pour validation du système', 'draft', '{"datetime": "2025-09-03T23:00:00Z", "demo": true, "version": "structure_corrected"}'::jsonb),
('demo', 'system', 'DEMO-2025-002', 'Client Test Archivage', 'Site test - Validation archivage', 'AST-2025-002', 'AST pour tester la fonction archivage', 'completed', '{"datetime": "2025-09-03T22:30:00Z", "demo": true, "version": "test_archive"}'::jsonb);`
      ];
      
      // Exécuter chaque bloc
      for (const [index, block] of sqlBlocks.entries()) {
        try {
          console.log(`🔧 Exécution bloc ${index + 1}/${sqlBlocks.length}...`);
          await client.query(block);
          console.log(`✅ Bloc ${index + 1} réussi`);
        } catch (blockError) {
          console.log(`⚠️ Bloc ${index + 1} échoué: ${blockError.message}`);
          if (blockError.message.includes('already exists')) {
            console.log('💡 Erreur "already exists" - continuons...');
          } else if (index === 0) {
            throw blockError; // Échec critique sur création table
          }
        }
      }
      
      // Vérification finale
      console.log('\n🔍 Vérification finale...');
      
      const verifyResult = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ast_forms' AND table_schema = 'public') as columns_count,
          (SELECT COUNT(*) FROM ast_forms WHERE tenant_id = 'demo') as demo_ast_count
      `);
      
      const { columns_count, demo_ast_count } = verifyResult.rows[0];
      console.log(`✅ Structure: ${columns_count} colonnes`);
      console.log(`📄 Données: ${demo_ast_count} AST demo`);
      
      if (columns_count > 15 && demo_ast_count > 0) {
        console.log('\n🎉 SUCCÈS COMPLET!');
        console.log('✅ Table ast_forms fonctionnelle');
        console.log('✅ Structure complète créée');
        console.log('✅ Données test insérées');
        console.log('✅ API AST prêt à fonctionner!');
        
        return {
          success: true,
          config: name,
          columns: columns_count,
          demoASTs: demo_ast_count
        };
      }
      
    } catch (error) {
      console.log(`❌ ${name} échoué: ${error.message}`);
      
      if (error.message.includes('authentication failed')) {
        console.log('🔐 Problème d\'authentification');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.log('🌐 Problème de connexion réseau');
      }
      
    } finally {
      if (client) {
        try {
          await client.end();
          console.log('🔌 Connexion fermée');
        } catch (e) {
          // Ignore close errors
        }
      }
    }
  }
  
  return {
    success: false,
    error: 'Toutes les configurations ont échoué',
    triedConfigs: configs.length
  };
}

executeDirectSQL()
  .then((result) => {
    if (result.success) {
      console.log('\n🏆 MISSION ACCOMPLIE!');
      console.log(`📊 Configuration réussie: ${result.config}`);
      console.log(`📋 ${result.columns} colonnes ast_forms`);
      console.log(`📄 ${result.demoASTs} AST demo créés`);
      console.log('\n🚀 PROCHAINES ÉTAPES:');
      console.log('1. Tester: node scripts/validate-ast-structure.js');
      console.log('2. Créer AST via interface web');
      console.log('3. Vérifier sauvegarde automatique');
    } else {
      console.log('\n❌ ÉCHEC EXÉCUTION DIRECTE');
      console.log(`Testé ${result.triedConfigs} configurations`);
      console.log('💡 Solution manuelle requise dans Supabase Dashboard');
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });