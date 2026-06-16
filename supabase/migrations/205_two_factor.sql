-- 205 — 2FA (TOTP) par utilisateur. Secret + activation + codes de secours (hachés). La table users
-- est déjà fermée à l'anon (REVOKE) ; tout passe par les routes serveur. Opt-in. Idempotent.
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret       TEXT;          -- base32 (présent dès l'enrôlement, actif quand totp_enabled)
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT[] NOT NULL DEFAULT '{}'::text[]; -- hachés (sha256), usage unique

insert into schema_migrations (version) values ('205') on conflict (version) do nothing;
