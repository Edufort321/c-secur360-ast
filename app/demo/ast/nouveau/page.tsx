'use client';

import React, { useState, useCallback } from 'react';
import ASTForm from '../../../../components/ASTForm';

export default function DemoNouvellePage() {
  const [astData, setAstData] = useState({
    id: '',
    astNumber: '',
    projectInfo: {
      client: '',
      workLocation: '',
      industry: '',
      projectNumber: '',
      date: '',
      time: '',
      workDescription: '',
      workerCount: 1,
      lockoutPoints: [],
    },
    equipment: {
      selected: [],
      custom: []
    },
    hazards: {
      identified: [],
      riskAssessment: {},
      controlMeasures: []
    },
    permits: {
      required: [],
      details: {}
    },
    validation: {
      supervisorApproval: false,
      workerAcknowledgment: false,
      comments: ''
    }
  });

  // Fonction de sauvegarde BLOQUÉE pour la démo
  const handleDataChange = useCallback((section: string, data: any) => {
    setAstData(prev => ({
      ...prev,
      [section]: data
    }));
    
    // ⚠️ DEMO MODE: Aucune sauvegarde en base de données
    console.log('🚫 DEMO MODE: Sauvegarde bloquée -', section, data);
  }, []);

  // Fonction d'impression BLOQUÉE pour la démo
  const handlePrint = useCallback(() => {
    alert('🚫 DEMO MODE\n\nL\'impression est désactivée en mode démonstration.\n\nContactez-nous pour accéder à la version complète.');
  }, []);

  // Fonction de sauvegarde BLOQUÉE pour la démo
  const handleSave = useCallback(() => {
    alert('🚫 DEMO MODE\n\nLa sauvegarde est désactivée en mode démonstration.\n\nTous les changements seront perdus lors du rechargement.\n\nContactez-nous pour accéder à la version complète.');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner démo */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            MODE DÉMONSTRATION
          </span>
          <span className="text-sm">
            Version complète disponible • Sauvegarde et impression désactivées
          </span>
        </div>
      </div>

      {/* Formulaire AST complet avec restrictions démo */}
      <ASTForm
        tenant="demo"
        language="fr"
        userId="demo-user"
        userRole="worker"
        formData={astData}
        onDataChange={handleDataChange}
        onPrint={handlePrint}
        onSave={handleSave}
        demoMode={true}
      />
    </div>
  );
}