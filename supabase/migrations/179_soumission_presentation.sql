-- 179: Soumissions — présentation pro (style DGA). Paramètres tenant (lettre de présentation,
-- conditions & modalités, mode de ventilation par défaut), gabarits de soumission, pièces jointes
-- PDF, et bloc « présentation » par soumission (destinataire/date/objet/dossier éditables, options).
-- RLS permissive + isolation applicative par tenant_id (même convention que migration 090). Idempotent.

-- ── Paramètres tenant (un enregistrement par tenant) ────────────────────────────────
CREATE TABLE IF NOT EXISTS soumission_settings (
  tenant_id              TEXT PRIMARY KEY,
  cover_letter           JSONB DEFAULT '{}'::jsonb,   -- { ville, body (canevas), signataire_nom, signataire_titre, signature_url }
  conditions             JSONB DEFAULT '[]'::jsonb,   -- [{ id, titre, contenu, defaut_coche }]
  default_breakdown_mode TEXT  DEFAULT 'detaille',     -- 'detaille' | 'par_item' | 'global_desc'
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- ── Gabarits de soumission (tâches récurrentes : structure d'items, on n'ajoute que le prix) ──
CREATE TABLE IF NOT EXISTS soumission_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  data        JSONB DEFAULT '{}'::jsonb,   -- { items: [...], breakdown_mode, notes }
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soumission_templates_tenant ON soumission_templates(tenant_id);

-- ── Pièces jointes PDF d'une soumission (importées dans les paramètres ou externes) ──
CREATE TABLE IF NOT EXISTS soumission_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  soumission_id UUID,                 -- null = pièce « bibliothèque » réutilisable (paramètres)
  filename      TEXT,
  file_url      TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soumission_attachments_tenant ON soumission_attachments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_soumission_attachments_soum   ON soumission_attachments(soumission_id);

-- ── Bloc présentation par soumission (destinataire/date/objet/dossier + options d'export) ──
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS presentation JSONB DEFAULT '{}'::jsonb;
-- { include_cover, destinataire_nom, ville, date, objet, votre_client, notre_dossier, body_override,
--   breakdown_mode, include_taux, condition_ids: [], attachment_ids: [] }

-- ── RLS (permissive, isolation applicative par tenant_id — convention migration 090) ──
ALTER TABLE soumission_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE soumission_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE soumission_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS soumission_settings_access    ON soumission_settings;    CREATE POLICY soumission_settings_access    ON soumission_settings    FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS soumission_templates_access   ON soumission_templates;   CREATE POLICY soumission_templates_access   ON soumission_templates   FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS soumission_attachments_access ON soumission_attachments; CREATE POLICY soumission_attachments_access ON soumission_attachments FOR ALL USING (true) WITH CHECK (true);

-- Auto-enregistrement dans le journal des migrations (convention depuis 177).
insert into schema_migrations (version) values ('179') on conflict (version) do nothing;
