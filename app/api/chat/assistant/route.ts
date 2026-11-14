import { NextRequest, NextResponse } from 'next/server';

// =================== SYSTÈME DE SÉCURITÉ IA ===================
// Limitation stricte aux domaines autorisés seulement

interface SafetyDomain {
  keywords: string[];
  topics: string[];
  allowedQuestions: string[];
}

// Domaines autorisés SEULEMENT
const ALLOWED_DOMAINS: Record<string, SafetyDomain> = {
  // Santé et sécurité au travail
  'health_safety': {
    keywords: ['sécurité', 'santé', 'SST', 'OHS', 'accident', 'incident', 'blessure', 'danger', 'risque', 'prévention', 'protection', 'EPI', 'PPE'],
    topics: ['Formation sécurité', 'Procédures d\'urgence', 'Équipement de protection', 'Évaluation des risques'],
    allowedQuestions: [
      'Quels sont les EPI requis?',
      'Comment signaler un incident?',
      'Quelles sont les procédures d\'urgence?'
    ]
  },
  
  // Conformité et normes
  'compliance': {
    keywords: ['norme', 'réglementation', 'conformité', 'loi', 'règlement', 'CNESST', 'WSIB', 'WorkSafeBC', 'WCB', 'CSA', 'NFPA', 'OSHA'],
    topics: ['Normes provinciales', 'Réglementation fédérale', 'Standards industriels', 'Obligations légales'],
    allowedQuestions: [
      'Quelles sont les exigences provinciales?',
      'Comment être conforme aux normes?',
      'Quels sont mes obligations légales?'
    ]
  },
  
  // Types de permis de travail
  'work_permits': {
    keywords: ['permis', 'AST', 'JSEA', 'espace clos', 'confined space', 'excavation', 'électrique', 'hauteur', 'travaux chauds', 'hot work', 'LOTO'],
    topics: ['Permis à chaud', 'Espaces clos', 'Travail en hauteur', 'Excavation', 'Électricité', 'Verrouillage'],
    allowedQuestions: [
      'Comment remplir un AST?',
      'Quand un permis est-il requis?',
      'Quelles sont les étapes de validation?'
    ]
  },
  
  // Utilisation du site/plateforme
  'platform_usage': {
    keywords: ['site', 'plateforme', 'formulaire', 'dashboard', 'navigation', 'fonctionnalité', 'comment utiliser'],
    topics: ['Navigation du site', 'Remplissage de formulaires', 'Tableau de bord', 'Fonctionnalités'],
    allowedQuestions: [
      'Comment naviguer dans le site?',
      'Comment remplir ce formulaire?',
      'Où trouver mes documents?'
    ]
  },
  
  // Inspection et maintenance
  'inspection_maintenance': {
    keywords: ['inspection', 'maintenance', 'vérification', 'équipement', 'outillage', 'harnais', 'échelle', 'extincteur'],
    topics: ['Inspection d\'équipement', 'Maintenance préventive', 'Calendrier d\'inspection', 'Défaillances'],
    allowedQuestions: [
      'À quelle fréquence inspecter?',
      'Que faire si défaut détecté?',
      'Comment planifier les inspections?'
    ]
  },
  
  // Provinces canadiennes et leurs normes
  'provincial_standards': {
    keywords: ['Québec', 'Ontario', 'Alberta', 'Colombie-Britannique', 'BC', 'QC', 'ON', 'AB', 'provincial'],
    topics: ['Normes québécoises', 'Normes ontariennes', 'Normes albertaines', 'Normes BC'],
    allowedQuestions: [
      'Quelles sont les normes au Québec?',
      'Différences entre provinces?',
      'Obligations provinciales spécifiques?'
    ]
  }
};

