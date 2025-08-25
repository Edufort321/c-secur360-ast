import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

// Interface pour les prompts IA structurés
interface AITaskRequest {
  name: string;
  description: string;
  duration: number; // heures
  startDate?: string;
  assignedUsers?: string[];
  assignedVehicles?: string[];
  safetyLevel: number;
  epiRequired: string[];
  certificationRequired: string[];
  minTeamSize: number;
  maxTeamSize?: number;
  plannedCost?: number;
}

interface AIResponse {
  response: string;
  actions?: Array<{
    type: 'create_tasks' | 'reschedule' | 'assign_resource' | 'create_ast' | 'optimize' | 'safety_alert';
    data: any;
  }>;
  confidence: number;
  suggestions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requirePermission('projects.manage', 'global');
    
    const { 
      prompt, 
      projectId, 
      tasks = [], 
      resources = [], 
      context = 'general' 
    } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
    }

    const supabase = createClient();

    // Analyser le prompt avec l'IA
    const aiResponse = await processAIPrompt(prompt, {
      projectId,
      tasks,
      resources,
      context,
      userId: authContext.user.id
    });

    // Log pour audit IA
    await supabase
      .from('gantt_planning_events')
      .insert({
        project_id: projectId,
        user_id: authContext.user.id,
        event_type: 'AI_PROMPT',
        event_data: {
          prompt: prompt.substring(0, 500), // Limiter pour storage
          response_type: aiResponse.actions?.map(a => a.type) || [],
          confidence: aiResponse.confidence,
          context
        }
      });

    console.log(`🤖 IA Gantt prompt traité: "${prompt.substring(0, 50)}..." par ${authContext.user.email}`);

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      actions: aiResponse.actions,
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur IA Assistant:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement IA',
        response: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre demande plus simplement ?"
      },
      { status: 500 }
    );
  }
}

// Processeur principal IA
async function processAIPrompt(
  prompt: string, 
  context: {
    projectId?: string;
    tasks: any[];
    resources: any[];
    context: string;
    userId: string;
  }
): Promise<AIResponse> {
  
  const lowerPrompt = prompt.toLowerCase();
  
  // === DÉTECTION D'INTENTIONS ===
  
  // 1. Création de tâches
  if (containsKeywords(lowerPrompt, ['créer', 'ajouter', 'nouvelle', 'tâche', 'besoin', 'planifier'])) {
    return await handleTaskCreation(prompt, context);
  }
  
  // 2. Replanification
  if (containsKeywords(lowerPrompt, ['replanifier', 'décaler', 'reporter', 'avancer', 'retard'])) {
    return await handleRescheduling(prompt, context);
  }
  
  // 3. Assignation ressources
  if (containsKeywords(lowerPrompt, ['assigner', 'affecter', 'attribuer', 'équipe', 'technicien', 'véhicule'])) {
    return await handleResourceAssignment(prompt, context);
  }
  
  // 4. Sécurité/SST
  if (containsKeywords(lowerPrompt, ['sécurité', 'ast', 'epi', 'permis', 'risque', 'danger'])) {
    return await handleSafetyConsultation(prompt, context);
  }
  
  // 5. Analyse performance
  if (containsKeywords(lowerPrompt, ['analyse', 'performance', 'retard', 'budget', 'coût', 'délai'])) {
    return await handlePerformanceAnalysis(prompt, context);
  }
  
  // 6. Optimisation
  if (containsKeywords(lowerPrompt, ['optimiser', 'améliorer', 'efficace', 'redistribuer'])) {
    return await handleOptimization(prompt, context);
  }
  
  // Réponse générale
  return {
    response: "Je peux vous aider avec :\n\n• **Créer des tâches** : \"Créer une tâche de maintenance 4h avec 2 techniciens\"\n• **Replanifier** : \"Décaler la tâche X de 2 jours\"\n• **Assigner ressources** : \"Affecter Jean et le véhicule V1 à cette tâche\"\n• **Vérifier sécurité** : \"Quels EPI pour cette intervention ?\"\n• **Analyser performance** : \"Quel est le retard du projet ?\"\n• **Optimiser** : \"Redistribuer les ressources sous-utilisées\"\n\nQue souhaitez-vous faire exactement ?",
    confidence: 0.9,
    suggestions: [
      "Créer une nouvelle tâche avec ressources",
      "Analyser les retards du projet",
      "Vérifier les exigences de sécurité"
    ]
  };
}

// === HANDLERS SPÉCIALISÉS ===

