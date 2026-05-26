'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  Shield, Users, HardHat, Calendar, FileCheck, AlertTriangle,
  AlertCircle, Package, Wrench, ClipboardCheck, Clock, Truck,
  CheckSquare, BarChart3, ChevronLeft, ChevronRight, Lock,
  CheckCircle, Smartphone, Globe, ArrowRight, Phone, Mail,
  Building2, Star, Menu, X
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Slide {
  id: string
  image_url: string
  title_fr: string | null
  title_en: string | null
  subtitle_fr: string | null
  subtitle_en: string | null
  active: boolean
  sort_order: number
}

interface PricingPlan {
  name_fr: string
  name_en: string
  monthly: number
  annual: number
  popular?: boolean
}

// ─── Données statiques ────────────────────────────────────────────────────────

const MODULES_FR = [
  { icon: Users,          key: 'admin',       name: 'Administration',         desc: 'Gestion des utilisateurs, roles, permissions et configuration du compte.' },
  { icon: HardHat,        key: 'projets',     name: 'Projets',                desc: 'Suivi des chantiers, clients, contrats et avancements en temps reel.' },
  { icon: Calendar,       key: 'planner',     name: 'Planificateur',          desc: 'Calendrier interactif, affectation du personnel et ressources par journee.' },
  { icon: Shield,         key: 'ast',         name: 'AST / Securite',         desc: 'Analyses de securite de taches, signatures electroniques, conformite CNESST.' },
  { icon: FileCheck,      key: 'permits',     name: 'Permis de travail',      desc: 'Permis d\'espaces confines, travaux en hauteur, hot work et excavation.' },
  { icon: AlertTriangle,  key: 'accidents',   name: 'Accidents',              desc: 'Rapport d\'accident, enquete, actions correctives et suivi reglementaire.' },
  { icon: AlertCircle,    key: 'presque',     name: 'Presque-accidents',      desc: 'Declaration et suivi des quasi-accidents pour prevention proactive.' },
  { icon: Package,        key: 'inventaire',  name: 'Inventaire',             desc: 'Gestion du stock, equipements de protection individuelle et consommables.' },
  { icon: Wrench,         key: 'equip',       name: 'Fiches equipements',     desc: 'Fiches techniques, historique de maintenance et certification des equipements.' },
  { icon: ClipboardCheck, key: 'inspect',     name: 'Inspections',            desc: 'Listes de verification, inspections periodiques et rapports d\'etat.' },
  { icon: Clock,          key: 'temps',       name: 'Feuilles de temps',      desc: 'Saisie des heures, approbation superviseur et export comptable.' },
  { icon: Truck,          key: 'logbook',     name: 'Logbook vehicules',      desc: 'Carnet de bord numerique, kilometrage, incidents et entretien de flotte.' },
  { icon: CheckSquare,    key: 'todo',        name: 'To-Do / Taches',         desc: 'Gestion des taches, priorites, assignations et rappels automatiques.' },
]

const MODULES_EN = [
  { icon: Users,          key: 'admin',       name: 'Administration',         desc: 'User management, roles, permissions and account configuration.' },
  { icon: HardHat,        key: 'projets',     name: 'Projects',               desc: 'Jobsite tracking, clients, contracts and real-time progress.' },
  { icon: Calendar,       key: 'planner',     name: 'Planner',                desc: 'Interactive calendar, personnel assignment and daily resource management.' },
  { icon: Shield,         key: 'ast',         name: 'JSA / Safety',           desc: 'Job safety analysis, electronic signatures, CNESST & OHS compliance.' },
  { icon: FileCheck,      key: 'permits',     name: 'Work Permits',           desc: 'Confined space, working at heights, hot work and excavation permits.' },
  { icon: AlertTriangle,  key: 'accidents',   name: 'Accidents',              desc: 'Accident reports, investigations, corrective actions and regulatory tracking.' },
  { icon: AlertCircle,    key: 'presque',     name: 'Near-Misses',            desc: 'Near-miss reporting and tracking for proactive hazard prevention.' },
  { icon: Package,        key: 'inventaire',  name: 'Inventory',              desc: 'Stock management, personal protective equipment and consumables.' },
  { icon: Wrench,         key: 'equip',       name: 'Equipment Records',      desc: 'Technical sheets, maintenance history and equipment certification.' },
  { icon: ClipboardCheck, key: 'inspect',     name: 'Inspections',            desc: 'Checklists, scheduled inspections and condition reports.' },
  { icon: Clock,          key: 'temps',       name: 'Timesheets',             desc: 'Time entry, supervisor approval and accounting export.' },
  { icon: Truck,          key: 'logbook',     name: 'Vehicle Logbook',        desc: 'Digital logbook, mileage, incidents and fleet maintenance tracking.' },
  { icon: CheckSquare,    key: 'todo',        name: 'Tasks / To-Do',          desc: 'Task management, priorities, assignments and automatic reminders.' },
]

