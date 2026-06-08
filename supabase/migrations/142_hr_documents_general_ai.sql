-- 142 — RH : permettre des documents GÉNÉRAUX (non rattachés à un employé) et un classement fin (IA).
-- personnel_id NULL = document général de l'organisation ; sinon = dossier de l'employé.
ALTER TABLE hr_documents ALTER COLUMN personnel_id DROP NOT NULL;
ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS category text;       -- classement fin (ex. SST, Loi 25, paie, contrat)
ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS classified_by text;  -- 'ia' | 'manuel'
CREATE INDEX IF NOT EXISTS hr_documents_general_idx ON hr_documents (tenant_id) WHERE personnel_id IS NULL;
