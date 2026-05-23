// =====================================================
// SEED TENANT CERDIA — crée le vrai tenant de développement + lie l'admin dessus.
// Usage : node -r dotenv/config scripts/seed-cerdia.mjs dotenv_config_path=.env.local
// =====================================================
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('❌ URL/clé Supabase manquantes'); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });

const TENANT_ID = 'cerdia';
const EMAIL = (process.env.ADMIN_EMAIL || 'eric.dufort@cerdia.ai').toLowerCase();

// 1) Tenant CERDIA
let r = await supabase.from('tenants').upsert(
  { id: TENANT_ID, subdomain: 'cerdia', companyName: 'CERDIA', plan: 'enterprise', isActive: true },
  { onConflict: 'id' }
);
if (r.error) { console.error('❌ tenant:', r.error.message); process.exit(1); }

// 2) Lier l'admin au tenant CERDIA
r = await supabase.from('users')
  .update({ tenant_id: TENANT_ID, tenantId: TENANT_ID, role: 'super_admin' })
  .eq('email', EMAIL);
if (r.error) { console.error('❌ user:', r.error.message); process.exit(1); }

console.log(`✅ Tenant CERDIA prêt (id=${TENANT_ID}) · ${EMAIL} lié comme super_admin`);
console.log('   Portail client : /cerdia/modules  ·  Projets : /cerdia/projects');
