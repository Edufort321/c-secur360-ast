// =================== COMPONENTS/STEPS/STEP4PERMITS/CONSTANTS/TRANSLATIONS.TS - SECTION 1 ===================
// Traductions complètes français-anglais pour le système de permis de travail
"use client";

// =================== INTERFACES ===================

export interface Translation {
  fr: string;
  en: string;
}

export interface TranslationGroup {
  [key: string]: Translation | TranslationGroup;
}

export type Language = 'fr' | 'en';

// =================== TRADUCTIONS GÉNÉRALES ===================

export const GENERAL_TRANSLATIONS: TranslationGroup = {
  // Actions générales
  actions: {
    save: { fr: 'Enregistrer', en: 'Save' },
    cancel: { fr: 'Annuler', en: 'Cancel' },
    delete: { fr: 'Supprimer', en: 'Delete' },
    edit: { fr: 'Modifier', en: 'Edit' },
    add: { fr: 'Ajouter', en: 'Add' },
    remove: { fr: 'Retirer', en: 'Remove' },
    submit: { fr: 'Soumettre', en: 'Submit' },
    approve: { fr: 'Approuver', en: 'Approve' },
    reject: { fr: 'Rejeter', en: 'Reject' },
    validate: { fr: 'Valider', en: 'Validate' },
    verify: { fr: 'Vérifier', en: 'Verify' },
    complete: { fr: 'Compléter', en: 'Complete' },
    start: { fr: 'Démarrer', en: 'Start' },
    stop: { fr: 'Arrêter', en: 'Stop' },
    pause: { fr: 'Pause', en: 'Pause' },
    resume: { fr: 'Reprendre', en: 'Resume' },
    reset: { fr: 'Réinitialiser', en: 'Reset' },
    refresh: { fr: 'Actualiser', en: 'Refresh' },
    search: { fr: 'Rechercher', en: 'Search' },
    filter: { fr: 'Filtrer', en: 'Filter' },
    sort: { fr: 'Trier', en: 'Sort' },
    export: { fr: 'Exporter', en: 'Export' },
    import: { fr: 'Importer', en: 'Import' },
    download: { fr: 'Télécharger', en: 'Download' },
    upload: { fr: 'Téléverser', en: 'Upload' },
    print: { fr: 'Imprimer', en: 'Print' },
    share: { fr: 'Partager', en: 'Share' },
    copy: { fr: 'Copier', en: 'Copy' },
    cut: { fr: 'Couper', en: 'Cut' },
    paste: { fr: 'Coller', en: 'Paste' },
    undo: { fr: 'Annuler', en: 'Undo' },
    redo: { fr: 'Rétablir', en: 'Redo' },
    select: { fr: 'Sélectionner', en: 'Select' },
    deselect: { fr: 'Désélectionner', en: 'Deselect' },
    expand: { fr: 'Développer', en: 'Expand' },
    collapse: { fr: 'Réduire', en: 'Collapse' },
    open: { fr: 'Ouvrir', en: 'Open' },
    close: { fr: 'Fermer', en: 'Close' },
    next: { fr: 'Suivant', en: 'Next' },
    previous: { fr: 'Précédent', en: 'Previous' },
    back: { fr: 'Retour', en: 'Back' },
    forward: { fr: 'Avancer', en: 'Forward' },
    continue: { fr: 'Continuer', en: 'Continue' },
    finish: { fr: 'Terminer', en: 'Finish' },
    help: { fr: 'Aide', en: 'Help' },
    info: { fr: 'Informations', en: 'Information' },
    warning: { fr: 'Avertissement', en: 'Warning' },
    error: { fr: 'Erreur', en: 'Error' },
    success: { fr: 'Succès', en: 'Success' },
    loading: { fr: 'Chargement...', en: 'Loading...' },
    processing: { fr: 'Traitement...', en: 'Processing...' },
    connecting: { fr: 'Connexion...', en: 'Connecting...' },
    synchronizing: { fr: 'Synchronisation...', en: 'Synchronizing...' }
  },

  // Status et états
  status: {
    draft: { fr: 'Brouillon', en: 'Draft' },
    pending: { fr: 'En attente', en: 'Pending' },
    inProgress: { fr: 'En cours', en: 'In Progress' },
    completed: { fr: 'Complété', en: 'Completed' },
    approved: { fr: 'Approuvé', en: 'Approved' },
    rejected: { fr: 'Rejeté', en: 'Rejected' },
    expired: { fr: 'Expiré', en: 'Expired' },
    active: { fr: 'Actif', en: 'Active' },
    inactive: { fr: 'Inactif', en: 'Inactive' },
    suspended: { fr: 'Suspendu', en: 'Suspended' },
    cancelled: { fr: 'Annulé', en: 'Cancelled' },
    valid: { fr: 'Valide', en: 'Valid' },
    invalid: { fr: 'Invalide', en: 'Invalid' },
    connected: { fr: 'Connecté', en: 'Connected' },
    disconnected: { fr: 'Déconnecté', en: 'Disconnected' },
    online: { fr: 'En ligne', en: 'Online' },
    offline: { fr: 'Hors ligne', en: 'Offline' },
    available: { fr: 'Disponible', en: 'Available' },
    unavailable: { fr: 'Indisponible', en: 'Unavailable' },
    enabled: { fr: 'Activé', en: 'Enabled' },
    disabled: { fr: 'Désactivé', en: 'Disabled' },
    visible: { fr: 'Visible', en: 'Visible' },
    hidden: { fr: 'Masqué', en: 'Hidden' },
    required: { fr: 'Requis', en: 'Required' },
    optional: { fr: 'Optionnel', en: 'Optional' },
    mandatory: { fr: 'Obligatoire', en: 'Mandatory' },
    recommended: { fr: 'Recommandé', en: 'Recommended' },
    critical: { fr: 'Critique', en: 'Critical' },
    high: { fr: 'Élevé', en: 'High' },
    medium: { fr: 'Moyen', en: 'Medium' },
    low: { fr: 'Faible', en: 'Low' },
    unknown: { fr: 'Inconnu', en: 'Unknown' }
  },

  // Interface utilisateur de base
  ui: {
    yes: { fr: 'Oui', en: 'Yes' },
    no: { fr: 'Non', en: 'No' },
    ok: { fr: 'OK', en: 'OK' },
    confirm: { fr: 'Confirmer', en: 'Confirm' },
    apply: { fr: 'Appliquer', en: 'Apply' },
    clear: { fr: 'Effacer', en: 'Clear' },
    all: { fr: 'Tout', en: 'All' },
    none: { fr: 'Aucun', en: 'None' },
    other: { fr: 'Autre', en: 'Other' },
    custom: { fr: 'Personnalisé', en: 'Custom' },
    default: { fr: 'Par défaut', en: 'Default' },
    automatic: { fr: 'Automatique', en: 'Automatic' },
    manual: { fr: 'Manuel', en: 'Manual' },
    name: { fr: 'Nom', en: 'Name' },
    description: { fr: 'Description', en: 'Description' },
    type: { fr: 'Type', en: 'Type' },
    category: { fr: 'Catégorie', en: 'Category' },
    priority: { fr: 'Priorité', en: 'Priority' },
    date: { fr: 'Date', en: 'Date' },
    time: { fr: 'Heure', en: 'Time' },
    duration: { fr: 'Durée', en: 'Duration' },
    location: { fr: 'Emplacement', en: 'Location' },
    address: { fr: 'Adresse', en: 'Address' },
    phone: { fr: 'Téléphone', en: 'Phone' },
    email: { fr: 'Courriel', en: 'Email' },
    website: { fr: 'Site web', en: 'Website' },
    notes: { fr: 'Notes', en: 'Notes' },
    comments: { fr: 'Commentaires', en: 'Comments' },
    details: { fr: 'Détails', en: 'Details' },
    summary: { fr: 'Résumé', en: 'Summary' },
    total: { fr: 'Total', en: 'Total' },
    count: { fr: 'Nombre', en: 'Count' },
    amount: { fr: 'Montant', en: 'Amount' },
    quantity: { fr: 'Quantité', en: 'Quantity' },
    percentage: { fr: 'Pourcentage', en: 'Percentage' },
    value: { fr: 'Valeur', en: 'Value' },
    minimum: { fr: 'Minimum', en: 'Minimum' },
    maximum: { fr: 'Maximum', en: 'Maximum' },
    average: { fr: 'Moyenne', en: 'Average' },
    settings: { fr: 'Paramètres', en: 'Settings' },
    preferences: { fr: 'Préférences', en: 'Preferences' },
    configuration: { fr: 'Configuration', en: 'Configuration' },
    profile: { fr: 'Profil', en: 'Profile' },
    account: { fr: 'Compte', en: 'Account' },
    user: { fr: 'Utilisateur', en: 'User' },
    admin: { fr: 'Administrateur', en: 'Administrator' },
    guest: { fr: 'Invité', en: 'Guest' },
    public: { fr: 'Public', en: 'Public' },
    private: { fr: 'Privé', en: 'Private' },
    secure: { fr: 'Sécurisé', en: 'Secure' },
    version: { fr: 'Version', en: 'Version' },
    language: { fr: 'Langue', en: 'Language' },
    theme: { fr: 'Thème', en: 'Theme' }
  },

  // Temps et dates
  time: {
    now: { fr: 'Maintenant', en: 'Now' },
    today: { fr: 'Aujourd\'hui', en: 'Today' },
    yesterday: { fr: 'Hier', en: 'Yesterday' },
    tomorrow: { fr: 'Demain', en: 'Tomorrow' },
    thisWeek: { fr: 'Cette semaine', en: 'This week' },
    lastWeek: { fr: 'La semaine dernière', en: 'Last week' },
    nextWeek: { fr: 'La semaine prochaine', en: 'Next week' },
    thisMonth: { fr: 'Ce mois-ci', en: 'This month' },
    lastMonth: { fr: 'Le mois dernier', en: 'Last month' },
    nextMonth: { fr: 'Le mois prochain', en: 'Next month' },
    thisYear: { fr: 'Cette année', en: 'This year' },
    lastYear: { fr: 'L\'année dernière', en: 'Last year' },
    nextYear: { fr: 'L\'année prochaine', en: 'Next year' },
    seconds: { fr: 'secondes', en: 'seconds' },
    minutes: { fr: 'minutes', en: 'minutes' },
    hours: { fr: 'heures', en: 'hours' },
    days: { fr: 'jours', en: 'days' },
    weeks: { fr: 'semaines', en: 'weeks' },
    months: { fr: 'mois', en: 'months' },
    years: { fr: 'années', en: 'years' },
    ago: { fr: 'il y a', en: 'ago' },
    in: { fr: 'dans', en: 'in' },
    remaining: { fr: 'restant', en: 'remaining' },
    elapsed: { fr: 'écoulé', en: 'elapsed' },
    weekdays: {
      monday: { fr: 'Lundi', en: 'Monday' },
      tuesday: { fr: 'Mardi', en: 'Tuesday' },
      wednesday: { fr: 'Mercredi', en: 'Wednesday' },
      thursday: { fr: 'Jeudi', en: 'Thursday' },
      friday: { fr: 'Vendredi', en: 'Friday' },
      saturday: { fr: 'Samedi', en: 'Saturday' },
      sunday: { fr: 'Dimanche', en: 'Sunday' }
    },
    monthNames: {
      january: { fr: 'Janvier', en: 'January' },
      february: { fr: 'Février', en: 'February' },
      march: { fr: 'Mars', en: 'March' },
      april: { fr: 'Avril', en: 'April' },
      may: { fr: 'Mai', en: 'May' },
      june: { fr: 'Juin', en: 'June' },
      july: { fr: 'Juillet', en: 'July' },
      august: { fr: 'Août', en: 'August' },
      september: { fr: 'Septembre', en: 'September' },
      october: { fr: 'Octobre', en: 'October' },
      november: { fr: 'Novembre', en: 'November' },
      december: { fr: 'Décembre', en: 'December' }
    }
  },

  // Validation et erreurs
  validation: {
    required: { fr: 'Ce champ est requis', en: 'This field is required' },
    invalid: { fr: 'Valeur invalide', en: 'Invalid value' },
    tooShort: { fr: 'Trop court', en: 'Too short' },
    tooLong: { fr: 'Trop long', en: 'Too long' },
    mustBeNumber: { fr: 'Doit être un nombre', en: 'Must be a number' },
    mustBePositive: { fr: 'Doit être positif', en: 'Must be positive' },
    mustBeEmail: { fr: 'Doit être un courriel valide', en: 'Must be a valid email' },
    mustBePhone: { fr: 'Doit être un numéro de téléphone valide', en: 'Must be a valid phone number' },
    mustBeUrl: { fr: 'Doit être une URL valide', en: 'Must be a valid URL' },
    mustBeDate: { fr: 'Doit être une date valide', en: 'Must be a valid date' },
    mustBeTime: { fr: 'Doit être une heure valide', en: 'Must be a valid time' },
    passwordTooWeak: { fr: 'Mot de passe trop faible', en: 'Password too weak' },
    passwordMismatch: { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },
    fileTooBig: { fr: 'Fichier trop volumineux', en: 'File too large' },
    fileTooSmall: { fr: 'Fichier trop petit', en: 'File too small' },
    unsupportedFileType: { fr: 'Type de fichier non supporté', en: 'Unsupported file type' },
    uploadFailed: { fr: 'Échec du téléversement', en: 'Upload failed' },
    downloadFailed: { fr: 'Échec du téléchargement', en: 'Download failed' },
    connectionLost: { fr: 'Connexion perdue', en: 'Connection lost' },
    timeout: { fr: 'Délai d\'attente dépassé', en: 'Timeout' },
    serverError: { fr: 'Erreur du serveur', en: 'Server error' },
    notFound: { fr: 'Non trouvé', en: 'Not found' },
    unauthorized: { fr: 'Non autorisé', en: 'Unauthorized' },
    forbidden: { fr: 'Interdit', en: 'Forbidden' },
    conflict: { fr: 'Conflit', en: 'Conflict' },
    badRequest: { fr: 'Requête invalide', en: 'Bad request' },
    serviceUnavailable: { fr: 'Service indisponible', en: 'Service unavailable' }
  }
};

