"use client";
import React from 'react';

interface SiteInformationProps {
  [key: string]: any;
}

const SiteInformation: React.FC<SiteInformationProps> = (props) => {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h3>🏗️ Site Information - En cours de reconstruction...</h3>
      <p>Composant en cours de refactoring avec SafetyManager</p>
    </div>
  );
};

export default SiteInformation;