async function handleTaskCreation(prompt: string, context: any): Promise<AIResponse> {
  // Extraction d'informations avec regex et heuristiques
  const taskInfo = extractTaskInfo(prompt);
  const suggestedResources = await suggestResources(taskInfo, context.resources);
  
  if (!taskInfo.name) {
    return {
      response: "🤔 Je ne parviens pas à identifier le nom de la tâche. Pouvez-vous reformuler ?\n\nExemple : \"Créer une tâche de maintenance préventive de 6h avec 2 électriciens certifiés\"",
      confidence: 0.3,
      suggestions: [
        "Maintenance préventive équipement X (6h)",
        "Installation nouveau système (12h)", 
        "Inspection sécurité site Y (3h)"
      ]
    };
  }

  const newTask: AITaskRequest = {
    name: taskInfo.name,
    description: taskInfo.description || `Tâche générée par IA : ${taskInfo.name}`,
    duration: taskInfo.duration || 8,
    startDate: taskInfo.startDate || getNextAvailableDate(context.tasks),
    assignedUsers: suggestedResources.users,
    assignedVehicles: suggestedResources.vehicles,
    safetyLevel: calculateSafetyLevel(taskInfo.name, taskInfo.description),
    epiRequired: suggestRequiredEPI(taskInfo.name, taskInfo.description),
    certificationRequired: suggestRequiredCertifications(taskInfo.name),
    minTeamSize: taskInfo.minTeamSize || 1,
    maxTeamSize: taskInfo.maxTeamSize,
    plannedCost: taskInfo.duration * 75 // 75$/h moyenne
  };

  return {
    response: `✅ **Tâche créée avec IA :**\n\n📋 **${newTask.name}**\n⏱️ Durée : ${newTask.duration}h\n👥 Équipe suggérée : ${suggestedResources.users.length} personne(s)\n🛡️ Niveau sécurité : ${newTask.safetyLevel}/5\n🦺 EPI requis : ${newTask.epiRequired.join(', ') || 'Standard'}\n💰 Coût estimé : ${newTask.plannedCost}$\n\n${suggestedResources.warnings.length > 0 ? `⚠️ **Alertes :**\n${suggestedResources.warnings.join('\n')}` : ''}`,
    actions: [{
      type: 'create_tasks',
      data: { tasks: [newTask] }
    }],
    confidence: 0.85,
    suggestions: [
      "Ajuster la durée estimée",
      "Modifier l'équipe assignée", 
      "Vérifier les EPI requis"
    ]
  };
}

async function handleResourceAssignment(prompt: string, context: any): Promise<AIResponse> {
  const assignment = extractAssignmentInfo(prompt, context.resources);
  
  if (!assignment.taskId && !assignment.taskName) {
    return {
      response: "🎯 **Assignation de ressources**\n\nJe peux assigner des ressources, mais j'ai besoin de plus de précisions :\n\n• Quelle tâche voulez-vous modifier ?\n• Quelles ressources assigner ?\n\nExemple : \"Assigner Jean Dupont et le camion C1 à la tâche de maintenance\"",
      confidence: 0.4,
      suggestions: [
        "Voir les ressources disponibles",
        "Lister les tâches en attente",
        "Optimiser toutes les assignations"
      ]
    };
  }

  const availableResources = context.resources.filter((r: any) => r.isAvailable);
  const matchingResources = assignment.resourceNames
    .map((name: string) => findResourceByName(name, availableResources))
    .filter(Boolean);

  return {
    response: `✅ **Assignation planifiée :**\n\n📋 Tâche : ${assignment.taskName || assignment.taskId}\n👥 Ressources : ${matchingResources.map((r: any) => r.name).join(', ')}\n\n${matchingResources.length !== assignment.resourceNames.length ? '⚠️ Certaines ressources n\'ont pas été trouvées ou ne sont pas disponibles.' : ''}`,
    actions: [{
      type: 'assign_resource',
      data: {
        taskId: assignment.taskId,
        resources: matchingResources.map((r: any) => r.id)
      }
    }],
    confidence: matchingResources.length > 0 ? 0.8 : 0.3,
    suggestions: [
      "Voir les ressources disponibles",
      "Vérifier les conflits d'horaires",
      "Suggérer des alternatives"
    ]
  };
}

