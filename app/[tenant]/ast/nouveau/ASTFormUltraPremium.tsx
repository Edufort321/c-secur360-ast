// =================== AJOUTS SECTION 1 - TYPES DE TRAVAUX ET CONFIGURATIONS ===================
// À ajouter après la section des traductions dans votre premier code

// Types de travaux prédéfinis avec catégories (NOUVEAU)
const WORK_TYPES = [
  // ÉLECTRICITÉ
  {
    id: 'electrical_maintenance',
    name: 'Maintenance électrique',
    icon: '⚡',
    category: 'Électricité',
    description: 'Travaux de maintenance sur installations électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'burns', 'falls']
  },
  {
    id: 'electrical_installation',
    name: 'Installation électrique',
    icon: '🔌',
    category: 'Électricité',
    description: 'Installation de nouveaux équipements électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'cuts_lacerations', 'falls']
  },
  {
    id: 'electrical_inspection',
    name: 'Inspection électrique',
    icon: '🔍',
    category: 'Électricité',
    description: 'Inspection et tests d\'équipements électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'confined_spaces']
  },

  // GAZ ET PIPELINE
  {
    id: 'gas_maintenance',
    name: 'Maintenance gazière',
    icon: '🔥',
    category: 'Gaz & Pipeline',
    description: 'Maintenance sur réseaux de distribution de gaz',
    baseHazards: ['gas_leak', 'explosion', 'fire', 'toxic_exposure', 'confined_spaces']
  },
  {
    id: 'pipeline_inspection',
    name: 'Inspection pipeline',
    icon: '🚰',
    category: 'Gaz & Pipeline',
    description: 'Inspection et contrôle de pipelines',
    baseHazards: ['gas_leak', 'explosion', 'confined_spaces', 'toxic_exposure']
  },

  // CONSTRUCTION
  {
    id: 'construction_general',
    name: 'Construction générale',
    icon: '🏗️',
    category: 'Construction',
    description: 'Travaux de construction et rénovation',
    baseHazards: ['falls', 'struck_by_objects', 'cuts_lacerations', 'heavy_equipment', 'noise']
  },
  {
    id: 'excavation',
    name: 'Excavation',
    icon: '⛏️',
    category: 'Construction',
    description: 'Travaux d\'excavation et terrassement',
    baseHazards: ['cave_in', 'struck_by_objects', 'heavy_equipment', 'underground_utilities', 'falls']
  },

  // TÉLÉCOMMUNICATIONS
  {
    id: 'telecom_installation',
    name: 'Installation télécom',
    icon: '📡',
    category: 'Télécommunications',
    description: 'Installation d\'équipements de télécommunication',
    baseHazards: ['falls', 'electrical_shock', 'radio_frequency', 'weather_exposure']
  },

  // URGENCE
  {
    id: 'emergency_response',
    name: 'Intervention d\'urgence',
    icon: '🚨',
    category: 'Urgence',
    description: 'Interventions d\'urgence et réparations critiques',
    baseHazards: ['time_pressure', 'weather_exposure', 'unknown_hazards', 'stress']
  }
];

// Configuration clients spécifiques (NOUVEAU)
const CLIENT_CONFIGURATIONS = {
  'hydro-quebec': {
    logo: '⚡ Hydro-Québec',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    requiredFields: ['permit_number', 'safety_officer', 'emergency_contacts'],
    customHazards: ['electrical_specific', 'high_voltage', 'substations'],
    templates: ['electrical_maintenance', 'emergency_response']
  },
  'energir': {
    logo: '🔥 Énergir',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    requiredFields: ['gas_permit', 'excavation_permit', 'pipeline_clearance'],
    customHazards: ['gas_specific', 'pipeline_integrity', 'odorization'],
    templates: ['gas_maintenance', 'pipeline_inspection']
  },
  'bell': {
    logo: '📡 Bell Canada',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    requiredFields: ['telecom_permit', 'fiber_clearance', 'rf_safety'],
    customHazards: ['rf_radiation', 'fiber_safety', 'tower_climbing'],
    templates: ['telecom_installation']
  }
};

// Interface pour les types de travaux (NOUVEAU)
interface WorkType {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  baseHazards: string[];
}

// Interface météo étendue (NOUVEAU)
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  conditions: string;
  warnings: string[];
  impact: 'low' | 'medium' | 'high';
}

// Ajout au formData existant - nouvelles propriétés
interface ExtendedProjectInfo {
  // Propriétés existantes...
  workType?: WorkType;
  coordinates?: { lat: number; lng: number };
  weather?: WeatherData;
  permits?: string[];
  emergencyContacts?: Array<{
    name: string;
    role: string;
    phone: string;
    email: string;
  }>;
}

// Fonction pour sélectionner dangers par type de travail (NOUVEAU)
const getHazardsByWorkType = (workTypeId: string): ElectricalHazard[] => {
  const workType = WORK_TYPES.find(wt => wt.id === workTypeId);
  if (!workType) return [];
  
  return predefinedElectricalHazards.filter(hazard => 
    workType.baseHazards.includes(hazard.id)
  );
};

