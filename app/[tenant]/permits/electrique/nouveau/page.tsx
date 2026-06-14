'use client';
import ModernPermitForm from '@/components/permits/ModernPermitForm';

// Travail électrique (CSA Z462 / NFPA 70E) — hors tension privilégié, VAT, arc flash. Lié à l'AST.
export default function Page() {
  return <ModernPermitForm config={{
    type: 'electrical', title: '⚡ Permis de travail électrique', color: 'text-yellow-600', btn: 'bg-yellow-600 hover:bg-yellow-700', prefix: 'EL',
    intro: 'CSA Z462 / NFPA 70E — privilégier le travail hors tension ; VAT obligatoire ; analyse d’arc flash. (S’appuie sur l’analyse de risques AST.)',
    sections: [{
      title: 'Sécurité électrique', fields: [
        { key: 'deenergized', label: 'Travail HORS TENSION (sinon justifier le travail sous tension)', type: 'checkbox', placeholder: 'Hors tension' },
        { key: 'loto', label: 'Sources cadenassées (LOTO)', type: 'checkbox', placeholder: 'Fait' },
        { key: 'vat', label: 'Vérification d’ABSENCE de tension (VAT) avec instrument testé', type: 'checkbox', placeholder: 'Vérifié' },
        { key: 'arc_flash', label: 'Analyse d’arc flash / énergie incidente' },
        { key: 'ppe_cat', label: 'EPI arc-flash (catégorie)' },
        { key: 'approach', label: 'Distances d’approche limites respectées', type: 'checkbox', placeholder: 'OK' },
        { key: 'energized_permit', label: 'Permis de travail sous tension justifié (si requis)', type: 'textarea' },
      ],
    }],
  }} />;
}
