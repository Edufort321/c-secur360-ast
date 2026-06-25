'use client';
// Lance une INSPECTION sur un équipement donné : choisit un gabarit puis ouvre MaintInspectFill.
// Réutilisable hors de l'arbre (ex. depuis un signalement QR dans l'onglet Système, ou la planification).
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { getGabarits, type Gabarit } from '@/lib/maintGabarits';
import type { SEquip } from '@/lib/serviceTree';
import MaintInspectFill from '@/components/maintenance/MaintInspectFill';

type Tr = (fr: string, en: string) => string;

export default function InspectLauncher({ tenant, tr, equipment, onClose, onSaved }: {
  tenant: string; tr: Tr; equipment: SEquip; onClose: () => void; onSaved: () => void;
}) {
  const [gabarits, setGabarits] = useState<Gabarit[] | null>(null);
  const [gabarit, setGabarit] = useState<Gabarit | null>(null);
  useEffect(() => { getGabarits(tenant).then(setGabarits, () => setGabarits([])); }, [tenant]);

  if (gabarit) {
    return <MaintInspectFill tenant={tenant} tr={tr} gabarit={gabarit} equipment={equipment} clientId={equipment.client_id}
      onClose={onClose} onSaved={onSaved} />;
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-white">{tr('Choisir le gabarit', 'Choose the template')}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button></div>
        <p className="mb-2 text-xs text-gray-500">{equipment.name}{equipment.serial ? ` · ${equipment.serial}` : ''}</p>
        {gabarits === null ? (
          <div className="grid place-items-center py-8 text-gray-400"><Loader2 className="animate-spin" /></div>
        ) : gabarits.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">{tr('Aucun gabarit. Créez-en un dans l’onglet « Rapport de Maintenance ».', 'No template. Create one in the "Maintenance Report" tab.')}</p>
        ) : (
          <div className="space-y-2">
            {gabarits.map(g => (
              <button key={g.id} onClick={() => setGabarit(g)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-500/10">
                <span className="font-semibold text-gray-800 dark:text-gray-100">{g.name}</span>
                <span className="text-[11px] text-gray-400">{g.blocks.length} {tr('bloc(s)', 'block(s)')}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
