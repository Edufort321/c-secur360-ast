'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AccidentDeclarationSystem, { AccidentDeclaration } from '../../../components/AccidentDeclaration';
import { getClientById } from '../../../data/clients';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Shield
} from 'lucide-react';

export default function AccidentsPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  
  const [client, setClient] = useState<any>(null);
  const [declarations, setDeclarations] = useState<AccidentDeclaration[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Charger les informations du client
    const clientData = getClientById(tenant);
    if (clientData) {
      setClient(clientData);
    }

    // Charger les déclarations existantes (mock data)
    const mockDeclarations: AccidentDeclaration[] = [
      {
        id: 'decl_001',
        organizationId: tenant,
        type: 'workplace_accident',
        province: 'QC',
        status: 'submitted',
        formData: {
          basicInfo: {
            accidentDate: '2024-01-15',
            description: 'Chute de hauteur lors de travaux sur toiture'
          }
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        submittedAt: new Date('2024-01-15'),
        referenceNumber: 'AST-2024-001'
      },
      {
        id: 'decl_002',
        organizationId: tenant,
        type: 'near_miss',
        province: 'QC',
        status: 'draft',
        formData: {
          basicInfo: {
            incidentDate: '2024-01-20',
            description: 'Presque collision avec équipement mobile'
          }
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];
    setDeclarations(mockDeclarations);
  }, [tenant]);

  const handleSaveDeclaration = (declaration: AccidentDeclaration) => {
    console.log('Sauvegarde déclaration:', declaration);
    // Sauvegarder en base de données
    setDeclarations(prev => {
      const existing = prev.find(d => d.id === declaration.id);
      if (existing) {
        return prev.map(d => d.id === declaration.id ? declaration : d);
      } else {
        return [...prev, declaration];
      }
    });
    alert('Déclaration sauvegardée avec succès');
  };

  const handleSubmitDeclaration = (declaration: AccidentDeclaration) => {
    console.log('Soumission déclaration:', declaration);
    // Soumettre aux autorités compétentes
    const updatedDeclaration = {
      ...declaration,
      status: 'submitted' as const,
      submittedAt: new Date(),
      referenceNumber: `AST-${new Date().getFullYear()}-${String(declarations.length + 1).padStart(3, '0')}`
    };
    
    setDeclarations(prev => {
      const existing = prev.find(d => d.id === declaration.id);
      if (existing) {
        return prev.map(d => d.id === declaration.id ? updatedDeclaration : d);
      } else {
        return [...prev, updatedDeclaration];
      }
    });
    
    setShowCreateForm(false);
    alert(`Déclaration soumise avec succès!\nNuméro de référence: ${updatedDeclaration.referenceNumber}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'pending': return '#f59e0b';
      case 'submitted': return '#3b82f6';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'pending': return 'En attente';
      case 'submitted': return 'Soumise';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'workplace_accident': return 'Accident de travail';
      case 'near_miss': return 'Événement sans blessure';
      case 'vehicle_accident': return 'Accident de véhicule';
      case 'first_aid': return 'Premiers secours';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workplace_accident': return AlertTriangle;
      case 'near_miss': return Shield;
      case 'vehicle_accident': return FileText;
      case 'first_aid': return CheckCircle;
      default: return FileText;
    }
  };

  if (showCreateForm) {
    return (
      <AccidentDeclarationSystem
        organizationId={tenant}
        userProvinces={client?.provinces || ['QC']}
        currentProvince={client?.currentProvince}
        onSave={handleSaveDeclaration}
        onSubmit={handleSubmitDeclaration}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href={`/${tenant}/dashboard`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              <ArrowLeft size={16} />
              Retour au dashboard
            </Link>
            
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Déclarations d'Accidents
            </h1>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={20} />
            Nouvelle Déclaration
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '14px' }}>
              Total déclarations
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#e2e8f0' }}>
              {declarations.length}
            </p>
          </div>
          
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '14px' }}>
              En cours
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {declarations.filter(d => d.status === 'draft' || d.status === 'pending').length}
            </p>
          </div>
          
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '14px' }}>
              Soumises
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {declarations.filter(d => d.status === 'submitted' || d.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Liste des déclarations */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>
              Historique des déclarations
            </h2>
          </div>
          
          {declarations.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0' }}>Aucune déclaration</h3>
              <p style={{ margin: 0 }}>
                Cliquez sur "Nouvelle Déclaration" pour commencer
              </p>
            </div>
          ) : (
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {declarations.map((declaration) => {
                  const TypeIcon = getTypeIcon(declaration.type);
                  return (
                    <div
                      key={declaration.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <TypeIcon size={24} style={{ color: getStatusColor(declaration.status) }} />
                        
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                            {getTypeText(declaration.type)}
                          </h4>
                          <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '14px' }}>
                            {declaration.referenceNumber || declaration.id}
                          </p>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                            Créé le {declaration.createdAt.toLocaleDateString('fr-CA')}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          background: getStatusColor(declaration.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}>
                          {getStatusText(declaration.status)}
                        </div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                          Province: {declaration.province}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}