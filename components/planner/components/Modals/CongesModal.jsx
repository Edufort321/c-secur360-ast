// ============== MODAL GESTION DES CONGÉS VERSION ORIGINALE ==============
// Reproduction exacte du système de congés avec workflow d'approbation

import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Icon } from '../UI/Icon';

export function CongesModal({
    isOpen,
    onClose,
    conge,
    onSave,
    onDelete,
    personnel,
    conges,
    addNotification,
    utilisateurConnecte,
    peutModifier = true,
    estCoordonnateur = false
}) {
    // ===== ÉTATS PRINCIPAUX =====
    const [formData, setFormData] = useState({
        id: null,
        personnelId: '',
        type: 'vacances', // 'vacances', 'maladie', 'personnel', 'formation', 'autre'
        dateDebut: '',
        dateFin: '',
        heureDebut: '',
        heureFin: '',
        demiJournee: false,
        typeDemiJournee: 'matin', // 'matin', 'apres_midi'
        raison: '',
        commentaires: '',
        statut: 'en_attente', // 'en_attente', 'approuve', 'refuse', 'annule'
        dateCreation: new Date().toISOString(),
        dateDemande: new Date().toISOString().split('T')[0],
        approuvePar: null,
        dateApprobation: null,
        commentairesApprobation: '',
        documentJustificatif: null,
        urgent: false,
        paye: true,
        remplacant: null,
        tachesTransferees: []
    });

    const [activeTab, setActiveTab] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ===== TYPES DE CONGÉS =====
    const typesConges = [
        { value: 'vacances', label: '🏖️ Vacances', couleur: '#3b82f6', paye: true },
        { value: 'maladie', label: '🤒 Maladie', couleur: '#ef4444', paye: true },
        { value: 'personnel', label: '👤 Personnel', couleur: '#8b5cf6', paye: false },
        { value: 'formation', label: '📚 Formation', couleur: '#10b981', paye: true },
        { value: 'maternite', label: '🍼 Maternité/Paternité', couleur: '#f59e0b', paye: true },
        { value: 'deces', label: '⚱️ Décès', couleur: '#6b7280', paye: true },
        { value: 'autre', label: '📝 Autre', couleur: '#6b7280', paye: false }
    ];

    // ===== INITIALISATION =====
    useEffect(() => {
        if (isOpen && conge) {
            // Édition d'un congé existant
            setFormData({
                ...conge,
                // Assurer la compatibilité
                tachesTransferees: conge.tachesTransferees || []
            });
        } else if (isOpen) {
            // Nouveau congé
            const personnelSelectionne = utilisateurConnecte?.id || '';
            const dateAujourdhui = new Date().toISOString().split('T')[0];

            setFormData({
                ...formData,
                id: null,
                personnelId: personnelSelectionne,
                dateDemande: dateAujourdhui,
                dateDebut: dateAujourdhui,
                dateFin: dateAujourdhui,
                heureDebut: '08:00',
                heureFin: '17:00'
            });
        }
        setActiveTab('general');
    }, [isOpen, conge, utilisateurConnecte]);

    // ===== CALCULS =====
    const calculerDureeConge = () => {
        if (!formData.dateDebut || !formData.dateFin) return 0;

        const debut = new Date(formData.dateDebut);
        const fin = new Date(formData.dateFin);
        const diffTime = Math.abs(fin - debut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (formData.demiJournee) {
            return 0.5;
        }

        return diffDays;
    };

    const verifierConflits = () => {
        if (!formData.personnelId || !formData.dateDebut || !formData.dateFin || !conges) return [];

        return conges.filter(c =>
            c.id !== formData.id &&
            c.personnelId === formData.personnelId &&
            c.statut === 'approuve' &&
            !(new Date(c.dateFin) < new Date(formData.dateDebut) ||
              new Date(c.dateDebut) > new Date(formData.dateFin))
        );
    };

    // ===== GESTION DES APPROBATIONS =====
    const handleApprouver = () => {
        setFormData(prev => ({
            ...prev,
            statut: 'approuve',
            approuvePar: utilisateurConnecte.id,
            dateApprobation: new Date().toISOString()
        }));
    };

    const handleRefuser = () => {
        if (!formData.commentairesApprobation.trim()) {
            addNotification('Un commentaire est requis pour refuser un congé', 'error');
            return;
        }

        setFormData(prev => ({
            ...prev,
            statut: 'refuse',
            approuvePar: utilisateurConnecte.id,
            dateApprobation: new Date().toISOString()
        }));
    };

    // ===== VALIDATION =====
    const validerFormulaire = () => {
        if (!formData.personnelId) {
            addNotification('Veuillez sélectionner un employé', 'error');
            return false;
        }

        if (!formData.dateDebut) {
            addNotification('La date de début est requise', 'error');
            return false;
        }

        if (!formData.dateFin) {
            addNotification('La date de fin est requise', 'error');
            return false;
        }

        if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
            addNotification('La date de fin ne peut pas être antérieure à la date de début', 'error');
            return false;
        }

        if (!formData.raison.trim()) {
            addNotification('La raison du congé est requise', 'error');
            return false;
        }

        // Vérifier les conflits
        const conflits = verifierConflits();
        if (conflits.length > 0) {
            addNotification(`Conflit détecté avec ${conflits.length} autre(s) congé(s)`, 'warning');
        }

        return true;
    };

    // ===== SAUVEGARDE =====
    const handleSave = async () => {
        if (!validerFormulaire()) return;

        setIsSubmitting(true);

        try {
            const typeConge = typesConges.find(t => t.value === formData.type);
            const congeData = {
                ...formData,
                duree: calculerDureeConge(),
                paye: typeConge?.paye || false,
                couleur: typeConge?.couleur || '#6b7280'
            };

            await onSave(congeData);

            // NB : ne PAS nommer cette variable `personnel` (masque la prop + TDZ ReferenceError → le save
            // tombait toujours dans le catch et affichait « Erreur » même en cas de succès).
            const emp = personnel.find(p => p.id === formData.personnelId);
            addNotification(
                `Congé ${conge ? 'modifié' : 'créé'} pour ${emp?.nom || 'Employé'}`,
                'success'
            );

            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            addNotification('Erreur lors de la sauvegarde', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===== SUPPRESSION =====
    const handleDelete = async () => {
        try {
            await onDelete(conge.id);
            addNotification('Congé supprimé avec succès', 'success');
            onClose();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            addNotification('Erreur lors de la suppression', 'error');
        }
        setShowDeleteConfirm(false);
    };

    // ===== RENDU =====
    if (!isOpen) return null;

    const duree = calculerDureeConge();
    const conflits = verifierConflits();
    const typeCongeActuel = typesConges.find(t => t.value === formData.type);
    const personnelSelectionne = personnel.find(p => p.id === formData.personnelId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={conge ? `Modifier Congé - ${personnelSelectionne?.nom}` : 'Nouveau Congé'}
            size="lg"
        >
            <div className="space-y-6">
                {/* Onglets */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'general', label: 'Général', icon: 'calendar' },
                            { id: 'approbation', label: 'Approbation', icon: 'checkCircle' },
                            { id: 'remplacement', label: 'Remplacement', icon: 'users' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <Icon name={tab.icon} size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenu des onglets */}
                <div className="min-h-[400px]">
                    {/* ONGLET GÉNÉRAL */}
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            {/* Informations de base */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Employé *
                                    </label>
                                    <select
                                        value={formData.personnelId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, personnelId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Sélectionner un employé...</option>
                                        {personnel.map(person => (
                                            <option key={person.id} value={person.id}>
                                                {person.nom} - {person.poste}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Type de congé *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            const type = typesConges.find(t => t.value === e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                type: e.target.value,
                                                paye: type?.paye || false
                                            }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {typesConges.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dates et durée */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.demiJournee}
                                            onChange={(e) => setFormData(prev => ({ ...prev, demiJournee: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">Demi-journée</span>
                                    </label>

                                    {formData.demiJournee && (
                                        <select
                                            value={formData.typeDemiJournee}
                                            onChange={(e) => setFormData(prev => ({ ...prev, typeDemiJournee: e.target.value }))}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                                        >
                                            <option value="matin">🌅 Matin</option>
                                            <option value="apres_midi">🌇 Après-midi</option>
                                        </select>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Date début *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateDebut}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            {formData.demiJournee ? 'Même date' : 'Date fin *'}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.demiJournee ? formData.dateDebut : formData.dateFin}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                dateFin: formData.demiJournee ? prev.dateDebut : e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            disabled={formData.demiJournee}
                                            required={!formData.demiJournee}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Heure début
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.heureDebut}
                                            onChange={(e) => setFormData(prev => ({ ...prev, heureDebut: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Heure fin
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.heureFin}
                                            onChange={(e) => setFormData(prev => ({ ...prev, heureFin: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Durée calculée */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900">
                                            Durée: {duree} {duree === 1 ? 'jour' : 'jours'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {typeCongeActuel && (
                                                <span
                                                    className="px-2 py-1 rounded text-xs text-white font-medium"
                                                    style={{ backgroundColor: typeCongeActuel.couleur }}
                                                >
                                                    {typeCongeActuel.label}
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                formData.paye ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {formData.paye ? 'Payé' : 'Non payé'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Raison et commentaires */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Raison du congé *
                                </label>
                                <input
                                    type="text"
                                    value={formData.raison}
                                    onChange={(e) => setFormData(prev => ({ ...prev, raison: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ex: Vacances en famille, Rendez-vous médical..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Commentaires additionnels
                                </label>
                                <textarea
                                    value={formData.commentaires}
                                    onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Informations supplémentaires..."
                                />
                            </div>

                            {/* Options avancées */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.urgent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, urgent: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">🚨 Urgent</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.paye}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paye: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">💰 Payé</span>
                                </label>
                            </div>

                            {/* Alertes de conflit */}
                            {conflits.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <Icon name="warning" size={20} className="text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-red-900">Conflit détecté</h4>
                                            <p className="text-sm text-red-800">
                                                {conflits.length} autre(s) congé(s) se chevauche(nt) avec cette période
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ONGLET APPROBATION */}
                    {activeTab === 'approbation' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Statut de la demande</h3>

                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        formData.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                        formData.statut === 'approuve' ? 'bg-green-100 text-green-800' :
                                        formData.statut === 'refuse' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                                    }`}>
                                        {formData.statut === 'en_attente' && '⏳ En attente'}
                                        {formData.statut === 'approuve' && '✅ Approuvé'}
                                        {formData.statut === 'refuse' && '❌ Refusé'}
                                        {formData.statut === 'annule' && '🚫 Annulé'}
                                    </span>

                                    {formData.dateApprobation && (
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            le {new Date(formData.dateApprobation).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {formData.approuvePar && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                        Traité par: {personnel.find(p => p.id === formData.approuvePar)?.nom || 'Inconnu'}
                                    </p>
                                )}

                                {/* Actions d'approbation pour coordinateurs */}
                                {estCoordonnateur && formData.statut === 'en_attente' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                                Commentaires d'approbation
                                            </label>
                                            <textarea
                                                value={formData.commentairesApprobation}
                                                onChange={(e) => setFormData(prev => ({ ...prev, commentairesApprobation: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Commentaires sur la décision..."
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleApprouver}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                                            >
                                                <Icon name="checkCircle" size={16} />
                                                Approuver
                                            </button>
                                            <button
                                                onClick={handleRefuser}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                                            >
                                                <Icon name="close" size={16} />
                                                Refuser
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formData.commentairesApprobation && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-sm text-blue-800">{formData.commentairesApprobation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ONGLET REMPLACEMENT */}
                    {activeTab === 'remplacement' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Remplaçant désigné
                                </label>
                                <select
                                    value={formData.remplacant || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, remplacant: e.target.value || null }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Aucun remplaçant</option>
                                    {personnel
                                        .filter(p => p.id !== formData.personnelId)
                                        .map(person => (
                                        <option key={person.id} value={person.id}>
                                            {person.nom} - {person.poste}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Tâches à transférer
                                </label>
                                <textarea
                                    value={formData.tachesTransferees.join('\n')}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        tachesTransferees: e.target.value.split('\n').filter(t => t.trim())
                                    }))}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Liste des tâches (une par ligne)..."
                                />
                            </div>

                            {formData.remplacant && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        📋 Le remplaçant sera notifié automatiquement de son assignation
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <div>
                        {conge && peutModifier && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Supprimer
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Annuler
                        </button>

                        {peutModifier && (
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sauvegarde...' : (conge ? 'Modifier' : 'Créer')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Modal de confirmation de suppression */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Confirmer la suppression
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce congé ? Cette action est irréversible.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}