'use client';

import React, { useState } from 'react';
import {
  Shield,
  Users,
  Key,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  Info,
  CheckCircle,
  AlertCircle,
  Crown,
  UserCheck,
  Lock
} from 'lucide-react';

interface DemoRole {
  id: string;
  key: string;
  name: string;
  description: string;
  color: string;
  userCount: number;
  permissions: string[];
}

interface DemoUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
}

export default function DemoRBACPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles');

  const demoRoles: DemoRole[] = [
    {
      id: 'role-1',
      key: 'owner',
      name: 'Owner / Org Admin',
      description: 'Accès complet à la plateforme',
      color: 'bg-red-600',
      userCount: 1,
      permissions: ['all']
    },
    {
      id: 'role-2', 
      key: 'client_admin',
      name: 'Client Admin',
      description: 'Administration complète du client',
      color: 'bg-orange-600',
      userCount: 2,
      permissions: ['users.manage', 'inventory.manage', 'reports.view']
    },
    {
      id: 'role-3',
      key: 'site_manager',
      name: 'Gestionnaire de site',
      description: 'Gestion des sites assignés',
      color: 'bg-yellow-600',
      userCount: 5,
      permissions: ['timesheets.approve', 'inventory.view', 'users.view']
    },
    {
      id: 'role-4',
      key: 'worker',
      name: 'Travailleur / Technicien',
      description: 'Accès mobile de base',
      color: 'bg-green-600',
      userCount: 25,
      permissions: ['timesheets.create', 'inventory.scan']
    },
    {
      id: 'role-5',
      key: 'guest',
      name: 'Invité / Externe',
      description: 'Accès lecture limitée',
      color: 'bg-gray-600',
      userCount: 3,
      permissions: ['reports.view']
    }
  ];

  const demoUsers: DemoUser[] = [
    {
      id: 'user-1',
      name: 'Éric Dufort',
      email: 'eric.dufort@cerdia.ai',
      roles: ['owner'],
      status: 'active',
      lastLogin: '2024-08-24T20:30:00Z'
    },
    {
      id: 'user-2',
      name: 'Marie Tremblay',
      email: 'marie.tremblay@client.com',
      roles: ['client_admin'],
      status: 'active',
      lastLogin: '2024-08-24T18:45:00Z'
    },
    {
      id: 'user-3',
      name: 'Jean Dubois',
      email: 'jean.dubois@client.com',
      roles: ['site_manager'],
      status: 'active',
      lastLogin: '2024-08-24T14:20:00Z'
    },
    {
      id: 'user-4',
      name: 'Sophie Martin',
      email: 'sophie.martin@client.com',
      roles: ['worker'],
      status: 'active',
      lastLogin: '2024-08-24T16:15:00Z'
    },
    {
      id: 'user-5',
      name: 'Alex Consultation',
      email: 'alex@external.com',
      roles: ['guest'],
      status: 'pending'
    }
  ];

  const demoPermissions = [
    { key: 'users.view', module: 'Users', action: 'View', description: 'Voir la liste des utilisateurs' },
    { key: 'users.manage', module: 'Users', action: 'Manage', description: 'Gérer les utilisateurs' },
    { key: 'inventory.view', module: 'Inventory', action: 'View', description: 'Voir l\'inventaire' },
    { key: 'inventory.manage', module: 'Inventory', action: 'Manage', description: 'Gérer l\'inventaire' },
    { key: 'inventory.scan', module: 'Inventory', action: 'Scan', description: 'Scanner QR codes' },
    { key: 'timesheets.create', module: 'Timesheets', action: 'Create', description: 'Saisir les heures' },
    { key: 'timesheets.approve', module: 'Timesheets', action: 'Approve', description: 'Approuver les feuilles' },
    { key: 'reports.view', module: 'Reports', action: 'View', description: 'Voir les rapports' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Lock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (roleKey: string) => {
    switch (roleKey) {
      case 'owner':
        return <Crown className="w-4 h-4 text-white" />;
      case 'client_admin':
        return <Shield className="w-4 h-4 text-white" />;
      case 'site_manager':
        return <Users className="w-4 h-4 text-white" />;
      case 'worker':
        return <UserCheck className="w-4 h-4 text-white" />;
      default:
        return <Eye className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Bandeau démo */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">RBAC System Demo</p>
              <p className="text-xs text-green-700">Système de rôles et permissions avancé</p>
            </div>
            <a 
              href="/demo"
              className="text-green-600 hover:text-green-700 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600" />
              Gestion RBAC
            </h1>
            
            <button 
              onClick={() => alert('⚙️ Configuration avancée\n(Démo: paramètres globaux disponibles)')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-6">
            {[
              { id: 'roles', label: 'Rôles', icon: Shield },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'permissions', label: 'Permissions', icon: Key }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Rôles système</h2>
              <button
                onClick={() => alert('➕ Nouveau rôle\n(Démo: création de rôles personnalisés)')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Nouveau rôle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoRoles.map((role) => (
                <div key={role.id} className="bg-white rounded-lg shadow border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${role.color} p-2 rounded-lg flex items-center justify-center`}>
                      {getRoleIcon(role.key)}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => alert(`👁️ Détails du rôle "${role.name}"\n(Démo: vue détaillée avec historique)`)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => alert(`✏️ Modifier rôle "${role.name}"\n(Démo: édition permissions et portées)`)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
                    </span>
                    <span className="text-green-600 font-medium">
                      {role.permissions.length === 1 && role.permissions[0] === 'all' 
                        ? 'Tous droits'
                        : `${role.permissions.length} permissions`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Utilisateurs</h2>
              <button
                onClick={() => alert('➕ Inviter utilisateur\n(Démo: invitation par email avec MFA)')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Inviter
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rôles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {demoUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {user.roles.map((roleKey) => {
                            const role = demoRoles.find(r => r.key === roleKey);
                            return role ? (
                              <span
                                key={roleKey}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${role.color}`}
                              >
                                {role.name.split(' ')[0]}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="text-sm capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                          : 'Jamais'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert(`👁️ Profil de ${user.name}\n(Démo: historique et permissions)`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => alert(`✏️ Modifier ${user.name}\n(Démo: attribution rôles et portées)`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Permissions système</h2>
              <span className="text-sm text-gray-500">
                {demoPermissions.length} permissions disponibles
              </span>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utilisée par
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {demoPermissions.map((permission) => (
                    <tr key={permission.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{permission.module}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {permission.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {permission.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {Math.floor(Math.random() * 4) + 1} rôle(s)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">💡 Fonctionnalités RBAC avancées</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Portées granulaires:</strong> global, client, site, projet</li>
                <li>• <strong>Permissions temporaires:</strong> expiration automatique</li>
                <li>• <strong>Audit trail complet:</strong> qui, quand, quoi</li>
                <li>• <strong>MFA obligatoire:</strong> TOTP avec codes de secours</li>
                <li>• <strong>Invitations sécurisées:</strong> tokens temporaires</li>
                <li>• <strong>Hiérarchie des rôles:</strong> héritage de permissions</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}