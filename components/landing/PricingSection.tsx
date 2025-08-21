'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Crown, Building2, Sparkles, Shield, Users, Database, Phone, Mail, Globe, Settings, Zap, Lock } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../lib/saas-config';

interface PricingSectionProps {
  onPlanSelect?: (planId: string, cycle: 'monthly' | 'annually') => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onPlanSelect }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
  const [additionalSites, setAdditionalSites] = useState(0);

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

  const professionalPlan = SUBSCRIPTION_PLANS.professional;
  const customPlan = SUBSCRIPTION_PLANS.custom;

  const calculateTotalPrice = () => {
    const basePriceMonthly = professionalPlan.price.monthly;
    const basePriceAnnually = professionalPlan.price.annually;
    const additionalSitePrice = billingCycle === 'monthly' ? 50 : 600;
    
    const basePrice = billingCycle === 'monthly' ? basePriceMonthly : basePriceAnnually;
    const sitesPrice = additionalSites * additionalSitePrice;
    
    return {
      base: basePrice,
      sites: sitesPrice,
      total: basePrice + sitesPrice
    };
  };

  const pricing = calculateTotalPrice();

  const allFeatures = [
    { icon: Users, text: 'Utilisateurs illimités' },
    { icon: Database, text: 'AST illimités' },
    { icon: Database, text: 'Stockage illimité' },
    { icon: Shield, text: 'Conformité toutes provinces canadiennes' },
    { icon: Phone, text: 'Support téléphonique prioritaire' },
    { icon: Mail, text: 'Notifications SMS et email illimitées' },
    { icon: Globe, text: 'Intégration cloud (Drive, SharePoint)' },
    { icon: Settings, text: 'API complète et webhooks' },
    { icon: Crown, text: 'Branding personnalisé' },
    { icon: Lock, text: 'Single Sign-On (SSO)' },
    { icon: Zap, text: 'Rapports avancés et analytics' },
    { icon: Shield, text: 'Logs d\'audit et conformité' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec logo */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img 
              src="/c-secur360-logo.png" 
              alt="C-SECUR360" 
              className="h-16 w-auto"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Tarification C-SECUR360
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            <strong>Un seul plan. Toutes les fonctionnalités.</strong><br />
            Solution complète d'analyse sécuritaire de tâches (AST) pour toutes les entreprises canadiennes.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'annually'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Économisez 1000$
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Plan Principal */}
          <div className="relative bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden ring-2 ring-blue-500 scale-105">
            {/* Popular Badge */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-3 text-sm font-medium">
              ⭐ Plan Recommandé - Tout Inclus
            </div>

            <div className="p-8 pt-16">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Building2 className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  {professionalPlan.name}
                </h2>
                <p className="text-slate-600">
                  {professionalPlan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-slate-900 mb-2">
                  {pricing.base.toLocaleString('fr-CA')}
                  <span className="text-2xl text-slate-600">$ CAD</span>
                </div>
                <div className="text-slate-600 mb-4">
                  {billingCycle === 'monthly' ? 'par mois' : 'par année'}
                  {billingCycle === 'annually' && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Économisez 1000$ par année vs mensuel
                    </div>
                  )}
                </div>

                {/* Sites additionnels */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Sites additionnels</h4>
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <button
                      onClick={() => setAdditionalSites(Math.max(0, additionalSites - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                      disabled={additionalSites === 0}
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold text-slate-900 min-w-[3rem] text-center">
                      {additionalSites}
                    </span>
                    <button
                      onClick={() => setAdditionalSites(additionalSites + 1)}
                      className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-slate-600">
                    {billingCycle === 'monthly' ? '50$/mois' : '600$/année'} par site additionnel
                  </p>
                  
                  {additionalSites > 0 && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <div className="flex justify-between text-sm">
                        <span>Plan de base:</span>
                        <span>{pricing.base.toLocaleString('fr-CA')}$ CAD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sites additionnels ({additionalSites}):</span>
                        <span>{pricing.sites.toLocaleString('fr-CA')}$ CAD</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{pricing.total.toLocaleString('fr-CA')}$ CAD</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold text-slate-900 mb-4 text-center">Tout inclus :</h4>
                <div className="grid grid-cols-1 gap-3">
                  {allFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <feature.icon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-slate-900">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelection('professional')}
                className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center group bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Trial Info */}
              <p className="text-center text-sm text-slate-500 mt-4">
                ✨ Essai gratuit de 14 jours - Aucune carte requise
              </p>
            </div>
          </div>
          
          {/* Plan Entreprise */}
          <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200">
            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Sparkles className="w-12 h-12 text-purple-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  {customPlan.name}
                </h2>
                <p className="text-slate-600">
                  {customPlan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  Sur demande
                </div>
                <div className="text-slate-600">
                  Tarification personnalisée selon vos besoins
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold text-slate-900 mb-4 text-center">Plan Complet + :</h4>
                <ul className="space-y-3">
                  {[
                    'Intégration ERP sur mesure (SAP, Oracle, etc.)',
                    'Support technique dédié 24/7',
                    'Formation personnalisée sur site',
                    'Développement de fonctionnalités spécifiques',
                    'Architecture dédiée et sécurisée',
                    'SLA personnalisé avec garanties',
                    'Migration de données assistée',
                    'Consultation stratégique continue'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-900">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelection('custom')}
                className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center group bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105"
              >
                Demander une démo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Contact Info */}
              <p className="text-center text-sm text-slate-500 mt-4">
                💼 Contactez notre équipe commerciale
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-8">
            Questions fréquentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="text-left bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-3">
                Puis-je changer de plan à tout moment ?
              </h4>
              <p className="text-slate-600">
                Oui, vous pouvez upgrader vers le plan Entreprise à tout moment. 
                Les changements prennent effet immédiatement avec proratisation.
              </p>
            </div>
            <div className="text-left bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-3">
                Acceptez-vous les virements automatiques PAD/ACSS ?
              </h4>
              <p className="text-slate-600">
                Oui, nous acceptons les cartes de crédit et les virements automatiques 
                PAD/ACSS pour toutes les entreprises canadiennes.
              </p>
            </div>
            <div className="text-left bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-3">
                Y a-t-il des frais d'installation ?
              </h4>
              <p className="text-slate-600">
                Aucun frais d'installation. Notre équipe vous accompagne gratuitement 
                dans la configuration initiale et la formation de vos équipes.
              </p>
            </div>
            <div className="text-left bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-3">
                Quelle est la conformité réglementaire ?
              </h4>
              <p className="text-slate-600">
                Nous respectons toutes les normes provinciales canadiennes : 
                CNESST (QC), WSIB (ON), WCB (AB/BC), et toutes autres provinces.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Contact */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-center text-white">
          <div className="flex justify-center mb-6">
            <img 
              src="/c-secur360-logo.png" 
              alt="C-SECUR360" 
              className="h-12 w-auto brightness-0 invert"
            />
          </div>
          <h3 className="text-3xl font-bold mb-4">
            Prêt à transformer votre gestion de sécurité ?
          </h3>
          <p className="text-xl mb-6 text-blue-100">
            Notre équipe d'experts en sécurité industrielle est prête à vous accompagner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://calendly.com/c-secur360/demo', '_blank')}
              className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Réserver une démo gratuite
            </button>
            <button
              onClick={() => window.location.href = 'mailto:eric.dufort@cerdia.ai'}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-slate-900 transition-colors text-lg"
            >
              eric.dufort@cerdia.ai | 514-603-4519
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/c-secur360-logo.png" 
              alt="C-SECUR360" 
              className="h-6 w-auto"
            />
            <span className="text-slate-700 font-semibold">C-SECUR360</span>
          </div>
          <p className="text-sm">
            © 2024 C-SECUR360 - Propulsé par CERDIA | 
            Tous droits réservés | Solution québécoise de sécurité industrielle
          </p>
        </footer>
      </div>
    </section>
  );
};

export default PricingSection;