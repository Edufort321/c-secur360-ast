'use client'
// « Autres applications CERDIA » (Eric 2026-11-16) : vitrine seulement — images et vidéos, AUCUN lien vers les applications
// (elles arrivent sur le Play Store). Appel à l'action : « Demander votre application sur mesure » (info@cerdia.ai).
import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Mail } from 'lucide-react'
import { AUTRES_APPS, type AppCerdia } from '@/lib/vitrine'

const MAILTO_FR = 'mailto:info@cerdia.ai?subject=' + encodeURIComponent('Application sur mesure — CERDIA')
const MAILTO_EN = 'mailto:info@cerdia.ai?subject=' + encodeURIComponent('Custom application — CERDIA')

function Fleches({ cible, fr, pas }: { cible: React.RefObject<HTMLDivElement | null>; fr: boolean; pas: number }) {
  const defiler = (s: number) => cible.current?.scrollBy({ left: s * pas, behavior: 'smooth' })
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => defiler(-1)} aria-label={fr ? 'Précédent' : 'Previous'}
        className="p-2 rounded-full border border-white/15 text-[#d7dbe0] hover:bg-white/10"><ChevronLeft size={18} /></button>
      <button type="button" onClick={() => defiler(1)} aria-label={fr ? 'Suivant' : 'Next'}
        className="p-2 rounded-full border border-white/15 text-[#d7dbe0] hover:bg-white/10"><ChevronRight size={18} /></button>
    </div>
  )
}

export function AutresApps({ fr }: { fr: boolean }) {
  const [app, setApp] = useState<AppCerdia | null>(null)
  const rangee = useRef<HTMLDivElement>(null)
  const galerie = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!app) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setApp(null) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [app])
  if (AUTRES_APPS.length === 0) return null

  return (
    <section id="applications" className="py-16 px-4 border-t border-white/8 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="cs-surtitre">{fr ? 'Écosystème CERDIA' : 'CERDIA ecosystem'}</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{fr ? 'Nos autres applications' : 'Our other apps'}</h2>
          </div>
          <Fleches cible={rangee} fr={fr} pas={340} />
        </div>
        <div ref={rangee} className="flex gap-4 overflow-x-auto snap-x pb-3 scrollbar-none">
          {AUTRES_APPS.map(a => (
            <button key={a.cle} type="button" onClick={() => setApp(a)} className="snap-start shrink-0 w-[150px] text-left group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.icone} alt="" width={150} height={150} loading="lazy"
                className="h-[150px] w-[150px] rounded-[28px] object-cover border border-white/10 bg-[#121315] group-hover:border-[#c9ced5]/60 transition" />
              <p className="mt-2 text-sm font-semibold text-white truncate">{a.nom}</p>
              <p className="text-xs text-[#9aa0a8] truncate">{fr ? a.categorie_fr : a.categorie_en}</p>
            </button>
          ))}
        </div>

        <div className="mt-10 cs-carte rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-xl font-black cs-argent-texte">{fr ? 'Votre application, sur mesure' : 'Your app, custom-built'}</h3>
            <p className="text-sm text-[#9aa0a8] mt-1">
              {fr ? 'CERDIA conçoit des applications web et mobiles adaptées à votre entreprise.' : 'CERDIA designs web and mobile apps tailored to your business.'}
            </p>
          </div>
          <a href={fr ? MAILTO_FR : MAILTO_EN}
            className="inline-flex items-center gap-2 shrink-0 cs-argent-fond text-[#111] px-6 py-3 rounded-xl font-bold text-sm transition">
            <Mail size={16} /> {fr ? 'Demander votre application sur mesure' : 'Request your custom app'}
          </a>
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
            {(app.video || app.captures.length > 0) && (
              <>
                <div className="mt-5 flex justify-end"><Fleches cible={galerie} fr={fr} pas={260} /></div>
                <div ref={galerie} className="mt-2 flex gap-3 overflow-x-auto snap-x pb-2 scrollbar-none">
                  {app.video && (
                    <video src={app.video} controls muted autoPlay loop playsInline preload="metadata"
                      className="snap-start h-[340px] shrink-0 rounded-xl border border-white/10 bg-black" />
                  )}
                  {app.captures.map((c, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={c} alt={`${app.nom} — ${fr ? 'capture' : 'screenshot'} ${i + 1}`} loading="lazy"
                      className="snap-start h-[340px] w-auto shrink-0 rounded-xl border border-white/10 object-contain bg-black" />
                  ))}
                </div>
              </>
            )}
            <p className="mt-4 text-sm text-[#c9ced5] leading-relaxed">{fr ? app.fr : app.en}</p>
          </div>
        </div>
      )}
    </section>
  )
}
