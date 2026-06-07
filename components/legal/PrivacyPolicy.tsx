// Contenu de la Politique de confidentialité (Loi 25 / RGPD), partagé par les routes
// /confidentialite (canonique, FR) et /privacy (alias historique). Une seule source à maintenir.

// Coordonnées configurables via variables d'environnement (valeurs par défaut sûres).
const CONTACT = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'confidentialite@csecur360.ca';
const PRIVACY_OFFICER = process.env.NEXT_PUBLIC_PRIVACY_OFFICER || 'Eric Dufort';
const LEGAL_ENTITY = process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'C-Secur360 (CERDIA inc.)';

// Sous-traitants / fournisseurs réellement utilisés par la plateforme.
const SUBPROCESSORS: { name: string; role: string; region: string }[] = [
  { name: 'Supabase', role: 'Base de données et authentification', region: 'États-Unis' },
  { name: 'Vercel', role: 'Hébergement et diffusion de l’application', region: 'États-Unis' },
  { name: 'Stripe', role: 'Traitement des paiements', region: 'États-Unis' },
  { name: 'Twilio', role: 'Notifications SMS et téléphonie', region: 'États-Unis' },
  { name: 'Resend', role: 'Envoi de courriels transactionnels', region: 'États-Unis' },
  { name: 'OpenAI / Anthropic', role: 'Assistants IA (aucune donnée client réelle)', region: 'États-Unis' },
  { name: 'Google Maps', role: 'Cartographie et géolocalisation d’adresses', region: 'États-Unis' },
];

export function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : 2026-06-02 · Conforme à la Loi 25 (Québec) et au RGPD.</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold">1. Responsable du traitement</h2>
          <p>{LEGAL_ENTITY} exploite C-Secur360, une plateforme SaaS de sécurité industrielle (AST, permis, inspections, planification). Pour toute question relative à vos renseignements personnels, écrivez à <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">2. Responsable de la protection des renseignements personnels</h2>
          <p>Conformément à la Loi 25, la personne responsable de la protection des renseignements personnels est <strong>{PRIVACY_OFFICER}</strong>. Vous pouvez la joindre à <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a> pour exercer vos droits ou signaler un incident.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">3. Renseignements collectés</h2>
          <p>Compte (nom, courriel, rôle), données d'utilisation des modules (formulaires AST, permis, inspections, feuilles de temps), données de démonstration (nom et courriel fournis volontairement), et données techniques (journaux, adresse IP) nécessaires au fonctionnement et à la sécurité du service.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">4. Finalités</h2>
          <p>Fourniture du service, activation et suivi des démonstrations, sécurité et prévention de la fraude, conformité légale et réglementaire, facturation, et amélioration de la plateforme. <strong>Aucune vente de renseignements personnels.</strong></p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">5. Cloisonnement multi-locataire</h2>
          <p>Les données de chaque organisation (tenant) sont isolées. Les assistants IA n'accèdent à aucune donnée client réelle.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">6. Sous-traitants et communication hors Québec</h2>
          <p>Pour fournir le service, nous faisons appel à des fournisseurs qui peuvent traiter ou héberger des renseignements <strong>à l’extérieur du Québec (principalement aux États-Unis)</strong>. Avant toute communication, nous évaluons le caractère adéquat de la protection offerte et encadrons ces communications par contrat.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="py-2 pr-4 font-semibold">Fournisseur</th>
                  <th className="py-2 pr-4 font-semibold">Rôle</th>
                  <th className="py-2 font-semibold">Région</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s) => (
                  <tr key={s.name} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">{s.name}</td>
                    <td className="py-2 pr-4">{s.role}</td>
                    <td className="py-2">{s.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">7. Conservation</h2>
          <p>Les renseignements sont conservés le temps nécessaire aux finalités ci-dessus et aux obligations légales (ex. pièces justificatives conservées 6 ans), puis détruits ou anonymisés. Les données de démonstration sont temporaires et supprimées à l’expiration de la démo.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">8. Vos droits</h2>
          <p>Accès, rectification, retrait du consentement, portabilité et, le cas échéant, suppression. Pour exercer vos droits : <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>. Vous pouvez aussi porter plainte auprès de la Commission d’accès à l’information du Québec.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">9. Sécurité</h2>
          <p>Mots de passe chiffrés (bcrypt), sessions sécurisées (cookies httpOnly), connexions chiffrées (HTTPS/HSTS) et accès restreint par rôle.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">10. Témoins (cookies)</h2>
          <p>Seuls des témoins strictement nécessaires (session, sécurité) sont utilisés. Aucun traceur publicitaire ni analytique tiers. En cas d'ajout d'outils d'analyse, un consentement préalable sera demandé.</p>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
