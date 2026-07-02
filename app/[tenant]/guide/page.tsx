'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';
import { BackLink } from '@/components/BackLink';
import { useLanguage } from '@/contexts/LanguageContext';

// Guide / Mode d'emploi — description détaillée et BILINGUE (FR/EN, via le bouton langue du header) de
// l'ensemble des modules C-Secur360 et de leurs fonctionnalités. Page de référence (présentation,
// formation, support) destinée à un utilisateur non initié. Recherche + sections pliables.

type Mod = {
  key: string; icon: string;
  titleFr: string; titleEn: string;
  taglineFr: string; taglineEn: string;
  featuresFr: string[]; featuresEn: string[];
};

const MODULES: Mod[] = [
  {
    key: 'ast', icon: '🦺',
    titleFr: 'AST / Sécurité', titleEn: 'JSA / Safety',
    taglineFr: "Remplir une analyse sécuritaire de tâche complète, la faire signer par l'équipe et la partager par QR — même sans compte.",
    taglineEn: 'Fill out a complete job safety analysis, get the crew to sign it, and share it by QR — even without an account.',
    featuresFr: [
      "Deux modèles : « Simple » (dangers et mesures rapides) ou « Complet ✦ » qui ajoute l'onglet Énergie/Cadenassage (LOTO) et des mesures de contrôle pré-remplies selon chaque danger.",
      "Infos générales : n° et nom de projet, lieu, département, entrepreneur, superviseur (+ certification), date, durée, nombre de travailleurs, type de tâche, équipements, description ; projet/entrepreneur/superviseur via répertoire, le projet auto-remplit nom et lieu.",
      "Décomposez le travail en étapes et cochez, par étape, les dangers d'un catalogue rangé par famille (chutes, mécanique, thermique/chimique, électrique, ergonomie, espace clos, incendie, biologique/psychosocial, intempéries…) avec notes libres.",
      "Mesures de contrôle par étape selon la hiérarchie (élimination, substitution, ingénierie, administratif, EPI) ; en mode Complet, les mesures normées sont pré-remplies.",
      "Évaluation du risque avant/après via matrice probabilité × gravité (1 à 5) → score coloré (Faible/Moyen/Élevé/Critique), responsable et case « vérifié superviseur » par étape.",
      "Sélection des EPI dans une liste normée (casque CSA Z94.1, harnais CSA Z259, chaussures CSA Z195…) avec spécification.",
      "Cadenassage / LOTO (mode Complet) : gabarits réutilisables, description de chaque source d'énergie (type, magnitude, méthode d'isolation, vérifiée par, case « Isolée ✓ »), photos par état, registre des cadenas et vérification d'absence d'énergie.",
      "Registre des travailleurs : nom, rôle, entreprise, contact d'urgence, certifications (RCR/DEA, espace clos, SIMDUT, hauteur…), check-in/out et QR d'identité par travailleur.",
      "Prise de connaissance d'équipe (causerie) : chaque participant coche sa lecture/acceptation avec engagement horodaté ; compteur de confirmations.",
      "Conformité provinciale : choix parmi 10 provinces affichant la réglementation applicable (RSST/LSST-CNESST au QC, OHSA en ON…) ; numéro unique automatique AST-{TENANT}-{DATE}-{CODE}.",
      "Suivi du % de remplissage en continu, sauvegarde auto (toutes les 2 s + copie locale), statuts brouillon → approuver/activer → compléter/archiver.",
      "Statut du superviseur (approuvé / correctif / non-conformité) : la non-conformité EXIGE une explication (≥ 10 caractères) et une pièce justificative avant finalisation.",
      "Partage sans compte : QR + lien public en lecture seule pour consulter, télécharger le PDF et cocher sa prise de connaissance ; export PDF stylé, JSON et impression. Rattachable à un projet.",
    ],
    featuresEn: [
      'Two templates: “Simple” (quick hazards and controls) or “Complete ✦”, which adds the Energy/Lockout (LOTO) tab and pre-filled control measures for each hazard.',
      'General info: project number and name, location, department, contractor, supervisor (+ certification), date, duration, number of workers, task type, equipment, description; project/contractor/supervisor from the directory, with the project auto-filling name and location.',
      'Break the work into steps and, per step, check hazards from a catalog grouped by family (falls, mechanical, thermal/chemical, electrical, ergonomics, confined space, fire, biological/psychosocial, weather…) with free notes.',
      'Control measures per step following the hierarchy of controls (elimination, substitution, engineering, administrative, PPE); in Complete mode, standard measures are pre-filled.',
      'Before/after risk rating via a probability × severity matrix (1 to 5) → color-coded score (Low/Medium/High/Critical), owner and a “supervisor verified” checkbox per step.',
      'PPE selection from a standards-based list (CSA Z94.1 hard hat, CSA Z259 harness, CSA Z195 footwear…) with specification.',
      'Lockout / LOTO (Complete mode): reusable templates, description of each energy source (type, magnitude, isolation method, verified by, “Isolated ✓” checkbox), photos per state, lock registry and zero-energy verification.',
      'Worker registry: name, role, company, emergency contact, certifications (CPR/AED, confined space, WHMIS, heights…), check-in/out and an identity QR per worker.',
      'Team acknowledgement (toolbox talk): each participant checks their reading/acceptance with a timestamped commitment; confirmation counter.',
      'Provincial compliance: choice among 10 provinces showing the applicable regulation (RSST/LSST-CNESST in QC, OHSA in ON…); automatic unique number JSA-{TENANT}-{DATE}-{CODE}.',
      'Live completion percentage, auto-save (every 2 s + local copy), statuses draft → approve/activate → complete/archive.',
      'Supervisor verdict (approved / corrective / non-conformity): a non-conformity REQUIRES an explanation (≥ 10 characters) and supporting evidence before finalizing.',
      'Account-free sharing: QR + read-only public link to view, download the PDF and check your own acknowledgement; styled PDF export, JSON and print. Can be linked to a project.',
    ],
  },
  {
    key: 'hse', icon: '🛡️',
    titleFr: 'Santé et sécurité (registres & KPI)', titleEn: 'Health & Safety (registers & KPIs)',
    taglineFr: "Votre tour de contrôle SST : indicateurs de performance, registres réglementaires, incidents et causeries — alimentés automatiquement.",
    taglineEn: 'Your HSE control tower: performance indicators, regulatory registers, incidents and toolbox talks — fed automatically.',
    featuresFr: [
      "Tableau de bord KPI qui calcule seul vos taux réglementaires : LTIFR (accidents avec arrêt), TRIR (enregistrables), DART et taux de gravité, selon la formule normalisée (nombre × base / heures travaillées, base 200 000 h par défaut). Période au choix (12 mois, année, tout).",
      "Deux grands compteurs « Jours sans accident » et « Jours sans passé proche » (même source que le module Accidents), avec remise à zéro et un mode « Diffuser (plein écran) » pour un écran d'usine.",
      "Les heures travaillées (dénominateur des taux) proviennent automatiquement des feuilles de temps ; vous pouvez ajouter des heures de sous-traitants ou des ajustements par semaine, avec note. Alerte si un mois a des incidents mais 0 heure (taux faussé).",
      "Onglet Incidents & accidents : la déclaration complète du module Accidents est intégrée ici ; chaque incident est classé dans l'un des codes réglementaires et alimente KPI et échéances sans double saisie.",
      "Cycle de vie des incidents (ISO 45001) : Ouvert → Enquête → Actions correctives → Clôturé, avec cause racine (5 pourquoi / arbre des causes) et facteurs contributifs.",
      "Registre CAPA (actions correctives/préventives) par incident : responsable et échéance, retards en rouge, clôture d'une action exigeant une preuve de réalisation.",
      "Échéances réglementaires générées selon le cadre juridique choisi (fédéral + provinces) : liste « à traiter » avec bouton « Fait » estampillé, rappels courriel J-7/J-3/jour J/retard.",
      "Onglet Registres : registres activables (SIMDUT, certifications…), prochaine date de révision calculée, et import de candidats depuis d'autres modules (produits sans FDS de l'Inventaire, certifications de la RH).",
      "Onglet Causeries & observations : éditeur de causerie sécurité (TBM), participants du répertoire, case « présent » et signature par participant, export PDF avec feuille de présence ; dictée vocale, capture audio/vidéo, ou lien Teams/Zoom/Meet.",
      "Graphiques d'analyse : courbe des taux (avec cibles éditables), pyramide de Heinrich (1:29:300 avec alerte de sous-déclaration), incidents par type, indicateurs proactifs vs réactifs, et donut « Blessures par partie du corps » (agrégé/anonymisé, Loi 25).",
      "Analyse IA sur demande : agrégats anonymisés → points chauds, tendances, risques émergents et recommandations préventives priorisées.",
      "Bannières de conformité : produits chimiques sans fiche de données de sécurité et certifications expirées ou expirant sous 30 jours.",
      "Journal d'audit immuable (création/modification/suppression avec auteur et date), exports CSV et Scorecard PDF. Accès réservé au niveau administration.",
    ],
    featuresEn: [
      'A KPI dashboard that computes your regulatory rates on its own: LTIFR (lost-time), TRIR (recordable), DART and severity rate, using the standard formula (count × base / hours worked, default base 200,000 h). Period of your choice (12 months, year, all).',
      'Two large counters “Days without an accident” and “Days without a near-miss” (same source as the Accidents module), with reset and a “Broadcast (full screen)” mode for a plant display.',
      'Hours worked (the rate denominator) come automatically from timesheets; you can add subcontractor hours or weekly adjustments with a note. Alert if a month has incidents but 0 hours (skewed rate).',
      'Incidents & accidents tab: the full Accidents module reporting is embedded here; each incident is classified under a regulatory code and feeds KPIs and deadlines with no double entry.',
      'Incident lifecycle (ISO 45001): Open → Investigation → Corrective actions → Closed, with root cause (5 whys / cause tree) and contributing factors.',
      'CAPA registry (corrective/preventive actions) per incident: owner and due date, overdue in red, closing an action requiring proof of completion.',
      'Regulatory deadlines generated from the chosen legal framework (federal + provinces): a “to do” list with a stamped “Done” button, email reminders D-7/D-3/due day/overdue.',
      'Registers tab: enableable registers (WHMIS, certifications…), computed next review date, and import of candidates from other modules (chemicals without SDS from Inventory, certifications from HR).',
      'Toolbox talks & observations tab: safety talk (TBM) editor, participants from the directory, “present” checkbox and per-participant signature, PDF export with attendance sheet; voice dictation, audio/video capture, or Teams/Zoom/Meet link.',
      'Analysis charts: rate trend (with editable targets), Heinrich pyramid (1:29:300 with under-reporting alert), incidents by type, leading vs lagging indicators, and an “Injuries by body part” donut (aggregated/anonymized, Quebec Law 25).',
      'On-demand AI analysis: anonymized aggregates → hot spots, trends, emerging risks and prioritized preventive recommendations.',
      'Compliance banners: chemicals without a safety data sheet and certifications expired or expiring within 30 days.',
      'Immutable audit log (create/edit/delete with author and date), CSV and PDF Scorecard exports. Access restricted to the administration level.',
    ],
  },
  {
    key: 'permits', icon: '📄',
    titleFr: 'Permis de travail', titleEn: 'Work permits',
    taglineFr: "Émettez et validez tous vos permis à haut risque — espace clos, travail à chaud, hauteur… — avec analyse IA, normes provinciales et signature électronique.",
    taglineEn: 'Issue and validate all your high-risk permits — confined space, hot work, heights… — with AI analysis, provincial standards and e-signature.',
    featuresFr: [
      "8 types de permis prêts à l'emploi : Espace clos, Travail à chaud, LOTO (cadenassage), Travail électrique, Travail en hauteur, Excavation, Matières dangereuses, Tuyauterie/Pression — chacun avec son formulaire dédié.",
      "Sélecteur de province (QC, ON, BC, AB, SK, MB, NB, NS, PE, NL) : charge automatiquement l'autorité (CNESST, WorkSafeBC, MOL…) et les articles applicables.",
      "Registre d'espaces clos : caractérisez chaque espace une fois (dimensions avec calcul de volume, contenu, dangers atmosphériques/physiques, ventilation) ; le système génère un code d'espace (EC-XXXXX) et un QR imprimable à coller sur place.",
      "Conseiller IA d'espace clos : à partir de la caractérisation, l'IA propose niveau de risque, dangers, moyens de contrôle, plan de sauvetage et intervalle de retest — un pré-remplissage que vous validez.",
      "Moteur atmosphérique en direct : à la saisie des lectures (O₂, LIE/LEL, H₂S, CO), une bannière affiche « ATMOSPHÈRE CONFORME — entrée permise » (vert) avec compte à rebours jusqu'au prochain test, « NE PAS ENTRER · VENTILER » (rouge) ou « REPRISE REQUISE » si le délai est dépassé.",
      "Registre des entrants et surveillants avec minuteries : chaque personne (depuis le répertoire, avec badge de formation à jour/expirée) ; Entrer/Sortir/Ré-entrer, chrono de présence par personne, cumul, alerte après 4 h, et avertissement si aucun surveillant en poste.",
      "Cycle de vie et signature : brouillon → en attente → approuvé → actif → fermé ; l'activation exige une liste de vérification pré-entrée en 7 points ; le superviseur approuve par signature manuscrite (au doigt) ; la fermeture est bloquée tant qu'un entrant est à l'intérieur.",
      "Auto-enregistrement par QR (sans connexion) : un travailleur scanne le QR du chantier, voit l'état du permis, les lectures et les entrants, et peut « Enregistrer entrée/sortie » lui-même.",
      "Liste, filtres et statistiques : compteurs (Total, Actifs, Brouillons, Complétés), filtres par statut/type, recherche, et barre de complétion par carte.",
      "Interconnexions : rattachement automatique à un projet, un permis peut mener à la déclaration d'un incident, le répertoire du personnel alimente l'autocomplétion et les alertes de formation.",
      "Export et sauvegarde : auto-sauvegarde toutes les 2 s, export JSON, export CSV du registre, impression ; numéros de permis générés automatiquement.",
    ],
    featuresEn: [
      'Eight ready-to-use permit types: Confined space, Hot work, LOTO (lockout), Electrical work, Work at heights, Excavation, Hazardous materials, Piping/Pressure — each with its own form.',
      'Province selector (QC, ON, BC, AB, SK, MB, NB, NS, PE, NL): automatically loads the authority (CNESST, WorkSafeBC, MOL…) and applicable clauses.',
      'Confined-space registry: characterize each space once (dimensions with volume calculation, contents, atmospheric/physical hazards, ventilation); the system generates a space code (CS-XXXXX) and a printable QR to post on site.',
      'Confined-space AI advisor: from the characterization, the AI suggests risk level, hazards, controls, rescue plan and retest interval — a pre-fill you validate.',
      'Live atmospheric engine: as readings (O₂, LEL, H₂S, CO) are entered, a banner shows “ATMOSPHERE OK — entry permitted” (green) with a countdown to the next test, “DO NOT ENTER · VENTILATE” (red), or “RETEST REQUIRED” if the interval lapses.',
      'Entrant and attendant registry with timers: each person (from the directory, with an up-to-date/expired training badge); Enter/Exit/Re-enter, per-person presence timer, cumulative time, alert after 4 h, and a warning if no attendant is on duty.',
      'Lifecycle and signature: draft → pending → approved → active → closed; activation requires a 7-point pre-entry checklist; the supervisor approves with a handwritten (finger) signature; closing is blocked while an entrant is inside.',
      'QR self-registration (no login): a worker scans the on-site QR, sees the permit status, readings and entrants, and can “Register entry/exit” themselves.',
      'List, filters and stats: counters (Total, Active, Drafts, Completed), status/type filters, search, and a completion bar per card.',
      'Interconnections: automatic linking to a project, a permit can lead to an incident report, and the personnel directory feeds autocompletion and training alerts.',
      'Export and save: auto-save every 2 s, JSON export, CSV export of the registry, print; permit numbers generated automatically.',
    ],
  },
  {
    key: 'accidents', icon: '🚨',
    titleFr: 'Accidents et incidents', titleEn: 'Accidents & incidents',
    taglineFr: "Déclarez tout événement — accident, passé proche, véhicule, dommage, maladie — avec verdict CNESST automatique, assistance IA et schéma corporel.",
    taglineEn: 'Report any event — accident, near-miss, vehicle, damage, illness — with automatic CNESST verdict, AI assistance and a body diagram.',
    featuresFr: [
      "5 types d'événements : accident de travail, passé proche, accident de véhicule, dommages matériels, maladie professionnelle ; chaque rapport reçoit un numéro préfixé (AT, PP, VH, INC) avec l'année.",
      "Rapport structuré en 11 sections indiquant qui doit remplir chacune : Général, Lieu (météo, éclairage), Blessés, Schéma corporel, Description, Véhicule/dommages, Analyse, Actions correctives, Suivi CAPA, Réglementation, Approbation.",
      "Verdict CNESST automatique : bannière rouge « DÉCLARABLE sous 24 h » ou verte « Non déclarable — Registre obligatoire », avec les raisons (décès, membre, trauma majeur, plusieurs travailleurs, dommages > seuil) ; le même verdict figure dans le PDF.",
      "Assistance IA (Loi 25, aucun nom transmis) : « Corriger (IA) » et dictée vocale ; analyse « 5 pourquoi » jusqu'à la cause racine ; « Recommandations IA » (3 à 6 actions classées par hiérarchie des contrôles) ; traduction FR/EN pour un PDF bilingue.",
      "Schéma corporel cliquable : sélectionnez les zones blessées sur une silhouette (face/dos, visage, mains/doigts, pieds/orteils) ; les zones s'impriment en rouge dans le PDF, par personne.",
      "Personnes blessées et témoins : par blessé — type de blessure, traitement (premiers soins → hôpital), temps perdu (jours + date de retour), travail léger/transfert (compte dans le taux DART), décès ; noms depuis le répertoire ou en saisie libre.",
      "Conformité des 13 juridictions canadiennes : autorité, délai de déclaration et formulaire requis (ex. WSIB Formulaire 7, WCB C040) selon la province.",
      "Photos et signatures : téléversement de photos de scène (bucket sécurisé), signatures d'enquête et approbation à trois niveaux (superviseur, responsable HSE, direction), horodatées.",
      "Compteur « jours sans accident » et affichage plein écran (auto-rafraîchi, logo de l'entreprise) — idéal pour un écran d'atelier ; repart à zéro quand un rapport est finalisé.",
      "Suivi CAPA et non-conformités : actions correctives suivies (priorité, échéance, statut, alerte en retard) ; les incidents non fermés remontent au panneau « Non-conformités & anomalies » du tableau de bord.",
      "Cycle de vie et export : brouillon → soumis (lecture seule, auto-sauvegarde) → fermé ; révision archivant l'ancienne version ; export PDF sur le letterhead maison, en même langue ou traduit par IA.",
      "Interconnexions : fusionné dans le module HSE (onglet Incidents & accidents) — chaque rapport nourrit les KPI de sécurité et les échéances ; se déclenche depuis un AST, lie personnel, véhicules et site.",
    ],
    featuresEn: [
      'Five event types: work accident, near-miss, vehicle accident, property damage, occupational illness; each report gets a prefixed number (AT, PP, VH, INC) with the year.',
      'Report structured in 11 sections indicating who should fill each: General, Location (weather, lighting), Injured, Body diagram, Description, Vehicle/damage, Analysis, Corrective actions, CAPA follow-up, Regulation, Approval.',
      'Automatic CNESST verdict: a red “REPORTABLE within 24 h” banner or a green “Not reportable — Register required”, with reasons (death, limb, major trauma, multiple workers, damage > threshold); the same verdict appears in the PDF.',
      'AI assistance (Law 25, no names sent): “Fix (AI)” and voice dictation; “5 whys” analysis to the root cause; “AI recommendations” (3 to 6 actions ranked by hierarchy of controls); FR/EN translation for a bilingual PDF.',
      'Clickable body diagram: select injured areas on a silhouette (front/back, face, hands/fingers, feet/toes); the areas print in red in the PDF, per person.',
      'Injured persons and witnesses: per injured — injury type, treatment (first aid → hospital), lost time (days + return date), light duty/transfer (counts in the DART rate), fatality; names from the directory or free entry.',
      'Compliance across the 13 Canadian jurisdictions: authority, reporting deadline and required form (e.g. WSIB Form 7, WCB C040) by province.',
      'Photos and signatures: upload of scene photos (secure bucket), investigation signatures and three-level approval (supervisor, HSE lead, management), timestamped.',
      'A “days without an accident” counter and full-screen display (auto-refresh, company logo) — ideal for a shop screen; resets when a report is finalized.',
      'CAPA and non-conformity tracking: tracked corrective actions (priority, due date, status, overdue alert); unclosed incidents surface in the dashboard’s “Non-conformities & anomalies” panel.',
      'Lifecycle and export: draft → submitted (read-only, auto-save) → closed; a revision archives the previous version; PDF export on the house letterhead, in the same language or AI-translated.',
      'Interconnections: merged into the HSE module (Incidents & accidents tab) — each report feeds the safety KPIs and deadlines; triggered from a JSA, links personnel, vehicles and site.',
    ],
  },
  {
    key: 'inspections', icon: '🔧',
    titleFr: "Inspections d'équipement", titleEn: 'Equipment inspections',
    taglineFr: "Chaque équipement inspecté selon sa norme, avec verdict conforme/non-conforme, photos et QR — le mauvais matériel sort automatiquement du service.",
    taglineEn: 'Every piece of equipment inspected to its standard, with pass/fail verdict, photos and QR — bad equipment is taken out of service automatically.',
    featuresFr: [
      "Page tableau listant tous vos équipements en cartes (photo, dernière inspection, nombre d'inspections) avec un moteur d'urgence qui calcule les jours restants selon la fréquence et classe en retard / bientôt / OK / non inspecté.",
      "Tuiles KPI : total d'équipements, en retard, à venir, non conformes ; recherche, filtre par type et filtre global par site.",
      "Fiche d'équipement : type, nom, numéro de série, emplacement/chantier, province canadienne (affiche l'organisme et la référence légale, ex. Québec → CNESST/RSST), inspecteur (répertoire du personnel, avec alerte « formation expirée »), fréquence, et photos multiples.",
      "11 gabarits de checklist pré-montés selon les normes réelles : harnais (CSA Z259), chariot élévateur (CSA B335), nacelle/PEMP, échafaudage, échelle, outils électriques, extincteur (NFPA 10), détecteur de gaz, protection respiratoire, EPI général, pré-départ de véhicule.",
      "Remplissage à trois états par point : ✓ conforme / ✗ non conforme / S.O., cibles tactiles de 44 px (utilisable avec des gants) ; un point échoué ouvre une note de défaut + photo. Chaque point porte des drapeaux « critique » et « retrait de service ».",
      "Points additionnels personnalisés ajoutables à la volée en plus du gabarit standard.",
      "Moteur de verdict automatique : un échec « retrait » → RETRAIT IMMÉDIAT ; un échec critique → non conforme ; un autre échec → conditionnel ; tout répondu sans échec → conforme.",
      "Interconnexion clé : un verdict « retrait » met l'équipement hors service automatiquement, un verdict « conforme » le réactive.",
      "Section non-conformités et actions correctives : liste des défauts (description, responsable, échéance) avec case « utilisation autorisée jusqu'à l'échéance » pour les cas critiques.",
      "Numéro d'inspection auto (INS-{année}-{NNN}), brouillon ou soumise, date de prochaine échéance calculée.",
      "Code QR imprimable (avec logo) vers la page publique de l'équipement/inspection : un passant scanne et voit un « certificat » en lecture seule (statut coloré, photos, non-conformités, prochaine échéance).",
      "Historique jusqu'à 30 inspections antérieures du même équipement ; exports PDF (avec logo, filtrable par type) et CSV Excel-FR.",
      "Constructeur de formulaires personnalisés (côté Maintenance) : vos propres gabarits en sections + items typés (conforme/non-conforme, oui/non, texte, nombre, date, liste, photo), duplication de gabarit ; les anomalies créent automatiquement des actions correctives.",
    ],
    featuresEn: [
      'A table page listing all your equipment as cards (photo, last inspection, inspection count) with an urgency engine that computes days remaining from each item’s frequency and sorts into overdue / soon / OK / never inspected.',
      'KPI tiles: total equipment, overdue, upcoming, non-compliant; search, filter by type and a global site filter.',
      'Equipment sheet: type, name, serial number, location/site, Canadian province (shows the authority and legal reference, e.g. Quebec → CNESST/RSST), inspector (personnel directory, with an “expired training” alert), frequency, and multiple photos.',
      'Eleven pre-built checklist templates based on real standards: harness (CSA Z259), forklift (CSA B335), aerial lift/MEWP, scaffold, ladder, power tools, fire extinguisher (NFPA 10), gas detector, respiratory protection, general PPE, vehicle pre-trip.',
      'Three-state marking per checkpoint: ✓ pass / ✗ fail / N/A, 44px touch targets (usable with gloves); a failed point opens a defect note + photo. Each point carries “critical” and “remove from service” flags.',
      'Custom extra checkpoints can be added on the fly on top of the standard template.',
      'Automatic verdict engine: a “remove” failure → IMMEDIATE REMOVAL; a critical failure → non-compliant; any other failure → conditional; all answered with no failure → compliant.',
      'Key interconnection: a “remove” verdict takes the equipment out of service automatically, a “compliant” verdict reactivates it.',
      'Non-conformities and corrective actions section: list of defects (description, owner, due date) with a “use authorized until due date” checkbox for critical cases.',
      'Automatic inspection number (INS-{year}-{NNN}), draft or submitted, with a computed next-due date.',
      'Printable QR code (with logo) to the public equipment/inspection page: a passer-by scans and sees a read-only “certificate” (color-coded status, photos, non-conformities, next due date).',
      'History of up to 30 prior inspections of the same equipment; PDF (with logo, filterable by type) and Excel-FR CSV exports.',
      'Custom form builder (in the Maintenance module): your own templates in sections + typed items (pass/fail, yes/no, text, number, date, list, photo), template duplication; anomalies automatically create corrective actions.',
    ],
  },
  {
    key: 'maintenance', icon: '🛠️',
    titleFr: "Maintenance d'équipement (GMAO)", titleEn: 'Equipment maintenance (CMMS)',
    taglineFr: "Gabarit → client → inspection → tableau de bord : un flux léger qui suit vos équipements, calcule les échéances récurrentes et prévient vos clients.",
    taglineEn: 'Template → client → inspection → dashboard: a lightweight flow that tracks your equipment, computes recurring due dates and notifies your clients.',
    featuresFr: [
      "Arborescence Client → Site → Emplacement → Type → Équipement : chaque client est une carte dépliable (compte d'équipements et de projets) ; regroupement par site, emplacement ou type, et section « équipements non assignés ».",
      "Le module n'affiche que les équipements qu'il « possède » (créés ici ou importés), avec des badges de provenance (DGA / Véhicule / Planificateur / Rapport terrain).",
      "Fiche d'équipement : nom, numéro de série, marque, modèle, type, emplacement, récurrence, client, site ; un menu par ligne permet de réassigner un équipement à un autre client sans ouvrir la fiche.",
      "Gabarits dupliquables : un modèle de rapport fait de blocs (section, points d'inspection, mesures, photos, note) ; créez-le vierge ou depuis un modèle pré-monté ; l'onglet gabarits embarque le moteur complet de rapports (import IA, brouillons, partage).",
      "Lancer une inspection depuis un gabarit : à partir d'une ligne d'équipement, du tableau de planification ou d'une alerte ; choisissez l'équipement puis le gabarit. Le bouton « Inspecter » est bloqué tant qu'aucun gabarit n'existe.",
      "Remplissage d'inspection : points OK/Anomalie ; une anomalie ouvre description + case « Retrait de service » + photos ; verdict global calculé (retrait > non conforme > conforme) ; rattachable à un projet/soumission.",
      "Récurrence → échéances : fréquences quotidien à annuel ; à l'enregistrement d'un équipement, une échéance automatique est créée (prochaine date = dernière réalisation + intervalle), et chaque inspection fait rouler l'échéance vers l'avant.",
      "Tableau de planification : agrège les échéances de deux sources (maintenance et re-tests DGA), triées au plus proche, avec tuiles KPI (suivies, en retard, bientôt ≤ 30 j) et filtres période/source/statut/client ; actions par ligne « Inspecter », « Fait », « Prévenir ».",
      "Prévenir un client : construit un résumé de ses échéances et l'envoie par courriel (adresse résolue côté serveur, jamais par le navigateur).",
      "Configuration de notification par client : adresse d'alerte et opt-in « prévenir automatiquement » (désactivé par défaut, consentement Loi 25).",
      "Digest automatique quotidien (tâche planifiée sécurisée) : résumé En retard / À venir à l'opérateur, et à chaque client opté-in la liste de ses propres échéances.",
      "Impression de QR par équipement ou en lot, réutilisant le moteur d'étiquettes de l'Inventaire (formats Avery, aperçu/impression/PDF, copies multiples).",
      "Import d'équipements depuis 5 sources (DGA, Véhicules/Flotte, Planificateur, Rapports terrain, équipements existants « réclamés »), avec déduplication.",
      "Historique et statut unifiés par équipement (inspections + rapports + mesures DGA) alimentant les KPI (Équipements, Clients, Jamais inspectés, Anomalies) ; réglages Système (téléphone/courriel de support au scan, courriel d'alerte opérateur, digest, horizon).",
    ],
    featuresEn: [
      'Client → Site → Location → Type → Equipment tree: each client is an expandable card (equipment and project counts); grouping by site, location or type, and an “unassigned equipment” section.',
      'The module only shows equipment it “owns” (created here or imported), with source badges (DGA / Vehicle / Scheduler / Field report).',
      'Equipment sheet: name, serial number, make, model, type, location, recurrence, client, site; a per-row menu reassigns equipment to another client without opening the sheet.',
      'Duplicable templates: a report template made of blocks (section, inspection points, measurements, photos, note); create it blank or from a pre-built model; the templates tab embeds the full report engine (AI import, drafts, sharing).',
      'Launch an inspection from a template: from an equipment row, the planning board or an alert; pick the equipment then the template. The “Inspect” button is blocked until a template exists.',
      'Inspection fill: OK/Anomaly points; an anomaly opens description + “Remove from service” checkbox + photos; computed overall verdict (remove > non-compliant > compliant); linkable to a project/quote.',
      'Recurrence → due dates: frequencies from daily to yearly; on saving equipment, an automatic due date is created (next date = last completion + interval), and each inspection rolls the due date forward.',
      'Planning board: aggregates due dates from two sources (maintenance and DGA retests), sorted by nearest, with KPI tiles (tracked, overdue, soon ≤ 30 days) and period/source/status/client filters; per-row actions “Inspect”, “Done”, “Notify”.',
      'Notify a client: builds a summary of their due dates and emails it (address resolved server-side, never by the browser).',
      'Per-client notification config: alert address and an “auto-notify” opt-in (off by default, Law 25 consent).',
      'Automatic daily digest (secure scheduled task): an Overdue / Upcoming summary to the operator, and to each opted-in client the list of their own due dates.',
      'QR printing per equipment or in batches, reusing the Inventory label engine (Avery formats, preview/print/PDF, multiple copies).',
      'Equipment import from 5 sources (DGA, Vehicles/Fleet, Scheduler, Field reports, existing “claimed” equipment), with deduplication.',
      'Unified per-equipment history and status (inspections + reports + DGA measurements) feeding the KPIs (Equipment, Clients, Never inspected, Anomalies); System settings (support phone/email shown on scan, operator alert email, digest, horizon).',
    ],
  },
  {
    key: 'projects', icon: '🏗️',
    titleFr: 'Projets', titleEn: 'Projects',
    taglineFr: "Le hub central : soumission → projet → coûts réels → facture, avec numérotation auto, marge et analyse IA, relié aux permis, à l'inventaire et à la paie.",
    taglineEn: 'The central hub: quote → project → actual costs → invoice, with auto numbering, margin and AI analysis, linked to permits, inventory and payroll.',
    featuresFr: [
      "Créer un projet avec numéro auto-généré (initiale entreprise + site + département tirés de l'Administration, année, séquence), régénérable, éditable en repli hors-ligne.",
      "Fiche projet : titre, client (recherche dynamique qui pré-remplit ville/province), statut (Sans soumission / Soumission / Vente / En cours / Facturé), type (Budgétaire/Forfaitaire), portée interne/externe, mode de prix ventilé/global, montant et n° de BC, dates.",
      "Soumissions : catalogue de taux centralisé (main-d'œuvre bureau/chantier, voyagement, subsistance, hébergement, matériaux), items et lignes, calcul automatique, majoration, révisions ; à l'acceptation la soumission devient un projet (n° S → P).",
      "Calculateur de ressources (durée + couverture → personnel/véhicules/subsistances), numérotation automatique par préfixe site/département, approbation par niveau, commission au vendeur (calculée côté serveur, salaires jamais exposés).",
      "Rattacher/détacher/transférer des soumissions à un projet, fixer une augmentation annuelle en % et voir la projection indexée sur 5 ans.",
      "Onglet Coûts : Estimé vs Coût réel CHARGÉ (fardeau main-d'œuvre), écart $/%, facturé, décomposition (main-d'œuvre, km, matériel, primes, dépenses), marge et barre d'avancement par coûts engagés.",
      "Coût réel agrégé automatiquement depuis les feuilles de temps (aucune double-saisie) : main-d'œuvre au taux de chaque employé, kilométrage, matériel, indemnités ; WIP calculé côté serveur.",
      "Facturation unifiée : base soumission (forfaitaire) ou temps réel (budgétaire), lignes cochables (surcharge carburant, dépenses refacturables, matériel inventaire au prix vendant), extras, TPS 5 % + TVQ 9,975 %, arrondi manuel, répartition en classes de revenu.",
      "Approuver la facture : numéro séquentiel unique côté serveur, remontée vers Facturation (statut « Traité »), constatation du revenu au grand livre, export PDF, réouverture en brouillon.",
      "Consommer du matériel de l'inventaire depuis le projet (recherche article, emplacement, quantité vs stock) — décrémente le stock ; historique des sorties.",
      "Import d'un bon de commande par IA (PDF/image) : extrait n° BC, montant, dates, profil client, pré-remplit sans écraser et joint le BC ; pièces jointes manuelles (BC, contrat, devis, plans, courriels).",
      "Interconnexions gated par entitlements : AST liés (« Créer un AST »), permis liés, rapports terrain, rollup du temps par personne ; export « Rapport complet » PDF.",
      "Analyse IA du portefeuille : santé globale, projets non profitables + correctif, meilleures/pires performances, conversion et recommandations priorisées.",
    ],
    featuresEn: [
      'Create a project with an auto-generated number (company initial + site + department from Administration, year, sequence), regenerable, editable as an offline fallback.',
      'Project sheet: title, client (dynamic search that pre-fills city/province), status (No quote / Quote / Sale / In progress / Invoiced), type (Cost-plus/Fixed-price), internal/external scope, itemized/global pricing mode, PO amount and number, dates.',
      'Quotes: centralized rate catalog (office/site labor, travel, per diem, lodging, materials), items and lines, automatic calculation, markup, revisions; on acceptance the quote becomes a project (number S → P).',
      'Resource calculator (duration + coverage → personnel/vehicles/per diems), automatic numbering by site/department prefix, level-based approval, salesperson commission (computed server-side, salaries never exposed).',
      'Attach/detach/transfer quotes to a project, set an annual increase in % and view the indexed 5-year projection.',
      'Costs tab: Estimated vs LOADED actual cost (labor burden), $/% variance, invoiced, breakdown (labor, mileage, materials, bonuses, expenses), margin and a committed-cost progress bar.',
      'Actual cost aggregated automatically from timesheets (no double entry): labor at each employee’s rate, mileage, materials, allowances; WIP computed server-side.',
      'Unified invoicing: quote-based (fixed-price) or actual-time (cost-plus), checkable lines (fuel surcharge, rebillable expenses, inventory materials at selling price), extras, GST 5% + QST 9.975%, manual rounding, revenue-class allocation.',
      'Approve the invoice: unique sequential number server-side, promotion to Invoicing (“Processed” status), revenue recognition in the general ledger, PDF export, reopen as draft.',
      'Consume inventory materials from the project (item search, location, quantity vs stock) — decrements stock; withdrawal history.',
      'AI purchase-order import (PDF/image): extracts PO number, amount, dates, client profile, pre-fills without overwriting and attaches the PO; manual attachments (PO, contract, quote, drawings, emails).',
      'Entitlement-gated interconnections: linked JSAs (“Create a JSA”), linked permits, field reports, per-person time rollup; “Full report” PDF export.',
      'AI portfolio analysis: overall health, unprofitable projects + fix, best/worst performers, conversion and prioritized recommendations.',
    ],
  },
  {
    key: 'planner', icon: '📅',
    titleFr: 'Planificateur', titleEn: 'Scheduler',
    taglineFr: "Planifiez personnel, équipements et mandats sur un calendrier vivant qui transforme les heures de travail en dates réalistes, du terrain au poinçon.",
    taglineEn: 'Schedule personnel, equipment and jobs on a living calendar that turns work-hours into realistic dates, from the field to the punch clock.',
    featuresFr: [
      "Grille des ressources : une ligne par technicien/équipement/sous-traitant, une colonne par jour, chaque mandat en barre sur 24 h ; colonne des noms figée au défilement.",
      "Calendrier mensuel : pastille du nombre d'événements par jour ; toucher une journée liste ses mandats (numéro, client, horaire, description). Agenda mobile vertical avec « Mes tâches seulement » par défaut.",
      "Créer/éditer un mandat : dates, heures, priorité, statut, personnel, équipements, sous-traitants (ajout libre), équipes et horaires par jour/individuels.",
      "L'effectif pilote la durée : saisir l'effort en heures-homme (ou depuis les étapes du Gantt), le système déduit la date de fin = heures ÷ personnes ÷ heures/jour en sautant les fins de semaine.",
      "Gantt depuis une soumission : « Pré-remplir depuis soumission » monte les étapes ; heures planifiées et date de fin se synchronisent en continu.",
      "Ordonnancement : WBS parent/enfants, enchaînement séquentiel ou parallèle, dépendances fin-début (façon MS Project) qui recalculent les dates, chemin critique en évidence et baseline.",
      "Optimisation IA du Gantt (durée en jours ouvrables, problèmes, optimisations en un clic) ; impression et export PDF avec zoom et plein écran.",
      "Modes d'horaire : fenêtre quotidienne ou 24 h/24 continu avec quarts jour/soir/nuit (gabarits éditables) assignables par ressource, les nuits débordant sur le lendemain.",
      "Récurrence automatique d'un mandat (type, intervalle, aperçu des occurrences, fin infinie ou datée).",
      "Congés en libre-service (personne, type, dates, motif obligatoire, durée), approbation/refus, filtres site/département ; affichage calendrier (rouge = en attente, vert = approuvé).",
      "Poinçon intégré : le travailleur choisit sa tâche, pointe entrée/sortie avec chrono en direct, le temps (arrondi 15 min) part dans sa feuille de temps et le projet lié.",
      "Filtres et repères : recherche, filtre site/poste, vues Personnel/Équipements/Global/Événements, couleur par succursale ou priorité, bouton « À contrôler » et détection des conflits d'horaire.",
      "Tableau de bord analytique : cartes de synthèse et onglets Performance/Achalandage/Comparatif/Individuel avec graphiques filtrables ; rattacher/créer un AST préremplis depuis le mandat.",
    ],
    featuresEn: [
      'Resource grid: one row per technician/equipment/subcontractor, one column per day, each job as a bar across 24 h; the name column freezes on scroll.',
      'Monthly calendar: a badge of the event count per day; tapping a day lists its jobs (number, client, schedule, description). Vertical mobile agenda with “My tasks only” by default.',
      'Create/edit a job: dates, hours, priority, status, personnel, equipment, subcontractors (free entry), crews and per-day/individual schedules.',
      'Headcount drives duration: enter effort in person-hours (or from the Gantt steps), and the system derives the end date = hours ÷ people ÷ hours/day, skipping weekends.',
      'Gantt from a quote: “Pre-fill from quote” builds the steps; planned hours and end date sync continuously.',
      'Scheduling: parent/child WBS, sequential or parallel chaining, finish-to-start dependencies (MS Project style) that recompute dates, highlighted critical path and baseline.',
      'AI Gantt optimization (duration in business days, issues, one-click optimizations); print and PDF export with zoom and full screen.',
      'Schedule modes: daily window or continuous 24/7 with day/evening/night shifts (editable templates) assignable per resource, with night shifts spilling into the next day.',
      'Automatic job recurrence (type, interval, occurrence preview, endless or dated end).',
      'Self-service time-off (person, type, dates, mandatory reason, duration), approve/reject, site/department filters; calendar display (red = pending, green = approved).',
      'Built-in punch clock: the worker picks their task, punches in/out with a live timer, and the time (rounded to 15 min) flows to their timesheet and the linked project.',
      'Filters and cues: search, site/role filter, Personnel/Equipment/Global/Events views, color by branch or priority, an “To review” button and schedule-conflict detection.',
      'Analytics dashboard: summary cards and Performance/Workload/Comparison/Individual tabs with filterable charts; attach/create a pre-filled JSA from the job.',
    ],
  },
  {
    key: 'timesheets', icon: '⏱️',
    titleFr: 'Feuille de temps', titleEn: 'Timesheets',
    taglineFr: "Saisissez vos heures par projet et par tâche, vos primes, vos dépenses (avec reçus IA) et votre odomètre — le tout alimente la paie, les coûts de projet et le logbook.",
    taglineEn: 'Log your hours by project and task, your bonuses, your expenses (with AI receipts) and your odometer — all feeding payroll, project costs and the logbook.',
    featuresFr: [
      "Saisie hebdomadaire par semaine ISO (lundi-dimanche) ; la semaine suivante est créée automatiquement 7 jours à l'avance. Vue personnelle : vous ne voyez que VOS feuilles.",
      "Trois types d'heures par ligne : Régulier, Supplémentaire, Majoré — en pas de 0,5 h, avec un bouton « ⏱ Arrondir 15 min ».",
      "Ligne par projet OU par tâche récurrente (recherche par numéro/titre/client) ; plusieurs lignes par jour, regroupées sous un en-tête de journée avec total.",
      "Kilométrage et véhicule par ligne : champ Km + sélecteur (véhicule d'entreprise, personnel autorisé, ou « mon véhicule personnel »), pré-sélectionné selon l'assignation.",
      "Avantages/primes : cochez les avantages applicables (subsistance…) filtrés selon l'employé et le contexte ; les primes horaires se déclenchent au-delà d'un seuil et s'affichent en pastilles.",
      "Dépenses avec reçus et scan IA : par ligne (carburant, repas, hébergement, matériel, outils, stationnement, péage), taxes calculées (TPS + TVQ) ; « 📷 IA » scanne le reçu et pré-remplit fournisseur, date, sous-total et taxes.",
      "Poinçon d'odomètre : si un véhicule d'entreprise vous est assigné, vous devez saisir l'odomètre de début de semaine ; la fin calcule les km personnels et la déduction (tarif ARC).",
      "Heures seulement (confidentialité paie) : la feuille n'affiche AUCUN montant en dollars — les coûts sont calculés et enregistrés pour la paie mais restent masqués (Loi 25).",
      "Approbation et statuts : brouillon → soumise → validée → vérifiée → payée ; une feuille refusée affiche « ⚠ Ajustement requis » avec la note du superviseur.",
      "Auto-sauvegarde (après ~1 s d'inactivité et à la fermeture) et export PDF de la feuille sur le letterhead maison.",
      "Interconnexions : les km alimentent le logbook, les lignes de projet alimentent les coûts réels des Projets, l'approbation et le dépôt bancaire se font en Paie, et les tâches/avantages/grilles salariales se configurent en Admin.",
    ],
    featuresEn: [
      'Weekly entry by ISO week (Monday–Sunday); the next week is created automatically 7 days ahead. Personal view: you only see YOUR sheets.',
      'Three hour types per line: Regular, Overtime, Premium — in 0.5 h steps, with a “⏱ Round to 15 min” button.',
      'A line per project OR per recurring task (search by number/title/client); several lines per day, grouped under a day header with a total.',
      'Mileage and vehicle per line: Km field + selector (company vehicle, authorized personal, or “my personal vehicle”), pre-selected based on assignment.',
      'Benefits/bonuses: check applicable benefits (per diem…) filtered by employee and context; hourly bonuses trigger past a threshold and show as chips.',
      'Expenses with receipts and AI scan: per line (fuel, meals, lodging, materials, tools, parking, tolls), taxes computed (GST + QST); “📷 AI” scans the receipt and pre-fills vendor, date, subtotal and taxes.',
      'Odometer punch: if a company vehicle is assigned to you, you must enter the start-of-week odometer; the end computes personal km and the deduction (CRA rate).',
      'Hours only (payroll confidentiality): the sheet shows NO dollar amounts — costs are computed and stored for payroll but stay hidden (Law 25).',
      'Approval and statuses: draft → submitted → validated → verified → paid; a rejected sheet shows “⚠ Adjustment required” with the supervisor’s note.',
      'Auto-save (after ~1 s idle and on page close) and PDF export of the sheet on the house letterhead.',
      'Interconnections: mileage feeds the logbook, project lines feed Projects’ actual costs, approval and bank deposit happen in Payroll, and tasks/benefits/salary grids are configured in Admin.',
    ],
  },
  {
    key: 'conges', icon: '🏖️',
    titleFr: 'Congés', titleEn: 'Time off',
    taglineFr: "Demandez vos congés en libre-service, suivez leur statut et vos soldes, pendant que le superviseur approuve — confidentialité Loi 25 et lien au planificateur.",
    taglineEn: 'Request time off in self-service, track its status and your balances, while the supervisor approves — Law 25 privacy and a link to the scheduler.',
    featuresFr: [
      "Libre-service par l'employé : vous voyez et gérez uniquement VOS demandes ; votre profil est reconnu par votre courriel et pré-sélectionné.",
      "Types de congé configurables (Vacances, Maladie, Formation, Parental, Autre) — chacun paramétrable par l'entreprise (Admin/RH) avec emoji, exigence de justificatif et poste approbateur.",
      "Demande avec motif obligatoire et décompte de jours en direct (Du / Au) ; la note est obligatoire pour soumettre.",
      "Pièce justificative conditionnelle : si le type l'exige au-delà d'un seuil (ex. billet médical après 3 jours), un champ de téléversement (image/PDF) apparaît et devient obligatoire.",
      "Approbation routée par poste : dirigée vers le poste approbateur défini pour le type (sinon un superviseur) ; les approbateurs voient un onglet « À approuver » avec badge, boutons Approuver/Refuser horodatés.",
      "Soldes de l'année courante : cartes du total de jours approuvés par type.",
      "Confidentialité Loi 25 : un employé ne reçoit que ses propres congés (jamais les motifs médicaux des collègues) ; seuls les approbateurs voient l'ensemble.",
      "Cadre congé parental par province : encadré indiquant le régime (RQAP au Québec, Assurance-emploi ailleurs), semaines et taux approximatifs, rappel du Relevé d'emploi et de l'interruption de paie.",
      "Annulation possible d'une demande encore en attente ; mise à jour en temps réel à chaque création/approbation.",
      "Interconnexion planificateur : écrit dans la table partagée des congés et garde le statut « approuvé » synchronisé — un congé approuvé apparaît dans la disponibilité/planification.",
    ],
    featuresEn: [
      'Employee self-service: you only see and manage YOUR requests; your profile is recognized by your email and pre-selected.',
      'Configurable time-off types (Vacation, Sick, Training, Parental, Other) — each set up by the company (Admin/HR) with emoji, evidence requirement and approver role.',
      'Request with a mandatory reason and a live day count (From / To); the note is required to submit.',
      'Conditional supporting document: if the type requires it beyond a threshold (e.g. a medical note after 3 days), an upload field (image/PDF) appears and becomes mandatory.',
      'Role-routed approval: directed to the approver role set for the type (otherwise a supervisor); approvers see an “To approve” tab with a badge, timestamped Approve/Reject buttons.',
      'Current-year balances: cards of total approved days per type.',
      'Law 25 privacy: an employee only receives their own time off (never colleagues’ medical reasons); only approvers see the whole set.',
      'Provincial parental-leave framework: a box showing the program (QPIP in Quebec, Employment Insurance elsewhere), approximate weeks and rate, reminder of the Record of Employment and payroll interruption.',
      'A still-pending request can be cancelled; real-time update on each creation/approval.',
      'Scheduler interconnection: writes to the shared time-off table and keeps the “approved” status synced — approved time off shows in availability/scheduling.',
    ],
  },
  {
    key: 'logbook', icon: '🚗',
    titleFr: 'Journal de bord des véhicules', titleEn: 'Vehicle logbook',
    taglineFr: "Tenez l'odomètre hebdomadaire de chaque véhicule, séparez automatiquement usage personnel et professionnel, et exportez un CSV conforme TP-41 et T777.",
    taglineEn: 'Keep the weekly odometer for each vehicle, automatically split personal and business use, and export a TP-41 / T777-ready CSV.',
    featuresFr: [
      "Relevé d'odomètre hebdomadaire par véhicule (navigation semaine par semaine) ; l'odomètre de début se pré-remplit à partir de la fin de la semaine précédente.",
      "Km travail automatique depuis les feuilles de temps : la colonne « Km travail » additionne en direct les km saisis pour ce véhicule cette semaine — pas de double saisie.",
      "Déduction personnel / professionnel : km personnels = total − km travail (modifiable pour les véhicules d'entreprise, plafonné au total), avec barre de progression du % professionnel.",
      "Avantage imposable (véhicule d'entreprise) : à partir du prix d'achat, frais de disponibilité (2 %/mois, réduits si < 20 004 km personnels/an) + frais d'usage (0,35 $/km personnel) = avantage T4.",
      "Remboursement (véhicule personnel) : 0,72 $/km pour les 5 000 premiers km, puis 0,66 $/km au-delà.",
      "Résumé annuel par véhicule : totaux de km, % professionnel, et détail de l'avantage ou du remboursement, avec invite à saisir le prix d'achat dans Admin si manquant.",
      "Export TP-41 / T777 : CSV (Excel-FR) avec une ligne par semaine (odomètres, km, notes) + résumé annuel par véhicule ; fichier nommé par année, employé et tenant.",
      "Filtrage par affectation : vous ne voyez que les véhicules d'entreprise ou personnels qui vous sont assignés.",
      "Sauvegarde ciblée et isolation : seules les lignes modifiées sont enregistrées, chaque écriture scopée à votre identité et au tenant ; avis « Estimation — à valider par votre comptable ».",
      "Interconnexions : la feuille de temps y renvoie directement, l'odomètre saisi en feuille de temps écrit ici, et les véhicules/prix d'achat viennent d'Admin → Véhicules.",
    ],
    featuresEn: [
      'Weekly odometer reading per vehicle (week-by-week navigation); the start odometer pre-fills from the previous week’s end.',
      'Automatic work km from timesheets: the “Work km” column live-sums the km entered for that vehicle that week — no double entry.',
      'Personal / business split: personal km = total − work km (editable for company vehicles, capped at the total), with a business-% progress bar.',
      'Taxable benefit (company vehicle): from the purchase price, standby charge (2%/month, reduced if < 20,004 personal km/year) + operating cost (CAD 0.35/personal km) = T4 benefit.',
      'Reimbursement (personal vehicle): CAD 0.72/km for the first 5,000 km, then CAD 0.66/km beyond.',
      'Annual summary per vehicle: km totals, business %, and the benefit or reimbursement detail, with a prompt to enter the purchase price in Admin if missing.',
      'TP-41 / T777 export: a CSV (Excel-FR) with one row per week (odometers, km, notes) + an annual summary per vehicle; file named by year, employee and tenant.',
      'Assignment filtering: you only see company or personal vehicles assigned to you.',
      'Targeted save and isolation: only modified rows are saved, each write scoped to your identity and the tenant; an “Estimate — to be validated by your accountant” notice.',
      'Interconnections: the timesheet links straight here, the odometer entered in the timesheet writes here, and vehicles/purchase prices come from Admin → Vehicles.',
    ],
  },
  {
    key: 'inventory', icon: '📦',
    titleFr: 'Inventaire', titleEn: 'Inventory',
    taglineFr: "Gestion des articles, étiquettes QR et mouvements, avec valorisation des stocks et consommation liée aux projets.",
    taglineEn: 'Item management, QR labels and movements, with stock valuation and project-linked consumption.',
    featuresFr: [
      "Catalogue d'articles par succursale/département : quantités, seuils de réapprovisionnement et alertes de stock bas.",
      "Étiquettes QR par article (formats d'étiquettes, aperçu/impression/PDF, copies multiples) ; scan pour entrée/sortie/comptage depuis la fiche publique.",
      "Mouvements entrée/sortie tracés ; la consommation de matériel se lie aux projets (sortie référencée au projet qui décrémente le stock).",
      "Valorisation des stocks (valeur du matériel en main) et réconciliation lors des comptages.",
      "Import d'articles (modèle CSV) pour démarrer rapidement un catalogue.",
      "Interconnexions : le module Projets consomme le matériel (au prix vendant en facturation), et le module Maintenance réutilise le moteur d'étiquettes QR.",
    ],
    featuresEn: [
      'Item catalog by branch/department: quantities, reorder thresholds and low-stock alerts.',
      'Per-item QR labels (label formats, preview/print/PDF, multiple copies); scan for in/out/count from the public sheet.',
      'Tracked in/out movements; material consumption links to projects (a project-referenced withdrawal decrements stock).',
      'Stock valuation (value of material on hand) and reconciliation during counts.',
      'Item import (CSV template) to quickly bootstrap a catalog.',
      'Interconnections: the Projects module consumes materials (at selling price in invoicing), and the Maintenance module reuses the QR label engine.',
    ],
  },
  {
    key: 'todo', icon: '✅',
    titleFr: 'Tâches / To-Do', titleEn: 'Tasks / To-Do',
    taglineFr: "Organisez vos tâches et mesures correctives en liste ou en Kanban, avec étapes cochables, photos, échéances, priorités et assignation.",
    taglineEn: 'Organize your tasks and corrective actions in a list or Kanban, with checkable steps, photos, due dates, priorities and assignment.',
    featuresFr: [
      "Deux vues : Liste (cartes) et Kanban (colonnes À faire / En cours / Bloqué / Terminé / Archivé avec compte par colonne).",
      "Modèles de tâches prêts à l'emploi avec leurs étapes : Mesure corrective, Inspection sécurité, Action préventive, Suivi équipement, Tâche urgente.",
      "Étapes / checklist par tâche : ajout, cochage, barre de progression et compteur « x/y — % » sur la carte.",
      "Statuts et cycle rapide : cliquer la pastille de couleur d'une carte fait avancer le statut d'un cran sans ouvrir la fiche.",
      "Priorités visuelles (Urgent, Élevée, Normale, Basse) avec code couleur.",
      "Assignation et site avec autocomplétion (personnel et succursales partagés avec le planificateur) ; site courant pré-rempli.",
      "Échéances avec alerte de retard (rouge et compteur « En retard »).",
      "Photos depuis le téléphone (capture caméra sur mobile), vignettes avec visionneuse plein écran.",
      "Barre de statistiques (Total, À faire, En cours, Bloqué, Terminé, En retard).",
      "Recherche, filtres (statut/priorité), archivage/restauration, panneau de détail auto-sauvegardé (~0,7 s), lien partageable vers une tâche et export CSV.",
    ],
    featuresEn: [
      'Two views: List (cards) and Kanban (To do / In progress / Blocked / Done / Archived columns with a per-column count).',
      'Ready-to-use task templates with their steps: Corrective action, Safety inspection, Preventive action, Equipment follow-up, Urgent task.',
      'Steps / checklist per task: add, check, progress bar and an “x/y — %” counter on the card.',
      'Statuses and quick cycle: clicking a card’s color dot advances the status one step without opening the sheet.',
      'Visual priorities (Urgent, High, Normal, Low) with color coding.',
      'Assignment and site with autocompletion (personnel and branches shared with the scheduler); current site pre-filled.',
      'Due dates with an overdue alert (red and an “Overdue” counter).',
      'Photos from the phone (mobile camera capture), thumbnails with a full-screen viewer.',
      'A stats bar (Total, To do, In progress, Blocked, Done, Overdue).',
      'Search, filters (status/priority), archive/restore, an auto-saved detail panel (~0.7 s), a shareable link to a task and CSV export.',
    ],
  },
  {
    key: 'dga', icon: '🧪',
    titleFr: 'Diagnostic DGA', titleEn: 'DGA Diagnostic',
    taglineFr: "Suivez la santé de vos transformateurs à partir des analyses d'huile de laboratoire : diagnostic automatique (IEEE + Duval), alertes d'échéance et rapports client.",
    taglineEn: 'Track your transformers’ health from lab oil analyses: automatic diagnosis (IEEE + Duval), due-date alerts and client reports.',
    featuresFr: [
      "Parc en cartes : client, identification, n° série, tension (kV), condition globale (couleur), zone de Duval, badges BPC et OLTC ; recherche, filtres (En retard / Bientôt dû / À jour, À traiter / Traités, Suivi rapproché, BPC, par site) et tris.",
      "Créer/décrire un transformateur : formulaire par groupes, rattachement site/département, marquage « Cuve principale » ou « Changeur de prises (OLTC) » avec parent, et n° de projet.",
      "Saisir un prélèvement : Gaz dissous (H₂, CH₄, C₂H₆, C₂H₄, C₂H₂, CO, CO₂, O₂/N₂), Qualité de l'huile (paramètres ASTM) et Furanes ; accepte « <1 »/« <5 » et « vide = non mesuré ».",
      "Import automatique de rapports de labo : PDF (extraction IA par lots) ou export Excel/CSV (InsideView / Morgan Schaffer / LIMS) ; aperçu de fusion, détection de doublons par date, arbitrage des conflits.",
      "Import par courriel « mains libres » : adresse dédiée par tenant, liste blanche d'expéditeurs, journal (Importé/Ignoré/Rejeté) et badge « Nouveau ».",
      "Verdict de santé automatique : indice 0–100, sévérité IEEE C57.104-2019 (statut par gaz et global, segment scellé/respirant, âge), tendance TDCG, variation Δ% vs relevé précédent.",
      "Méthodes normalisées : Triangle de Duval 1 (avec trajectoire), Pentagone de Duval, ratios de Rogers, et vue de consensus (Gaz clés, Doernenburg, Rogers, IEC 60599, CO₂/CO, Duval).",
      "Analyses complémentaires : taux de génération (ppm/jour), comparaison à la flotte, estimation du degré de polymérisation (DP) via le 2-FAL, qualité d'huile selon la classe de tension.",
      "Diagnostic assisté par IA : résumé bilingue FR/EN, recommandations, sévérité, type de défaut probable et intervalle de reprise, adapté au type d'huile (minérale/ester/silicone).",
      "Planification de reprise : intervalles préréglés + date manuelle avec statut d'échéance, distinction suivi ciblé vs suivi complet annuel.",
      "QR public par transformateur : étiquette imprimable (logo, n° série, kV, badge BPC) en lecture seule sans compte, édition une fois connecté.",
      "Rapports client : export PDF avec choix des pages (garde, présentation, résultats, analyse, tendances, photos, anomalies, inspection), assemblage multi-transformateurs, export CSV, bilingue ; relié au module Maintenance (sévérité ≥ 3 crée une action corrective).",
    ],
    featuresEn: [
      'Fleet as cards: client, ID, serial number, voltage (kV), overall condition (color), Duval zone, PCB and OLTC badges; search, filters (Overdue / Due soon / Up to date, To process / Processed, Close monitoring, PCB, by site) and sorts.',
      'Create/describe a transformer: grouped form, site/department linkage, “Main tank” or “Tap changer (OLTC)” marking with a parent, and a project number.',
      'Enter a sample: Dissolved gases (H₂, CH₄, C₂H₆, C₂H₄, C₂H₂, CO, CO₂, O₂/N₂), Oil quality (ASTM parameters) and Furans; accepts “<1”/“<5” and “blank = not measured”.',
      'Automatic lab-report import: PDF (batch AI extraction) or Excel/CSV export (InsideView / Morgan Schaffer / LIMS); merge preview, duplicate detection by date, conflict arbitration.',
      'Hands-free email import: a dedicated per-tenant address, a sender allowlist, a log (Imported/Ignored/Rejected) and a “New” badge.',
      'Automatic health verdict: 0–100 index, IEEE C57.104-2019 severity (per-gas and overall status, sealed/breathing segment, age), TDCG trend, Δ% change vs the previous sample.',
      'Standard methods: Duval Triangle 1 (with trajectory), Duval Pentagon, Rogers ratios, and a consensus view (Key gases, Doernenburg, Rogers, IEC 60599, CO₂/CO, Duval).',
      'Additional analyses: generation rate (ppm/day), fleet comparison, degree-of-polymerization (DP) estimate via 2-FAL, oil quality by voltage class.',
      'AI-assisted diagnosis: bilingual FR/EN summary, recommendations, severity, likely fault type and retest interval, adapted to the oil type (mineral/ester/silicone).',
      'Retest planning: preset intervals + manual date with a due-status, distinguishing targeted follow-up from full annual follow-up.',
      'Public QR per transformer: a printable label (logo, serial number, kV, PCB badge), read-only without an account, editable once logged in.',
      'Client reports: PDF export with page selection (cover, intro, results, analysis, trends, photos, anomalies, inspection), multi-transformer assembly, CSV export, bilingual; linked to the Maintenance module (severity ≥ 3 creates a corrective action).',
    ],
  },
  {
    key: 'rapports', icon: '📋',
    titleFr: 'Rapports terrain', titleEn: 'Field reports',
    taglineFr: "Constructeur de rapports techniques assisté par IA, du terrain au PDF professionnel, avec import de PDF/manuscrit et partage au vérificateur.",
    taglineEn: 'AI-assisted technical report builder, from the field to a professional PDF, with PDF/handwriting import and reviewer sharing.',
    featuresFr: [
      "Gabarits réutilisables (inspection, essais, devis, générique) + gabarits personnalisés du tenant, avec numéro unique imprimé (GAB-XXX).",
      "Assemblage par blocs : zones, sections (libellé → valeur), tableaux multi-colonnes, grilles d'inspection (conforme/anomalie/N-A + gravité), texte, photos, pages PDF.",
      "Import IA : PDF (OCR fidèle), document manuscrit, multi-photos — l'IA classe les données au bon type de bloc et respecte l'ordre/hiérarchie ; reconnaissance DANS un gabarit existant (standardisation).",
      "Assemblage mixte app + manuscrit : scannez des pages manuscrites, l'IA les replace au bon endroit ; rapport vocal (dictée structurée en sections).",
      "OCR plaque signalétique (n° série / fabricant / tension / puissance) et détection IA de défauts sur photo (corrosion, fuite, fissure, surchauffe…) avec gravité.",
      "Anomalies & recommandations : annotations classables, indicateur « à chiffrer », dashboard consolidé, historique par équipement, marquer corrigé.",
      "Anomalies → soumission : sélectionnez les items à chiffrer, ouvre une soumission pré-remplie (1 item/anomalie) dans le module Projets.",
      "QR codes : un par rapport + un par équipement (identité stable) — le client colle l'étiquette, le scan ouvre la bonne section ; planche d'étiquettes imprimable.",
      "Interconnexion : lier un rapport à un Projet et à un événement du Planner ; le statut remonte au projet/facturation.",
      "Export PDF pro : page couverture, lettre de présentation éditable, table des matières, en-tête/pied répétés, récap anomalies, mode condensé, nom du fichier = n° de dossier.",
      "Partage au vérificateur : lien tokenisé lecture/révision (commentaires) ou édition encadrée par des dates (sous-traitant externe), sans compte.",
      "Temps réel : présence des collaborateurs, verrou souple par section, synchro en direct ; hors-ligne, les modifications sont mises en file et synchronisées au retour en ligne.",
    ],
    featuresEn: [
      'Reusable templates (inspection, testing, quote, generic) + tenant custom templates, with a printed unique number (GAB-XXX).',
      'Block assembly: zones, sections (label → value), multi-column tables, inspection grids (pass/anomaly/N-A + severity), text, photos, PDF pages.',
      'AI import: PDF (faithful OCR), handwritten document, multi-photos — the AI classifies data into the right block type and respects order/hierarchy; recognition INTO an existing template (standardization).',
      'Mixed app + handwriting assembly: scan handwritten pages and the AI places them in the right spot; voice report (dictation structured into sections).',
      'Nameplate OCR (serial number / manufacturer / voltage / power) and AI defect detection on a photo (corrosion, leak, crack, overheating…) with severity.',
      'Anomalies & recommendations: classifiable annotations, a “to be priced” flag, a consolidated dashboard, per-equipment history, mark as fixed.',
      'Anomalies → quote: select the items to price, opening a pre-filled quote (1 item/anomaly) in the Projects module.',
      'QR codes: one per report + one per equipment (stable identity) — the client sticks the label, and scanning opens the right section; a printable label sheet.',
      'Interconnection: link a report to a Project and to a Planner event; the status flows up to the project/invoicing.',
      'Pro PDF export: cover page, editable cover letter, table of contents, repeated header/footer, anomaly recap, condensed mode, file name = file number.',
      'Reviewer sharing: a tokenized read/review link (comments) or date-bounded editing (external subcontractor), no account.',
      'Real time: collaborator presence, soft per-section locking, live sync; offline, changes are queued and synced on reconnection.',
    ],
  },
  {
    key: 'marketing', icon: '📣',
    titleFr: 'Marketing IA', titleEn: 'AI Marketing',
    taglineFr: "Un brief, des livrables complets : scripts, vidéos (avatar ou vidéo réelle + diapos), publications et courriels conformes — générés par IA à partir de votre profil d'entreprise.",
    taglineEn: 'One brief, complete deliverables: scripts, videos (avatar or real video + slides), posts and compliant emails — AI-generated from your company profile.',
    featuresFr: [
      "Générateur « 1 brief → N livrables » : décrivez module, audience, message clé, appel à l'action, langue et formats (16:9 / 9:16 / 1:1) ; l'IA produit accroches, storyboard scène par scène, sous-titres, publications par réseau (avec hashtags), courriel de suivi et concept de vignette.",
      "Le profil d'entreprise du tenant (nom, secteur, description, offre, audience, ton, points clés, province) nourrit l'IA — la génération refuse de partir sans description, gage de pertinence.",
      "Script d'avatar : transforme des idées et une durée cible (10-60 s) en narration calibrée (~2,4 mots/s), avec modèles prêts et règles de prononciation TTS.",
      "Traduction FR↔EN en un clic de tout le pack, structure conservée.",
      "Vidéo avatar (tête parlante) via D-ID : photo de visage + script + voix neurale (FR-CA/FR/EN) → MP4 stocké ; le tenant utilise sa propre clé D-ID (BYOK), sans consommer le budget IA.",
      "Vidéo réelle + diapos, sans IA : montage dans le navigateur d'un fond (diapos avec transitions, ou vidéo), un avatar en médaillon ou plein cadre, et des sous-titres incrustés ; l'aperçu en direct = l'enregistrement.",
      "Enregistreur caméra intégré : capture un clip webcam+micro réutilisable comme présentateur.",
      "Interconnexion storyboard → montage : un storyboard généré remplit les diapos du studio et la narration de l'avatar.",
      "Jauge de budget IA en direct : le tenant achète un forfait en dollars, l'IA affiche le restant et refuse les appels quand le forfait est épuisé, en enregistrant le coût par module.",
      "Générateur de courriel conforme LCAP : objets A/B, corps, et pied de page obligatoire (identité expéditeur + adresse postale + lien de désabonnement) avec rappels de conformité.",
      "Assistant conversationnel : un stratège marketing/prospection B2B qui garde le fil, avec des amorces prêtes.",
      "(Selon le forfait — certaines fonctions avancées de prospection et de capture d'écran sont réservées au studio plateforme.)",
    ],
    featuresEn: [
      'A “1 brief → N deliverables” generator: describe module, audience, key message, call to action, language and formats (16:9 / 9:16 / 1:1); the AI produces hooks, a scene-by-scene storyboard, captions, per-network posts (with hashtags), a follow-up email and a thumbnail concept.',
      'The tenant’s company profile (name, industry, description, offer, audience, tone, key points, province) feeds the AI — generation refuses to start without a description, ensuring relevance.',
      'Avatar script: turns ideas and a target duration (10-60 s) into calibrated narration (~2.4 words/s), with ready-made templates and TTS pronunciation rules.',
      'One-click FR↔EN translation of the whole pack, structure preserved.',
      'Avatar (talking head) video via D-ID: a face photo + script + neural voice (FR-CA/FR/EN) → a stored MP4; the tenant uses its own D-ID key (BYOK), without consuming the AI budget.',
      'Real video + slides, no AI: in-browser assembly of a background (slides with transitions, or a video), an avatar as a corner medallion or full frame, and burned-in captions; the live preview = the recording.',
      'Built-in camera recorder: captures a webcam+mic clip reusable as a presenter.',
      'Storyboard → editor interconnection: a generated storyboard fills the studio slides and the avatar narration.',
      'Live AI budget gauge: the tenant buys a dollar plan, the AI shows the remaining amount and refuses calls when the plan is exhausted, logging the cost per module.',
      'CASL-compliant email generator: A/B subject lines, body, and a mandatory footer (sender identity + postal address + unsubscribe link) with compliance reminders.',
      'Conversational assistant: a B2B marketing/prospecting strategist that keeps context, with ready prompts.',
      '(Depending on the plan — some advanced prospecting and screen-capture features are reserved for the platform studio.)',
    ],
  },
  {
    key: 'admin', icon: '⚙️',
    titleFr: 'Administration', titleEn: 'Administration',
    taglineFr: "Paramètres du tenant, sites et personnel, taux et grilles salariales, RH, finances et conformité — le socle qui alimente tous les autres modules.",
    taglineEn: 'Tenant settings, sites and personnel, rates and salary grids, HR, finance and compliance — the foundation that feeds every other module.',
    featuresFr: [
      "Réglages de l'entreprise : raison sociale, adresse, taxes TPS/TVQ, préfixe de facture, coordonnées de paiement, logo, couleur de marque.",
      "Sites/succursales et départements (cascade), personnel, postes et sous-classes de postes, comptes d'accès (8 niveaux), véhicules et prix d'achat.",
      "Taux et catalogue : main-d'œuvre, réglages de tarification, articles, barème de surcharge carburant, niveaux d'approbation — servent aux soumissions et aux Projets.",
      "Avantages/primes, primes horaires, types de congé et grilles salariales (profils employés) — alimentent Feuilles de temps, Congés et Paie.",
      "RH : dossiers, documents, certifications, accueil (onboarding) — accès protégé via routes serveur.",
      "Finances : facturation unifiée, transactions, actionnaires, immobilisations, budget, réconciliation, prévisions — avec exports.",
      "Paie : calcul des retenues, exécution de la paie et dépôt bancaire (CSV / CPA-005), sur la base des feuilles de temps validées.",
      "Marketing IA, kiosque/diffusion en veille, modèles PDF (style unifié DGA éditable par module), et gestion des modules par tenant (entitlements).",
      "Conformité Loi 25 / RGPD : droits libre-service, minimisation IA, purge, politique de confidentialité.",
      "Guide opérateur (travailler avec Claude, migrations, déploiement) et « Admin de base » : deux niveaux d'admin (super-admin plateforme / admin tenant).",
      "Isolation stricte par tenant : toutes les écritures sont scopées au tenant, les lectures sensibles passent par des routes serveur (jamais en anonyme).",
    ],
    featuresEn: [
      'Company settings: legal name, address, GST/QST taxes, invoice prefix, payment details, logo, brand color.',
      'Sites/branches and departments (cascade), personnel, roles and role subclasses, access accounts (8 levels), vehicles and purchase prices.',
      'Rates and catalog: labor, pricing settings, items, fuel-surcharge tiers, approval levels — used by quotes and Projects.',
      'Benefits/bonuses, hourly bonuses, time-off types and salary grids (employee profiles) — feed Timesheets, Time off and Payroll.',
      'HR: files, documents, certifications, onboarding — access protected via server routes.',
      'Finance: unified invoicing, transactions, shareholders, fixed assets, budget, reconciliation, forecasts — with exports.',
      'Payroll: deduction calculation, payroll run and bank deposit (CSV / CPA-005), based on validated timesheets.',
      'AI Marketing, standby kiosk/broadcast, PDF templates (unified DGA style editable per module), and per-tenant module management (entitlements).',
      'Law 25 / GDPR compliance: self-service rights, AI minimization, purge, privacy policy.',
      'Operator guide (working with Claude, migrations, deployment) and “Basic admin”: two admin levels (platform super-admin / tenant admin).',
      'Strict per-tenant isolation: all writes are scoped to the tenant, sensitive reads go through server routes (never anonymous).',
    ],
  },
];

