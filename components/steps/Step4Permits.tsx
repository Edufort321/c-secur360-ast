"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, Trash2, Edit, Grid, List
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
}

interface Permit {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  requiredBy: { fr: string; en: string };
  status: 'pending' | 'in-progress' | 'completed' | 'requires-review';
  compliance: {
    federal: boolean;
    provincial: boolean;
    municipal: boolean;
    industry: boolean;
  };
  sections: PermitSection[];
  workers: WorkerEntry[];
  attachments: string[];
  validUntil?: string;
  issuedBy?: string;
  violations?: string[];
}

interface PermitSection {
  id: string;
  title: { fr: string; en: string };
  fields: PermitField[];
  required: boolean;
}

interface PermitField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'time' | 'textarea' | 'signature';
  label: { fr: string; en: string };
  placeholder?: { fr: string; en: string };
  required: boolean;
  options?: { value: string; label: { fr: string; en: string } }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

interface WorkerEntry {
  id: string;
  name: string;
  employeeId: string;
  age: number;
  certifications: string[];
  entryTime?: string;
  exitTime?: string;
  supervisorApproval: boolean;
}

interface PhotoEntry {
  id: number;
  url: string;
  name: string;
  size: number;
  description: string;
  timestamp: string;
  gpsLocation?: string;
}

