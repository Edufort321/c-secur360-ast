-- 130_storage_incident_photos.sql
-- #81 Enquete causale : bucket Storage pour les pieces jointes photos des rapports d'incident.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('incident-photos', 'incident-photos', true, 10485760,
        ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies (defensif ; convention projet : acces permissif sur le bucket)
DO $$ BEGIN
  CREATE POLICY "incident_photos_select" ON storage.objects FOR SELECT USING (bucket_id = 'incident-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "incident_photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "incident_photos_delete" ON storage.objects FOR DELETE USING (bucket_id = 'incident-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
