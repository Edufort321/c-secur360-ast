'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Header from '@/components/ui/Header';
import { 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Phone,
  Mail,
  MapPin,
  Download,
  QrCode,
  Smartphone,
  Monitor,
  Lock,
  Zap,
  Award,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

const translations = {
  fr: {
    // Header
    adminAccess: "Accès Admin",
    freeDemo: "Démo Gratuite",
    
    // Hero
    heroTitle: "Plateforme SaaS de Sécurité",
    heroSubtitle: "Multi-Sites & Multi-Clients",
    heroDescription: "Gestion complète des AST, permis de travail, facturation automatique et conformité provinciale. Chaque client accède à son portail personnalisé.",
    
    // Client Access
    personalizedAccess: "Accès Client Personnalisé",
    clientPlaceholder: "Nom du client (ex: entrepriseabc)",
    accessPortal: "Accéder au Portail Client",
    personalizedUrl: "URL Personnalisée",
    customDomain: "Domaine Custom",
    qrAvailable: "Code QR disponible",
    
    // CTA
    viewPlans: "Voir les Plans",
    interactiveDemo: "Démo Interactive",
    
    // Pricing
    pricing: {
      title: "Plan Unique",
      annual: "3 000$/année",
      monthly: "250$/mois",
      additionalSite: "Site supplémentaire: 500$/année",
      features: [
        "AST et permis de travail illimités",
        "Multi-sites avec facturation additive",
        "Analytics temps réel",
        "Support 24/7",
        "Conformité provinciale",
        "PWA mobile incluse"
      ]
    },
    
    // Carousel
    carouselTitle: "Captures d'écran",
    viewGallery: "Voir la galerie",
    manageImages: "Gérer les images",
    
    // Features
    featuresTitle: "Fonctionnalités Entreprise",
    
    // Admin Modal
    adminTitle: "Accès Administrateur",
    adminPasswordPlaceholder: "Mot de passe admin",
    login: "Connexion",
    cancel: "Annuler",
    development: "Développement",
    
    // Contact
    contact: "Contact",
    downloads: "Téléchargements",
    mobileApp: "App Mobile (PWA)",
    desktopVersion: "Version Desktop",
    
    // Footer
    copyright: "© 2024 C-SECUR360. Tous droits réservés. Plateforme SaaS de sécurité industrielle.",
    poweredBy: "Propulsé par"
  },
  en: {
    // Header
    adminAccess: "Admin Access",
    freeDemo: "Free Demo",
    
    // Hero
    heroTitle: "Safety SaaS Platform",
    heroSubtitle: "Multi-Sites & Multi-Clients",
    heroDescription: "Complete management of JSA, work permits, automatic billing and provincial compliance. Each client accesses their personalized portal.",
    
    // Client Access
    personalizedAccess: "Personalized Client Access",
    clientPlaceholder: "Client name (ex: companyabc)",
    accessPortal: "Access Client Portal",
    personalizedUrl: "Personalized URL",
    customDomain: "Custom Domain",
    qrAvailable: "QR Code available",
    
    // CTA
    viewPlans: "View Plans",
    interactiveDemo: "Interactive Demo",
    
    // Pricing
    pricing: {
      title: "Single Plan",
      annual: "$3,000/year",
      monthly: "$250/month",
      additionalSite: "Additional site: $500/year",
      features: [
        "Unlimited JSA and work permits",
        "Multi-sites with additive billing",
        "Real-time analytics",
        "24/7 support",
        "Provincial compliance",
        "Mobile PWA included"
      ]
    },
    
    // Carousel
    carouselTitle: "Screenshots",
    viewGallery: "View gallery",
    manageImages: "Manage images",
    
    // Features
    featuresTitle: "Enterprise Features",
    
    // Admin Modal
    adminTitle: "Administrator Access",
    adminPasswordPlaceholder: "Admin password",
    login: "Login",
    cancel: "Cancel",
    development: "Development",
    
    // Contact
    contact: "Contact",
    downloads: "Downloads",
    mobileApp: "Mobile App (PWA)",
    desktopVersion: "Desktop Version",
    
    // Footer
    copyright: "© 2024 C-SECUR360. All rights reserved. Industrial safety SaaS platform.",
    poweredBy: "Powered by"
  }
};

const features = {
  fr: [
    {
      icon: Users,
      title: 'Multi-Clients & Multi-Sites',
      description: 'Gestion centralisée avec portails clients personnalisés. Facturation additive par site.',
      color: '#3b82f6'
    },
    {
      icon: BarChart3,
      title: 'Analytics Consolidées',
      description: 'Tableaux de bord temps réel, statistiques AST, conformité provinciale automatique.',
      color: '#10b981'
    },
    {
      icon: Shield,
      title: 'Sécurité & Conformité',
      description: 'Conforme CNESST, MOL, WorkSafeBC. Authentification sécurisée par tenant.',
      color: '#8b5cf6'
    },
    {
      icon: Zap,
      title: 'Automatisation Complète',
      description: 'Facturation automatique, renouvellements, notifications SMS, exports comptables.',
      color: '#f59e0b'
    },
    {
      icon: Smartphone,
      title: 'Accès Mobile & QR',
      description: 'PWA téléchargeable, codes QR personnalisés, synchronisation cloud.',
      color: '#ef4444'
    },
    {
      icon: Award,
      title: 'Support 24/7',
      description: 'Intégration IA, support technique, formation équipes, mises à jour gratuites.',
      color: '#06b6d4'
    }
  ],
  en: [
    {
      icon: Users,
      title: 'Multi-Clients & Multi-Sites',
      description: 'Centralized management with personalized client portals. Additive billing per site.',
      color: '#3b82f6'
    },
    {
      icon: BarChart3,
      title: 'Consolidated Analytics',
      description: 'Real-time dashboards, JSA statistics, automatic provincial compliance.',
      color: '#10b981'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'CNESST, MOL, WorkSafeBC compliant. Secure authentication per tenant.',
      color: '#8b5cf6'
    },
    {
      icon: Zap,
      title: 'Complete Automation',
      description: 'Automatic billing, renewals, SMS notifications, accounting exports.',
      color: '#f59e0b'
    },
    {
      icon: Smartphone,
      title: 'Mobile Access & QR',
      description: 'Downloadable PWA, personalized QR codes, cloud synchronization.',
      color: '#ef4444'
    },
    {
      icon: Award,
      title: '24/7 Support',
      description: 'AI integration, technical support, team training, free updates.',
      color: '#06b6d4'
    }
  ]
};

export default function LandingPage() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [clientSubdomain, setClientSubdomain] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [showImageManager, setShowImageManager] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const t = translations[language];
  const currentFeatures = features[language];
  
  // Images par défaut pour le carrousel
  const [carouselImages] = useState([
    {
      id: 1,
      url: '/logo.png',
      title: 'Interface AST',
      description: 'Formulaire d\'analyse sécuritaire de tâches'
    },
    {
      id: 2,
      url: '/logo.png', 
      title: 'Dashboard Analytics',
      description: 'Tableaux de bord temps réel'
    },
    {
      id: 3,
      url: '/logo.png',
      title: 'Gestion Multi-Sites',
      description: 'Interface de gestion des emplacements'
    }
  ]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Production password for development
    if (adminPassword === 'CGEstion321$') {
      window.location.href = '/admin/dashboard';
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleClientAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientSubdomain.trim()) {
      window.location.href = `/${clientSubdomain.trim()}/dashboard`;
    } else {
      alert('Veuillez entrer le nom du client');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      {/* Header uniforme avec logo agrandi et position sticky */}
      <Header 
        logoSize="lg"
        className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10
                   bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90
                   shadow-lg shadow-black/20"
        actions={
          <div className="flex gap-4 items-center">
            {/* Sélecteur de langue avec texte encadré */}
            <div className="flex bg-slate-800/80 rounded-lg p-1 border border-white/10 backdrop-blur-sm">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200
                          ${language === 'fr' 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200
                          ${language === 'en' 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
              >
                EN
              </button>
            </div>
            
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400
                        px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm font-medium
                        hover:bg-emerald-500/20 transition-colors backdrop-blur-sm
                        shadow-md shadow-emerald-500/10"
            >
              <Lock size={16} />
              <span className="text-white bg-slate-800/60 px-2 py-1 rounded backdrop-blur-sm">
                {t.adminAccess}
              </span>
            </button>
            
            <Link href="/demo/dashboard" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white
                        px-5 py-2 rounded-lg text-sm font-semibold
                        hover:from-blue-600 hover:to-blue-700 transition-all duration-200
                        shadow-lg shadow-blue-500/20 backdrop-blur-sm
                        border border-blue-400/20"
            >
              <span className="text-white bg-slate-800/60 px-2 py-1 rounded backdrop-blur-sm">
                {t.freeDemo}
              </span>
            </Link>
          </div>
        }
      />

      {/* Hero Section */}
      <section style={{ 
        padding: '80px 24px', 
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          margin: '0 0 24px 0',
          lineHeight: '1.1'
        }}>
          {t.heroTitle}
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t.heroSubtitle}
          </span>
        </h2>
        
        <p style={{ 
          fontSize: '20px', 
          color: '#94a3b8', 
          margin: '0 0 48px 0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {t.heroDescription}
        </p>

        {/* Accès Client Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          marginBottom: '48px',
          maxWidth: '500px',
          margin: '0 auto 48px auto'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Globe style={{ color: '#10b981' }} size={24} />
            {t.personalizedAccess}
          </h3>
          
          <form onSubmit={handleClientAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder={t.clientPlaceholder}
              value={clientSubdomain}
              onChange={(e) => setClientSubdomain(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'white',
                fontSize: '16px'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowRight size={16} />
              {t.accessPortal}
            </button>
          </form>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontSize: '14px',
            color: '#93c5fd'
          }}>
            <p style={{ margin: 0 }}>
              📱 <strong>{t.personalizedUrl}:</strong> csecur360.com/clientname
              <br />
              🔗 <strong>{t.customDomain}:</strong> clientname.csecur360.ca
              <br />
              📲 <strong>{t.qrAvailable}</strong>
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/demo/pricing" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Star size={20} />
            {t.viewPlans}
          </Link>
          
          <Link href="/demo/dashboard" style={{
            background: 'rgba(100, 116, 139, 0.6)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600',
            border: '1px solid rgba(148, 163, 184, 0.3)'
          }}>
            {t.interactiveDemo}
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ 
        padding: '80px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{ 
          fontSize: '36px', 
          textAlign: 'center', 
          margin: '0 0 48px 0' 
        }}>
          {t.featuresTitle}
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px' 
        }}>
          {currentFeatures.map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              textAlign: 'center'
            }}>
              <feature.icon 
                size={48} 
                style={{ 
                  color: feature.color, 
                  marginBottom: '16px' 
                }} 
              />
              <h4 style={{ 
                fontSize: '20px', 
                margin: '0 0 16px 0',
                color: feature.color
              }}>
                {feature.title}
              </h4>
              <p style={{ 
                color: '#94a3b8', 
                margin: 0,
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ 
        padding: '80px 24px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          fontSize: '36px', 
          margin: '0 0 48px 0',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t.pricing.title}
        </h3>
        
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '48px',
          borderRadius: '20px',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            POPULAIRE
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              color: '#10b981'
            }}>
              {t.pricing.annual}
            </div>
            <div style={{ 
              fontSize: '18px', 
              color: '#94a3b8',
              margin: '0 0 16px 0'
            }}>
              {language === 'fr' ? 'ou ' : 'or '}{t.pricing.monthly}
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#f59e0b',
              fontWeight: '600'
            }}>
              {t.pricing.additionalSite}
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gap: '12px',
            textAlign: 'left',
            marginBottom: '32px'
          }}>
            {t.pricing.features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#e2e8f0'
              }}>
                <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <Link href="/demo/pricing" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
          }}>
            <Star size={20} />
            {t.viewPlans}
          </Link>
        </div>
      </section>

      {/* Screenshots Carousel */}
      <section style={{ 
        padding: '80px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{ 
          fontSize: '36px', 
          textAlign: 'center', 
          margin: '0 0 48px 0' 
        }}>
          {t.carouselTitle}
        </h3>
        
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ 
            position: 'relative',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '100%',
              height: '400px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              background: 'rgba(15, 23, 42, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={carouselImages[currentImageIndex].url}
                alt={carouselImages[currentImageIndex].title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {/* Navigation buttons */}
            <button
              onClick={() => setCurrentImageIndex(prev => 
                prev === 0 ? carouselImages.length - 1 : prev - 1
              )}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(16, 185, 129, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ←
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => 
                prev === carouselImages.length - 1 ? 0 : prev + 1
              )}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(16, 185, 129, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              →
            </button>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ 
              fontSize: '20px', 
              margin: '0 0 8px 0',
              color: '#10b981'
            }}>
              {carouselImages[currentImageIndex].title}
            </h4>
            <p style={{ 
              color: '#94a3b8', 
              margin: '0 0 16px 0'
            }}>
              {carouselImages[currentImageIndex].description}
            </p>
            
            {/* Dots indicator */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px' 
            }}>
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentImageIndex ? '#10b981' : 'rgba(148, 163, 184, 0.5)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
          
          <div style={{ 
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowImageManager(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto'
              }}
            >
              <Lock size={16} />
              {t.manageImages}
            </button>
          </div>
        </div>
      </section>

      {/* Modal Admin Login */}
      {showAdminLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ 
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Lock style={{ color: '#10b981' }} size={24} />
              {t.adminTitle}
            </h3>
            
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.adminPasswordPlaceholder}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 45px 12px 12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(100, 116, 139, 0.6)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
            
            <p style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              color: '#64748b',
              textAlign: 'center'
            }}>
              {t.development}: CGEstion321$
            </p>
          </div>
        </div>
      )}

      {/* Modal Image Manager */}
      {showImageManager && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ 
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Lock style={{ color: '#10b981' }} size={24} />
              {t.manageImages}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (adminPassword === 'CGEstion321$') {
                window.location.href = '/admin/gallery';
              } else {
                alert('Mot de passe incorrect');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.adminPasswordPlaceholder}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 45px 12px 12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageManager(false);
                    setAdminPassword('');
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(100, 116, 139, 0.6)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
            
            <p style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              color: '#64748b',
              textAlign: 'center'
            }}>
              {t.development}: CGEstion321$
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        padding: '48px 24px',
        borderTop: '1px solid rgba(100, 116, 139, 0.2)',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <h4 style={{ color: '#10b981', margin: '0 0 16px 0' }}>{t.contact}</h4>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} /> +1 (514) 603-4519
                </p>
                <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} /> eric.dufort@cerdia.ai
                </p>
                <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} /> Montréal, QC, Canada
                </p>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#10b981', margin: '0 0 16px 0' }}>{t.downloads}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <Smartphone size={16} />
                  {t.mobileApp}
                </button>
                <button style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <Monitor size={16} />
                  {t.desktopVersion}
                </button>
              </div>
            </div>
          </div>
          
          <p style={{ 
            color: '#64748b', 
            margin: 0,
            fontSize: '14px'
          }}>
            {t.copyright}
            <br />
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              marginTop: '8px',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              {t.poweredBy} 
              <Logo 
                size="sm" 
                variant="minimal"
                showText={false}
              />
              CERDIA
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}