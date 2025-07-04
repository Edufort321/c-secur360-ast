'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
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
  Zap,
  Play
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

// Données simulées premium
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
  { id: 'AST-2024-089', project: 'Maintenance Turbine #3', client: 'Hydro-Québec', date: '2024-01-15', status: 'completed', risk: 'medium', progress: 100 },
  { id: 'AST-2024-088', project: 'Réparation Transformateur', client: 'Énergir', date: '2024-01-14', status: 'pending', risk: 'high', progress: 75 },
  { id: 'AST-2024-087', project: 'Installation Câblage', client: 'Bell Canada', date: '2024-01-14', status: 'overdue', risk: 'low', progress: 45 },
  { id: 'AST-2024-086', project: 'Entretien Génératrice', client: 'Alstom', date: '2024-01-13', status: 'completed', risk: 'critical', progress: 100 }
]

const nearMissEvents = [
  { id: 'NM-2024-024', description: 'Quasi-contact ligne électrique', severity: 'high', date: '2024-01-15', status: 'investigating', impact: 'Critique' },
  { id: 'NM-2024-023', description: 'Chute outils depuis nacelle', severity: 'medium', date: '2024-01-14', status: 'resolved', impact: 'Modéré' },
  { id: 'NM-2024-022', description: 'Mauvais EPI détecté', severity: 'low', date: '2024-01-13', status: 'resolved', impact: 'Faible' }
]

const improvements = [
  { id: 'IMP-024', title: 'Procédure consignation améliorée', impact: 'Réduction risque 25%', cost: 15000, status: 'implemented', roi: 185 },
  { id: 'IMP-023', title: 'Formation VR dangers électriques', impact: 'Engagement +40%', cost: 25000, status: 'planned', roi: 240 },
  { id: 'IMP-022', title: 'App mobile check EPI', impact: 'Conformité +15%', cost: 8000, status: 'development', roi: 120 }
]

