import Link from 'next/link'

interface DashboardPageProps {
  params: { tenant: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const isDemo = params.tenant === 'demo'
  const companyName = params.tenant === 'demo' ? 'Version Démo' : 
                     params.tenant === 'futureclient' ? 'Client Potentiel' : 
                     params.tenant.charAt(0).toUpperCase() + params.tenant.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 text-center font-semibold">
          🚀 Version Démo C-Secur360 - Fonctionnalités limitées | Contactez-nous pour un accès complet
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-black to-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">🛡️ C-Secur360</h1>
                <p className="text-slate-400 text-sm">Analyse Sécuritaire de Tâches</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded-full text-white text-sm font-medium">
                {companyName}
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {companyName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">AST Complétés</p>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="text-green-400 text-3xl">📋</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Événements</p>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="text-yellow-400 text-3xl">⚠️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Utilisateurs</p>
                <p className="text-white text-2xl font-bold">1</p>
              </div>
              <div className="text-blue-400 text-3xl">👥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href={`/${params.tenant}/ast/nouveau`}>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:border-slate-600/50 cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-white font-semibold text-lg mb-2">Nouveau AST</h3>
                <p className="text-slate-400 text-sm">Créer une nouvelle analyse sécuritaire</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-white font-semibold text-lg mb-2">Mes AST</h3>
              <p className="text-slate-400 text-sm">Bientôt disponible</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-white font-semibold text-lg mb-2">Passé proche</h3>
              <p className="text-slate-400 text-sm">Bientôt disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
