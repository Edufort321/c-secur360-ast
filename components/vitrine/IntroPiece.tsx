'use client'
// Intro du site public (Eric 2026-11-16) : le logo CERDIA tourne tranquillement d'un tour, comme une pièce, puis la page
// « s'ouvre » (deux panneaux qui s'écartent). Une fois par session ; sautée si l'utilisateur préfère moins d'animations ;
// un clic ou une touche la passe.
// Rendue dès le serveur (pas d'éclair de la page avant l'intro) ; un petit script, exécuté pendant le chargement du HTML,
// la masque d'avance pour qui l'a déjà vue (html[data-intro-vue]).
import { useEffect, useState } from 'react'

const CLE = 'cs360-intro-vue'
const SCRIPT = `try{if(sessionStorage.getItem('${CLE}')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.setAttribute('data-intro-vue','1')}catch(e){}`

export function IntroPiece() {
  const [etat, setEtat] = useState<'tourne' | 'ouvre' | 'cache'>('tourne')
  const [pret, setPret] = useState(false)   // la rotation démarre à l'hydratation, en même temps que les minuteries

  useEffect(() => {
    let vue = false
    try { vue = sessionStorage.getItem(CLE) === '1' } catch { /* stockage bloqué */ }
    if (vue || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setEtat('cache')
    else setPret(true)
  }, [])

  useEffect(() => {
    if (etat === 'tourne') {
      if (!pret) return
      const passer = () => setEtat('ouvre')
      const t = setTimeout(passer, 4500)   // secours : normalement, l'ouverture suit la fin du tour (onAnimationEnd)
      window.addEventListener('keydown', passer)
      return () => { clearTimeout(t); window.removeEventListener('keydown', passer) }
    }
    if (etat === 'ouvre') {
      const t = setTimeout(() => setEtat('cache'), 1000)
      return () => clearTimeout(t)
    }
    try { sessionStorage.setItem(CLE, '1') } catch { /* stockage bloqué */ }
  }, [etat, pret])

  if (etat === 'cache') return null
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className={`cs-intro ${etat === 'ouvre' ? 'cs-intro--ouvre' : ''}`} onClick={() => setEtat('ouvre')} aria-hidden="true">
        <div className="cs-intro__volet cs-intro__volet--g" />
        <div className="cs-intro__volet cs-intro__volet--d" />
        <div className="cs-intro__scene">
          <div className={`cs-intro__piece ${pret ? 'cs-intro__piece--tourne' : ''}`}
            onAnimationEnd={() => setEtat(e => (e === 'tourne' ? 'ouvre' : e))}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cerdia3.png" alt="" className="cs-intro__face" draggable={false} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cerdia3.png" alt="" className="cs-intro__face cs-intro__face--dos" draggable={false} />
          </div>
          <div className={`cs-intro__ombre ${pret ? 'cs-intro__ombre--tourne' : ''}`} />
        </div>
      </div>
    </>
  )
}
