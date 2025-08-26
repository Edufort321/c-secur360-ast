'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Building,
  Lock,
  User,
  AlertCircle,
  Home
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tenantId: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation basique
      if (!formData.tenantId || !formData.email || !formData.password) {
        setError('Tous les champs sont requis');
        return;
      }

      // Simulation de connexion - redirection vers admin avec le tenant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirection vers le dashboard admin du tenant
      router.push(`/admin?tenant=${formData.tenantId}`);
      
    } catch (err) {
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <Image 
              src="/c-secur360-logo.png" 
              alt="C-Secur360 Logo" 
              width={150} 
              height={40}
              className="h-12 w-auto"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Connexion Tenant
          </h1>
          <p className="text-slate-300">
            Accédez à votre environnement C-SECUR360
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tenant ID */}
            <div>
              <label htmlFor="tenantId" className="block text-sm font-medium text-white mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                ID Tenant
              </label>
              <input
                id="tenantId"
                type="text"
                value={formData.tenantId}
                onChange={(e) => handleChange('tenantId', e.target.value)}
                placeholder="Ex: mon-entreprise"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg 
                          text-white placeholder-white/60 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="utilisateur@entreprise.com"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg 
                          text-white placeholder-white/60 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg 
                            text-white placeholder-white/60 focus:outline-none focus:ring-2 
                            focus:ring-blue-500 focus:border-blue-500 pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/20 
                            border border-red-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                        px-6 py-3 rounded-lg font-semibold
                        hover:from-emerald-600 hover:to-emerald-700 transition-all
                        shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Liens utiles */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="text-center space-y-3">
              <Link
                href="/demo"
                className="block text-blue-300 hover:text-blue-200 text-sm font-medium"
              >
                🎯 Tester la démo sans compte
              </Link>
              
              <div className="text-xs text-white/60">
                <p>Nouveau client ? Contactez-nous pour votre tenant:</p>
                <a 
                  href="mailto:info@c-secur360.ca" 
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  info@c-secur360.ca
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/60 hover:text-white text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Info sécurité */}
        <div className="mt-8 text-center text-xs text-white/40">
          <p>🔒 Connexion sécurisée avec chiffrement SSL</p>
          <p>🇨🇦 Données hébergées au Canada - Conformité PIPEDA</p>
        </div>
      </div>
    </div>
  );
}