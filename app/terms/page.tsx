import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation de la plateforme C-Secur360.",
  alternates: { canonical: '/terms' },
};

const CONTACT = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'confidentialite@csecur360.ca';
const LEGAL_ENTITY = process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'C-Secur360 (CERDIA inc.)';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold">Conditions d'utilisation</h1>
      <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : 2026-06-02</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold">1. Acceptation</h2>
          <p>En accédant à la plateforme C-Secur360 exploitée par {LEGAL_ENTITY}, vous acceptez les présentes conditions. Si vous utilisez le service au nom d’une organisation, vous déclarez être autorisé à l’engager.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">2. Description du service</h2>
          <p>C-Secur360 est une plateforme SaaS modulaire de gestion de la sécurité industrielle (AST, permis, inspections, planification, feuilles de temps). Les modules disponibles dépendent de l’abonnement souscrit.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">3. Comptes et sécurité</h2>
          <p>Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée sous votre compte. Avisez-nous sans délai de tout accès non autorisé.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">4. Utilisation acceptable</h2>
          <p>Il est interdit d’utiliser le service à des fins illégales, de tenter d’y accéder sans autorisation, de le perturber, ou de contourner ses mesures de sécurité ou de cloisonnement entre organisations.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">5. Démonstration</h2>
          <p>Les accès de démonstration sont temporaires, à données partagées et fournis « tels quels », sans garantie. Ils peuvent être limités ou révoqués à tout moment.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">6. Abonnement et facturation</h2>
          <p>Les frais, cycles de facturation et conditions de renouvellement sont précisés lors de la souscription. Les paiements sont traités par notre prestataire (Stripe).</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">7. Conformité réglementaire</h2>
          <p>La plateforme est un outil d’aide à la gestion de la sécurité. Elle ne se substitue pas à votre obligation légale de conformité (CNESST, lois provinciales et fédérales applicables). Vous demeurez responsable de l’exactitude des informations saisies.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">8. Limitation de responsabilité</h2>
          <p>Dans la mesure permise par la loi, {LEGAL_ENTITY} ne saurait être tenue responsable des dommages indirects résultant de l’utilisation ou de l’impossibilité d’utiliser le service.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">9. Modifications</h2>
          <p>Nous pouvons modifier ces conditions; les changements importants seront communiqués. La poursuite de l’utilisation vaut acceptation.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">10. Droit applicable et contact</h2>
          <p>Les présentes conditions sont régies par les lois applicables au Québec (Canada). Pour toute question : <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
        </div>
      </section>
    </main>
  );
}
