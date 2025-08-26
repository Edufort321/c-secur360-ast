'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  Users,
  Shield,
  Loader2
} from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number?: string;
  phone_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role: string;
  employment_status: string;
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
  }>;
}

interface ExportManagerProps {
  employees: Employee[];
  tenantId?: string;
}

export default function ExportManager({ employees, tenantId = 'demo' }: ExportManagerProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportFilters, setExportFilters] = useState({
    includePersonalData: true,
    includeSafetyMetrics: true,
    includeCertifications: true,
    activeEmployeesOnly: false,
    dateRange: 'all'
  });

  const generateCSV = (data: any[], headers: string[]): string => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value.toString();
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFilteredEmployees = () => {
    let filtered = [...employees];
    
    if (exportFilters.activeEmployeesOnly) {
      filtered = filtered.filter(emp => emp.employment_status === 'active');
    }
    
    return filtered;
  };

  const exportEmployeesList = async () => {
    setExporting('employees');
    
    try {
      const filteredEmployees = getFilteredEmployees();
      const exportData = filteredEmployees.map(emp => {
        const baseData: any = {
          'Numéro employé': emp.employee_number || '',
          'Prénom': emp.first_name,
          'Nom': emp.last_name,
          'Rôle': emp.role,
          'Statut': emp.employment_status,
          'Département': emp.department || '',
          'Poste': emp.position || '',
          'Date embauche': emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('fr-FR') : ''
        };

        if (exportFilters.includePersonalData) {
          baseData['Téléphone'] = emp.phone_number || '';
          baseData['Contact urgence'] = emp.emergency_contact_name || '';
          baseData['Téléphone urgence'] = emp.emergency_contact_phone || '';
        }

        if (exportFilters.includeSafetyMetrics) {
          const safety = emp.employee_safety_records?.[0];
          if (safety) {
            baseData['Score sécurité'] = safety.safety_score;
            baseData['Score ponctualité'] = safety.punctuality_score;
            baseData['AST remplis'] = safety.ast_filled;
            baseData['AST participés'] = safety.ast_participated;
            baseData['Incidents'] = safety.incidents;
          }
        }

        return baseData;
      });

      const headers = Object.keys(exportData[0] || {});
      const csv = generateCSV(exportData, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      
      downloadFile(csv, `employes-${tenantId}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
      
    } catch (error) {
      console.error('Erreur export employés:', error);
      alert('Erreur lors de l\'export des employés');
    } finally {
      setExporting(null);
    }
  };

  const exportCertifications = async () => {
    setExporting('certifications');
    
    try {
      const filteredEmployees = getFilteredEmployees();
      const exportData: any[] = [];
      
      filteredEmployees.forEach(emp => {
        const certifications = emp.certifications || {};
        
        Object.entries(certifications).forEach(([certType, certData]: [string, any]) => {
          if (certType === '_meta') return; // Skip metadata
          
          exportData.push({
            'Numéro employé': emp.employee_number || '',
            'Prénom': emp.first_name,
            'Nom': emp.last_name,
            'Type certification': certType,
            'Valide': certData.valid ? 'Oui' : 'Non',
            'Date expiration': certData.expiry ? new Date(certData.expiry).toLocaleDateString('fr-FR') : '',
            'Émetteur': certData.issuer || '',
            'Document ID': certData.doc_id || '',
            'Critique': certData.critical ? 'Oui' : 'Non',
            'Dernière vérification': certData.last_verified_at ? 
              new Date(certData.last_verified_at).toLocaleDateString('fr-FR') : ''
          });
        });
      });

      if (exportData.length === 0) {
        alert('Aucune certification à exporter');
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csv = generateCSV(exportData, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      
      downloadFile(csv, `certifications-${tenantId}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
      
    } catch (error) {
      console.error('Erreur export certifications:', error);
      alert('Erreur lors de l\'export des certifications');
    } finally {
      setExporting(null);
    }
  };

  const exportSafetyReport = async () => {
    setExporting('safety');
    
    try {
      const filteredEmployees = getFilteredEmployees();
      const exportData = filteredEmployees
        .filter(emp => emp.employee_safety_records?.length)
        .map(emp => {
          const safety = emp.employee_safety_records![0];
          
          return {
            'Numéro employé': emp.employee_number || '',
            'Prénom': emp.first_name,
            'Nom': emp.last_name,
            'Département': emp.department || '',
            'Poste': emp.position || '',
            'Score sécurité': safety.safety_score,
            'Score ponctualité': safety.punctuality_score,
            'AST remplis': safety.ast_filled,
            'AST participés': safety.ast_participated,
            'Incidents': safety.incidents,
            'Taux participation AST': safety.ast_filled > 0 ? 
              Math.round((safety.ast_participated / safety.ast_filled) * 100) : 0,
            'Statut sécurité': safety.safety_score >= 90 ? 'Excellent' : 
                              safety.safety_score >= 75 ? 'Bon' : 'À améliorer'
          };
        });

      if (exportData.length === 0) {
        alert('Aucune donnée de sécurité à exporter');
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csv = generateCSV(exportData, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      
      downloadFile(csv, `rapport-securite-${tenantId}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
      
    } catch (error) {
      console.error('Erreur export sécurité:', error);
      alert('Erreur lors de l\'export du rapport de sécurité');
    } finally {
      setExporting(null);
    }
  };

  const exportExpiringCertifications = async () => {
    setExporting('expiring');
    
    try {
      const filteredEmployees = getFilteredEmployees();
      const exportData: any[] = [];
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filteredEmployees.forEach(emp => {
        const certifications = emp.certifications || {};
        
        Object.entries(certifications).forEach(([certType, certData]: [string, any]) => {
          if (certType === '_meta') return;
          
          if (certData.expiry) {
            const expiryDate = new Date(certData.expiry);
            const now = new Date();
            
            if (expiryDate <= thirtyDaysFromNow) {
              const isExpired = expiryDate < now;
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              exportData.push({
                'Numéro employé': emp.employee_number || '',
                'Prénom': emp.first_name,
                'Nom': emp.last_name,
                'Département': emp.department || '',
                'Type certification': certType,
                'Date expiration': expiryDate.toLocaleDateString('fr-FR'),
                'Statut': isExpired ? 'EXPIRÉ' : 'EXPIRE BIENTÔT',
                'Jours restants': daysUntilExpiry,
                'Critique': certData.critical ? 'OUI' : 'NON',
                'Émetteur': certData.issuer || '',
                'Impact AST': certData.critical ? 'BLOQUE ASSIGNATION' : 'AVERTISSEMENT'
              });
            }
          }
        });
      });

      if (exportData.length === 0) {
        alert('Aucune certification expirante trouvée');
        return;
      }

      // Sort by days remaining (expired first, then by urgency)
      exportData.sort((a, b) => a['Jours restants'] - b['Jours restants']);

      const headers = Object.keys(exportData[0]);
      const csv = generateCSV(exportData, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      
      downloadFile(csv, `certifications-expirantes-${tenantId}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
      
    } catch (error) {
      console.error('Erreur export certifications expirantes:', error);
      alert('Erreur lors de l\'export des certifications expirantes');
    } finally {
      setExporting(null);
    }
  };

  const filteredCount = getFilteredEmployees().length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Export des Données RH
        </CardTitle>
        <p className="text-sm text-gray-600">
          Exporter les données des employés en format CSV/Excel
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Filters */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Options d'Export
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportFilters.includePersonalData}
                onChange={(e) => setExportFilters(prev => ({
                  ...prev,
                  includePersonalData: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Inclure données personnelles</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportFilters.includeSafetyMetrics}
                onChange={(e) => setExportFilters(prev => ({
                  ...prev,
                  includeSafetyMetrics: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Inclure métriques sécurité</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportFilters.includeCertifications}
                onChange={(e) => setExportFilters(prev => ({
                  ...prev,
                  includeCertifications: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Inclure certifications</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportFilters.activeEmployeesOnly}
                onChange={(e) => setExportFilters(prev => ({
                  ...prev,
                  activeEmployeesOnly: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Employés actifs seulement</span>
            </label>
          </div>
          
          <div className="text-sm text-gray-600">
            <Badge variant="outline">
              {filteredCount} employé{filteredCount > 1 ? 's' : ''} sélectionné{filteredCount > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={exportEmployeesList}
            disabled={exporting !== null}
            className="flex items-center justify-center"
            variant="outline"
          >
            {exporting === 'employees' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            Liste des Employés
          </Button>

          <Button
            onClick={exportCertifications}
            disabled={exporting !== null}
            className="flex items-center justify-center"
            variant="outline"
          >
            {exporting === 'certifications' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Certifications
          </Button>

          <Button
            onClick={exportSafetyReport}
            disabled={exporting !== null}
            className="flex items-center justify-center"
            variant="outline"
          >
            {exporting === 'safety' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Rapport Sécurité
          </Button>

          <Button
            onClick={exportExpiringCertifications}
            disabled={exporting !== null}
            className="flex items-center justify-center"
            variant="outline"
          >
            {exporting === 'expiring' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Certifs Expirantes
          </Button>
        </div>

        {/* Export Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Les fichiers sont générés en format CSV compatible Excel</p>
          <p>• Les données sensibles respectent les normes de confidentialité</p>
          <p>• Format français pour les dates et décimales</p>
          <p>• Encodage UTF-8 pour les caractères spéciaux</p>
        </div>
      </CardContent>
    </Card>
  );
}