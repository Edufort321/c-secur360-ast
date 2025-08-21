'use client';

import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

// =================== INTERFACES ===================
interface StripeCheckoutProps {
  customerId?: string;
  customerEmail?: string;
  companyName?: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

interface PlanOption {
  id: 'monthly' | 'annual';
  name: string;
  price: number;
  interval: string;
  description: string;
  savings?: string;
  popular?: boolean;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  customerId,
  customerEmail,
  companyName,
  onSuccess,
  onError
}) => {
  // =================== ÉTATS ===================
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [additionalSites, setAdditionalSites] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'acss'>('card');
  
  // =================== CONFIGURATION DES PLANS ===================
  const plans: PlanOption[] = [
    {
      id: 'monthly',
      name: 'Plan Mensuel',
      price: 49,
      interval: 'mois',
      description: 'Facturation mensuelle, annulation à tout moment'
    },
    {
      id: 'annual',
      name: 'Plan Annuel',
      price: 490,
      interval: 'année',
      description: 'Facturation annuelle, économie de 2 mois',
      savings: 'Économie de 98$ par année',
      popular: true
    }
  ];

  // =================== CALCULS ===================
  const additionalSiteCost = 600; // 600$ par site additionnel par année
  const selectedPlanData = plans.find(p => p.id === selectedPlan)!;
  const additionalSitesTotal = additionalSites * additionalSiteCost;
  const subtotal = selectedPlanData.price + additionalSitesTotal;
  const taxes = subtotal * 0.14975; // TPS + TVQ (QC)
  const total = subtotal + taxes;

  // =================== HANDLERS ===================
  const handleCreateCheckout = async () => {
    if (!customerId) {
      onError?.('ID client requis');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          planType: selectedPlan,
          additionalSites,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
          trialDays: 14
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

    } catch (error) {
      console.error('Erreur checkout:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomerFirst = async () => {
    if (!customerEmail || !companyName) {
      onError?.('Email et nom de compagnie requis');
      return;
    }

    setLoading(true);

    try {
      // Créer d'abord le client
      const customerResponse = await fetch('/api/billing/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          company: companyName,
          province: 'QC'
        }),
      });

      const customerData = await customerResponse.json();

      if (customerData.success) {
        // Puis créer la session checkout
        const checkoutResponse = await fetch('/api/billing/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerData.customer.id,
            planType: selectedPlan,
            additionalSites,
            successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: window.location.href,
            trialDays: 14
          }),
        });

        const checkoutData = await checkoutResponse.json();

        if (checkoutData.success && checkoutData.url) {
          window.location.href = checkoutData.url;
        } else {
          throw new Error(checkoutData.error || 'Erreur lors de la création de la session');
        }
      } else {
        throw new Error(customerData.error || 'Erreur lors de la création du client');
      }

    } catch (error) {
      console.error('Erreur création client + checkout:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choisissez votre plan C-Secur360
        </h2>
        <p className="text-lg text-gray-600">
          Plateforme complète d'analyse sécuritaire de tâches (AST)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sélection du plan */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Sélection du plan</h3>
          
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Recommandé
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedPlan === plan.id}
                      onChange={() => setSelectedPlan(plan.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      {plan.savings && (
                        <p className="text-sm font-medium text-green-600">{plan.savings}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {plan.price.toLocaleString('fr-CA')}$
                    </div>
                    <div className="text-sm text-gray-600">CAD / {plan.interval}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sites additionnels */}
          <div className="border rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Sites additionnels</h4>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAdditionalSites(Math.max(0, additionalSites - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                disabled={additionalSites === 0}
              >
                -
              </button>
              <span className="text-lg font-medium text-gray-900 min-w-[3rem] text-center">
                {additionalSites}
              </span>
              <button
                onClick={() => setAdditionalSites(additionalSites + 1)}
                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
              >
                +
              </button>
              <span className="text-sm text-gray-600">
                × 600$ CAD/année par site
              </span>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="border rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Méthode de paiement</h4>
            <div className="space-y-3">
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="text-gray-600 mr-3" size={20} />
                <div>
                  <div className="font-medium">Carte bancaire</div>
                  <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                </div>
              </div>
              
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  paymentMethod === 'acss' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setPaymentMethod('acss')}
              >
                <Building className="text-gray-600 mr-3" size={20} />
                <div>
                  <div className="font-medium">Prélèvement bancaire (PAD)</div>
                  <div className="text-sm text-gray-600">Recommandé pour entreprises - frais réduits</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé de commande */}
        <div className="lg:sticky lg:top-6">
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h3>
            
            {/* Informations client */}
            {(customerEmail || companyName) && (
              <div className="mb-6 p-4 bg-white rounded border">
                <div className="flex items-center mb-2">
                  <Building className="text-gray-600 mr-2" size={16} />
                  <span className="font-medium">Informations client</span>
                </div>
                {companyName && (
                  <p className="text-sm text-gray-600">{companyName}</p>
                )}
                {customerEmail && (
                  <p className="text-sm text-gray-600">{customerEmail}</p>
                )}
                <div className="flex items-center mt-1">
                  <MapPin className="text-gray-600 mr-1" size={14} />
                  <span className="text-sm text-gray-600">Québec, Canada</span>
                </div>
              </div>
            )}

            {/* Détails prix */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan {selectedPlanData.name}</span>
                <span className="font-medium">{selectedPlanData.price.toLocaleString('fr-CA')}$ CAD</span>
              </div>
              
              {additionalSites > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sites additionnels ({additionalSites})</span>
                  <span className="font-medium">{additionalSitesTotal.toLocaleString('fr-CA')}$ CAD</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toLocaleString('fr-CA')}$ CAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (TPS + TVQ)</span>
                  <span className="font-medium">{taxes.toFixed(2)}$ CAD</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)}$ CAD</span>
                </div>
              </div>
            </div>

            {/* Avantages inclus */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Inclus dans votre plan :</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  AST illimitées
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  Gestion multi-sites
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  Rapports et analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  Support technique
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  14 jours d'essai gratuit
                </li>
              </ul>
            </div>

            {/* Bouton d'action */}
            <button
              onClick={customerId ? handleCreateCheckout : handleCreateCustomerFirst}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Redirection...
                </div>
              ) : (
                `Commencer l'essai gratuit (14 jours)`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Sécurisé par Stripe • Aucune obligation • Annulation à tout moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;