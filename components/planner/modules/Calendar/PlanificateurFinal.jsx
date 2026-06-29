import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../components/UI/Icon';
import PunchWidget from '../../PunchWidget';
import { JobModal } from '../NewJob/JobModal';
import { AnalyticsDashboard } from '../../components/Analytics/AnalyticsDashboard';
import { BUREAU_COLORS } from '@/components/planner/config/constants.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import {
    generateLocalizedDays,
    formatLocalizedDate,
    getLocalizedDayName,
    getLocalizedMonthName
} from '../../utils/localizedDateUtils.js';

export function PlanificateurFinal({
    jobs = [],
    personnel = [],
    equipements = [],
    sousTraitants = [],
    conges = [],
    succursales = [],
    departements = [],
    onSaveJob,
    onDeleteJob,
    onSavePersonnel,
    onDeletePersonnel,
    onSaveEquipement,
    onDeleteEquipement,
    onSaveConge,
    onDeleteConge,
    addSousTraitant,
    addNotification,
    utilisateurConnecte = null,
    peutModifier = () => false,
    estCoordonnateur = () => false,
    onCreateEvent,
    onManageConges,
    onManageResources,
    tenant = '',
}) {
    // Hook de traduction
    const { t, currentLanguage } = useLanguage();
    const tr = (fr, en) => (currentLanguage === 'fr' ? fr : en);

    // Hauteur uniforme simple
    const CELL_HEIGHT = 89; // pixels
    // États pour la vue calendrier
    const [startDate, setStartDate] = useState(new Date());
    const [numberOfDays, setNumberOfDays] = useState(14);
    const [timeView, setTimeView] = useState('2weeks'); // '1day', '1week', '2weeks'
    const [filterType, setFilterType] = useState('personnel'); // 'personnel', 'equipements', 'global'
    const [filterBureau, setFilterBureau] = useState('tous');
    const [filterPoste, setFilterPoste] = useState('tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [modeVueIndividuel, setModeVueIndividuel] = useState(false);
    const [travailleurSelectionne, setTravailleurSelectionne] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [conflictJob, setConflictJob] = useState(null); // Job en conflit ouvert en parallèle
    const _initMobile = (typeof window !== 'undefined' && window.innerWidth < 768);
    const [isMobile, setIsMobile] = useState(_initMobile);
    // Vue par défaut : STATION DESK -> grille (ressources) ; MOBILE -> mois (plus lisible sur petit écran).
    const [calendarMode, setCalendarMode] = useState(_initMobile ? 'month' : 'grid');
    const [monthCursor, setMonthCursor] = useState(new Date()); // mois affiché en vue 'month'
    const [selectedCalDay, setSelectedCalDay] = useState(null); // 'YYYY-MM-DD' du jour cliqué
    // Par défaut : TOUT le planning (sinon un admin/coordo sans tâche assignée voit un écran vide).
    // Le bouton « Mes tâches » permet à un technicien de filtrer sur ses propres événements.
    const [mineOnly, setMineOnly] = useState(false); // basculable via le filtre
    const [controleOnly, setControleOnly] = useState(false); // R9 : n'afficher que les mandats a controler

    // R9 — Contrôle intelligent : un mandat est « à contrôler » si l'effectif/les heures/les dates
    // semblent incohérents, ou s'il est marqué manuellement (controleAFaire).
    function jobNeedsControl(job) {
        if (!job) return false;
        if (job.controleAFaire) return true;
        const nb = Array.isArray(job.personnel) ? job.personnel.length : 0;
        if (nb === 0) return true;                              // personne d'assigné
        // NB : pas de « sur/sous-effectif ». L'effectif PILOTE la durée (effort ÷ effectif) — mettre plus
        // ou moins de personnes ajuste la durée, ce n'est jamais une incohérence à contrôler.
        if (!job.dateDebut || !job.dateFin) return true;        // dates incomplètes
        const heures = Number(job.heuresPlanifiees) || 0;
        const aEtapes = Array.isArray(job.etapes) && job.etapes.length > 0;
        if (heures === 0 && !aEtapes) return true;              // aucune heure / étape définie
        return false;
    }
    function jobControlReasons(job) {
        const fr = currentLanguage === 'fr';
        const T = (f, e) => (fr ? f : e);
        const r = [];
        if (!job) return r;
        if (job.controleAFaire) r.push(T('Marqué à contrôler', 'Flagged for control'));
        const nb = Array.isArray(job.personnel) ? job.personnel.length : 0;
        if (nb === 0) r.push(T('Aucun personnel assigné', 'No staff assigned'));
        if (!job.dateDebut || !job.dateFin) r.push(T('Dates incomplètes', 'Incomplete dates'));
        const heures = Number(job.heuresPlanifiees) || 0;
        const aEtapes = Array.isArray(job.etapes) && job.etapes.length > 0;
        if (heures === 0 && !aEtapes) r.push(T('Heures non définies', 'Hours not set'));
        return r;
    }

    // Effet pour ajuster numberOfDays selon la vue temporelle
    useEffect(() => {
        if (timeView.startsWith('period-')) {
            // Les périodes étendues sont déjà gérées dans le onChange du select
            return;
        }

        switch(timeView) {
            case '1day':
                setNumberOfDays(1);
                break;
            case '1week':
                setNumberOfDays(7);
                break;
            case '2weeks':
            default:
                setNumberOfDays(14);
                break;
        }
    }, [timeView]);

    // États pour la navigation de date rapide
    const [showDateSearch, setShowDateSearch] = useState(false);
    const [quickDate, setQuickDate] = useState('');

    // États pour le dashboard
    const [dashboardFilter, setDashboardFilter] = useState('global'); // 'global', 'personnel', 'equipements'

    // État pour le menu hamburger
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeFilterTab, setActiveFilterTab] = useState('actions'); // 'actions', 'type', 'bureau', 'poste', 'vue'

    // État pour le mode de couleur
    const [colorMode, setColorMode] = useState('succursale'); // 'succursale' ou 'priorite'

    // Fonction pour obtenir les options de bureau
    const getBureauOptions = () => {
        const bureaux = new Set();
        personnel.forEach(p => p.succursale && bureaux.add(p.succursale));
        equipements.forEach(e => e.succursale && bureaux.add(e.succursale));

        const options = [{ value: 'tous', label: t ? t('resource.allOffices') : 'Tous les bureaux' }];
        Array.from(bureaux).sort().forEach(bureau => {
            options.push({ value: bureau, label: bureau });
        });
        return options;
    };

    // Obtenir la couleur d'une succursale
    const getSuccursaleColor = (nomSuccursale) => {
        const succursaleObj = succursales.find(s => s.nom === nomSuccursale);
        return succursaleObj?.couleur || '#6B7280'; // Couleur grise par défaut
    };

    // Fonction pour obtenir les options de poste
    const getPosteOptions = () => {
        const postes = new Set();
        personnel.forEach(p => {
            if (p.poste) {
                const posteLabel = p.departement ? `${p.poste} - ${p.departement}` : p.poste;
                postes.add(JSON.stringify({ value: p.poste, label: posteLabel }));
            }
        });

        const options = [{ value: 'tous', label: t ? t('resource.allPositions') : 'Tous les postes' }];
        Array.from(postes)
            .map(p => JSON.parse(p))
            .sort((a, b) => a.label.localeCompare(b.label))
            .forEach(poste => {
                options.push(poste);
            });
        return options;
    };

    // Navigation de date rapide
    const handleQuickDateGo = () => {
        if (quickDate) {
            const date = new Date(quickDate);
            if (!isNaN(date.getTime())) {
                setStartDate(date);
                setShowDateSearch(false);
                setQuickDate('');
            }
        }
    };

    // Fonction pour afficher la date complète lors du double-clic
    const handleDateDoubleClick = (date) => {
        const dateComplete = formatLocalizedDate(date, currentLanguage, 'full');
        alert(`📅 ${t('calendar.fullDate')} :\n${dateComplete}`);
    };

    // Période prédéfinies
    const periodOptions = [
        { value: 14, label: '2S', days: 14 },
        { value: 21, label: '3S', days: 21 },
        { value: 30, label: '1M', days: 30 },
        { value: 90, label: '3M', days: 90 },
        { value: 180, label: '6M', days: 180 },
        { value: 365, label: '1AN', days: 365 }
    ];

    // Calculer les statistiques du dashboard
    const dashboardStats = useMemo(() => {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + numberOfDays);

        // Filtrer les jobs dans la période
        const jobsInPeriod = jobs.filter(job => {
            const jobDate = new Date(job.dateDebut);
            return jobDate >= startDate && jobDate <= endDate;
        });

        // Filtrer selon le bureau si nécessaire
        const filteredJobs = filterBureau === 'tous' ? jobsInPeriod :
            jobsInPeriod.filter(job => {
                if (dashboardFilter === 'personnel') {
                    return job.personnel && job.personnel.some(p => {
                        const person = personnel.find(pers => pers.id === p);
                        return person && person.succursale === filterBureau;
                    });
                } else if (dashboardFilter === 'equipements') {
                    return job.equipements && job.equipements.some(e => {
                        const equipement = equipements.find(eq => eq.id === e);
                        return equipement && equipement.succursale === filterBureau;
                    });
                }
                return true;
            });

        // Calculer les statistiques par statut
        const stats = {
            total: filteredJobs.length,
            enCours: filteredJobs.filter(job => job.statut === 'en-cours').length,
            tentatif: filteredJobs.filter(job => job.statut === 'tentatif').length,
            planifie: filteredJobs.filter(job => job.statut === 'planifie').length,
            enAttente: filteredJobs.filter(job => job.statut === 'en-attente' || !job.statut).length,
            termine: filteredJobs.filter(job => job.statut === 'termine').length
        };

        // Calculer le pourcentage de planification du personnel
        let totalPersonnelRequis = 0;
        let personnelPlanifie = 0;

        filteredJobs.forEach(job => {
            if (job.personnel) {
                totalPersonnelRequis += job.personnel.length;
                personnelPlanifie += job.personnel.filter(p => {
                    const person = personnel.find(pers => pers.id === p);
                    return person && person.disponible !== false;
                }).length;
            }
        });

        const pourcentagePlanification = totalPersonnelRequis > 0 ?
            Math.round((personnelPlanifie / totalPersonnelRequis) * 100) : 0;

        // Statistiques par priorité
        const parPriorite = {
            urgente: filteredJobs.filter(job => job.priorite === 'urgente').length,
            haute: filteredJobs.filter(job => job.priorite === 'haute').length,
            normale: filteredJobs.filter(job => job.priorite === 'normale').length,
            faible: filteredJobs.filter(job => job.priorite === 'faible').length
        };

        // Statistiques par bureau
        const parBureau = {};
        filteredJobs.forEach(job => {
            const bureau = job.bureau || 'Non défini';
            parBureau[bureau] = (parBureau[bureau] || 0) + 1;
        });

        return {
            ...stats,
            pourcentagePlanification,
            totalPersonnelRequis,
            personnelPlanifie,
            parPriorite,
            parBureau,
            periode: numberOfDays
        };
    }, [jobs, startDate, numberOfDays, dashboardFilter, filterBureau, personnel, equipements]);

    // Responsive — au premier rendu mobile : vue Mois + mes taches par defaut.
    useEffect(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) {
            setCalendarMode('month');
            if (utilisateurConnecte?.id) setMineOnly(true);
        }
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fermer la recherche de date quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDateSearch && !event.target.closest('.date-search-container')) {
                setShowDateSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDateSearch]);

    // Générer les jours continus avec traduction
    const continuousDays = useMemo(() => {
        return generateLocalizedDays(startDate, numberOfDays, currentLanguage, isMobile);
    }, [startDate, numberOfDays, currentLanguage, isMobile]);

    // Trier le personnel par bureau puis alphabétique (nom, prénom)
    const sortPersonnel = (personnelList) => {
        return personnelList.sort((a, b) => {
            // Trier d'abord par bureau
            if (a.succursale !== b.succursale) {
                return (a.succursale || '').localeCompare(b.succursale || '');
            }

            // Puis trier alphabétiquement par nom complet
            const nomA = a.nom.toLowerCase();
            const nomB = b.nom.toLowerCase();
            return nomA.localeCompare(nomB);
        });
    };

    // Trier les équipements par bureau puis alphabétique
    const sortEquipements = (equipementsList) => {
        return equipementsList.sort((a, b) => {
            // Trier d'abord par bureau
            if (a.succursale !== b.succursale) {
                return (a.succursale || '').localeCompare(b.succursale || '');
            }

            // Puis trier alphabétiquement par nom
            const nomA = a.nom.toLowerCase();
            const nomB = b.nom.toLowerCase();
            return nomA.localeCompare(nomB);
        });
    };

    // Filtrer les ressources (personnel et équipements)
    const filteredResources = useMemo(() => {
        if (modeVueIndividuel && travailleurSelectionne) {
            if (filterType === 'personnel') {
                let filteredPersonnel = personnel.filter(person => {
                    const matchesSearch = person.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       (person.prenom && person.prenom.toLowerCase().includes(searchTerm.toLowerCase()));
                    const matchesBureau = filterBureau === 'tous' || person.succursale === filterBureau;
                    const matchesPoste = filterPoste === 'tous' || person.poste === filterPoste;
                    const visibleCalendrier = person.visibleChantier === true;
                    return matchesSearch && matchesBureau && matchesPoste && visibleCalendrier && person.id === travailleurSelectionne;
                });
                return sortPersonnel(filteredPersonnel).map(p => ({...p, type: 'personnel'}));
            } else if (filterType === 'equipements') {
                const filteredEquipements = equipements.filter(equipement => {
                    const matchesSearch = equipement.nom.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesBureau = filterBureau === 'tous' || equipement.succursale === filterBureau;
                    const visibleCalendrier = equipement.visibleChantier === true;
                    return matchesSearch && matchesBureau && visibleCalendrier && equipement.id === travailleurSelectionne;
                });
                return sortEquipements(filteredEquipements).map(e => ({...e, type: 'equipement'}));
            } else if (filterType === 'global') {
                // Vue individuelle globale - chercher dans personnel et équipements
                let filteredPersonnel = personnel.filter(person => {
                    const matchesSearch = person.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       (person.prenom && person.prenom.toLowerCase().includes(searchTerm.toLowerCase()));
                    const matchesBureau = filterBureau === 'tous' || person.succursale === filterBureau;
                    const matchesPoste = filterPoste === 'tous' || person.poste === filterPoste;
                    const visibleCalendrier = person.visibleChantier === true;
                    return matchesSearch && matchesBureau && matchesPoste && visibleCalendrier && person.id === travailleurSelectionne;
                }).map(p => ({...p, type: 'personnel'}));

                const filteredEquipements = equipements.filter(equipement => {
                    const matchesSearch = equipement.nom.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesBureau = filterBureau === 'tous' || equipement.succursale === filterBureau;
                    const visibleCalendrier = equipement.visibleChantier === true;
                    return matchesSearch && matchesBureau && visibleCalendrier && equipement.id === travailleurSelectionne;
                }).map(e => ({...e, type: 'equipement'}));

                return [...filteredPersonnel, ...sortEquipements(filteredEquipements)];
            }
            // Fallback pour éviter undefined
            return [];
        } else if (filterType === 'personnel') {
            let filteredPersonnel = personnel.filter(person => {
                const matchesSearch = person.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (person.prenom && person.prenom.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesBureau = filterBureau === 'tous' || person.succursale === filterBureau;
                const matchesPoste = filterPoste === 'tous' || person.poste === filterPoste;
                const visibleCalendrier = person.visibleChantier === true;
                return matchesSearch && matchesBureau && matchesPoste && visibleCalendrier;
            });
            return sortPersonnel(filteredPersonnel).map(p => ({...p, type: 'personnel'}));
        } else if (filterType === 'equipements') {
            return sortEquipements(equipements.filter(equipement => {
                const matchesSearch = equipement.nom.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesBureau = filterBureau === 'tous' || equipement.succursale === filterBureau;
                const visibleCalendrier = equipement.visibleChantier === true;
                return matchesSearch && matchesBureau && visibleCalendrier;
            })).map(e => ({...e, type: 'equipement'}));
        } else if (filterType === 'jobs') {
            // Vue "Événements seulement" - créer des lignes pour chaque événement
            return jobs.filter(job => {
                const matchesBureau = filterBureau === 'tous' || job.bureau === filterBureau;
                const matchesSearch = job.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    job.numeroJob?.toLowerCase().includes(searchTerm.toLowerCase());
                // Inclure tous les événements : planifiés, tentatifs, ou sans personnel assigné
                const isRelevantJob = ['planifie', 'tentatif', 'en-attente'].includes(job.statut) ||
                                    !job.personnel?.length || !job.equipements?.length;
                return matchesBureau && matchesSearch && isRelevantJob;
            }).map(job => ({
                id: `job-${job.id}`,
                nom: `${job.numeroJob} - ${job.nom}`,
                poste: job.client || 'Client non défini',
                succursale: job.bureau || job.succursaleEnCharge || 'Événement',
                bureau: job.bureau || job.succursaleEnCharge,
                type: 'job',
                job: job, // Référence au job complet
                priorite: job.priorite,
                statut: job.statut
            }));
        } else { // global
            let filteredPersonnel = personnel.filter(person => {
                const matchesSearch = person.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (person.prenom && person.prenom.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesBureau = filterBureau === 'tous' || person.succursale === filterBureau;
                const matchesPoste = filterPoste === 'tous' || person.poste === filterPoste;
                const visibleCalendrier = person.visibleChantier === true;
                return matchesSearch && matchesBureau && matchesPoste && visibleCalendrier;
            }).map(p => ({...p, type: 'personnel'}));

            const filteredEquipements = sortEquipements(equipements.filter(equipement => {
                const matchesSearch = equipement.nom.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesBureau = filterBureau === 'tous' || equipement.succursale === filterBureau;
                const visibleCalendrier = equipement.visibleChantier === true;
                return matchesSearch && matchesBureau && visibleCalendrier;
            })).map(e => ({...e, type: 'equipement'}));

            return [...filteredPersonnel, ...filteredEquipements];
        }
    }, [personnel, equipements, filterType, filterBureau, filterPoste, searchTerm, modeVueIndividuel, travailleurSelectionne]);

    // Obtenir le job pour une cellule donnée
    const getJobForCell = (resourceId, day, resourceType) => {
        const dayString = day.fullDate;

        if (resourceType === 'job') {
            // Pour la vue "événements seulement", retourner l'événement s'il tombe sur cette date
            const jobId = resourceId.replace('job-', '');
            const job = jobs.find(j => j.id.toString() === jobId);
            if (!job) return null;

            const jobDateDebut = (job.dateDebut || '').split('T')[0];
            const jobDateFin = job.dateFin ? (job.dateFin).split('T')[0] : jobDateDebut;

            return dayString >= jobDateDebut && dayString <= jobDateFin ? job : null;
        }

        return jobs.find(job => {
            const jobDateDebut = (job.dateDebut || '').split('T')[0];
            const jobDateFin = job.dateFin ? (job.dateFin).split('T')[0] : jobDateDebut;

            // Vérifier si le jour actuel est dans la plage du job
            if (!(dayString >= jobDateDebut && dayString <= jobDateFin)) return false;

            if (resourceType === 'personnel') {
                return job.personnel && job.personnel.includes(resourceId);
            } else if (resourceType === 'equipement') {
                return job.equipements && job.equipements.includes(resourceId);
            }
            return false;
        });
    };

    // Jour précédent (AAAA-MM-JJ) — pour le DÉBORDEMENT des quarts de nuit sur le matin du lendemain.
    const prevDayStr = (s) => { const dt = new Date(`${s}T12:00:00`); dt.setDate(dt.getDate() - 1); return dt.toISOString().slice(0, 10); };
    const isWeekendDay = (s) => { const wd = new Date(`${s}T12:00:00`).getDay(); return wd === 0 || wd === 6; };
    const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };

    // Horaire EFFECTIF d'une ressource pour un job à une date donnée (null si elle ne travaille pas ce
    // jour). Mode 24/24 = quart assigné (jour/soir/nuit) sinon continu ; sinon horaire perso ; sinon global.
    const getResourceScheduleFor = (job, resourceId, resourceType, dayString) => {
        if (job.modeHoraire === '24h-24') {
            const quartId = job.quartParRessource && job.quartParRessource[resourceId];
            const quart = Array.isArray(job.quarts) ? job.quarts.find(q => q.id === quartId) : null;
            if (quart) return { heureDebut: quart.debut, heureFin: quart.fin };
            return { heureDebut: '00:00', heureFin: '23:59' }; // continu (aucun quart assigné)
        }
        const cs = job.horairesIndividuels && job.horairesIndividuels[`${resourceType}_${resourceId}`];
        if (cs && cs.mode === 'personnalise') {
            if (cs.joursTravailles && !cs.joursTravailles.includes(dayString)) return null; // ne travaille pas ce jour
            return { heureDebut: cs.heureDebut || job.heureDebut || '08:00', heureFin: cs.heureFin || job.heureFin || '17:00' };
        }
        return { heureDebut: job.heureDebut || '08:00', heureFin: job.heureFin || '17:00' };
    };

    // Segments VISIBLES d'un job pour une ressource un jour donné (minutes depuis minuit, + `kind`).
    //  - quart normal (fin > début) : [début, fin] les jours de DÉMARRAGE.
    //  - quart de nuit (fin ≤ début, ex. 22:00→06:00) : SOIR [début, 24:00] le jour de démarrage +
    //    MATIN [00:00, fin] le lendemain d'un jour de démarrage.
    //  - FINS DE SEMAINE : si includeWeekendsInDuration est faux, AUCUN quart ne DÉMARRE un samedi/
    //    dimanche (mais le matin qui déborde d'un vendredi soir reste visible le samedi).
    const getJobDaySegmentsFor = (job, resourceId, resourceType, dayString) => {
        const jobDebut = (job.dateDebut || '').split('T')[0];
        const jobFin = job.dateFin ? job.dateFin.split('T')[0] : jobDebut;
        const weekendsOk = !!job.includeWeekendsInDuration;
        const isStartDay = (s) => {
            if (!(s >= jobDebut && s <= jobFin)) return false;
            if (!weekendsOk && isWeekendDay(s)) return false;          // pas de démarrage le week-end
            return getResourceScheduleFor(job, resourceId, resourceType, s) != null;
        };
        const segs = [];
        if (isStartDay(dayString)) {                                    // SOIR / journée : quart démarrant ce jour
            const s = getResourceScheduleFor(job, resourceId, resourceType, dayString);
            const mD = toMin(s.heureDebut), mF = toMin(s.heureFin);
            if (mF > mD) segs.push({ start: mD, end: mF, kind: 'day' });
            else segs.push({ start: mD, end: 24 * 60, kind: 'evening' }); // nuit -> portion du soir
        }
        const prev = prevDayStr(dayString);                            // MATIN : débordement d'un quart de nuit de la veille
        if (isStartDay(prev)) {
            const s = getResourceScheduleFor(job, resourceId, resourceType, prev);
            const mD = toMin(s.heureDebut), mF = toMin(s.heureFin);
            if (mF <= mD && mF > 0) segs.push({ start: 0, end: mF, kind: 'morning' });
        }
        return segs;
    };

    // TOUS les jobs visibles dans une cellule (timeline) : un job apparaît s'il a ≥1 segment ce jour
    // (gère plage, quart de nuit débordant, exclusion des fins de semaine — source unique de vérité).
    const getAllJobsForCell = (resourceId, day, resourceType) => {
        const dayString = day.fullDate;
        if (resourceType === 'job') {
            const jobId = resourceId.replace('job-', '');
            const job = jobs.find(j => j.id.toString() === jobId);
            if (!job) return [];
            return getJobDaySegmentsFor(job, resourceId, resourceType, dayString).length ? [job] : [];
        }
        return jobs.filter(job => {
            const assigned = resourceType === 'personnel'
                ? (job.personnel && job.personnel.includes(resourceId))
                : resourceType === 'equipement'
                    ? (job.equipements && job.equipements.includes(resourceId))
                    : false;
            if (!assigned) return false;
            return getJobDaySegmentsFor(job, resourceId, resourceType, dayString).length > 0;
        });
    };

    // Composant Timeline pour afficher les jobs dans une cellule
    const TimelineCell = ({ jobs, day, onJobClick, resourceId, resourceType }) => {
        if (!jobs || jobs.length === 0) return null;

        // Délégué (logique unique au niveau composant — voir getJobDaySegmentsFor).
        const getDaySegments = (job) => getJobDaySegmentsFor(job, resourceId, resourceType, day.fullDate);

        // Convertit un segment {start,end} (minutes depuis minuit) en position/largeur sur 24 h.
        const segToStyle = (seg) => {
            const range = 24 * 60;
            const left = Math.max(0, (seg.start / range) * 100);
            const width = Math.min(100 - left, ((seg.end - seg.start) / range) * 100);
            return { left: `${left}%`, width: `${Math.max(8, width)}%` };
        };

        // Fonction pour détecter les conflits d'horaires et organiser en lignes
        const organizeJobsInLayers = (jobs) => {
            const layers = [];

            jobs.forEach(job => {
                const heureDebut = job.heureDebut || '08:00';
                const heureFin = job.heureFin || '17:00';

                // Convertir en minutes pour comparaison
                const [debutH, debutM] = heureDebut.split(':').map(Number);
                const [finH, finM] = heureFin.split(':').map(Number);
                const debut = debutH * 60 + debutM;
                const fin = finH * 60 + finM;

                // Trouver une ligne disponible
                let layerIndex = 0;
                while (layerIndex < layers.length) {
                    const layer = layers[layerIndex];
                    let canPlace = true;

                    // Vérifier si ce job peut être placé dans cette ligne
                    for (const existingJob of layer) {
                        const existingDebut = existingJob.debut;
                        const existingFin = existingJob.fin;

                        // Chevauchement si début < existingFin ET fin > existingDebut
                        if (debut < existingFin && fin > existingDebut) {
                            canPlace = false;
                            break;
                        }
                    }

                    if (canPlace) {
                        layer.push({ job, debut, fin });
                        break;
                    }

                    layerIndex++;
                }

                // Si aucune ligne disponible, créer une nouvelle ligne
                if (layerIndex === layers.length) {
                    layers.push([{ job, debut, fin }]);
                }
            });

            return layers;
        };

        // Déterminer la couleur basée sur le mode sélectionné
        const getJobColor = (job) => {
            if (colorMode === 'succursale' && job.succursaleEnCharge) {
                const bureauColor = BUREAU_COLORS[job.succursaleEnCharge];
                if (bureauColor) {
                    return `text-white`;
                }
            }

            // Fallback sur priorité
            switch(job.priorite) {
                case 'urgente': return 'bg-red-500 text-white';
                case 'haute': return 'bg-orange-500 text-white';
                case 'normale': return 'bg-blue-500 text-white';
                default: return 'bg-green-500 text-white';
            }
        };

        // Fonction pour obtenir le style de couleur
        const getJobStyle = (job) => {
            if (colorMode === 'succursale' && job.succursaleEnCharge) {
                // Chercher la succursale dans la liste des succursales créées
                const succursaleObj = succursales.find(s => s.nom === job.succursaleEnCharge);
                if (succursaleObj && succursaleObj.couleur) {
                    return {
                        backgroundColor: succursaleObj.couleur,
                        color: '#ffffff'
                    };
                }
            }

            // Fallback sur priorité avec couleurs par défaut
            switch(job.priorite) {
                case 'urgente': return { backgroundColor: '#ef4444', color: '#ffffff' };
                case 'haute': return { backgroundColor: '#f59e0b', color: '#ffffff' };
                case 'normale': return { backgroundColor: '#3b82f6', color: '#ffffff' };
                default: return { backgroundColor: '#10b981', color: '#ffffff' };
            }
        };

        const allLayers = organizeJobsInLayers(jobs);
        const LABEL_AREA = 14;   // reserve pour les libelles d'heures en bas
        const MIN_LAYER = 16;    // hauteur minimale lisible par ligne d'evenement
        const usableH = CELL_HEIGHT - LABEL_AREA;
        const maxLayers = Math.max(1, Math.floor(usableH / MIN_LAYER));
        const jobLayers = allLayers.slice(0, maxLayers);
        const hiddenLayers = allLayers.length - jobLayers.length;
        const layerHeight = Math.floor(usableH / jobLayers.length);

        // CONGÉ du jour pour cette personne : la demande EN ATTENTE s'affiche en ROUGE sur le calendrier
        // (approuvée = vert). Tolère les deux conventions de champs (snake_case canonique / legacy camelCase).
        const dayConge = (resourceType === 'personnel') ? (conges || []).find(c => {
            const pid = c.personnel_id ?? c.personnelId;
            if (String(pid) !== String(resourceId)) return false;
            const st = String(c.start_date ?? c.dateDebut ?? '').slice(0, 10);
            const en = String(c.end_date ?? c.dateFin ?? st).slice(0, 10);
            const status = c.status ?? c.statut;
            if (status === 'cancelled' || status === 'annule' || status === 'rejected' || status === 'refuse') return false;
            return day.fullDate >= st && day.fullDate <= en;
        }) : null;
        const congePending = dayConge && (((dayConge.status ?? dayConge.statut) === 'pending') || ((dayConge.status ?? dayConge.statut) === 'en_attente'));

        return (
            <div className="relative w-full h-20 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded">
                {/* Congé : bande ROUGE = en attente d'approbation ; verte = approuvé */}
                {dayConge && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-1 overflow-hidden px-1" style={{ height: 13, backgroundColor: congePending ? '#ef4444' : '#10b981' }} title={congePending ? tr('Congé EN ATTENTE d\'approbation', 'Leave PENDING approval') : tr('Congé approuvé', 'Approved leave')}>
                        <span className="truncate text-[8px] font-bold text-white">{congePending ? `⏳ ${tr('Congé — en attente', 'Leave — pending')}` : `🌴 ${tr('Congé', 'Leave')}`}</span>
                    </div>
                )}
                {/* Grille d'heures en arrière-plan */}
                <div className="absolute inset-0 flex opacity-25">
                    {Array.from({length: 12}, (_, i) => (
                        <div key={i} className="flex-1 border-r border-gray-300 dark:border-gray-600 last:border-r-0"></div>
                    ))}
                </div>

                {/* Marqueur quand plusieurs événements le même jour */}
                {jobs.length > 1 && (
                    <span className="absolute top-0.5 right-0.5 z-30 rounded-full bg-gray-800 px-1.5 text-[9px] font-bold leading-4 text-white shadow" title={`${jobs.length} événements ce jour — survolez chaque barre pour le détail`}>
                        {jobs.length}
                    </span>
                )}

                {/* Affichage des jobs organisés en lignes */}
                {jobLayers.map((layer, layerIndex) => (
                    <div
                        key={layerIndex}
                        className="absolute w-full px-0.5"
                        style={{
                            top: `${layerIndex * layerHeight}px`,
                            height: `${layerHeight - 2}px`
                        }}
                    >
                        {layer.map(({ job }, jobIndex) => {
                            const aControler = jobNeedsControl(job);
                            if (controleOnly && !aControler) return null; // R9 : filtre « à contrôler »
                            const colorStyle = getJobStyle(job);
                            // Un job peut avoir PLUSIEURS segments le même jour (quart de nuit : soir + matin
                            // de la veille) -> on rend une boîte par segment.
                            const segs = getDaySegments(job);
                            if (!segs.length) return null;
                            return segs.map((seg, si) => {
                                const timelineStyle = segToStyle(seg);
                                const isMorningSpill = seg.kind === 'morning';
                                return (
                                <div
                                    key={`${job.id}-${layerIndex}-${jobIndex}-${si}`}
                                    className={`absolute h-full rounded border shadow-sm px-1 cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-white/80 hover:z-20 flex flex-col justify-center overflow-hidden ${aControler ? 'border-amber-400 ring-1 ring-amber-400' : 'border-white/40'}`}
                                    style={{
                                        left: timelineStyle.left,
                                        width: timelineStyle.width,
                                        fontSize: layerHeight > 25 ? '11px' : layerHeight > 15 ? '10px' : '8px',
                                        backgroundColor: colorStyle.backgroundColor,
                                        color: colorStyle.color
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJobClick(job);
                                    }}
                                    title={`${job.numeroJob || `Job-${job.id}`}${job.client ? ` — ${job.client}` : ''}${isMorningSpill ? `\n${tr('↳ Fin du quart de nuit (00:00→fin)', '↳ End of night shift (00:00→end)')}` : ''}${aControler ? `\n⚠ ${jobControlReasons(job).join(' · ')}` : ''}`}
                                >
                                    {aControler && <span className="absolute right-0 top-0 text-[10px] leading-none" title={jobControlReasons(job).join(' · ')}>⚠️</span>}
                                    {/* Contenu de l'événement (tronqué si étroit) */}
                                    <div className="text-center leading-tight overflow-hidden">
                                        <div className="font-bold truncate">
                                            {isMorningSpill && '↳ '}{job.numeroJob || `Job-${job.id}`}
                                        </div>
                                        <div className="truncate opacity-90">
                                            {job.client}
                                        </div>
                                    </div>
                                </div>
                                );
                            });
                        })}
                    </div>
                ))}

                {/* Conflit d'horaire : bande rouge sur la portion de journée où 2+ événements se chevauchent */}
                {(() => {
                    const iv = jobs.map(j => {
                        const [dh, dm] = (j.heureDebut || '08:00').split(':').map(Number);
                        const [fh, fm] = (j.heureFin || '17:00').split(':').map(Number);
                        return { d: dh * 60 + dm, f: fh * 60 + fm };
                    });
                    const overlaps = [];
                    for (let i = 0; i < iv.length; i++) {
                        for (let k = i + 1; k < iv.length; k++) {
                            const s = Math.max(iv[i].d, iv[k].d);
                            const e = Math.min(iv[i].f, iv[k].f);
                            if (s < e) overlaps.push([s, e]);
                        }
                    }
                    if (!overlaps.length) return null;
                    const tStart = 0, tEnd = 24 * 60, range = tEnd - tStart;
                    return overlaps.map(([s, e], i) => {
                        const left = Math.max(0, ((s - tStart) / range) * 100);
                        const width = Math.min(100 - left, ((e - s) / range) * 100);
                        return (
                            <div key={`ovl-${i}`} className="pointer-events-none absolute top-0 bottom-3 z-10 border-x-2 border-red-500 bg-red-500/30"
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={tr("⚠️ Conflit d'horaire (chevauchement)", '⚠️ Schedule conflict (overlap)')} />
                        );
                    });
                })()}

                {/* Indicateur de débordement : événements non affichés faute de place */}
                {hiddenLayers > 0 && (
                    <span className="absolute bottom-3 right-0.5 z-30 rounded bg-gray-700 px-1 text-[8px] font-bold text-white" title={`${hiddenLayers} ligne(s) d'événements supplémentaires`}>
                        +{hiddenLayers}
                    </span>
                )}

                {/* Indicateurs d'heures */}
                <div className="absolute inset-x-0 bottom-0 h-3 flex text-xs text-gray-500 dark:text-gray-400 opacity-70 pointer-events-none">
                    <div className="text-center text-[9px]">0h</div>
                    <div className="flex-1"></div>
                    <div className="text-center text-[9px]">6h</div>
                    <div className="flex-1"></div>
                    <div className="text-center text-[9px]">12h</div>
                    <div className="flex-1"></div>
                    <div className="text-center text-[9px]">18h</div>
                    <div className="flex-1"></div>
                    <div className="text-center text-[9px]">24h</div>
                </div>
            </div>
        );
    };

    // Fonction pour ouvrir un job en conflit en parallèle
    const handleOpenConflictJob = (conflictingJob) => {
        setConflictJob(conflictingJob);
    };

    // Gestion du clic sur une cellule
    const handleCellClick = (resourceId, day, resourceType) => {
        const existingJob = getJobForCell(resourceId, day, resourceType);

        if (existingJob) {
            setSelectedJob(existingJob);
        } else {
            // Créer un nouveau job
            const newJob = {
                id: null,
                nom: '',
                dateDebut: day.fullDate,
                heureDebut: '08:00',
                heureFin: '17:00',
                personnel: resourceType === 'personnel' ? [resourceId] : [],
                equipements: resourceType === 'equipement' ? [resourceId] : [],
                sousTraitants: [],
                statut: 'planifie',
                priorite: 'normale'
            };
            setSelectedJob(newJob);
        }
    };

    // Navigation
    const navigateWeeks = (direction) => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setStartDate(newDate);
    };

    const goToToday = () => {
        setStartDate(new Date());
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            {/* Barre de contrôles */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                    {/* Statistiques + Actions rapides */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="hidden sm:block flex-1">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {jobs.length} {tr('événements', 'events')} · {personnel.length} {tr('techniciens', 'technicians')} · {equipements.length} {tr('équipements', 'equipment')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tr('Vue', 'View')} {modeVueIndividuel ? tr('individuelle', 'individual') : tr('globale', 'global')} · {numberOfDays} {tr('jours', 'days')}
                            </p>
                        </div>
                        {/* Actions rapides */}
                        <div className="flex flex-wrap gap-2">
                            {/* Bascule Grille (ressources) / Mois (calendrier classique) — visible aussi en mobile. */}
                            <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                <button onClick={() => setCalendarMode('grid')}
                                    className={`px-3 py-1.5 text-xs font-semibold ${calendarMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>📊 Grille</button>
                                <button onClick={() => setCalendarMode('month')}
                                    className={`px-3 py-1.5 text-xs font-semibold ${calendarMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>📅 Mois</button>
                            </div>
                            {/* Créer/Congés : visibles desktop ; sur mobile → onglet « Actions » du hamburger. */}
                            {onCreateEvent && (
                                <button onClick={onCreateEvent}
                                    className="hidden lg:flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                    <Icon name="plus" size={13} /> {tr('Créer événement', 'Create event')}
                                </button>
                            )}
                            {onManageConges && (
                                <button onClick={onManageConges}
                                    className="hidden lg:flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <Icon name="calendar" size={13} /> {tr('Congés', 'Time off')}
                                </button>
                            )}
                            {/* Bouton « Ressources » retiré — personnel et équipements sont gérés via Admin. */}
                        </div>
                    </div>


                    {/* Navigation temporelle : visible desktop ; sur mobile → onglet « Actions » du hamburger. */}
                    <div className="hidden lg:flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => navigateWeeks(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200"
                        >
                            <Icon name="chevronLeft" size={20} />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                            {t('calendar.today')}
                        </button>
                        <button
                            onClick={() => navigateWeeks(1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200"
                        >
                            <Icon name="chevronRight" size={20} />
                        </button>

                        {/* Sélecteur de vue temporelle et période — masque en mobile (dans le hamburger) */}
                        <select
                            value={timeView.startsWith('period-') ? timeView : timeView}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.startsWith('period-')) {
                                    setTimeView(value);
                                    setNumberOfDays(parseInt(value.replace('period-', '')));
                                } else {
                                    setTimeView(value);
                                }
                            }}
                            className="hidden md:block px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        >
                            <optgroup label={t('calendar.detailedViews')}>
                                <option value="1day">{t('calendar.day')}</option>
                                <option value="1week">{t('calendar.1week')}</option>
                                <option value="2weeks">{t('calendar.2weeks')}</option>
                            </optgroup>
                            <optgroup label={t('calendar.extendedPeriods')}>
                                <option value="period-21">{t('calendar.3weeks')}</option>
                                <option value="period-30">{t('calendar.1month')}</option>
                                <option value="period-90">{t('calendar.3months')}</option>
                                <option value="period-180">{t('calendar.6months')}</option>
                                <option value="period-365">{t('calendar.1year')}</option>
                            </optgroup>
                        </select>

                        {/* Sélecteur de mode de couleur — masque en mobile (dans le hamburger) */}
                        <select
                            value={colorMode}
                            onChange={(e) => setColorMode(e.target.value)}
                            className="hidden md:block px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                            title={t('calendar.colorMode')}
                        >
                            <option value="succursale">{t('calendar.colorByBranch')}</option>
                            <option value="priorite">{t('calendar.colorByPriority')}</option>
                        </select>

                        {/* Recherche de date rapide */}
                        <div className="relative date-search-container">
                            <button
                                onClick={() => setShowDateSearch(!showDateSearch)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                title={tr('Aller à une date', 'Go to a date')}
                            >
                                <Icon name="calendar" size={20} />
                            </button>

                            {showDateSearch && (
                                <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 z-50 min-w-[250px]">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{tr('Aller à une date', 'Go to a date')}</h4>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={quickDate}
                                            onChange={(e) => setQuickDate(e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm border rounded"
                                            placeholder="YYYY-MM-DD"
                                        />
                                        <button
                                            onClick={handleQuickDateGo}
                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                        >
                                            {tr('Aller', 'Go')}
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {tr('Sélectionnez une date pour y naviguer rapidement', 'Pick a date to jump to it quickly')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 mt-2 lg:mt-4">
                    <div className="flex flex-1 gap-2">
                        {/* Menu hamburger avec titre */}
                        <div className="relative flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('filter.filters')}</span>
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border dark:border-gray-600"
                                title={t('filter.menuFilters')}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-90' : ''}`}
                                >
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                </svg>
                            </button>

                            {/* Menu déroulant avec onglets */}
                            {showFilterMenu && (
                                <>
                                    <div className="absolute top-full left-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                        <div className="p-4">
                                            {/* Header du menu */}
                                            <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {t('filter.filtersAndOptions')}
                                                </h3>
                                                {/* Recherche (mobile — l'inline est masqué < lg) */}
                                                <div className="relative mt-3 lg:hidden">
                                                    <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                                    <input type="text" placeholder={t('form.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600" />
                                                </div>
                                            </div>

                                            {/* (Bouton Créer événement retiré — déjà dans la barre du haut ;
                                                Paramètres/Thème retirés — gérés dans le header principal) */}

                                            {/* Onglets */}
                                            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                                                {[
                                                    { key: 'actions', label: tr('Actions', 'Actions'), icon: '➕' },
                                                    { key: 'type', label: t ? t('filter.type') : 'Type', icon: '🔍' },
                                                    { key: 'bureau', label: 'Site', icon: '🏢' },
                                                    { key: 'poste', label: t ? t('filter.position') : 'Poste', icon: '👔' },
                                                    { key: 'vue', label: t ? t('filter.view') : 'Vue', icon: '👁️' }
                                                ].map((tab) => (
                                                    <button
                                                        key={tab.key}
                                                        onClick={() => setActiveFilterTab(tab.key)}
                                                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                                                            activeFilterTab === tab.key
                                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                        }`}
                                                    >
                                                        <span className="mr-1">{tab.icon}</span>
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Contenu des onglets */}
                                            <div className="min-h-[200px]">
                                                {/* Onglet Actions (Créer / Congés / Navigation) — regroupe les fonctions
                                                    autrefois éparpillées dans la barre du haut (mobile propre). */}
                                                {activeFilterTab === 'actions' && (
                                                    <div className="space-y-4">
                                                        {/* Poinçon intégré au hamburger (composant autonome PunchWidget). */}
                                                        {tenant && (
                                                            <div className="space-y-1">
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">⏱ {tr('Poinçon', 'Time clock')}</label>
                                                                <PunchWidget tenant={tenant} />
                                                            </div>
                                                        )}
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{tr('Actions rapides', 'Quick actions')}</label>
                                                            {onCreateEvent && (
                                                                <button onClick={() => { onCreateEvent(); setShowFilterMenu(false); }}
                                                                    className="flex w-full items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                                                    <Icon name="plus" size={14} /> {tr('Créer événement', 'Create event')}
                                                                </button>
                                                            )}
                                                            {onManageConges && (
                                                                <button onClick={() => { onManageConges(); setShowFilterMenu(false); }}
                                                                    className="flex w-full items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <Icon name="calendar" size={14} /> {tr('Congés', 'Time off')}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{tr('Navigation', 'Navigation')}</label>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => navigateWeeks(-1)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">←</button>
                                                                <button onClick={goToToday} className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600">{t('calendar.today')}</button>
                                                                <button onClick={() => navigateWeeks(1)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">→</button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input type="date" value={quickDate} onChange={(e) => setQuickDate(e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600" />
                                                                <button onClick={handleQuickDateGo} className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600">{tr('Aller', 'Go')}</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Onglet Type de vue */}
                                                {activeFilterTab === 'type' && (
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                                                            {t('filter.selectViewType')}
                                                        </label>
                                                        {[
                                                            { value: 'personnel', label: t('viewType.personnel'), desc: t('filter.personnelOnly') },
                                                            { value: 'equipements', label: t('viewType.equipment'), desc: t('filter.equipmentOnly') },
                                                            { value: 'global', label: t('viewType.global'), desc: t('filter.globalView') },
                                                            { value: 'jobs', label: t('viewType.events'), desc: t('filter.eventsOnly') },
                                                            { value: 'dashboard', label: t('viewType.dashboard'), desc: t('filter.dashboardView') }
                                                        ].map((type) => (
                                                            <button
                                                                key={type.value}
                                                                onClick={() => {
                                                                    setFilterType(type.value);
                                                                    if (type.value === 'equipements') {
                                                                        setModeVueIndividuel(false);
                                                                        setTravailleurSelectionne('');
                                                                    }
                                                                }}
                                                                className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                                                                    filterType === type.value
                                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-transparent'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{type.label}</span>
                                                                    {filterType === type.value && (
                                                                        <span className="ml-auto text-blue-600">✓</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.desc}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Onglet Bureau */}
                                                {activeFilterTab === 'bureau' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                                                            {t('filter.filterByOffice')}
                                                        </label>
                                                        <select
                                                            value={filterBureau}
                                                            onChange={(e) => setFilterBureau(e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            {getBureauOptions().map(bureau =>
                                                                <option key={bureau.value} value={bureau.value}>{bureau.label}</option>
                                                            )}
                                                        </select>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                            {t('filter.selectOfficeResource')}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Onglet Poste */}
                                                {activeFilterTab === 'poste' && (
                                                    <div>
                                                        {(filterType === 'personnel' || filterType === 'global') ? (
                                                            <>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                                                                    {t('filter.filterByPosition')}
                                                                </label>
                                                                <select
                                                                    value={filterPoste}
                                                                    onChange={(e) => setFilterPoste(e.target.value)}
                                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    {getPosteOptions().map(poste =>
                                                                        <option key={poste.value} value={poste.value}>{poste.label}</option>
                                                                    )}
                                                                </select>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                    {t('filter.showPersonnelPosition')}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                                <p>{t('filter.positionNotAvailable')}</p>
                                                                <p className="text-xs mt-1">{t('filter.selectPersonnelOrGlobal')}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Onglet Vue */}
                                                {activeFilterTab === 'vue' && (
                                                    <div className="space-y-4">
                                                        {/* Affichage : Grille / Mois (repris dans le hamburger pour le mobile) */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('calendar.display') || 'Affichage'}</label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button onClick={() => setCalendarMode('grid')}
                                                                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${calendarMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>📊 Grille</button>
                                                                <button onClick={() => setCalendarMode('month')}
                                                                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${calendarMode === 'month' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>📅 Mois</button>
                                                            </div>
                                                        </div>

                                                        {/* Periode (vue grille) */}
                                                        {calendarMode === 'grid' && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('calendar.period') || 'Période'}</label>
                                                                <select
                                                                    value={timeView}
                                                                    onChange={(e) => { const v = e.target.value; setTimeView(v); if (v.startsWith('period-')) setNumberOfDays(parseInt(v.replace('period-', ''))); }}
                                                                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                                                                >
                                                                    <optgroup label={t('calendar.detailedViews')}>
                                                                        <option value="1day">{t('calendar.day')}</option>
                                                                        <option value="1week">{t('calendar.1week')}</option>
                                                                        <option value="2weeks">{t('calendar.2weeks')}</option>
                                                                    </optgroup>
                                                                    <optgroup label={t('calendar.extendedPeriods')}>
                                                                        <option value="period-21">{t('calendar.3weeks')}</option>
                                                                        <option value="period-30">{t('calendar.1month')}</option>
                                                                        <option value="period-90">{t('calendar.3months')}</option>
                                                                        <option value="period-180">{t('calendar.6months')}</option>
                                                                        <option value="period-365">{t('calendar.1year')}</option>
                                                                    </optgroup>
                                                                </select>
                                                            </div>
                                                        )}

                                                        {/* Mes taches uniquement */}
                                                        {utilisateurConnecte?.id && (
                                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="rounded" />
                                                                {tr('Mes tâches seulement', 'My tasks only')}
                                                            </label>
                                                        )}

                                                        {/* Mode couleur */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                                {tr('Mode de couleur', 'Color mode')}
                                                            </label>
                                                            <div className="space-y-2">
                                                                <button
                                                                    onClick={() => setColorMode('priorite')}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                                        colorMode === 'priorite'
                                                                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-transparent'
                                                                    }`}
                                                                >
                                                                    🎯 {tr('Couleur par priorité', 'Color by priority')}
                                                                </button>
                                                                <button
                                                                    onClick={() => setColorMode('succursale')}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                                        colorMode === 'succursale'
                                                                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-transparent'
                                                                    }`}
                                                                >
                                                                    🏢 {tr('Couleur par bureau', 'Color by office')}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Vue individuelle */}
                                                        {(filterType === 'personnel' || filterType === 'global') && (
                                                            <div>
                                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={modeVueIndividuel}
                                                                        onChange={(e) => {
                                                                            setModeVueIndividuel(e.target.checked);
                                                                            if (!e.target.checked) {
                                                                                setTravailleurSelectionne('');
                                                                            }
                                                                        }}
                                                                        className="rounded"
                                                                    />
                                                                    {tr('Vue individuelle', 'Individual view')}
                                                                </label>
                                                                {modeVueIndividuel && (
                                                                    <select
                                                                        value={travailleurSelectionne}
                                                                        onChange={(e) => setTravailleurSelectionne(e.target.value)}
                                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                    >
                                                                        <option value="">{tr('Sélectionner...', 'Select...')}</option>
                                                                        {filterType === 'personnel' && personnel.map(person =>
                                                                            <option key={person.id} value={person.id}>{person.nom}</option>
                                                                        )}
                                                                        {filterType === 'global' && [
                                                                            ...personnel.map(person =>
                                                                                <option key={person.id} value={person.id}>👤 {person.nom}</option>
                                                                            ),
                                                                            ...equipements.map(equipement =>
                                                                                <option key={equipement.id} value={equipement.id}>🔧 {equipement.nom}</option>
                                                                            )
                                                                        ]}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay pour fermer le menu */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowFilterMenu(false)}
                                    ></div>
                                </>
                            )}
                        </div>

                        {/* Recherche : visible desktop ; sur mobile → dans l'en-tête du hamburger. */}
                        <div className="hidden lg:block relative flex-1 max-w-md">
                            <Icon
                                name="search"
                                size={18}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            />
                            <input
                                type="text"
                                placeholder={t('form.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal - Dashboard ou Calendrier */}
            <div className="p-4">
                {calendarMode === 'month' ? (
                    /* Vue calendrier mensuelle conventionnelle (responsive) : grille du mois + détail du jour cliqué */
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <button onClick={() => setMonthCursor(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">←</button>
                            <div className="text-base font-bold capitalize text-gray-800 dark:text-gray-100">{monthCursor.toLocaleDateString(currentLanguage === 'fr' ? 'fr-CA' : 'en-CA', { month: 'long', year: 'numeric' })}</div>
                            <button onClick={() => setMonthCursor(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">→</button>
                        </div>
                        {(() => {
                            const y = monthCursor.getFullYear(), mo = monthCursor.getMonth();
                            const first = new Date(y, mo, 1);
                            const startDow = (first.getDay() + 6) % 7; // lundi = 0
                            const daysInMonth = new Date(y, mo + 1, 0).getDate();
                            const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            const myId = utilisateurConnecte?.id;
                            const evMatch = (job) => {
                                const okB = filterBureau === 'tous' || job.bureau === filterBureau || job.succursaleEnCharge === filterBureau;
                                const okS = !searchTerm || `${job.numeroJob || ''} ${job.nom || ''} ${job.client || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
                                const okMine = !mineOnly || !myId || (Array.isArray(job.personnel) && job.personnel.map(String).includes(String(myId))) || String(job.responsable) === String(myId);
                                const okControle = !controleOnly || jobNeedsControl(job);
                                return okB && okS && okMine && okControle;
                            };
                            const jobsOnDay = (ds) => jobs.filter(j => evMatch(j) && (j.dateDebut || '').split('T')[0] <= ds && ds <= ((j.dateFin || j.dateDebut || '').split('T')[0]));
                            const cells = [];
                            for (let i = 0; i < startDow; i++) cells.push(null);
                            for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, mo, d));
                            const todayStr = fmt(new Date());
                            return (
                                <>
                                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                        {(currentLanguage === 'fr' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => <div key={d}>{d}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {cells.map((d, i) => {
                                            if (!d) return <div key={`e${i}`} />;
                                            const ds = fmt(d);
                                            const evs = jobsOnDay(ds);
                                            const isSel = selectedCalDay === ds;
                                            const isToday = ds === todayStr;
                                            return (
                                                <button key={ds} onClick={() => setSelectedCalDay(ds)}
                                                    className={`min-h-[54px] rounded-lg border p-1 text-left align-top transition ${isSel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-700' : isToday ? 'border-blue-300 bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>{d.getDate()}</span>
                                                        {evs.length > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-[9px] font-bold leading-4 text-white">{evs.length}</span>}
                                                    </div>
                                                    {evs.slice(0, 2).map(e => { const ctrl = jobNeedsControl(e); return <div key={e.id} title={ctrl ? jobControlReasons(e).join(' · ') : undefined} className={`mt-0.5 truncate rounded px-1 text-[9px] ${ctrl ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'}`}>{ctrl ? '⚠️ ' : ''}{e.numeroJob || e.nom}</div>; })}
                                                    {evs.length > 2 && <div className="text-[9px] text-gray-400 dark:text-gray-500">+{evs.length - 2}</div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* #52 — boutons de filtre (Mes taches / A controler) sous le calendrier en vue Mois */}
                                    <div className="flex justify-center gap-2">
                                        {utilisateurConnecte?.id && (
                                            <button onClick={() => setMineOnly(v => !v)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${mineOnly ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                                {mineOnly ? `👤 ${tr('Mes tâches', 'My tasks')}` : tr('Toutes les tâches', 'All tasks')}
                                            </button>
                                        )}
                                        <button onClick={() => setControleOnly(v => !v)}
                                            title={tr('Afficher seulement les mandats à contrôler', 'Show only jobs needing control')}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${controleOnly ? 'bg-amber-500 text-white' : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            ⚠️ {tr('À contrôler', 'To control')}
                                        </button>
                                    </div>
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-sm font-bold capitalize text-gray-700 dark:text-gray-200">
                                            {selectedCalDay ? new Date(`${selectedCalDay}T12:00:00`).toLocaleDateString(currentLanguage === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'long', day: 'numeric', month: 'long' }) : tr('Touchez un jour pour voir ses événements', 'Tap a day to see its events')}
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {(selectedCalDay ? jobsOnDay(selectedCalDay) : []).map(e => (
                                                <button key={e.id} onClick={() => setSelectedJob(e)} className="flex w-full flex-col gap-1 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <div className="flex w-full items-center gap-2">
                                                        {jobNeedsControl(e) && <span className="shrink-0" title={jobControlReasons(e).join(' · ')}>⚠️</span>}
                                                        <span className="shrink-0 text-xs font-bold text-blue-700 dark:text-blue-400">{e.numeroJob || `Job-${e.id}`}</span>
                                                        <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">{e.client || e.nom || '—'}</span>
                                                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{e.heureDebut || '08:00'}–{e.heureFin || '17:00'}</span>
                                                    </div>
                                                    {/* Description de la tâche (demande Eric — visible en vue Mois, pas en grille où elle est déjà dans la case). */}
                                                    {(e.description || e.nom) && (
                                                        <p className="w-full whitespace-pre-wrap break-words text-xs text-gray-600 dark:text-gray-300">{e.description || e.nom}</p>
                                                    )}
                                                </button>
                                            ))}
                                            {selectedCalDay && jobsOnDay(selectedCalDay).length === 0 && <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">{tr('Aucun événement ce jour.', 'No event on this day.')}</div>}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                ) : filterType === 'dashboard' ? (
                    /* Vue Dashboard Analytique Avancé */
                    <AnalyticsDashboard
                        jobs={jobs}
                        personnel={personnel}
                        equipements={equipements}
                        filterBureau={filterBureau}
                        dateDebut={startDate}
                        dateFin={new Date(startDate.getTime() + numberOfDays * 24 * 60 * 60 * 1000)}
                    />
                ) : filterType === 'dashboard-old' ? (
                    /* Ancien Dashboard Simple */
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">📊 Dashboard C-Secur360</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Vue d'ensemble des activités sur {dashboardStats.periode} jours
                                {dashboardFilter === 'personnel' && ' - Focus Personnel'}
                                {dashboardFilter === 'equipements' && ' - Focus Équipements'}
                            </p>
                        </div>

                        {/* Cartes statistiques principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Total Événements</p>
                                        <p className="text-2xl font-bold text-blue-900">{dashboardStats.total}</p>
                                    </div>
                                    <div className="text-blue-500 text-2xl">📋</div>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">En Cours</p>
                                        <p className="text-2xl font-bold text-green-900">{dashboardStats.enCours}</p>
                                    </div>
                                    <div className="text-green-500 text-2xl">⚡</div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-600">Tentatif</p>
                                        <p className="text-2xl font-bold text-yellow-900">{dashboardStats.tentatif}</p>
                                    </div>
                                    <div className="text-yellow-500 text-2xl">⏳</div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-600">En Attente</p>
                                        <p className="text-2xl font-bold text-red-900">{dashboardStats.enAttente}</p>
                                    </div>
                                    <div className="text-red-500 text-2xl">⏸️</div>
                                </div>
                            </div>
                        </div>

                        {/* Section planification personnel */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">👥 Planification Personnel</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">Personnel requis:</span>
                                        <span className="font-semibold">{dashboardStats.totalPersonnelRequis}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">Personnel planifié:</span>
                                        <span className="font-semibold">{dashboardStats.personnelPlanifie}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">Taux de planification:</span>
                                        <span className={`font-semibold ${
                                            dashboardStats.pourcentagePlanification >= 80 ? 'text-green-600' :
                                            dashboardStats.pourcentagePlanification >= 60 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {dashboardStats.pourcentagePlanification.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                dashboardStats.pourcentagePlanification >= 80 ? 'bg-green-500' :
                                                dashboardStats.pourcentagePlanification >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${Math.min(dashboardStats.pourcentagePlanification, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Répartition par Priorité</h3>
                                <div className="space-y-3">
                                    {Object.entries(dashboardStats.parPriorite).map(([priorite, count]) => (
                                        <div key={priorite} className="flex justify-between items-center">
                                            <span className={`font-medium ${
                                                priorite === 'urgente' ? 'text-red-600' :
                                                priorite === 'haute' ? 'text-orange-600' :
                                                priorite === 'normale' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                                {priorite === 'urgente' ? '🔴 Urgente' :
                                                 priorite === 'haute' ? '🟠 Haute' :
                                                 priorite === 'normale' ? '🟡 Normale' : '🟢 Basse'}:
                                            </span>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section par bureau */}
                        {Object.keys(dashboardStats.parBureau).length > 1 && (
                            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🏢 Répartition par Bureau</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(dashboardStats.parBureau).map(([bureau, count]) => (
                                        <div key={bureau} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{bureau || 'Non défini'}:</span>
                                            <span className="font-semibold text-blue-600">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Vue Calendrier */
                <div className="space-y-4">
                    {/* Agenda mobile (vue verticale déroulante) — événements groupés par jour, lisible sur petit écran.
                        Remplace la grille horizontale (cachée < lg). Affiche par défaut les tâches de l'utilisateur
                        connecté (mineOnly, défaut ON sur mobile), basculable via le bouton ci-dessous. */}
                    <div className="lg:hidden space-y-2">
                        <div className="px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">📅 {tr("Agenda — touchez un événement pour l'ouvrir", 'Agenda — tap an event to open it')}</div>
                        {/* Bascule Mes tâches / Toutes + À contrôler (cohérent avec la vue Mois) */}
                        <div className="flex justify-center gap-2">
                            {utilisateurConnecte?.id && (
                                <button onClick={() => setMineOnly(v => !v)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${mineOnly ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    {mineOnly ? `👤 ${tr('Mes tâches', 'My tasks')}` : tr('Toutes les tâches', 'All tasks')}
                                </button>
                            )}
                            <button onClick={() => setControleOnly(v => !v)}
                                title={tr('Afficher seulement les mandats à contrôler', 'Show only jobs needing control')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${controleOnly ? 'bg-amber-500 text-white' : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                ⚠️ {tr('À contrôler', 'To control')}
                            </button>
                        </div>
                        {/* Liste VERTICALE des journées de la période (équivalent vertical de la grille horizontale
                            desktop) : on déroule jour par jour, même les journées sans tâche, pour scroller le
                            calendrier de l'utilisateur. */}
                        <div className="max-h-[calc(100vh-210px)] space-y-2 overflow-y-auto pr-0.5">
                        {(() => {
                            const myId = utilisateurConnecte?.id;
                            const evMatch = (job) => {
                                const okB = filterBureau === 'tous' || job.bureau === filterBureau || job.succursaleEnCharge === filterBureau;
                                const okS = !searchTerm || `${job.numeroJob || ''} ${job.nom || ''} ${job.client || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
                                const okMine = !mineOnly || !myId || (Array.isArray(job.personnel) && job.personnel.map(String).includes(String(myId))) || String(job.responsable) === String(myId);
                                const okControle = !controleOnly || jobNeedsControl(job);
                                return okB && okS && okMine && okControle;
                            };
                            const dayJobs = (ds) => (jobs || []).filter(j => {
                                if (!evMatch(j)) return false;
                                const deb = (j.dateDebut || j.dateFin || '').split('T')[0];
                                const fin = (j.dateFin || j.dateDebut || '').split('T')[0] || deb;
                                return deb && deb <= ds && ds <= fin;
                            });
                            return continuousDays.map((day) => {
                                const ds = day.fullDate;
                                const evs = dayJobs(ds).slice().sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));
                                return (
                                    <div key={ds} className={`overflow-hidden rounded-lg border ${day.isToday ? 'border-blue-400 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}>
                                        <div className={`flex items-center justify-between px-3 py-1.5 text-xs font-bold capitalize ${day.isToday ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : day.isWeekend ? 'bg-gray-100 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'}`}>
                                            <span>{day.dayNameFull} {day.dayNumber} {day.monthName}{day.isToday ? ` · ${tr("aujourd'hui", 'today')}` : ''}</span>
                                            {evs.length > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-[10px] font-bold leading-4 text-white">{evs.length}</span>}
                                        </div>
                                        {evs.length > 0 ? (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {evs.map(j => (
                                                    <button key={j.id} type="button" onClick={() => setSelectedJob(j)}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                        {jobNeedsControl(j) && <span className="shrink-0" title={jobControlReasons(j).join(' · ')}>⚠️</span>}
                                                        <span className="shrink-0 text-xs font-bold text-blue-700 dark:text-blue-400">{j.numeroJob || `Job-${j.id}`}</span>
                                                        <span className="flex-1 truncate text-sm text-gray-800 dark:text-gray-100">{j.client || j.nom || '—'}</span>
                                                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{j.heureDebut || '08:00'}–{j.heureFin || '17:00'}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 text-center text-xs text-gray-300 dark:text-gray-600">—</div>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                        </div>
                    </div>

                    {/* Dashboard résumé en haut de la vue globale */}
                    {filterType === 'global' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 {tr("Vue d'ensemble", 'Overview')} - {dashboardStats.periode} {tr('jours', 'days')}</h3>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {tr('Taux de planification', 'Planning rate')}: <span className={`font-semibold ${
                                        dashboardStats.pourcentagePlanification >= 80 ? 'text-green-600' :
                                        dashboardStats.pourcentagePlanification >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>{dashboardStats.pourcentagePlanification.toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Cartes statistiques compactes */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-blue-900">{dashboardStats.total}</div>
                                    <div className="text-xs text-blue-600">{tr('Total Événements', 'Total Events')}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-green-900">{dashboardStats.enCours}</div>
                                    <div className="text-xs text-green-600">{tr('En Cours', 'In Progress')}</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-yellow-900">{dashboardStats.tentatif}</div>
                                    <div className="text-xs text-yellow-600">{tr('Tentatif', 'Tentative')}</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-red-900">{dashboardStats.enAttente}</div>
                                    <div className="text-xs text-red-600">{tr('En Attente', 'Pending')}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* overflow-auto (X+Y) sur le conteneur borné à la hauteur d'écran : la barre de défilement
                        HORIZONTALE reste TOUJOURS visible en bas du cadre (plus besoin de descendre parmi 50
                        ressources pour l'atteindre). La colonne des noms est sticky-left (reste fixe au scroll).
                        Masquée < lg : sur mobile/demi-écran, seule la vue agenda verticale s'affiche (pas de
                        scroll horizontal). */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm max-h-[calc(100vh-200px)] overflow-auto">
                    <div className="flex w-max min-w-full">
                        {/* Colonnes fixes pour noms et postes (sticky à gauche) */}
                        <div className="flex-shrink-0 sticky left-0 z-20 bg-white dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-600">
                            <table className="border-collapse w-full">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr className="h-20">
                                        <th className={`px-3 py-4 text-left font-semibold text-gray-900 bg-gray-200 border-r border-gray-300 ${isMobile ? 'w-[120px]' : 'w-[180px]'}`}>
                                            {filterType === 'global' ? tr("Ressource", 'Resource') :
                                             filterType === 'personnel' ? (isMobile ? tr("Nom", 'Name') : tr("Nom / Prénom", 'Last / First name')) :
                                             filterType === 'jobs' ? (isMobile ? tr("# Projet", '# Project') : tr("# Projet / Nom du client", '# Project / Client name')) :
                                             (isMobile ? tr("Équip.", 'Equip.') : tr("Équipement", 'Equipment'))}
                                        </th>
                                        {!isMobile && (
                                            <th className="px-2 py-4 text-left font-semibold text-gray-900 bg-gray-200 border-r border-gray-300 w-[100px]">
                                                {filterType === 'global' ? "Type" :
                                                 filterType === 'personnel' ? tr("Poste", 'Position') :
                                                 filterType === 'jobs' ? tr("Statut", 'Status') : "Type"}
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResources.map((resource) => (
                                        <tr key={resource.id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                            continuousDays.some(d => d.isToday) ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        }`} style={{ height: '89px' }}>
                                            <td className={`px-3 py-4 font-medium border-r ${isMobile ? 'w-[120px]' : 'w-[180px]'} ${
                                                continuousDays.some(d => d.isToday) ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                                            }`}>
                                                <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold flex items-center gap-2 leading-tight`}>
                                                    {/* Pastille couleur succursale */}
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: getSuccursaleColor(resource.succursale) }}
                                                        title={`Succursale: ${resource.succursale}`}
                                                    />
                                                    {filterType === 'global' && (
                                                        <Icon
                                                            name={resource.type === 'personnel' ? 'user' : 'wrench'}
                                                            size={12}
                                                            className={resource.type === 'personnel' ? 'text-blue-600' : 'text-orange-600'}
                                                        />
                                                    )}
                                                    <span title={`${resource.nom}${resource.prenom ? ', ' + resource.prenom : ''}`}>
                                                        {isMobile ? resource.nom.split(' ')[0] :
                                                         `${resource.nom}${resource.prenom ? ', ' + resource.prenom : ''}`}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                                    {resource.succursale}
                                                </div>
                                            </td>
                                            {!isMobile && (
                                                <td className={`px-2 py-4 text-xs w-[100px] ${
                                                    continuousDays.some(d => d.isToday) ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                                                }`}>
                                                    {filterType === 'global' ?
                                                        (resource.type === 'personnel' ?
                                                            (resource.poste && resource.departement ? `${resource.poste} - ${resource.departement}` : resource.poste || '')
                                                            : resource.type) :
                                                        (filterType === 'personnel' ?
                                                            (resource.poste && resource.departement ? `${resource.poste} - ${resource.departement}` : resource.poste || '')
                                                            : resource.type)
                                                    }
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Section des dates — le défilement horizontal est porté par le conteneur externe borné. */}
                        <div className="flex-shrink-0">
                            <table className="w-full min-w-max border-collapse">
                                <thead className="bg-gray-200 sticky top-0">
                                    {/* En-tête avec dates - UNE seule ligne synchronisée */}
                                    <tr className="h-20">
                                        {continuousDays.map((day, index) => (
                                            <th
                                                key={index}
                                                className={`px-1 py-4 text-center text-xs border-r border-gray-300 w-20 bg-gray-200 ${
                                                    day.isToday ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-900'
                                                } cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors`}
                                                onDoubleClick={() => handleDateDoubleClick(day.date)}
                                                title={t('calendar.doubleClickFullDate')}
                                            >
                                                <div className="font-medium leading-tight">{day.displayShort}</div>
                                                <div className={`${isMobile ? 'text-xs' : 'text-sm'} leading-tight ${day.isToday ? 'font-bold' : ''}`}>
                                                    {day.dayNumber}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>

                                </thead>

                                <tbody>
                                    {filteredResources.map((resource) => (
                                        <tr key={`dates-${resource.id}`} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700" style={{ height: '89px' }}>
                                            {continuousDays.map((day, dayIndex) => {
                                                const allJobs = getAllJobsForCell(resource.id, day, resource.type);

                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className={`relative p-1 border-r w-20 cursor-pointer hover:bg-blue-50 ${
                                                            day.isToday ? 'bg-gray-300' :
                                                            day.isWeekend ? 'bg-gray-200' : 'bg-white dark:bg-gray-800'
                                                        }`}
                                                        onClick={() => handleCellClick(resource.id, day, resource.type)}
                                                    >
                                                        {allJobs.length > 0 ? (
                                                            <TimelineCell
                                                                jobs={allJobs}
                                                                day={day}
                                                                onJobClick={(job) => setSelectedJob(job)}
                                                                resourceId={resource.id}
                                                                resourceType={resource.type}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-20 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                                                                {/* Cellule vide */}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                </div>
                )}
            </div>

            {/* Modal de job */}
            {selectedJob && (
                <JobModal
                    isOpen={true}
                    onClose={() => setSelectedJob(null)}
                    onSave={onSaveJob}
                    onDelete={onDeleteJob}
                    job={selectedJob}
                    personnel={personnel}
                    equipements={equipements}
                    sousTraitants={sousTraitants}
                    succursales={succursales}
                    departements={departements}
                    conges={conges}
                    jobs={jobs}
                    addSousTraitant={addSousTraitant}
                    addNotification={addNotification}
                    onOpenConflictJob={handleOpenConflictJob}
                    peutModifier={peutModifier}
                    estCoordonnateur={estCoordonnateur}
                />
            )}

            {/* Modal pour l'événement en conflit - Positionné à droite */}
            {conflictJob && (
                <div className="fixed inset-0 z-60 pointer-events-none">
                    <div className="h-full flex">
                        {/* Espace à gauche pour le modal principal */}
                        <div className="flex-1"></div>

                        {/* Modal de conflit à droite */}
                        <div className="w-1/2 max-w-3xl pointer-events-auto">
                            <div className="h-full bg-black bg-opacity-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-h-[95vh] flex flex-col border-4 border-orange-300">
                                    {/* Header spécial pour le conflit */}
                                    <div className="flex-shrink-0 flex items-center justify-between p-4 bg-orange-600 rounded-t-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                ⚠️
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-white">
                                                    {t('event.conflictEvent')}
                                                </h2>
                                                <p className="text-sm text-orange-100">
                                                    #{conflictJob.numeroJob} - {conflictJob.client}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConflictJob(null)}
                                            className="p-2 text-orange-100 hover:text-white hover:bg-orange-700 rounded-lg transition-colors"
                                            title={t('form.close')}
                                        >
                                            <Icon name="close" size={20} />
                                        </button>
                                    </div>

                                    {/* Contenu simplifié */}
                                    <div className="flex-1 p-4 overflow-y-auto">
                                        <div className="space-y-4">
                                            {/* Informations de base */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{tr('Date début', 'Start date')}</label>
                                                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{conflictJob.dateDebut}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{tr('Date fin', 'End date')}</label>
                                                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{conflictJob.dateFin}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{tr('Heure début', 'Start time')}</label>
                                                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{conflictJob.heureDebut}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{tr('Heure fin', 'End time')}</label>
                                                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{conflictJob.heureFin}</div>
                                                </div>
                                            </div>

                                            {/* Ressources assignées */}
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('event.assignedResources')}</h3>
                                                <div className="space-y-2">
                                                    {conflictJob.personnel?.length > 0 && (
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">👥 {t('resource.personnel')}:</span>
                                                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                                {conflictJob.personnel.map(id => {
                                                                    const person = personnel.find(p => p.id === id);
                                                                    return person ? `${person.prenom ? `${person.prenom} ${person.nom}` : person.nom}` : id;
                                                                }).join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {conflictJob.equipements?.length > 0 && (
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">🔧 {t('resource.equipment')}:</span>
                                                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                                {conflictJob.equipements.map(id => {
                                                                    const equipement = equipements.find(e => e.id === id);
                                                                    return equipement ? equipement.nom : id;
                                                                }).join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {conflictJob.sousTraitants?.length > 0 && (
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">🏢 {tr('Sous-traitants', 'Subcontractors')}:</span>
                                                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                                {conflictJob.sousTraitants.map(id => {
                                                                    const sousTraitant = sousTraitants.find(s => s.id === id);
                                                                    return sousTraitant ? sousTraitant.nom : id;
                                                                }).join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {conflictJob.description && (
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('analytics.description')}</h3>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                                        {conflictJob.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-t bg-gray-50 dark:bg-gray-700/50">
                                        <div className="text-sm text-orange-600 font-medium">
                                            ⚠️ {t('event.conflictWarning')}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setConflictJob(null);
                                                setSelectedJob(conflictJob); // Ouvrir le job en conflit dans le modal principal
                                            }}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                        >
                                            ✏️ {t('event.modifyEvent')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}