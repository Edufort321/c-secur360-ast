/**
 * Setup Supabase avec fonction exec_sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ampnY2NjeGxxaGJ0cGl0bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4MzU5MywiZXhwIjoyMDY3MTU5NTkzfQ.I3W3ajS-DTVU_EUJRf2PwmZotVBPCY7mLkpBI4BeTDk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 SETUP SUPABASE AVEC EXEC_SQL');
console.log('=' .repeat(50));

async function setupSupabase() {
  try {
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('./scripts/manual-supabase-setup.sql', 'utf8');
    
    // Découper en commandes individuelles
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log('\n📝 Exécution des commandes SQL...');
    console.log(`Nombre de commandes: ${sqlCommands.length}`);
    
    // Essayer d'abord de créer la fonction exec_sql
    console.log('\n🔧 Étape 1: Création fonction exec_sql...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS text
      LANGUAGE plpgsql
      AS $$
      BEGIN
        EXECUTE sql;
        RETURN 'SQL executed successfully';
      END;
      $$;
    `;
    
    try {
      // Essayons avec une requête directe en utilisant l'API REST
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: createFunctionSQL })
      });
      
      if (response.ok) {
        console.log('✅ Fonction exec_sql créée');
      } else {
        const error = await response.text();
        console.log('⚠️ Fonction exec_sql non créée:', error);
      }
    } catch (e) {
      console.log('⚠️ Création fonction échouée:', e.message);
    }
    
    console.log('\n🗑️ Étape 2: Suppression table existante...');
    
    try {
      const { error: dropError } = await supabase.rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS ast_forms CASCADE;' 
      });
      
      if (dropError) {
        console.log('⚠️ Drop via RPC échoué, essayons directement...');
        
        // Essayons de supprimer en utilisant DELETE (ne fonctionne que si la table existe)
        try {
          await supabase.from('ast_forms').delete().neq('id', '');
          console.log('✅ Contenu table vidé');
        } catch (e) {
          console.log('⚠️ Vidage table échoué');
        }
      } else {
        console.log('✅ Table supprimée');
      }
    } catch (e) {
      console.log('⚠️ Suppression échouée:', e.message);
    }
    
    console.log('\n🏗️ Étape 3: Création nouvelle table...');
    
    const createTableSQL = `
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
      )
    `;
    
    try {
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.log('❌ Création table échouée via RPC:', createError.message);
      } else {
        console.log('✅ Table créée via RPC');
      }
    } catch (e) {
      console.log('❌ Création table échouée:', e.message);
    }
    
    console.log('\n🧪 Étape 4: Test final insertion...');
    
    const testData = {
      tenant_id: 'demo',
      user_id: 'system',
      project_number: 'DEMO-2025-001',
      client_name: 'Client Test Final',
      work_location: 'Site de test',
      ast_number: 'AST-2025-001',
      work_description: 'Test final de la configuration',
      status: 'draft'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('ast_forms')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test insertion échoué:', insertError.message);
      console.log('❌ Code:', insertError.code);
      
      if (insertError.code === 'PGRST204') {
        console.log('⚠️ La table n\'a pas la bonne structure');
        console.log('📋 SOLUTION MANUELLE REQUISE:');
        console.log('1. Allez dans Supabase Dashboard');
        console.log('2. Ouvrez SQL Editor');
        console.log('3. Copiez le contenu de scripts/manual-supabase-setup.sql');
        console.log('4. Exécutez le SQL manuellement');
        console.log('5. Relancez ce script pour tester');
      }
    } else {
      console.log('✅ TEST FINAL RÉUSSI !');
      console.log('✅ AST créé:', insertResult.id);
      console.log('✅ Numéro:', insertResult.ast_number);
    }
    
    // Test de lecture pour confirmer
    const { data: readData, error: readError } = await supabase
      .from('ast_forms')
      .select('*')
      .eq('tenant_id', 'demo');
    
    if (readError) {
      console.log('❌ Test lecture échoué:', readError.message);
    } else {
      console.log('✅ Test lecture réussi:', readData.length, 'AST trouvés');
    }
    
  } catch (error) {
    console.error('💥 ERREUR SETUP:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 RÉSUMÉ SETUP:');
  console.log('Si l\'insertion a réussi: ✅ Prêt pour tests');
  console.log('Si l\'insertion a échoué: ❌ Setup manuel requis');
  console.log('Fichier SQL disponible: scripts/manual-supabase-setup.sql');
  console.log('=' .repeat(50));
}

setupSupabase()
  .then(() => {
    console.log('\n🎉 Setup terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur setup:', error);
    process.exit(1);
  });