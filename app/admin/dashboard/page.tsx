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
    totalClients: 1,
    totalSites: 1,
    monthlyRevenue: 0,
    activeASTs: 0,
    pendingApprovals: 0,
    complianceScore: 100
  });

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Demo Client',
      subdomain: 'demo',
      plan: 'Demo',
      sites: 1,
      monthlyFee: 0,
      status: 'active',
      lastActivity: new Date().toISOString().split('T')[0],
      domain: 'demo.csecur360.ca'
    }
  ]);

  const [showCreateClient, setShowCreateClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    subdomain: '',
    plan: 'Professional',
    email: '',
    phone: '',
    tempPassword: ''
  });

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CGEstion321$') {
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
    window.open(`/api/qr/generate?client=${clientSubdomain}`, '_blank');
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClient.name.trim() || !newClient.subdomain.trim() || !newClient.email.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Generate temp password if not provided
    const tempPassword = newClient.tempPassword || generateTempPassword();

    const planPricing = {
      'Starter': 29,
      'Professional': 79,
      'Enterprise': 199,
      'Demo': 0
    };

    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name.trim(),
      subdomain: newClient.subdomain.trim().toLowerCase(),
      plan: newClient.plan,
      sites: 1,
      monthlyFee: planPricing[newClient.plan as keyof typeof planPricing] || 79,
      status: 'active',
      lastActivity: new Date().toISOString().split('T')[0],
      domain: `${newClient.subdomain.trim().toLowerCase()}.csecur360.ca`
    };

    setClients(prev => [...prev, client]);
    
    // Show client credentials
    alert(`Client créé avec succès!
    
Nom: ${client.name}
URL: https://csecur360.com/${client.subdomain}
Domaine: ${client.domain}
Plan: ${client.plan} (${client.monthlyFee}$/mois)
Mot de passe temporaire: ${tempPassword}

Email de bienvenue envoyé à: ${newClient.email}`);

    // Reset form
    setNewClient({
      name: '',
      subdomain: '',
      plan: 'Professional',
      email: '',
      phone: '',
      tempPassword: ''
    });
    setShowCreateClient(false);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalClients: prev.totalClients + 1,
      monthlyRevenue: prev.monthlyRevenue + client.monthlyFee
    }));
  };

  const deleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.name}" ? Cette action est irréversible.`)) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      setStats(prev => ({
        ...prev,
        totalClients: prev.totalClients - 1,
        monthlyRevenue: prev.monthlyRevenue - client.monthlyFee
      }));
    }
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
            <button 
              onClick={() => setShowCreateClient(true)}
              style={{
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
              }}
            >
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
                          onClick={() => deleteClient(client.id)}
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

        {/* Modal Création Client */}
        {showCreateClient && (
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
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{
                margin: '0 0 24px 0',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Plus style={{ color: '#10b981' }} size={24} />
                Créer un Nouveau Client
              </h3>

              <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e2e8f0'
                    }}>
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Hydro-Québec"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e2e8f0'
                    }}>
                      Sous-domaine *
                    </label>
                    <input
                      type="text"
                      value={newClient.subdomain}
                      onChange={(e) => setNewClient(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                      placeholder="hydroquebec"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      URL: csecur360.com/{newClient.subdomain || 'nomclient'}
                    </p>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>
                    Plan tarifaire
                  </label>
                  <select
                    value={newClient.plan}
                    onChange={(e) => setNewClient(prev => ({ ...prev, plan: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Starter">Starter - 29$/mois</option>
                    <option value="Professional">Professional - 79$/mois</option>
                    <option value="Enterprise">Enterprise - 199$/mois</option>
                    <option value="Demo">Demo - Gratuit</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e2e8f0'
                    }}>
                      Email contact *
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@entreprise.com"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e2e8f0'
                    }}>
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="514-555-0123"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>
                    Mot de passe temporaire (optionnel)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newClient.tempPassword}
                      onChange={(e) => setNewClient(prev => ({ ...prev, tempPassword: e.target.value }))}
                      placeholder="Généré automatiquement si vide"
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '2px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setNewClient(prev => ({ ...prev, tempPassword: generateTempPassword() }))}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Générer
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateClient(false);
                      setNewClient({
                        name: '',
                        subdomain: '',
                        plan: 'Professional',
                        email: '',
                        phone: '',
                        tempPassword: ''
                      });
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(100, 116, 139, 0.6)',
                      color: 'white',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    Créer le Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec mention CERDIA */}
      <footer style={{
        padding: '20px 0',
        borderTop: '1px solid rgba(100, 116, 139, 0.2)',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <p style={{ 
          color: '#64748b', 
          margin: 0,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          © 2024 C-SECUR360 - Propulsé par
          <img 
            src="/c-secur360-logo.png" 
            alt="CERDIA" 
            style={{ height: '16px', width: 'auto' }}
          />
          CERDIA - Contact: eric.dufort@cerdia.ai | 514-603-4519
        </p>
      </footer>
    </div>
  );
}