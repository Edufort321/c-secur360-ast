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

    // Résoudre le niveau d'accès — priorité users.role, puis planner_personnel
    useEffect(() => {
        (async () => {
            try {
                // Identité via la session serveur (cookie). On ne lit PLUS `users` côté client
                // (table fermée à l'anon pour empêcher la fuite de courriels/rôles).
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                const u = res.ok ? (await res.json())?.user : null;
                if (!u?.email) return;
                if (u.role === 'super_admin') {
                    setCurrentUser({ id: 'super', nom: u.name || 'Super-utilisateur', niveauAcces: 'super_user' });
                    return;
                }
                // Raffinement par planner_personnel
                const { data: personnel } = await supabase.from('planner_personnel').select('id, name, niveauAcces').eq('tenant_id', tenant).ilike('email', u.email).maybeSingle();
                if (personnel) {
                    setCurrentUser({ id: personnel.id, nom: personnel.name, niveauAcces: personnel.niveauAcces || (u?.role === 'client_admin' ? 'direction' : 'consultation') });
                } else if (u?.role === 'client_admin') {
                    setCurrentUser({ id: 'admin', nom: u.name || 'Admin', niveauAcces: 'direction' });
                }
            } catch { /* session non dispo → garde la valeur par défaut */ }
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
        return <div className="grid min-h-[60vh] place-items-center text-gray-400 dark:text-gray-500">Chargement du planificateur…</div>;
    }

    return (
        <div className="planner-root">
            {/* Skin sombre du planner : pilote par la classe .dark du header principal.
                Couvre la vue Grille et tous les modals (JobModal, Conges, Ressources) sans
                reecrire chaque classe. Ne touche qu'aux neutres (blanc/gris) — les accents
                colores (bleu/vert/rouge/etc.) sont preserves. */}
            <style jsx global>{`
                .dark .planner-root .bg-white { background-color:#1f2937 !important; }
                .dark .planner-root .bg-gray-50 { background-color:#111827 !important; }
                .dark .planner-root .bg-gray-100 { background-color:#1f2937 !important; }
                .dark .planner-root .bg-gray-200 { background-color:#374151 !important; }
                .dark .planner-root .border-gray-100,
                .dark .planner-root .border-gray-200,
                .dark .planner-root .border-gray-300 { border-color:#374151 !important; }
                .dark .planner-root .text-gray-900,
                .dark .planner-root .text-gray-800,
                .dark .planner-root .text-gray-700 { color:#f3f4f6 !important; }
                .dark .planner-root .text-gray-600,
                .dark .planner-root .text-gray-500,
                .dark .planner-root .text-gray-400 { color:#9ca3af !important; }
                .dark .planner-root .hover\\:bg-gray-50:hover,
                .dark .planner-root .hover\\:bg-gray-100:hover,
                .dark .planner-root .hover\\:bg-gray-200:hover { background-color:#374151 !important; }
                .dark .planner-root input,
                .dark .planner-root select,
                .dark .planner-root textarea { background-color:#111827 !important; color:#f3f4f6 !important; border-color:#374151 !important; }
                .dark .planner-root input::placeholder,
                .dark .planner-root textarea::placeholder { color:#6b7280 !important; }
            `}</style>

            <NotificationContainer notifications={notifications} />

            {/* Flèche de retour vers le portail des modules (cohérent avec les autres modules). */}
            <div className="flex items-center px-3 sm:px-4 pt-3">
                <a
                    href={`/${tenant || 'cerdia'}/modules`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Retour aux modules"
                >
                    <span aria-hidden>←</span> Modules
                </a>
            </div>

            <PlanificateurFinal
                jobs={appData.jobs}
                personnel={appData.personnel}
                equipements={appData.equipements}
                sousTraitants={appData.sousTraitants}
                conges={appData.conges}
                succursales={appData.succursales}
                departements={appData.departements}
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
                    succursales={appData.succursales}
                    departements={appData.departements}
                    addSousTraitant={addSousTraitant}
                    addNotification={addNotification}
                    peutModifier={canModify}
                    estCoordonnateur={isCoordinator}
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
        </div>
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
