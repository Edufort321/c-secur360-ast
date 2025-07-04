'use client'

import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Users, 
  Shield, 
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  Bell,
  MapPin,
  ChevronRight,
  Activity,
  Award,
  Zap
} from 'lucide-react'

interface DashboardData {
  totalAST: number
  astThisMonth: number
  astCompleted: number
  astOverdue: number
  incidents: number
  nearMiss: number
  incidentsTrend: number
  complianceRate: number
  overdueAnalyses: number
  upcomingRenewals: number
  totalWorkers: number
  trainedWorkers: number
  certificationExpiring: number
  suggestedImprovements: number
  implementedImprovements: number
  costSavings: number
}

interface Tenant {
  id: string
  subdomain: string
  companyName: string
}

// Données simulées pour la démo
const mockData: DashboardData = {
  totalAST: 1247,
  astThisMonth: 89,
  astCompleted: 1156,
  astOverdue: 12,
  incidents: 3,
  nearMiss: 24,
  incidentsTrend: -15,
  complianceRate: 94.2,
  overdueAnalyses: 8,
  upcomingRenewals: 15,
  totalWorkers: 156,
  trainedWorkers: 148,
  certificationExpiring: 12,
  suggestedImprovements: 37,
  implementedImprovements: 28,
  costSavings: 145000
}

const recentAST = [
  { id: 'AST-2024-089', project: 'Maintenance Turbine #3', client: 'Hydro-Québec', date: '2024-01-15', status: 'completed', risk: 'medium' },
  { id: 'AST-2024-088', project: 'Réparation Transformateur', client: 'Énergir', date: '2024-01-14', status: 'pending', risk: 'high' },
  { id: 'AST-2024-087', project: 'Installation Câblage', client: 'Bell Canada', date: '2024-01-14', status: 'overdue', risk: 'low' },
  { id: 'AST-2024-086', project: 'Entretien Génératrice', client: 'Alstom', date: '2024-01-13', status: 'completed', risk: 'critical' }
]

const nearMissEvents = [
  { id: 'NM-2024-024', description: 'Quasi-contact ligne électrique', severity: 'high', date: '2024-01-15', status: 'investigating' },
  { id: 'NM-2024-023', description: 'Chute outils depuis nacelle', severity: 'medium', date: '2024-01-14', status: 'resolved' },
  { id: 'NM-2024-022', description: 'Mauvais EPI détecté', severity: 'low', date: '2024-01-13', status: 'resolved' }
]

const improvements = [
  { id: 'IMP-024', title: 'Procédure consignation améliorée', impact: 'Réduction risque 25%', cost: 15000, status: 'implemented' },
  { id: 'IMP-023', title: 'Formation VR dangers électriques', impact: 'Engagement +40%', cost: 25000, status: 'planned' },
  { id: 'IMP-022', title: 'App mobile check EPI', impact: 'Conformité +15%', cost: 8000, status: 'development' }
]

