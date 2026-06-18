-- 227 — SÉCURITÉ inter-tenant : le permis d'espace clos était unique sur permit_number SEUL (index
-- global), ce qui (a) faisait collisionner deux tenants partageant un numéro et (b) rendait l'upsert
-- non scopable. On passe l'unicité à (tenant_id, permit_number) pour permettre l'upsert
-- onConflict 'tenant_id,permit_number' et isoler les permis par tenant. Idempotent + auto-enregistré.
-- (Les lectures côté client filtrent désormais tenant_id — cf. SafetyManager.tsx.)

drop index if exists confined_space_permits_pnum_idx;
create unique index if not exists confined_space_permits_tenant_pnum_idx
  on confined_space_permits (tenant_id, permit_number);

insert into schema_migrations (version) values ('227') on conflict (version) do nothing;