// =================== DONNÉES PERMIS CONFORMES 2024-2025 ===================
const PERMITS_DATABASE: Permit[] = [
  {
    id: 'confined-space-entry-2025',
    title: {
      fr: '🛡️ Permis Entrée Espace Clos RSST 2023',
      en: '🛡️ Confined Space Entry Permit RSST 2023'
    },
    description: {
      fr: 'Permis conforme au Règlement sur la santé et la sécurité du travail (RSST) Art. 297-312 modifié en 2023',
      en: 'Permit compliant with Occupational Health and Safety Regulation (RSST) Art. 297-312 modified in 2023'
    },
    category: 'safety-critical',
    priority: 'critical',
    estimatedTime: '45-60 minutes',
    requiredBy: {
      fr: 'CNESST Québec - RSST Art. 297-312 (2023)',
      en: 'CNESST Quebec - RSST Art. 297-312 (2023)'
    },
    status: 'pending',
    compliance: {
      federal: true,
      provincial: true,
      municipal: true,
      industry: true
    },
    sections: [
      {
        id: 'space-identification',
        title: {
          fr: '🏢 Identification de l\'Espace Clos',
          en: '🏢 Confined Space Identification'
        },
        required: true,
        fields: [
          {
            id: 'space-location',
            type: 'text',
            label: { fr: 'Localisation précise de l\'espace clos', en: 'Precise location of confined space' },
            placeholder: { fr: 'Ex: Réservoir #3, Sous-sol bâtiment A...', en: 'Ex: Tank #3, Building A basement...' },
            required: true
          },
          {
            id: 'space-dimensions',
            type: 'text',
            label: { fr: 'Dimensions (L x l x H en mètres)', en: 'Dimensions (L x W x H in meters)' },
            required: true,
            validation: { pattern: '^[0-9.,x ]+$' }
          },
          {
            id: 'access-method',
            type: 'select',
            label: { fr: 'Méthode d\'accès principale', en: 'Primary access method' },
            required: true,
            options: [
              { value: 'ladder', label: { fr: 'Échelle fixe', en: 'Fixed ladder' } },
              { value: 'portable-ladder', label: { fr: 'Échelle portable', en: 'Portable ladder' } },
              { value: 'hoist', label: { fr: 'Treuil/Palan', en: 'Hoist/Winch' } },
              { value: 'walkway', label: { fr: 'Passerelle', en: 'Walkway' } },
              { value: 'other', label: { fr: 'Autre (spécifier)', en: 'Other (specify)' } }
            ]
          }
        ]
      },
      {
        id: 'atmospheric-monitoring',
        title: {
          fr: '🌬️ Surveillance Atmosphérique (RSST Art. 300)',
          en: '🌬️ Atmospheric Monitoring (RSST Art. 300)'
        },
        required: true,
        fields: [
          {
            id: 'oxygen-level',
            type: 'number',
            label: { fr: 'Niveau O₂ (%)', en: 'O₂ Level (%)' },
            required: true,
            validation: { min: 19.5, max: 23.5 }
          },
          {
            id: 'co-level',
            type: 'number',
            label: { fr: 'Niveau CO (ppm)', en: 'CO Level (ppm)' },
            required: true,
            validation: { max: 35 }
          },
          {
            id: 'h2s-level',
            type: 'number',
            label: { fr: 'Niveau H₂S (ppm)', en: 'H₂S Level (ppm)' },
            required: true,
            validation: { max: 10 }
          },
          {
            id: 'lel-level',
            type: 'number',
            label: { fr: 'Limite explosive inférieure (%)', en: 'Lower Explosive Limit (%)' },
            required: true,
            validation: { max: 10 }
          },
          {
            id: 'monitor-calibration',
            type: 'date',
            label: { fr: 'Date dernière calibration détecteur', en: 'Last detector calibration date' },
            required: true
          }
        ]
      }
    ],
    workers: [],
    attachments: []
  },
  {
    id: 'hot-work-permit-nfpa2019',
    title: {
      fr: '🔥 Permis Travail à Chaud NFPA 51B-2019',
      en: '🔥 Hot Work Permit NFPA 51B-2019'
    },
    description: {
      fr: 'Permis conforme à la norme NFPA 51B-2019 pour travaux de soudage, découpage et travail à chaud',
      en: 'Permit compliant with NFPA 51B-2019 standard for welding, cutting and hot work operations'
    },
    category: 'fire-safety',
    priority: 'critical',
    estimatedTime: '30-45 minutes',
    requiredBy: {
      fr: 'NFPA 51B-2019 Standard + Autorités Provinciales',
      en: 'NFPA 51B-2019 Standard + Provincial Authorities'
    },
    status: 'pending',
    compliance: {
      federal: true,
      provincial: true,
      municipal: true,
      industry: true
    },
    sections: [
      {
        id: 'work-description',
        title: {
          fr: '⚒️ Description des Travaux',
          en: '⚒️ Work Description'
        },
        required: true,
        fields: [
          {
            id: 'work-type',
            type: 'select',
            label: { fr: 'Type de travail à chaud', en: 'Type of hot work' },
            required: true,
            options: [
              { value: 'welding', label: { fr: 'Soudage', en: 'Welding' } },
              { value: 'cutting', label: { fr: 'Découpage', en: 'Cutting' } },
              { value: 'brazing', label: { fr: 'Brasage', en: 'Brazing' } },
              { value: 'grinding', label: { fr: 'Meulage', en: 'Grinding' } },
              { value: 'torch-work', label: { fr: 'Travail au chalumeau', en: 'Torch work' } }
            ]
          },
          {
            id: 'work-duration',
            type: 'text',
            label: { fr: 'Durée estimée des travaux', en: 'Estimated work duration' },
            required: true
          }
        ]
      },
      {
        id: 'fire-safety-measures',
        title: {
          fr: '🚒 Mesures de Prévention Incendie (NFPA 51B Art. 4.3)',
          en: '🚒 Fire Prevention Measures (NFPA 51B Art. 4.3)'
        },
        required: true,
        fields: [
          {
            id: 'fire-extinguisher-present',
            type: 'checkbox',
            label: { fr: 'Extincteur approprié présent sur le site', en: 'Appropriate fire extinguisher present on site' },
            required: true
          },
          {
            id: 'fire-watch-assigned',
            type: 'checkbox',
            label: { fr: 'Garde incendie assigné', en: 'Fire watch assigned' },
            required: true
          },
          {
            id: 'combustible-materials-removed',
            type: 'checkbox',
            label: { fr: 'Matériaux combustibles retirés dans un rayon de 11 mètres', en: 'Combustible materials removed within 35 feet' },
            required: true
          }
        ]
      }
    ],
    workers: [],
    attachments: []
  },
  {
    id: 'excavation-permit-municipal-2024',
    title: {
      fr: '🏗️ Permis Excavation Municipal 2024',
      en: '🏗️ Municipal Excavation Permit 2024'
    },
    description: {
      fr: 'Permis d\'excavation conforme aux règlements municipaux 2024 et normes de sécurité provinciales',
      en: 'Excavation permit compliant with 2024 municipal regulations and provincial safety standards'
    },
    category: 'municipal',
    priority: 'high',
    estimatedTime: '25-35 minutes',
    requiredBy: {
      fr: 'Réglementation Municipale 2024 + Normes Provinciales',
      en: 'Municipal Regulation 2024 + Provincial Standards'
    },
    status: 'pending',
    compliance: {
      federal: false,
      provincial: true,
      municipal: true,
      industry: true
    },
    sections: [
      {
        id: 'excavation-details',
        title: {
          fr: '🎯 Détails de l\'Excavation',
          en: '🎯 Excavation Details'
        },
        required: true,
        fields: [
          {
            id: 'excavation-depth',
            type: 'number',
            label: { fr: 'Profondeur d\'excavation (mètres)', en: 'Excavation depth (meters)' },
            required: true,
            validation: { min: 0.1, max: 50 }
          },
          {
            id: 'excavation-area',
            type: 'number',
            label: { fr: 'Surface d\'excavation (m²)', en: 'Excavation area (m²)' },
            required: true,
            validation: { min: 1 }
          },
          {
            id: 'soil-type',
            type: 'select',
            label: { fr: 'Type de sol', en: 'Soil type' },
            required: true,
            options: [
              { value: 'clay', label: { fr: 'Argile', en: 'Clay' } },
              { value: 'sand', label: { fr: 'Sable', en: 'Sand' } },
              { value: 'rock', label: { fr: 'Roche', en: 'Rock' } },
              { value: 'mixed', label: { fr: 'Mixte', en: 'Mixed' } }
            ]
          }
        ]
      }
    ],
    workers: [],
    attachments: []
  }
];

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ 
  formData, 
  onDataChange, 
  language, 
  tenant, 
  errors 
}) => {
  // États du composant
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedPermits, setSelectedPermits] = useState<Set<string>>(new Set());
  const [expandedPermit, setExpandedPermit] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Record<string, WorkerEntry[]>>({});
  const [photos, setPhotos] = useState<Record<string, PhotoEntry[]>>({});

  // Traductions
  const texts = {
    fr: {
      title: 'Permis et Autorisations Requis',
      subtitle: 'Sélectionnez et complétez les permis conformes aux réglementations 2024-2025',
      search: 'Rechercher permis...',
      filters: {
        category: 'Catégorie',
        priority: 'Priorité',
        all: 'Tous',
        safetyCritical: 'Sécurité Critique',
        fireSafety: 'Sécurité Incendie',
        municipal: 'Municipal',
        critical: 'Critique',
        high: 'Élevée',
        medium: 'Moyenne',
        low: 'Faible'
      },
      stats: {
        selected: 'Sélectionnés',
        completed: 'Complétés',
        critical: 'Critiques',
        compliance: 'Conformité'
      },
      actions: {
        select: 'Sélectionner',
        deselect: 'Désélectionner',
        fill: 'Remplir',
        validate: 'Valider',
        download: 'Télécharger'
      },
      status: {
        pending: 'En attente',
        inProgress: 'En cours',
        completed: 'Complété',
        requiresReview: 'Révision requise'
      }
    },
    en: {
      title: 'Required Permits and Authorizations',
      subtitle: 'Select and complete permits compliant with 2024-2025 regulations',
      search: 'Search permits...',
      filters: {
        category: 'Category',
        priority: 'Priority',
        all: 'All',
        safetycrítico: 'Safety Critical',
        fireSafety: 'Fire Safety',
        municipal: 'Municipal',
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      },
      stats: {
        selected: 'Selected',
        completed: 'Completed',
        critical: 'Critical',
        compliance: 'Compliance'
      },
      actions: {
        select: 'Select',
        deselect: 'Deselect',
        fill: 'Fill',
        validate: 'Validate',
        download: 'Download'
      },
      status: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        requiresReview: 'Requires Review'
      }
    }
  };

  const t = texts[language];

  // Fonction pour basculer la sélection d'un permis
  const togglePermit = (permitId: string) => {
    const newSelected = new Set(selectedPermits);
    if (newSelected.has(permitId)) {
      newSelected.delete(permitId);
    } else {
      newSelected.add(permitId);
    }
    setSelectedPermits(newSelected);
    
    // Sauvegarder dans formData
    onDataChange('permits', {
      ...formData,
      selectedPermits: Array.from(newSelected)
    });
  };

  // Filtrage des permis
  const filteredPermits = useMemo(() => {
    return PERMITS_DATABASE.filter(permit => {
      const matchesSearch = permit.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description[language].toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || permit.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [searchTerm, selectedCategory, selectedPriority, language]);

  // Statistiques
  const stats = useMemo(() => {
    const selected = selectedPermits.size;
    const completed = Array.from(selectedPermits).filter(id => 
      PERMITS_DATABASE.find(p => p.id === id)?.status === 'completed'
    ).length;
    const critical = Array.from(selectedPermits).filter(id => 
      PERMITS_DATABASE.find(p => p.id === id)?.priority === 'critical'
    ).length;
    const compliance = selected > 0 ? Math.round((completed / selected) * 100) : 0;
    
    return { selected, completed, critical, compliance };
  }, [selectedPermits]);

  // Rendu du composant principal
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0'
          }}>
            📋 {t.title}
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '16px',
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {t.subtitle}
          </p>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {[
            { key: 'selected', value: stats.selected, icon: '📊', color: '#3b82f6' },
            { key: 'completed', value: stats.completed, icon: '✅', color: '#22c55e' },
            { key: 'critical', value: stats.critical, icon: '🚨', color: '#ef4444' },
            { key: 'compliance', value: `${stats.compliance}%`, icon: '🛡️', color: '#8b5cf6' }
          ].map(stat => (
            <div key={stat.key} style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                {t.stats[stat.key as keyof typeof t.stats]}
              </div>
            </div>
          ))}
        </div>

        {/* Contrôles */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          >
            <option value="all">{t.filters.all}</option>
            <option value="safety-critical">{t.filters.safetyCatego}</option>
            <option value="fire-safety">{t.filters.fireSafety}</option>
            <option value="municipal">{t.filters.municipal}</option>
          </select>
        </div>

        {/* Liste des permis */}
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {filteredPermits.map(permit => (
            <div
              key={permit.id}
              style={{
                background: selectedPermits.has(permit.id)
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
                  : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
                border: selectedPermits.has(permit.id)
                  ? '2px solid rgba(59, 130, 246, 0.5)'
                  : '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => togglePermit(permit.id)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: '700',
                    margin: '0 0 8px 0'
                  }}>
                    {permit.title[language]}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    {permit.description[language]}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: permit.priority === 'critical' ? '#ef4444' : 
                                   permit.priority === 'high' ? '#f59e0b' :
                                   permit.priority === 'medium' ? '#3b82f6' : '#6b7280',
                    color: 'white'
                  }}>
                    {permit.priority.toUpperCase()}
                  </span>
                  
                  {selectedPermits.has(permit.id) ? (
                    <CheckCircle size={24} style={{ color: '#22c55e' }} />
                  ) : (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid rgba(100, 116, 139, 0.5)',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '12px',
                  color: '#94a3b8'
                }}>
                  <span>⏱️ {permit.estimatedTime}</span>
                  <span>📋 {permit.requiredBy[language]}</span>
                </div>
                
                {selectedPermits.has(permit.id) && (
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      {t.actions.fill}
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      {t.actions.validate}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredPermits.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', margin: 0 }}>
              Aucun permis trouvé avec les critères actuels
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Permits;
