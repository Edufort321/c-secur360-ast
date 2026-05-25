// Listes de vérification — 10 types d'équipements — normes CNESST / CSA / NFPA

export type InspectionType =
  | 'harness'
  | 'forklift'
  | 'aerial'
  | 'scaffold'
  | 'ladder'
  | 'power_tools'
  | 'fire_extinguisher'
  | 'gas_detector'
  | 'respiratory'
  | 'ppe_general';

export interface ChecklistItem {
  id: string;
  label: string;
  critical: boolean;
  withdrawal: boolean;   // retrait immédiat si fail
  helpText?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface EquipmentChecklist {
  type: InspectionType;
  labelFr: string;
  icon: string;
  standard: string;
  frequency: string;
  sections: ChecklistSection[];
}

// ─────────────────────────────────────────────
// 1. HARNAIS ANTICHUTE — CSA Z259.10-18
// ─────────────────────────────────────────────
const harness: EquipmentChecklist = {
  type: 'harness',
  labelFr: 'Harnais antichute',
  icon: '🦺',
  standard: 'CAN/CSA Z259.10-18',
  frequency: 'Avant chaque utilisation + annuelle par personne compétente',
  sections: [
    {
      id: 'sangles',
      title: 'Sangles et coutures',
      items: [
        { id: 'h_s1', label: 'Sangles sans coupures, effilochage ou fibres brisées', critical: true, withdrawal: true },
        { id: 'h_s2', label: 'Aucune trace de chaleur, brûlure ou décoloration', critical: true, withdrawal: true },
        { id: 'h_s3', label: 'Aucun dommage chimique (taches, durcissement, zone molle)', critical: true, withdrawal: true },
        { id: 'h_s4', label: 'Coutures de charge et de retenue intactes (fils non décousus)', critical: true, withdrawal: true },
        { id: 'h_s5', label: 'Aucune réparation non effectuée par le fabricant', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'quincaillerie',
      title: 'Boucles et quincaillerie',
      items: [
        { id: 'h_q1', label: 'Boucles sans déformation, fissures, arêtes vives ou corrosion', critical: true, withdrawal: true },
        { id: 'h_q2', label: 'Anneaux en D : rotation libre, sans déformation ni entaille', critical: true, withdrawal: true },
        { id: 'h_q3', label: 'Rivets et oeillets bien assis, sans corrosion', critical: true, withdrawal: false },
        { id: 'h_q4', label: 'Agrafes de poitrine et de jambes : verrouillage sûr', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'connecteurs',
      title: 'Connecteurs / Mousquetons',
      items: [
        { id: 'h_c1', label: 'Fermeture automatique et verrouillage audible et clair', critical: true, withdrawal: true },
        { id: 'h_c2', label: 'Aucune hésitation, coincement ou désalignement', critical: true, withdrawal: true },
        { id: 'h_c3', label: 'Absence de corrosion, arêtes vives ou déformation', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'absorbeur',
      title: 'Absorbeur d\'énergie et longe',
      items: [
        { id: 'h_a1', label: 'Aucun signe de déploiement (coutures intactes, longueur normale)', critical: true, withdrawal: true, helpText: 'Tout harnais ayant subi une chute doit être retiré même sans dommage visible' },
        { id: 'h_a2', label: 'Aucun effilochage autour du pack d\'absorption', critical: true, withdrawal: true },
        { id: 'h_a3', label: 'Longe / corde sans fibres coupées, zone molle ou gonflement', critical: true, withdrawal: true },
        { id: 'h_a4', label: 'Câble métallique (si applicable) sans fils effilochés ni vrilles', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'etiquette',
      title: 'Étiquette et conformité',
      items: [
        { id: 'h_e1', label: 'Étiquette présente et lisible (fabricant, modèle, n° série, norme)', critical: true, withdrawal: true },
        { id: 'h_e2', label: 'Date de fabrication lisible (retrait recommandé après 10 ans)', critical: false, withdrawal: false },
        { id: 'h_e3', label: 'Dernière inspection annuelle par personne compétente à jour', critical: false, withdrawal: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 2. CHARIOT ÉLÉVATEUR — CSA B335-15
// ─────────────────────────────────────────────
const forklift: EquipmentChecklist = {
  type: 'forklift',
  labelFr: 'Chariot élévateur',
  icon: '🏗️',
  standard: 'CSA B335-15',
  frequency: 'Avant chaque quart de travail (obligatoire)',
  sections: [
    {
      id: 'structure',
      title: 'Structure et fourches',
      items: [
        { id: 'f_st1', label: 'Mât sans fissures, déformations ni pliures', critical: true, withdrawal: true },
        { id: 'f_st2', label: 'Fourches sans courbure, désalignement >3%, fissures ou encoches', critical: true, withdrawal: true },
        { id: 'f_st3', label: 'Points d\'ancrage des chaînes : usure et jeu acceptables', critical: true, withdrawal: false },
        { id: 'f_st4', label: 'Boulons, écrous et protecteurs en place', critical: false, withdrawal: false },
      ],
    },
    {
      id: 'roues',
      title: 'Roues, freins et direction',
      items: [
        { id: 'f_r1', label: 'Pneus en bon état (usure, dommages, pression)', critical: true, withdrawal: true },
        { id: 'f_r2', label: 'Frein de service fonctionnel', critical: true, withdrawal: true },
        { id: 'f_r3', label: 'Frein de stationnement fonctionnel', critical: true, withdrawal: true },
        { id: 'f_r4', label: 'Direction fluide et réactive', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'hydraulique',
      title: 'Système hydraulique',
      items: [
        { id: 'f_h1', label: 'Aucune fuite d\'huile hydraulique, moteur ou liquide refroidissement', critical: true, withdrawal: true },
        { id: 'f_h2', label: 'Flexibles sécurisés, non usés ni pincés', critical: true, withdrawal: true },
        { id: 'f_h3', label: 'Commandes : retour au neutre automatique', critical: true, withdrawal: false },
        { id: 'f_h4', label: 'Niveaux huile moteur, carburant et liquide de refroidissement OK', critical: false, withdrawal: false },
      ],
    },
    {
      id: 'securite',
      title: 'Dispositifs de sécurité',
      items: [
        { id: 'f_sec1', label: 'Ceinture de sécurité / dispositif de retenue opérateur présent et fonctionnel', critical: true, withdrawal: true },
        { id: 'f_sec2', label: 'Structure ROPS intacte', critical: true, withdrawal: true },
        { id: 'f_sec3', label: 'Extincteur chargé et fixé', critical: true, withdrawal: true },
        { id: 'f_sec4', label: 'Klaxon, gyrophare et avertisseur de recul fonctionnels', critical: false, withdrawal: false },
        { id: 'f_sec5', label: 'Siège : verrouillage en position', critical: false, withdrawal: false },
        { id: 'f_sec6', label: 'Batterie (si électrique) : charge, câbles, contacts et fixation OK', critical: true, withdrawal: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 3. NACELLE / PEMP — CSA B354.7
// ─────────────────────────────────────────────
const aerial: EquipmentChecklist = {
  type: 'aerial',
  labelFr: 'Nacelle / Plateforme élévatrice',
  icon: '🚧',
  standard: 'CSA B354.7 / B354.8',
  frequency: 'Avant chaque utilisation',
  sections: [
    {
      id: 'doc',
      title: 'Documentation et signalisation',
      items: [
        { id: 'ae_d1', label: 'Manuel de sécurité présent et lisible dans la machine', critical: false, withdrawal: false },
        { id: 'ae_d2', label: 'Toutes les décalcomanies de sécurité lisibles et en place', critical: false, withdrawal: false },
        { id: 'ae_d3', label: 'Plaque de capacité de charge visible', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'niveaux',
      title: 'Niveaux et fuites',
      items: [
        { id: 'ae_n1', label: 'Aucune fuite active (hydraulique, moteur, liquide de refroidissement)', critical: true, withdrawal: true },
        { id: 'ae_n2', label: 'Niveau de charge batterie suffisant (modèles électriques)', critical: true, withdrawal: false },
        { id: 'ae_n3', label: 'Câbles et connecteurs de batterie en bon état', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'structure',
      title: 'Structure et plateforme',
      items: [
        { id: 'ae_s1', label: 'Châssis, bras et tourelle sans soudures endommagées ni corrosion excessive', critical: true, withdrawal: true },
        { id: 'ae_s2', label: 'Garde-corps présents et hauteur conforme (min. 1,06 m)', critical: true, withdrawal: true },
        { id: 'ae_s3', label: 'Porte / chaîne d\'accès : fermeture fonctionnelle', critical: true, withdrawal: true },
        { id: 'ae_s4', label: 'Plancher propre et exempt de débris', critical: false, withdrawal: false },
        { id: 'ae_s5', label: 'Roues et pneus en bon état', critical: true, withdrawal: false },
        { id: 'ae_s6', label: 'Stabilisateurs (outriggers) fonctionnels, si applicable', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'commandes_sol',
      title: 'Commandes au sol',
      items: [
        { id: 'ae_cs1', label: 'Bouton arrêt d\'urgence au sol : coupe l\'alimentation', critical: true, withdrawal: true },
        { id: 'ae_cs2', label: 'Commandes auxiliaires de descente de secours fonctionnelles', critical: true, withdrawal: true },
        { id: 'ae_cs3', label: 'Alarme d\'inclinaison (tilt sensor) fonctionnelle', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'commandes_nacelle',
      title: 'Commandes en nacelle',
      items: [
        { id: 'ae_cn1', label: 'Bouton arrêt d\'urgence en nacelle fonctionnel', critical: true, withdrawal: true },
        { id: 'ae_cn2', label: 'Interrupteur à main morte (dead-man) fonctionnel', critical: true, withdrawal: true },
        { id: 'ae_cn3', label: 'Klaxon fonctionnel', critical: false, withdrawal: false },
        { id: 'ae_cn4', label: 'Direction, traction et freinage (s\'arrête et tient la machine)', critical: true, withdrawal: true },
        { id: 'ae_cn5', label: 'Montée / descente de la plateforme fonctionnelles', critical: true, withdrawal: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 4. ÉCHAFAUDAGE — CSA Z797
// ─────────────────────────────────────────────
const scaffold: EquipmentChecklist = {
  type: 'scaffold',
  labelFr: 'Échafaudage',
  icon: '🏗️',
  standard: 'CSA Z797 / CSTC art. 3.15',
  frequency: 'Avant chaque quart + après tout événement compromettant l\'intégrité',
  sections: [
    {
      id: 'base',
      title: 'Fondation et base',
      items: [
        { id: 'sc_b1', label: 'Mudsills présents et de dimensions adéquates', critical: true, withdrawal: true },
        { id: 'sc_b2', label: 'Plaques de base (base plates) en place et bien appuyées', critical: true, withdrawal: true },
        { id: 'sc_b3', label: 'Vérins dans les limites fabricant, montants d\'aplomb', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'structure',
      title: 'Structure verticale et horizontale',
      items: [
        { id: 'sc_s1', label: 'Cadres et montants sans dommages ni déformations visibles', critical: true, withdrawal: true },
        { id: 'sc_s2', label: 'Contreventements (croix) installés à chaque extrémité et sur toute la longueur', critical: true, withdrawal: true },
        { id: 'sc_s3', label: 'Connexions et coupleurs serrés, sans déformation', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'platelage',
      title: 'Planchers et platelage',
      items: [
        { id: 'sc_p1', label: 'Couverture complète des plateaux, sans espaces dangereux', critical: true, withdrawal: true },
        { id: 'sc_p2', label: 'Chevauchement adéquat des madriers (min. 300 mm)', critical: true, withdrawal: false },
        { id: 'sc_p3', label: 'Madriers fixés, sans fissures, pourriture ni nœuds hors norme', critical: true, withdrawal: true },
        { id: 'sc_p4', label: 'Plancher propre (sans déchets, glace ni huile)', critical: false, withdrawal: false },
      ],
    },
    {
      id: 'garde_corps',
      title: 'Garde-corps (obligatoire dès 3 m)',
      items: [
        { id: 'sc_g1', label: 'Lisse supérieure à 1,0–1,2 m au-dessus du plancher', critical: true, withdrawal: true },
        { id: 'sc_g2', label: 'Lisse intermédiaire à mi-hauteur présente', critical: true, withdrawal: true },
        { id: 'sc_g3', label: 'Plinthe (toeboard) de min. 140 mm présente', critical: true, withdrawal: true },
        { id: 'sc_g4', label: 'Garde-corps sur tous les côtés ouverts', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'acces',
      title: 'Accès et ancrages',
      items: [
        { id: 'sc_a1', label: 'Échelle d\'accès sécurisée et dépassant de 1 m le palier supérieur', critical: true, withdrawal: true },
        { id: 'sc_a2', label: 'Amarres / attaches à la structure du bâtiment à intervalles prescrits', critical: true, withdrawal: true },
        { id: 'sc_a3', label: 'Étiquette d\'inspection verte (sécuritaire) ou jaune (restrictions) visible', critical: false, withdrawal: false },
        { id: 'sc_a4', label: 'Respect de la charge nominale (ne pas surcharger)', critical: true, withdrawal: true },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 5. ÉCHELLE PORTATIVE — CSA Z11-18
// ─────────────────────────────────────────────
const ladder: EquipmentChecklist = {
  type: 'ladder',
  labelFr: 'Échelle portative',
  icon: '🪜',
  standard: 'CAN/CSA Z11-18 (R2022)',
  frequency: 'Avant et après chaque utilisation',
  sections: [
    {
      id: 'structure',
      title: 'Structure et montants',
      items: [
        { id: 'l_s1', label: 'Montants sans fissures, bris, déformation ni réparation maison', critical: true, withdrawal: true },
        { id: 'l_s2', label: 'Échelons ou marches : aucun manquant, desserré ou fissuré', critical: true, withdrawal: true },
        { id: 'l_s3', label: 'Assemblage des sections (coulissantes) : glissières fonctionnelles', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'quincaillerie',
      title: 'Quincaillerie et sécurité',
      items: [
        { id: 'l_q1', label: 'Ferrures, rivets et boulons en place, non desserrés ni corrodés', critical: true, withdrawal: true },
        { id: 'l_q2', label: 'Dispositif de blocage des sections fonctionnel (échelle coulissante)', critical: true, withdrawal: true },
        { id: 'l_q3', label: 'Pieds antidérapants (patins) présents et non usés', critical: true, withdrawal: true },
        { id: 'l_q4', label: 'Crochets ou dispositifs d\'accrochage intacts (si applicable)', critical: true, withdrawal: true },
        { id: 'l_q5', label: 'Articulations et bras écarteurs fonctionnels (escabeau)', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'general',
      title: 'Condition générale',
      items: [
        { id: 'l_g1', label: 'Absence d\'huile, de graisse ou de peinture (masque défauts / glissant)', critical: true, withdrawal: true },
        { id: 'l_g2', label: 'Aucune surcharge visible (pliure ou voilure permanente)', critical: true, withdrawal: true },
        { id: 'l_g3', label: 'Étiquette du fabricant lisible avec capacité de charge', critical: false, withdrawal: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 6. OUTILLAGE ÉLECTRIQUE PORTATIF — CNESST
// ─────────────────────────────────────────────
const powerTools: EquipmentChecklist = {
  type: 'power_tools',
  labelFr: 'Outillage électrique portatif',
  icon: '🔧',
  standard: 'Code canadien de l\'électricité / CNESST',
  frequency: 'Avant chaque utilisation',
  sections: [
    {
      id: 'corps',
      title: 'Corps et poignées',
      items: [
        { id: 'pt_c1', label: 'Boîtier sans fissures, dommages ni déformation', critical: true, withdrawal: true },
        { id: 'pt_c2', label: 'Poignée principale solidement fixée', critical: true, withdrawal: true },
        { id: 'pt_c3', label: 'Poignée auxiliaire solidement fixée (si applicable)', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'electrique',
      title: 'Système électrique',
      items: [
        { id: 'pt_e1', label: 'Cordon d\'alimentation : aucune coupure ni isolation endommagée', critical: true, withdrawal: true },
        { id: 'pt_e2', label: 'Fiche sans fissures, broches présentes et non tordues', critical: true, withdrawal: true },
        { id: 'pt_e3', label: 'Interrupteur / gâchette fonctionnel', critical: true, withdrawal: true },
        { id: 'pt_e4', label: 'Interrupteur de blocage accidentel fonctionnel', critical: true, withdrawal: true },
        { id: 'pt_e5', label: 'Prise de mise à la terre intacte (si 3 broches)', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'batterie',
      title: 'Batterie (outils sans fil)',
      items: [
        { id: 'pt_b1', label: 'Corps de batterie sans fissures, gonflements ni fuites', critical: true, withdrawal: true },
        { id: 'pt_b2', label: 'Contacts sans corrosion ni déformation', critical: true, withdrawal: false },
        { id: 'pt_b3', label: 'Charge adéquate pour la durée prévue', critical: false, withdrawal: false },
      ],
    },
    {
      id: 'accessoires',
      title: 'Accessoires et protecteurs',
      items: [
        { id: 'pt_a1', label: 'Disque / lame / foret sans fissures, adapté à l\'outil', critical: true, withdrawal: true },
        { id: 'pt_a2', label: 'Garde de protection (meuleuse) présent et correctement installé', critical: true, withdrawal: true },
        { id: 'pt_a3', label: 'Cache/protège-lame scie circulaire fonctionnel (si applicable)', critical: true, withdrawal: true },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 7. EXTINCTEUR PORTATIF — NFPA 10 / ULC
// ─────────────────────────────────────────────
const fireExtinguisher: EquipmentChecklist = {
  type: 'fire_extinguisher',
  labelFr: 'Extincteur portatif',
  icon: '🧯',
  standard: 'NFPA 10 / ULC / CNPI',
  frequency: 'Mensuelle (visuelle) + annuelle par technicien certifié',
  sections: [
    {
      id: 'accessibilite',
      title: 'Accessibilité et signalisation',
      items: [
        { id: 'fe_ac1', label: 'Extincteur bien monté, support solidement fixé', critical: false, withdrawal: false },
        { id: 'fe_ac2', label: 'Accès dégagé (aucun obstacle devant l\'extincteur)', critical: true, withdrawal: true },
        { id: 'fe_ac3', label: 'Signalisation de localisation visible et lisible', critical: false, withdrawal: false },
        { id: 'fe_ac4', label: 'Instructions d\'utilisation lisibles (face avant)', critical: false, withdrawal: false },
      ],
    },
    {
      id: 'etat',
      title: 'État physique',
      items: [
        { id: 'fe_e1', label: 'Corps du cylindre sans dommages, bosses ni corrosion', critical: true, withdrawal: true },
        { id: 'fe_e2', label: 'Raccord flexible et buse sans blocage ni endommagement', critical: true, withdrawal: true },
        { id: 'fe_e3', label: 'Connexions bouteille/flexible sécurisées', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'securite',
      title: 'Dispositifs de sécurité et charge',
      items: [
        { id: 'fe_s1', label: 'Goupille de sécurité en place et intacte', critical: true, withdrawal: true },
        { id: 'fe_s2', label: 'Sceau de sécurité intact', critical: true, withdrawal: true },
        { id: 'fe_s3', label: 'Manomètre : aiguille dans la zone verte', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'maintenance',
      title: 'Documentation',
      items: [
        { id: 'fe_m1', label: 'Étiquette de maintenance valide avec dates', critical: false, withdrawal: false },
        { id: 'fe_m2', label: 'Inspection annuelle par technicien certifié à jour', critical: false, withdrawal: false },
        { id: 'fe_m3', label: 'Test hydrostatique selon calendrier (5 ou 12 ans selon type)', critical: false, withdrawal: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 8. DÉTECTEUR MULTIGAZ — CSA Z1006
// ─────────────────────────────────────────────
const gasDetector: EquipmentChecklist = {
  type: 'gas_detector',
  labelFr: 'Détecteur multigaz',
  icon: '📡',
  standard: 'CSA Z1006 / recommandations fabricant',
  frequency: 'Avant chaque quart (bump test quotidien recommandé)',
  sections: [
    {
      id: 'physique',
      title: 'Inspection physique',
      items: [
        { id: 'gd_p1', label: 'Niveau de charge batterie ≥ 75% pour durée prévue', critical: true, withdrawal: true },
        { id: 'gd_p2', label: 'Aucun code de défaut actif affiché', critical: true, withdrawal: true },
        { id: 'gd_p3', label: 'Orifices d\'entrée des capteurs non bloqués et propres', critical: true, withdrawal: true },
        { id: 'gd_p4', label: 'Piège à eau / filtre en place et non saturé', critical: true, withdrawal: true },
        { id: 'gd_p5', label: 'Tubulure et raccords de pompe sans fissures ni fuites (si pompe)', critical: true, withdrawal: true },
        { id: 'gd_p6', label: 'Corps de l\'instrument sans fissures ni contamination chimique', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'bump_test',
      title: 'Bump test (test de déclenchement)',
      items: [
        { id: 'gd_b1', label: 'Bouteille de gaz de test certifiée non expirée', critical: true, withdrawal: true },
        { id: 'gd_b2', label: 'Réponse des capteurs O₂, CO, H₂S, LIE : montée rapide dans la bonne direction', critical: true, withdrawal: true },
        { id: 'gd_b3', label: 'Alarme sonore déclenchée lors du test', critical: true, withdrawal: true },
        { id: 'gd_b4', label: 'Alarme visuelle (LED) déclenchée lors du test', critical: true, withdrawal: true },
        { id: 'gd_b5', label: 'Valeurs retournent au niveau de base après test', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'calibration',
      title: 'Calibration',
      items: [
        { id: 'gd_c1', label: 'Date de dernière calibration dans les délais (max 6 mois)', critical: true, withdrawal: false },
        { id: 'gd_c2', label: 'Calibration complète réussie si dérive détectée au bump test', critical: true, withdrawal: true },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 9. PROTECTION RESPIRATOIRE — CSA Z94.4
// ─────────────────────────────────────────────
const respiratory: EquipmentChecklist = {
  type: 'respiratory',
  labelFr: 'Appareil de protection respiratoire',
  icon: '😷',
  standard: 'CAN/CSA Z94.4 / Guide IRSST/CNESST',
  frequency: 'Avant et après chaque utilisation',
  sections: [
    {
      id: 'piece_faciale',
      title: 'Pièce faciale',
      items: [
        { id: 'rp_p1', label: 'Pièce faciale sans fissures, déchirures, trous ni distorsion', critical: true, withdrawal: true },
        { id: 'rp_p2', label: 'Parties élastomères souples (non rigidifiées ni détériorées)', critical: true, withdrawal: true },
        { id: 'rp_p3', label: 'Hublots (masque complet) intacts, non rayés, joints d\'étanchéité intacts', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'sangles',
      title: 'Sangles de tête',
      items: [
        { id: 'rp_s1', label: 'Sangles sans coupures ni étirements excessifs', critical: true, withdrawal: true },
        { id: 'rp_s2', label: 'Boucles de réglage fonctionnelles', critical: true, withdrawal: false },
        { id: 'rp_s3', label: 'Tension permettant un joint d\'étanchéité adéquat', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'valves',
      title: 'Valves',
      items: [
        { id: 'rp_v1', label: 'Valves d\'inhalation et d\'exhalation présentes et bien assises', critical: true, withdrawal: true },
        { id: 'rp_v2', label: 'Aucun corps étranger bloquant les valves', critical: true, withdrawal: true },
        { id: 'rp_v3', label: 'Fonctionnement des valves (test souffle/aspiration)', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'filtres',
      title: 'Cartouches et filtres',
      items: [
        { id: 'rp_f1', label: 'Type de cartouche correct pour le contaminant ciblé', critical: true, withdrawal: true },
        { id: 'rp_f2', label: 'Cartouches non expirées', critical: true, withdrawal: true },
        { id: 'rp_f3', label: 'Connexion sécurisée au porte-cartouche (filetage sans croisement)', critical: true, withdrawal: true },
        { id: 'rp_f4', label: 'Pression cylindre ≥ 90% du niveau recommandé (APRA)', critical: true, withdrawal: true },
      ],
    },
    {
      id: 'test_etancheite',
      title: 'Test d\'étanchéité utilisateur',
      items: [
        { id: 'rp_te1', label: 'Test pression positive (expirer, boucher valve) : aucune fuite', critical: true, withdrawal: true },
        { id: 'rp_te2', label: 'Test pression négative (inspirer, boucher orifices) : aucun affaissement', critical: true, withdrawal: true },
        { id: 'rp_te3', label: 'Fit test annuel par personne compétente à jour', critical: false, withdrawal: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// 10. EPI GÉNÉRAL — RSST / Normes CSA
// ─────────────────────────────────────────────
const ppeGeneral: EquipmentChecklist = {
  type: 'ppe_general',
  labelFr: 'EPI général (casque, lunettes, gants, etc.)',
  icon: '⛑️',
  standard: 'RSST / CSA Z94.1, Z94.3, Z195, Z94.2, Z96',
  frequency: 'Avant chaque utilisation + vérification mensuelle employeur',
  sections: [
    {
      id: 'casque',
      title: 'Casque de protection (CSA Z94.1)',
      items: [
        { id: 'ppe_ca1', label: 'Coque sans fissures, enfoncements ni perforations', critical: true, withdrawal: true },
        { id: 'ppe_ca2', label: 'Harnais intérieur : sangles intactes, rivets sécurisés, bande frontale en place', critical: true, withdrawal: true },
        { id: 'ppe_ca3', label: 'Aucune peinture, autocollant non autorisé ni perforation DIY', critical: true, withdrawal: true },
        { id: 'ppe_ca4', label: 'Étiquette lisible, date de fabrication ≤ 5 ans', critical: false, withdrawal: false },
      ],
    },
    {
      id: 'lunettes',
      title: 'Lunettes / Écran facial (CSA Z94.3)',
      items: [
        { id: 'ppe_lu1', label: 'Verres sans rayures profondes, fissures ni déformations', critical: true, withdrawal: true },
        { id: 'ppe_lu2', label: 'Monture et charnières intactes', critical: false, withdrawal: false },
        { id: 'ppe_lu3', label: 'Lentilles adaptées à la tâche (teinte, traitement IR/UV)', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'chaussures',
      title: 'Chaussures de sécurité (CSA Z195)',
      items: [
        { id: 'ppe_ch1', label: 'Embouts de protection intacts (aucune perforation visible)', critical: true, withdrawal: true },
        { id: 'ppe_ch2', label: 'Semelles non décollées, antidérapantes, non excessivement usées', critical: true, withdrawal: true },
        { id: 'ppe_ch3', label: 'Tige sans déchirure majeure exposant le pied', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'gants',
      title: 'Gants de protection (CSA Z195)',
      items: [
        { id: 'ppe_ga1', label: 'Aucun trou, coupure ni déchirure', critical: true, withdrawal: true },
        { id: 'ppe_ga2', label: 'Couche de protection intacte (gants chimiques : aucune attaque visible)', critical: true, withdrawal: true },
        { id: 'ppe_ga3', label: 'Type de gants adapté au risque', critical: true, withdrawal: false },
      ],
    },
    {
      id: 'visibilite',
      title: 'Vêtements haute visibilité (CSA Z96)',
      items: [
        { id: 'ppe_vi1', label: 'Bandes réfléchissantes intactes, propres et lisibles', critical: true, withdrawal: true },
        { id: 'ppe_vi2', label: 'Aucune déchirure importante dans les zones de protection', critical: false, withdrawal: false },
        { id: 'ppe_vi3', label: 'Vêtements FR (résistants aux flammes) : réparations uniquement avec tissu FR', critical: true, withdrawal: true },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// REGISTRE GLOBAL
// ─────────────────────────────────────────────
export const EQUIPMENT_CHECKLISTS: Record<InspectionType, EquipmentChecklist> = {
  harness:          harness,
  forklift:         forklift,
  aerial:           aerial,
  scaffold:         scaffold,
  ladder:           ladder,
  power_tools:      powerTools,
  fire_extinguisher: fireExtinguisher,
  gas_detector:     gasDetector,
  respiratory:      respiratory,
  ppe_general:      ppeGeneral,
};

export const INSPECTION_TYPE_OPTIONS: { value: InspectionType; label: string }[] = [
  { value: 'harness',           label: 'Harnais antichute'               },
  { value: 'forklift',          label: 'Chariot élévateur'               },
  { value: 'aerial',            label: 'Nacelle / Plateforme élévatrice' },
  { value: 'scaffold',          label: 'Échafaudage'                     },
  { value: 'ladder',            label: 'Échelle portative'               },
  { value: 'power_tools',       label: 'Outillage électrique'            },
  { value: 'fire_extinguisher', label: 'Extincteur portatif'             },
  { value: 'gas_detector',      label: 'Détecteur multigaz'              },
  { value: 'respiratory',       label: 'Protection respiratoire'         },
  { value: 'ppe_general',       label: 'EPI général'                     },
];

export type ItemResult = 'pass' | 'fail' | 'na';
export type OverallResult = 'conforme' | 'conditionnel' | 'non_conforme' | 'retrait' | 'incomplete';

export type InspectionFrequency =
  | 'avant_utilisation'
  | 'par_quart'
  | 'quotidienne'
  | 'hebdomadaire'
  | 'mensuelle'
  | 'trimestrielle'
  | 'semestrielle'
  | 'annuelle';

export const FREQUENCY_OPTIONS: { value: InspectionFrequency; label: string; labelEn: string; days: number }[] = [
  { value: 'avant_utilisation', label: 'Avant chaque utilisation', labelEn: 'Before each use',  days: 1   },
  { value: 'par_quart',         label: 'Chaque quart de travail',  labelEn: 'Each work shift',  days: 1   },
  { value: 'quotidienne',       label: 'Quotidienne',              labelEn: 'Daily',             days: 1   },
  { value: 'hebdomadaire',      label: 'Hebdomadaire',             labelEn: 'Weekly',       days: 7   },
  { value: 'mensuelle',         label: 'Mensuelle',                labelEn: 'Monthly',      days: 30  },
  { value: 'trimestrielle',     label: 'Trimestrielle',            labelEn: 'Quarterly',    days: 90  },
  { value: 'semestrielle',      label: 'Semestrielle',             labelEn: 'Semi-annual',  days: 182 },
  { value: 'annuelle',          label: 'Annuelle',                 labelEn: 'Annual',       days: 365 },
];

// ─── Provinces canadiennes ────────────────────────────────────────────────────

export const CANADIAN_PROVINCES = [
  { code: 'QC', fr: 'Québec',                    en: 'Quebec'                    },
  { code: 'ON', fr: 'Ontario',                   en: 'Ontario'                   },
  { code: 'BC', fr: 'Colombie-Britannique',      en: 'British Columbia'          },
  { code: 'AB', fr: 'Alberta',                   en: 'Alberta'                   },
  { code: 'SK', fr: 'Saskatchewan',              en: 'Saskatchewan'              },
  { code: 'MB', fr: 'Manitoba',                  en: 'Manitoba'                  },
  { code: 'NB', fr: 'Nouveau-Brunswick',         en: 'New Brunswick'             },
  { code: 'NS', fr: 'Nouvelle-Écosse',           en: 'Nova Scotia'               },
  { code: 'PE', fr: 'Île-du-Prince-Édouard',     en: 'Prince Edward Island'      },
  { code: 'NL', fr: 'Terre-Neuve-et-Labrador',   en: 'Newfoundland & Labrador'   },
  { code: 'NT', fr: 'Territoires du Nord-Ouest', en: 'Northwest Territories'     },
  { code: 'NU', fr: 'Nunavut',                   en: 'Nunavut'                   },
  { code: 'YT', fr: 'Yukon',                     en: 'Yukon'                     },
] as const;

export type ProvinceCode = typeof CANADIAN_PROVINCES[number]['code'];

// Organisme de réglementation par province + références légales clés
export const PROVINCE_REGULATION: Record<ProvinceCode, {
  body: string;
  fr: string;
  en: string;
  refFr: string;
  refEn: string;
}> = {
  QC: { body: 'CNESST', fr: 'CNESST',      en: 'CNESST',       refFr: 'RSST, LSST',                   refEn: 'RSST, LSST'                   },
  ON: { body: 'WSIB',   fr: 'WSIB',        en: 'WSIB',         refFr: 'LSST Ontario, O. Règl. 851',   refEn: 'OHSA Ontario, O. Reg. 851'    },
  BC: { body: 'WSBC',   fr: 'WorkSafeBC',  en: 'WorkSafeBC',   refFr: 'Règlement OHS C.-B.',          refEn: 'BC OHS Regulation'            },
  AB: { body: 'OHS-AB', fr: 'OHS Alberta', en: 'OHS Alberta',  refFr: 'Code OHS Alberta',             refEn: 'Alberta OHS Code'             },
  SK: { body: 'OHS-SK', fr: 'OHS Sask.',   en: 'OHS Sask.',    refFr: 'Règl. OHS Saskatchewan',       refEn: 'SK OHS Regulations'           },
  MB: { body: 'WSH-MB', fr: 'WSH Manitoba',en: 'WSH Manitoba', refFr: 'Code WSH Manitoba',            refEn: 'Manitoba WSH Code'            },
  NB: { body: 'WSNB',   fr: 'WorkSafeNB', en: 'WorkSafeNB',   refFr: 'Règl. Travail sécuritaire NB', refEn: 'NB Regulation 91-191'         },
  NS: { body: 'OHS-NS', fr: 'OHS N.-É.',   en: 'OHS N.S.',     refFr: 'Règl. OHS Nouvelle-Écosse',    refEn: 'NS OHS General Regulations'   },
  PE: { body: 'OHS-PE', fr: 'OHS Î.-P.-É.',en: 'OHS P.E.I.',  refFr: 'Règl. OHS Î.-P.-É.',           refEn: 'PEI OHS Regulations'          },
  NL: { body: 'OHS-NL', fr: 'OHS T.-N.',   en: 'OHS N.L.',     refFr: 'Règl. OHS Terre-Neuve',        refEn: 'NL OHS Regulations'           },
  NT: { body: 'WSCC',   fr: 'CSST T.N.-O.',en: 'WSCC N.W.T.',  refFr: 'Règl. SST T.N.-O.',            refEn: 'N.W.T. OHS Regulations'       },
  NU: { body: 'WSCC',   fr: 'CSST Nunavut',en: 'WSCC Nunavut', refFr: 'Règl. SST Nunavut',            refEn: 'Nunavut OHS Regulations'      },
  YT: { body: 'OHS-YT', fr: 'OHS Yukon',   en: 'OHS Yukon',    refFr: 'Règl. SST Yukon',              refEn: 'Yukon OHS Regulations'        },
};

export function calcOverallResult(
  type: InspectionType,
  results: Record<string, ItemResult>,
): OverallResult {
  const checklist = EQUIPMENT_CHECKLISTS[type];
  if (!checklist) return 'incomplete';
  const allItems = checklist.sections.flatMap(s => s.items);
  const answered = allItems.filter(i => results[i.id]);
  if (answered.length === 0) return 'incomplete';
  if (allItems.some(i => i.withdrawal && results[i.id] === 'fail')) return 'retrait';
  if (allItems.some(i => i.critical && results[i.id] === 'fail')) return 'non_conforme';
  if (allItems.some(i => results[i.id] === 'fail')) return 'conditionnel';
  if (answered.length === allItems.length) return 'conforme';
  return 'incomplete';
}

export function getNonConformities(
  type: InspectionType,
  results: Record<string, ItemResult>,
): { id: string; label: string; critical: boolean; withdrawal: boolean }[] {
  const checklist = EQUIPMENT_CHECKLISTS[type];
  if (!checklist) return [];
  return checklist.sections
    .flatMap(s => s.items)
    .filter(i => results[i.id] === 'fail')
    .map(i => ({ id: i.id, label: i.label, critical: i.critical, withdrawal: i.withdrawal }));
}
