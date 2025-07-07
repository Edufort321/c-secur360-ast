// app/utils/compliance.ts - Utilitaires de conformité réglementaire

import { RegulatoryStandard } from '@/types';
import { AST, ASTStatus } from '@/types/ast';

// =================== INTERFACES CONFORMITÉ ===================
export interface ComplianceCheck {
  standard: RegulatoryStandard;
  isCompliant: boolean;
  score: number; // 0-100
  requiredActions: ComplianceAction[];
  warnings: ComplianceWarning[];
  lastChecked: Date;
  expiryDate?: Date;
}

export interface ComplianceAction {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  responsible?: string;
  completed: boolean;
  evidence?: string[];
}

export interface ComplianceWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  recommendation?: string;
}

export interface ComplianceReport {
  tenantId: string; // ID du client
  overallScore: number;
  complianceByStandard: Record<RegulatoryStandard, ComplianceCheck>;
  criticalActions: ComplianceAction[];
  upcomingDeadlines: ComplianceAction[];
  generatedAt: Date;
  nextReviewDate: Date;
}

// =================== STANDARDS RÉGLEMENTAIRES PAR RÉGION ===================
export const REGULATORY_STANDARDS_BY_REGION = {
  QUEBEC: {
    primary: [
      RegulatoryStandard.RSST_ARTICLE_2_9_1,
      RegulatoryStandard.RSST_ARTICLE_2_10,
      RegulatoryStandard.RSST_ARTICLE_2_11,
      RegulatoryStandard.SIMDUT_2015
    ],
    secondary: [
      RegulatoryStandard.CSA_Z462,
      RegulatoryStandard.CSA_Z94_3,
      RegulatoryStandard.CSA_Z259,
      RegulatoryStandard.CSA_Z96
    ]
  },
  CANADA: {
    primary: [
      RegulatoryStandard.CSA_Z462,
      RegulatoryStandard.CSA_Z94_3,
      RegulatoryStandard.CSA_Z259,
      RegulatoryStandard.CSA_Z96,
      RegulatoryStandard.SIMDUT_2015
    ],
    secondary: [
      RegulatoryStandard.ISO_45001,
      RegulatoryStandard.ISO_14001
    ]
  },
  USA: {
    primary: [
      RegulatoryStandard.OSHA_1910_146,
      RegulatoryStandard.OSHA_1926_501,
      RegulatoryStandard.ANSI_Z87_1,
      RegulatoryStandard.ANSI_Z89_1
    ],
    secondary: [
      RegulatoryStandard.ISO_45001
    ]
  }
} as const;

// =================== FONCTIONS PRINCIPALES ===================

/**
 * Vérifie la conformité d'un AST selon les standards applicables
 */
export function checkASTCompliance(
  ast: AST, 
  tenantRegion: keyof typeof REGULATORY_STANDARDS_BY_REGION = 'QUEBEC'
): ComplianceReport {
  const applicableStandards = [
    ...REGULATORY_STANDARDS_BY_REGION[tenantRegion].primary,
    ...REGULATORY_STANDARDS_BY_REGION[tenantRegion].secondary
  ];

  const complianceByStandard: Record<RegulatoryStandard, ComplianceCheck> = {} as any;
  let totalScore = 0;
  const criticalActions: ComplianceAction[] = [];

  for (const standard of applicableStandards) {
    const check = checkStandardCompliance(ast, standard);
    complianceByStandard[standard] = check;
    totalScore += check.score;

    // Collecter les actions critiques
    criticalActions.push(
      ...check.requiredActions.filter(action => 
        action.priority === 'critical' && !action.completed
      )
    );
  }

  const overallScore = totalScore / applicableStandards.length;

  return {
    tenantId: (ast as any).clientId || ast.id, // Dans votre SaaS, le clientId = tenantId
    overallScore: Math.round(overallScore),
    complianceByStandard,
    criticalActions,
    upcomingDeadlines: getUpcomingDeadlines(complianceByStandard),
    generatedAt: new Date(),
    nextReviewDate: calculateNextReviewDate(overallScore)
  };
}

/**
 * Vérifie la conformité pour un standard spécifique
 */
