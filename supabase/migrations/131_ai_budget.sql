-- 131 — Forfaits / budget IA par tenant. AUTONOME : aucune dependance sur la table `tenants`
-- (qui peut ne pas exister dans ce projet). Tout est dans 2 nouvelles tables.
--
-- Modele (decide avec Eric) : le client achete un FORFAIT en $ (tier_cents : 50000=500$,
-- 100000=1000$, 150000=1500$). Le budget de COUT IA reel autorise = prix x 70% (marge 30%).
-- On suit le cout consomme (used_cents) — UN budget partage par client, conso tracee PAR MODULE.
-- tenant_id = le sous-domaine / 1er segment d'URL (ex. 'cerdia').

CREATE TABLE IF NOT EXISTS ai_budgets (
  tenant_id          TEXT PRIMARY KEY,
  tier_cents         INTEGER NOT NULL DEFAULT 0,   -- prix du forfait paye (0 = aucun = illimite)
  used_cents         INTEGER NOT NULL DEFAULT 0,   -- cout IA consomme sur la periode
  period_start       DATE,
  assistants_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
ALTER TABLE ai_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage   ENABLE ROW LEVEL SECURITY;

-- Definir/renouveler un forfait :
--   INSERT INTO ai_budgets (tenant_id, tier_cents) VALUES ('cerdia', 50000)
--     ON CONFLICT (tenant_id) DO UPDATE SET tier_cents = EXCLUDED.tier_cents;
--   UPDATE ai_budgets SET used_cents = 0, period_start = current_date WHERE tenant_id = 'cerdia';
