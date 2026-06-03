# Brief Agent 3 (Affiliation) — file mise à jour 2026-06-03

Zone : `app/admin/affiliate-contracts/**`, `app/admin/commissions/**`, `app/admin/vendors/**`,
`app/api/admin/affiliate-*`, `components/admin/AffiliateContract.tsx`, `lib/affiliateContract*.ts`,
`lib/affiliateCommissions*.ts`, migrations ≥ 120 (réservées affiliation). NE PAS toucher
`app/[tenant]/admin/page.tsx`, planner, timesheets, inventaire, autres `lib/*`.

Règles : 1 commit atomique par tâche, build vert (`npx tsc --noEmit` puis `npx next build`, stop dev avant),
messages ASCII préfixés du n°, push après chaque tâche. Champs nombre `onFocus={e=>e.target.select()}`.

## File (priorité haute d'abord)

### #75 — Contrat d'affiliation : corrections demandées par le client
Fichier principal : `components/admin/AffiliateContract.tsx` + `lib/affiliateContract.ts` (defaultClauses) + liste `app/admin/affiliate-contracts/page.tsx`.
1. **Nom du client par défaut** : à l'ouverture, si `vendor_name` est vide, NE PAS laisser vide le bloc « Client » du contrat — le nom du client vendu (`tenantName`) doit apparaître par défaut dans l'aperçu ET dans le PDF (déjà `Client : ${tenantName}` au PDF, vérifier que l'aperçu écran l'affiche aussi). Ajouter un champ visible « Client » (lecture seule = tenantName).
2. **Courriel : pas de repli sur le mien** : si l'utilisateur ne saisit pas le courriel du vendeur, `vendor_email` doit rester VIDE — il ne doit JAMAIS être prérempli avec le courriel de l'admin connecté. Chercher dans `getContract`/`lib/affiliateContract.ts` toute valeur par défaut qui injecte l'email admin et la retirer (laisser `''`).
3. **Supprimer un contrat** : ajouter un bouton **Supprimer** (corbeille) dans la LISTE des contrats (`app/admin/affiliate-contracts/page.tsx`) avec `confirm()`, + fonction `deleteContract(tenantId)` dans `lib/affiliateContract.ts` (`supabase.from('affiliate_contracts').delete().eq(...)`). Distinct de « Résilier » (qui garde l'historique). Vérifier l'erreur Supabase.
4. **Clause de résiliation pour préjudice** : dans `defaultClauses()`, AJOUTER une clause donnant à l'entreprise (C-Secur360 / Cerdia) le droit de **résilier immédiatement** le contrat et de **cesser tout versement futur de commission** si le co-vendeur **nuit à l'entreprise** (concurrence déloyale, dénigrement, manquement, atteinte à la réputation, non-respect des clauses). Les commissions échues avant la résiliation pour faute restent dues sauf faute lourde. Rédaction FR juridique sobre.
5. **2 logos sur le contrat (aperçu + PDF)** : `public/c-secur360-logo.png` en **haut à gauche**, `public/logo-cerdia3.png` **centré en bas de page**. PDF via jsPDF : charger l'image (fetch→dataURL ou `<img>` base64), `doc.addImage(...)` en-tête haut-gauche (~120pt large) et pied centré (`(W-largeur)/2`, near `H-56`) sur **chaque page** (boucler `doc.getNumberOfPages()`). Aperçu écran : afficher les 2 logos aux mêmes positions.

### #69, #70 (déjà en cours) — terminer puis pousser.

### #78 — Lien de parrainage unique par vendeur + attribution des inscriptions
- Code/lien de parrainage unique par co-vendeur (ex. `?ref=<code>` ou `/signup?ref=`). Migration ≥126 : colonne `referral_code` (unique) sur la table vendeurs + `referred_by` sur tenants (ou table d'attribution).
- À la création d'un tenant via ce lien, attribuer automatiquement le tenant au vendeur (referrer) → la commission récurrente du vendeur s'applique à ce tenant.
- Afficher la liste des inscriptions attribuées dans la fiche vendeur.

### #79 — Tableau de bord vendeur (KPIs) dans `app/admin/vendors/[id]`
- KPIs : nb clients référés, MRR généré, commissions cumulées / à venir / payées, taux de rétention, prochaine échéance. Graphiques simples. Réutiliser `lib/affiliateCommissions`.

Après chaque tâche : prévenir le patron « Agent 3 a terminé #X » pour merge. Garde ≥2 tâches en file.