export function checkStandardCompliance(
  ast: AST, 
  standard: RegulatoryStandard
): ComplianceCheck {
  switch (standard) {
    case RegulatoryStandard.RSST_ARTICLE_2_9_1:
      return checkConfinedSpaceCompliance(ast);
    
    case RegulatoryStandard.RSST_ARTICLE_2_10:
      return checkWorkAtHeightCompliance(ast);
    
    case RegulatoryStandard.CSA_Z462:
      return checkElectricalSafetyCompliance(ast);
    
    case RegulatoryStandard.CSA_Z259:
      return checkFallProtectionCompliance(ast);
    
    case RegulatoryStandard.SIMDUT_2015:
      return checkHazardousChemicalsCompliance(ast);
    
    default:
      return createDefaultComplianceCheck(standard);
  }
}

/**
 * Conformité RSST Article 2.9.1 - Espaces clos
 */
function checkConfinedSpaceCompliance(ast: AST): ComplianceCheck {
  const actions: ComplianceAction[] = [];
  const warnings: ComplianceWarning[] = [];
  let score = 100;

  // Vérifier si des dangers d'espaces clos sont identifiés
  const identifiedHazards = (ast as any).identifiedHazards || [];
  const confinedSpaceHazards = identifiedHazards.filter((h: any) => 
    h.hazardId?.includes('confined_space') || h.id?.includes('confined_space')
  );

  if (confinedSpaceHazards.length > 0) {
    // Vérifier permis d'entrée
    const permits = (ast as any).permits || [];
    const hasConfinedSpacePermit = permits.some((p: any) => 
      p.permitType === 'confined_space' && 
      p.status === 'issued'
    );

    if (!hasConfinedSpacePermit) {
      score -= 30;
      actions.push({
        id: 'confined-space-permit',
        description: 'Obtenir un permis d\'entrée en espace clos selon RSST 2.9.1',
        priority: 'critical',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        completed: false
      });
    }

    // Vérifier équipements requis
    const requiredEquipment = ['gas_detector', 'breathing_apparatus', 'rescue_harness'];
    const astEquipment = (ast as any).requiredEquipment || [];
    const missingEquipment = requiredEquipment.filter(eq => 
      !astEquipment.some((req: any) => req.equipmentId?.includes(eq) || req.id?.includes(eq))
    );

    if (missingEquipment.length > 0) {
      score -= 20 * missingEquipment.length;
      actions.push({
        id: 'confined-space-equipment',
        description: `Équipements manquants pour espace clos: ${missingEquipment.join(', ')}`,
        priority: 'high',
        completed: false
      });
    }

    // Vérifier surveillance continue
    const controlMeasures = (ast as any).controlMeasures || [];
    const hasContinuousMonitoring = controlMeasures.some((cm: any) => 
      cm.controlMeasureId?.includes('continuous_monitoring') || cm.id?.includes('monitoring')
    );

    if (!hasContinuousMonitoring) {
      score -= 15;
      warnings.push({
        code: 'CS001',
        message: 'Surveillance continue recommandée pour travail en espace clos',
        severity: 'warning',
        recommendation: 'Assigner un surveillant formé à l\'extérieur de l\'espace'
      });
    }
  }

  return {
    standard: RegulatoryStandard.RSST_ARTICLE_2_9_1,
    isCompliant: score >= 80,
    score: Math.max(0, score),
    requiredActions: actions,
    warnings,
    lastChecked: new Date()
  };
}

/**
 * Conformité RSST Article 2.10 - Travail en hauteur
 */
function checkWorkAtHeightCompliance(ast: AST): ComplianceCheck {
  const actions: ComplianceAction[] = [];
  const warnings: ComplianceWarning[] = [];
  let score = 100;

  const identifiedHazards = (ast as any).identifiedHazards || [];
  const heightHazards = identifiedHazards.filter((h: any) => 
    h.hazardId?.includes('height') || h.hazardId?.includes('fall') ||
    h.id?.includes('height') || h.id?.includes('fall')
  );

  if (heightHazards.length > 0) {
    // Vérifier équipements antichute
    const astEquipment = (ast as any).requiredEquipment || [];
    const hasFallProtection = astEquipment.some((eq: any) => 
      eq.equipmentId?.includes('harness') || eq.equipmentId?.includes('lanyard') ||
      eq.id?.includes('harness') || eq.id?.includes('lanyard')
    );

    if (!hasFallProtection) {
      score -= 40;
      actions.push({
        id: 'fall-protection',
        description: 'Équipements de protection contre les chutes requis (RSST 2.10)',
        priority: 'critical',
        completed: false
      });
    }

    // Vérifier plan de sauvetage
    const emergencyProcedures = (ast as any).emergencyProcedures || [];
    const hasRescuePlan = emergencyProcedures.some((ep: any) => 
      ep.type === 'fall_from_height' || ep.type?.includes('fall') || ep.type?.includes('rescue')
    );

    if (!hasRescuePlan) {
      score -= 25;
      actions.push({
        id: 'rescue-plan',
        description: 'Plan de sauvetage requis pour travail en hauteur',
        priority: 'high',
        completed: false
      });
    }

    // Vérifier formation
    const teamMembers = (ast as any).teamMembers || ast.participants || [];
    const teamHasTraining = teamMembers.length === 0 || teamMembers.every((member: any) => 
      // Vérification formation (à implémenter selon votre système)
      member.qualifications?.length > 0 || true // Placeholder
    );

    if (!teamHasTraining) {
      score -= 20;
      warnings.push({
        code: 'WH001',
        message: 'Formation travail en hauteur requise pour tous les membres',
        severity: 'warning'
      });
    }
  }

  return {
    standard: RegulatoryStandard.RSST_ARTICLE_2_10,
    isCompliant: score >= 80,
    score: Math.max(0, score),
    requiredActions: actions,
    warnings,
    lastChecked: new Date()
  };
}