// =================== TRADUCTIONS SPÉCIFIQUES AUX PERMIS ===================

export const PERMIT_TRANSLATIONS: TranslationGroup = {
  // Types de permis
  permitTypes: {
    confinedSpace: { fr: 'Espace clos', en: 'Confined Space' },
    hotWork: { fr: 'Travail à chaud', en: 'Hot Work' },
    excavation: { fr: 'Excavation', en: 'Excavation' },
    lifting: { fr: 'Levage', en: 'Lifting' },
    workingAtHeights: { fr: 'Travail en hauteur', en: 'Working at Heights' },
    energyIsolation: { fr: 'Isolation énergétique', en: 'Energy Isolation' },
    loto: { fr: 'Cadenassage-étiquetage', en: 'Lockout-Tagout' },
    pressureVessel: { fr: 'Équipement sous pression', en: 'Pressure Vessel' },
    radiography: { fr: 'Radiographie industrielle', en: 'Industrial Radiography' },
    roofing: { fr: 'Travail sur toiture', en: 'Roofing Work' },
    demolition: { fr: 'Démolition', en: 'Demolition' },
    electrical: { fr: 'Travail électrique', en: 'Electrical Work' },
    chemical: { fr: 'Manipulation chimique', en: 'Chemical Handling' },
    asbestos: { fr: 'Amiante', en: 'Asbestos' },
    lead: { fr: 'Plomb', en: 'Lead' },
    silica: { fr: 'Silice', en: 'Silica' }
  },

  // Catégories
  categories: {
    safety: { fr: 'Sécurité', en: 'Safety' },
    environmental: { fr: 'Environnemental', en: 'Environmental' },
    operational: { fr: 'Opérationnel', en: 'Operational' },
    specialized: { fr: 'Spécialisé', en: 'Specialized' },
    regulatory: { fr: 'Réglementaire', en: 'Regulatory' },
    emergency: { fr: 'Urgence', en: 'Emergency' }
  },

  // Niveaux de risque
  riskLevels: {
    low: { fr: 'Faible', en: 'Low' },
    medium: { fr: 'Moyen', en: 'Medium' },
    high: { fr: 'Élevé', en: 'High' },
    critical: { fr: 'Critique', en: 'Critical' },
    extreme: { fr: 'Extrême', en: 'Extreme' }
  },

  // Workflow et approbation
  workflow: {
    submission: { fr: 'Soumission', en: 'Submission' },
    review: { fr: 'Révision', en: 'Review' },
    approval: { fr: 'Approbation', en: 'Approval' },
    authorization: { fr: 'Autorisation', en: 'Authorization' },
    execution: { fr: 'Exécution', en: 'Execution' },
    completion: { fr: 'Achèvement', en: 'Completion' },
    closure: { fr: 'Fermeture', en: 'Closure' },
    escalation: { fr: 'Escalade', en: 'Escalation' },
    delegation: { fr: 'Délégation', en: 'Delegation' },
    override: { fr: 'Remplacement', en: 'Override' },
    suspension: { fr: 'Suspension', en: 'Suspension' },
    extension: { fr: 'Prolongation', en: 'Extension' },
    renewal: { fr: 'Renouvellement', en: 'Renewal' },
    modification: { fr: 'Modification', en: 'Modification' },
    amendment: { fr: 'Amendement', en: 'Amendment' },
    revision: { fr: 'Révision', en: 'Revision' },
    cancellation: { fr: 'Annulation', en: 'Cancellation' },
    withdrawal: { fr: 'Retrait', en: 'Withdrawal' }
  },

  // Rôles et personnel
  roles: {
    supervisor: { fr: 'Superviseur', en: 'Supervisor' },
    manager: { fr: 'Gestionnaire', en: 'Manager' },
    safetyOfficer: { fr: 'Agent de sécurité', en: 'Safety Officer' },
    competentPerson: { fr: 'Personne compétente', en: 'Competent Person' },
    qualifiedPerson: { fr: 'Personne qualifiée', en: 'Qualified Person' },
    authorizedPerson: { fr: 'Personne autorisée', en: 'Authorized Person' },
    entrant: { fr: 'Entrant', en: 'Entrant' },
    attendant: { fr: 'Surveillant', en: 'Attendant' },
    fireWatch: { fr: 'Surveillant incendie', en: 'Fire Watch' },
    rescuer: { fr: 'Secouriste', en: 'Rescuer' },
    operator: { fr: 'Opérateur', en: 'Operator' },
    technician: { fr: 'Technicien', en: 'Technician' },
    electrician: { fr: 'Électricien', en: 'Electrician' },
    welder: { fr: 'Soudeur', en: 'Welder' },
    rigger: { fr: 'Gréeur', en: 'Rigger' },
    signaller: { fr: 'Signaleur', en: 'Signaller' },
    inspector: { fr: 'Inspecteur', en: 'Inspector' },
    engineer: { fr: 'Ingénieur', en: 'Engineer' },
    coordinator: { fr: 'Coordinateur', en: 'Coordinator' },
    specialist: { fr: 'Spécialiste', en: 'Specialist' },
    consultant: { fr: 'Consultant', en: 'Consultant' },
    contractor: { fr: 'Entrepreneur', en: 'Contractor' },
    subcontractor: { fr: 'Sous-traitant', en: 'Subcontractor' },
    client: { fr: 'Client', en: 'Client' },
    representative: { fr: 'Représentant', en: 'Representative' },
    witness: { fr: 'Témoin', en: 'Witness' }
  }
};
// =================== COMPONENTS/STEPS/STEP4PERMITS/CONSTANTS/TRANSLATIONS.TS - SECTION 2 ===================
// Suite des traductions - Équipements, Interface utilisateur et fonctions utilitaires
"use client";

