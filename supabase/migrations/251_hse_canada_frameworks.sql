-- 251 — MODULE HSE : référentiels CANADIENS (toutes les provinces + territoires + fédéral).
-- Demande Eric : dans l'AST/KPI, ne garder QUE les normes canadiennes de toutes les provinces.
--  • Désactive RIDDOR_UK (is_active=false) → disparaît du sélecteur de norme (filtré sur is_active).
--  • Retire les types de registres propres au R.-U. (COSHH, LOLER, PUWER, FIRE_RISK).
--  • Ajoute le fédéral (Code canadien du travail, partie II) + les 12 autres juridictions
--    (CNESST_QC existe déjà via 249). Idempotent + auto-enregistré.
--
-- ⚠️ DONNÉES JURIDIQUES À VALIDER par un conseiller SST avant production. Constante PAN-CANADIENNE :
--    décès / blessure grave (« critique » ON, « serious » BC, etc.) = AVIS IMMÉDIAT au régulateur par
--    le moyen le plus rapide (notify=0h → l'UI affiche « immédiat »). Le délai du RAPPORT ÉCRIT varie :
--    ON 48 h (OHSA art. 51) · AB/BC ≈ 72 h (rapport WCB) · fédéral 24 h (RSSTC). Sources : juin 2026,
--    CCOHS « Injury Reporting », OHSA art. 51-53, WCA C.-B., OHS Act AB art. 33, RSSTC 15.5-15.8.
--    report_within_hours laissé NULL là où le délai écrit n'est pas confirmé (seul l'avis immédiat est généré).

-- 1) Désactiver le référentiel britannique (ne PAS le supprimer : préserve l'historique des incidents liés)
update public.hse_regulatory_framework set is_active = false where code = 'RIDDOR_UK';

-- 2) Retirer les types de registres propres au R.-U. (FK-safe : retirer d'abord les registres tenant
--    qui les référencent — les entrées en cascade via hse_register_entry.tenant_register_id).
delete from public.hse_tenant_register tr
 using public.hse_register_type rt
 where tr.register_type_id = rt.id and rt.code in ('COSHH', 'LOLER', 'PUWER', 'FIRE_RISK');
delete from public.hse_register_type where code in ('COSHH', 'LOLER', 'PUWER', 'FIRE_RISK');

-- 3) Ajouter les juridictions canadiennes (QC existe déjà)
insert into public.hse_regulatory_framework (code, name_fr, name_en, jurisdiction) values
  ('CA_FED', 'Code canadien du travail (fédéral)', 'Canada Labour Code (federal)', 'CA-FED'),
  ('OHS_AB', 'OHS Act — Alberta', 'OHS Act — Alberta', 'AB'),
  ('OHS_BC', 'Workers Compensation Act — Colombie-Britannique', 'Workers Compensation Act — British Columbia', 'BC'),
  ('OHS_MB', 'Workplace Safety and Health Act — Manitoba', 'Workplace Safety and Health Act — Manitoba', 'MB'),
  ('OHS_NB', 'OHS Act — Nouveau-Brunswick', 'OHS Act — New Brunswick', 'NB'),
  ('OHS_NL', 'OHS Act — Terre-Neuve-et-Labrador', 'OHS Act — Newfoundland and Labrador', 'NL'),
  ('OHS_NS', 'OHS Act — Nouvelle-Écosse', 'OHS Act — Nova Scotia', 'NS'),
  ('OHS_ON', 'LSST (OHSA) — Ontario', 'OHSA — Ontario', 'ON'),
  ('OHS_PE', 'OHS Act — Île-du-Prince-Édouard', 'OHS Act — Prince Edward Island', 'PE'),
  ('OHS_SK', 'Saskatchewan Employment Act (partie III) — Saskatchewan', 'Saskatchewan Employment Act (Part III) — Saskatchewan', 'SK'),
  ('OHS_NT', 'Safety Act (WSCC) — Territoires du Nord-Ouest', 'Safety Act (WSCC) — Northwest Territories', 'NT'),
  ('OHS_NU', 'Safety Act (WSCC) — Nunavut', 'Safety Act (WSCC) — Nunavut', 'NU'),
  ('OHS_YT', 'OHS Act (YWCHSB) — Yukon', 'OHS Act (YWCHSB) — Yukon', 'YT')
on conflict (code) do nothing;

