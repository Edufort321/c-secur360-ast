"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Shield, Mail, Phone, Building, Calendar, Clock,
  Settings, ChevronDown, ChevronRight, AlertTriangle,
  Check, X, Send, Eye, EyeOff, Copy, QrCode, Smartphone
} from 'lucide-react';
import Header from '@/components/ui/Header';
import { 
  Role, 
  Permission, 
  CreateEmployeeRequest, 
  ScopeType,
  SYSTEM_ROLES,
  PERMISSION_MODULES,
  SCOPE_LABELS 
} from '@/types/rbac';

interface PermissionGroup {
  module: string;
  permissions: Permission[];
  enabled: boolean;
}

interface CustomPermission {
  permission_id: string;
  permission_key: string;
  decision: 'allow' | 'deny';
  scope_type: ScopeType;
  scope_id?: string;
}

export default function CreateEmployeePage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    role_id: '',
    scope_type: 'site',
    mfa_required: true,
    qr_enrollment_required: true,
    mobile_only: false,
    can_export: true,
    send_invitation: true,
    send_via: ['email'],
    custom_permissions: []
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showCustomPermissions, setShowCustomPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<CustomPermission[]>([]);
  const [previewSummary, setPreviewSummary] = useState<string[]>([]);
  
  // Data state
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [availableScopes, setAvailableScopes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadRoles();
    loadPermissions();
    loadAvailableScopes();
  }, []);

  // Update preview when form changes
  useEffect(() => {
    updatePreview();
  }, [formData, customPermissions]);

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/rbac/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/rbac/permissions');
      if (response.ok) {
        const data = await response.json();
        // Group by module
        const groups: Record<string, Permission[]> = {};
        for (const permission of data) {
          if (!groups[permission.module]) {
            groups[permission.module] = [];
          }
          groups[permission.module].push(permission);
        }
        
        const permissionGroups = Object.entries(groups).map(([module, permissions]) => ({
          module,
          permissions,
          enabled: false
        }));
        
        setPermissionGroups(permissionGroups);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const loadAvailableScopes = async () => {
    // TODO: Load clients, sites, projects based on current user permissions
    setAvailableScopes([
      { type: 'client', id: 'demo', name: 'Demo Client', subtitle: 'Client de démonstration' },
      { type: 'site', id: 'site1', name: 'Site Principal', subtitle: 'demo.csecur360.ca' },
      { type: 'site', id: 'site2', name: 'Site Secondaire', subtitle: 'Montréal, QC' }
    ]);
  };

  const updatePreview = () => {
    const summary = [];
    
    // Selected role
    const selectedRole = roles.find(r => r.id === formData.role_id);
    if (selectedRole) {
      summary.push(`Rôle: ${selectedRole.name}`);
    }

    // Scope
    if (formData.scope_type && formData.scope_id) {
      const scope = availableScopes.find(s => s.id === formData.scope_id);
      summary.push(`Portée: ${SCOPE_LABELS[formData.scope_type]} - ${scope?.name || 'Inconnu'}`);
    } else if (formData.scope_type === 'global') {
      summary.push('Portée: Global (toute l\'organisation)');
    }

    // Custom permissions
    if (customPermissions.length > 0) {
      const allows = customPermissions.filter(p => p.decision === 'allow').length;
      const denies = customPermissions.filter(p => p.decision === 'deny').length;
      summary.push(`Permissions personnalisées: +${allows} -${denies}`);
    }

    // Security
    const securityFeatures = [];
    if (formData.mfa_required) securityFeatures.push('MFA obligatoire');
    if (formData.qr_enrollment_required) securityFeatures.push('QR enrollment');
    if (formData.mobile_only) securityFeatures.push('Mobile uniquement');
    if (!formData.can_export) securityFeatures.push('Pas d\'export');
    
    if (securityFeatures.length > 0) {
      summary.push(`Sécurité: ${securityFeatures.join(', ')}`);
    }

    setPreviewSummary(summary);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addCustomPermission = (permission: Permission) => {
    const newPermission: CustomPermission = {
      permission_id: permission.id,
      permission_key: permission.key,
      decision: 'allow',
      scope_type: formData.scope_type,
      scope_id: formData.scope_id
    };

    setCustomPermissions(prev => [...prev, newPermission]);
  };

  const removeCustomPermission = (index: number) => {
    setCustomPermissions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomPermission = (index: number, updates: Partial<CustomPermission>) => {
    setCustomPermissions(prev => prev.map((perm, i) => 
      i === index ? { ...perm, ...updates } : perm
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare the request
      const request: CreateEmployeeRequest = {
        ...formData,
        custom_permissions: customPermissions.map(cp => ({
          permission_id: cp.permission_id,
          decision: cp.decision,
          scope_type: cp.scope_type,
          scope_id: cp.scope_id
        }))
      };

      const response = await fetch('/api/rbac/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/employees?created=true');
      } else {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      setError('Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.id === formData.role_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Créer un employé"
        subtitle="Gestion des accès et permissions"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Informations de base</h2>
                    <p className="text-sm text-gray-600">Identité et contact de l'employé</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (514) 000-0000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Permissions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Rôle et Permissions</h2>
                    <p className="text-sm text-gray-600">Niveau d'accès et portée d'application</p>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle modèle *
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionner un rôle...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scope Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de portée *
                    </label>
                    <select
                      value={formData.scope_type}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        scope_type: e.target.value as ScopeType,
                        scope_id: e.target.value === 'global' ? undefined : prev.scope_id
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="global">Global (organisation)</option>
                      <option value="client">Client</option>
                      <option value="site">Site</option>
                      <option value="project">Projet</option>
                    </select>
                  </div>

                  {formData.scope_type !== 'global' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {SCOPE_LABELS[formData.scope_type]} *
                      </label>
                      <select
                        value={formData.scope_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, scope_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {availableScopes
                          .filter(scope => scope.type === formData.scope_type)
                          .map(scope => (
                            <option key={scope.id} value={scope.id}>
                              {scope.name} {scope.subtitle && `(${scope.subtitle})`}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>

                {/* Custom Permissions Toggle */}
                <div className="border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomPermissions(!showCustomPermissions)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {showCustomPermissions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Personnaliser les permissions ({customPermissions.length})
                  </button>

                  {showCustomPermissions && (
                    <div className="mt-4 space-y-4">
                      {/* Permission Groups */}
                      {permissionGroups.map(group => (
                        <div key={group.module} className="border border-gray-200 rounded-lg p-4">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection(group.module)}
                          >
                            <h4 className="font-medium text-gray-900">
                              {PERMISSION_MODULES[group.module] || group.module}
                              <span className="ml-2 text-sm text-gray-500">
                                ({group.permissions.length} permissions)
                              </span>
                            </h4>
                            {expandedSections[group.module] ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </div>

                          {expandedSections[group.module] && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {group.permissions.map(permission => (
                                <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">{permission.name}</span>
                                    {permission.is_dangerous && (
                                      <AlertTriangle className="inline w-4 h-4 text-red-500 ml-1" />
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addCustomPermission(permission)}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={customPermissions.some(cp => cp.permission_id === permission.id)}
                                  >
                                    {customPermissions.some(cp => cp.permission_id === permission.id) ? 'Ajoutée' : 'Ajouter'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Custom Permissions List */}
                      {customPermissions.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-3">Permissions personnalisées</h4>
                          <div className="space-y-2">
                            {customPermissions.map((perm, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                                <code className="text-xs text-gray-600 flex-1">{perm.permission_key}</code>
                                <select
                                  value={perm.decision}
                                  onChange={(e) => updateCustomPermission(index, { decision: e.target.value as 'allow' | 'deny' })}
                                  className="px-2 py-1 text-xs border rounded"
                                >
                                  <option value="allow">Autoriser</option>
                                  <option value="deny">Refuser</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => removeCustomPermission(index)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                    <p className="text-sm text-gray-600">Paramètres d'authentification et restrictions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.mfa_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, mfa_required: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">MFA obligatoire</span>
                      <p className="text-sm text-gray-600">Double authentification requise pour tous les accès</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.qr_enrollment_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, qr_enrollment_required: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Inscription QR (TOTP)</span>
                      <p className="text-sm text-gray-600">Configuration Google Authenticator au premier login</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.mobile_only}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile_only: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Accès mobile uniquement</span>
                      <p className="text-sm text-gray-600">Restreindre aux appareils mobiles</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.can_export}
                      onChange={(e) => setFormData(prev => ({ ...prev, can_export: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Autoriser les exports</span>
                      <p className="text-sm text-gray-600">Permet d'exporter des données vers Excel/PDF</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Invitation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Invitation</h2>
                    <p className="text-sm text-gray-600">Processus d'intégration de l'employé</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.send_invitation}
                      onChange={(e) => setFormData(prev => ({ ...prev, send_invitation: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Envoyer une invitation</span>
                  </label>

                  {formData.send_invitation && (
                    <div className="ml-7 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Canaux d'envoi
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.send_via.includes('email')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    send_via: [...prev.send_via, 'email'] 
                                  }));
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    send_via: prev.send_via.filter(v => v !== 'email') 
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Email</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.send_via.includes('sms')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    send_via: [...prev.send_via, 'sms'] 
                                  }));
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    send_via: prev.send_via.filter(v => v !== 'sms') 
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Smartphone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">SMS</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message personnalisé
                        </label>
                        <textarea
                          value={formData.custom_message || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, custom_message: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Message d'accueil optionnel..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.email || !formData.first_name || !formData.last_name || !formData.role_id}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Créer l'employé
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aperçu des accès
              </h3>

              {selectedRole && (
                <div className="mb-6">
                  <div 
                    className="w-full h-3 rounded-full mb-2"
                    style={{ backgroundColor: selectedRole.color + '20' }}
                  >
                    <div 
                      className="h-3 rounded-full"
                      style={{ 
                        backgroundColor: selectedRole.color,
                        width: '100%'
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium" style={{ color: selectedRole.color }}>
                    {selectedRole.name}
                  </p>
                </div>
              )}

              {previewSummary.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">Ce que cette personne pourra faire:</p>
                  <ul className="space-y-2">
                    {previewSummary.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Sélectionnez un rôle pour voir l'aperçu des permissions
                </p>
              )}

              {formData.send_invitation && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Invitation</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    L'employé recevra un lien d'activation par {formData.send_via.join(' et ')}
                    {formData.qr_enrollment_required && ', avec configuration QR TOTP obligatoire'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}