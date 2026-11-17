// Icône de module : pictogramme IPS C-360.
//  - variante « orange » (défaut, dans l'app) : recoloré aux couleurs C-Secur360 (public/modules/icones, scripts/recolorer_icones_ips.py) ;
//  - variante « argent » (site public) : style noir et argent de la démo (public/modules/argent, scripts/icones_argent.py).
// Sans image dédiée : icône vectorielle du registre dans une pastille (marine/orange, ou anthracite/argent).
import type { LucideIcon } from 'lucide-react';

// Clés du registre (et alias de la page publique) qui ont une icône dessinée.
const ALIAS: Record<string, string> = {
  admin: 'admin', projects: 'projects', projets: 'projects', planner: 'planner', ast: 'ast', hse: 'hse',
  permits: 'permits', inventory: 'inventory', inventaire: 'inventory', inspections: 'inspections', inspect: 'inspections',
  timesheets: 'timesheets', temps: 'timesheets', todo: 'todo', dga: 'dga', rapports: 'rapports',
  accidents: 'accidents', maintenance: 'maintenance', conges: 'conges', marketing: 'marketing',
};
const ORANGE = new Set(['admin', 'projects', 'planner', 'ast', 'hse', 'permits', 'inventory', 'inspections', 'timesheets', 'todo', 'dga', 'rapports']);
const ARGENT = new Set([...ORANGE, 'accidents', 'maintenance', 'conges', 'marketing']);

export type VarianteIcone = 'orange' | 'argent';

export const moduleImage = (key: string, variante: VarianteIcone = 'orange'): string | null => {
  const k = ALIAS[key];
  if (!k) return null;
  if (variante === 'argent') return ARGENT.has(k) ? `/modules/argent/${k}.png` : null;
  return ORANGE.has(k) ? `/modules/icones/${k}.png` : null;
};

export function ModuleIcon({ moduleKey, icon: Icon, size = 32, muted = false, variante = 'orange', className = '' }: {
  moduleKey: string; icon?: LucideIcon; size?: number; muted?: boolean; variante?: VarianteIcone; className?: string;
}) {
  const src = moduleImage(moduleKey, variante);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" width={size} height={size} draggable={false}
        className={`shrink-0 select-none ${muted ? 'opacity-40 grayscale' : ''} ${className}`} style={{ width: size, height: size }} />
    );
  }
  const pastille = muted ? 'bg-gray-300 dark:bg-gray-700'
    : variante === 'argent' ? 'bg-[#1c1d20] ring-2 ring-[#b9bec6]/60 text-[#d7dbe0]' : 'bg-[#0D1F3C] ring-2 ring-[#F26522]/70 text-white';
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${pastille} ${className}`}
      style={{ width: size, height: size }}>
      {Icon && <Icon size={Math.round(size * 0.5)} />}
    </span>
  );
}
