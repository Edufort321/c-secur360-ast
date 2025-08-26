'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface TenantData {
  id: string;
  company_name: string;
  tenant_id: string;
  billing_email: string;
  inventory_email?: string;
  accident_email?: string;
  subscription_type: 'monthly' | 'annual';
  monthly_revenue: number;
  contact_person: string;
  contact_phone: string;
  address?: string;
  city: string;
  province: string;
  postal_code?: string;
  stripe_customer_id?: string;
  notes?: string;
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  total_users: number;
  last_activity: string;
  created_at: string;
}

export default function EditTenantPage() {
  const params = useParams();
  const tenantId = params.id as string;
  
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Load tenant data
  useEffect(() => {
    const loadTenant = async () => {
      // Mock data loading - replace with actual API call
      const mockTenant: TenantData = {
        id: tenantId,
        company_name: 'Construction ABC Inc.',
        tenant_id: 'construction-abc',
        billing_email: 'facturation@construction-abc.com',
        inventory_email: 'inventaire@construction-abc.com',
        accident_email: 'securite@construction-abc.com',
        subscription_type: 'annual',
        monthly_revenue: 250,
        contact_person: 'Pierre Martin',
        contact_phone: '+1 (514) 555-0123',
        address: '123 Rue Principale',
        city: 'Montréal',
        province: 'QC',
        postal_code: 'H1A 1A1',
        stripe_customer_id: 'cus_construction_abc',
        notes: 'Client premium, priorité haute pour le support',
        status: 'active',
        total_users: 15,
        last_activity: '2024-08-26T10:30:00Z',
        created_at: '2024-01-15T09:00:00Z'
      };

      setTenant(mockTenant);
      setLoading(false);
    };

    loadTenant();
  }, [tenantId]);

  const validateForm = () => {
    if (!tenant) return false;
    
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!tenant.company_name.trim()) newErrors.company_name = 'Nom de l\'entreprise requis';
    if (!tenant.tenant_id.trim()) newErrors.tenant_id = 'ID tenant requis';
    if (!tenant.billing_email.trim()) newErrors.billing_email = 'Email de facturation requis';
    if (!tenant.contact_person.trim()) newErrors.contact_person = 'Personne de contact requise';
    if (!tenant.contact_phone.trim()) newErrors.contact_phone = 'Téléphone de contact requis';
    if (!tenant.city.trim()) newErrors.city = 'Ville requise';
    if (!tenant.province.trim()) newErrors.province = 'Province requise';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tenant.billing_email && !emailRegex.test(tenant.billing_email)) {
      newErrors.billing_email = 'Email de facturation invalide';
    }
    if (tenant.inventory_email && !emailRegex.test(tenant.inventory_email)) {
      newErrors.inventory_email = 'Email inventaire invalide';
    }
    if (tenant.accident_email && !emailRegex.test(tenant.accident_email)) {
      newErrors.accident_email = 'Email accident invalide';
    }

    // Tenant ID validation
    if (tenant.tenant_id && !/^[a-z0-9-]+$/.test(tenant.tenant_id)) {
      newErrors.tenant_id = 'ID tenant doit contenir uniquement des lettres minuscules, chiffres et tirets';
    }

    // Phone validation
    const phoneRegex = /^\+?1?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
    if (tenant.contact_phone && !phoneRegex.test(tenant.contact_phone)) {
      newErrors.contact_phone = 'Format de téléphone invalide';
    }

    // Revenue validation
    if (tenant.monthly_revenue < 0) {
      newErrors.monthly_revenue = 'Le revenu mensuel doit être positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant || !validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('✅ Tenant mis à jour avec succès!\n\n' +
            `🏢 ${tenant.company_name}\n` +
            `🆔 ${tenant.tenant_id}\n` +
            `📊 Statut: ${tenant.status}\n` +
            `💰 $${tenant.monthly_revenue}/mois`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('❌ Erreur lors de la mise à jour du tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!tenant) return;
    
    const confirmMessage = 
      newStatus === 'suspended' ? 'Suspendre ce tenant? L\'accès sera immédiatement bloqué.' :
      newStatus === 'cancelled' ? 'Annuler ce tenant? Cette action est irréversible.' :
      newStatus === 'active' ? 'Activer ce tenant? L\'accès sera immédiatement restauré.' :
      `Changer le statut vers "${newStatus}"?`;
    
    if (confirm(confirmMessage)) {
      setTenant({ ...tenant, status: newStatus as any });
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Chargement du tenant...</span>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant introuvable</h1>
          <p className="text-gray-600 mb-4">Le tenant demandé n'existe pas ou vous n'avez pas accès.</p>
          <Link href="/admin/tenant-management" className="text-blue-600 hover:text-blue-700">
            ← Retour à la liste des tenants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/tenant-management" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{tenant.company_name}</h1>
                  {getStatusBadge(tenant.status)}
                </div>
                <p className="text-sm text-gray-600">ID: {tenant.tenant_id} • Créé le {new Date(tenant.created_at).toLocaleDateString('fr-CA')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://${tenant.tenant_id}.csecur360.ca`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Voir le site
              </a>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Cacher l\'aperçu' : 'Aperçu'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Status Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Gestion du statut</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut actuel
                    </label>
                    <select
                      value={tenant.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statistiques
                    </label>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>👥 {tenant.total_users} utilisateurs</div>
                      <div>📅 Dernière activité: {new Date(tenant.last_activity).toLocaleDateString('fr-CA')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Building className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Informations de l'entreprise</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={tenant.company_name}
                      onChange={(e) => setTenant({ ...tenant, company_name: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.company_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.company_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Tenant (URL) *
                    </label>
                    <input
                      type="text"
                      value={tenant.tenant_id}
                      onChange={(e) => setTenant({ ...tenant, tenant_id: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.tenant_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      URL: https://{tenant.tenant_id}.csecur360.ca
                    </p>
                    {errors.tenant_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Contact et adresse</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personne de contact *
                    </label>
                    <input
                      type="text"
                      value={tenant.contact_person}
                      onChange={(e) => setTenant({ ...tenant, contact_person: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contact_person ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contact_person && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone de contact *
                    </label>
                    <input
                      type="tel"
                      value={tenant.contact_phone}
                      onChange={(e) => setTenant({ ...tenant, contact_phone: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contact_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contact_phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={tenant.address || ''}
                      onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={tenant.city}
                      onChange={(e) => setTenant({ ...tenant, city: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      value={tenant.province}
                      onChange={(e) => setTenant({ ...tenant, province: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="QC">Québec (QC)</option>
                      <option value="ON">Ontario (ON)</option>
                      <option value="BC">Colombie-Britannique (BC)</option>
                      <option value="AB">Alberta (AB)</option>
                      <option value="SK">Saskatchewan (SK)</option>
                      <option value="MB">Manitoba (MB)</option>
                      <option value="NB">Nouveau-Brunswick (NB)</option>
                      <option value="NS">Nouvelle-Écosse (NS)</option>
                      <option value="PE">Île-du-Prince-Édouard (PE)</option>
                      <option value="NL">Terre-Neuve-et-Labrador (NL)</option>
                      <option value="YT">Yukon (YT)</option>
                      <option value="NT">Territoires du Nord-Ouest (NT)</option>
                      <option value="NU">Nunavut (NU)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={tenant.postal_code || ''}
                      onChange={(e) => setTenant({ ...tenant, postal_code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Email Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Configuration des emails</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de facturation *
                    </label>
                    <input
                      type="email"
                      value={tenant.billing_email}
                      onChange={(e) => setTenant({ ...tenant, billing_email: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.billing_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Recevra les factures, relances de paiement et notifications financières
                    </p>
                    {errors.billing_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.billing_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email inventaire
                    </label>
                    <input
                      type="email"
                      value={tenant.inventory_email || ''}
                      onChange={(e) => setTenant({ ...tenant, inventory_email: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.inventory_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Recevra les notifications de stock bas et rapports d'inventaire
                    </p>
                    {errors.inventory_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.inventory_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email accidents/incidents
                    </label>
                    <input
                      type="email"
                      value={tenant.accident_email || ''}
                      onChange={(e) => setTenant({ ...tenant, accident_email: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.accident_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Recevra les notifications d'urgence et rapports d'accidents
                    </p>
                    {errors.accident_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.accident_email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Configuration */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Configuration de facturation</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'abonnement
                    </label>
                    <select
                      value={tenant.subscription_type}
                      onChange={(e) => setTenant({ 
                        ...tenant, 
                        subscription_type: e.target.value as 'monthly' | 'annual'
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="monthly">Mensuel - $250/mois</option>
                      <option value="annual">Annuel - $3000/an (économie de $1000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revenu mensuel ($)
                    </label>
                    <input
                      type="number"
                      value={tenant.monthly_revenue}
                      onChange={(e) => setTenant({ ...tenant, monthly_revenue: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.monthly_revenue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                      step="0.01"
                    />
                    {errors.monthly_revenue && (
                      <p className="mt-1 text-sm text-red-600">{errors.monthly_revenue}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Client Stripe
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tenant.stripe_customer_id || ''}
                        onChange={(e) => setTenant({ ...tenant, stripe_customer_id: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="cus_xxxxxxxxxxxxxxxx"
                      />
                      {tenant.stripe_customer_id && (
                        <a
                          href={`https://dashboard.stripe.com/customers/${tenant.stripe_customer_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Stripe
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Notes internes</h2>
                </div>
                
                <textarea
                  value={tenant.notes || ''}
                  onChange={(e) => setTenant({ ...tenant, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notes internes sur ce client (non visibles par le client)..."
                />
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => confirm('Supprimer définitivement ce tenant?\nCette action est irréversible.') && alert('Suppression tenant (à implémenter)')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                  
                  <div className="flex gap-4">
                    <Link
                      href="/admin/tenant-management"
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:bg-blue-300"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Sauvegarder
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Preview/Stats Column */}
          {showPreview && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Résumé du tenant</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{tenant.company_name}</h3>
                      <p className="text-sm text-gray-500">ID: {tenant.tenant_id}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Contact</h4>
                      <p className="text-sm text-gray-600">{tenant.contact_person}</p>
                      <p className="text-sm text-gray-600">{tenant.contact_phone}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Statut</h4>
                      {getStatusBadge(tenant.status)}
                      <p className="text-sm text-gray-600 mt-1">
                        {tenant.total_users} utilisateurs
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Facturation</h4>
                      <p className="text-sm text-gray-600">
                        {tenant.subscription_type === 'annual' ? 'Abonnement annuel' : 'Abonnement mensuel'}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ${tenant.monthly_revenue}/mois
                      </p>
                      {tenant.subscription_type === 'annual' && (
                        <p className="text-xs text-gray-500">
                          = ${tenant.monthly_revenue * 12}/an
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Emails configurés</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>📧 {tenant.billing_email}</div>
                        {tenant.inventory_email && (
                          <div>📦 {tenant.inventory_email}</div>
                        )}
                        {tenant.accident_email && (
                          <div>🚨 {tenant.accident_email}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-2">
                    <a
                      href={`mailto:${tenant.billing_email}?subject=C-SECUR360: Information importante&body=Bonjour ${tenant.contact_person},%0D%0A%0D%0A`}
                      className="block w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      ✉️ Envoyer un email
                    </a>
                    <a
                      href={`tel:${tenant.contact_phone}`}
                      className="block w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      📞 Appeler le contact
                    </a>
                    <a
                      href={`https://${tenant.tenant_id}.csecur360.ca`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      🌐 Accéder au portail
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}