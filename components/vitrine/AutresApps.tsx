'use client'
// « Autres applications CERDIA » : petites fiches façon magasin d'applications (icône, catégorie), et au clic une fiche
// avec captures défilantes et mini-vidéo (Eric 2026-11-16).
import { useEffect, useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { AUTRES_APPS, type AppCerdia } from '@/lib/vitrine'

export function AutresApps({ fr }: { fr: boolean }) {
  const [app, setApp] = useState<AppCerdia | null>(null)
  useEffect(() => {
    if (!app) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setApp(null) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [app])
  if (AUTRES_APPS.length === 0) return null

  return (
    <section id="applications" className="py-16 px-4 border-t border-white/8 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <p className="cs-surtitre">{fr ? 'Écosystème CERDIA' : 'CERDIA ecosystem'}</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">{fr ? 'Autres applications' : 'Other apps'}</h2>
        <div className="flex gap-4 overflow-x-auto snap-x pb-3 scrollbar-none">
          {AUTRES_APPS.map(a => (
            <button key={a.cle} type="button" onClick={() => setApp(a)}
              className="snap-start shrink-0 w-[150px] text-left group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.icone} alt="" width={150} height={150} loading="lazy"
                className="h-[150px] w-[150px] rounded-[28px] object-cover border border-white/10 bg-[#121315] group-hover:border-[#c9ced5]/60 transition" />
              <p className="mt-2 text-sm font-semibold text-white truncate">{a.nom}</p>
              <p className="text-xs text-[#9aa0a8] truncate">{fr ? a.categorie_fr : a.categorie_en}</p>
            </button>
          ))}
        </div>
      </div>

      {app && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={() => setApp(null)}>
          <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={app.nom}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#121315] p-5 sm:p-6">
            <button onClick={() => setApp(null)} aria-label={fr ? 'Fermer' : 'Close'}
              className="absolute right-3 top-3 p-2 rounded-full text-[#c9ced5] hover:bg-white/10"><X size={20} /></button>
            <div className="flex items-center gap-4 pr-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.icone} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-2xl border border-white/10 object-cover" />
              <div className="min-w-0">
                <h3 className="text-xl font-black text-white">{app.nom}</h3>
                <p className="text-xs text-[#9aa0a8]">{fr ? app.categorie_fr : app.categorie_en} · CERDIA</p>
              </div>
            </div>
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full cs-argent-fond px-5 py-2 text-sm font-bold text-[#111]">
                {fr ? 'Ouvrir' : 'Open'} <ExternalLink size={14} />
              </a>
            )}
            {(app.video || app.captures.length > 0) && (
              <div className="mt-5 flex gap-3 overflow-x-auto snap-x pb-2 scrollbar-none">
                {app.video && (
                  <video src={app.video} controls muted autoPlay loop playsInline preload="metadata"
                    className="snap-start h-[300px] shrink-0 rounded-xl border border-white/10 bg-black" />
                )}
                {app.captures.map((c, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={c} alt={`${app.nom} — ${fr ? 'capture' : 'screenshot'} ${i + 1}`} loading="lazy"
                    className="snap-start h-[300px] w-auto shrink-0 rounded-xl border border-white/10 object-contain bg-black" />
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-[#c9ced5] leading-relaxed">{fr ? app.fr : app.en}</p>
          </div>
        </div>
      )}
    </section>
  )
}