// =================== TRADUCTIONS ÉQUIPEMENTS ===================

export const EQUIPMENT_TRANSLATIONS: TranslationGroup = {
  // Types d'équipements
  types: {
    detector: { fr: 'Détecteur', en: 'Detector' },
    monitor: { fr: 'Moniteur', en: 'Monitor' },
    sensor: { fr: 'Capteur', en: 'Sensor' },
    alarm: { fr: 'Alarme', en: 'Alarm' },
    ventilator: { fr: 'Ventilateur', en: 'Ventilator' },
    blower: { fr: 'Souffleur', en: 'Blower' },
    extinguisher: { fr: 'Extincteur', en: 'Extinguisher' },
    hose: { fr: 'Boyau', en: 'Hose' },
    harness: { fr: 'Harnais', en: 'Harness' },
    lifeline: { fr: 'Ligne de vie', en: 'Lifeline' },
    anchor: { fr: 'Ancrage', en: 'Anchor' },
    tripod: { fr: 'Trépied', en: 'Tripod' },
    winch: { fr: 'Treuil', en: 'Winch' },
    crane: { fr: 'Grue', en: 'Crane' },
    ladder: { fr: 'Échelle', en: 'Ladder' },
    scaffold: { fr: 'Échafaudage', en: 'Scaffold' },
    platform: { fr: 'Plateforme', en: 'Platform' },
    barrier: { fr: 'Barrière', en: 'Barrier' },
    cone: { fr: 'Cône', en: 'Cone' },
    tape: { fr: 'Ruban', en: 'Tape' },
    sign: { fr: 'Panneau', en: 'Sign' },
    light: { fr: 'Éclairage', en: 'Light' },
    radio: { fr: 'Radio', en: 'Radio' },
    communicator: { fr: 'Communicateur', en: 'Communicator' },
    camera: { fr: 'Caméra', en: 'Camera' },
    tool: { fr: 'Outil', en: 'Tool' },
    material: { fr: 'Matériel', en: 'Material' },
    supply: { fr: 'Fourniture', en: 'Supply' },
    consumable: { fr: 'Consommable', en: 'Consumable' },
    spare: { fr: 'Pièce de rechange', en: 'Spare Part' },
    accessory: { fr: 'Accessoire', en: 'Accessory' },
    component: { fr: 'Composant', en: 'Component' },
    kit: { fr: 'Trousse', en: 'Kit' },
    set: { fr: 'Ensemble', en: 'Set' },
    package: { fr: 'Ensemble', en: 'Package' },
    system: { fr: 'Système', en: 'System' }
  },

  // États équipements
  status: {
    available: { fr: 'Disponible', en: 'Available' },
    inUse: { fr: 'En utilisation', en: 'In Use' },
    maintenance: { fr: 'En maintenance', en: 'Under Maintenance' },
    calibration: { fr: 'En calibration', en: 'Under Calibration' },
    repair: { fr: 'En réparation', en: 'Under Repair' },
    outOfService: { fr: 'Hors service', en: 'Out of Service' },
    damaged: { fr: 'Endommagé', en: 'Damaged' },
    expired: { fr: 'Expiré', en: 'Expired' },
    recalled: { fr: 'Rappelé', en: 'Recalled' },
    quarantined: { fr: 'En quarantaine', en: 'Quarantined' },
    certified: { fr: 'Certifié', en: 'Certified' },
    inspected: { fr: 'Inspecté', en: 'Inspected' },
    tested: { fr: 'Testé', en: 'Tested' },
    validated: { fr: 'Validé', en: 'Validated' },
    approved: { fr: 'Approuvé', en: 'Approved' }
  }
};

