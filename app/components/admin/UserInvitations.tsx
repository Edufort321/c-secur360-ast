'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  AlertTriangle,
  RefreshCw,
  Send
} from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  mfa_required: boolean;
  invited_by: string;
  users?: {
    email: string;
    full_name: string;
  };
}

export default function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    clientId: ''
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/invitations');
      if (!response.ok) {
        throw new Error('Erreur chargement invitations');
      }
      
      const data = await response.json();
      setInvitations(data.invitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      setError('Email et rôle requis');
      return;
    }

    setInviteLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur envoi invitation');
      }

      // Reset form et reload
      setInviteForm({ email: '', role: 'employee', clientId: '' });
      setShowInviteForm(false);
      loadInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur envoi');
    } finally {
      setInviteLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'expired':
        return 'Expirée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire';
      case 'admin':
        return 'Administrateur';
      case 'client_admin':
        return 'Admin Client';
      case 'site_manager':
        return 'Gestionnaire Site';
      case 'employee':
        return 'Employé';
      default:
        return role;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Invitations Utilisateurs
            </h2>
            <p className="text-sm text-gray-600">
              Gérer les invitations avec MFA obligatoire
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Inviter utilisateur
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Formulaire d'invitation */}
      {showInviteForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nouvelle invitation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="utilisateur@exemple.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employé</option>
                <option value="site_manager">Gestionnaire Site</option>
                <option value="client_admin">Admin Client</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">MFA obligatoire activé</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              L'utilisateur devra configurer l'authentification à deux facteurs lors de sa première connexion.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={sendInvitation}
              disabled={inviteLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {inviteLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer invitation
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowInviteForm(false);
                setInviteForm({ email: '', role: 'employee', clientId: '' });
                setError('');
              }}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des invitations */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              Invitations récentes
            </h3>
            <button
              onClick={loadInvitations}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucune invitation trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {invitation.email}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {getRoleText(invitation.role)}
                      </span>
                      {invitation.mfa_required && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          MFA requis
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Invité par: {invitation.users?.full_name || invitation.users?.email || 'N/A'}
                      </p>
                      <p>
                        Créé le: {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className={isExpired(invitation.expires_at) ? 'text-red-600' : ''}>
                        Expire le: {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                        {isExpired(invitation.expires_at) && ' (Expiré)'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invitation.status)}
                    <span className={`text-sm font-medium ${
                      invitation.status === 'accepted' ? 'text-green-600' :
                      invitation.status === 'expired' ? 'text-red-600' :
                      invitation.status === 'pending' ? 'text-amber-600' :
                      'text-gray-600'
                    }`}>
                      {getStatusText(invitation.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}