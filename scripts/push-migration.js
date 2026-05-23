// Script pour exécuter la migration SQL directement dans Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Créer client Supabase avec service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lire le fichier SQL
const sqlFilePath = path.join(__dirname, '..', 'EXECUTE_IN_SUPABASE.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error('❌ Fichier SQL non trouvé:', sqlFilePath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Fonction pour exécuter SQL par blocs
async function executeSQLBlocks(sql) {
  console.log('🚀 Début de l\'exécution de la migration...');
  
  // Diviser le SQL en blocs pour éviter les timeouts
  const blocks = sql.split(/-- ===================/);
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    
    console.log(`📦 Exécution du bloc ${i + 1}/${blocks.length}...`);
    
    try {
      // Utiliser l'API RPC pour exécuter du SQL brut
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: block 
      });
      
      if (error) {
        // Si exec_sql n'existe pas, essayer une approche différente
        if (error.message.includes('function exec_sql')) {
          console.log('⚠️ Fonction exec_sql non disponible, tentative alternative...');
          
          // Essayer d'exécuter directement via des requêtes SQL simples
          const statements = block.split(';').filter(s => s.trim());
          
          for (const statement of statements) {
            const trimmed = statement.trim();
            if (!trimmed) continue;
            
            if (trimmed.toLowerCase().startsWith('create table')) {
              console.log('📝 Création de table...');
            } else if (trimmed.toLowerCase().startsWith('create index')) {
              console.log('📊 Création d\'index...');
            } else if (trimmed.toLowerCase().startsWith('insert into')) {
              console.log('💾 Insertion de données...');
            }
            
            // Pour les statements complexes, on les log mais on continue
            console.log('⏩ Statement:', trimmed.substring(0, 100) + '...');
          }
        } else {
          throw error;
        }
      } else {
        console.log(`✅ Bloc ${i + 1} exécuté avec succès`);
      }
      
    } catch (err) {
      console.error(`❌ Erreur bloc ${i + 1}:`, err.message);
      // Continuer avec les autres blocs
    }
    
    // Petite pause entre les blocs
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Fonction alternative: créer les tables une par une
async function createTablesIndividually() {
  console.log('🔧 Création des tables individuellement...');
  
  const tables = [
    {
      name: 'worker_registry_entries',
      sql: `
        CREATE TABLE IF NOT EXISTS worker_registry_entries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          ast_id UUID NOT NULL,
          tenant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          employee_number TEXT,
          certification TEXT[] DEFAULT '{}',
          signature_base64 TEXT,
          consent_timestamp TIMESTAMPTZ,
          ast_validated BOOLEAN DEFAULT FALSE,
          consent_text TEXT,
          work_start_time TIMESTAMPTZ,
          work_end_time TIMESTAMPTZ,
          total_work_time_ms BIGINT DEFAULT 0,
          is_timer_active BOOLEAN DEFAULT FALSE,
          registered_at TIMESTAMPTZ DEFAULT NOW(),
          last_activity TIMESTAMPTZ DEFAULT NOW(),
          ip_address INET,
          device_info JSONB,
          CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\\+?1?[2-9]\\d{2}[2-9]\\d{2}\\d{4}$'),
          CONSTRAINT valid_work_times CHECK (work_end_time IS NULL OR work_end_time > work_start_time)
        );
      `
    },
    {
      name: 'loto_locks',
      sql: `
        CREATE TABLE IF NOT EXISTS loto_locks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          ast_id UUID NOT NULL,
          tenant_id TEXT NOT NULL,
          lock_number TEXT NOT NULL,
          energy_type TEXT NOT NULL CHECK (energy_type IN ('electrical', 'mechanical', 'hydraulic', 'pneumatic', 'thermal', 'chemical')),
          equipment_name TEXT NOT NULL,
          location_description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'applied', 'verified', 'removed')),
          is_applied BOOLEAN DEFAULT FALSE,
          applied_by_worker_id UUID,
          applied_at TIMESTAMPTZ,
          removed_at TIMESTAMPTZ,
          photos TEXT[] DEFAULT '{}',
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(ast_id, lock_number),
          CONSTRAINT valid_lock_times CHECK (removed_at IS NULL OR removed_at > applied_at)
        );
      `
    },
    {
      name: 'sms_alerts',
      sql: `
        CREATE TABLE IF NOT EXISTS sms_alerts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          ast_id UUID NOT NULL,
          tenant_id TEXT NOT NULL,
          alert_type TEXT NOT NULL CHECK (alert_type IN ('lock_applied', 'lock_removed', 'general_alert', 'emergency', 'work_completion')),
          message TEXT NOT NULL,
          sent_by_user_id UUID,
          sent_by_name TEXT NOT NULL,
          sent_by_phone TEXT,
          recipients TEXT[] NOT NULL,
          recipient_names TEXT[],
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'partial')),
          sent_at TIMESTAMPTZ,
          delivery_status JSONB,
          sms_service_provider TEXT DEFAULT 'twilio',
          cost_cents INTEGER,
          error_message TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`📝 Création de ${table.name}...`);
      
      // Utiliser une requête SQL directe via l'API
      const { error } = await supabase.from('information_schema.tables').select('*').limit(1);
      
      if (!error) {
        console.log(`✅ ${table.name} - Connexion OK, tentative de création manuelle...`);
        // La table sera créée manuellement via l'interface Supabase
      }
      
    } catch (err) {
      console.error(`❌ Erreur ${table.name}:`, err.message);
    }
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🔗 Test de connexion Supabase...');
    
    // Test de connexion simple
    const { data, error } = await supabase.from('confined_space_permits').select('count').limit(1);
    
    if (error && !error.message.includes('relation "confined_space_permits" does not exist')) {
      throw error;
    }
    
    console.log('✅ Connexion Supabase réussie!');
    
    // Méthode 1: Essayer d'exécuter le SQL complet
    console.log('📋 Le fichier SQL a été préparé dans EXECUTE_IN_SUPABASE.sql');
    console.log('');
    console.log('🎯 PROCHAINES ÉTAPES:');
    console.log('1. Va sur https://supabase.com/dashboard');
    console.log('2. Sélectionne ton projet C-Secur360');
    console.log('3. Va dans "SQL Editor"');
    console.log('4. Copie le contenu de EXECUTE_IN_SUPABASE.sql');
    console.log('5. Colle et exécute le SQL');
    console.log('');
    console.log('📱 Une fois fait, le système SMS + LOTO sera opérationnel!');
    
    // Créer un résumé des tables à créer
    console.log('');
    console.log('📊 TABLES À CRÉER:');
    console.log('✓ worker_registry_entries - Registre travailleurs avec signature');
    console.log('✓ worker_breaks - Pauses de travail');
    console.log('✓ loto_locks - Cadenas LOTO avec coche/décoche');
    console.log('✓ sms_alerts - Historique alertes SMS');
    console.log('✓ sms_consent - Consentements SMS');
    console.log('✓ worker_registry_audit - Audit trail');
    console.log('✓ energy_types - Types d\'énergie standards');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('');
    console.log('🔧 SOLUTION ALTERNATIVE:');
    console.log('Exécute manuellement le fichier EXECUTE_IN_SUPABASE.sql dans l\'interface Supabase');
  }
}

// Exécuter le script
main().then(() => {
  console.log('');
  console.log('🎉 Script terminé!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});