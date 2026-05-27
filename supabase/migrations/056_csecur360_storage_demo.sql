-- 056 : bucket stockage csecur360 (slides) + colonnes demo sur users + table demo_signups

-- Storage bucket public pour landing slides et module screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('csecur360', 'csecur360', true, 10485760,
        ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "csecur360_select" ON storage.objects FOR SELECT USING (bucket_id = 'csecur360');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "csecur360_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'csecur360');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "csecur360_delete" ON storage.objects FOR DELETE USING (bucket_id = 'csecur360');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Colonnes demo sur users (expiry pour acces temporaire)
ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Table demo_signups pour suivi des inscrits demo
CREATE TABLE IF NOT EXISTS demo_signups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  tenant_id   text NOT NULL DEFAULT 'demo',
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  converted_at timestamptz DEFAULT NULL
);

ALTER TABLE demo_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_signups_insert_public"
  ON demo_signups FOR INSERT WITH CHECK (true);

CREATE POLICY "demo_signups_select_service"
  ON demo_signups FOR SELECT USING (true);
