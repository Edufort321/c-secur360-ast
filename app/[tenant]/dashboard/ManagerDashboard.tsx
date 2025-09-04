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
  Play,
  Archive,
  FolderOpen,
  History,
  Bookmark,
  Database,
  ChevronDown,
  Camera,
  Timer,
  PieChart,
  LineChart
} from 'lucide-react'
import PWAInstaller from '../../../components/pwa/PWAInstaller'
import UniversalLayout from '../../../components/layout/UniversalLayout'
import DashboardSidebar from '../../../components/layout/DashboardSidebar'
import { useTheme } from '../../../components/layout/UniversalLayout'

interface DashboardData {
  // KPI Fonctionnels
  totalAST: number
  astThisMonth: number
  astCompleted: number
  astMonthly: number[]
  
  incidents: number
  nearMiss: number
  incidentsTrend: number
  incidentsByType: { type: string; count: number; color: string }[]
  
  hoursWorked: number
  safeHours: number
  safetyRate: number
  
  photosCount: number
  photosThisWeek: number
  
  // Données graphiques
  monthlyData: { month: string; ast: number; incidents: number; safety: number }[]
  performanceTrend: number[]
}

interface Tenant {
  id: string
  subdomain: string
  companyName: string
}

// Données fonctionnelles réalistes
const getFunctionalData = (isDemo: boolean): DashboardData => {
  if (isDemo) {
    // Données simulées pour démo
    return {
      totalAST: 347,
      astThisMonth: 28,
      astCompleted: 325,
      astMonthly: [15, 22, 28, 31, 25, 29, 28],
      
      incidents: 2,
      nearMiss: 8,
      incidentsTrend: -25,
      incidentsByType: [
        { type: 'Électrique', count: 3, color: '#ef4444' },
        { type: 'Chute', count: 2, color: '#f97316' },
        { type: 'Équipement', count: 2, color: '#eab308' },
        { type: 'Ergonomique', count: 1, color: '#22c55e' }
      ],
      
      hoursWorked: 12480,
      safeHours: 12456,
      safetyRate: 99.8,
      
      photosCount: 156,
      photosThisWeek: 12,
      
      monthlyData: [
        { month: 'Jan', ast: 15, incidents: 3, safety: 98.2 },
        { month: 'Fév', ast: 22, incidents: 2, safety: 98.8 },
        { month: 'Mar', ast: 28, incidents: 1, safety: 99.1 },
        { month: 'Avr', ast: 31, incidents: 2, safety: 98.9 },
        { month: 'Mai', ast: 25, incidents: 1, safety: 99.3 },
        { month: 'Jun', ast: 29, incidents: 0, safety: 99.8 },
        { month: 'Jul', ast: 28, incidents: 1, safety: 99.5 }
      ],
      performanceTrend: [95, 96, 97, 98, 97, 99, 98, 99, 100]
    }
  } else {
    // Données réelles client (à connecter à la DB)
    return {
      totalAST: 89,
      astThisMonth: 12,
      astCompleted: 84,
      astMonthly: [8, 12, 15, 11, 9, 14, 12],
      
      incidents: 0,
      nearMiss: 3,
      incidentsTrend: -100,
      incidentsByType: [
        { type: 'Électrique', count: 1, color: '#ef4444' },
        { type: 'Équipement', count: 2, color: '#eab308' }
      ],
      
      hoursWorked: 3240,
      safeHours: 3240,
      safetyRate: 100,
      
      photosCount: 67,
      photosThisWeek: 8,
      
      monthlyData: [
        { month: 'Jan', ast: 8, incidents: 1, safety: 99.1 },
        { month: 'Fév', ast: 12, incidents: 0, safety: 100 },
        { month: 'Mar', ast: 15, incidents: 0, safety: 100 },
        { month: 'Avr', ast: 11, incidents: 0, safety: 100 },
        { month: 'Mai', ast: 9, incidents: 1, safety: 99.2 },
        { month: 'Jun', ast: 14, incidents: 0, safety: 100 },
        { month: 'Jul', ast: 12, incidents: 0, safety: 100 }
      ],
      performanceTrend: [98, 99, 100, 100, 99, 100, 100, 100, 100]
    }
  }
}

