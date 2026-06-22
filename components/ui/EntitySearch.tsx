'use client';
// Recherche dynamique réutilisable (personnel, véhicule, projet, client…) avec SAISIE LIBRE permise
// (sous-traitant, tiers, valeur hors-tenant). Filtre les options par libellé/sous-libellé ; onPick
// remplit les champs, onText laisse taper n'importe quoi. Partagé entre Accidents, Permis, etc.
import { useState } from 'react';

export type EntityOption = { id: string; label: string; sub?: string };

export function EntitySearch({ value, onText, onPick, options, placeholder, readOnly, className }: {
  value: string;
  onText: (v: string) => void;
  onPick: (o: EntityOption) => void;
  options: EntityOption[];
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const q = (value || '').toLowerCase().trim();
  // Limite d'AFFICHAGE généreuse (la liste déroulante est scrollable) : sinon des noms valides du tenant
  // restaient cachés au-delà du 8e résultat. Sans recherche, on montre les 50 premiers ; avec recherche, 50 correspondances.
  const filtered = (q ? options.filter(o => o.label.toLowerCase().includes(q) || (o.sub || '').toLowerCase().includes(q)) : options).slice(0, 50);
  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => { onText(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        disabled={readOnly}
        className={className || 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-800'}
      />
      {open && !readOnly && filtered.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {filtered.map(o => (
            <button key={o.id} type="button" onMouseDown={e => { e.preventDefault(); onPick(o); setOpen(false); }}
              className="flex w-full flex-col items-start px-3 py-1.5 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700">
              <span className="font-medium text-gray-800 dark:text-gray-100">{o.label}</span>
              {o.sub && <span className="text-xs text-gray-400">{o.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