-- 4) Règles d'échéance par juridiction. notify=0 (avis immédiat, PAN-CANADIEN). report_within_hours
--    documenté où confirmé (ON 48h, AB/BC 72h, fédéral 24h), NULL ailleurs (à valider par juridiction).
--    event_code : FATALITY (décès) · SPECIFIED_INJURY (blessure grave/spécifiée/critique — code déjà
--    sélectionnable dans le formulaire d'incident et compté dans le TRIR de la vue KPI).
insert into public.hse_deadline_rule
  (framework_id, event_code, label_fr, label_en, notify_within_hours, report_within_hours, clock_starts, legal_reference, effective_from)
select fw.id, v.event_code, v.label_fr, v.label_en, v.notify_h, v.report_h, 'incident', v.ref, date '2000-01-01'
from (values
  -- code, event,            label_fr,                                  label_en,                              notify, report, ref
  ('CA_FED','FATALITY',       'Décès — avis immédiat, rapport 24 h',      'Death — immediate notice, 24 h report', 0, 24,   'RSSTC 15.5-15.8 / CCT partie II'),
  ('CA_FED','SPECIFIED_INJURY', 'Blessure invalidante — avis immédiat',     'Disabling injury — immediate notice',   0, 24,   'RSSTC 15.5-15.8 / CCT partie II'),
  ('OHS_ON','FATALITY',       'Décès — avis immédiat, rapport écrit 48 h','Death — immediate notice, 48 h written report', 0, 48, 'OHSA art. 51'),
  ('OHS_ON','SPECIFIED_INJURY', 'Blessure critique — avis immédiat, rapport 48 h','Critical injury — immediate notice, 48 h report', 0, 48, 'OHSA art. 51'),
  ('OHS_AB','FATALITY',       'Décès — avis immédiat (OHS), rapport WCB 72 h','Death — immediate OHS notice, 72 h WCB report', 0, 72, 'OHS Act AB art. 33'),
  ('OHS_AB','SPECIFIED_INJURY', 'Incident potentiellement grave — avis immédiat','Potentially serious incident — immediate notice', 0, 72, 'OHS Act AB art. 33'),
  ('OHS_BC','FATALITY',       'Décès — avis immédiat WorkSafeBC, rapport 72 h','Death — immediate WorkSafeBC notice, 72 h report', 0, 72, 'WCA C.-B. art. 172/173'),
  ('OHS_BC','SPECIFIED_INJURY', 'Blessure grave — avis immédiat WorkSafeBC','Serious injury — immediate WorkSafeBC notice', 0, 72, 'WCA C.-B. art. 172/173'),
  ('OHS_MB','FATALITY',       'Décès — avis immédiat',                    'Death — immediate notice',              0, null, 'Workplace Safety and Health Act MB'),
  ('OHS_MB','SPECIFIED_INJURY', 'Blessure grave — avis immédiat',           'Serious injury — immediate notice',     0, null, 'Workplace Safety and Health Act MB'),
  ('OHS_NB','FATALITY',       'Décès — avis immédiat',                    'Death — immediate notice',              0, null, 'OHS Act NB'),
  ('OHS_NB','SPECIFIED_INJURY', 'Accident grave — avis immédiat',           'Serious accident — immediate notice',   0, null, 'OHS Act NB'),
  ('OHS_NL','FATALITY',       'Décès — avis immédiat',                    'Death — immediate notice',              0, null, 'OHS Act NL'),
  ('OHS_NL','SPECIFIED_INJURY', 'Blessure grave — avis immédiat',           'Serious injury — immediate notice',     0, null, 'OHS Act NL'),
  ('OHS_NS','FATALITY',       'Décès — avis immédiat',                    'Death — immediate notice',              0, null, 'OHS Act NS'),
  ('OHS_NS','SPECIFIED_INJURY', 'Blessure grave — avis immédiat',           'Serious injury — immediate notice',     0, null, 'OHS Act NS'),
  ('OHS_PE','FATALITY',       'Décès — avis immédiat',                    'Death — immediate notice',              0, null, 'OHS Act PE'),
  ('OHS_PE','SPECIFIED_INJURY', 'Blessure grave — avis immédiat',           'Serious injury — immediate notice',     0, null, 'OHS Act PE'),
  ('OHS_SK','FATALITY',       'Décès — avis immédiat',                    'Death — immediate notice',              0, null, 'Saskatchewan Employment Act, partie III'),
  ('OHS_SK','SPECIFIED_INJURY', 'Blessure grave (« serious injury ») — avis immédiat','Serious injury — immediate notice', 0, null, 'Saskatchewan Employment Act, partie III'),
  ('OHS_NT','FATALITY',       'Décès — avis immédiat (WSCC)',             'Death — immediate notice (WSCC)',       0, null, 'Safety Act NT (WSCC)'),
  ('OHS_NT','SPECIFIED_INJURY', 'Blessure grave — avis immédiat (WSCC)',    'Serious injury — immediate notice (WSCC)', 0, null, 'Safety Act NT (WSCC)'),
  ('OHS_NU','FATALITY',       'Décès — avis immédiat (WSCC)',             'Death — immediate notice (WSCC)',       0, null, 'Safety Act NU (WSCC)'),
  ('OHS_NU','SPECIFIED_INJURY', 'Blessure grave — avis immédiat (WSCC)',    'Serious injury — immediate notice (WSCC)', 0, null, 'Safety Act NU (WSCC)'),
  ('OHS_YT','FATALITY',       'Décès — avis immédiat (YWCHSB)',           'Death — immediate notice (YWCHSB)',     0, null, 'OHS Act YT (YWCHSB)'),
  ('OHS_YT','SPECIFIED_INJURY', 'Blessure grave — avis immédiat (YWCHSB)',  'Serious injury — immediate notice (YWCHSB)', 0, null, 'OHS Act YT (YWCHSB)')
) as v(code, event_code, label_fr, label_en, notify_h, report_h, ref)
join public.hse_regulatory_framework fw on fw.code = v.code
on conflict (framework_id, event_code, effective_from) do nothing;

insert into schema_migrations (version) values ('251') on conflict (version) do nothing;