// Composant Graphique Simple
const SimpleChart = ({ data, type = 'line' }: { data: any[], type?: 'line' | 'bar' | 'pie' }) => {
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    let currentAngle = 0
    
    return (
      <div style={{ width: '200px', height: '200px', position: 'relative', margin: '0 auto' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100
            const angle = (percentage / 100) * 360
            const startAngle = currentAngle
            currentAngle += angle
            
            const startX = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180)
            const startY = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180)
            const endX = 100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180)
            const endY = 100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180)
            
            const largeArcFlag = angle > 180 ? 1 : 0
            const pathData = `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                opacity={0.8}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{total}</div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Total</div>
        </div>
      </div>
    )
  }
  
  if (type === 'line') {
    const maxValue = Math.max(...data.map(d => d.ast))
    const width = 300
    const height = 150
    const padding = 20
    
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Ligne de performance */}
        <polyline
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          points={data.map((d, i) => 
            `${padding + (i * (width - 2 * padding) / (data.length - 1))},${height - padding - (d.ast / maxValue) * (height - 2 * padding)}`
          ).join(' ')}
        />
        {/* Points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={padding + (i * (width - 2 * padding) / (data.length - 1))}
            cy={height - padding - (d.ast / maxValue) * (height - 2 * padding)}
            r="4"
            fill="#22c55e"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    )
  }
  
  return <div>Graphique en développement</div>
}

export default function ManagerDashboard({ 
  tenant = { id: '1', subdomain: 'demo', companyName: 'Demo Company' },
  user = { name: 'Gestionnaire', email: 'manager@example.com', role: 'Gestionnaire SST' }
}: { 
  tenant?: Tenant;
  user?: { name: string; email: string; role: string; avatar?: string }
}) {
  const [timeFilter, setTimeFilter] = useState('30d')
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showArchiveMenu, setShowArchiveMenu] = useState(false)

  // Translations for bilingual support
  const translations = {
    fr: {
      dashboard: 'Tableau de bord',
      managerDashboard: 'Dashboard Gestionnaire SST',
      systemOperational: 'Système opérationnel',
      demoVersion: 'VERSION DÉMO',
      dashboardPro: 'Dashboard Pro',
      dashboardProDesc: 'Dashboard avec données réelles',
      administration: 'Administration',
      adminDesc: 'Gestion facturation & clients',
      multiSites: 'Multi-Sites',
      multiSitesDesc: 'Gestion emplacements multiples',
      newAST: 'Nouveau AST',
      newASTDesc: 'Créer une analyse complète',
      accidentReports: 'Déclarations d\'Accidents',
      accidentReportsDesc: 'Système multi-provincial conforme',
      permitManagement: 'Gestion des Permis',
      permitDesc: 'Permis de travail et autorisations',
      improvement: 'Amélioration',
      improvementDesc: 'Suggérer une amélioration',
      astCompleted: 'AST Complétés',
      monthlyAST: 'AST Mensuels',
      incidents: 'Incidents',
      safeHours: 'Heures Sécuritaires',
      performanceGraphs: 'Graphiques de Performance',
      analyticsReports: 'Rapports Analytics',
      astPhotos: 'Photos AST',
      archives: 'Archives',
      lastUpdate: 'Dernière mise à jour',
      executiveReport: 'Rapport Exécutif',
      priority: 'Priorité',
      start: 'Commencer',
      thisMonth: 'ce mois',
      reduction: 'réduction',
      increase: 'augmentation',
      objective: 'Objectif',
      safetyRate: 'taux sécurité',
      simulatedData: 'Données simulées',
      astEvolution: 'Évolution AST',
      incidentTypes: 'Types d\'Incidents',
      photoDocumentation: 'Photos Documentation',
      totalPhotos: 'Photos totales',
      thisWeek: 'cette semaine',
      photosPerAST: 'photos/AST',
      detailedGraphics: 'Graphiques détaillés',
      documentationGallery: 'Galerie documentation',
      dataHistory: 'Historique des données'
    },
    en: {
      dashboard: 'Dashboard',
      managerDashboard: 'HSE Manager Dashboard',
      systemOperational: 'System operational',
      demoVersion: 'DEMO VERSION',
      dashboardPro: 'Dashboard Pro',
      dashboardProDesc: 'Dashboard with real data',
      administration: 'Administration',
      adminDesc: 'Billing & client management',
      multiSites: 'Multi-Sites',
      multiSitesDesc: 'Multiple locations management',
      newAST: 'New JSA',
      newASTDesc: 'Create complete analysis',
      accidentReports: 'Incident Reports',
      accidentReportsDesc: 'Multi-provincial compliant system',
      permitManagement: 'Permit Management',
      permitDesc: 'Work permits and authorizations',
      improvement: 'Improvement',
      improvementDesc: 'Suggest improvement',
      astCompleted: 'JSA Completed',
      monthlyAST: 'Monthly JSA',
      incidents: 'Incidents',
      safeHours: 'Safe Hours',
      performanceGraphs: 'Performance Graphs',
      analyticsReports: 'Analytics Reports',
      astPhotos: 'JSA Photos',
      archives: 'Archives',
      lastUpdate: 'Last update',
      executiveReport: 'Executive Report',
      priority: 'Priority',
      start: 'Start',
      thisMonth: 'this month',
      reduction: 'reduction',
      increase: 'increase',
      objective: 'Objective',
      safetyRate: 'safety rate',
      simulatedData: 'Simulated data',
      astEvolution: 'JSA Evolution',
      incidentTypes: 'Incident Types',
      photoDocumentation: 'Photo Documentation',
      totalPhotos: 'Total photos',
      thisWeek: 'this week',
      photosPerAST: 'photos/JSA',
      detailedGraphics: 'Detailed graphics',
      documentationGallery: 'Documentation gallery',
      dataHistory: 'Data history'
    }
  }
  
  const isDemo = tenant.subdomain === 'demo'
  const data = getFunctionalData(isDemo)

  // Animation d'entrée
  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Mock user pour démo
  const mockUser = {
    name: user?.name || 'Gestionnaire Demo',
    email: user?.email || 'gestionnaire@demo.com', 
    role: user?.role || 'Gestionnaire SST',
    avatar: user?.avatar
  }

  // Detect language from the layout context or default to French
  let currentLanguage: 'fr' | 'en' = 'fr'
  try {
    const themeContext = useTheme()
    currentLanguage = themeContext?.language || 'fr'
  } catch {
    // Fallback if not in theme context
    currentLanguage = 'fr'
  }

  const t = translations[currentLanguage]

  return (
    <UniversalLayout
      tenant={tenant.subdomain}
      user={mockUser}
      notifications={3}
      isAdmin={false}
      sidebar={<DashboardSidebar tenant={tenant.subdomain} userRole="manager" />}
    >
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
              box-shadow: 0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15);
            }
            50% { 
              box-shadow: 0 0 70px rgba(245, 158, 11, 0.8), inset 0 0 40px rgba(245, 158, 11, 0.25);
            }
          }
          
          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          
          @keyframes progressFill {
            from { width: 0%; }
            to { width: var(--progress, 0%); }
          }
          
          @keyframes logoGlow {
            0%, 100% { 
              filter: brightness(1.2) contrast(1.1) drop-shadow(0 0 15px rgba(245, 158, 11, 0.4));
            }
            50% { 
              filter: brightness(1.5) contrast(1.3) drop-shadow(0 0 25px rgba(245, 158, 11, 0.7));
            }
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
          
          .logo-glow {
            animation: logoGlow 3s ease-in-out infinite;
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
          
          .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            min-width: 280px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            overflow: hidden;
          }
          
          .dropdown-item {
            padding: 16px 20px;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.2s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .dropdown-item:hover {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            transform: translateX(8px);
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
            .dashboard-container { padding: 12px; }
            
            .mobile-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            
            .mobile-padding {
              padding: 16px !important;
            }
            
            .mobile-text {
              font-size: 14px !important;
            }
            
            .mobile-title {
              font-size: 24px !important;
            }
            
            .mobile-kpi {
              font-size: 28px !important;
            }
          }
          
          @media (max-width: 480px) {
            .dashboard-container { padding: 8px; }
            
            .ultra-mobile-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            
            .ultra-mobile-padding {
              padding: 12px !important;
            }
          }
          
          @media (min-width: 769px) and (max-width: 1024px) {
            .tablet-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (min-width: 1025px) {
            .desktop-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
            
            .desktop-kpi-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
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


                  {/* Container principal */}
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '20px 20px 32px 20px', // Reduced top padding since UniversalLayout handles header spacing
          position: 'relative',
          zIndex: 5
        }}>

          {/* Actions Rapides EN HAUT - Responsive */}
          <div 
            className="slide-in-up mobile-grid tablet-grid desktop-grid"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '48px',
              marginTop: '8px' // Extra space to ensure no header overlap
            }}
          >
            {[
              { 
                href: `/${tenant.subdomain}/new-dashboard`, 
                icon: BarChart3, 
                title: t.dashboardPro, 
                desc: t.dashboardProDesc, 
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                priority: true
              },
              { 
                href: `/${tenant.subdomain}/admin`, 
                icon: Database, 
                title: t.administration, 
                desc: t.adminDesc, 
                color: '#8b5cf6',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                priority: true
              },
              { 
                href: `/${tenant.subdomain}/sites`, 
                icon: MapPin, 
                title: t.multiSites, 
                desc: t.multiSitesDesc, 
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                priority: true
              },
              { 
                href: `/${tenant.subdomain}/ast/nouveau`, 
                icon: FileText, 
                title: t.newAST, 
                desc: t.newASTDesc, 
                color: '#3b82f6',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                priority: true
              },
              { 
                href: `/${tenant.subdomain}/accidents`, 
                icon: AlertTriangle, 
                title: t.accidentReports, 
                desc: t.accidentReportsDesc, 
                color: '#ef4444',
                gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                priority: true
              },
              { 
                href: `/${tenant.subdomain}/permits`, 
                icon: Shield, 
                title: t.permitManagement, 
                desc: t.permitDesc, 
                color: '#8b5cf6',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                priority: true
              },
              { 
                href: `/${tenant.subdomain}/improvements/nouveau`, 
                icon: Target, 
                title: t.improvement, 
                desc: t.improvementDesc, 
                color: '#22c55e',
                gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                priority: true
              }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href} style={{ textDecoration: 'none' }}>
                  <div 
                    className="glass-effect card-hover mobile-padding"
                    style={{
                      padding: '32px 24px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      border: `2px solid rgba(${
                        action.color === '#3b82f6' ? '59, 130, 246' : 
                        action.color === '#f97316' ? '249, 115, 22' : 
                        action.color === '#ef4444' ? '239, 68, 68' :
                        action.color === '#8b5cf6' ? '139, 92, 246' :
                        action.color === '#22c55e' ? '34, 197, 94' : '34, 197, 94'
                      }, 0.4)`,
                      minHeight: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {/* Barre colorée en haut */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: action.gradient,
                      opacity: 0.9
                    }} />
                    
                    {/* Badge priorité */}
                    <div className="mobile-text" style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: action.gradient,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {t.priority}
                    </div>
                    
                    {/* Icône principale */}
                    <div 
                      className="float-animation"
                      style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto 16px auto',
                        background: action.gradient,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 32px rgba(${action.color === '#3b82f6' ? '59, 130, 246' : action.color === '#f97316' ? '249, 115, 22' : '34, 197, 94'}, 0.4)`,
                        position: 'relative'
                      }}
                    >
                      <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
                    </div>
                    
                    {/* Titre */}
                    <h3 className="text-gradient mobile-text" style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      margin: '0 0 8px 0',
                      textAlign: 'center'
                    }}>
                      {action.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="mobile-text" style={{ 
                      color: '#94a3b8', 
                      fontSize: '13px', 
                      margin: '0 0 16px 0',
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: 1.4
                    }}>
                      {action.desc}
                    </p>
                    
                    {/* Call to action */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: action.color,
                      fontSize: '14px',
                      fontWeight: '600',
                      background: `rgba(${action.color === '#3b82f6' ? '59, 130, 246' : action.color === '#f97316' ? '249, 115, 22' : '34, 197, 94'}, 0.1)`,
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: `1px solid rgba(${action.color === '#3b82f6' ? '59, 130, 246' : action.color === '#f97316' ? '249, 115, 22' : '34, 197, 94'}, 0.2)`
                    }}>
                      <Play style={{ width: '12px', height: '12px' }} />
                      {t.start}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* KPI Cards Fonctionnels */}
          <div 
            className="slide-in-up" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px',
              marginBottom: '40px'
            }}
          >
            
            {/* AST Complétés - FONCTIONNEL */}
            <div className="glass-effect card-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
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
                    fontSize: '12px', 
                    fontWeight: '600', 
                    margin: '0 0 8px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    {t.astCompleted}
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    margin: '0 0 6px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.astCompleted.toLocaleString()}
                  </p>
                  <p style={{ 
                    color: 'rgba(34, 197, 94, 0.8)', 
                    fontSize: '12px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TrendingUp style={{ width: '12px', height: '12px' }} />
                    +{data.astThisMonth} {t.thisMonth}
                  </p>
                  <div style={{
                    marginTop: '10px',
                    height: '3px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                      borderRadius: '2px',
                      '--progress': `${Math.min((data.astCompleted / data.totalAST) * 100, 100)}%`
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '16px',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <CheckCircle style={{ width: '28px', height: '28px', color: '#22c55e' }} />
                </div>
              </div>
            </div>

            {/* AST Mensuels - REMPLACE Conformité */}
            <div className="glass-effect card-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
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
                    fontSize: '12px', 
                    fontWeight: '600', 
                    margin: '0 0 8px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    {t.monthlyAST}
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    margin: '0 0 6px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.astThisMonth}
                  </p>
                  <p style={{ 
                    color: 'rgba(59, 130, 246, 0.8)', 
                    fontSize: '12px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {t.objective}: {Math.round(data.totalAST / 12)}/{currentLanguage === 'fr' ? 'mois' : 'month'}
                  </p>
                  <div style={{
                    marginTop: '10px',
                    height: '3px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      borderRadius: '2px',
                      '--progress': `${Math.min((data.astThisMonth / (data.totalAST / 12)) * 100, 100)}%`
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    padding: '16px',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Calendar style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
                </div>
              </div>
            </div>

            {/* Incidents - FONCTIONNEL */}
            <div className="glass-effect card-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
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
                    fontSize: '12px', 
                    fontWeight: '600', 
                    margin: '0 0 8px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    {t.incidents}
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    margin: '0 0 6px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.incidents}
                  </p>
                  <p style={{ 
                    color: 'rgba(245, 158, 11, 0.8)', 
                    fontSize: '12px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TrendingUp style={{ width: '12px', height: '12px' }} />
                    {Math.abs(data.incidentsTrend)}% {data.incidentsTrend < 0 ? t.reduction : t.increase}
                  </p>
                  <div style={{
                    marginTop: '10px',
                    height: '3px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: data.incidents === 0 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: '2px',
                      '--progress': `${data.incidents === 0 ? 100 : Math.max(100 - (data.incidents * 20), 20)}%`
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: data.incidents === 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    padding: '16px',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${data.incidents === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}
                >
                  {data.incidents === 0 ? 
                    <CheckCircle style={{ width: '28px', height: '28px', color: '#22c55e' }} /> :
                    <AlertTriangle style={{ width: '28px', height: '28px', color: '#f59e0b' }} />
                  }
                </div>
              </div>
            </div>

            {/* Heures Sécuritaires - REMPLACE Économies */}
            <div className="glass-effect card-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
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
                    fontSize: '12px', 
                    fontWeight: '600', 
                    margin: '0 0 8px 0', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                  }}>
                    {t.safeHours}
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    margin: '0 0 6px 0', 
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {(data.safeHours / 1000).toFixed(1)}K
                  </p>
                  <p style={{ 
                    color: 'rgba(147, 51, 234, 0.8)', 
                    fontSize: '12px', 
                    margin: 0, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Timer style={{ width: '12px', height: '12px' }} />
                    {data.safetyRate}% {t.safetyRate}
                  </p>
                  <div style={{
                    marginTop: '10px',
                    height: '3px',
                    background: 'rgba(147, 51, 234, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div className="progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #9333ea, #7c3aed)',
                      borderRadius: '2px',
                      '--progress': `${data.safetyRate}%`
                    } as any} />
                  </div>
                </div>
                <div 
                  className="pulse-animation"
                  style={{
                    background: 'rgba(147, 51, 234, 0.2)',
                    padding: '16px',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <Timer style={{ width: '28px', height: '28px', color: '#9333ea' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques de Performance - REMPLACE Alertes Prioritaires */}
          <div 
            className="glass-effect slide-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
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
              background: 'linear-gradient(90deg, #3b82f6, #9333ea, #22c55e)',
              opacity: 0.6
            }} />
            
            <h2 className="text-gradient" style={{
              fontSize: '28px',
              margin: '0 0 32px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontWeight: '700'
            }}>
              <BarChart3 className="pulse-animation" style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
              {t.performanceGraphs}
              {isDemo && (
                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {t.simulatedData}
                </span>
              )}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '32px' 
            }}>
              
              {/* Évolution AST par mois */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ 
                  color: '#3b82f6', 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <LineChart style={{ width: '20px', height: '20px' }} />
                  {t.astEvolution}
                </h3>
                <SimpleChart data={data.monthlyData} type="line" />
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>Mai</span>
                  <span>Jul</span>
                </div>
              </div>

              {/* Types d'incidents (Camembert) */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '20px',
                padding: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ 
                  color: '#f59e0b', 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <PieChart style={{ width: '20px', height: '20px' }} />
                  {t.incidentTypes}
                </h3>
                <SimpleChart data={data.incidentsByType} type="pie" />
                <div style={{ marginTop: '16px' }}>
                  {data.incidentsByType.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '8px',
                      fontSize: '12px'
                    }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: item.color 
                      }} />
                      <span style={{ color: 'white', flex: 1 }}>{item.type}</span>
                      <span style={{ color: '#94a3b8' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos AST */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '20px',
                padding: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ 
                  color: '#22c55e', 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Camera style={{ width: '20px', height: '20px' }} />
                  {t.photoDocumentation}
                </h3>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    color: 'white', 
                    fontSize: '48px', 
                    fontWeight: '900', 
                    margin: '20px 0 8px 0',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {data.photosCount}
                  </div>
                  <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>
                    {t.totalPhotos}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
                    +{data.photosThisWeek} {t.thisWeek}
                  </div>
                  
                  <div style={{
                    marginTop: '20px',
                    height: '6px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                      borderRadius: '3px',
                      width: `${Math.min((data.photosCount / (data.astCompleted * 3)) * 100, 100)}%`,
                      transition: 'width 2s ease'
                    }} />
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '8px' }}>
                    {t.objective}: 3 {t.photosPerAST}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Secondaires */}
          <div 
            className="slide-in-up"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '40px'
            }}
          >
            {[
              { 
                href: `/${tenant.subdomain}/reports`, 
                icon: BarChart3, 
                title: t.analyticsReports, 
                desc: t.detailedGraphics, 
                color: '#9333ea',
                gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
              },
              { 
                href: `/${tenant.subdomain}/photos`, 
                icon: Camera, 
                title: t.astPhotos, 
                desc: t.documentationGallery, 
                color: '#22c55e',
                gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              },
              { 
                href: `/${tenant.subdomain}/archives`, 
                icon: Archive, 
                title: t.archives, 
                desc: t.dataHistory, 
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
                      padding: '20px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      border: `1px solid rgba(${action.color === '#9333ea' ? '147, 51, 234' : action.color === '#22c55e' ? '34, 197, 94' : '245, 158, 11'}, 0.3)`,
                      minHeight: '140px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: action.gradient,
                      opacity: 0.8
                    }} />
                    
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 12px auto',
                        background: action.gradient,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 6px 20px rgba(${action.color === '#9333ea' ? '147, 51, 234' : action.color === '#22c55e' ? '34, 197, 94' : '245, 158, 11'}, 0.3)`
                      }}
                    >
                      <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
                    </div>
                    
                    <h3 className="text-gradient" style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      margin: '0 0 6px 0' 
                    }}>
                      {action.title}
                    </h3>
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: '12px', 
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {action.desc}
                    </p>
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
                  {isDemo ? 'Plateforme de démonstration avec données simulées' : 'Plateforme certifiée pour la sécurité au travail'}
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
                <span>{t.lastUpdate}: {new Date().toLocaleDateString(currentLanguage === 'fr' ? 'fr-CA' : 'en-CA')}</span>
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
                  {t.systemOperational}
                </div>
                {isDemo && (
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                    {t.demoVersion}
                  </span>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* PWA Installer Component */}
      <PWAInstaller 
        clientName={tenant.subdomain}
        customDomain={tenant.subdomain !== 'demo' ? `${tenant.subdomain}.csecur360.ca` : undefined}
      />
    </UniversalLayout>
  )
}
