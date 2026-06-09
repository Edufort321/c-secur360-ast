-- 144 — SÉCURITÉ : ferme l'accès des rôles anon/authenticated aux DOSSIERS RH.
-- Désormais lus/écrits uniquement via /api/hr/dossier (service role + vérification de niveau
-- d'accès RH + tenant de la session). Empêche toute lecture inter-tenant via la clé anon.
REVOKE ALL ON public.hr_documents      FROM anon, authenticated;
REVOKE ALL ON public.hr_certifications FROM anon, authenticated;
REVOKE ALL ON public.hr_onboarding     FROM anon, authenticated;

-- On retire aussi les politiques permissives (deny par défaut, RLS déjà activé en 111).
DROP POLICY IF EXISTS hr_documents_access      ON public.hr_documents;
DROP POLICY IF EXISTS hr_certifications_access  ON public.hr_certifications;
DROP POLICY IF EXISTS hr_onboarding_access      ON public.hr_onboarding;
