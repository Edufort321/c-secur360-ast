import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">🛡️ AST MDL</h1>
        <p className="text-slate-300 mb-8">Analyse Sécuritaire de Tâches</p>
        <div className="space-y-4">
          <Link href="/demo/dashboard">
            <button className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              🚀 Version Démo
            </button>
          </Link>
          <Link href="/c-secur360/dashboard">
            <button className="block w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              🏢 C-Secur360
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
