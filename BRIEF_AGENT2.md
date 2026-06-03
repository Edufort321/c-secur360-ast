# Brief Agent 2 (UI / Inventaire) — file mise à jour 2026-06-03

⚠️ Aucun push depuis ~15 h (dernier = #49). Le client ne voit AUCUN changement en inventaire.
Reprendre IMMÉDIATEMENT, 1 commit atomique par tâche, push après chaque.

Zone : `components/inventory/**`, `components/BackButton.tsx`, `app/[tenant]/projects/**`,
`app/[tenant]/clients/**`, `components/steps/**` (AST), `components/soumissions/**`, `components/bons/**`.
NE PAS toucher planner, timesheets, `app/[tenant]/admin/page.tsx`, `lib/**` partagés, `supabase/migrations/**`
(si une table manque, demander au patron la migration).

Build vert obligatoire (`npx tsc --noEmit` puis `npx next build`, stop `next dev` du worktree avant). Champs nombre `onFocus={e=>e.target.select()}`.

## File prioritaire (le client attend du concret)

### #55 — PERSISTANCE (bloquant, à faire EN PREMIER)
« L'inventaire ne se met pas à jour / ne s'enregistre pas. » Le module écrit surtout en localStorage.
- Brancher CRUD articles sur Supabase table `items` (et `item_locations`), filtré `tenant_id`.
- Lire l'erreur Supabase (une requête `await` ne throw pas → tester `res.error`) ; pattern strip-retry pour colonnes manquantes ; fallback localStorage SEULEMENT si la table est inaccessible, avec avis visible.
- Au chargement : Supabase = source de vérité ; migrer le localStorage existant vers `items` une seule fois.
- Vérifier que création / +qté / -qté / édition min-max **persistent après rechargement**.

### #56 + scanner (logique exacte demandée par le client)
QR/code-barres. DEUX modes selon le contexte :
- **Caméra fixe / lecteur "stand" (hors app, ex. douchette ou page publique de scan)** : le scan AFFICHE la **fiche produit** (nom, photo, description, **prix vendant**, et **quantité disponible**). LECTURE SEULE — aucun mouvement.
- **Scan via l'app (utilisateur connecté)** : après le scan, permettre les **mouvements de stock** : Entrée / Sortie → quantité (champ écrasable) → OK. Met à jour `items.qty` + journal de mouvement.
- Le flux mobile doit être : scan → choix entrée/sortie → quantité → OK (gros boutons, une main).

### QR — même présentation que AST / Inspection + impression multi-format
- Générer le QR de chaque article avec le **même composant/visuel** que les modules AST et Inspection
  (chercher leur générateur QR existant, ex. `qrcode`/`qrcode.react` déjà utilisé — RÉUTILISER, ne pas réinventer).
- Conserver la possibilité d'**imprimer sur différents formats d'étiquette** comme actuellement (ex. Avery / rouleau / A4 planche) — garder/améliorer le sélecteur de format d'étiquette existant.
- Le QR encode l'URL de fiche produit (mode stand) ; ouverte dans l'app = mode mouvements.

### #54 mobile · #58 min/max éditables + champs écrasables · #61 bilingue (header) · #68 dédoublonnage + interconnexion hôte (langue/thème/header/sites/personnel/supabase/tenant — source unique). #61 ⊂ #68.

Après chaque tâche : prévenir le patron « Agent 2 a terminé #X » pour merge.
