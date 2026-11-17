'use client'
// Bouton + formulaire « Essayer la démo 24 h » du site public (Eric 2026-11-16) → /api/demo/essai. Le lien d'accès arrive PAR COURRIEL
// (envoyé par gestion.cerdia.ai depuis info@cerdia.ai) ; l'écran ne montre que « vérifiez votre boîte ».
import { useEffect, useState } from 'react'
import { X, Mail } from 'lucide-react'

const MESSAGES: Record<string, [string, string]> = {
  champs: ['Vérifiez votre prénom, votre entreprise et votre courriel.', 'Please check your first name, company and email.'],
  consentement: ['Cochez la case pour recevoir votre lien par courriel.', 'Tick the box to receive your link by email.'],
  deja_utilise: ['Votre essai de 24 h est terminé. Écrivez-nous à info@cerdia.ai pour la suite.', 'Your 24-hour trial has ended. Write to info@cerdia.ai to continue.'],
  trop: ['Trop de demandes. Réessayez plus tard.', 'Too many requests. Please try again later.'],
}

export function EssaiDemo({ fr, label, className }: { fr: boolean; label?: string; className?: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [f, setF] = useState({ prenom: '', nom: '', courriel: '', entreprise: '', besoin: '', consentement: false })
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'envoye'>('saisie')
  const [erreur, setErreur] = useState('')
  useEffect(() => {
    if (!ouvert) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [ouvert])

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault(); if (etat === 'envoi') return
    setEtat('envoi'); setErreur('')
    try {
      const r = await fetch('/api/demo/essai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, langue: fr ? 'fr' : 'en' }) })
      const j = await r.json().catch(() => ({}))
      if (j.ok) { setEtat('envoye'); return }
      const m = MESSAGES[j.erreur]
      setErreur(m ? m[fr ? 0 : 1] : (fr ? 'Service momentanément indisponible. Écrivez-nous à info@cerdia.ai.' : 'Service temporarily unavailable. Write to info@cerdia.ai.'))
    } catch { setErreur(fr ? 'Erreur réseau, réessayez.' : 'Network error, please retry.') }
    setEtat('saisie')
  }
  const champ = 'w-full rounded-lg border border-white/10 bg-[#0a0a0b] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#c9ced5]/60'

  return (
    <>
      <button type="button" onClick={() => { setOuvert(true); setEtat('saisie'); setErreur('') }}
        className={className || 'rounded-xl cs-argent-fond px-6 py-3 text-sm font-bold text-[#111] shadow-lg transition'}>
        {label || (fr ? 'Essayer la démo 24 h' : 'Try the 24-hour demo')}
      </button>
      {ouvert && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4" onClick={() => setOuvert(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={fr ? 'Démo de 24 heures' : '24-hour demo'}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111214] p-6 text-white">
            <button onClick={() => setOuvert(false)} aria-label={fr ? 'Fermer' : 'Close'} className="absolute right-3 top-3 p-2 rounded-full text-[#c9ced5] hover:bg-white/10"><X size={18} /></button>
            {etat === 'envoye' ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full cs-argent-fond text-[#111]"><Mail size={22} /></div>
                <h3 className="text-xl font-black cs-argent-texte">{fr ? 'Vérifiez votre boîte de courriel' : 'Check your inbox'}</h3>
                <p className="mt-2 text-sm text-[#c9ced5]">
                  {fr ? `Votre lien d'accès à la démo, valable 24 heures, vient d'être envoyé à ${f.courriel}.` : `Your demo access link, valid for 24 hours, was just sent to ${f.courriel}.`}
                </p>
              </div>
            ) : (
              <form onSubmit={envoyer} className="space-y-3">
                <h3 className="text-xl font-black cs-argent-texte pr-8">{fr ? 'Démo gratuite de 24 heures' : 'Free 24-hour demo'}</h3>
                <p className="text-sm text-[#9aa0a8]">{fr ? 'Recevez par courriel votre lien personnel vers la démo C-Secur360.' : 'Get your personal link to the C-Secur360 demo by email.'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <input required value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} placeholder={fr ? 'Prénom *' : 'First name *'} className={champ} autoComplete="given-name" />
                  <input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder={fr ? 'Nom' : 'Last name'} className={champ} autoComplete="family-name" />
                </div>
                <input required type="email" value={f.courriel} onChange={(e) => setF({ ...f, courriel: e.target.value })} placeholder={fr ? 'Courriel professionnel *' : 'Work email *'} className={champ} autoComplete="email" />
                <input required value={f.entreprise} onChange={(e) => setF({ ...f, entreprise: e.target.value })} placeholder={fr ? 'Entreprise *' : 'Company *'} className={champ} autoComplete="organization" />
                <textarea value={f.besoin} onChange={(e) => setF({ ...f, besoin: e.target.value })} rows={2} maxLength={1000}
                  placeholder={fr ? 'Votre besoin (facultatif) : modules, nombre de sites…' : 'Your needs (optional): modules, number of sites…'} className={champ} />
                <label className="flex items-start gap-2 text-xs text-[#9aa0a8]">
                  <input type="checkbox" checked={f.consentement} onChange={(e) => setF({ ...f, consentement: e.target.checked })} className="mt-0.5" required />
                  <span>{fr
                    ? <>J&apos;accepte de recevoir mon lien et un suivi de Commerce CERDIA inc. par courriel. Désabonnement en tout temps. <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="underline text-[#d7dbe0]">Confidentialité</a></>
                    : <>I agree to receive my link and a follow-up from Commerce CERDIA inc. by email. Unsubscribe anytime. <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="underline text-[#d7dbe0]">Privacy</a></>}</span>
                </label>
                {erreur && <p className="text-sm text-red-400" role="alert">{erreur}</p>}
                <button type="submit" disabled={etat === 'envoi'} className="w-full rounded-lg cs-argent-fond px-4 py-2.5 text-sm font-bold text-[#111] disabled:opacity-60">
                  {etat === 'envoi' ? '…' : (fr ? 'Recevoir mon lien' : 'Get my link')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
