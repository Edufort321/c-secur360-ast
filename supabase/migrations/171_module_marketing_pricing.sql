-- 171 — Ajoute le module « marketing » au catalogue (table modules) pour qu'il apparaisse dans la
-- gestion des prix (/admin/price-management) et la vitrine publique (prix). Activé pour CERDIA (démo).
-- Prix de départ modifiable ensuite dans l'admin. Idempotent.

INSERT INTO modules (key, name_fr, name_en, monthly_price, sort_order) VALUES
  ('marketing', 'Marketing IA', 'AI Marketing', 500, 110)
ON CONFLICT (key) DO NOTHING;

-- CERDIA (tenant démo tout inclus) : active le module.
INSERT INTO tenant_modules (tenant_id, module_key, enabled, source)
VALUES ('cerdia', 'marketing', TRUE, 'manual')
ON CONFLICT (tenant_id, module_key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
