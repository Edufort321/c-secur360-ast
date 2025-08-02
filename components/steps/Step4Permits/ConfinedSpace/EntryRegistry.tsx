"use client";
import React from 'react';

interface EntryRegistryProps {
  [key: string]: any;
}

const EntryRegistry: React.FC<EntryRegistryProps> = (props) => {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h3>👥 Entry Registry - En cours de reconstruction...</h3>
      <p>Composant en cours de refactoring avec SafetyManager</p>
    </div>
  );
};

export default EntryRegistry;
