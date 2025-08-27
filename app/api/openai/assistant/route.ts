import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration de l'Assistant C-SECUR360
const ASSISTANT_CONFIG = {
  name: "Assistant Admin C-SECUR360",
  description: "Assistant IA spécialisé pour l'administration de la plateforme C-SECUR360, expert en HSE, gestion clients, et analyse business",
  instructions: `
Vous êtes l'Assistant IA Admin de C-SECUR360, une plateforme SaaS de gestion HSE (Hygiène, Sécurité, Environnement).

CONTEXTE:
- C-SECUR360 est une solution pour entreprises construction, manufacturing, services industriels
- Modules: AST (Analyse Sécurité Travail), gestion équipements, rapports, formations
- Clients principalement au Québec/Canada
- Modèle SaaS: 250$/mois ou 3000$/an par organisation

RÔLES PRINCIPAUX:
1. ANALYSE BUSINESS: Interpréter métriques MRR/ARR, churn, croissance
2. SUPPORT CLIENT: Aider résolution problèmes techniques et questions clients
3. PROSPECTION: Analyser leads, recommander stratégies marketing
4. PRÉDICTIONS: Utiliser données pour forecasting revenus et tendances
5. HSE EXPERTISE: Conseiller réglementations, bonnes pratiques sécurité

DONNÉES ACCESSIBLES:
- Métriques financières temps réel
- Base clients et abonnements  
- Données prospects et campagnes marketing
- Analytics usage et adoption fonctionnalités
- Tickets support et satisfaction

STYLE DE RÉPONSE:
- Professionnel mais accessible
- Données chiffrées quand pertinent
- Recommandations actionables
- Focus ROI et croissance business
- Expertise HSE/sécurité quand applicable

Répondez en français, soyez précis et orienté solutions.
  `,
  model: "gpt-4-turbo-preview",
  tools: [
    {
      type: "function",
      function: {
        name: "get_financial_metrics",
        description: "Récupérer les métriques financières en temps réel (MRR, ARR, croissance, churn)",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function", 
      function: {
        name: "get_customer_data",
        description: "Récupérer données clients et abonnements",
        parameters: {
          type: "object",
          properties: {
            filter: {
              type: "string",
              description: "Filtre optionnel: 'active', 'churn_risk', 'new', 'all'"
            }
          },
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_marketing_analytics", 
        description: "Récupérer données prospects, campaigns marketing, et performance",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_business_forecast",
        description: "Générer prévisions business basées sur données historiques",
        parameters: {
          type: "object", 
          properties: {
            period: {
              type: "string",
              description: "Période de prévision: '3m', '6m', '1y'"
            },
            metrics: {
              type: "array",
              items: { type: "string" },
              description: "Métriques à prévoir: 'revenue', 'customers', 'churn'"
            }
          },
          required: ["period"]
        }
      }
    }
  ]
};

// Fonction pour vérifier l'authentification admin
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.email === 'eric.dufort@cerdia.ai' && decoded.role === 'super_admin') {
      return decoded;
    }
  } catch (error) {
    console.error('Erreur décodage token:', error);
  }
  
  return null;
}

// Functions pour l'Assistant
async function getFinancialMetrics() {
  try {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;

    // Calculer métriques
    const mrr = tenants.reduce((sum, t) => sum + (t.monthly_amount || 250), 0);
    const arr = mrr * 12;
    const activeCount = tenants.length;
    
    return {
      mrr,
      arr,
      active_customers: activeCount,
      growth_rate: 18.5, // À calculer avec historique
      calculated_at: new Date().toISOString()
    };
  } catch (error) {
    return { error: 'Erreur récupération métriques financières' };
  }
}

async function getCustomerData(filter = 'all') {
  try {
    let query = supabase.from('tenants').select('*');
    
    if (filter === 'active') {
      query = query.eq('status', 'active');
    } else if (filter === 'new') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      query = query.gte('created_at', lastMonth.toISOString());
    }

    const { data: customers, error } = await query;
    if (error) throw error;

    return {
      customers,
      total: customers.length,
      filter_applied: filter,
      retrieved_at: new Date().toISOString()
    };
  } catch (error) {
    return { error: 'Erreur récupération données clients' };
  }
}

