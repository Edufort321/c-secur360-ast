// =================== API ASSISTANT IA ===================
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Configuration de l'IA (peut être Claude, OpenAI, ou autre)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.AI_API_BASE_URL || 'https://api.openai.com/v1',
});

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
}

interface ChatContext {
  page?: string;
  astId?: string;
  userId?: string;
  organizationId?: string;
  currentStep?: number;
  formData?: any;
}

// Base de connaissances sur la sécurité canadienne
const SAFETY_KNOWLEDGE_BASE = {
  QC: {
    authority: 'CNESST',
    regulations: {
      fall_protection: 'Au Québec, la protection contre les chutes est obligatoire à partir de 3 mètres selon le RSST.',
      confined_space: 'Les espaces clos nécessitent un permis d\'entrée et une surveillance continue selon l\'article 185 du RSST.',
      lockout: 'Le cadenassage doit suivre la norme CSA Z460 et utiliser des cadenas personnels.',
      electrical: 'Les travaux électriques nécessitent une habilitation selon le Code de construction du Québec.'
    },
    emergency: 'En cas d\'urgence, contactez le 911 et la CNESST au 1-844-838-0808'
  },
  ON: {
    authority: 'Ministry of Labour',
    regulations: {
      fall_protection: 'En Ontario, la protection contre les chutes est requise à partir de 3 mètres (O. Reg. 213/91).',
      confined_space: 'O. Reg. 632/05 exige une évaluation écrite et un plan d\'entrée pour les espaces clos.',
      lockout: 'Le lockout doit suivre les procédures écrites selon la réglementation OHSA.',
      electrical: 'Les travaux électriques requièrent des qualifications selon l\'Ontario Electrical Safety Code.'
    },
    emergency: 'Urgence: 911 | Ministry of Labour: 1-877-202-0008'
  }
};

// Prompts système pour différents contextes
const getSystemPrompt = (context: ChatContext) => {
  const basePrompt = `Tu es l'assistant IA spécialisé de C-SECUR360, un système de gestion des analyses sécuritaires de tâches (AST) au Canada.

EXPERTISE:
- Sécurité au travail selon les normes canadiennes (CNESST, MOL, WorkSafeBC, etc.)
- Réglementations provinciales en santé-sécurité
- Procédures LOTO (Lockout/Tagout)
- Équipement de protection individuelle (EPI)
- Espaces clos, travail en hauteur, sécurité électrique
- Conformité réglementaire et normes CSA/ANSI

COMPORTEMENT:
- Réponds TOUJOURS en français à moins qu'on te demande l'anglais
- Sois précis, professionnel et orienté sécurité
- Cite les articles de loi et normes quand pertinent
- Priorise TOUJOURS la sécurité des travailleurs
- Propose des solutions pratiques et conformes
- Si tu ne sais pas quelque chose, dis-le clairement

CONTEXTE ACTUEL: ${context.page || 'général'}`;

  switch (context.page) {
    case 'ast-form':
      return basePrompt + `

Tu aides actuellement un utilisateur à remplir un AST (Analyse Sécuritaire de Tâche).
Étape actuelle: ${context.currentStep || 'Non spécifiée'}

AIDE SPÉCIFIQUE:
- Guide pour identifier les dangers
- Exigences légales par province
- Choix d'EPI appropriés
- Procédures de verrouillage
- Validation de conformité`;

    case 'dashboard':
      return basePrompt + `

Tu aides avec l'interprétation du tableau de bord sécurité.

AIDE SPÉCIFIQUE:
- Interprétation des statistiques
- Alertes de conformité
- Tendances de sécurité
- Recommandations d'amélioration`;

    case 'inspections':
      return basePrompt + `

Tu aides avec les inspections d'équipement.

AIDE SPÉCIFIQUE:
- Fréquences d'inspection réglementaires
- Critères de défaillance
- Planification d'inspections
- Conformité équipements`;

    default:
      return basePrompt;
  }
};

// Fonction pour générer des suggestions contextuelles
const generateSuggestions = (context: ChatContext, userMessage: string): string[] => {
  const suggestions: string[] = [];

  if (context.page === 'ast-form') {
    suggestions.push(
      "Quels sont les EPI requis pour ce type de travail ?",
      "Comment identifier tous les dangers potentiels ?",
      "Quelle procédure de verrouillage utiliser ?"
    );
  } else if (context.page === 'dashboard') {
    suggestions.push(
      "Comment améliorer mon score de conformité ?",
      "Que signifient ces alertes rouges ?",
      "Comment planifier mes prochaines inspections ?"
    );
  } else if (userMessage.toLowerCase().includes('danger')) {
    suggestions.push(
      "Quels EPI sont nécessaires ?",
      "Comment éliminer ce danger ?",
      "Quelle formation est requise ?"
    );
  } else {
    suggestions.push(
      "Aide-moi avec mon AST",
      "Exigences réglementaires du Québec",
      "Comment utiliser le système LOTO ?"
    );
  }

  return suggestions.slice(0, 3);
};

// POST - Traiter un message du chat
export async function POST(request: NextRequest) {
  try {
    const { message, context, history, isQuickAction } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Construire le contexte pour l'IA
    const systemPrompt = getSystemPrompt(context || {});
    
    // Préparer l'historique des messages
    const conversationHistory = (history || []).slice(-6).map((msg: ChatMessage) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Ajouter des informations contextuelles si disponibles
    let enhancedMessage = message;
    if (context?.formData && context.page === 'ast-form') {
      enhancedMessage += `\n\nContexte AST actuel: ${JSON.stringify(context.formData, null, 2)}`;
    }

    console.log('🤖 Envoi à l\'IA:', {
      message: enhancedMessage,
      context: context?.page,
      historyLength: conversationHistory.length
    });

    // Appel à l'API d'IA
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: enhancedMessage }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0]?.message?.content || 
                      'Désolé, je n\'ai pas pu traiter votre demande.';

    // Générer des suggestions
    const suggestions = generateSuggestions(context || {}, message);

    // Log pour surveillance
    console.log('✅ Réponse IA générée:', {
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
      model: completion.model,
      responseLength: aiResponse.length
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      suggestions,
      metadata: {
        model: completion.model,
        tokens: completion.usage?.total_tokens,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur API Assistant:', error);

    // Réponse de fallback en cas d'erreur
    const fallbackResponse = `Désolé, je rencontre des difficultés techniques actuellement. 

En attendant, voici quelques ressources utiles :
• 🏥 Urgence: 911
• 📞 CNESST (QC): 1-844-838-0808  
• 📞 Ministry of Labour (ON): 1-877-202-0008
• 📖 Documentation: https://help.c-secur360.com

N'hésitez pas à réessayer dans quelques instants.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      suggestions: [
        "Voir la documentation",
        "Contacter le support",
        "Réessayer plus tard"
      ],
      metadata: {
        fallback: true,
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : "Unknown error") : 'AI service unavailable'
      }
    });
  }
}

// GET - Obtenir les statistiques du chat (pour les admins)
export async function GET() {
  try {
    // Ici on pourrait retourner des stats d'utilisation du chat
    const stats = {
      service: 'AI Assistant API',
      status: 'active',
      model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
      features: [
        'Contextual safety advice',
        'Canadian regulations knowledge',
        'Multi-language support (FR/EN)',
        'AST form assistance',
        'Equipment inspection guidance'
      ],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(stats);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 500 }
    );
  }
}