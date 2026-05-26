-- Migration 050 : table landing_slides pour le carrousel page d'accueil
CREATE TABLE IF NOT EXISTS landing_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title_fr text,
  title_en text,
  subtitle_fr text,
  subtitle_en text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE landing_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_slides_public_read"
  ON landing_slides FOR SELECT USING (true);

CREATE POLICY "landing_slides_auth_write"
  ON landing_slides FOR ALL USING (auth.role() = 'authenticated');
