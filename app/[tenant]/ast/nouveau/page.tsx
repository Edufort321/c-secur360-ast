// app/[tenant]/ast/nouveau/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ASTForm from '@/components/ASTForm';
import { DEMO_DATA } from '@/utils/demoData';

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
    workers: {
      list: [],
      lastUpdated: '',
      totalCount: 0
    },
finalization: {
  consent: false,
  signatures: [],
  // Ajout d'une logique pour compiler les champs remplis
  fieldsCompiled: false
},
    tenantId: '',
    createdAt: '',
    updatedAt: ''
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

  // ✅ HANDLER POUR SYNC DONNÉES
  const handleDataChange = (section: string, data: any) => {
  if (section === 'projectInfo') {
    // Logique pour gérer les points de verrouillage
    console.log('Points de verrouillage:', data.lockoutPoints);
  }
    console.log('📝 Page - Data changed:', { section, data });
    setAstData(prev => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString()
    }));
  };

  // ✅ FONCTION POUR CHARGER LES DONNÉES DE DÉMO
  const loadDemoData = () => {
    console.log('🎯 Chargement des données de démo complètes...');
    
    // Utilisation de 'as any' pour contourner temporairement les erreurs de types
    setAstData((prev: any) => ({
      ...prev,
      ...DEMO_DATA,
      id: prev.id, // Garder l'ID généré
      astNumber: prev.astNumber, // Garder le numéro AST généré
      tenantId: params.tenant,
      createdAt: prev.createdAt,
      updatedAt: new Date().toISOString(),
      projectInfo: {
        ...prev.projectInfo,
        ...DEMO_DATA.projectInfo
      }
    } as any));
    
    alert('✅ Données de démo chargées ! Vous pouvez maintenant naviguer dans tous les steps et voir le rapport complet en Step 5.');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ✅ BOUTON DEMO DATA - En haut pour test */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={loadDemoData}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🎯 Load Demo Data
        </button>
      </div>

      {/* ✅ INTERFACE COMPATIBLE AVEC TON ASTFORM ACTUEL */}
      <ASTForm
        tenant={params.tenant}
        language="fr"
        formData={astData}
        onDataChange={handleDataChange}
        userId={userId}
        userRole={userRole}
      />
    </div>
  );
}
