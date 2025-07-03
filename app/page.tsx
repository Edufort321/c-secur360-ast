import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AST MDL</h1>
          <p className="text-slate-600">Analyse Sécuritaire de Tâches</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/ast"
            className="block w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            📋 Nouveau Formulaire AST
          </Link>
          
          <Link 
            href="/near-miss"
            className="block w-full p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg"
          >
            ⚠️ Passé Proche / Accident
          </Link>
          
          <Link 
            href="/dashboard"
            className="block w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            📊 Tableau de Bord
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-slate-500">
          <p>© 2024 C-Secur360</p>
          <p>Powered by MDL Technology</p>
        </div>
      </div>
    </div>
  )
}
