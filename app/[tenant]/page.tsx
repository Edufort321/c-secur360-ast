'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ASTForm from '@/components/ASTForm';
import { AST } from '../types/ast';
import '@/styles/components.css';

export default function ASTPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params?.tenant as string;

  const [formData, setFormData] = useState<Partial<AST>>({
    id: '',
    tenant: tenant || '',
    projectInfo: {
      workType: '',
      workTypeDetails: {
        category: '',
        subcategory: '',
        complexity: 'simple',
        frequency: 'routine',
        criticality: 'low'
      },
      location: {
        site: '',
        building: '',
        floor: '',
        room: '',
        specificArea: ''
      },
      estimatedDuration: '',
      actualDuration: '',
      equipmentRequired: [],
      environmentalConditions: {
        temperature: { min: 20, max: 25, units: 'celsius' },
        humidity: 50,
        lighting: { 
          type: 'artificial', 
          adequacy: 'good', 
          requiresSupplemental: false 
        },
        noise: { level: 0, requiresProtection: false },
        airQuality: { 
          quality: 'good', 
          requiresVentilation: false, 
          requiresRespiratory: false 
        },
        weather: { 
          condition: 'clear', 
          impactsWork: false 
        }
      }
    },
    status: 'draft'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenant) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        const userResponse = await fetch(`/api/${tenant}/user`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data loaded:', userData);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const astId = urlParams.get('id');
        
        if (astId) {
          const astResponse = await fetch(`/api/${tenant}/ast/${astId}`);
          if (astResponse.ok) {
            const astData = await astResponse.json();
            setFormData(astData);
          }
        }

      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  const handleDataChange = useCallback(async (section: string, data: any) => {
    setSaving(true);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [section]: data,
        updatedAt: new Date()
      };
      
      setTimeout(async () => {
        try {
          await fetch(`/api/${tenant}/ast/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
          });
        } catch (err) {
          console.error('Erreur sauvegarde:', err);
        } finally {
          setSaving(false);
        }
      }, 500);
      
      return newData;
    });
  }, [tenant]);

  if (loading) {
    return (
      <div className="full-screen-center">
        <div className="loading-box">
          <div className="spinner" />
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen-center">
        <div className="error-box">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {saving && <div className="saving-toast">Sauvegarde...</div>}

      <ASTForm
        formData={formData}
        onDataChange={handleDataChange}
        tenant={tenant}
        language="fr"
      />
    </div>
  );
}
