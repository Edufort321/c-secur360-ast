-- 229 — Le moteur « Rapport terrain » sert aussi à la MAINTENANCE D'ÉQUIPEMENT (réutilisation du moteur
-- de gabarits/blocs/IA/PDF). On distingue les documents par doc_type ('rapport' par défaut | 'maintenance').
-- Données séparées (même moteur) ; la maintenance peut partir d'un gabarit rapport. Idempotent + auto-enregistré.

alter table rapports          add column if not exists doc_type text not null default 'rapport';
alter table rapport_templates add column if not exists doc_type text not null default 'rapport';
create index if not exists rapports_doctype_idx          on rapports (tenant_id, doc_type);
create index if not exists rapport_templates_doctype_idx on rapport_templates (tenant_id, doc_type);

insert into schema_migrations (version) values ('229') on conflict (version) do nothing;