// =================== TRADUCTIONS TESTS ATMOSPHÉRIQUES ===================

export const ATMOSPHERIC_TRANSLATIONS: TranslationGroup = {
  // Paramètres atmosphériques
  parameters: {
    oxygen: { fr: 'Oxygène', en: 'Oxygen' },
    lel: { fr: 'LIE', en: 'LEL' },
    lowerExplosiveLimit: { fr: 'Limite inférieure d\'explosivité', en: 'Lower Explosive Limit' },
    upperExplosiveLimit: { fr: 'Limite supérieure d\'explosivité', en: 'Upper Explosive Limit' },
    hydrogenSulfide: { fr: 'Sulfure d\'hydrogène', en: 'Hydrogen Sulfide' },
    carbonMonoxide: { fr: 'Monoxyde de carbone', en: 'Carbon Monoxide' },
    carbonDioxide: { fr: 'Dioxyde de carbone', en: 'Carbon Dioxide' },
    nitrogenDioxide: { fr: 'Dioxyde d\'azote', en: 'Nitrogen Dioxide' },
    sulfurDioxide: { fr: 'Dioxyde de soufre', en: 'Sulfur Dioxide' },
    ammonia: { fr: 'Ammoniac', en: 'Ammonia' },
    methane: { fr: 'Méthane', en: 'Methane' },
    propane: { fr: 'Propane', en: 'Propane' },
    benzene: { fr: 'Benzène', en: 'Benzene' },
    toluene: { fr: 'Toluène', en: 'Toluene' },
    xylene: { fr: 'Xylène', en: 'Xylene' },
    temperature: { fr: 'Température', en: 'Temperature' },
    humidity: { fr: 'Humidité', en: 'Humidity' },
    pressure: { fr: 'Pression', en: 'Pressure' },
    windSpeed: { fr: 'Vitesse du vent', en: 'Wind Speed' },
    windDirection: { fr: 'Direction du vent', en: 'Wind Direction' },
    visibility: { fr: 'Visibilité', en: 'Visibility' },
    noise: { fr: 'Bruit', en: 'Noise' },
    vibration: { fr: 'Vibration', en: 'Vibration' },
    radiation: { fr: 'Radiation', en: 'Radiation' },
    electromagnetic: { fr: 'Électromagnétique', en: 'Electromagnetic' },
    dust: { fr: 'Poussière', en: 'Dust' },
    vapors: { fr: 'Vapeurs', en: 'Vapors' },
    fumes: { fr: 'Fumées', en: 'Fumes' },
    mist: { fr: 'Brouillard', en: 'Mist' },
    aerosol: { fr: 'Aérosol', en: 'Aerosol' }
  },

  // Unités de mesure
  units: {
    percentage: { fr: '%', en: '%' },
    ppm: { fr: 'ppm', en: 'ppm' },
    ppb: { fr: 'ppb', en: 'ppb' },
    mgm3: { fr: 'mg/m³', en: 'mg/m³' },
    celsius: { fr: '°C', en: '°C' },
    fahrenheit: { fr: '°F', en: '°F' },
    pascal: { fr: 'Pa', en: 'Pa' },
    kpa: { fr: 'kPa', en: 'kPa' },
    bar: { fr: 'bar', en: 'bar' },
    psi: { fr: 'psi', en: 'psi' },
    kmh: { fr: 'km/h', en: 'km/h' },
    ms: { fr: 'm/s', en: 'm/s' },
    mph: { fr: 'mph', en: 'mph' },
    decibel: { fr: 'dB', en: 'dB' },
    hertz: { fr: 'Hz', en: 'Hz' },
    microsievert: { fr: 'μSv', en: 'μSv' },
    millisievert: { fr: 'mSv', en: 'mSv' },
    rem: { fr: 'rem', en: 'rem' },
    roentgen: { fr: 'R', en: 'R' }
  },

  // États de lecture
  reading: {
    normal: { fr: 'Normal', en: 'Normal' },
    warning: { fr: 'Avertissement', en: 'Warning' },
    critical: { fr: 'Critique', en: 'Critical' },
    alarm: { fr: 'Alarme', en: 'Alarm' },
    safe: { fr: 'Sécuritaire', en: 'Safe' },
    unsafe: { fr: 'Non sécuritaire', en: 'Unsafe' },
    acceptable: { fr: 'Acceptable', en: 'Acceptable' },
    unacceptable: { fr: 'Inacceptable', en: 'Unacceptable' },
    stable: { fr: 'Stable', en: 'Stable' },
    unstable: { fr: 'Instable', en: 'Unstable' },
    increasing: { fr: 'En augmentation', en: 'Increasing' },
    decreasing: { fr: 'En diminution', en: 'Decreasing' },
    fluctuating: { fr: 'Fluctuant', en: 'Fluctuating' }
  }
};

