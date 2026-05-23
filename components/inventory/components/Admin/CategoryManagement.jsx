// ============== GESTION DES CATÉGORIES AVEC SOUS-CATÉGORIES ==============
// Composant pour gérer les catégories et leurs sous-catégories

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  X,
  Save,
  Box,
  Folder,
  FolderTree
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const CategoryManagement = ({
  categories,
  articles,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', subcategories: [] });
  const [editFormData, setEditFormData] = useState({ name: '', subcategories: [] });
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newModalSubcategory, setNewModalSubcategory] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState(null); // Index de la sous-catégorie en cours d'édition
  const [editingSubcategoryValue, setEditingSubcategoryValue] = useState(''); // Valeur temporaire pendant l'édition

  // Calculer les statistiques pour chaque catégorie
  const getCategoryStats = (category) => {
    // Nombre d'articles dans cette catégorie
    const articlesCount = articles?.filter(article =>
      article.category === category.name
    ).length || 0;

    // Nombre de sous-catégories
    const subcategoriesCount = category.subcategories?.length || 0;

    return {
      articlesCount,
      subcategoriesCount
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name) {
      onAddCategory({
        name: formData.name,
        subcategories: formData.subcategories || []
      });
      setFormData({ name: '', subcategories: [] });
      setNewModalSubcategory('');
      setShowAddModal(false);
    }
  };

  const handleAddModalSubcategory = () => {
    if (newModalSubcategory.trim()) {
      setFormData(prev => ({
        ...prev,
        subcategories: [...(prev.subcategories || []), newModalSubcategory.trim()]
      }));
      setNewModalSubcategory('');
    }
  };

  const handleDeleteModalSubcategory = (subcategoryName) => {
    setFormData(prev => ({
      ...prev,
      subcategories: (prev.subcategories || []).filter(s => s !== subcategoryName)
    }));
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name,
      subcategories: category.subcategories || []
    });
  };

  const handleSaveEdit = () => {
    if (editFormData.name) {
      onUpdateCategory(editingCategory.id, {
        name: editFormData.name,
        subcategories: editFormData.subcategories
      });
      setEditingCategory(null);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim()) {
      setEditFormData(prev => ({
        ...prev,
        subcategories: [...(prev.subcategories || []), newSubcategory.trim()]
      }));
      setNewSubcategory('');
    }
  };

  const handleDeleteSubcategory = (subcategoryName) => {
    setEditFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(s => s !== subcategoryName)
    }));
  };

  const handleStartEditSubcategory = (index, subcategory) => {
    setEditingSubcategory(index);
    setEditingSubcategoryValue(subcategory);
  };

  const handleSaveEditSubcategory = (index) => {
    if (editingSubcategoryValue.trim() && editingSubcategoryValue !== editFormData.subcategories[index]) {
      setEditFormData(prev => ({
        ...prev,
        subcategories: prev.subcategories.map((s, i) => i === index ? editingSubcategoryValue.trim() : s)
      }));
    }
    setEditingSubcategory(null);
    setEditingSubcategoryValue('');
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditingSubcategoryValue('');
  };

  // Mode édition complète d'une catégorie
  if (editingCategory) {
    return (
      <div className="space-y-6">
        {/* Header avec retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditingCategory(null)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
              Retour
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tag size={28} className="text-slate-600" />
                {editingCategory.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Édition de la catégorie
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${editingCategory.name}" ?`)) {
                  onDeleteCategory(editingCategory.id);
                  setEditingCategory(null);
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

        {/* Formulaire d'édition simplifié */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag size={20} className="text-slate-600" />
                Informations générales
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Consommables"
                />
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Sous-catégories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FolderTree size={20} className="text-purple-600" />
                Sous-catégories ({(editFormData.subcategories || []).length})
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérez les sous-catégories de cette catégorie
                </p>

                {/* Formulaire d'ajout de sous-catégorie */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory()}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Ex: Article de sécurité"
                  />
                  <button
                    onClick={handleAddSubcategory}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {/* Liste des sous-catégories */}
                {editFormData.subcategories && editFormData.subcategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editFormData.subcategories.map((subcategory, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                      >
                        {editingSubcategory === idx ? (
                          // Mode édition inline
                          <>
                            <div className="flex items-center gap-2 flex-1">
                              <Folder size={18} className="text-purple-600 dark:text-purple-400" />
                              <input
                                type="text"
                                value={editingSubcategoryValue}
                                onChange={(e) => setEditingSubcategoryValue(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleSaveEditSubcategory(idx);
                                  if (e.key === 'Escape') handleCancelEditSubcategory();
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSaveEditSubcategory(idx)}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Sauvegarder"
                              >
                                <Save size={16} className="text-green-600 dark:text-green-400" />
                              </button>
                              <button
                                onClick={handleCancelEditSubcategory}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Annuler"
                              >
                                <X size={16} className="text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </>
                        ) : (
                          // Mode affichage normal
                          <>
                            <div className="flex items-center gap-2 flex-1">
                              <Folder size={18} className="text-purple-600 dark:text-purple-400" />
                              <span className="text-sm text-gray-900 dark:text-white font-medium">{subcategory}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditSubcategory(idx, subcategory)}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(subcategory)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <FolderTree size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Aucune sous-catégorie</p>
                    <p className="text-xs">Ajoutez une sous-catégorie ci-dessus</p>
                  </div>
                )}
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
            {t('administration.categories.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos catégories et sous-catégories
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Ajouter une catégorie
        </button>
      </div>

      {/* Liste des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map(category => {
          const stats = getCategoryStats(category);

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                      <Tag size={24} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {category.name}
                      </h3>
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
                      <FolderTree size={16} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Sous-catégories</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                      {stats.subcategoriesCount}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4">
                  <button
                    onClick={() => handleEdit(category)}
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

      {/* Modal d'ajout catégorie */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="bg-slate-700 text-white p-6 flex items-center justify-between rounded-t-lg">
                <h3 className="text-xl font-bold">Ajouter une catégorie</h3>
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
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Consommables"
                  />
                </div>

                {/* Sous-catégories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sous-catégories (optionnel)
                  </label>

                  {/* Formulaire d'ajout */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newModalSubcategory}
                      onChange={(e) => setNewModalSubcategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModalSubcategory())}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      placeholder="Ex: Article de sécurité"
                    />
                    <button
                      type="button"
                      onClick={handleAddModalSubcategory}
                      className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      Ajouter
                    </button>
                  </div>

                  {/* Liste des sous-catégories */}
                  {formData.subcategories && formData.subcategories.length > 0 && (
                    <div className="space-y-2">
                      {formData.subcategories.map((subcategory, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Folder size={16} className="text-purple-600 dark:text-purple-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{subcategory}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteModalSubcategory(subcategory)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
};

export default CategoryManagement;
