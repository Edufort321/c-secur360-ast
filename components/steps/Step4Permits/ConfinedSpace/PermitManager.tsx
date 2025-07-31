// PermitManager.tsx - Nouvel onglet pour gestion complète du permis
"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, Database, QrCode, Printer, Mail, Share, Download, 
  Save, CheckCircle, AlertTriangle, Clock, Shield, Users, 
  Wrench, Activity, Eye, Globe, Smartphone, Copy, Check,
  BarChart3, TrendingUp, Calendar, MapPin, Building, User
} from 'lucide-react';
import { useSafetyManager } from './SafetyManager';

// =================== TYPES ===================
interface PermitManagerProps {
  isMobile?: boolean;
  language?: 'fr' | 'en';
}

interface ValidationSummary {
  sectionName: string;
  icon: React.ReactNode;
  isComplete: boolean;
  completionPercentage: number;
  errors: string[];
  lastModified?: string;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Gestion et Finalisation du Permis",
    subtitle: "Tableau de bord centralisé pour validation, sauvegarde et partage",
    
    // Actions principales
    savePermit: "Sauvegarder",
    printPDF: "Imprimer PDF",
    emailPermit: "Envoyer par Email",
    sharePermit: "Partager",
    generateQR: "Générer QR Code",
    exportData: "Exporter Données",
    
    // Sections
    summary: "Résumé du Permis",
    validation: "Validation et Conformité",
    actions: "Actions du Permis",
    statistics: "Statistiques",
    qrCode: "Code QR - Accès Mobile",
    sharing: "Partage et Distribution",
    
    // Statuts
    complete: "Complété",
    incomplete: "Incomplet",
    valid: "Valide",
    invalid: "Non valide",
    saving: "Sauvegarde...",
    saved: "Sauvegardé",
    
    // Messages
    saveSuccess: "Permis sauvegardé avec succès!",
    validationPassed: "Toutes les validations sont réussies",
    validationErrors: "Erreurs de validation détectées",
    qrGenerated: "Code QR généré avec succès",
    linkCopied: "Lien copié dans le presse-papiers",
    
