// app/[tenant]/ast/nouveau/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ASTForm from '@/components/ASTForm';
import { PortalHeader } from '@/components/PortalHeader';
import { DEMO_DATA } from '@/utils/demoData';
import { createASTForm, updateASTForm, getASTForm, ASTFormData, supabase } from '@/lib/supabase';

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function NouvellePage({ params }: PageProps) {
  // 🔄 FONCTION POUR INITIALISER UN NOUVEL AST
  const initializeAstData = () => {
    return {
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
    };
  };
  
  const [astData, setAstData] = useState(initializeAstData());

  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<'worker' | 'supervisor' | 'manager' | 'admin'>('worker');

  // 💾 SAUVEGARDE AUTOMATIQUE DANS SUPABASE
  const saveToSupabase = useCallback(async (data: any) => {
    try {
      console.log('💾 Sauvegarde AST dans Supabase:', data.id);
      
      const astFormData: ASTFormData = {
        id: data.id,
        tenantId: params.tenant,
        userId: userId || `user_${Date.now()}`,
        projectNumber: data.projectInfo?.projectNumber || data.astNumber || '',
        clientName: data.projectInfo?.client || 'Client sans nom',
        workLocation: data.projectInfo?.workLocation || data.projectInfo?.workSite || '',
        clientRep: data.projectInfo?.clientRep,
        emergencyNumber: data.projectInfo?.emergencyPhone,
        astNumber: data.astNumber,
        clientReference: data.projectInfo?.clientReference,
        workDescription: data.projectInfo?.workDescription || '',
        status: 'draft',
        generalInfo: data.projectInfo,
        teamDiscussion: data.teamDiscussion,
        isolation: data.isolation,
        hazards: data.hazards,
        controlMeasures: data.controlMeasures,
        workers: data.workers,
        photos: data.photos
      };

      if (data.id && data.createdAt) {
        // Mise à jour
        await updateASTForm(data.id, astFormData);
        console.log('✅ AST mis à jour dans Supabase');
      } else {
        // Création
        const result = await createASTForm(astFormData);
        console.log('✅ Nouvel AST créé dans Supabase:', result.id);
        
        // Mettre à jour l'ID local avec celui de Supabase
        setAstData((prev: any) => ({
          ...prev,
          id: result.id,
          createdAt: result.created_at
        }));
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde Supabase:', error);
    }
  }, [params.tenant, userId]);
  
  
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

    setAstData((prev: any) => {
      // Si pas d'ID (nouveau formulaire), en générer un temporaire
      if (!prev.id) {
        const newData = {
          ...prev,
          id: generateId(),
          astNumber: generateASTNumber(),
          createdAt: new Date().toISOString(),
          tenantId: params.tenant,
          updatedAt: new Date().toISOString()
        };
        // La sauvegarde Supabase se fera lors du premier changement
        return newData;
      }
      return prev;
    });

    // Simulation récupération user depuis session/auth
    setUserId(`user_${Date.now()}`);
    setUserRole('worker');
  }, [params.tenant]);

  // 🔗 Pré-remplissage depuis un projet (interconnexion Projet → AST)
  useEffect(() => {
    const projectId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('project') : null;
    if (!projectId) return;
    (async () => {
      try {
        const { data: p } = await supabase
          .from('projects').select('project_number, client_name, location, title')
          .eq('id', projectId).maybeSingle();
        if (p) {
          setAstData((prev: any) => ({
            ...prev,
            projectInfo: {
              ...prev.projectInfo,
              projectNumber: (p as any).project_number || prev.projectInfo.projectNumber,
              client: (p as any).client_name || prev.projectInfo.client,
              workLocation: (p as any).location || prev.projectInfo.workLocation,
              workDescription: prev.projectInfo.workDescription || (p as any).title || '',
            },
          }));
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // ✅ HANDLER POUR SYNC DONNÉES AVEC SAUVEGARDE SUPABASE AUTOMATIQUE
  const handleDataChange = useCallback((section: string, data: any) => {
    if (section === 'projectInfo') {
      // Logique pour gérer les points de verrouillage
      console.log('Points de verrouillage:', data.lockoutPoints);
    }
    
    console.log('📝 Page - Data changed:', { section, data });
    
    setAstData((prev: any) => {
      const newData = {
        ...prev,
        [section]: data,
        updatedAt: new Date().toISOString()
      };
      
      // 💾 SAUVEGARDE AUTOMATIQUE DANS SUPABASE
      // Utiliser un timeout pour éviter trop de requêtes
      setTimeout(() => {
        saveToSupabase(newData);
      }, 1000);
      
      return newData;
    });
  }, [saveToSupabase]);


  return (
    <div style={{ minHeight: '100vh' }}>
      <PortalHeader tenant={params.tenant} />

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
