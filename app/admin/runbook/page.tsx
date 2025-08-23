"use client";

import { useEffect, useState } from "react";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Server,
  Database,
  Zap,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface SystemStatus {
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical' | 'error';
  summary: {
    total: number;
    present: number;
    missing: number;
  };
  env: Record<string, boolean>;
  appUrl: string | null;
  deployment?: {
    platform: string;
    region: string;
    git: {
      sha: string;
      branch: string;
    };
  };
  error?: string;
}

export default function RunbookPage() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/system/status");
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch system status:", error);
      setData({
        timestamp: new Date().toISOString(),
        status: 'error',
        summary: { total: 0, present: 0, missing: 0 },
        env: {},
        appUrl: null,
        error: "Failed to fetch status"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (!data && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Chargement du statut système...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Carnet de bord — C-Secur360
                </h1>
                <p className="text-gray-600 mt-1">
                  Surveillance système et monitoring en temps réel
                </p>
              </div>
            </div>
            
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Status Overview */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl border-2 ${getStatusColor(data.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(data.status)}
                <div>
                  <p className="text-sm font-medium opacity-75">Statut Système</p>
                  <p className="text-xl font-bold capitalize">{data.status}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Variables OK</p>
                  <p className="text-xl font-bold">{data.summary.present}/{data.summary.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Dernier check</p>
                  <p className="text-sm font-bold">
                    {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Déploiement</p>
                  <p className="text-sm font-bold">
                    {data.deployment?.platform || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables Grid */}
        {data && data.env && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Variables d'environnement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.env).map(([key, present]) => (
                <div 
                  key={key} 
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    present 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-800 truncate flex-1 mr-2">
                      {key}
                    </code>
                    <div className="flex items-center gap-1">
                      {present ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-xs font-semibold ${
                        present ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {present ? 'présent' : 'absent'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App Info */}
        {data && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations de déploiement
            </h2>
            
            <div className="space-y-4">
              {data.appUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 w-24">App URL:</span>
                  <a 
                    href={data.appUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                  >
                    {data.appUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              
              {data.deployment && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Région:</span>
                    <span className="text-sm">{data.deployment.region}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Git SHA:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {data.deployment.git.sha}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Branche:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {data.deployment.git.branch}
                    </code>
                  </div>
                </>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 w-24">Timestamp:</span>
                <span className="text-sm">{new Date(data.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {data?.error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-bold text-red-800">Erreur système</h3>
                <p className="text-red-700 mt-1">{data.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}