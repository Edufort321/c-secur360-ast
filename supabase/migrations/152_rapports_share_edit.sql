-- 152 — Étend le partage de rapport (#51) à un mode ÉDITION encadré pour sous-traitants externes :
-- le lien autorise la saisie de VALEURS (champs de section, états/notes d'inspection) — jamais la
-- structure — pendant une FENÊTRE de dates optionnelle. Les utilisateurs de l'app éditent en tout
-- temps via l'app ; l'externe édite seulement via ce lien et seulement dans la fenêtre autorisée.
--
-- ⚠️ Dépend de la migration 151 (table rapport_shares). Ce script est rendu INDÉPENDANT DE L'ORDRE :
-- s'il est exécuté avant 151, il ne fait rien (NOTICE) au lieu d'échouer ; relancez-le après 151.
DO $$
BEGIN
  IF to_regclass('public.rapport_shares') IS NULL THEN
    RAISE NOTICE 'rapport_shares absente : appliquez d''abord la migration 151, puis relancez 152.';
    RETURN;
  END IF;
  ALTER TABLE rapport_shares DROP CONSTRAINT IF EXISTS rapport_shares_mode_check;
  ALTER TABLE rapport_shares ADD CONSTRAINT rapport_shares_mode_check CHECK (mode IN ('view','review','edit'));
  ALTER TABLE rapport_shares ADD COLUMN IF NOT EXISTS starts_at timestamptz;
END $$;
