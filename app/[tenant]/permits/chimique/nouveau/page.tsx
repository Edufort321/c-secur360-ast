'use client';
import ModernPermitForm from '@/components/permits/ModernPermitForm';

// Produits chimiques (SIMDUT/SGH) — FDS, compatibilité, ventilation, EPI, plan de déversement.
export default function Page() {
  return <ModernPermitForm config={{
    type: 'chemical', title: '🧪 Permis — produits chimiques', color: 'text-green-700', btn: 'bg-green-700 hover:bg-green-800', prefix: 'CH',
    intro: 'SIMDUT 2015 / SGH — fiches de données de sécurité (FDS), compatibilité, ventilation, EPI, plan de déversement.',
    sections: [{
      title: 'Produits & maîtrise', fields: [
        { key: 'products', label: 'Produits utilisés', type: 'textarea', placeholder: 'noms commerciaux / n° CAS' },
        { key: 'sds', label: 'FDS (SDS) disponibles et consultées', type: 'checkbox', placeholder: 'Fait' },
        { key: 'compatibility', label: 'Compatibilité des produits vérifiée', type: 'checkbox', placeholder: 'Vérifiée' },
        { key: 'ventilation', label: 'Ventilation / captation à la source' },
        { key: 'ppe', label: 'EPI selon la FDS (gants, respiratoire, oculaire)' },
        { key: 'eyewash', label: 'Douche oculaire / d’urgence accessible', type: 'checkbox', placeholder: 'OK' },
        { key: 'spill_plan', label: 'Plan de déversement + absorbants en place', type: 'textarea' },
      ],
    }],
  }} />;
}
