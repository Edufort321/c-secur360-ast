'use client';

import { useState, useEffect } from 'react';
import { CANADIAN_PROVINCES, getProvinceByCode, getProvinceRequirements } from '../../data/provinces';
import { 
  AlertTriangle, 
  FileText, 
  User, 
  MapPin,
  Camera,
  Clock,
  Shield,
  ChevronRight,
  Save,
  Send
} from 'lucide-react';

export interface AccidentDeclaration {
  id: string;
  organizationId: string;
  type: 'workplace_accident' | 'near_miss' | 'vehicle_accident' | 'first_aid';
  province: string;
  status: 'draft' | 'pending' | 'submitted' | 'approved' | 'rejected';
  formData: any;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  referenceNumber?: string;
}

interface AccidentDeclarationSystemProps {
  organizationId: string;
  userProvinces: string[];
  currentProvince?: string;
  onSave?: (declaration: AccidentDeclaration) => void;
  onSubmit?: (declaration: AccidentDeclaration) => void;
}

export default function AccidentDeclarationSystem({
  organizationId,
  userProvinces,
  currentProvince,
  onSave,
  onSubmit
}: AccidentDeclarationSystemProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>(currentProvince || userProvinces[0] || '');
  const [currentDeclaration, setCurrentDeclaration] = useState<AccidentDeclaration | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(true);

  // Configuration des types de déclarations
  const declarationTypes = [
    {
      id: 'workplace_accident',
      title: 'Accident de travail',
      titleEn: 'Workplace Accident',
      description: 'Déclaration d\'accident survenu en milieu de travail avec ou sans blessure',
      descriptionEn: 'Declaration of accident that occurred in the workplace with or without injury',
      icon: AlertTriangle,
      color: '#ef4444',
      priority: 'high',
      deadline: selectedProvince === 'QC' ? '48 heures' : '72 heures',
      forms: selectedProvince === 'QC' ? ['CNESST ADR'] : selectedProvince === 'ON' ? ['WSIB Form 7'] : ['WCB Report']
    },
    {
      id: 'near_miss',
      title: 'Événement sans blessure',
      titleEn: 'Near Miss Event',
      description: 'Incident qui aurait pu causer une blessure mais qui n\'en a pas causé',
      descriptionEn: 'Incident that could have caused injury but did not',
      icon: Shield,
      color: '#f59e0b',
      priority: 'medium',
      deadline: 'Aucun délai légal',
      forms: ['Rapport interne']
    },
    {
      id: 'vehicle_accident',
      title: 'Accident de véhicule',
      titleEn: 'Vehicle Accident',
      description: 'Constat amiable ou déclaration d\'accident impliquant un véhicule de l\'entreprise',
      descriptionEn: 'Amicable report or accident declaration involving a company vehicle',
      icon: MapPin,
      color: '#8b5cf6',
      priority: 'high',
      deadline: '24 heures',
      forms: ['Constat amiable', 'Rapport de police']
    },
    {
      id: 'first_aid',
      title: 'Soins de premiers secours',
      titleEn: 'First Aid',
      description: 'Enregistrement des soins de premiers secours administrés',
      descriptionEn: 'Record of first aid administered',
      icon: User,
      color: '#10b981',
      priority: 'low',
      deadline: 'Aucun délai',
      forms: ['Registre premiers secours']
    }
  ];

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    
    // Créer une nouvelle déclaration
    const newDeclaration: AccidentDeclaration = {
      id: `decl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      type: type as any,
      province: selectedProvince,
      status: 'draft',
      formData: {
        basicInfo: {
          declarationType: type,
          province: selectedProvince,
          createdAt: new Date().toISOString()
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentDeclaration(newDeclaration);
    setShowTypeSelector(false);
  };

  const provinceInfo = getProvinceByCode(selectedProvince);
  const provinceRequirements = getProvinceRequirements(selectedProvince);

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
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Système de Déclaration d'Accidents
          </h1>
          
          {/* Sélecteur de province */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontSize: '14px', color: '#94a3b8' }}>
              Province active:
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {userProvinces.map(code => {
                const province = getProvinceByCode(code);
                return (
                  <option key={code} value={code}>
                    {province ? `${province.nameFr} (${code})` : code}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Info province */}
      {provinceInfo && (
        <div style={{
          padding: '16px 24px',
          background: `linear-gradient(90deg, ${provinceInfo.color}20, transparent)`,
          borderLeft: `4px solid ${provinceInfo.color}`
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0' }}>
              <strong>{provinceInfo.safetyAgencyFr}</strong> - Formulaires adaptés aux normes de {provinceInfo.nameFr}
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {showTypeSelector ? (
          /* Sélecteur de type de déclaration */
          <div>
            <h2 style={{
              fontSize: '24px',
              margin: '0 0 32px 0',
              textAlign: 'center'
            }}>
              Quel type de déclaration souhaitez-vous créer ?
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {declarationTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleTypeSelection(type.id)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: `2px solid ${type.color}40`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${type.color}40`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: type.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {type.priority}
                  </div>
                  
                  <type.icon size={48} style={{ color: type.color, marginBottom: '16px' }} />
                  
                  <h3 style={{
                    fontSize: '20px',
                    margin: '0 0 8px 0',
                    color: type.color
                  }}>
                    {type.title}
                  </h3>
                  
                  <p style={{
                    color: '#94a3b8',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5'
                  }}>
                    {type.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    <div>
                      <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {type.deadline}
                    </div>
                    <ChevronRight size={16} />
                  </div>
                  
                  <div style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}>
                    <FileText size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Formulaires: {type.forms.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Formulaire de déclaration */
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <button
                onClick={() => {
                  setShowTypeSelector(true);
                  setCurrentDeclaration(null);
                  setSelectedType('');
                }}
                style={{
                  background: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  color: '#94a3b8',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Retour à la sélection
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => onSave?.(currentDeclaration!)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={16} />
                  Sauvegarder
                </button>
                
                <button
                  onClick={() => onSubmit?.(currentDeclaration!)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={16} />
                  Soumettre
                </button>
              </div>
            </div>
            
            {/* Contenu du formulaire basé sur le type */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)'
            }}>
              <h2 style={{ margin: '0 0 24px 0' }}>
                {declarationTypes.find(t => t.id === selectedType)?.title}
              </h2>
              
              {/* Placeholder pour le formulaire spécifique */}
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                Formulaire de {selectedType} pour la province {selectedProvince} - En cours de développement
              </p>
              
              {provinceRequirements && (
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#60a5fa' }}>
                    Exigences pour {provinceInfo?.nameFr}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {provinceRequirements.requiredFields.map((field, index) => (
                      <li key={index} style={{ color: '#93c5fd', marginBottom: '4px' }}>
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}