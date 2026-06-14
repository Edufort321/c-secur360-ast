'use client';
import ModernPermitForm from '@/components/permits/ModernPermitForm';

// Travail sous pression (CSA B51) — dépressurisation/isolement, purge à zéro, essai hydro privilégié.
export default function Page() {
  return <ModernPermitForm config={{
    type: 'pressure', title: '⚙ Permis — travail sous pression', color: 'text-slate-700', btn: 'bg-slate-700 hover:bg-slate-800', prefix: 'PR',
    intro: 'CSA B51 — dépressurisation/isolement (voir LOTO), purge de l’énergie résiduelle à zéro, essai hydrostatique privilégié au pneumatique.',
    sections: [{
      title: 'Mise en sécurité', fields: [
        { key: 'depressurized', label: 'Système dépressurisé et isolé (cadenassé)', type: 'checkbox', placeholder: 'Fait' },
        { key: 'purge', label: 'Énergie de pression résiduelle purgée et vérifiée à zéro', type: 'checkbox', placeholder: 'Vérifié' },
        { key: 'test_type', label: 'Type d’essai sous pression', type: 'select', options: ['Hydrostatique (privilégié)', 'Pneumatique'] },
        { key: 'limits', label: 'Pression d’essai / limites définies' },
        { key: 'perimeter', label: 'Périmètre de sécurité établi durant l’essai', type: 'checkbox', placeholder: 'Établi' },
        { key: 'instruments', label: 'Soupapes/instruments calibrés et conformes', type: 'checkbox', placeholder: 'OK' },
      ],
    }],
  }} />;
}
