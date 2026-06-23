-- 263 — HSE causeries : multi-lignes (participants + points discutés) + enregistrement vocal/vidéo.
-- Demande Eric : pouvoir ajouter PLEIN DE LIGNES lors d'une causerie (liste de participants + points
-- abordés), et capturer la séance en AUDIO/VIDÉO (enregistrement navigateur) ou via un LIEN (séance
-- Teams/Zoom/Meet) + transcription. Donnée OPÉRATIONNELLE (pas de donnée santé) → bucket public, comme
-- 'incident-photos'. Idempotent + auto-enregistré. À coller dans l'éditeur SQL du BON projet, puis Run.

alter table public.hse_safety_meeting
  add column if not exists participants jsonb   not null default '[]'::jsonb,  -- [{name, role, present, signature}]
  add column if not exists points       jsonb   not null default '[]'::jsonb,  -- [{text}] — points/sujets abordés (multi-lignes)
  add column if not exists media         jsonb   not null default '[]'::jsonb,  -- [{kind:'audio'|'video'|'link', url, label, path}]
  add column if not exists meeting_url   text,                                  -- lien de séance (Teams/Zoom/Meet)
  add column if not exists transcript    text,                                  -- transcription (dictée vocale)
  add column if not exists duration_min  int;                                   -- durée de la causerie

-- Bucket PUBLIC pour les médias de causerie (audio/vidéo). 200 Mo (vidéo courte). Opérationnel — non santé.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hse-meetings', 'hse-meetings', true, 209715200,
        array['audio/webm','audio/ogg','audio/mpeg','audio/mp4','audio/wav',
              'video/webm','video/mp4','video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Policies storage : upload + lecture par anon (opérationnel, comme incident-photos). Idempotent.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='hse_meetings_insert') then
    create policy hse_meetings_insert on storage.objects for insert to anon, authenticated with check (bucket_id = 'hse-meetings');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='hse_meetings_select') then
    create policy hse_meetings_select on storage.objects for select to anon, authenticated using (bucket_id = 'hse-meetings');
  end if;
end $$;

insert into schema_migrations (version) values ('263') on conflict (version) do nothing;
