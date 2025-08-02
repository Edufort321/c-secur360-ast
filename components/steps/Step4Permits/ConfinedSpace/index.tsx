"use client";
import React from 'react';

interface ConfinedSpaceProps {
  [key: string]: any;
}

const ConfinedSpace: React.FC<ConfinedSpaceProps> = (props) => {
  return (
    <div style={{ 
      padding: '40px', 
      color: 'white', 
      backgroundColor: '#111827',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1>🏗️ Confined Space Module</h1>
      <p>En cours de reconstruction avec SafetyManager...</p>
      <p>Module temporairement hors ligne</p>
    </div>
  );
};

export default ConfinedSpace;