// Sujets INTERDITS (la liste noire)
const FORBIDDEN_TOPICS = [
  'politique', 'religion', 'finance personnelle', 'investissement', 'crypto', 'bourse',
  'médical', 'diagnostic', 'traitement', 'médicament', 'conseil médical',
  'juridique personnel', 'divorce', 'testament', 'succession',
  'recettes', 'cuisine', 'voyage', 'divertissement', 'sport',
  'technologie personnelle', 'jeux', 'réseaux sociaux',
  'relations personnelles', 'conseil de vie', 'psychologie personnelle'
];

// =================== VALIDATION DE SÉCURITÉ ===================

class SafetyContentFilter {
  
  /**
   * Vérifie si le message est dans les domaines autorisés
   */
  isMessageSafe(message: string, context?: any): {
    isSafe: boolean;
    domain?: string;
    reason?: string;
    suggestions?: string[];
  } {
    const lowerMessage = message.toLowerCase();
    
    // Vérifier les sujets interdits
    for (const forbidden of FORBIDDEN_TOPICS) {
      if (lowerMessage.includes(forbidden)) {
        return {
          isSafe: false,
          reason: `Sujet non autorisé: ${forbidden}`,
          suggestions: this.getSafetySuggestions(context)
        };
      }
    }
    
    // Vérifier les domaines autorisés
    for (const [domainKey, domain] of Object.entries(ALLOWED_DOMAINS)) {
      const hasKeyword = domain.keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        return {
          isSafe: true,
          domain: domainKey
        };
      }
    }
    
    // Si aucun domaine identifié, vérifier si c'est une salutation ou question générale
    const greetings = ['bonjour', 'salut', 'hello', 'aide', 'help', 'comment', 'quoi', 'pourquoi'];
    const isGreeting = greetings.some(greeting => lowerMessage.includes(greeting));
    
    if (isGreeting && lowerMessage.length < 50) {
      return {
        isSafe: true,
        domain: 'general'
      };
    }
    
