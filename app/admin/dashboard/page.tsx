'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortalHeader } from '@/components/PortalHeader';
import LandingSlidesTab from '@/components/admin/LandingSlidesTab';
import ModuleSlidesTab from '@/components/admin/ModuleSlidesTab';
import PriceManager from '../../../components/admin/PriceManager';
import RevenueForecast from '../../../components/admin/RevenueForecast';
import { computeSubState } from '@/lib/subscription';
import { CANADIAN_PROVINCES, getProvinceByCode } from '../../../data/provinces';
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
  Lock,
  Home,
  LogIn
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
  status: 'active' | 'pending' | 'suspended' | 'archived';
  lastActivity: string;
  domain?: string;
  provinces: string[]; // Codes des provinces (ex: ['QC', 'ON'])
  currentProvince?: string; // Province actuelle basée sur géolocalisation
}

export default function AdminDashboard() {
  // Accès déjà garanti par l'auth réelle + middleware (super_admin). Plus de 2e mot de passe en dur.
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 1,
    totalSites: 1,
    monthlyRevenue: 0,
    activeASTs: 0,
    pendingApprovals: 0,
    complianceScore: 100
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'archived'>('all');
  const [filterPay, setFilterPay] = useState<'all' | 'upcoming' | 'late' | 'relance'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [showCreateClient, setShowCreateClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    subdomain: '',
    plan: 'Professional',
    email: '',
    phone: '',
    tempPassword: '',
    provinces: [] as string[],
    currentProvince: ''
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

  const loadTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (Array.isArray(data.tenants)) {
        setClients(data.tenants.map((t: any) => {
          const st = computeSubState(t.subscription);
          return {
            id: t.id, name: t.companyName || t.id, subdomain: t.subdomain || t.id,
            plan: t.plan || 'basic', sites: 1,
            monthlyFee: Number(t.annualRevenue || 0), annualRevenue: Number(t.annualRevenue || 0),
            status: t.archived ? 'archived' : (t.isActive === false ? 'suspended' : 'active'),
            archived: t.archived === true,
            payState: st.status, nextBilling: st.nextBilling, daysUntil: st.daysUntilBilling,
            lastActivity: (t.createdAt || '').split('T')[0] || '',
            domain: t.domain || `${t.subdomain || t.id}.csecur360.ca`, provinces: [], currentProvince: '',
          };
        }) as any);
        setStats(prev => ({ ...prev, totalClients: data.tenants.length }));
      }
    } catch { /* ignore */ }
  };
  useEffect(() => { loadTenants(); }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClient.name.trim() || !newClient.subdomain.trim() || !newClient.email.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (newClient.provinces.length === 0) {
      alert('Veuillez sélectionner au moins une province d\'opération');
      return;
    }

    // Generate temp password if not provided
    const tempPassword = newClient.tempPassword || generateTempPassword();

    const planPricing = {
      'Professional': 3000, // Plan unique annuel
      'Demo': 0
    };

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: newClient.subdomain.trim().toLowerCase(),
          companyName: newClient.name.trim(),
          adminEmail: newClient.email.trim(),
          adminPassword: tempPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Création échouée');
      alert(`Client créé !\n\nNom: ${newClient.name}\nPortail: /${data.id}/modules\nAdmin: ${newClient.email}\nMot de passe temporaire: ${tempPassword}`);
      setNewClient({ name: '', subdomain: '', plan: 'Professional', email: '', phone: '', tempPassword: '', provinces: [], currentProvince: '' });
      setShowCreateClient(false);
      loadTenants();
    } catch (err: any) {
      alert('Erreur: ' + (err.message || 'création échouée'));
    }
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
        color: '#111827'
      }}>
        <div style={{
          background: '#ffffff',
          padding: '48px',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <Shield style={{ color: '#10b981', margin: '0 auto 24px auto' }} size={48} />
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Administration C-SECUR360</h1>
          <p style={{ margin: '0 0 32px 0', color: '#6b7280' }}>Accès sécurisé au panneau d'administration</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder="Mot de passe administrateur"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: '#ffffff',
                color: '#111827',
                fontSize: '16px'
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#111827',
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
    <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#111827', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <PortalHeader subtitle="Panneau de contrôle multi-clients" />

      {/* Barre de navigation rapide */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '10px 24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#e2e8f0',
            padding: '7px 14px',
            borderRadius: '7px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.15s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          <Home size={15} />
          Accueil public
        </Link>

        <Link
          href="/auth/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)',
            color: '#34d399',
            padding: '7px 14px',
            borderRadius: '7px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.15s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.22)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
        >
          <LogIn size={15} />
          Connexion tenant
        </Link>
      </div>

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
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <stat.icon size={32} style={{ color: stat.color, marginBottom: '12px' }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Prévisions de revenu (vues quotidien/hebdo/mensuel/annuel) */}
        <RevenueForecast />

        {/* Gestion des prix des modules (au-dessus des tenants) */}
        <PriceManager />

        {/* Clients Table */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'visible'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Gestion des Clients</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
              <button onClick={() => setFiltersOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}>
                ☰ Filtres{(filterStatus !== 'all' || filterPay !== 'all') ? ' •' : ''}
              </button>
              {filtersOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setFiltersOpen(false)} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '240px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: '12px', zIndex: 50 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>Statut</div>
                    {([['all', 'Tous'], ['active', 'Actif'], ['suspended', 'Suspendu'], ['archived', 'Archivé']] as const).map(([v, l]) => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="radio" name="fstatus" checked={filterStatus === v} onChange={() => setFilterStatus(v)} /> {l}
                      </label>
                    ))}
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', margin: '10px 0 4px' }}>Paiement</div>
                    {([['all', 'Tous'], ['upcoming', 'À venir (≤60j)'], ['late', 'En retard (grâce)'], ['relance', 'Relance (impayé)']] as const).map(([v, l]) => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="radio" name="fpay" checked={filterPay === v} onChange={() => setFilterPay(v)} /> {l}
                      </label>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={() => setShowCreateClient(true)}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#111827', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Nouveau Client
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#ffffff' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Client</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Plan</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Sites</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Revenu annuel</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Statut</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Accès</th>
                </tr>
              </thead>
              <tbody>
                {clients.filter((c: any) => (filterStatus === 'all' || c.status === filterStatus) && (filterPay === 'all' || (filterPay === 'upcoming' && c.payState === 'reminder') || (filterPay === 'late' && c.payState === 'grace') || (filterPay === 'relance' && c.payState === 'blocked'))).map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{client.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>/{client.subdomain}</p>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: client.plan === 'Enterprise' ? 'rgba(139, 92, 246, 0.2)' :
                                   client.plan === 'Professional' ? 'rgba(16, 185, 129, 0.2)' : '#e5e7eb',
                        color: client.plan === 'Enterprise' ? '#a78bfa' :
                               client.plan === 'Professional' ? '#10b981' : '#6b7280'
                      }}>
                        {client.plan}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>{client.sites}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600 }}>{(client.monthlyFee || 0).toLocaleString('fr-CA')} $/an</div>
                      {(client as any).nextBilling && (
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          Prochaine : {(client as any).nextBilling}{(client as any).daysUntil != null ? ` · ${(client as any).daysUntil} j` : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px',
                          background: client.status === 'active' ? 'rgba(34,197,94,0.15)' : client.status === 'archived' ? '#e5e7eb' : 'rgba(239,68,68,0.15)',
                          color: client.status === 'active' ? '#16a34a' : client.status === 'archived' ? '#6b7280' : '#ef4444' }}>
                          {client.status === 'active' ? 'Actif' : client.status === 'archived' ? 'Archivé' : 'Suspendu'}
                        </span>
                        {(() => {
                          const ps = (client as any).payState;
                          const m: Record<string, [string, string, string]> = {
                            active: ['Payé', '#16a34a', 'rgba(34,197,94,0.12)'],
                            reminder: ['À venir', '#2563eb', 'rgba(37,99,235,0.12)'],
                            grace: ['En retard', '#d97706', 'rgba(245,158,11,0.15)'],
                            blocked: ['Relance', '#dc2626', 'rgba(239,68,68,0.15)'],
                            none: ['—', '#6b7280', '#f3f4f6'],
                          };
                          const [lbl, col, bg] = m[ps] || m.none;
                          return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', background: bg, color: col }}>{lbl}</span>;
                        })()}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Link
                          href={`/admin/tenants/${client.id}`}
                          style={{ color: '#2563eb', textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        >
                          <Settings size={12} />
                          Gérer (modules/abonnement)
                        </Link>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section « Actions rapides » retirée (non utilisée) */}

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
              background: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
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
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: '#ffffff',
                        color: '#111827',
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
                      placeholder="entrepriseabc"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: '#ffffff',
                        color: '#111827',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
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
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      background: '#ffffff',
                      color: '#111827',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Professional">Plan Unique - 3000$/année (250$/mois)</option>
                    <option value="Demo">Demo - Gratuit</option>
                  </select>
                </div>

                {/* Sélection des provinces */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>
                    Provinces d'opération *
                  </label>
                  <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    background: '#ffffff',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#10b981',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={newClient.provinces.length === CANADIAN_PROVINCES.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewClient(prev => ({ 
                                ...prev, 
                                provinces: CANADIAN_PROVINCES.map(p => p.code) 
                              }));
                            } else {
                              setNewClient(prev => ({ ...prev, provinces: [] }));
                            }
                          }}
                          style={{ marginRight: '4px' }}
                        />
                        Toutes les provinces du Canada
                      </label>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '8px',
                      fontSize: '14px'
                    }}>
                      {CANADIAN_PROVINCES.map((province) => (
                        <label key={province.code} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#e2e8f0',
                          cursor: 'pointer',
                          padding: '4px'
                        }}>
                          <input
                            type="checkbox"
                            checked={newClient.provinces.includes(province.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewClient(prev => ({
                                  ...prev,
                                  provinces: [...prev.provinces, province.code]
                                }));
                              } else {
                                setNewClient(prev => ({
                                  ...prev,
                                  provinces: prev.provinces.filter(p => p !== province.code)
                                }));
                              }
                            }}
                          />
                          <span style={{ fontSize: '12px', color: province.color }}>
                            {province.code}
                          </span>
                          <span>{province.nameFr}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    Les formulaires s'adapteront automatiquement aux normes de chaque province sélectionnée
                  </p>
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
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: '#ffffff',
                        color: '#111827',
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
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: '#ffffff',
                        color: '#111827',
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
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: '#ffffff',
                        color: '#111827',
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
                        tempPassword: '',
                        provinces: [],
                        currentProvince: ''
                      });
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(100, 116, 139, 0.6)',
                      color: '#111827',
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
                      color: '#111827',
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

      {/* Section : gestion slides page d'accueil */}
      <div style={{ padding: '40px 32px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>
          Page d'accueil — Carrousel hero
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
          Photos du carrousel principal en haut de la page d'accueil.
        </p>
        <LandingSlidesTab />
      </div>

      {/* Section : captures d'ecran par module */}
      <div style={{ padding: '40px 32px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>
          Page d'accueil — Captures modules
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
          Screenshots affichees au survol de chaque module sur la page d'accueil.
        </p>
        <ModuleSlidesTab />
      </div>

      {/* Footer avec mention CERDIA */}
      <footer style={{
        padding: '20px 0',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        background: '#ffffff'
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