/**
 * Conformité CSA Z462 - Sécurité électrique
 */
function checkElectricalSafetyCompliance(ast: AST): ComplianceCheck {
  const actions: ComplianceAction[] = [];
  const warnings: ComplianceWarning[] = [];
  let score = 100;

  const identifiedHazards = (ast as any).identifiedHazards || [];
  const electricalHazards = identifiedHazards.filter((h: any) => 
    h.hazardId?.includes('electrical') || h.id?.includes('electrical')
  );

  if (electricalHazards.length > 0) {
    // Vérifier LOTO (Lockout/Tagout)
    const controlMeasures = (ast as any).controlMeasures || [];
    const hasLOTO = controlMeasures.some((cm: any) => 
      cm.controlMeasureId?.includes('lockout') || cm.controlMeasureId?.includes('tagout') ||
      cm.id?.includes('lockout') || cm.id?.includes('tagout')
    );

    if (!hasLOTO) {
      score -= 35;
      actions.push({
        id: 'loto-procedure',
        description: 'Procédures LOTO requises selon CSA Z462',
        priority: 'critical',
        completed: false
      });
    }

    // Vérifier EPI arc flash
    const astEquipment = (ast as any).requiredEquipment || [];
    const hasArcFlashPPE = astEquipment.some((eq: any) => 
      eq.equipmentId?.includes('arc_flash') || eq.id?.includes('arc_flash')
    );

    if (!hasArcFlashPPE) {
      score -= 30;
      actions.push({
        id: 'arc-flash-ppe',
        description: 'EPI protection arc flash requis',
        priority: 'critical',
        completed: false
      });
    }

    // Vérifier analyse des dangers électriques
    const permits = (ast as any).permits || [];
    const hasElectricalPermit = permits.some((p: any) => 
      p.permitType === 'electrical'
    );

    if (!hasElectricalPermit) {
      score -= 20;
      warnings.push({
        code: 'ES001',
        message: 'Permis de travail électrique recommandé',
        severity: 'warning'
      });
    }
  }

  return {
    standard: RegulatoryStandard.CSA_Z462,
    isCompliant: score >= 80,
    score: Math.max(0, score),
    requiredActions: actions,
    warnings,
    lastChecked: new Date()
  };
}

/**
 * Conformité CSA Z259 - Protection contre les chutes
 */
function checkFallProtectionCompliance(ast: AST): ComplianceCheck {
  // Implementation similaire aux autres standards
  return createDefaultComplianceCheck(RegulatoryStandard.CSA_Z259);
}

/**
 * Conformité SIMDUT 2015 - Matières dangereuses
 */
