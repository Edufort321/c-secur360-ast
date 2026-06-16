-- 189: CORRECTIF — la politique RLS de dashboard_archived_anomalies (migration 134) était
-- « FOR ALL USING (true) » SANS « WITH CHECK » -> PostgreSQL REFUSE les INSERT/UPSERT (le USING ne
-- couvre pas l'insertion). Conséquence : l'archivage d'une anomalie échouait SILENCIEUSEMENT et les
-- anomalies « revenaient toujours » au rechargement. On ajoute WITH CHECK (true). Idempotent.

DROP POLICY IF EXISTS dash_archived_access ON dashboard_archived_anomalies;
CREATE POLICY dash_archived_access ON dashboard_archived_anomalies FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('189') on conflict (version) do nothing;