export default function ManagerDashboard({ tenant = { id: '1', subdomain: 'demo', companyName: 'Demo Company' } }: { tenant?: Tenant }) {
  const [timeFilter, setTimeFilter] = useState('30d')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const data = mockData

  const premiumStyles = {
    // Background premium avec effet parallax
    background: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      minHeight: '100vh',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    
    // Effet glassmorphism premium
    glassCard: {
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Header premium avec effet néon
    header: {
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(0, 0, 0, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 50px rgba(251, 191, 36, 0.1)',
    },
    
    // Animation pour les cartes KPI
    kpiCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '24px',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative' as const,
      overflow: 'hidden',
      cursor: 'pointer',
    },
    
    // Animation hover pour les cartes
    cardHover: {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(251, 191, 36, 0.3)',
      borderColor: 'rgba(251, 191, 36, 0.4)',
    },
    
    // Typography premium
    heading: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: '700',
      letterSpacing: '-0.025em',
      background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    
    // Boutons premium avec effet néon
    premiumButton: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)',
      backgroundSize: '200% 200%',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 24px',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
    },
    
    // Animation CSS pour les effets
    animations: `
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .float-animation { animation: float 6s ease-in-out infinite; }
      .pulse-animation { animation: pulse 2s ease-in-out infinite; }
      .slide-in-up { animation: slideInUp 0.6s ease-out; }
    `
  }

  return (
    <>
      <style jsx>{premiumStyles.animations}</style>
      <div style={premiumStyles.background}>
        
        {/* Overlay pattern pour texture premium */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none'
        }} />

        {/* Header Premium avec logo */}
        <header style={premiumStyles.header}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              {/* Logo et titre */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  padding: '12px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="float-animation">
                  {/* Tentative de charger le logo, fallback vers icône */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <img 
                      src="/c-secur360-logo.png" 
                      alt="C-Secur360"
                      style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                      onError={(e) => {
                        // Fallback vers icône si logo non trouvé
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <BarChart3 style={{ width: '32px', height: '32px', display: 'none' }} />
                  </div>
                </div>
                
                <div>
                  <h1 style={{
                    ...premiumStyles.heading,
                    fontSize: '32px',
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    🛡️ C-Secur360
                  </h1>
                  <p style={{
                    color: 'rgba(251, 191, 36, 0.8)',
                    fontSize: '16px',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Dashboard Gestionnaire SST • {tenant.companyName}
                  </p>
                </div>
              </div>
              
              {/* Contrôles premium */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">3 derniers mois</option>
                  <option value="1y">Dernière année</option>
                </select>
                
                <button 
                  style={premiumStyles.premiumButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundPosition = '100% 0';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundPosition = '0% 0';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  <Download style={{ width: '16px', height: '16px', marginRight: '8px', display: 'inline' }} />
                  Rapport Exécutif
                </button>
              </div>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* KPI Cards Premium */}
          <div className="slide-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* AST Complétés */}
            <div 
              style={{
                ...premiumStyles.kpiCard,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, premiumStyles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
              }}
            >
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ color: 'rgba(34, 197, 94, 0.9)', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AST Complétés
                  </p>
                  <p style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 4px 0', lineHeight: 1 }}>
                    {data.astCompleted.toLocaleString()}
                  </p>
                  <p style={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                    +{data.astThisMonth} ce mois
                  </p>
                </div>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  padding: '16px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }} className="pulse-animation">
                  <CheckCircle style={{ width: '32px', height: '32px', color: '#22c55e' }} />
                </div>
              </div>
            </div>

            {/* Conformité */}
            <div 
              style={{
                ...premiumStyles.kpiCard,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, premiumStyles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
            >
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ color: 'rgba(59, 130, 246, 0.9)', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Conformité
                  </p>
                  <p style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 4px 0', lineHeight: 1 }}>
                    {data.complianceRate}%
                  </p>
                  <p style={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                    CNESST Standard
                  </p>
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  padding: '16px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }} className="pulse-animation">
                  <Shield style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                </div>
              </div>
            </div>

            {/* Incidents */}
            <div 
              style={{
                ...premiumStyles.kpiCard,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, premiumStyles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
              }}
            >
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ color: 'rgba(245, 158, 11, 0.9)', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Incidents
                  </p>
                  <p style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 4px 0', lineHeight: 1 }}>
                    {data.incidents}
                  </p>
                  <p style={{ color: 'rgba(245, 158, 11, 0.8)', fontSize: '13px', margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp style={{ width: '14px', height: '14px' }} />
                    {Math.abs(data.incidentsTrend)}% réduction
                  </p>
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  padding: '16px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }} className="pulse-animation">
                  <AlertTriangle style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
                </div>
              </div>
            </div>

            {/* Économies */}
            <div 
              style={{
                ...premiumStyles.kpiCard,
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(126, 34, 206, 0.15) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, premiumStyles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
              }}
            >
              <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ color: 'rgba(147, 51, 234, 0.9)', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Économies
                  </p>
                  <p style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 4px 0', lineHeight: 1 }}>
                    {(data.costSavings / 1000).toFixed(0)}K$
                  </p>
                  <p style={{ color: 'rgba(147, 51, 234, 0.8)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                    Prévention accidents
                  </p>
                </div>
                <div style={{
                  background: 'rgba(147, 51, 234, 0.2)',
                  padding: '16px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }} className="pulse-animation">
                  <Target style={{ width: '32px', height: '32px', color: '#9333ea' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Alertes Critiques Premium */}
          <div 
            className="slide-in-up"
            style={{
              ...premiumStyles.glassCard,
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              padding: '24px',
              animationDelay: '0.2s'
            }}
          >
            <h2 style={{
              ...premiumStyles.heading,
              fontSize: '24px',
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Bell style={{ width: '24px', height: '24px', color: '#ef4444' }} className="pulse-animation" />
              Alertes Prioritaires
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                border: '1px solid',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'rgba(239, 68, 68, 0.9)', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>AST En Retard</h3>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>{data.astOverdue}</p>
                <p style={{ color: 'rgba(239, 68, 68, 0.8)', fontSize: '12px', margin: 0 }}>Action requise immédiate</p>
              </div>
              
              <div style={{
                background: 'rgba(249, 115, 22, 0.15)',
                borderColor: 'rgba(249, 115, 22, 0.3)',
                border: '1px solid',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'rgba(249, 115, 22, 0.9)', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Certifications Expirantes</h3>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>{data.certificationExpiring}</p>
                <p style={{ color: 'rgba(249, 115, 22, 0.8)', fontSize: '12px', margin: 0 }}>Dans les 30 prochains jours</p>
              </div>
              
              <div style={{
                background: 'rgba(234, 179, 8, 0.15)',
                borderColor: 'rgba(234, 179, 8, 0.3)',
                border: '1px solid',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'rgba(234, 179, 8, 0.9)', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Renouvellements AST</h3>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>{data.upcomingRenewals}</p>
                <p style={{ color: 'rgba(234, 179, 8, 0.8)', fontSize: '12px', margin: 0 }}>Planification requise</p>
              </div>
            </div>
          </div>

          {/* Sections principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
            
            {/* AST Récents */}
            <div 
              className="slide-in-up"
              style={{ ...premiumStyles.glassCard, padding: '24px', animationDelay: '0.3s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ ...premiumStyles.heading, fontSize: '20px', margin: 0 }}>AST Récents</h2>
                <Link href={`/${tenant.subdomain}/ast`} style={{
                  color: '#f59e0b',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d97706'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}
                >
                  Voir tout <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentAST.map((ast, index) => (
                  <div key={ast.id} style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>{ast.id}</h3>
                        <p style={{ color: '#e2e8f0', fontSize: '14px', margin: '0 0 4px 0' }}>{ast.project}</p>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{ast.client} • {ast.date}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          ...(ast.status === 'completed' 
                            ? { background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }
                            : ast.status === 'pending' 
                            ? { background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }
                            : { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' })
                        }}>
                          {ast.status === 'completed' ? 'Complété' :
                           ast.status === 'pending' ? 'En cours' : 'En retard'}
                        </span>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: ast.risk === 'critical' ? '#ef4444' :
                                     ast.risk === 'high' ? '#f97316' :
                                     ast.risk === 'medium' ? '#eab308' : '#22c55e'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passé Proche */}
            <div 
              className="slide-in-up"
              style={{ ...premiumStyles.glassCard, padding: '24px', animationDelay: '0.4s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ ...premiumStyles.heading, fontSize: '20px', margin: 0 }}>Passé Proche Récents</h2>
                <Link href={`/${tenant.subdomain}/near-miss`} style={{
                  color: '#f59e0b',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d97706'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}
                >
                  Voir tout <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {nearMissEvents.map((event) => (
                  <div key={event.id} style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>{event.id}</h3>
                        <p style={{ color: '#e2e8f0', fontSize: '14px', margin: '0 0 4px 0' }}>{event.description}</p>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{event.date}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          ...(event.severity === 'high' 
                            ? { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
                            : event.severity === 'medium' 
                            ? { background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }
                            : { background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' })
                        }}>
                          {event.severity === 'high' ? 'Élevé' :
                           event.severity === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          ...(event.status === 'resolved' 
                            ? { background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }
                            : { background: 'rgba(249, 115, 22, 0.2)', color: '#f97316' })
                        }}>
                          {event.status === 'resolved' ? 'Résolu' : 'En cours'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Rapides Premium */}
          <div 
            className="slide-in-up"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              animationDelay: '0.5s' 
            }}
          >
            {[
              { href: `/${tenant.subdomain}/ast/nouveau`, icon: FileText, title: 'Nouveau AST', desc: 'Créer analyse', color: '#3b82f6' },
              { href: `/${tenant.subdomain}/reports`, icon: BarChart3, title: 'Rapports', desc: 'Analytics', color: '#9333ea' },
              { href: `/${tenant.subdomain}/team`, icon: Users, title: 'Équipe', desc: 'Gestion', color: '#22c55e' },
              { href: `/${tenant.subdomain}/settings`, icon: Shield, title: 'Paramètres', desc: 'Configuration', color: '#f59e0b' }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    ...premiumStyles.glassCard,
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px ${action.color}40`;
                    e.currentTarget.style.borderColor = `${action.color}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 16px auto',
                      background: `${action.color}20`,
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)'
                    }} className="float-animation">
                      <Icon style={{ width: '32px', height: '32px', color: action.color }} />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {action.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                      {action.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Premium */}
        <footer style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(100, 116, 139, 0.2)',
          marginTop: '64px'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                🏛️ Conforme CNESST • CSA Z1000 • C-Secur360 © 2024
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#94a3b8' }}>
                <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-CA')}</span>
                <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} className="pulse-animation" />
                  Système opérationnel
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
