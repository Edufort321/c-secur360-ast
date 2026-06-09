-- 152 — Étend le partage de rapport (#51) à un mode ÉDITION encadré pour sous-traitants externes :
-- le lien autorise la saisie de VALEURS (champs de section, états/notes d'inspection) — jamais la
-- structure — pendant une FENÊTRE de dates optionnelle. Les utilisateurs de l'app éditent en tout
-- temps via l'app ; l'externe édite seulement via ce lien et seulement dans la fenêtre autorisée.
ALTER TABLE rapport_shares DROP CONSTRAINT IF EXISTS rapport_shares_mode_check;
ALTER TABLE rapport_shares ADD CONSTRAINT rapport_shares_mode_check CHECK (mode IN ('view','review','edit'));
-- Début de la fenêtre d'autorisation (NULL = immédiat). La fin réutilise expires_at.
ALTER TABLE rapport_shares ADD COLUMN IF NOT EXISTS starts_at timestamptz;
