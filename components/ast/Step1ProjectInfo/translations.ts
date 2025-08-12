export const translations = {
  fr: {
    // Générateur AST
    astNumberTitle: "🔢 Numéro AST Unique",
    astNumberGenerated: "Numéro généré automatiquement - Usage unique pour cette AST",
    copyNumber: "Copier le numéro",
    generateNew: "Générer un nouveau numéro",
    
    // Sections principales
    clientInfo: "🏢 Informations Client",
    projectDetails: "📋 Détails du Projet",
    location: "📍 Localisation",
    workLocations: "🏗️ Emplacements de Travail",
    locationStats: "📊 Statistiques Temps Réel",
    emergency: "🚨 Contacts d'Urgence",
    workDescription: "📝 Description Détaillée des Travaux",
    lockoutSection: "🔒 Verrouillage / Cadenassage (LOTO)",
    
    // Champs client
    clientName: "Nom du Client",
    clientNamePlaceholder: "Ex: Hydro-Québec, Bell Canada...",
    clientPhone: "Téléphone Client",
    clientPhonePlaceholder: "Ex: (514) 555-0123",
    clientRepresentative: "Représentant Client",
    clientRepPlaceholder: "Nom du responsable projet",
    repPhone: "Téléphone Représentant",
    repPhonePlaceholder: "Ex: (514) 555-0456",
    
    // Champs projet
    projectNumber: "Numéro de Projet",
    projectNumberPlaceholder: "Ex: PRJ-2025-001",
    astClientNumber: "# AST Client (Optionnel)",
    astClientPlaceholder: "Numéro fourni par le client",
    astClientHelp: "Numéro de référence du client (si applicable)",
    date: "Date",
    time: "Heure",
    
    // Localisation
    workLocation: "Lieu des Travaux",
    workLocationPlaceholder: "Adresse complète du site de travail",
    industryType: "Type d'Industrie",
    
    // Emplacements multiples
    addLocation: "Ajouter Emplacement",
    locationName: "Nom de l'Emplacement",
    locationNamePlaceholder: "Ex: Bâtiment A - Étage 2",
    locationDescription: "Description",
    locationDescriptionPlaceholder: "Ex: Zone des équipements électriques",
    zone: "Zone",
    zonePlaceholder: "Ex: Production, Bureau, Maintenance",
    building: "Bâtiment",
    buildingPlaceholder: "Ex: Bâtiment A",
    floor: "Étage",
    floorPlaceholder: "Ex: Sous-sol, RDC, Étage 2",
    workDuration: "Durée des Travaux",
    workDurationPlaceholder: "Ex: 8 heures, 2 jours",
    startTime: "Heure Début",
    endTime: "Heure Fin",
    removeLocation: "Supprimer cet emplacement",
    noLocations: "Aucun emplacement défini",
    noLocationsDescription: "Ajoutez des emplacements pour organiser vos équipes",
    
    // Industries
    electrical: "⚡ Électrique",
    construction: "🏗️ Construction",
    industrial: "🏭 Industriel",
    manufacturing: "⚙️ Manufacturier",
    office: "🏢 Bureau/Administratif",
    other: "🔧 Autre",
    
    // Urgence
    emergencyContact: "Contact d'Urgence",
    emergencyContactPlaceholder: "Nom du contact d'urgence",
    emergencyPhone: "Téléphone d'Urgence",
    emergencyPhonePlaceholder: "911 ou numéro spécifique",
    
    // Description
    workDescriptionLabel: "Description Complète",
    workDescriptionPlaceholder: "Décrivez en détail les travaux à effectuer :\n\n• Méthodes utilisées\n• Équipements impliqués\n• Zones d'intervention\n• Procédures spéciales\n• Conditions particulières\n\nPlus la description est détaillée, plus l'analyse de sécurité sera précise.",
    workDescriptionHelp: "Une description complète aide à identifier tous les risques potentiels et à choisir les mesures de sécurité appropriées.",
    
    // Lockout
    lockoutDescription: "Documentation des procédures de verrouillage/étiquetage des énergies dangereuses selon les normes RSST. Photographiez chaque étape pour assurer une traçabilité complète.",
    generalPhotos: "Photos Générales de Verrouillage",
    beforeLockout: "Avant verrouillage",
    clientForm: "Fiche client",
    verification: "Vérification finale",
    duringLockout: "Pendant verrouillage",
    lockoutDevice: "Dispositif",
    
    // Points de verrouillage
    lockoutPoint: "🔒 Point de Verrouillage #",
    delete: "Supprimer",
    energyType: "Type d'Énergie",
    equipmentName: "Nom de l'Équipement",
    equipmentPlaceholder: "Ex: Disjoncteur principal",
    locationLabel: "Localisation",
    locationPlaceholder: "Ex: Panneau électrique B-2",
    lockType: "Type de Cadenas/Dispositif",
    lockTypePlaceholder: "Ex: Cadenas rouge C-Secur360",
    tagNumber: "Numéro d'Étiquette",
    tagPlaceholder: "TAG-123456",
    verifiedBy: "Vérifié par",
    verifiedByPlaceholder: "Nom de la personne",
    verificationTime: "Heure de Vérification",
    now: "Maintenant",
    notes: "Notes et Observations",
    notesPlaceholder: "Observations particulières, difficultés rencontrées, modifications apportées...",
    pointPhotos: "Photos de ce Point de Verrouillage",
    addLockoutPoint: "Ajouter Point de Verrouillage",
    
    // Photos
    noPhotos: "Aucune photo",
    addPhoto: "Ajouter une photo",
    addPhotoDescription: "Documentez cette étape avec une photo",
    clickToPhoto: "Cliquez pour prendre votre première photo de verrouillage",
    clickToPhotoDevice: "Cliquez pour prendre une photo avec l'appareil",
    noLockoutPoints: "Aucun Point de Verrouillage",
    noLockoutDescription: "Cliquez sur \"Ajouter Point de Verrouillage\" pour documenter les procédures LOTO",
    
    // Procédures
    proceduresToFollow: "🔧 Procédures à Suivre:",
    stepsCompleted: "étapes complétées",
    
    // Messages d'erreur
    required: "*",
    
    // Boutons
    add: "Ajouter",
    cancel: "Annuler",
    save: "Sauvegarder",
    edit: "Modifier",
    adding: "Ajout en cours...",
    
    // Statistiques
    totalWorkers: "Total Travailleurs",
    totalLocations: "Emplacements Actifs",
    totalLockouts: "Cadenas Apposés",
    peakUtilization: "Pic d'Utilisation",
    locationBreakdown: "Répartition par Emplacement",
    workersCount: "travailleurs",
    lockoutsCount: "cadenas",
    currentWorkers: "actuels",
    maxReached: "max atteint",
    
    // Catégories photo
    categories: {
      before_lockout: "Avant verrouillage",
      during_lockout: "Pendant verrouillage",
      lockout_device: "Dispositif de verrouillage",
      client_form: "Fiche client",
      verification: "Vérification"
    }
  },
  
  en: {
    // AST Generator
    astNumberTitle: "🔢 Unique JSA Number",
    astNumberGenerated: "Automatically generated number - Single use for this JSA",
    copyNumber: "Copy number",
    generateNew: "Generate new number",
    
    // Main sections
    clientInfo: "🏢 Client Information",
    projectDetails: "📋 Project Details",
    location: "📍 Location",
    workLocations: "🏗️ Work Locations",
    locationStats: "📊 Real-Time Statistics",
    emergency: "🚨 Emergency Contacts",
    workDescription: "📝 Detailed Work Description",
    lockoutSection: "🔒 Lockout / Tagout (LOTO)",
    
    // Client fields
    clientName: "Client Name",
    clientNamePlaceholder: "Ex: Hydro-Quebec, Bell Canada...",
    clientPhone: "Client Phone",
    clientPhonePlaceholder: "Ex: (514) 555-0123",
    clientRepresentative: "Client Representative",
    clientRepPlaceholder: "Project manager name",
    repPhone: "Representative Phone",
    repPhonePlaceholder: "Ex: (514) 555-0456",
    
    // Project fields
    projectNumber: "Project Number",
    projectNumberPlaceholder: "Ex: PRJ-2025-001",
    astClientNumber: "# Client JSA (Optional)",
    astClientPlaceholder: "Number provided by client",
    astClientHelp: "Client reference number (if applicable)",
    date: "Date",
    time: "Time",
    
    // Location
    workLocation: "Work Location",
    workLocationPlaceholder: "Complete address of work site",
    industryType: "Industry Type",
    
    // Multiple locations
    addLocation: "Add Location",
    locationName: "Location Name",
    locationNamePlaceholder: "Ex: Building A - Floor 2",
    locationDescription: "Description",
    locationDescriptionPlaceholder: "Ex: Electrical equipment zone",
    zone: "Zone",
    zonePlaceholder: "Ex: Production, Office, Maintenance",
    building: "Building",
    buildingPlaceholder: "Ex: Building A",
    floor: "Floor",
    floorPlaceholder: "Ex: Basement, Ground, Floor 2",
    workDuration: "Work Duration",
    workDurationPlaceholder: "Ex: 8 hours, 2 days",
    startTime: "Start Time",
    endTime: "End Time",
    removeLocation: "Remove this location",
    noLocations: "No locations defined",
    noLocationsDescription: "Add locations to organize your teams",
    
    // Industries
    electrical: "⚡ Electrical",
    construction: "🏗️ Construction",
    industrial: "🏭 Industrial",
    manufacturing: "⚙️ Manufacturing",
    office: "🏢 Office/Administrative",
    other: "🔧 Other",
    
    // Emergency
    emergencyContact: "Emergency Contact",
    emergencyContactPlaceholder: "Emergency contact name",
    emergencyPhone: "Emergency Phone",
    emergencyPhonePlaceholder: "911 or specific number",
    
    // Description
    workDescriptionLabel: "Complete Description",
    workDescriptionPlaceholder: "Describe in detail the work to be performed:\n\n• Methods used\n• Equipment involved\n• Work areas\n• Special procedures\n• Particular conditions\n\nThe more detailed the description, the more accurate the safety analysis.",
    workDescriptionHelp: "A complete description helps identify all potential risks and choose appropriate safety measures.",
    
    // Lockout
    lockoutDescription: "Documentation of lockout/tagout procedures for hazardous energies according to OHSA standards. Photograph each step to ensure complete traceability.",
    generalPhotos: "General Lockout Photos",
    beforeLockout: "Before lockout",
    clientForm: "Client form",
    verification: "Final verification",
    duringLockout: "During lockout",
    lockoutDevice: "Device",
    
    // Lockout points
    lockoutPoint: "🔒 Lockout Point #",
    delete: "Delete",
    energyType: "Energy Type",
    equipmentName: "Equipment Name",
    equipmentPlaceholder: "Ex: Main breaker",
    locationLabel: "Location",
    locationPlaceholder: "Ex: Electrical panel B-2",
    lockType: "Lock/Device Type",
    lockTypePlaceholder: "Ex: Red C-Secur360 lock",
    tagNumber: "Tag Number",
    tagPlaceholder: "TAG-123456",
    verifiedBy: "Verified by",
    verifiedByPlaceholder: "Person's name",
    verificationTime: "Verification Time",
    now: "Now",
    notes: "Notes and Observations",
    notesPlaceholder: "Particular observations, difficulties encountered, modifications made...",
    pointPhotos: "Photos of this Lockout Point",
    addLockoutPoint: "Add Lockout Point",
    
    // Photos
    noPhotos: "No photos",
    addPhoto: "Add photo",
    addPhotoDescription: "Document this step with a photo",
    clickToPhoto: "Click to take your first lockout photo",
    clickToPhotoDevice: "Click to take a photo with device",
    noLockoutPoints: "No Lockout Points",
    noLockoutDescription: "Click \"Add Lockout Point\" to document LOTO procedures",
    
    // Procedures
    proceduresToFollow: "🔧 Procedures to Follow:",
    stepsCompleted: "steps completed",
    
    // Error messages
    required: "*",
    
    // Buttons
    add: "Add",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    adding: "Adding...",
    
    // Statistics
    totalWorkers: "Total Workers",
    totalLocations: "Active Locations",
    totalLockouts: "Applied Locks",
    peakUtilization: "Peak Utilization",
    locationBreakdown: "Breakdown by Location",
    workersCount: "workers",
    lockoutsCount: "locks",
    currentWorkers: "current",
    maxReached: "max reached",
    
    // Photo categories
    categories: {
      before_lockout: "Before lockout",
      during_lockout: "During lockout",
      lockout_device: "Lockout device",
      client_form: "Client form",
      verification: "Verification"
    }
  }
} as const;

export type Step1Translations = typeof translations;
