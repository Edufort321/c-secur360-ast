-- 147 — SÉCURITÉ : verrouille les ÉCRITURES de planner_personnel et la lecture du mot de passe
-- d'accès. Toutes les écritures passent désormais par /api/hr/personnel (service role + niveau
-- canAuth, tenant de session). Empêche : (a) l'élévation de privilèges (un attaquant ne peut plus
-- modifier `niveauAcces` via la clé anon), (b) l'écrasement de salaires/données employé, (c) la
-- lecture du mot de passe d'accès via l'API REST.

-- Écritures interdites à l'anon (toutes via le serveur).
REVOKE INSERT, UPDATE, DELETE ON public.planner_personnel FROM anon, authenticated;

-- Lecture du mot de passe d'accès fermée (les colonnes non sensibles restent lisibles).
REVOKE SELECT (access_password) ON public.planner_personnel FROM anon, authenticated;
