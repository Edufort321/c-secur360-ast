const { Client } = require('pg');

// Configuration de connexion directe à PostgreSQL
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

async function analyzeAndFix() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connecté à Supabase PostgreSQL');

    // 1. Analyser la structure de la table users existante
    console.log('\n📊 Analyse de la table users existante...');
    
    const userTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Structure actuelle de la table users:');
    userTableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // 2. Vérifier le type de l'ID
    const idInfo = userTableInfo.rows.find(row => row.column_name === 'id');
    console.log(`\n🔍 Type de l'ID users: ${idInfo ? idInfo.data_type : 'INTROUVABLE'}`);

    // 3. Ajouter les colonnes manquantes une par une
    const columnsToAdd = [
      { name: 'tenant_id', type: 'VARCHAR(100)', nullable: true },
      { name: 'totp_secret', type: 'TEXT', nullable: true },
      { name: 'totp_enabled', type: 'BOOLEAN', nullable: false, default: 'false' },
      { name: 'totp_backup_codes', type: 'TEXT[]', nullable: true },
      { name: 'first_login', type: 'BOOLEAN', nullable: false, default: 'true' },
      { name: 'last_login_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'failed_attempts', type: 'INTEGER', nullable: false, default: '0' },
      { name: 'locked_until', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'profile', type: 'JSONB', nullable: true },
      { name: 'mfa_required', type: 'BOOLEAN', nullable: true, default: 'true' },
      { name: 'qr_enrolled', type: 'BOOLEAN', nullable: true, default: 'false' },
      { name: 'last_mfa_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'mobile_only', type: 'BOOLEAN', nullable: true, default: 'false' },
      { name: 'can_export', type: 'BOOLEAN', nullable: true, default: 'true' },
      { name: 'invitation_sent_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'invitation_token', type: 'VARCHAR(100)', nullable: true },
      { name: 'activated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
      { name: 'is_active', type: 'BOOLEAN', nullable: true, default: 'true' }
    ];

    console.log('\n🔧 Ajout des colonnes manquantes à la table users...');
    
    for (const column of columnsToAdd) {
      try {
        // Vérifier si la colonne existe déjà
        const existsCheck = await client.query(`
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = $1
        `, [column.name]);
        
        if (existsCheck.rows.length === 0) {
          let alterQuery = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`;
          
          if (!column.nullable) {
            alterQuery += ` NOT NULL`;
          }
          
          if (column.default) {
            alterQuery += ` DEFAULT ${column.default}`;
          }
          
          await client.query(alterQuery);
          console.log(`  ✅ Colonne '${column.name}' ajoutée`);
        } else {
          console.log(`  ⚪ Colonne '${column.name}' existe déjà`);
        }
      } catch (err) {
        console.error(`  ❌ Erreur pour colonne '${column.name}':`, err.message);
      }
    }

    // 4. Créer les tables RBAC avec les bons types
    console.log('\n🏗️ Création des tables RBAC...');
    
    const userIdType = idInfo ? idInfo.data_type : 'uuid';
    console.log(`📝 Utilisation du type ${userIdType} pour les clés étrangères`);

    // Table roles
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          is_system BOOLEAN DEFAULT false,
          color VARCHAR(7) DEFAULT '#3b82f6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      console.log('  ✅ Table roles créée');
    } catch (err) {
      console.log(`  ⚪ Table roles: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    // Table permissions
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(100) UNIQUE NOT NULL,
          module VARCHAR(50) NOT NULL,
          action VARCHAR(50) NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          is_dangerous BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      console.log('  ✅ Table permissions créée');
    } catch (err) {
      console.log(`  ⚪ Table permissions: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    // Table role_permissions
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          scope_default VARCHAR(20) DEFAULT 'own',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(role_id, permission_id)
        )
      `);
      console.log('  ✅ Table role_permissions créée');
    } catch (err) {
      console.log(`  ⚪ Table role_permissions: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    // Table user_roles avec le bon type pour user_id
    try {
      const userIdColumnType = userIdType === 'uuid' ? 'UUID' : 'TEXT';
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id ${userIdColumnType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          scope_type VARCHAR(20) CHECK (scope_type IN ('global', 'client', 'site', 'project')),
          scope_id UUID,
          scope_name VARCHAR(200),
          assigned_by ${userIdColumnType} REFERENCES users(id),
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, role_id, scope_type, scope_id)
        )
      `);
      console.log('  ✅ Table user_roles créée');
    } catch (err) {
      console.log(`  ⚪ Table user_roles: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    // 5. Créer les tables inventaire
    console.log('\n📦 Création des tables inventaire...');

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS inv_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL,
          name TEXT NOT NULL,
          sku TEXT,
          uom TEXT DEFAULT 'UN',
          min_qty NUMERIC DEFAULT 0,
          max_qty NUMERIC,
          reorder_point NUMERIC,
          safety_stock NUMERIC DEFAULT 0,
          default_location_id UUID,
          dimensions JSONB,
          images JSONB DEFAULT '[]'::jsonb,
          serializable BOOLEAN DEFAULT false,
          sellable BOOLEAN DEFAULT false,
          active BOOLEAN DEFAULT true,
          description TEXT,
          category TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      console.log('  ✅ Table inv_items créée');
    } catch (err) {
      console.log(`  ⚪ Table inv_items: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS inv_locations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL,
          site_id UUID NOT NULL,
          name TEXT NOT NULL,
          code TEXT,
          parent_location_id UUID REFERENCES inv_locations(id),
          location_type TEXT DEFAULT 'storage',
          capacity NUMERIC,
          temperature_controlled BOOLEAN DEFAULT false,
          outdoor BOOLEAN DEFAULT false,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      console.log('  ✅ Table inv_locations créée');
    } catch (err) {
      console.log(`  ⚪ Table inv_locations: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS inv_stock (
          item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE CASCADE,
          location_id UUID NOT NULL REFERENCES inv_locations(id) ON DELETE CASCADE,
          on_hand NUMERIC DEFAULT 0,
          reserved NUMERIC DEFAULT 0,
          available NUMERIC GENERATED ALWAYS AS (on_hand - reserved) STORED,
          last_counted_at TIMESTAMP WITH TIME ZONE,
          last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (item_id, location_id)
        )
      `);
      console.log('  ✅ Table inv_stock créée');
    } catch (err) {
      console.log(`  ⚪ Table inv_stock: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
    }

    // 6. Insérer les données de base
    console.log('\n📋 Insertion des données initiales...');

    try {
      await client.query(`
        INSERT INTO roles (key, name, description, is_system, color) VALUES
          ('owner', 'Owner / Org Admin', 'Accès complet à la plateforme', true, '#dc2626'),
          ('client_admin', 'Client Admin', 'Administration complète du client', true, '#ea580c'),
          ('site_manager', 'Gestionnaire de site', 'Gestion des sites assignés', true, '#d97706'),
          ('worker', 'Travailleur / Technicien', 'Accès mobile de base', true, '#059669'),
          ('guest', 'Invité / Externe', 'Accès lecture limitée', true, '#6b7280')
        ON CONFLICT (key) DO NOTHING
      `);
      console.log('  ✅ 5 rôles de base insérés');
    } catch (err) {
      console.error('  ❌ Erreur insertion rôles:', err.message);
    }

    try {
      await client.query(`
        INSERT INTO permissions (key, module, action, name, description, is_dangerous) VALUES
          ('planning.view', 'planning', 'view', 'Voir la planification', 'Consulter les plannings', false),
          ('timesheets.view_own', 'timesheets', 'view', 'Voir ses propres feuilles', 'Consulter ses heures', false),
          ('timesheets.create', 'timesheets', 'create', 'Saisir les heures', 'Créer des entrées de temps', false),
          ('inventory.view', 'inventory', 'view', 'Voir inventaire', 'Consulter articles et stocks', false),
          ('inventory.scan', 'inventory', 'scan', 'Scanner QR codes', 'Utiliser scanner mobile', false),
          ('users.view', 'users', 'view', 'Voir utilisateurs', 'Consulter liste utilisateurs', false)
        ON CONFLICT (key) DO NOTHING
      `);
      console.log('  ✅ 6 permissions de base insérées');
    } catch (err) {
      console.error('  ❌ Erreur insertion permissions:', err.message);
    }

    // 7. Créer les indexes
    console.log('\n📊 Création des indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_roles_key ON roles(key)',
      'CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(key)',
      'CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_inv_items_client_id ON inv_items(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_inv_items_active ON inv_items(active) WHERE active = true'
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
        console.log(`  ✅ Index créé: ${indexQuery.match(/idx_\w+/)[0]}`);
      } catch (err) {
        console.log(`  ⚪ Index: ${err.message.includes('already exists') ? 'existe déjà' : err.message}`);
      }
    }

    // 8. Vérifier les résultats
    console.log('\n🔍 Vérification finale...');
    
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('roles', 'permissions', 'user_roles', 'inv_items', 'inv_locations', 'inv_stock')
      ORDER BY table_name
    `);
    
    console.log('📋 Tables créées avec succès:');
    tableCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    const rolesCount = await client.query('SELECT COUNT(*) FROM roles');
    const permissionsCount = await client.query('SELECT COUNT(*) FROM permissions');
    
    console.log(`\n📊 Données insérées:`);
    console.log(`  - ${rolesCount.rows[0].count} rôles`);
    console.log(`  - ${permissionsCount.rows[0].count} permissions`);

    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!');
    console.log('🔐 Système RBAC opérationnel');
    console.log('📦 Base inventaire QR-First prête'); 
    console.log('⏰ Foundation ERP établie');

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter la migration
analyzeAndFix();