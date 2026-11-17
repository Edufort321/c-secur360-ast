// Contenu de la vitrine publique (page d'accueil) : vidéos démo et autres applications CERDIA.
// Vidéos : public/videos/demo/<cle>.mp4 + affiche <cle>.jpg. Elles viennent des tournages Playwright de la démo C-Secur360
// (données et noms fictifs, série « C-Secur360 — vendeurs » de Rapport_IPS/Vidéos de formation).

export interface VideoDemo { cle: string; module: string; fr: string; en: string; duree: string }

export const VIDEOS_DEMO: VideoDemo[] = [
  { cle: 'accueil', module: 'admin', fr: 'Accueil, alertes et navigation', en: 'Home, alerts and navigation', duree: '0:32' },
  { cle: 'ast', module: 'ast', fr: 'AST : dangers, isolation et PDF', en: 'JSA: hazards, isolation and PDF', duree: '0:31' },
  { cle: '2-minutes', module: 'ast', fr: '2 minutes drill', en: '2-minute drill', duree: '0:19' },
  { cle: 'permis-chaud', module: 'permits', fr: 'Permis de travail à chaud', en: 'Hot work permit', duree: '0:38' },
  { cle: 'accidents-kpi', module: 'accidents', fr: 'Accidents, KPI et statistiques', en: 'Accidents, KPIs and statistics', duree: '0:32' },
  { cle: 'inspection-qr', module: 'inspect', fr: 'Inspection d\'équipement par QR', en: 'Equipment inspection by QR', duree: '0:33' },
  { cle: 'soumission-facture', module: 'projets', fr: 'Soumission → projet → facture', en: 'Quote → project → invoice', duree: '0:55' },
  { cle: 'projets-wip', module: 'projets', fr: 'Projets : budget et WIP', en: 'Projects: budget and WIP', duree: '0:20' },
  { cle: 'planification', module: 'planner', fr: 'Planification des équipes', en: 'Crew planning', duree: '0:19' },
  { cle: 'mes-heures', module: 'temps', fr: 'Mes heures de la semaine', en: 'My weekly hours', duree: '0:23' },
  { cle: 'dga', module: 'dga', fr: 'DGA : analyse d\'huile', en: 'DGA: oil analysis', duree: '0:22' },
  { cle: 'thermographie', module: 'rapports', fr: 'Thermographie et anomalies', en: 'Thermography and anomalies', duree: '0:20' },
];

// Autres applications CERDIA (fiche de type magasin d'applications). Images : public/apps/<cle>/…
export interface AppCerdia {
  cle: string; nom: string; categorie_fr: string; categorie_en: string; fr: string; en: string;
  icone: string; captures: string[]; video?: string; url?: string;
}

// Captures et aperçus tournés le 2026-11-16 (Playwright, format téléphone). Pas de lien pour une app sans adresse publique
// vérifiée (Ohmni, Lingora). Rapport IPS n'y figure pas (décision d'Eric : toutes les apps sauf IPS).
const A = (cle: string, captures: string[]) => ({ icone: `/apps/${cle}/icone.png`, video: `/apps/${cle}/apercu.mp4`, captures: captures.map(c => `/apps/${cle}/${c}`) });

export const AUTRES_APPS: AppCerdia[] = [
  { cle: 'voltix', nom: 'Voltix', categorie_fr: 'Dessin électrique', categorie_en: 'Electrical drawing', url: 'https://voltix-ha62.vercel.app',
    fr: 'Dessin électrique assisté par IA : schémas unifilaires, barres omnibus en 3D, panneaux de commande, lamicoïdes et relevés photo convertis en 3D.',
    en: 'AI-assisted electrical drawing: single-line diagrams, 3D bus bars, control panels, nameplates and photo surveys turned into 3D.',
    ...A('voltix', ['store-1.jpg', 'store-2.jpg', 'store-3.jpg', 'store-4.jpg', 'store-5.jpg']) },
  { cle: 'ohmni', nom: 'Ohmni', categorie_fr: 'Normes électriques', categorie_en: 'Electrical standards',
    fr: 'L\'outil de terrain des électriciens : codes ANSI, calculatrices électriques et données d\'essai, bilingue et 100 % hors ligne.',
    en: 'The field tool for electricians: ANSI codes, electrical calculators and test data, bilingual and 100% offline.',
    ...A('ohmni', ['capture-1.jpg']) },
  { cle: 'artyra', nom: 'Artyria', categorie_fr: 'Portfolio et CV', categorie_en: 'Portfolio & résumé', url: 'https://artyra.cerdia.ai',
    fr: 'Ton portfolio, ton CV rédigé par IA et ta carte d\'affaires numérique, avec un lien et un code QR à partager, pour tous les métiers.',
    en: 'Your portfolio, an AI-written résumé and a digital business card, with a link and QR code to share, for every trade.',
    ...A('artyra', ['capture-1.jpg']) },
  { cle: 'livoria', nom: 'Livoria', categorie_fr: 'Livres audio', categorie_en: 'Audiobooks', url: 'https://livoria.vercel.app',
    fr: 'Photographiez les pages d\'un livre papier : Livoria en fait un livre audio narré à plusieurs voix, avec des quiz de révision.',
    en: 'Photograph the pages of a paper book: Livoria turns it into a multi-voice audiobook, with review quizzes.',
    ...A('livoria', ['capture-1.jpg']) },
  { cle: 'lingora', nom: 'Lingora', categorie_fr: 'Langues', categorie_en: 'Languages',
    fr: 'Ton coach de langues : traduis un mot, converse pour pratiquer et garde ce que tu apprends (français, anglais, espagnol, italien).',
    en: 'Your language coach: translate a word, chat to practice and keep what you learn (French, English, Spanish, Italian).',
    ...A('lingora', ['capture-1.jpg']) },
  { cle: 'genia', nom: 'Génie en herbe', categorie_fr: 'Éducation', categorie_en: 'Education', url: 'https://genie-en-herbe.vercel.app',
    fr: 'Quiz de révision et de duel pour les élèves du secondaire : révision, examen, duel, salle de classe et parties en ligne.',
    en: 'Review and duel quizzes for high-school students: review, exam, duel, classroom and online games.',
    ...A('genia', ['store-1.jpg', 'store-2.jpg', 'store-3.jpg', 'store-4.jpg', 'store-5.jpg', 'store-6.jpg']) },
  { cle: 'rouloo', nom: 'Rouloo', categorie_fr: 'Jeu familial', categorie_en: 'Family game', url: 'https://rouloo.vercel.app',
    fr: 'Le jeu de voyage familial pour la route : plaques, couleurs, défis, quiz et mode multijoueur en ligne, en français et en anglais.',
    en: 'The family road-trip game: license plates, colours, challenges, quizzes and online multiplayer, in French and English.',
    ...A('rouloo', ['capture-1.jpg']) },
];
