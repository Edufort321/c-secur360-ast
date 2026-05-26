// Planificateur C-Secur360 — accès sécurisé par le portail hôte (middleware + entitlements).
// Aucune auth interne : si l'utilisateur a le module planificateur, il a accès.
// Le niveau d'accès est défini dans admin/ressources/personnel (niveauAcces).

import React, { useState, useCallback } from 'react';
import { PlanificateurFinal } from './modules/Calendar/PlanificateurFinal.jsx';
import { NotificationContainer } from './components/UI/NotificationContainer.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { useNotifications } from './hooks/useNotifications.js';
import { useAppDataWithSync } from './hooks/useAppDataWithSync.js';
import { ResourcesModal } from './components/Modals/ResourcesModal.jsx';
import { CongesModal } from './components/Modals/CongesModal.jsx';
import { JobModal } from './modules/NewJob/JobModal.jsx';

function AppContent({ tenant = 'cerdia' }) {
    const appData = useAppDataWithSync(tenant);
    const { notifications, addNotification } = useNotifications();

    const [showCreateEvent, setShowCreateEvent]         = useState(false);
    const [showCongesManagement, setShowCongesManagement]   = useState(false);
    const [showResourcesManagement, setShowResourcesManagement] = useState(false);

    // L'accès est géré par le portail — niveau administration par défaut.
    const adminUser = { id: 'host', nom: 'Administrateur', niveauAcces: 'administration' };

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
                utilisateurConnecte={adminUser}
                peutModifier={() => true}
                estCoordonnateur={() => true}
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
                    utilisateurConnecte={adminUser}
                    peutModifier={() => true}
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
                    utilisateurConnecte={adminUser}
                    estCoordonnateur={() => true}
                    estAdministrateur={() => true}
                    peutModifier={() => true}
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
