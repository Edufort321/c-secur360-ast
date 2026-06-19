-- 249 — MODULE HSE : SEED réglementaire (CNESST + RIDDOR) + catalogue de registres.
-- À exécuter APRÈS 248. Référentiels GLOBAUX (non scopés tenant).
-- ⚠️ DONNÉES JURIDIQUES À VALIDER par un conseiller SST avant production. Sources (juin 2026) :
--   • CNESST : LSST art. 62 — avis « par le moyen le plus rapide » (notify=0h) + rapport écrit 24h ;
--     seuil dommages matériels = 215 749 $ (VALEUR INDEXÉE ANNUELLEMENT → versionner via effective_from/to).
--   • RIDDOR 2013 : décès / blessures spécifiées / dangerous occurrences = sans délai + rapport 10 j (240h) ;
--     over-7-day = rapport 15 j (360h) depuis la date de l'accident.
-- Délais en HEURES (0 = « sans délai / immédiat » → l'UI affiche « immédiat », pas « 0 h »). 10 j=240, 15 j=360.

insert into public.hse_regulatory_framework (code, name_fr, name_en, jurisdiction) values
  ('CNESST_QC', 'CNESST (Québec)', 'CNESST (Quebec)', 'QC'),
  ('RIDDOR_UK', 'RIDDOR 2013 (Royaume-Uni)', 'RIDDOR 2013 (UK)', 'UK')
on conflict (code) do nothing;

-- CNESST (LSST art. 62)
with f as (select id from public.hse_regulatory_framework where code = 'CNESST_QC')
insert into public.hse_deadline_rule
  (framework_id, event_code, label_fr, label_en, notify_within_hours, report_within_hours, clock_starts,
   threshold_amount, threshold_currency, legal_reference, effective_from)
select f.id, v.event_code, v.label_fr, v.label_en, v.notify_h, v.report_h, v.clock, v.amount, v.cur, v.ref, v.eff
from f, (values
  ('FATALITY', 'Décès d''un travailleur', 'Worker fatality', 0, 24, 'incident', null::numeric, 'CAD', 'LSST art. 62', date '2000-01-01'),
  ('SPECIFIED_INJURY', 'Perte/usage d''un membre ou traumatisme physique important', 'Loss/use of a limb or major physical trauma', 0, 24, 'incident', null, 'CAD', 'LSST art. 62', date '2000-01-01'),
  ('MULTI_WORKER_INJURY', 'Blessures à plusieurs travailleurs (absence > 1 jour ouvrable)', 'Injuries to several workers (absence > 1 working day)', 0, 24, 'incident', null, 'CAD', 'LSST art. 62', date '2000-01-01'),
  ('MATERIAL_DAMAGE', 'Dommages matériels importants', 'Significant material damage', 0, 24, 'incident', 215749, 'CAD', 'LSST art. 62', date '2024-01-01')
) as v(event_code,label_fr,label_en,notify_h,report_h,clock,amount,cur,ref,eff)
on conflict (framework_id, event_code, effective_from) do nothing;

-- RIDDOR 2013
with f as (select id from public.hse_regulatory_framework where code = 'RIDDOR_UK')
insert into public.hse_deadline_rule
  (framework_id, event_code, label_fr, label_en, notify_within_hours, report_within_hours, clock_starts,
   threshold_amount, legal_reference, effective_from)
select f.id, v.event_code, v.label_fr, v.label_en, v.notify_h, v.report_h, v.clock, null, v.ref, date '2013-10-01'
from f, (values
  ('FATALITY', 'Décès (notification sans délai, rapport 10 j)', 'Death (notify without delay, report within 10 days)', 0, 240, 'incident', 'RIDDOR reg. 4'),
  ('SPECIFIED_INJURY', 'Blessure spécifiée (Schedule 1)', 'Specified injury (Schedule 1)', 0, 240, 'incident', 'RIDDOR Sch. 1'),
  ('DANGEROUS_OCCURRENCE', 'Dangerous occurrence (Schedule 2)', 'Dangerous occurrence (Schedule 2)', 0, 240, 'incident', 'RIDDOR Sch. 2'),
  ('OCC_DISEASE', 'Maladie professionnelle (au diagnostic)', 'Occupational disease (on diagnosis)', 0, 240, 'awareness', 'RIDDOR reg. 8/9'),
  ('NON_WORKER_HOSPITAL', 'Hospitalisation d''un non-travailleur', 'Non-worker taken to hospital', 0, 240, 'incident', 'RIDDOR reg. 5'),
  ('OVER_7_DAY', 'Incapacité > 7 jours (rapport 15 j depuis l''accident)', 'Over-7-day incapacitation (report within 15 days of accident)', null, 360, 'incident', 'RIDDOR reg. 4(2)')
) as v(event_code,label_fr,label_en,notify_h,report_h,clock,ref)
on conflict (framework_id, event_code, effective_from) do nothing;

-- Catalogue de types de registres (FR/EN ; field_schema = champs dynamiques du form builder).
insert into public.hse_register_type (code, name_fr, name_en, framework_id, default_review_months, field_schema, icon) values
  ('TRAINING', 'Registre des formations', 'Training register', null, 12,
   '[{"key":"worker","label_fr":"Travailleur","label_en":"Worker","type":"text"},{"key":"course","label_fr":"Formation","label_en":"Course","type":"text"},{"key":"completed_at","label_fr":"Date","label_en":"Date","type":"date"},{"key":"expires_at","label_fr":"Expiration","label_en":"Expiry","type":"date"}]'::jsonb, 'graduation-cap'),
  ('PPE', 'Registre des EPI remis', 'PPE issue register', null, 12,
   '[{"key":"worker","label_fr":"Travailleur","label_en":"Worker","type":"text"},{"key":"item","label_fr":"Équipement","label_en":"Item","type":"text"},{"key":"issued_at","label_fr":"Date de remise","label_en":"Issued","type":"date"}]'::jsonb, 'shield'),
  ('NON_CONFORMITY', 'Registre des non-conformités', 'Non-conformity register', null, null,
   '[{"key":"category","label_fr":"Catégorie","label_en":"Category","type":"select"},{"key":"severity","label_fr":"Sévérité","label_en":"Severity","type":"select"},{"key":"action","label_fr":"Action corrective","label_en":"Corrective action","type":"text"}]'::jsonb, 'alert-triangle'),
  ('ASBESTOS_QC', 'Registre amiante', 'Asbestos register', null, 12,
   '[{"key":"location","label_fr":"Localisation","label_en":"Location","type":"text"},{"key":"material","label_fr":"Matériau","label_en":"Material","type":"text"},{"key":"condition","label_fr":"État","label_en":"Condition","type":"select"}]'::jsonb, 'biohazard'),
  ('SIMDUT', 'Registre SIMDUT 2015', 'WHMIS 2015 register', null, 36,
   '[{"key":"product","label_fr":"Produit","label_en":"Product","type":"text"},{"key":"sds_ref","label_fr":"Réf. FDS","label_en":"SDS ref","type":"text"},{"key":"sds_date","label_fr":"Date FDS","label_en":"SDS date","type":"date"}]'::jsonb, 'flask'),
  ('LIFTING_CSA', 'Inspection appareils de levage (CSA)', 'Lifting equipment inspection (CSA)', null, 12,
   '[{"key":"equipment","label_fr":"Appareil","label_en":"Equipment","type":"text"},{"key":"serial","label_fr":"N° série","label_en":"Serial","type":"text"},{"key":"last_inspection","label_fr":"Dernière inspection","label_en":"Last inspection","type":"date"}]'::jsonb, 'crane'),
  ('COSHH', 'COSHH register', 'COSHH register', (select id from public.hse_regulatory_framework where code='RIDDOR_UK'), 12,
   '[{"key":"substance","label_fr":"Substance","label_en":"Substance","type":"text"},{"key":"assessment_ref","label_fr":"Réf. évaluation","label_en":"Assessment ref","type":"text"}]'::jsonb, 'flask'),
  ('LOLER', 'LOLER (levage)', 'LOLER (lifting)', (select id from public.hse_regulatory_framework where code='RIDDOR_UK'), 6,
   '[{"key":"equipment","label_fr":"Équipement","label_en":"Equipment","type":"text"},{"key":"thorough_exam","label_fr":"Examen approfondi","label_en":"Thorough exam","type":"date"}]'::jsonb, 'crane'),
  ('PUWER', 'PUWER (équipements de travail)', 'PUWER (work equipment)', (select id from public.hse_regulatory_framework where code='RIDDOR_UK'), 12,
   '[{"key":"equipment","label_fr":"Équipement","label_en":"Equipment","type":"text"}]'::jsonb, 'cog'),
  ('FIRE_RISK', 'Évaluation risque incendie', 'Fire risk assessment', (select id from public.hse_regulatory_framework where code='RIDDOR_UK'), 12,
   '[{"key":"area","label_fr":"Zone","label_en":"Area","type":"text"}]'::jsonb, 'flame')
on conflict (code) do nothing;

insert into schema_migrations (version) values ('249') on conflict (version) do nothing;