// Widget sélection type de travail (NOUVEAU - à ajouter à l'étape 1)
const WorkTypeSelector = ({ 
  selectedWorkType, 
  onWorkTypeChange 
}: { 
  selectedWorkType?: WorkType; 
  onWorkTypeChange: (workType: WorkType) => void; 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [...new Set(WORK_TYPES.map(wt => wt.category))];
  const filteredWorkTypes = selectedCategory === 'all' 
    ? WORK_TYPES 
    : WORK_TYPES.filter(wt => wt.category === selectedCategory);

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
        🏗️ Type de travail *
      </label>
      
      {/* Filtres par catégorie */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            background: selectedCategory === 'all' ? '#3b82f6' : 'rgba(100, 116, 139, 0.2)',
            color: selectedCategory === 'all' ? 'white' : '#94a3b8'
          }}
        >
          Tous
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              background: selectedCategory === category ? '#3b82f6' : 'rgba(100, 116, 139, 0.2)',
              color: selectedCategory === category ? 'white' : '#94a3b8'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grille des types de travaux */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '12px' 
      }}>
        {filteredWorkTypes.map(workType => (
          <div
            key={workType.id}
            onClick={() => onWorkTypeChange(workType)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: selectedWorkType?.id === workType.id 
                ? '2px solid #3b82f6' 
                : '1px solid rgba(100, 116, 139, 0.3)',
              background: selectedWorkType?.id === workType.id
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(30, 41, 59, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{workType.icon}</span>
              <div>
                <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0' }}>
                  {workType.name}
                </h4>
                <span style={{ 
                  color: '#94a3b8', 
                  fontSize: '11px',
                  background: 'rgba(100, 116, 139, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {workType.category}
                </span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0', lineHeight: '1.4' }}>
              {workType.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { WORK_TYPES, CLIENT_CONFIGURATIONS, WorkTypeSelector, getHazardsByWorkType };
// =================== AJOUTS SECTION 2 - PARTAGE ÉQUIPE ET NOTIFICATIONS ===================
// À ajouter après vos interfaces existantes

// Interfaces pour le partage équipe (NOUVEAU)
interface TeamConsultationStatus {
  consulted: boolean;
  consentGiven: boolean;
  timestamp: string;
  ipAddress: string;
  comments: string;
}

interface TeamNotification {
  employeeId: string;
  method: 'sms' | 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
  timestamp: string;
}

// États pour le partage équipe (NOUVEAU - à ajouter dans votre composant principal)
const useTeamSharing = () => {
  const [shareMode, setShareMode] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [teamConsultationStatus, setTeamConsultationStatus] = useState<Record<string, TeamConsultationStatus>>({});
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [teamNotifications, setTeamNotifications] = useState<TeamNotification[]>([]);

  // Fonction pour générer le lien de partage
  const generateShareLink = async (astData: ASTFormData) => {
    setIsGeneratingShareLink(true);
    try {
      const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const shareData = {
        ...astData,
        id: shareId,
        status: 'team_validation',
        shareMode: true,
        shareExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Simulation sauvegarde (remplacer par vraie API)
      localStorage.setItem(`ast_share_${shareId}`, JSON.stringify(shareData));
      
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/ast/consultation/${shareId}`;
      setShareLink(generatedLink);
      
      // Initialiser le statut de consultation pour chaque membre
      const initialStatus: Record<string, TeamConsultationStatus> = {};
      astData.team.members.forEach(member => {
        initialStatus[member.id] = {
          consulted: false,
          consentGiven: false,
          timestamp: '',
          ipAddress: '',
          comments: ''
        };
      });
      setTeamConsultationStatus(initialStatus);

      return { success: true, link: generatedLink };
    } catch (error) {
      console.error('Erreur génération lien:', error);
      return { success: false, error };
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  // Fonction pour envoyer les notifications
  const sendTeamNotifications = async (astData: ASTFormData, methods: Array<'sms' | 'email' | 'whatsapp'>) => {
    if (!shareLink || !astData.team.members.length) return;

    const notifications: TeamNotification[] = [];

    for (const member of astData.team.members) {
      for (const method of methods) {
        try {
          let message = '';
          
          if (method === 'sms' || method === 'whatsapp') {
            message = `🔒 CONSULTATION AST REQUISE
📋 Projet: ${astData.projectInfo.client} - ${astData.projectInfo.projectNumber}
📅 Date: ${astData.projectInfo.date}
👤 ${member.name}, votre consultation est requise pour l'AST.

🔗 Lien consultation: ${shareLink}

⚠️ Consultez et donnez votre consentement avant le début des travaux.
⏰ Lien valide 7 jours.

Sécur360 - Votre sécurité, notre priorité`;
          }

          // Simulation envoi (remplacer par vraies APIs)
          console.log(`Envoi ${method} à ${member.name}:`, message);
          
          notifications.push({
            employeeId: member.id,
            method,
            status: 'sent',
            timestamp: new Date().toISOString()
          });

          // Simulation WhatsApp API
          if (method === 'whatsapp' && member.phone) {
            const whatsappUrl = `https://wa.me/${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }

        } catch (error) {
          console.error(`Erreur envoi ${method} à ${member.name}:`, error);
          notifications.push({
            employeeId: member.id,
            method,
            status: 'error',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    setTeamNotifications(notifications);
    return notifications;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const processTeamConsultation = (employeeId: string, consent: boolean, comments: string = '') => {
    const consultation: TeamConsultationStatus = {
      consulted: true,
      consentGiven: consent,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1', // Obtenir vraie IP
      comments
    };

    setTeamConsultationStatus(prev => ({
      ...prev,
      [employeeId]: consultation
    }));

    return consultation;
  };

  return {
    shareMode,
    setShareMode,
    shareLink,
    teamConsultationStatus,
    isGeneratingShareLink,
    teamNotifications,
    generateShareLink,
    sendTeamNotifications,
    copyShareLink,
    processTeamConsultation
  };
};

// Composant de partage équipe (NOUVEAU - à ajouter à l'étape 8)
const TeamSharingComponent = ({ 
  astData, 
  teamSharing 
}: { 
  astData: ASTFormData; 
  teamSharing: ReturnType<typeof useTeamSharing>; 
}) => {
  const {
    shareLink,
    teamConsultationStatus,
    isGeneratingShareLink,
    teamNotifications,
    generateShareLink,
    sendTeamNotifications,
    copyShareLink
  } = teamSharing;

  const teamConsultationProgress = astData.team.members.length > 0 
    ? Object.values(teamConsultationStatus).filter(s => s.consulted).length / astData.team.members.length * 100 
    : 0;

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        🔗 Partage équipe pour consultation
      </h3>

      {/* Statistiques de consultation */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          📊 État des consultations équipe
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
              {astData.team.members.length}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Membres équipe</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
              {Object.values(teamConsultationStatus).filter(s => s.consulted).length}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Consultations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
              {Object.values(teamConsultationStatus).filter(s => s.consentGiven).length}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Approbations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
              {Math.round(teamConsultationProgress)}%
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Progression</div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div style={{ background: 'rgba(100, 116, 139, 0.3)', borderRadius: '4px', height: '6px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
              height: '6px',
              borderRadius: '4px',
              width: `${teamConsultationProgress}%`,
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {!shareLink ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
          <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
            Générez un lien de consultation pour permettre à votre équipe de consulter et approuver l'AST
          </p>
          <button
            onClick={() => generateShareLink(astData)}
            disabled={isGeneratingShareLink || !astData.team.members.length}
            style={{
              background: isGeneratingShareLink 
                ? 'rgba(100, 116, 139, 0.5)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isGeneratingShareLink ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            {isGeneratingShareLink ? (
              <>
                <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                Génération...
              </>
            ) : (
              <>
                <Share2 style={{ width: '16px', height: '16px' }} />
                Générer lien consultation
              </>
            )}
          </button>
          {!astData.team.members.length && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
              Ajoutez des membres d'équipe avant de générer le lien
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Lien généré */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <label style={{ display: 'block', color: '#10b981', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
              🔗 Lien de consultation (valide 7 jours)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={shareLink}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '12px'
                }}
              />
              <button
                onClick={copyShareLink}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Copy style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>

          {/* Options d'envoi */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <h4 style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
              📱 Envoyer aux membres équipe
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => sendTeamNotifications(astData, ['sms'])}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <MessageSquare style={{ width: '12px', height: '12px' }} />
                SMS
              </button>
              <button
                onClick={() => sendTeamNotifications(astData, ['whatsapp'])}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <MessageSquare style={{ width: '12px', height: '12px' }} />
                WhatsApp
              </button>
              <button
                onClick={() => sendTeamNotifications(astData, ['email'])}
                style={{
                  background: 'rgba(100, 116, 139, 0.7)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Mail style={{ width: '12px', height: '12px' }} />
                Email
              </button>
              <button
                onClick={() => sendTeamNotifications(astData, ['sms', 'whatsapp', 'email'])}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Share2 style={{ width: '12px', height: '12px' }} />
                Tous
              </button>
            </div>
          </div>

          {/* Suivi des consultations individuelles */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <h4 style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
              👁️ Suivi consultations individuelles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {astData.team.members.map(member => {
                const consultation = teamConsultationStatus[member.id];
                return (
                  <div key={member.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{member.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>{member.department}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {consultation?.consulted ? (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: consultation.consentGiven ? '#10b981' : '#ef4444'
                          }}>
                            {consultation.consentGiven ? '✅ Approuvé' : '❌ Refusé'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {new Date(consultation.timestamp).toLocaleDateString('fr-CA')}
                          </div>
                          {consultation.comments && (
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                              💬 {consultation.comments}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>
                          ⏳ En attente
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { useTeamSharing, TeamSharingComponent };
// =================== AJOUTS SECTION 3 - WIDGET MÉTÉO ET STATISTIQUES ===================
// À ajouter dans votre composant principal

// Import des icônes météo supplémentaires
import { 
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  RefreshCw,
  Info,
  AlertTriangle
} from 'lucide-react';

// Widget météo avancé (NOUVEAU)
const WeatherWidget = ({ 
  showWidget, 
  onClose, 
  weatherData,
  onWeatherUpdate 
}: { 
  showWidget: boolean; 
  onClose: () => void;
  weatherData?: WeatherData;
  onWeatherUpdate?: (data: WeatherData) => void;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherData>(weatherData || {
    temperature: 22,
    humidity: 65,
    windSpeed: 15,
    windDirection: 'SO',
    precipitation: 0,
    visibility: 10,
    uvIndex: 6,
    conditions: 'Partiellement nuageux',
    warnings: [],
    impact: 'low'
  });

  const refreshWeatherData = async () => {
    setIsRefreshing(true);
    try {
      // Simulation API météo (remplacer par vraie API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newWeather: WeatherData = {
        ...currentWeather,
        temperature: Math.round(Math.random() * 30 + 5),
        humidity: Math.round(Math.random() * 40 + 40),
        windSpeed: Math.round(Math.random() * 25 + 5),
        uvIndex: Math.round(Math.random() * 10),
        conditions: ['Ensoleillé', 'Partiellement nuageux', 'Nuageux', 'Pluvieux'][Math.floor(Math.random() * 4)]
      };
      
      setCurrentWeather(newWeather);
      onWeatherUpdate?.(newWeather);
    } catch (error) {
      console.error('Erreur refresh météo:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getWeatherIcon = (conditions: string) => {
    const lowerConditions = conditions.toLowerCase();
    if (lowerConditions.includes('ensoleillé')) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (lowerConditions.includes('nuageux')) return <Cloud className="w-5 h-5 text-gray-500" />;
    if (lowerConditions.includes('pluvieux')) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (lowerConditions.includes('neige')) return <Snowflake className="w-5 h-5 text-blue-300" />;
    return <Sun className="w-5 h-5 text-yellow-500" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getImpactText = (impact: string) => {
    switch (impact) {
      case 'low': return '✅ Conditions favorables';
      case 'medium': return '⚠️ Conditions modérées';
      case 'high': return '🚫 Conditions défavorables';
      default: return '❓ Impact inconnu';
    }
  };

  if (!showWidget) return null;

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', margin: '0' }}>
          🌤️ Conditions météorologiques
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refreshWeatherData}
            disabled={isRefreshing}
            style={{
              background: 'none',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw 
              style={{ 
                width: '14px', 
                height: '14px',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} 
            />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>

      {/* Conditions principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Thermometer className="w-4 h-4 text-red-500" />
          <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
            {currentWeather.temperature}°C
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wind className="w-4 h-4 text-blue-500" />
          <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
            {currentWeather.windSpeed} km/h
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Droplets className="w-4 h-4 text-blue-600" />
          <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
            {currentWeather.humidity}%
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {getWeatherIcon(currentWeather.conditions)}
          <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
            UV: {currentWeather.uvIndex}
          </span>
        </div>
      </div>

      {/* Conditions détaillées */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {getWeatherIcon(currentWeather.conditions)}
          <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{currentWeather.conditions}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <div style={{ color: '#94a3b8' }}>Vent: {currentWeather.windDirection}</div>
          <div style={{ color: '#94a3b8' }}>Visibilité: {currentWeather.visibility} km</div>
          <div style={{ color: '#94a3b8' }}>Précipitations: {currentWeather.precipitation} mm</div>
        </div>
      </div>

      {/* Impact sur les travaux */}
      <div style={{
        padding: '12px',
        borderRadius: '8px',
        background: `${getImpactColor(currentWeather.impact)}15`,
        border: `1px solid ${getImpactColor(currentWeather.impact)}30`
      }}>
        <p style={{ 
          color: getImpactColor(currentWeather.impact), 
          fontSize: '12px', 
          fontWeight: '600',
          margin: '0'
        }}>
          {getImpactText(currentWeather.impact)}
        </p>
      </div>

      {/* Alertes météo */}
      {currentWeather.warnings.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
              Alertes météorologiques
            </span>
          </div>
          {currentWeather.warnings.map((warning, index) => (
            <p key={index} style={{ color: '#ef4444', fontSize: '11px', margin: '4px 0' }}>
              • {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Panneau de statistiques avancées (NOUVEAU)
const AdvancedStatsPanel = ({ 
  astData, 
  teamConsultationStatus 
}: { 
  astData: ASTFormData; 
  teamConsultationStatus: Record<string, TeamConsultationStatus>;
}) => {
  // Calculs statistiques
  const totalHazards = astData.electricalHazards.filter(h => h.isSelected).length;
  const criticalHazards = astData.electricalHazards.filter(h => h.isSelected && h.riskLevel === 'critical').length;
  const highHazards = astData.electricalHazards.filter(h => h.isSelected && h.riskLevel === 'high').length;
  
  const totalRisk = astData.electricalHazards
    .filter(h => h.isSelected)
    .reduce((sum, h) => {
      const riskValue = h.riskLevel === 'critical' ? 4 : h.riskLevel === 'high' ? 3 : h.riskLevel === 'medium' ? 2 : 1;
      return sum + riskValue;
    }, 0);
  
  const avgRisk = totalHazards > 0 ? totalRisk / totalHazards : 0;
  const riskLevel = avgRisk >= 3.5 ? 'critical' : avgRisk >= 2.5 ? 'high' : avgRisk >= 1.5 ? 'medium' : 'low';
  
  const requiredEquipment = astData.safetyEquipment.filter(eq => eq.required).length;
  const verifiedEquipment = astData.safetyEquipment.filter(eq => eq.required && eq.verified).length;
  const equipmentCompliance = requiredEquipment > 0 ? (verifiedEquipment / requiredEquipment) * 100 : 0;
  
  const teamProgress = astData.team.members.length > 0 
    ? Object.values(teamConsultationStatus).filter(s => s.consulted).length / astData.team.members.length * 100 
    : 0;

  const completedDiscussions = astData.teamDiscussion.discussions.filter(d => d.completed).length;
  const discussionProgress = (completedDiscussions / astData.teamDiscussion.discussions.length) * 100;

  const overallProgress = [
    totalHazards > 0 ? 100 : 0, // Dangers identifiés
    equipmentCompliance, // Équipements
    discussionProgress, // Discussions
    teamProgress, // Équipe
    astData.documentation.photos.length > 0 ? 100 : 0 // Documentation
  ].reduce((sum, val) => sum + val, 0) / 5;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <h3 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        📊 Statistiques détaillées
      </h3>

      {/* Progression générale */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600' }}>
            Progression générale
          </span>
          <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '700' }}>
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div style={{ background: 'rgba(100, 116, 139, 0.3)', borderRadius: '4px', height: '6px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
              height: '6px',
              borderRadius: '4px',
              width: `${overallProgress}%`,
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Grille des statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Dangers */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: getRiskColor(riskLevel) }}>
            {totalHazards}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Dangers identifiés</div>
          <div style={{ 
            color: getRiskColor(riskLevel), 
            fontSize: '9px', 
            marginTop: '2px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Risque {riskLevel}
          </div>
        </div>

        {/* Équipements */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: equipmentCompliance >= 80 ? '#10b981' : equipmentCompliance >= 60 ? '#f59e0b' : '#ef4444' }}>
            {Math.round(equipmentCompliance)}%
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Équipements vérifiés</div>
          <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>
            {verifiedEquipment}/{requiredEquipment}
          </div>
        </div>

        {/* Équipe */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: teamProgress >= 100 ? '#10b981' : teamProgress >= 50 ? '#f59e0b' : '#ef4444' }}>
            {Math.round(teamProgress)}%
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Consultations équipe</div>
          <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>
            {Object.values(teamConsultationStatus).filter(s => s.consulted).length}/{astData.team.members.length}
          </div>
        </div>

        {/* Discussions */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: discussionProgress >= 80 ? '#10b981' : discussionProgress >= 60 ? '#f59e0b' : '#ef4444' }}>
            {Math.round(discussionProgress)}%
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Discussions complétées</div>
          <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>
            {completedDiscussions}/{astData.teamDiscussion.discussions.length}
          </div>
        </div>
      </div>

      {/* Détails des risques */}
      {totalHazards > 0 && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <h4 style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
            Répartition des risques
          </h4>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#dc2626' }} />
              <span style={{ color: '#94a3b8' }}>Critique: {criticalHazards}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ea580c' }} />
              <span style={{ color: '#94a3b8' }}>Élevé: {highHazards}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommandations */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
          ⚠️ Points d'attention
        </h4>
        <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
          {criticalHazards > 0 && (
            <div style={{ marginBottom: '4px' }}>• {criticalHazards} danger(s) critique(s) identifié(s)</div>
          )}
          {equipmentCompliance < 100 && (
            <div style={{ marginBottom: '4px' }}>• Vérification équipements incomplète ({Math.round(equipmentCompliance)}%)</div>
          )}
          {teamProgress < 100 && (
            <div style={{ marginBottom: '4px' }}>• Consultations équipe en attente ({Math.round(teamProgress)}%)</div>
          )}
          {discussionProgress < 100 && (
            <div style={{ marginBottom: '4px' }}>• Discussions équipe incomplètes ({Math.round(discussionProgress)}%)</div>
          )}
          {overallProgress >= 90 && (
            <div style={{ color: '#10b981' }}>✅ AST prête pour finalisation</div>
          )}
        </div>
      </div>
    </div>
  );
};

export { WeatherWidget, AdvancedStatsPanel };
// =================== SECTION 4 - INTÉGRATIONS AU COMPOSANT PRINCIPAL AVEC GOOGLE MAPS ===================
// Modifications à apporter à votre composant principal existant

// 1. NOUVEAUX ÉTATS À AJOUTER (après vos useState existants)
const [showWeatherWidget, setShowWeatherWidget] = useState(true);
const [selectedWorkType, setSelectedWorkType] = useState<WorkType | undefined>();
const [showLocationPicker, setShowLocationPicker] = useState(false);
const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
const [weatherData, setWeatherData] = useState<WeatherData>({
  temperature: 22,
  humidity: 65,
  windSpeed: 15,
  windDirection: 'SO',
  precipitation: 0,
  visibility: 10,
  uvIndex: 6,
  conditions: 'Partiellement nuageux',
  warnings: [],
  impact: 'low'
});

// Initialiser les hooks de partage équipe
const teamSharing = useTeamSharing();

// 2. COMPOSANT SÉLECTEUR DE LOCALISATION GOOGLE MAPS
const LocationPicker = ({ 
  currentLocation, 
  onLocationSelect, 
  onClose 
}: {
  currentLocation: string;
  onLocationSelect: (address: string, coords: {lat: number, lng: number}) => void;
  onClose: () => void;
}) => {
  const [searchAddress, setSearchAddress] = useState(currentLocation);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fonction pour rechercher une adresse (simulation - remplacer par Google Places API)
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulation API Google Places (remplacer par vraie API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockSuggestions = [
        {
          id: '1',
          address: `${query}, Québec, QC, Canada`,
          lat: 46.8139 + Math.random() * 0.1,
          lng: -71.2082 + Math.random() * 0.1,
          type: 'Adresse'
        },
        {
          id: '2', 
          address: `${query}, Montréal, QC, Canada`,
          lat: 45.5017 + Math.random() * 0.1,
          lng: -73.5673 + Math.random() * 0.1,
          type: 'Adresse'
        },
        {
          id: '3',
          address: `${query}, Ottawa, ON, Canada`,
          lat: 45.4215 + Math.random() * 0.1,
          lng: -75.6972 + Math.random() * 0.1,
          type: 'Adresse'
        }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Erreur recherche localisation:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction pour obtenir la localisation actuelle
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Reverse geocoding simulation (remplacer par Google Geocoding API)
          const address = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} (Position actuelle)`;
          onLocationSelect(address, coords);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          alert('Impossible d\'obtenir votre position actuelle');
        }
      );
    } else {
      alert('Géolocalisation non supportée par ce navigateur');
    }
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(searchAddress || currentLocation);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        border: '1px solid rgba(100, 116, 139, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
            📍 Sélectionner la localisation
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => {
              setSearchAddress(e.target.value);
              searchLocation(e.target.value);
            }}
            placeholder="Rechercher une adresse..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Boutons d'action rapide */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={getCurrentLocation}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MapPin style={{ width: '14px', height: '14px' }} />
            Ma position
          </button>
          
          <button
            onClick={openGoogleMaps}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ExternalLink style={{ width: '14px', height: '14px' }} />
            Google Maps
          </button>
        </div>

        {/* Suggestions */}
        {isSearching && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px', 
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            Recherche en cours...
          </div>
        )}

        {suggestions.length > 0 && !isSearching && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => {
                  onLocationSelect(suggestion.address, { lat: suggestion.lat, lng: suggestion.lng });
                  onClose();
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                  {suggestion.address}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                  {suggestion.type} • {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !isSearching && searchAddress.trim() && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Aucun résultat trouvé
          </div>
        )}
      </div>
    </div>
  );
};

// 3. FONCTION POUR METTRE À JOUR LE TYPE DE TRAVAIL  
const handleWorkTypeChange = (workType: WorkType) => {
  setSelectedWorkType(workType);
  setFormData(prev => ({
    ...prev,
    projectInfo: {
      ...prev.projectInfo,
      workType: workType
    }
  }));

  // Auto-sélectionner les dangers selon le type de travail
  const relevantHazards = getHazardsByWorkType(workType.id);
  const updatedHazards = formData.electricalHazards.map(hazard => ({
    ...hazard,
    isSelected: workType.baseHazards.includes(hazard.id)
  }));
  
  setFormData(prev => ({
    ...prev,
    electricalHazards: updatedHazards
  }));
};

// 4. GESTIONNAIRE DE SÉLECTION DE LOCALISATION
const handleLocationSelect = (address: string, coords: {lat: number, lng: number}) => {
  setCoordinates(coords);
  setFormData(prev => ({
    ...prev,
    projectInfo: {
      ...prev.projectInfo,
      workLocation: address,
      coordinates: coords
    }
  }));
};
// =================== SECTION 5 - MODIFICATION ÉTAPE 1 AVEC GOOGLE MAPS ===================
// Remplacement complet de votre étape 1 existante

{/* ÉTAPE 1: Informations Générales - VERSION AMÉLIORÉE */}
{currentStep === 0 && (
  <div className="slide-in">
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
        📋 {t.projectInfo.title}
      </h2>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      
      {/* Numéro AST - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          🔢 # AST
        </label>
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontFamily: 'Monaco, Menlo, Courier New, monospace',
              fontSize: '16px',
              fontWeight: '700',
              color: '#22c55e',
              letterSpacing: '0.5px'
            }}>
              {formData.astNumber}
            </div>
          </div>
          <button 
            onClick={regenerateASTNumber}
            style={{
              background: 'none',
              border: '1px solid #22c55e',
              color: '#22c55e',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Copy style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Client - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          🏢 Client *
        </label>
        <input 
          type="text"
          className="input-premium"
          placeholder="Nom du client"
          value={formData.projectInfo.client}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, client: e.target.value }
          }))}
        />
      </div>

      {/* Téléphone Client - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📞 {t.projectInfo.clientPhone}
        </label>
        <input 
          type="tel"
          className="input-premium"
          placeholder="Ex: (514) 555-0123"
          value={formData.projectInfo.clientPhone}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, clientPhone: e.target.value }
          }))}
        />
      </div>

      {/* Numéro de Projet - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          🔢 Numéro de Projet *
        </label>
        <input 
          type="text"
          className="input-premium"
          placeholder="Ex: PRJ-2025-001"
          value={formData.projectInfo.projectNumber}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, projectNumber: e.target.value }
          }))}
        />
      </div>

      {/* Responsable - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          👤 {t.projectInfo.clientRepresentative}
        </label>
        <input 
          type="text"
          className="input-premium"
          placeholder="Nom du responsable projet"
          value={formData.projectInfo.clientRepresentative}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, clientRepresentative: e.target.value }
          }))}
        />
      </div>

      {/* Téléphone Responsable - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📞 {t.projectInfo.clientRepresentativePhone}
        </label>
        <input 
          type="tel"
          className="input-premium"
          placeholder="Ex: (514) 555-0456"
          value={formData.projectInfo.clientRepresentativePhone}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, clientRepresentativePhone: e.target.value }
          }))}
        />
      </div>

      {/* Nombre de personnes - EXISTANT */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          👥 {t.projectInfo.workerCount} *
        </label>
        <input 
          type="number"
          min="1"
          max="100"
          className="input-premium"
          placeholder="Ex: 5"
          value={formData.projectInfo.workerCount}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, workerCount: parseInt(e.target.value) || 1 }
          }))}
        />
        <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Ce nombre sera comparé aux approbations d'équipe
        </small>
      </div>

      {/* Lieu des travaux avec Google Maps - NOUVEAU */}
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📍 {t.projectInfo.workLocation} *
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text"
            className="input-premium"
            style={{ flex: 1 }}
            placeholder="Adresse ou description du lieu"
            value={formData.projectInfo.workLocation}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, workLocation: e.target.value }
            }))}
          />
          <button
            onClick={() => setShowLocationPicker(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <MapPin style={{ width: '16px', height: '16px' }} />
            Localiser
          </button>
        </div>
        
        {/* Affichage des coordonnées si disponibles */}
        {coordinates && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#10b981'
          }}>
            📍 Coordonnées: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/${coordinates.lat},${coordinates.lng}`, '_blank')}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                cursor: 'pointer',
                marginLeft: '8px',
                textDecoration: 'underline'
              }}
            >
              Voir sur Google Maps
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Sélecteur de type de travail - NOUVEAU */}
    <div style={{ marginTop: '32px' }}>
      <WorkTypeSelector
        selectedWorkType={selectedWorkType}
        onWorkTypeChange={handleWorkTypeChange}
      />
    </div>

    {/* Description des travaux - EXISTANT mais repositionné */}
    <div style={{ marginTop: '24px' }}>
      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        📝 {t.projectInfo.workDescription} *
      </label>
      <textarea 
        className="input-premium"
        style={{ minHeight: '120px', resize: 'vertical' }}
        placeholder="Description détaillée des travaux à effectuer..."
        value={formData.projectInfo.workDescription}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          projectInfo: { ...prev.projectInfo, workDescription: e.target.value }
        }))}
      />
    </div>

    {/* Section informations complémentaires - AMÉLIORÉE */}
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ 
        color: '#3b82f6', 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '16px', 
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)', 
        paddingBottom: '8px' 
      }}>
        📋 Informations Complémentaires
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Date et durée */}
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            📅 Date des travaux *
          </label>
          <input 
            type="date"
            className="input-premium"
            value={formData.projectInfo.date}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, date: e.target.value }
            }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            ⏱️ {t.projectInfo.estimatedDuration}
          </label>
          <input 
            type="text"
            className="input-premium"
            placeholder="Ex: 4 heures, 2 jours"
            value={formData.projectInfo.estimatedDuration}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, estimatedDuration: e.target.value }
            }))}
          />
        </div>

        {/* Contacts d'urgence */}
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            🚨 {t.projectInfo.emergencyContact}
          </label>
          <input 
            type="text"
            className="input-premium"
            placeholder="Nom du contact d'urgence"
            value={formData.projectInfo.emergencyContact}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, emergencyContact: e.target.value }
            }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            📞 {t.projectInfo.emergencyPhone}
          </label>
          <input 
            type="tel"
            className="input-premium"
            placeholder="Ex: 911, (514) 555-9999"
            value={formData.projectInfo.emergencyPhone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, emergencyPhone: e.target.value }
            }))}
          />
        </div>

        {/* Conditions météo et spéciales - NOUVEAU */}
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            🌤️ Conditions météorologiques
          </label>
          <input 
            type="text"
            className="input-premium"
            placeholder="Ex: Ensoleillé, 22°C, vent léger"
            value={formData.projectInfo.weatherConditions}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, weatherConditions: e.target.value }
            }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            ⚠️ Conditions spéciales
          </label>
          <input 
            type="text"
            className="input-premium"
            placeholder="Ex: Circulation dense, site occupé"
            value={formData.projectInfo.specialConditions}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, specialConditions: e.target.value }
            }))}
          />
        </div>
      </div>

      {/* Permis de travail - NOUVEAU */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div 
            onClick={() => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, workPermitRequired: !prev.projectInfo.workPermitRequired }
            }))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer' 
            }}
          >
            <div className={`checkbox-premium ${formData.projectInfo.workPermitRequired ? 'checked' : ''}`} />
            <span style={{ color: '#e2e8f0', fontSize: '14px' }}>
              📋 Permis de travail requis
            </span>
          </div>
        </div>
        
        {formData.projectInfo.workPermitRequired && (
          <input 
            type="text"
            className="input-premium"
            placeholder="Numéro du permis de travail"
            value={formData.projectInfo.workPermitNumber || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              projectInfo: { ...prev.projectInfo, workPermitNumber: e.target.value }
            }))}
          />
        )}
      </div>
    </div>

    {/* Modal de sélection de localisation */}
    {showLocationPicker && (
      <LocationPicker
        currentLocation={formData.projectInfo.workLocation}
        onLocationSelect={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
      />
    )}
  </div>
)}
// =================== SECTION 6 - ÉTAPE 8 AMÉLIORÉE ET PANNEAU LATÉRAL ===================
// Remplacement de votre étape 8 existante et amélioration du panneau latéral

{/* ÉTAPE 8: Validation & Signatures - VERSION COMPLÈTE AMÉLIORÉE */}
{currentStep === 7 && (
  <div className="slide-in">
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
        ✅ {t.steps.validation}
      </h2>
    </div>

    {/* Résumé de l'AST - AMÉLIORÉ */}
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
        📊 Résumé détaillé de l'AST
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
            {formData.electricalHazards.filter(h => h.isSelected).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Dangers Identifiés</div>
          <div style={{ color: '#3b82f6', fontSize: '10px', marginTop: '4px' }}>
            {formData.electricalHazards.filter(h => h.isSelected && h.riskLevel === 'critical').length} critiques
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
            {formData.team.members.length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Membres d'Équipe</div>
          <div style={{ color: '#22c55e', fontSize: '10px', marginTop: '4px' }}>
            {formData.team.members.filter(m => m.validationStatus === 'approved').length} approuvés
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#a855f7' }}>
            {Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Consultations</div>
          <div style={{ color: '#a855f7', fontSize: '10px', marginTop: '4px' }}>
            {Object.values(teamSharing.teamConsultationStatus).filter(s => s.consentGiven).length} consentements
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
            {formData.documentation.photos.length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Photos</div>
          <div style={{ color: '#f59e0b', fontSize: '10px', marginTop: '4px' }}>
            Documentation
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
            {formData.safetyEquipment.filter(eq => eq.required && !eq.verified).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>EPI Non Vérifiés</div>
          <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px' }}>
            Attention requise
          </div>
        </div>
      </div>

      {/* Indicateurs de completion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#e2e8f0', fontSize: '12px' }}>Discussions équipe</span>
            <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
              {Math.round((formData.teamDiscussion.discussions.filter(d => d.completed).length / formData.teamDiscussion.discussions.length) * 100)}%
            </span>
          </div>
          <div style={{ background: 'rgba(100, 116, 139, 0.3)', borderRadius: '4px', height: '4px' }}>
            <div style={{ 
              background: '#3b82f6', 
              height: '4px', 
              borderRadius: '4px',
              width: `${(formData.teamDiscussion.discussions.filter(d => d.completed).length / formData.teamDiscussion.discussions.length) * 100}%`
            }} />
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#e2e8f0', fontSize: '12px' }}>Équipements vérifiés</span>
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
              {formData.safetyEquipment.filter(eq => eq.required).length > 0 
                ? Math.round((formData.safetyEquipment.filter(eq => eq.required && eq.verified).length / formData.safetyEquipment.filter(eq => eq.required).length) * 100)
                : 0}%
            </span>
          </div>
          <div style={{ background: 'rgba(100, 116, 139, 0.3)', borderRadius: '4px', height: '4px' }}>
            <div style={{ 
              background: '#10b981', 
              height: '4px', 
              borderRadius: '4px',
              width: `${formData.safetyEquipment.filter(eq => eq.required).length > 0 
                ? (formData.safetyEquipment.filter(eq => eq.required && eq.verified).length / formData.safetyEquipment.filter(eq => eq.required).length) * 100
                : 0}%`
            }} />
          </div>
        </div>
      </div>
    </div>

    {/* Partage équipe pour consultation - NOUVEAU */}
    <TeamSharingComponent 
      astData={formData} 
      teamSharing={teamSharing} 
    />

    {/* Validation finale et conformité - AMÉLIORÉ */}
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        ⚖️ Conformité et validation finale
      </h3>

      {/* Checklist de conformité */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 12px',
          background: formData.electricalHazards.filter(h => h.isSelected).length > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px'
        }}>
          <div className={`checkbox-premium ${formData.electricalHazards.filter(h => h.isSelected).length > 0 ? 'checked' : ''}`} />
          <span style={{ color: '#e2e8f0', fontSize: '13px' }}>Dangers identifiés</span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 12px',
          background: formData.team.allApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px'
        }}>
          <div className={`checkbox-premium ${formData.team.allApproved ? 'checked' : ''}`} />
          <span style={{ color: '#e2e8f0', fontSize: '13px' }}>Équipe approuvée</span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 12px',
          background: Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px'
        }}>
          <div className={`checkbox-premium ${Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length ? 'checked' : ''}`} />
          <span style={{ color: '#e2e8f0', fontSize: '13px' }}>Consultations complètes</span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 12px',
          background: formData.safetyEquipment.filter(eq => eq.required && !eq.verified).length === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px'
        }}>
          <div className={`checkbox-premium ${formData.safetyEquipment.filter(eq => eq.required && !eq.verified).length === 0 ? 'checked' : ''}`} />
          <span style={{ color: '#e2e8f0', fontSize: '13px' }}>EPI vérifiés</span>
        </div>
      </div>

      {/* Normes de conformité */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h4 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          📋 Conformité réglementaire
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>CSA Z1002 (Gestion SST)</span>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>RSST Québec</span>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>CSA Z462 (Électrique)</span>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>ISO 45001</span>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
        </div>
      </div>
    </div>

    {/* Actions finales - AMÉLIORÉES */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      <button
        onClick={() => handleSave(false)}
        className="btn-premium"
        disabled={saveStatus === 'saving'}
      >
        <Save style={{ width: '16px', height: '16px' }} />
        {t.buttons.save}
      </button>
      
      <button
        onClick={handleGeneratePDF}
        className="btn-secondary"
        disabled={saveStatus === 'saving'}
      >
        <Download style={{ width: '16px', height: '16px' }} />
        {t.actions.generatePDF}
      </button>
      
      <button
        onClick={handleSendByEmail}
        className="btn-secondary"
        disabled={saveStatus === 'saving'}
      >
        <Send style={{ width: '16px', height: '16px' }} />
        {t.actions.sendByEmail}
      </button>
      
      <button
        onClick={handleArchive}
        className="btn-secondary"
        disabled={saveStatus === 'saving'}
      >
        <Archive style={{ width: '16px', height: '16px' }} />
        {t.actions.archive}
      </button>
    </div>

    {/* Soumission finale - AMÉLIORÉE */}
    <div style={{
      background: formData.team.allApproved && Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length 
        ? 'rgba(34, 197, 94, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${formData.team.allApproved && Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length 
        ? '#22c55e' 
        : '#ef4444'}`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h3 style={{ 
        color: formData.team.allApproved && Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length 
          ? '#22c55e' 
          : '#ef4444', 
        fontSize: '18px', 
        fontWeight: '600', 
        margin: '0 0 16px 0' 
      }}>
        {formData.team.allApproved && Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length
          ? '✅ Prêt pour soumission finale' 
          : '⚠️ Validation requise'}
      </h3>
      
      {/* Messages d'erreur détaillés */}
      {(!formData.team.allApproved || Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length < formData.team.members.length) && (
        <div style={{ marginBottom: '16px' }}>
          {!formData.team.allApproved && formData.team.members.length > 0 && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0' }}>
              • Toutes les validations d'équipe doivent être complétées
            </p>
          )}
          {Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length < formData.team.members.length && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0' }}>
              • Toutes les consultations équipe doivent être complétées
            </p>
          )}
          {formData.safetyEquipment.filter(eq => eq.required && !eq.verified).length > 0 && (
            <p style={{ color: '#f59e0b', fontSize: '13px', margin: '4px 0' }}>
              • {formData.safetyEquipment.filter(eq => eq.required && !eq.verified).length} équipement(s) non vérifiés
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleFinalSubmission}
        className={formData.team.allApproved && Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length 
          ? 'btn-success' 
          : 'btn-secondary'}
        disabled={!(formData.team.allApproved && Object.values(teamSharing.teamConsultationStatus).filter(s => s.consulted).length === formData.team.members.length) || saveStatus === 'saving'}
        style={{ fontSize: '16px', padding: '16px 32px' }}
      >
        <CheckCircle style={{ width: '20px', height: '20px' }} />
        {t.actions.finalApproval}
      </button>
    </div>
  </div>
)}

{/* PANNEAU LATÉRAL REMPLACÉ - Statistiques avancées */}
<div className="space-y-6">
  {/* Remplacement du panneau de statistiques existant */}
  <AdvancedStatsPanel 
    astData={formData} 
    teamConsultationStatus={teamSharing.teamConsultationStatus} 
  />

  {/* Widget météo */}
  <WeatherWidget
    showWidget={showWeatherWidget}
    onClose={() => setShowWeatherWidget(false)}
    weatherData={weatherData}
    onWeatherUpdate={setWeatherData}
  />

  {/* Conformité réglementaire - NOUVEAU */}
  <div style={{
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    borderRadius: '12px',
    padding: '20px'
  }}>
    <h3 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
      ⚖️ Conformité
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>CSA Z1002</span>
        <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>RSST Québec</span>
        <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>CSA Z462</span>
        <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>ISO 45001</span>
        <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
      </div>
    </div>
  </div>
</div>
// =================== SECTION 7 - BASE DE DONNÉES COMPLÈTE DANGERS & CONTRÔLES ===================
// Remplacer complètement vos dangers et mesures de contrôle existants

// =================== BASE DE DONNÉES COMPLÈTE DES 39 DANGERS ===================
const predefinedElectricalHazardsComplete: ElectricalHazard[] = [
  // DANGERS ÉLECTRIQUES (1-5)
  {
    id: 'electrical_shock',
    code: 'ELEC-001',
    title: 'Choc électrique',
    description: 'Contact direct ou indirect avec parties sous tension',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'arc_flash',
    code: 'ELEC-002', 
    title: 'Arc électrique',
    description: 'Décharge électrique dans l\'air entre conducteurs',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'electrical_burns',
    code: 'ELEC-003',
    title: 'Brûlures électriques',
    description: 'Brûlures causées par passage courant ou arc électrique',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'electromagnetic_fields',
    code: 'ELEC-004',
    title: 'Champs électromagnétiques',
    description: 'Exposition aux rayonnements électromagnétiques',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'static_electricity',
    code: 'ELEC-005',
    title: 'Électricité statique',
    description: 'Accumulation charges électrostatiques',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },

  // DANGERS GAZIERS ET CHIMIQUES (6-12)
  {
    id: 'gas_leak',
    code: 'GAZ-001',
    title: 'Fuite de gaz',
    description: 'Échappement non contrôlé de gaz combustible ou toxique',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'explosion',
    code: 'GAZ-002',
    title: 'Explosion',
    description: 'Combustion rapide en espace confiné ou nuage gazeux',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'fire',
    code: 'FEU-001',
    title: 'Incendie',
    description: 'Combustion non contrôlée de matières inflammables',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'toxic_exposure',
    code: 'CHIM-001',
    title: 'Exposition substances toxiques',
    description: 'Contact avec substances chimiques dangereuses',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'chemical_burns',
    code: 'CHIM-002',
    title: 'Brûlures chimiques',
    description: 'Lésions cutanées par contact substances corrosives',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'asphyxiation',
    code: 'RESP-001',
    title: 'Asphyxie',
    description: 'Manque d\'oxygène ou présence gaz inertes',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'oxygen_deficiency',
    code: 'RESP-002',
    title: 'Déficience en oxygène',
    description: 'Concentration oxygène inférieure à 19,5%',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },

  // DANGERS PHYSIQUES ET MÉCANIQUES (13-23)
  {
    id: 'falls',
    code: 'CHUTE-001',
    title: 'Chutes de hauteur',
    description: 'Chute depuis une surface élevée',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'struck_by_objects',
    code: 'IMPACT-001',
    title: 'Heurt par objets',
    description: 'Impact par objets en mouvement ou qui tombent',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'cuts_lacerations',
    code: 'COUP-001',
    title: 'Coupures et lacérations',
    description: 'Blessures par objets tranchants ou coupants',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'mechanical_hazards',
    code: 'MECA-001',
    title: 'Dangers mécaniques',
    description: 'Risques liés aux machines et équipements mécaniques',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'heavy_equipment',
    code: 'EQUIP-001',
    title: 'Équipements lourds',
    description: 'Risques associés aux véhicules et machines lourdes',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'vehicle_traffic',
    code: 'CIRC-001',
    title: 'Circulation véhiculaire',
    description: 'Risques liés à la proximité de véhicules en circulation',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'train_traffic',
    code: 'FERRO-001',
    title: 'Circulation ferroviaire',
    description: 'Risques près des voies ferrées et trains',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'cave_in',
    code: 'EFFON-001',
    title: 'Effondrement',
    description: 'Affaissement de sols, tranchées ou structures',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'underground_utilities',
    code: 'SOUS-001',
    title: 'Services souterrains',
    description: 'Contact accidentel avec services publics enterrés',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'engulfment',
    code: 'ENGL-001',
    title: 'Engloutissement',
    description: 'Submersion dans matériaux fluides ou granulaires',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'electrical_lines',
    code: 'LIGNE-001',
    title: 'Lignes électriques',
    description: 'Proximité ou contact avec lignes électriques aériennes',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },

  // DANGERS BIOLOGIQUES (24-26)
  {
    id: 'biological_hazards',
    code: 'BIO-001',
    title: 'Dangers biologiques',
    description: 'Exposition à agents biologiques pathogènes',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'insect_stings',
    code: 'BIO-002',
    title: 'Piqûres d\'insectes',
    description: 'Piqûres ou morsures d\'insectes venimeux',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'animal_attacks',
    code: 'BIO-003',
    title: 'Attaques d\'animaux',
    description: 'Attaques par animaux sauvages ou domestiques',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },

  // DANGERS ERGONOMIQUES (27-29)
  {
    id: 'ergonomic_hazards',
    code: 'ERGO-001',
    title: 'Dangers ergonomiques',
    description: 'Contraintes physiques et posturales',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'manual_handling',
    code: 'MANU-001',
    title: 'Manutention manuelle',
    description: 'Soulèvement, transport, manipulation objets lourds',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'repetitive_motion',
    code: 'REPE-001',
    title: 'Mouvements répétitifs',
    description: 'Gestes répétés sur périodes prolongées',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },

  // DANGERS ENVIRONNEMENTAUX (30-35)
  {
    id: 'weather_exposure',
    code: 'METEO-001',
    title: 'Exposition météorologique',
    description: 'Exposition conditions météorologiques extrêmes',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'heat_stress',
    code: 'CHAL-001',
    title: 'Stress thermique',
    description: 'Exposition à chaleur excessive',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'cold_exposure',
    code: 'FROID-001',
    title: 'Exposition au froid',
    description: 'Exposition à températures froides extrêmes',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'uv_radiation',
    code: 'UV-001',
    title: 'Rayonnement UV',
    description: 'Exposition rayonnement ultraviolet solaire',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'wind_exposure',
    code: 'VENT-001',
    title: 'Exposition au vent',
    description: 'Exposition à vents forts et rafales',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'precipitation',
    code: 'PREC-001',
    title: 'Précipitations',
    description: 'Pluie, neige, grêle affectant sécurité',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },

  // DANGERS PHYSIQUES SPÉCIALISÉS (36-39)
  {
    id: 'noise',
    code: 'BRUIT-001',
    title: 'Bruit excessif',
    description: 'Exposition à niveaux sonores élevés',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'vibration',
    code: 'VIBR-001',
    title: 'Vibrations',
    description: 'Exposition vibrations corps entier ou main-bras',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'radiation',
    code: 'RAD-001',
    title: 'Rayonnements',
    description: 'Exposition rayonnements ionisants ou non-ionisants',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  },
  {
    id: 'lockout_tagout',
    code: 'LOTO-001',
    title: 'Énergies dangereuses',
    description: 'Remise en marche inattendue d\'équipements',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: [],
    showControls: false
  }
];

// =================== MESURES DE CONTRÔLE COMPLÈTES SELON HIÉRARCHIE CSA ===================
const predefinedControlMeasuresComplete: Record<string, ControlMeasure[]> = {
  // DANGERS ÉLECTRIQUES
  electrical_shock: [
    {
      id: 'elec_shock_001',
      hazardId: 'electrical_shock',
      type: 'elimination',
      measure: 'Consignation électrique complète',
      description: 'Mise hors tension, verrouillage et étiquetage selon CSA Z462',
      implementation: 'Procédure LOTO avec vérification absence de tension',
      responsible: 'Électricien qualifié',
      timeline: 'Avant début travaux',
      cost: 'low',
      effectiveness: 95,
      compliance: ['CSA Z462', 'Code électrique canadien', 'RSST Article 185'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'elec_shock_002',
      hazardId: 'electrical_shock',
      type: 'engineering',
      measure: 'Protection par disjoncteur différentiel',
      description: 'Installation de DDFT/GFCI sur tous les circuits',
      implementation: 'DDFT de classe A (5mA) pour protection personnelle',
      responsible: 'Électricien qualifié',
      timeline: 'Installation permanente',
      cost: 'medium',
      effectiveness: 85,
      compliance: ['Code électrique canadien Section 26', 'CSA C22.1'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'elec_shock_003',
      hazardId: 'electrical_shock',
      type: 'ppe',
      measure: 'Équipement de protection individuelle',
      description: 'Gants isolants, chaussures diélectriques, casque classe E',
      implementation: 'Sélection selon tension et conditions de travail',
      responsible: 'Travailleur qualifié',
      timeline: 'Port obligatoire',
      cost: 'medium',
      effectiveness: 70,
      compliance: ['CSA Z462 Annexe H', 'CSA Z94.4', 'RSST Article 2.10.12'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  arc_flash: [
    {
      id: 'arc_001',
      hazardId: 'arc_flash',
      type: 'elimination',
      measure: 'Travail hors tension',
      description: 'Élimination complète du risque par mise hors tension',
      implementation: 'Consignation selon CSA Z462 avec vérification',
      responsible: 'Personne qualifiée',
      timeline: 'Obligatoire si possible',
      cost: 'low',
      effectiveness: 100,
      compliance: ['CSA Z462 Clause 4.1', 'RSST Article 185'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'arc_002',
      hazardId: 'arc_flash',
      type: 'administrative',
      measure: 'Analyse des dangers d\'arc électrique',
      description: 'Étude d\'arc avec calcul des frontières de protection',
      implementation: 'Analyse par ingénieur selon IEEE 1584',
      responsible: 'Ingénieur électrique',
      timeline: 'Avant travaux sous tension',
      cost: 'high',
      effectiveness: 85,
      compliance: ['CSA Z462 Clause 4.2', 'IEEE 1584'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // DANGERS GAZIERS
  gas_leak: [
    {
      id: 'gas_001',
      hazardId: 'gas_leak',
      type: 'elimination',
      measure: 'Purge et isolation du système',
      description: 'Vidange complète et isolation des canalisations',
      implementation: 'Procédure de purge avec gaz inerte (azote)',
      responsible: 'Technicien gazier qualifié',
      timeline: 'Avant début travaux',
      cost: 'medium',
      effectiveness: 95,
      compliance: ['CSA Z662', 'Règlement sur la sécurité des pipelines'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'gas_002',
      hazardId: 'gas_leak',
      type: 'engineering',
      measure: 'Détection de gaz continue',
      description: 'Système de détection multi-gaz avec alarmes',
      implementation: 'Détecteurs fixes et portables avec seuils LIE',
      responsible: 'Technicien instrumentation',
      timeline: 'Surveillance continue',
      cost: 'high',
      effectiveness: 90,
      compliance: ['CSA Z662 Clause 10', 'CSA Z1611'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // DANGERS DE CHUTE
  falls: [
    {
      id: 'fall_001',
      hazardId: 'falls',
      type: 'elimination',
      measure: 'Travail au sol ou plateforme permanente',
      description: 'Élimination du travail en hauteur par conception',
      implementation: 'Réorganisation méthodes de travail, équipements mobiles',
      responsible: 'Planificateur travaux',
      timeline: 'Phase conception',
      cost: 'medium',
      effectiveness: 100,
      compliance: ['RSST Article 2.9.1', 'CSA Z259.16'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'fall_002',
      hazardId: 'falls',
      type: 'engineering',
      measure: 'Garde-corps et protection collective',
      description: 'Installation garde-corps conformes ou filets de sécurité',
      implementation: 'Garde-corps h=1070mm avec main courante et plinthe',
      responsible: 'Installateur certifié',
      timeline: 'Avant accès en hauteur',
      cost: 'medium',
      effectiveness: 90,
      compliance: ['RSST Article 2.9.1', 'CSA Z259.16'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // ESPACES CONFINÉS
  confined_spaces: [
    {
      id: 'conf_001',
      hazardId: 'asphyxiation',
      type: 'elimination',
      measure: 'Travail à l\'extérieur de l\'espace',
      description: 'Modification méthodes pour éviter l\'entrée',
      implementation: 'Équipements à distance, ouvertures, robots',
      responsible: 'Ingénieur méthodes',
      timeline: 'Phase planification',
      cost: 'high',
      effectiveness: 100,
      compliance: ['RSST Article 3.9', 'CSA Z1006'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // MESURES GÉNÉRIQUES POUR AUTRES DANGERS
  default: [
    {
      id: 'def_001',
      hazardId: 'default',
      type: 'elimination',
      measure: 'Élimination du danger',
      description: 'Suppression complète du danger par conception',
      implementation: 'Modification process, équipements, méthodes',
      responsible: 'Concepteur/Ingénieur',
      timeline: 'Phase conception',
      cost: 'high',
      effectiveness: 100,
      compliance: ['Hiérarchie CSA Z1002'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_002',
      hazardId: 'default',
      type: 'substitution',
      measure: 'Substitution par alternative plus sûre',
      description: 'Remplacement par solution moins dangereuse',
      implementation: 'Analyse comparative risques/bénéfices',
      responsible: 'Spécialiste technique',
      timeline: 'Phase planification',
      cost: 'medium',
      effectiveness: 85,
      compliance: ['Hiérarchie CSA Z1002'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_003',
      hazardId: 'default',
      type: 'engineering',
      measure: 'Contrôles techniques',
      description: 'Mesures techniques de protection',
      implementation: 'Installation dispositifs, systèmes automatiques',
      responsible: 'Ingénieur sécurité',
      timeline: 'Installation avant travaux',
      cost: 'medium',
      effectiveness: 75,
      compliance: ['Normes techniques applicables'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_004',
      hazardId: 'default',
      type: 'administrative',
      measure: 'Contrôles administratifs',
      description: 'Procédures, formation, surveillance',
      implementation: 'Rédaction procédures, formation personnel',
      responsible: 'Responsable sécurité',
      timeline: 'Avant début travaux',
      cost: 'low',
      effectiveness: 60,
      compliance: ['Système de gestion SST'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_005',
      hazardId: 'default',
      type: 'ppe',
      measure: 'Équipements de protection individuelle',
      description: 'EPI adaptés au risque spécifique',
      implementation: 'Sélection, formation, maintenance EPI',
      responsible: 'Travailleur formé',
      timeline: 'Port obligatoire',
      cost: 'low',
      effectiveness: 50,
      compliance: ['CSA Z94 série', 'RSST Article 2.10'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ]
};

// =================== FONCTION POUR ASSIGNER LES MESURES DE CONTRÔLE ===================
const assignControlMeasures = (hazardId: string): ControlMeasure[] => {
  // Retourner les mesures spécifiques au danger ou les mesures par défaut
  return predefinedControlMeasuresComplete[hazardId] || predefinedControlMeasuresComplete['default'];
};

// =================== FONCTION POUR INITIALISER LES DANGERS AVEC MESURES ===================
const initializeHazardsWithControls = (): ElectricalHazard[] => {
  return predefinedElectricalHazardsComplete.map(hazard => ({
    ...hazard,
    controlMeasures: assignControlMeasures(hazard.id)
  }));
};

// =================== DONNÉES INITIALES MISES À JOUR ===================
const initialFormDataUpdated: ASTFormData = {
  ...initialFormData, // Vos données existantes
  electricalHazards: initializeHazardsWithControls(), // Remplacer par la liste complète
  
  // Ajout des nouvelles propriétés
  projectInfo: {
    ...initialFormData.projectInfo,
    workType: undefined, // Sera sélectionné par l'utilisateur
    coordinates: undefined,
    weatherConditions: '',
    specialConditions: ''
  }
};

// =================== FONCTION DE FILTRAGE AMÉLIORÉE ===================
const getHazardsByWorkTypeComplete = (workTypeId: string): ElectricalHazard[] => {
  const workType = WORK_TYPES.find(wt => wt.id === workTypeId);
  if (!workType) return [];
  
  return predefinedElectricalHazardsComplete.filter(hazard => 
    workType.baseHazards.includes(hazard.id)
  );
};

// =================== FONCTION DE CALCUL DE RISQUE AVANCÉE ===================
const calculateRiskScore = (hazard: ElectricalHazard): number => {
  const riskValues = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  const baseRisk = riskValues[hazard.riskLevel];
  const selectedControlsEffectiveness = hazard.controlMeasures
    .filter(c => c.isSelected)
    .reduce((sum, c) => sum + c.effectiveness, 0) / 100;
  
  // Réduction du risque selon l'efficacité des mesures
  const residualRisk = Math.max(0.1, baseRisk * (1 - selectedControlsEffectiveness * 0.8));
  
  return Math.round(residualRisk * 100) / 100;
};

// =================== EXPORT DES NOUVELLES DONNÉES ===================
export { 
  predefinedElectricalHazardsComplete,
  predefinedControlMeasuresComplete,
  initializeHazardsWithControls,
  assignControlMeasures,
  getHazardsByWorkTypeComplete,
  calculateRiskScore,
  initialFormDataUpdated
};
// =================== SECTION 8 - ÉQUIPEMENTS ÉTENDUS ET ÉTAPES 2-3 AMÉLIORÉES ===================

// =================== BASE DE DONNÉES COMPLÈTE DES ÉQUIPEMENTS DE SÉCURITÉ ===================
const requiredSafetyEquipmentComplete: SafetyEquipment[] = [
  // PROTECTION TÊTE
  {
    id: 'hardhat_class_e',
    name: 'Casque de sécurité Classe E',
    category: 'head',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Casque isolant électrique jusqu\'à 20 000V',
    certifications: ['CSA Z94.1', 'ANSI Z89.1 Classe E'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '5 ans ou selon usure',
    cost: '50-150 CAD',
    supplier: 'MSA, 3M, Honeywell'
  },
  {
    id: 'hardhat_standard',
    name: 'Casque de sécurité standard',
    category: 'head',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre chocs et objets qui tombent',
    certifications: ['CSA Z94.1', 'ANSI Z89.1 Classe G'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '5 ans ou selon usure',
    cost: '25-75 CAD',
    supplier: 'MSA, 3M, Honeywell, Bullard'
  },

  // PROTECTION OCULAIRE
  {
    id: 'safety_glasses',
    name: 'Lunettes de sécurité',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre impacts et projections',
    certifications: ['CSA Z94.3', 'ANSI Z87.1'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2 ans ou selon rayures',
    cost: '10-50 CAD',
    supplier: 'Uvex, 3M, Honeywell, Jackson Safety'
  },
  {
    id: 'welding_helmet',
    name: 'Masque de soudage',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre rayonnements de soudage',
    certifications: ['CSA Z94.3', 'ANSI Z87.1', 'CSA W117.2'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '3-5 ans selon usage',
    cost: '100-500 CAD',
    supplier: 'Lincoln Electric, Miller, ESAB, 3M'
  },
  {
    id: 'face_shield',
    name: 'Écran facial',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection complète du visage',
    certifications: ['CSA Z94.3', 'ANSI Z87.1'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2 ans ou selon dommages',
    cost: '15-75 CAD',
    supplier: '3M, Honeywell, Uvex'
  },

  // PROTECTION RESPIRATOIRE
  {
    id: 'n95_respirator',
    name: 'Masque N95',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre particules non-huileuses',
    certifications: ['NIOSH N95', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Usage unique ou selon contamination',
    cost: '2-5 CAD',
    supplier: '3M, Honeywell, Moldex'
  },
  {
    id: 'half_face_respirator',
    name: 'Demi-masque respiratoire',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre vapeurs et gaz avec cartouches',
    certifications: ['NIOSH', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans (masque), cartouches selon exposition',
    cost: '50-200 CAD',
    supplier: '3M, Honeywell, MSA, Moldex'
  },
  {
    id: 'scba',
    name: 'Appareil respiratoire autonome',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Air respirable autonome pour espaces confinés',
    certifications: ['NIOSH', 'CSA Z94.4', 'NFPA 1981'],
    inspectionFrequency: 'Quotidienne et après chaque usage',
    lifespan: '15 ans selon maintenance',
    cost: '3000-8000 CAD',
    supplier: 'MSA, Scott Safety, Dräger'
  },

  // PROTECTION MAINS
  {
    id: 'electrical_gloves',
    name: 'Gants isolants électriques',
    category: 'hand',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Gants diélectriques avec surgants cuir',
    certifications: ['ASTM D120', 'IEC 60903', 'CSA Z462'],
    inspectionFrequency: 'Avant chaque utilisation + test 6 mois',
    lifespan: '3 ans ou selon tests',
    cost: '100-300 CAD',
    supplier: 'Salisbury, Cementex, Regeltex'
  },
  {
    id: 'cut_resistant_gloves',
    name: 'Gants anti-coupure',
    category: 'hand',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre coupures niveau A2-A5',
    certifications: ['ANSI/ISEA 105', 'EN 388', 'CSA Z94.4'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '3-6 mois selon usage',
    cost: '15-50 CAD',
    supplier: 'Ansell, HexArmor, MCR Safety, Superior Glove'
  },
  {
    id: 'chemical_gloves',
    name: 'Gants chimiques',
    category: 'hand',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre produits chimiques spécifiques',
    certifications: ['ASTM F739', 'EN 374', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Selon tableau perméation',
    cost: '5-30 CAD',
    supplier: 'Ansell, Showa, Mapa, MCR Safety'
  },

  // PROTECTION PIEDS
  {
    id: 'safety_boots_steel',
    name: 'Bottes à embout d\'acier',
    category: 'foot',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre écrasement et perforation',
    certifications: ['CSA Z195', 'ASTM F2413'],
    inspectionFrequency: 'Hebdomadaire',
    lifespan: '12-18 mois selon usage',
    cost: '150-400 CAD',
    supplier: 'Dakota, Terra, Timberland PRO, Caterpillar'
  },
  {
    id: 'dielectric_boots',
    name: 'Bottes diélectriques',
    category: 'foot',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Isolation électrique et protection mécanique',
    certifications: ['ASTM F2413 EH', 'CSA Z195', 'ASTM F1117'],
    inspectionFrequency: 'Quotidienne + test annuel',
    lifespan: '2-3 ans selon tests',
    cost: '200-500 CAD',
    supplier: 'Salisbury, Cementex, NASCO'
  },

  // PROTECTION CORPS
  {
    id: 'high_vis_vest',
    name: 'Veste haute visibilité',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Visibilité jour/nuit avec bandes rétroréfléchissantes',
    certifications: ['CSA Z96', 'ANSI/ISEA 107'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2-3 ans selon lavages',
    cost: '25-75 CAD',
    supplier: 'Forcefield, ML Kishigo, PIP, Radians'
  },
  {
    id: 'arc_flash_suit',
    name: 'Vêtement résistant à l\'arc',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre arc électrique selon cal/cm²',
    certifications: ['ASTM F1506', 'NFPA 70E', 'CSA Z462'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou selon dommages',
    cost: '500-2000 CAD',
    supplier: 'Salisbury, Oberon, National Safety Apparel'
  },
  {
    id: 'chemical_suit',
    name: 'Combinaison chimique',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection intégrale contre substances chimiques',
    certifications: ['NFPA 1991', 'NFPA 1992', 'EN 943'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Usage unique ou selon contamination',
    cost: '100-500 CAD',
    supplier: 'DuPont, Lakeland, Kappler, 3M'
  },

  // PROTECTION CHUTE
  {
    id: 'full_body_harness',
    name: 'Harnais intégral',
    category: 'fall',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Harnais avec points d\'attache dorsal et pectoral',
    certifications: ['CSA Z259.10', 'ANSI Z359.11'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou selon usure',
    cost: '150-400 CAD',
    supplier: '3M, MSA, Miller, Honeywell'
  },
  {
    id: 'shock_absorbing_lanyard',
    name: 'Longe avec absorbeur',
    category: 'fall',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Longe avec système absorption d\'énergie',
    certifications: ['CSA Z259.11', 'ANSI Z359.13'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou après choc',
    cost: '100-250 CAD',
    supplier: '3M, MSA, Miller, Honeywell'
  },

  // PROTECTION ÉLECTRIQUE
  {
    id: 'electrical_mat',
    name: 'Tapis isolant',
    category: 'electrical',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Isolation au sol pour travaux électriques',
    certifications: ['ASTM D178', 'IEC 61111'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '10 ans ou selon tests',
    cost: '200-800 CAD',
    supplier: 'Salisbury, Cementex, NASCO'
  },
  {
    id: 'voltage_tester',
    name: 'Vérificateur d\'absence de tension',
    category: 'electrical',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'VAT certifié pour vérification sécuritaire',
    certifications: ['CSA Z462', 'IEC 61243-3'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans selon calibration',
    cost: '150-500 CAD',
    supplier: 'Fluke, Klein Tools, Ideal'
  },

  // DÉTECTION
  {
    id: 'gas_detector_4_gas',
    name: 'Détecteur 4 gaz',
    category: 'detection',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Détection O₂, LIE, CO, H₂S avec alarmes',
    certifications: ['CSA C22.2', 'ATEX', 'IECEx'],
    inspectionFrequency: 'Calibration quotidienne',
    lifespan: '3-5 ans selon capteurs',
    cost: '800-2000 CAD',
    supplier: 'Honeywell, MSA, Dräger, Industrial Scientific'
  },
  {
    id: 'sound_level_meter',
    name: 'Sonomètre',
    category: 'detection',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Mesure niveaux sonores pour protection auditive',
    certifications: ['IEC 61672', 'ANSI S1.4'],
    inspectionFrequency: 'Calibration annuelle',
    lifespan: '10+ ans avec calibration',
    cost: '500-3000 CAD',
    supplier: 'Brüel & Kjær, Larson Davis, 3M, Casella'
  },

  // PREMIERS SECOURS
  {
    id: 'first_aid_kit',
    name: 'Trousse premiers secours',
    category: 'other',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Trousse conforme réglementation provinciale',
    certifications: ['CSA Z1220', 'Réglementation provinciale'],
    inspectionFrequency: 'Mensuelle',
    lifespan: 'Remplacement selon péremption',
    cost: '50-200 CAD',
    supplier: 'Johnson & Johnson, Honeywell, Acme United'
  }
];

// =================== ÉTAPE 2 AMÉLIORÉE - ÉQUIPEMENTS DE SÉCURITÉ ===================
// Remplacer votre étape 2 existante par ceci :

{/* ÉTAPE 2: Équipements de Sécurité - VERSION COMPLÈTE */}
{currentStep === 1 && (
  <div className="slide-in">
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
        🛡️ {t.safetyEquipment.title}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '16px', margin: '0' }}>
        Sélection et vérification des équipements de protection
      </p>
    </div>

    {/* Statistiques équipements */}
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
            {formData.safetyEquipment.filter(eq => eq.required).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Requis</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {formData.safetyEquipment.filter(eq => eq.available).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Disponibles</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            {formData.safetyEquipment.filter(eq => eq.verified).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Vérifiés</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: formData.safetyEquipment.filter(eq => eq.required && !eq.verified).length > 0 ? '#ef4444' : '#10b981' }}>
            {Math.round(formData.safetyEquipment.filter(eq => eq.required).length > 0 
              ? (formData.safetyEquipment.filter(eq => eq.required && eq.verified).length / formData.safetyEquipment.filter(eq => eq.required).length) * 100
              : 0)}%
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Conformité</div>
        </div>
      </div>
    </div>

    {/* Équipements par catégorie */}
    {Object.entries(groupedEquipment).map(([category, equipment]) => (
      <div key={category} style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          color: '#3b82f6', 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          paddingBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{getCategoryIcon(category)}</span>
          {t.safetyEquipment.categories[category as keyof typeof t.safetyEquipment.categories]}
          <span style={{ 
            fontSize: '12px', 
            color: '#94a3b8',
            background: 'rgba(100, 116, 139, 0.2)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {equipment.length} équipements
          </span>
        </h3>
        
        <div className="equipment-grid">
          {equipment.map((item) => (
            <div key={item.id} className={`equipment-item ${item.required ? 'required' : ''} ${item.verified ? 'verified' : ''}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                      {item.name}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                      {item.description}
                    </p>
                    
                    {/* Certifications */}
                    {item.certifications && item.certifications.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>
                          Certifications:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.certifications.map((cert, index) => (
                            <span key={index} style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#3b82f6',
                              fontSize: '9px',
                              padding: '2px 6px',
                              borderRadius: '3px'
                            }}>
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Indicateur de statut */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.verified ? '#10b981' : item.required ? '#ef4444' : '#94a3b8'
                  }} />
                </div>
                
                {/* Contrôles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <CustomCheckbox
                    checked={item.required}
                    onChange={() => toggleEquipmentRequired(item.id)}
                    label={t.safetyEquipment.required}
                  />
                  <CustomCheckbox
                    checked={item.available}
                    onChange={() => toggleEquipmentAvailable(item.id)}
                    label={t.safetyEquipment.available}
                  />
                  <CustomCheckbox
                    checked={item.verified}
                    onChange={() => toggleEquipmentVerified(item.id)}
                    label={t.safetyEquipment.verified}
                  />
                </div>
                
                {/* Notes */}
                <input
                  type="text"
                  className="input-premium"
                  style={{ fontSize: '12px' }}
                  placeholder={t.safetyEquipment.notes}
                  value={item.notes}
                  onChange={(e) => updateEquipmentNotes(item.id, e.target.value)}
                />

                {/* Informations détaillées - affichage conditionnel */}
                {item.required && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '10px',
                    color: '#94a3b8'
                  }}>
                    <div>📅 Inspection: {item.inspectionFrequency}</div>
                    <div>⏱️ Durée de vie: {item.lifespan}</div>
                    <div>💰 Coût: {item.cost}</div>
                    {item.supplier && <div>🏢 Fournisseurs: {item.supplier}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Recommandations automatiques selon type de travail */}
    {selectedWorkType && (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '24px'
      }}>
        <h3 style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          💡 Recommandations pour: {selectedWorkType.name}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
          {selectedWorkType.description}
        </p>
        <div style={{ color: '#10b981', fontSize: '12px' }}>
          ✅ Équipements automatiquement suggérés selon le type de travail sélectionné
        </div>
      </div>
    )}
  </div>
)}

