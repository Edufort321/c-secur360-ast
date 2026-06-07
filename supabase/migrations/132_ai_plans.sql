-- 132 — Forfaits PUBLICS d'Assistant IA (jetons). Affichés comme cartes de prix sur la page
-- publique (même format que les modules) et ajustables depuis l'admin (price-management).
-- Le prix payé par le client = price_cents ; le budget de coût IA réel reste price × 70 %
-- (marge 30 %) — calculé côté serveur (voir lib/aiBudget.ts), JAMAIS exposé au client.
--
-- Distinct de `ai_budgets` (131) qui est l'état PAR TENANT. Ici c'est le CATALOGUE d'offres.

CREATE TABLE IF NOT EXISTS ai_plans (
  id           TEXT PRIMARY KEY,                       -- ex. 'ai_500'
  name_fr      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  price_cents  INTEGER NOT NULL DEFAULT 0,             -- prix payé (50000 = 500 $)
  note_fr      TEXT,                                   -- ligne descriptive (ex. « jetons IA inclus »)
  note_en      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lecture PUBLIQUE (page de prix) ; écriture réservée à l'admin via la clé service.
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_plans_public_read ON ai_plans;
CREATE POLICY ai_plans_public_read ON ai_plans FOR SELECT USING (true);

-- 3 forfaits par défaut (cohérents avec le sélecteur super-admin 500/1000/1500).
INSERT INTO ai_plans (id, name_fr, name_en, price_cents, note_fr, note_en, sort_order) VALUES
  ('ai_500',  'Assistant IA — Essentiel', 'AI Assistant — Essential', 50000,  'Assistants IA (inventaire, prix, import) — forfait annuel de jetons.', 'AI assistants (inventory, pricing, import) — annual token plan.', 1),
  ('ai_1000', 'Assistant IA — Avancé',    'AI Assistant — Advanced',  100000, 'Pour un usage IA soutenu sur plusieurs modules.', 'For sustained AI usage across multiple modules.', 2),
  ('ai_1500', 'Assistant IA — Pro',       'AI Assistant — Pro',       150000, 'Usage IA intensif, multi-sites.', 'Intensive AI usage, multi-site.', 3)
ON CONFLICT (id) DO NOTHING;
