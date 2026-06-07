import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = {
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷', display: 'FR' },
  en: { code: 'en', name: 'English', flag: '🇬🇧', display: 'EN' }
};

const translations = {
  fr: {
    // Header
    appTitle: 'Gestion d\'Inventaire',
    appSubtitle: 'C-Secur360',
    login: 'Connexion',
    logout: 'Déconnexion',
    adminMode: 'Mode Administrateur',
    welcome: 'Bienvenue',

    // Navigation
    nav: {
      navigation: 'Navigation',
      dashboard: 'Tableau de bord',
      articles: 'Articles',
      scanner: 'Scanner',
      movements: 'Mouvements',
      reports: 'Rapports',
      administration: 'Administration'
    },

    // Common
    common: {
      loading: 'Chargement',
      error: 'Erreur',
      errors: 'Erreurs',
      errorsDetected: 'Erreurs détectées',
      success: 'Succès',
      code: 'Code',
      codeWith: 'Code:',
      article: 'Article',
      category: 'Catégorie',
      subcategory: 'Sous-catégorie',
      stock: 'Stock',
      status: 'Statut',
      all: 'Tous',
      allFeminine: 'Toutes',
      price: 'Prix',
      quantity: 'Quantité',
      currentQuantity: 'Quantité actuelle',
      quantityToOrder: 'Quantité à commander',
      unitPrice: 'Prix unitaire',
      department: 'Département',
      departmentBranch: 'Département / Succursale',
      allDepartments: 'Tous les départements',
      globalView: 'Vue globale',
      supplier: 'Fournisseur',
      allSuppliers: 'Tous les fournisseurs',
      notSpecified: 'Non spécifié',
      labelFormat: 'Format d\'étiquette',
      locationPlaceholder: 'Allée 1, Rack B...',
      total: 'Total',
      totalWith: 'Total:',
      line: 'Ligne',
      lineNumber: 'Ligne',
      date: 'Date',
      dateWith: 'Date:',
      allStatuses: 'Statut - Tous',
      valid: 'Valides',
      filterByDepartment: 'Filtrer par département / succursale',
      lowStock: 'Stock Bas',
      requiresRestocking: 'nécessite un réapprovisionnement',
      requiresRestockingPlural: 'nécessitent un réapprovisionnement',
      surplus: 'Surplus',
      optimal: 'Optimal',
      branch: 'succursale',
      branches: 'succursales',
      branchDetails: 'Détails par succursale'
    },

    // Common Actions
    actions: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      add: 'Ajouter',
      addAction: 'Ajouter',
      removeAction: 'Retirer',
      edit: 'Modifier',
      delete: 'Supprimer',
      search: 'Rechercher',
      filter: 'Filtrer',
      filters: 'Filtres',
      export: 'Exporter',
      import: 'Importer',
      importExcel: 'Importer Excel',
      refresh: 'Actualiser',
      confirm: 'Confirmer',
      back: 'Retour',
      backToDashboard: 'Retour au tableau de bord',
      backToHome: 'Retour à l\'accueil',
      backToInventory: 'Retour à l\'inventaire',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      reset: 'Réinitialiser',
      clear: 'Effacer',
      select: 'Sélectionner',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      view: 'Voir',
      download: 'Télécharger',
      upload: 'Téléverser',
      print: 'Imprimer',
      printLabel: 'Imprimer étiquette',
      printThisLabel: 'Imprimer l\'étiquette',
      printLabels: 'Imprimer étiquettes',
      printCompleteSheets: 'Imprimer fiches complètes',
      printSelection: 'Imprimer sélection',
      qrCode: 'Code QR',
      scanToView: 'Scanner pour voir'
    },

    // Dashboard
    dashboard: {
      title: 'Tableau de bord',
      inventoryOverview: 'Vue d\'ensemble de l\'inventaire',
      overview: 'Vue d\'ensemble',
      overviewDescription: 'Vue d\'ensemble de votre inventaire',
      statistics: 'Statistiques',
      totalArticles: 'Articles totaux',
      articlesInInventory: 'Articles en inventaire',
      lowStock: 'Stock bas',
      needsRestocking: 'Nécessite réapprovisionnement',
      surplus: 'Surplus',
      totalValue: 'Valeur totale',
      recentMovements: 'Mouvements récents',
      alerts: 'Alertes',
      totalAlerts: 'Total Alertes',
      quickActions: 'Actions rapides',
      inventoryHealth: 'Santé de l\'inventaire',
      topCategories: 'Catégories principales',
      stockStatus: 'État du stock',
      stock: 'Stock',
      withinNorms: 'Stock dans les normes',
      priceReview: 'Prix à réviser',
      updateRequired: 'Mise à jour requise',
      monthlyTrend: 'Tendance mensuelle',
      outOfStock: 'Articles en rupture',
      departmentsWithAlerts: 'Avec alertes',
      suppliersToContact: 'À contacter',
      selectedForOrder: 'Pour commande',
      noMovement: 'Aucun mouvement',
      noMovementFound: 'Aucun mouvement récent',
      noAlerts: 'Aucune alerte',
      noAlertsFiltered: 'Aucune alerte trouvée avec ces filtres',
      allArticlesSufficient: 'Tous les articles sont en stock suffisant',
      valueByCategory: 'Répartition de la Valeur par Catégorie',
      costVsMarginAnalysis: 'Analyse coût vs marge bénéficiaire',
      financialReport: 'Bilan Financier des Actifs',
      financialReportDescription: 'Valeur des actifs et marges par catégorie',
      inventoryFinancialReport: 'Bilan Financier de l\'Inventaire',
      inventoryFinancialReportDescription: 'Valeur totale et EBITDA par catégorie',
      noCategoriesFound: 'Aucune catégorie trouvée',
      noItemsInCategories: 'Aucun article dans les catégories sélectionnées',
      costValue: 'Valeur Coût',
      sellValue: 'Valeur Vente',
      ebitda: 'EBITDA'
    },

    // Articles
    articles: {
      title: 'Articles',
      addArticle: 'Ajouter un article',
      addArticles: 'Ajouter des Articles',
      editArticle: 'Modifier l\'article',
      deleteArticle: 'Supprimer l\'article',
      articleDetails: 'Détails de l\'article',
      articleList: 'Liste des articles',
      searchArticles: 'Rechercher des articles',
      noArticles: 'Aucun article trouvé',
      noArticlesFiltered: 'Aucun article ne correspond à vos critères de recherche',
      noArticlesCriteria: 'Aucun article ne correspond à vos critères',
      simpleArticle: 'Article Simple',
      existingList: 'Liste Existante (Excel)',
      addSingleManually: 'Ajouter un seul article manuellement',
      importMultipleExcel: 'Importer plusieurs articles depuis Excel',
      importExcelInventory: 'Import Excel - Inventaire',
      departmentsSection: 'Succursales / Départements',
      selectDepartments: 'Sélectionnez les succursales où cet article sera disponible',
      selectOneDepartment: 'Veuillez sélectionner au moins une succursale',
      articleType: 'Type d\'article',
      forSale: 'Pour vente',
      forSaleDescription: 'Coût + Prix de vente',
      consumable: 'Consommable',
      costOnly: 'Coût uniquement',
      uniqueSale: 'Vente unique',
      noRestocking: 'Pas de réappro',
      codeOption: 'Option de code',
      uniqueCode: 'Code unique',
      uniqueCodeDescription: 'Même code pour toutes les succursales',
      differentCodes: 'Codes différents',
      differentCodesDescription: 'Code personnalisé par succursale',
      customCode: 'Code personnalisé',
      priceRevision: 'Révision des prix',
      revisionFrequency: 'Fréquence de révision',
      every3Months: 'Tous les 3 mois',
      every6Months: 'Tous les 6 mois',
      every12Months: 'Tous les 12 mois',
      customMonths: 'Nombre de mois',
      priceAlertMessage: 'Une alerte apparaîtra lorsque la mise à jour des prix sera nécessaire',
      addTheArticle: 'Ajouter l\'Article',
      optional: '(optionnel)',
      notApplicable: '(non applicable)',
      autoMarginApplied: 'Marge automatique appliquée',
      gridView: 'Vue grille',
      listView: 'Vue liste',
      detailedView: 'Vue détaillée',
      excelInstruction1: 'Voir l\'onglet "Données Exemple" pour un exemple complet',
      excelInstruction2: 'Remplissez vos données dans l\'onglet "Données Exemple"',
      excelInstruction3: 'Dans l\'application, cliquez sur "Importer Excel"',
      excelInstruction4: 'Remplissez vos articles dans l\'onglet "Données Exemple"',
      excelInstruction5: 'Suivez les instructions dans l\'onglet "Instructions"',

      // Fields
      name: 'Nom',
      code: 'Code',
      barcode: 'Code-barres',
      qrCode: 'Code QR',
      description: 'Description',
      category: 'Catégorie',
      department: 'Département',
      departments: 'Départements',
      suppliers: 'Fournisseurs',
      selected: 'Sélectionnés',
      location: 'Emplacement',
      quantity: 'Quantité',
      currentQuantity: 'Quantité actuelle',
      minQuantity: 'Quantité minimale',
      min: 'Min',
      maxQuantity: 'Quantité maximale',
      max: 'Max',
      costPrice: 'Prix coûtant',
      costPriceShort: 'Prix Coût ($)',
      salePrice: 'Prix de vente',
      salePriceShort: 'Prix Vente ($)',
      baseSalePrice: 'Prix de vente de base',
      baseSalePriceShort: 'Prix Vente Base ($)',
      targetSalePrice: 'Prix de vente cible',
      targetSalePriceShort: 'Prix Vente Cible ($)',
      baseEbitda: 'EBITDA de base (%)',
      targetEbitda: 'EBITDA cible (%)',
      ebitdaHelp: 'EBITDA défini dans Administration/Paramètres',
      supplier: 'Fournisseur',
      supplierName: 'Nom du fournisseur...',
      supplierEmail: 'Email du fournisseur',
      unit: 'Unité',
      weight: 'Poids',
      dimensions: 'Dimensions',
      notes: 'Notes',
      image: 'Image',
      status: 'Statut',
      createdAt: 'Créé le',
      updatedAt: 'Modifié le',
      createdBy: 'Créé par',
      updatedBy: 'Modifié par',

      // Units
      units: {
        piece: 'Pièce',
        box: 'Boîte',
        pack: 'Paquet',
        kg: 'Kilogramme',
        g: 'Gramme',
        l: 'Litre',
        ml: 'Millilitre',
        m: 'Mètre',
        cm: 'Centimètre',
        units: 'unités',
        unit: 'unité'
      },

      // Prix et valeurs
      unitCost: 'Coût unitaire',
      stockValue: 'Valeur stock',
      margin: 'Marge',
      profit: 'Profit',
      totalCost: 'Coût total',
      value: 'Valeur',
      perUnit: '/ unité',

      // Colonnes tableaux
      actions: 'Actions',
      currentInventory: 'Inventaire actuel',

      // Import Excel
      excel: {
        title: 'Import/Export Excel',
        downloadTemplate: 'Télécharger le Modèle Excel',
        downloadTemplateIcon: '📥 Télécharger le Modèle Excel',
        dragDrop: 'Glissez votre fichier Excel ici',
        clickToSelect: 'ou cliquez pour sélectionner un fichier',
        acceptedFormats: 'Formats acceptés: .xlsx, .xls',
        instructions: '📋 Instructions:',
        beforeImporting: '📋 Avant d\'importer:',
        step1: '1. Téléchargez le modèle Excel ci-dessus',
        step4: '4. Glissez le fichier ici ou cliquez pour le sélectionner',
        instructionDownload: 'Téléchargez le modèle Excel depuis l\'onglet Administration',
        instructionStructure: 'Respectez exactement la structure des colonnes',
        instructionUniqueCodes: 'Vérifiez que les codes sont uniques',
        instructionCategories: 'Les catégories et départements doivent exister dans le système',
        instructionDetailed: 'Téléchargez d\'abord le modèle Excel qui contient les instructions détaillées',

        // En-têtes Excel
        headers: {
          code: 'Code',
          name: 'Nom',
          category: 'Catégorie',
          department: 'Département',
          location: 'Localisation',
          quantity: 'Quantité',
          minQuantity: 'Quantité Min',
          maxQuantity: 'Quantité Max',
          costPrice: 'Prix Coût ($)',
          salePrice: 'Prix Vente ($)',
          unit: 'Unité',
          description: 'Description'
        },

        // Instructions du template
        template: {
          title: '📋 INSTRUCTIONS D\'IMPORTATION - C-SECUR360 INVENTAIRE',
          requiredColumns: 'COLONNES OBLIGATOIRES (ne pas modifier les noms):',
          col1: '1. Code',
          col1Desc: 'Code unique de l\'article (ex: EPI-001, TOOL-042)',
          col2: '2. Nom',
          col2Desc: 'Nom de l\'article',
          col3: '3. Catégorie',
          col3Desc: 'Catégorie de l\'article',
          col4: '4. Département',
          col4Desc: 'Département/Succursale',
          col5: '5. Localisation',
          col5Desc: 'Emplacement précis (ex: Allée 1, Rack B)',
          col6: '6. Quantité',
          col6Desc: 'Stock actuel (nombre entier)',
          col7: '7. Quantité Min',
          col7Desc: 'Seuil minimum (alerte si en-dessous)',
          col8: '8. Quantité Max',
          col8Desc: 'Seuil maximum',
          col9: '9. Prix Coût ($)',
          col9Desc: 'Prix d\'achat unitaire',
          col10: '10. Prix Vente ($)',
          col10Desc: 'Prix de vente unitaire',
          col11: '11. Unité',
          col11Desc: 'Unité de mesure (Pièce, Boîte, Kg, L, etc.)',
          col12: '12. Description',
          col12Desc: 'Description détaillée (optionnel)',

          importantRules: '⚠️ RÈGLES IMPORTANTES:',
          ruleUnique: '• Le Code doit être UNIQUE (pas de doublons)',
          ruleQuantities: '• Les quantités doivent être des nombres entiers positifs',
          rulePrices: '• Les prix doivent être des nombres décimaux (ex: 2.50)',
          ruleMinMax: '• La Quantité Min doit être inférieure à la Quantité Max',
          ruleExist: '• Les catégories et départements doivent exister dans le système',

          availableCategories: '✅ CATÉGORIES DISPONIBLES:',
          availableDepartments: '✅ DÉPARTEMENTS DISPONIBLES:',
          exampleImport: '📊 EXEMPLE D\'IMPORT:',
          importSteps: '💾 ÉTAPES D\'IMPORTATION:',
          step2: '2. Sauvegardez le fichier',
          step5: '5. Vérifiez la prévisualisation',
          step6: '6. Confirmez l\'importation',
          support: '🔧 SUPPORT:',
          supportText: 'Pour toute question, contactez l\'administrateur système',
          sheetInstructions: 'Instructions',
          sheetData: 'Données Exemple'
        },

        // Erreurs de validation
        validation: {
          invalidQuantity: 'Quantité invalide',
          invalidMinQuantity: 'Quantité Min invalide',
          invalidMaxQuantity: 'Quantité Max invalide',
          invalidCostPrice: 'Prix Coût invalide',
          invalidSalePrice: 'Prix Vente invalide',
          minMaxError: 'Quantité Min doit être < Quantité Max',
          codeExists: 'Code déjà existant',
          codeDuplicate: 'Code en doublon dans le fichier',
          categoryNotFound: 'Catégorie inexistante',
          departmentNotFound: 'Département inexistant'
        }
      },

      // Champs avancés
      advancedFields: 'Informations avancées (Photos, Dimensions, etc.)',
      photos: 'Photos de l\'article',
      addPhotos: 'Ajouter des photos',
      noPhotosAdded: 'Aucune photo ajoutée',
      selectOnlyImages: 'Veuillez sélectionner uniquement des images',
      colors: 'Couleurs disponibles',
      addColor: 'Ajouter une couleur',
      pressEnterToAdd: 'Appuyez sur Entrée pour ajouter',
      dimensionsLWH: 'Dimensions (L × l × H)',
      length: 'Longueur',
      width: 'Largeur',
      height: 'Hauteur',
      brand: 'Marque',
      brandPlaceholder: 'Ex: Samsung, Apple, etc.',
      model: 'Modèle',
      modelPlaceholder: 'Ex: iPhone 15 Pro',
      serialNumber: 'Numéro de série',
      serialNumberPlaceholder: 'Ex: SN123456789',
      condition: 'État',
      conditionNew: 'Neuf',
      conditionLikeNew: 'Comme neuf',
      conditionGood: 'Bon état',
      conditionFair: 'État acceptable',
      conditionPoor: 'Mauvais état',
      warranty: 'Garantie',
      warrantyPlaceholder: 'Ex: 2 ans, 24 mois, etc.',
      rentalOption: 'Option de location',
      rentalPrice: 'Prix de location ($)',
      rentalPeriod: 'Période',
      perHour: 'Par heure',
      perDay: 'Par jour',
      perWeek: 'Par semaine',
      perMonth: 'Par mois'
    },

    // Partage de fiche produit
    share: {
      productSheet: 'Fiche Produit',
      shareProduct: 'Partager le produit',
      templateStyle: 'Style de template',
      templateProfessional: 'Professionnel',
      templateMinimal: 'Minimal',
      templateDetailed: 'Détaillé',
      basicInfo: 'Informations de base',
      advancedInfo: 'Informations avancées',
      stockInfo: 'Informations stock',
      toggleAll: 'Tout basculer',
      customPricing: 'Prix personnalisé',
      useCustomPrice: 'Utiliser un prix personnalisé',
      margin: 'Marge',
      preview: 'Prévisualisation',
      downloadPDF: 'Télécharger PDF',
      copyLink: 'Copier le lien',
      shareEmail: 'Partager par email',
      linkCopied: 'Lien copié dans le presse-papier!'
    },

    // Scanner
    scanner: {
      title: 'Scanner',
      scanQRCode: 'Scanner le code QR',
      scanBarcode: 'Scanner le code-barres',
      scanResult: 'Résultat du scan',
      scanning: 'Scan en cours...',
      scanSuccess: 'Scan réussi',
      scanError: 'Erreur de scan',
      noCamera: 'Aucune caméra détectée',
      cameraPermission: 'Permission caméra requise',
      startScanning: 'Démarrer le scan',
      stopScanning: 'Arrêter le scan',
      switchCamera: 'Changer de caméra',
      itemScanned: 'Article scanné',
      itemNotFound: 'Article non trouvé',

      // Actions rapides
      quickActions: 'Actions rapides',
      addStock: 'Ajouter au stock',
      removeStock: 'Retirer du stock',
      reportIssue: 'Signaler un problème',
      viewDetails: 'Voir les détails',

      // Actions
      entry: 'Entrée',
      exit: 'Sortie',
      adjustment: 'Ajustement',
      transfer: 'Transfert',
      add: 'Ajouter',
      remove: 'Retirer',
      action: 'Action',
      adjust: 'Ajuster',
      adjustQuantity: 'Ajustement de quantité',
      newQuantity: 'Nouvelle quantité',
      ok: 'OK',
      success: 'Succès',
      successMessage: 'L\'inventaire a été mis à jour',
      inventoryConfirmed: 'Inventaire confirmé',
      quantityAdjusted: 'Quantité ajustée',

      // Form
      selectAction: 'Sélectionner une action',
      enterQuantity: 'Entrer la quantité',
      quantityToAdd: 'Quantité à ajouter',
      quantityToRemove: 'Quantité à retirer',
      reason: 'Raison',
      destination: 'Destination',
      source: 'Source',
      comment: 'Commentaire',
      validateMovement: 'Valider le mouvement',
      confirmAction: 'Confirmer l\'action',

      // Issues
      issueType: 'Type de problème',
      issueDescription: 'Description du problème',
      issues: {
        damaged: 'Article endommagé',
        missing: 'Article manquant',
        wrongLocation: 'Mauvais emplacement',
        expired: 'Article expiré',
        qualityIssue: 'Problème de qualité',
        other: 'Autre'
      },

      // Scanner Modes
      scanMode: 'Mode de scan',
      movementMode: 'Mode Mouvement',
      inventoryMode: 'Mode Inventaire',
      adjustmentIncrement: 'Ajustement +/-',
      physicalControl: 'Contrôle physique',
      movementModeDescription: 'Ajustez les quantités en ajoutant (+) ou retirant (-) du stock.',
      inventoryModeDescription: 'Entrez la quantité physique comptée. Le système ajustera automatiquement la différence.',
      inventoryModeActive: 'Mode Inventaire Actif',
      inventoryModeActiveMessage: 'Les mouvements de stock sont bloqués pour le département {department}. Seul le mode inventaire est disponible.',
      movementModeBlocked: 'Mode mouvement bloqué ! Le département {department} est en inventaire. Seul le mode inventaire est autorisé.',
      blocked: 'Bloqué',

      // User Identity
      userIdentity: 'Identité de l\'utilisateur',
      enterFullName: 'Entrez votre nom complet',
      allMovementsAssociated: 'Tous les mouvements seront associés à votre nom',

      // Withdrawal
      withdrawalType: 'Type de retrait',
      withdrawalForProject: 'Retrait pour projet',
      internalConsumption: 'Consommation interne',
      selectWithdrawalReason: 'Sélectionnez la raison du retrait',

      // Project
      projectNumber: 'Numéro de projet',
      projectNumberOptional: 'Numéro de projet (optionnel)',
      requiredForProjectWithdrawals: 'Obligatoire pour les retraits de projet',
      leaveBlankForGeneral: 'Laisser vide si c\'est un ajout général',

      // Physical Count
      physicalCountedQuantity: 'Quantité physique comptée',
      enterActualStockQuantity: 'Entrez la quantité réellement présente en stock',
      difference: 'Différence',
      confirmInventory: 'Confirmer Inventaire',
      newQuantityLabel: 'Nouvelle quantité'
    },

    // Movements
    movements: {
      title: 'Mouvements',
      history: 'Historique',
      addMovement: 'Ajouter un mouvement',
      movementDetails: 'Détails du mouvement',
      totalMovements: 'Total mouvements',
      allTypes: 'Tous types confondus',
      entriesDescription: 'Entrées de stock',
      exitsDescription: 'Sorties de stock',
      adjustmentsDescription: 'Ajustements',

      // Types
      types: {
        entry: 'Entrée',
        exit: 'Sortie',
        adjustment: 'Ajustement',
        transfer: 'Transfert',
        return: 'Retour',
        loss: 'Perte',
        damaged: 'Endommagé',
        inventory: 'Inventaire'
      },

      // Fields
      type: 'Type',
      article: 'Article',
      quantity: 'Quantité',
      date: 'Date',
      time: 'Heure',
      user: 'Utilisateur',
      reason: 'Raison',
      from: 'De',
      to: 'Vers',
      reference: 'Référence',
      document: 'Document',
      comment: 'Commentaire',

      // Filters
      filterByType: 'Filtrer par type',
      filterByDate: 'Filtrer par date',
      filterByUser: 'Filtrer par utilisateur',
      filterByArticle: 'Filtrer par article',
      dateFrom: 'Date de début',
      dateTo: 'Date de fin',

      // Stats
      totalEntries: 'Entrées totales',
      totalExits: 'Sorties totales',
      totalAdjustments: 'Ajustements totaux',
      netChange: 'Changement net',

      // Advanced Filters
      advancedFilters: 'Filtres avancés',
      movementType: 'Type de mouvement',
      allMovementTypes: 'Tous les types',
      entries: 'Entrées',
      exits: 'Sorties',
      adjustments: 'Ajustements',
      transfers: 'Transferts',

      // Search & Export
      searchInMovements: 'Rechercher dans les mouvements',
      searchByProject: 'Rechercher par code projet, article, utilisateur...',
      searchPlaceholder: 'Code projet (ex: G25-1115), article, utilisateur...',
      filterSummary: 'Résumé des filtres',
      activeFilters: 'Filtres actifs',
      projectCode: 'Code Projet',
      print: 'Imprimer',
      printReport: 'Imprimer le rapport',
      exportExcel: 'Exporter Excel',
      exportToExcel: 'Exporter vers Excel',
      reportTitle: 'Rapport de Mouvements d\'Inventaire',
      reportDate: 'Date du rapport',
      numberOfMovements: 'Nombre de mouvements',
      appliedFilter: 'Filtre appliqué',
      from: 'Du',
      to: 'Au',
      allDepartmentsFilter: 'Tous les départements',

      // Filter summary labels
      typeLabel: 'Type',
      departmentLabel: 'Département',
      ofLabel: 'sur',
      movementsLabel: 'mouvements',

      // Export/Print
      movementsSheet: 'Mouvements',
      movementsFilename: 'Mouvements'
    },

    // Reports
    reports: {
      title: 'Rapports',
      generateReport: 'Générer un rapport',
      reportType: 'Type de rapport',

      // Types
      types: {
        inventory: 'Inventaire',
        movements: 'Mouvements',
        valuation: 'Valorisation',
        lowStock: 'Stock bas',
        surplus: 'Surplus',
        transactions: 'Transactions',
        audit: 'Audit',
        performance: 'Performance'
      },

      // Options
      period: 'Période',
      format: 'Format',
      exportPDF: 'Exporter en PDF',
      exportExcel: 'Exporter en Excel',
      exportCSV: 'Exporter en CSV',

      // Periods
      periods: {
        today: 'Aujourd\'hui',
        yesterday: 'Hier',
        thisWeek: 'Cette semaine',
        lastWeek: 'Semaine dernière',
        thisMonth: 'Ce mois',
        lastMonth: 'Mois dernier',
        thisQuarter: 'Ce trimestre',
        lastQuarter: 'Trimestre dernier',
        thisYear: 'Cette année',
        lastYear: 'Année dernière',
        custom: 'Personnalisé'
      },

      // Content
      inventoryValue: 'Valeur de l\'inventaire',
      totalCost: 'Coût total',
      totalSale: 'Vente totale',
      potentialProfit: 'Profit potentiel',
      itemCount: 'Nombre d\'articles',
      lowStockItems: 'Articles en stock bas',
      surplusItems: 'Articles en surplus',
      outOfStock: 'Rupture de stock',
      criticalLevel: 'Niveau critique',
      subtotal: 'Sous-total',

      // Purchase order
      purchaseOrder: 'BON DE COMMANDE',
      supplierLabel: 'FOURNISSEUR:',
      totalOrder: 'TOTAL DE LA COMMANDE'
    },

    // Alerts
    alerts: {
      management: 'Gestion des Alertes',
      generateOrder: 'Générer Commande',
      sendOrderEmail: 'Envoyer par Email',
      noSupplierEmail: 'Aucun email fournisseur',
      pleaseAddEmail: 'Veuillez ajouter un email au fournisseur dans la fiche article',
      orderItems: 'Articles à commander',
      thankYou: 'Merci pour votre collaboration'
    },

    // Administration
    administration: {
      title: 'Administration',
      settings: 'Paramètres',
      manageSystemSettings: 'Gérer les paramètres du système',

      // Tabs
      tabs: {
        departmentsPersonnel: 'Site/département',
        departments: 'Départements',
        categories: 'Catégories',
        inventoryMode: 'Mode Inventaire',
        importExport: 'Import/Export',
        settings: 'Paramètres'
      },

      // Departments
      departments: {
        title: 'Départements',
        manageDepartments: 'Gestion des Départements/Succursales',
        manageDepartmentsDescription: 'Gérer les départements et leur personnel',
        addDepartment: 'Ajouter un département',
        editDepartment: 'Modifier le département',
        deleteDepartment: 'Supprimer le département',
        departmentName: 'Nom du département',
        departmentCode: 'Code du département',
        manager: 'Responsable',
        description: 'Description',
        active: 'Actif',
        locations: 'Emplacements',
        locationsPlaceholder: 'Allée 1, Allée 2, Entrepôt',
        locationsHelp: 'Exemple: Allée 1, Allée 2, Bureau',
        locationsSeparated: 'Emplacements (séparés par virgule)',
        managePersonnel: 'Gérer le personnel',
        backToDepartments: 'Retour'
      },

      // Categories
      categories: {
        title: 'Catégories',
        addCategory: 'Ajouter une catégorie',
        editCategory: 'Modifier la catégorie',
        deleteCategory: 'Supprimer la catégorie',
        categoryName: 'Nom de la catégorie',
        categoryCode: 'Code de la catégorie',
        parentCategory: 'Catégorie parente',
        description: 'Description',
        active: 'Actif'
      },

      // Inventory Mode
      inventoryMode: {
        active: 'Mode Inventaire ACTIF',
        inactive: 'Mode Inventaire Inactif',
        department: 'Département',
        startedBy: 'Démarré par',
        startDate: 'Date de début',
        scansRecorded: 'Scans enregistrés',
        readyToStart: 'Prêt à démarrer un inventaire',
        confirmEnd: 'Êtes-vous sûr de vouloir terminer l\'inventaire ? Un rapport sera généré.',
        endInventory: 'Terminer l\'Inventaire',
        startInventory: 'Démarrer un Inventaire',
        selectDepartment: 'Sélectionner un département',
        chooseDepartment: 'Choisir un département...',
        confirmStart: 'Activer le mode inventaire pour {department} ? Les mouvements de stock seront bloqués pour ce département.',
        warning: 'Attention',
        warningMessage: 'Une fois activé, tous les mouvements de stock (+/-) seront bloqués pour le département sélectionné. Seul le scan en mode inventaire sera autorisé.',
        howItWorks: 'Comment ça fonctionne',
        step1: 'Sélectionnez le département à inventorier',
        step2: 'Les mouvements sont automatiquement bloqués pour ce département',
        step3: 'Scannez tous les articles avec le mode "Inventaire" du scanner',
        step4: 'Terminez l\'inventaire pour débloquer les mouvements et générer le rapport d\'irrégularités'
      },

      // Locations/Storage Management
      locations: {
        title: 'Gestion des Emplacements',
        description: 'Gérez les étagères, tablettes et espaces de rangement',
        addShelf: 'Ajouter une étagère',
        editShelf: 'Modifier l\'étagère',
        deleteShelf: 'Supprimer l\'étagère',
        shelfName: 'Nom de l\'étagère',
        shelfCode: 'Code de l\'étagère',
        numberOfShelves: 'Nombre de tablettes',
        numberOfSpaces: 'Nombre d\'espaces par tablette',
        shelfHeight: 'Hauteur de l\'étagère',
        shelfWidth: 'Largeur de l\'étagère',
        shelfDepth: 'Profondeur de l\'étagère',
        maxWeight: 'Poids maximum',
        shelves: 'Tablettes',
        spaces: 'Espaces',
        capacity: 'Capacité',
        occupancy: 'Occupation',
        available: 'Disponible',
        occupied: 'Occupé',
        shelfUnit: 'Étagère',
        shelf: 'Tablette',
        space: 'Espace',
        location: 'Emplacement',
        storageUnit: 'Unité de rangement',
        assignedTo: 'Assigné à',
        noShelvesConfigured: 'Aucune étagère configurée'
      },

      // Users
      users: {
        title: 'Utilisateurs',
        addUser: 'Ajouter un utilisateur',
        editUser: 'Modifier l\'utilisateur',
        deleteUser: 'Supprimer l\'utilisateur',
        username: 'Nom d\'utilisateur',
        email: 'Courriel',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        firstName: 'Prénom',
        lastName: 'Nom',
        role: 'Rôle',
        permissions: 'Permissions',
        active: 'Actif',
        lastLogin: 'Dernière connexion'
      },

      // Roles
      roles: {
        admin: 'Administrateur',
        manager: 'Gestionnaire',
        employee: 'Employé',
        viewer: 'Observateur'
      },

      // Settings
      general: 'Général',
      appearance: 'Apparence',
      notifications: 'Notifications',
      security: 'Sécurité',
      backup: 'Sauvegarde',
      language: 'Langue',
      theme: 'Thème',
      timezone: 'Fuseau horaire',
      currency: 'Devise',
      dateFormat: 'Format de date',
      timeFormat: 'Format d\'heure',
      baseEbitda: 'EBITDA de base (%)',
      baseEbitdaDescription: 'Marge minimale pour couvrir les frais de base',
      targetEbitda: 'EBITDA cible (%)',
      targetEbitdaDescription: 'Marge cible pour une rentabilité optimale',

      // Price management
      priceUpdate: 'Gestion des Prix',
      markAsUpdated: 'Marquer comme mis à jour',
      priceAdvice: 'Vérifiez régulièrement les prix de vos articles pour maintenir des marges optimales',
      priceAdviceLabel: '💡 Conseil:',
      next30Days: 'Prochains 30 jours',

      // Excel import/export
      excelImportExport: 'Import/Export Excel',
      excelDescription: 'Importez des listes d\'articles depuis Excel ou exportez votre inventaire actuel',
      excelInstructions: 'Téléchargez d\'abord le modèle Excel qui contient les instructions détaillées et la structure exacte à respecter pour l\'importation.',
      exportInventory: 'Exporter l\'Inventaire',
      priceUpdateDescription: 'Configurez les intervalles de révision des prix par catégorie et gérez les mises à jour en masse',
      upToDate: 'À jour',
      lastUpdate: 'Dernière mise à jour',
      toUpdate: 'À mettre à jour',
      defaultConfigPerCategory: 'Configuration par défaut par catégorie',
      viewArticlesToUpdate: 'Voir les articles à mettre à jour',
      problemDetails: 'Détails du problème'
    },

    // Messages
    messages: {
      // Success
      success: {
        saved: 'Enregistré avec succès',
        deleted: 'Supprimé avec succès',
        updated: 'Mis à jour avec succès',
        created: 'Créé avec succès',
        imported: 'Importé avec succès',
        exported: 'Exporté avec succès',
        sent: 'Envoyé avec succès',
        copied: 'Copié avec succès'
      },

      // Error
      error: {
        generic: 'Une erreur est survenue',
        notFound: 'Non trouvé',
        unauthorized: 'Non autorisé',
        forbidden: 'Accès interdit',
        validation: 'Erreur de validation',
        network: 'Erreur réseau',
        timeout: 'Délai d\'attente dépassé',
        serverError: 'Erreur serveur',
        invalidInput: 'Entrée invalide',
        required: 'Ce champ est requis',
        tooShort: 'Trop court',
        tooLong: 'Trop long',
        invalidEmail: 'Courriel invalide',
        invalidFormat: 'Format invalide',
        alreadyExists: 'Existe déjà',
        insufficientStock: 'Stock insuffisant'
      },

      // Confirmation
      confirm: {
        delete: 'Êtes-vous sûr de vouloir supprimer?',
        save: 'Êtes-vous sûr de vouloir enregistrer?',
        cancel: 'Êtes-vous sûr de vouloir annuler?',
        exit: 'Êtes-vous sûr de vouloir quitter?',
        discard: 'Abandonner les modifications?',
        overwrite: 'Écraser le fichier existant?'
      },

      // Info
      info: {
        loading: 'Chargement...',
        processing: 'Traitement...',
        saving: 'Enregistrement...',
        deleting: 'Suppression...',
        uploading: 'Téléversement...',
        downloading: 'Téléchargement...',
        noData: 'Aucune donnée disponible',
        noResults: 'Aucun résultat trouvé',
        empty: 'Vide'
      }
    },

    // Date & Time
    date: {
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      },
      daysShort: {
        mon: 'Lun',
        tue: 'Mar',
        wed: 'Mer',
        thu: 'Jeu',
        fri: 'Ven',
        sat: 'Sam',
        sun: 'Dim'
      },
      months: {
        january: 'Janvier',
        february: 'Février',
        march: 'Mars',
        april: 'Avril',
        may: 'Mai',
        june: 'Juin',
        july: 'Juillet',
        august: 'Août',
        september: 'Septembre',
        october: 'Octobre',
        november: 'Novembre',
        december: 'Décembre'
      },
      monthsShort: {
        jan: 'Jan',
        feb: 'Fév',
        mar: 'Mar',
        apr: 'Avr',
        may: 'Mai',
        jun: 'Jun',
        jul: 'Jul',
        aug: 'Aoû',
        sep: 'Sep',
        oct: 'Oct',
        nov: 'Nov',
        dec: 'Déc'
      },
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      tomorrow: 'Demain',
      now: 'Maintenant'
    },

    // Status
    status: {
      available: 'Disponible',
      unavailable: 'Non disponible',
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      completed: 'Complété',
      cancelled: 'Annulé',
      inProgress: 'En cours',
      low: 'Bas',
      optimal: 'Optimal',
      surplus: 'Surplus',
      critical: 'Critique',
      normal: 'Normal',
      warning: 'Avertissement',
      error: 'Erreur'
    },

    // Theme
    theme: {
      title: 'Thème',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
      auto: 'Automatique'
    },

    // Validation
    validation: {
      required: 'Ce champ est requis',
      minLength: 'Longueur minimale: {min} caractères',
      maxLength: 'Longueur maximale: {max} caractères',
      minValue: 'Valeur minimale: {min}',
      maxValue: 'Valeur maximale: {max}',
      email: 'Adresse courriel invalide',
      url: 'URL invalide',
      phone: 'Numéro de téléphone invalide',
      date: 'Date invalide',
      number: 'Nombre invalide',
      positive: 'Doit être un nombre positif',
      integer: 'Doit être un nombre entier',
      match: 'Les valeurs ne correspondent pas',
      unique: 'Cette valeur existe déjà'
    },

    // Pagination
    pagination: {
      page: 'Page',
      of: 'de',
      items: 'éléments',
      itemsPerPage: 'Éléments par page',
      showing: 'Affichage de',
      to: 'à',
      first: 'Première',
      last: 'Dernière',
      previous: 'Précédente',
      next: 'Suivante'
    },

    // PWA
    pwa: {
      installTitle: 'Installer l\'application',
      installDescription: 'Installez C-Secur360 sur votre appareil pour un accès rapide et une expérience optimale.',
      installButton: 'Installer maintenant',
      notNow: 'Plus tard',
      iosInstructions: 'Pour installer sur iOS:',
      updateAvailable: 'Mise à jour disponible',
      updateNow: 'Mettre à jour',
      offlineMode: 'Mode hors ligne',
      backOnline: 'Connexion rétablie'
    }
  },

  en: {
    // Header
    appTitle: 'Inventory Management',
    appSubtitle: 'C-Secur360',
    login: 'Login',
    logout: 'Logout',
    adminMode: 'Admin Mode',
    welcome: 'Welcome',

    // Navigation
    nav: {
      navigation: 'Navigation',
      dashboard: 'Dashboard',
      articles: 'Articles',
      scanner: 'Scanner',
      movements: 'Movements',
      reports: 'Reports',
      administration: 'Administration'
    },

    // Common
    common: {
      loading: 'Loading',
      error: 'Error',
      errors: 'Errors',
      errorsDetected: 'Errors detected',
      success: 'Success',
      code: 'Code',
      codeWith: 'Code:',
      article: 'Article',
      category: 'Category',
      subcategory: 'Subcategory',
      stock: 'Stock',
      status: 'Status',
      all: 'All',
      allFeminine: 'All',
      price: 'Price',
      quantity: 'Quantity',
      currentQuantity: 'Current quantity',
      quantityToOrder: 'Quantity to order',
      unitPrice: 'Unit price',
      department: 'Department',
      departmentBranch: 'Department / Branch',
      allDepartments: 'All departments',
      globalView: 'Global view',
      supplier: 'Supplier',
      allSuppliers: 'All suppliers',
      notSpecified: 'Not specified',
      labelFormat: 'Label format',
      locationPlaceholder: 'Aisle 1, Rack B...',
      total: 'Total',
      totalWith: 'Total:',
      line: 'Line',
      lineNumber: 'Line',
      date: 'Date',
      dateWith: 'Date:',
      allStatuses: 'Status - All',
      valid: 'Valid',
      filterByDepartment: 'Filter by department / branch',
      lowStock: 'Low Stock',
      requiresRestocking: 'requires restocking',
      requiresRestockingPlural: 'require restocking',
      surplus: 'Surplus',
      optimal: 'Optimal',
      branch: 'branch',
      branches: 'branches',
      branchDetails: 'Branch details'
    },

    // Common Actions
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      add: 'Add',
      addAction: 'Add',
      removeAction: 'Remove',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      filters: 'Filters',
      export: 'Export',
      import: 'Import',
      importExcel: 'Import Excel',
      refresh: 'Refresh',
      confirm: 'Confirm',
      back: 'Back',
      backToDashboard: 'Back to dashboard',
      backToHome: 'Back to home',
      backToInventory: 'Back to inventory',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      clear: 'Clear',
      select: 'Select',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      print: 'Print',
      printLabel: 'Print Label',
      printThisLabel: 'Print the label',
      printLabels: 'Print labels',
      printCompleteSheets: 'Print complete sheets',
      printSelection: 'Print selection',
      qrCode: 'QR Code',
      scanToView: 'Scan to view'
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      inventoryOverview: 'Inventory Overview',
      overview: 'Overview',
      overviewDescription: 'Overview of your inventory',
      statistics: 'Statistics',
      totalArticles: 'Total Articles',
      articlesInInventory: 'Articles in inventory',
      lowStock: 'Low Stock',
      needsRestocking: 'Needs restocking',
      surplus: 'Surplus',
      totalValue: 'Total Value',
      recentMovements: 'Recent Movements',
      alerts: 'Alerts',
      totalAlerts: 'Total Alerts',
      quickActions: 'Quick Actions',
      inventoryHealth: 'Inventory Health',
      topCategories: 'Top Categories',
      stockStatus: 'Stock Status',
      stock: 'Stock',
      withinNorms: 'Within norms',
      priceReview: 'Price review',
      updateRequired: 'Update required',
      monthlyTrend: 'Monthly Trend',
      outOfStock: 'Out of stock',
      departmentsWithAlerts: 'With alerts',
      suppliersToContact: 'To contact',
      selectedForOrder: 'For order',
      noMovement: 'No movement',
      noMovementFound: 'No recent movements',
      noAlerts: 'No alerts',
      noAlertsFiltered: 'No alerts found with these filters',
      allArticlesSufficient: 'All articles are sufficiently stocked',
      valueByCategory: 'Value Distribution by Category',
      costVsMarginAnalysis: 'Cost vs profit margin analysis',
      financialReport: 'Financial Assets Report',
      financialReportDescription: 'Asset value and margins by category',
      inventoryFinancialReport: 'Inventory Financial Report',
      inventoryFinancialReportDescription: 'Total value and margins by category',
      noCategoriesFound: 'No categories found',
      noItemsInCategories: 'No items in selected categories',
      costValue: 'Cost Value',
      sellValue: 'Sell Value',
      ebitda: 'EBITDA'
    },

    // Articles
    articles: {
      title: 'Articles',
      addArticle: 'Add Article',
      addArticles: 'Add Articles',
      editArticle: 'Edit Article',
      deleteArticle: 'Delete Article',
      articleDetails: 'Article Details',
      articleList: 'Article List',
      searchArticles: 'Search Articles',
      noArticles: 'No articles found',
      noArticlesFiltered: 'No articles match your search criteria',
      noArticlesCriteria: 'No articles match your criteria',
      simpleArticle: 'Simple Article',
      existingList: 'Existing List (Excel)',
      addSingleManually: 'Add a single article manually',
      importMultipleExcel: 'Import multiple articles from Excel',
      importExcelInventory: 'Excel Import - Inventory',
      departmentsSection: 'Branches / Departments',
      selectDepartments: 'Select branches where this article will be available',
      selectOneDepartment: 'Please select at least one branch',
      articleType: 'Article Type',
      forSale: 'For Sale',
      forSaleDescription: 'Cost + Sale Price',
      consumable: 'Consumable',
      costOnly: 'Cost only',
      uniqueSale: 'Single Sale',
      noRestocking: 'No restocking',
      codeOption: 'Code option',
      uniqueCode: 'Unique code',
      uniqueCodeDescription: 'Same code for all branches',
      differentCodes: 'Different codes',
      differentCodesDescription: 'Custom code per branch',
      customCode: 'Custom code',
      priceRevision: 'Price Review',
      revisionFrequency: 'Review Frequency',
      every3Months: 'Every 3 months',
      every6Months: 'Every 6 months',
      every12Months: 'Every 12 months',
      customMonths: 'Number of months',
      priceAlertMessage: 'An alert will appear when price update is required',
      addTheArticle: 'Add the Article',
      optional: '(optional)',
      notApplicable: '(not applicable)',
      autoMarginApplied: 'Automatic margin applied',
      gridView: 'Grid view',
      listView: 'List view',
      detailedView: 'Detailed view',
      excelInstruction1: 'See the "Sample Data" tab for a complete example',
      excelInstruction2: 'Fill in your data in the "Sample Data" tab',
      excelInstruction3: 'In the application, click on "Import Excel"',
      excelInstruction4: 'Fill in your articles in the "Sample Data" tab',
      excelInstruction5: 'Follow the instructions in the "Instructions" tab',

      // Fields
      name: 'Name',
      code: 'Code',
      barcode: 'Barcode',
      qrCode: 'QR Code',
      description: 'Description',
      category: 'Category',
      department: 'Department',
      departments: 'Departments',
      suppliers: 'Suppliers',
      selected: 'Selected',
      location: 'Location',
      quantity: 'Quantity',
      currentQuantity: 'Current Quantity',
      minQuantity: 'Minimum Quantity',
      min: 'Min',
      maxQuantity: 'Maximum Quantity',
      max: 'Max',
      costPrice: 'Cost Price',
      costPriceShort: 'Cost Price ($)',
      salePrice: 'Sale Price',
      salePriceShort: 'Sale Price ($)',
      baseSalePrice: 'Base Sale Price',
      baseSalePriceShort: 'Base Sale Price ($)',
      targetSalePrice: 'Target Sale Price',
      targetSalePriceShort: 'Target Sale Price ($)',
      baseEbitda: 'Base EBITDA (%)',
      targetEbitda: 'Target EBITDA (%)',
      ebitdaHelp: 'EBITDA defined in Administration/Settings',
      supplier: 'Supplier',
      supplierName: 'Supplier name...',
      supplierEmail: 'Supplier email',
      unit: 'Unit',
      weight: 'Weight',
      dimensions: 'Dimensions',
      notes: 'Notes',
      image: 'Image',
      status: 'Status',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      createdBy: 'Created By',
      updatedBy: 'Updated By',

      // Units
      units: {
        piece: 'Piece',
        box: 'Box',
        pack: 'Pack',
        kg: 'Kilogram',
        g: 'Gram',
        l: 'Liter',
        ml: 'Milliliter',
        m: 'Meter',
        cm: 'Centimeter',
        units: 'units',
        unit: 'unit'
      },

      // Price and values
      unitCost: 'Unit cost',
      stockValue: 'Stock value',
      margin: 'Margin',
      profit: 'Profit',
      totalCost: 'Total cost',
      value: 'Value',
      perUnit: '/ unit',

      // Table columns
      actions: 'Actions',
      currentInventory: 'Current inventory',

      // Import Excel
      excel: {
        title: 'Import/Export Excel',
        downloadTemplate: 'Download Excel Template',
        downloadTemplateIcon: '📥 Download Excel Template',
        dragDrop: 'Drag your Excel file here',
        clickToSelect: 'or click to select a file',
        acceptedFormats: 'Accepted formats: .xlsx, .xls',
        instructions: '📋 Instructions:',
        beforeImporting: '📋 Before importing:',
        step1: '1. Download the Excel template above',
        step4: '4. Drag the file here or click to select it',
        instructionDownload: 'Download the Excel template from the Administration tab',
        instructionStructure: 'Respect the column structure exactly',
        instructionUniqueCodes: 'Verify that codes are unique',
        instructionCategories: 'Categories and departments must exist in the system',
        instructionDetailed: 'First download the Excel template which contains detailed instructions',

        // Excel headers
        headers: {
          code: 'Code',
          name: 'Name',
          category: 'Category',
          department: 'Department',
          location: 'Location',
          quantity: 'Quantity',
          minQuantity: 'Min Quantity',
          maxQuantity: 'Max Quantity',
          costPrice: 'Cost Price ($)',
          salePrice: 'Sale Price ($)',
          unit: 'Unit',
          description: 'Description'
        },

        // Template instructions
        template: {
          title: '📋 IMPORT INSTRUCTIONS - C-SECUR360 INVENTORY',
          requiredColumns: 'REQUIRED COLUMNS (do not modify names):',
          col1: '1. Code',
          col1Desc: 'Unique item code (e.g., EPI-001, TOOL-042)',
          col2: '2. Name',
          col2Desc: 'Item name',
          col3: '3. Category',
          col3Desc: 'Item category',
          col4: '4. Department',
          col4Desc: 'Department/Branch',
          col5: '5. Location',
          col5Desc: 'Precise location (e.g., Aisle 1, Rack B)',
          col6: '6. Quantity',
          col6Desc: 'Current stock (integer)',
          col7: '7. Min Quantity',
          col7Desc: 'Minimum threshold (alert if below)',
          col8: '8. Max Quantity',
          col8Desc: 'Maximum threshold',
          col9: '9. Cost Price ($)',
          col9Desc: 'Unit purchase price',
          col10: '10. Sale Price ($)',
          col10Desc: 'Unit sale price',
          col11: '11. Unit',
          col11Desc: 'Unit of measure (Piece, Box, Kg, L, etc.)',
          col12: '12. Description',
          col12Desc: 'Detailed description (optional)',

          importantRules: '⚠️ IMPORTANT RULES:',
          ruleUnique: '• Code must be UNIQUE (no duplicates)',
          ruleQuantities: '• Quantities must be positive integers',
          rulePrices: '• Prices must be decimal numbers (e.g., 2.50)',
          ruleMinMax: '• Min Quantity must be less than Max Quantity',
          ruleExist: '• Categories and departments must exist in the system',

          availableCategories: '✅ AVAILABLE CATEGORIES:',
          availableDepartments: '✅ AVAILABLE DEPARTMENTS:',
          exampleImport: '📊 IMPORT EXAMPLE:',
          importSteps: '💾 IMPORT STEPS:',
          step2: '2. Save the file',
          step5: '5. Verify the preview',
          step6: '6. Confirm the import',
          support: '🔧 SUPPORT:',
          supportText: 'For any questions, contact the system administrator',
          sheetInstructions: 'Instructions',
          sheetData: 'Sample Data'
        },

        // Validation errors
        validation: {
          invalidQuantity: 'Invalid quantity',
          invalidMinQuantity: 'Invalid min quantity',
          invalidMaxQuantity: 'Invalid max quantity',
          invalidCostPrice: 'Invalid cost price',
          invalidSalePrice: 'Invalid sale price',
          minMaxError: 'Min quantity must be < Max quantity',
          codeExists: 'Code already exists',
          codeDuplicate: 'Duplicate code in file',
          categoryNotFound: 'Category not found',
          departmentNotFound: 'Department not found'
        }
      },

      // Advanced fields
      advancedFields: 'Advanced Information (Photos, Dimensions, etc.)',
      photos: 'Article Photos',
      addPhotos: 'Add photos',
      noPhotosAdded: 'No photos added',
      selectOnlyImages: 'Please select only images',
      colors: 'Available colors',
      addColor: 'Add a color',
      pressEnterToAdd: 'Press Enter to add',
      dimensionsLWH: 'Dimensions (L × W × H)',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      brand: 'Brand',
      brandPlaceholder: 'Ex: Samsung, Apple, etc.',
      model: 'Model',
      modelPlaceholder: 'Ex: iPhone 15 Pro',
      serialNumber: 'Serial Number',
      serialNumberPlaceholder: 'Ex: SN123456789',
      condition: 'Condition',
      conditionNew: 'New',
      conditionLikeNew: 'Like New',
      conditionGood: 'Good',
      conditionFair: 'Fair',
      conditionPoor: 'Poor',
      warranty: 'Warranty',
      warrantyPlaceholder: 'Ex: 2 years, 24 months, etc.',
      rentalOption: 'Rental Option',
      rentalPrice: 'Rental Price ($)',
      rentalPeriod: 'Period',
      perHour: 'Per hour',
      perDay: 'Per day',
      perWeek: 'Per week',
      perMonth: 'Per month'
    },

    // Product sheet sharing
    share: {
      productSheet: 'Product Sheet',
      shareProduct: 'Share product',
      templateStyle: 'Template style',
      templateProfessional: 'Professional',
      templateMinimal: 'Minimal',
      templateDetailed: 'Detailed',
      basicInfo: 'Basic information',
      advancedInfo: 'Advanced information',
      stockInfo: 'Stock information',
      toggleAll: 'Toggle all',
      customPricing: 'Custom pricing',
      useCustomPrice: 'Use custom price',
      margin: 'Margin',
      preview: 'Preview',
      downloadPDF: 'Download PDF',
      copyLink: 'Copy link',
      shareEmail: 'Share by email',
      linkCopied: 'Link copied to clipboard!'
    },

    // Scanner
    scanner: {
      title: 'Scanner',
      scanQRCode: 'Scan QR Code',
      scanBarcode: 'Scan Barcode',
      scanResult: 'Scan Result',
      scanning: 'Scanning...',
      scanSuccess: 'Scan Successful',
      scanError: 'Scan Error',
      noCamera: 'No Camera Detected',
      cameraPermission: 'Camera Permission Required',
      startScanning: 'Start Scanning',
      stopScanning: 'Stop Scanning',
      switchCamera: 'Switch Camera',
      itemScanned: 'Item Scanned',
      itemNotFound: 'Item Not Found',

      // Quick Actions
      quickActions: 'Quick Actions',
      addStock: 'Add to Stock',
      removeStock: 'Remove from Stock',
      reportIssue: 'Report Issue',
      viewDetails: 'View Details',

      // Actions
      entry: 'Entry',
      exit: 'Exit',
      adjustment: 'Adjustment',
      transfer: 'Transfer',
      add: 'Add',
      remove: 'Remove',
      action: 'Action',
      adjust: 'Adjust',
      adjustQuantity: 'Quantity adjustment',
      newQuantity: 'New quantity',
      ok: 'OK',
      success: 'Success',
      successMessage: 'Inventory has been updated',
      inventoryConfirmed: 'Inventory confirmed',
      quantityAdjusted: 'Quantity adjusted',

      // Form
      selectAction: 'Select Action',
      enterQuantity: 'Enter Quantity',
      quantityToAdd: 'Quantity to Add',
      quantityToRemove: 'Quantity to Remove',
      reason: 'Reason',
      destination: 'Destination',
      source: 'Source',
      comment: 'Comment',
      validateMovement: 'Validate Movement',
      confirmAction: 'Confirm Action',

      // Issues
      issueType: 'Issue Type',
      issueDescription: 'Issue Description',
      issues: {
        damaged: 'Item Damaged',
        missing: 'Item Missing',
        wrongLocation: 'Wrong Location',
        expired: 'Item Expired',
        qualityIssue: 'Quality Issue',
        other: 'Other'
      },

      // Scanner Modes
      scanMode: 'Scan mode',
      movementMode: 'Movement Mode',
      inventoryMode: 'Inventory Mode',
      adjustmentIncrement: 'Adjustment +/-',
      physicalControl: 'Physical control',
      movementModeDescription: 'Adjust quantities by adding (+) or removing (-) from stock.',
      inventoryModeDescription: 'Enter the physical counted quantity. The system will automatically adjust the difference.',
      inventoryModeActive: 'Inventory Mode Active',
      inventoryModeActiveMessage: 'Stock movements are blocked for department {department}. Only inventory mode is available.',
      movementModeBlocked: 'Movement mode blocked! Department {department} is under inventory. Only inventory mode is allowed.',
      blocked: 'Blocked',

      // User Identity
      userIdentity: 'User identity',
      enterFullName: 'Enter your full name',
      allMovementsAssociated: 'All movements will be associated with your name',

      // Withdrawal
      withdrawalType: 'Withdrawal type',
      withdrawalForProject: 'Withdrawal for project',
      internalConsumption: 'Internal consumption',
      selectWithdrawalReason: 'Select withdrawal reason',

      // Project
      projectNumber: 'Project number',
      projectNumberOptional: 'Project number (optional)',
      requiredForProjectWithdrawals: 'Required for project withdrawals',
      leaveBlankForGeneral: 'Leave blank for general addition',

      // Physical Count
      physicalCountedQuantity: 'Physical counted quantity',
      enterActualStockQuantity: 'Enter actual stock quantity',
      difference: 'Difference',
      confirmInventory: 'Confirm Inventory',
      newQuantityLabel: 'New quantity'
    },

    // Movements
    movements: {
      title: 'Movements',
      history: 'History',
      addMovement: 'Add Movement',
      movementDetails: 'Movement Details',
      totalMovements: 'Total Movements',
      allTypes: 'All types combined',
      entriesDescription: 'Stock entries',
      exitsDescription: 'Stock exits',
      adjustmentsDescription: 'Adjustments',

      // Types
      types: {
        entry: 'Entry',
        exit: 'Exit',
        adjustment: 'Adjustment',
        transfer: 'Transfer',
        return: 'Return',
        loss: 'Loss',
        damaged: 'Damaged',
        inventory: 'Inventory'
      },

      // Fields
      type: 'Type',
      article: 'Article',
      quantity: 'Quantity',
      date: 'Date',
      time: 'Time',
      user: 'User',
      reason: 'Reason',
      from: 'From',
      to: 'To',
      reference: 'Reference',
      document: 'Document',
      comment: 'Comment',

      // Filters
      filterByType: 'Filter by Type',
      filterByDate: 'Filter by Date',
      filterByUser: 'Filter by User',
      filterByArticle: 'Filter by Article',
      dateFrom: 'Date From',
      dateTo: 'Date To',

      // Stats
      totalEntries: 'Total Entries',
      totalExits: 'Total Exits',
      totalAdjustments: 'Total Adjustments',
      netChange: 'Net Change',

      // Advanced Filters
      advancedFilters: 'Advanced filters',
      movementType: 'Movement type',
      allMovementTypes: 'All types',
      entries: 'Entries',
      exits: 'Exits',
      adjustments: 'Adjustments',
      transfers: 'Transfers',

      // Search & Export
      searchInMovements: 'Search in movements',
      searchByProject: 'Search by project code, article, user...',
      searchPlaceholder: 'Project code (ex: G25-1115), article, user...',
      filterSummary: 'Filter summary',
      activeFilters: 'Active filters',
      projectCode: 'Project Code',
      print: 'Print',
      printReport: 'Print report',
      exportExcel: 'Export Excel',
      exportToExcel: 'Export to Excel',
      reportTitle: 'Inventory Movements Report',
      reportDate: 'Report date',
      numberOfMovements: 'Number of movements',
      appliedFilter: 'Applied filter',
      from: 'From',
      to: 'To',
      allDepartmentsFilter: 'All departments',

      // Filter summary labels
      typeLabel: 'Type',
      departmentLabel: 'Department',
      ofLabel: 'of',
      movementsLabel: 'movements',

      // Export/Print
      movementsSheet: 'Movements',
      movementsFilename: 'Movements'
    },

    // Reports
    reports: {
      title: 'Reports',
      generateReport: 'Generate Report',
      reportType: 'Report Type',

      // Types
      types: {
        inventory: 'Inventory',
        movements: 'Movements',
        valuation: 'Valuation',
        lowStock: 'Low Stock',
        surplus: 'Surplus',
        transactions: 'Transactions',
        audit: 'Audit',
        performance: 'Performance'
      },

      // Options
      period: 'Period',
      format: 'Format',
      exportPDF: 'Export to PDF',
      exportExcel: 'Export to Excel',
      exportCSV: 'Export to CSV',

      // Periods
      periods: {
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        thisQuarter: 'This Quarter',
        lastQuarter: 'Last Quarter',
        thisYear: 'This Year',
        lastYear: 'Last Year',
        custom: 'Custom'
      },

      // Content
      inventoryValue: 'Inventory Value',
      totalCost: 'Total Cost',
      totalSale: 'Total Sale',
      potentialProfit: 'Potential Profit',
      itemCount: 'Item Count',
      lowStockItems: 'Low Stock Items',
      surplusItems: 'Surplus Items',
      outOfStock: 'Out of Stock',
      criticalLevel: 'Critical Level',
      subtotal: 'Subtotal',

      // Purchase order
      purchaseOrder: 'PURCHASE ORDER',
      supplierLabel: 'SUPPLIER:',
      totalOrder: 'ORDER TOTAL'
    },

    // Alerts
    alerts: {
      management: 'Alerts Management',
      generateOrder: 'Generate Order',
      sendOrderEmail: 'Send by Email',
      noSupplierEmail: 'No supplier email',
      pleaseAddEmail: 'Please add an email to the supplier in the item details',
      orderItems: 'Items to order',
      thankYou: 'Thank you for your collaboration'
    },

    // Administration
    administration: {
      title: 'Administration',
      settings: 'Settings',
      manageSystemSettings: 'Manage system settings',

      // Tabs
      tabs: {
        departmentsPersonnel: 'Site/Department',
        departments: 'Departments',
        categories: 'Categories',
        inventoryMode: 'Inventory Mode',
        importExport: 'Import/Export',
        settings: 'Settings'
      },

      // Departments
      departments: {
        title: 'Departments',
        manageDepartments: 'Department/Branch Management',
        manageDepartmentsDescription: 'Manage departments and their staff',
        addDepartment: 'Add Department',
        editDepartment: 'Edit Department',
        deleteDepartment: 'Delete Department',
        departmentName: 'Department Name',
        departmentCode: 'Department Code',
        manager: 'Manager',
        description: 'Description',
        active: 'Active',
        locations: 'Locations',
        locationsPlaceholder: 'Aisle 1, Aisle 2, Warehouse',
        locationsHelp: 'Example: Aisle 1, Aisle 2, Office',
        locationsSeparated: 'Locations (comma separated)',
        managePersonnel: 'Manage Staff',
        backToDepartments: 'Back'
      },

      // Categories
      categories: {
        title: 'Categories',
        addCategory: 'Add Category',
        editCategory: 'Edit Category',
        deleteCategory: 'Delete Category',
        categoryName: 'Category Name',
        categoryCode: 'Category Code',
        parentCategory: 'Parent Category',
        description: 'Description',
        active: 'Active'
      },

      // Inventory Mode
      inventoryMode: {
        active: 'Inventory Mode ACTIVE',
        inactive: 'Inventory Mode Inactive',
        department: 'Department',
        startedBy: 'Started by',
        startDate: 'Start Date',
        scansRecorded: 'Scans recorded',
        readyToStart: 'Ready to start an inventory',
        confirmEnd: 'Are you sure you want to end the inventory? A report will be generated.',
        endInventory: 'End Inventory',
        startInventory: 'Start an Inventory',
        selectDepartment: 'Select a department',
        chooseDepartment: 'Choose a department...',
        confirmStart: 'Activate inventory mode for {department}? Stock movements will be blocked for this department.',
        warning: 'Warning',
        warningMessage: 'Once activated, all stock movements (+/-) will be blocked for the selected department. Only inventory scanning will be allowed.',
        howItWorks: 'How it works',
        step1: 'Select the department to inventory',
        step2: 'Movements are automatically blocked for that department',
        step3: 'Scan all items with the scanner\'s "Inventory" mode',
        step4: 'End the inventory to unblock movements and generate the discrepancy report'
      },

      // Locations/Storage Management
      locations: {
        title: 'Location Management',
        description: 'Manage shelves, racks and storage spaces',
        addShelf: 'Add Shelf',
        editShelf: 'Edit Shelf',
        deleteShelf: 'Delete Shelf',
        shelfName: 'Shelf Name',
        shelfCode: 'Shelf Code',
        numberOfShelves: 'Number of Shelves',
        numberOfSpaces: 'Number of Spaces per Shelf',
        shelfHeight: 'Shelf Height',
        shelfWidth: 'Shelf Width',
        shelfDepth: 'Shelf Depth',
        maxWeight: 'Maximum Weight',
        shelves: 'Shelves',
        spaces: 'Spaces',
        capacity: 'Capacity',
        occupancy: 'Occupancy',
        available: 'Available',
        occupied: 'Occupied',
        shelfUnit: 'Shelf Unit',
        shelf: 'Shelf',
        space: 'Space',
        location: 'Location',
        storageUnit: 'Storage Unit',
        assignedTo: 'Assigned to',
        noShelvesConfigured: 'No shelves configured'
      },

      // Users
      users: {
        title: 'Users',
        addUser: 'Add User',
        editUser: 'Edit User',
        deleteUser: 'Delete User',
        username: 'Username',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        role: 'Role',
        permissions: 'Permissions',
        active: 'Active',
        lastLogin: 'Last Login'
      },

      // Roles
      roles: {
        admin: 'Administrator',
        manager: 'Manager',
        employee: 'Employee',
        viewer: 'Viewer'
      },

      // Settings
      general: 'General',
      appearance: 'Appearance',
      notifications: 'Notifications',
      security: 'Security',
      backup: 'Backup',
      language: 'Language',
      theme: 'Theme',
      timezone: 'Timezone',
      currency: 'Currency',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      baseEbitda: 'Base EBITDA (%)',
      baseEbitdaDescription: 'Minimum margin to cover base costs',
      targetEbitda: 'Target EBITDA (%)',
      targetEbitdaDescription: 'Target margin for optimal profitability',

      // Price management
      priceUpdate: 'Price Management',
      markAsUpdated: 'Mark as updated',
      priceAdvice: 'Review your item prices regularly to maintain optimal margins',
      priceAdviceLabel: '💡 Tip:',
      next30Days: 'Next 30 days',

      // Excel import/export
      excelImportExport: 'Import/Export Excel',
      excelDescription: 'Import article lists from Excel or export your current inventory',
      excelInstructions: 'First download the Excel template which contains detailed instructions and the exact structure to follow for import.',
      exportInventory: 'Export Inventory',
      priceUpdateDescription: 'Configure price review intervals by category and manage bulk updates',
      upToDate: 'Up to date',
      lastUpdate: 'Last update',
      toUpdate: 'To update',
      defaultConfigPerCategory: 'Default configuration per category',
      viewArticlesToUpdate: 'View articles to update',
      problemDetails: 'Problem details'
    },

    // Messages
    messages: {
      // Success
      success: {
        saved: 'Saved Successfully',
        deleted: 'Deleted Successfully',
        updated: 'Updated Successfully',
        created: 'Created Successfully',
        imported: 'Imported Successfully',
        exported: 'Exported Successfully',
        sent: 'Sent Successfully',
        copied: 'Copied Successfully'
      },

      // Error
      error: {
        generic: 'An error occurred',
        notFound: 'Not Found',
        unauthorized: 'Unauthorized',
        forbidden: 'Access Forbidden',
        validation: 'Validation Error',
        network: 'Network Error',
        timeout: 'Timeout Exceeded',
        serverError: 'Server Error',
        invalidInput: 'Invalid Input',
        required: 'This field is required',
        tooShort: 'Too Short',
        tooLong: 'Too Long',
        invalidEmail: 'Invalid Email',
        invalidFormat: 'Invalid Format',
        alreadyExists: 'Already Exists',
        insufficientStock: 'Insufficient Stock'
      },

      // Confirmation
      confirm: {
        delete: 'Are you sure you want to delete?',
        save: 'Are you sure you want to save?',
        cancel: 'Are you sure you want to cancel?',
        exit: 'Are you sure you want to exit?',
        discard: 'Discard changes?',
        overwrite: 'Overwrite existing file?'
      },

      // Info
      info: {
        loading: 'Loading...',
        processing: 'Processing...',
        saving: 'Saving...',
        deleting: 'Deleting...',
        uploading: 'Uploading...',
        downloading: 'Downloading...',
        noData: 'No Data Available',
        noResults: 'No Results Found',
        empty: 'Empty'
      }
    },

    // Date & Time
    date: {
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      daysShort: {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun'
      },
      months: {
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December'
      },
      monthsShort: {
        jan: 'Jan',
        feb: 'Feb',
        mar: 'Mar',
        apr: 'Apr',
        may: 'May',
        jun: 'Jun',
        jul: 'Jul',
        aug: 'Aug',
        sep: 'Sep',
        oct: 'Oct',
        nov: 'Nov',
        dec: 'Dec'
      },
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      now: 'Now'
    },

    // Status
    status: {
      available: 'Available',
      unavailable: 'Unavailable',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      inProgress: 'In Progress',
      low: 'Low',
      optimal: 'Optimal',
      surplus: 'Surplus',
      critical: 'Critical',
      normal: 'Normal',
      warning: 'Warning',
      error: 'Error'
    },

    // Theme
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      auto: 'Auto'
    },

    // Validation
    validation: {
      required: 'This field is required',
      minLength: 'Minimum length: {min} characters',
      maxLength: 'Maximum length: {max} characters',
      minValue: 'Minimum value: {min}',
      maxValue: 'Maximum value: {max}',
      email: 'Invalid email address',
      url: 'Invalid URL',
      phone: 'Invalid phone number',
      date: 'Invalid date',
      number: 'Invalid number',
      positive: 'Must be a positive number',
      integer: 'Must be an integer',
      match: 'Values do not match',
      unique: 'This value already exists'
    },

    // Pagination
    pagination: {
      page: 'Page',
      of: 'of',
      items: 'items',
      itemsPerPage: 'Items per page',
      showing: 'Showing',
      to: 'to',
      first: 'First',
      last: 'Last',
      previous: 'Previous',
      next: 'Next'
    },

    // PWA
    pwa: {
      installTitle: 'Install App',
      installDescription: 'Install C-Secur360 on your device for quick access and optimal experience.',
      installButton: 'Install Now',
      notNow: 'Not Now',
      iosInstructions: 'To install on iOS:',
      updateAvailable: 'Update Available',
      updateNow: 'Update Now',
      offlineMode: 'Offline Mode',
      backOnline: 'Back Online'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // La langue est piloter par le header principal de l'app : on suit en priorite la cle
    // de l'hote ('preferred-language' / 'cs-lang'), avec repli sur l'ancienne cle locale.
    if (typeof window !== 'undefined') {
      const host = localStorage.getItem('preferred-language') || localStorage.getItem('cs-lang');
      if (host === 'fr' || host === 'en') return host;
      const saved = localStorage.getItem('language');
      if (saved === 'fr' || saved === 'en') return saved;
    }
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Pont robuste avec le header principal : l'hote (PortalHeader) ecrit 'preferred-language' et
  // emet l'evenement 'cs-lang-change' a chaque bascule FR/EN. On l'ecoute pour suivre la langue,
  // independamment du pont par contexte React (double securite contre les soucis de timing/montage).
  useEffect(() => {
    const applyFrom = (val) => {
      const l = val || localStorage.getItem('preferred-language') || localStorage.getItem('cs-lang');
      if (l === 'fr' || l === 'en') setLanguage(prev => (prev === l ? prev : l));
    };
    const onLangEvent = (e) => applyFrom(e?.detail);
    const onStorage = (e) => { if (!e || e.key === 'preferred-language' || e.key === 'cs-lang') applyFrom(); };
    window.addEventListener('cs-lang-change', onLangEvent);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cs-lang-change', onLangEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  };

  const changeLanguage = (newLanguage) => {
    if (LANGUAGES[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    languages: LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
