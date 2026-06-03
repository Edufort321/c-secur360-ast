# Brief Agent 2 — file mise à jour 2026-06-03 (réactivé)

Build vert obligatoire (`npx tsc --noEmit` puis `npx next build`, stop `next dev` avant).
1 commit atomique/tâche, push après chaque, messages ASCII préfixés. Style commun (FR/EN, dark, PortalHeader).

> Note : l'inventaire (#54-#68) a été repris par le patron. Tu es réorienté sur le DGA (rapports).

## #90 — DGA : tendances/graphiques + rapport PDF + visuel Triangle de Duval
Module DGA existant : `app/[tenant]/dga/page.tsx`, moteur `lib/dga/diagnose.ts` (exporte `diagnose`, `diagnoseFull`,
`rogers`, `iec60599`, `keyGas`, `gasRatePerDay`, `duvalTriangle1`, `LABEL`... ), table `dga_analyses`.
Zone disjointe (ne touche pas `diagnose.ts` ni les fichiers actifs d'Agent 1) :
- **`components/dga/DuvalTriangle.tsx`** : SVG du Triangle de Duval 1 (zones colorées PD/D1/D2/T1/T2/T3/DT) + point tracé depuis %CH4/%C2H2/%C2H4. Bilingue, dark.
- **`lib/dga/trends.ts`** : à partir de l'historique `dga_analyses` d'un actif, séries temporelles par gaz + TDCG + taux de génération (utilise `gasRatePerDay`).
- **`components/dga/Trends.tsx`** : graphiques d'évolution (recharts est déjà dans le projet — vérifier `package.json` ; sinon SVG simple).
- **`lib/dga/report.ts`** : rapport PDF pro via jsPDF — en-tête logo tenant (`company_settings.logo_url` sinon `/c-secur360-logo.png`), tableau gaz vs limites IEEE C57.104, condition, zone Duval + image du triangle, méthodes (Rogers/IEC/Key gas), recommandations, pied de page. Bouton « Rapport PDF » à exposer (coordonne l'insertion dans la page avec le patron si besoin).

Après la tâche : « Agent 2 a terminé #90 » pour merge. Garde ≥2 tâches.
