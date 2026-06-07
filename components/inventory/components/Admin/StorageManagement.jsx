// ============== GESTION DES EMPLACEMENTS DE STOCKAGE ==============
// Composant pour gérer les étagères, tablettes et espaces de rangement

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  X,
  Save,
  Grid,
  Layers,
  Box,
  Building
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const StorageManagement = ({
  storageUnits,
  articles,
  departments,
  onAddStorageUnit,
  onUpdateStorageUnit,
  onDeleteStorageUnit
}) => {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    departmentId: '',
    numberOfShelves: 0,
    numberOfSpaces: 0
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    departmentId: '',
    numberOfShelves: 0,
    numberOfSpaces: 0
  });

  // Calculer les statistiques pour chaque unité de stockage
  const getStorageStats = (unit) => {
    const totalCapacity = (unit.numberOfShelves || 0) * (unit.numberOfSpaces || 0);

    // Compter les articles assignés à cette unité
    const assignedArticles = articles?.filter(article => {
      // Vérifier si l'article est assigné à cette unité de stockage
      if (article.storageLocation && article.storageLocation.unitCode === unit.code) {
        return true;
      }
      return false;
    }).length || 0;

    const occupancyRate = totalCapacity > 0 ? (assignedArticles / totalCapacity * 100).toFixed(1) : 0;
    const availableSpaces = totalCapacity - assignedArticles;

    return {
      totalCapacity,
      assignedArticles,
      availableSpaces,
      occupancyRate
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.departmentId) {
      onAddStorageUnit({
        name: formData.name,
        code: formData.code ? formData.code.toUpperCase() : '',
        departmentId: formData.departmentId,
        numberOfShelves: parseInt(formData.numberOfShelves) || 0,
        numberOfSpaces: parseInt(formData.numberOfSpaces) || 0,
        shelves: [] // Array pour stocker les détails des tablettes si nécessaire
      });
      setFormData({ name: '', code: '', departmentId: '', numberOfShelves: 0, numberOfSpaces: 0 });
      setShowAddModal(false);
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setEditFormData({
      name: unit.name,
      code: unit.code,
      departmentId: unit.departmentId || '',
      numberOfShelves: unit.numberOfShelves || 0,
      numberOfSpaces: unit.numberOfSpaces || 0
    });
  };

  const handleSaveEdit = () => {
    if (editFormData.name && editFormData.departmentId) {
      const updatedUnit = {
        ...editingUnit,
        name: editFormData.name,
        code: editFormData.code ? editFormData.code.toUpperCase() : '',
        departmentId: editFormData.departmentId,
        numberOfShelves: parseInt(editFormData.numberOfShelves) || 0,
        numberOfSpaces: parseInt(editFormData.numberOfSpaces) || 0
      };
      onUpdateStorageUnit(editingUnit.id, updatedUnit);
      setEditingUnit(null);
    }
  };

  // Mode édition complète d'une unité de stockage
  if (editingUnit) {
    const stats = getStorageStats(editingUnit);

    return (
      <div className="space-y-6">
        {/* Header avec retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditingUnit(null)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
              {t('administration.departments.backToDepartments')}
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Grid size={28} className="text-slate-600" />
                {editingUnit.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('administration.locations.editShelf')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onDeleteStorageUnit(editingUnit.id); setEditingUnit(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={20} />
              {t('actions.delete')}
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={20} />
              {t('actions.save')}
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Grid size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {t('administration.locations.capacity')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {stats.totalCapacity}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {t('administration.locations.spaces')}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {t('administration.locations.occupied')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {stats.assignedArticles}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {t('common.article')}s
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Box size={18} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {t('administration.locations.available')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                  {stats.availableSpaces}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {t('administration.locations.spaces')}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={18} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    {t('administration.locations.occupancy')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                  {stats.occupancyRate}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {t('common.total')}
                </p>
              </div>
            </div>

            {/* Formulaire d'édition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('administration.locations.shelfName')} *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Étagère principale A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('administration.locations.shelfCode')} *
                </label>
                <input
                  type="text"
                  value={editFormData.code}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                  placeholder="EPA"
                  maxLength={5}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Succursale *
                </label>
                <select
                  value={editFormData.departmentId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner une succursale...</option>
                  {departments?.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('administration.locations.numberOfShelves')} *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editFormData.numberOfShelves}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, numberOfShelves: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Nombre de tablettes verticales
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('administration.locations.numberOfSpaces')} *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editFormData.numberOfSpaces}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, numberOfSpaces: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Espaces horizontaux par tablette
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('administration.locations.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('administration.locations.description')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          {t('administration.locations.addShelf')}
        </button>
      </div>

      {/* Liste des unités de stockage */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {storageUnits.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Grid size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('administration.locations.noShelvesConfigured')}
            </p>
          </div>
        ) : (
          storageUnits.map(unit => {
            const stats = getStorageStats(unit);

            return (
              <div
                key={unit.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                        <Grid size={24} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {unit.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {unit.code}
                        </p>
                        {unit.departmentId && departments && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building size={12} className="text-blue-600 dark:text-blue-400" />
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {departments.find(d => d.id === unit.departmentId)?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {t('administration.locations.shelves')}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                        {unit.numberOfShelves || 0}
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Box size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          {t('administration.locations.spaces')}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                        {unit.numberOfSpaces || 0}
                      </p>
                    </div>
                  </div>

                  {/* Statistiques d'occupation */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t('administration.locations.occupancy')}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {stats.assignedArticles} / {stats.totalCapacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.occupancyRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {stats.occupancyRate}% {t('administration.locations.occupied').toLowerCase()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleEdit(unit)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                    >
                      <Edit size={18} />
                      {t('actions.edit')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="bg-slate-700 text-white p-6 flex items-center justify-between rounded-t-lg">
                <h3 className="text-xl font-bold">{t('administration.locations.addShelf')}</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('administration.locations.shelfName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Étagère principale A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('administration.locations.shelfCode')}
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                      placeholder="EPA"
                      maxLength={5}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Code unique (ex: EPA, EPB, etc.) - Optionnel
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Succursale *
                    </label>
                    <select
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionner une succursale...</option>
                      {departments?.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Associez cet emplacement à une succursale
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('administration.locations.numberOfShelves')} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="50"
                      value={formData.numberOfShelves}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfShelves: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nombre de tablettes verticales (1-50)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('administration.locations.numberOfSpaces')} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="50"
                      value={formData.numberOfSpaces}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfSpaces: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Espaces horizontaux par tablette (1-50)
                    </p>
                  </div>
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

export default StorageManagement;
