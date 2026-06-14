'use client';
import ModernPermitForm from '@/components/permits/ModernPermitForm';

// Travail à chaud (NFPA 51B) — soudage/coupage/meulage. Surveillance incendie ≥ 60 min après travaux.
export default function Page() {
  return <ModernPermitForm config={{
    type: 'hot_work', title: '🔥 Permis de travail à chaud', color: 'text-orange-600', btn: 'bg-orange-600 hover:bg-orange-700', prefix: 'HW',
    intro: 'NFPA 51B — soudage, coupage, meulage. Surveillance incendie obligatoire pendant ET ≥ 60 min après les travaux.',
    sections: [{
      title: 'Prévention incendie', fields: [
        { key: 'fire_watch', label: 'Surveillant d’incendie (nom)' },
        { key: 'fire_watch_minutes', label: 'Surveillance après travaux (min)', type: 'number', placeholder: '60' },
        { key: 'combustibles_cleared', label: 'Combustibles dégagés/protégés (rayon 11 m)', type: 'checkbox', placeholder: 'Fait' },
        { key: 'openings_covered', label: 'Ouvertures/fissures couvertes', type: 'checkbox', placeholder: 'Fait' },
        { key: 'extinguisher', label: 'Extincteur + boyau chargé en place', type: 'checkbox', placeholder: 'Fait' },
        { key: 'gas_test', label: 'Détection de gaz (atmosphères inflammables)' },
        { key: 'containers_purged', label: 'Contenants ayant eu des inflammables purgés', type: 'checkbox', placeholder: 'Fait' },
      ],
    }],
  }} />;
}
