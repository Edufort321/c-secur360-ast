'use client';

import { useState, useEffect, useCallback } from 'react';
import ASTForm from '../../../../components/ASTForm';

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function NouvellePage({ params }: PageProps) {
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
      selected: [],
      controls: []
    },
    permits: {
      permits: []
    },
    validation: {
      reviewers: []
    },
finalization: {
  consent: false,
  signatures: [],
  // Ajout d'une logique pour compiler les champs remplis
  fieldsCompiled: false
},
  });

  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<'worker' | 'supervisor' | 'manager' | 'admin'>('worker');

  // ✅ GÉNÉRATION ID UNIQUE AU MONTAGE
  useEffect(() => {
    const generateId = () => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      return `ast_${timestamp}_${randomId}`;
    };

    const generateASTNumber = () => {
      const tenantCode = params.tenant.toUpperCase().slice(0, 3);
      const year = new Date().getFullYear();
      const sequence = String(Date.now()).slice(-6);
      return `AST-${tenantCode}-${year}-${sequence}`;
    };

    setAstData(prev => ({
      ...prev,
      id: generateId(),
      astNumber: generateASTNumber(),
      createdAt: new Date().toISOString(),
      tenantId: params.tenant
    }));

    // Simulation récupération user depuis session/auth
    setUserId(`user_${Date.now()}`);
    setUserRole('worker');
  }, [params.tenant]);

  // ✅ HANDLER POUR SYNC DONNÉES AVEC SAUVEGARDE DB
  const handleDataChange = useCallback(async (section: string, data: any) => {
    if (section === 'projectInfo') {
      // Logique pour gérer les points de verrouillage
      console.log('Points de verrouillage:', data.lockoutPoints);
    }
    console.log('📝 Tenant - Data changed:', { section, data });
    
    setAstData(prev => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString()
    }));

    // 💾 SAUVEGARDE AUTOMATIQUE EN BASE DE DONNÉES
    try {
      await fetch(`/api/ast/${params.tenant}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          data,
          tenant: params.tenant,
          userId
        })
      });
      console.log('✅ Sauvegardé automatiquement en DB');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }, [params.tenant, userId]);

  // 🖨️ FONCTION D'IMPRESSION COMPLÈTE
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 💾 FONCTION DE SAUVEGARDE MANUELLE
  const handleSave = useCallback(async () => {
    try {
      const response = await fetch(`/api/ast/${params.tenant}/save-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: astData,
          tenant: params.tenant,
          userId
        })
      });
      
      if (response.ok) {
        alert('✅ AST sauvegardée avec succès!');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde complète:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  }, [astData, params.tenant, userId]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ✅ AST COMPLET AVEC TOUTES LES FONCTIONNALITÉS TENANT */}
      <ASTForm
        tenant={params.tenant}
        language="fr"
        formData={astData}
        onDataChange={handleDataChange}
        onPrint={handlePrint}
        onSave={handleSave}
        userId={userId}
        userRole={userRole}
        demoMode={false}
      />
    </div>
  );
}
