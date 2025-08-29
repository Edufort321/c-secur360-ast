'use client';

import React from 'react';
import { Users, Clock, Shield, FileCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { useWorkerRegistry, WorkerRegistryUtils } from '../../hooks/useWorkerRegistry';

// =================== EXEMPLE D'UTILISATION DU HOOK ===================

const TenantDashboard: React.FC = () => {
  const {
    workersData,
    hrData,
    dashboardSummary,
    isConnected,
    lastUpdate,
    getActiveWorkers,
    getComplianceReport,
    getTimeReport,
    exportToCSV,
    exportToJSON
  } = useWorkerRegistry();

  // =================== CALCULS LOCAUX ===================
  
  const activeWorkers = getActiveWorkers();
  const complianceReport = getComplianceReport();
  const timeReport = getTimeReport();
  const safetyReport = WorkerRegistryUtils.generateSafetyReport(hrData);

  // =================== HANDLERS ===================
  
  const handleExportCSV = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workers-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workers-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =================== RENDER ===================
  
  if (!isConnected || !dashboardSummary) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#f59e0b' }} />
        <h3>Aucune donnée de travailleurs disponible</h3>
        <p>Connectez-vous à un projet actif pour voir les statistiques.</p>
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
          Statut: {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header avec statut */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
            Dashboard Principal - Tenant
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Dernière mise à jour: {new Date(lastUpdate).toLocaleString('fr-CA')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Grille de statistiques principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Travailleurs Actifs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '2px solid #22c55e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Users style={{ color: '#22c55e' }} size={24} />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Travailleurs Actifs</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
            {dashboardSummary.totalActiveWorkers}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {activeWorkers.length} actuellement présents
          </div>
        </div>

        {/* Temps Total */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '2px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Clock style={{ color: '#f59e0b' }} size={24} />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Temps Total</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {dashboardSummary.totalWorkHours}h
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Moyenne: {timeReport.averageHours}h par travailleur
          </div>
        </div>

        {/* Conformité AST */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '2px solid #8b5cf6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <FileCheck style={{ color: '#8b5cf6' }} size={24} />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Conformité AST</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {complianceReport.percentage}%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {complianceReport.compliant}/{complianceReport.total} conformes
          </div>
        </div>

        {/* Sécurité Cadenas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '2px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Shield style={{ color: '#ef4444' }} size={24} />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Sécurité LOTO</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
            {safetyReport.locksApplied}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Cadenas appliqués
          </div>
        </div>
      </div>

      {/* Détails par emplacement */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
          Répartition par Emplacement
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {[...new Set(hrData.map(w => w.workLocation))].filter(Boolean).map((location, index) => {
            const locationWorkers = hrData.filter(w => w.workLocation === location);
            const activeInLocation = locationWorkers.filter(w => 
              WorkerRegistryUtils.getPresenceStatus(w) === 'present'
            ).length;
            
            return (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                  {location}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {activeInLocation}/{locationWorkers.length} actifs
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rapport de conformité détaillé */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
          Rapport de Conformité Détaillé
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
              {safetyReport.consentRate}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Signatures AST</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {safetyReport.locksApplied}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Cadenas Apposés</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
              {safetyReport.locksRemoved}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Cadenas Retirés</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {safetyReport.criticalAlerts}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Alertes Critiques</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;