    return {
      isSafe: false,
      reason: 'Sujet non reconnu dans les domaines de sécurité autorisés',
      suggestions: this.getSafetySuggestions(context)
    };
  }
  
  /**
   * Génère des suggestions sécurisées selon le contexte
   */
  private getSafetySuggestions(context?: any): string[] {
    const suggestions = [
      "Questions sur les normes de sécurité provinciales",
      "Aide pour remplir les formulaires AST",
      "Information sur les équipements de protection",
      "Procédures d'urgence et d'évacuation",
      "Formation et certification sécurité"
    ];
    
    // Suggestions contextuelles
    if (context?.page === 'ast-form') {
      suggestions.unshift(
        "Aide pour la section actuelle du formulaire",
        "Vérification de conformité provinciale",
        "Exigences pour ce type de travail"
      );
    }
    
    if (context?.currentStep) {
      suggestions.unshift(`Aide pour l'étape ${context.currentStep} de votre AST`);
    }
    
    return suggestions.slice(0, 5); // Limiter à 5 suggestions
  }
  
  /**
   * Génère une réponse sécurisée basée sur les domaines autorisés
   */
  generateSafeResponse(message: string, domain: string, context?: any): {
    response: string;
    suggestions?: string[];
    confidence: number;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Réponses selon le domaine
    switch (domain) {
      case 'health_safety':
        return this.handleHealthSafetyQuery(lowerMessage, context);
        
      case 'compliance':
        return this.handleComplianceQuery(lowerMessage, context);
        
      case 'work_permits':
        return this.handleWorkPermitQuery(lowerMessage, context);
        
      case 'platform_usage':
        return this.handlePlatformQuery(lowerMessage, context);
        
      case 'inspection_maintenance':
        return this.handleInspectionQuery(lowerMessage, context);
        
      case 'provincial_standards':
        return this.handleProvincialQuery(lowerMessage, context);
        
      case 'general':
        return this.handleGeneralQuery(lowerMessage, context);
        
      default:
        return {
          response: "Je suis spécialisé uniquement en santé-sécurité au travail. Comment puis-je vous aider avec vos AST, permis de travail ou conformité réglementaire?",
          suggestions: this.getSafetySuggestions(context),
          confidence: 0.8
        };
    }
  }
  
  private handleHealthSafetyQuery(message: string, context?: any) {
    if (message.includes('epi') || message.includes('protection')) {
      return {
        response: `Pour l'équipement de protection individuelle (EPI), les exigences varient selon le type de travail et la province. Les EPI de base incluent:\n\n• Casque de sécurité\n• Lunettes de protection\n• Chaussures de sécurité\n• Gants appropriés\n• Vêtements haute visibilité (si requis)\n\nVoulez-vous des informations spécifiques à votre type de travail ou province?`,
        suggestions: [
          "EPI pour travail en hauteur",
          "Protection respiratoire",
          "EPI pour espaces clos",
          "Normes CSA pour les équipements"
        ],
        confidence: 0.9
      };
    }
    
    if (message.includes('accident') || message.includes('incident')) {
      return {
        response: `En cas d'accident ou incident:\n\n1. **Sécuriser** la zone\n2. **Premiers soins** si nécessaire\n3. **Signaler** immédiatement au superviseur\n4. **Documenter** l'événement\n5. **Enquêter** pour prévenir la récurrence\n\nChaque province a ses propres obligations de déclaration.`,
        suggestions: [
          "Obligations de déclaration par province",
          "Formulaire de déclaration d'accident",
          "Procédures d'urgence",
          "Formation premiers soins"
        ],
        confidence: 0.95
      };
    }
    
    return {
      response: "Je peux vous aider avec tous les aspects de la santé-sécurité : EPI, procédures d'urgence, prévention des accidents, formation sécurité, etc. Quelle est votre question spécifique?",
      suggestions: this.getSafetySuggestions(context),
      confidence: 0.7
    };
  }
  
  private handleComplianceQuery(message: string, context?: any) {
    // Identifier la province si mentionnée
    let province = '';
    if (message.includes('québec') || message.includes('qc')) province = 'QC';
    else if (message.includes('ontario') || message.includes('on')) province = 'ON';
    else if (message.includes('alberta') || message.includes('ab')) province = 'AB';
    else if (message.includes('colombie') || message.includes('bc')) province = 'BC';
    
    if (province) {
      return {
        response: `Pour la province ${province}, voici les informations de conformité principales:\n\n**Organismes de réglementation:**\n• QC: CNESST\n• ON: WSIB/Ministère du Travail\n• AB: WCB Alberta\n• BC: WorkSafeBC\n\nJe peux vous renseigner sur les normes spécifiques pour espaces clos, électricité, excavation, travaux à chaud, etc.`,
        suggestions: [
          `Normes espaces clos ${province}`,
          `Réglementation électrique ${province}`,
          `Exigences excavation ${province}`,
          `Permis travaux à chaud ${province}`
        ],
        confidence: 0.95
      };
    }
    
    return {
      response: "Les normes de conformité varient selon la province canadienne. Chaque province a son organisme de réglementation :\n\n• **Québec:** CNESST\n• **Ontario:** WSIB/Ministère du Travail\n• **Alberta:** WCB Alberta\n• **Colombie-Britannique:** WorkSafeBC\n\nDe quelle province avez-vous besoin d'information?",
      suggestions: [
        "Normes québécoises (CNESST)",
        "Normes ontariennes (WSIB)",
        "Normes albertaines (WCB)",
        "Normes BC (WorkSafeBC)"
      ],
      confidence: 0.8
    };
  }
  
  private handleWorkPermitQuery(message: string, context?: any) {
    if (message.includes('espace clos') || message.includes('confined')) {
      return {
        response: `**Permis d'espace clos requis** quand :\n\n• Espace partiellement/complètement fermé\n• Non conçu pour occupation continue\n• Risques atmosphériques possibles\n\n**Exigences minimum :**\n• Test atmosphérique obligatoire\n• Surveillant à l'extérieur\n• Moyens de communication\n• Plan de sauvetage d'urgence\n• Personnel formé uniquement\n\nLa réglementation varie par province.`,
        suggestions: [
          "Procédure test atmosphérique",
          "Formation espace clos",
          "Plan de sauvetage",
          "Équipement de surveillance"
        ],
        confidence: 0.95
      };
    }
    
    if (message.includes('ast') || message.includes('jsea')) {
      return {
        response: `L'**Analyse Sécuritaire de Travail (AST)** est obligatoire pour identifier les dangers et mesures de contrôle :\n\n**Étapes :**\n1. Identification du projet\n2. Décomposition des tâches\n3. Identification des dangers\n4. Mesures de contrôle\n5. Signatures et approbations\n\nChaque étape doit être complétée selon les normes provinciales.`,
        suggestions: [
          "Comment identifier les dangers",
          "Mesures de contrôle efficaces",
          "Qui doit signer l'AST",
          "Révision et mise à jour"
        ],
        confidence: 0.9
      };
    }
    
    return {
      response: "Les permis de travail sont requis pour les activités à risque élevé. Selon le type de travail, vous pourriez avoir besoin de :\n\n• Permis d'espace clos\n• Permis de travail à chaud\n• Permis de travail en hauteur\n• Permis d'excavation\n• Permis électrique\n\nDe quel type de permis avez-vous besoin?",
      suggestions: [
        "Permis espace clos",
        "Permis travaux à chaud",
        "Permis travail en hauteur",
        "Permis excavation"
      ],
      confidence: 0.8
    };
  }
  
  private handlePlatformQuery(message: string, context?: any) {
    if (message.includes('formulaire') || message.includes('remplir')) {
      return {
        response: `Pour remplir efficacement vos formulaires :\n\n**Navigation :**\n• Utilisez la barre de progression en haut\n• Sauvegardez régulièrement\n• Validez chaque section avant de continuer\n\n**Aide contextuelle :**\n• Icônes d'aide (?) pour explications\n• Suggestions automatiques\n• Validation en temps réel\n\nSur quelle section avez-vous besoin d'aide?`,
        suggestions: [
          "Aide section identification",
          "Aide analyse des tâches",
          "Aide identification dangers",
          "Aide mesures de contrôle"
        ],
        confidence: 0.85
      };
    }
    
    if (message.includes('dashboard') || message.includes('tableau')) {
      return {
        response: `Le **tableau de bord** vous donne une vue d'ensemble :\n\n**Sections principales :**\n• Statistiques AST et conformité\n• Alertes et notifications\n• Documents récents\n• Calendrier d'inspections\n• État des certifications\n\n**Indicateurs clés :**\n• Score de sécurité\n• Conformité provinciale\n• AST en cours/complétés`,
        suggestions: [
          "Interpréter le score de sécurité",
          "Résoudre les alertes",
          "Calendrier d'inspections",
          "Télécharger rapports"
        ],
        confidence: 0.9
      };
    }
    
    return {
      response: "Je peux vous aider à naviguer dans la plateforme C-SECUR360 :\n\n• Remplissage de formulaires\n• Utilisation du tableau de bord\n• Gestion des documents\n• Configuration des alertes\n\nQue voulez-vous savoir spécifiquement?",
      suggestions: this.getSafetySuggestions(context),
      confidence: 0.7
    };
  }
  
  private handleInspectionQuery(message: string, context?: any) {
    return {
      response: `**Fréquences d'inspection courantes :**\n\n• **Harnais/équipement chute :** Avant chaque utilisation + inspection formelle annuelle\n• **Échelles :** Quotidienne + inspection détaillée mensuelle\n• **Extincteurs :** Mensuelle + inspection annuelle certifiée\n• **Équipement levage :** Quotidienne + inspection annuelle\n\n**Si défaut détecté :**\n1. Retirer immédiatement de service\n2. Étiqueter "DÉFECTUEUX"\n3. Documenter le défaut\n4. Réparer ou remplacer`,
      suggestions: [
        "Calendrier d'inspections",
        "Formulaires d'inspection",
        "Critères de mise hors service",
        "Formation inspection"
      ],
      confidence: 0.9
    };
  }
  
  private handleProvincialQuery(message: string, context?: any) {
    return {
      response: `**Principales différences provinciales :**\n\n• **Québec (CNESST) :** Emphase sur prévention, amendes jusqu'à 500 000$\n• **Ontario (WSIB) :** Système de permis détaillé, O. Reg. spécifiques\n• **Alberta (WCB) :** Code de sécurité unifié, amendes jusqu'à 500 000$\n• **BC (WorkSafeBC) :** Amendes élevées (jusqu'à 6,7M$), règlements détaillés\n\nChaque province a ses propres exigences de formation et certification.`,
      suggestions: [
        "Obligations spécifiques Québec",
        "Réglements Ontario détaillés",
        "Code Alberta expliqué",
        "Système BC WorkSafe"
      ],
      confidence: 0.85
    };
  }
  
  private handleGeneralQuery(message: string, context?: any) {
    return {
      response: `Bonjour ! Je suis votre assistant IA spécialisé en **santé-sécurité au travail** pour la plateforme C-SECUR360.\n\n**Je peux vous aider avec :**\n• AST et permis de travail\n• Conformité aux normes provinciales\n• Procédures de sécurité\n• Utilisation de la plateforme\n• Formation et certification\n\nComment puis-je vous assister aujourd'hui ?`,
      suggestions: this.getSafetySuggestions(context),
      confidence: 0.8
    };
  }
}

