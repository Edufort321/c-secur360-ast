'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ASTForm from '@/components/ASTForm';
import { AST } from '@/types/ast';

// Interface pour la page dans ta structure
interface ASTPageProps {
  params: {
    tenant: string;
  };
}

export default function ASTPage({ params }: ASTPageProps) {
  const { tenant } = params;
  const router = useRouter();
  
  // =================== ÉTAT PRINCIPAL ADAPTÉ À TON INTERFACE AST ===================
  const [formData, setFormData] = useState<Partial<AST>>(() => ({
    id: `ast_${Date.now()}`,
    name: `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    description: '',
    version: '1.0',
    tenant,
    status: 'draft',
    priority: 'medium',
    currentStep: 1,
    completedSteps: [],
    steps: [],
    participants: [],
    validations: [],
    revisionHistory: [],
    overallRiskLevel: 'medium',
    createdBy: 'user_anonymous',
    lastModifiedBy: 'user_anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Initialisation projectInfo avec ta structure
    projectInfo: {
      workType: '',
      location: {
        site: '',
        building: '',
        floor: '',
        room: '',
        specificArea: ''
      },
      estimatedDuration: '',
      equipmentRequired: [],
      environmentalConditions: {
        temperature: { min: 20, max: 25, units: 'celsius' },
        humidity: 50,
        lighting: { type: 'artificial', adequacy: 'good', requiresSupplemental: false },
        noise: { level: 0, requiresProtection: false },
        airQuality: { quality: 'good', requiresVentilation: false, requiresRespiratory: false },
        weather: { condition: 'clear', impactsWork: false }
      }
    }
  }));

  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [userId, setUserId] = useState<string>('user_anonymous');
  const [userRole, setUserRole] = useState<'worker' | 'supervisor' | 'manager' | 'admin'>('worker');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =================== REF POUR ÉVITER LES BOUCLES ===================
  const lastSaveRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // =================== RÉCUPÉRATION DONNÉES INITIALES ===================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Récupérer les préférences utilisateur
        const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }

        // Récupérer les données utilisateur (remplace par ton API)
        const userData = await fetchUserData();
        if (userData) {
          setUserId(userData.id);
          setUserRole(userData.role);
        }

        // Récupérer les données AST existantes (si modification)
        const astId = new URLSearchParams(window.location.search).get('id');
        if (astId) {
          const existingData = await fetchASTData(astId);
          if (existingData) {
            setFormData(existingData);
          }
        }

      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [tenant]);

  // =================== HANDLER DATA CHANGE STABLE ===================
  const handleDataChange = useCallback((section: string, data: any) => {
    const updateKey = `${section}-${JSON.stringify(data).slice(0, 50)}`;
    
    // Éviter les doublons
    if (lastSaveRef.current === updateKey) {
      return;
    }
    
    lastSaveRef.current = updateKey;
    
    // Mettre à jour l'état local avec ta structure AST
    setFormData(prev => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: userId
    }));

    // Sauvegarder avec débounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveASTData({
        ...formData,
        [section]: data,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: userId
      });
    }, 1000);
    
  }, [formData, userId]);

  // =================== FONCTIONS API (À ADAPTER À TON BACKEND) ===================
  const fetchUserData = async () => {
    try {
      // Remplace par ton endpoint API utilisateur
      const response = await fetch(`/api/${tenant}/user`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
    }
    return null;
  };

  const fetchASTData = async (astId: string): Promise<Partial<AST> | null> => {
    try {
      // Remplace par ton endpoint API AST
      const response = await fetch(`/api/${tenant}/ast/${astId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erreur récupération AST:', error);
    }
    return null;
  };

  const saveASTData = async (data: Partial<AST>) => {
    try {
      // Remplace par ton endpoint API AST
      const response = await fetch(`/api/${tenant}/ast`, {
        method: data.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erreur sauvegarde');
      }
      
      console.log('✅ AST sauvegardé avec succès');
    } catch (error) {
      console.error('❌ Erreur sauvegarde AST:', error);
      setError('Erreur lors de la sauvegarde');
    }
  };

  // =================== GESTION ERREURS ===================
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Chargement AST...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid #ef4444'
          }}>
            ❌
          </div>
          <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Erreur</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#ffffff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // =================== RENDU PRINCIPAL ===================
  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
      
      <ASTForm
        tenant={tenant}
        language={language}
        userId={userId}
        userRole={userRole}
        formData={formData}
        onDataChange={handleDataChange}
      />
    </div>
  );
}
