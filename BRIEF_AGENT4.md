# Brief Agent 4 (Incidents) — file mise à jour 2026-06-03

Zone : `app/[tenant]/accidents/**`, `app/[tenant]/near-miss/**`, `components/IncidentReport/**`,
`lib/incident*` (nouveau si besoin), migrations ≥127 (réservées incidents). NE PAS toucher
planner, timesheets, `app/[tenant]/admin/page.tsx`, inventaire, affiliation, `lib/*` partagés.

Règles : 1 commit atomique par tâche, build vert (`npx tsc --noEmit` puis `npx next build`,
stop `next dev` du worktree avant), messages ASCII préfixés du n°, push après chaque tâche.
Mobile soigné + bilingue (tr FR/EN depuis le header) + temps réel (`useRealtime`). Champs nombre `onFocus={e=>e.target.select()}`.

## File (priorité d'abord)

### #67, #71 (en cours) — terminer puis pousser.

### #80 — Module Actions correctives (CAPA) lié aux incidents
- Table (migration ≥127) `incident_actions` : id, tenant_id, incident_id, description, assignee (personnel), due_date, status (`a_faire|en_cours|fait|verifie`), priority, created_at.
- UI : créer/éditer/supprimer une action depuis le rapport d'incident ; vue liste filtrable (statut/responsable/échéance) ; badge en retard.
- Rappels d'échéance (visuels au minimum). RLS permissive `USING(true) WITH CHECK(true)`.

### #81 — Enquête causale d'incident (5 pourquoi + arbre des causes) + témoins/photos
- Section « Enquête » dans le rapport d'incident : 5 pourquoi (liste ordonnée), causes immédiates / fondamentales, facteurs contributifs, témoins (nom + déclaration), pièces jointes photos (upload Storage), signatures enquêteur + superviseur (nom + horodatage).
- Persister dans le rapport (colonnes/JSONB sur la table incident, migration si besoin). Alimente le CAPA (#80) et l'export réglementaire (#71).

Après chaque tâche : prévenir le patron « Agent 4 a terminé #X » pour merge. Garde ≥2 tâches en file.
