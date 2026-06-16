-- 190 : Prix final CIBLE éditable sur une soumission.
-- Permet de saisir un total final fixe ; la majoration % est alors DÉDUITE (peut devenir négative = sous le coût).
-- Colonne optionnelle : le code dégrade gracieusement si elle est absente (le total reste cohérent via markup_pct).
-- Idempotent.

ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS final_override NUMERIC(14, 2);

insert into schema_migrations (version) values ('190') on conflict (version) do nothing;
