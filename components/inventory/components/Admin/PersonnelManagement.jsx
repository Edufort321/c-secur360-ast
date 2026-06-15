// ============== GESTION DU PERSONNEL PAR DÉPARTEMENT ==============
// Composant pour gérer les employés avec permissions granulaires par onglet

import { invKey } from '../../utils/invKey'; // namespacing localStorage par tenant (anti-fuite inter-tenant)
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Building,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  Check,
  AlertCircle,
  Copy,
  CheckCircle
} from 'lucide-react';
import { generatePassword, generateUsername, generatePasswordSuggestions } from '../../utils/passwordGenerator';
import { useLanguage } from '../../contexts/LanguageContext';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'articles', label: 'Articles', icon: '📦' },
  { key: 'scanner', label: 'Scanner', icon: '📷' },
  { key: 'movements', label: 'Mouvements', icon: '🔄' },
  { key: 'reports', label: 'Rapports', icon: '📈' },
  { key: 'administration', label: 'Administration', icon: '⚙️' }
];

export const PersonnelManagement = ({ departments = [], onSave, defaultDepartmentId = null }) => {
  const { t } = useLanguage();
  const [personnel, setPersonnel] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(defaultDepartmentId || 'all');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    departmentId: defaultDepartmentId || '',
    role: 'employee',
    permissions: {
      dashboard: { view: false, edit: false },
      articles: { view: false, edit: false },
      scanner: { view: true, edit: true },
      movements: { view: false, edit: false },
      reports: { view: false, edit: false },
      administration: { view: false, edit: false }
    },
    canManageInventory: false // Permission spéciale pour le mode inventaire global
  });

  // Charger le personnel depuis localStorage
  useEffect(() => {
    const savedPersonnel = localStorage.getItem(invKey('c-secur360-inventory-personnel'));
    if (savedPersonnel) {
      setPersonnel(JSON.parse(savedPersonnel));
    }
  }, []);

  // Sauvegarder le personnel
  const savePersonnel = (newPersonnel) => {
    setPersonnel(newPersonnel);
    localStorage.setItem(invKey('c-secur360-inventory-personnel'), JSON.stringify(newPersonnel));
    if (onSave) onSave(newPersonnel);
  };

  // Générer username automatiquement
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      try {
        const username = generateUsername(formData.firstName, formData.lastName);
        setFormData(prev => ({ ...prev, username }));
      } catch (error) {
        console.error('Erreur génération username:', error);
      }
    }
  }, [formData.firstName, formData.lastName]);

  const handleGeneratePassword = () => {
    if (formData.firstName && formData.lastName) {
      try {
        const password = generatePassword(formData.firstName, formData.lastName);
        setFormData(prev => ({ ...prev, password }));
        setShowPassword(true);
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert('Veuillez remplir le prénom et le nom d\'abord');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handlePermissionChange = (tab, action, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [tab]: {
          ...prev.permissions[tab],
          [action]: value
        }
      }
    }));
  };

  const handleSelectAllTab = (tab, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [tab]: {
          view: value,
          edit: value
        }
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      departmentId: '',
      role: 'employee',
      permissions: {
        dashboard: { view: false, edit: false },
        articles: { view: false, edit: false },
        scanner: { view: true, edit: true },
        movements: { view: false, edit: false },
        reports: { view: false, edit: false },
        administration: { view: false, edit: false }
      },
      canManageInventory: false
    });
    setShowPassword(false);
    setPasswordCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.departmentId || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const employee = {
      id: editingEmployee ? editingEmployee.id : Date.now().toString(),
      ...formData,
      createdAt: editingEmployee ? editingEmployee.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingEmployee) {
      // Modification
      const updated = personnel.map(p => p.id === editingEmployee.id ? employee : p);
      savePersonnel(updated);
    } else {
      // Ajout
      savePersonnel([...personnel, employee]);
    }

    setShowAddModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...employee,
      canManageInventory: employee.canManageInventory || false
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      savePersonnel(personnel.filter(p => p.id !== id));
    }
  };

  const filteredPersonnel = selectedDepartment === 'all'
    ? personnel
    : personnel.filter(p => p.departmentId === selectedDepartment);

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'N/A';
  };

  const countPermissions = (permissions) => {
    let count = 0;
    Object.values(permissions).forEach(perm => {
      if (perm.view) count++;
      if (perm.edit) count++;
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion du Personnel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer les employés et leurs accès par département
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingEmployee(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={20} />
          Ajouter un employé
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrer par département:
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Tous les départements</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Liste du personnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Employé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Département
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPersonnel.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun employé trouvé
                </td>
              </tr>
            ) : (
              filteredPersonnel.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        <User size={20} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {employee.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          @{employee.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                      <Building size={14} />
                      {getDepartmentName(employee.departmentId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                      <Shield size={14} />
                      {employee.role === 'admin' ? 'Administrateur' :
                       employee.role === 'manager' ? 'Gestionnaire' : 'Employé'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {countPermissions(employee.permissions)} permissions actives
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="bg-slate-700 text-white p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informations personnelles */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User size={20} />
                    Informations personnelles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Éric"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom de famille *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Dufort"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="eric.dufort@c-secur360.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Généré automatiquement"
                      />
                    </div>
                  </div>
                </div>

                {/* Département et Rôle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Département *
                    </label>
                    <select
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionner un département</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rôle
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="employee">Employé</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Mot de passe
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                          placeholder="Mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        <RefreshCw size={18} />
                        Générer
                      </button>
                      {formData.password && (
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          title="Copier"
                        >
                          {passwordCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Format: 3 chiffres + 1 lettre prénom + 2 lettres nom + 1 caractère spécial
                      <br />
                      Exemple: Éric Dufort → 321Edu!
                    </div>
                  </div>
                </div>

                {/* Permissions par onglet */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Permissions par onglet
                  </h4>
                  <div className="space-y-3">
                    {TABS.map(tab => (
                      <div key={tab.key} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                            <span>{tab.icon}</span>
                            {tab.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions[tab.key]?.view || false}
                              onChange={(e) => handlePermissionChange(tab.key, 'view', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Voir</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions[tab.key]?.edit || false}
                              onChange={(e) => handlePermissionChange(tab.key, 'edit', e.target.checked)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Modifier</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleSelectAllTab(tab.key, !(formData.permissions[tab.key]?.view && formData.permissions[tab.key]?.edit))}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                          >
                            {formData.permissions[tab.key]?.view && formData.permissions[tab.key]?.edit ? 'Tout désélectionner' : 'Tout sélectionner'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Permission spéciale: Gestion Inventaire Global */}
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.canManageInventory || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, canManageInventory: e.target.checked }))}
                        className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Shield size={18} className="text-orange-600" />
                          Gestion Inventaire Global
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Peut activer le mode inventaire, bloquer les départements pendant l'inventaire, et générer les rapports d'irrégularités.
                          <span className="block mt-1 text-orange-700 dark:text-orange-400 font-medium">
                            ⚠️ Permission réservée aux gestionnaires et administrateurs
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  {editingEmployee ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelManagement;
