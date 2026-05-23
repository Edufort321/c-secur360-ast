// Purge : ne garder que le tenant CERDIA (supprime les tenants de test).
// Usage : node -r dotenv/config scripts/keep-only-cerdia.mjs dotenv_config_path=.env.local
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('❌ URL/clé service_role requises'); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });

// 1) supprimer les entitlements des tenants non-cerdia
await supabase.from('tenant_modules').delete().neq('tenant_id', 'cerdia');

// 2) supprimer les tenants non-cerdia
const { data, error } = await supabase.from('tenants').delete().neq('id', 'cerdia').select('id');
if (error) { console.error('❌', error.message); process.exit(1); }

console.log('✅ Tenants supprimés (non-cerdia):', (data || []).map(t => t.id).join(', ') || '(aucun)');
const { data: rest } = await supabase.from('tenants').select('id');
console.log('   Tenants restants:', (rest || []).map(t => t.id).join(', '));
