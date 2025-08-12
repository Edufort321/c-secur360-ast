'use client';

import React from 'react';
import ASTForm from './ASTForm';
import { useAstForm } from '../hooks/useAstForm';

interface TenantAstPageProps {
  tenant: string;
}

export default function TenantAstPage({ tenant }: TenantAstPageProps) {
  const { formData, loading, error, saving, handleDataChange } = useAstForm(tenant);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        }}
      >
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#ffffff',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #3b82f6',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        }}
      >
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#ef4444',
            textAlign: 'center',
            maxWidth: '400px'
          }}
        >
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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}
    >
      {saving && (
        <div
          style={{
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
          }}
        >
          Sauvegarde...
        </div>
      )}

      <ASTForm
        formData={formData}
        onDataChange={handleDataChange}
        tenant={tenant}
        language="fr"
      />
    </div>
  );
}
