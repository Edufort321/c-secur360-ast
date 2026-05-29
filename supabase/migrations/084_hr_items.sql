-- 084: Module RH — communications corpo, documents, hyperliens
-- Exécuter dans le SQL Editor de Supabase Dashboard

CREATE TABLE IF NOT EXISTS hr_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'message'   -- 'message' | 'document' | 'link'
                CHECK (type IN ('message', 'document', 'link')),
  title       TEXT NOT NULL,
  content     TEXT,                              -- corps du message corpo
  url         TEXT,                              -- hyperlien ou document hébergé (storage)
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hr_items_tenant_idx ON hr_items (tenant_id, type, sort_order);
ALTER TABLE hr_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hr_items_access ON hr_items;
CREATE POLICY hr_items_access ON hr_items FOR ALL USING (true) WITH CHECK (true);
