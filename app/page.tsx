'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Building, Users, Settings, ChevronRight, Globe, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [clientSubdomain, setClientSubdomain] = useState('');

  const handleClientAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientSubdomain.trim()) {
      window.location.href = `/${clientSubdomain.trim()}/dashboard`;
    } else {
      alert('Veuillez entrer le nom du client');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-Secur360 Logo" 
                width={150} 
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/admin"
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400
                          px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm font-medium
                          hover:bg-emerald-500/20 transition-colors backdrop-blur-sm
                          shadow-md shadow-emerald-500/10"
              >
                <Shield className="w-4 h-4" />
                <span className="text-white bg-slate-800/60 px-2 py-1 rounded backdrop-blur-sm">
                  Accès Admin
                </span>
              </Link>
              
              <Link 
                href="/demo/dashboard" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white
                          px-5 py-2 rounded-lg text-sm font-semibold
                          hover:from-blue-600 hover:to-blue-700 transition-all duration-200
                          shadow-lg shadow-blue-500/20 backdrop-blur-sm
                          border border-blue-400/20"
              >
                <span className="text-white bg-slate-800/60 px-2 py-1 rounded backdrop-blur-sm">
                  Démo Gratuite
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            C-Secur360
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Plateforme de gestion AST et ERP intégré
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Solution complète pour la gestion des analyses de sécurité au travail, 
            feuilles de temps, véhicules et facturation.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Principal */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Administrateur</h2>
                <p className="text-slate-300">Accès système principal</p>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8 text-slate-300">
              <li className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-blue-400" />
                Configuration système
              </li>
              <li className="flex items-center">
                <Users className="w-5 h-5 mr-3 text-blue-400" />
                Gestion des utilisateurs
              </li>
              <li className="flex items-center">
                <Building className="w-5 h-5 mr-3 text-blue-400" />
                Administration tenants
              </li>
            </ul>

            <Link
              href="/auth/admin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center group"
            >
              Se connecter
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Client Admin */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Entreprise</h2>
                <p className="text-slate-300">Accès client admin</p>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8 text-slate-300">
              <li className="flex items-center">
                <Shield className="w-5 h-5 mr-3 text-green-400" />
                Gestion AST
              </li>
              <li className="flex items-center">
                <Users className="w-5 h-5 mr-3 text-green-400" />
                Feuilles de temps
              </li>
              <li className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-green-400" />
                Configuration entreprise
              </li>
            </ul>

            <Link
              href="/auth/client"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center group"
            >
              Se connecter
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Client Access Section */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              Accès Client Personnalisé
            </h3>
            
            <form onSubmit={handleClientAccess} className="space-y-4">
              <input
                type="text"
                placeholder="Nom du client (ex: entrepriseabc)"
                value={clientSubdomain}
                onChange={(e) => setClientSubdomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Accéder au Portail Client
              </button>
            </form>
            
            <div className="mt-4 text-xs text-slate-400 text-center">
              <p>📱 URL personnalisée: csecur360.com/clientname</p>
              <p>🔗 Domaine custom: clientname.csecur360.ca</p>
            </div>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-white mb-6">Accès rapide démo</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/demo/dashboard"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg border border-white/20 transition-colors"
            >
              Démo Dashboard
            </Link>
            <Link 
              href="/demo/ast-form"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg border border-white/20 transition-colors"
            >
              Formulaire AST
            </Link>
            <Link 
              href="/pricing"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg border border-white/20 transition-colors"
            >
              Tarifs
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 bg-white/5">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-slate-400">
            © 2024 C-Secur360. Plateforme sécurisée avec authentification TOTP.
          </p>
        </div>
      </div>
    </div>
  );
}