export default function ManagerDashboard({ tenant = { id: '1', subdomain: 'demo', companyName: 'Demo Company' } }: { tenant?: Tenant }) {
  const [timeFilter, setTimeFilter] = useState('30d')
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const data = mockData

  // Animation d'entrée
  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* CSS Animations Global */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0%, 100% { 
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
              background-size: 400% 400%;
              background-position: 0% 50%;
            }
            50% { 
              background-position: 100% 50%;
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          @keyframes slideInUp {
            from { 
              opacity: 0; 
              transform: translateY(60px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes slideInRight {
            from { 
              opacity: 0; 
              transform: translateX(-60px); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0); 
            }
          }
          
          @keyframes glow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
            }
            50% { 
              box-shadow: 0 0 40px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.3);
            }
          }
          
          @keyframes progressFill {
            from { width: 0%; }
            to { width: var(--progress, 0%); }
          }
          
          .dashboard-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
          }
          
          .float-animation { 
            animation: float 6s ease-in-out infinite; 
          }
          
          .pulse-animation { 
            animation: pulse 3s ease-in-out infinite; 
          }
          
          .slide-in-up { 
            animation: slideInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          }
          
          .slide-in-right { 
            animation: slideInRight 0.6s ease-out; 
          }
          
          .glow-effect {
            animation: glow 4s ease-in-out infinite;
          }
          
          .card-hover {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
          }
          
          .card-hover:hover {
            transform: translateY(-12px) scale(1.03);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(251, 191, 36, 0.3);
          }
          
          .progress-bar {
            animation: progressFill 2s ease-out;
          }
          
          .glass-effect {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
          }
          
          .text-gradient {
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .btn-premium {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
            background-size: 200% 200%;
            border: none;
            border-radius: 16px;
            padding: 14px 28px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
          }
          
          .btn-premium:hover {
            transform: translateY(-2px);
            background-position: 100% 0;
            box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
          }
          
          .btn-premium:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          .btn-premium:hover:before {
            left: 100%;
          }
          
          .status-badge {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          
          .status-completed {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
          }
          
          .status-pending {
            background: rgba(234, 179, 8, 0.2);
            color: #eab308;
            border: 1px solid rgba(234, 179, 8, 0.3);
          }
          
          .status-overdue {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          
          .interactive-bg {
            position: absolute;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
            pointer-events: none;
            transition: all 0.3s ease;
            z-index: 0;
          }
          
          @media (max-width: 768px) {
            .slide-in-up { animation-delay: 0.1s; }
            .dashboard-container { padding: 16px; }
          }
        `
      }} />

      <div className="dashboard-container">
        {/* Fond interactif qui suit la souris */}
        <div 
          className="interactive-bg"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
        />

        {/* Pattern overlay pour texture */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Header Ultra Premium */}
        <header style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(0, 0, 0, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 50px rgba(251, 191, 36, 0.1)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '24px 20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.8s ease'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              
              {/* Logo et titre avec animation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div 
                  className="float-animation glow-effect"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '16px',
                    borderRadius: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <img 
                      src="/c-secur360-logo.png" 
                      alt="C-Secur360"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <BarChart3 style={{ 
                      width: '32px', 
                      height: '32px', 
                      display: 'none'
                    }} />
                  </div>
                </div>
                
                <div className="slide-in-right">
                  <h1 className="text-gradient" style={{
                    fontSize: '32px',
                    margin: 0,
                    lineHeight: 1.2,
                    fontWeight: '800',
                    letterSpacing: '-0.025em'
                  }}>
                    🛡️ C-Secur360
                  </h1>
                  <p style={{
                    color: 'rgba(251, 191, 36, 0.9)',
                    fontSize: '16px',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Dashboard Gestionnaire SST • {tenant.companyName}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#22c55e'
                    }} className="pulse-animation" />
                    <span style={{
                      color: '#22c55e',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Système opérationnel
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Contrôles premium */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                flexWrap: 'wrap'
              }}>
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
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                    e.target.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">3 derniers mois</option>
                  <option value="1y">Dernière année</option>
                </select>
                
                <button className="btn-premium">
                  <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Rapport Exécutif
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Container principal */}
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '32px 20px', 
          position: 'relative',
          zIndex: 5
        }}>
          
          {/* KPI Cards Ultra Premium */}
          <div 
            className="slide-in-up" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}
          >
            
            {/* AST Complétés */}
            <div className="glass-effect card-hover" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-50%', 
                right: '-50%', 
                width: '200%', 
                height: '200%', 
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)', 
                pointerEvents: 'none' 
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: 'rgba(34, 197, 94, 0.9)', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    margin: '0 0 12px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    AST Complétés
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '42px', 
                    fontWeight: '900', 
                    margin: '0 0 8px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.astCompleted.toLocaleString()}
                  </p>
                  <p style={{ 
                    color: 'rgba(34, 197, 94, 0.8)', 
                    fontSize: '14px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <TrendingUp style={{ width: '14px', height: '14px' }} />
                    +{data.astThisMonth} ce mois
                  </p>
                  <div style={{
                    marginTop: '12px',
                    height: '4px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                      borderRadius: '2px',
                      '--progress': '93%'
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '20px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <CheckCircle style={{ width: '36px', height: '36px', color: '#22c55e' }} />
                </div>
              </div>
            </div>

            {/* Conformité */}
            <div className="glass-effect card-hover" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-50%', 
                right: '-50%', 
                width: '200%', 
                height: '200%', 
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', 
                pointerEvents: 'none' 
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: 'rgba(59, 130, 246, 0.9)', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    margin: '0 0 12px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    Conformité CNESST
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '42px', 
                    fontWeight: '900', 
                    margin: '0 0 8px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.complianceRate}%
                  </p>
                  <p style={{ 
                    color: 'rgba(59, 130, 246, 0.8)', 
                    fontSize: '14px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Award style={{ width: '14px', height: '14px' }} />
                    Standard Excellence
                  </p>
                  <div style={{
                    marginTop: '12px',
                    height: '4px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      borderRadius: '2px',
                      '--progress': '94%'
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    padding: '20px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Shield style={{ width: '36px', height: '36px', color: '#3b82f6' }} />
                </div>
              </div>
            </div>

            {/* Incidents Évités */}
            <div className="glass-effect card-hover" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-50%', 
                right: '-50%', 
                width: '200%', 
                height: '200%', 
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', 
                pointerEvents: 'none' 
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: 'rgba(245, 158, 11, 0.9)', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    margin: '0 0 12px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    Incidents
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '42px', 
                    fontWeight: '900', 
                    margin: '0 0 8px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.incidents}
                  </p>
                  <p style={{ 
                    color: 'rgba(245, 158, 11, 0.8)', 
                    fontSize: '14px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <TrendingUp style={{ width: '14px', height: '14px' }} />
                    {Math.abs(data.incidentsTrend)}% réduction
                  </p>
                  <div style={{
                    marginTop: '12px',
                    height: '4px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: '2px',
                      '--progress': '85%'
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    padding: '20px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <AlertTriangle style={{ width: '36px', height: '36px', color: '#f59e0b' }} />
                </div>
              </div>
            </div>

            {/* Économies Réalisées */}
            <div className="glass-effect card-hover" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-50%', 
                right: '-50%', 
                width: '200%', 
                height: '200%', 
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)', 
                pointerEvents: 'none' 
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: 'rgba(147, 51, 234, 0.9)', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    margin: '0 0 12px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    Économies Réalisées
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '42px', 
                    fontWeight: '900', 
                    margin: '0 0 8px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {(data.costSavings / 1000).toFixed(0)}K$
                  </p>
                  <p style={{ 
                    color: 'rgba(147, 51, 234, 0.8)', 
                    fontSize: '14px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Target style={{ width: '14px', height: '14px' }} />
                    ROI 240% prévention
                  </p>
                  <div style={{
                    marginTop: '12px',
                    height: '4px',
                    background: 'rgba(147, 51, 234, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #9333ea, #7c3aed)',
                      borderRadius: '2px',
                      '--progress': '78%'
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(147, 51, 234, 0.2)',
                    padding: '20px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <Target style={{ width: '36px', height: '36px', color: '#9333ea' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Alertes Critiques Ultra Premium */}
          <div 
            className="glass-effect slide-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              padding: '32px',
              marginBottom: '40px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308)',
              opacity: 0.6
            }} />
            
            <h2 className="text-gradient" style={{
              fontSize: '28px',
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontWeight: '700'
            }}>
              <Bell className="pulse-animation" style={{ width: '28px', height: '28px', color: '#ef4444' }} />
              Alertes Prioritaires
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {data.astOverdue + data.certificationExpiring} alertes
              </span>
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px' 
            }}>
              {[
                { 
                  title: 'AST En Retard', 
                  value: data.astOverdue, 
                  desc: 'Action requise immédiate', 
                  color: '#ef4444',
                  icon: Clock,
                  urgent: true
                },
                { 
                  title: 'Certifications Expirantes', 
                  value: data.certificationExpiring, 
                  desc: 'Dans les 30 prochains jours', 
                  color: '#f97316',
                  icon: Award,
                  urgent: false
                },
                { 
                  title: 'Renouvellements AST', 
                  value: data.upcomingRenewals, 
                  desc: 'Planification requise', 
                  color: '#eab308',
                  icon: Calendar,
                  urgent: false
                }
              ].map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <div 
                    key={index}
                    className="card-hover"
                    style={{
                      background: `rgba(${alert.color === '#ef4444' ? '239, 68, 68' : alert.color === '#f97316' ? '249, 115, 22' : '234, 179, 8'}, 0.15)`,
                      border: `1px solid rgba(${alert.color === '#ef4444' ? '239, 68, 68' : alert.color === '#f97316' ? '249, 115, 22' : '234, 179, 8'}, 0.3)`,
                      borderRadius: '20px',
                      padding: '24px',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {alert.urgent && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#ef4444'
                      }} className="pulse-animation" />
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        background: `rgba(${alert.color === '#ef4444' ? '239, 68, 68' : alert.color === '#f97316' ? '249, 115, 22' : '234, 179, 8'}, 0.2)`,
                        padding: '12px',
                        borderRadius: '12px'
                      }}>
                        <Icon style={{ width: '24px', height: '24px', color: alert.color }} />
                      </div>
                      <h3 style={{ 
                        color: alert.color, 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        margin: 0,
                        flex: 1
                      }}>
                        {alert.title}
                      </h3>
                    </div>
                    
                    <p style={{ 
                      color: 'white', 
                      fontSize: '32px', 
                      fontWeight: '900', 
                      margin: '0 0 8px 0',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {alert.value}
                    </p>
                    <p style={{ 
                      color: `rgba(${alert.color === '#ef4444' ? '239, 68, 68' : alert.color === '#f97316' ? '249, 115, 22' : '234, 179, 8'}, 0.8)`, 
                      fontSize: '13px', 
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {alert.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions Rapides Ultra Premium */}
          <div 
            className="slide-in-up"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}
          >
            {[
              { 
                href: `/${tenant.subdomain}/ast/nouveau`, 
                icon: FileText, 
                title: 'Nouveau AST', 
                desc: 'Créer une analyse sécuritaire', 
                color: '#3b82f6',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              },
              { 
                href: `/${tenant.subdomain}/reports`, 
                icon: BarChart3, 
                title: 'Rapports Analytics', 
                desc: 'Tableaux de bord détaillés', 
                color: '#9333ea',
                gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
              },
              { 
                href: `/${tenant.subdomain}/team`, 
                icon: Users, 
                title: 'Gestion Équipe', 
                desc: 'Personnel et formations', 
                color: '#22c55e',
                gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              },
              { 
                href: `/${tenant.subdomain}/settings`, 
                icon: Shield, 
                title: 'Configuration', 
                desc: 'Paramètres système', 
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href} style={{ textDecoration: 'none' }}>
                  <div 
                    className="glass-effect card-hover"
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      border: `1px solid rgba(${action.color === '#3b82f6' ? '59, 130, 246' : action.color === '#9333ea' ? '147, 51, 234' : action.color === '#22c55e' ? '34, 197, 94' : '245, 158, 11'}, 0.3)`
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: action.gradient,
                      opacity: 0.8
                    }} />
                    
                    <div 
                      className="float-animation"
                      style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px auto',
                        background: action.gradient,
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 10px 25px rgba(${action.color === '#3b82f6' ? '59, 130, 246' : action.color === '#9333ea' ? '147, 51, 234' : action.color === '#22c55e' ? '34, 197, 94' : '245, 158, 11'}, 0.3)`,
                        position: 'relative'
                      }}
                    >
                      <Icon style={{ width: '36px', height: '36px', color: 'white' }} />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '24px',
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }} className="shine-effect" />
                    </div>
                    
                    <h3 className="text-gradient" style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      margin: '0 0 8px 0' 
                    }}>
                      {action.title}
                    </h3>
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: '14px', 
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {action.desc}
                    </p>
                    
                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: action.color,
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      <Play style={{ width: '14px', height: '14px' }} />
                      Commencer
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Ultra Premium */}
        <footer style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(100, 116, 139, 0.2)',
          marginTop: '60px',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '32px 20px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '20px' 
            }}>
              <div>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '14px', 
                  margin: '0 0 8px 0',
                  fontWeight: '500'
                }}>
                  🏛️ Conforme CNESST • CSA Z1000 • C-Secur360 © 2024
                </p>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '12px', 
                  margin: 0 
                }}>
                  Plateforme certifiée pour la sécurité au travail
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px', 
                fontSize: '14px', 
                color: '#94a3b8',
                flexWrap: 'wrap'
              }}>
                <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-CA')}</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#22c55e'
                }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: '#22c55e' 
                  }} className="pulse-animation" />
                  Système opérationnel
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
