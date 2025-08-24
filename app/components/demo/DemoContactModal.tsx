'use client';

import React from 'react';
import {
  X,
  Clock,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Star,
  Lock,
  Database,
  Shield
} from 'lucide-react';

interface DemoContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'time_expired' | 'save_attempted' | 'feature_locked';
  timeSpent?: number;
}

export default function DemoContactModal({ 
  isOpen, 
  onClose, 
  reason, 
  timeSpent 
}: DemoContactModalProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (reason) {
      case 'time_expired':
        return 'Temps de démonstration écoulé';
      case 'save_attempted':
        return 'Sauvegarde non disponible en démo';
      case 'feature_locked':
        return 'Fonctionnalité complète disponible';
      default:
        return 'Découvrez la version complète';
    }
  };

  const getMessage = () => {
    switch (reason) {
      case 'time_expired':
        return `Vous avez exploré C-Secur360 pendant ${Math.round((timeSpent || 0) / 60000)} minutes. Impressionnant! Pour continuer et sauvegarder vos données, contactez-nous pour une version complète.`;
      case 'save_attempted':
        return 'Cette démonstration utilise des données temporaires qui ne peuvent pas être sauvegardées. Obtenez un accès complet pour gérer vos vraies données.';
      case 'feature_locked':
        return 'Cette fonctionnalité est disponible dans la version complète avec accès à votre base de données Supabase.';
      default:
        return 'Contactez-nous pour plus d\'informations sur C-Secur360.';
    }
  };

  const features = [
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Vos données réelles',
      description: 'Connexion à votre base de données Supabase'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Sécurité complète',
      description: 'RBAC, MFA, audit trail, conformité PIPEDA'
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Support technique',
      description: 'Formation, migration, support 24/7'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl max-w-lg mx-auto">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              {reason === 'time_expired' && <Clock className="w-6 h-6" />}
              {reason === 'save_attempted' && <Lock className="w-6 h-6" />}
              {reason === 'feature_locked' && <Star className="w-6 h-6" />}
              <h3 className="text-xl font-bold">{getTitle()}</h3>
            </div>
            
            <p className="text-blue-100 text-sm">
              {getMessage()}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              🚀 Débloquez la version complète
            </h4>
            
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-blue-600 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{feature.title}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Options */}
            <div className="space-y-3">
              <a
                href="mailto:eric.dufort@cerdia.ai?subject=Demande d'information C-Secur360&body=Bonjour, je souhaite obtenir plus d'informations sur la version complète de C-Secur360."
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contactez-nous par email
              </a>
              
              <a
                href="https://calendly.com/cerdia-ai/demo-c-secur360"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Planifier une démonstration
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <div className="text-center">
                <a
                  href="tel:+15149994567"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Phone className="w-4 h-4" />
                  +1 (514) 999-4567
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl text-center">
            <p className="text-xs text-gray-500">
              <strong>C-Secur360</strong> - Écosystème AST par{' '}
              <a 
                href="https://cerdia.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                Cerdia.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}