async function handleSafetyConsultation(prompt: string, context: any): Promise<AIResponse> {
  const safetyInfo = extractSafetyInfo(prompt);
  const highRiskTasks = context.tasks.filter((t: any) => t.safetyLevel >= 4);
  const missingAST = context.tasks.filter((t: any) => t.safetyLevel >= 3 && !t.astFormId);
  
  let response = "🛡️ **Consultation Sécurité**\n\n";
  
  if (safetyInfo.taskSpecific) {
    const requiredEPI = suggestRequiredEPI(safetyInfo.taskName || '', safetyInfo.description || '');
    const certifications = suggestRequiredCertifications(safetyInfo.taskName || '');
    
    response += `**Pour cette tâche :**\n🦺 EPI requis : ${requiredEPI.join(', ')}\n📋 Certifications : ${certifications.join(', ')}\n\n`;
  }
  
  if (highRiskTasks.length > 0) {
    response += `⚠️ **Tâches à risque élevé** (${highRiskTasks.length}) :\n${highRiskTasks.slice(0, 3).map((t: any) => `• ${t.name} - Niveau ${t.safetyLevel}`).join('\n')}\n\n`;
  }
  
  if (missingAST.length > 0) {
    response += `📋 **AST manquantes** (${missingAST.length}) :\n${missingAST.slice(0, 3).map((t: any) => `• ${t.name}`).join('\n')}\n\n`;
  }
  
  const actions = [];
  if (missingAST.length > 0) {
    actions.push({
      type: 'create_ast',
      data: { taskIds: missingAST.map((t: any) => t.id) }
    });
  }
  
  return {
    response: response + "Voulez-vous que je génère automatiquement les AST manquantes ?",
    actions,
    confidence: 0.9,
    suggestions: [
      "Générer toutes les AST manquantes",
      "Vérifier les EPI par tâche",
      "Analyser les risques du projet"
    ]
  };
}

async function handlePerformanceAnalysis(prompt: string, context: any): Promise<AIResponse> {
  const completedTasks = context.tasks.filter((t: any) => t.status === 'completed');
  const delayedTasks = context.tasks.filter((t: any) => t.status === 'delayed');
  
  const totalPlanned = context.tasks.reduce((sum: number, t: any) => sum + (t.plannedCost || 0), 0);
  const totalActual = context.tasks.reduce((sum: number, t: any) => sum + (t.actualCost || 0), 0);
  const avgProgress = context.tasks.reduce((sum: number, t: any) => sum + (t.progress || 0), 0) / context.tasks.length;
  
  const cpi = totalActual > 0 ? (completedTasks.reduce((sum: number, t: any) => sum + (t.plannedCost || 0), 0) / totalActual) : 1;
  const spi = avgProgress / 100; // Simplification
  
  return {
    response: `📊 **Analyse de Performance**\n\n**Avancement :**\n• Progression moyenne : ${Math.round(avgProgress)}%\n• Tâches terminées : ${completedTasks.length}/${context.tasks.length}\n• Tâches en retard : ${delayedTasks.length}\n\n**Coûts :**\n• Budget planifié : ${totalPlanned.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}\n• Coût réel : ${totalActual.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}\n• CPI : ${cpi.toFixed(2)} ${cpi >= 1 ? '✅' : '⚠️'}\n• SPI : ${spi.toFixed(2)} ${spi >= 1 ? '✅' : '⚠️'}\n\n${cpi < 0.9 ? '💡 **Recommandation :** Réviser les coûts et optimiser les ressources' : ''}${spi < 0.9 ? '\n⏱️ **Recommandation :** Accélérer le rythme ou replanifier' : ''}`,
    confidence: 0.95,
    suggestions: [
      "Voir les tâches en retard",
      "Analyser les dépassements de budget",
      "Optimiser la planification"
    ]
  };
}

async function handleOptimization(prompt: string, context: any): Promise<AIResponse> {
  const underutilizedResources = context.resources.filter((r: any) => r.utilizationRate < 70);
  const overallocatedTasks = context.tasks.filter((t: any) => t.assignedUsers.length > t.maxTeamSize);
  
  return {
    response: `⚡ **Optimisation Suggérée**\n\n**Ressources sous-utilisées** (${underutilizedResources.length}) :\n${underutilizedResources.slice(0, 3).map((r: any) => `• ${r.name} - ${r.utilizationRate}% utilisé`).join('\n')}\n\n${overallocatedTasks.length > 0 ? `**Tâches sur-affectées** (${overallocatedTasks.length}) :\n${overallocatedTasks.map((t: any) => `• ${t.name}`).join('\n')}\n\n` : ''}**Actions suggérées :**\n• Redistribuer les ressources libres\n• Équilibrer les charges de travail\n• Identifier les goulots d'étranglement`,
    actions: [{
      type: 'optimize',
      data: { 
        redistributeResources: true,
        balanceWorkload: true
      }
    }],
    confidence: 0.8,
    suggestions: [
      "Appliquer l'optimisation automatique",
      "Voir le planning détaillé",
      "Analyser les conflits"
    ]
  };
}

async function handleRescheduling(prompt: string, context: any): Promise<AIResponse> {
  return {
    response: "🔄 **Replanification**\n\nJe peux vous aider à replanifier, mais j'ai besoin de plus de détails :\n\n• Quelle tâche replanifier ?\n• Nouvelle date souhaitée ?\n• Raison du changement ?\n\nExemple : \"Reporter la maintenance du 15 au 18 mars à cause de la météo\"",
    confidence: 0.6,
    suggestions: [
      "Voir les tâches à venir",
      "Détecter les conflits automatiquement",
      "Replanifier tout le projet"
    ]
  };
}

