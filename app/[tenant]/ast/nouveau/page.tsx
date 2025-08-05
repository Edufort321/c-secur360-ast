'use client';

import ASTForm from '@/components/ASTForm';
import { useState } from 'react';

export default function NouveauASTPage({ params }: { params: { tenant: string } }) {
  // ✅ État pour les données AST avec structure complète
  const [astData, setAstData] = useState({
    id: `ast_${Date.now()}`,
    astNumber: `AST-${params.tenant.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    projectInfo: {
      client: '',
      workLocation: '',
      industry: '',
      projectNumber: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      workDescription: '',
      workerCount: 1,
      lockoutPoints: []
    },
    equipment: {
      list: [],
      selected: [],
      totalCost: 0
    },
    hazards: {
      list: [],
      selected: []
    },
    permits: {
      permits: [],
      authorities: []
    },
    validation: {
      reviewers: [],
      approvalRequired: false
    },
    finalization: {
      workers: [],
      photos: [],
      finalComments: '',
      documentGeneration: {
        includePhotos: true,
        includeSignatures: true,
        includeQRCode: true,
        includeBranding: true,
        includeTimestamps: true,
        includeComments: true,
        format: 'pdf'
      },
      isLocked: false,
      completionPercentage: 0
    }
  });

  // ✅ Handler pour les changements de données
  const handleDataChange = (section: string, data: any) => {
    console.log(`📝 Page - Mise à jour section ${section}:`, data);
    setAstData(prev => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString()
    }));
  };

  return (
    <ASTForm 
      tenant={params.tenant} 
      language="fr"
      formData={astData}
      onDataChange={handleDataChange}
    />
  );
}
