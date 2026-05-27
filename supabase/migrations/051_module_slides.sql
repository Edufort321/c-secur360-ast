-- Migration 051 : captures d'ecran par module (affichees au survol sur la page d'accueil)
CREATE TABLE IF NOT EXISTS module_slides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key  text NOT NULL,
  image_url   text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS module_slides_key_idx ON module_slides (module_key);

ALTER TABLE module_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_slides_public_read"
  ON module_slides FOR SELECT USING (true);

CREATE POLICY "module_slides_auth_write"
  ON module_slides FOR ALL USING (auth.role() = 'authenticated');
