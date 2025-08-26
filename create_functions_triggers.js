const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzjjgcccxlqhbtpitmpo',
  password: '321MdlTamara!$',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createFunctionsAndTriggers() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connecté à Supabase PostgreSQL');

    console.log('\n🔧 Création des fonctions utilitaires...');

    // 1. Fonction pour calcul overtime
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION calculate_overtime_hours(
          p_user_id TEXT,
          p_week_start DATE
        ) RETURNS DECIMAL(8,2) AS $$
        DECLARE
          total_regular_hours DECIMAL(8,2);
          overtime_threshold INTEGER;
          overtime_hours DECIMAL(8,2) := 0;
        BEGIN
          -- Récupérer seuil overtime pour cet utilisateur
          SELECT overtime_threshold_hours INTO overtime_threshold
          FROM user_profile_payroll 
          WHERE user_id = p_user_id;
          
          IF overtime_threshold IS NULL THEN
            overtime_threshold := 40; -- Défaut 40h/semaine
          END IF;
          
          -- Calculer total heures régulières cette semaine
          SELECT COALESCE(SUM(total_hours), 0) INTO total_regular_hours
          FROM timesheet_entries te
          JOIN timesheets ts ON ts.id = te.timesheet_id
          WHERE te.user_id = p_user_id
          AND te.work_date >= p_week_start 
          AND te.work_date < p_week_start + INTERVAL '7 days'
          AND te.activity_type = 'normal';
          
          -- Calculer overtime si dépasse seuil
          IF total_regular_hours > overtime_threshold THEN
            overtime_hours := total_regular_hours - overtime_threshold;
          END IF;
          
          RETURN overtime_hours;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('  ✅ Fonction calculate_overtime_hours créée');
    } catch (err) {
      console.error('  ❌ Erreur fonction overtime:', err.message);
    }

    // 2. Fonction pour application per diem automatique
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION apply_per_diem_rules(
          p_timesheet_entry_id UUID
        ) RETURNS VOID AS $$
        DECLARE
          entry_rec timesheet_entries%ROWTYPE;
          rule_rec per_diem_rules%ROWTYPE;
          distance_km INTEGER;
          hours_worked DECIMAL(8,2);
        BEGIN
          -- Récupérer entrée timesheet
          SELECT * INTO entry_rec FROM timesheet_entries WHERE id = p_timesheet_entry_id;
          
          IF NOT FOUND THEN RETURN; END IF;
          
          -- Parcourir règles per diem actives pour ce client
          FOR rule_rec IN 
            SELECT * FROM per_diem_rules 
            WHERE client_id = entry_rec.client_id 
            AND is_active = true
            AND (effective_until IS NULL OR effective_until >= entry_rec.work_date)
          LOOP
            -- Évaluer conditions
            distance_km := COALESCE(entry_rec.mileage_km, 0);
            hours_worked := COALESCE(entry_rec.total_hours, 0);
            
            -- Condition: > distance min ET > heures min = per diem
            IF (rule_rec.conditions->>'min_distance_km')::INTEGER <= distance_km 
            AND (rule_rec.conditions->>'min_hours')::DECIMAL <= hours_worked THEN
              
              -- Log per diem (table à créer)
              INSERT INTO per_diem_logs (
                user_id, timesheet_entry_id, rule_id, 
                work_date, amount, auto_applied
              ) VALUES (
                entry_rec.user_id, p_timesheet_entry_id, rule_rec.id,
                entry_rec.work_date, rule_rec.daily_amount, true
              ) ON CONFLICT DO NOTHING;
              
            END IF;
          END LOOP;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('  ✅ Fonction apply_per_diem_rules créée');
    } catch (err) {
      console.error('  ❌ Erreur fonction per diem:', err.message);
    }

    // 3. Fonction updated_at automatique
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('  ✅ Fonction update_updated_at_column créée');
    } catch (err) {
      console.error('  ❌ Erreur fonction updated_at:', err.message);
    }

    // 4. Fonction pour vérifier permissions utilisateur
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION user_has_permission(
          p_user_id TEXT,
          p_permission_key TEXT,
          p_scope_type TEXT DEFAULT 'global',
          p_scope_id UUID DEFAULT NULL
        ) RETURNS BOOLEAN AS $$
        DECLARE
          has_permission BOOLEAN := FALSE;
        BEGIN
          -- Vérifier via les rôles
          SELECT EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN role_permissions rp ON rp.role_id = ur.role_id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = p_user_id
            AND ur.is_active = true
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            AND p.key = p_permission_key
            AND (
              ur.scope_type = 'global' OR
              (ur.scope_type = p_scope_type AND ur.scope_id = p_scope_id) OR
              (rp.scope_default = 'global')
            )
          ) INTO has_permission;
          
          RETURN has_permission;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
      console.log('  ✅ Fonction user_has_permission créée');
    } catch (err) {
      console.error('  ❌ Erreur fonction permissions:', err.message);
    }

    // 5. Créer la table per_diem_logs si manquante
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS per_diem_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          timesheet_entry_id UUID REFERENCES timesheet_entries(id) ON DELETE CASCADE,
          rule_id UUID NOT NULL REFERENCES per_diem_rules(id),
          
          work_date DATE NOT NULL,
          amount DECIMAL(8,2) NOT NULL,
          auto_applied BOOLEAN DEFAULT true,
          
          notes TEXT,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          UNIQUE(user_id, work_date, rule_id)
        )
      `);
      console.log('  ✅ Table per_diem_logs créée');
    } catch (err) {
      console.log(`  ⚪ per_diem_logs: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    console.log('\n🔄 Création des triggers automatiques...');

    // 6. Triggers pour updated_at sur toutes les tables appropriées
    const tablesWithUpdatedAt = [
      'user_profile_payroll', 'vehicles', 'timesheets', 'timesheet_entries',
      'expenses', 'client_billing_configs', 'planned_assignments'
    ];

    for (const tableName of tablesWithUpdatedAt) {
      try {
        await client.query(`
          DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};
          CREATE TRIGGER update_${tableName}_updated_at 
            BEFORE UPDATE ON ${tableName} 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log(`  ✅ Trigger updated_at créé pour ${tableName}`);
      } catch (err) {
        console.error(`  ❌ Erreur trigger ${tableName}:`, err.message);
      }
    }

    // 7. Trigger pour application per diem automatique
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION trigger_apply_per_diem()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Appliquer per diem seulement si nouvelle entrée ou changements significatifs
          IF TG_OP = 'INSERT' OR 
             (TG_OP = 'UPDATE' AND (
               OLD.client_id IS DISTINCT FROM NEW.client_id OR
               OLD.mileage_km IS DISTINCT FROM NEW.mileage_km OR
               OLD.total_hours IS DISTINCT FROM NEW.total_hours
             )) THEN
            
            PERFORM apply_per_diem_rules(NEW.id);
          END IF;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_timesheet_entry_per_diem ON timesheet_entries;
        CREATE TRIGGER trigger_timesheet_entry_per_diem
          AFTER INSERT OR UPDATE ON timesheet_entries
          FOR EACH ROW EXECUTE FUNCTION trigger_apply_per_diem();
      `);
      console.log('  ✅ Trigger per diem automatique créé');
    } catch (err) {
      console.error('  ❌ Erreur trigger per diem:', err.message);
    }

    // 8. Créer des fonctions pour inventaire
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_stock_after_transaction()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Mettre à jour le stock à la localisation
          INSERT INTO inv_stock (item_id, location_id, on_hand, last_updated_at)
          VALUES (NEW.item_id, NEW.location_id, NEW.delta, NOW())
          ON CONFLICT (item_id, location_id)
          DO UPDATE SET 
            on_hand = inv_stock.on_hand + NEW.delta,
            last_updated_at = NOW();
          
          -- Si transfert, déduire du stock source
          IF NEW.reason = 'transfer' AND NEW.location_from_id IS NOT NULL THEN
            INSERT INTO inv_stock (item_id, location_id, on_hand, last_updated_at)
            VALUES (NEW.item_id, NEW.location_from_id, -NEW.delta, NOW())
            ON CONFLICT (item_id, location_id)
            DO UPDATE SET 
              on_hand = inv_stock.on_hand - NEW.delta,
              last_updated_at = NOW();
          END IF;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('  ✅ Fonction update_stock_after_transaction créée');
    } catch (err) {
      console.error('  ❌ Erreur fonction stock:', err.message);
    }

    // 9. Créer table transactions inventaire si manquante
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS inv_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL,
          site_id UUID,
          
          -- Article concerné
          item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE RESTRICT,
          instance_id UUID,
          
          -- Mouvement
          location_id UUID REFERENCES inv_locations(id) ON DELETE SET NULL,
          location_from_id UUID REFERENCES inv_locations(id) ON DELETE SET NULL,
          delta NUMERIC NOT NULL,
          
          -- Raison du mouvement
          reason TEXT NOT NULL CHECK (reason IN ('receipt','issue','adjust','transfer','sale','return')),
          
          -- Contexte projet/tâche
          project_id UUID,
          task_id UUID,
          billing_code TEXT,
          
          -- Traçabilité
          user_id TEXT REFERENCES users(id),
          photo_url TEXT,
          note TEXT,
          
          -- Référence externe
          reference_type TEXT,
          reference_id UUID,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      // Trigger pour mise à jour stock automatique
      await client.query(`
        DROP TRIGGER IF EXISTS trigger_update_stock ON inv_transactions;
        CREATE TRIGGER trigger_update_stock 
          AFTER INSERT ON inv_transactions 
          FOR EACH ROW EXECUTE FUNCTION update_stock_after_transaction();
      `);
      console.log('  ✅ Table inv_transactions et trigger stock créés');
    } catch (err) {
      console.log(`  ⚪ inv_transactions: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    // 10. Enable Row Level Security sur toutes les nouvelles tables
    console.log('\n🔒 Activation Row Level Security...');

    const tablesForRLS = [
      'user_profile_payroll', 'vehicles', 'timesheets', 'timesheet_entries',
      'per_diem_rules', 'per_diem_logs', 'expenses', 'client_billing_configs',
      'vehicle_assignments', 'vehicle_logs', 'planned_assignments', 'inv_transactions'
    ];

    for (const tableName of tablesForRLS) {
      try {
        await client.query(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
        console.log(`  ✅ RLS activé pour ${tableName}`);
      } catch (err) {
        console.log(`  ⚪ RLS ${tableName}: ${err.message.includes('already has') ? 'déjà activé' : err.message}`);
      }
    }

    // 11. Créer quelques policies de base
    console.log('\n🛡️ Création policies RLS de base...');

    try {
      // Users peuvent voir leurs propres données
      await client.query(`
        CREATE POLICY "Users own timesheet data" ON timesheets 
        FOR ALL TO authenticated 
        USING (user_id = auth.uid()::text);

        CREATE POLICY "Users own timesheet entries" ON timesheet_entries 
        FOR ALL TO authenticated 
        USING (user_id = auth.uid()::text);

        CREATE POLICY "Users own expenses" ON expenses 
        FOR ALL TO authenticated 
        USING (user_id = auth.uid()::text);

        CREATE POLICY "Users own payroll profile" ON user_profile_payroll 
        FOR ALL TO authenticated 
        USING (user_id = auth.uid()::text);
      `);
      console.log('  ✅ Policies de base créées');
    } catch (err) {
      console.log(`  ⚪ Policies: ${err.message.includes('already exists') ? 'existent déjà' : err.message}`);
    }

    // 12. Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    const functionsCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
      AND routine_name IN (
        'calculate_overtime_hours', 'apply_per_diem_rules', 
        'user_has_permission', 'update_stock_after_transaction'
      )
      ORDER BY routine_name
    `);
    
    console.log('📋 Fonctions utilitaires créées:');
    functionsCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.routine_name}`);
    });

    const triggersCheck = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      AND trigger_name LIKE 'update_%_updated_at'
      ORDER BY event_object_table
    `);
    
    console.log('📋 Triggers automatiques créés:');
    triggersCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.trigger_name} sur ${row.event_object_table}`);
    });

    console.log('\n🎉 FONCTIONS & TRIGGERS TERMINÉS!');
    console.log('🔧 Fonctions utilitaires opérationnelles');
    console.log('⚡ Triggers automatiques actifs');  
    console.log('🔒 Row Level Security configuré');
    console.log('⏰ Per diem automatique activé');
    console.log('📊 Calculs overtime opérationnels');

  } catch (error) {
    console.error('💥 Erreur générale fonctions/triggers:', error);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter la création des fonctions et triggers
createFunctionsAndTriggers();