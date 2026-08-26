-- =====================================================================================
-- 270 — RLS : isolation tenant RÉELLE sur la pile finance / comptabilité (JWT tenant_id).
--
-- CONTEXTE (faille corrigée)
--   Ces tables avaient une policy permissive `FOR ALL USING (true)` SANS clause `TO` : elle
--   s'applique donc à `public` (anon + authenticated). Comme le bundle expose la clé anon
--   (NEXT_PUBLIC_SUPABASE_ANON_KEY), n'importe qui pouvait appeler l'API REST Supabase en
--   direct, OMETTRE le filtre .eq('tenant_id', …) fait côté navigateur, et lire/écrire les
--   données de TOUS les tenants (grand livre, factures, transactions, soumissions, clés API…).
--   Le programme de « lock » (124, 143–258) couvrait identité/RH/paie/Stripe/secrets mais avait
--   SAUTÉ toute la finance. Cette migration ferme ce trou.
--
-- CORRECTIF
--   On remplace `USING (true)` par un prédicat basé sur le JWT tenant signé au login
--   (voir lib/supabaseToken.ts + /api/auth/supabase-token + lib/supabase.ts option accessToken) :
--       tenant_id = auth.jwt() ->> 'tenant_id'   OU   auth.jwt() ->> 'app_role' = 'super_admin'
--   -> un utilisateur ne voit/modifie QUE son tenant ; le super_admin (back-office SaaS) bypass.
--   -> une requête anon (clé anon nue, aucun claim) tombe à NULL -> AUCUNE ligne. Trou fermé.
--   Les tables sans colonne tenant_id (répertoire SaaS global, ex. `vendors`) -> super_admin only.
--   Les routes serveur (service_role) continuent de bypasser le RLS (inchangé).
--
-- ⚠️ ORDRE DE DÉPLOIEMENT (important) :
--   1) D'ABORD déployer le code (le navigateur envoie le JWT tenant) et vérifier que les pages
--      finance chargent toujours (les policies sont encore `USING(true)`, donc rien ne casse).
--   2) ENSUITE seulement exécuter cette migration. Si on l'exécute AVANT que le navigateur
--      n'envoie le JWT, les pages finance renverront 0 ligne (isolation active sans identité).
--   Pré-requis : variable d'env SUPABASE_JWT_SECRET (Dashboard → Settings → API → JWT Secret).
--
-- Idempotent (rejouable). S'auto-enregistre dans schema_migrations à la fin.
-- =====================================================================================

do $$
declare
  t          text;
  has_tenant boolean;
  pol        record;
  -- Toute la pile finance/compta exposée cross-tenant (audit du trou 085–246).
  cibles text[] := array[
    'gl_accounts','gl_journals','gl_periods','gl_tax_codes','gl_entries','gl_lines','gl_entry_counters',
    'commerce_invoices','commerce_invoice_items','company_settings',
    'commerce_transactions','commerce_transaction_items','commerce_credit_notes','invoice_payments',
    'tenant_subscriptions','tenant_transactions','treasury_accounts','clients',
    'soumissions','soumission_items','soumission_lignes','catalogue_taux',
    'soumission_settings','soumission_templates','soumission_attachments',
    'bons_commande','project_commissions','vendor_commissions','affiliate_commission_payments',
    'tenant_api_keys','vendors'
  ];
begin
  foreach t in array cibles loop
    -- Table absente sur ce projet ? on saute proprement (idempotence multi-env).
    if to_regclass('public.' || t) is null then
      raise notice 'SKIP % (table absente)', t;
      continue;
    end if;

    -- La colonne tenant_id existe-t-elle ? (source de vérité = le catalogue, pas une supposition)
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'tenant_id'
    ) into has_tenant;

    -- 1) Purge de TOUTES les policies existantes de la table (dont les *_access permissives).
    for pol in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;

    -- 2) Privilèges TABLE (indépendants du RLS : en Postgres il faut le GRANT *et* la policy).
    --    - anon : aucun accès (défense en profondeur).
    --    - authenticated : c'est le rôle porté par le JWT tenant (role='authenticated'). Il DOIT
    --      avoir le GRANT sinon PostgREST renvoie 42501 « permission denied » avant même le RLS.
    --      L'isolation réelle est ensuite assurée par la policy ci-dessous (filtre tenant_id).
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    -- 3) Policy d'isolation.
    if has_tenant then
      execute format(
        'create policy %I on public.%I for all '
        'using (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'') '
        'with check (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'')',
        t || '_tenant_isolation', t);
      raise notice 'OK % -> isolation tenant (tenant_id + bypass super_admin)', t;
    else
      -- Pas de tenant_id (ex. vendors = répertoire SaaS global) : réservé au super_admin.
      execute format(
        'create policy %I on public.%I for all '
        'using ((auth.jwt() ->> ''app_role'') = ''super_admin'') '
        'with check ((auth.jwt() ->> ''app_role'') = ''super_admin'')',
        t || '_admin_only', t);
      raise notice 'OK % -> super_admin only (pas de colonne tenant_id)', t;
    end if;
  end loop;
end $$;

-- Journal des migrations (convention projet depuis 177).
insert into schema_migrations (version) values ('270') on conflict (version) do nothing;