const HERO_FALLBACK_FR = [
  { title: 'Securite d\'abord.', subtitle: 'Conformite CNESST assuree.', gradient: 'from-[#0B1728] via-[#0D2040] to-[#0B1728]' },
  { title: 'ASTs, permis et inspections.', subtitle: 'Tout en un — partout sur le chantier.', gradient: 'from-[#0D1F3C] via-[#1a2744] to-[#0D1F3C]' },
  { title: 'Zero papier. 100 % numerique.', subtitle: 'Votre equipe connectee en temps reel.', gradient: 'from-[#0B1728] via-[#102038] to-[#0B1728]' },
]

const HERO_FALLBACK_EN = [
  { title: 'Safety first.', subtitle: 'CNESST & OHS compliance guaranteed.', gradient: 'from-[#0B1728] via-[#0D2040] to-[#0B1728]' },
  { title: 'JSAs, permits and inspections.', subtitle: 'All-in-one — everywhere on the jobsite.', gradient: 'from-[#0D1F3C] via-[#1a2744] to-[#0D1F3C]' },
  { title: 'Zero paper. 100% digital.', subtitle: 'Your team connected in real time.', gradient: 'from-[#0B1728] via-[#102038] to-[#0B1728]' },
]

const STATIC_PLANS_FR: PricingPlan[] = [
  { name_fr: 'Starter', name_en: 'Starter', monthly: 149, annual: 1490, popular: false },
  { name_fr: 'Professionnel', name_en: 'Professional', monthly: 249, annual: 2490, popular: true },
  { name_fr: 'Entreprise', name_en: 'Enterprise', monthly: 0, annual: 0, popular: false },
]

const TESTIMONIALS_FR = [
  { name: 'Martin Lavoie', title: 'Directeur securite', company: 'Constructions BFL inc.', text: 'Depuis C-Secur360, nos inspections sont completes en 5 minutes sur le terrain. Les ASTs electroniques ont reduit nos incidents de 40 % en un an.', rating: 5 },
  { name: 'Sophie Tremblay', title: 'Coordonnatrice SST', company: 'Industries Nordiques Ltee', text: 'La gestion des permis d\'espaces confines est maintenant impeccable. L\'interface mobile est simple et nos travailleurs ont adopte la plateforme en quelques jours.', rating: 5 },
  { name: 'Jean-Francois Roy', title: 'Surintendant general', company: 'Groupe Construction Atlas', text: 'Le module de feuilles de temps a elimine 8 heures de saisie manuelle par semaine. Le logbook vehicules nous a sauve lors de notre derniere inspection CNESST.', rating: 5 },
]

const TESTIMONIALS_EN = [
  { name: 'Martin Lavoie', title: 'Safety Director', company: 'Constructions BFL inc.', text: 'Since C-Secur360, our inspections are completed in 5 minutes in the field. Electronic JSAs reduced our incidents by 40% in one year.', rating: 5 },
  { name: 'Sophie Tremblay', title: 'OHS Coordinator', company: 'Industries Nordiques Ltee', text: 'Confined space permit management is now flawless. The mobile interface is simple and our workers adopted the platform within days.', rating: 5 },
  { name: 'Jean-Francois Roy', title: 'General Superintendent', company: 'Groupe Construction Atlas', text: 'The timesheet module eliminated 8 hours of manual entry per week. The vehicle logbook saved us during our last CNESST inspection.', rating: 5 },
]

// ─── Composant principal ───────────────────────────────────────────────────────