// =================== TRADUCTIONS INTERFACE UTILISATEUR ===================

export const UI_TRANSLATIONS: TranslationGroup = {
  // Navigation
  navigation: {
    home: { fr: 'Accueil', en: 'Home' },
    dashboard: { fr: 'Tableau de bord', en: 'Dashboard' },
    permits: { fr: 'Permis', en: 'Permits' },
    createPermit: { fr: 'Créer un permis', en: 'Create Permit' },
    managePermits: { fr: 'Gérer les permis', en: 'Manage Permits' },
    permitHistory: { fr: 'Historique des permis', en: 'Permit History' },
    templates: { fr: 'Modèles', en: 'Templates' },
    personnel: { fr: 'Personnel', en: 'Personnel' },
    equipment: { fr: 'Équipements', en: 'Equipment' },
    procedures: { fr: 'Procédures', en: 'Procedures' },
    compliance: { fr: 'Conformité', en: 'Compliance' },
    reports: { fr: 'Rapports', en: 'Reports' },
    analytics: { fr: 'Analytiques', en: 'Analytics' },
    settings: { fr: 'Paramètres', en: 'Settings' },
    profile: { fr: 'Profil', en: 'Profile' },
    logout: { fr: 'Déconnexion', en: 'Logout' },
    help: { fr: 'Aide', en: 'Help' },
    support: { fr: 'Support', en: 'Support' },
    about: { fr: 'À propos', en: 'About' },
    contact: { fr: 'Contact', en: 'Contact' }
  },

  // Sections de formulaires
  forms: {
    identification: { fr: 'Identification', en: 'Identification' },
    personnel: { fr: 'Personnel', en: 'Personnel' },
    atmospheric: { fr: 'Tests atmosphériques', en: 'Atmospheric Testing' },
    equipment: { fr: 'Équipements', en: 'Equipment' },
    procedures: { fr: 'Procédures', en: 'Procedures' },
    validation: { fr: 'Validation', en: 'Validation' },
    signature: { fr: 'Signature', en: 'Signature' },
    approval: { fr: 'Approbation', en: 'Approval' },
    submission: { fr: 'Soumission', en: 'Submission' },
    review: { fr: 'Révision', en: 'Review' },
    completion: { fr: 'Achèvement', en: 'Completion' },
    fillRequired: { fr: 'Remplir les champs requis', en: 'Fill required fields' },
    saveProgress: { fr: 'Sauvegarder le progrès', en: 'Save progress' },
    loadSaved: { fr: 'Charger la sauvegarde', en: 'Load saved' },
    clearForm: { fr: 'Effacer le formulaire', en: 'Clear form' },
    resetForm: { fr: 'Réinitialiser le formulaire', en: 'Reset form' },
    validateForm: { fr: 'Valider le formulaire', en: 'Validate form' },
    submitForm: { fr: 'Soumettre le formulaire', en: 'Submit form' },
    formValid: { fr: 'Formulaire valide', en: 'Form valid' },
    formInvalid: { fr: 'Formulaire invalide', en: 'Form invalid' },
    formIncomplete: { fr: 'Formulaire incomplet', en: 'Form incomplete' },
    missingFields: { fr: 'Champs manquants', en: 'Missing fields' },
    invalidFields: { fr: 'Champs invalides', en: 'Invalid fields' },
    unsavedChanges: { fr: 'Modifications non sauvegardées', en: 'Unsaved changes' },
    autoSaving: { fr: 'Sauvegarde automatique...', en: 'Auto-saving...' },
    autoSaved: { fr: 'Sauvegardé automatiquement', en: 'Auto-saved' },
    saveSuccessful: { fr: 'Sauvegarde réussie', en: 'Save successful' },
    saveFailed: { fr: 'Échec de la sauvegarde', en: 'Save failed' }
  },

  // Tableaux et listes
  tables: {
    noData: { fr: 'Aucune donnée', en: 'No data' },
    loading: { fr: 'Chargement...', en: 'Loading...' },
    error: { fr: 'Erreur de chargement', en: 'Loading error' },
    retry: { fr: 'Réessayer', en: 'Retry' },
    refresh: { fr: 'Actualiser', en: 'Refresh' },
    filter: { fr: 'Filtrer', en: 'Filter' },
    sort: { fr: 'Trier', en: 'Sort' },
    search: { fr: 'Rechercher', en: 'Search' },
    reset: { fr: 'Réinitialiser', en: 'Reset' },
    export: { fr: 'Exporter', en: 'Export' },
    selectAll: { fr: 'Tout sélectionner', en: 'Select all' },
    deselectAll: { fr: 'Tout désélectionner', en: 'Deselect all' },
    selectedItems: { fr: 'Éléments sélectionnés', en: 'Selected items' },
    itemsPerPage: { fr: 'Éléments par page', en: 'Items per page' },
    page: { fr: 'Page', en: 'Page' },
    of: { fr: 'de', en: 'of' },
    total: { fr: 'Total', en: 'Total' },
    showing: { fr: 'Affichage', en: 'Showing' },
    to: { fr: 'à', en: 'to' },
    first: { fr: 'Premier', en: 'First' },
    last: { fr: 'Dernier', en: 'Last' },
    next: { fr: 'Suivant', en: 'Next' },
    previous: { fr: 'Précédent', en: 'Previous' },
    ascending: { fr: 'Croissant', en: 'Ascending' },
    descending: { fr: 'Décroissant', en: 'Descending' },
    unsorted: { fr: 'Non trié', en: 'Unsorted' },
    sortBy: { fr: 'Trier par', en: 'Sort by' },
    filterBy: { fr: 'Filtrer par', en: 'Filter by' },
    contains: { fr: 'Contient', en: 'Contains' },
    equals: { fr: 'Égal à', en: 'Equals' },
    startsWith: { fr: 'Commence par', en: 'Starts with' },
    endsWith: { fr: 'Se termine par', en: 'Ends with' },
    greaterThan: { fr: 'Supérieur à', en: 'Greater than' },
    lessThan: { fr: 'Inférieur à', en: 'Less than' },
    between: { fr: 'Entre', en: 'Between' }
  },

  // Alertes et notifications
  alerts: {
    info: { fr: 'Information', en: 'Information' },
    warning: { fr: 'Avertissement', en: 'Warning' },
    error: { fr: 'Erreur', en: 'Error' },
    success: { fr: 'Succès', en: 'Success' },
    confirmation: { fr: 'Confirmation', en: 'Confirmation' },
    question: { fr: 'Question', en: 'Question' },
    attention: { fr: 'Attention', en: 'Attention' },
    notice: { fr: 'Avis', en: 'Notice' },
    reminder: { fr: 'Rappel', en: 'Reminder' },
    update: { fr: 'Mise à jour', en: 'Update' },
    critical: { fr: 'Critique', en: 'Critical' },
    urgent: { fr: 'Urgent', en: 'Urgent' },
    important: { fr: 'Important', en: 'Important' },
    normal: { fr: 'Normal', en: 'Normal' },
    low: { fr: 'Faible', en: 'Low' },
    dismiss: { fr: 'Fermer', en: 'Dismiss' },
    close: { fr: 'Fermer', en: 'Close' },
    acknowledge: { fr: 'Accuser réception', en: 'Acknowledge' },
    readMore: { fr: 'Lire plus', en: 'Read more' },
    showLess: { fr: 'Afficher moins', en: 'Show less' },
    details: { fr: 'Détails', en: 'Details' },
    moreInfo: { fr: 'Plus d\'informations', en: 'More information' },
    contactSupport: { fr: 'Contacter le support', en: 'Contact support' },
    reportIssue: { fr: 'Signaler un problème', en: 'Report issue' }
  }
};

