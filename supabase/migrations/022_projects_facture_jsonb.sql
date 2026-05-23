-- Adds facture JSONB column to projects table.
-- Stores invoice state: mode, extras, taxes, approval status, invoice number.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS facture JSONB;
