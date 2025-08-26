'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Clock,
  User,
  Building,
  Calendar,
  Search
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
  hourly_rate_base: number;
  billable_rate: number;
  overtime_rate_1_5?: number;
  overtime_rate_2_0?: number;
  employment_status: string;
  hire_date: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

interface EmployeeFormData {
  full_name: string;
  email: string;
  position: string;
  department: string;
  hourly_rate_base: number;
  billable_rate: number;
  employment_status: string;
  hire_date: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: '',
    email: '',
    position: '',
    department: '',
    hourly_rate_base: 25,
    billable_rate: 75,
    employment_status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const supabase = createClientComponentClient<Database>();

  const departments = [
    'Administration', 'Sécurité', 'Construction', 'Maintenance', 
    'Inspection', 'Formation', 'IT', 'RH', 'Comptabilité'
  ];

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        // Mise à jour
        const { error } = await supabase
          .from('employees')
          .update({
            ...formData,
            overtime_rate_1_5: formData.hourly_rate_base * 1.5,
            overtime_rate_2_0: formData.hourly_rate_base * 2.0,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('employees')
          .insert({
            ...formData,
            overtime_rate_1_5: formData.hourly_rate_base * 1.5,
            overtime_rate_2_0: formData.hourly_rate_base * 2.0
          });

        if (error) throw error;

        // Créer l'enregistrement de performance initial
        const { data: newEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('email', formData.email)
          .single();

        if (newEmployee) {
          await supabase
            .from('employee_performance')
            .insert({
              employee_id: newEmployee.id,
              jobs_completed: 0,
              safety_score: 85,
              efficiency_ratio: 100,
              punctuality_score: 85
            });
        }
      }

      setIsDialogOpen(false);
      setEditingEmployee(null);
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      hourly_rate_base: employee.hourly_rate_base,
      billable_rate: employee.billable_rate,
      employment_status: employee.employment_status,
      hire_date: employee.hire_date,
      phone: employee.phone || '',
      address: employee.address || '',
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_phone: employee.emergency_contact_phone || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé?')) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadEmployees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      position: '',
      department: '',
      hourly_rate_base: 25,
      billable_rate: 75,
      employment_status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      phone: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: ''
    });
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.employment_status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'terminated': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'terminated': return 'Terminé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Employés</h1>
            <p className="text-slate-600">Administration du personnel et des taux salariaux</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setEditingEmployee(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Employé
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Poste *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Département *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => setFormData({...formData, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate_base">Taux horaire base ($) *</Label>
                    <Input
                      id="hourly_rate_base"
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate_base}
                      onChange={(e) => setFormData({...formData, hourly_rate_base: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billable_rate">Taux facturable ($) *</Label>
                    <Input
                      id="billable_rate"
                      type="number"
                      step="0.01"
                      value={formData.billable_rate}
                      onChange={(e) => setFormData({...formData, billable_rate: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="employment_status">Statut *</Label>
                    <Select 
                      value={formData.employment_status} 
                      onValueChange={(value) => setFormData({...formData, employment_status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="terminated">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hire_date">Date d'embauche *</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Contact d'urgence</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Téléphone d'urgence</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    />
                  </div>
                </div>

                {formData.hourly_rate_base > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-700 mb-2">Calculs automatiques:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Temps supplémentaire (1.5x):</span>
                        <span className="font-medium ml-2">${(formData.hourly_rate_base * 1.5).toFixed(2)}/h</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Temps supplémentaire (2x):</span>
                        <span className="font-medium ml-2">${(formData.hourly_rate_base * 2).toFixed(2)}/h</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingEmployee(null);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingEmployee ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtres et recherche */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou poste..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="terminated">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous départements</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des employés */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600" />
              Employés ({filteredEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-slate-600">Employé</th>
                    <th className="text-left p-3 font-medium text-slate-600">Département</th>
                    <th className="text-left p-3 font-medium text-slate-600">Statut</th>
                    <th className="text-right p-3 font-medium text-slate-600">Taux Base</th>
                    <th className="text-right p-3 font-medium text-slate-600">Taux Facturable</th>
                    <th className="text-center p-3 font-medium text-slate-600">Embauche</th>
                    <th className="text-center p-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-slate-900">{employee.full_name}</div>
                          <div className="text-sm text-slate-600">{employee.position}</div>
                          <div className="text-xs text-slate-500">{employee.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {employee.department}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusBadgeVariant(employee.employment_status)}>
                          {getStatusLabel(employee.employment_status)}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-slate-900">${employee.hourly_rate_base}/h</span>
                          <div className="text-xs text-slate-500">
                            ${(employee.overtime_rate_1_5 || 0).toFixed(2)}/h (1.5x)
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-medium text-emerald-600">${employee.billable_rate}/h</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(employee.hire_date).toLocaleDateString('fr-CA')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Aucun employé trouvé</p>
                  <p className="text-sm text-slate-500">Modifiez vos critères de recherche ou ajoutez un nouvel employé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}