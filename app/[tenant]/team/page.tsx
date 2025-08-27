'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  UserPlus,
  Settings,
  Download,
  Upload,
  Award,
  Calendar,
  MapPin,
  Briefcase
} from 'lucide-react';

// Types pour la gestion d'équipe
interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'worker' | 'supervisor' | 'manager' | 'admin';
  department: string;
  position: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'pending';
  certifications: string[];
  safety_score: number;
  ast_participation: number;
  last_training: string;
  avatar?: string;
  location?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function TeamPage({ params }: PageProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'training' | 'reports'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Données démo pour les membres d'équipe
  const DEMO_MEMBERS: TeamMember[] = [
    {
      id: 'tm-001',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+1 (514) 123-4567',
      role: 'supervisor',
      department: 'Sécurité',
      position: 'Superviseur Sécurité',
      hire_date: '2022-03-15',
      status: 'active',
      certifications: ['SIMDUT', 'Premiers Soins', 'Espaces Confinés'],
      safety_score: 95,
      ast_participation: 24,
      last_training: '2024-07-20',
      location: 'Site Principal',
      emergency_contact: {
        name: 'Marie Dupont',
        phone: '+1 (514) 987-6543',
        relationship: 'Épouse'
      }
    },
    {
      id: 'tm-002',
      first_name: 'Sophie',
      last_name: 'Martin',
      email: 'sophie.martin@example.com',
      phone: '+1 (514) 234-5678',
      role: 'worker',
      department: 'Production',
      position: 'Opératrice Machinerie',
      hire_date: '2023-01-10',
      status: 'active',
      certifications: ['SIMDUT', 'Conduite Sécuritaire'],
      safety_score: 88,
      ast_participation: 18,
      last_training: '2024-06-15',
      location: 'Usine Nord'
    },
    {
      id: 'tm-003',
      first_name: 'Marc',
      last_name: 'Tremblay',
      email: 'marc.tremblay@example.com',
      phone: '+1 (514) 345-6789',
      role: 'manager',
      department: 'Operations',
      position: 'Gestionnaire Operations',
      hire_date: '2021-08-05',
      status: 'active',
      certifications: ['SIMDUT', 'Premiers Soins', 'Leadership Sécurité', 'ISO 45001'],
      safety_score: 97,
      ast_participation: 45,
      last_training: '2024-08-10',
      location: 'Bureau Principal',
      emergency_contact: {
        name: 'Julie Tremblay',
        phone: '+1 (514) 876-5432',
        relationship: 'Conjointe'
      }
    },
    {
      id: 'tm-004',
      first_name: 'Caroline',
      last_name: 'Leblanc',
      email: 'caroline.leblanc@example.com',
      phone: '+1 (514) 456-7890',
      role: 'worker',
      department: 'Maintenance',
      position: 'Technicienne Maintenance',
      hire_date: '2023-05-20',
      status: 'active',
      certifications: ['SIMDUT', 'Électricité', 'Cadenassage'],
      safety_score: 92,
      ast_participation: 22,
      last_training: '2024-05-30',
      location: 'Atelier Central'
    },
    {
      id: 'tm-005',
      first_name: 'David',
      last_name: 'Roy',
      email: 'david.roy@example.com',
      role: 'worker',
      department: 'Transport',
      position: 'Chauffeur Poids Lourd',
      hire_date: '2024-01-15',
      status: 'pending',
      certifications: ['SIMDUT', 'Transport Matières Dangereuses'],
      safety_score: 85,
      ast_participation: 8,
      last_training: '2024-02-01',
      location: 'Zone Transport'
    }
  ];

  // Initialiser les données
  useEffect(() => {
    setMembers(DEMO_MEMBERS);
  }, []);

  // Filtrer les membres
  const filteredMembers = members.filter(member => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!member.first_name.toLowerCase().includes(searchLower) &&
          !member.last_name.toLowerCase().includes(searchLower) &&
          !member.email.toLowerCase().includes(searchLower) &&
          !member.position.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (statusFilter !== 'all' && member.status !== statusFilter) {
      return false;
    }
    if (roleFilter !== 'all' && member.role !== roleFilter) {
      return false;
    }
    if (departmentFilter !== 'all' && member.department !== departmentFilter) {
      return false;
    }
    return true;
  });

  // Statistiques
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    pending: members.filter(m => m.status === 'pending').length,
    avg_safety_score: Math.round(members.reduce((acc, m) => acc + m.safety_score, 0) / members.length),
    total_certifications: members.reduce((acc, m) => acc + m.certifications.length, 0)
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-indigo-100 text-indigo-800';
      case 'worker': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Gestionnaire';
      case 'supervisor': return 'Superviseur';
      case 'worker': return 'Travailleur';
      default: return role;
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleNewMember = () => {
    alert('👥 Nouveau Membre\n\nFonctionnalité complète disponible bientôt:\n• Formulaire d\'ajout complet\n• Gestion des rôles et permissions\n• Upload photo de profil\n• Configuration accès système\n• Envoi invitation automatique');
  };

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Score Sécurité</p>
              <p className={`text-2xl font-bold ${getSafetyScoreColor(stats.avg_safety_score)}`}>{stats.avg_safety_score}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Certifications</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total_certifications}</p>
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
                placeholder="Rechercher par nom, email, poste..."
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
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Gestionnaire</option>
            <option value="supervisor">Superviseur</option>
            <option value="worker">Travailleur</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les départements</option>
            <option value="Sécurité">Sécurité</option>
            <option value="Production">Production</option>
            <option value="Operations">Operations</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Transport">Transport</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {member.first_name[0]}{member.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-gray-600">{member.position}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Département</p>
                  <p className="text-gray-600">{member.department}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Date d'embauche</p>
                  <p className="text-gray-600">{new Date(member.hire_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Score Sécurité</p>
                  <p className={`font-semibold ${getSafetyScoreColor(member.safety_score)}`}>
                    {member.safety_score}%
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">AST Participées</p>
                  <p className="text-gray-600">{member.ast_participation}</p>
                </div>
              </div>

              {/* Certifications */}
              <div className="py-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-1">
                  {member.certifications.map((cert, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                <button
                  onClick={() => alert(`👁️ Voir profil: ${member.first_name} ${member.last_name}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </button>
                <button
                  onClick={() => alert(`✏️ Modifier: ${member.first_name} ${member.last_name}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => alert(`📧 Contacter: ${member.first_name} ${member.last_name}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun membre trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' || departmentFilter !== 'all'
              ? 'Aucun membre ne correspond aux filtres sélectionnés.'
              : 'Commencez par ajouter des membres à votre équipe.'}
          </p>
          <button 
            onClick={handleNewMember}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Nouveau Membre
          </button>
        </div>
      )}
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Gestion des Rôles et Permissions
        </h3>
        <p className="text-gray-600 mb-6">
          Configuration avancée des rôles utilisateurs et permissions d'accès
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto">
          <Settings className="h-4 w-4" />
          Configurer les Rôles
        </button>
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Formation et Certifications
        </h3>
        <p className="text-gray-600 mb-6">
          Suivi des formations obligatoires et certifications de sécurité
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programmer Formation
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Award className="h-4 w-4" />
            Ajouter Certification
          </button>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Rapports d'Équipe
        </h3>
        <p className="text-gray-600 mb-6">
          Générez des rapports détaillés sur la performance et sécurité de votre équipe
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Rapport Sécurité
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Rapport Performance
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
                <h1 className="text-2xl font-bold text-gray-900">Gestion d'Équipe</h1>
                <p className="text-gray-600 mt-1">Administration des utilisateurs et rôles</p>
              </div>
            </div>
            <button 
              onClick={handleNewMember}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau Membre
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membres ({stats.total})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rôles & Permissions
              </div>
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'training'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Formation & Certifications
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
                <Download className="h-4 w-4" />
                Rapports
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'roles' && renderRolesTab()}
        {activeTab === 'training' && renderTrainingTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            👥 Module Gestion d'Équipe Avancée
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🔐 Rôles & Permissions</h4>
              <ul className="space-y-1 text-xs">
                <li>• Système RBAC granulaire</li>
                <li>• Permissions par module</li>
                <li>• Hiérarchie organisationnelle</li>
                <li>• Audit trail complet</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎓 Formation & Certifications</h4>
              <ul className="space-y-1 text-xs">
                <li>• Suivi certifications SST</li>
                <li>• Rappels expiration automatiques</li>
                <li>• Planification formations</li>
                <li>• Conformité réglementaire</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Analytics & Performance</h4>
              <ul className="space-y-1 text-xs">
                <li>• Scores de sécurité individuels</li>
                <li>• Participation AST trackée</li>
                <li>• Rapports performance équipe</li>
                <li>• KPIs sécurité temps réel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}