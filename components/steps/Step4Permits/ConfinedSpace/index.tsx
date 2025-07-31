"use client";

import React from 'react';

// =================== TYPES MINIMAUX ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpaceProps {
  province?: ProvinceCode;
  language?: 'fr' | 'en';
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// =================== COMPOSANT MINIMAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({ 
  onCancel,
  language = 'fr'
}) => {
  return (
    <div style={{ 
      padding: '40px', 
      color: 'white',
      backgroundColor: '#111827',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        color: '#10b981',
        textAlign: 'center'
      }}>
        ✅ ConfinedSpace Fonctionne !
      </h1>
      
      <p style={{ 
        fontSize: '18px', 
        color: '#d1d5db',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        {language === 'fr' 
          ? 'Le module ConfinedSpace s\'importe et se charge correctement. L\'import statique fonctionne !'
          : 'ConfinedSpace module imports and loads correctly. Static import works!'
        }
      </p>
      
      <button 
        onClick={onCancel}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {language === 'fr' ? '← Retour à la Sélection' : '← Back to Selection'}
      </button>
    </div>
  );
};

export default ConfinedSpace;
