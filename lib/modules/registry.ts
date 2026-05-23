// =====================================================
// REGISTRE DES MODULES — source unique pour la navigation, le gating et le pricing.
// Ajouter un module futur = une entrée ici (+ ses pages sous app/[tenant]/<basePath>/).
// =====================================================
import { Shield, CalendarRange, Package, FolderKanban, FileCheck, AlertTriangle, AlertOctagon, ClipboardCheck, ListChecks, Settings, CalendarClock, Car, type LucideIcon } from 'lucide-react';

export type ModuleKey = 'admin' | 'projects' | 'ast' | 'permits' | 'accidents' | 'near_miss' | 'planner' | 'inventory' | 'inspections' | 'timesheets' | 'logbook' | 'todo';
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
    labelFr: 'AST / Sécurité', labelEn: 'JSA / Safety',
    descFr: 'Analyses sécuritaires de tâches, permis, registre travailleurs, LOTO.',
    descEn: 'Job safety analyses, permits, worker registry, LOTO.',
    icon: Shield, basePath: 'ast', color: 'text-emerald-600', accent: 'bg-emerald-600', status: 'available',
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
    labelFr: 'Accidents', labelEn: 'Accidents',
    descFr: 'Déclaration et suivi des accidents et incidents.',
    descEn: 'Accident and incident reporting and tracking.',
    icon: AlertTriangle, basePath: 'accidents', color: 'text-red-600', accent: 'bg-red-600', status: 'available',
  },
  {
    key: 'near_miss',
    labelFr: 'Presque-accidents', labelEn: 'Near-miss',
    descFr: 'Événements à haut potentiel (presque-accidents) et actions correctives.',
    descEn: 'High-potential events (near-misses) and corrective actions.',
    icon: AlertOctagon, basePath: 'near-miss', color: 'text-orange-600', accent: 'bg-orange-600', status: 'available',
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
    descFr: 'Inspections normalisées à fréquence personnalisable (ex. lift quotidien), formulaire via scan QR. Vendable aux compagnies de location.',
    descEn: 'Standardized inspections with customizable frequency (e.g. daily lift), QR-scan form. Sellable to rental companies.',
    icon: ClipboardCheck, basePath: 'inspections', color: 'text-teal-600', accent: 'bg-teal-600', status: 'available',
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
    descFr: 'Liste de tâches du tenant : suivi, assignation, échéances. (à développer)',
    descEn: 'Tenant task list: tracking, assignment, due dates. (to be developed)',
    icon: ListChecks, basePath: 'todo', color: 'text-indigo-600', accent: 'bg-indigo-600', status: 'soon',
  },
];

export const getModule = (key: ModuleKey) => MODULES.find(m => m.key === key);
