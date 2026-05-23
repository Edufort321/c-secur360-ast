// Fixe les prix des modules : To-Do gratuit, Administration gratuite (core), tous les autres = 500 $/an.
// Usage : node -r dotenv/config scripts/set-prices.mjs dotenv_config_path=.env.local
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const FREE = ['todo', 'admin'];
const { data: mods, error } = await supabase.from('modules').select('key');
if (error) { console.error('❌', error.message); process.exit(1); }

for (const m of (mods || [])) {
  const price = FREE.includes(m.key) ? 0 : 500;
  await supabase.from('modules').update({ monthly_price: price }).eq('key', m.key);
}
const { data: after } = await supabase.from('modules').select('key, monthly_price').order('sort_order');
console.log('✅ Prix mis à jour ($/an) :');
(after || []).forEach(m => console.log(`   ${m.key.padEnd(14)} ${m.monthly_price} $`));
