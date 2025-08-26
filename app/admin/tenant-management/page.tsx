'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Building,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  CreditCard,
  MapPin,
  Globe,
  Shield
} from 'lucide-react';

// Types pour la gestion des tenants
interface Tenant {
  id: string;
  company_name: string;
  tenant_id: string;
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  created_at: string;
  billing_email: string;
  inventory_email?: string;
  accident_email?: string;
  subscription_type: 'monthly' | 'annual';
  monthly_revenue: number;
  total_users: number;
  last_activity: string;
  stripe_customer_id?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_person?: string;
  contact_phone?: string;
}

// Données démo tenants
const DEMO_TENANTS: Tenant[] = [
  {
    id: '1',
    company_name: 'Construction ABC Inc.',
    tenant_id: 'construction-abc',
    status: 'active',
    created_at: '2024-01-15',
    billing_email: 'facturation@construction-abc.com',
    inventory_email: 'inventaire@construction-abc.com',
    accident_email: 'securite@construction-abc.com',
    subscription_type: 'annual',
    monthly_revenue: 250,
    total_users: 15,
    last_activity: '2024-08-26',
    stripe_customer_id: 'cus_construction_abc',
    address: '123 Rue Principale',
    city: 'Montréal',
    province: 'QC',
    postal_code: 'H1A 1A1',
    contact_person: 'Pierre Martin',
    contact_phone: '+1 (514) 555-0123'
  },
  {
    id: '2',
    company_name: 'Sécurité Plus Ltée',
    tenant_id: 'securite-plus',
    status: 'active',
    created_at: '2024-03-10',
    billing_email: 'admin@securite-plus.ca',
    inventory_email: 'materiel@securite-plus.ca',
    subscription_type: 'monthly',
    monthly_revenue: 180,
    total_users: 8,
    last_activity: '2024-08-25',
    stripe_customer_id: 'cus_securite_plus',
    address: '456 Boulevard Industriel',
    city: 'Québec',
    province: 'QC',
    postal_code: 'G1V 4H6',
    contact_person: 'Sophie Tremblay',
    contact_phone: '+1 (418) 555-0456'
  },
  {
    id: '3',
    company_name: 'TechnoMaint Solutions',
    tenant_id: 'technomaint',
    status: 'pending',
    created_at: '2024-08-20',
    billing_email: 'finance@technomaint.ca',
    subscription_type: 'monthly',
    monthly_revenue: 0,
    total_users: 2,
    last_activity: '2024-08-24',
    address: '789 Avenue Innovation',
    city: 'Gatineau',
    province: 'QC',
    postal_code: 'J8X 3X7',
    contact_person: 'Marc Dubois',
    contact_phone: '+1 (819) 555-0789'
  },
  {
    id: '4',
    company_name: 'Industries Nordiques',
    tenant_id: 'nordiques-ind',
    status: 'suspended',
    created_at: '2023-11-05',
    billing_email: 'comptabilite@nordiques.ca',
    subscription_type: 'annual',
    monthly_revenue: 300,
    total_users: 25,
    last_activity: '2024-08-10',
    stripe_customer_id: 'cus_nordiques_ind',
    address: '321 Chemin du Nord',
    city: 'Chicoutimi',
    province: 'QC',
    postal_code: 'G7H 2N4',
    contact_person: 'Julie Lapointe',
    contact_phone: '+1 (418) 555-0321'
  }
];

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>(DEMO_TENANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');

  // Calculs financiers
  const financialStats = {
    totalMRR: tenants.reduce((sum, tenant) => 
      tenant.status === 'active' ? sum + tenant.monthly_revenue : sum, 0
    ),
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === 'active').length,
    pendingTenants: tenants.filter(t => t.status === 'pending').length,
    suspendedTenants: tenants.filter(t => t.status === 'suspended').length,
    annualARR: tenants.reduce((sum, tenant) => 
      tenant.status === 'active' ? sum + (tenant.monthly_revenue * 12) : sum, 0
    )
  };

  // Filtrer les tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesSubscription = subscriptionFilter === 'all' || tenant.subscription_type === subscriptionFilter;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Actif</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">En attente</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Suspendu</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Annulé</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Tenants</h1>
                <p className="text-sm text-gray-600">Administration client C-SECUR360</p>
              </div>
            </div>
            <Link 
              href="/admin/tenant-management/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau Tenant
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistiques financières */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR Total</p>
                <p className="text-2xl font-bold text-green-600">${financialStats.totalMRR.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ARR Projeté</p>
                <p className="text-2xl font-bold text-blue-600">${financialStats.annualARR.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tenants Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{financialStats.activeTenants}</p>
              </div>
              <Building className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{financialStats.pendingTenants}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, tenant ID, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
              <option value="cancelled">Annulés</option>
            </select>

            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les abonnements</option>
              <option value="monthly">Mensuel</option>
              <option value="annual">Annuel</option>
            </select>

            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Liste des tenants */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MRR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.company_name}</div>
                        <div className="text-sm text-gray-500">
                          {tenant.city}, {tenant.province}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tenant.tenant_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.contact_person}</div>
                        <div className="text-sm text-gray-500">{tenant.billing_email}</div>
                        <div className="text-sm text-gray-500">{tenant.contact_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tenant.subscription_type === 'annual' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tenant.subscription_type === 'annual' ? 'Annuel' : 'Mensuel'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${tenant.monthly_revenue}/mois
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 mr-1" />
                        {tenant.total_users}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/tenant-management/${tenant.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Modifier le tenant"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => window.open(`https://${tenant.tenant_id}.csecur360.ca`, '_blank')}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Accéder au portail client"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Supprimer définitivement ${tenant.company_name}?\nCette action est irréversible.`)) {
                              alert('Suppression tenant (à implémenter avec API)');
                            }
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Supprimer le tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* État vide */}
        {filteredTenants.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun tenant trouvé
            </h3>
            <p className="text-gray-600">
              Aucun tenant ne correspond aux critères de recherche sélectionnés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}