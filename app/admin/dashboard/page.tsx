'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  Globe,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  QrCode,
  Smartphone,
  Lock
} from 'lucide-react';

interface AdminStats {
  totalClients: number;
  totalSites: number;
  monthlyRevenue: number;
  activeASTs: number;
  pendingApprovals: number;
  complianceScore: number;
}

interface Client {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  sites: number;
  monthlyFee: number;
  status: 'active' | 'pending' | 'suspended';
  lastActivity: string;
  domain?: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 42,
    totalSites: 156,
    monthlyRevenue: 28750,
    activeASTs: 234,
    pendingApprovals: 8,
    complianceScore: 97.5
  });

  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'Hydro-Québec',
      subdomain: 'hydroquebec',
      plan: 'Enterprise',
      sites: 15,
      monthlyFee: 2995,
      status: 'active',
      lastActivity: '2024-01-15',
      domain: 'hydroquebec.csecur360.ca'
    },
    {
      id: '2', 
      name: 'Bell Canada',
      subdomain: 'bell',
      plan: 'Professional',
      sites: 8,
      monthlyFee: 1195,
      status: 'active',
      lastActivity: '2024-01-14',
      domain: 'bell.csecur360.ca'
    },
    {
      id: '3',
      name: 'Bombardier',
      subdomain: 'bombardier',
      plan: 'Professional',
      sites: 6,
      monthlyFee: 895,
      status: 'active',
      lastActivity: '2024-01-13'
    },
    {
      id: '4',
      name: 'Demo Client',
      subdomain: 'demo',
      plan: 'Demo',
      sites: 3,
      monthlyFee: 0,
      status: 'active',
      lastActivity: '2024-01-15'
    }
  ]);

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2024') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPassword('');
  };

  const generateQRCode = (clientSubdomain: string) => {
    const url = `https://csecur360.com/${clientSubdomain}`;
    // In production, use a proper QR code library
    alert(`Code QR généré pour: ${url}`);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '48px',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <Shield style={{ color: '#10b981', margin: '0 auto 24px auto' }} size={48} />
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Administration C-SECUR360</h1>
          <p style={{ margin: '0 0 32px 0', color: '#94a3b8' }}>Accès sécurisé au panneau d'administration</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder="Mot de passe administrateur"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                fontWeight: '600'
              }}
            >
              Se connecter
            </button>
          </form>
          
          <Link href="/" style={{
            display: 'inline-block',
            marginTop: '24px',
            color: '#10b981',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header Admin */}
      <header style={{
        padding: '20px 0',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield style={{ color: '#10b981' }} size={32} />
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>Administration C-SECUR360</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Panneau de contrôle multi-clients</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Globe size={16} />
              Site public
            </Link>
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Lock size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {[
            { label: 'Clients Actifs', value: stats.totalClients, icon: Users, color: '#3b82f6' },
            { label: 'Sites Totaux', value: stats.totalSites, icon: Building, color: '#10b981' },
            { label: 'Revenus Mensuels', value: `${stats.monthlyRevenue.toLocaleString('fr-CA')}$`, icon: DollarSign, color: '#22c55e' },
            { label: 'AST Actives', value: stats.activeASTs, icon: Shield, color: '#8b5cf6' },
            { label: 'En Attente', value: stats.pendingApprovals, icon: Clock, color: '#f59e0b' },
            { label: 'Conformité', value: `${stats.complianceScore}%`, icon: CheckCircle, color: '#06b6d4' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              textAlign: 'center'
            }}>
              <stat.icon size={32} style={{ color: stat.color, marginBottom: '12px' }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Clients Table */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Gestion des Clients</h2>
            <button style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Plus size={16} />
              Nouveau Client
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Client</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Plan</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Sites</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Revenus/mois</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Statut</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Accès</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{client.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>/{client.subdomain}</p>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: client.plan === 'Enterprise' ? 'rgba(139, 92, 246, 0.2)' :
                                   client.plan === 'Professional' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: client.plan === 'Enterprise' ? '#a78bfa' :
                               client.plan === 'Professional' ? '#10b981' : '#94a3b8'
                      }}>
                        {client.plan}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>{client.sites}</td>
                    <td style={{ padding: '16px' }}>{client.monthlyFee.toLocaleString('fr-CA')}$</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: client.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: client.status === 'active' ? '#22c55e' : '#ef4444'
                      }}>
                        {client.status === 'active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Link 
                          href={`/${client.subdomain}/dashboard`}
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} />
                          Dashboard
                        </Link>
                        {client.domain && (
                          <a 
                            href={`https://${client.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#10b981',
                              textDecoration: 'none',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Globe size={12} />
                            Domaine
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => generateQRCode(client.subdomain)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Générer QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Éditer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: 'Facturation Globale', desc: 'Gestion des paiements et factures', href: '/admin/billing', icon: DollarSign, color: '#22c55e' },
            { title: 'Analytics Consolidées', desc: 'Rapports multi-clients', href: '/admin/analytics', icon: BarChart3, color: '#3b82f6' },
            { title: 'Configuration Système', desc: 'Paramètres globaux', href: '/admin/settings', icon: Settings, color: '#8b5cf6' },
            { title: 'Support & Logs', desc: 'Assistance technique', href: '/admin/support', icon: AlertTriangle, color: '#f59e0b' }
          ].map((action, index) => (
            <Link key={index} href={action.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <action.icon size={32} style={{ color: action.color, marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{action.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}