// Planificateur C-Secur360 — accès sécurisé par le portail hôte (middleware + entitlements).
// Niveaux : administration/coordination/admin_paie → modification ; autres → consultation.

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { PlanificateurFinal } from './modules/Calendar/PlanificateurFinal.jsx';
import { NotificationContainer } from './components/UI/NotificationContainer.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { useNotifications } from './hooks/useNotifications.js';
import { useAppDataWithSync } from './hooks/useAppDataWithSync.js';
import { ResourcesModal } from './components/Modals/ResourcesModal.jsx';
import { CongesModal } from './components/Modals/CongesModal.jsx';
import { JobModal } from './modules/NewJob/JobModal.jsx';

// Niveaux qui donnent accès à la modification (tier ≥ 3)
const ROLES_MODIF = ['coordination', 'administration', 'admin_paie', 'rh', 'direction', 'super_user'];
// Niveaux qui voient les salaires (tier ≥ 5)
const ROLES_SALAIRE = ['admin_paie', 'rh', 'direction', 'super_user'];

function AppContent({ tenant = 'cerdia' }) {
    const appData = useAppDataWithSync(tenant);
    const { notifications, addNotification } = useNotifications();

    const [showCreateEvent, setShowCreateEvent]             = useState(false);
    const [showCongesManagement, setShowCongesManagement]   = useState(false);
    const [showResourcesManagement, setShowResourcesManagement] = useState(false);
    const [currentUser, setCurrentUser] = useState({ id: 'host', nom: 'Utilisateur', niveauAcces: 'administration' });

    // Résoudre le niveau d'accès depuis planner_personnel via l'email Supabase Auth
    useEffect(() => {
        (async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user?.email) return;
                const { data: personnel } = await supabase
                    .from('planner_personnel')
                    .select('id, name, niveauAcces, email')
                    .eq('tenant_id', tenant)
                    .ilike('email', user.email)
                    .maybeSingle();
                if (personnel) {
                    setCurrentUser({ id: personnel.id, nom: personnel.name, niveauAcces: personnel.niveauAcces || 'consultation' });
                }
            } catch { /* Supabase non dispo → garde la valeur par défaut */ }
        })();
    }, [tenant]);

    const canModify      = ROLES_MODIF.includes(currentUser.niveauAcces);
    const canViewSalary  = ROLES_SALAIRE.includes(currentUser.niveauAcces);
    const isCoordinator  = ['coordination', 'administration', 'rh', 'direction', 'super_user'].includes(currentUser.niveauAcces);

    const addSousTraitant = useCallback((nom) => {
        if (!nom?.trim()) return null;
        const entry = { id: Date.now(), nom: nom.trim(), specialite: '', telephone: '', email: '', disponible: true };
        appData.setSousTraitants(prev => [...prev, entry]);
        return entry.id;
    }, [appData.setSousTraitants]);

    if (appData.isLoading) {
        return <div className="grid min-h-[60vh] place-items-center text-gray-400">Chargement du planificateur…</div>;
    }

    return (
        <>
            <NotificationContainer notifications={notifications} />

            <PlanificateurFinal
                jobs={appData.jobs}
                personnel={appData.personnel}
                equipements={appData.equipements}
                sousTraitants={appData.sousTraitants}
                conges={appData.conges}
                onSaveJob={appData.saveJob}
                onDeleteJob={appData.deleteJob}
                onSavePersonnel={appData.savePersonnel}
                onDeletePersonnel={appData.deletePersonnel}
                onSaveEquipement={appData.saveEquipement}
                onDeleteEquipement={appData.deleteEquipement}
                onSaveConge={appData.saveConge}
                onDeleteConge={appData.deleteConge}
                addSousTraitant={addSousTraitant}
                addNotification={addNotification}
                utilisateurConnecte={currentUser}
                peutModifier={canModify}
                estCoordonnateur={isCoordinator}
                onCreateEvent={() => setShowCreateEvent(true)}
                onManageConges={() => setShowCongesManagement(true)}
                onManageResources={() => setShowResourcesManagement(true)}
            />

            {showCreateEvent && (
                <JobModal
                    isOpen={showCreateEvent}
                    onClose={() => setShowCreateEvent(false)}
                    onSave={appData.saveJob}
                    onDelete={appData.deleteJob}
                    job={null}
                    personnel={appData.personnel}
                    equipements={appData.equipements}
                    sousTraitants={appData.sousTraitants}
                    addSousTraitant={addSousTraitant}
                    addNotification={addNotification}
                    peutModifier={canModify}
                    tenant={tenant}
                />
            )}

            {showCongesManagement && (
                <CongesModal
                    isOpen={showCongesManagement}
                    onClose={() => setShowCongesManagement(false)}
                    onSave={appData.saveConge}
                    onDelete={appData.deleteConge}
                    conge={null}
                    personnel={appData.personnel}
                    addNotification={addNotification}
                    utilisateurConnecte={currentUser}
                    peutModifier={canModify}
                />
            )}

            {showResourcesManagement && (
                <ResourcesModal
                    isOpen={showResourcesManagement}
                    onClose={() => setShowResourcesManagement(false)}
                    personnel={appData.personnel}
                    equipements={appData.equipements}
                    postes={appData.postes}
                    succursales={appData.succursales}
                    departements={appData.departements}
                    onSavePersonnel={appData.savePersonnel}
                    onDeletePersonnel={appData.deletePersonnel}
                    onSaveEquipement={appData.saveEquipement}
                    onDeleteEquipement={appData.deleteEquipement}
                    onSavePoste={appData.savePoste}
                    onDeletePoste={appData.deletePoste}
                    onSaveSuccursale={appData.saveSuccursale}
                    onSaveConge={appData.saveConge}
                    onDeleteConge={appData.deleteConge}
                    utilisateurConnecte={currentUser}
                    estCoordonnateur={isCoordinator}
                    estAdministrateur={currentUser.niveauAcces === 'administration'}
                    peutModifier={canModify}
                    addNotification={addNotification}
                />
            )}
        </>
    );
}

export function App({ tenant = 'cerdia' }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent tenant={tenant} />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
