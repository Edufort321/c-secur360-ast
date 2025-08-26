'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  AlertCircle,
  User,
  Phone,
  Building,
  MapPin,
  Calendar,
  Shield,
  Briefcase
} from 'lucide-react';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  employee_number: string;
  phone_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  role: 'worker' | 'supervisor' | 'manager' | 'admin';
  employment_status: 'active' | 'inactive';
  department: string;
  position: string;
  hire_date: string;
}

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  initialData?: Partial<EmployeeFormData>;
  isEditing?: boolean;
  tenantId?: string;
}

const DEPARTMENTS = [
  'Administration',
  'Sécurité',
  'Maintenance',
  'Production',
  'Logistique',
  'Qualité',
  'Formation'
];

const POSITIONS = [
  'Technicien',
  'Superviseur',
  'Coordonnateur',
  'Gestionnaire',
  'Directeur',
  'Agent de sécurité',
  'Formateur'
];

export default function EmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  tenantId = 'demo'
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    employee_number: initialData?.employee_number || '',
    phone_number: initialData?.phone_number || '',
    emergency_contact_name: initialData?.emergency_contact_name || '',
    emergency_contact_phone: initialData?.emergency_contact_phone || '',
    role: initialData?.role || 'worker',
    employment_status: initialData?.employment_status || 'active',
    department: initialData?.department || '',
    position: initialData?.position || '',
    hire_date: initialData?.hire_date || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Prénom requis';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nom requis';
    }

    if (!formData.employee_number.trim()) {
      newErrors.employee_number = 'Numéro d\'employé requis';
    }

    if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Format de téléphone invalide';
    }

    if (formData.emergency_contact_phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = 'Format de téléphone invalide';
    }

    if (!formData.hire_date) {
      newErrors.hire_date = 'Date d\'embauche requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Modifier l\'employé' : 'Nouvel employé'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Informations minimales conformes aux normes de confidentialité
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 border-b pb-2">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className={errors.first_name ? 'border-red-500' : ''}
                  placeholder="Entrer le prénom"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={errors.last_name ? 'border-red-500' : ''}
                  placeholder="Entrer le nom"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_number">Numéro d'employé *</Label>
                <Input
                  id="employee_number"
                  value={formData.employee_number}
                  onChange={(e) => handleChange('employee_number', e.target.value)}
                  className={errors.employee_number ? 'border-red-500' : ''}
                  placeholder="Ex: EMP001"
                />
                {errors.employee_number && (
                  <p className="text-sm text-red-600 mt-1">{errors.employee_number}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Téléphone
                </Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  className={errors.phone_number ? 'border-red-500' : ''}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 border-b pb-2">
              <AlertCircle className="h-5 w-5" />
              <span>Contact d'urgence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Nom du contact</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact_phone">Téléphone d'urgence</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                  className={errors.emergency_contact_phone ? 'border-red-500' : ''}
                  placeholder="+1 (555) 987-6543"
                />
                {errors.emergency_contact_phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 border-b pb-2">
              <Briefcase className="h-5 w-5" />
              <span>Informations professionnelles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rôle</Label>
                <div className="space-y-2">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="worker">Travailleur</option>
                    <option value="supervisor">Superviseur</option>
                    <option value="manager">Gestionnaire</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  <Badge className={getRoleBadgeColor(formData.role)}>
                    {formData.role}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="employment_status">Statut d'emploi</Label>
                <div className="space-y-2">
                  <select
                    id="employment_status"
                    value={formData.employment_status}
                    onChange={(e) => handleChange('employment_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                  <Badge className={getStatusBadgeColor(formData.employment_status)}>
                    {formData.employment_status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">
                  <Building className="h-4 w-4 inline mr-1" />
                  Département
                </Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un département</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="position">Poste</Label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un poste</option>
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="hire_date">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date d'embauche *
              </Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleChange('hire_date', e.target.value)}
                className={errors.hire_date ? 'border-red-500' : ''}
              />
              {errors.hire_date && (
                <p className="text-sm text-red-600 mt-1">{errors.hire_date}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Mettre à jour' : 'Créer l\'employé'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}