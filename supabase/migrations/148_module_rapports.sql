-- 148 — Catalogue de modules : « Rapports terrain » (et « Congés » s'il manquait), pour qu'ils
-- apparaissent dans l'admin super-admin (toggles + prix) comme les autres cartes, et activés pour
-- cerdia (tenant tout inclus). Le verrouillage venait de l'absence dans le catalogue + la liste.
INSERT INTO modules (key, name_fr, name_en, monthly_price, sort_order) VALUES
  ('rapports', 'Rapports terrain', 'Field reports', 200, 120),
  ('conges',   'Congés',          'Time off',      0,   95)
ON CONFLICT (key) DO NOTHING;

-- Cerdia : activer les modules.
INSERT INTO tenant_modules (tenant_id, module_key, enabled, source) VALUES
  ('cerdia', 'rapports', TRUE, 'manual'),
  ('cerdia', 'conges',   TRUE, 'manual')
ON CONFLICT (tenant_id, module_key) DO NOTHING;
