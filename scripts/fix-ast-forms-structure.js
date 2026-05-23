/**
 * Correction de la structure ast_forms via API Supabase Management
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

console.log('🔧 CORRECTION STRUCTURE AST_FORMS');
console.log('=' .repeat(50));

async function fixASTFormsStructure() {
  try {
    console.log('\n⚠️ IMPORTANT: Cette opération doit être exécutée dans Supabase Dashboard');
    console.log('📋 Copiez et exécutez le SQL suivant dans l\'éditeur SQL:');
    console.log('\n' + '=' .repeat(80));
    
    const sqlCommand = `
-- Recréation complète table ast_forms avec structure pour démo
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
  ast_number TEXT NOT NULL,        -- FORMAT DÉMO: AST-2025-001
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

-- RLS et policies pour ast_forms
ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_ast_access" ON ast_forms FOR ALL USING (true);

-- Index pour performance
CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX idx_ast_forms_created_at ON ast_forms(created_at);

-- Insertion test pour démonstration
INSERT INTO ast_forms (
  tenant_id, user_id, project_number, client_name, work_location,
  ast_number, work_description, status, general_info
) VALUES (
  'demo', 'system', 'DEMO-2025-001', 'Client Démonstration',
  'Site de démonstration C-Secur360', 'AST-2025-001',
  'AST de validation pour démonstration du système', 'draft',
  '{"datetime": "2025-01-01T12:00:00Z", "language": "fr", "demo": true}'::jsonb
);

-- Vérification finale
SELECT 'ast_forms recréé avec succès!' as message,
       COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'ast_forms' AND table_schema = 'public';
`;

    console.log(sqlCommand);
    console.log('=' .repeat(80));
    
    console.log('\n📝 ÉTAPES À SUIVRE:');
    console.log('1. Ouvrir https://supabase.com/dashboard/project/nzjjgcccxlqhbtpitmpo');
    console.log('2. Aller à SQL Editor');
    console.log('3. Coller et exécuter le SQL ci-dessus');
    console.log('4. Vérifier que ast_forms a maintenant des colonnes');
    
    // Test de connexion pour valider les credentials
    console.log('\n🔍 TEST CONNEXION SUPABASE...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: testData, error: testError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Connexion Supabase valide');
      console.log(`📊 ${testData.length} tenant(s) trouvé(s)`);
    } else {
      console.log('❌ Erreur connexion:', testError.message);
    }
    
    // Après exécution du SQL, on pourra tester ast_forms
    console.log('\n⏳ APRÈS EXÉCUTION DU SQL, RELANCER CE SCRIPT POUR VALIDATION');
    
    return { success: true, message: 'Instructions fournies' };
    
  } catch (error) {
    console.error('💥 ERREUR:', error.message);
    throw error;
  }
}

fixASTFormsStructure()
  .then((result) => {
    console.log(`\n🎯 ${result.message}`);
    console.log('\n📋 PROCHAINE ÉTAPE: Exécuter le SQL dans Supabase Dashboard');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec:', error);
    process.exit(1);
  });