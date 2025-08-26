'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import EmployeeForm from './employee-form';
import CertificationManager from './certification-manager';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  Building,
  MapPin,
  Calendar,
  Award,
  Activity
} from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number?: string;
  phone_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role: 'worker' | 'supervisor' | 'manager' | 'admin';
  employment_status: 'active' | 'inactive' | 'terminated';
  department?: string;
  position?: string;
  hire_date?: string;
  certifications?: Record<string, any>;
  employee_safety_records?: Array<{
    safety_score: number;
    punctuality_score: number;
    ast_filled: number;
    ast_participated: number;
    incidents: number;
    last_evaluation_date?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface EmployeeDashboardProps {
  tenantId?: string;
}

export default function EmployeesDashboard({ tenantId = 'demo' }: EmployeeDashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [managingCertifications, setManagingCertifications] = useState<Employee | null>(null);

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeSafety: 'true',
        status: statusFilter,
        department: departmentFilter
      });

      const response = await fetch(`/api/hr/employees?${params}`, {
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des employés');
      }

      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [tenantId, statusFilter, departmentFilter]);

  // Handle employee creation
  const handleCreateEmployee = async (data: any) => {
    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'employé');
      }

      await fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Erreur création employé:', error);
      throw error;
    }
  };

  // Handle employee update
  const handleUpdateEmployee = async (data: any) => {
    if (!editingEmployee) return;
    
    try {
      const response = await fetch(`/api/hr/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'employé');
      }

      await fetchEmployees(); // Refresh the list
      setEditingEmployee(null);
    } catch (error) {
      console.error('Erreur mise à jour employé:', error);
      throw error;
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      employee.employee_number?.toLowerCase().includes(searchLower) ||
      employee.department?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower)
    );
  });

  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.employment_status === 'active').length,
    inactive: employees.filter(emp => emp.employment_status === 'inactive').length,
    criticalCerts: employees.filter(emp => {
      const certs = emp.certifications || {};
      return Object.values(certs).some((cert: any) => 
        cert.critical && (!cert.valid || (cert.expiry && new Date(cert.expiry) < new Date()))
      );
    }).length
  };

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
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
          <p className="text-gray-600 mt-1">Module RH sécurisé avec suivi SST</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Employé
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certifs Critiques</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalCerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, numéro, département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
              <option value="terminated">Terminé</option>
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
        </CardContent>
      </Card>

      {/* Employees List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const safetyRecord = employee.employee_safety_records?.[0];
          
          return (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {employee.first_name} {employee.last_name}
                    </CardTitle>
                    {employee.employee_number && (
                      <p className="text-sm text-gray-600">#{employee.employee_number}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getRoleBadgeColor(employee.role)}>
                      {employee.role}
                    </Badge>
                    <Badge className={getStatusBadgeColor(employee.employment_status)}>
                      {employee.employment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  {employee.position && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
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
                  
                  {employee.hire_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Embauché le {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                {/* Safety Metrics */}
                {safetyRecord && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Indicateurs de Sécurité
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Score Sécurité:</span>
                        <span className={`ml-2 font-medium ${getSafetyScoreColor(safetyRecord.safety_score)}`}>
                          {safetyRecord.safety_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ponctualité:</span>
                        <span className={`ml-2 font-medium ${getSafetyScoreColor(safetyRecord.punctuality_score)}`}>
                          {safetyRecord.punctuality_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">AST Remplis:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {safetyRecord.ast_filled}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incidents:</span>
                        <span className={`ml-2 font-medium ${safetyRecord.incidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {safetyRecord.incidents}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingEmployee(employee)}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setManagingCertifications(employee)}
                  >
                    <Award className="h-4 w-4 mr-1" />
                    Certifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun employé trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                ? 'Aucun employé ne correspond aux filtres sélectionnés.'
                : 'Commencez par ajouter votre premier employé.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Employé
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Employee Form Modals */}
      <EmployeeForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateEmployee}
        tenantId={tenantId}
      />

      <EmployeeForm
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSubmit={handleUpdateEmployee}
        initialData={editingEmployee || undefined}
        isEditing={true}
        tenantId={tenantId}
      />

      <CertificationManager
        isOpen={!!managingCertifications}
        onClose={() => setManagingCertifications(null)}
        employee={managingCertifications}
        tenantId={tenantId}
      />
    </div>
  );
}