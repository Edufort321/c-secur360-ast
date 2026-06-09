'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { PublicChatWidget } from '@/components/PublicChatWidget'
import { DemoStartButton } from '@/components/DemoStartButton'
import {
  Shield, Users, HardHat, Calendar, FileCheck, AlertTriangle,
  Package, ClipboardCheck, Clock, Truck,
  CheckSquare, BarChart3, ChevronLeft, ChevronRight, Lock,
  CheckCircle, Smartphone, Globe, ArrowRight, Phone, Mail,
  Building2, Star, Menu, X, FileText
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

interface DbModule {
  key: string
  name_fr: string
  name_en: string
  monthly_price: number
  sort_order: number
}

interface ModuleSlide {
  module_key: string
  image_url: string
  sort_order: number
}

// ─── Données statiques ────────────────────────────────────────────────────────

const MODULES_FR = [
  { icon: Users,          key: 'admin',       name: 'Administration',         desc: 'Gestion des utilisateurs, roles, permissions et configuration du compte.' },
  { icon: HardHat,        key: 'projets',     name: 'Projets',                desc: 'Suivi des chantiers, clients, contrats et avancements en temps reel.' },
  { icon: Calendar,       key: 'planner',     name: 'Planificateur',          desc: 'Calendrier interactif, affectation du personnel et ressources par journee.' },
  { icon: Shield,         key: 'ast',         name: 'AST / Securite',         desc: 'Analyses de securite de taches, signatures electroniques, conformite CNESST.' },
  { icon: FileCheck,      key: 'permits',     name: 'Permis de travail',      desc: 'Permis d\'espaces confines, travaux en hauteur, hot work et excavation.' },
  { icon: AlertTriangle,  key: 'accidents',   name: 'Accidents et incidents',  desc: 'Tous les incidents : accidents, passes proches, vehicules, materiels et maladies — enquete, actions correctives et suivi reglementaire.' },
  { icon: Package,        key: 'inventaire',  name: 'Inventaire',             desc: 'Gestion du stock, equipements de protection individuelle et consommables.' },
  { icon: ClipboardCheck, key: 'inspect',     name: 'Inspections',            desc: 'Listes de verification, inspections periodiques et rapports d\'etat.' },
  { icon: Clock,          key: 'temps',       name: 'Feuilles de temps',      desc: 'Saisie des heures, approbation superviseur et export comptable.' },
  { icon: Truck,          key: 'logbook',     name: 'Logbook vehicules',      desc: 'Carnet de bord numerique, kilometrage, incidents et entretien de flotte.' },
  { icon: CheckSquare,    key: 'todo',        name: 'To-Do / Taches',         desc: 'Gestion des taches, priorites, assignations et rappels automatiques.' },
  { icon: FileText,       key: 'rapports',    name: 'Rapports terrain',       desc: 'Constructeur de rapports techniques : gabarits, extraction IA de PDF/manuscrit, annotations, photos et export.' },
]

const MODULES_EN = [
  { icon: Users,          key: 'admin',       name: 'Administration',         desc: 'User management, roles, permissions and account configuration.' },
  { icon: HardHat,        key: 'projets',     name: 'Projects',               desc: 'Jobsite tracking, clients, contracts and real-time progress.' },
  { icon: Calendar,       key: 'planner',     name: 'Planner',                desc: 'Interactive calendar, personnel assignment and daily resource management.' },
  { icon: Shield,         key: 'ast',         name: 'JSA / Safety',           desc: 'Job safety analysis, electronic signatures, CNESST & OHS compliance.' },
  { icon: FileCheck,      key: 'permits',     name: 'Work Permits',           desc: 'Confined space, working at heights, hot work and excavation permits.' },
  { icon: AlertTriangle,  key: 'accidents',   name: 'Accidents & incidents',   desc: 'All incidents: accidents, near-misses, vehicle, property and illness — investigations, corrective actions and regulatory tracking.' },
  { icon: Package,        key: 'inventaire',  name: 'Inventory',              desc: 'Stock management, personal protective equipment and consumables.' },
  { icon: ClipboardCheck, key: 'inspect',     name: 'Inspections',            desc: 'Checklists, scheduled inspections and condition reports.' },
  { icon: Clock,          key: 'temps',       name: 'Timesheets',             desc: 'Time entry, supervisor approval and accounting export.' },
  { icon: Truck,          key: 'logbook',     name: 'Vehicle Logbook',        desc: 'Digital logbook, mileage, incidents and fleet maintenance tracking.' },
  { icon: CheckSquare,    key: 'todo',        name: 'Tasks / To-Do',          desc: 'Task management, priorities, assignments and automatic reminders.' },
  { icon: FileText,       key: 'rapports',    name: 'Field reports',          desc: 'Technical report builder: templates, AI extraction from PDF/handwriting, annotations, photos and export.' },
]

// Correspondance clé d'affichage (statique) -> clé en base (table modules). Sans ça, le prix ne s'affiche pas.
const DB_MODULE_KEY: Record<string, string> = {
  projets: 'projects', presque: 'near_miss', inventaire: 'inventory',
  inspect: 'inspections', temps: 'timesheets',
};

// Présentation marketing détaillée par module (carte au clic). Haut niveau, sans détail technique.
const MODULE_DETAILS: Record<string, { fr: { tagline: string; points: string[] }; en: { tagline: string; points: string[] } }> = {
  admin: {
    fr: { tagline: 'Le poste de commande complet de votre entreprise — RH, paie, comptabilité et facturation, le tout relié.', points: ['Employés, accès par niveau, mots de passe et succursales', 'Évaluation des compétences, grille salariale et progression de carrière', 'Paie & avantages, primes et commissions de vente automatiques', 'Véhicules : avantages imposables et déductions (taux ARC 2026)', 'Comptabilité en partie double : grand livre, balance, bilan et résultats', 'Facturation multi-province (TPS/TVH/TVQ/PST) avec PDF', 'Soumissions à catalogue de taux versionné et révisions', 'Transactions (achats) + rapports fiscaux : TPS/TVQ, TP-41.C, base T4/RL-1'] },
    en: { tagline: 'Your company\'s full command center — HR, payroll, accounting and billing, all connected.', points: ['Employees, level-based access, passwords and branches', 'Skills evaluation, salary grid and career progression', 'Payroll & benefits, bonuses and automatic sales commissions', 'Vehicles: taxable benefits and deductions (CRA 2026 rates)', 'Double-entry accounting: ledger, trial balance, balance sheet and P&L', 'Multi-province billing (GST/HST/QST/PST) with PDF', 'Quotes with versioned rate catalogue and revisions', 'Purchases + tax reports: GST/QST, TP-41.C, T4/RL-1 base'] },
  },
  projets: {
    fr: { tagline: 'De la soumission à la facturation, pilotez chaque chantier de bout en bout.', points: ['Soumissions hiérarchiques (items, main-d\'œuvre, matériaux)', 'Catalogue de taux versionné par année + révision « au taux actuel »', 'Transfert soumission → projet en un clic (numérotation auto)', 'Budget vs réel et avancement en temps réel', 'Matériel de projet relié à l\'inventaire', 'Tout converge vers la facturation et la comptabilité'] },
    en: { tagline: 'From quote to invoice, run every jobsite end to end.', points: ['Hierarchical quotes (items, labor, materials)', 'Year-versioned rate catalogue + revise-at-current-rate', 'One-click quote → project (auto numbering)', 'Real-time budget vs actual and progress', 'Project materials linked to inventory', 'Everything flows to billing and accounting'] },
  },
  planner: {
    fr: { tagline: 'Planifiez les travaux et les équipes comme un chef de projet aguerri.', points: ['Gantt avancé : dépendances (FS/SS/FF/SF), travaux parallèles, chemin critique', 'Pré-montage automatique du Gantt depuis la soumission', 'Modes En suite / Parallèle / Custom selon le personnel disponible', 'Affectation personnel, équipements, équipes et horaires par jour', 'Détection des conflits (congés, équipements hors service)', 'Endroit des travaux sur Google Maps + météo et alerte orage', 'Pièces jointes : plans, devis, photos'] },
    en: { tagline: 'Plan work and crews like a seasoned project manager.', points: ['Advanced Gantt: dependencies (FS/SS/FF/SF), parallel work, critical path', 'Auto-built Gantt from the quote', 'Sequential / Parallel / Custom modes based on crew availability', 'Personnel, equipment, teams and per-day schedules', 'Conflict detection (leave, out-of-service equipment)', 'Worksite on Google Maps + weather and storm alerts', 'Attachments: plans, quotes, photos'] },
  },
  ast: {
    fr: { tagline: 'Des analyses sécuritaires de tâches conformes, signées directement sur le terrain.', points: ['AST/JSEA numériques avec signatures électroniques', 'Dangers, mesures de contrôle, isolation/cadenassage et discussion d\'équipe', 'Météo et conditions du lieu pour l\'évaluation des dangers', 'Conforme aux normes provinciales (CNESST, etc.)', 'Accès et création par QR code sur le chantier', 'Conservation et traçabilité complètes'] },
    en: { tagline: 'Compliant job safety analyses, signed right in the field.', points: ['Digital JSA with electronic signatures', 'Hazards, controls, lockout/tagout and team discussion', 'Site weather and conditions for hazard assessment', 'Compliant with provincial standards (CNESST, etc.)', 'QR access and creation on the jobsite', 'Full retention and traceability'] },
  },
  permits: {
    fr: { tagline: 'Tous vos permis de travail à risque, sans papier et toujours traçables.', points: ['Espace clos, travaux à chaud, hauteur, excavation, électrique', 'Vérifications préalables obligatoires avant le début', 'Autorisations et signatures électroniques', 'Lien avec l\'AST et le projet', 'Archivage conforme'] },
    en: { tagline: 'All your high-risk work permits, paperless and always traceable.', points: ['Confined space, hot work, heights, excavation, electrical', 'Mandatory pre-checks before start', 'Authorizations and e-signatures', 'Linked to JSA and project', 'Compliant archiving'] },
  },
  accidents: {
    fr: { tagline: 'Déclarez, enquêtez et corrigez — sans jamais rien échapper.', points: ['Rapport d\'accident structuré et guidé', 'Enquête, causes et actions correctives', 'Suivi réglementaire et échéances', 'Tendances, indicateurs et tableaux de bord', 'Pièces jointes et photos'] },
    en: { tagline: 'Report, investigate and correct — nothing slips through.', points: ['Structured, guided accident report', 'Investigation, root causes and corrective actions', 'Regulatory tracking and deadlines', 'Trends, KPIs and dashboards', 'Attachments and photos'] },
  },
  presque: {
    fr: { tagline: 'Transformez chaque quasi-accident en prévention concrète.', points: ['Déclaration rapide des presque-accidents', 'Suivi proactif des dangers récurrents', 'Renforce la culture de prévention', 'Statistiques de sécurité et tendances'] },
    en: { tagline: 'Turn every near-miss into concrete prevention.', points: ['Quick near-miss reporting', 'Proactive tracking of recurring hazards', 'Strengthens prevention culture', 'Safety statistics and trends'] },
  },
  inventaire: {
    fr: { tagline: 'Maîtrisez stock, EPI et consommables, du dépôt au chantier.', points: ['Gestion du stock, des EPI et des consommables', 'Réapprovisionnement et seuils', 'Relié à la préparation de chantier du planificateur', 'Suivi par site et par projet', 'Identification par QR'] },
    en: { tagline: 'Master stock, PPE and consumables, from depot to jobsite.', points: ['Stock, PPE and consumables management', 'Restocking and thresholds', 'Linked to planner jobsite preparation', 'Per-site and per-project tracking', 'QR identification'] },
  },
  inspect: {
    fr: { tagline: 'Le dossier complet de chaque équipement et ses inspections, simples à exécuter même sur le terrain.', points: ['Fiches techniques, certifications et historique d\'entretien', 'Listes de vérification personnalisables', 'Inspections périodiques et planifiées avec rappels', 'Rapports d\'état avec photos et documents', 'Identification, création et accès par QR', 'Conformité documentée et historisée'] },
    en: { tagline: 'Each asset\'s full record and its inspections, simple to run even in the field.', points: ['Technical sheets, certifications and service history', 'Customizable checklists', 'Periodic and scheduled inspections with reminders', 'Condition reports with photos and documents', 'QR identification, creation and access', 'Documented, historized compliance'] },
  },
  temps: {
    fr: { tagline: 'Les heures, de la saisie terrain jusqu\'à la paie, sans ressaisie.', points: ['Saisie des heures par période', 'Approbation par le superviseur', 'Avantages, déductions véhicule et commissions', 'Alimente la paie et la comptabilité', 'Export comptable'] },
    en: { tagline: 'Hours, from field entry to payroll, no double entry.', points: ['Time entry by period', 'Supervisor approval', 'Benefits, vehicle deductions and commissions', 'Feeds payroll and accounting', 'Accounting export'] },
  },
  logbook: {
    fr: { tagline: 'Le carnet de bord numérique de votre flotte, conforme à l\'ARC.', points: ['Kilométrage, trajets et usage personnel', 'Incidents et entretien', 'Calcul des avantages automobiles (ARC 2026)', 'Relié à la paie et aux déductions', 'Suivi par véhicule et par employé'] },
    en: { tagline: 'Your fleet\'s digital logbook, CRA-compliant.', points: ['Mileage, trips and personal use', 'Incidents and maintenance', 'Automobile benefit calculation (CRA 2026)', 'Linked to payroll and deductions', 'Per-vehicle and per-employee tracking'] },
  },
  todo: {
    fr: { tagline: 'Rien ne tombe entre les mailles : tâches, rappels et suivi d\'équipe.', points: ['Tâches, priorités et assignations', 'Rappels automatiques', 'Suivi d\'avancement', 'Collaboration d\'équipe'] },
    en: { tagline: 'Nothing falls through the cracks: tasks, reminders and team tracking.', points: ['Tasks, priorities and assignments', 'Automatic reminders', 'Progress tracking', 'Team collaboration'] },
  },
};

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

// ─── Contact mailto ───────────────────────────────────────────────────────────

const CONTACT_MAILTO_FR = "mailto:eric.dufort@cerdia.ai?subject=Demande%20d%27information%20%E2%80%94%20C-Secur360&body=Bonjour%20Eric%2C%0A%0ANom%20%3A%20%0ACourriel%20%3A%20%0ANom%20de%20l%27entreprise%20%3A%20%0A%0AJe%20souhaite%20en%20savoir%20plus%20sur%20C-Secur360%20et%20obtenir%20un%20acces%20d%27essai."
const CONTACT_MAILTO_EN = "mailto:eric.dufort@cerdia.ai?subject=Information%20Request%20%E2%80%94%20C-Secur360&body=Hello%20Eric%2C%0A%0AName%3A%20%0AEmail%3A%20%0ACompany%20name%3A%20%0A%0AI%20would%20like%20to%20learn%20more%20about%20C-Secur360%20and%20get%20trial%20access."

// ─── Composant principal ───────────────────────────────────────────────────────

export default function LandingPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const fr = lang === 'fr'
  const [menuOpen, setMenuOpen] = useState(false)
  const [clientSubdomain, setClientSubdomain] = useState('')
  const [slideIdx, setSlideIdx] = useState(0)
  const [dbSlides, setDbSlides] = useState<Slide[] | null>(null)
  const [dbModules, setDbModules] = useState<DbModule[]>([])
  const [moduleSlides, setModuleSlides] = useState<Record<string, ModuleSlide[]>>({})
  const [perSitePrice, setPerSitePrice] = useState<number | null>(null)
  const [aiPlans, setAiPlans] = useState<{ id: string; name_fr: string; name_en: string; price_cents: number; note_fr: string | null; note_en: string | null }[]>([])
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const modules = fr ? MODULES_FR : MODULES_EN
  const heroFallback = fr ? HERO_FALLBACK_FR : HERO_FALLBACK_EN
  const testimonials = fr ? TESTIMONIALS_FR : TESTIMONIALS_EN

  // Ouvre la carte d'un module si l'URL contient ?module=<key> (lien partageable).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = new URLSearchParams(window.location.search).get('module')
    if (m) setSelectedModule(m)
  }, [])

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

  // Load module prices from DB
  useEffect(() => {
    supabase
      .from('modules')
      .select('key, name_fr, name_en, monthly_price, sort_order')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDbModules(data.map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price || 0) })))
        }
      })
  }, [])

  // Load per-site price from billing_config
  useEffect(() => {
    supabase
      .from('billing_config')
      .select('per_site_monthly')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.per_site_monthly != null) setPerSitePrice(Number(data.per_site_monthly))
      })
  }, [])

  // Load forfaits Assistant IA (jetons) — cartes de prix publiques (table ai_plans, migration 132)
  useEffect(() => {
    supabase
      .from('ai_plans')
      .select('id, name_fr, name_en, price_cents, note_fr, note_en, sort_order, active')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setAiPlans(data.map((p: any) => ({ ...p, price_cents: Number(p.price_cents || 0) })))
      })
  }, [])

  // Load module screenshots
  useEffect(() => {
    supabase
      .from('module_slides')
      .select('module_key, image_url, sort_order')
      .order('sort_order')
      .then(({ data }) => {
        if (!data) return
        const grouped: Record<string, ModuleSlide[]> = {}
        for (const row of data) {
          if (!grouped[row.module_key]) grouped[row.module_key] = []
          grouped[row.module_key].push(row)
        }
        setModuleSlides(grouped)
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
              <form onSubmit={e => { e.preventDefault(); if (clientSubdomain.trim()) { setMenuOpen(false); window.location.href = `/${clientSubdomain.trim().toLowerCase()}/login` } }}
                className="flex gap-2">
                <input
                  type="text"
                  value={clientSubdomain}
                  onChange={e => setClientSubdomain(e.target.value)}
                  placeholder={fr ? 'Nom de votre organisation' : 'Your organization name'}
                  className="flex-1 bg-[#0B1728] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
                />
                <button type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition">
                  <ArrowRight size={15} />
                </button>
              </form>
              <Link href="/auth/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition border border-white/8">
                <Lock size={14} /> {fr ? 'Acces Admin' : 'Admin Access'}
              </Link>
              <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-sm text-white font-semibold transition">
                {fr ? 'Demarrer gratuitement' : 'Start for free'} <ArrowRight size={14} />
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero Carousel ───────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {dbSlides ? (
          dbSlides.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center bg-no-repeat ${idx === slideIdx ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${s.image_url})` }}
            >
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
              <DemoStartButton fr={fr}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-bold text-base transition shadow-lg shadow-orange-500/25" />
              <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN}
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/8 px-7 py-3.5 rounded-xl font-semibold text-base transition">
                <Mail size={16} /> {fr ? 'Ecrire a l\'equipe' : 'Contact the team'}
              </a>
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

      {/* ── Acces tenant ───────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto bg-[#0D1F3C] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
            <Globe size={16} className="text-orange-400" />
            {fr ? 'Acces portail client' : 'Client portal access'}
          </h3>
          <p className="text-slate-400 text-xs mb-4">
            {fr ? 'Entrez le nom de votre organisation pour acceder a votre portail.' : 'Enter your organization name to access your portal.'}
          </p>
          <form onSubmit={e => { e.preventDefault(); if (clientSubdomain.trim()) window.location.href = `/${clientSubdomain.trim().toLowerCase()}/login` }}
            className="flex gap-2">
            <input
              type="text"
              value={clientSubdomain}
              onChange={e => setClientSubdomain(e.target.value)}
              placeholder={fr ? 'ex: construction-abc' : 'ex: construction-abc'}
              className="flex-1 min-w-0 bg-[#0B1728] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
            />
            <button type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap">
              <ArrowRight size={15} />
              {fr ? 'Acceder' : 'Go'}
            </button>
          </form>
          <p className="text-slate-500 text-xs mt-3">
            {fr ? 'URL: www.c-secur360.ca/votre-organisation' : 'URL: www.c-secur360.ca/your-organization'}
          </p>
        </div>
      </section>

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
          {modules.map((mod) => {
            const slides = moduleSlides[mod.key] || []
            const dbMod = dbModules.find(d => d.key === (DB_MODULE_KEY[mod.key] || mod.key))
            const det = MODULE_DETAILS[mod.key]?.[fr ? 'fr' : 'en']
            return (
              <div key={mod.key}
                onClick={() => setSelectedModule(mod.key)}
                className="group relative bg-[#111c30] border border-white/8 rounded-xl p-5 hover:border-orange-500/50 hover:bg-[#142038] transition-all duration-300 cursor-pointer">
                {/* Header toujours visible */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/30 group-hover:scale-110 transition-all duration-300">
                    <mod.icon size={20} className="text-orange-400" />
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-bold text-orange-400 whitespace-nowrap">
                    {dbMod && dbMod.monthly_price > 0 ? `${dbMod.monthly_price}$/an` : (fr ? 'Inclus' : 'Included')}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm mt-3 mb-0">{mod.name}</h3>

                {/* Accroche TOUJOURS visible (la pub se voit sans cliquer) */}
                {det && <p className="text-xs text-orange-300/90 leading-snug mt-1.5">{det.tagline}</p>}

                {/* Détail au survol : points clés + aperçus + invite au clic */}
                <div className="overflow-hidden max-h-0 group-hover:max-h-72 transition-all duration-500 ease-in-out">
                  {det && det.points.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {det.points.slice(0, 4).map((p, i) => (
                        <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-slate-300">
                          <span className="text-orange-400">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {slides.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                      {slides.slice(0, 3).map((s, i) => (
                        <img key={i} src={s.image_url} alt=""
                          className="h-16 w-24 object-cover rounded-lg flex-shrink-0 border border-white/10" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Indice de clic toujours visible */}
                <p className="mt-2 text-[10px] font-semibold text-orange-400/80 group-hover:text-orange-400">
                  {fr ? 'Cliquer pour le détail →' : 'Click for details →'}
                </p>
              </div>
            )
          })}
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
                { icon: Building2, title: fr ? 'Multi-sites & multi-clients' : 'Multi-site & multi-client', desc: fr
                    ? `Chaque client a son portail prive avec URL dediee. Facturation additive par site${perSitePrice != null ? ` (+${perSitePrice}$/mois/site)` : ''}.`
                    : `Each client has a private portal with dedicated URL. Additive billing per site${perSitePrice != null ? ` (+$${perSitePrice}/month/site)` : ''}.` },
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
      {(() => {
        // monthly_price dans la DB = prix ANNUEL par module (nom de colonne trompeur)
        // Gratuit = prix 0 (configurable par l'admin) ; payant = prix > 0
        const paidModules = dbModules.filter(m => m.monthly_price > 0)
        const freeModules = dbModules.filter(m => (m.monthly_price || 0) === 0)
        const freeLabel = freeModules.length > 0 ? freeModules.map(m => fr ? m.name_fr : m.name_en).join(' + ') : ''
        const subtotal = paidModules.length > 0
          ? paidModules.reduce((s, m) => s + m.monthly_price, 0)
          : STATIC_PLANS_FR[1].annual
        // Rabais: -5% par module additionnel, plafonné à -30%
        const discountPct = paidModules.length > 0
          ? Math.min(Math.max(paidModules.length - 1, 0) * 5, 30)
          : 0
        const totalAnnual = Math.round(subtotal * (1 - discountPct / 100))
        // Starter ~ 5 modules payants, rabais ~20% (4 mod additionnels)
        const starterSubtotal = paidModules.length > 0
          ? paidModules.slice(0, 5).reduce((s, m) => s + m.monthly_price, 0)
          : Math.round(STATIC_PLANS_FR[0].annual)
        const starterAnnual = Math.round(starterSubtotal * (1 - Math.min(4 * 5, 30) / 100))
        const hasPrices = paidModules.length > 0

        return (
          <section id="pricing" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20">
            <div className="text-center mb-10">
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
                {fr ? 'Tarification' : 'Pricing'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                {fr ? 'Prix transparents, sans surprise.' : 'Transparent pricing, no surprises.'}
              </h2>
              <p className="text-slate-400 text-sm mb-6">{fr ? 'Tarification annuelle · prix definis par l\'administrateur' : 'Annual pricing · prices set by administrator'}</p>

              {/* Badge rabais + modules gratuits */}
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5">
                  <span className="text-emerald-400 font-black text-sm">-5%</span>
                  <span className="text-emerald-300 text-xs">{fr ? 'par module additionnel (max -30%)' : 'per additional module (max -30%)'}</span>
                </div>
                {freeLabel && (
                  <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-1.5">
                    <span className="text-orange-300 text-xs font-semibold">{fr ? `${freeLabel} inclus GRATUITEMENT` : `${freeLabel} FREE with any module`}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-[#111c30] border border-white/8 rounded-2xl p-6 flex flex-col">
                <h3 className="font-black text-white text-lg mb-1">Starter</h3>
                <p className="text-slate-400 text-xs mb-4">{fr ? '1 site · 5 modules au choix' : '1 site · 5 modules of your choice'}</p>
                <div className="my-2 mb-5">
                  <p className="text-3xl font-black text-white">
                    {starterAnnual}$<span className="text-base font-normal text-slate-400">/an</span>
                  </p>
                  <p className="text-slate-400 text-xs mt-1">{fr ? '5 modules · rabais cumule inclus' : '5 modules · cumulative discount included'}</p>
                </div>
                <div className="space-y-2 flex-1 mb-6">
                  {[
                    fr ? '5 modules au choix' : '5 modules of your choice',
                    fr ? `${freeLabel || 'Administration + To-Do'} GRATUITS` : `${freeLabel || 'Administration + To-Do'} FREE`,
                    fr ? '1 site' : '1 site',
                    fr ? 'Application mobile PWA' : 'Mobile PWA app',
                    fr ? 'Support courriel' : 'Email support',
                  ].map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={13} className={j === 1 ? 'text-orange-400 flex-shrink-0' : 'text-emerald-400 flex-shrink-0'} />{f}
                    </div>
                  ))}
                </div>
                <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN}
                  className="w-full text-center py-3 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/8 transition">
                  {fr ? 'Demarrer gratuitement' : 'Start for free'}
                </a>
              </div>

              {/* Professionnel — prix live depuis DB */}
              <div className="relative bg-[#1a2744] border border-orange-500/50 rounded-2xl p-6 flex flex-col shadow-xl shadow-orange-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {fr ? 'Plus populaire' : 'Most popular'}
                </div>
                <h3 className="font-black text-white text-lg mb-1">{fr ? 'Professionnel' : 'Professional'}</h3>
                <p className="text-slate-400 text-xs mb-4">{fr ? 'Tous les modules · multi-sites' : 'All modules · multi-site'}</p>
                <div className="my-2 mb-5">
                  <p className="text-3xl font-black text-white">
                    {totalAnnual}$<span className="text-base font-normal text-slate-400">/an</span>
                  </p>
                  {discountPct > 0 && (
                    <p className="text-emerald-400 text-xs mt-1 font-semibold">
                      {fr ? `Rabais -${discountPct}% applique` : `-${discountPct}% discount applied`}
                    </p>
                  )}
                  {hasPrices && (
                    <p className="text-slate-500 text-xs mt-1">{fr ? 'Prix en direct depuis l\'admin' : 'Live price from admin'}</p>
                  )}
                </div>
                <div className="space-y-2 flex-1 mb-6">
                  {[
                    fr ? `${dbModules.length || 13} modules${freeLabel ? ` (${freeLabel} gratuits)` : ''}` : `${dbModules.length || 13} modules${freeLabel ? ` (${freeLabel} free)` : ''}`,
                    perSitePrice != null
                      ? (fr ? `Multi-sites (+${perSitePrice}$/mois/site additionnel)` : `Multi-site (+$${perSitePrice}/month/additional site)`)
                      : (fr ? 'Multi-sites (prix sur demande)' : 'Multi-site (price on request)'),
                    fr ? 'Application mobile PWA' : 'Mobile PWA app',
                    fr ? 'Support 24/7' : '24/7 support',
                    fr ? 'Analytics avances' : 'Advanced analytics',
                  ].map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={13} className={j === 0 ? 'text-orange-400 flex-shrink-0' : 'text-emerald-400 flex-shrink-0'} />{f}
                    </div>
                  ))}
                </div>
                <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN}
                  className="w-full text-center py-3 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white transition">
                  {fr ? 'Demarrer gratuitement' : 'Start for free'}
                </a>
              </div>

              {/* Entreprise */}
              <div className="bg-[#111c30] border border-white/8 rounded-2xl p-6 flex flex-col">
                <h3 className="font-black text-white text-lg mb-1">{fr ? 'Entreprise' : 'Enterprise'}</h3>
                <p className="text-slate-400 text-xs mb-4">{fr ? 'Volumes · ERP · SLA dedie' : 'Volume · ERP · Dedicated SLA'}</p>
                <div className="my-2 mb-5">
                  <p className="text-3xl font-black text-white">{fr ? 'Sur mesure' : 'Custom'}</p>
                  <p className="text-slate-400 text-sm mt-1">{fr ? 'Contactez-nous' : 'Contact us'}</p>
                </div>
                <div className="space-y-2 flex-1 mb-6">
                  {[
                    fr ? 'Modules sur mesure' : 'Custom modules',
                    fr ? 'Sites illimites' : 'Unlimited sites',
                    fr ? 'Integrations ERP' : 'ERP integrations',
                    fr ? 'SLA garanti' : 'Guaranteed SLA',
                    fr ? 'Formation incluse' : 'Training included',
                  ].map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN}
                  className="w-full text-center py-3 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/8 transition">
                  {fr ? 'Nous contacter' : 'Contact us'}
                </a>
              </div>
            </div>

            {/* Detail par module (prix annuels) */}
            {hasPrices && (
              <div className="mt-12 max-w-3xl mx-auto">
                <p className="text-center text-slate-400 text-xs uppercase tracking-widest mb-4">
                  {fr ? 'Detail par module · prix annuel brut (avant rabais)' : 'Per-module detail · annual list price (before discount)'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {freeModules.map(m => (
                    <div key={m.key} className="flex items-center justify-between bg-[#0D1F3C] border border-orange-500/20 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-300">{fr ? m.name_fr : m.name_en}</span>
                      <span className="text-xs font-bold text-orange-400 ml-2">{fr ? 'GRATUIT' : 'FREE'}</span>
                    </div>
                  ))}
                  {paidModules.map(m => (
                    <div key={m.key} className="flex items-center justify-between bg-[#0D1F3C] border border-white/5 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-300">{fr ? m.name_fr : m.name_en}</span>
                      <span className="text-xs font-bold text-orange-400 ml-2">{m.monthly_price}$/an</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[#0D1F3C] border border-emerald-500/20 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-emerald-300 text-xs font-semibold">
                    {fr ? `Sous-total brut : ${subtotal}$/an · Rabais -${discountPct}% · Total final : ${totalAnnual}$/an` : `Subtotal: $${subtotal}/yr · -${discountPct}% discount · Final: $${totalAnnual}/yr`}
                  </p>
                  {freeLabel && (
                    <p className="text-slate-500 text-xs">
                      {fr ? `${freeLabel} GRATUITS` : `${freeLabel} FREE`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Forfaits Assistant IA (jetons) — cartes ajustables via l'admin (table ai_plans) */}
            {aiPlans.length > 0 && (
              <div className="mt-16 max-w-5xl mx-auto">
                <div className="text-center mb-6">
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
                    {fr ? 'Option · Assistants IA' : 'Add-on · AI assistants'}
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {fr ? 'Forfaits de jetons IA' : 'AI token plans'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {fr ? 'Recherche de prix, import intelligent et assistants — en sus de votre abonnement.' : 'Price research, smart import and assistants — on top of your subscription.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiPlans.map(p => (
                    <div key={p.id} className="group relative bg-[#111c30] border border-white/8 rounded-xl p-5 hover:border-orange-500/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white">{fr ? p.name_fr : p.name_en}</h4>
                        <span className="whitespace-nowrap rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-bold text-orange-400">{Math.round(p.price_cents / 100)}$/an</span>
                      </div>
                      {(fr ? p.note_fr : p.note_en) && (
                        <p className="mt-2 text-xs text-slate-400">{fr ? p.note_fr : p.note_en}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )
      })()}

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
            <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black text-lg transition shadow-xl shadow-orange-500/30">
              {fr ? 'Demarrer gratuitement' : 'Start for free'} <ArrowRight size={20} />
            </a>
            <a href={fr ? CONTACT_MAILTO_FR : CONTACT_MAILTO_EN}
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
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs text-center">
              {fr
                ? `© ${new Date().getFullYear()} Commerce CERDIA inc. — C-Secur360. Plateforme SaaS de securite industrielle. Tous droits reserves.`
                : `© ${new Date().getFullYear()} Commerce CERDIA inc. — C-Secur360. Industrial safety SaaS platform. All rights reserved.`}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/confidentialite" className="text-slate-400 hover:text-orange-400 transition">
                {fr ? 'Politique de confidentialité' : 'Privacy policy'}
              </Link>
              <span className="text-slate-600">·</span>
              <Link href="/terms" className="text-slate-400 hover:text-orange-400 transition">
                {fr ? "Conditions d'utilisation" : 'Terms of use'}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:eric.dufort@cerdia.ai" className="text-slate-400 hover:text-orange-400 transition">
              <Mail size={16} />
            </a>
            <Link href="/auth/admin" className="text-slate-400 hover:text-orange-400 transition">
              <Lock size={16} />
            </Link>
          </div>
        </div>
        {/* Propulsé par CERDIA */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center justify-center gap-2 border-t border-white/5 pt-5">
          <span className="text-slate-500 text-xs">{fr ? 'Propulsé par' : 'Powered by'}</span>
          <Image src="/logo-cerdia3.png" alt="CERDIA" width={120} height={28} className="h-6 w-auto opacity-90" />
        </div>
      </footer>

      {/* Carte marketing détaillée d'un module (au clic) */}
      {selectedModule && (() => {
        const mod = modules.find(m => m.key === selectedModule)
        const d = MODULE_DETAILS[selectedModule]?.[fr ? 'fr' : 'en']
        if (!mod) return null
        const slides = moduleSlides[selectedModule] || []
        const dbMod = dbModules.find(x => x.key === selectedModule)
        return (
          <div onClick={() => setSelectedModule(null)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
            <div onClick={e => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0D1F3C] p-6">
              <button onClick={() => setSelectedModule(null)} aria-label="Fermer" className="absolute right-3 top-3 text-2xl text-slate-400 hover:text-white">×</button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/15">
                  <mod.icon size={24} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{mod.name}</h3>
                  {dbMod && dbMod.monthly_price > 0 && <span className="text-xs font-bold text-orange-400">{dbMod.monthly_price}$/an</span>}
                </div>
              </div>
              {d && <p className="mt-4 font-semibold text-orange-300">{d.tagline}</p>}
              <p className="mt-2 text-sm text-slate-300">{mod.desc}</p>
              {d && (
                <ul className="mt-4 space-y-2">
                  {d.points.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-200">
                      <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-orange-400" />{p}
                    </li>
                  ))}
                </ul>
              )}
              {slides.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {slides.slice(0, 3).map((s, i) => (
                    <img key={i} src={s.image_url} alt="" className="h-24 w-36 flex-shrink-0 rounded-lg border border-white/10 object-cover" />
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="mailto:eric.dufort@cerdia.ai?subject=Démo C-Secur360" className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-orange-600">
                  {fr ? 'Demander une démo' : 'Request a demo'}
                </a>
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/?module=${selectedModule}`
                    const shareData = { title: `C-Secur360 — ${mod.name}`, text: (d?.tagline || mod.desc), url }
                    try {
                      if (navigator.share) { await navigator.share(shareData) }
                      else { await navigator.clipboard.writeText(url); alert(fr ? 'Lien copié dans le presse-papiers !' : 'Link copied to clipboard!') }
                    } catch { /* annulé */ }
                  }}
                  className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-white/5">
                  {fr ? '🔗 Partager' : '🔗 Share'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <PublicChatWidget />
    </div>
  )
}
