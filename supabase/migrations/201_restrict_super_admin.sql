-- 201 — ACCÈS RESTREINT par tenant : un tenant peut exiger qu'un super-admin PLATEFORME n'accède
-- à ses données QUE sur invitation (présence d'une fiche personnel avec niveau d'accès dans CE tenant).
-- Le(s) propriétaire(s) plateforme (env PLATFORM_OWNER_EMAILS) gardent TOUJOURS accès (anti-verrouillage).
-- Défaut false = comportement actuel inchangé. Idempotent.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS restrict_super_admin BOOLEAN DEFAULT false;

insert into schema_migrations (version) values ('201') on conflict (version) do nothing;