// =================== MESSAGES SYSTÈME ===================

export const SYSTEM_TRANSLATIONS: TranslationGroup = {
  // Messages d'erreur
  errors: {
    general: { fr: 'Une erreur est survenue', en: 'An error occurred' },
    network: { fr: 'Erreur de réseau', en: 'Network error' },
    server: { fr: 'Erreur du serveur', en: 'Server error' },
    database: { fr: 'Erreur de base de données', en: 'Database error' },
    authentication: { fr: 'Erreur d\'authentification', en: 'Authentication error' },
    authorization: { fr: 'Erreur d\'autorisation', en: 'Authorization error' },
    validation: { fr: 'Erreur de validation', en: 'Validation error' },
    timeout: { fr: 'Délai d\'attente dépassé', en: 'Timeout error' },
    notFound: { fr: 'Ressource non trouvée', en: 'Resource not found' },
    conflict: { fr: 'Conflit de données', en: 'Data conflict' },
    forbidden: { fr: 'Accès interdit', en: 'Access forbidden' },
    unavailable: { fr: 'Service indisponible', en: 'Service unavailable' },
    maintenance: { fr: 'En maintenance', en: 'Under maintenance' },
    overloaded: { fr: 'Système surchargé', en: 'System overloaded' },
    ratelimited: { fr: 'Limite de taux atteinte', en: 'Rate limit exceeded' },
    quota: { fr: 'Quota dépassé', en: 'Quota exceeded' },
    storage: { fr: 'Erreur de stockage', en: 'Storage error' },
    permission: { fr: 'Permission refusée', en: 'Permission denied' },
    expired: { fr: 'Session expirée', en: 'Session expired' },
    invalid: { fr: 'Données invalides', en: 'Invalid data' },
    corrupted: { fr: 'Données corrompues', en: 'Corrupted data' }
  },

  // Messages de succès
  success: {
    saved: { fr: 'Sauvegardé avec succès', en: 'Successfully saved' },
    created: { fr: 'Créé avec succès', en: 'Successfully created' },
    updated: { fr: 'Mis à jour avec succès', en: 'Successfully updated' },
    deleted: { fr: 'Supprimé avec succès', en: 'Successfully deleted' },
    submitted: { fr: 'Soumis avec succès', en: 'Successfully submitted' },
    approved: { fr: 'Approuvé avec succès', en: 'Successfully approved' },
    completed: { fr: 'Complété avec succès', en: 'Successfully completed' },
    validated: { fr: 'Validé avec succès', en: 'Successfully validated' },
    synchronized: { fr: 'Synchronisé avec succès', en: 'Successfully synchronized' },
    exported: { fr: 'Exporté avec succès', en: 'Successfully exported' },
    imported: { fr: 'Importé avec succès', en: 'Successfully imported' },
    uploaded: { fr: 'Téléversé avec succès', en: 'Successfully uploaded' },
    downloaded: { fr: 'Téléchargé avec succès', en: 'Successfully downloaded' }
  },

  // Messages informatifs
  info: {
    loading: { fr: 'Chargement en cours...', en: 'Loading...' },
    processing: { fr: 'Traitement en cours...', en: 'Processing...' },
    saving: { fr: 'Sauvegarde en cours...', en: 'Saving...' },
    uploading: { fr: 'Téléversement en cours...', en: 'Uploading...' },
    downloading: { fr: 'Téléchargement en cours...', en: 'Downloading...' },
    connecting: { fr: 'Connexion en cours...', en: 'Connecting...' },
    synchronizing: { fr: 'Synchronisation en cours...', en: 'Synchronizing...' },
    validating: { fr: 'Validation en cours...', en: 'Validating...' },
    submitting: { fr: 'Soumission en cours...', en: 'Submitting...' },
    reviewing: { fr: 'Révision en cours...', en: 'Reviewing...' },
    approving: { fr: 'Approbation en cours...', en: 'Approving...' },
    completing: { fr: 'Finalisation en cours...', en: 'Completing...' }
  },

  // Confirmations
  confirmations: {
    delete: { fr: 'Êtes-vous sûr de vouloir supprimer ?', en: 'Are you sure you want to delete?' },
    cancel: { fr: 'Êtes-vous sûr de vouloir annuler ?', en: 'Are you sure you want to cancel?' },
    submit: { fr: 'Êtes-vous sûr de vouloir soumettre ?', en: 'Are you sure you want to submit?' },
    approve: { fr: 'Êtes-vous sûr de vouloir approuver ?', en: 'Are you sure you want to approve?' },
    reject: { fr: 'Êtes-vous sûr de vouloir rejeter ?', en: 'Are you sure you want to reject?' },
    reset: { fr: 'Êtes-vous sûr de vouloir réinitialiser ?', en: 'Are you sure you want to reset?' },
    clear: { fr: 'Êtes-vous sûr de vouloir effacer ?', en: 'Are you sure you want to clear?' },
    overwrite: { fr: 'Êtes-vous sûr de vouloir remplacer ?', en: 'Are you sure you want to overwrite?' },
    discard: { fr: 'Êtes-vous sûr de vouloir abandonner ?', en: 'Are you sure you want to discard?' },
    logout: { fr: 'Êtes-vous sûr de vouloir vous déconnecter ?', en: 'Are you sure you want to logout?' },
    leave: { fr: 'Êtes-vous sûr de vouloir quitter ?', en: 'Are you sure you want to leave?' },
    proceed: { fr: 'Voulez-vous continuer ?', en: 'Do you want to proceed?' }
  }
};

