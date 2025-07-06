'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Users, 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Bell, 
  Copy, 
  Check,
  Send,
  Download,
  QrCode,
  Link,
  Settings,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Clock
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  permissions: {
    view: boolean;
    edit: boolean;
    comment: boolean;
    approve: boolean;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  accessLevel: 'read' | 'comment' | 'edit' | 'admin';
  lastAccessed?: string;
  status: 'invited' | 'active' | 'inactive';
}

interface ShareSettings {
  isPublic: boolean;
  requiresLogin: boolean;
  expirationDate?: string;
  allowDownload: boolean;
  allowPrint: boolean;
  watermark: boolean;
  trackViews: boolean;
  allowComments: boolean;
  maxViewers?: number;
}

interface TeamShareData {
  teamMembers: TeamMember[];
  shareSettings: ShareSettings;
  shareLink?: string;
  qrCode?: string;
  distributionChannels: {
    email: boolean;
    teams: boolean;
    slack: boolean;
    whatsapp: boolean;
    portal: boolean;
  };
  scheduledSharing?: {
    enabled: boolean;
    scheduleDate: string;
    reminderDays: number[];
  };
  accessAnalytics: {
    totalViews: number;
    uniqueViewers: number;
    lastViewed?: string;
    downloadCount: number;
  };
}

interface TeamShareStepProps {
  formData: {
    teamShare?: TeamShareData;
    projectInfo?: any;
  };
  onDataChange: (section: string, data: TeamShareData) => void;
  language: 'fr' | 'en';
  tenant: string;
}

