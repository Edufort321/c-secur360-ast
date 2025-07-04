import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Plus, Eye } from 'lucide-react'

interface ASTListPageProps {
  params: { tenant: string }
}

export default async function ASTListPage({ params }: ASTListPageProps) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: params.tenant }
  })

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  const astForms = await prisma.aSTForm.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/${params.tenant}/dashboard`}
                className="text-white hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">📊 Mes AST</h1>
                <p className="text-slate-400 text-sm">{tenant.companyName}</p>
              </div>
            </div>
            
            <Link href={`/${params.tenant}/ast/nouveau`}>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Nouveau AST</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {astForms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-white mb-2">Aucun AST pour le moment</h2>
            <p className="text-slate-400 mb-6">Créez votre première analyse sécuritaire de tâches</p>
            <Link href={`/${params.tenant}/ast/nouveau`}>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                Créer un AST
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {astForms.map((ast) => (
              <div
                key={ast.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                        <span className="text-white font-bold">🛡️</span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{ast.astMdlNumber}</h3>
                        <p className="text-slate-400 text-sm">{ast.clientName}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Projet</p>
                        <p className="text-white">{ast.projectNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Lieu</p>
                        <p className="text-white">{ast.workLocation}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Description</p>
                        <p className="text-white text-sm">{ast.workDescription.substring(0, 100)}...</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Créé le</p>
                        <p className="text-white">{new Date(ast.createdAt).toLocaleDateString('fr-CA')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ast.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ast.status === 'completed' ? '✅ Complété' : '⏳ En cours'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link href={`/${params.tenant}/ast/${ast.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
