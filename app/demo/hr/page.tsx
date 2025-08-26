'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Award,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Phone,
  Calendar,
  FileText,
  Download
} from 'lucide-react';

// Types pour la démo RH
interface DemoEmployee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  phone_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role: 'worker' | 'supervisor' | 'manager' | 'admin';
  employment_status: 'active' | 'inactive';
  department?: string;
  position?: string;
  hire_date: string;
  safety_score?: number;
  punctuality_score?: number;
  ast_filled?: number;
  incidents?: number;
  certifications_count?: number;
  certifications_expired?: number;
}

export default function DemoHRPage() {
  const [employees, setEmployees] = useState<DemoEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<DemoEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Données démo employés
  const DEMO_EMPLOYEES: DemoEmployee[] = [
    {
      id: 'emp-001',
      first_name: 'Jean',
      last_name: 'Dupont',
      employee_number: 'EMP001',
      phone_number: '+1 (514) 555-0123',
      emergency_contact_name: 'Marie Dupont',
      emergency_contact_phone: '+1 (514) 555-0124',
      role: 'worker',
      employment_status: 'active',
      department: 'Sécurité',
      position: 'Technicien SST',
      hire_date: '2023-03-15',
      safety_score: 95,
      punctuality_score: 88,
      ast_filled: 12,
      incidents: 0,
      certifications_count: 6,
      certifications_expired: 0
    },
    {
      id: 'emp-002',
      first_name: 'Sophie',
      last_name: 'Martin',
      employee_number: 'EMP002',
      phone_number: '+1 (450) 555-0456',
      emergency_contact_name: 'Pierre Martin',
      emergency_contact_phone: '+1 (450) 555-0457',
      role: 'supervisor',
      employment_status: 'active',
      department: 'Production',
      position: 'Superviseure d\'équipe',
      hire_date: '2022-08-01',
      safety_score: 92,
      punctuality_score: 95,
      ast_filled: 18,
      incidents: 1,
      certifications_count: 8,
      certifications_expired: 1
    },
    {
      id: 'emp-003',
      first_name: 'Marc',
      last_name: 'Tremblay',
      employee_number: 'EMP003',
      phone_number: '+1 (418) 555-0789',
      emergency_contact_name: 'Lucie Tremblay',
      emergency_contact_phone: '+1 (418) 555-0790',
      role: 'manager',
      employment_status: 'active',
      department: 'Administration',
      position: 'Gestionnaire RH',
      hire_date: '2021-01-10',
      safety_score: 87,
      punctuality_score: 98,
      ast_filled: 8,
      incidents: 0,
      certifications_count: 5,
      certifications_expired: 0
    },
    {
      id: 'emp-004',
      first_name: 'Caroline',
      last_name: 'Leblanc',
      employee_number: 'EMP004',
      phone_number: '+1 (514) 555-0321',
      emergency_contact_name: 'Robert Leblanc',
      emergency_contact_phone: '+1 (514) 555-0322',
      role: 'worker',
      employment_status: 'active',
      department: 'Maintenance',
      position: 'Électricienne',
      hire_date: '2023-06-20',
      safety_score: 78,
      punctuality_score: 85,
      ast_filled: 6,
      incidents: 2,
      certifications_count: 4,
      certifications_expired: 2
    },
    {
      id: 'emp-005',
      first_name: 'David',
      last_name: 'Roy',
      employee_number: 'EMP005',
      phone_number: '+1 (450) 555-0654',
      emergency_contact_name: 'Sylvie Roy',
      emergency_contact_phone: '+1 (450) 555-0655',
      role: 'worker',
      employment_status: 'inactive',
      department: 'Logistique',
      position: 'Chauffeur',
      hire_date: '2020-11-05',
      safety_score: 90,
      punctuality_score: 92,
      ast_filled: 15,
      incidents: 1,
      certifications_count: 7,
      certifications_expired: 1
    }
  ];

  // Initialiser les données
  React.useEffect(() => {
    setEmployees(DEMO_EMPLOYEES);
    setFilteredEmployees(DEMO_EMPLOYEES);
  }, []);

  // Appliquer les filtres
  React.useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.employment_status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  // Statistiques
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.employment_status === 'active').length,
    inactive: employees.filter(emp => emp.employment_status === 'inactive').length,
    criticalCerts: employees.filter(emp => (emp.certifications_expired || 0) > 0).length
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'worker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleDemoAction = (action: string) => {
    alert(`🎯 Action démo: ${action}\n\n(Démo: Fonctionnalité disponible dans la version complète avec authentification)`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec retour démo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Bandeau démo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Mode Démo RH</p>
              <p className="text-xs text-blue-700">Données temporaires - Module sécurisé</p>
            </div>
            <a 
              href="/demo"
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
              <p className="text-gray-600 mt-1">Module RH sécurisé avec suivi SST</p>
            </div>
            <button 
              onClick={() => handleDemoAction('Créer employé')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel Employé
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certifs Critiques</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalCerts}</p>
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
                  placeholder="Rechercher par nom, numéro, département..."
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
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export des Données RH
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleDemoAction('Export Liste Employés')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Liste Employés
            </button>
            <button
              onClick={() => handleDemoAction('Export Certifications')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Certifications
            </button>
            <button
              onClick={() => handleDemoAction('Export Rapport Sécurité')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Rapport Sécurité
            </button>
            <button
              onClick={() => handleDemoAction('Export Certifs Expirantes')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Certifs Expirantes
            </button>
          </div>
        </div>

        {/* Employees List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">#{employee.employee_number}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(employee.role)}`}>
                      {employee.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(employee.employment_status)}`}>
                      {employee.employment_status}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-2 mb-4">
                  {employee.position && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {employee.position}
                    </div>
                  )}
                  
                  {employee.department && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      {employee.department}
                    </div>
                  )}
                  
                  {employee.phone_number && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {employee.phone_number}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Embauché le {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Safety Metrics */}
                {employee.safety_score && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Indicateurs de Sécurité
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Score Sécurité:</span>
                        <span className={`ml-2 font-medium ${getSafetyScoreColor(employee.safety_score)}`}>
                          {employee.safety_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ponctualité:</span>
                        <span className={`ml-2 font-medium ${getSafetyScoreColor(employee.punctuality_score || 0)}`}>
                          {employee.punctuality_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">AST Remplis:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {employee.ast_filled}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incidents:</span>
                        <span className={`ml-2 font-medium ${(employee.incidents || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {employee.incidents}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certifications Summary */}
                {employee.certifications_count && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Certifications
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Total: {employee.certifications_count}
                      </span>
                      {(employee.certifications_expired || 0) > 0 ? (
                        <span className="text-red-600 font-medium">
                          {employee.certifications_expired} expirée(s)
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">Toutes valides</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button 
                    onClick={() => handleDemoAction(`Modifier ${employee.first_name} ${employee.last_name}`)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDemoAction(`Certifications ${employee.first_name} ${employee.last_name}`)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Award className="h-4 w-4 mr-1" />
                    Certifications
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun employé trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                ? 'Aucun employé ne correspond aux filtres sélectionnés.'
                : 'Commencez par ajouter votre premier employé.'}
            </p>
            <button 
              onClick={() => handleDemoAction('Créer premier employé')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Ajouter un Employé
            </button>
          </div>
        )}
      </div>
    </div>
  );
}