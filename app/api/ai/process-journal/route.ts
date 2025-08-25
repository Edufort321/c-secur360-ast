import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

interface JournalProcessingRequest {
  description: string;
  hoursWorked: number;
  taskId: string;
  projectId: string;
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface AIJournalSummary {
  objectives: string[];
  accomplished: string[];
  issues: string[];
  safetyNotes: string[];
  materialsUsed: string[];
  timeBreakdown: Array<{
    activity: string;
    duration: number;
    category: string;
  }>;
  nextSteps: string[];
  tags: string[];
  structuredSummary: string;
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requirePermission('timesheets.create', 'global');
    
    const {
      description,
      hoursWorked,
      taskId,
      projectId,
      photos = [],
      location
    }: JournalProcessingRequest = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description requise' }, { status: 400 });
    }

    // Traiter le texte avec IA
    const aiSummary = await processJournalWithAI(description, {
      hoursWorked,
      taskId,
      projectId,
      photos,
      location
    });

    const confidence = calculateConfidence(description, aiSummary);

    // Log pour audit IA
    const supabase = createClient();
    await supabase
      .from('gantt_planning_events')
      .insert({
        project_id: projectId,
        task_id: taskId,
        user_id: authContext.user.id,
        event_type: 'AI_JOURNAL_PROCESSING',
        event_data: {
          description_length: description.length,
          hours_worked: hoursWorked,
          confidence,
          tags: aiSummary.tags,
          safety_notes_count: aiSummary.safetyNotes.length,
          issues_count: aiSummary.issues.length
        }
      });

