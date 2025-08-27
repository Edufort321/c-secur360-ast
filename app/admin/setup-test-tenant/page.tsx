'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  TestTube,
  Play,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Zap
} from 'lucide-react';

export default function SetupTestTenantPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [tenantData, setTenantData] = useState({
    company_name: 'C-SECUR360 TEST',
    tenant_id: 'c-secur360test',
    billing_email: 'eric.dufort@cerdia.ai',
    inventory_email: 'eric.dufort@cerdia.ai',
    accident_email: 'eric.dufort@cerdia.ai',
    subscription_type: 'monthly' as 'monthly' | 'annual',
    monthly_revenue: 250,
    contact_person: 'Eric Dufort',
    contact_phone: '+1 (514) 123-4567',
    address: '123 Rue Test',
    city: 'Montréal',
    province: 'QC',
    postal_code: 'H1H 1H1',
    notes: 'Tenant de test pour développement et démonstrations'
  });

  const createTestTenant = async () => {
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du tenant');
      }

      const result = await response.json();
      console.log('Tenant créé:', result);
      setCreated(true);
    } catch (err: any) {
      console.error('Erreur création tenant:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCreated(false);
    setError('');
  };

  if (created) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <Image 
                  src="/c-secur360-logo.png" 
                  alt="C-SECUR360" 
                  width={40} 
                  height={40}
                  className="rounded-lg shadow-sm"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tenant de Test Créé!</h1>
                  <p className="text-sm text-gray-600">Configuration terminée avec succès</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-4">Tenant de Test Créé!</h2>
            <p className="text-green-800 mb-6">
              Le tenant '<strong>c-secur360test</strong>' a été créé avec succès dans votre système.
            </p>

            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations d'Accès</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p><strong>URL d'accès:</strong></p>
                  <a 
                    href="/c-secur360test/dashboard" 
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    /c-secur360test/dashboard
                  </a>
                </div>
                <div>
                  <p><strong>Nom d'entreprise:</strong> {tenantData.company_name}</p>
                </div>
                <div>
                  <p><strong>Email:</strong> {tenantData.billing_email}</p>
                </div>
                <div>
                  <p><strong>Type:</strong> {tenantData.subscription_type}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <a
                href="/c-secur360test/dashboard"
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Play className="w-5 h-5" />
                Accéder au Tenant Test
              </a>
              <Link
                href="/admin/tenant-management"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Users className="w-5 h-5" />
                Voir dans Gestion Tenants
              </Link>
              <button
                onClick={resetForm}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                Créer un Autre
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={40} 
                height={40}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Créer Tenant de Test</h1>
                <p className="text-sm text-gray-600">Configuration automatique pour tests et démonstrations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TestTube className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuration Tenant de Test</h2>
            </div>
            <p className="text-gray-600">
              Cette page va créer automatiquement le tenant '<strong>c-secur360test</strong>' 
              avec toutes les configurations nécessaires pour vos tests et démonstrations.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Erreur:</span>
              </div>
              <p className="text-red-800 mt-1">{error}</p>
            </div>
          )}

          {/* Configuration Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Configuration qui sera créée:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Building className="w-4 h-4" />
                  <span><strong>Entreprise:</strong> {tenantData.company_name}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Users className="w-4 h-4" />
                  <span><strong>Tenant ID:</strong> {tenantData.tenant_id}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Mail className="w-4 h-4" />
                  <span><strong>Email:</strong> {tenantData.billing_email}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Phone className="w-4 h-4" />
                  <span><strong>Contact:</strong> {tenantData.contact_person}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <CreditCard className="w-4 h-4" />
                  <span><strong>Abonnement:</strong> {tenantData.subscription_type} ({tenantData.monthly_revenue}$/mois)</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <MapPin className="w-4 h-4" />
                  <span><strong>Ville:</strong> {tenantData.city}, {tenantData.province}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Zap className="w-4 h-4" />
                  <span><strong>Statut:</strong> Actif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features that will be available */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-green-900 mb-4">🚀 Modules qui seront disponibles:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
              <div>• Dashboard principal avec KPIs</div>
              <div>• Module AST complet (6 étapes)</div>
              <div>• Gestion des accidents conformes</div>
              <div>• Système de permis de travail</div>
              <div>• Inspection équipements lourds</div>
              <div>• Gestion multi-sites</div>
              <div>• Administration équipe</div>
              <div>• Rapports et analytics</div>
              <div>• Suggestions d'amélioration</div>
              <div>• Configuration avancée</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={createTestTenant}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  Créer le Tenant de Test
                </>
              )}
            </button>

            <Link
              href="/admin"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg transition-colors"
            >
              Annuler
            </Link>
          </div>

          {/* Warning */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <p>Ce tenant sera créé avec des données de test. Il peut être utilisé pour démonstrations et développement. 
                Les données peuvent être effacées lors de mises à jour système.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}