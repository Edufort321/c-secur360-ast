import { supabase } from '@/lib/supabase';
import { ASTData, ASTStatistics } from './types';

export interface SupabaseASTPayload {
  ast_number: string;
  tenant: string;
  language: 'fr' | 'en';
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  project_info: any;
  equipment: any;
  hazards: any;
  permits: any;
  validation: any;
  finalization: any;
  statistics: any;
}

export const upsertCompleteAST = async (
  astData: ASTData,
  stats: ASTStatistics
): Promise<void> => {
  const supabaseData: SupabaseASTPayload = {
    ast_number: astData.astNumber,
    tenant: astData.tenant,
    language: astData.language,
    created_at: astData.createdAt,
    updated_at: new Date().toISOString(),
    status: astData.status,
    project_info: {
      client: astData.projectInfo.client,
      project_number: astData.projectInfo.projectNumber,
      work_location: astData.projectInfo.workLocation,
      date: astData.projectInfo.date,
      time: astData.projectInfo.time,
      industry: astData.projectInfo.industry,
      worker_count: astData.projectInfo.workerCount,
      estimated_duration: astData.projectInfo.estimatedDuration,
      work_description: astData.projectInfo.workDescription,
      client_contact: astData.projectInfo.clientContact,
      emergency_contact: astData.projectInfo.emergencyContact,
      lockout_points: astData.projectInfo.lockoutPoints,
      weather_conditions: astData.projectInfo.weatherConditions,
      access_restrictions: astData.projectInfo.accessRestrictions,
    },
    equipment: {
      selected: astData.equipment.selected,
      categories: astData.equipment.categories,
      mandatory: astData.equipment.mandatory,
      optional: astData.equipment.optional,
      total_cost: astData.equipment.totalCost,
      inspection_required: astData.equipment.inspectionRequired,
      certifications: astData.equipment.certifications,
    },
    hazards: {
      identified: astData.hazards.identified,
      risk_level: astData.hazards.riskLevel,
      control_measures: astData.hazards.controlMeasures,
      residual_risk: astData.hazards.residualRisk,
      emergency_procedures: astData.hazards.emergencyProcedures,
      monitoring_required: astData.hazards.monitoringRequired,
    },
    permits: {
      required: astData.permits.required,
      authorities: astData.permits.authorities,
      validations: astData.permits.validations,
      expiry: astData.permits.expiry,
      documents: astData.permits.documents,
      special_requirements: astData.permits.specialRequirements,
    },
    validation: {
      reviewers: astData.validation.reviewers,
      approvals: astData.validation.approvals,
      signatures: astData.validation.signatures,
      final_approval: astData.validation.finalApproval,
      criteria: astData.validation.criteria,
      comments: astData.validation.comments,
    },
    finalization: {
      photos: astData.finalization.photos,
      final_comments: astData.finalization.finalComments,
      document_generation: astData.finalization.documentGeneration,
      qr_code_url: astData.finalization.qrCodeUrl,
      shareable_link: astData.finalization.shareableLink,
      generated_reports: astData.finalization.generatedReports,
    },
    statistics: {
      identified_hazards: stats.identifiedHazards,
      selected_equipment: stats.selectedEquipment,
      required_permits: stats.requiredPermits,
      team_members: stats.teamMembers,
      photos_count: stats.photosCount,
      documents_count: stats.documentsCount,
      signatures_count: stats.signaturesCount,
      lockout_points: stats.lockoutPoints,
    },
  };

  const { error } = await supabase
    .from('ast_complete_records')
    .upsert(supabaseData, { onConflict: 'ast_number' });

  if (error) {
    throw error;
  }
};
