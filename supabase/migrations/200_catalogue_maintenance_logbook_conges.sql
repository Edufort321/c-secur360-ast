-- 200 — Ajoute au CATALOGUE de modules (table `modules`) ceux qui existaient dans le registre/nav
-- mais PAS dans le catalogue → ils restaient verrouillés (cadenas) car impossibles à activer.
-- Concerne : maintenance (GMAO), logbook (carnet de bord véhicules), conges. Idempotent.
-- Rappel : `modules.monthly_price` = prix ANNUEL en dollars (nom de colonne trompeur).
INSERT INTO modules (key, name_fr, name_en, monthly_price, sort_order) VALUES
  ('maintenance', 'Maintenance d''équipement', 'Equipment maintenance', 250, 95),
  ('logbook',     'Logbook véhicules',         'Vehicle logbook',       150, 100),
  ('conges',      'Congés',                    'Time off',              100, 105)
ON CONFLICT (key) DO NOTHING;

-- Tenant cerdia (tout inclus) : activer ces modules pour lever le cadenas.
INSERT INTO tenant_modules (tenant_id, module_key, enabled, source) VALUES
  ('cerdia', 'maintenance', TRUE, 'manual'),
  ('cerdia', 'logbook',     TRUE, 'manual'),
  ('cerdia', 'conges',      TRUE, 'manual')
ON CONFLICT (tenant_id, module_key) DO NOTHING;

insert into schema_migrations (version) values ('200') on conflict (version) do nothing;
