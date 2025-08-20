'use client';

import React, { useState, useEffect } from 'react';
import {
  Building, MapPin, Users, FileText, Plus, Edit, Trash2, Eye,
  DollarSign, Calendar, AlertCircle, CheckCircle, X, Save
} from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { useTheme } from '../layout/AppLayout';
import { Site, calculateMultiSitePrice, SAAS_CONFIG } from '../../lib/saas-config';

interface MultiSiteClient {
  id: string;
  organizationName: string;
  plan: string;
  billingCycle: 'monthly' | 'annually';
  sites: Site[];
  totalUsers: number;
  totalAST: number;
  totalStorageUsed: number;
  basePlanCost: number;
  additionalSitesCost: number;
  totalCost: number;
  nextBillingDate: Date;
  status: 'active' | 'suspended' | 'cancelled';
}

const MultiSiteManager: React.FC = () => {
  const { isDark } = useTheme();
  const [clients, setClients] = useState<MultiSiteClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<MultiSiteClient | null>(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire pour nouveau site
  const [newSite, setNewSite] = useState({
    name: '',
    address: '',
    city: '',
    province: 'QC',
    postalCode: '',
    users: 0,
    astCount: 0,
    storageUsed: 0
  });

  // Simulation de données - À remplacer par vraies API calls
  useEffect(() => {
    const fetchMultiSiteData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockClients: MultiSiteClient[] = [
        {
          id: 'client_abc',
          organizationName: 'Construction ABC Inc.',
          plan: 'professional',
          billingCycle: 'annually',
          sites: [
            {
              id: 'site_abc_1',
              name: 'Siège Social Montréal',
              address: '123 Rue Saint-Jacques',
              city: 'Montréal',
              province: 'QC',
              postalCode: 'H3C 4T2',
              isMainSite: true,
              users: 25,
              astCount: 45,
              storageUsed: 12.5,
              status: 'active',
              addedDate: new Date('2023-01-15'),
              monthlyAddOn: 0,
              annualAddOn: 0
            },
            {
              id: 'site_abc_2',
              name: 'Chantier Laval',
              address: '456 Boulevard des Prairies',
              city: 'Laval',
              province: 'QC',
              postalCode: 'H7X 3R8',
              isMainSite: false,
              users: 8,
              astCount: 12,
              storageUsed: 3.2,
              status: 'active',
              addedDate: new Date('2024-03-20'),
              monthlyAddOn: 25,
              annualAddOn: 250
            },
            {
              id: 'site_abc_3',
              name: 'Bureau Québec',
              address: '789 Avenue Cartier',
              city: 'Québec',
              province: 'QC',
              postalCode: 'G1R 2S5',
              isMainSite: false,
              users: 5,
              astCount: 8,
              storageUsed: 1.8,
              status: 'active',
              addedDate: new Date('2024-06-10'),
              monthlyAddOn: 25,
              annualAddOn: 250
            }
          ],
          totalUsers: 38,
          totalAST: 65,
          totalStorageUsed: 17.5,
          basePlanCost: 790,
          additionalSitesCost: 500, // 2 sites × 250$/an
          totalCost: 1290,
          nextBillingDate: new Date('2025-01-15'),
          status: 'active'
        },
        {
          id: 'client_hydro',
          organizationName: 'Hydro-Québec',
          plan: 'enterprise',
          billingCycle: 'annually',
          sites: [
            {
              id: 'site_hydro_1',
              name: 'Complexe Desjardins',
              address: '75 Boulevard René-Lévesque Ouest',
              city: 'Montréal',
              province: 'QC',
              postalCode: 'H2Z 1A4',
              isMainSite: true,
              users: 150,
              astCount: 320,
              storageUsed: 45.2,
              status: 'active',
              addedDate: new Date('2022-05-01'),
              monthlyAddOn: 0,
              annualAddOn: 0
            },
            {
              id: 'site_hydro_2',
              name: 'Centrale Manic-5',
              address: 'Route 389 km 214',
              city: 'Manic-5',
              province: 'QC',
              postalCode: 'G0H 2L0',
              isMainSite: false,
              users: 25,
              astCount: 85,
              storageUsed: 8.7,
              status: 'active',
              addedDate: new Date('2023-02-15'),
              monthlyAddOn: 50,
              annualAddOn: 500
            },
            {
              id: 'site_hydro_3',
              name: 'Centrale Robert-Bourassa',
              address: 'Baie-James',
              city: 'Radisson',
              province: 'QC',
              postalCode: 'J0Y 2X0',
              isMainSite: false,
              users: 30,
              astCount: 95,
              storageUsed: 12.1,
              status: 'active',
              addedDate: new Date('2023-08-20'),
              monthlyAddOn: 50,
              annualAddOn: 500
            },
            {
              id: 'site_hydro_4',
              name: 'Centre Technique Varennes',
              address: '2000 Avenue Pierre-Dupuy',
              city: 'Varennes',
              province: 'QC',
              postalCode: 'J3X 1S1',
              isMainSite: false,
              users: 45,
              astCount: 110,
              storageUsed: 18.5,
              status: 'active',
              addedDate: new Date('2024-01-10'),
              monthlyAddOn: 50,
              annualAddOn: 500
            }
          ],
          totalUsers: 250,
          totalAST: 610,
          totalStorageUsed: 84.5,
          basePlanCost: 1990,
          additionalSitesCost: 1500, // 3 sites × 500$/an
          totalCost: 3490,
          nextBillingDate: new Date('2025-05-01'),
          status: 'active'
        }
      ];

      setClients(mockClients);
      setLoading(false);
    };

    fetchMultiSiteData();
  }, []);

  const handleAddSite = (client: MultiSiteClient) => {
    setSelectedClient(client);
    setEditingSite(null);
    setNewSite({
      name: '',
      address: '',
      city: '',
      province: 'QC',
      postalCode: '',
      users: 0,
      astCount: 0,
      storageUsed: 0
    });
    setShowSiteModal(true);
  };

  const handleEditSite = (client: MultiSiteClient, site: Site) => {
    setSelectedClient(client);
    setEditingSite(site);
    setNewSite({
      name: site.name,
      address: site.address,
      city: site.city,
      province: site.province,
      postalCode: site.postalCode,
      users: site.users,
      astCount: site.astCount,
      storageUsed: site.storageUsed
    });
    setShowSiteModal(true);
  };

  const handleSaveSite = () => {
    if (!selectedClient) return;

    const multiSitePricing = SAAS_CONFIG.multiSitePricing[selectedClient.plan as keyof typeof SAAS_CONFIG.multiSitePricing];
    const addOnCost = selectedClient.billingCycle === 'monthly' 
      ? multiSitePricing.additionalSiteMonthly 
      : multiSitePricing.additionalSiteAnnually;

    if (editingSite) {
      // Modifier un site existant
      const updatedSite: Site = {
        ...editingSite,
        name: newSite.name,
        address: newSite.address,
        city: newSite.city,
        province: newSite.province,
        postalCode: newSite.postalCode,
        users: newSite.users,
        astCount: newSite.astCount,
        storageUsed: newSite.storageUsed
      };

      setClients(prev => prev.map(client => 
        client.id === selectedClient.id
          ? {
              ...client,
              sites: client.sites.map(site => site.id === editingSite.id ? updatedSite : site),
              totalUsers: client.sites.reduce((sum, site) => sum + (site.id === editingSite.id ? updatedSite.users : site.users), 0),
              totalAST: client.sites.reduce((sum, site) => sum + (site.id === editingSite.id ? updatedSite.astCount : site.astCount), 0),
              totalStorageUsed: client.sites.reduce((sum, site) => sum + (site.id === editingSite.id ? updatedSite.storageUsed : site.storageUsed), 0)
            }
          : client
      ));
    } else {
      // Ajouter un nouveau site
      const newSiteData: Site = {
        id: `site_${selectedClient.id}_${Date.now()}`,
        name: newSite.name,
        address: newSite.address,
        city: newSite.city,
        province: newSite.province,
        postalCode: newSite.postalCode,
        isMainSite: false,
        users: newSite.users,
        astCount: newSite.astCount,
        storageUsed: newSite.storageUsed,
        status: 'active',
        addedDate: new Date(),
        monthlyAddOn: multiSitePricing.additionalSiteMonthly,
        annualAddOn: multiSitePricing.additionalSiteAnnually
      };

      setClients(prev => prev.map(client => 
        client.id === selectedClient.id
          ? {
              ...client,
              sites: [...client.sites, newSiteData],
              totalUsers: client.totalUsers + newSite.users,
              totalAST: client.totalAST + newSite.astCount,
              totalStorageUsed: client.totalStorageUsed + newSite.storageUsed,
              additionalSitesCost: client.additionalSitesCost + addOnCost,
              totalCost: client.basePlanCost + client.additionalSitesCost + addOnCost
            }
          : client
      ));
    }

    setShowSiteModal(false);
    setSelectedClient(null);
    setEditingSite(null);
  };

  const handleRemoveSite = (clientId: string, siteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;

    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      
      const siteToRemove = client.sites.find(site => site.id === siteId);
      if (!siteToRemove || siteToRemove.isMainSite) return client;
      
      const addOnCost = client.billingCycle === 'monthly' 
        ? siteToRemove.monthlyAddOn 
        : siteToRemove.annualAddOn;
      
      return {
        ...client,
        sites: client.sites.filter(site => site.id !== siteId),
        totalUsers: client.totalUsers - siteToRemove.users,
        totalAST: client.totalAST - siteToRemove.astCount,
        totalStorageUsed: client.totalStorageUsed - siteToRemove.storageUsed,
        additionalSitesCost: client.additionalSitesCost - addOnCost,
        totalCost: client.totalCost - addOnCost
      };
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AppLayout currentPage="sites">
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <Building className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Chargement des sites multi-clients...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="sites">
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Gestion Multi-Sites
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Gérez les sites multiples de vos clients avec facturation additive
            </p>
          </div>

          {/* Clients Cards */}
          <div className="space-y-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              >
                {/* Client Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                      <Building className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {client.organizationName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status === 'active' ? 'Actif' : client.status}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Plan {client.plan} • {client.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Summary */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {client.totalCost.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        /{client.billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Base: {client.basePlanCost.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} + 
                      Sites: {client.additionalSitesCost.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Prochain: {client.nextBillingDate.toLocaleDateString('fr-CA')}
                    </div>
                  </div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sites</div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {client.sites.length}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Utilisateurs</div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {client.totalUsers}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AST</div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {client.totalAST}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Storage</div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {client.totalStorageUsed.toFixed(1)} GB
                    </div>
                  </div>
                </div>

                {/* Sites List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Sites ({client.sites.length})
                    </h4>
                    <button
                      onClick={() => handleAddSite(client)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un site
                    </button>
                  </div>

                  {client.sites.map((site) => (
                    <div
                      key={site.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          site.isMainSite 
                            ? isDark ? 'bg-yellow-900 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                            : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {site.name}
                              {site.isMainSite && (
                                <span className="text-xs text-yellow-600 ml-2">(Principal)</span>
                              )}
                            </h5>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {site.address}, {site.city}, {site.province} {site.postalCode}
                          </p>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                            {site.users} utilisateurs • {site.astCount} AST • {site.storageUsed.toFixed(1)} GB
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!site.isMainSite && (
                          <div className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            +{(client.billingCycle === 'monthly' ? site.monthlyAddOn : site.annualAddOn).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                            /{client.billingCycle === 'monthly' ? 'mois' : 'an'}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <button
                            className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSite(client, site)}
                            className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!site.isMainSite && (
                            <button
                              onClick={() => handleRemoveSite(client.id, site.id)}
                              className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-600'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Modal pour ajouter/modifier un site */}
          {showSiteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingSite ? 'Modifier le site' : 'Ajouter un site'}
                  </h3>
                  <button
                    onClick={() => setShowSiteModal(false)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={newSite.name}
                      onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Ex: Bureau Québec"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={newSite.address}
                      onChange={(e) => setNewSite(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="123 Rue Principale"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Ville
                      </label>
                      <input
                        type="text"
                        value={newSite.city}
                        onChange={(e) => setNewSite(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Montréal"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Province
                      </label>
                      <select
                        value={newSite.province}
                        onChange={(e) => setNewSite(prev => ({ ...prev, province: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="QC">Québec</option>
                        <option value="ON">Ontario</option>
                        <option value="BC">Colombie-Britannique</option>
                        <option value="AB">Alberta</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="MB">Manitoba</option>
                        <option value="NS">Nouvelle-Écosse</option>
                        <option value="NB">Nouveau-Brunswick</option>
                        <option value="PE">Île-du-Prince-Édouard</option>
                        <option value="NL">Terre-Neuve-et-Labrador</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={newSite.postalCode}
                      onChange={(e) => setNewSite(prev => ({ ...prev, postalCode: e.target.value.toUpperCase() }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="H3C 4T2"
                      maxLength={7}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Utilisateurs
                      </label>
                      <input
                        type="number"
                        value={newSite.users}
                        onChange={(e) => setNewSite(prev => ({ ...prev, users: parseInt(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        AST
                      </label>
                      <input
                        type="number"
                        value={newSite.astCount}
                        onChange={(e) => setNewSite(prev => ({ ...prev, astCount: parseInt(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Storage (GB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newSite.storageUsed}
                        onChange={(e) => setNewSite(prev => ({ ...prev, storageUsed: parseFloat(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Coût additionnel preview */}
                  {selectedClient && !editingSite && (
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900 bg-opacity-20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          Coût additionnel
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        +{SAAS_CONFIG.multiSitePricing[selectedClient.plan as keyof typeof SAAS_CONFIG.multiSitePricing][
                          selectedClient.billingCycle === 'monthly' ? 'additionalSiteMonthly' : 'additionalSiteAnnually'
                        ].toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        /{selectedClient.billingCycle === 'monthly' ? 'mois' : 'an'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowSiteModal(false)}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveSite}
                    disabled={!newSite.name || !newSite.address || !newSite.city}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingSite ? 'Mettre à jour' : 'Ajouter le site'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MultiSiteManager;