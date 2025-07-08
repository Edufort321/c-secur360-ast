'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  FileText, 
  Download, 
  Archive, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  Share2,
  Save,
  Calendar,
  User,
  MapPin,
  Shield,
  Award,
  Target,
  BarChart3,
  Globe,
  Printer,
  Mail,
  Smartphone,
  Image,
  X,
  Plus,
  Upload
} from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption: string;
  type: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'general';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  tags: string[];
}

interface DocumentGeneration {
  format: 'pdf' | 'word' | 'excel' | 'html';
  template: 'standard' | 'detailed' | 'summary' | 'regulatory';
  language: 'fr' | 'en' | 'both';
  includePhotos: boolean;
  includeSignatures: boolean;
  includeQRCode: boolean;
  branding: boolean;
  watermark: boolean;
}

interface Distribution {
  email: {
    enabled: boolean;
    recipients: string[];
    subject: string;
    message: string;
  };
  portal: {
    enabled: boolean;
    publish: boolean;
    category: string;
  };
  archive: {
    enabled: boolean;
    retention: number; // in years
    location: 'local' | 'cloud' | 'both';
  };
  compliance: {
    enabled: boolean;
    authorities: string[];
    submissionDate?: string;
  };
}

interface FinalizationData {
  photos: Photo[];
  finalComments: string;
  documentGeneration: DocumentGeneration;
  distribution: Distribution;
  completionStatus: {
    projectInfo: boolean;
    equipment: boolean;
    hazards: boolean;
    controls: boolean;
    permits: boolean;
    validation: boolean;
    teamShare: boolean;
  };
  finalSignature?: {
    signedBy: string;
    signedAt: string;
    signature: string;
    title: string;
  };
  qrCode?: string;
  metadata: {
    createdAt: string;
    completedAt?: string;
    version: string;
    lastModified: string;
    totalDuration?: number; // minutes
  };
}

interface FinalizationStepProps {
  formData: {
    finalization?: FinalizationData;
    projectInfo?: any;
    equipment?: any[];
    hazards?: any[];
    controls?: any[];
    permits?: any[];
    validation?: any;
    teamShare?: any;
  };
  onDataChange: (section: string, data: FinalizationData) => void;
  language: 'fr' | 'en';
  tenant: string;
}