    // Sections du permis
    siteInformation: "Informations du Site",
    rescuePlan: "Plan de Sauvetage", 
    atmosphericTesting: "Tests Atmosphériques",
    entryRegistry: "Registre d'Entrée"
  },
  en: {
    title: "Permit Management and Finalization",
    subtitle: "Centralized dashboard for validation, saving and sharing",
    
    // Actions principales
    savePermit: "Save",
    printPDF: "Print PDF",
    emailPermit: "Send by Email",
    sharePermit: "Share",
    generateQR: "Generate QR Code",
    exportData: "Export Data",
    
    // Sections
    summary: "Permit Summary",
    validation: "Validation and Compliance",
    actions: "Permit Actions",
    statistics: "Statistics",
    qrCode: "QR Code - Mobile Access",
    sharing: "Sharing and Distribution",
    
    // Statuts
    complete: "Complete",
    incomplete: "Incomplete",
    valid: "Valid",
    invalid: "Invalid",
    saving: "Saving...",
    saved: "Saved",
    
    // Messages
    saveSuccess: "Permit saved successfully!",
    validationPassed: "All validations passed",
    validationErrors: "Validation errors detected",
    qrGenerated: "QR Code generated successfully",
    linkCopied: "Link copied to clipboard",
    
    // Sections du permis
    siteInformation: "Site Information",
    rescuePlan: "Rescue Plan",
    atmosphericTesting: "Atmospheric Testing", 
    entryRegistry: "Entry Registry"
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const PermitManager: React.FC<PermitManagerProps> = ({
  isMobile = false,
  language = 'fr'
}) => {
  const safetyManager = useSafetyManager();
  const t = translations[language];
  
  // États locaux
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedShareMethod, setSelectedShareMethod] = useState<'email' | 'sms' | 'whatsapp'>('email');

  // Validation globale
  const validation = safetyManager.validatePermitCompleteness();
  const permit = safetyManager.currentPermit;

  // =================== GÉNÉRATION QR CODE ===================
  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    try {
      const qrUrl = await safetyManager.generateQRCode();
      setQrCodeUrl(qrUrl);
      showNotification(t.qrGenerated, 'success');
    } catch (error) {
      showNotification('Erreur génération QR Code', 'error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // =================== GÉNÉRATION PDF ===================
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await safetyManager.generatePDF();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${permit.permit_number}_espace_clos.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification('PDF généré avec succès', 'success');
    } catch (error) {
      showNotification('Erreur génération PDF', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // =================== SAUVEGARDE ===================
  const handleSave = async () => {
    const permitNumber = await safetyManager.saveToDatabase();
    if (permitNumber) {
      showNotification(t.saveSuccess, 'success');
    }
  };

  // =================== PARTAGE ===================
  const handleShare = async () => {
    try {
      await safetyManager.sharePermit(selectedShareMethod);
    } catch (error) {
      showNotification('Erreur lors du partage', 'error');
    }
  };

  // =================== COPIE LIEN ===================
  const handleCopyLink = async () => {
    const permitUrl = `${window.location.origin}/permits/confined-space/${permit.permit_number}`;
    try {
      await navigator.clipboard.writeText(permitUrl);
      setLinkCopied(true);
      showNotification(t.linkCopied, 'success');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      showNotification('Erreur copie du lien', 'error');
    }
  };

  // =================== VALIDATION DES SECTIONS ===================
  const getSectionValidation = (): ValidationSummary[] => {
    return [
      {
        sectionName: t.siteInformation,
        icon: <Building className="w-5 h-5" />,
        isComplete: Boolean(permit.siteInformation.projectNumber && permit.siteInformation.workLocation),
        completionPercentage: getFieldCompletionPercentage(permit.siteInformation, ['projectNumber', 'workLocation', 'contractor', 'supervisor']),
        errors: permit.siteInformation.projectNumber ? [] : ['Numéro de projet manquant'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.rescuePlan,
        icon: <Shield className="w-5 h-5" />,
        isComplete: Boolean(permit.rescuePlan.emergencyContacts?.length > 0),
        completionPercentage: permit.rescuePlan.emergencyContacts?.length > 0 ? 100 : 0,
        errors: permit.rescuePlan.emergencyContacts?.length > 0 ? [] : ['Plan de sauvetage incomplet'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.atmosphericTesting,
        icon: <Activity className="w-5 h-5" />,
        isComplete: Boolean(permit.atmosphericTesting.readings?.length > 0),
        completionPercentage: permit.atmosphericTesting.readings?.length > 0 ? 100 : 0,
        errors: permit.atmosphericTesting.readings?.length > 0 ? [] : ['Tests atmosphériques manquants'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.entryRegistry,
        icon: <Users className="w-5 h-5" />,
        isComplete: Boolean(permit.entryRegistry.personnel?.length > 0),
        completionPercentage: permit.entryRegistry.personnel?.length > 0 ? 100 : 0,
        errors: permit.entryRegistry.personnel?.length > 0 ? [] : ['Personnel manquant'],
        lastModified: permit.last_modified
      }
    ];
  };

  // =================== STATISTIQUES ===================
  const getPermitStatistics = () => {
    return {
      totalSections: 4,
      completedSections: getSectionValidation().filter(s => s.isComplete).length,
      totalPersonnel: permit.entryRegistry.personnel?.length || 0,
      activeEntrants: safetyManager.activeEntrants.length,
      atmosphericReadings: permit.atmosphericTesting.readings?.length || 0,
      lastSaved: safetyManager.lastSaved ? new Date(safetyManager.lastSaved).toLocaleString() : 'Jamais',
      permitAge: permit.created_at ? Math.floor((Date.now() - new Date(permit.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
    };
  };

  // =================== EFFET INITIAL ===================
  useEffect(() => {
    if (permit.permit_number && !qrCodeUrl) {
      handleGenerateQR();
    }
  }, [permit.permit_number]);

  // =================== RENDU ===================
  const stats = getPermitStatistics();
  const sections = getSectionValidation();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              {t.title}
            </h1>
            <p className="mt-2 text-blue-200 opacity-90">{t.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">
              {validation.percentage}%
            </div>
            <div className="text-sm text-blue-200">Completé</div>
          </div>
        </div>
      </div>

      {/* Dashboard - Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Validation Globale */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Validation</p>
              <p className={`text-2xl font-bold ${validation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                {stats.completedSections}/{stats.totalSections}
              </p>
            </div>
            {validation.isValid ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            )}
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  validation.isValid ? 'bg-green-400' : 'bg-red-400'
                }`}
                style={{ width: `${validation.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {validation.isValid ? t.validationPassed : t.validationErrors}
            </p>
          </div>
        </div>

        {/* Personnel */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Personnel</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalPersonnel}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <div className="mt-4 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>À l'intérieur:</span>
              <span className="font-medium text-orange-400">{stats.activeEntrants}</span>
            </div>
          </div>
        </div>

        {/* Tests Atmosphériques */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Tests Atmo</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.atmosphericReadings}</p>
            </div>
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="mt-4 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Alertes:</span>
              <span className="font-medium text-yellow-400">{safetyManager.activeAlerts.length}</span>
            </div>
          </div>
        </div>

        {/* Dernière Sauvegarde */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Sauvegarde</p>
              <p className="text-lg font-bold text-green-400">
                {stats.permitAge}j
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-4 text-xs text-gray-400">
            {stats.lastSaved}
          </div>
        </div>
      </div>

      {/* Validation des Sections */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-400" />
            {t.validation}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  section.isComplete 
                    ? 'border-green-400/30 bg-green-400/10' 
                    : 'border-red-400/30 bg-red-400/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      section.isComplete ? 'bg-green-400/20' : 'bg-red-400/20'
                    }`}>
                      {section.icon}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        section.isComplete ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {section.sectionName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {section.isComplete ? t.complete : t.incomplete}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      section.isComplete ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {section.completionPercentage}%
                    </div>
                  </div>
                </div>
                
                {section.errors.length > 0 && (
                  <div className="mt-3 text-xs text-red-300">
                    {section.errors.map((error, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions du Permis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Principales */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wrench className="w-6 h-6 text-green-400" />
              {t.actions}
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Sauvegarder */}
            <button
              onClick={handleSave}
              disabled={safetyManager.isSaving}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
            >
              {safetyManager.isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {safetyManager.isSaving ? t.saving : t.savePermit}
            </button>

            {/* Imprimer PDF */}
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Printer className="w-5 h-5" />
              )}
              {t.printPDF}
            </button>

            {/* Email */}
            <button
              onClick={() => safetyManager.sharePermit('email')}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
              {t.emailPermit}
            </button>

            {/* Partage */}
            <div className="flex gap-2">
              <select
                value={selectedShareMethod}
                onChange={(e) => setSelectedShareMethod(e.target.value as any)}
                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="email">📧 Email</option>
                <option value="sms">📱 SMS</option>
                <option value="whatsapp">💬 WhatsApp</option>
              </select>
              <button
                onClick={handleShare}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200"
              >
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-400" />
              {t.qrCode}
            </h2>
          </div>
          
          <div className="p-6 text-center">
            {qrCodeUrl ? (
              <div>
                <div className="inline-block p-4 bg-white rounded-lg mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  📱 Scanner pour accès mobile instantané
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {linkCopied ? 'Copié!' : 'Copier Lien'}
                  </button>
                  <button
                    onClick={handleGenerateQR}
                    disabled={isGeneratingQR}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-48 h-48 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-500" />
                </div>
                <button
                  onClick={handleGenerateQR}
                  disabled={isGeneratingQR}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isGeneratingQR ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4" />
                  )}
                  {t.generateQR}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Résumé du Permis */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            {t.summary}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informations Générales */}
            <div>
              <h3 className="font-semibold text-purple-300 mb-3">Informations Générales</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Numéro:</span>
                  <span className="text-white font-mono">{permit.permit_number || 'Non généré'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Statut:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    permit.status === 'active' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'
                  }`}>
                    {permit.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Province:</span>
                  <span className="text-white">{permit.province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Créé:</span>
                  <span className="text-white">
                    {permit.created_at ? new Date(permit.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Détails du Site */}
            <div>
              <h3 className="font-semibold text-cyan-300 mb-3">Détails du Site</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Projet:</span>
                  <p className="text-white">{permit.siteInformation.projectNumber || 'Non défini'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Lieu:</span>
                  <p className="text-white">{permit.siteInformation.workLocation || 'Non défini'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Entrepreneur:</span>
                  <p className="text-white">{permit.siteInformation.contractor || 'Non défini'}</p>
                </div>
              </div>
            </div>

            {/* Statut de Sécurité */}
            <div>
              <h3 className="font-semibold text-red-300 mb-3">Statut de Sécurité</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Personnel total:</span>
                  <span className="text-white">{stats.totalPersonnel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">À l'intérieur:</span>
                  <span className={`font-medium ${stats.activeEntrants > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    {stats.activeEntrants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Alertes actives:</span>
                  <span className={`font-medium ${safetyManager.activeAlerts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {safetyManager.activeAlerts.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tests atmosphériques:</span>
                  <span className="text-white">{stats.atmosphericReadings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== FONCTIONS UTILITAIRES ===================
const getFieldCompletionPercentage = (obj: any, requiredFields: string[]): number => {
  const completedFields = requiredFields.filter(field => obj[field]).length;
  return Math.round((completedFields / requiredFields.length) * 100);
};

const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('C-SECUR360', {
      body: message,
      icon: '/c-secur360-logo.png'
    });
  }
};

export default PermitManager;