// =================== FONCTIONS UTILITAIRES ===================

export function getTranslation(
  group: TranslationGroup,
  key: string,
  language: Language = 'fr'
): string {
  const keys = key.split('.');
  let current: any = group;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return key; // Retourne la clé si la traduction n'est pas trouvée
    }
  }
  
  if (current && typeof current === 'object' && language in current) {
    return current[language];
  }
  
  return key; // Retourne la clé si la traduction n'est pas trouvée
}

export function translate(key: string, language: Language = 'fr'): string {
  // Essaie dans différents groupes de traductions
  const groups = [
    GENERAL_TRANSLATIONS,
    PERMIT_TRANSLATIONS,
    EQUIPMENT_TRANSLATIONS,
    ATMOSPHERIC_TRANSLATIONS,
    UI_TRANSLATIONS,
    SYSTEM_TRANSLATIONS
  ];
  
  for (const group of groups) {
    const translation = getTranslation(group, key, language);
    if (translation !== key) {
      return translation;
    }
  }
  
  return key; // Retourne la clé si aucune traduction n'est trouvée
}

export function t(key: string, language: Language = 'fr'): string {
  return translate(key, language);
}

export function getAvailableLanguages(): Language[] {
  return ['fr', 'en'];
}

export function isValidLanguage(language: string): language is Language {
  return ['fr', 'en'].includes(language as Language);
}

