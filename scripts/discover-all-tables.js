/**
 * Découvrir TOUTES les tables dans Supabase (pas seulement celles attendues)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzjjgcccxlqhbtpitmpo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 DÉCOUVERTE COMPLÈTE - TOUTES LES TABLES SUPABASE');
console.log('=' .repeat(70));

async function discoverAllTables() {
  try {
    console.log('\n📋 MÉTHODE 1: Via information_schema...');
    
    // Tentative directe avec information_schema
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT table_name, table_type, table_schema
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
          `
        });
      
      if (schemaData && !schemaError) {
        console.log('✅ Via RPC information_schema:');
        schemaData.forEach((table, index) => {
          console.log(`  ${index + 1}. ${table.table_name} (${table.table_type})`);
        });
      } else {
        console.log('❌ RPC information_schema échoué:', schemaError?.message);
      }
    } catch (e) {
      console.log('❌ Exception information_schema:', e.message);
    }
    
    console.log('\n📋 MÉTHODE 2: Brute force discovery...');
    
    // Liste étendue de toutes les tables possibles d'après tous les fichiers
    const possibleTables = [
      // Tables de base
      'ast_forms', 'users', 'profiles', 'tenants', 'customers',
      
      // Tables système
      'audit_logs', 'system_logs', 'notifications',
      
      // Tables worker registry et LOTO
      'worker_registry_entries', 'worker_breaks', 'loto_locks', 'sms_alerts',
      
      // Tables RH
      'employees', 'employee_safety_records', 'employee_certifications',
      'client_billing_profiles', 'tenant_settings',
      
      // Tables facturation avancée
      'project_billing_overrides', 'wip_calculations', 'wip_calculation_logs',
      'billing_rates', 'billing_history', 'invoices',
      
      // Tables sécurité/incidents
      'near_miss_events', 'incident_reports', 'safety_inspections',
      'hazard_reports', 'confined_space_permits',
      
      // Tables projets et équipements
      'projects', 'project_sites', 'equipment', 'equipment_inspections',
      'maintenance_logs',
      
      // Tables certifications et formations
      'certifications', 'certification_requirements', 'training_records',
      'skill_assessments',
      
      // Tables analytiques
      'performance_metrics', 'safety_statistics', 'compliance_reports',
      
      // Tables admin
      'admin_users', 'admin_sessions', 'admin_audit_logs',
      'system_settings', 'feature_flags',
      
      // Tables intégrations
      'stripe_webhooks', 'twilio_logs', 'email_logs',
      'integration_logs', 'api_keys',
      
      // Tables workflow
      'workflow_states', 'approval_workflows', 'document_templates',
      'form_templates',
      
      // Tables gantt/projets
      'gantt_projects', 'gantt_tasks', 'gantt_dependencies',
      'project_timelines', 'resource_allocations',
      
      // Tables timesheet/temps
      'timesheets', 'time_entries', 'time_approvals',
      'work_schedules', 'shift_patterns',
      
      // Tables prix et entitlements
      'price_config', 'price_adjustments', 'entitlements',
      'subscription_features', 'usage_metrics',
      
      // Tables auth avancées
      'auth_sessions', 'auth_tokens', 'password_resets',
      'mfa_settings', 'login_attempts',
      
      // Tables fichiers et médias
      'file_uploads', 'document_storage', 'image_gallery',
      'attachment_links',
      
      // Tables communications
      'messages', 'announcements', 'chat_rooms',
      'notification_preferences',
      
      // Tables rapports
      'report_templates', 'saved_reports', 'report_schedules',
      'dashboard_widgets'
    ];
    
    console.log(`🎯 Test de ${possibleTables.length} tables potentielles...`);
    
    const foundTables = [];
    const tableDetails = {};
    
    // Test en parallèle avec limitation
    const chunkSize = 5;
    for (let i = 0; i < possibleTables.length; i += chunkSize) {
      const chunk = possibleTables.slice(i, i + chunkSize);
      
      const promises = chunk.map(async (tableName) => {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(1);
          
          if (!error) {
            console.log(`  ✅ ${tableName}: ${count || 0} entrées`);
            foundTables.push(tableName);
            
            if (data && data.length > 0) {
              tableDetails[tableName] = {
                count: count || 0,
                columns: Object.keys(data[0]),
                hasData: true
              };
            } else {
              tableDetails[tableName] = {
                count: count || 0,
                columns: [],
                hasData: false
              };
            }
            return tableName;
          }
          return null;
        } catch (e) {
          return null;
        }
      });
      
      await Promise.all(promises);
      
      // Petit délai pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('🎯 DÉCOUVERTE COMPLÈTE TERMINÉE');
    console.log('=' .repeat(70));
    
    console.log(`\n✅ TABLES TROUVÉES (${foundTables.length}):`);
    foundTables.sort();
    foundTables.forEach((table, index) => {
      const details = tableDetails[table];
      const dataStatus = details.hasData ? `📊 ${details.count} entrées` : '📝 vide';
      const colCount = details.columns.length;
      console.log(`  ${String(index + 1).padStart(2)}. ${table.padEnd(30)} - ${dataStatus}, ${colCount} colonnes`);
    });
    
    console.log('\n📊 TABLES AVEC DONNÉES:');
    const tablesWithData = Object.entries(tableDetails)
      .filter(([, details]) => details.hasData)
      .sort(([, a], [, b]) => b.count - a.count);
    
    tablesWithData.forEach(([tableName, details], index) => {
      console.log(`  ${index + 1}. ${tableName}: ${details.count} entrées`);
      console.log(`     Colonnes: ${details.columns.join(', ')}`);
    });
    
    // Sauvegarder la découverte complète
    const fullProtocol = {
      timestamp: new Date().toISOString(),
      supabase_url: supabaseUrl,
      discovery_method: 'brute_force_comprehensive',
      total_tables_found: foundTables.length,
      tables_found: foundTables,
      tables_with_data: tablesWithData.map(([name]) => name),
      table_details: tableDetails,
      notes: 'Découverte exhaustive de toutes les tables accessibles'
    };
    
    const fs = require('fs');
    fs.writeFileSync('./complete-supabase-discovery.json', JSON.stringify(fullProtocol, null, 2));
    
    console.log(`\n📁 Découverte complète sauvegardée: complete-supabase-discovery.json`);
    console.log(`🎯 TOTAL: ${foundTables.length} tables découvertes`);
    
    return { foundTables, tableDetails };
    
  } catch (error) {
    console.error('💥 ERREUR DÉCOUVERTE:', error.message);
    throw error;
  }
}

discoverAllTables()
  .then((result) => {
    console.log(`\n🎉 DÉCOUVERTE TERMINÉE - ${result.foundTables.length} tables trouvées !`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec découverte:', error);
    process.exit(1);
  });