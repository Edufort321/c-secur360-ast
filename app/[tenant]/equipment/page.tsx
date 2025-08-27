'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  FileText,
  QrCode,
  Camera,
  MapPin,
  User,
  Building,
  Activity,
  Download,
  Upload,
  Bell,
  Shield,
  Zap,
  Settings,
  Star
} from 'lucide-react';

// Types pour l'inspection d'équipements
interface Equipment {
  id: string;
  name: string;
  type: 'nacelle' | 'chariot_elevateur' | 'echelle' | 'grue' | 'compresseur' | 'generateur' | 'autre';
  brand: string;
  model: string;
  serial_number: string;
  location: string;
  status: 'operational' | 'maintenance' | 'out_of_service' | 'inspection_due';
  last_inspection: string;
  next_inspection: string;
  inspector: string;
  certification: string;
  qr_code: string;
  photos: string[];
  notes?: string;
}

interface Inspection {
  id: string;
  equipment_id: string;
  equipment_name: string;
  inspector_name: string;
  inspection_date: string;
  status: 'passed' | 'failed' | 'conditional' | 'pending';
  issues_found: string[];
  recommendations: string[];
  next_inspection_date: string;
  certificate_number?: string;
  photos: string[];
  signature?: string;
}

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function EquipmentPage({ params }: PageProps) {
  const [activeTab, setActiveTab] = useState<'equipment' | 'inspections' | 'reports'>('equipment');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Données démo pour les équipements
  const DEMO_EQUIPMENT: Equipment[] = [
    {
      id: 'eq-001',
      name: 'Nacelle élévatrice A-1',
      type: 'nacelle',
      brand: 'JLG',
      model: '3246ES',
      serial_number: 'JLG-2024-001',
      location: 'Entrepôt Nord - Section A',
      status: 'operational',
      last_inspection: '2024-07-15',
      next_inspection: '2024-10-15',
      inspector: 'Martin Lavoie',
      certification: 'CERT-2024-NE-001',
      qr_code: 'QR-EQ-001',
      photos: ['photo1.jpg', 'photo2.jpg'],
      notes: 'Équipement en excellent état, aucune anomalie détectée.'
    },
    {
      id: 'eq-002',
      name: 'Chariot élévateur B-2',
      type: 'chariot_elevateur',
      brand: 'Toyota',
      model: '8FBU25',
      serial_number: 'TOY-2023-045',
      location: 'Zone de chargement',
      status: 'maintenance',
      last_inspection: '2024-06-20',
      next_inspection: '2024-09-20',
      inspector: 'Sophie Dubois',
      certification: 'CERT-2024-CE-002',
      qr_code: 'QR-EQ-002',
      photos: ['photo3.jpg'],
      notes: 'Réparation hydraulique en cours, remise en service prévue demain.'
    },
    {
      id: 'eq-003',
      name: 'Échelle télescopique C-1',
      type: 'echelle',
      brand: 'Werner',
      model: 'MT-26',
      serial_number: 'WER-2024-078',
      location: 'Atelier de maintenance',
      status: 'inspection_due',
      last_inspection: '2024-05-10',
      next_inspection: '2024-08-10',
      inspector: 'Jean-Pierre Roy',
      certification: 'CERT-2024-EC-003',
      qr_code: 'QR-EQ-003',
      photos: ['photo4.jpg', 'photo5.jpg'],
      notes: 'Inspection annuelle obligatoire en retard de 16 jours.'
    },
    {
      id: 'eq-004',
      name: 'Grue mobile D-1',
      type: 'grue',
      brand: 'Liebherr',
      model: 'LTM 1040-2.1',
      serial_number: 'LIE-2022-012',
      location: 'Cour extérieure',
      status: 'operational',
      last_inspection: '2024-08-01',
      next_inspection: '2025-02-01',
      inspector: 'Alexandre Petit',
      certification: 'CERT-2024-GR-004',
      qr_code: 'QR-EQ-004',
      photos: ['photo6.jpg'],
      notes: 'Inspection semestrielle passée avec succès, certification renouvelée.'
    }
  ];

  // Données démo pour les inspections
  const DEMO_INSPECTIONS: Inspection[] = [
    {
      id: 'insp-001',
      equipment_id: 'eq-001',
      equipment_name: 'Nacelle élévatrice A-1',
      inspector_name: 'Martin Lavoie',
      inspection_date: '2024-07-15',
      status: 'passed',
      issues_found: [],
      recommendations: ['Vérifier le niveau d\'huile hydraulique mensuel'],
      next_inspection_date: '2024-10-15',
      certificate_number: 'CERT-2024-NE-001',
      photos: ['inspection1.jpg'],
      signature: 'M. Lavoie'
    },
    {
      id: 'insp-002',
      equipment_id: 'eq-002',
      equipment_name: 'Chariot élévateur B-2',
      inspector_name: 'Sophie Dubois',
      inspection_date: '2024-06-20',
      status: 'conditional',
      issues_found: ['Fuite hydraulique mineure', 'Pneu avant usé'],
      recommendations: ['Remplacer le pneu avant', 'Réparer la fuite hydraulique'],
      next_inspection_date: '2024-09-20',
      certificate_number: 'CERT-2024-CE-002',
      photos: ['inspection2.jpg', 'inspection3.jpg'],
      signature: 'S. Dubois'
    },
    {
      id: 'insp-003',
      equipment_id: 'eq-004',
      equipment_name: 'Grue mobile D-1',
      inspector_name: 'Alexandre Petit',
      inspection_date: '2024-08-01',
      status: 'passed',
      issues_found: [],
      recommendations: ['Maintenir le programme de lubrification mensuel'],
      next_inspection_date: '2025-02-01',
      certificate_number: 'CERT-2024-GR-004',
      photos: ['inspection4.jpg'],
      signature: 'A. Petit'
    }
  ];

  // Initialiser les données
  useEffect(() => {
    setEquipments(DEMO_EQUIPMENT);
    setInspections(DEMO_INSPECTIONS);
  }, []);

  // Filtrer les équipements
  const filteredEquipments = equipments.filter(equipment => {
    if (searchTerm && !equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !equipment.brand.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !equipment.model.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && equipment.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && equipment.type !== typeFilter) {
      return false;
    }
    return true;
  });

  // Statistiques
  const stats = {
    total: equipments.length,
    operational: equipments.filter(eq => eq.status === 'operational').length,
    maintenance: equipments.filter(eq => eq.status === 'maintenance').length,
    inspection_due: equipments.filter(eq => eq.status === 'inspection_due').length,
    out_of_service: equipments.filter(eq => eq.status === 'out_of_service').length
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inspection_due': return 'bg-red-100 text-red-800';
      case 'out_of_service': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Opérationnel';
      case 'maintenance': return 'Maintenance';
      case 'inspection_due': return 'Inspection due';
      case 'out_of_service': return 'Hors service';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'nacelle': return 'Nacelle';
      case 'chariot_elevateur': return 'Chariot élévateur';
      case 'echelle': return 'Échelle';
      case 'grue': return 'Grue';
      case 'compresseur': return 'Compresseur';
      case 'generateur': return 'Générateur';
      default: return type;
    }
  };

  const getInspectionStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInspectionStatusLabel = (status: string) => {
    switch (status) {
      case 'passed': return 'Réussie';
      case 'failed': return 'Échouée';
      case 'conditional': return 'Conditionnelle';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const handleNewEquipment = () => {
    alert('🔧 Nouvel Équipement\n\nFonctionnalité complète disponible bientôt:\n• Formulaire de création\n• Upload photos\n• Génération QR code\n• Attribution emplacement\n• Programmation inspections');
  };

  const handleNewInspection = () => {
    alert('📋 Nouvelle Inspection\n\nFonctionnalité complète disponible bientôt:\n• Formulaires d\'inspection par type\n• Photos avant/après\n• Signatures électroniques\n• Génération certificats\n• Notifications automatiques');
  };

  const renderEquipmentTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Opérationnels</p>
              <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inspection due</p>
              <p className="text-2xl font-bold text-red-600">{stats.inspection_due}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hors service</p>
              <p className="text-2xl font-bold text-gray-600">{stats.out_of_service}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="Rechercher par nom, marque, modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="operational">Opérationnel</option>
            <option value="maintenance">Maintenance</option>
            <option value="inspection_due">Inspection due</option>
            <option value="out_of_service">Hors service</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="nacelle">Nacelle</option>
            <option value="chariot_elevateur">Chariot élévateur</option>
            <option value="echelle">Échelle</option>
            <option value="grue">Grue</option>
            <option value="compresseur">Compresseur</option>
            <option value="generateur">Générateur</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-4">
        {filteredEquipments.map((equipment) => (
          <div key={equipment.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-gray-400" />
                    {equipment.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {getTypeLabel(equipment.type)}
                    </div>
                    <div>
                      <span className="font-medium">Marque:</span> {equipment.brand} {equipment.model}
                    </div>
                    <div>
                      <span className="font-medium">Série:</span> {equipment.serial_number}
                    </div>
                    <div>
                      <span className="font-medium">Emplacement:</span> {equipment.location}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(equipment.status)}`}>
                    {getStatusLabel(equipment.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-100">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Dernière inspection</p>
                  <p className="text-gray-600">{new Date(equipment.last_inspection).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs text-gray-500">Par: {equipment.inspector}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Prochaine inspection</p>
                  <p className="text-gray-600">{new Date(equipment.next_inspection).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs text-gray-500">Certification: {equipment.certification}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">QR Code</p>
                  <p className="text-gray-600">{equipment.qr_code}</p>
                  <p className="text-xs text-gray-500">{equipment.photos.length} photo(s)</p>
                </div>
              </div>

              {equipment.notes && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {equipment.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                <button
                  onClick={() => alert(`👁️ Voir détails: ${equipment.name}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </button>
                <button
                  onClick={() => alert(`✏️ Modifier: ${equipment.name}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => alert(`📋 Nouvelle inspection: ${equipment.name}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Inspecter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEquipments.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun équipement trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Aucun équipement ne correspond aux filtres sélectionnés.'
              : 'Commencez par ajouter votre premier équipement à inspecter.'}
          </p>
          <button 
            onClick={handleNewEquipment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Nouvel Équipement
          </button>
        </div>
      )}
    </div>
  );

  const renderInspectionsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Historique des Inspections
        </h3>
        <p className="text-gray-600 mb-6">
          Consultez toutes les inspections d'équipements effectuées
        </p>
        <button 
          onClick={handleNewInspection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Inspection
        </button>
      </div>

      {/* Recent Inspections */}
      <div className="space-y-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{inspection.equipment_name}</h3>
                <p className="text-sm text-gray-600">
                  Inspecté par {inspection.inspector_name} le {new Date(inspection.inspection_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInspectionStatusBadgeColor(inspection.status)}`}>
                {getInspectionStatusLabel(inspection.status)}
              </span>
            </div>

            {inspection.issues_found.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Problèmes identifiés:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {inspection.issues_found.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {inspection.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recommandations:</h4>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {inspection.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Prochaine inspection: {new Date(inspection.next_inspection_date).toLocaleDateString('fr-FR')}</span>
              {inspection.certificate_number && (
                <span>Certificat: {inspection.certificate_number}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Rapports et Analytics
        </h3>
        <p className="text-gray-600 mb-6">
          Générez des rapports détaillés sur vos équipements et inspections
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Rapport Mensuel
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapport Conformité
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={40} 
                height={40}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Équipements & Maintenance</h1>
                <p className="text-gray-600 mt-1">Inspection et suivi des équipements lourds</p>
              </div>
            </div>
            <button 
              onClick={handleNewEquipment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel Équipement
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'equipment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Équipements ({stats.total})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inspections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inspections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Inspections ({inspections.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Rapports
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'equipment' && renderEquipmentTab()}
        {activeTab === 'inspections' && renderInspectionsTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🔧 Module Inspection Équipements Lourds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📱 QR Code & Mobile</h4>
              <ul className="space-y-1 text-xs">
                <li>• QR code unique par équipement</li>
                <li>• Inspections mobiles sur terrain</li>
                <li>• Photos avant/après automatiques</li>
                <li>• Géolocalisation des équipements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📋 Inspections & Conformité</h4>
              <ul className="space-y-1 text-xs">
                <li>• Formulaires par type d'équipement</li>
                <li>• Certification automatique</li>
                <li>• Rappels d'inspection programmés</li>
                <li>• Conformité réglementaire canadienne</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Suivi & Analytics</h4>
              <ul className="space-y-1 text-xs">
                <li>• Tableaux de bord en temps réel</li>
                <li>• Historique complet maintenance</li>
                <li>• Prédictions pannes (IA)</li>
                <li>• Rapports export PDF/Excel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}