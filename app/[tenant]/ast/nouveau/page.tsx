// app/[tenant]/ast/nouveau/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ASTForm from '@/components/ASTForm';
import { DEMO_DATA } from '@/utils/demoData';

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function NouvellePage({ params }: PageProps) {
  // Clé unique pour localStorage basée sur tenant
  const getStorageKey = () => `ast-form-data-${params.tenant}`;
  
  // 🔄 FONCTION POUR INITIALISER LES DONNÉES (avec localStorage)
  const initializeAstData = () => {
    // Essayer de récupérer depuis localStorage d'abord
    try {
      const savedData = localStorage.getItem(getStorageKey());
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('💾 Données récupérées depuis localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération localStorage:', error);
    }
    
    // Sinon, retourner les données par défaut
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

  // 💾 SAUVEGARDE AUTOMATIQUE DANS LOCALSTORAGE
  const saveToLocalStorage = useCallback((data: any) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      console.log('💾 Données sauvegardées dans localStorage:', data.id);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }
  }, [params.tenant]);
  
  // 🧼 FONCTION POUR VIDER LE CACHE (RESET FORMULAIRE)
  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
      window.location.reload();
    } catch (error) {
      console.error('❌ Erreur effacement localStorage:', error);
    }
  }, [params.tenant]);
  
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

    setAstData(prev => {
      // Si pas d'ID (nouveau formulaire), en générer un
      if (!prev.id) {
        const newData = {
          ...prev,
          id: generateId(),
          astNumber: generateASTNumber(),
          createdAt: new Date().toISOString(),
          tenantId: params.tenant,
          updatedAt: new Date().toISOString()
        };
        saveToLocalStorage(newData);
        return newData;
      }
      return prev;
    });

    // Simulation récupération user depuis session/auth
    setUserId(`user_${Date.now()}`);
    setUserRole('worker');
  }, [params.tenant]);

  // ✅ HANDLER POUR SYNC DONNÉES AVEC PERSISTANCE AUTOMATIQUE
  const handleDataChange = useCallback((section: string, data: any) => {
    if (section === 'projectInfo') {
      // Logique pour gérer les points de verrouillage
      console.log('Points de verrouillage:', data.lockoutPoints);
    }
    
    console.log('📝 Page - Data changed:', { section, data });
    
    setAstData(prev => {
      const newData = {
        ...prev,
        [section]: data,
        updatedAt: new Date().toISOString()
      };
      
      // 💾 SAUVEGARDE AUTOMATIQUE À CHAQUE CHANGEMENT
      saveToLocalStorage(newData);
      
      return newData;
    });
  }, [saveToLocalStorage]);

  // ✅ FONCTION POUR CHARGER LES DONNÉES DE DÉMO AVEC PERSISTANCE
  const loadDemoData = useCallback(() => {
    console.log('🎯 Chargement des données de démo complètes...');
    
    setAstData((prev: any) => {
      const newData = {
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
      } as any;
      
      // 💾 Sauvegarder les données de démo
      saveToLocalStorage(newData);
      
      return newData;
    });
    
    alert('✅ Données de démo chargées et sauvegardées ! Vous pouvez maintenant naviguer dans tous les steps et voir le rapport complet en Step 5. Les données persisteront même si vous rechargez la page.');
  }, [params.tenant, saveToLocalStorage]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* 🛠️ PANNEAU DE CONTRÔLE DÉVELOPPEMENT */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Indicateur de persistance */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: astData.id ? '#10b981' : '#f59e0b',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          💾 {astData.id ? 'Données sauvegardées' : 'Non sauvegardé'}
        </div>
        
        {/* Bouton Demo Data */}
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
        
        {/* Bouton Reset Formulaire */}
        <button
          onClick={clearFormData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🗑️ Reset Form
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
