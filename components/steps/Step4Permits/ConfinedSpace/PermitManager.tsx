"use client";
import React from 'react';

interface PermitManagerProps {
  [key: string]: any;
}

const PermitManager: React.FC<PermitManagerProps> = (props) => {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h3>✅ Permit Manager - En cours de reconstruction...</h3>
      <p>Composant en cours de refactoring avec SafetyManager</p>
    </div>
  );
};

export default PermitManager;