    console.log(`📝 Journal traité par IA pour ${authContext.user.email}: ${description.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      summary: aiSummary,
      confidence,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur traitement journal IA:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors du traitement IA' },
      { status: 500 }
    );
  }
}

// Processeur IA principal pour les journaux
async function processJournalWithAI(
  description: string, 
  context: {
    hoursWorked: number;
    taskId: string;
    projectId: string;
    photos: string[];
    location?: any;
  }
): Promise<AIJournalSummary> {
  
  const text = description.toLowerCase();
  
  // === EXTRACTION D'INFORMATIONS ===
  
  // 1. Objectifs (ce qui était prévu)
  const objectives = extractObjectives(description);
  
  // 2. Réalisations (ce qui a été fait)
  const accomplished = extractAccomplishments(description);
  
  // 3. Problèmes rencontrés
  const issues = extractIssues(description);
  
  // 4. Observations de sécurité
  const safetyNotes = extractSafetyNotes(description);
  
  // 5. Matériaux/outils utilisés
  const materialsUsed = extractMaterials(description);
  
  // 6. Répartition du temps
  const timeBreakdown = extractTimeBreakdown(description, context.hoursWorked);
  
  // 7. Prochaines étapes
  const nextSteps = extractNextSteps(description);
  
  // 8. Tags automatiques
  const tags = generateTags(description, context);
  
  // 9. Résumé structuré
  const structuredSummary = generateStructuredSummary({
    objectives,
    accomplished,
    issues,
    safetyNotes,
    materialsUsed,
    timeBreakdown,
    nextSteps,
    hoursWorked: context.hoursWorked
  });

  return {
    objectives,
    accomplished,
    issues,
    safetyNotes,
    materialsUsed,
    timeBreakdown,
    nextSteps,
    tags,
    structuredSummary
  };
}

// === FONCTIONS D'EXTRACTION ===

function extractObjectives(text: string): string[] {
  const objectives = [];
  const lowerText = text.toLowerCase();
  
  // Mots-clés d'objectifs
  const objectiveKeywords = [
    'objectif', 'but', 'prévu', 'planifié', 'programmer', 'mission',
    'tâche', 'installer', 'réparer', 'maintenir', 'vérifier', 'inspecter'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    if (objectiveKeywords.some(keyword => lowerSentence.includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned && !objectives.includes(cleaned)) {
        objectives.push(cleaned);
      }
    }
  }
  
  // Heuristiques supplémentaires
  if (lowerText.includes('nous devions') || lowerText.includes('il fallait')) {
    const matches = text.match(/(?:nous devions|il fallait|nous avons prévu de)\s+([^.!?]+)/gi);
    if (matches) {
      matches.forEach(match => {
        const obj = match.replace(/^(nous devions|il fallait|nous avons prévu de)\s+/i, '').trim();
        if (obj && !objectives.includes(obj)) {
          objectives.push(obj);
        }
      });
    }
  }
  
  return objectives.slice(0, 5); // Limiter à 5 objectifs max
}

function extractAccomplishments(text: string): string[] {
  const accomplished = [];
  const lowerText = text.toLowerCase();
  
  // Mots-clés d'accomplissement
  const accomplishmentKeywords = [
    'terminé', 'fini', 'complété', 'installé', 'réparé', 'effectué',
    'réalisé', 'accompli', 'fait', 'achevé', 'monté', 'connecté'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    if (accomplishmentKeywords.some(keyword => lowerSentence.includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned && !accomplished.includes(cleaned)) {
        accomplished.push(cleaned);
      }
    }
  }
  
  // Verbes d'action au passé composé
  const pastTensePatterns = [
    /nous avons ([^.!?]+)/gi,
    /j'ai ([^.!?]+)/gi,
    /nous avons pu ([^.!?]+)/gi,
    /réussi à ([^.!?]+)/gi
  ];
  
  pastTensePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const accomplishment = match.trim();
        if (accomplishment && !accomplished.includes(accomplishment)) {
          accomplished.push(accomplishment);
        }
      });
    }
  });
  
  return accomplished.slice(0, 8);
}

function extractIssues(text: string): string[] {
  const issues = [];
  const lowerText = text.toLowerCase();
  
  // Mots-clés de problèmes
  const issueKeywords = [
    'problème', 'difficulté', 'blocage', 'panne', 'erreur', 'défaut',
    'impossible', 'bloqué', 'cassé', 'défaillant', 'retard', 'compliqué',
    'mais', 'cependant', 'malheureusement', 'échec'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    if (issueKeywords.some(keyword => lowerSentence.includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned && !issues.includes(cleaned)) {
        issues.push(cleaned);
      }
    }
  }
  
  // Expressions négatives
  const negativePatterns = [
    /n'a pas ([^.!?]+)/gi,
    /ne fonctionne pas ([^.!?]+)/gi,
    /impossible de ([^.!?]+)/gi,
    /problème avec ([^.!?]+)/gi
  ];
  
  negativePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const issue = match.trim();
        if (issue && !issues.includes(issue)) {
          issues.push(issue);
        }
      });
    }
  });
  
  return issues.slice(0, 5);
}

function extractSafetyNotes(text: string): string[] {
  const safetyNotes = [];
  const lowerText = text.toLowerCase();
  
  // Mots-clés de sécurité
  const safetyKeywords = [
    'sécurité', 'danger', 'risque', 'prudent', 'attention', 'epi', 'casque',
    'gants', 'lunettes', 'harnais', 'masque', 'chaussures', 'signalisation',
    'cadenassage', 'lockout', 'consignation', 'isolation'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    if (safetyKeywords.some(keyword => lowerSentence.includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned && !safetyNotes.includes(cleaned)) {
        safetyNotes.push(cleaned);
      }
    }
  }
  
  // Phrases avec "attention" ou "prudent"
  const safetyPatterns = [
    /attention ([^.!?]+)/gi,
    /prudent ([^.!?]+)/gi,
    /sécurité ([^.!?]+)/gi,
    /porté ([^.!?]+epi[^.!?]*)/gi
  ];
  
  safetyPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const note = match.trim();
        if (note && !safetyNotes.includes(note)) {
          safetyNotes.push(note);
        }
      });
    }
  });
  
  return safetyNotes.slice(0, 5);
}

function extractMaterials(text: string): string[] {
  const materials = [];
  const lowerText = text.toLowerCase();
  
  // Mots-clés matériaux
  const materialKeywords = [
    'vis', 'boulon', 'écrou', 'rondelle', 'joint', 'tube', 'tuyau',
    'câble', 'fil', 'conduit', 'raccord', 'coude', 'manchon',
    'huile', 'graisse', 'lubrifiant', 'produit', 'pièce', 'composant'
  ];
  
  // Patterns de quantité + matériau
  const materialPatterns = [
    /(\d+)\s*(vis|boulons?|écrous?|joints?|tubes?|tuyaux|câbles?|raccords?)/gi,
    /utilisé ([^.!?]*(?:vis|boulon|écrou|joint|tube|tuyau|câble|raccord)[^.!?]*)/gi,
    /avec ([^.!?]*(?:vis|boulon|écrou|joint|tube|tuyau|câble|raccord)[^.!?]*)/gi
  ];
  
  materialPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const material = match.trim();
        if (material && !materials.includes(material)) {
          materials.push(material);
        }
      });
    }
  });
  
  return materials.slice(0, 8);
}

function extractTimeBreakdown(text: string, totalHours: number): Array<{
  activity: string;
  duration: number;
  category: string;
}> {
  const breakdown = [];
  
  // Patterns de temps
  const timePatterns = [
    /(\d+)\s*(?:heures?|h)\s+(?:de|pour|à)\s+([^.!?]+)/gi,
    /pendant\s+(\d+)\s*(?:heures?|h)[^.!?]*([^.!?]+)/gi,
    /passé\s+(\d+)\s*(?:heures?|h)\s+(?:sur|à)\s+([^.!?]+)/gi
  ];
  
  let totalExtracted = 0;
  
  timePatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      const duration = parseFloat(match[1]);
      const activity = match[2].trim();
      
      if (duration > 0 && duration <= totalHours && activity) {
        const category = categorizeActivity(activity);
        breakdown.push({ activity, duration, category });
        totalExtracted += duration;
      }
    });
  });
  
  // Si pas assez de détail, créer des catégories génériques
  if (totalExtracted < totalHours * 0.5) {
    const remainingTime = totalHours - totalExtracted;
    
    if (text.toLowerCase().includes('maintenance') || text.toLowerCase().includes('réparation')) {
      breakdown.push({
        activity: 'Maintenance générale',
        duration: Math.round(remainingTime * 0.7 * 100) / 100,
        category: 'Maintenance'
      });
    }
    
    if (remainingTime > 1) {
      breakdown.push({
        activity: 'Préparation et nettoyage',
        duration: Math.round((remainingTime - (remainingTime * 0.7)) * 100) / 100,
        category: 'Préparation'
      });
    }
  }
  
  return breakdown.slice(0, 6);
}

function categorizeActivity(activity: string): string {
  const lowerActivity = activity.toLowerCase();
  
  if (lowerActivity.includes('maintenance') || lowerActivity.includes('réparat')) {
    return 'Maintenance';
  }
  if (lowerActivity.includes('install') || lowerActivity.includes('mont')) {
    return 'Installation';
  }
  if (lowerActivity.includes('inspect') || lowerActivity.includes('vérif')) {
    return 'Inspection';
  }
  if (lowerActivity.includes('nettoy') || lowerActivity.includes('prépar')) {
    return 'Préparation';
  }
  if (lowerActivity.includes('déplac') || lowerActivity.includes('transport')) {
    return 'Transport';
  }
  
  return 'Général';
}

function extractNextSteps(text: string): string[] {
  const nextSteps = [];
  
  const nextStepKeywords = [
    'demain', 'prochaine', 'suivante', 'prochain', 'après', 'ensuite',
    'il faudra', 'nous devons', 'prévoir', 'planifier', 'reste à'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    if (nextStepKeywords.some(keyword => lowerSentence.includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned && !nextSteps.includes(cleaned)) {
        nextSteps.push(cleaned);
      }
    }
  }
  
  return nextSteps.slice(0, 5);
}

function generateTags(text: string, context: any): string[] {
  const tags = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Tags basés sur le type de travail
  if (lowerText.includes('maintenance')) tags.add('maintenance');
  if (lowerText.includes('réparation')) tags.add('reparation');
  if (lowerText.includes('installation')) tags.add('installation');
  if (lowerText.includes('inspection')) tags.add('inspection');
  if (lowerText.includes('nettoyage')) tags.add('nettoyage');
  
  // Tags équipements
  if (lowerText.includes('électr')) tags.add('electrique');
  if (lowerText.includes('mécanique') || lowerText.includes('moteur')) tags.add('mecanique');
  if (lowerText.includes('hydraul')) tags.add('hydraulique');
  if (lowerText.includes('pneumat')) tags.add('pneumatique');
  
  // Tags sécurité
  if (lowerText.includes('epi') || lowerText.includes('casque')) tags.add('securite');
  if (lowerText.includes('danger') || lowerText.includes('risque')) tags.add('risque');
  
  // Tags durée
  if (context.hoursWorked >= 8) tags.add('journee-complete');
  if (context.hoursWorked >= 10) tags.add('heures-supplementaires');
  
  return Array.from(tags).slice(0, 10);
}

function generateStructuredSummary(data: {
  objectives: string[];
  accomplished: string[];
  issues: string[];
  safetyNotes: string[];
  materialsUsed: string[];
  timeBreakdown: any[];
  nextSteps: string[];
  hoursWorked: number;
}): string {
  let summary = `## Rapport de Terrain - ${data.hoursWorked}h\n\n`;
  
  if (data.objectives.length > 0) {
    summary += `### 🎯 Objectifs\n${data.objectives.map(obj => `• ${obj}`).join('\n')}\n\n`;
  }
  
  if (data.accomplished.length > 0) {
    summary += `### ✅ Travail Accompli\n${data.accomplished.map(acc => `• ${acc}`).join('\n')}\n\n`;
  }
  
  if (data.timeBreakdown.length > 0) {
    summary += `### ⏱️ Répartition du Temps\n`;
    data.timeBreakdown.forEach(time => {
      summary += `• **${time.activity}**: ${time.duration}h (${time.category})\n`;
    });
    summary += '\n';
  }
  
  if (data.materialsUsed.length > 0) {
    summary += `### 📦 Matériaux/Outils Utilisés\n${data.materialsUsed.map(mat => `• ${mat}`).join('\n')}\n\n`;
  }
  
  if (data.safetyNotes.length > 0) {
    summary += `### 🛡️ Observations Sécurité\n${data.safetyNotes.map(note => `• ${note}`).join('\n')}\n\n`;
  }
  
  if (data.issues.length > 0) {
    summary += `### ⚠️ Problèmes Rencontrés\n${data.issues.map(issue => `• ${issue}`).join('\n')}\n\n`;
  }
  
  if (data.nextSteps.length > 0) {
    summary += `### 👉 Prochaines Étapes\n${data.nextSteps.map(step => `• ${step}`).join('\n')}\n\n`;
  }
  
  return summary;
}

function calculateConfidence(originalText: string, aiSummary: AIJournalSummary): number {
  let confidence = 0.5; // Base
  
  // Plus de texte = plus de confiance
  if (originalText.length > 200) confidence += 0.1;
  if (originalText.length > 500) confidence += 0.1;
  
  // Éléments extraits
  if (aiSummary.accomplished.length > 0) confidence += 0.1;
  if (aiSummary.timeBreakdown.length > 0) confidence += 0.1;
  if (aiSummary.materialsUsed.length > 0) confidence += 0.05;
  if (aiSummary.safetyNotes.length > 0) confidence += 0.1;
  
  // Structuration
  if (aiSummary.objectives.length > 0 && aiSummary.accomplished.length > 0) confidence += 0.1;
  
  return Math.min(0.95, Math.max(0.3, confidence));
}