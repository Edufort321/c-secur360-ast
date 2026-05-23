'use client';

import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, FileCheck, Download, Filter, 
  Search, Eye, UserCheck, AlertTriangle 
} from 'lucide-react';
import { useWorkerRegistry, WorkerRegistryUtils } from '../../hooks/useWorkerRegistry';

// =================== COMPOSANT MODULE RH ===================

const HRModule: React.FC = () => {
  const {
    hrData,
    isConnected,
    lastUpdate,
    getAttendanceData,
    getComplianceReport,
    getTimeReport,
    exportToCSV
  } = useWorkerRegistry();

  // =================== ÉTATS LOCAUX ===================
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'completed'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // =================== CALCULS ===================
  
  const filteredData = hrData.filter(worker => {
    // Filtre de recherche
    if (searchTerm && !worker.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !worker.employeeNumber.includes(searchTerm)) {
      return false;
    }
    
    // Filtre par emplacement
    if (filterLocation && worker.workLocation !== filterLocation) {
      return false;
    }
    
    // Filtre par statut de présence
    if (filterStatus !== 'all') {
      const status = WorkerRegistryUtils.getPresenceStatus(worker);
      if (status !== filterStatus) return false;
    }
    
    return true;
  });

  const attendanceData = getAttendanceData(dateFrom, dateTo);
  const complianceReport = getComplianceReport();
  const timeReport = getTimeReport();
  const locations = [...new Set(hrData.map(w => w.workLocation))].filter(Boolean);

  // =================== HANDLERS ===================
  
  const handleExportAttendance = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =================== RENDER ===================
  
  if (!isConnected) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <Users size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
        <h3>Module RH non connecté</h3>
        <p>Connectez-vous à un projet actif pour accéder aux données RH.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
              Module RH - Gestion des Présences
            </h1>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Dernière synchronisation: {new Date(lastUpdate).toLocaleString('fr-CA')}
            </p>
          </div>
          <button
            onClick={handleExportAttendance}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Download size={16} />
            Export Assiduité
          </button>
        </div>

        {/* Statistiques RH */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Users style={{ color: '#2563eb', margin: '0 auto 8px' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
              {hrData.length}
            </div>
            <div style={{ fontSize: '12px', color: '#3b82f6' }}>Total Employés</div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <UserCheck style={{ color: '#16a34a', margin: '0 auto 8px' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              {hrData.filter(w => WorkerRegistryUtils.getPresenceStatus(w) === 'present').length}
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a' }}>Présents</div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Clock style={{ color: '#d97706', margin: '0 auto 8px' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b45309' }}>
              {timeReport.totalHours}h
            </div>
            <div style={{ fontSize: '12px', color: '#d97706' }}>Temps Total</div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f3e8ff',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <FileCheck style={{ color: '#7c3aed', margin: '0 auto 8px' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6d28d9' }}>
              {complianceReport.percentage}%
            </div>
            <div style={{ fontSize: '12px', color: '#7c3aed' }}>Conformité</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Recherche */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Rechercher
            </label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou numéro employé..."
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
          </div>

          {/* Filtre emplacement */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Emplacement
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            >
              <option value="">Tous les emplacements</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Filtre statut */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Statut de présence
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="present">Présents</option>
              <option value="absent">Absents</option>
              <option value="completed">Terminés</option>
            </select>
          </div>

          {/* Période */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Du
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Au
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Table des employés */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 20px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
            Registre des Présences ({filteredData.length} employés)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Employé
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Emplacement
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Statut
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Début
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Fin
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Temps Total
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Conformité
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((worker, index) => {
                const status = WorkerRegistryUtils.getPresenceStatus(worker);
                const statusColors = {
                  present: { bg: '#dcfce7', text: '#16a34a', label: '🟢 Présent' },
                  absent: { bg: '#fee2e2', text: '#dc2626', label: '🔴 Absent' },
                  completed: { bg: '#e0e7ff', text: '#4f46e5', label: '✅ Terminé' }
                };
                const statusColor = statusColors[status];

                return (
                  <tr key={worker.workerId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>
                        {worker.employeeName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {worker.employeeNumber} - {worker.company}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {worker.workLocation || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {statusColor.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#374151' }}>
                      {worker.clockInTime ? new Date(worker.clockInTime).toLocaleTimeString('fr-CA') : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#374151' }}>
                      {worker.clockOutTime ? new Date(worker.clockOutTime).toLocaleTimeString('fr-CA') : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#374151' }}>
                      {WorkerRegistryUtils.formatWorkTime(worker.totalWorkTime)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {worker.consentAST ? (
                        <span style={{ color: '#22c55e' }}>✅</span>
                      ) : (
                        <span style={{ color: '#ef4444' }}>❌</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Users size={32} style={{ margin: '0 auto 16px' }} />
            <div>Aucun employé trouvé avec les filtres sélectionnés</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRModule;