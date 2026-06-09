// Contenu de la Politique de confidentialité (Loi 25 / RGPD), partagé par les routes
// /confidentialite (canonique, FR) et /privacy (alias historique). Une seule source à maintenir.

// Coordonnées configurables via variables d'environnement (valeurs par défaut sûres).
const CONTACT = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'confidentialite@cerdia.ai';
const PRIVACY_OFFICER = process.env.NEXT_PUBLIC_PRIVACY_OFFICER || 'Eric Dufort';
const LEGAL_ENTITY = process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'Commerce CERDIA inc.';

// Sous-traitants / fournisseurs réellement utilisés par la plateforme.
const SUBPROCESSORS: { name: string; role: string; region: string }[] = [
  { name: 'Supabase', role: 'Base de données et authentification', region: 'États-Unis' },
  { name: 'Vercel', role: 'Hébergement et diffusion de l’application', region: 'États-Unis' },
  { name: 'Stripe', role: 'Traitement des paiements', region: 'États-Unis' },
  { name: 'Twilio', role: 'Notifications SMS et téléphonie', region: 'États-Unis' },
  { name: 'Resend', role: 'Envoi de courriels transactionnels', region: 'États-Unis' },
  { name: 'Anthropic (Claude)', role: 'Assistants et analyses IA — minimisation : aucun identifiant de client n’est transmis', region: 'États-Unis' },
  { name: 'Google Maps', role: 'Cartographie et géolocalisation d’adresses', region: 'États-Unis' },
];

export function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : 2026-06-08 · Conforme à la Loi 25 (Québec) et au RGPD.</p>

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
          <h2 className="text-lg font-semibold">7. Conservation et destruction</h2>
          <p>Les renseignements sont conservés le temps nécessaire aux finalités ci-dessus et aux obligations légales, puis détruits ou anonymisés. En particulier :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Sessions de connexion (incluant l’adresse IP et l’appareil) : supprimées au plus tard 30 jours après leur expiration.</li>
            <li>Données de démonstration : la finalité d’essai étant temporaire, les renseignements (nom, courriel, téléphone) sont anonymisés au plus tard 90 jours après la fin de la démo.</li>
            <li>Pièces comptables et de facturation : conservées le délai légal applicable (généralement 6 ans).</li>
            <li>Rapports d’incident et d’accident du travail : conservés conformément aux obligations légales (notamment en matière de santé et sécurité du travail), puis détruits.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">8. Vos droits et comment les exercer</h2>
          <p>Vous disposez des droits d’<strong>accès</strong>, de <strong>rectification</strong>, de <strong>retrait du consentement</strong>, de <strong>portabilité</strong> et, le cas échéant, de <strong>suppression</strong>. Si vous avez un compte, vous pouvez les exercer <strong>directement en libre-service</strong> depuis le menu « Mes renseignements (Loi 25) » : export immédiat de vos données en format structuré (JSON) et dépôt d’une demande. Sinon, écrivez à <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>. Nous répondons dans un <strong>délai de 30 jours</strong>. Vous pouvez aussi porter plainte auprès de la <strong>Commission d’accès à l’information du Québec</strong>.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">9. Sécurité</h2>
          <p>Mots de passe chiffrés (bcrypt), sessions sécurisées (cookies httpOnly), connexions chiffrées (HTTPS/HSTS) et accès restreint par rôle.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">10. Témoins (cookies)</h2>
          <p>Seuls des témoins strictement nécessaires (session, sécurité) sont utilisés. Aucun traceur publicitaire ni analytique tiers. En cas d'ajout d'outils d'analyse, un consentement préalable sera demandé.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">11. Traitements par intelligence artificielle et décisions automatisées</h2>
          <p>Certaines fonctions utilisent l’IA (ex. analyse diagnostique d’huile de transformateur, assistance, classement de documents). Ces traitements produisent des <strong>recommandations</strong> revues par une personne; ils ne constituent pas une décision exclusivement automatisée ayant un effet juridique sur un individu. Nous appliquons la <strong>minimisation</strong> : aucun identifiant de client réel n’est transmis aux modèles d’IA pour l’analyse. Vous pouvez demander des renseignements sur la logique d’un traitement vous concernant et obtenir une révision humaine en écrivant à <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">12. Géolocalisation</h2>
          <p>Certains modules peuvent enregistrer une <strong>position géographique</strong> (ex. adresse d’un chantier, coordonnées GPS jointes à une photo) lorsque vous l’ajoutez ou autorisez l’accès à la localisation de votre appareil. La recherche d’adresses utilise Google Maps. La géolocalisation précise n’est captée qu’avec votre autorisation, au niveau de l’appareil, et sert uniquement aux finalités du module.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">13. Incident de confidentialité</h2>
          <p>Nous tenons un <strong>registre des incidents de confidentialité</strong>. En cas d’incident présentant un <strong>risque de préjudice sérieux</strong>, nous en avisons avec diligence la <strong>Commission d’accès à l’information du Québec</strong> et les personnes concernées, conformément à la Loi 25, et prenons les mesures pour en réduire les effets et éviter la récurrence.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">14. Documents et renseignements hébergés par les organisations clientes</h2>
          <p>C-Secur360 est offert à des organisations (locataires). Lorsqu’une organisation téléverse ou produit des documents et renseignements dans son espace (ex. dossiers RH, rapports d’incident, pièces jointes), <strong>cette organisation en demeure responsable</strong> à titre de responsable du traitement : licéité de la collecte, exactitude, durée de conservation, droits d’accès internes et caractère approprié des renseignements (notamment les renseignements sensibles, médicaux ou relatifs à la santé). C-Secur360 agit alors comme <strong>fournisseur (mandataire/sous-traitant)</strong> : nous hébergeons et sécurisons ces données, les traitons uniquement selon les instructions de l’organisation et aux fins de la prestation du service, sans les utiliser à d’autres fins. Il appartient à l’organisation de ne déposer que les renseignements nécessaires et légalement justifiés, et d’en restreindre l’accès aux personnes autorisées.</p>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
