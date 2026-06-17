-- 213 — Projet INTERNE/EXTERNE + règle des FRAIS DE SUBSISTANCE.
-- Règle métier (Eric) : un projet INTERNE n'a en général pas de frais de subsistance applicables ;
-- un projet EXTERNE oui. La règle (par défaut selon interne/externe) est configurable par tenant
-- (Admin > Permissions). Chaque projet porte son scope + un flag « subsistance applicable » pré-rempli
-- depuis la règle, mais éditable au cas par cas. Idempotent + auto-enregistré.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_scope          TEXT DEFAULT 'externe';   -- 'interne' | 'externe'
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subsistence_applicable BOOLEAN DEFAULT true;      -- frais de subsistance applicables sur ce projet

-- Règle par tenant (défaut selon scope). Stockée sur company_settings (paramètres tenant existants).
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS subsistence_interne BOOLEAN DEFAULT false; -- interne -> non applicable par défaut
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS subsistence_externe BOOLEAN DEFAULT true;  -- externe -> applicable par défaut

insert into schema_migrations (version) values ('213') on conflict (version) do nothing;
