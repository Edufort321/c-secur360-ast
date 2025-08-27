'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Shield,
  FileText,
  Users,
  Building,
  ArrowLeft,
  Info,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Download,
  QrCode,
  Smartphone
} from 'lucide-react';

// Types pour la démo AST
interface DemoAST {
  id: string;
  title: string;
  site_name: string;
  date_created: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
  created_by: string;
  description: string;
  qr_code?: string;
}

export default function DemoASTPage() {
  const [asts, setAsts] = useState<DemoAST[]>([]);
  const [filteredAsts, setFilteredAsts] = useState<DemoAST[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Données démo AST
  const DEMO_ASTS: DemoAST[] = [
    {
      id: 'ast-001',
      title: 'Travaux électriques - Sous-station principale',
      site_name: 'Complexe industriel Nord',
      date_created: '2024-08-20',
      status: 'approved',
      risk_level: 'high',
      participants: ['Jean Dupont', 'Sophie Martin', 'Marc Tremblay'],
      created_by: 'Sophie Martin',
      description: 'Maintenance préventive sur équipements haute tension',
      qr_code: 'QR-AST-001'
    },
    {
      id: 'ast-002',
      title: 'Espaces confinés - Inspection citerne',
      site_name: 'Terminal pétrolier Est',
      date_created: '2024-08-19',
      status: 'pending',
      risk_level: 'critical',
      participants: ['Caroline Leblanc', 'David Roy'],
      created_by: 'Marc Tremblay',
      description: 'Inspection annuelle citerne de stockage carburant',
      qr_code: 'QR-AST-002'
    },
    {
      id: 'ast-003',
      title: 'Travail en hauteur - Maintenance toiture',
      site_name: 'Entrepôt Central',
      date_created: '2024-08-18',
      status: 'approved',
      risk_level: 'medium',
      participants: ['Jean Dupont', 'Caroline Leblanc'],
      created_by: 'Jean Dupont',
      description: 'Réparation membrane étanchéité toiture',
      qr_code: 'QR-AST-003'
    },
    {
      id: 'ast-004',
      title: 'Manutention mécanique - Déplacement équipement',
      site_name: 'Usine de production',
      date_created: '2024-08-17',
      status: 'draft',
      risk_level: 'medium',
      participants: ['David Roy', 'Sophie Martin'],
      created_by: 'David Roy',
      description: 'Installation nouvelle ligne de production',
      qr_code: 'QR-AST-004'
    },
    {
      id: 'ast-005',
      title: 'Produits chimiques - Nettoyage industriel',
      site_name: 'Laboratoire qualité',
      date_created: '2024-08-16',
      status: 'rejected',
      risk_level: 'high',
      participants: ['Marc Tremblay'],
      created_by: 'Marc Tremblay',
      description: 'Décontamination équipements laboratoire',
      qr_code: 'QR-AST-005'
    }
  ];

  // Initialiser les données
  React.useEffect(() => {
    setAsts(DEMO_ASTS);
    setFilteredAsts(DEMO_ASTS);
  }, []);

  // Appliquer les filtres
  React.useEffect(() => {
    let filtered = asts;

    if (searchTerm) {
      filtered = filtered.filter(ast =>
        ast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ast.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ast.created_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ast.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ast => ast.status === statusFilter);
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(ast => ast.risk_level === riskFilter);
    }

    setFilteredAsts(filtered);
  }, [asts, searchTerm, statusFilter, riskFilter]);

  // Statistiques
  const stats = {
    total: asts.length,
    approved: asts.filter(ast => ast.status === 'approved').length,
    pending: asts.filter(ast => ast.status === 'pending').length,
    critical: asts.filter(ast => ast.risk_level === 'critical').length
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return risk;
    }
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
              <p className="text-sm font-medium text-blue-900">Mode Démo AST</p>
              <p className="text-xs text-blue-700">Analyses de Sécurité au Travail - Données temporaires</p>
            </div>
            <a 
              href="/demo"
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={48} 
                height={48}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analyses de Sécurité au Travail</h1>
                <p className="text-gray-600 mt-1">Système AST collaboratif inter-entreprises</p>
              </div>
            </div>
            <a 
              href="/demo/ast/nouveau"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle AST
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total AST</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Risque Critique</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoAction('Scanner QR AST')}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Scanner QR AST
            </button>
            <button
              onClick={() => handleDemoAction('AST Mobile')}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Smartphone className="h-5 w-5 mr-2" />
              AST Mobile
            </button>
            <button
              onClick={() => handleDemoAction('Rapport Conformité')}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Rapport Conformité
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder="Rechercher AST par titre, site, créateur..."
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
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="draft">Brouillon</option>
              <option value="rejected">Rejeté</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les risques</option>
              <option value="critical">Critique</option>
              <option value="high">Élevé</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </div>

        {/* AST List */}
        <div className="space-y-4">
          {filteredAsts.map((ast) => (
            <div key={ast.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {ast.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {ast.site_name}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {ast.participants.length} participant(s)
                      </div>
                      <div>
                        Créé le {new Date(ast.date_created).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(ast.status)}`}>
                      {getStatusLabel(ast.status)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeColor(ast.risk_level)}`}>
                      Risque {getRiskLabel(ast.risk_level)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {ast.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Créé par: {ast.created_by}</span>
                    {ast.qr_code && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <QrCode className="h-4 w-4 mr-1" />
                          {ast.qr_code}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDemoAction(`Voir AST ${ast.title}`)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </button>
                    <button
                      onClick={() => handleDemoAction(`Modifier AST ${ast.title}`)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                  </div>
                </div>

                {/* Participants */}
                {ast.participants.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Participants:</h4>
                    <div className="flex flex-wrap gap-1">
                      {ast.participants.map((participant, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAsts.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune AST trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
                ? 'Aucune AST ne correspond aux filtres sélectionnés.'
                : 'Commencez par créer votre première Analyse de Sécurité au Travail.'}
            </p>
            <a 
              href="/demo/ast/nouveau"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Nouvelle AST
            </a>
          </div>
        )}

        {/* Demo Features Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🚀 Fonctionnalités AST Complètes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📱 Mobile & QR Code</h4>
              <ul className="space-y-1 text-xs">
                <li>• Scanner QR pour accès rapide AST</li>
                <li>• Interface mobile optimisée</li>
                <li>• Mode offline avec synchronisation</li>
                <li>• Signatures électroniques</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔒 Sécurité & Conformité</h4>
              <ul className="space-y-1 text-xs">
                <li>• Conformité toutes provinces canadiennes</li>
                <li>• Chiffrement bout-en-bout</li>
                <li>• Audit trail complet PIPEDA</li>
                <li>• Partage sécurisé inter-entreprises</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}