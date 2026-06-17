-- 212 — Lien PROJET ↔ FACTURE de commerce. Quand on approuve une facture depuis un PROJET (onglet
-- Facture), elle crée/maj une ligne commerce_invoices afin d'apparaître dans la « Facturation » centrale
-- (statut « Traité » à l'émission, « Payée » à l'encaissement). On garde le lien projet pour la traçabilité
-- et éviter les doublons (une facture par projet, mise à jour si ré-approuvée). Idempotent + auto-enregistré.

ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS project_id     uuid;
ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS project_number text;
ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS source         text DEFAULT 'manual'; -- 'manual' | 'project'

CREATE INDEX IF NOT EXISTS commerce_invoices_project_idx ON commerce_invoices(project_id);

insert into schema_migrations (version) values ('212') on conflict (version) do nothing;
