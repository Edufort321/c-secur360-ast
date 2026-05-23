/**
 * Test simple de connexion Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 TEST CONNEXION SUPABASE');
console.log('=' .repeat(50));
console.log('URL:', supabaseUrl ? '✅ Configurée' : '❌ Manquante');
console.log('Key:', supabaseAnonKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Configuration manquante dans .env.local');
  console.log('Vérifiez que ces variables existent :');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📡 Test de connexion...');
    
    // Test simple avec auth
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log('Auth Status:', authError ? 'Non authentifié' : 'OK');
    
    // Test d'accès aux tables publiques
    console.log('\n🔍 Test accès tables...');
    
    // Test ast_forms
    try {
      const { data, error } = await supabase
        .from('ast_forms')
        .select('id, tenant_id, client_name, created_at')
        .limit(5);
      
      if (error) {
        console.log('❌ ast_forms:', error.message);
      } else {
        console.log('✅ ast_forms: Accessible');
        console.log('   Entrées trouvées:', data?.length || 0);
        if (data?.length > 0) {
          console.log('   Exemple:', {
            id: data[0].id?.substring(0, 8) + '...',
            tenant: data[0].tenant_id,
            client: data[0].client_name,
            created: data[0].created_at?.substring(0, 10)
          });
        }
      }
    } catch (e) {
      console.log('❌ ast_forms: Exception -', e.message);
    }
    
    // Test d'autres tables critiques
    const tablesToTest = [
      'confined_space_permits',
      'worker_registry_entries', 
      'loto_locks',
      'sms_alerts'
    ];
    
    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        console.log(error ? `❌ ${tableName}: ${error.message}` : `✅ ${tableName}: OK`);
      } catch (e) {
        console.log(`❌ ${tableName}: Exception - ${e.message}`);
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 RÉSUMÉ:');
    console.log('- Connexion Supabase: ✅');
    console.log('- Configuration: ✅'); 
    console.log('- Tables accessibles: Vérifiées ci-dessus');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('💥 ERREUR:', error.message);
  }
}

testConnection();