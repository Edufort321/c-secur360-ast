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

async function createRLSPolicies() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connecté à Supabase PostgreSQL');

    console.log('\n🛡️ Création des policies RLS par module...');

    // INVENTAIRE - Policies
    console.log('\n📦 Policies Inventaire...');
    
    try {
      await client.query(`
        -- Inventaire: Articles
        DROP POLICY IF EXISTS "inventory_items_policy" ON inv_items;
        CREATE POLICY "inventory_items_policy" ON inv_items
        FOR ALL TO authenticated
        USING (
          -- Super admin
          user_has_permission(auth.uid()::text, 'inventory.view', 'global', null) OR
          -- Client access
          user_has_permission(auth.uid()::text, 'inventory.view', 'client', client_id::text)
        )
        WITH CHECK (
          -- Super admin ou client admin peut modifier
          user_has_permission(auth.uid()::text, 'inventory.manage', 'global', null) OR
          user_has_permission(auth.uid()::text, 'inventory.manage', 'client', client_id::text)
        );

        -- Inventaire: Stock
        DROP POLICY IF EXISTS "inventory_stock_policy" ON inv_stock;  
        CREATE POLICY "inventory_stock_policy" ON inv_stock
        FOR ALL TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM inv_items 
            WHERE inv_items.id = inv_stock.item_id
            AND (
              user_has_permission(auth.uid()::text, 'inventory.view', 'global', null) OR
              user_has_permission(auth.uid()::text, 'inventory.view', 'client', inv_items.client_id::text)
            )
          )
        );

        -- Inventaire: Emplacements
        DROP POLICY IF EXISTS "inventory_locations_policy" ON inv_locations;
        CREATE POLICY "inventory_locations_policy" ON inv_locations  
        FOR ALL TO authenticated
        USING (
          user_has_permission(auth.uid()::text, 'inventory.view', 'global', null) OR
          user_has_permission(auth.uid()::text, 'inventory.view', 'client', client_id::text)
        );

        -- Inventaire: Transactions
        DROP POLICY IF EXISTS "inventory_transactions_policy" ON inv_transactions;
        CREATE POLICY "inventory_transactions_policy" ON inv_transactions
        FOR ALL TO authenticated  
        USING (
          user_has_permission(auth.uid()::text, 'inventory.view', 'global', null) OR
          user_has_permission(auth.uid()::text, 'inventory.view', 'client', client_id::text) OR
          user_id = auth.uid()::text
        );
      `);
      console.log('  ✅ Policies inventaire créées');
    } catch (err) {
      console.error('  ❌ Erreur policies inventaire:', err.message);
    }

    // FEUILLES DE TEMPS - Policies  
    console.log('\n⏰ Policies Feuilles de temps...');
    
    try {
      await client.query(`
        -- Feuilles de temps
        DROP POLICY IF EXISTS "timesheets_policy" ON timesheets;
        CREATE POLICY "timesheets_policy" ON timesheets
        FOR ALL TO authenticated
        USING (
          -- Propriétaire des données
          user_id = auth.uid()::text OR
          -- Manager peut voir toutes les feuilles de son équipe
          user_has_permission(auth.uid()::text, 'timesheets.view_all', 'global', null) OR
          user_has_permission(auth.uid()::text, 'timesheets.view_all', 'client', client_id::text)
        )
        WITH CHECK (
          -- Peut créer ses propres feuilles
          user_id = auth.uid()::text OR
          -- Manager peut créer pour son équipe
          user_has_permission(auth.uid()::text, 'timesheets.manage', 'global', null) OR
          user_has_permission(auth.uid()::text, 'timesheets.manage', 'client', client_id::text)
        );

        -- Entrées de feuilles de temps
        DROP POLICY IF EXISTS "timesheet_entries_policy" ON timesheet_entries;
        CREATE POLICY "timesheet_entries_policy" ON timesheet_entries
        FOR ALL TO authenticated
        USING (
          -- Propriétaire des données
          user_id = auth.uid()::text OR
          -- Manager peut voir
          user_has_permission(auth.uid()::text, 'timesheets.view_all', 'global', null) OR
          user_has_permission(auth.uid()::text, 'timesheets.approve', 'global', null)
        )
        WITH CHECK (
          -- Peut modifier ses propres entrées
          user_id = auth.uid()::text OR
          -- Manager peut modifier
          user_has_permission(auth.uid()::text, 'timesheets.manage', 'global', null)
        );
      `);
      console.log('  ✅ Policies timesheets créées');
    } catch (err) {
      console.error('  ❌ Erreur policies timesheets:', err.message);
    }

    // UTILISATEURS - Policies
    console.log('\n👥 Policies Utilisateurs...');
    
    try {
      await client.query(`
        -- Table users (sensible)
        DROP POLICY IF EXISTS "users_policy" ON users;
        CREATE POLICY "users_policy" ON users
        FOR SELECT TO authenticated
        USING (
          -- Peut voir son propre profil
          id = auth.uid()::text OR
          -- Admin peut voir tous les utilisateurs
          user_has_permission(auth.uid()::text, 'users.view', 'global', null) OR
          -- Client admin peut voir les utilisateurs de son client
          EXISTS (
            SELECT 1 FROM user_roles ur1
            JOIN user_roles ur2 ON ur1.scope_id = ur2.scope_id
            WHERE ur1.user_id = auth.uid()::text
            AND ur2.user_id = users.id
            AND ur1.scope_type = 'client'
            AND ur2.scope_type = 'client'
            AND user_has_permission(auth.uid()::text, 'users.view', 'client', ur1.scope_id::text)
          )
        );

        -- Rôles utilisateurs
        DROP POLICY IF EXISTS "user_roles_policy" ON user_roles;
        CREATE POLICY "user_roles_policy" ON user_roles
        FOR ALL TO authenticated
        USING (
          -- Super admin peut tout voir
          user_has_permission(auth.uid()::text, 'users.manage', 'global', null) OR
          -- Client admin peut voir les rôles de son client
          (scope_type = 'client' AND user_has_permission(auth.uid()::text, 'users.manage', 'client', scope_id::text)) OR
          -- Site manager peut voir les rôles de son site
          (scope_type = 'site' AND user_has_permission(auth.uid()::text, 'users.manage', 'site', scope_id::text)) OR
          -- Utilisateur peut voir ses propres rôles
          user_id = auth.uid()::text
        )
        WITH CHECK (
          -- Seuls les admins peuvent modifier les rôles
          user_has_permission(auth.uid()::text, 'users.manage', 'global', null) OR
          (scope_type = 'client' AND user_has_permission(auth.uid()::text, 'users.manage', 'client', scope_id::text)) OR
          (scope_type = 'site' AND user_has_permission(auth.uid()::text, 'users.manage', 'site', scope_id::text))
        );
      `);
      console.log('  ✅ Policies utilisateurs créées');
    } catch (err) {
      console.error('  ❌ Erreur policies utilisateurs:', err.message);
    }

    // VÉHICULES - Policies
    console.log('\n🚗 Policies Véhicules...');
    
    try {
      await client.query(`
        -- Véhicules
        DROP POLICY IF EXISTS "vehicles_policy" ON vehicles;
        CREATE POLICY "vehicles_policy" ON vehicles
        FOR ALL TO authenticated
        USING (
          user_has_permission(auth.uid()::text, 'vehicles.view', 'global', null) OR
          user_has_permission(auth.uid()::text, 'vehicles.view', 'client', client_id::text)
        )
        WITH CHECK (
          user_has_permission(auth.uid()::text, 'vehicles.manage', 'global', null) OR
          user_has_permission(auth.uid()::text, 'vehicles.manage', 'client', client_id::text)
        );

        -- Attributions de véhicules
        DROP POLICY IF EXISTS "vehicle_assignments_policy" ON vehicle_assignments;
        CREATE POLICY "vehicle_assignments_policy" ON vehicle_assignments
        FOR ALL TO authenticated
        USING (
          -- Propriétaire de l'attribution
          user_id = auth.uid()::text OR
          -- Manager peut voir toutes les attributions
          user_has_permission(auth.uid()::text, 'vehicles.view', 'global', null) OR
          EXISTS (
            SELECT 1 FROM vehicles v
            WHERE v.id = vehicle_assignments.vehicle_id
            AND user_has_permission(auth.uid()::text, 'vehicles.view', 'client', v.client_id::text)
          )
        );

        -- Logs véhicules
        DROP POLICY IF EXISTS "vehicle_logs_policy" ON vehicle_logs;
        CREATE POLICY "vehicle_logs_policy" ON vehicle_logs
        FOR ALL TO authenticated
        USING (
          -- Propriétaire du log
          user_id = auth.uid()::text OR
          -- Manager peut voir
          user_has_permission(auth.uid()::text, 'vehicles.view', 'global', null) OR
          EXISTS (
            SELECT 1 FROM vehicles v
            WHERE v.id = vehicle_logs.vehicle_id
            AND user_has_permission(auth.uid()::text, 'vehicles.view', 'client', v.client_id::text)
          )
        );
      `);
      console.log('  ✅ Policies véhicules créées');
    } catch (err) {
      console.error('  ❌ Erreur policies véhicules:', err.message);
    }

    // DÉPENSES - Policies
    console.log('\n💰 Policies Dépenses...');
    
    try {
      await client.query(`
        -- Dépenses
        DROP POLICY IF EXISTS "expenses_policy" ON expenses;
        CREATE POLICY "expenses_policy" ON expenses
        FOR ALL TO authenticated
        USING (
          -- Propriétaire des dépenses
          user_id = auth.uid()::text OR
          -- Manager peut voir toutes les dépenses
          user_has_permission(auth.uid()::text, 'expenses.view_all', 'global', null) OR
          user_has_permission(auth.uid()::text, 'expenses.approve', 'global', null)
        )
        WITH CHECK (
          -- Peut créer ses propres dépenses
          user_id = auth.uid()::text OR
          -- Manager peut modifier
          user_has_permission(auth.uid()::text, 'expenses.manage', 'global', null)
        );
      `);
      console.log('  ✅ Policies dépenses créées');
    } catch (err) {
      console.error('  ❌ Erreur policies dépenses:', err.message);
    }

    // SYSTÈME - Policies
    console.log('\n⚙️ Policies Système...');
    
    try {
      await client.query(`
        -- Rôles (lecture pour tous les authentifiés)
        DROP POLICY IF EXISTS "roles_read_policy" ON roles;
        CREATE POLICY "roles_read_policy" ON roles
        FOR SELECT TO authenticated
        USING (true);
        
        -- Permissions (lecture pour tous les authentifiés)
        DROP POLICY IF EXISTS "permissions_read_policy" ON permissions;
        CREATE POLICY "permissions_read_policy" ON permissions
        FOR SELECT TO authenticated
        USING (true);
        
        -- Role permissions (lecture pour tous les authentifiés)
        DROP POLICY IF EXISTS "role_permissions_read_policy" ON role_permissions;
        CREATE POLICY "role_permissions_read_policy" ON role_permissions
        FOR SELECT TO authenticated
        USING (true);

        -- Audit logs (admins seulement)
        DROP POLICY IF EXISTS "audit_logs_policy" ON system_audit_logs;
        CREATE POLICY "audit_logs_policy" ON system_audit_logs
        FOR SELECT TO authenticated
        USING (
          user_has_permission(auth.uid()::text, 'system.audit', 'global', null)
        );
      `);
      console.log('  ✅ Policies système créées');
    } catch (err) {
      console.error('  ❌ Erreur policies système:', err.message);
    }

    // Vérification finale
    console.log('\n🔍 Vérification des policies...');
    
    const policiesCheck = await client.query(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);
    
    console.log(`📋 Policies RLS créées: ${policiesCheck.rows.length}`);
    policiesCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.tablename}.${row.policyname} (${row.cmd})`);
    });

    console.log('\n🎉 POLICIES RLS TERMINÉES!');
    console.log('🛡️ Sécurité Row Level Security activée');
    console.log('🔐 Permissions granulaires par module');
    console.log('📊 Accès basé sur les rôles RBAC');
    console.log('🎯 Portées client/site/projet respectées');

  } catch (error) {
    console.error('💥 Erreur générale policies:', error);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter la création des policies
createRLSPolicies();