// === FONCTIONS UTILITAIRES ===

function containsKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

function extractTaskInfo(prompt: string): Partial<AITaskRequest> {
  const info: Partial<AITaskRequest> = {};
  
  // Extraction du nom de tâche (heuristique simple)
  const taskMatches = prompt.match(/(créer|ajouter|nouvelle|planifier)\s+(une\s+)?(tâche\s+)?(de\s+)?([^,\.]+)/i);
  if (taskMatches) {
    info.name = taskMatches[5].trim();
  }
  
  // Extraction durée
  const durationMatches = prompt.match(/(\d+)\s*(heure|h|jour|j)/i);
  if (durationMatches) {
    const value = parseInt(durationMatches[1]);
    const unit = durationMatches[2].toLowerCase();
    info.duration = unit.startsWith('j') ? value * 8 : value; // Convertir jours en heures
  }
  
  // Extraction équipe
  const teamMatches = prompt.match(/(\d+)\s*(personne|tech|électricien|mécanicien|ouvrier)/i);
  if (teamMatches) {
    info.minTeamSize = parseInt(teamMatches[1]);
  }
  
  return info;
}

function extractAssignmentInfo(prompt: string, resources: any[]): any {
  return {
    taskId: null,
    taskName: null,
    resourceNames: []
  };
}

function extractSafetyInfo(prompt: string): any {
  return {
    taskSpecific: false,
    taskName: null,
    description: null
  };
}

async function suggestResources(taskInfo: Partial<AITaskRequest>, resources: any[]): Promise<{
  users: string[];
  vehicles: string[];
  warnings: string[];
}> {
  const availableUsers = resources.filter(r => r.type === 'person' && r.isAvailable);
  const availableVehicles = resources.filter(r => r.type === 'vehicle' && r.isAvailable);
  
  return {
    users: availableUsers.slice(0, taskInfo.minTeamSize || 1).map(u => u.id),
    vehicles: taskInfo.duration && taskInfo.duration > 4 ? [availableVehicles[0]?.id].filter(Boolean) : [],
    warnings: availableUsers.length < (taskInfo.minTeamSize || 1) 
      ? ['Pas assez de ressources disponibles'] 
      : []
  };
}

function calculateSafetyLevel(taskName: string, description: string = ''): number {
  const text = (taskName + ' ' + description).toLowerCase();
  
  if (containsKeywords(text, ['électrique', 'haute tension', 'soudure', 'hauteur', 'espace confiné'])) {
    return 5; // Critique
  }
  if (containsKeywords(text, ['maintenance', 'réparation', 'installation', 'mécanique'])) {
    return 3; // Élevé
  }
  if (containsKeywords(text, ['inspection', 'nettoyage', 'documentation'])) {
    return 2; // Modéré
  }
  
  return 2; // Par défaut
}

function suggestRequiredEPI(taskName: string, description: string = ''): string[] {
  const text = (taskName + ' ' + description).toLowerCase();
  const epi = ['Casque', 'Lunettes'];
  
  if (containsKeywords(text, ['soudure', 'meulage'])) {
    epi.push('Masque soudeur', 'Gants cuir');
  }
  if (containsKeywords(text, ['hauteur', 'échafaud', 'toit'])) {
    epi.push('Harnais', 'Longe');
  }
  if (containsKeywords(text, ['chimique', 'peinture', 'solvant'])) {
    epi.push('Masque respiratoire', 'Gants nitrile');
  }
  if (containsKeywords(text, ['bruit', 'perceuse', 'marteau'])) {
    epi.push('Bouchons oreilles');
  }
  
  return epi;
}

function suggestRequiredCertifications(taskName: string): string[] {
  const text = taskName.toLowerCase();
  const certs = [];
  
  if (containsKeywords(text, ['électrique', 'électricien'])) {
    certs.push('Électricien certifié');
  }
  if (containsKeywords(text, ['soudure', 'soudeur'])) {
    certs.push('Soudeur certifié');
  }
  if (containsKeywords(text, ['hauteur', 'nacelle'])) {
    certs.push('Travail en hauteur');
  }
  if (containsKeywords(text, ['conduite', 'véhicule', 'camion'])) {
    certs.push('Permis classe 3');
  }
  
  return certs;
}

function findResourceByName(name: string, resources: any[]): any {
  return resources.find(r => 
    r.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(r.name.toLowerCase())
  );
}

function getNextAvailableDate(tasks: any[]): string {
  const today = new Date();
  today.setHours(8, 0, 0, 0); // 8h00 par défaut
  return today.toISOString();
}