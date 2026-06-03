# Brief Agent 1 — file mise à jour 2026-06-03 (réactivé)

Build vert obligatoire (`npx tsc --noEmit` puis `npx next build`, stop `next dev` du worktree avant).
1 commit atomique/tâche, push après chaque, messages ASCII préfixés du n°. Champs nombre `onFocus={e=>e.target.select()}`.
Style commun : `PortalHeader`, `useLanguage` (FR/EN), jour/nuit (classes dark:), `BackButton`.

## #89 — DGA : gestion des actifs (transformateurs)
Le module DGA existe (`app/[tenant]/dga/page.tsx`, moteur `lib/dga/diagnose.ts`, table `dga_analyses`, migration 116).
Construis la **gestion des actifs**, en zone disjointe pour éviter les conflits :
- **Migration `117_dga_assets.sql`** : table `dga_assets` (id, tenant_id, name, type, kva, voltage, oil_type, in_service_date, serial, location, notes, created_at) + RLS permissive `USING(true) WITH CHECK(true)`. Ajoute aussi `ALTER TABLE dga_analyses ADD COLUMN IF NOT EXISTS asset_id uuid;`
- **`lib/dga/assets.ts`** : CRUD (list/create/update/delete) scoping `tenant_id`, lecture d'erreur Supabase.
- **`components/dga/AssetsPanel.tsx`** (nouveau dossier `components/dga/`) : liste des actifs + formulaire fiche + historique des analyses de l'actif (lire `dga_analyses` filtré `asset_id`).
- Dans `app/[tenant]/dga/page.tsx` : ajoute un **sélecteur d'actif** au-dessus du formulaire (enregistre `asset_id` dans l'analyse) et un sous-onglet « Actifs » montant `<AssetsPanel/>`. (Touche ce fichier au minimum, en évitant de réécrire la logique de diagnostic — coordonne avec le patron si gros changement.)

NE touche PAS `lib/dga/diagnose.ts` (patron) ni `lib/dga/trends.ts`/`report.ts`/`DuvalTriangle.tsx` (Agent 2).

Après la tâche : « Agent 1 a terminé #89 » pour merge. Garde ≥2 tâches : ensuite je te donnerai #60/#72 planner si non finis, ou une autre.
