'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getASTFormsByTenant } from '@/lib/supabase';
import { 
  Plus, FileText, Clock, User, MapPin, Calendar,
  Filter, Search, MoreVertical, Edit, Trash2, Eye
} from 'lucide-react';

export default function ASTDashboard() {
  const params = useParams();
  const router = useRouter();
  const tenant = params?.tenant as string;

  const [astForms, setAstForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Charger les AST du tenant
  useEffect(() => {
    const loadASTForms = async () => {
      try {
        setLoading(true);
        const forms = await getASTFormsByTenant(tenant);
        setAstForms(forms || []);
      } catch (err) {
        console.error('Erreur chargement AST:', err);
        setError('Erreur lors du chargement des AST');
      } finally {
        setLoading(false);
      }
    };

    if (tenant) {
      loadASTForms();
    }
  }, [tenant]);

  // Filtrer les AST
  const filteredForms = astForms.filter(form => {
    const matchesSearch = 
      form.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.project_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.work_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.ast_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    router.push(`/${tenant}/ast/nouveau`);
  };

  const handleViewAST = (astId: string) => {
    router.push(`/${tenant}/ast/${astId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'Brouillon', color: '#6b7280' },
      'in_progress': { label: 'En cours', color: '#f59e0b' },
      'completed': { label: 'Terminé', color: '#10b981' },
      'approved': { label: 'Approuvé', color: '#3b82f6' }
    } as any;
    
    const statusConfig = statusMap[status] || { label: status, color: '#6b7280' };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: statusConfig.color + '20',
        color: statusConfig.color,
        border: `1px solid ${statusConfig.color}40`
      }}>
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Chargement des AST...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-red-400 max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛡️ Analyses Sécuritaires (AST)</h1>
            <p className="text-slate-300">Gérez vos formulaires AST - Tenant: {tenant}</p>
          </div>
          
          <button
            onClick={handleCreateNew}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            <Plus size={20} />
            Nouvel AST
          </button>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par client, projet, localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="approved">Approuvé</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total AST</p>
                <p className="text-2xl font-bold">{astForms.length}</p>
              </div>
              <FileText className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">En cours</p>
                <p className="text-2xl font-bold">{astForms.filter(f => f.status === 'in_progress').length}</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Terminés</p>
                <p className="text-2xl font-bold">{astForms.filter(f => f.status === 'completed').length}</p>
              </div>
              <Calendar className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Brouillons</p>
                <p className="text-2xl font-bold">{astForms.filter(f => f.status === 'draft').length}</p>
              </div>
              <Edit className="text-gray-500" size={24} />
            </div>
          </div>
        </div>

        {/* AST List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          {filteredForms.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 text-slate-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Aucun AST trouvé</h3>
              <p className="text-slate-400 mb-6">
                {astForms.length === 0 
                  ? "Créez votre première analyse sécuritaire de travail"
                  : "Aucun AST ne correspond à vos critères de recherche"
                }
              </p>
              {astForms.length === 0 && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  Créer mon premier AST
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">AST #</th>
                    <th className="px-6 py-4 text-left font-semibold">Client</th>
                    <th className="px-6 py-4 text-left font-semibold">Localisation</th>
                    <th className="px-6 py-4 text-left font-semibold">Statut</th>
                    <th className="px-6 py-4 text-left font-semibold">Créé le</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredForms.map((form, index) => (
                    <tr key={form.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-400" />
                          <span className="font-mono text-sm">{form.ast_mdl_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{form.client_name || 'Sans nom'}</div>
                          <div className="text-sm text-slate-400">#{form.project_number || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-300">
                          <MapPin size={14} />
                          {form.work_location || 'Non spécifiée'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(form.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(form.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewAST(form.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
