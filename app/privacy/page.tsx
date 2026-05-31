import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de C-Secur360 (Loi 25 / RGPD).',
  alternates: { canonical: '/privacy' },
};

const CONTACT = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'confidentialite@csecur360.ca';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : 2026-05-30 · Conforme à la Loi 25 (Québec) et au RGPD.</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold">1. Responsable du traitement</h2>
          <p>C-Secur360 exploite une plateforme SaaS de sécurité industrielle (AST, permis, inspections). Pour toute question relative à vos renseignements personnels, écrivez à <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">2. Renseignements collectés</h2>
          <p>Compte (nom, courriel, rôle), données d'utilisation des modules (formulaires AST, permis, inspections, feuilles de temps), et données techniques (journaux, adresse IP) nécessaires au fonctionnement et à la sécurité du service.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">3. Finalités</h2>
          <p>Fourniture du service, sécurité et prévention de la fraude, conformité légale et réglementaire, facturation, et amélioration de la plateforme. Aucune vente de renseignements personnels.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">4. Cloisonnement multi-locataire</h2>
          <p>Les données de chaque organisation (tenant) sont isolées. Les assistants IA n'accèdent à aucune donnée client réelle.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">5. Conservation</h2>
          <p>Les renseignements sont conservés le temps nécessaire aux finalités ci-dessus et aux obligations légales (ex. pièces justificatives conservées 6 ans), puis détruits ou anonymisés.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">6. Vos droits</h2>
          <p>Accès, rectification, retrait du consentement, portabilité et, le cas échéant, suppression. Pour exercer vos droits : <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">7. Sécurité</h2>
          <p>Mots de passe chiffrés (bcrypt), sessions sécurisées (cookies httpOnly), connexions chiffrées (HTTPS/HSTS) et accès restreint par rôle.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">8. Témoins (cookies)</h2>
          <p>Seuls des témoins strictement nécessaires (session, sécurité) sont utilisés. Aucun traceur publicitaire tiers. En cas d'ajout d'outils d'analyse, un consentement préalable sera demandé.</p>
        </div>
      </section>
    </main>
  );
}
