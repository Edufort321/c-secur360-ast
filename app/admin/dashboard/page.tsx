'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PortalHeader } from '@/components/PortalHeader';
import LandingSlidesTab from '@/components/admin/LandingSlidesTab';
import ModuleSlidesTab from '@/components/admin/ModuleSlidesTab';
import AdminAccountsTab from '@/components/admin/AdminAccountsTab';
import MarketingTab from '@/components/admin/MarketingTab';
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
  // Navigation par onglets de modules (au lieu d'une longue page qui défile).
  const [tab, setTab] = useState<'tableau' | 'clients' | 'vendeurs' | 'admins' | 'marketing' | 'contenu'>('tableau');
  const ADMIN_TABS: { k: typeof tab; label: string; icon: any }[] = [
    { k: 'tableau', label: 'Tableau de bord', icon: BarChart3 },
    { k: 'clients', label: 'Clients', icon: Building },
    { k: 'vendeurs', label: 'Vendeurs', icon: Users },
    { k: 'admins', label: 'Administrateurs', icon: Shield },
    { k: 'marketing', label: 'Marketing', icon: TrendingUp },
    { k: 'contenu', label: 'Contenu du site', icon: Globe },
  ];

  const [vendors, setVendors] = useState<any[]>([]);
  const [aiReq, setAiReq] = useState<{ requested: string[]; exhausted: string[] }>({ requested: [], exhausted: [] });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '', commission_rate: 20, notes: '' });
  const [savingVendor, setSavingVendor] = useState(false);

  const [showCreateClient, setShowCreateClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    subdomain: '',
    plan: 'Professional',
    email: '',
    phone: '',
    tempPassword: '',
    provinces: [] as string[],
    currentProvince: '',
    billable: true,
    vendor_id: '',
  });

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Securite (#7) : verification cote serveur (le mot de passe n'est plus dans le bundle client).
    try {
      const res = await fetch('/api/admin/dashboard-auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || 'Mot de passe incorrect');
      }
    } catch {
      alert('Erreur de connexion au serveur.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPassword('');
  };

  const generateQRCode = (clientSubdomain: string) => {
    const url = `https://www.c-secur360.ca/${clientSubdomain}`;
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
            billable: t.billable !== false,
            vendor_id: t.vendor_id || null,
            payState: st.status, nextBilling: st.nextBilling, daysUntil: st.daysUntilBilling,
            lastActivity: (t.createdAt || '').split('T')[0] || '',
            domain: t.domain || `www.c-secur360.ca/${t.subdomain || t.id}`, provinces: [], currentProvince: '',
          };
        }) as any);
        setStats(prev => ({ ...prev, totalClients: data.tenants.length }));
      }
    } catch { /* ignore */ }
    // Demandes d'ajustement de forfait IA en attente (carte rouge « ajustement token requis »).
    try { const r = await fetch('/api/admin/ai-requests'); const d = await r.json(); if (Array.isArray(d.requested)) setAiReq({ requested: d.requested, exhausted: Array.isArray(d.exhausted) ? d.exhausted : [] }); } catch { /* ignore */ }
  };
  const loadVendors = async () => {
    try {
      const res = await fetch('/api/admin/vendors');
      const data = await res.json();
      if (Array.isArray(data.vendors)) setVendors(data.vendors);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadTenants(); loadVendors(); }, []);

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
          billable: newClient.billable,
          vendor_id: newClient.vendor_id || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Création échouée');
      const billableNote = newClient.billable ? '' : '\nMode: DÉMO (non-facturable)';
      const vendorNote = newClient.vendor_id ? `\nVendeur: ${vendors.find(v => v.id === newClient.vendor_id)?.name || ''}` : '';
      alert(`Client créé !\n\nNom: ${newClient.name}\nPortail: /${data.id}/modules\nAdmin: ${newClient.email}\nMot de passe temporaire: ${tempPassword}${billableNote}${vendorNote}`);
      setNewClient({ name: '', subdomain: '', plan: 'Professional', email: '', phone: '', tempPassword: '', provinces: [], currentProvince: '', billable: true, vendor_id: '' });
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

  const totalBillableRevenue = useMemo(
    () => clients.filter((c: any) => c.billable !== false && c.status !== 'archived').reduce((s, c) => s + (c.monthlyFee || 0), 0),
    [clients]
  );

  const totalVendorCommission = useMemo(
    () => clients
      .filter((c: any) => c.billable !== false && c.status !== 'archived' && (c as any).vendor_id)
      .reduce((s, c) => {
        const v = vendors.find((x: any) => x.id === (c as any).vendor_id);
        return s + (c.monthlyFee || 0) * Number(v?.commission_rate ?? 0);
      }, 0),
    [clients, vendors]
  );

  const cerdiaNettRevenue = totalBillableRevenue - totalVendorCommission;

  const vendorClientsCount = useMemo(
    () => clients.filter((c: any) => c.billable !== false && c.status !== 'archived' && (c as any).vendor_id).length,
    [clients]
  );

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
    <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#111827', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        .admTabbar{ display:flex; gap:6px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding:10px 16px; background:#fff; border-bottom:1px solid #e5e7eb; position:sticky; top:0; z-index:30; scrollbar-width:thin; }
        .admTab{ flex:0 0 auto; display:inline-flex; align-items:center; gap:7px; padding:9px 15px; border-radius:9px; border:1px solid #e5e7eb; background:#f9fafb; color:#374151; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap; }
        .admTab:hover{ background:#f3f4f6; }
        .admTab.active{ background:#2563eb; color:#fff; border-color:#2563eb; }
        .admSection, .admMain{ max-width:100%; }
        @media(max-width:640px){
          .admMain{ padding:18px 12px !important; }
          .admSection{ padding:26px 12px 0 !important; }
          .admTab{ padding:8px 12px; font-size:13px; }
        }
      `}</style>
      <PortalHeader subtitle="Panneau de contrôle multi-clients" />

      {/* Barre de navigation rapide */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '10px 24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#111827',
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

        <Link
          href="/admin/demo-leads"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.35)',
            color: '#60a5fa',
            padding: '7px 14px',
            borderRadius: '7px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.15s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.22)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.12)')}
        >
          <Users size={15} />
          Leads démo
        </Link>
      </div>

      {/* Onglets de modules */}
      <div className="admTabbar">
        {ADMIN_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.k} className={`admTab ${tab === t.k ? 'active' : ''}`} onClick={() => setTab(t.k)}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="admMain" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {tab === 'tableau' && (<>
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

        {/* Répartition revenu CERDIA / Vendeurs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenu annuel total</p>
            <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 800, color: '#111827' }}>{totalBillableRevenue.toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Clients facturables actifs</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderRadius: '12px', border: '1px solid #a7f3d0', padding: '20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenu Commerce CERDIA</p>
            <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 800, color: '#065f46' }}>{cerdiaNettRevenue.toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#059669' }}>Après déduction des commissions vendeurs</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenu Vendeurs</p>
            <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 800, color: '#1d4ed8' }}>{totalVendorCommission.toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#2563eb' }}>
              {vendorClientsCount} client{vendorClientsCount !== 1 ? 's' : ''} avec représentant assigné
            </p>
          </div>
        </div>

        {/* Prévisions de revenu (vues quotidien/hebdo/mensuel/annuel) */}
        <RevenueForecast />

        {/* Gestion des prix des modules (au-dessus des tenants) */}
        <PriceManager />

        </>)}

        {tab === 'clients' && (<>
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
                        {(aiReq.requested.includes(client.subdomain) || aiReq.exhausted.includes(client.subdomain)) && (
                          <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#fee2e2', color: '#b91c1c' }}>
                            🔴 {aiReq.requested.includes(client.subdomain) ? 'Ajustement token requis' : 'Forfait IA épuisé'}
                          </span>
                        )}
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
                      {(client as any).billable === false ? (
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: 'rgba(100,116,139,0.15)', color: '#64748b', letterSpacing: '0.05em' }}>DÉMO</span>
                      ) : (
                        <>
                          <div style={{ fontWeight: 600 }}>{(client.monthlyFee || 0).toLocaleString('fr-CA')} $/an</div>
                          {(client as any).nextBilling && (
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              Prochaine : {(client as any).nextBilling}{(client as any).daysUntil != null ? ` · ${(client as any).daysUntil} j` : ''}
                            </div>
                          )}
                          {(client as any).vendor_id && (() => {
                            const v = vendors.find((x: any) => x.id === (client as any).vendor_id);
                            if (!v) return null;
                            const commAmt = Math.round((client.monthlyFee || 0) * Number(v.commission_rate) * 100) / 100;
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', color: '#2563eb' }}>
                                <span style={{ background: 'rgba(37,99,235,0.1)', borderRadius: '3px', padding: '1px 5px', fontWeight: 600 }}>
                                  {v.name}
                                </span>
                                <span style={{ color: '#6b7280' }}>comm.</span>
                                <span style={{ fontWeight: 700 }}>{commAmt.toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $</span>
                              </div>
                            );
                          })()}
                        </>
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
                color: '#111827',
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
                      color: '#111827'
                    }}>
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => { const name = e.target.value; const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); setNewClient(prev => ({ ...prev, name, subdomain: prev.subdomain || slug ? (!prev.subdomain ? slug : prev.subdomain) : '' })); }}
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
                      color: '#111827'
                    }}>
                      Sous-domaine *
                    </label>
                    <input
                      type="text"
                      value={newClient.subdomain}
                      onChange={(e) => setNewClient(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
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
                      URL: www.c-secur360.ca/{newClient.subdomain || 'votre-slug'}
                    </p>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
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
                    color: '#111827'
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
                          color: '#111827',
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
                      color: '#111827'
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
                      color: '#111827'
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

                {/* Facturable + Vendeur */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      Facturation
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', background: '#ffffff', color: '#111827' }}>
                      <input
                        type="checkbox"
                        checked={newClient.billable}
                        onChange={e => setNewClient(prev => ({ ...prev, billable: e.target.checked }))}
                        style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: newClient.billable ? '#059669' : '#64748b' }}>
                        {newClient.billable ? 'Facturable' : 'Démo (non-facturable)'}
                      </span>
                    </label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>Décocher pour les tenants démo</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      Représentant commercial
                    </label>
                    <select
                      value={newClient.vendor_id}
                      onChange={e => setNewClient(prev => ({ ...prev, vendor_id: e.target.value }))}
                      style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#ffffff', color: '#111827', boxSizing: 'border-box' }}
                    >
                      <option value="">Aucun</option>
                      {vendors.filter(v => v.is_active).map(v => (
                        <option key={v.id} value={v.id}>{v.name} — {Math.round(Number(v.commission_rate) * 100)}%</option>
                      ))}
                    </select>
                    {newClient.vendor_id && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                        Commission payable au renouvellement annuel
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
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
                        currentProvince: '',
                        billable: true,
                        vendor_id: '',
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
        </>)}
      </div>

      {tab === 'vendeurs' && (
      <div className="admSection" style={{ padding: '40px 32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0', color: '#111827' }}>Représentants commerciaux</h2>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Commission 20% du total annuel, payable au renouvellement.</p>
          </div>
          <button
            onClick={() => setShowVendorForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: showVendorForm ? '#f1f5f9' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: showVendorForm ? '#374151' : '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={15} /> {showVendorForm ? 'Annuler' : 'Ajouter un vendeur'}
          </button>
        </div>

        {showVendorForm && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Nom *</label>
                <input value={newVendor.name} onChange={e => setNewVendor(v => ({ ...v, name: e.target.value }))}
                  placeholder="Jean Tremblay" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px', color: '#111827', background: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Courriel</label>
                <input type="email" value={newVendor.email} onChange={e => setNewVendor(v => ({ ...v, email: e.target.value }))}
                  placeholder="jean@exemple.com" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px', color: '#111827', background: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Téléphone</label>
                <input value={newVendor.phone} onChange={e => setNewVendor(v => ({ ...v, phone: e.target.value }))}
                  placeholder="514-555-0123" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px', color: '#111827', background: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Commission (%)</label>
                <input type="number" min={0} max={100} step={1} value={newVendor.commission_rate}
                  onChange={e => setNewVendor(v => ({ ...v, commission_rate: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px', color: '#111827', background: '#fff', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button
              disabled={savingVendor || !newVendor.name.trim()}
              onClick={async () => {
                setSavingVendor(true);
                try {
                  const res = await fetch('/api/admin/vendors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...newVendor, commission_rate: newVendor.commission_rate / 100 }),
                  });
                  const d = await res.json();
                  if (!res.ok) throw new Error(d.error);
                  setNewVendor({ name: '', email: '', phone: '', commission_rate: 20, notes: '' });
                  setShowVendorForm(false);
                  loadVendors();
                } catch (e: any) { alert('Erreur : ' + e.message); }
                setSavingVendor(false);
              }}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: savingVendor ? 0.6 : 1 }}
            >
              {savingVendor ? 'Enregistrement…' : 'Créer le vendeur'}
            </button>
          </div>
        )}

        {vendors.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Aucun vendeur enregistré. Exécutez d'abord la migration 057 dans Supabase.
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
           <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Nom', 'Courriel', 'Téléphone', 'Taux', 'Clients', 'Revenu annuel', 'Commission estimée', 'Statut', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => {
                  const vClients = clients.filter((c: any) => (c as any).vendor_id === v.id && c.billable !== false && c.status !== 'archived');
                  const vRevenue = vClients.reduce((s, c) => s + (c.monthlyFee || 0), 0);
                  const vComm = Math.round(vRevenue * Number(v.commission_rate) * 100) / 100;
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>
                        {v.name}
                        {vClients.length > 0 && (
                          <div style={{ marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {vClients.map((c: any) => (
                              <span key={c.id} style={{ fontSize: '10px', background: 'rgba(37,99,235,0.08)', color: '#2563eb', borderRadius: '3px', padding: '1px 5px' }}>{c.name}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563' }}>{v.email || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563' }}>{v.phone || '—'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{Math.round(Number(v.commission_rate) * 100)}%</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827', textAlign: 'center' }}>{vClients.length}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                        {vRevenue > 0 ? `${vRevenue.toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: vComm > 0 ? '#1d4ed8' : '#9ca3af', whiteSpace: 'nowrap' }}>
                        {vComm > 0 ? `${vComm.toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700,
                          background: v.is_active ? 'rgba(16,185,129,0.12)' : '#f1f5f9',
                          color: v.is_active ? '#059669' : '#9ca3af' }}>
                          {v.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={async () => {
                            if (!confirm(`Désactiver ${v.name} ?`)) return;
                            await fetch(`/api/admin/vendors?id=${v.id}`, { method: 'DELETE' });
                            loadVendors();
                          }}
                          style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Désactiver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
           </div>
          </div>
        )}
      </div>
      )}

      {tab === 'admins' && (
      <div className="admSection" style={{ padding: '40px 32px 0' }}>
        <AdminAccountsTab />
      </div>
      )}

      {tab === 'marketing' && (
      <div className="admSection" style={{ padding: '40px 32px 0' }}>
        <MarketingTab />
      </div>
      )}

      {tab === 'contenu' && (<>
      <div className="admSection" style={{ padding: '40px 32px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>
          Page d'accueil — Carrousel hero
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
          Photos du carrousel principal en haut de la page d'accueil.
        </p>
        <LandingSlidesTab />
      </div>

      {/* Section : captures d'ecran par module */}
      <div className="admSection" style={{ padding: '40px 32px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>
          Page d'accueil — Captures modules
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
          Screenshots affichees au survol de chaque module sur la page d'accueil.
        </p>
        <ModuleSlidesTab />
      </div>
      </>)}

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
          © {new Date().getFullYear()} Commerce CERDIA inc. — C-Secur360 · Propulsé par
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