export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    fr: 'Français',
    en: 'English'
  };
  return names[language] || language;
}

export function getLanguageFlag(language: Language): string {
  const flags: Record<Language, string> = {
    fr: '🇫🇷',
    en: '🇬🇧'
  };
  return flags[language] || '🌐';
}

export function formatTranslationKey(key: string): string {
  return key
    .split('.')
    .map(part => part.replace(/([A-Z])/g, ' $1'))
    .join(' › ')
    .replace(/^\w/, c => c.toUpperCase());
}

export function searchTranslations(
  query: string,
  language: Language = 'fr',
  groups: TranslationGroup[] = []
): Array<{ key: string; value: string; group: string }> {
  const searchGroups = groups.length > 0 ? groups : [
    GENERAL_TRANSLATIONS,
    PERMIT_TRANSLATIONS,
    EQUIPMENT_TRANSLATIONS,
    ATMOSPHERIC_TRANSLATIONS,
    UI_TRANSLATIONS,
    SYSTEM_TRANSLATIONS
  ];
  
  const results: Array<{ key: string; value: string; group: string }> = [];
  const searchTerm = query.toLowerCase();
  
  const searchInGroup = (group: TranslationGroup, groupName: string, prefix = '') => {
    for (const [key, value] of Object.entries(group)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && ('fr' in value || 'en' in value)) {
        const translation = value as Translation;
        const translatedValue = translation[language] || translation.fr;
        
        if (
          key.toLowerCase().includes(searchTerm) ||
          translatedValue.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            key: fullKey,
            value: translatedValue,
            group: groupName
          });
        }
      } else if (typeof value === 'object') {
        searchInGroup(value as TranslationGroup, groupName, fullKey);
      }
    }
  };
  
  const groupNames = [
    'General',
    'Permits',
    'Equipment',
    'Atmospheric',
    'UI',
    'System'
  ];
  
  searchGroups.forEach((group, index) => {
    searchInGroup(group, groupNames[index] || 'Unknown');
  });
  
  return results.sort((a, b) => a.key.localeCompare(b.key));
}

export function validateTranslationCompleteness(): {
  isComplete: boolean;
  missingTranslations: string[];
  stats: {
    total: number;
    complete: number;
    missing: number;
    completionRate: number;
  };
} {
  const missing: string[] = [];
  let total = 0;
  let complete = 0;
  
  const checkGroup = (group: TranslationGroup, prefix = '') => {
    for (const [key, value] of Object.entries(group)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && ('fr' in value || 'en' in value)) {
        const translation = value as Translation;
        total++;
        
        if (translation.fr && translation.en) {
          complete++;
        } else {
          missing.push(`${fullKey}: ${!translation.fr ? 'fr' : ''} ${!translation.en ? 'en' : ''}`);
        }
      } else if (typeof value === 'object') {
        checkGroup(value as TranslationGroup, fullKey);
      }
    }
  };
  
  const allGroups = [
    GENERAL_TRANSLATIONS,
    PERMIT_TRANSLATIONS,
    EQUIPMENT_TRANSLATIONS,
    ATMOSPHERIC_TRANSLATIONS,
    UI_TRANSLATIONS,
    SYSTEM_TRANSLATIONS
  ];
  
  allGroups.forEach(group => checkGroup(group));
  
  return {
    isComplete: missing.length === 0,
    missingTranslations: missing,
    stats: {
      total,
      complete,
      missing: missing.length,
      completionRate: total > 0 ? (complete / total) * 100 : 100
    }
  };
}

// =================== EXPORTS COMBINÉS ===================

export const ALL_TRANSLATIONS = {
  general: GENERAL_TRANSLATIONS,
  permits: PERMIT_TRANSLATIONS,
  equipment: EQUIPMENT_TRANSLATIONS,
  atmospheric: ATMOSPHERIC_TRANSLATIONS,
  ui: UI_TRANSLATIONS,
  system: SYSTEM_TRANSLATIONS
} as const;

export type TranslationKeys = keyof typeof ALL_TRANSLATIONS;

export default ALL_TRANSLATIONS;
