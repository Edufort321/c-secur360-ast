import React, { useState, useMemo } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface Permit {
  id: string;
  name: string;
  category: string;
  description: string;
  authority: string;
  province: string[];
  required: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  cost: string;
  processingTime: string;
  renewalRequired: boolean;
  renewalPeriod?: string;
  legislation: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  selected: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  formData?: any;
  formFields?: FormField[];
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'signature' | 'workers_tracking' | 'time_picker' | 'photo_gallery';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  section?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface WorkerEntry {
  id: number;
  name: string;
  entryTime: string;
  exitTime: string | null;
  date: string;
}

interface PhotoEntry {
  id: number;
  url: string;
  name: string;
  timestamp: string;
  description: string;
}

interface SignatureMetadata {
  name: string;
  date: string;
  time: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// =================== BASE DE DONNÉES PERMIS RÉELS ===================
const realPermitsDatabase: Permit[] = [
  {
    id: 'confined-space-entry',
    name: 'Fiche de Contrôle en Espace Clos',
    category: 'Sécurité',
    description: 'Permis d\'entrée obligatoire pour tous travaux en espace clos selon RSST et CSTC',
    authority: 'Employeur / ASP Construction',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: 'Maximum 8 heures ou fin des travaux',
    cost: 'Inclus dans formation',
    processingTime: 'Avant chaque entrée',
    renewalRequired: true,
    renewalPeriod: 'Quotidien',
    legislation: 'RSST Art. 297-312, CSTC Section 3.21',
    contactInfo: {
      phone: '514-355-6190',
      website: 'https://www.asp-construction.org'
    },
    selected: false,
    status: 'pending',
    formFields: [
      { id: 'space_identification', type: 'text', label: 'Identification de l\'espace clos', required: true, section: 'identification', placeholder: 'Ex: Réservoir A-12, Regard municipal...' },
      { id: 'project_name', type: 'text', label: 'Nom du projet', required: true, section: 'identification' },
      { id: 'location', type: 'text', label: 'Localisation exacte', required: true, section: 'identification' },
      { id: 'permit_date', type: 'date', label: 'Date du permis', required: true, section: 'identification' },
      { id: 'permit_time', type: 'time_picker', label: 'Heure d\'émission', required: true, section: 'identification' },
      { id: 'photos_documentation', type: 'photo_gallery', label: 'Photos de documentation', required: false, section: 'atmosphere' },
      { id: 'workers_log', type: 'workers_tracking', label: 'Registre des entrées/sorties', required: true, section: 'signatures' },
      { id: 'supervisor_signature', type: 'signature', label: 'Signature du surveillant', required: true, section: 'signatures' },
      { id: 'qualified_signature', type: 'signature', label: 'Signature de la personne qualifiée', required: true, section: 'signatures' }
    ]
  }
];

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Permis & Autorisations Réels',
    subtitle: 'Formulaires authentiques de permis utilisés au Canada',
    searchPlaceholder: 'Rechercher un permis...',
    allCategories: 'Toutes catégories',
    allProvinces: 'Toutes provinces',
    categories: {
      'Sécurité': 'Sécurité',
      'Construction': 'Construction'
    },
    priorities: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique'
    },
    statuses: {
      pending: 'En attente',
      submitted: 'Soumis',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      expired: 'Expiré'
    },
    sections: {
      identification: 'Identification',
      atmosphere: 'Atmosphère',
      signatures: 'Signatures'
    }
  },
  en: {
    title: 'Real Permits & Authorizations',
    subtitle: 'Authentic permit forms used in Canada',
    searchPlaceholder: 'Search permits...',
    allCategories: 'All categories',
    allProvinces: 'All provinces',
    categories: {
      'Sécurité': 'Safety',
      'Construction': 'Construction'
    },
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    },
    statuses: {
      pending: 'Pending',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected',
      expired: 'Expired'
    },
    sections: {
      identification: 'Identification',
      atmosphere: 'Atmosphere',
      signatures: 'Signatures'
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4RealPermits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  const t = translations[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return realPermitsDatabase;
  });
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});

  // Filtrage des permis
  const filteredPermits = permits.filter((permit: Permit) => {
    const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.authority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
    const matchesProvince = selectedProvince === 'all' || permit.province.includes(selectedProvince);
    return matchesSearch && matchesCategory && matchesProvince;
  });

  // Catégories et provinces uniques
  const categories = Array.from(new Set(permits.map((p: Permit) => p.category))) as string[];
  const provinces = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  
  // Permis sélectionnés
  const selectedPermits = permits.filter((p: Permit) => p.selected);

  // Statistiques
  const stats = useMemo(() => ({
    totalPermits: permits.length,
    selected: selectedPermits.length,
    critical: selectedPermits.filter((p: Permit) => p.priority === 'critical').length,
    pending: selectedPermits.filter((p: Permit) => p.status === 'pending').length
  }), [permits, selectedPermits]);

  // =================== HANDLERS ===================
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map((permit: Permit) => 
      permit.id === permitId 
        ? { ...permit, selected: !permit.selected }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: Permit[]) => {
    const selectedList = updatedPermits.filter((p: Permit) => p.selected);
    
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: updatedPermits.length,
        selected: selectedList.length,
        critical: selectedList.filter((p: Permit) => p.priority === 'critical').length,
        pending: selectedList.filter((p: Permit) => p.status === 'pending').length
      }
    };
    
    onDataChange('permits', permitsData);
  };

  const handleFormFieldChange = (permitId: string, fieldId: string, value: any) => {
    const updatedPermits = permits.map((permit: Permit) => {
      if (permit.id === permitId) {
        const newFormData = {
          ...permit.formData,
          [fieldId]: value
        };
        
        return {
          ...permit,
          formData: newFormData
        };
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const toggleFormExpansion = (permitId: string) => {
    setExpandedForms(prev => ({
      ...prev,
      [permitId]: !prev[permitId]
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sécurité': return '🛡️';
      case 'Construction': return '🏗️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'submitted': return '#3b82f6';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // =================== COMPOSANT FORMULAIRE ===================
  const PermitForm = ({ permit }: { permit: Permit }) => {
    const isExpanded = expandedForms[permit.id];
    if (!isExpanded) return null;

    // Grouper les champs par section
    const fieldsBySection = permit.formFields?.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {} as { [key: string]: FormField[] }) || {};

    const renderField = (field: FormField) => {
      const value = permit.formData?.[field.id] || '';
      
      switch (field.type) {
        case 'text':
        case 'number':
          return (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              placeholder={field.placeholder}
              required={field.required}
              className="form-input"
            />
          );
        
        case 'date':
        case 'time':
          return (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => {
                e.stopPropagation();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              required={field.required}
              className="form-input"
            />
          );
        
        case 'time_picker':
          const [showTimePicker, setShowTimePicker] = useState(false);
          const currentTime = value || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div className="time-picker-container">
              <div 
                className="time-display"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimePicker(!showTimePicker);
                }}
              >
                <span className="time-value">{currentTime}</span>
                <span className="time-icon">🕐</span>
              </div>
              
              {showTimePicker && (
                <div className="time-picker-dropdown">
                  <div className="time-picker-header">
                    <span>Sélectionner l'heure</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTimePicker(false);
                      }}
                      className="time-picker-close"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="time-picker-actions">
                    <button
                      type="button"
                      className="time-picker-now"
                      onClick={(e) => {
                        e.stopPropagation();
                        const now = new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
                        handleFormFieldChange(permit.id, field.id, now);
                        setShowTimePicker(false);
                      }}
                    >
                      Maintenant
                    </button>
                    <button
                      type="button"
                      className="time-picker-ok"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTimePicker(false);
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'workers_tracking':
          const workersLog: WorkerEntry[] = Array.isArray(value) ? value : [];
          return (
            <div className="workers-tracking-container">
              <div className="worker-entry-form">
                <div className="worker-entry-inputs">
                  <input
                    type="text"
                    placeholder="Nom du travailleur"
                    className="worker-name-input"
                    onKeyPress={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const container = (e.target as HTMLElement).closest('.worker-entry-form');
                        const nameInput = container?.querySelector('.worker-name-input') as HTMLInputElement;
                        const timeInput = container?.querySelector('.worker-time-input') as HTMLInputElement;
                        
                        if (nameInput?.value.trim()) {
                          const newEntry: WorkerEntry = {
                            id: Date.now(),
                            name: nameInput.value.trim(),
                            entryTime: timeInput.value || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
                            exitTime: null,
                            date: new Date().toLocaleDateString('fr-CA')
                          };
                          const updatedLog = [...workersLog, newEntry];
                          handleFormFieldChange(permit.id, field.id, updatedLog);
                          nameInput.value = '';
                          timeInput.value = '';
                        }
                      }
                    }}
                  />
                  <input
                    type="time"
                    className="worker-time-input"
                  />
                  <button
                    type="button"
                    className="worker-entry-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const container = (e.target as HTMLElement).closest('.worker-entry-form');
                      const nameInput = container?.querySelector('.worker-name-input') as HTMLInputElement;
                      const timeInput = container?.querySelector('.worker-time-input') as HTMLInputElement;
                      
                      if (nameInput?.value.trim()) {
                        const newEntry: WorkerEntry = {
                          id: Date.now(),
                          name: nameInput.value.trim(),
                          entryTime: timeInput.value || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
                          exitTime: null,
                          date: new Date().toLocaleDateString('fr-CA')
                        };
                        const updatedLog = [...workersLog, newEntry];
                        handleFormFieldChange(permit.id, field.id, updatedLog);
                        nameInput.value = '';
                        timeInput.value = '';
                      }
                    }}
                  >
                    Enregistrer entrée
                  </button>
                </div>
              </div>
              
              <div className="workers-log-list">
                <h5>Registre des entrées/sorties</h5>
                {workersLog.length === 0 ? (
                  <p className="no-entries">Aucune entrée enregistrée</p>
                ) : (
                  <div className="workers-table">
                    <div className="workers-table-header">
                      <span>Nom</span>
                      <span>Entrée</span>
                      <span>Sortie</span>
                      <span>Actions</span>
                    </div>
                    {workersLog.map((worker: WorkerEntry) => (
                      <div key={worker.id} className="workers-table-row">
                        <span className="worker-name">{worker.name}</span>
                        <span className="worker-time">{worker.entryTime}</span>
                        <span className="worker-time">
                          {worker.exitTime || (
                            <button
                              type="button"
                              className="exit-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const updatedLog = workersLog.map((w: WorkerEntry) =>
                                  w.id === worker.id
                                    ? { ...w, exitTime: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
                                    : w
                                );
                                handleFormFieldChange(permit.id, field.id, updatedLog);
                              }}
                            >
                              Sortie
                            </button>
                          )}
                        </span>
                        <span>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const updatedLog = workersLog.filter((w: WorkerEntry) => w.id !== worker.id);
                              handleFormFieldChange(permit.id, field.id, updatedLog);
                            }}
                          >
                            Supprimer
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        
        case 'photo_gallery':
          const photos: PhotoEntry[] = Array.isArray(value) ? value : [];
          const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
          
          return (
            <div className="photo-gallery-container">
              <div className="photo-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="photo-input"
                  id={`photo-input-${field.id}`}
                  onChange={(e) => {
                    e.stopPropagation();
                    const files = Array.from(e.target.files || []);
                    
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newPhoto: PhotoEntry = {
                          id: Date.now() + Math.random(),
                          url: event.target?.result as string,
                          name: file.name,
                          timestamp: new Date().toISOString(),
                          description: ''
                        };
                        const updatedPhotos = [...photos, newPhoto];
                        handleFormFieldChange(permit.id, field.id, updatedPhotos);
                      };
                      reader.readAsDataURL(file);
                    });
                    
                    // Reset input
                    (e.target as HTMLInputElement).value = '';
                  }}
                  style={{ display: 'none' }}
                />
                
                <div className="photo-upload-buttons">
                  <button
                    type="button"
                    className="photo-upload-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      document.getElementById(`photo-input-${field.id}`)?.click();
                    }}
                  >
                    📷 Ajouter des photos
                  </button>
                </div>
              </div>
              
              {photos.length > 0 && (
                <div className="photo-gallery">
                  <div className="photo-carousel">
                    <div className="photo-main-container">
                      <div className="photo-main">
                        <img
                          src={photos[currentPhotoIndex]?.url}
                          alt={photos[currentPhotoIndex]?.name}
                          className="photo-main-image"
                        />
                        <div className="photo-info">
                          <div className="photo-name">{photos[currentPhotoIndex]?.name}</div>
                          <div className="photo-timestamp">
                            {new Date(photos[currentPhotoIndex]?.timestamp).toLocaleString('fr-CA')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="photo-gallery-info">
                    <span className="photo-count">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'signature':
          const signatureValue = permit.formData?.[field.id] || '';
          const signatureMetadata: SignatureMetadata | undefined = permit.formData?.[field.id + '_metadata'];
          
          return (
            <div className="signature-field">
              <div className="signature-pad">
                {signatureValue ? (
                  <div className="signature-content">
                    <div className="signature-text">✓ Signé par : {signatureValue}</div>
                    <div className="signature-timestamp">
                      Le {signatureMetadata?.date || new Date().toLocaleDateString('fr-CA')} à {signatureMetadata?.time || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <span className="signature-placeholder">
                    Signature électronique requise
                  </span>
                )}
              </div>
              <div className="signature-controls">
                <input
                  type="text"
                  placeholder="Entrez votre nom complet"
                  className="signature-name-input"
                  onKeyPress={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      e.preventDefault();
                      const signerName = (e.target as HTMLInputElement).value.trim();
                      const timestamp = new Date();
                      const fullSignature: SignatureMetadata = {
                        name: signerName,
                        date: timestamp.toLocaleDateString('fr-CA'),
                        time: timestamp.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: timestamp.toISOString(),
                        ipAddress: 'XXX.XXX.XXX.XXX',
                        userAgent: navigator.userAgent
                      };
                      
                      // Mise à jour atomique en une seule opération
                      const updatedPermits = permits.map((permitItem: Permit) => {
                        if (permitItem.id === permit.id) {
                          return {
                            ...permitItem,
                            formData: {
                              ...permitItem.formData,
                              [field.id]: signerName,
                              [field.id + '_metadata']: fullSignature
                            }
                          };
                        }
                        return permitItem;
                      });
                      
                      setPermits(updatedPermits);
                      updateFormData(updatedPermits);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="signature-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = (e.target as HTMLElement).parentElement?.querySelector('.signature-name-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const signerName = input.value.trim();
                      const timestamp = new Date();
                      const fullSignature: SignatureMetadata = {
                        name: signerName,
                        date: timestamp.toLocaleDateString('fr-CA'),
                        time: timestamp.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: timestamp.toISOString(),
                        ipAddress: 'XXX.XXX.XXX.XXX',
                        userAgent: navigator.userAgent
                      };
                      
                      // Mise à jour atomique en une seule opération
                      const updatedPermits = permits.map((permitItem: Permit) => {
                        if (permitItem.id === permit.id) {
                          return {
                            ...permitItem,
                            formData: {
                              ...permitItem.formData,
                              [field.id]: signerName,
                              [field.id + '_metadata']: fullSignature
                            }
                          };
                        }
                        return permitItem;
                      });
                      
                      setPermits(updatedPermits);
                      updateFormData(updatedPermits);
                      input.value = '';
                    } else {
                      alert('Veuillez entrer votre nom complet pour signer');
                    }
                  }}
                >
                  Signer électroniquement
                </button>
                {signatureValue && (
                  <button 
                    type="button" 
                    className="signature-clear-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Effacer la signature avec mise à jour complète
                      const updatedPermits = permits.map((permitItem: Permit) => {
                        if (permitItem.id === permit.id) {
                          return {
                            ...permitItem,
                            formData: {
                              ...permitItem.formData,
                              [field.id]: '',
                              [field.id + '_metadata']: null
                            }
                          };
                        }
                        return permitItem;
                      });
                      
                      setPermits(updatedPermits);
                      updateFormData(updatedPermits);
                    }}
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
          );
        
        default:
          return null;
      }
    };

    return (
      <div className="permit-form">
        <div className="form-header">
          <h3>{permit.name}</h3>
          <div className="form-actions">
            <button className="form-action-btn save">
              <Save size={16} />
              Sauvegarder
            </button>
            <button className="form-action-btn print">
              <Printer size={16} />
              Imprimer
            </button>
            <button className="form-action-btn submit">
              <Mail size={16} />
              Soumettre
            </button>
          </div>
        </div>

        <div className="form-content">
          {Object.entries(fieldsBySection).map(([sectionName, fields]: [string, FormField[]]) => (
            <div key={sectionName} className="form-section-group">
              <h4 className="form-section-title">
                {(t.sections as any)[sectionName] || sectionName}
              </h4>
              <div className="form-fields">
                {fields.map((field: FormField) => (
                  <div key={field.id} className="form-field">
                    <label className="form-label" htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                    {field.validation?.message && (
                      <div className="field-help">{field.validation.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; scroll-behavior: auto !important; }
          .permits-header { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .permits-title { color: #2563eb; font-size: 18px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .permits-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; }
          .stat-value { font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 4px; }
          .stat-label { font-size: 12px; color: #3b82f6; font-weight: 500; }
          
          .search-section { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: end; }
          .search-input-wrapper { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 10; }
          .search-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .search-field:focus { outline: none; border-color: #2563eb; background: rgba(15, 23, 42, 0.9); }
          .filter-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; min-width: 150px; }
          .filter-select:focus { outline: none; border-color: #2563eb; }
          
          .permits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
          .permit-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; transition: all 0.3s ease; position: relative; }
          .permit-card:hover { transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15); }
          .permit-card.selected { border-color: #2563eb; background: rgba(59, 130, 246, 0.1); }
          .permit-card.critical::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #ef4444; border-radius: 16px 0 0 16px; }
          
          .permit-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; cursor: pointer; }
          .permit-icon { font-size: 28px; width: 40px; text-align: center; }
          .permit-content { flex: 1; }
          .permit-name { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px; }
          .permit-category { color: #94a3b8; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .permit-description { color: #cbd5e1; font-size: 13px; line-height: 1.4; margin-bottom: 8px; }
          .permit-authority { color: #60a5fa; font-size: 11px; font-weight: 500; }
          .permit-checkbox { width: 24px; height: 24px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 6px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .permit-checkbox.checked { background: #2563eb; border-color: #2563eb; color: white; }
          
          .permit-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
          .meta-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #94a3b8; }
          .priority-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
          .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
          
          .permit-actions { display: flex; gap: 8px; margin-top: 16px; }
          .action-btn { padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
          .action-btn.primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
          .action-btn.secondary { background: rgba(100, 116, 139, 0.2); color: #cbd5e1; border: 1px solid rgba(100, 116, 139, 0.3); }
          .action-btn:hover { transform: translateY(-1px); }
          
          .permit-form { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; margin-top: 16px; overflow: hidden; }
          .form-header { background: rgba(59, 130, 246, 0.1); padding: 16px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); display: flex; justify-content: space-between; align-items: center; }
          .form-header h3 { color: #ffffff; margin: 0; font-size: 16px; font-weight: 600; }
          .form-actions { display: flex; gap: 8px; }
          .form-action-btn { padding: 6px 10px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; }
          .form-action-btn.save { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
          .form-action-btn.print { background: rgba(100, 116, 139, 0.2); color: #cbd5e1; }
          .form-action-btn.submit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
          
          .form-content { padding: 20px; max-height: 600px; overflow-y: auto; }
          .form-section-group { margin-bottom: 24px; }
          .form-section-title { color: #2563eb; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(59, 130, 246, 0.3); }
          .form-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
          .form-field { display: flex; flex-direction: column; }
          .form-label { color: #e2e8f0; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .required { color: #ef4444; margin-left: 2px; }
          .form-input, .form-textarea, .form-select { padding: 8px 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; transition: all 0.3s ease; }
          .form-input:focus, .form-textarea:focus, .form-select:focus { outline: none; border-color: #2563eb; }
          
          .signature-field { display: flex; flex-direction: column; gap: 12px; }
          .signature-pad { flex: 1; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 8px; padding: 12px; min-height: 60px; display: flex; align-items: center; background: rgba(15, 23, 42, 0.9); }
          .signature-content { width: 100%; }
          .signature-text { color: #22c55e; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .signature-timestamp { color: #94a3b8; font-size: 11px; font-style: italic; }
          .signature-placeholder { color: #94a3b8; font-size: 12px; font-style: italic; }
          .signature-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
          .signature-name-input { flex: 1; min-width: 200px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; transition: all 0.3s ease; }
          .signature-name-input:focus { outline: none; border-color: #2563eb; }
          .signature-name-input::placeholder { color: #64748b; }
          .signature-btn { padding: 8px 16px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s ease; }
          .signature-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3); }
          .signature-clear-btn { padding: 6px 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; cursor: pointer; font-size: 11px; }
          .signature-clear-btn:hover { background: rgba(239, 68, 68, 0.3); }
          
          .workers-tracking-container { display: flex; flex-direction: column; gap: 16px; }
          .worker-entry-form { background: rgba(30, 41, 59, 0.6); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .worker-entry-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
          .worker-name-input { flex: 2; min-width: 200px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; }
          .worker-time-input { flex: 1; min-width: 120px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; }
          .worker-entry-btn { padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; }
          .worker-entry-btn:hover { transform: translateY(-1px); }
          
          .workers-log-list h5 { color: #2563eb; margin: 0 0 12px; font-size: 14px; font-weight: 600; }
          .no-entries { color: #64748b; font-style: italic; text-align: center; padding: 20px; }
          .workers-table { border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 8px; overflow: hidden; }
          .workers-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; background: rgba(59, 130, 246, 0.1); padding: 12px; font-weight: 600; color: #2563eb; font-size: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); }
          .workers-table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.2); align-items: center; }
          .workers-table-row:last-child { border-bottom: none; }
          .workers-table-row:hover { background: rgba(100, 116, 139, 0.1); }
          .worker-name { color: #ffffff; font-weight: 500; }
          .worker-time { color: #94a3b8; font-family: monospace; }
          .exit-btn { padding: 4px 8px; background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px; cursor: pointer; font-size: 10px; }
          .exit-btn:hover { background: rgba(34, 197, 94, 0.3); }
          .remove-btn { padding: 4px 8px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; cursor: pointer; font-size: 10px; }
          .remove-btn:hover { background: rgba(239, 68, 68, 0.3); }
          
          .time-picker-container { position: relative; }
          .time-display { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
          .time-display:hover { border-color: #2563eb; }
          .time-value { color: #ffffff; font-family: monospace; font-size: 14px; }
          .time-icon { font-size: 16px; }
          .time-picker-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(100, 116, 139, 0.5); border-radius: 8px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); z-index: 1000; backdrop-filter: blur(20px); }
          .time-picker-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); color: #ffffff; font-weight: 600; }
          .time-picker-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; padding: 4px; }
          .time-picker-close:hover { color: #ef4444; }
          .time-picker-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid rgba(100, 116, 139, 0.3); }
          .time-picker-now { padding: 6px 12px; background: rgba(100, 116, 139, 0.2); color: #cbd5e1; border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 4px; cursor: pointer; font-size: 12px; }
          .time-picker-now:hover { background: rgba(100, 116, 139, 0.3); }
          .time-picker-ok { padding: 6px 12px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; margin-left: auto; }
          .time-picker-ok:hover { transform: translateY(-1px); }
          
          .photo-gallery-container { display: flex; flex-direction: column; gap: 16px; }
          .photo-upload-section { background: rgba(30, 41, 59, 0.6); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .photo-upload-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
          .photo-upload-btn { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
          .photo-upload-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .photo-gallery { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; padding: 20px; }
          .photo-carousel { display: flex; flex-direction: column; gap: 16px; }
          .photo-main-container { position: relative; display: flex; align-items: center; gap: 12px; }
          .photo-main { position: relative; flex: 1; border-radius: 8px; overflow: hidden; background: rgba(30, 41, 59, 0.6); }
          .photo-main-image { width: 100%; height: 300px; object-fit: cover; display: block; }
          .photo-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); padding: 16px; color: white; }
          .photo-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .photo-timestamp { font-size: 12px; color: #cbd5e1; }
          .photo-gallery-info { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(100, 116, 139, 0.3); }
          .photo-count { color: #3b82f6; font-weight: 600; font-size: 12px; }
          
          .field-help { font-size: 10px; color: #64748b; margin-top: 2px; font-style: italic; }
          
          @media (max-width: 768px) {
            .permits-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .permits-stats { grid-template-columns: repeat(2, 1fr); }
            .form-fields { grid-template-columns: 1fr; }
            .permit-actions { flex-direction: column; }
          }
        `
      }} />

      <div className="step4-container">
        {/* En-tête avec résumé */}
        <div className="permits-header">
          <div className="permits-title">
            <FileText size={24} />
            📋 {t.title}
          </div>
          <p style={{ color: '#3b82f6', margin: '0 0 8px', fontSize: '14px' }}>
            {t.subtitle}
          </p>
          
          <div className="permits-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.totalPermits}</div>
              <div className="stat-label">Permis disponibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.selected}</div>
              <div className="stat-label">Sélectionnés</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">Critiques</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">En attente</div>
            </div>
          </div>
        </div>

        {/* Section de recherche et filtres */}
        <div className="search-section">
          <div className="search-grid">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="search-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {(t.categories as any)[category] || category}
                </option>
              ))}
            </select>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t.allProvinces}</option>
              {provinces.map((province: string) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille des permis */}
        <div className="permits-grid">
          {filteredPermits.map((permit: Permit) => {
            const isSelected = permit.selected;
            const isFormExpanded = expandedForms[permit.id];
            
            return (
              <div 
                key={permit.id} 
                className={`permit-card ${isSelected ? 'selected' : ''} ${permit.priority}`}
              >
                {/* Header avec sélection */}
                <div className="permit-header" onClick={() => handlePermitToggle(permit.id)}>
                  <div className="permit-icon">{getCategoryIcon(permit.category)}</div>
                  <div className="permit-content">
                    <h3 className="permit-name">{permit.name}</h3>
                    <div className="permit-category">{(t.categories as any)[permit.category] || permit.category}</div>
                    <div className="permit-description">{permit.description}</div>
                    <div className="permit-authority">{permit.authority}</div>
                  </div>
                  <div className={`permit-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={18} />}
                  </div>
                </div>

                {/* Métadonnées rapides */}
                <div className="permit-meta">
                  <div className="meta-item">
                    <span className="priority-badge" style={{ backgroundColor: `${getPriorityColor(permit.priority)}20`, color: getPriorityColor(permit.priority) }}>
                      {(t.priorities as any)[permit.priority]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(permit.status)}20`, color: getStatusColor(permit.status) }}>
                      {(t.statuses as any)[permit.status]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <Clock size={12} />
                    {permit.processingTime}
                  </div>
                  <div className="meta-item">
                    <MapPin size={12} />
                    {permit.province.length} provinces
                  </div>
                </div>

                {/* Actions du permis */}
                {isSelected && (
                  <div className="permit-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => toggleFormExpansion(permit.id)}
                    >
                      <Edit size={14} />
                      {isFormExpanded ? 'Fermer' : 'Remplir'}
                      {isFormExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button className="action-btn secondary">
                      <Eye size={14} />
                      Aperçu
                    </button>
                    <button className="action-btn secondary">
                      <Download size={14} />
                      PDF
                    </button>
                  </div>
                )}

                {/* Formulaire du permis */}
                {isSelected && <PermitForm permit={permit} />}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredPermits.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#94a3b8', 
            background: 'rgba(30, 41, 59, 0.6)', 
            borderRadius: '16px', 
            border: '1px solid rgba(100, 116, 139, 0.3)' 
          }}>
            <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun permis trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche pour voir plus de permis</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4RealPermits;
