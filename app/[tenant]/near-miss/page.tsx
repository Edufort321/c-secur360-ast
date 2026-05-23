import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface NearMissPageProps {
  params: { tenant: string }
}

export default function NearMissPage({ params }: NearMissPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/${params.tenant}/dashboard`}
              className="text-white hover:text-yellow-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">⚠️ Passé proche</h1>
              <p className="text-slate-400 text-sm">Signalement d'événements</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Module Passé proche</h2>
          <p className="text-slate-400 mb-6">Cette fonctionnalité sera disponible prochainement</p>
          <p className="text-slate-300 text-sm">En attendant, vous pouvez signaler les événements via l'onglet "Passé proche" dans le formulaire AST.</p>
        </div>
      </div>
    </div>
  )
}
