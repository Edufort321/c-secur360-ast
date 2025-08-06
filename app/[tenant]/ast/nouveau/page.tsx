// app/[tenant]/ast/nouveau/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ASTForm from '@/components/ASTForm';
import { DEFAULT_TENANT_CONFIGS } from '@/components/ASTContext';

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
      lockoutPoints: []
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
      signatures: []
    }
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
    setUserRole('worker'); // À adapter selon votre système d'auth
  }, [params.tenant]);

  // ✅ VALIDATION TENANT
  const tenantConfig = DEFAULT_TENANT_CONFIGS[params.tenant] || DEFAULT_TENANT_CONFIGS.demo;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ✅ NOUVELLE INTERFACE SIMPLIFIÉE */}
      <ASTForm
        tenant={tenantConfig}
        language="fr"
        initialData={astData}
        userId={userId}
        userRole={userRole}
      />
    </div>
  );
}