const translations = {
  fr: {
    title: "Partage d'Équipe",
    subtitle: "Partagez l'AST avec votre équipe et gérez les accès",
    
    // Sections
    teamMembers: "Membres de l'Équipe",
    shareSettings: "Paramètres de Partage",
    distributionChannels: "Canaux de Distribution",
    accessAnalytics: "Analytiques d'Accès",
    
    // Team members
    addMember: "Ajouter un Membre",
    memberName: "Nom du Membre",
    memberEmail: "Email",
    memberRole: "Rôle",
    department: "Département",
    phone: "Téléphone",
    permissions: "Permissions",
    accessLevel: "Niveau d'Accès",
    notificationPrefs: "Préférences de Notification",
    
    // Permissions
    viewPerm: "Voir",
    editPerm: "Modifier",
    commentPerm: "Commenter",
    approvePerm: "Approuver",
    
    // Access levels
    readOnly: "Lecture Seule",
    commenter: "Commentateur",
    editor: "Éditeur",
    admin: "Administrateur",
    
    // Share settings
    publicAccess: "Accès Public",
    requireLogin: "Connexion Requise",
    expirationDate: "Date d'Expiration",
    allowDownload: "Autoriser Téléchargement",
    allowPrint: "Autoriser Impression",
    watermark: "Filigrane",
    trackViews: "Suivre les Vues",
    allowComments: "Autoriser Commentaires",
    maxViewers: "Nombre Max de Visiteurs",
    
    // Distribution
    shareViaEmail: "Partager par Email",
    shareViaTeams: "Partager via Teams",
    shareViaSlack: "Partager via Slack",
    shareViaWhatsApp: "Partager via WhatsApp",
    shareViaPortal: "Publier sur le Portail",
    
    // Actions
    generateLink: "Générer le Lien",
    generateQR: "Générer Code QR",
    copyLink: "Copier le Lien",
    sendInvitation: "Envoyer Invitation",
    scheduleSharing: "Programmer le Partage",
    downloadPDF: "Télécharger PDF",
    
    // Status
    invited: "Invité",
    active: "Actif",
    inactive: "Inactif",
    
    // Messages
    linkCopied: "Lien copié dans le presse-papier",
    invitationSent: "Invitation envoyée",
    memberAdded: "Membre ajouté avec succès",
    settingsUpdated: "Paramètres mis à jour",
    
    // Analytics
    totalViews: "Vues Totales",
    uniqueViewers: "Visiteurs Uniques",
    lastViewed: "Dernière Vue",
    downloads: "Téléchargements",
    noActivity: "Aucune activité",
    
    // Notifications
    immediate: "Immédiate",
    daily: "Quotidienne",
    weekly: "Hebdomadaire",
    emailNotif: "Email",
    smsNotif: "SMS",
    pushNotif: "Push"
  },
  en: {
    title: "Team Sharing",
    subtitle: "Share the JSA with your team and manage access",
    
    // Sections
    teamMembers: "Team Members",
    shareSettings: "Share Settings",
    distributionChannels: "Distribution Channels",
    accessAnalytics: "Access Analytics",
    
    // Team members
    addMember: "Add Member",
    memberName: "Member Name",
    memberEmail: "Email",
    memberRole: "Role",
    department: "Department",
    phone: "Phone",
    permissions: "Permissions",
    accessLevel: "Access Level",
    notificationPrefs: "Notification Preferences",
    
    // Permissions
    viewPerm: "View",
    editPerm: "Edit",
    commentPerm: "Comment",
    approvePerm: "Approve",
    
    // Access levels
    readOnly: "Read Only",
    commenter: "Commenter",
    editor: "Editor",
    admin: "Administrator",
    
    // Share settings
    publicAccess: "Public Access",
    requireLogin: "Require Login",
    expirationDate: "Expiration Date",
    allowDownload: "Allow Download",
    allowPrint: "Allow Print",
    watermark: "Watermark",
    trackViews: "Track Views",
    allowComments: "Allow Comments",
    maxViewers: "Max Viewers",
    
    // Distribution
    shareViaEmail: "Share via Email",
    shareViaTeams: "Share via Teams",
    shareViaSlack: "Share via Slack",
    shareViaWhatsApp: "Share via WhatsApp",
    shareViaPortal: "Publish to Portal",
    
    // Actions
    generateLink: "Generate Link",
    generateQR: "Generate QR Code",
    copyLink: "Copy Link",
    sendInvitation: "Send Invitation",
    scheduleSharing: "Schedule Sharing",
    downloadPDF: "Download PDF",
    
    // Status
    invited: "Invited",
    active: "Active",
    inactive: "Inactive",
    
    // Messages
    linkCopied: "Link copied to clipboard",
    invitationSent: "Invitation sent",
    memberAdded: "Member added successfully",
    settingsUpdated: "Settings updated",
    
    // Analytics
    totalViews: "Total Views",
    uniqueViewers: "Unique Viewers",
    lastViewed: "Last Viewed",
    downloads: "Downloads",
    noActivity: "No activity yet",
    
    // Notifications
    immediate: "Immediate",
    daily: "Daily",
    weekly: "Weekly",
    emailNotif: "Email",
    smsNotif: "SMS",
    pushNotif: "Push"
  }
};

// Mock data pour les membres disponibles
const availableMembers = [
  { id: '1', name: 'Marie Dubois', email: 'marie.dubois@company.com', role: 'Superviseur HSE', department: 'Sécurité' },
  { id: '2', name: 'Jean Martin', email: 'jean.martin@company.com', role: 'Chef d\'équipe', department: 'Production' },
  { id: '3', name: 'Sophie Tremblay', email: 'sophie.tremblay@company.com', role: 'Ingénieure', department: 'Ingénierie' },
  { id: '4', name: 'Pierre Gagnon', email: 'pierre.gagnon@company.com', role: 'Contremaître', department: 'Maintenance' },
  { id: '5', name: 'Anna Chen', email: 'anna.chen@company.com', role: 'Technicienne', department: 'QA' },
];

