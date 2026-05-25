-- 043_storage_equipment_photos.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('equipment-photos', 'equipment-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies (défensif)
DO $$ BEGIN
  CREATE POLICY "equip_photos_select" ON storage.objects FOR SELECT USING (bucket_id = 'equipment-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equip_photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'equipment-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equip_photos_delete" ON storage.objects FOR DELETE USING (bucket_id = 'equipment-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
