import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

// Menu d'actions compact pour MOBILE — regroupe les boutons de barre d'outils éparpillés d'une vue
// (Ajouter / Filtres / Imprimer / Exporter / Importer / Réinitialiser…) dans un seul ☰, à la façon du
// planificateur. À utiliser dans un conteneur `lg:hidden`, pendant que les boutons d'origine restent
// affichés en `hidden lg:flex` sur desktop (comportement desktop inchangé).
//
// items: Array<{ key, label, icon?: LucideIcon, onClick, variant?: 'danger'|'primary'|'default',
//                active?: boolean, hidden?: boolean }>
export default function MobileActionsMenu({ items = [], label = 'Actions', align = 'right', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('touchstart', onDoc); };
  }, [open]);

  const visible = items.filter(it => it && !it.hidden);
  if (!visible.length) return null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical size={16} /> {label}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-1 min-w-[210px] max-w-[85vw] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {visible.map(it => {
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                type="button"
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(e); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  it.variant === 'danger' ? 'text-red-600 dark:text-red-400'
                    : it.active ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {Icon && <Icon size={16} className="shrink-0" />}
                <span className="truncate">{it.label}</span>
                {it.active && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
