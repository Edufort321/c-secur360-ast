'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Shield
} from 'lucide-react';

interface TenantFormData {
  company_name: string;
  tenant_id: string;
  billing_email: string;
  inventory_email: string;
  accident_email: string;
  subscription_type: 'monthly' | 'annual';
  monthly_revenue: number;
  contact_person: string;
  contact_phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  stripe_customer_id: string;
  notes: string;
}

export default function CreateTenantPage() {
  const [formData, setFormData] = useState<TenantFormData>({
    company_name: '',
    tenant_id: '',
    billing_email: '',
    inventory_email: '',
    accident_email: '',
    subscription_type: 'monthly',
    monthly_revenue: 250,
    contact_person: '',
    contact_phone: '',
    address: '',
    city: '',
    province: 'QC',
    postal_code: '',
    stripe_customer_id: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Generate tenant ID from company name
  const generateTenantId = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 30); // Limit length
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const companyName = e.target.value;
    setFormData(prev => ({
      ...prev,
      company_name: companyName,
      tenant_id: prev.tenant_id || generateTenantId(companyName)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.company_name.trim()) newErrors.company_name = 'Nom de l\'entreprise requis';
    if (!formData.tenant_id.trim()) newErrors.tenant_id = 'ID tenant requis';
    if (!formData.billing_email.trim()) newErrors.billing_email = 'Email de facturation requis';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Personne de contact requise';
    if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Téléphone de contact requis';
    if (!formData.city.trim()) newErrors.city = 'Ville requise';
    if (!formData.province.trim()) newErrors.province = 'Province requise';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.billing_email && !emailRegex.test(formData.billing_email)) {
      newErrors.billing_email = 'Email de facturation invalide';
    }
    if (formData.inventory_email && !emailRegex.test(formData.inventory_email)) {
      newErrors.inventory_email = 'Email inventaire invalide';
    }
    if (formData.accident_email && !emailRegex.test(formData.accident_email)) {
      newErrors.accident_email = 'Email accident invalide';
    }

    // Tenant ID validation
    if (formData.tenant_id && !/^[a-z0-9-]+$/.test(formData.tenant_id)) {
      newErrors.tenant_id = 'ID tenant doit contenir uniquement des lettres minuscules, chiffres et tirets';
    }

    // Phone validation
    const phoneRegex = /^\+?1?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
    if (formData.contact_phone && !phoneRegex.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Format de téléphone invalide';
    }

    // Revenue validation
    if (formData.monthly_revenue < 0) {
      newErrors.monthly_revenue = 'Le revenu mensuel doit être positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call to create tenant
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create Stripe customer if needed
      if (formData.subscription_type) {
        console.log('Creating Stripe customer...', {
          name: formData.company_name,
          email: formData.billing_email,
          subscription_type: formData.subscription_type
        });
      }

      // Send notification emails
      console.log('Sending welcome emails to:', {
        billing: formData.billing_email,
        inventory: formData.inventory_email,
        accident: formData.accident_email
      });

      alert('✅ Tenant créé avec succès!\n\n' +
            `🏢 ${formData.company_name}\n` +
            `🆔 ${formData.tenant_id}\n` +
            `💳 ${formData.subscription_type === 'annual' ? 'Abonnement annuel' : 'Abonnement mensuel'}\n` +
            `💰 $${formData.monthly_revenue}/mois\n\n` +
            'Emails d\'invitation envoyés automatiquement.');
      
      // Redirect to tenant list
      window.location.href = '/admin/tenant-management';
      
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('❌ Erreur lors de la création du tenant');
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Créer un Nouveau Tenant</h1>
                <p className="text-sm text-gray-600">Configuration complète client C-SECUR360</p>
              </div>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Informations de base */}
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
                      value={formData.company_name}
                      onChange={handleCompanyNameChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.company_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Construction ABC Inc."
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
                      value={formData.tenant_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.tenant_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="construction-abc"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      URL: https://{formData.tenant_id || 'tenant-id'}.csecur360.ca
                    </p>
                    {errors.tenant_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact et adresse */}
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
                      value={formData.contact_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contact_person ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Pierre Martin"
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
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contact_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+1 (514) 555-0123"
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
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Rue Principale"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Montréal"
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
                      value={formData.province}
                      onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
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
                      value={formData.postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="H1A 1A1"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Emails de gestion */}
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
                      value={formData.billing_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.billing_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="facturation@construction-abc.com"
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
                      value={formData.inventory_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, inventory_email: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.inventory_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="inventaire@construction-abc.com"
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
                      value={formData.accident_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, accident_email: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.accident_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="securite@construction-abc.com"
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

              {/* Facturation Stripe */}
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
                      value={formData.subscription_type}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        subscription_type: e.target.value as 'monthly' | 'annual',
                        monthly_revenue: e.target.value === 'annual' ? 250 : 250
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="monthly">Mensuel - $250/mois</option>
                      <option value="annual">Annuel - $3000/an (économie de $1000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revenu mensuel prévu ($)
                    </label>
                    <input
                      type="number"
                      value={formData.monthly_revenue}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_revenue: parseFloat(e.target.value) || 0 }))}
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
                      ID Client Stripe (optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.stripe_customer_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, stripe_customer_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="cus_xxxxxxxxxxxxxxxx"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Si le client existe déjà dans Stripe, entrer son ID ici
                    </p>
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
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notes internes sur ce client (non visibles par le client)..."
                />
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-end gap-4">
                  <Link
                    href="/admin/tenant-management"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:bg-blue-300"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Créer le Tenant
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preview Column */}
          {showPreview && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Aperçu du tenant</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {formData.company_name || 'Nom de l\'entreprise'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {formData.tenant_id || 'tenant-id'}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Contact</h4>
                      <p className="text-sm text-gray-600">
                        {formData.contact_person || 'Personne de contact'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.contact_phone || 'Téléphone'}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Adresse</h4>
                      <p className="text-sm text-gray-600">
                        {formData.address && `${formData.address}\n`}
                        {formData.city || 'Ville'}, {formData.province}
                        {formData.postal_code && ` ${formData.postal_code}`}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Facturation</h4>
                      <p className="text-sm text-gray-600">
                        {formData.subscription_type === 'annual' ? 'Abonnement annuel' : 'Abonnement mensuel'}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ${formData.monthly_revenue}/mois
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Emails</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {formData.billing_email && (
                          <div>📧 Facturation: {formData.billing_email}</div>
                        )}
                        {formData.inventory_email && (
                          <div>📦 Inventaire: {formData.inventory_email}</div>
                        )}
                        {formData.accident_email && (
                          <div>🚨 Accidents: {formData.accident_email}</div>
                        )}
                      </div>
                    </div>
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