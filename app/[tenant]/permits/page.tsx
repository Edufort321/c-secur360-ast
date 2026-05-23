'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TRANSLATIONS } from '../../../app/utils/translations';
import UniversalLayout from '../../../components/layout/UniversalLayout';
import DashboardSidebar from '../../../components/layout/DashboardSidebar';
import LOTOPhotoCarousel from '../../../components/loto/LOTOPhotoCarousel';
import { 
  Shield, Users, MapPin, Clock, AlertTriangle, CheckCircle, 
  Zap, Flame, Wind, Wrench, Settings, Camera, Lock,
  Eye, Phone, FileText, Plus, X, Edit, Save, Download,
  QrCode, Scan, UserCheck, Activity, Timer, Upload,
  Trash2, ZoomIn, ChevronLeft, ChevronRight, Star,
  Archive, Filter, Search, Calendar, Award, Target
} from 'lucide-react';

// =================== INTERFACES ÉTENDUES ===================

interface Worker {
  id: string;
  name: string;
  role: string;
  certification: string[];
  present: boolean;
  checkedInAt?: string;
  emergencyContact?: string;
  badgeNumber?: string;
  qrCode?: string;
  permitIds: string[];
}

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  timestamp: string;
  gpsLocation?: Coordinates;
  description: { fr: string; en: string };
  mandatory: boolean;
  validated: boolean;
  validatedBy?: string;
  permitId: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  deviceInfo?: string;
  quality: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LOTOProcedure {
  id: string;
  permitId: string;
  points: LOTOPoint[];
  sequence: string[];
  validated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  photos: Photo[];
}

interface LOTOPoint {
  id: string;
  equipmentName: string;
  location: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical';
  isolationMethod: string;
  lockNumber?: string;
  appliedBy?: string;
  verifiedBy?: string;
  status: 'pending' | 'isolated' | 'verified' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  photos: string[];
  notes?: string;
}

interface Permit {
  id: string;
  type: 'hot_work' | 'confined_space' | 'excavation' | 'electrical' | 'height_work' | 'chemical';
  title: string;
  description: string;
  requirements: string[];
  validityPeriod: string;
  status: 'active' | 'expired' | 'pending' | 'completed' | 'cancelled';
  issueDate: Date;
  expiryDate: Date;
  issuedBy: string;
  holder: string;
  workLocation: string;
  attachments: string[];
  
  // Nouvelles propriétés avancées
  workers: string[]; // Worker IDs
  photos: string[]; // Photo IDs
  lotoProcedure?: string; // LOTO Procedure ID
  qrCode?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  emergencyContacts: string[];
  supervisorApproval: boolean;
  safetyBriefing: boolean;
  equipmentInspection: boolean;
  environmentalConditions: {
    weather?: string;
    temperature?: number;
    windSpeed?: number;
    visibility?: string;
  };
  specialRequirements: string[];
  communicationPlan: string;
  contingencyPlan: string;
  completionReport?: string;
  incidentReports: string[];
  extensions: Extension[];
  auditTrail: AuditEntry[];
}

