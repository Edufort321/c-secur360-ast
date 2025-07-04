import Link from 'next/link'

interface DashboardPageProps {
  params: { tenant: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-gradient-to-r from-black to-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AST MDL</h1>
                <p className="text-slate-400 text-sm">Dashboard {params.tenant}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href={`/${params.tenant}/ast/nouveau`}>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-white font-semibold text-lg mb-2">Nouveau AST</h3>
                <p className="text-slate-400 text-sm">Créer une analyse</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-white font-semibold text-lg mb-2">Mes AST</h3>
              <p className="text-slate-400 text-sm">Bientôt disponible</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6">
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
