"use client";
import React from 'react';

interface RescuePlanProps {
  [key: string]: any;
}

const RescuePlan: React.FC<RescuePlanProps> = (props) => {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h3>🛡️ Rescue Plan - En cours de reconstruction...</h3>
      <p>Composant en cours de refactoring avec SafetyManager</p>
    </div>
  );
};

export default RescuePlan;
