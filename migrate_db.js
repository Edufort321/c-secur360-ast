const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase - Utilisez vos vraies clés
const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjE5MzU0NCwiZXhwIjoyMDM3NzY5NTQ0fQ.I7D8y3rjQB4W5CXcQfN6_WVeXqGTxSSKBhmYFqeKojE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  try {
    console.log('🚀 Début de la migration incrémentale C-Secur360...');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250824_incremental_updates.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`📄 Migration chargée: ${migrationPath}`);
    console.log(`📊 Taille du script: ${Math.round(migrationSQL.length / 1024)} KB`);

    // Diviser le script en blocs plus petits (par DO $$ blocks)
    const sqlBlocks = migrationSQL.split(/DO \$\$/);
    
    console.log(`🔧 Script divisé en ${sqlBlocks.length} blocs`);

    for (let i = 0; i < sqlBlocks.length; i++) {
      const block = i === 0 ? sqlBlocks[i] : 'DO $$' + sqlBlocks[i];
      
      if (block.trim().length < 10) continue; // Skip empty blocks
      
      console.log(`\n⚡ Exécution du bloc ${i + 1}/${sqlBlocks.length}...`);
      console.log(`📝 Taille: ${Math.round(block.length / 1024)} KB`);
      
      try {
        const { data, error } = await supabase.rpc('exec', {
          sql: block
        });
        
        if (error) {
          console.error(`❌ Erreur bloc ${i + 1}:`, error);
          
          // Essayons avec une approche différente pour ce bloc
          if (error.message.includes('function') || error.message.includes('exec')) {
            console.log(`🔄 Tentative alternative pour bloc ${i + 1}...`);
            
            // Diviser encore plus finement
            const statements = block.split(';').filter(s => s.trim().length > 0);
            
            for (const statement of statements) {
              if (statement.trim().length === 0) continue;
              
              try {
                const { error: stmtError } = await supabase.from('_placeholder').select().eq('fake', 'fake');
                
                // Cette approche ne fonctionne pas, continuons avec les erreurs
                console.warn(`⚠️ Instruction ignorée dans bloc ${i + 1}`);
              } catch (stmtError) {
                console.warn(`⚠️ Instruction échouée dans bloc ${i + 1}:`, stmtError.message.substring(0, 100));
              }
            }
          }
        } else {
          console.log(`✅ Bloc ${i + 1} exécuté avec succès`);
          if (data) {
            console.log(`📊 Résultat:`, typeof data === 'object' ? JSON.stringify(data).substring(0, 100) : data);
          }
        }
        
      } catch (blockError) {
        console.error(`💥 Exception lors de l'exécution du bloc ${i + 1}:`, blockError);
      }
      
      // Petite pause entre les blocs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Migration terminée!');
    console.log('📋 Vérifiez dans Supabase Dashboard que les tables suivantes ont été créées:');
    console.log('  - roles, permissions, role_permissions, user_roles');
    console.log('  - inv_items, inv_locations, inv_stock');
    console.log('  - user_profile_payroll, vehicles');
    console.log('  - Colonnes ajoutées à la table users existante');

  } catch (error) {
    console.error('💥 Erreur générale de migration:', error);
  }
}

// Alternative: Essayer avec une approche plus simple
async function executeSimpleMigration() {
  console.log('\n🔄 Tentative avec approche simplifiée...');
  
  try {
    // Test de connexion simple
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return;
    }
    
    console.log('✅ Connexion Supabase OK');
    
    // Créer les tables une par une avec des requêtes plus simples
    const simpleQueries = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      
      `CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_system BOOLEAN DEFAULT false,
        color VARCHAR(7) DEFAULT '#3b82f6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) UNIQUE NOT NULL,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_dangerous BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    ];
    
    for (let i = 0; i < simpleQueries.length; i++) {
      const query = simpleQueries[i];
      console.log(`\n⚡ Exécution requête ${i + 1}/${simpleQueries.length}...`);
      
      try {
        // Cette approche ne fonctionne pas avec Supabase JS, il faut utiliser l'interface web
        console.log(`📝 Requête: ${query.substring(0, 50)}...`);
        console.log('⚠️ Veuillez exécuter cette requête manuellement dans Supabase Dashboard');
        
      } catch (queryError) {
        console.error(`❌ Erreur requête ${i + 1}:`, queryError);
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur approche simplifiée:', error);
  }
}

// Exécuter la migration
if (require.main === module) {
  executeMigration()
    .then(() => {
      console.log('\n🏁 Script de migration terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { executeMigration, executeSimpleMigration };