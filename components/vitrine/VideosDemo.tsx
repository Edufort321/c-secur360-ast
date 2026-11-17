'use client'
// Vidéos démo du site public : rangée défilante façon magasin d'applications (aperçu muet au survol), lecteur plein écran au clic.
import { useEffect, useRef, useState } from 'react'
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { VIDEOS_DEMO, type VideoDemo } from '@/lib/vitrine'
import { ModuleIcon } from '@/components/ModuleIcon'

function Carte({ v, fr, ouvrir }: { v: VideoDemo; fr: boolean; ouvrir: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  return (
    <button type="button" onClick={ouvrir}
      onMouseEnter={() => { ref.current?.play().catch(() => {}) }}
      onMouseLeave={() => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0 } }}
      className="group w-[280px] sm:w-[320px] shrink-0 snap-start text-left rounded-2xl border border-white/10 bg-[#121315] overflow-hidden hover:border-[#c9ced5]/50 transition">
      <div className="relative aspect-video bg-black">
        <video ref={ref} src={`/videos/demo/${v.cle}.mp4`} poster={`/videos/demo/${v.cle}.jpg`} muted playsInline loop preload="none"
          className="h-full w-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-black/25 group-hover:bg-transparent transition">
          <span className="grid h-12 w-12 place-items-center rounded-full cs-argent-fond text-[#111] shadow-lg group-hover:scale-90 transition">
            <Play size={20} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">{v.duree}</span>
      </div>
      <div className="flex items-center gap-3 p-3">
        <ModuleIcon moduleKey={v.module} size={34} variante="argent" />
        <p className="text-sm font-semibold text-white leading-snug">{fr ? v.fr : v.en}</p>
      </div>
    </button>
  )
}

export function VideosDemo({ fr }: { fr: boolean }) {
  const [ouverte, setOuverte] = useState<VideoDemo | null>(null)
  const rangee = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ouverte) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuverte(null) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [ouverte])
  if (VIDEOS_DEMO.length === 0) return null
  const defiler = (s: number) => rangee.current?.scrollBy({ left: s * 340, behavior: 'smooth' })

  return (
    <section id="videos" className="py-20 px-4 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="cs-surtitre">{fr ? 'Voir en action' : 'See it in action'}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">{fr ? 'Démos vidéo' : 'Video demos'}</h2>
            <p className="text-[#9aa0a8] text-sm mt-2">{fr ? 'De vrais parcours dans l\'application, avec des données fictives.' : 'Real walkthroughs in the app, with sample data.'}</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => defiler(-1)} aria-label={fr ? 'Précédent' : 'Previous'} className="p-2 rounded-full border border-white/15 text-[#d7dbe0] hover:bg-white/10"><ChevronLeft size={18} /></button>
            <button onClick={() => defiler(1)} aria-label={fr ? 'Suivant' : 'Next'} className="p-2 rounded-full border border-white/15 text-[#d7dbe0] hover:bg-white/10"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div ref={rangee} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-none">
          {VIDEOS_DEMO.map(v => <Carte key={v.cle} v={v} fr={fr} ouvrir={() => setOuverte(v)} />)}
        </div>
      </div>

      {ouverte && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4" onClick={() => setOuverte(null)}>
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={fr ? ouverte.fr : ouverte.en}>
            <button onClick={() => setOuverte(null)} aria-label={fr ? 'Fermer' : 'Close'}
              className="absolute -top-11 right-0 p-2 rounded-full text-[#d7dbe0] hover:bg-white/10"><X size={22} /></button>
            <video src={`/videos/demo/${ouverte.cle}.mp4`} poster={`/videos/demo/${ouverte.cle}.jpg`} controls autoPlay playsInline
              className="w-full rounded-xl border border-white/10 bg-black" />
            <p className="mt-3 text-center text-sm text-[#c9ced5]">{fr ? ouverte.fr : ouverte.en}</p>
          </div>
        </div>
      )}
    </section>
  )
}
