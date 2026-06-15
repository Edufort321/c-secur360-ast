# CLAUDE.md — Mémoire projet (lue automatiquement au démarrage)

## Identité du projet
- **Nom** : C-Secur360 (plateforme SST multi-tenant). Tenant = segment d'URL `/[tenant]/...`.
- **Prod** : https://www.c-secur360.ca — **Déploiement Vercel** (auto sur push).
- **Repo** : github.com/Edufort321/c-secur360-ast — **branche de travail `feat/modular-foundation`** (je pousse aussi sur `main` en fast-forward à la fin d'une tâche, sur demande d'Eric).
- **Stack** : Next.js (App Router) + Supabase (Postgres + Auth + RLS + Storage) + TailwindCSS. Langue : **français** (UI + commentaires).
- **Supabase** : projet `nzjjgcccxlqhbtpitmpo` (vérifier `NEXT_PUBLIC_SUPABASE_URL`). Clients : `@/lib/supabase` (anon, navigateur) vs `@/lib/supabaseAdmin` (service_role, serveur seulement).
- ⚠️ Ne PAS présumer « argent en cents » : ex. `modules.monthly_price` est un **prix ANNUEL en dollars** (nom de colonne trompeur). Vérifier les conventions par table.

## Qui travaille ? (à demander au début)
- **Eric** (fondateur, super_admin) : connaît tout, va vite. Rappels suffisants.
- **Benjamin** (associé d'Eric) : donner des **consignes claires pas-à-pas**, surtout pour migrations et déploiement. Référence : onglet **« Guide opérateur »** dans CERDIA → /commerce/admin.

## Règles non négociables
- **RLS obligatoire** sur toute nouvelle table (REVOKE anon sur données sensibles ; passer par routes serveur service_role).
- Les routes/clients **service_role** ne sont JAMAIS appelés depuis un composant client.
- **Jamais `git push` ni migration en prod sans l'accord d'Eric.**
- **Migrations** : Eric/Benjamin les appliquent en **collant le SQL directement dans l'éditeur SQL du BON projet Supabase**, puis Run (PAS `supabase db push`). Les fichiers sont numérotés dans `supabase/migrations/` et **idempotents** (`IF NOT EXISTS`). Toujours **type-check `npx tsc --noEmit` avant de pousser** (transpileModule rate les erreurs de type qui cassent le build Vercel).

## Synchronisation Git (jamais de zip)
Le code de référence est sur **GitHub**, pas un zip. **Au début d'une session : `git pull`** pour partir de la dernière version, et `git push` pour envoyer (avec l'accord d'Eric). Nouveau portable = Étape 0 (installer + `gh auth login`) puis `git clone` une fois ; ensuite pull/push fonctionnent (le push exige l'auth GitHub).

## Workflow à l'arrivée sur une tâche
0. **`git pull`** d'abord (partir de la dernière version).
1. Lire ce CLAUDE.md **+ la mémoire persistante** `C:\Users\ericd\.claude\projects\C--C-Secur360-c-secur360-ast-feat-modular-foundation\memory\MEMORY.md` (index + fichiers liés).
2. Explorer la structure (`app/[tenant]/`, `supabase/migrations/`, `lib/`, `components/`) et comprendre l'existant AVANT d'écrire.
3. Demander : « **DÉPANNAGE ou DÉVELOPPEMENT** ? », attendre la consigne précise, proposer un plan.
4. Travailler de bout en bout (mode autonome convenu avec Eric), commiter, et **tenir la mémoire à jour en continu** (point de reprise si on perd le fil).

## Emplacements clés
- Modules / entitlements : `lib/modules/registry.ts`, `lib/entitlements.ts`, table `tenant_modules`.
- Migrations SQL : `supabase/migrations/` (dernier numéro = à appliquer).
- Env : `.env.local` (jamais commit). Sites/personnel : `planner_succursales`, `planner_personnel`.
- Mémoire de travail = dossier `.claude/.../memory/` (MEMORY.md = index).
