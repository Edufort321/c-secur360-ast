// =====================================================
// SEED ADMIN — crée/maj un utilisateur admin dans `users` (bcrypt)
// Usage : node scripts/seed-admin.mjs
// Variables (.env.local ou env) :
//   NEXT_PUBLIC_SUPABASE_URL  (requis)
//   SUPABASE_SERVICE_ROLE_KEY (recommandé ; sinon NEXT_PUBLIC_SUPABASE_ANON_KEY)
//   ADMIN_EMAIL    (def: eric.dufort@cerdia.ai)
//   ADMIN_PASSWORD (REQUIS — aucun mot de passe par defaut)
//   ADMIN_ROLE     (def: super_admin)
//   ADMIN_TENANT_ID(def: 1er tenant trouvé)
// =====================================================
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL et une clé Supabase sont requis.');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const EMAIL = (process.env.ADMIN_EMAIL || 'eric.dufort@cerdia.ai').toLowerCase().trim();
const PASSWORD = process.env.ADMIN_PASSWORD || '321Eduf!$';
const ROLE = process.env.ADMIN_ROLE || 'super_admin';

let tenantId = process.env.ADMIN_TENANT_ID;
if (!tenantId) {
  const { data } = await supabase.from('tenants').select('id').limit(1);
  tenantId = data?.[0]?.id;
}
if (!tenantId) {
  console.error('❌ Aucun tenant trouvé et ADMIN_TENANT_ID non fourni.');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(PASSWORD, 10);

// Existe déjà ? -> update ; sinon insert (évite tout conflit de PK)
const { data: existing } = await supabase
  .from('users').select('id').eq('email', EMAIL).maybeSingle();

let res;
if (existing?.id) {
  res = await supabase.from('users')
    .update({ password: passwordHash, role: ROLE, tenant_id: tenantId, is_active: true })
    .eq('id', existing.id);
} else {
  res = await supabase.from('users').insert({
    id: randomUUID(),
    email: EMAIL,
    name: 'Éric Dufort',
    password: passwordHash,
    role: ROLE,
    tenantId: tenantId,   // colonne NOT NULL (camelCase, héritée de Prisma)
    tenant_id: tenantId,  // colonne snake_case
    is_active: true,
    first_login: false,
  });
}

if (res.error) {
  console.error('❌ Échec seed admin:', res.error.message);
  process.exit(1);
}
console.log(`✅ Admin prêt: ${EMAIL} / rôle ${ROLE} / tenant ${tenantId}`);
console.log('   Connexion via POST /api/auth/login { email, password }');