export default function Step7TeamShare({ 
  formData, 
  onDataChange, 
  language,
  tenant 
}: TeamShareStepProps) {
  const t = translations[language];
  
  const [teamShareData, setTeamShareData] = useState<TeamShareData>({
    teamMembers: [],
    shareSettings: {
      isPublic: false,
      requiresLogin: true,
      allowDownload: true,
      allowPrint: true,
      watermark: true,
      trackViews: true,
      allowComments: true
    },
    distributionChannels: {
      email: true,
      teams: false,
      slack: false,
      whatsapp: false,
      portal: true
    },
    accessAnalytics: {
      totalViews: 0,
      uniqueViewers: 0,
      downloadCount: 0
    },
    ...formData.teamShare
  });

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    onDataChange('teamShare', teamShareData);
  }, [teamShareData, onDataChange]);

  useEffect(() => {
    // Générer le lien de partage
    if (formData.projectInfo?.title) {
      const baseUrl = `https://${tenant}.csecur360.com`;
      const astId = Math.random().toString(36).substr(2, 9);
      setShareLink(`${baseUrl}/ast/shared/${astId}`);
      setTeamShareData(prev => ({
        ...prev,
        shareLink: `${baseUrl}/ast/shared/${astId}`
      }));
    }
  }, [formData.projectInfo?.title, tenant]);

  const addTeamMember = (memberId: string) => {
    const member = availableMembers.find(m => m.id === memberId);
    if (member && !teamShareData.teamMembers.find(tm => tm.id === memberId)) {
      const newMember: TeamMember = {
        ...member,
        permissions: {
          view: true,
          edit: false,
          comment: true,
          approve: false
        },
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
          frequency: 'immediate'
        },
        accessLevel: 'comment',
        status: 'invited'
      };
      
      setTeamShareData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newMember]
      }));
      setSelectedMember('');
      setShowAddMember(false);
    }
  };

  const updateMemberPermissions = (memberId: string, field: string, value: any) => {
    setTeamShareData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              [field]: typeof member[field as keyof TeamMember] === 'object' 
                ? { ...member[field as keyof TeamMember], ...value }
                : value
            }
          : member
      )
    }));
  };

  const removeMember = (memberId: string) => {
    setTeamShareData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
    }));
  };

  const updateShareSettings = (field: keyof ShareSettings, value: any) => {
    setTeamShareData(prev => ({
      ...prev,
      shareSettings: {
        ...prev.shareSettings,
        [field]: value
      }
    }));
  };

  const updateDistributionChannels = (channel: keyof TeamShareData['distributionChannels'], value: boolean) => {
    setTeamShareData(prev => ({
      ...prev,
      distributionChannels: {
        ...prev.distributionChannels,
        [channel]: value
      }
    }));
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const sendInvitations = () => {
    // Logique d'envoi d'invitations
    console.log('Sending invitations to:', teamShareData.teamMembers);
    // Ici, vous intégreriez votre service d'email
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
          <Share2 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Share Link & QR Code */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Link className="w-5 h-5 text-blue-500 mr-2" />
          Lien de Partage
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
            <button
              onClick={copyLinkToClipboard}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          {copySuccess && (
            <div className="text-sm text-green-600 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              {t.linkCopied}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => {/* Generate QR code */}}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {t.generateQR}
            </button>
            <button
              onClick={() => {/* Download PDF */}}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {t.downloadPDF}
            </button>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-green-500 mr-2" />
            {t.teamMembers}
          </h3>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t.addMember}
          </button>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Sélectionner un membre...</option>
              {availableMembers
                .filter(m => !teamShareData.teamMembers.find(tm => tm.id === m.id))
                .map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role} ({member.department})
                  </option>
                ))
              }
            </select>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => selectedMember && addTeamMember(selectedMember)}
                disabled={!selectedMember}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-4">
          {teamShareData.teamMembers.map(member => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role} - {member.department}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(member.accessLevel)}`}>
                    {t[member.accessLevel as keyof typeof t] || member.accessLevel}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {t[member.status as keyof typeof t]}
                  </span>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Permissions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">{t.permissions}</h5>
                  <div className="space-y-2">
                    {Object.entries(member.permissions).map(([perm, value]) => (
                      <label key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateMemberPermissions(member.id, 'permissions', { [perm]: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          {t[`${perm}Perm` as keyof typeof t] || perm}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">{t.notificationPrefs}</h5>
                  <div className="space-y-2">
                    <select
                      value={member.notificationPreferences.frequency}
                      onChange={(e) => updateMemberPermissions(member.id, 'notificationPreferences', { frequency: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="immediate">{t.immediate}</option>
                      <option value="daily">{t.daily}</option>
                      <option value="weekly">{t.weekly}</option>
                    </select>
                    
                    <div className="flex space-x-4">
                      {['email', 'sms', 'push'].map(type => (
                        <label key={type} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={member.notificationPreferences[type as keyof typeof member.notificationPreferences] as boolean}
                            onChange={(e) => updateMemberPermissions(member.id, 'notificationPreferences', { [type]: e.target.checked })}
                            className="w-3 h-3 text-green-600 border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-600">
                            {t[`${type}Notif` as keyof typeof t] || type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teamShareData.teamMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun membre assigné pour le moment</p>
          </div>
        )}

        {teamShareData.teamMembers.length > 0 && (
          <div className="mt-6">
            <button
              onClick={sendInvitations}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.sendInvitation}
            </button>
          </div>
        )}
      </div>

      {/* Share Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 text-gray-500 mr-2" />
          {t.shareSettings}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.isPublic}
                onChange={(e) => updateShareSettings('isPublic', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t.publicAccess}</span>
                <p className="text-xs text-gray-500">Accessible sans connexion</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.requiresLogin}
                onChange={(e) => updateShareSettings('requiresLogin', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t.requireLogin}</span>
                <p className="text-xs text-gray-500">Connexion obligatoire</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.allowDownload}
                onChange={(e) => updateShareSettings('allowDownload', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.allowDownload}</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.watermark}
                onChange={(e) => updateShareSettings('watermark', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.watermark}</span>
            </label>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.allowPrint}
                onChange={(e) => updateShareSettings('allowPrint', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.allowPrint}</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.trackViews}
                onChange={(e) => updateShareSettings('trackViews', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.trackViews}</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={teamShareData.shareSettings.allowComments}
                onChange={(e) => updateShareSettings('allowComments', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.allowComments}</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.expirationDate}
              </label>
              <input
                type="date"
                value={teamShareData.shareSettings.expirationDate || ''}
                onChange={(e) => updateShareSettings('expirationDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Channels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 text-blue-500 mr-2" />
          {t.distributionChannels}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(teamShareData.distributionChannels).map(([channel, enabled]) => (
            <label key={channel} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => updateDistributionChannels(channel as keyof TeamShareData['distributionChannels'], e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                {channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                {channel === 'teams' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                {channel === 'slack' && <MessageSquare className="w-4 h-4 text-green-500" />}
                {channel === 'whatsapp' && <Phone className="w-4 h-4 text-green-600" />}
                {channel === 'portal' && <Globe className="w-4 h-4 text-blue-600" />}
                <span className="text-sm font-medium text-gray-700">
                  {t[`shareVia${channel.charAt(0).toUpperCase() + channel.slice(1)}` as keyof typeof t] || channel}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Access Analytics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 text-green-500 mr-2" />
          {t.accessAnalytics}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{teamShareData.accessAnalytics.totalViews}</div>
            <div className="text-sm text-blue-800">{t.totalViews}</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{teamShareData.accessAnalytics.uniqueViewers}</div>
            <div className="text-sm text-green-800">{t.uniqueViewers}</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{teamShareData.accessAnalytics.downloadCount}</div>
            <div className="text-sm text-purple-800">{t.downloads}</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-medium text-gray-600">
              {teamShareData.accessAnalytics.lastViewed 
                ? new Date(teamShareData.accessAnalytics.lastViewed).toLocaleDateString()
                : t.noActivity
              }
            </div>
            <div className="text-sm text-gray-600">{t.lastViewed}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