function checkHazardousChemicalsCompliance(ast: AST): ComplianceCheck {
  const actions: ComplianceAction[] = [];
  const warnings: ComplianceWarning[] = [];
  let score = 100;

  const identifiedHazards = (ast as any).identifiedHazards || [];
  const chemicalHazards = identifiedHazards.filter((h: any) => 
    h.hazardId?.includes('chemical') || h.hazardId?.includes('hazardous') ||
    h.id?.includes('chemical') || h.id?.includes('hazardous')
  );

  if (chemicalHazards.length > 0) {
    // Vérifier fiches de données de sécurité (FDS)
    const attachments = ast.attachments || [];
    const hasSDS = attachments.some((att: any) => 
      att.fileName?.toLowerCase().includes('fds') || 
      att.fileName?.toLowerCase().includes('sds') ||
      att.name?.toLowerCase().includes('fds') ||
      att.name?.toLowerCase().includes('sds')
    );

    if (!hasSDS) {
      score -= 30;
      actions.push({
        id: 'sds-required',
        description: 'Fiches de données de sécurité (FDS) requises selon SIMDUT 2015',
        priority: 'high',
        completed: false
      });
    }

    // Vérifier formation SIMDUT
    warnings.push({
      code: 'SI001',
      message: 'Formation SIMDUT 2015 requise pour manipulation de produits chimiques',
      severity: 'info',
      recommendation: 'Vérifier certificats de formation de l\'équipe'
    });
  }

  return {
    standard: RegulatoryStandard.SIMDUT_2015,
    isCompliant: score >= 80,
    score: Math.max(0, score),
    requiredActions: actions,
    warnings,
    lastChecked: new Date()
  };
}

/**
 * Crée une vérification par défaut pour les standards non encore implémentés
 */
function createDefaultComplianceCheck(standard: RegulatoryStandard): ComplianceCheck {
  return {
    standard,
    isCompliant: true,
    score: 85, // Score par défaut conservateur
    requiredActions: [],
    warnings: [{
      code: 'GEN001',
      message: `Vérification automatique non encore disponible pour ${standard}`,
      severity: 'info',
      recommendation: 'Effectuer une révision manuelle'
    }],
    lastChecked: new Date()
  };
}

/**
 * Récupère les échéances à venir
 */
function getUpcomingDeadlines(
  complianceByStandard: Record<RegulatoryStandard, ComplianceCheck>
): ComplianceAction[] {
  const allActions: ComplianceAction[] = [];
  
  Object.values(complianceByStandard).forEach(check => {
    allActions.push(...check.requiredActions);
  });

  return allActions
    .filter(action => action.deadline && !action.completed)
    .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()))
    .slice(0, 10); // Top 10 échéances
}

/**
 * Calcule la prochaine date de révision selon le score
 */
function calculateNextReviewDate(overallScore: number): Date {
  const daysToAdd = overallScore >= 90 ? 90 : // 3 mois si excellent
                   overallScore >= 80 ? 60 : // 2 mois si bon
                   overallScore >= 70 ? 30 : // 1 mois si acceptable
                   7; // 1 semaine si problématique

  return new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
}

// =================== FONCTIONS UTILITAIRES MULTI-TENANT ===================

/**
 * Obtient le rapport de conformité pour un tenant (client)
 */
export async function getTenantComplianceReport(
  tenantId: string,
  region: keyof typeof REGULATORY_STANDARDS_BY_REGION = 'QUEBEC'
): Promise<ComplianceReport> {
  // Dans votre implémentation, récupérer tous les AST du tenant
  // const tenantASTs = await getASTsByTenant(tenantId);
  
  // Pour l'exemple, on simule
  const mockAST: Partial<AST> = {
    id: tenantId,
    name: 'Mock AST',
    description: 'Mock AST for compliance check',
    status: 'DRAFT' as any,
    priority: 'MEDIUM' as any,
    participants: [],
    steps: [],
    validations: [],
    finalApproval: undefined,
    attachments: [],
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  return checkASTCompliance(mockAST as AST, region);
}

/**
 * Génère des recommandations personnalisées pour un tenant
 */
export function generateTenantRecommendations(
  complianceReport: ComplianceReport
): string[] {
  const recommendations: string[] = [];

  if (complianceReport.overallScore < 70) {
    recommendations.push(
      "🚨 Score de conformité critique. Révision immédiate nécessaire.",
      "📋 Prioriser les actions critiques avant tout nouveau projet.",
      "👥 Envisager une formation supplémentaire pour l'équipe."
    );
  } else if (complianceReport.overallScore < 85) {
    recommendations.push(
      "⚠️ Amélioration de la conformité recommandée.",
      "📝 Réviser les procédures existantes.",
      "🔍 Audit interne suggéré dans les 30 jours."
    );
  } else {
    recommendations.push(
      "✅ Excellente conformité maintenue.",
      "🔄 Maintenir les bonnes pratiques actuelles.",
      "📈 Envisager la certification ISO 45001."
    );
  }

  return recommendations;
}

export default {
  checkASTCompliance,
  checkStandardCompliance,
  getTenantComplianceReport,
  generateTenantRecommendations,
  REGULATORY_STANDARDS_BY_REGION
};
