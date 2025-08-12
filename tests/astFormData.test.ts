import type { ASTFormData } from '@/types/astForm';

function updateStepData<K extends keyof ASTFormData>(section: K, data: ASTFormData[K]) {
  return { section, data };
}

const form: ASTFormData = {
  tenantId: 'tenant1',
  astNumber: 'AST-1',
  userId: 'user1',
  createdAt: new Date().toISOString(),
  projectInfo: { client: 'Client', workDescription: 'Work' },
  equipment: { list: [] },
  hazards: { list: [] },
  permits: { permits: [] },
  validation: {
    reviewers: [],
    approvalRequired: false,
    minimumReviewers: 0,
    validationCriteria: {
      hazardIdentification: true,
      controlMeasures: true,
      equipmentSelection: true,
      procedural: true,
      regulatory: true
    }
  },
  finalization: {
    status: 'draft',
    createdAt: '',
    lastModified: '',
    hazardCount: 0,
    equipmentCount: 0,
    workerCount: 0,
    photoCount: 0,
    permitCount: 0,
    completionPercentage: 0
  }
};

updateStepData('projectInfo', { client: 'New', workDescription: 'Desc' });