// =================== API ROUTE ===================

export async function POST(request: NextRequest) {
  try {
    const { message, context, history, isQuickAction } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message requis' },
        { status: 400 }
      );
    }
    
    const contentFilter = new SafetyContentFilter();
    
    // Vérification de sécurité
    const safetyCheck = contentFilter.isMessageSafe(message, context);
    
    if (!safetyCheck.isSafe) {
      return NextResponse.json({
        success: true,
        response: `**Limitation de contenu**\n\nJe suis strictement limité aux domaines de **santé-sécurité au travail**. ${safetyCheck.reason}\n\n**Je peux vous aider avec :**\n• Normes et conformité provinciales\n• AST et permis de travail\n• Procédures de sécurité\n• Utilisation de la plateforme C-SECUR360\n\nComment puis-je vous assister dans ces domaines?`,
        suggestions: safetyCheck.suggestions || [
          "Questions sur les AST",
          "Normes provinciales",
          "Équipements de protection",
          "Procédures d'urgence"
        ]
      });
    }
    
    // Génération de réponse sécurisée
    const safeResponse = contentFilter.generateSafeResponse(
      message, 
      safetyCheck.domain || 'general', 
      context
    );
    
    // Ajout de l'en-tête de conformité si pertinent
    let response = safeResponse.response;
    
    // Si question sur conformité provinciale spécifique
    if (safetyCheck.domain === 'compliance' || safetyCheck.domain === 'provincial_standards') {
      response += "\n\n**Note légale :** Ces informations sont fournies à titre indicatif. Consultez toujours les textes réglementaires officiels et votre service de sécurité.";
    }
    
    return NextResponse.json({
      success: true,
      response,
      suggestions: safeResponse.suggestions,
      confidence: safeResponse.confidence,
      domain: safetyCheck.domain,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur API assistant:', error);
    
    return NextResponse.json({
      success: true, // Toujours success pour éviter les erreurs côté client
      response: "**Erreur technique temporaire**\n\nJe rencontre des difficultés techniques. Veuillez réessayer dans un moment.\n\nEn attendant, vous pouvez :\n• Consulter la documentation intégrée\n• Contacter le support technique\n• Utiliser les ressources d'aide contextuelle",
      suggestions: [
        "Réessayer la question",
        "Consulter l'aide contextuelle",
        "Contacter le support"
      ]
    }, { status: 200 });
  }
}