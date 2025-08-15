import 'server-only'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Share } from 'lucide-react'
import { IsolationCircuit } from '@/types/astPayload'

interface ASTDetailPageProps {
  params: { tenant: string; id: string }
}

export default async function ASTDetailPage({ params }: ASTDetailPageProps) {
  const ast = await prisma.aSTForm.findFirst({
    where: {
      id: params.id,
      tenant: { subdomain: params.tenant }
    },
    include: {
      tenant: true
    }
  })

  if (!ast) {
    notFound()
  }

  const generalInfo = ast.generalInfo as any
  const teamDiscussion = ast.teamDiscussion as string[]
  const isolation = ast.isolation as any
  const hazards = ast.hazards as string[]
  const workers = ast.workers as any[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/${params.tenant}/ast`}
                className="text-white hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{ast.astMdlNumber}</h1>
                <p className="text-slate-400 text-sm">{ast.clientName} - {ast.tenant.companyName}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>PDF</span>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2">
                <Share className="w-5 h-5" />
                <span>Partager</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📋 Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Date/Heure</p>
                <p className="text-white">{generalInfo?.datetime || new Date(ast.createdAt).toLocaleString('fr-CA')}</p>
              </div>
              <div>
                <p className="text-slate-400">Numéro de projet</p>
                <p className="text-white">{ast.projectNumber}</p>
              </div>
              <div>
                <p className="text-slate-400">Lieu des travaux</p>
                <p className="text-white">{ast.workLocation}</p>
              </div>
              <div>
                <p className="text-slate-400">Représentant client</p>
                <p className="text-white">{ast.clientRep || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400">Numéro d&apos;urgence</p>
                <p className="text-white">{ast.emergencyNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400">AST Client #</p>
                <p className="text-white">{ast.astClientNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-400 text-sm">Description des travaux</p>
              <p className="text-white">{ast.workDescription}</p>
            </div>
          </div>

          {/* Discussion équipe */}
          {teamDiscussion && teamDiscussion.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">💬 Discussion avec l&apos;équipe</h2>
              <div className="space-y-2">
                {teamDiscussion.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Isolation électrique */}
          {isolation && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">⚡ Isolation Électrique</h2>
              {isolation.point && (
                <div className="mb-4">
                  <p className="text-slate-400 text-sm">Point d&apos;isolement</p>
                  <p className="text-white">{isolation.point}</p>
                </div>
              )}
              {isolation.circuits && isolation.circuits.length > 0 && (
                <div className="space-y-3">
                  {isolation.circuits.map((circuit: IsolationCircuit, index: number) => (
                    <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">{circuit.name}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className={`text-center p-2 rounded ${circuit.padlock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          Cadenas {circuit.padlock ? '✓' : '✗'}
                        </div>
                        <div className={`text-center p-2 rounded ${circuit.voltage ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          Tension {circuit.voltage ? '✓' : '✗'}
                        </div>
                        <div className={`text-center p-2 rounded ${circuit.grounding ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          Terre {circuit.grounding ? '✓' : '✗'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Travailleurs */}
          {workers && workers.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">👷 Travailleurs</h2>
              <div className="space-y-2">
                {workers.map((worker, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                    <span className="text-white">{worker.name}</span>
                    {worker.departureTime && (
                      <span className="text-slate-400 text-sm">Départ: {worker.departureTime}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
