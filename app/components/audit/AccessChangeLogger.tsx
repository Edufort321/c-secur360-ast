'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  User,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';

interface AuditEntry {
  id: string;
  user_id: string;
  event_type: string;
  target_user_id?: string;
  target_resource?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed' | 'pending';
  metadata?: Record<string, any>;
  created_at: string;
  users?: {
    email: string;
    full_name: string;
  };
  target_users?: {
    email: string;
    full_name: string;
  };
}

interface AccessChangeLoggerProps {
  userId?: string; // Filtrer par utilisateur
  resourceType?: string; // Filtrer par type de ressource
  maxEntries?: number;
  autoRefresh?: boolean;
  showFilters?: boolean;
}

export default function AccessChangeLogger({
  userId,
  resourceType,
  maxEntries = 100,
  autoRefresh = false,
  showFilters = true
}: AccessChangeLoggerProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    targetUser: ''
  });

  useEffect(() => {
    loadAuditEntries();
    
    if (autoRefresh) {
      const interval = setInterval(loadAuditEntries, 30000); // 30 secondes
      return () => clearInterval(interval);
    }
  }, [userId, resourceType, filters]);

  const loadAuditEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (resourceType) params.append('resourceType', resourceType);
      if (maxEntries) params.append('limit', maxEntries.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/audit/access-changes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur chargement audit');
      }
      
      const data = await response.json();
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLog = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/audit/access-changes/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur export');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-access-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  const getEventIcon = (eventType: string, status: string) => {
    if (status === 'failed') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    
    if (status === 'pending') {
      return <Clock className="w-4 h-4 text-amber-600" />;
    }

    switch (eventType) {
      case 'role_assigned':
      case 'role_updated':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'role_removed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'permission_granted':
      case 'permission_updated':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'permission_revoked':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'security_settings_updated':
        return <Settings className="w-4 h-4 text-gray-600" />;
      case 'access_granted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'access_denied':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'role_assigned': 'Rôle attribué',
      'role_updated': 'Rôle modifié',
      'role_removed': 'Rôle supprimé',
      'permission_granted': 'Permission accordée',
      'permission_updated': 'Permission modifiée',
      'permission_revoked': 'Permission révoquée',
      'security_settings_updated': 'Paramètres sécurité modifiés',
      'access_granted': 'Accès accordé',
      'access_denied': 'Accès refusé',
      'mfa_enabled': 'MFA activé',
      'mfa_disabled': 'MFA désactivé',
      'password_changed': 'Mot de passe changé',
      'login_attempt': 'Tentative connexion',
      'logout': 'Déconnexion'
    };
    
    return labels[eventType] || eventType;
  };

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return null;
    
    const changes = [];
    
    if (oldValues && newValues) {
      Object.keys(newValues).forEach(key => {
        if (oldValues[key] !== newValues[key]) {
          changes.push(
            <div key={key} className="text-xs text-gray-600">
              <strong>{key}:</strong> {oldValues[key]} → {newValues[key]}
            </div>
          );
        }
      });
    } else if (newValues) {
      Object.entries(newValues).forEach(([key, value]) => {
        changes.push(
          <div key={key} className="text-xs text-green-700">
            <strong>{key}:</strong> +{String(value)}
          </div>
        );
      });
    } else if (oldValues) {
      Object.entries(oldValues).forEach(([key, value]) => {
        changes.push(
          <div key={key} className="text-xs text-red-700">
            <strong>{key}:</strong> -{String(value)}
          </div>
        );
      });
    }
    
    return changes.length > 0 ? <div className="space-y-1">{changes}</div> : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Audit des Changements d'Accès
            </h2>
            <p className="text-sm text-gray-600">
              Historique des modifications de permissions et rôles
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={exportAuditLog}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          
          <button
            onClick={loadAuditEntries}
            disabled={loading}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Filtres</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les événements</option>
              <option value="role_assigned">Rôle attribué</option>
              <option value="role_removed">Rôle supprimé</option>
              <option value="permission_granted">Permission accordée</option>
              <option value="permission_revoked">Permission révoquée</option>
              <option value="access_denied">Accès refusé</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="success">Succès</option>
              <option value="failed">Échec</option>
              <option value="pending">En attente</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Date de début"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Date de fin"
            />

            <input
              type="text"
              value={filters.targetUser}
              onChange={(e) => setFilters({ ...filters, targetUser: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Utilisateur cible"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Liste des entrées d'audit */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucune entrée d'audit trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getEventIcon(entry.event_type, entry.status)}
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {getEventLabel(entry.event_type)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entry.status === 'success' ? 'bg-green-100 text-green-700' :
                          entry.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Par:</strong> {entry.users?.full_name || entry.users?.email || 'Système'}
                        </p>
                        
                        {entry.target_users && (
                          <p>
                            <strong>Cible:</strong> {entry.target_users.full_name || entry.target_users.email}
                          </p>
                        )}
                        
                        {entry.target_resource && (
                          <p>
                            <strong>Ressource:</strong> {entry.target_resource}
                          </p>
                        )}
                        
                        <p className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.created_at).toLocaleString('fr-FR')}
                        </p>
                        
                        {entry.ip_address && (
                          <p className="text-xs">
                            IP: {entry.ip_address}
                          </p>
                        )}
                      </div>
                      
                      {(entry.old_values || entry.new_values) && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border">
                          <div className="text-xs font-medium text-gray-700 mb-1">Changements:</div>
                          {formatChanges(entry.old_values, entry.new_values)}
                        </div>
                      )}
                      
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            Métadonnées
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(entry.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length >= maxEntries && (
        <div className="text-center text-sm text-gray-500">
          Affichage des {maxEntries} dernières entrées. Utilisez les filtres pour affiner la recherche.
        </div>
      )}
    </div>
  );
}