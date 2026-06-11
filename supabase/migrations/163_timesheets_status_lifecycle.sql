-- 163 — Cycle de vie complet du statut des feuilles de temps.
-- L'ancienne contrainte n'autorisait que draft/submitted/approved/rejected/exported. Le flux réel
-- ajoute 'verified' (vérifiée par la paie) et 'paid' (payée). On élargit la contrainte (en gardant
-- 'exported' pour la rétro-compatibilité). Flux : draft -> submitted -> approved -> verified -> paid.
ALTER TABLE public.timesheets DROP CONSTRAINT IF EXISTS timesheets_status_check;
ALTER TABLE public.timesheets ADD CONSTRAINT timesheets_status_check
  CHECK (status::text = ANY (ARRAY['draft','submitted','approved','verified','paid','rejected','exported']::text[]));

-- Traçabilité paie (facultatif mais utile) : qui/quand a vérifié et payé.
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS verified_by text;
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS paid_by     text;

NOTIFY pgrst, 'reload schema';
