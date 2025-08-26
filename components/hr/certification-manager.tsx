'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  FileText,
  RefreshCw,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

interface Certification {
  type: string;
  valid: boolean;
  expiry?: string;
  issuer?: string;
  doc_id?: string;
  critical?: boolean;
  last_verified_at?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  certifications?: Record<string, Certification>;
}

interface CertificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  tenantId?: string;
}

const COMMON_CERTIFICATIONS = [
  { 
    type: 'sst_formation_generale',
    label: 'Formation générale SST',
    critical: true,
    description: 'Formation de base en santé et sécurité au travail'
  },
  { 
    type: 'premiers_secours',
    label: 'Premiers secours',
    critical: true,
    description: 'Certification en premiers secours et RCR'
  },
  { 
    type: 'espaces_confines',
    label: 'Espaces confinés',
    critical: true,
    description: 'Travail en espaces confinés'
  },
  { 
    type: 'travail_hauteur',
    label: 'Travail en hauteur',
    critical: true,
    description: 'Protection contre les chutes'
  },
  { 
    type: 'conduite_defensive',
    label: 'Conduite défensive',
    critical: false,
    description: 'Formation de conduite sécuritaire'
  },
  { 
    type: 'manipulation_chimiques',
    label: 'Manipulation de produits chimiques',
    critical: true,
    description: 'SIMDUT et manipulation sécuritaire'
  },
  { 
    type: 'equipements_protection',
    label: 'Équipements de protection',
    critical: false,
    description: 'Utilisation des EPI'
  }
];

export default function CertificationManager({
  isOpen,
  onClose,
  employee,
  tenantId = 'demo'
}: CertificationManagerProps) {
  const [certifications, setCertifications] = useState<Record<string, Certification>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCert, setEditingCert] = useState<string | null>(null);
  const [newCertType, setNewCertType] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (employee && isOpen) {
      setCertifications(employee.certifications || {});
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const getCertificationStatus = (cert: Certification) => {
    if (!cert.valid) return 'invalid';
    if (!cert.expiry) return 'valid';
    
    const expiryDate = new Date(cert.expiry);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (expiryDate < now) return 'expired';
    if (expiryDate < thirtyDaysFromNow) return 'expiring';
    return 'valid';
  };

  const getStatusBadge = (cert: Certification) => {
    const status = getCertificationStatus(cert);
    
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Valide</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800">Expire bientôt</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      case 'invalid':
        return <Badge className="bg-gray-100 text-gray-800">Non valide</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  const handleUpdateCertification = async (certType: string, updates: Partial<Certification>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/hr/certifications', {
        method: 'PUT',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employee.id,
          certification_type: certType,
          ...updates
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      const updatedCerts = {
        ...certifications,
        [certType]: {
          ...certifications[certType],
          ...updates,
          last_verified_at: new Date().toISOString()
        }
      };
      
      setCertifications(updatedCerts);
      setEditingCert(null);
    } catch (error) {
      console.error('Erreur mise à jour certification:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCertification = async () => {
    if (!newCertType.trim()) return;
    
    const certConfig = COMMON_CERTIFICATIONS.find(c => c.type === newCertType);
    
    await handleUpdateCertification(newCertType, {
      type: newCertType,
      valid: false,
      critical: certConfig?.critical || false
    });
    
    setNewCertType('');
    setShowAddForm(false);
  };

  const handleDeleteCertification = async (certType: string) => {
    const updatedCerts = { ...certifications };
    delete updatedCerts[certType];
    setCertifications(updatedCerts);
  };

  const checkASTEligibility = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hr/certifications', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employee.id,
          required_certifications: ['sst_formation_generale', 'premiers_secours'],
          strict_mode: true
        })
      });

      const result = await response.json();
      
      // Show eligibility result in a simple alert for now
      const message = result.assignment_check.can_assign 
        ? 'Employé éligible pour AST ✅' 
        : `Non éligible: ${result.assignment_check.message}`;
      
      alert(message);
    } catch (error) {
      console.error('Erreur vérification AST:', error);
    } finally {
      setLoading(false);
    }
  };

  const existingCertTypes = Object.keys(certifications);
  const availableCertTypes = COMMON_CERTIFICATIONS.filter(
    cert => !existingCertTypes.includes(cert.type)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              Gestion des Certifications
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {employee.first_name} {employee.last_name} (#{employee.employee_number})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkASTEligibility}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Vérifier AST
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Certification */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une Certification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Certification
                </Button>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={newCertType}
                    onChange={(e) => setNewCertType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une certification</option>
                    {availableCertTypes.map(cert => (
                      <option key={cert.type} value={cert.type}>
                        {cert.label}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddCertification} disabled={!newCertType}>
                    Ajouter
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCertType('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Certifications */}
          <div className="space-y-4">
            {Object.entries(certifications).map(([certType, cert]) => {
              const config = COMMON_CERTIFICATIONS.find(c => c.type === certType);
              const isEditing = editingCert === certType;

              return (
                <Card key={certType} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          {config?.label || certType}
                          {cert.critical && (
                            <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                          )}
                        </h3>
                        {config?.description && (
                          <p className="text-sm text-gray-600">{config.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(cert)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCert(isEditing ? null : certType)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCertification(certType)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {!isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Statut:</span>
                          <div className="flex items-center mt-1">
                            {cert.valid ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            {cert.valid ? 'Valide' : 'Non valide'}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Expiration:</span>
                          <div className="mt-1">
                            {cert.expiry ? (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(cert.expiry).toLocaleDateString('fr-FR')}
                              </div>
                            ) : (
                              'Pas d\'expiration'
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-600">Émetteur:</span>
                          <div className="mt-1">
                            {cert.issuer ? (
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" />
                                {cert.issuer}
                              </div>
                            ) : (
                              'Non spécifié'
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-600">Document:</span>
                          <div className="mt-1">
                            {cert.doc_id ? (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {cert.doc_id}
                              </div>
                            ) : (
                              'Aucun document'
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Statut</Label>
                            <select
                              value={cert.valid ? 'true' : 'false'}
                              onChange={(e) => handleUpdateCertification(certType, {
                                valid: e.target.value === 'true'
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={saving}
                            >
                              <option value="true">Valide</option>
                              <option value="false">Non valide</option>
                            </select>
                          </div>

                          <div>
                            <Label>Date d'expiration</Label>
                            <Input
                              type="date"
                              value={cert.expiry || ''}
                              onChange={(e) => handleUpdateCertification(certType, {
                                expiry: e.target.value || undefined
                              })}
                              disabled={saving}
                            />
                          </div>

                          <div>
                            <Label>Émetteur</Label>
                            <Input
                              value={cert.issuer || ''}
                              onChange={(e) => handleUpdateCertification(certType, {
                                issuer: e.target.value || undefined
                              })}
                              placeholder="Organisme émetteur"
                              disabled={saving}
                            />
                          </div>

                          <div>
                            <Label>ID Document</Label>
                            <Input
                              value={cert.doc_id || ''}
                              onChange={(e) => handleUpdateCertification(certType, {
                                doc_id: e.target.value || undefined
                              })}
                              placeholder="Référence du document"
                              disabled={saving}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {cert.last_verified_at && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Dernière vérification: {new Date(cert.last_verified_at).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {Object.keys(certifications).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune certification enregistrée
                </h3>
                <p className="text-gray-600">
                  Commencez par ajouter les certifications requises pour cet employé.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}