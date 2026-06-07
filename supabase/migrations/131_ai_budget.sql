-- 131 — Forfaits / budget IA par tenant.
-- Modele : le client achete un FORFAIT en $ (ai_tier_cents : 50000=500$, 100000=1000$, 150000=1500$).
-- Le budget de COUT IA reel autorise = prix forfait x 70% (marge 30%). On suit le cout consomme
-- (ai_used_cents) — UN budget partage par client, conso tracee PAR MODULE dans ai_usage.
-- 0 / NULL = aucun forfait -> l'app ne bloque pas (illimite, retro-compat).
-- NB: noms de tables NON qualifies (comme les migrations 013/014) -> resolus via search_path.

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_tier_cents  INTEGER DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_used_cents  INTEGER DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_period_start DATE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_assistants_enabled BOOLEAN DEFAULT TRUE;

-- Detail de consommation IA par appel (ventilation par module).
CREATE TABLE IF NOT EXISTS ai_usage (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  module      TEXT NOT NULL,            -- 'inventaire' | 'dga' | ...
  cost_cents  INTEGER NOT NULL DEFAULT 0,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_usage_tenant_idx ON ai_usage (tenant_id);
CREATE INDEX IF NOT EXISTS ai_usage_tenant_module_idx ON ai_usage (tenant_id, module);

-- Les routes serveur utilisent la cle service (supabaseAdmin) qui bypass RLS.
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Renouvellement (au paiement / periodiquement) : remettre la conso a 0.
--   UPDATE tenants SET ai_used_cents = 0, ai_period_start = current_date WHERE subdomain = '<tenant>';
