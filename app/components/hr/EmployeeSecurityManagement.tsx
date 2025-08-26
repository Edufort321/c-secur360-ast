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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Car,
  Search,
  Calendar
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role: string;
  certifications: Certification[];
  status: string;
  vehicle_id?: string;
  created_at: string;
  cert_status?: string;
  punctuality_score?: number;
  ast_filled?: number;
  incidents?: number;
  vehicle_assigned?: string;
}

interface Certification {
  type: string;
  number?: string;
  expires: string;
  issued?: string;
}

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  role: string;
  certifications: Certification[];
  status: string;
  vehicle_id?: string;
}

interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
}

const CERTIFICATION_TYPES = [
  { id: 'permis_conduire', label: 'Permis de conduire', expires: true },
  { id: 'chariot_elevateur', label: 'Chariot élévateur', expires: true },
  { id: 'travail_hauteur', label: 'Travail en hauteur', expires: true },
  { id: 'espaces_confines', label: 'Espaces confinés', expires: true },
  { id: 'secourisme', label: 'Secourisme', expires: true },
  { id: 'soudure', label: 'Soudure certifiée', expires: true },
  { id: 'grue_mobile', label: 'Grue mobile', expires: true },
  { id: 'matières_dangereuses', label: 'Matières dangereuses', expires: true }
];

export default function EmployeeSecurityManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    role: 'tech',
    certifications: [],
    status: 'actif',
    vehicle_id: undefined
  });

  const supabase = createClientComponentClient<Database>();

  const roles = [
    { value: 'tech', label: 'Technicien' },
    { value: 'chef', label: 'Chef d\'équipe' },
    { value: 'gestionnaire', label: 'Gestionnaire' },
    { value: 'admin', label: 'Administrateur' }
  ];

  useEffect(() => {
    loadEmployees();
    loadVehicles();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees_with_cert_status')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedEmployees = data?.map(emp => ({
        ...emp,
        certifications: Array.isArray(emp.certifications) ? emp.certifications : []
      })) || [];
      
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, license_plate')
        .eq('type', 'vehicle')
        .eq('status', 'active');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const employeeData = {
        ...formData,
        certifications: JSON.stringify(formData.certifications),
        vehicle_id: formData.vehicle_id || null
      };

      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('employees')
          .insert(employeeData);

        if (error) throw error;
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
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone_number: employee.phone_number || '',
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_phone: employee.emergency_contact_phone || '',
      role: employee.role,
      certifications: employee.certifications || [],
      status: employee.status,
      vehicle_id: employee.vehicle_id || undefined
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
      first_name: '',
      last_name: '',
      phone_number: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      role: 'tech',
      certifications: [],
      status: 'actif',
      vehicle_id: undefined
    });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, {
        type: '',
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }]
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updatedCerts = [...formData.certifications];
    updatedCerts[index] = { ...updatedCerts[index], [field]: value };
    setFormData({ ...formData, certifications: updatedCerts });
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    });
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesCert = certFilter === 'all' || employee.cert_status === certFilter;

    return matchesSearch && matchesStatus && matchesCert;
  });

  const getCertStatusBadge = (status?: string) => {
    switch (status) {
      case 'EXPIRÉ':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expiré
        </Badge>;
      case 'EXPIRE_BIENTÔT':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Expire bientôt
        </Badge>;
      case 'VALIDE':
        return <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Valide
        </Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion Sécurisée des Employés</h1>
            <p className="text-slate-600">Informations minimales • Certifications SST • Conforme PIPEDA</p>
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  {editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Prénom *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Nom *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Téléphone (SMS/Twilio)</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rôle *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact d'urgence */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Contact d'urgence
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergency_contact_name">Nom du contact</Label>
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
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Véhicule assigné */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-500" />
                    Véhicule assigné
                  </h4>
                  <Select 
                    value={formData.vehicle_id || ''} 
                    onValueChange={(value) => setFormData({...formData, vehicle_id: value || undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun véhicule</SelectItem>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.license_plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Certifications */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      Certifications SST
                    </h4>
                    <Button type="button" size="sm" onClick={addCertification}>
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-slate-50">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Type de certification</Label>
                            <Select 
                              value={cert.type} 
                              onValueChange={(value) => updateCertification(index, 'type', value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                              <SelectContent>
                                {CERTIFICATION_TYPES.map(type => (
                                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Date d'expiration</Label>
                            <Input
                              type="date"
                              value={cert.expires}
                              onChange={(e) => updateCertification(index, 'expires', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeCertification(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {formData.certifications.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Aucune certification ajoutée
                      </p>
                    )}
                  </div>
                </div>

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

        {/* Filtres */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={certFilter} onValueChange={setCertFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes certifications</SelectItem>
                    <SelectItem value="VALIDE">Valides</SelectItem>
                    <SelectItem value="EXPIRE_BIENTÔT">Expire bientôt</SelectItem>
                    <SelectItem value="EXPIRÉ">Expirées</SelectItem>
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
                    <th className="text-left p-3 font-medium text-slate-600">Rôle</th>
                    <th className="text-center p-3 font-medium text-slate-600">Certifications</th>
                    <th className="text-center p-3 font-medium text-slate-600">Sécurité</th>
                    <th className="text-center p-3 font-medium text-slate-600">Véhicule</th>
                    <th className="text-center p-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-slate-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          {employee.phone_number && (
                            <div className="text-sm text-slate-600">{employee.phone_number}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{getRoleLabel(employee.role)}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        {getCertStatusBadge(employee.cert_status)}
                        <div className="text-xs text-slate-500 mt-1">
                          {employee.certifications?.length || 0} certification(s)
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="text-sm space-y-1">
                          <div>AST: {employee.ast_filled || 0}</div>
                          <div>Incidents: {employee.incidents || 0}</div>
                          <div>Ponctualité: {employee.punctuality_score || 100}%</div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {employee.vehicle_assigned ? (
                          <Badge variant="outline" className="text-xs">
                            <Car className="h-3 w-3 mr-1" />
                            {employee.vehicle_assigned}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">Aucun</span>
                        )}
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
                  <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Aucun employé trouvé</p>
                  <p className="text-sm text-slate-500">Modifiez vos critères ou ajoutez un nouvel employé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}