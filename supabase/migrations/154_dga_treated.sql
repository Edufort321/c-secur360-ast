-- 154 — Drapeau MANUEL « traité / non traité » par transformateur DGA.
-- Distinct de `seen` (badge « Nouveau » qui s'efface a l'ouverture de la fiche) : `treated` est
-- contrôlé par l'utilisateur et PERSISTE. Quand un import par courriel apporte de nouveaux
-- résultats, le transformateur passe a `treated=false` (« A traiter ») ; l'utilisateur coche
-- « Traité » quand il a fini, et peut filtrer la liste sur ce drapeau.
-- Defaut true : les transformateurs existants / créés a la main ne sont PAS signalés.
ALTER TABLE public.dga_dossiers ADD COLUMN IF NOT EXISTS treated boolean NOT NULL DEFAULT true;