// =================== FONCTION HELPER POUR ICÔNES CATÉGORIES ===================
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'head': '🪖',
    'eye': '👁️',
    'respiratory': '😷',
    'hand': '🧤',
    'foot': '🥾',
    'body': '🦺',
    'fall': '🪢',
    'electrical': '⚡',
    'detection': '📡',
    'other': '🔧'
  };
  return icons[category] || '🛡️';
};

// =================== ÉTAPE 3 AMÉLIORÉE - DANGERS ET RISQUES ===================
// Remplacer votre étape 3 existante par ceci :

{/* ÉTAPE 3: Dangers et Risques - VERSION COMPLÈTE */}
{currentStep === 2 && (
  <div className="slide-in">
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
        ⚠️ {t.hazards.title}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '16px', margin: '0' }}>
        Identification des dangers et sélection des mesures de contrôle
      </p>
    </div>

    {/* Statistiques des dangers */}
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
            {formData.electricalHazards.filter(h => h.isSelected).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Sélectionnés</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
            {formData.electricalHazards.filter(h => h.isSelected && h.riskLevel === 'critical').length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Critiques</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            {formData.electricalHazards.filter(h => h.isSelected && h.riskLevel === 'high').length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Élevés</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {formData.electricalHazards.filter(h => h.isSelected && h.controlMeasures.some(c => c.isSelected)).length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Contrôlés</div>
        </div>
      </div>
    </div>

    {/* Filtres et recherche - EXISTANT mais amélioré */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un danger..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-premium"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-premium"
          style={{ minWidth: '150px' }}
        >
          <option value="all">🎯 Toutes catégories</option>
          <option value="electrical">⚡ Électriques</option>
          <option value="gas">🔥 Gaziers</option>
          <option value="physical">💥 Physiques</option>
          <option value="biological">🦠 Biologiques</option>
          <option value="ergonomic">🏃 Ergonomiques</option>
          <option value="environmental">🌍 Environnementaux</option>
        </select>
      </div>

      {/* Filtre par niveau de risque */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>Filtrer par risque:</span>
        {['critical', 'high', 'medium', 'low'].map(level => (
          <button
            key={level}
            onClick={() => setFilterCategory(level === filterCategory ? 'all' : level)}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              background: level === filterCategory 
                ? (level === 'critical' ? '#dc2626' : level === 'high' ? '#f59e0b' : level === 'medium' ? '#eab308' : '#10b981')
                : 'rgba(100, 116, 139, 0.2)',
              color: level === filterCategory ? 'white' : '#94a3b8'
            }}
          >
            {t.hazards.levels[level as keyof typeof t.hazards.levels]}
          </button>
        ))}
      </div>
    </div>

    {/* Liste des dangers - utilise la nouvelle base complète */}
    <div className="hazard-grid">
      {filteredHazards.map(hazard => {
        const hasControls = hasSelectedControls(hazard);
        const showControlsRequired = hazard.isSelected && !hasControls;
        const showControlsVigilance = hazard.isSelected && hasControls;
        
        return (
          <div 
            key={hazard.id} 
            className={`hazard-item ${hazard.riskLevel} ${hazard.isSelected ? (hasControls ? 'selected has-controls' : 'selected no-controls') : ''}`}
            onClick={() => toggleHazard(hazard.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <CustomCheckbox
                checked={hazard.isSelected}
                onChange={() => {}}
                label=""
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ 
                    background: 'rgba(100, 116, 139, 0.3)',
                    color: '#94a3b8',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: 'monospace'
                  }}>
                    {hazard.code}
                  </span>
                  <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0' }}>
                    {hazard.title}
                  </h4>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0' }}>
                  {hazard.description}
                </p>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                background: hazard.riskLevel === 'critical' ? 'rgba(220, 38, 38, 0.2)' :
                           hazard.riskLevel === 'high' ? 'rgba(245, 158, 11, 0.2)' :
                           hazard.riskLevel === 'medium' ? 'rgba(234, 179, 8, 0.2)' :
                           'rgba(34, 197, 94, 0.2)',
                color: hazard.riskLevel === 'critical' ? '#dc2626' :
                       hazard.riskLevel === 'high' ? '#f59e0b' :
                       hazard.riskLevel === 'medium' ? '#eab308' :
                       '#22c55e'
              }}>
                {t.hazards.levels[hazard.riskLevel]}
              </div>
            </div>

            {/* Statut des moyens de contrôle */}
            {showControlsRequired && (
              <div className="hazard-controls-required">
                {t.hazards.controlsRequired}
              </div>
            )}
            
            {showControlsVigilance && (
              <div className="hazard-controls-vigilance">
                {t.hazards.controlsInPlace}
              </div>
            )}

            {/* Section moyens de contrôle - utilise la nouvelle base complète */}
            {hazard.isSelected && hazard.showControls && (
              <div className="control-measures-section" onClick={(e) => e.stopPropagation()}>
                <h5 style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
                  {t.hazards.controlMeasures} (Hiérarchie CSA)
                </h5>
                
                {hazard.controlMeasures.map((control) => (
                  <div key={control.id} className="control-measure-item">
                    <CustomCheckbox
                      checked={control.isSelected}
                      onChange={() => toggleControlMeasure(hazard.id, control.id)}
                      label=""
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                          {control.measure}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: '600',
                          background: control.type === 'elimination' ? 'rgba(34, 197, 94, 0.2)' :
                                     control.type === 'substitution' ? 'rgba(16, 185, 129, 0.2)' :
                                     control.type === 'engineering' ? 'rgba(59, 130, 246, 0.2)' :
                                     control.type === 'administrative' ? 'rgba(245, 158, 11, 0.2)' :
                                     'rgba(239, 68, 68, 0.2)',
                          color: control.type === 'elimination' ? '#22c55e' :
                                 control.type === 'substitution' ? '#10b981' :
                                 control.type === 'engineering' ? '#3b82f6' :
                                 control.type === 'administrative' ? '#f59e0b' :
                                 '#ef4444'
                        }}>
                          {t.hazards.categories[control.type]}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          color: '#94a3b8',
                          background: 'rgba(100, 116, 139, 0.2)',
                          padding: '1px 4px',
                          borderRadius: '2px'
                        }}>
                          {control.effectiveness}% efficacité
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 4px 0' }}>
                        {control.description}
                      </p>
                      
                      {/* Détails de mise en œuvre */}
                      {control.isSelected && (
                        <div style={{
                          background: 'rgba(15, 23, 42, 0.6)',
                          borderRadius: '4px',
                          padding: '8px',
                          marginTop: '6px',
                          fontSize: '11px'
                        }}>
                          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
                            📋 Mise en œuvre: {control.implementation}
                          </div>
                          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
                            👤 Responsable: {control.responsible} | ⏰ {control.timeline}
                          </div>
                          <div style={{ color: '#94a3b8', marginBottom: '6px' }}>
                            📜 Conformité: {control.compliance.join(', ')}
                          </div>
                          <input
                            type="text"
                            className="input-premium"
                            style={{ fontSize: '11px' }}
                            placeholder="Notes spécifiques pour cette mesure..."
                            value={control.notes}
                            onChange={(e) => updateControlNotes(hazard.id, control.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <textarea
                  className="input-premium"
                  style={{ fontSize: '12px', marginTop: '12px', minHeight: '60px' }}
                  placeholder="Notes supplémentaires pour ce danger..."
                  value={hazard.additionalNotes || ''}
                  onChange={(e) => updateHazardNotes(hazard.id, e.target.value)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>

    {filteredHazards.length === 0 && (
      <div style={{
        textAlign: 'center',
        padding: '60px',
        background: 'rgba(30, 41, 59, 0.6)',
        border: '2px dashed rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        color: '#64748b'
      }}>
        <AlertTriangle style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
        <p style={{ fontSize: '16px', margin: '0' }}>Aucun danger trouvé pour ces critères</p>
      </div>
    )}
  </div>
)}

// =================== EXPORT DES NOUVELLES DONNÉES ===================
export { 
  requiredSafetyEquipmentComplete,
  getCategoryIcon
};
export { LocationPicker };
