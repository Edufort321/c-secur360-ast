'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ASTForm from '@/components/ASTForm';
import { ASTFormData } from '../types/astForm';

export default function ASTPage() {
  const params = useParams();
  const tenant = params?.tenant as string;

  const [formData, setFormData] = useState<ASTFormData>({
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

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (data: ASTFormData) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = setTimeout(async () => {
        try {
          await fetch('/api/ast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: tenant, formData: data })
          });
        } catch (err) {
          console.error('Erreur sauvegarde:', err);
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [tenant]
  );

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  const handleDataChange = useCallback(
    <K extends keyof ASTFormData>(section: K, data: ASTFormData[K]) => {
      setSaving(true);

      setFormData(prev => {
        const newData: ASTFormData = {
          ...prev,
          [section]: data,
          updatedAt: new Date().toISOString()
        };

        debouncedSave(newData);

        return newData;
      });
    },
    [debouncedSave]
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #3b82f6',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          color: '#ef4444',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              marginTop: '16px',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      {saving && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          background: 'rgba(34, 197, 94, 0.9)',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          Sauvegarde...
        </div>
      )}

      <ASTForm
        formData={formData}
        onDataChange={handleDataChange}
        tenant={tenant}
        language="fr"
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