const CROSS_FR = [
  "🔒 Sécurité multi-tenant : isolation stricte par tenant, lectures sensibles via routes serveur (jamais en anonyme), anti-IDOR.",
  "🤖 IA encadrée : clé serveur (jamais dans le navigateur), budget IA par tenant, anti-injection, limite de débit.",
  "📱 PWA installable, responsive mobile, mode jour/nuit, FR/EN suivant le bouton langue du header.",
  "🔗 Interconnexion : Soumission → Projet → Planificateur → Facturation → Rapports, avec QR et liens partagés.",
  "📊 Tableau de bord : compteurs par module, anomalies, conformité.",
];
const CROSS_EN = [
  '🔒 Multi-tenant security: strict per-tenant isolation, sensitive reads via server routes (never anonymous), anti-IDOR.',
  '🤖 Governed AI: server key (never in the browser), per-tenant AI budget, anti-injection, rate limiting.',
  '📱 Installable PWA, mobile responsive, day/night mode, FR/EN following the header language button.',
  '🔗 Interconnection: Quote → Project → Scheduler → Invoicing → Reports, with QR and shared links.',
  '📊 Dashboard: per-module counters, anomalies, compliance.',
];

export default function GuidePage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || ''; // ISOLATION : pas de repli 'demo'/'cerdia'
  const { lang } = useLanguage();
  const isFr = lang !== 'en';
  const tr = (fr: string, en: string) => (isFr ? fr : en);

  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({ ast: true });

  const rows = useMemo(() => MODULES.map(m => ({
    key: m.key, icon: m.icon,
    title: isFr ? m.titleFr : m.titleEn,
    tagline: isFr ? m.taglineFr : m.taglineEn,
    features: isFr ? m.featuresFr : m.featuresEn,
  })), [isFr]);

  const cross = isFr ? CROSS_FR : CROSS_EN;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(m => (m.title + ' ' + m.tagline + ' ' + m.features.join(' ')).toLowerCase().includes(s));
  }, [q, rows]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} subtitle={tr("Guide / Mode d'emploi", 'Guide / User manual')} />
      <div className="px-4 pt-3"><BackLink fallback={`/${tenant}/modules`} /></div>
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-2">
        <h1 className="font-black text-3xl" style={{ fontFamily: 'Archivo, sans-serif' }}>{tr('Guide des modules', 'Module guide')}</h1>
        <p className="mt-1 text-sm text-gray-500">{tr(
          "Description détaillée et mode d'emploi de l'ensemble des fonctionnalités de la plateforme C-Secur360.",
          'Detailed description and user manual of all C-Secur360 platform features.',
        )}</p>

        <input value={q} onChange={e => setQ(e.target.value)} placeholder={tr('Rechercher une fonctionnalité, un module…', 'Search a feature, a module…')}
          className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" />

        {/* Atouts transversaux */}
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/20">
          <div className="font-bold text-sm">{tr('✨ Atouts transversaux', '✨ Cross-cutting strengths')}</div>
          <ul className="mt-2 space-y-1 text-sm">{cross.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map(m => {
            const isOpen = q.trim() ? true : !!open[m.key];
            return (
              <div key={m.key} className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button onClick={() => setOpen(o => ({ ...o, [m.key]: !o[m.key] }))}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <span>
                      <span className="block font-extrabold" style={{ fontFamily: 'Archivo, sans-serif' }}>{m.title}</span>
                      <span className="block text-xs text-gray-500">{m.tagline}</span>
                    </span>
                  </span>
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <ul className="space-y-1.5 px-5 pb-4 text-sm leading-relaxed">
                    {m.features.map((f, i) => (
                      <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#277da1]" />{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-10 text-center text-gray-400">{tr('Aucun résultat.', 'No results.')}</div>}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">© {new Date().getFullYear()} Commerce CERDIA inc. — C-Secur360</p>
      </div>
    </div>
  );
}