const translations = {
  fr: {
    title: "Finalisation et Publication",
    subtitle: "Finalisez votre AST et préparez la distribution",
    
    // Sections
    photosSection: "Photos Finales",
    documentSection: "Génération de Documents",
    distributionSection: "Distribution",
    completionSection: "État de Complétion",
    finalSignature: "Signature Finale",
    
    // Photos
    addPhoto: "Ajouter Photo",
    takePhoto: "Prendre Photo",
    uploadPhoto: "Téléverser Photo",
    photoCaption: "Légende de la photo",
    photoType: "Type de photo",
    photoTypes: {
      before: "Avant",
      during: "Pendant",
      after: "Après", 
      equipment: "Équipement",
      hazard: "Danger",
      general: "Général"
    },
    noPhotos: "Aucune photo ajoutée",
    
    // Document generation
    format: "Format",
    template: "Modèle",
    templateTypes: {
      standard: "Standard",
      detailed: "Détaillé",
      summary: "Sommaire",
      regulatory: "Réglementaire"
    },
    includePhotos: "Inclure les photos",
    includeSignatures: "Inclure les signatures",
    includeQRCode: "Inclure code QR",
    branding: "Image de marque",
    watermark: "Filigrane",
    generateDocument: "Générer Document",
    
    // Distribution
    emailDistribution: "Distribution par Email",
    portalPublication: "Publication Portail",
    archiving: "Archivage",
    complianceSubmission: "Soumission Réglementaire",
    
    // Email
    recipients: "Destinataires",
    emailSubject: "Sujet",
    emailMessage: "Message",
    addRecipient: "Ajouter Destinataire",
    
    // Portal
    publishToPortal: "Publier sur le portail",
    category: "Catégorie",
    
    // Archive
    enableArchiving: "Activer l'archivage",
    retention: "Période de rétention (années)",
    storageLocation: "Lieu de stockage",
    storageOptions: {
      local: "Local",
      cloud: "Nuage",
      both: "Les deux"
    },
    
    // Compliance
    enableCompliance: "Soumission réglementaire",
    authorities: "Autorités",
    submissionDate: "Date de soumission",
    
    // Completion
    completionStatus: "État de Complétion",
    allSectionsComplete: "Toutes les sections sont complètes",
    incompleteSections: "Sections incomplètes",
    
    // Actions
    finalize: "Finaliser l'AST",
    publish: "Publier",
    distribute: "Distribuer",
    archive: "Archiver",
    sign: "Signer",
    preview: "Aperçu",
    download: "Télécharger",
    
    // Status
    draft: "Brouillon",
    inProgress: "En cours",
    completed: "Terminé",
    published: "Publié",
    archived: "Archivé",
    
    // Messages
    finalizationComplete: "Finalisation complète",
    documentGenerated: "Document généré avec succès",
    distributionSent: "Distribution envoyée",
    astPublished: "AST publié avec succès",
    
    // Final comments
    finalComments: "Commentaires finaux",
    commentsPlaceholder: "Ajoutez vos commentaires finaux sur cette AST...",
    
    // Metadata
    createdAt: "Créé le",
    completedAt: "Complété le", 
    duration: "Durée totale",
    version: "Version",
    lastModified: "Dernière modification"
  },
  en: {
    title: "Finalization and Publication",
    subtitle: "Finalize your JSA and prepare for distribution",
    
    // Sections
    photosSection: "Final Photos",
    documentSection: "Document Generation",
    distributionSection: "Distribution",
    completionSection: "Completion Status",
    finalSignature: "Final Signature",
    
    // Photos
    addPhoto: "Add Photo",
    takePhoto: "Take Photo",
    uploadPhoto: "Upload Photo",
    photoCaption: "Photo caption",
    photoType: "Photo type",
    photoTypes: {
      before: "Before",
      during: "During",
      after: "After",
      equipment: "Equipment",
      hazard: "Hazard",
      general: "General"
    },
    noPhotos: "No photos added",
    
    // Document generation
    format: "Format",
    template: "Template",
    templateTypes: {
      standard: "Standard",
      detailed: "Detailed",
      summary: "Summary",
      regulatory: "Regulatory"
    },
    includePhotos: "Include photos",
    includeSignatures: "Include signatures", 
    includeQRCode: "Include QR code",
    branding: "Branding",
    watermark: "Watermark",
    generateDocument: "Generate Document",
    
    // Distribution
    emailDistribution: "Email Distribution",
    portalPublication: "Portal Publication",
    archiving: "Archiving",
    complianceSubmission: "Compliance Submission",
    
    // Email
    recipients: "Recipients",
    emailSubject: "Subject",
    emailMessage: "Message",
    addRecipient: "Add Recipient",
    
    // Portal
    publishToPortal: "Publish to portal",
    category: "Category",
    
    // Archive
    enableArchiving: "Enable archiving",
    retention: "Retention period (years)",
    storageLocation: "Storage location",
    storageOptions: {
      local: "Local",
      cloud: "Cloud",
      both: "Both"
    },
    
    // Compliance
    enableCompliance: "Regulatory submission",
    authorities: "Authorities",
    submissionDate: "Submission date",
    
    // Completion
    completionStatus: "Completion Status",
    allSectionsComplete: "All sections are complete",
    incompleteSections: "Incomplete sections",
    
    // Actions
    finalize: "Finalize JSA",
    publish: "Publish",
    distribute: "Distribute",
    archive: "Archive",
    sign: "Sign",
    preview: "Preview",
    download: "Download",
    
    // Status
    draft: "Draft",
    inProgress: "In Progress",
    completed: "Completed",
    published: "Published",
    archived: "Archived",
    
    // Messages
    finalizationComplete: "Finalization complete",
    documentGenerated: "Document generated successfully",
    distributionSent: "Distribution sent",
    astPublished: "JSA published successfully",
    
    // Final comments
    finalComments: "Final comments",
    commentsPlaceholder: "Add your final comments about this JSA...",
    
    // Metadata
    createdAt: "Created on",
    completedAt: "Completed on",
    duration: "Total duration",
    version: "Version",
    lastModified: "Last modified"
  }
};

