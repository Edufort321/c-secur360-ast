-- 143 — SÉCURITÉ (correctif de fuite confirmée) : ferme l'accès des rôles anon/authenticated
-- aux tables d'IDENTITÉ et de SESSION. Avant ce correctif, la clé anon publique permettait de
-- lire `users` (courriels/rôles) et `auth_sessions` via l'API REST, sans authentification.
-- Les routes SERVEUR utilisent le service role, qui N'EST PAS affecté par ces REVOKE.
REVOKE ALL ON public.users                 FROM anon, authenticated;
REVOKE ALL ON public.auth_sessions         FROM anon, authenticated;
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;

-- Défense en profondeur : RLS activé + aucune politique permissive (deny par défaut).
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_sessions_access ON public.auth_sessions;
