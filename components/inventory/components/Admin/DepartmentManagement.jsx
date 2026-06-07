// ============== GESTION DES DÉPARTEMENTS AVEC PERSONNEL ==============
// Composant pour gérer les départements/succursales et leur personnel

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Building,
  Users,
  ChevronRight,
  X,
  Save,
  Package,
  Box,
  LayoutGrid,
  Grid
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const DepartmentManagement = ({
  departments,
  articles,
  storageUnits,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddStorageUnit,
  onUpdateStorageUnit,
  onDeleteStorageUnit,
  activeTab,
  setActiveTab
}) => {
  const { t } = useLanguage();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', locations: '' });
  const [storageFormData, setStorageFormData] = useState({
    name: '',
    code: '',
    numberOfShelves: 0,
    numberOfSpaces: 0
  });
  // activeTab et setActiveTab sont maintenant des props pour persister entre les re-renders
  // État séparé pour les onglets INTERNES quand on édite une succursale
  const [editingDepartmentTab, setEditingDepartmentTab] = useState('general');

  // Calculer les statistiques pour chaque département
  const getDepartmentStats = (dept) => {
    // Nombre d'articles dans ce département
    const articlesCount = articles?.filter(article => {
      if (!article.departments) return false;
      return article.departments.some(d => d.id === dept.id || d === dept.id);
    }).length || 0;

    // Nombre d'emplacements de stockage
    const storageCount = storageUnits?.filter(s => s.departmentId === dept.id).length || 0;

    // Nombre total de capacité (emplacements)
    const totalCapacity = storageUnits
      ?.filter(s => s.departmentId === dept.id)
      .reduce((total, unit) => {
        return total + ((unit.numberOfShelves || 0) * (unit.numberOfSpaces || 0));
      }, 0) || 0;

    return {
      articlesCount,
      storageCount,
      totalCapacity
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.name && formData.code) {
      onAddDepartment({
        name: formData.name,
        code: formData.code,
        locations: []
      });
      setFormData({ name: '', code: '', locations: '' });
      setShowAddModal(false);
    }
  };

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', code: '', locations: '' });

  const handleEdit = (dept) => {
    setEditingDepartment(dept);
    setEditFormData({
      name: dept.name,
      code: dept.code,
      locations: (dept.locations || []).join(', '),
      rackings: dept.rackings || []
    });
  };

  const handleSaveEdit = () => {
    if (editFormData.name && editFormData.code) {
      const locations = editFormData.locations
        .split(',')
        .map(loc => loc.trim())
        .filter(loc => loc.length > 0);

      const updatedDept = {
        ...editingDepartment,
        name: editFormData.name,
        code: editFormData.code,
        locations: locations,
        rackings: editFormData.rackings || editingDepartment.rackings || []
      };

      onUpdateDepartment(editingDepartment.id, updatedDept);
      setEditingDepartment(null);
    }
  };

  const handleAddStorage = (e, deptId) => {
    e.preventDefault();

    const { name, code, numberOfShelves, numberOfSpaces } = storageFormData;
    if (!name) {
      alert('Veuillez entrer un nom pour l\'emplacement');
      return;
    }

    onAddStorageUnit({
      name,
      code: code ? code.toUpperCase() : '',
      departmentId: deptId,
      numberOfShelves: parseInt(numberOfShelves) || 0,
      numberOfSpaces: parseInt(numberOfSpaces) || 0,
      shelves: []
    });

    setStorageFormData({ name: '', code: '', numberOfShelves: 0, numberOfSpaces: 0 });
    setShowStorageModal(false);
  };

  const handleDeleteStorage = (storageId) => {
    if (!window.confirm('Supprimer cet emplacement ?')) return;
    onDeleteStorageUnit(storageId);
  };

  // Mode édition complète d'un département
  if (editingDepartment) {
    return (
      <div className="space-y-6">
        {/* Header avec retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditingDepartment(null)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
              Retour
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building size={28} className="text-slate-600" />
                {editingDepartment.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Édition de la succursale
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer la succursale "${editingDepartment.name}" ?`)) {
                  onDeleteDepartment(editingDepartment.id);
                  setEditingDepartment(null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={20} />
              Supprimer
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={20} />
              Enregistrer
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setEditingDepartmentTab('general')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  editingDepartmentTab === 'general'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Building className="inline-block mr-2" size={18} />
                Informations générales
              </button>
              <button
                onClick={() => setEditingDepartmentTab('storage')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  editingDepartmentTab === 'storage'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Grid className="inline-block mr-2" size={18} />
                Emplacements ({storageUnits?.filter(s => s.departmentId === editingDepartment.id).length || 0})
              </button>
              {/* Onglet Personnel retiré : l'identité vient de l'admin principal + auth de connexion. */}
            </div>
          </div>

          <div className="p-6">
            {/* Onglet Informations générales */}
            {editingDepartmentTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom de la succursale *
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Succursale A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={editFormData.code}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="SUC-A"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Emplacements */}
            {editingDepartmentTab === 'storage' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérez les emplacements de stockage de cette succursale
                  </p>
                  <button
                    onClick={() => {
                      setShowStorageModal(true);
                      setStorageFormData({ name: '', code: '', numberOfShelves: 0, numberOfSpaces: 0 });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={18} />
                    Ajouter un emplacement
                  </button>
                </div>

                {storageUnits?.filter(s => s.departmentId === editingDepartment.id).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {storageUnits.filter(s => s.departmentId === editingDepartment.id).map((unit) => {
                      const totalCapacity = (unit.numberOfShelves || 0) * (unit.numberOfSpaces || 0);
                      const assignedArticles = articles?.filter(article =>
                        article.storageLocation && article.storageLocation.unitCode === unit.code
                      ).length || 0;
                      const occupancyRate = totalCapacity > 0 ? (assignedArticles / totalCapacity * 100).toFixed(1) : 0;

                      return (
                        <div
                          key={unit.id}
                          className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                {unit.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                {unit.code}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteStorage(unit.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <strong>{unit.numberOfShelves || 0}</strong> tablettes
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <strong>{unit.numberOfSpaces || 0}</strong> espaces
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Capacité: <strong>{totalCapacity}</strong> emplacements
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${occupancyRate}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {assignedArticles} / {totalCapacity} ({occupancyRate}% occupé)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Grid size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Aucun emplacement configuré</p>
                    <p className="text-sm">Cliquez sur "Ajouter un emplacement" pour commencer</p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Personnel retiré (identité = admin principal + auth de connexion). */}
          </div>
        </div>

        {/* Modal d'ajout emplacement */}
        {showStorageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
              <form onSubmit={(e) => handleAddStorage(e, editingDepartment.id)}>
                {/* Header */}
                <div className="bg-slate-700 text-white p-6 flex items-center justify-between rounded-t-lg">
                  <h3 className="text-xl font-bold">Ajouter un Emplacement</h3>
                  <button
                    type="button"
                    onClick={() => setShowStorageModal(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom de l'emplacement *
                      </label>
                      <input
                        type="text"
                        required
                        value={storageFormData.name}
                        onChange={(e) => setStorageFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Étagère principale A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        value={storageFormData.code}
                        onChange={(e) => setStorageFormData(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                        placeholder="EPA"
                        maxLength={5}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Code unique (optionnel)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre de tablettes
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={storageFormData.numberOfShelves}
                        onChange={(e) => setStorageFormData(prev => ({ ...prev, numberOfShelves: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Optionnel - Tablettes verticales
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre d'espaces
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={storageFormData.numberOfSpaces}
                        onChange={(e) => setStorageFormData(prev => ({ ...prev, numberOfSpaces: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Optionnel - Espaces par tablette
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>Succursale:</strong> {editingDepartment.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Capacité totale: {(parseInt(storageFormData.numberOfShelves) || 0) * (parseInt(storageFormData.numberOfSpaces) || 0)} emplacements
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => setShowStorageModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Save size={20} />
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode sélection personnel (ancien mode)
  if (selectedDepartment) {
    return (
      <div className="space-y-6">
        {/* Header avec retour */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDepartment(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
            {t('administration.departments.backToDepartments')}
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building size={28} className="text-slate-600" />
              {selectedDepartment.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Code: {selectedDepartment.code}
            </p>
          </div>
        </div>

        {/* Personnel retiré de l'inventaire (identité = admin principal + auth). */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('administration.departments.manageDepartments')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('administration.departments.manageDepartmentsDescription')}
          </p>
        </div>
        {/* Plus d'ajout local : les sites/departements sont geres dans l'Administration principale. */}
        <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 whitespace-nowrap">
          ⓘ Gérés dans Administration → Sites / Départements
        </span>
      </div>

      {/* Liste des départements - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map(dept => {
          const stats = getDepartmentStats(dept);

          return (
            <div
              key={dept.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                      <Building size={24} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      {dept.isSite ? (
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          <span className="text-blue-600 dark:text-blue-400">Site :</span> {dept.name}
                        </h3>
                      ) : (
                        <>
                          <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Site : {dept.siteName || '—'}</p>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            <span className="text-gray-500 dark:text-gray-400 font-semibold">Département :</span> {dept.name}
                          </h3>
                        </>
                      )}
                      {dept.code && <p className="text-sm text-gray-600 dark:text-gray-400">{dept.code}</p>}
                    </div>
                  </div>
                </div>

                {/* Mini Dashboard - Statistiques */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Box size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Articles</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      {stats.articlesCount}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Grid size={16} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Emplacements</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                      {stats.storageCount}
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <LayoutGrid size={16} className="text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Capacité totale</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      {stats.totalCapacity} <span className="text-sm font-normal">emplacements</span>
                    </p>
                  </div>
                </div>

              {/* Actions */}
              <div className="mt-4">
                <button
                  onClick={() => handleEdit(dept)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  <Edit size={18} />
                  Modifier
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Modal d'ajout département */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="bg-slate-700 text-white p-6 flex items-center justify-between rounded-t-lg">
                <h3 className="text-xl font-bold">{t('administration.departments.addDepartment')}</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('administration.departments.departmentName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Succursale A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('administration.departments.departmentCode')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="SUC-A"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  {t('actions.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