interface Extension {
  id: string;
  reason: string;
  originalEndDate: string;
  newEndDate: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

interface NewPermit {
  type: Permit['type'];
  title: string;
  description: string;
  workLocation: string;
  holder: string;
  validityPeriod: string;
}

export default function PermitsPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isAddingPermit, setIsAddingPermit] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [newPermit, setNewPermit] = useState<NewPermit>({
    type: 'hot_work',
    title: '',
    description: '',
    workLocation: '',
    holder: '',
    validityPeriod: '24h'
  });

  const t = TRANSLATIONS[language] as any;

  useEffect(() => {
    loadPermits();
  }, []);

  const loadPermits = () => {
    const mockPermits: Permit[] = [
      {
        id: 'permit-001',
        type: 'hot_work',
        title: t.permits.types.hotWork,
        description: 'Soudage sur pipeline principal',
        requirements: ['Formation soudage', 'Extincteur à proximité', 'Surveillance continue'],
        validityPeriod: '24h',
        status: 'active',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-01-16'),
        issuedBy: 'Superviseur Jean Dupont',
        holder: 'Soudeur Marie Tremblay',
        workLocation: 'Zone A - Pipeline principal',
        attachments: ['certificat-soudage.pdf', 'plan-securite.pdf'],
        workers: ['worker-001', 'worker-002'],
        photos: ['photo-001', 'photo-002'],
        lotoProcedure: 'loto-001',
        qrCode: 'QR-PERMIT-001',
        riskLevel: 'high',
        emergencyContacts: ['911', 'Superviseur: +1-514-123-4567'],
        supervisorApproval: true,
        safetyBriefing: true,
        equipmentInspection: true,
        environmentalConditions: {
          weather: 'clear',
          temperature: 15,
          windSpeed: 5,
          visibility: 'excellent'
        },
        specialRequirements: ['Ventilation forcée', 'Détecteur de gaz'],
        communicationPlan: 'Radio VHF canal 12',
        contingencyPlan: 'Évacuation zone en cas d\'incident',
        completionReport: undefined,
        incidentReports: [],
        extensions: [],
        auditTrail: []
      },
      {
        id: 'permit-002',
        type: 'confined_space',
        title: t.permits.types.confinedSpace,
        description: 'Inspection réservoir souterrain',
        requirements: ['Détecteur de gaz', 'Harnais de sécurité', 'Surveillance externe'],
        validityPeriod: '8h',
        status: 'pending',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-01-15'),
        issuedBy: 'Superviseur Paul Martin',
        holder: 'Inspecteur Claude Lavoie',
        workLocation: 'Réservoir R-12',
        attachments: ['formation-espaces-confines.pdf'],
        workers: ['worker-003'],
        photos: [],
        lotoProcedure: 'loto-002',
        qrCode: 'QR-PERMIT-002',
        riskLevel: 'critical',
        emergencyContacts: ['911', 'Superviseur: +1-514-987-6543'],
        supervisorApproval: false,
        safetyBriefing: true,
        equipmentInspection: false,
        environmentalConditions: {
          weather: 'clear',
          temperature: 12,
          windSpeed: 2,
          visibility: 'good'
        },
        specialRequirements: ['Test atmosphérique', 'Ventilation assistée', 'Équipe de secours'],
        communicationPlan: 'Radio portative + système de surveillance',
        contingencyPlan: 'Évacuation immédiate en cas de détection de gaz',
        completionReport: undefined,
        incidentReports: [],
        extensions: [],
        auditTrail: []
      }
    ];
    setPermits(mockPermits);
  };

  const handleAddPermit = () => {
    const permit: Permit = {
      id: `permit-${Date.now()}`,
      ...newPermit,
      requirements: getDefaultRequirements(newPermit.type),
      status: 'pending',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + getValidityMs(newPermit.validityPeriod)),
      issuedBy: 'Système automatique',
      attachments: [],
      workers: [],
      photos: [],
      riskLevel: 'medium',
      emergencyContacts: ['911'],
      supervisorApproval: false,
      safetyBriefing: false,
      equipmentInspection: false,
      environmentalConditions: {},
      specialRequirements: [],
      communicationPlan: '',
      contingencyPlan: '',
      incidentReports: [],
      extensions: [],
      auditTrail: []
    };

    setPermits([...permits, permit]);
    setNewPermit({
      type: 'hot_work',
      title: '',
      description: '',
      workLocation: '',
      holder: '',
      validityPeriod: '24h'
    });
    setIsAddingPermit(false);
  };

  const getDefaultRequirements = (type: Permit['type']): string[] => {
    const requirementsMap = {
      hot_work: ['Formation travail à chaud', 'Extincteur', 'Surveillance'],
      confined_space: ['Détecteur de gaz', 'Harnais', 'Surveillance externe'],
      excavation: ['Localisation services', 'Étayage', 'Signalisation'],
      electrical: ['Cadenassage', 'EPI électrique', 'Vérification tension'],
      height_work: ['Harnais antichute', 'Points d\'ancrage', 'Formation hauteur'],
      chemical: ['EPI chimique', 'Fiche signalétique', 'Douche d\'urgence']
    };
    return requirementsMap[type] || [];
  };

  const getValidityMs = (period: string): number => {
    const periodMap = {
      '4h': 4 * 60 * 60 * 1000,
      '8h': 8 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return periodMap[period as keyof typeof periodMap] || 24 * 60 * 60 * 1000;
  };

  const getStatusColor = (status: Permit['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Permit['type']) => {
    const iconMap = {
      hot_work: '🔥',
      confined_space: '🕳️',
      excavation: '🚧',
      electrical: '⚡',
      height_work: '🪜',
      chemical: '🧪'
    };
    return iconMap[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t.permits.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {t.permits.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    language === 'fr' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={() => setIsAddingPermit(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>+</span>
                <span>{t.permits.actions.addNew}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t.permits.stats.active}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {permits.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t.permits.stats.pending}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {permits.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t.permits.stats.expired}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {permits.filter(p => p.status === 'expired').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t.permits.stats.total}</p>
                <p className="text-2xl font-bold text-gray-900">{permits.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Permits List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {t.permits.list.title}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.type}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.title}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.holder}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.location}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.expiry}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.permits.list.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getTypeIcon(permit.type)}</span>
                        <span className="text-sm text-gray-900">{permit.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{permit.title}</div>
                      <div className="text-sm text-gray-500">{permit.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {permit.holder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {permit.workLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(permit.status)}`}>
                        {t.permits.status[permit.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {permit.expiryDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedPermit(permit)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {t.permits.actions.view}
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        {t.permits.actions.edit}
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        {t.permits.actions.revoke}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Permit Modal */}
        {isAddingPermit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t.permits.actions.addNew}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.permits.form.type}
                  </label>
                  <select
                    value={newPermit.type}
                    onChange={(e) => setNewPermit({...newPermit, type: e.target.value as Permit['type']})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="hot_work">{t.permits.types.hotWork}</option>
                    <option value="confined_space">{t.permits.types.confinedSpace}</option>
                    <option value="excavation">{t.permits.types.excavation}</option>
                    <option value="electrical">{t.permits.types.electrical}</option>
                    <option value="height_work">{t.permits.types.heightWork}</option>
                    <option value="chemical">{t.permits.types.chemical}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.permits.form.title}
                  </label>
                  <input
                    type="text"
                    value={newPermit.title}
                    onChange={(e) => setNewPermit({...newPermit, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={t.permits.form.titlePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.permits.form.description}
                  </label>
                  <textarea
                    value={newPermit.description}
                    onChange={(e) => setNewPermit({...newPermit, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder={t.permits.form.descriptionPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.permits.form.holder}
                    </label>
                    <input
                      type="text"
                      value={newPermit.holder}
                      onChange={(e) => setNewPermit({...newPermit, holder: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder={t.permits.form.holderPlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.permits.form.validity}
                    </label>
                    <select
                      value={newPermit.validityPeriod}
                      onChange={(e) => setNewPermit({...newPermit, validityPeriod: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="4h">4 heures</option>
                      <option value="8h">8 heures</option>
                      <option value="24h">24 heures</option>
                      <option value="7d">7 jours</option>
                      <option value="30d">30 jours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.permits.form.location}
                  </label>
                  <input
                    type="text"
                    value={newPermit.workLocation}
                    onChange={(e) => setNewPermit({...newPermit, workLocation: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={t.permits.form.locationPlaceholder}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingPermit(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t.permits.actions.cancel}
                </button>
                <button
                  onClick={handleAddPermit}
                  disabled={!newPermit.title || !newPermit.holder || !newPermit.workLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.permits.actions.create}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Permit Modal */}
        {selectedPermit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedPermit.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{selectedPermit.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPermit(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{t.permits.details.information}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.type}:</span>
                      <span>{selectedPermit.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.status}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPermit.status)}`}>
                        {t.permits.status[selectedPermit.status]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.holder}:</span>
                      <span>{selectedPermit.holder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.location}:</span>
                      <span>{selectedPermit.workLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.issueDate}:</span>
                      <span>{selectedPermit.issueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.expiryDate}:</span>
                      <span>{selectedPermit.expiryDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.permits.details.issuedBy}:</span>
                      <span>{selectedPermit.issuedBy}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{t.permits.details.requirements}</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedPermit.requirements.map((req, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedPermit.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">{t.permits.details.attachments}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPermit.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-2 border rounded-lg">
                        <span className="text-blue-600 mr-2">📎</span>
                        <span className="text-sm">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedPermit(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t.permits.actions.close}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {t.permits.actions.print}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}