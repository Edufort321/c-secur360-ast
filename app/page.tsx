'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [clientSubdomain, setClientSubdomain] = useState('');

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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header avec navigation */}
      <header style={{
        padding: '20px 0',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield style={{ color: '#10b981' }} size={32} />
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              margin: 0,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              C-SECUR360
            </h1>
          </div>
          
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowAdminLogin(true)}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <Lock size={16} />
              Accès Admin
            </button>
            
            <Link href="/demo/dashboard" style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Démo Gratuite
            </Link>
          </nav>
        </div>
      </header>

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
          Plateforme SaaS de Sécurité
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Multi-Sites & Multi-Clients
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
          Gestion complète des AST, permis de travail, facturation automatique et conformité provinciale. 
          Chaque client accède à son portail personnalisé.
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
            Accès Client Personnalisé
          </h3>
          
          <form onSubmit={handleClientAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Nom du client (ex: hydroquebec)"
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
              Accéder au Portail Client
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
              📱 <strong>URL Personnalisée:</strong> csecur360.com/nomclient
              <br />
              🔗 <strong>Domaine Custom:</strong> nomclient.csecur360.ca
              <br />
              📲 <strong>Code QR disponible</strong> pour accès mobile rapide
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
            Voir les Plans
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
            Démo Interactive
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
          Fonctionnalités Entreprise
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px' 
        }}>
          {[
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
          ].map((feature, index) => (
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
              Accès Administrateur
            </h3>
            
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="password"
                placeholder="Mot de passe admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: 'white',
                  fontSize: '16px'
                }}
                autoFocus
              />
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
                  Connexion
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
                  Annuler
                </button>
              </div>
            </form>
            
            <p style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              color: '#64748b',
              textAlign: 'center'
            }}>
              Développement: CGEstion321$
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
              <h4 style={{ color: '#10b981', margin: '0 0 16px 0' }}>Contact</h4>
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
              <h4 style={{ color: '#10b981', margin: '0 0 16px 0' }}>Téléchargements</h4>
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
                  App Mobile (PWA)
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
                  Version Desktop
                </button>
              </div>
            </div>
          </div>
          
          <p style={{ 
            color: '#64748b', 
            margin: 0,
            fontSize: '14px'
          }}>
            © 2024 C-SECUR360. Tous droits réservés. Plateforme SaaS de sécurité industrielle.
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
              Propulsé par 
              <img 
                src="/c-secur360-logo.png" 
                alt="CERDIA" 
                style={{ height: '16px', width: 'auto' }}
              />
              CERDIA
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}