// =====================================================
// REGISTRE DES MODULES — source unique pour la navigation, le gating et le pricing.
// Ajouter un module futur = une entrée ici (+ ses pages sous app/[tenant]/<basePath>/).
// =====================================================
import { Shield, ShieldCheck, CalendarRange, Package, FolderKanban, FileCheck, AlertTriangle, ClipboardCheck, ListChecks, Settings, CalendarClock, Car, FlaskConical, Plane, FileText, Megaphone, Wrench, type LucideIcon } from 'lucide-react';

export type ModuleKey = 'admin' | 'projects' | 'ast' | 'hse' | 'permits' | 'accidents' | 'near_miss' | 'planner' | 'inventory' | 'equipment' | 'inspections' | 'maintenance' | 'timesheets' | 'logbook' | 'todo' | 'dga' | 'conges' | 'rapports' | 'marketing';
export type ModuleStatus = 'available' | 'soon';

export interface ModuleDef {
  key: ModuleKey;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  icon: LucideIcon;
  basePath: string;        // segment sous /[tenant]/
  color: string;           // accent (tailwind text/bg via classes ci-dessous)
  accent: string;          // classe de fond pour l'icône
  status: ModuleStatus;    // 'available' = écran prêt ; 'soon' = à venir/à activer
}

export const MODULES: ModuleDef[] = [
  {
    key: 'admin',
    labelFr: 'Administration', labelEn: 'Administration',
    descFr: "Profils utilisateurs du tenant, rôles et niveaux d'accès.",
    descEn: 'Tenant user profiles, roles and access levels.',
    icon: Settings, basePath: 'admin', color: 'text-slate-600', accent: 'bg-slate-700', status: 'available',
  },
  {
    key: 'projects',
    labelFr: 'Projets', labelEn: 'Projects',
    descFr: 'Moteur central : devis, taux, matériel — génère le # qui circule partout.',
    descEn: 'Central engine: quotes, rates, materials — generates the # used everywhere.',
    icon: FolderKanban, basePath: 'projects', color: 'text-blue-600', accent: 'bg-blue-600', status: 'available',
  },
  {
    key: 'planner',
    labelFr: 'Planificateur', labelEn: 'Scheduler',
    descFr: 'Planification des travaux et des ressources, calendrier, congés.',
    descEn: 'Work and resource scheduling, calendar, time-off.',
    icon: CalendarRange, basePath: 'planificateur', color: 'text-violet-600', accent: 'bg-violet-600', status: 'available',
  },
  {
    key: 'ast',
    labelFr: 'AST', labelEn: 'JSA',
    descFr: 'Analyses sécuritaires de tâches (AST/JSA), dangers, mesures de contrôle, LOTO.',
    descEn: 'Job safety analyses (JSA), hazards, control measures, LOTO.',
    icon: Shield, basePath: 'ast', color: 'text-emerald-600', accent: 'bg-emerald-600', status: 'available',
  },
  {
    key: 'hse',
    labelFr: 'Registres & KPI (SST)', labelEn: 'Registers & KPIs (HSE)',
    descFr: 'Registres réglementaires (normes canadiennes), échéances CNESST, KPI LTIFR/TRIR/gravité, incidents + CAPA, journal d’audit. Accès niveau administration.',
    descEn: 'Regulatory registers (Canadian standards), CNESST deadlines, LTIFR/TRIR/severity KPIs, incidents + CAPA, audit log. Administration level.',
    icon: ShieldCheck, basePath: 'hse', color: 'text-emerald-700', accent: 'bg-emerald-700', status: 'available',
  },
  {
    key: 'permits',
    labelFr: 'Permis', labelEn: 'Permits',
    descFr: 'Permis de travail, espaces clos (CSA), conditions et mesures de sécurité.',
    descEn: 'Work permits, confined spaces (CSA), conditions and safety measures.',
    icon: FileCheck, basePath: 'permits', color: 'text-cyan-600', accent: 'bg-cyan-600', status: 'available',
  },
  {
    key: 'accidents',
    labelFr: 'Accidents et incidents', labelEn: 'Accidents & incidents',
    descFr: 'Déclaration et suivi de tous les incidents : accidents, passés proches, véhicules, matériels, maladies — avec actions correctives.',
    descEn: 'Reporting and tracking of all incidents: accidents, near-misses, vehicle, property, illness — with corrective actions.',
    icon: AlertTriangle, basePath: 'accidents', color: 'text-red-600', accent: 'bg-red-600', status: 'available',
  },
  {
    key: 'inventory',
    labelFr: 'Inventaire', labelEn: 'Inventory',
    descFr: 'Gestion des stocks, emplacements, codes QR, valorisation.',
    descEn: 'Stock management, locations, QR codes, valuation.',
    icon: Package, basePath: 'inventory', color: 'text-amber-600', accent: 'bg-amber-600', status: 'available',
  },
  {
    key: 'inspections',
    labelFr: "Inspections d'équipement", labelEn: 'Equipment inspections',
    descFr: 'Fiches équipements (QR, photos, province) et inspections normalisées à fréquence personnalisable (ex. lift quotidien), formulaire via scan QR. Vendable aux compagnies de location.',
    descEn: 'Equipment sheets (QR, photos, province) and standardized inspections with customizable frequency (e.g. daily lift), QR-scan form. Sellable to rental companies.',
    icon: ClipboardCheck, basePath: 'inspections', color: 'text-teal-600', accent: 'bg-teal-600', status: 'available',
  },
  {
    key: 'maintenance',
    labelFr: "Maintenance d'équipement", labelEn: 'Equipment maintenance',
    descFr: "Programme de maintenance (GMAO) : gabarits dupliquables par machine, QR à coller, séquences d'entretien + correctifs, chrono du temps, coûts annuels par équipement (MO + pièces), dashboard et cédulage planner.",
    descEn: 'Maintenance program (CMMS): templates duplicable per machine, stick-on QR, maintenance sequences + corrective actions, time clock, annual cost per equipment (labor + parts), dashboard and planner scheduling.',
    icon: Wrench, basePath: 'maintenance', color: 'text-orange-600', accent: 'bg-orange-600', status: 'available',
  },
  {
    key: 'timesheets',
    labelFr: 'Feuille de temps', labelEn: 'Timesheets',
    descFr: 'Feuilles de temps des employés pour la paie (heures, approbation, export).',
    descEn: 'Employee timesheets for payroll (hours, approval, export).',
    icon: CalendarClock, basePath: 'timesheets', color: 'text-sky-600', accent: 'bg-sky-600', status: 'available',
  },
  {
    key: 'logbook',
    labelFr: 'Logbook véhicules', labelEn: 'Vehicle logbook',
    descFr: "Odomètre hebdomadaire, déduction personnel/professionnel, export TP-41 / T777.",
    descEn: 'Weekly odometer log, personal/professional split, TP-41 / T777 export.',
    icon: Car, basePath: 'logbook', color: 'text-teal-600', accent: 'bg-teal-600', status: 'available',
  },
  {
    key: 'todo',
    labelFr: 'To-Do / Tâches', labelEn: 'To-Do / Tasks',
    descFr: 'Tâches : suivi, assignation, liste de vérification, photos, échéances.',
    descEn: 'Task list: tracking, assignment, checklist, photos, due dates.',
    icon: ListChecks, basePath: 'todo', color: 'text-indigo-600', accent: 'bg-indigo-600', status: 'available',
  },
  {
    key: 'dga',
    labelFr: 'Diagnostic DGA', labelEn: 'DGA Diagnostic',
    descFr: 'Analyse de gaz dissous (huile de transformateur) : IEEE C57.104 + Triangle de Duval, historique.',
    descEn: 'Dissolved gas analysis (transformer oil): IEEE C57.104 + Duval Triangle, history.',
    icon: FlaskConical, basePath: 'dga', color: 'text-rose-600', accent: 'bg-rose-600', status: 'available',
  },
  {
    key: 'conges',
    labelFr: 'Congés', labelEn: 'Time off',
    descFr: 'Demandes de congés (vacances, maladie, formation), approbation superviseur, soldes.',
    descEn: 'Time-off requests (vacation, sick, training), supervisor approval, balances.',
    icon: Plane, basePath: 'conges', color: 'text-violet-600', accent: 'bg-violet-600', status: 'available',
  },
  {
    key: 'rapports',
    labelFr: 'Rapports terrain', labelEn: 'Field reports',
    descFr: "Constructeur de rapports techniques : gabarits, extraction IA de PDF/manuscrit, annotations, photos, export.",
    descEn: 'Technical report builder: templates, AI extraction from PDF/handwriting, annotations, photos, export.',
    icon: FileText, basePath: 'rapports', color: 'text-fuchsia-600', accent: 'bg-fuchsia-600', status: 'available',
  },
  {
    key: 'marketing',
    labelFr: 'Marketing IA', labelEn: 'AI Marketing',
    descFr: "Studio marketing IA : scripts, vidéos (avatar ou vidéo réelle + slides), posts et courriels conformes. L'IA s'appuie sur VOTRE profil d'entreprise. Consommation IA selon votre forfait.",
    descEn: 'AI marketing studio: scripts, videos (avatar or real video + slides), posts and compliant emails. The AI uses YOUR company profile. AI usage per your plan.',
    icon: Megaphone, basePath: 'marketing', color: 'text-pink-600', accent: 'bg-pink-600', status: 'available',
  },
];

export const getModule = (key: ModuleKey) => MODULES.find(m => m.key === key);
