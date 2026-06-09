-- 146 — SÉCURITÉ : ferme la LECTURE de la colonne de salaire sur planner_personnel pour
-- anon/authenticated (fuite confirmée : la clé anon lisait name + current_salary). La table reste
-- lisible pour ses colonnes non sensibles (nom, rôle, courriel…) utilisées partout dans l'app ;
-- seule la colonne `current_salary` est fermée. Le salaire est servi par /api/hr/dossier (niveau RH).
REVOKE SELECT (current_salary) ON public.planner_personnel FROM anon, authenticated;
