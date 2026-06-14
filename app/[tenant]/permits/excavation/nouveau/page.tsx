'use client';
import ModernPermitForm from '@/components/permits/ModernPermitForm';

// Excavation / tranchée (CSTC) — localisation des services AVANT + classification du sol + étançonnement.
export default function Page() {
  return <ModernPermitForm config={{
    type: 'excavation', title: '⛏ Permis d’excavation / tranchée', color: 'text-amber-700', btn: 'bg-amber-700 hover:bg-amber-800', prefix: 'EX',
    intro: 'CSTC — localisation des services (Info-Excavation) AVANT de creuser, classification du sol, étançonnement/talutage selon la profondeur.',
    sections: [{
      title: 'Excavation', fields: [
        { key: 'locates', label: 'Localisation des services souterrains obtenue (Info-Excavation)', type: 'checkbox', placeholder: 'Obtenue' },
        { key: 'soil_class', label: 'Classification du sol (personne compétente)', type: 'select', options: ['Type 1 (dur/compact)', 'Type 2 (cohérent)', 'Type 3 (meuble/instable)'] },
        { key: 'depth_m', label: 'Profondeur (m)', type: 'number' },
        { key: 'protection', label: 'Protection des parois', type: 'select', options: ['Talutage', 'Étançonnement', 'Caisson (trench box)', 'Combinaison'] },
        { key: 'spoil_setback', label: 'Recul des déblais/charges du bord respecté', type: 'checkbox', placeholder: 'Fait' },
        { key: 'ladder', label: 'Accès/sortie (échelle ≤ 7,5 m du travailleur)', type: 'checkbox', placeholder: 'En place' },
        { key: 'atmosphere', label: 'Risque atmosphérique (si profond) → espace clos ?', type: 'checkbox', placeholder: 'Évalué' },
      ],
    }],
  }} />;
}