async function getMarketingAnalytics() {
  // Mock data pour démonstration
  return {
    leads_this_month: 342,
    conversion_rate: 13.7,
    cost_per_lead: 28.50,
    roi: 285,
    top_sources: [
      { source: 'LinkedIn', leads: 127, conversions: 19 },
      { source: 'Email', leads: 89, conversions: 12 },
      { source: 'Web Scraping', leads: 76, conversions: 8 }
    ],
    calculated_at: new Date().toISOString()
  };
}

async function createBusinessForecast(period: string, metrics = ['revenue']) {
  // Logique de prédiction basique (à améliorer avec ML)
  const financialData = await getFinancialMetrics();
  const currentMRR = financialData.mrr || 0;
  const growthRate = 0.15; // 15% croissance mensuelle
  
  const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
  const forecast = [];
  
  for (let i = 1; i <= months; i++) {
    const projectedMRR = currentMRR * Math.pow(1 + growthRate, i);
    forecast.push({
      month: i,
      revenue: projectedMRR,
      customers: Math.round(projectedMRR / 250), // Assuming $250 ARPU
      confidence: Math.max(0.9 - (i * 0.1), 0.5) // Diminue avec le temps
    });
  }

  return {
    period,
    forecast,
    assumptions: {
      monthly_growth_rate: growthRate,
      average_arpu: 250,
      base_mrr: currentMRR
    },
    generated_at: new Date().toISOString()
  };
}

// Gestionnaire des fonctions de l'Assistant
async function handleFunctionCall(functionName: string, parameters: any) {
  switch (functionName) {
    case 'get_financial_metrics':
      return await getFinancialMetrics();
    
    case 'get_customer_data':
      return await getCustomerData(parameters.filter);
    
    case 'get_marketing_analytics':
      return await getMarketingAnalytics();
    
    case 'create_business_forecast':
      return await createBusinessForecast(parameters.period, parameters.metrics);
    
    default:
      return { error: `Fonction inconnue: ${functionName}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé - Admin requis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversation_id } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Créer ou récupérer un assistant
    let assistant;
    try {
      // Tenter de récupérer un assistant existant
      const assistants = await openai.beta.assistants.list({ limit: 1 });
      const existingAssistant = assistants.data.find(a => a.name === ASSISTANT_CONFIG.name);
      
      if (existingAssistant) {
        assistant = existingAssistant;
      } else {
        // Créer un nouvel assistant
        assistant = await openai.beta.assistants.create(ASSISTANT_CONFIG);
      }
    } catch (error) {
      console.error('Erreur gestion assistant:', error);
      return NextResponse.json(
        { error: 'Erreur configuration assistant IA' },
        { status: 500 }
      );
    }

    // Créer ou récupérer un thread de conversation
    let thread;
    if (conversation_id) {
      try {
        thread = await openai.beta.threads.retrieve(conversation_id);
      } catch (error) {
        // Si le thread n'existe pas, en créer un nouveau
        thread = await openai.beta.threads.create();
      }
    } else {
      thread = await openai.beta.threads.create();
    }

    // Ajouter le message utilisateur au thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    // Créer et exécuter le run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id
    });

    // Attendre la completion du run avec gestion des function calls
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'requires_action') {
      if (runStatus.status === 'requires_action' && runStatus.required_action) {
        // Gérer les appels de fonction
        const toolOutputs = [];
        
        for (const toolCall of runStatus.required_action.submit_tool_outputs.tool_calls) {
          const functionName = toolCall.function.name;
          const parameters = JSON.parse(toolCall.function.arguments);
          
          const result = await handleFunctionCall(functionName, parameters);
          
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result)
          });
        }
        
        // Soumettre les résultats des fonctions
        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: toolOutputs
        });
      }
      
      // Attendre avant de vérifier à nouveau
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      // Récupérer les messages du thread
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];
      
      if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
        return NextResponse.json({
          response: lastMessage.content[0].text.value,
          conversation_id: thread.id,
          assistant_id: assistant.id,
          timestamp: new Date().toISOString(),
          usage_stats: {
            tokens_used: run.usage?.total_tokens || 0,
            model: assistant.model
          }
        });
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Erreur OpenAI Assistant:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur Assistant IA',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Endpoint pour lister les conversations
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les assistants disponibles
    const assistants = await openai.beta.assistants.list({ limit: 10 });
    
    return NextResponse.json({
      assistants: assistants.data.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        model: a.model,
        created_at: a.created_at
      })),
      available_functions: ASSISTANT_CONFIG.tools.map(t => t.function.name),
      status: 'operational'
    });

  } catch (error) {
    console.error('Erreur GET Assistant:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}