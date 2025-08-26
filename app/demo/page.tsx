'use client';

import React, { useState } from 'react';
import {
  Play,
  Package,
  Users,
  BarChart3,
  Settings,
  Clock,
  Truck,
  QrCode,
  Shield,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

export default function DemoPublicPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demoModules = [
    {
      id: 'inventory',
      title: 'Inventaire QR-First',
      description: 'Système mobile d\'inventaire avec codes QR et impression d\'étiquettes',
      icon: <Package className="w-8 h-8" />,
      color: 'bg-blue-600',
      features: [
        'Scanner QR codes mobile',
        'Impression étiquettes PDF (Avery)',
        'Gestion stock temps réel',
        'Catégories et recherche',
        'Multi-emplacements',
        'Traçabilité complète'
      ],
      demoUrl: '/demo/inventory',
      status: 'Opérationnel'
    },
    {
      id: 'hr',
      title: 'Module RH Sécurisé',
      description: 'Gestion employés avec certifications SST et conformité',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-green-600',
      features: [
        'Gestion employés minimale',
        'Certifications SST',
        'Scores de sécurité',
        'Suivi AST participation',
        'Export CSV/Excel',
        'Données chiffrées'
      ],
      demoUrl: '/demo/hr',
      status: 'Opérationnel'
    },
    {
      id: 'rbac',
      title: 'Système RBAC Avancé',
      description: 'Gestion granulaire des rôles et permissions par portée',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-purple-600',
      features: [
        'Rôles hiérarchiques',
        'Permissions par module',
        'Portée (global/client/site)',
        'Audit trail complet',
        'MFA avec TOTP',
        'Invitations sécurisées'
      ],
      demoUrl: '/demo/rbac',
      status: 'En développement'
    },
    {
      id: 'timesheets',
      title: 'Feuilles de Temps Mobiles',
      description: 'Saisie mobile temps de travail avec géolocalisation',
      icon: <Clock className="w-8 h-8" />,
      color: 'bg-orange-600',
      features: [
        'Start/Stop temps réel',
        'Géolocalisation GPS',
        'Photos et notes',
        'Codes de facturation',
        'Per diem automatique',
        'Validation managers'
      ],
      demoUrl: '/demo/timesheets',
      status: 'Planifié'
    },
    {
      id: 'vehicles',
      title: 'Gestion Véhicules',
      description: 'Flotte, réservations, maintenance et kilométrage',
      icon: <Truck className="w-8 h-8" />,
      color: 'bg-purple-600',
      features: [
        'Réservation véhicules',
        'Suivi kilométrage',
        'Maintenance préventive',
        'Carnet de bord',
        'Coûts et facturation',
        'Rapports détaillés'
      ],
      demoUrl: '/demo/vehicles',
      status: 'Planifié'
    },
    {
      id: 'ast',
      title: 'Analyse Sécurité Travail',
      description: 'AST interentreprises avec identité fédérée',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-red-600',
      features: [
        'AST collaboratives',
        'Scanner QR mobile',
        'Workflow approbation',
        'Multi-sites & clients',
        'Conformité provinciale',
        'Signatures électroniques'
      ],
      demoUrl: '/demo/ast',
      status: 'Opérationnel'
    },
    {
      id: 'analytics',
      title: 'Tableaux de Bord',
      description: 'Analytics et KPIs temps réel pour managers',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-indigo-600',
      features: [
        'KPIs temps réel',
        'Rentabilité projets',
        'Performance équipes',
        'Prédictions IA',
        'Exports Excel/PDF',
        'Intégration comptable'
      ],
      demoUrl: '/demo/analytics',
      status: 'Planifié'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Opérationnel':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="w-3 h-3" />
            {status}
          </span>
        );
      case 'En développement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            <Play className="w-3 h-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Version Démo Publique
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                C-Secur360
              </span>
              <br />
              Écosystème AST
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Plateforme intégrée pour la gestion d'entreprises de services techniques. 
              Inventaire QR-first, RBAC avancé, feuilles de temps mobiles, et bien plus.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Données temporaires seulement
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Aucun compte requis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Demo */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Modules Disponibles
          </h2>
          <p className="text-gray-600">
            Explorez chaque composant de l'écosystème C-Secur360
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoModules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${module.color} text-white p-3 rounded-lg`}>
                    {module.icon}
                  </div>
                  {getStatusBadge(module.status)}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {module.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {module.description}
                </p>

                <div className="space-y-2 mb-6">
                  {module.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {module.status === 'Opérationnel' ? (
                    <a
                      href={module.demoUrl}
                      className={`${module.color} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all`}
                    >
                      <Play className="w-4 h-4" />
                      Tester la Démo
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 cursor-not-allowed"
                    >
                      <Settings className="w-4 h-4" />
                      En développement...
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Intéressé par une démonstration personnalisée?
          </h3>
          <p className="text-gray-600 mb-6">
            Contactez-nous pour une présentation complète avec vos données réelles
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm">
            <a 
              href="mailto:eric.dufort@cerdia.ai"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Users className="w-4 h-4" />
              eric.dufort@cerdia.ai
            </a>
            <span className="text-gray-400">|</span>
            <a 
              href="https://cerdia.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              cerdia.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}