'use client';
import ModernPermitForm from '@/components/permits/ModernPermitForm';

// Travail en hauteur (CSTC / CSA Z259) — protection contre les chutes + PLAN DE SAUVETAGE en hauteur.
export default function Page() {
  return <ModernPermitForm config={{
    type: 'height_work', title: '🪜 Permis de travail en hauteur', color: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', prefix: 'HT',
    intro: 'CSTC / CSA Z259 — hiérarchie des mesures, ancrages conformes, tirant d’air, et plan de sauvetage (suspension trauma).',
    sections: [{
      title: 'Protection contre les chutes', fields: [
        { key: 'system', label: 'Système retenu', type: 'select', options: ['Élimination', 'Garde-corps', 'Système de retenue', 'Arrêt de chute (harnais)'] },
        { key: 'height_m', label: 'Hauteur de travail (m)', type: 'number' },
        { key: 'anchor', label: 'Points d’ancrage (résistance / certifiés)' },
        { key: 'harness_inspected', label: 'Harnais, longe et absorbeur inspectés', type: 'checkbox', placeholder: 'Fait' },
        { key: 'fall_clearance', label: 'Tirant d’air vérifié (pas d’impact au sol)', type: 'checkbox', placeholder: 'Vérifié' },
        { key: 'conditions', label: 'Conditions (vent/glace) et zone au sol sécurisées', type: 'checkbox', placeholder: 'OK' },
        { key: 'rescue_plan', label: 'Plan de sauvetage en hauteur', type: 'textarea', placeholder: 'Moyen de récupération rapide d’un travailleur suspendu…' },
      ],
    }],
  }} />;
}
