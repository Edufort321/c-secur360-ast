-- 192 : Témoignages de la page publique (gérés dans l'admin plateforme, comme les slides).
-- Plateforme (pas de tenant) : la page d'accueil C-Secur360 est commune. Vide par défaut -> la section
-- « Témoignages » se masque tant qu'aucun témoignage RÉEL n'est saisi (fini les faux avis inventés).
-- Lecture publique (anon) ; écriture via le dashboard super-admin (gardé au niveau applicatif). Idempotent.

CREATE TABLE IF NOT EXISTS landing_testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  title_fr    TEXT,
  title_en    TEXT,
  company     TEXT,
  text_fr     TEXT,
  text_en     TEXT,
  rating      INT DEFAULT 5,
  sort_order  INT DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE landing_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS landing_testimonials_all ON landing_testimonials;
CREATE POLICY landing_testimonials_all ON landing_testimonials FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('192') on conflict (version) do nothing;
