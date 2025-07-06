// app/hooks/useTeamSharing.ts
import { useState, useCallback } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

interface ShareOptions {
  method: 'email' | 'sms' | 'whatsapp' | 'teams' | 'slack';
  recipients: string[];
  includeAttachments?: boolean;
  expirationHours?: number;
  requireAcknowledgment?: boolean;
  allowComments?: boolean;
}

interface SharedDocument {
  id: string;
  title: string;
  shareUrl: string;
  sharedAt: Date;
  expiresAt?: Date;
  recipients: TeamMember[];
  method: ShareOptions['method'];
  status: 'pending' | 'viewed' | 'acknowledged' | 'expired';
  viewCount: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: TeamMember;
  content: string;
  timestamp: Date;
  type: 'comment' | 'concern' | 'approval';
}

interface TeamSharingResult {
  sharedDocuments: SharedDocument[];
  isSharing: boolean;
  error: string | null;
  shareDocument: (documentData: any, options: ShareOptions) => Promise<SharedDocument>;
  getShareableLink: (documentId: string, expirationHours?: number) => string;
  trackViewing: (shareId: string, viewerId: string) => void;
  addComment: (shareId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  getTeamMembers: () => TeamMember[];
  sendReminder: (shareId: string, recipientIds: string[]) => Promise<void>;
  revokeAccess: (shareId: string) => void;
}

export function useTeamSharing(): TeamSharingResult {
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock équipe members
  const mockTeamMembers: TeamMember[] = [
    {
      id: 'tm1',
      name: 'Marc Tremblay',
      email: 'marc.tremblay@company.com',
      phone: '+1-418-555-0101',
      role: 'Superviseur sécurité',
      department: 'Sécurité',
      isOnline: true
    },
    {
      id: 'tm2', 
      name: 'Julie Gagnon',
      email: 'julie.gagnon@company.com',
      phone: '+1-418-555-0102',
      role: 'Ingénieure',
      department: 'Ingénierie',
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2h ago
    },
    {
      id: 'tm3',
      name: 'Pierre Bouchard',
      email: 'pierre.bouchard@company.com', 
      phone: '+1-418-555-0103',
      role: 'Chef équipe',
      department: 'Opérations',
      isOnline: true
    },
    {
      id: 'tm4',
      name: 'Marie Lavoie',
      email: 'marie.lavoie@company.com',
      phone: '+1-418-555-0104', 
      role: 'Coordonnatrice HSE',
      department: 'Sécurité',
      isOnline: true
    }
  ];

  const generateShareableLink = useCallback((documentId: string, expirationHours: number = 48): string => {
    const baseUrl = window.location.origin;
    const token = btoa(`${documentId}-${Date.now()}-${Math.random()}`);
    return `${baseUrl}/shared/${token}?expires=${expirationHours}h`;
  }, []);

  const shareDocument = useCallback(async (documentData: any, options: ShareOptions): Promise<SharedDocument> => {
    setIsSharing(true);
    setError(null);

    try {
      // Simulation délai partage
      await new Promise(resolve => setTimeout(resolve, 1500));

      const shareId = `share_${Date.now()}`;
      const recipients = mockTeamMembers.filter(member => 
        options.recipients.includes(member.email) || options.recipients.includes(member.id)
      );

      const expiresAt = options.expirationHours 
        ? new Date(Date.now() + options.expirationHours * 60 * 60 * 1000)
        : undefined;

      const sharedDoc: SharedDocument = {
        id: shareId,
        title: documentData.projectName || 'Document AST',
        shareUrl: generateShareableLink(shareId, options.expirationHours),
        sharedAt: new Date(),
        expiresAt,
        recipients,
        method: options.method,
        status: 'pending',
        viewCount: 0,
        comments: []
      };

      // Simuler envoi selon méthode
      switch (options.method) {
        case 'email':
          console.log(`📧 Email envoyé à: ${recipients.map(r => r.email).join(', ')}`);
          console.log(`Sujet: Nouveau document AST - ${sharedDoc.title}`);
          console.log(`Lien: ${sharedDoc.shareUrl}`);
          break;
          
        case 'sms':
          recipients.forEach(recipient => {
            if (recipient.phone) {
              console.log(`📱 SMS envoyé à ${recipient.phone}: Nouveau AST "${sharedDoc.title}" - ${sharedDoc.shareUrl}`);
            }
          });
          break;
          
        case 'whatsapp':
          const whatsappMessage = encodeURIComponent(`Nouveau document AST: ${sharedDoc.title}\n${sharedDoc.shareUrl}`);
          recipients.forEach(recipient => {
            if (recipient.phone) {
              const cleanPhone = recipient.phone.replace(/[^\d]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
              console.log(`💬 WhatsApp: ${whatsappUrl}`);
            }
          });
          break;
          
        case 'teams':
          console.log(`👥 Notification Teams envoyée au canal équipe`);
          console.log(`Message: Nouveau AST "${sharedDoc.title}" prêt pour révision`);
          break;
          
        case 'slack':
          console.log(`💬 Message Slack envoyé`);
          console.log(`Canal: #securite-ast`);
          break;
      }

      setSharedDocuments(prev => [sharedDoc, ...prev]);
      return sharedDoc;

    } catch (err) {
      const errorMessage = 'Erreur lors du partage du document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  }, [generateShareableLink]);

  const getShareableLink = useCallback((documentId: string, expirationHours: number = 48): string => {
    return generateShareableLink(documentId, expirationHours);
  }, [generateShareableLink]);

  const trackViewing = useCallback((shareId: string, viewerId: string) => {
    setSharedDocuments(prev => prev.map(doc => {
      if (doc.id === shareId) {
        return {
          ...doc,
          viewCount: doc.viewCount + 1,
          status: doc.status === 'pending' ? 'viewed' : doc.status
        };
      }
      return doc;
    }));
  }, []);

  const addComment = useCallback((shareId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`,
      timestamp: new Date()
    };

    setSharedDocuments(prev => prev.map(doc => {
      if (doc.id === shareId) {
        return {
          ...doc,
          comments: [...doc.comments, newComment]
        };
      }
      return doc;
    }));
  }, []);

  const getTeamMembers = useCallback((): TeamMember[] => {
    return mockTeamMembers;
  }, []);

  const sendReminder = useCallback(async (shareId: string, recipientIds: string[]): Promise<void> => {
    setIsSharing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const doc = sharedDocuments.find(d => d.id === shareId);
      const recipients = mockTeamMembers.filter(m => recipientIds.includes(m.id));
      
      console.log(`🔔 Rappel envoyé pour "${doc?.title}" à: ${recipients.map(r => r.name).join(', ')}`);
      
    } finally {
      setIsSharing(false);
    }
  }, [sharedDocuments]);

  const revokeAccess = useCallback((shareId: string) => {
    setSharedDocuments(prev => prev.map(doc => {
      if (doc.id === shareId) {
        return {
          ...doc,
          status: 'expired',
          expiresAt: new Date() // Expire immédiatement
        };
      }
      return doc;
    }));
  }, []);

  return {
    sharedDocuments,
    isSharing,
    error,
    shareDocument,
    getShareableLink,
    trackViewing,
    addComment,
    getTeamMembers,
    sendReminder,
    revokeAccess
  };
}
