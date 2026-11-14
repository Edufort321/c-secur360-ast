// Icône de module : pictogramme IPS C-360 recoloré aux couleurs C-Secur360 (public/modules/icones/<cle>.png,
// généré par scripts/recolorer_icones_ips.py). Sans image dédiée : icône vectorielle du registre dans une pastille marine.
import type { LucideIcon } from 'lucide-react';

// Clés du registre (et alias de la page publique) qui ont une icône dessinée.
const IMAGES: Record<string, string> = {
  admin: 'admin', projects: 'projects', projets: 'projects', planner: 'planner', ast: 'ast', hse: 'hse',
  permits: 'permits', inventory: 'inventory', inventaire: 'inventory', inspections: 'inspections', inspect: 'inspections',
  timesheets: 'timesheets', temps: 'timesheets', todo: 'todo', dga: 'dga', rapports: 'rapports',
};

export const moduleImage = (key: string): string | null => (IMAGES[key] ? `/modules/icones/${IMAGES[key]}.png` : null);

export function ModuleIcon({ moduleKey, icon: Icon, size = 32, muted = false, className = '' }: {
  moduleKey: string; icon?: LucideIcon; size?: number; muted?: boolean; className?: string;
}) {
  const src = moduleImage(moduleKey);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" width={size} height={size} draggable={false}
        className={`shrink-0 select-none ${muted ? 'opacity-40 grayscale' : ''} ${className}`} style={{ width: size, height: size }} />
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full text-white ${muted ? 'bg-gray-300 dark:bg-gray-700' : 'bg-[#0D1F3C] ring-2 ring-[#F26522]/70'} ${className}`}
      style={{ width: size, height: size }}>
      {Icon && <Icon size={Math.round(size * 0.5)} />}
    </span>
  );
}
