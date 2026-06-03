# #17 — Durcissement RLS multi-tenant (analyse + décision requise)

> Agent #1 (admin/sécurité). Tâche « avant prod ». Ce document cadre la décision : le code
> ne peut PAS être écrit à l'aveugle sans casser l'application. À valider par le patron IA.

## Constat

- Les tables sont protégées par RLS mais avec des policies permissives `FOR ALL USING (true) WITH CHECK (true)`
  (ex. migrations 087 `commerce_transactions`, 108 `timesheet_expenses`, 123 `bank_statement_lines`, etc.).
- Conséquence : le rôle **anon** (clé publique utilisée par le navigateur) peut lire/écrire **toutes**
  les lignes, **tous tenants confondus**. L'isolation par `tenant_id` n'existe qu'au niveau applicatif
  (chaque requête fait `.eq('tenant_id', tenant)`), pas au niveau base.
- Risque : un utilisateur authentifié (ou toute personne ayant la clé anon publique) peut interroger
  un autre `tenant_id` directement via l'API PostgREST → **fuite inter-tenant**.

## Pourquoi on ne peut pas « juste activer la RLS par tenant »

L'auth est **maison** : cookie `auth_token` → table `auth_sessions` → `users`. Ce n'est PAS Supabase Auth.
Donc dans Postgres, `auth.uid()` / `auth.jwt()` sont **vides** côté navigateur. Une policy du type
`USING (tenant_id = auth.jwt()->>'tenant_id')` ne fonctionnerait pas (aucun JWT Supabase) et **bloquerait
toutes les lectures du navigateur** → app cassée.

## Options (à trancher)

### Option A — Lectures sensibles côté serveur (recommandée à terme)
Router les accès aux données par des **Route Handlers `/api/**`** utilisant `supabaseAdmin` (service_role,
bypass RLS) APRÈS contrôle `getSessionUser()` + vérification `tenant_id`. Puis passer les policies
publiques à `USING (false)` (anon ne lit plus rien directement).
- ➕ Vraie isolation, fail-secure. ➖ Gros refactor (le navigateur lit aujourd'hui Supabase en direct
  dans beaucoup d'écrans : timesheets, planner, admin…). À faire par lots, par module.

### Option B — Contexte tenant via PostgREST (`request.jwt`/GUC)
Émettre côté serveur un JWT Supabase signé (ou poser un GUC `request.tenant`) portant le `tenant_id`,
et écrire les policies `USING (tenant_id = current_setting('request.tenant', true))`.
- ➕ Garde les lectures navigateur directes. ➖ Nécessite d'émettre/rafraîchir un token Supabase en
  parallèle de l'auth maison ; complexité de cycle de vie.

### Option C — Migrer vers Supabase Auth
Adopter Supabase Auth (ou custom JWT signé avec le secret du projet) pour que `auth.jwt()` porte le
`tenant_id`, puis policies par tenant classiques.
- ➕ Solution « canonique ». ➖ Refonte de l'authentification (impacte login, sessions, middleware).

### Option D (court terme, non-bloquant) — Verrouiller les tables 100 % serveur
Pour les tables qui ne sont **jamais** lues par le navigateur (accédées uniquement via `supabaseAdmin`),
passer leurs policies à `USING (false)` : anon n'y accède plus, service_role continue (bypass RLS).
- ➕ Gain immédiat sans rien casser. ➖ Demande un audit table-par-table (quelles tables le client
  lit-il en direct ?). À livrer comme migration ciblée une fois la liste validée.

## Recommandation

1. **Court terme (je peux le faire)** : Option D — auditer les `supabase.from(...)` des composants
   `'use client'`, dresser la liste des tables lues côté navigateur vs serveur-seul, puis une migration
   `USING (false)` sur les tables serveur-seul. **Décision requise : valider la liste avant d'appliquer.**
2. **Moyen terme** : Option A par module (commencer par les plus sensibles : paie, transactions, RH).

## Question au patron IA

- Quelle option cible (A / B / C) ?
- Feu vert pour livrer l'Option D dès maintenant (audit + migration `USING(false)` sur tables serveur-seul) ?
