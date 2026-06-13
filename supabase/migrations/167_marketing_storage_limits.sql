-- 167 — Marketing Storage : garantit le bucket « marketing » + relève la limite de taille pour les VIDÉOS.
-- Les vidéos de fond et les rendus assemblés dépassent souvent la limite par défaut (50 Mo). On porte la
-- limite du bucket à 500 Mo et on autorise tous les types (images + vidéos). Idempotent.
--
-- IMPORTANT : la limite GLOBALE du projet (Dashboard > Project Settings > Storage > « Upload file size
-- limit ») plafonne celle du bucket. Si tes vidéos dépassent encore, relève AUSSI cette limite globale
-- dans le tableau de bord Supabase (elle n'est pas modifiable en SQL).

insert into storage.buckets (id, name, public, file_size_limit)
values ('marketing', 'marketing', true, 524288000)        -- 500 Mo
on conflict (id) do update
  set public = true,
      file_size_limit = greatest(coalesce(storage.buckets.file_size_limit, 0), 524288000),
      allowed_mime_types = null;                            -- tous types (images + vidéos)

-- Lecture publique (affichage <img>/<video> + récupération par D-ID). Écriture : URL signée serveur.
drop policy if exists "marketing public read" on storage.objects;
create policy "marketing public read" on storage.objects
  for select using (bucket_id = 'marketing');

NOTIFY pgrst, 'reload schema';
