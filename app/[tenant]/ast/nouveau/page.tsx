// app/[tenant]/ast/nouveau/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ASTForm from '@/components/ASTForm';
import { ASTFormData } from '../../../types/astForm';

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function NouvellePage({ params }: PageProps) {
  const [astData, setAstData] = useState<ASTFormData>({
    id: '',
    astNumber: '',
    projectInfo: {
      client: '',
      clientPhone: '',
      clientRepresentative: '',
      clientRepresentativePhone: '',
      projectNumber: '',
      astClientNumber: '',
      date: '',
      time: '',
      workLocation: '',
      industry: '',
      emergencyContact: '',
      emergencyPhone: '',
      workDescription: '',
      workLocations: [],
      lockoutPoints: [],
      lockoutPhotos: []
    },
    equipment: {
      list: [],
      selected: [],
      totalSelected: 0,
      highPriority: 0,
      categories: [],
      inspectionStatus: {
        total: 0,
        verified: 0,
        available: 0,
        verificationRate: 0,
        availabilityRate: 0
      }
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
    setUserRole('worker');
  }, [params.tenant]);

  // ✅ HANDLER POUR SYNC DONNÉES
  const handleDataChange = <K extends keyof ASTFormData>(section: K, data: ASTFormData[K]) => {
    console.log('📝 Page - Data changed:', { section, data });
    setAstData(prev => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString()
    }));
  };

  return (
    <div style={{ minHeight: '100vh' }}>
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