export default function LandingPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const fr = lang === 'fr'
  const [menuOpen, setMenuOpen] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const [dbSlides, setDbSlides] = useState<Slide[] | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>(STATIC_PLANS_FR)
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'annual'>('monthly')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const modules = fr ? MODULES_FR : MODULES_EN
  const heroFallback = fr ? HERO_FALLBACK_FR : HERO_FALLBACK_EN
  const testimonials = fr ? TESTIMONIALS_FR : TESTIMONIALS_EN

  // No auto-redirect: users can view the public page even when logged in

  // Load slides from DB
  useEffect(() => {
    supabase
      .from('landing_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setDbSlides(data)
      })
  }, [])

  // Load pricing from DB billing_config or modules table
  useEffect(() => {
    supabase
      .from('billing_config')
      .select('*')
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: PricingPlan[] = data.map((row: any) => ({
            name_fr: row.name_fr || row.name || 'Plan',
            name_en: row.name_en || row.name || 'Plan',
            monthly: row.price_monthly ?? row.monthly ?? 0,
            annual: row.price_annual ?? row.annual ?? 0,
            popular: row.popular ?? false,
          }))
          setPlans(mapped)
        }
      })
  }, [])

  // Carousel auto-advance
  const slideCount = dbSlides ? dbSlides.length : heroFallback.length

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % slideCount)
    }, 5000)
  }, [slideCount])

  useEffect(() => {
    startInterval()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [startInterval])

  const goPrev = () => { setSlideIdx(i => (i - 1 + slideCount) % slideCount); startInterval() }
  const goNext = () => { setSlideIdx(i => (i + 1) % slideCount); startInterval() }

  return (
    <div className="min-h-screen bg-[#0B1728] text-white font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full bg-[#0B1728]/95 backdrop-blur border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="C-Secur360" width={32} height={32} className="h-8 w-auto" />
            <span className="font-bold text-white text-base tracking-tight">C-Secur360</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/8 rounded-lg p-0.5">
              {(['fr', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${lang === l ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 bg-white/8 rounded-lg hover:bg-white/12 transition border border-white/10">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="bg-[#111c30] border-t border-white/8">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              <Link href="/auth/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition border border-white/8">
                <Lock size={14} /> {fr ? 'Acces Admin' : 'Admin Access'}
              </Link>
              <Link href="/demo/dashboard" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-sm text-white font-semibold transition">
                {fr ? 'Demo Gratuite' : 'Free Demo'} <ArrowRight size={14} />
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero Carousel ───────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {dbSlides ? (
          dbSlides.map((s, idx) => (
            <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === slideIdx ? 'opacity-100' : 'opacity-0'}`}>
              <img src={s.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/50 to-[#0B1728]/20" />
            </div>
          ))
        ) : (
          heroFallback.map((s, idx) => (
            <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === slideIdx ? 'opacity-100' : 'opacity-0'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
              {/* Geometric pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `repeating-linear-gradient(45deg, #F26522 0, #F26522 1px, transparent 0, transparent 50%)`,
                backgroundSize: '30px 30px'
              }} />
            </div>
          ))
        )}

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-6 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-3 py-1 mb-4">
              <Shield size={12} className="text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest">
                {fr ? 'Conforme CNESST · MOL · OHS' : 'CNESST · MOL · OHS Compliant'}
              </span>
            </div>

            {dbSlides ? (
              <>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-3">
                  {(fr ? dbSlides[slideIdx]?.title_fr : dbSlides[slideIdx]?.title_en) || (fr ? 'Plateforme de gestion securitaire' : 'Safety management platform')}
                </h1>
                <p className="text-lg text-slate-300 mb-8">
                  {(fr ? dbSlides[slideIdx]?.subtitle_fr : dbSlides[slideIdx]?.subtitle_en) || ''}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-3">
                  {heroFallback[slideIdx].title}
                </h1>
                <p className="text-lg text-slate-300 mb-8">
                  {heroFallback[slideIdx].subtitle}
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-4">
              <Link href="/demo/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-bold text-base transition shadow-lg shadow-orange-500/25">
                {fr ? 'Essayer gratuitement' : 'Try for free'} <ArrowRight size={18} />
              </Link>
              <Link href="/demo/dashboard"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/8 px-7 py-3.5 rounded-xl font-semibold text-base transition">
                {fr ? 'Voir la demo' : 'Watch demo'}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel arrows */}
        <button onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-black/30 hover:bg-black/50 rounded-full border border-white/10 text-white transition">
          <ChevronLeft size={20} />
        </button>
        <button onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-black/30 hover:bg-black/50 rounded-full border border-white/10 text-white transition">
          <ChevronRight size={20} />
        </button>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button key={i} onClick={() => { setSlideIdx(i); startInterval() }}
              className={`rounded-full transition-all ${i === slideIdx ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="bg-[#0D1F3C] border-y border-white/8 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: '13', label: fr ? 'Modules inclus' : 'Modules included' },
            { val: '14 j', label: fr ? 'Essai gratuit' : 'Free trial' },
            { val: '100%', label: fr ? 'Conforme CNESST' : 'CNESST compliant' },
            { val: '24/7', label: fr ? 'Support inclus' : 'Support included' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl sm:text-3xl font-black text-orange-400">{s.val}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modules ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
            {fr ? 'Plateforme tout-en-un' : 'All-in-one platform'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {fr ? '13 modules. Une seule plateforme.' : '13 modules. One single platform.'}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            {fr
              ? 'Chaque module est concu pour le terrain. Acces mobile, signatures electroniques et synchronisation en temps reel.'
              : 'Every module is built for the field. Mobile access, electronic signatures and real-time sync.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <div key={mod.key}
              className="bg-[#111c30] border border-white/8 rounded-xl p-5 hover:border-orange-500/40 hover:bg-[#142038] transition group">
              <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center mb-3 group-hover:bg-orange-500/25 transition">
                <mod.icon size={20} className="text-orange-400" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">{mod.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform features ──────────────────────────────────────────────── */}
      <section className="bg-[#0D1F3C] py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
              {fr ? 'Architecture entreprise' : 'Enterprise architecture'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
              {fr ? 'Concu pour les grandes organisations' : 'Built for large organizations'}
            </h2>
            <div className="space-y-4">
              {[
                { icon: Building2, title: fr ? 'Multi-sites & multi-clients' : 'Multi-site & multi-client', desc: fr ? 'Chaque client a son portail prive avec URL dediee. Facturation additive par site.' : 'Each client has a private portal with dedicated URL. Additive billing per site.' },
                { icon: Smartphone, title: fr ? 'Application mobile PWA' : 'PWA mobile app', desc: fr ? 'Installez sur iOS et Android. Fonctionne hors-ligne sur le chantier.' : 'Install on iOS and Android. Works offline on the jobsite.' },
                { icon: BarChart3, title: fr ? 'Tableaux de bord en temps reel' : 'Real-time dashboards', desc: fr ? 'KPIs de securite, tendances d\'incidents et rapports de conformite automatiques.' : 'Safety KPIs, incident trends and automatic compliance reports.' },
                { icon: Globe, title: fr ? 'Conforme partout au Canada' : 'Compliant across Canada', desc: fr ? 'Toutes les provinces: QC, ON, BC, AB et plus. CNESST, MOL, WorkSafeBC.' : 'All provinces: QC, ON, BC, AB and more. CNESST, MOL, WorkSafeBC.' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon size={17} className="text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">{f.title}</h4>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0B1728] rounded-2xl border border-white/8 p-8">
            <div className="space-y-3">
              {[
                fr ? 'Signature electronique conforme' : 'Compliant electronic signature',
                fr ? 'Codes QR personnalises par chantier' : 'Custom QR codes per jobsite',
                fr ? 'Export PDF et Excel automatique' : 'Automatic PDF and Excel export',
                fr ? 'Notifications SMS et courriel' : 'SMS and email notifications',
                fr ? 'Integrations Google Drive & OneDrive' : 'Google Drive & OneDrive integrations',
                fr ? 'Sauvegarde cloud quotidienne' : 'Daily cloud backup',
                fr ? 'Authentification a deux facteurs' : 'Two-factor authentication',
                fr ? 'Mises a jour automatiques incluses' : 'Automatic updates included',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
            {fr ? 'Tarification' : 'Pricing'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {fr ? 'Prix transparents, sans surprise.' : 'Transparent pricing, no surprises.'}
          </h2>
          <div className="inline-flex bg-[#0D1F3C] rounded-xl p-1 gap-1 mt-2">
            <button
              onClick={() => setPricingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${pricingCycle === 'monthly' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'}`}>
              {fr ? 'Mensuel' : 'Monthly'}
            </button>
            <button
              onClick={() => setPricingCycle('annual')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${pricingCycle === 'annual' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'}`}>
              {fr ? 'Annuel (-2 mois)' : 'Annual (-2 months)'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl border p-6 flex flex-col ${plan.popular ? 'bg-[#1a2744] border-orange-500/50 shadow-xl shadow-orange-500/10' : 'bg-[#111c30] border-white/8'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {fr ? 'Plus populaire' : 'Most popular'}
                </div>
              )}
              <h3 className="font-black text-white text-lg mb-1">{fr ? plan.name_fr : plan.name_en}</h3>
              {plan.monthly === 0 ? (
                <div className="my-4">
                  <p className="text-3xl font-black text-white">{fr ? 'Sur mesure' : 'Custom'}</p>
                  <p className="text-slate-400 text-sm mt-1">{fr ? 'Contactez-nous' : 'Contact us'}</p>
                </div>
              ) : (
                <div className="my-4">
                  <p className="text-3xl font-black text-white">
                    {pricingCycle === 'monthly'
                      ? `${plan.monthly}$`
                      : `${Math.round(plan.annual / 12)}$`}
                    <span className="text-base font-normal text-slate-400">/mois</span>
                  </p>
                  {pricingCycle === 'annual' && (
                    <p className="text-emerald-400 text-xs mt-1">{plan.annual}$/an — {fr ? '2 mois gratuits' : '2 months free'}</p>
                  )}
                </div>
              )}
              <div className="space-y-2 flex-1 mb-6">
                {[
                  fr ? 'Tous les 13 modules' : 'All 13 modules',
                  fr ? 'Multi-sites inclus' : 'Multi-site included',
                  fr ? 'Application mobile PWA' : 'Mobile PWA app',
                  fr ? 'Support 24/7' : '24/7 support',
                  ...(plan.monthly === 0 ? [fr ? 'Integrations ERP' : 'ERP integrations', fr ? 'SLA garanti' : 'Guaranteed SLA'] : []),
                ].map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href={plan.monthly === 0 ? 'mailto:info@c-secur360.ca' : '/demo/dashboard'}
                className={`w-full text-center py-3 rounded-xl font-bold text-sm transition ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border border-white/20 text-white hover:bg-white/8'}`}>
                {plan.monthly === 0 ? (fr ? 'Nous contacter' : 'Contact us') : (fr ? 'Essai gratuit 14 jours' : '14-day free trial')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="bg-[#0D1F3C] py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
              {fr ? 'Temoignages' : 'Testimonials'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {fr ? 'Des equipes qui nous font confiance.' : 'Teams that trust us.'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#0B1728] rounded-2xl border border-white/8 p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.title} — {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
            <Shield size={13} className="text-orange-400" />
            <span className="text-orange-300 text-xs font-semibold">{fr ? '14 jours gratuits — aucune carte requise' : '14-day free trial — no card required'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {fr ? 'Pret a securiser vos chantiers ?' : 'Ready to secure your jobsites?'}
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            {fr
              ? 'Rejoignez les entreprises de construction qui digitalisent leur securite avec C-Secur360.'
              : 'Join the construction companies that are digitalizing their safety with C-Secur360.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/demo/dashboard"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black text-lg transition shadow-xl shadow-orange-500/30">
              {fr ? 'Demarrer gratuitement' : 'Start for free'} <ArrowRight size={20} />
            </Link>
            <a href="mailto:info@c-secur360.ca"
              className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/8 text-white px-8 py-4 rounded-xl font-bold text-lg transition">
              <Mail size={18} /> {fr ? 'Nous ecrire' : 'Contact us'}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#060E1A] border-t border-white/8 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="C-Secur360" width={28} height={28} className="h-7 w-auto" />
            <span className="font-bold text-white text-sm">C-Secur360</span>
          </div>
          <p className="text-slate-500 text-xs text-center">
            {fr
              ? '© 2025 C-Secur360. Plateforme SaaS de securite industrielle. Tous droits reserves.'
              : '© 2025 C-Secur360. Industrial safety SaaS platform. All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:info@c-secur360.ca" className="text-slate-400 hover:text-orange-400 transition">
              <Mail size={16} />
            </a>
            <Link href="/auth/admin" className="text-slate-400 hover:text-orange-400 transition">
              <Lock size={16} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
