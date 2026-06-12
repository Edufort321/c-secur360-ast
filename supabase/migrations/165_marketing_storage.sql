-- 165 — Stockage des actifs marketing (images de modèle d'avatar, bibliothèque, vidéos d'avatar).
-- Bucket PUBLIC en LECTURE (les URLs publiques servent aux <img>/<video> et à l'API D-ID qui récupère
-- l'image), mais ÉCRITURE réservée au SERVEUR (service_role via les routes requireAdmin) — la clé anon
-- ne peut rien écrire (sécurité). Idempotent.
insert into storage.buckets (id, name, public)
values ('marketing', 'marketing', true)
on conflict (id) do update set public = true;

-- Lecture publique des objets du bucket (affichage + récupération par D-ID).
drop policy if exists "marketing public read" on storage.objects;
create policy "marketing public read" on storage.objects
  for select using (bucket_id = 'marketing');

-- Aucune policy d'INSERT/UPDATE/DELETE pour anon/authenticated : seules les routes serveur
-- (service_role) écrivent — elles contournent la RLS. La clé anon ne peut donc pas téléverser.