export default function Step8Finalization({ 
  formData, 
  onDataChange, 
  language,
  tenant 
}: FinalizationStepProps) {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [finalizationData, setFinalizationData] = useState<FinalizationData>({
    photos: [],
    finalComments: '',
    documentGeneration: {
      format: 'pdf',
      template: 'standard',
      language: 'fr',
      includePhotos: true,
      includeSignatures: true,
      includeQRCode: true,
      branding: true,
      watermark: true
    },
    distribution: {
      email: {
        enabled: true,
        recipients: [],
        subject: `AST - ${formData.projectInfo?.title || 'Nouveau projet'}`,
        message: 'Veuillez trouver ci-joint l\'Analyse Sécuritaire de Tâches complétée.'
      },
      portal: {
        enabled: true,
        publish: false,
        category: 'safety'
      },
      archive: {
        enabled: true,
        retention: 7,
        location: 'cloud'
      },
      compliance: {
        enabled: false,
        authorities: []
      }
    },
    completionStatus: {
      projectInfo: !!formData.projectInfo,
      equipment: !!(formData.equipment?.length),
      hazards: !!(formData.hazards?.length),
      controls: !!(formData.controls?.length),
      permits: !!(formData.permits?.length),
      validation: !!formData.validation,
      teamShare: !!formData.teamShare
    },
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0',
      lastModified: new Date().toISOString()
    },
    ...formData.finalization
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Partial<Photo>>({
    caption: '',
    type: 'general',
    tags: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    onDataChange('finalization', finalizationData);
  }, [finalizationData, onDataChange]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const photo: Photo = {
            id: Math.random().toString(36).substr(2, 9),
            url: e.target?.result as string,
            caption: newPhoto.caption || `Photo ${finalizationData.photos.length + 1}`,
            type: newPhoto.type as Photo['type'],
            timestamp: new Date().toISOString(),
            tags: newPhoto.tags || []
          };
          
          setFinalizationData(prev => ({
            ...prev,
            photos: [...prev.photos, photo]
          }));
        };
        reader.readAsDataURL(file);
      });
      setShowPhotoModal(false);
      setNewPhoto({ caption: '', type: 'general', tags: [] });
    }
  };

  const removePhoto = (photoId: string) => {
    setFinalizationData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const updateDocumentGeneration = (field: keyof DocumentGeneration, value: any) => {
    setFinalizationData(prev => ({
      ...prev,
      documentGeneration: {
        ...prev.documentGeneration,
        [field]: value
      }
    }));
  };

  const updateDistribution = (section: keyof Distribution, field: string, value: any) => {
    setFinalizationData(prev => ({
      ...prev,
      distribution: {
        ...prev.distribution,
        [section]: {
          ...prev.distribution[section],
          [field]: value
        }
      }
    }));
  };

  const addRecipient = (email: string) => {
    if (email && !finalizationData.distribution.email.recipients.includes(email)) {
      updateDistribution('email', 'recipients', [...finalizationData.distribution.email.recipients, email]);
    }
  };

  const removeRecipient = (email: string) => {
    updateDistribution('email', 'recipients', 
      finalizationData.distribution.email.recipients.filter(r => r !== email)
    );
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    // Simuler la génération de document
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert(t.documentGenerated);
  };

  const publishAST = async () => {
    setIsPublishing(true);
    
    // Finaliser les métadonnées
    setFinalizationData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        completedAt: new Date().toISOString(),
        totalDuration: Math.round((new Date().getTime() - new Date(prev.metadata.createdAt).getTime()) / 60000)
      },
      finalSignature: {
        signedBy: 'Utilisateur Current',
        signedAt: new Date().toISOString(),
        signature: 'Electronic Signature - ' + new Date().toISOString(),
        title: 'Responsable HSE'
      }
    }));
    
    // Simuler la publication
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsPublishing(false);
    alert(t.astPublished);
  };

  const completionPercentage = Object.values(finalizationData.completionStatus).filter(Boolean).length / 
                               Object.values(finalizationData.completionStatus).length * 100;

  const isReadyToPublish = completionPercentage === 100 && 
                          (finalizationData.distribution.email.enabled || 
                           finalizationData.distribution.portal.enabled ||
                           finalizationData.distribution.archive.enabled);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
          <Award className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Completion Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 text-blue-500 mr-2" />
          {t.completionStatus}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(finalizationData.completionStatus).map(([section, completed]) => (
            <div key={section} className={`p-3 rounded-lg border ${completed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex items-center space-x-2">
                {completed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className={`text-sm font-medium ${completed ? 'text-green-800' : 'text-yellow-800'}`}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {completionPercentage === 100 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">{t.allSectionsComplete}</span>
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Camera className="w-5 h-5 text-purple-500 mr-2" />
            {t.photosSection}
          </h3>
          <button
            onClick={() => setShowPhotoModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addPhoto}
          </button>
        </div>

        {/* Photos Grid */}
        {finalizationData.photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalizationData.photos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={photo.url} 
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{photo.caption}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {t.photoTypes[photo.type] || photo.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(photo.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t.noPhotos}</p>
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.addPhoto}</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.photoCaption}
                  </label>
                  <input
                    type="text"
                    value={newPhoto.caption || ''}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, caption: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Légende de la photo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.photoType}
                  </label>
                  <select
                    value={newPhoto.type || 'general'}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, type: e.target.value as Photo['type'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {Object.entries(t.photoTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 text-gray-600 hover:text-purple-600 flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {t.uploadPhoto}
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Final Comments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-blue-500 mr-2" />
          {t.finalComments}
        </h3>
        
        <textarea
          value={finalizationData.finalComments}
          onChange={(e) => setFinalizationData(prev => ({ ...prev, finalComments: e.target.value }))}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t.commentsPlaceholder}
        />
      </div>

      {/* Document Generation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-green-500 mr-2" />
          {t.documentSection}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.format}</label>
              <select
                value={finalizationData.documentGeneration.format}
                onChange={(e) => updateDocumentGeneration('format', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
                <option value="excel">Excel</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.template}</label>
              <select
                value={finalizationData.documentGeneration.template}
                onChange={(e) => updateDocumentGeneration('template', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {Object.entries(t.templateTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {['includePhotos', 'includeSignatures', 'includeQRCode', 'branding', 'watermark'].map(option => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={finalizationData.documentGeneration[option as keyof DocumentGeneration] as boolean}
                  onChange={(e) => updateDocumentGeneration(option as keyof DocumentGeneration, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {String(t[option as keyof typeof t] || option)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex space-x-2">
          <button
            onClick={generateDocument}
            disabled={isGenerating}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {isGenerating ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Génération...' : t.generateDocument}
          </button>
          
          <button className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            {t.preview}
          </button>
        </div>
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Send className="w-5 h-5 text-blue-500 mr-2" />
          {t.distributionSection}
        </h3>
        
        <div className="space-y-6">
          {/* Email Distribution */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={finalizationData.distribution.email.enabled}
                onChange={(e) => updateDistribution('email', 'enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-900 flex items-center">
                <Mail className="w-5 h-5 text-blue-500 mr-2" />
                {t.emailDistribution}
              </span>
            </label>

            {finalizationData.distribution.email.enabled && (
              <div className="space-y-3 ml-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.recipients}</label>
                  <div className="space-y-2">
                    {finalizationData.distribution.email.recipients.map(email => (
                      <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{email}</span>
                        <button
                          onClick={() => removeRecipient(email)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addRecipient((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                          addRecipient(input.value);
                          input.value = '';
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailSubject}</label>
                  <input
                    type="text"
                    value={finalizationData.distribution.email.subject}
                    onChange={(e) => updateDistribution('email', 'subject', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailMessage}</label>
                  <textarea
                    value={finalizationData.distribution.email.message}
                    onChange={(e) => updateDistribution('email', 'message', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Portal Publication */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={finalizationData.distribution.portal.enabled}
                onChange={(e) => updateDistribution('portal', 'enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-900 flex items-center">
                <Globe className="w-5 h-5 text-blue-500 mr-2" />
                {t.portalPublication}
              </span>
            </label>

            {finalizationData.distribution.portal.enabled && (
              <div className="space-y-3 ml-7">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={finalizationData.distribution.portal.publish}
                    onChange={(e) => updateDistribution('portal', 'publish', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{t.publishToPortal}</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                  <select
                    value={finalizationData.distribution.portal.category}
                    onChange={(e) => updateDistribution('portal', 'category', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="safety">Sécurité</option>
                    <option value="operations">Opérations</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="training">Formation</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Archiving */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={finalizationData.distribution.archive.enabled}
                onChange={(e) => updateDistribution('archive', 'enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-900 flex items-center">
                <Archive className="w-5 h-5 text-blue-500 mr-2" />
                {t.archiving}
              </span>
            </label>

            {finalizationData.distribution.archive.enabled && (
              <div className="space-y-3 ml-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.retention}</label>
                  <select
                    value={finalizationData.distribution.archive.retention}
                    onChange={(e) => updateDistribution('archive', 'retention', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="1">1 an</option>
                    <option value="3">3 ans</option>
                    <option value="5">5 ans</option>
                    <option value="7">7 ans</option>
                    <option value="10">10 ans</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.storageLocation}</label>
                  <select
                    value={finalizationData.distribution.archive.location}
                    onChange={(e) => updateDistribution('archive', 'location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    {Object.entries(t.storageOptions).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
          Métadonnées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">{t.createdAt}:</span>
            <p className="text-gray-600">{new Date(finalizationData.metadata.createdAt).toLocaleDateString()}</p>
          </div>
          
          {finalizationData.metadata.completedAt && (
            <div>
              <span className="font-medium text-gray-700">{t.completedAt}:</span>
              <p className="text-gray-600">{new Date(finalizationData.metadata.completedAt).toLocaleDateString()}</p>
            </div>
          )}
          
          <div>
            <span className="font-medium text-gray-700">{t.version}:</span>
            <p className="text-gray-600">{finalizationData.metadata.version}</p>
          </div>
          
          {finalizationData.metadata.totalDuration && (
            <div>
              <span className="font-medium text-gray-700">{t.duration}:</span>
              <p className="text-gray-600">{finalizationData.metadata.totalDuration} min</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={publishAST}
            disabled={!isReadyToPublish || isPublishing}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
          >
            {isPublishing ? (
              <Clock className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Award className="w-5 h-5 mr-2" />
            )}
            {isPublishing ? 'Publication...' : t.finalize}
          </button>
          
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
            <Share2 className="w-5 h-5 mr-2" />
            {t.distribute}
          </button>
          
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center">
            <Save className="w-5 h-5 mr-2" />
            Sauvegarder
          </button>
        </div>

        {!isReadyToPublish && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">
              Complétez toutes les sections et configurez au moins une méthode de distribution pour finaliser l'AST.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
