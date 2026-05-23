/**
 * Pousser les nouvelles tables directement dans Supabase
 * Utilise l'API PostgreSQL via node-postgres
 */

const { Client } = require('pg');

// Configuration PostgreSQL pour Supabase
const pgConfig = {
  host: 'db.nzjjgcccxlqhbtpitmpo.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '321MdlTamara!$',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('🚀 PUSH DIRECT NOUVELLES TABLES SUPABASE');
console.log('=' .repeat(60));

async function pushTablesToSupabase() {
  const client = new Client(pgConfig);
  
  try {
    console.log('🔌 Connexion PostgreSQL Supabase...');
    await client.connect();
    console.log('✅ Connexion établie');
    
    // 1. Recréation ast_forms avec structure complète
    console.log('\n🔧 ÉTAPE 1: Recréation ast_forms...');
    
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
CREATE INDEX idx_ast_forms_created_at ON ast_forms(created_at);

COMMENT ON TABLE ast_forms IS 'Formulaires AST - Version démo avec numérotation générique';
`;

    await client.query(createASTFormsSQL);
    console.log('✅ ast_forms recréé avec succès');
    
    // 2. Vérification structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ast_forms' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log(`📋 Structure ast_forms: ${columnsResult.rows.length} colonnes`);
    columnsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.column_name} (${row.data_type})`);
    });
    
    // 3. Insertion données test
    console.log('\n📊 ÉTAPE 2: Insertion données test...');
    
    const insertTestData = `
INSERT INTO ast_forms (
  tenant_id, user_id, project_number, client_name, work_location,
  ast_number, work_description, status, general_info
) VALUES (
  'demo', 'system', 'DEMO-2025-001', 'Client Démonstration',
  'Site de démonstration C-Secur360', 'AST-2025-001',
  'AST de validation pour démonstration du système', 'draft',
  '{"datetime": "2025-09-03T22:00:00Z", "language": "fr", "demo": true, "version": "corrected"}'::jsonb
);
`;

    await client.query(insertTestData);
    console.log('✅ Données test insérées');
    
    // 4. Tables additionnelles importantes
    console.log('\n🔧 ÉTAPE 3: Création tables worker registry...');
    
    const workerRegistrySQL = `
CREATE TABLE IF NOT EXISTS worker_registry_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ast_id UUID REFERENCES ast_forms(id) ON DELETE SET NULL,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  employee_number TEXT,
  certification TEXT[] DEFAULT '{}',
  signature_base64 TEXT,
  consent_timestamp TIMESTAMPTZ,
  ast_validated BOOLEAN DEFAULT FALSE,
  work_start_time TIMESTAMPTZ,
  work_end_time TIMESTAMPTZ,
  total_work_time_ms BIGINT DEFAULT 0,
  is_timer_active BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  device_info JSONB,
  CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\\+?1?[2-9]\\d{2}[2-9]\\d{2}\\d{4}$')
);

ALTER TABLE worker_registry_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worker_registry_tenant_access" ON worker_registry_entries FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_worker_registry_tenant_id ON worker_registry_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_worker_registry_ast_id ON worker_registry_entries(ast_id);
`;

    await client.query(workerRegistrySQL);
    console.log('✅ worker_registry_entries créé');
    
    // 5. Table LOTO locks
    const lotoLocksSQL = `
CREATE TABLE IF NOT EXISTS loto_locks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_registry_id UUID REFERENCES worker_registry_entries(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  lock_number TEXT NOT NULL,
  lock_type TEXT NOT NULL,
  equipment_description TEXT,
  lock_location TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loto_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loto_locks_tenant_access" ON loto_locks FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_loto_locks_tenant_id ON loto_locks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loto_locks_worker_id ON loto_locks(worker_registry_id);
`;

    await client.query(lotoLocksSQL);
    console.log('✅ loto_locks créé');
    
    // 6. Vérification finale - compter toutes les tables
    const tablesResult = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏆 RÉSULTATS FINAUX');
    console.log('=' .repeat(60));
    
    console.log(`\n📊 TOTAL: ${tablesResult.rows.length} tables dans Supabase`);
    console.log('\n📋 TABLES PRINCIPALES:');
    
    const importantTables = ['ast_forms', 'worker_registry_entries', 'loto_locks', 'tenants', 'profiles', 'users'];
    importantTables.forEach(tableName => {
      const table = tablesResult.rows.find(row => row.table_name === tableName);
      if (table) {
        console.log(`  ✅ ${tableName.padEnd(25)} - ${table.column_count} colonnes`);
      } else {
        console.log(`  ❌ ${tableName.padEnd(25)} - MANQUANT`);
      }
    });
    
    // 7. Test final - vérifier que ast_forms fonctionne
    console.log('\n🔍 TEST FINAL: Récupération AST demo...');
    const testResult = await client.query('SELECT * FROM ast_forms WHERE tenant_id = $1', ['demo']);
    
    if (testResult.rows.length > 0) {
      console.log(`✅ ${testResult.rows.length} AST(s) trouvé(s) pour tenant demo`);
      testResult.rows.forEach((ast, index) => {
        console.log(`  ${index + 1}. ${ast.ast_number} - ${ast.client_name}`);
      });
    } else {
      console.log('⚠️ Aucun AST trouvé pour tenant demo');
    }
    
    return {
      success: true,
      totalTables: tablesResult.rows.length,
      astFormsWorking: testResult.rows.length > 0,
      demoASTCount: testResult.rows.length
    };
    
  } catch (error) {
    console.error('💥 ERREUR PUSH:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

pushTablesToSupabase()
  .then((result) => {
    console.log('\n🎉 PUSH TERMINÉ AVEC SUCCÈS!');
    console.log(`📊 ${result.totalTables} tables actives dans Supabase`);
    console.log(`✅ ast_forms fonctionnel: ${result.astFormsWorking}`);
    console.log(`📄 ${result.demoASTCount} AST demo disponible(s)`);
    
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Tester création AST via interface web');
    console.log('2. Valider sauvegarde automatique');
    console.log('3. Tester récupération AST archivés');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec push:', error);
    process.exit(1);
  });