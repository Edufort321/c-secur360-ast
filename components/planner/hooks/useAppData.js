// ============== HOOK APP DATA ==============
// Hook principal pour la gestion des données de l'application
// Intégration Supabase offline-first avec sync temps réel

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_PERSONNEL, DEFAULT_EQUIPMENTS, DEFAULT_JOBS, STORAGE_CONFIG } from '@/components/planner/config/constants.js';
import { useSupabaseSync } from './useSupabaseSync.js';
import { supabase } from '@/components/planner/lib/supabaseClient.js';

export function useAppData(tenant = null) {
    // Clé localStorage des préférences/sous-traitants NAMESPACÉE par tenant : sinon les
    // sous-traitants (données du tenant) d'une org resteraient visibles sous une autre dans
    // le même navigateur (fuite inter-tenant côté client).
    const navKey = `${STORAGE_CONFIG.KEY}::${tenant || 'local'}`;
    // ========== SYNC SUPABASE (Offline-first + Realtime) ==========
    const {
        data: jobs,
        add: addJobSync,
        update: updateJobSync,
        remove: removeJobSync,
        isOnline: jobsOnline,
        syncQueue: jobsSyncQueue
    } = useSupabaseSync('planner_jobs', `c-secur360-${tenant || 'local'}-jobs`, DEFAULT_JOBS, tenant);

    const {
        data: personnel,
        add: addPersonnelSync,
        update: updatePersonnelSync,
        remove: removePersonnelSync,
        isOnline: personnelOnline,
        syncQueue: personnelSyncQueue
    } = useSupabaseSync('planner_personnel', `c-secur360-${tenant || 'local'}-personnel`, DEFAULT_PERSONNEL, tenant);

    const {
        data: equipements,
        add: addEquipementSync,
        update: updateEquipementSync,
        remove: removeEquipementSync,
        isOnline: equipementsOnline,
        syncQueue: equipementsSyncQueue
    } = useSupabaseSync('planner_equipements', `c-secur360-${tenant || 'local'}-equipements`, DEFAULT_EQUIPMENTS, tenant);

    const {
        data: postes,
        add: addPosteSync,
        update: updatePosteSync,
        remove: removePosteSync
    } = useSupabaseSync('planner_postes', `c-secur360-${tenant || 'local'}-postes`, [], tenant);

    const {
        data: succursales,
        add: addSuccursaleSync,
        update: updateSuccursaleSync,
        remove: removeSuccursaleSync
    } = useSupabaseSync('planner_succursales', `c-secur360-${tenant || 'local'}-succursales`, [], tenant);

    const {
        data: conges,
        add: addCongeSync,
        update: updateCongeSync,
        remove: removeCongeSync
    } = useSupabaseSync('planner_conges', `c-secur360-${tenant || 'local'}-conges`, [], tenant);

    const {
        data: departements,
        add: addDepartementSync,
        update: updateDepartementSync,
        remove: removeDepartementSync
    } = useSupabaseSync('planner_departements', `c-secur360-${tenant || 'local'}-departements`, [], tenant);

    // ========== TAUX HORAIRE (Profils de paie - Admin) ==========
    // Lu depuis employee_profiles (cle = id du personnel) pour afficher le taux dans Personnel.
    // Lecture seule cote planificateur : le taux se modifie dans Admin > Paie & avantages / Evaluation.
    const [payRates, setPayRates] = useState({}); // { [personnelId]: hourly_rate }
    useEffect(() => {
        if (!tenant) return;
        let active = true;
        (async () => {
            try {
                const { data, error } = await supabase
                    .from('employee_profiles')
                    .select('id, hourly_rate, ot_enabled, dt_enabled')
                    .eq('tenant_id', tenant);
                if (error) throw error;
                if (!active) return;
                const map = {};
                for (const row of (data || [])) {
                    map[row.id] = { hourly_rate: Number(row.hourly_rate) || 0, ot_enabled: row.ot_enabled !== false, dt_enabled: row.dt_enabled !== false };
                }
                setPayRates(map);
            } catch (e) {
                // Table absente (migration 060 non executee) ou hors-ligne : pas de taux affiche, sans bloquer.
                console.warn('Taux horaire (profils de paie) indisponible:', e?.message || e);
            }
        })();
        return () => { active = false; };
    }, [tenant]);

    // ========== ÉTATS LOCAUX (Non synchronisés - navigation uniquement) ==========
    const [sousTraitants, setSousTraitants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [selectedView, setSelectedView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);

    // Sync status (pour affichage UI)
    const isOnline = jobsOnline && personnelOnline && equipementsOnline;
    const totalSyncQueue = jobsSyncQueue + personnelSyncQueue + equipementsSyncQueue;

    // Charger uniquement les préférences locales (navigation) depuis localStorage
    // Les données (jobs, personnel, etc.) sont gérées par useSupabaseSync
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(navKey);
            if (savedData) {
                const data = JSON.parse(savedData);

                // Restaurer seulement les états de navigation (pas les données Supabase)
                if (data.sousTraitants) setSousTraitants(data.sousTraitants);
                if (data.selectedView) setSelectedView(data.selectedView);
                if (data.selectedDate) setSelectedDate(new Date(data.selectedDate));
                if (data.lastSaved) setLastSaved(new Date(data.lastSaved));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences:', error);
        } finally {
            setIsLoading(false);
        }
    }, [navKey]);

    // Sauvegarder uniquement les préférences locales (navigation)
    // Les données (jobs, personnel, etc.) sont auto-sauvegardées par useSupabaseSync
    const saveData = useCallback(() => {
        const dataToSave = {
            sousTraitants,
            selectedView,
            selectedDate: selectedDate.toISOString(),
            lastSaved: new Date().toISOString()
        };

        try {
            localStorage.setItem(navKey, JSON.stringify(dataToSave));
            setLastSaved(new Date());
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [sousTraitants, selectedView, selectedDate, navKey]);

    // Auto-sauvegarde avec délai
    useEffect(() => {
        if (isLoading) return;

        const timeoutId = setTimeout(() => {
            saveData();
        }, STORAGE_CONFIG.AUTO_SAVE_DELAY);

        return () => clearTimeout(timeoutId);
    }, [saveData, isLoading]);

    // ========== CRUD: JOBS ==========
    const addJob = useCallback(async (job) => {
        const newJob = {
            ...job,
            id: job.id || crypto.randomUUID(),
            tenant_id: job.tenant_id || tenant,
            // planner_jobs.title est NOT NULL (migration 020) alors que le formulaire utilise `nom`.
            // Sans ce mapping, chaque INSERT echoue (contrainte NOT NULL) -> mandat non persiste.
            title: job.title || job.nom || job.numeroJob || 'Mandat',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await addJobSync(newJob);
    }, [addJobSync, tenant]);

    const updateJob = useCallback(async (jobId, updates) => {
        const updatedJob = {
            ...updates,
            updated_at: new Date().toISOString()
        };
        return await updateJobSync(jobId, updatedJob);
    }, [updateJobSync]);

    const deleteJob = useCallback(async (jobId) => {
        return await removeJobSync(jobId);
    }, [removeJobSync]);

    // Sauvegarde unifiee d'un mandat (job) : route vers update si l'id existe deja,
    // sinon ajout. Indispensable : App.jsx et PlanificateurFinal passent saveJob comme
    // handler onSave/onSaveJob du formulaire (sans ceci, la sauvegarde ne faisait rien).
    const saveJob = useCallback(async (jobData) => {
        if (jobData.id && jobs.find(j => j.id === jobData.id)) {
            return await updateJob(jobData.id, jobData);
        }
        return await addJob(jobData);
    }, [jobs, addJob, updateJob]);

    // Setter pour compatibilité (utilise Supabase en arrière-plan)
    const setJobs = useCallback((newJobsOrFunction) => {
        console.warn('⚠️ setJobs appelé directement - utiliser addJob/updateJob/deleteJob pour sync Supabase');
        // Pour compatibilité temporaire, ne fait rien (données gérées par useSupabaseSync)
    }, []);

    // ========== CRUD: PERSONNEL ==========
    const addPersonnel = useCallback(async (person) => {
        const newPerson = {
            ...person,
            id: person.id || crypto.randomUUID(),
            tenant_id: person.tenant_id || tenant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await addPersonnelSync(newPerson);
    }, [addPersonnelSync]);

    const updatePersonnel = useCallback(async (personId, updates) => {
        const updatedPerson = {
            ...updates,
            updated_at: new Date().toISOString()
        };
        return await updatePersonnelSync(personId, updatedPerson);
    }, [updatePersonnelSync]);

    const deletePersonnel = useCallback(async (personId) => {
        return await removePersonnelSync(personId);
    }, [removePersonnelSync]);

    const savePersonnel = useCallback(async (personnelData) => {
        if (personnelData.id && personnel.find(p => p.id === personnelData.id)) {
            // Mise à jour
            return await updatePersonnel(personnelData.id, personnelData);
        } else {
            // Ajout
            return await addPersonnel(personnelData);
        }
    }, [personnel, addPersonnel, updatePersonnel]);

    // Setter pour compatibilité
    const setPersonnel = useCallback((newPersonnelOrFunction) => {
        console.warn('⚠️ setPersonnel appelé directement - utiliser addPersonnel/updatePersonnel/deletePersonnel');
    }, []);

    // ========== CRUD: ÉQUIPEMENTS ==========
    const addEquipement = useCallback(async (equipement) => {
        const newEquipement = {
            ...equipement,
            id: equipement.id || crypto.randomUUID(),
            tenant_id: equipement.tenant_id || tenant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await addEquipementSync(newEquipement);
    }, [addEquipementSync]);

    const updateEquipement = useCallback(async (equipementId, updates) => {
        const updatedEquipement = {
            ...updates,
            updated_at: new Date().toISOString()
        };
        return await updateEquipementSync(equipementId, updatedEquipement);
    }, [updateEquipementSync]);

    const saveEquipement = useCallback(async (equipementData) => {
        if (equipementData.id && equipements.find(e => e.id === equipementData.id)) {
            // Mise à jour
            return await updateEquipement(equipementData.id, equipementData);
        } else {
            // Ajout
            return await addEquipement(equipementData);
        }
    }, [equipements, addEquipement, updateEquipement]);

    const deleteEquipement = useCallback(async (equipementId) => {
        return await removeEquipementSync(equipementId);
    }, [removeEquipementSync]);

    // Setter pour compatibilité
    const setEquipements = useCallback((newEquipementsOrFunction) => {
        console.warn('⚠️ setEquipements appelé directement - utiliser addEquipement/updateEquipement/deleteEquipement');
    }, []);

    // ========== CRUD: POSTES ==========
    const addPoste = useCallback(async (poste) => {
        const newPoste = {
            ...poste,
            id: poste.id || crypto.randomUUID(),
            tenant_id: poste.tenant_id || tenant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await addPosteSync(newPoste);
    }, [addPosteSync]);

    const savePoste = useCallback(async (posteData) => {
        if (posteData.id && postes.find(p => p.id === posteData.id)) {
            // Mise à jour
            return await updatePosteSync(posteData.id, posteData);
        } else {
            // Ajout
            return await addPoste(posteData);
        }
    }, [postes, addPoste, updatePosteSync]);

    const deletePoste = useCallback(async (posteId) => {
        return await removePosteSync(posteId);
    }, [removePosteSync]);

    // ========== CRUD: SUCCURSALES ==========
    const addSuccursale = useCallback(async (succursale) => {
        const newSuccursale = {
            ...succursale,
            id: succursale.id || crypto.randomUUID(),
            tenant_id: succursale.tenant_id || tenant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await addSuccursaleSync(newSuccursale);
    }, [addSuccursaleSync]);

    const saveSuccursale = useCallback(async (succursaleData) => {
        if (succursaleData.id && succursales.find(s => s.id === succursaleData.id)) {
            // Mise à jour
            return await updateSuccursaleSync(succursaleData.id, succursaleData);
        } else {
            // Ajout
            return await addSuccursale(succursaleData);
        }
    }, [succursales, addSuccursale, updateSuccursaleSync]);

    // ========== CRUD: DÉPARTEMENTS ==========
    const addDepartement = useCallback(async (departement) => {
        const newDepartement = {
            ...departement,
            id: departement.id || crypto.randomUUID(),
            tenant_id: departement.tenant_id || tenant,
            created_at: new Date().toISOString()
        };
        return await addDepartementSync(newDepartement);
    }, [addDepartementSync]);

    // ========== CRUD: CONGÉS ==========
    const addConge = useCallback(async (conge) => {
        const newConge = {
            ...conge,
            id: conge.id || crypto.randomUUID(),
            tenant_id: conge.tenant_id || tenant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await addCongeSync(newConge);
    }, [addCongeSync]);

    const updateConge = useCallback(async (congeId, updates) => {
        const updatedConge = {
            ...updates,
            updated_at: new Date().toISOString()
        };
        return await updateCongeSync(congeId, updatedConge);
    }, [updateCongeSync]);

    const saveConge = useCallback(async (congeData) => {
        if (congeData.id && conges.find(c => c.id === congeData.id)) {
            // Mise à jour
            return await updateConge(congeData.id, congeData);
        } else {
            // Ajout
            return await addConge(congeData);
        }
    }, [conges, addConge, updateConge]);

    const deleteConge = useCallback(async (congeId) => {
        return await removeCongeSync(congeId);
    }, [removeCongeSync]);

    // Setter pour compatibilité
    const setConges = useCallback((newCongesOrFunction) => {
        console.warn('⚠️ setConges appelé directement - utiliser addConge/updateConge/deleteConge');
    }, []);

    // Fonctions d'authentification
    const login = useCallback((nom, password) => {
        const user = personnel.find(p =>
            p.nom === nom && p.password === password
        );

        if (user) {
            setCurrentUser(user);
            return { success: true, user };
        }

        return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
    }, [personnel]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setIsAdminMode(false);
    }, []);

    // Fonction de réinitialisation des données
    const resetData = useCallback(() => {
        // Clear local navigation preferences
        setSousTraitants([]);
        localStorage.removeItem(navKey);

        // Clear Supabase localStorage caches
        localStorage.removeItem('c-secur360-jobs');
        localStorage.removeItem('c-secur360-personnel');
        localStorage.removeItem('c-secur360-equipements');
        localStorage.removeItem('c-secur360-postes');
        localStorage.removeItem('c-secur360-succursales');
        localStorage.removeItem('c-secur360-conges');
        localStorage.removeItem('c-secur360-departements');

    }, []);

    // Normalisation : les enregistrements créés par l'admin utilisent 'name/role/phone'
    // mais le planificateur attend 'nom/poste/telephone'. On mappe les deux schémas.
    const personnelNormalized = useMemo(() =>
        personnel.map(p => {
            const pay = payRates[p.id];
            return {
                ...p,
                nom: p.nom || p.name || '',
                prenom: p.prenom || '',
                poste: p.poste || p.role || '',
                disponible: p.disponible !== undefined ? p.disponible : (p.is_active !== false),
                telephone: p.telephone || p.phone || '',
                visibleChantier: p.visibleChantier !== undefined ? p.visibleChantier : true,
                niveauAcces: p.niveauAcces || 'consultation',
                // Taux horaire issu des profils de paie (Admin) — lecture seule cote planificateur.
                hourly_rate: pay ? pay.hourly_rate : (p.hourly_rate != null ? Number(p.hourly_rate) : null),
                ot_enabled: pay ? pay.ot_enabled : undefined,
                dt_enabled: pay ? pay.dt_enabled : undefined,
            };
        })
    , [personnel, payRates]);

    const equipementsNormalized = useMemo(() =>
        equipements.map(e => ({
            ...e,
            nom: e.nom || e.name || '',
            type: e.type || '',
            disponible: e.disponible !== undefined ? e.disponible : (e.is_active !== false),
        }))
    , [equipements]);

    return {
        // Données (Supabase sync)
        jobs,
        personnel: personnelNormalized,
        equipements: equipementsNormalized,
        sousTraitants,
        conges,
        postes,
        succursales,
        departements,

        // État utilisateur et navigation
        currentUser,
        isAdminMode,
        selectedView,
        selectedDate,
        isLoading,
        lastSaved,

        // Sync status (Supabase)
        isOnline,
        syncQueue: totalSyncQueue,

        // Setters pour les vues
        setSelectedView,
        setSelectedDate,
        setIsAdminMode,

        // Actions jobs
        setJobs,
        addJob,
        updateJob,
        saveJob,
        deleteJob,

        // Actions personnel
        setPersonnel,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        savePersonnel,

        // Actions équipements
        setEquipements,
        addEquipement,
        updateEquipement,
        saveEquipement,
        deleteEquipement,

        // Actions postes
        addPoste,
        savePoste,
        deletePoste,

        // Actions succursales
        addSuccursale,
        saveSuccursale,

        // Actions départements
        addDepartement,

        // Actions autres
        setSousTraitants,
        setConges,
        saveConge,
        deleteConge,

        // Authentification
        login,
        logout,

        // Utilitaires
        saveData,
        resetData
    };
}