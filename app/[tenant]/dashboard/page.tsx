import Link from 'next/link'
import { useState } from 'react'
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
  MapPin
} from 'lucide-react'

interface DashboardData {
  // KPI Principaux
  totalAST: number
  astThisMonth: number
  astCompleted: number
  astOverdue: number
  
  // Incidents et Near Miss
  incidents: number
  nearMiss: number
  incidentsTrend: number
  
  // Compliance et Récurrence
  complianceRate: number
  overdueAnalyses: number
  upcomingRenewals: number
  
  // Équipes et Formation
  totalWorkers: number
  trainedWorkers: number
  certificationExpiring: number
  
  // Améliorations
  suggestedImprovements: number
  implementedImprovements: number
  costSavings: number
}

interface Tenant {
  id: string
  subdomain: string
  companyName: string
}

interface ManagerDashboardProps {
  tenant: Tenant
  data: DashboardData
}

// Données simulées pour la démo (en production: vient de l'API)
const mockData: DashboardData = {
  totalAST: 1247,
  astThisMonth: 89,
  astCompleted: 1156,
  astOverdue: 12,
  incidents: 3,
  nearMiss: 24,
  incidentsTrend: -15, // -15% vs mois précédent
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header Exécutif */}
      <header className="bg-gradient-to-r from-black via-slate-800 to-black border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">📊 Dashboard Gestionnaire</h1>
                <p className="text-amber-200 text-sm">Tableau de bord SST • {tenant.companyName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-slate-800 text-white border border-amber-500/30 rounded-lg px-3 py-2"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">3 derniers mois</option>
                <option value="1y">Dernière année</option>
              </select>
              
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Rapport Exécutif</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* KPI Cards Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AST Complétés */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">AST Complétés</p>
                <p className="text-white text-3xl font-bold">{data.astCompleted.toLocaleString()}</p>
                <p className="text-green-300 text-sm">+{data.astThisMonth} ce mois</p>
              </div>
              <div className="bg-green-500/30 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Taux de Conformité */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Conformité</p>
                <p className="text-white text-3xl font-bold">{data.complianceRate}%</p>
                <p className="text-blue-300 text-sm">CNESST Standard</p>
              </div>
              <div className="bg-blue-500/30 p-3 rounded-lg">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Incidents Évités */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm font-medium">Incidents</p>
                <p className="text-white text-3xl font-bold">{data.incidents}</p>
                <p className="text-amber-300 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {Math.abs(data.incidentsTrend)}% réduction
                </p>
              </div>
              <div className="bg-amber-500/30 p-3 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Économies Réalisées */}
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Économies</p>
                <p className="text-white text-3xl font-bold">{(data.costSavings / 1000).toFixed(0)}K$</p>
                <p className="text-purple-300 text-sm">Prévention accidents</p>
              </div>
              <div className="bg-purple-500/30 p-3 rounded-lg">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Alertes Critiques */}
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-red-400" />
            Alertes Prioritaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-200">AST En Retard</h3>
              <p className="text-2xl font-bold text-white">{data.astOverdue}</p>
              <p className="text-red-300 text-sm">Action requise immédiate</p>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-orange-200">Certifications Expirantes</h3>
              <p className="text-2xl font-bold text-white">{data.certificationExpiring}</p>
              <p className="text-orange-300 text-sm">Dans les 30 prochains jours</p>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-200">Renouvellements AST</h3>
              <p className="text-2xl font-bold text-white">{data.upcomingRenewals}</p>
              <p className="text-yellow-300 text-sm">Planification requise</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AST Récents */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">AST Récents</h2>
              <Link href={`/${tenant.subdomain}/ast`} className="text-amber-400 hover:text-amber-300 text-sm">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-3">
              {recentAST.map((ast) => (
                <div key={ast.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{ast.id}</h3>
                      <p className="text-slate-300 text-sm">{ast.project}</p>
                      <p className="text-slate-400 text-xs">{ast.client} • {ast.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ast.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        ast.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {ast.status === 'completed' ? 'Complété' :
                         ast.status === 'pending' ? 'En cours' : 'En retard'}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${
                        ast.risk === 'critical' ? 'bg-red-500' :
                        ast.risk === 'high' ? 'bg-orange-500' :
                        ast.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Événements Passé Proche */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Passé Proche Récents</h2>
              <Link href={`/${tenant.subdomain}/near-miss`} className="text-amber-400 hover:text-amber-300 text-sm">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-3">
              {nearMissEvents.map((event) => (
                <div key={event.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{event.id}</h3>
                      <p className="text-slate-300 text-sm">{event.description}</p>
                      <p className="text-slate-400 text-xs">{event.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {event.severity === 'high' ? 'Élevé' :
                         event.severity === 'medium' ? 'Moyen' : 'Faible'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {event.status === 'resolved' ? 'Résolu' : 'En cours'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Améliorations Suggérées */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Améliorations Continues
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {improvements.map((improvement) => (
              <div key={improvement.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white text-sm">{improvement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    improvement.status === 'implemented' ? 'bg-green-500/20 text-green-400' :
                    improvement.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {improvement.status === 'implemented' ? 'Implémenté' :
                     improvement.status === 'planned' ? 'Planifié' : 'Développement'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-2">{improvement.impact}</p>
                <p className="text-slate-400 text-xs">Coût: {improvement.cost.toLocaleString()}$</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/${tenant.subdomain}/ast/nouveau`}>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Nouveau AST</h3>
                <p className="text-blue-300 text-sm">Créer analyse</p>
              </div>
            </div>
          </Link>

          <Link href={`/${tenant.subdomain}/reports`}>
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Rapports</h3>
                <p className="text-purple-300 text-sm">Analytics</p>
              </div>
            </div>
          </Link>

          <Link href={`/${tenant.subdomain}/team`}>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Équipe</h3>
                <p className="text-green-300 text-sm">Gestion</p>
              </div>
            </div>
          </Link>

          <Link href={`/${tenant.subdomain}/settings`}>
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/30 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <Shield className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Paramètres</h3>
                <p className="text-amber-300 text-sm">Configuration</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Conformité */}
      <footer className="bg-slate-900/80 border-t border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">
              🏛️ Conforme CNESST • CSA Z1000 • C-Secur360 © 2024
            </p>
            <div className="flex items-center space-x-4 text-slate-400 text-sm">
              <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-CA')}</span>
              <span className="text-green-400">● Système opérationnel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
