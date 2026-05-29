-- 079: Mot de passe d'accès conservé pour la gestion admin
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- Permet à l'admin de revoir/communiquer le mot de passe d'accès d'un employé
-- (affiché à côté du nom, masqué par défaut). Le mot de passe reste régénérable
-- mais ne change PLUS à chaque sélection. Le compte d'authentification (table
-- users) garde son hash ; cette colonne est une copie pour la gestion interne.

ALTER TABLE planner_personnel
  ADD COLUMN IF NOT EXISTS access_password TEXT;
