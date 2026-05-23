// Assure un abonnement CERDIA : démarré aujourd'hui, actif/payé, prochaine facturation +1 an.
// Usage : node -r dotenv/config scripts/ensure-cerdia-sub.mjs dotenv_config_path=.env.local
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const today = new Date();
const next = new Date(); next.setFullYear(next.getFullYear() + 1);

const { error } = await supabase.from('tenant_subscriptions').upsert({
  tenant_id: 'cerdia', status: 'active', cycle: 'annual',
  start_date: today.toISOString().slice(0, 10),
  next_billing_date: next.toISOString().slice(0, 10),
  last_payment_at: today.toISOString(),
}, { onConflict: 'tenant_id' });

console.log(error
  ? `❌ ${error.message} (migration 012 exécutée ?)`
  : `✅ Abonnement CERDIA : actif/payé · début ${today.toISOString().slice(0, 10)} · prochaine facturation ${next.toISOString().slice(0, 10)}`);
