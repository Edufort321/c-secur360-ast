-- 135 — Forfait token SANS date de fin : utilise jusqu'a epuisement. Le client demande un
-- renouvellement/ajustement via un bouton (courriel) -> on leve renewal_requested -> la carte du
-- tenant passe au ROUGE cote super-admin ("ajustement token requis"). Eric ajuste le forfait
-- (tier) et/ou remet la conso a 0, ce qui efface la demande.
-- La colonne renewal_date (131) n'est plus utilisee pour les jetons (les jetons n'ont pas de date).

ALTER TABLE ai_budgets ADD COLUMN IF NOT EXISTS renewal_requested   BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE ai_budgets ADD COLUMN IF NOT EXISTS requested_tier_cents INTEGER;
ALTER TABLE ai_budgets ADD COLUMN IF NOT EXISTS requested_at         TIMESTAMPTZ;
