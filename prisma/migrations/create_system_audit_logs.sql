-- Migration: Create system_audit_logs table
-- Date: 2025-01-22
-- Description: Table d'audit pour tracer les actions système

create table if not exists public.system_audit_logs (
  id bigserial primary key,
  actor text not null,                -- "system", "admin:<email>"
  area text not null,                 -- "stripe","twilio","vercel","supabase","dns"
  action text not null,               -- "update_env","set_webhook","dns_change","deploy"
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Index pour performance sur les requêtes fréquentes
create index if not exists idx_system_audit_logs_area on public.system_audit_logs(area);
create index if not exists idx_system_audit_logs_created_at on public.system_audit_logs(created_at desc);
create index if not exists idx_system_audit_logs_actor on public.system_audit_logs(actor);

-- RLS (Row Level Security)
alter table public.system_audit_logs enable row level security;

-- Politique : Seuls les admins peuvent lire les logs d'audit
create policy "Admin can view audit logs"
  on public.system_audit_logs
  for select
  using (
    exists (
      select 1 from auth.users
      where auth.uid() = users.id
      and users.role = 'admin'
    )
  );

-- Politique : Le système peut insérer des logs
create policy "System can insert audit logs"
  on public.system_audit_logs
  for insert
  with check (true);

-- Commentaires pour documentation
comment on table public.system_audit_logs is 'Logs d''audit pour tracer toutes les actions système importantes';
comment on column public.system_audit_logs.actor is 'Qui a effectué l''action (system, admin:email, user:id)';
comment on column public.system_audit_logs.area is 'Zone du système affectée (stripe, twilio, vercel, supabase, dns)';
comment on column public.system_audit_logs.action is 'Type d''action effectuée';
comment on column public.system_audit_logs.details is 'Détails JSON de l''action (sans données sensibles)';