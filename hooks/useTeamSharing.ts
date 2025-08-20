// hooks/useTeamSharing.ts
import { useState, useEffect } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  status: 'invited' | 'active' | 'inactive';
  lastSeen?: string;
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
}

export interface TeamResponse {
  memberId: string;
  memberName: string;
  response: 'approved' | 'rejected' | 'pending' | 'viewed';
  timestamp: string;
  comments?: string;
  signature?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface ShareSettings {
  expirationDate?: string;
  requireSignature: boolean;
  allowComments: boolean;
  allowEditing: boolean;
  notifyOnView: boolean;
  notifyOnResponse: boolean;
  reminderSchedule: number[]; // Days before expiration
}

export interface ShareSession {
  id: string;
  astId: string;
  shareLink: string;
  qrCode?: string;
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
  isActive: boolean;
  settings: ShareSettings;
  members: TeamMember[];
  responses: TeamResponse[];
  analytics: {
    totalViews: number;
    uniqueViewers: number;
    averageViewTime: number;
    lastViewedAt?: string;
    responseRate: number;
  };
}

export interface NotificationTemplate {
  id: string;
  type: 'invitation' | 'reminder' | 'urgent' | 'approval_request';
  subject: string;
  message: string;
  language: 'fr' | 'en';
}

export const useTeamSharing = () => {
  const [activeSessions, setActiveSessions] = useState<ShareSession[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Templates de notification prédéfinis
  const notificationTemplates: NotificationTemplate[] = [
    {
      id: 'invitation_fr',
      type: 'invitation',
      subject: 'AST - Révision requise',
      message: 'Bonjour {memberName},\n\nVous êtes invité(e) à réviser l\'Analyse Sécuritaire de Tâches pour le projet "{projectName}".\n\nAccédez au document : {shareLink}\n\nDate limite : {expirationDate}\n\nCordialement,\n{senderName}',
      language: 'fr'
    },
    {
      id: 'reminder_fr',
      type: 'reminder',
      subject: 'Rappel - AST en attente de révision',
      message: 'Bonjour {memberName},\n\nCeci est un rappel concernant l\'AST "{projectName}" qui attend votre révision.\n\nDate limite : {expirationDate}\n\nLien : {shareLink}\n\nMerci de votre attention.',
      language: 'fr'
    }
  ];

  // Fonction pour créer une session de partage
  const createShareSession = async (
    astData: any,
    members: TeamMember[],
    settings: ShareSettings
  ): Promise<ShareSession> => {
    setIsSharing(true);
    setError(null);

    try {
      const sessionId = generateSessionId();
      const shareLink = generateShareLink(sessionId);
      
      const session: ShareSession = {
        id: sessionId,
        astId: astData.id || 'temp-ast-id',
        shareLink,
        createdAt: new Date().toISOString(),
        expiresAt: settings.expirationDate,
        createdBy: 'current-user-id', // À remplacer par l'utilisateur actuel
        isActive: true,
        settings,
        members,
        responses: [],
        analytics: {
          totalViews: 0,
          uniqueViewers: 0,
          averageViewTime: 0,
          responseRate: 0
        }
      };

      // Générer QR code
      session.qrCode = await generateQRCode(shareLink);

      // Sauvegarder la session
      setActiveSessions(prev => [...prev, session]);

      // Envoyer les invitations
      await sendInvitations(session);

      return session;
    } catch (err) {
      setError('Erreur lors de la création de la session de partage');
      throw err;
    } finally {
      setIsSharing(false);
    }
  };

  // Fonction pour partager avec l'équipe
  const shareWithTeam = async (
    members: string[],
    method: 'email' | 'sms' | 'whatsapp' | 'teams' | 'slack',
    astData: any,
    settings?: Partial<ShareSettings>
  ) => {
    const defaultSettings: ShareSettings = {
      requireSignature: true,
      allowComments: true,
      allowEditing: false,
      notifyOnView: true,
      notifyOnResponse: true,
      reminderSchedule: [7, 3, 1],
      ...settings
    };

    const teamMembers: TeamMember[] = members.map(memberId => ({
      id: memberId,
      name: `Membre ${memberId}`,
      email: `membre${memberId}@company.com`,
      role: 'Équipier',
      department: 'Production',
      status: 'invited' as const,
      permissions: {
        view: true,
        edit: defaultSettings.allowEditing,
        comment: defaultSettings.allowComments,
        approve: true
      },
      notificationPreferences: {
        email: method === 'email',
        sms: method === 'sms',
        push: true,
        frequency: 'immediate'
      }
    }));

    try {
      const session = await createShareSession(astData, teamMembers, defaultSettings);

      return {
        success: true,
        sessionId: session.id,
        shareLink: session.shareLink,
        qrCode: session.qrCode,
        message: `AST partagée avec ${members.length} membre(s) via ${method}`,
        expiresAt: session.expiresAt
      };
    } catch (err) {
      return {
        success: false,
        message: 'Erreur lors du partage'
      };
    }
  };

  // Fonction pour envoyer les invitations
  const sendInvitations = async (session: ShareSession) => {
    for (const member of session.members) {
      try {
        if (member.notificationPreferences.email) {
          await sendEmailInvitation(member, session);
        }
        if (member.notificationPreferences.sms) {
          await sendSMSInvitation(member, session);
        }
      } catch (err) {
        console.error(`Erreur envoi invitation à ${member.name}:`, err);
      }
    }
  };

  // Fonction pour envoyer invitation email
  const sendEmailInvitation = async (member: TeamMember, session: ShareSession) => {
    const template = notificationTemplates.find(t => t.type === 'invitation' && t.language === 'fr');
    if (!template) return;

    const message = template.message
      .replace('{memberName}', member.name)
      .replace('{projectName}', 'Projet AST')
      .replace('{shareLink}', session.shareLink)
      .replace('{expirationDate}', session.expiresAt ? new Date(session.expiresAt).toLocaleDateString('fr-CA') : 'Non définie')
      .replace('{senderName}', 'Équipe Sécurité');

    // Simulation d'envoi email
    console.log(`Email envoyé à ${member.email}:`, {
      subject: template.subject,
      message
    });

    return true;
  };

  // Fonction pour envoyer invitation SMS
  const sendSMSInvitation = async (member: TeamMember, session: ShareSession) => {
    const message = `AST - Révision requise pour "${session.astId}". Lien: ${session.shareLink}`;
    
    // Simulation d'envoi SMS
    console.log(`SMS envoyé à ${member.phone}:`, message);

    return true;
  };

  // Fonction pour ajouter une réponse
  const addResponse = (sessionId: string, response: Omit<TeamResponse, 'timestamp'>) => {
    setActiveSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const newResponse: TeamResponse = {
          ...response,
          timestamp: new Date().toISOString()
        };

        const updatedResponses = [...session.responses.filter(r => r.memberId !== response.memberId), newResponse];
        
        return {
          ...session,
          responses: updatedResponses,
          analytics: {
            ...session.analytics,
            responseRate: (updatedResponses.length / session.members.length) * 100
          }
        };
      }
      return session;
    }));
  };

  // Fonction pour envoyer des rappels
  const sendReminders = async (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    const pendingMembers = session.members.filter(member => 
      !session.responses.some(response => 
        response.memberId === member.id && response.response !== 'pending'
      )
    );

    for (const member of pendingMembers) {
      try {
        await sendReminderNotification(member, session);
      } catch (err) {
        console.error(`Erreur rappel à ${member.name}:`, err);
      }
    }
  };

  // Fonction pour envoyer rappel
  const sendReminderNotification = async (member: TeamMember, session: ShareSession) => {
    const template = notificationTemplates.find(t => t.type === 'reminder' && t.language === 'fr');
    if (!template) return;

    const message = template.message
      .replace('{memberName}', member.name)
      .replace('{projectName}', session.astId)
      .replace('{expirationDate}', session.expiresAt ? new Date(session.expiresAt).toLocaleDateString('fr-CA') : 'Non définie')
      .replace('{shareLink}', session.shareLink);

    if (member.notificationPreferences.email) {
      console.log(`Rappel email envoyé à ${member.email}:`, {
        subject: template.subject,
        message
      });
    }
  };

  // Fonction pour générer un ID de session
  const generateSessionId = (): string => {
    return `ast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fonction pour générer un lien de partage
  const generateShareLink = (sessionId: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.csecur360.com';
    return `${baseUrl}/shared/${sessionId}`;
  };

  // Fonction pour générer un QR code
  const generateQRCode = async (url: string): Promise<string> => {
    // Simulation de génération QR code
    return `data:image/svg+xml;base64,${btoa(`<svg><text>${url}</text></svg>`)}`;
  };

  // Fonction pour obtenir les statistiques d'une session
  const getSessionStats = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return null;

    const totalResponses = session.responses.length;
    const approvedCount = session.responses.filter(r => r.response === 'approved').length;
    const rejectedCount = session.responses.filter(r => r.response === 'rejected').length;
    const pendingCount = session.members.length - totalResponses;

    return {
      totalMembers: session.members.length,
      totalResponses,
      approvedCount,
      rejectedCount,
      pendingCount,
      responseRate: session.analytics.responseRate,
      averageResponseTime: calculateAverageResponseTime(session),
      isComplete: pendingCount === 0
    };
  };

  // Fonction pour calculer le temps de réponse moyen
  const calculateAverageResponseTime = (session: ShareSession): number => {
    if (session.responses.length === 0) return 0;

    const responseTimes = session.responses.map(response => {
      const responseTime = new Date(response.timestamp);
      const createdTime = new Date(session.createdAt);
      return responseTime.getTime() - createdTime.getTime();
    });

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  };

  // Fonction pour fermer une session
  const closeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, isActive: false }
        : session
    ));
  };

  // Effet pour programmer les rappels automatiques
  useEffect(() => {
    const checkReminders = () => {
      activeSessions.forEach(session => {
        if (!session.isActive || !session.expiresAt) return;

        const expirationDate = new Date(session.expiresAt);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (session.settings.reminderSchedule.includes(daysUntilExpiration)) {
          sendReminders(session.id);
        }
      });
    };

    // Vérifier les rappels toutes les heures
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeSessions]);

  return {
    activeSessions,
    isSharing,
    error,
    shareWithTeam,
    addResponse,
    sendReminders,
    getSessionStats,
    closeSession,
    createShareSession
  };
};

export default useTeamSharing;
