-- 211 — PIÈCES JOINTES de PROJET (documents reçus du client : bon de commande, contrat, devis signé,
-- plans, courriels…). Un projet peut porter PLUSIEURS documents. Le bucket Storage 'project-documents'
-- est PUBLIC en lecture (URLs servies dans l'app), écriture permissive (convention projet : tables
-- opérationnelles en RLS permissive, isolation applicative par tenant_id). Idempotent + auto-enregistré.

CREATE TABLE IF NOT EXISTS project_attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       text NOT NULL,
  project_id      uuid NOT NULL,
  file_name       text NOT NULL,
  file_url        text NOT NULL,
  file_type       text,
  file_size       bigint,
  attachment_type text DEFAULT 'document_client', -- 'bon_commande' | 'contrat' | 'devis_signe' | 'document_client' | 'autre'
  uploaded_by     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_attachments_proj_idx   ON project_attachments(project_id);
CREATE INDEX IF NOT EXISTS project_attachments_tenant_idx ON project_attachments(tenant_id);

ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_attachments' AND policyname = 'project_attachments_all') THEN
    CREATE POLICY project_attachments_all ON project_attachments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Bucket Storage des documents de projet (PDF, images, Word). Public en lecture, 25 Mo max.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-documents', 'project-documents', true, 26214400,
        ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif',
              'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "project_documents_select" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "project_documents_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "project_documents_delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

insert into schema_migrations (version) values ('211') on conflict (version) do nothing;
