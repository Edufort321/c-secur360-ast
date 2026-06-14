// One-off : applique le DML de la migration 171 (catalogue module « marketing ») via le client
// service-role, car aucun projet Supabase n'est lié localement. Idempotent. Lit .env.local.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('URL/clé service manquantes'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

const existing = await db.from('modules').select('key, name_fr, monthly_price, sort_order').eq('key', 'marketing').maybeSingle();
if (existing.error) { console.error('Lecture modules:', existing.error.message); process.exit(1); }

if (!existing.data) {
  const ins = await db.from('modules').insert({ key: 'marketing', name_fr: 'Marketing IA', name_en: 'AI Marketing', monthly_price: 500, sort_order: 110 });
  if (ins.error) { console.error('INSERT modules:', ins.error.message); process.exit(1); }
  console.log('✓ module marketing inséré (500 $/an, sort_order 110)');
} else {
  console.log('• module marketing déjà présent :', existing.data);
}

// Active pour CERDIA (démo tout inclus). Idempotent.
const tm = await db.from('tenant_modules').upsert(
  { tenant_id: 'cerdia', module_key: 'marketing', enabled: true, source: 'manual' },
  { onConflict: 'tenant_id,module_key', ignoreDuplicates: true }
);
if (tm.error) console.warn('tenant_modules cerdia (non bloquant):', tm.error.message);
else console.log('✓ tenant_modules cerdia/marketing activé');

const all = await db.from('modules').select('key, name_fr, monthly_price').order('sort_order');
console.log('\nCatalogue modules :', (all.data || []).map(m => `${m.key}=${m.monthly_price}$`).join(', '));
process.exit(0);
