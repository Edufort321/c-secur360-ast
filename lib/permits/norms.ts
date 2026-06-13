// Moteur de NORMES des PERMIS DE TRAVAIL (tous types) — références par type + province, check-lists
// normalisées, paramètres clés (ex. surveillance incendie travail à chaud, phases LOTO, distances arc
// flash). Réutilisé par le conseiller IA, les formulaires et l'export. Auto-MAJ possible par IA
// (recherche web). Source : CSA Z460/Z462/Z1006, NFPA 51B/70E, RSST/CSTC (QC), O.Reg (ON), OHS provinciaux.

export type PermitType = 'hot_work' | 'loto' | 'electrical' | 'height_work' | 'excavation' | 'chemical' | 'pressure' | 'confined_space';
export type Prov = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'YT' | 'NU' | 'FED';

export interface PermitNorm {
  key: PermitType;
  labelFr: string;
  authorities: string[];                 // CNESST, CSA, NFPA…
  references: string[];                  // articles/normes citables (base ; affinés par province via IA)
  checklist: string[];                   // points de contrôle pré-travaux normalisés
  params: Record<string, any>;           // paramètres clés métier
  aiHints: string;                       // contexte expert pour le conseiller IA
}

export const PERMIT_NORMS: Record<PermitType, PermitNorm> = {
  hot_work: {
    key: 'hot_work', labelFr: 'Travail à chaud',
    authorities: ['CNESST', 'NFPA', 'CSA'],
    references: ['NFPA 51B — Fire Prevention During Welding, Cutting, and Other Hot Work', 'RSST (QC) — prévention des incendies', 'CSTC'],
    checklist: [
      'Permis émis et zone inspectée par la personne responsable',
      'Combustibles retirés ou protégés dans un rayon de 11 m (35 pi)',
      'Ouvertures/fissures (murs, planchers, conduits) couvertes',
      'Extincteur approprié + boyau chargé si possible sur place',
      'Surveillant d’incendie (fire watch) désigné et formé',
      'Détection atmosphérique si vapeurs inflammables possibles',
      'Équipements/conteneurs ayant contenu des inflammables purgés',
    ],
    params: { fireWatchMinutesAfter: 60, combustibleRadius_m: 11, postMonitoringNote: 'Surveillance maintenue ≥ 60 min après les travaux (chaleur conduite : départs de feu plusieurs heures plus tard).' },
    aiHints: 'Travail à chaud (soudage, coupage, meulage). Risque d’incendie/explosion. Exiger fire watch ≥ 60 min après, dégagement 11 m, extincteur/boyau, détection de gaz pour atmosphères inflammables, purge des contenants.',
  },
  loto: {
    key: 'loto', labelFr: 'Cadenassage (LOTO)',
    authorities: ['CNESST', 'CSA'],
    references: ['CSA Z460 — Maîtrise des énergies dangereuses : cadenassage et autres méthodes', 'RSST (QC) art. 188.1 et suiv.', 'CSTC'],
    checklist: [
      'Toutes les sources d’énergie identifiées (élec., hydraulique, pneumatique, gravité, thermique, chimique)',
      'Travailleurs concernés et affectés avisés',
      'Arrêt normal de l’équipement effectué',
      'Sources isolées (sectionneurs, vannes) et blocage mécanique au besoin',
      'Cadenas + étiquette personnels apposés par chaque personne autorisée',
      'Énergie résiduelle/emmagasinée dissipée (purge, décharge, mise à la terre)',
      'VÉRIFICATION de l’énergie ZÉRO (essai de démarrage / VAT) avant travaux',
      'Cadenassage de groupe (boîte de cadenassage) si plusieurs intervenants',
    ],
    params: { phases: ['Préparation', 'Notification', 'Arrêt', 'Isolement', 'Cadenassage/étiquetage', 'Dissipation énergie résiduelle', 'Vérification énergie zéro', 'Travaux', 'Retrait'], individualLocks: true, groupLockout: true },
    aiHints: 'Cadenassage/maîtrise des énergies dangereuses (CSA Z460). Insister sur l’identification de TOUTES les énergies, l’isolement, la dissipation de l’énergie résiduelle et la VÉRIFICATION de l’énergie zéro avant intervention, cadenas individuels par travailleur, cadenassage de groupe.',
  },
  electrical: {
    key: 'electrical', labelFr: 'Travail électrique',
    authorities: ['CNESST', 'CSA', 'NFPA'],
    references: ['CSA Z462 — Sécurité électrique au travail', 'NFPA 70E', 'RSST (QC)', 'Code canadien de l’électricité'],
    checklist: [
      'Travail hors tension privilégié ; permis de travail SOUS tension justifié si requis',
      'Analyse d’arc électrique (arc flash) et énergie incidente évaluées',
      'EPI arc-flash adéquat (catégorie) porté',
      'Distances d’approche limites respectées (limited/restricted approach)',
      'Cadenassage des sources (voir LOTO)',
      'Vérification d’ABSENCE de tension (VAT) avec instrument testé avant/après',
      'Périmètre délimité, personnes non qualifiées tenues à distance',
    ],
    params: { vatRequired: true, arcFlashStudy: true, energizedWorkPermit: true },
    aiHints: 'Travail électrique (CSA Z462 / NFPA 70E). Privilégier hors tension. Évaluer l’arc flash (énergie incidente, EPI catégorie), distances d’approche, VAT obligatoire, permis de travail sous tension justifié.',
  },
  height_work: {
    key: 'height_work', labelFr: 'Travail en hauteur',
    authorities: ['CNESST', 'CSA'],
    references: ['CSTC (QC) — travail en hauteur', 'RSST', 'CSA Z259 — équipements de protection contre les chutes'],
    checklist: [
      'Élimination du travail en hauteur envisagée en premier',
      'Système anti-chute choisi (garde-corps > retenue > arrêt de chute)',
      'Points d’ancrage conformes (résistance, certifiés) identifiés',
      'Harnais et liaison antichute inspectés (absorbeur, longe)',
      'Distance de chute libre / tirant d’air vérifié (pas d’impact au sol)',
      'PLAN DE SAUVETAGE en hauteur (suspension trauma) défini',
      'Conditions (vent, glace) et zone au sol sécurisées',
    ],
    params: { rescuePlanRequired: true, anchorMin_kN: 22, hierarchy: ['Élimination', 'Garde-corps', 'Retenue', 'Arrêt de chute'] },
    aiHints: 'Travail en hauteur (CSTC / CSA Z259). Hiérarchie des mesures, ancrages conformes, tirant d’air, et surtout PLAN DE SAUVETAGE (syndrome du harnais/suspension trauma : intervention rapide).',
  },
  excavation: {
    key: 'excavation', labelFr: 'Excavation / tranchée',
    authorities: ['CNESST'],
    references: ['CSTC (QC) — excavation et tranchées', 'RSST', 'Info-Excavation (localisation des services)'],
    checklist: [
      'Localisation des services souterrains obtenue (Info-Excavation) avant de creuser',
      'Classification du sol évaluée par personne compétente',
      'Étançonnement / talutage / caisson selon la profondeur et le sol',
      'Distance des déblais et de la charge du bord de l’excavation respectée',
      'Accès/sortie (échelle) à ≤ 7,5 m du travailleur',
      'Espace clos ? (atmosphère) si profondeur/risque',
      'Stabilité des structures et circulation à proximité gérées',
    ],
    params: { locatesRequired: true, shoringDepthTrigger_m: 1.2, ladderMaxDistance_m: 7.5 },
    aiHints: 'Excavation/tranchée (CSTC). Localisation des services AVANT (Info-Excavation), classification du sol, étançonnement/talutage selon profondeur, recul des déblais, accès, risque d’ensevelissement.',
  },
  chemical: {
    key: 'chemical', labelFr: 'Travail avec produits chimiques',
    authorities: ['CNESST', 'Santé Canada'],
    references: ['SIMDUT 2015 / SGH', 'RSST — substances dangereuses', 'Fiches de données de sécurité (FDS)'],
    checklist: [
      'FDS (SDS) des produits disponibles et consultées',
      'Compatibilité des produits vérifiée (pas de réactions dangereuses)',
      'Ventilation/captation à la source adéquate',
      'EPI selon la FDS (gants, protection respiratoire, oculaire)',
      'Douche oculaire/d’urgence accessible',
      'Plan de déversement et matières absorbantes en place',
      'Entreposage et étiquetage conformes (SIMDUT)',
    ],
    params: { sdsRequired: true },
    aiHints: 'Travail avec produits chimiques (SIMDUT/SGH). FDS, compatibilité, ventilation, EPI respiratoire selon VEMP, plan de déversement, douche d’urgence.',
  },
  pressure: {
    key: 'pressure', labelFr: 'Travail sous pression',
    authorities: ['CNESST', 'CSA'],
    references: ['CSA B51 — chaudières et appareils sous pression', 'RSST', 'ASME (essais)'],
    checklist: [
      'Système dépressurisé et isolé (voir LOTO) avant intervention',
      'Énergie de pression résiduelle purgée et vérifiée à zéro',
      'Périmètre de sécurité établi durant les essais sous pression',
      'Procédure d’essai (hydro privilégié au pneumatique) et limites définies',
      'Soupapes/instruments calibrés et conformes',
      'EPI et écrans de protection en place',
    ],
    params: { hydroPreferred: true, isolationRequired: true },
    aiHints: 'Travail sous pression (CSA B51). Dépressurisation/isolement, purge à zéro, essai hydrostatique privilégié au pneumatique (énergie stockée), périmètre de sécurité.',
  },
  confined_space: {
    key: 'confined_space', labelFr: 'Espace clos',
    authorities: ['CNESST', 'CSA'],
    references: ['CSA Z1006', 'RSST (QC) section XXVI'],
    checklist: ['Voir le module Espace clos dédié (caractérisation, tests atmosphériques, surveillant, sauvetage).'],
    params: {}, aiHints: 'Voir module espace clos dédié.',
  },
};

export const PROV_LABELS: Record<Prov, string> = {
  QC: 'Québec', ON: 'Ontario', BC: 'Colombie-Britannique', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba',
  NB: 'Nouveau-Brunswick', NS: 'Nouvelle-Écosse', PE: 'Île-du-Prince-Édouard', NL: 'Terre-Neuve-et-Labrador',
  NT: 'Territoires du Nord-Ouest', YT: 'Yukon', NU: 'Nunavut', FED: 'Fédéral',
};

export function getPermitNorm(type: string): PermitNorm | null {
  return (PERMIT_NORMS as any)[type] || null;
}
