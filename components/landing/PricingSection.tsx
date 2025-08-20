'use client';

import React, { useState } from 'react';
import { Check, X, ArrowRight, Crown, Zap, Building2, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PLANS, calculatePrice } from '../../lib/saas-config';
import AppLayout from '../layout/AppLayout';
import { useTheme } from '../layout/AppLayout';

interface PricingSectionProps {
  onPlanSelect?: (planId: string, cycle: 'monthly' | 'annually') => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onPlanSelect }) => {
  const { isDark } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const handlePlanSelection = (planId: string) => {
    if (planId === 'custom') {
      // Rediriger vers calendly pour une démo
      window.open('https://calendly.com/c-secur360/demo', '_blank');
    } else {
      onPlanSelect?.(planId, billingCycle);
      // Rediriger vers la page d'inscription
      window.location.href = `/register?plan=${planId}&cycle=${billingCycle}`;
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap className="w-8 h-8 text-blue-500" />;
      case 'professional': return <Building2 className="w-8 h-8 text-purple-500" />;
      case 'enterprise': return <Crown className="w-8 h-8 text-orange-500" />;
      case 'custom': return <Sparkles className="w-8 h-8 text-gradient" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  const formatPrice = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (plan.price.monthly === 0) return 'Sur demande';
    
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually;
    const cycle = billingCycle === 'monthly' ? '/mois' : '/an';
    
    return `${price}$ CAD${cycle}`;
  };

  const getSavings = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (billingCycle === 'monthly' || plan.price.monthly === 0) return null;
    
    const monthlyTotal = plan.price.monthly * 12;
    const annualPrice = plan.price.annually;
    const savings = monthlyTotal - annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    
    return { amount: savings, percentage };
  };

  const formatFeature = (key: string, value: any) => {
    switch (key) {
      case 'maxUsers':
        return value === -1 ? 'Utilisateurs illimités' : `${value} utilisateurs`;
      case 'maxAST':
        return value === -1 ? 'AST illimités' : `${value} AST/mois`;
      case 'maxStorage':
        return value === -1 ? 'Stockage illimité' : `${value} GB de stockage`;
      case 'smsNotifications':
        return value === -1 ? 'SMS illimités' : `${value} SMS/mois`;
      case 'emailNotifications':
        return value === -1 ? 'Emails illimités' : `${value} emails/mois`;
      case 'cloudIntegration':
        return 'Intégration cloud (Drive, SharePoint)';
      case 'advancedReports':
        return 'Rapports avancés et analytics';
      case 'apiAccess':
        return 'Accès API complet';
      case 'phoneSupport':
        return 'Support téléphonique prioritaire';
      case 'customBranding':
        return 'Branding personnalisé';
      case 'sso':
        return 'Single Sign-On (SSO)';
      case 'audit':
        return 'Logs d\'audit et conformité';
      case 'compliance':
        return Array.isArray(value) 
          ? `Conformité ${value.length === 1 ? value[0] : `${value.length} provinces`}`
          : 'Conformité toutes provinces';
      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Choisissez le plan qui vous convient
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Des solutions flexibles pour toutes les tailles d'entreprise, 
            de la startup à la multinationale.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'annually'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
            const savings = getSavings(planId);
            const isPopular = plan.popular;
            
            return (
              <div
                key={planId}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  isPopular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-center py-2 text-sm font-medium">
                    ⭐ Le plus populaire
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(planId)}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {planId === 'custom' ? (
                        <span className="text-2xl">Sur demande</span>
                      ) : (
                        <>
                          {billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually}
                          <span className="text-lg text-slate-600">$ CAD</span>
                        </>
                      )}
                    </div>
                    <div className="text-slate-600">
                      {planId !== 'custom' && (
                        <span>
                          {billingCycle === 'monthly' ? 'par mois' : 'par année'}
                          {billingCycle === 'annually' && (
                            <span className="block text-sm text-green-600 font-medium">
                              Économisez {Math.round(((plan.price.monthly * 12 - plan.price.annually) / (plan.price.monthly * 12)) * 100)}%
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {Object.entries(plan.features).map(([key, value]) => {
                      const featureText = formatFeature(key, value);
                      if (!featureText) return null;
                      
                      const isIncluded = typeof value === 'boolean' ? value : true;
                      
                      return (
                        <li key={key} className="flex items-start">
                          {isIncluded ? (
                            <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${isIncluded ? 'text-slate-900' : 'text-slate-500'}`}>
                            {featureText}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelection(planId)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center group ${
                      isPopular
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                        : planId === 'enterprise'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105'
                        : planId === 'custom'
                        ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                    }`}
                  >
                    {planId === 'custom' ? 'Demander une démo' : 'Commencer maintenant'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Trial Info */}
                  {planId !== 'custom' && (
                    <p className="text-center text-xs text-slate-500 mt-3">
                      ✨ Essai gratuit de 14 jours - Aucune carte requise
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Questions fréquentes sur nos plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h4>
              <p className="text-slate-600 text-sm">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement avec proratisation.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 mb-2">
                Acceptez-vous les virements automatiques ?
              </h4>
              <p className="text-slate-600 text-sm">
                Oui, nous acceptons les cartes de crédit et les virements automatiques 
                pour les plans annuels et entreprise.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 mb-2">
                Y a-t-il des frais d'installation ?
              </h4>
              <p className="text-slate-600 text-sm">
                Aucun frais d'installation. Notre équipe vous accompagne gratuitement 
                dans la configuration initiale.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 mb-2">
                Offrez-vous des rabais pour les organismes sans but lucratif ?
              </h4>
              <p className="text-slate-600 text-sm">
                Oui, nous offrons 30% de rabais pour les organismes sans but lucratif 
                et les institutions éducatives. Contactez-nous pour plus d'infos.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Contact */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Besoin d'une solution sur mesure ?
          </h3>
          <p className="text-lg mb-6 text-blue-100">
            Notre équipe d'experts peut créer une solution personnalisée 
            pour répondre à vos besoins spécifiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://calendly.com/c-secur360/demo', '_blank')}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Réserver une démo
            </button>
            <button
              onClick={() => window.location.href = 'mailto:sales@c-secur360.com'}
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-slate-900 transition-colors"
            >
              Contacter les ventes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;