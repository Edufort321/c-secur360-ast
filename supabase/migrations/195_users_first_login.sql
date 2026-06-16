-- 195 : Colonne users.first_login (1re connexion -> invitation à changer le mot de passe donné par l'admin).
-- Le code dégrade gracieusement si absente, mais on l'ajoute pour fiabiliser l'invitation. Idempotent.
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true;

insert into schema_migrations (version) values ('195') on conflict (version) do nothing;
