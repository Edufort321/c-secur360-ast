-- 102 — Catalogue de taux : barème scalaire complet + libellés éditables.
-- extras : { km, sub_h5, sub_h12, sub_h15, sub_nuitee, hebergement } (taux de référence)
-- labels : libellés personnalisés des champs (mo_bureau, mo_chantier, km, subsistance, hebergement, ...)
--          propagés à l'affichage de la soumission.
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS extras jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS labels jsonb NOT NULL DEFAULT '{}'::jsonb;
