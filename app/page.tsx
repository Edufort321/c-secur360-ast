'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, 
  Building, 
  Users, 
  Settings, 
  ChevronRight, 
  Globe, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Play,
  Eye,
  Zap,
  Lock,
  Clock,
  Car,
  DollarSign,
  BarChart3,
  FileText,
  QrCode,
  Smartphone,
  Headphones,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header avec logo repositionné */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo en haut à gauche */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Image 
                  src="/c-secur360-logo.png" 
                  alt="C-Secur360 Logo" 
                  width={150} 
                  height={40}
                  priority
                />
              </Link>
              <div className="hidden md:block text-white/80 text-sm">
                Plateforme AST & ERP Intégré
              </div>
            </div>

            {/* Navigation principale */}
            <nav className="hidden lg:flex items-center gap-8 text-white/80">
              <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
              <a href="#demo" className="hover:text-white transition-colors">Démo</a>
              <Link href="/login" className="hover:text-white transition-colors">Connexion Tenant</Link>
            </nav>

            {/* CTA Header */}
            <div className="flex items-center gap-3">
              <Link
                href="/demo"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                          px-4 py-2 rounded-lg text-sm font-semibold
                          hover:from-emerald-600 hover:to-emerald-700 transition-all
                          shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Essayer Gratuitement
              </Link>
              
              <Link
                href="/login"
                className="border border-white/30 text-white hover:bg-white/10
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Connexion Tenant
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Section Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="mb-6">
            <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
              🚀 Nouveau: Interface mobile + QR Code inventaire
            </span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            C-Secur360
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              AST & ERP Unifié
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            La seule plateforme qui combine <strong>gestion AST</strong>, <strong>feuilles de temps</strong>, 
            <strong>inventaire QR</strong> et <strong>facturation</strong> dans une solution sécurisée avec MFA obligatoire.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/demo"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                        px-8 py-4 rounded-xl text-lg font-semibold
                        hover:from-emerald-600 hover:to-emerald-700 transition-all
                        shadow-xl shadow-emerald-500/25 flex items-center gap-3"
            >
              <Eye className="w-5 h-5" />
              Voir la Démo Gratuite
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="#pricing"
              className="border border-white/30 text-white hover:bg-white/10
                        px-8 py-4 rounded-xl text-lg font-medium transition-all
                        flex items-center gap-3"
            >
              <BarChart3 className="w-5 h-5" />
              Voir les Plans
            </Link>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
            <div className="text-slate-400">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">ISO 27001</div>
            <div className="text-slate-400">Sécurité</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
            <div className="text-slate-400">Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">MFA</div>
            <div className="text-slate-400">Obligatoire</div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="features" className="bg-white/5 border-y border-white/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tout-en-un pour votre entreprise
            </h2>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto">
              Centralisez tous vos processus métier dans une seule plateforme sécurisée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AST */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyses AST</h3>
              <p className="text-slate-300 mb-4">
                Formulaires intelligents, évaluations risques, rapports conformité
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Templates personnalisables</li>
                <li>• Workflow d'approbation</li>
                <li>• Export PDF sécurisé</li>
              </ul>
            </div>

            {/* Temps & Présences */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Temps & Présences</h3>
              <p className="text-slate-300 mb-4">
                Timer mobile, géolocalisation, dépenses photo, validation
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• App mobile native</li>
                <li>• GPS tracking</li>
                <li>• Validation manageur</li>
              </ul>
            </div>

            {/* Inventaire QR */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Inventaire QR</h3>
              <p className="text-slate-300 mb-4">
                Scan QR, étiquettes Avery, tracking complet, vente en ligne
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Génération étiquettes PDF</li>
                <li>• Scan mobile optimisé</li>
                <li>• E-commerce intégré</li>
              </ul>
            </div>

            {/* Véhicules */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Flotte Véhicules</h3>
              <p className="text-slate-300 mb-4">
                Attribution, réservation, maintenance, kilomètres projet
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Planning réservations</li>
                <li>• Suivi maintenance</li>
                <li>• Coûts par projet</li>
              </ul>
            </div>

            {/* Facturation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Facturation Pro</h3>
              <p className="text-slate-300 mb-4">
                Stripe intégré, per-diem automatique, exports comptables
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Facturation automatique</li>
                <li>• Intégration comptable</li>
                <li>• Paiements en ligne</li>
              </ul>
            </div>

            {/* Sécurité */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sécurité Ultime</h3>
              <p className="text-slate-300 mb-4">
                MFA obligatoire, RBAC, audit trail, conformité ISO 27001
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Authentification 2FA</li>
                <li>• Chiffrement bout-en-bout</li>
                <li>• Audit complet</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section Modules Interactifs */}
      <section className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-900/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Explorez Nos Modules
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Découvrez en détail comment chaque module transforme votre gestion d'entreprise
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Onglets de navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-8" id="module-tabs">
              <button
                className="module-tab px-6 py-3 rounded-lg font-semibold transition-all bg-emerald-500 text-white"
                data-module="ast"
              >
                <Shield className="w-5 h-5 mr-2 inline" />
                AST & Sécurité
              </button>
              <button
                className="module-tab px-6 py-3 rounded-lg font-semibold transition-all bg-slate-600 hover:bg-slate-500 text-white"
                data-module="timesheet"
              >
                <Clock className="w-5 h-5 mr-2 inline" />
                Feuilles de Temps
              </button>
              <button
                className="module-tab px-6 py-3 rounded-lg font-semibold transition-all bg-slate-600 hover:bg-slate-500 text-white"
                data-module="inventory"
              >
                <QrCode className="w-5 h-5 mr-2 inline" />
                Inventaire QR
              </button>
              <button
                className="module-tab px-6 py-3 rounded-lg font-semibold transition-all bg-slate-600 hover:bg-slate-500 text-white"
                data-module="vehicles"
              >
                <Car className="w-5 h-5 mr-2 inline" />
                Véhicules
              </button>
              <button
                className="module-tab px-6 py-3 rounded-lg font-semibold transition-all bg-slate-600 hover:bg-slate-500 text-white"
                data-module="billing"
              >
                <DollarSign className="w-5 h-5 mr-2 inline" />
                Facturation
              </button>
            </div>

            {/* Contenu des modules */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              
              {/* Module AST */}
              <div id="module-ast" className="module-content">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                      <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Module AST & Sécurité</h3>
                    <p className="text-slate-300 text-lg mb-6">
                      Système complet de gestion des Analyses de Sécurité au Travail (AST) 
                      conforme aux normes de toutes les provinces canadiennes.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Conformité Multi-Provinciale</h4>
                          <p className="text-slate-400 text-sm">Support QC, ON, AB, BC et toutes provinces</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Scan QR Mobile</h4>
                          <p className="text-slate-400 text-sm">Accès rapide AST via QR codes sur mobile</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Identité Fédérée</h4>
                          <p className="text-slate-400 text-sm">Partage sécurisé entre entreprises</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-white mb-4">Fonctionnalités Clés</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Création AST guidée avec modèles</li>
                      <li>• Signatures électroniques légales</li>
                      <li>• Notifications automatiques SMS/Email</li>
                      <li>• Rapports conformité temps réel</li>
                      <li>• Audit trail complet PIPEDA</li>
                      <li>• Multi-sites et multi-clients</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <span className="text-emerald-400 font-semibold">📄 Documentation disponible</span>
                      <p className="text-sm text-slate-400 mt-1">Guide complet + support PowerPoint</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href="/docs/module-ast-presentation.md"
                          target="_blank"
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          📋 Guide PDF
                        </a>
                        <button
                          onClick={() => window.open('mailto:sales@c-secur360.ca?subject=Demande PowerPoint AST&body=Bonjour, je souhaiterais recevoir la présentation PowerPoint du module AST.')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          🎯 PowerPoint
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Timesheet (caché par défaut) */}
              <div id="module-timesheet" className="module-content hidden">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                      <Clock className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Feuilles de Temps Mobiles</h3>
                    <p className="text-slate-300 text-lg mb-6">
                      Application mobile complète avec timer, géolocalisation et capture automatique 
                      des dépenses par photo.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Timer Intelligent</h4>
                          <p className="text-slate-400 text-sm">Start/pause/stop avec détection pauses</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Géolocalisation GPS</h4>
                          <p className="text-slate-400 text-sm">Tracking automatique avec km projet</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Dépenses Photo</h4>
                          <p className="text-slate-400 text-sm">Scan reçus instantané avec OCR</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-white mb-4">Fonctionnalités Avancées</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Mode offline avec sync automatique</li>
                      <li>• Planification Gantt intégrée</li>
                      <li>• Validation manager en temps réel</li>
                      <li>• Facturation automatique client</li>
                      <li>• Per-diem règles configurables</li>
                      <li>• Exports Excel/PDF personnalisés</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <span className="text-blue-400 font-semibold">📱 Applications Mobile</span>
                      <p className="text-sm text-slate-400 mt-1">iOS & Android + PWA web</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href="/docs/module-timesheet-guide.md"
                          target="_blank"
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          📋 Guide Complet
                        </a>
                        <button
                          onClick={() => window.open('mailto:sales@c-secur360.ca?subject=Demande PowerPoint Timesheet&body=Bonjour, je souhaiterais recevoir la présentation PowerPoint du module Feuilles de Temps.')}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          🎯 PowerPoint
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Inventaire (caché par défaut) */}
              <div id="module-inventory" className="module-content hidden">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                      <QrCode className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Inventaire QR Intelligent</h3>
                    <p className="text-slate-300 text-lg mb-6">
                      Solution QR-first avec impression étiquettes Avery, e-commerce intégré 
                      et vente en ligne automatisée.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Étiquettes Avery</h4>
                          <p className="text-slate-400 text-sm">Impression PDF format Avery 5160/5161</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">E-commerce Intégré</h4>
                          <p className="text-slate-400 text-sm">Vente publique avec Stripe automatique</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Scan Mobile</h4>
                          <p className="text-slate-400 text-sm">Interface optimisée caméra mobile</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-white mb-4">Système Complet</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Génération QR codes automatique</li>
                      <li>• Stock temps réel multi-sites</li>
                      <li>• Commandes auto si seuil minimal</li>
                      <li>• Historique mouvements complet</li>
                      <li>• Photos produits haute qualité</li>
                      <li>• Catégories et attributs flexibles</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <span className="text-emerald-400 font-semibold">🏪 Vente en Ligne</span>
                      <p className="text-sm text-slate-400 mt-1">Boutique publique + B2B privée</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href="/docs/module-inventory-qr.md"
                          target="_blank"
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          📋 Guide QR
                        </a>
                        <button
                          onClick={() => window.open('mailto:sales@c-secur360.ca?subject=Demande PowerPoint Inventaire QR&body=Bonjour, je souhaiterais recevoir la présentation PowerPoint du module Inventaire QR.')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          🎯 PowerPoint
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Véhicules (caché par défaut) */}
              <div id="module-vehicles" className="module-content hidden">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                      <Car className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Gestion Flotte Véhicules</h3>
                    <p className="text-slate-300 text-lg mb-6">
                      Attribution véhicules par projet, réservation intelligente, maintenance 
                      préventive et coûts kilomètres automatiques.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Réservation Intelligente</h4>
                          <p className="text-slate-400 text-sm">Planning automatique selon projets</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Kilomètres Projet</h4>
                          <p className="text-slate-400 text-sm">Tracking GPS intégré feuilles temps</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Maintenance Préventive</h4>
                          <p className="text-slate-400 text-sm">Alertes automatiques selon usage</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-white mb-4">Fonctionnalités Pro</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Attribution employés par période</li>
                      <li>• Coûts carburant temps réel</li>
                      <li>• Planificateur maintenance</li>
                      <li>• Assurances et documents</li>
                      <li>• Rapports utilisation détaillés</li>
                      <li>• Intégration comptabilité</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <span className="text-purple-400 font-semibold">🚗 Flotte Complète</span>
                      <p className="text-sm text-slate-400 mt-1">Voitures, camions, équipements mobiles</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href="/docs/module-vehicles-fleet.md"
                          target="_blank"
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          📋 Guide Flotte
                        </a>
                        <button
                          onClick={() => window.open('mailto:sales@c-secur360.ca?subject=Demande PowerPoint Véhicules&body=Bonjour, je souhaiterais recevoir la présentation PowerPoint du module Gestion Véhicules.')}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          🎯 PowerPoint
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Facturation (caché par défaut) */}
              <div id="module-billing" className="module-content hidden">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                      <DollarSign className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Facturation Professionnelle</h3>
                    <p className="text-slate-300 text-lg mb-6">
                      Système complet intégré Stripe avec per-diem automatique, codes facturation 
                      et exports comptables professionnels.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Stripe Intégré</h4>
                          <p className="text-slate-400 text-sm">Paiements automatiques en ligne</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Per-Diem Automatique</h4>
                          <p className="text-slate-400 text-sm">Règles configurables par client</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Codes Facturation</h4>
                          <p className="text-slate-400 text-sm">Classification automatique tâches</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-white mb-4">Automatisation Complète</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Facturation temps réel depuis timesheet</li>
                      <li>• Approbations e-mail automatiques</li>
                      <li>• Exports Excel/CSV/PDF/QuickBooks</li>
                      <li>• Relances paiement automatiques</li>
                      <li>• TPS/TVQ calculs automatiques</li>
                      <li>• Dashboard financier temps réel</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <span className="text-orange-400 font-semibold">💼 Intégration ERP</span>
                      <p className="text-sm text-slate-400 mt-1">SAP, Oracle, QuickBooks, Sage</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href="/docs/module-billing-pro.md"
                          target="_blank"
                          className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          📋 Guide Facturation
                        </a>
                        <button
                          onClick={() => window.open('mailto:sales@c-secur360.ca?subject=Demande PowerPoint Facturation&body=Bonjour, je souhaiterais recevoir la présentation PowerPoint du module Facturation Pro.')}
                          className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-3 py-1 rounded text-xs transition-all"
                        >
                          🎯 PowerPoint
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Demo */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-500/10 to-blue-500/10 
                         backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                🚀 Testez Maintenant - 100% Gratuit
              </h2>
              <p className="text-slate-300 text-lg">
                Explorez toutes les fonctionnalités sans limitation dans notre environnement de démonstration
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Link
                href="/demo"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Dashboard Global</h3>
                <p className="text-slate-300 text-sm mb-3">Interface complète avec tous les modules</p>
                <div className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                  Découvrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/demo/ast-forms"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Formulaires AST</h3>
                <p className="text-slate-300 text-sm mb-3">Templates et workflow d'analyses</p>
                <div className="text-blue-400 text-sm font-medium flex items-center gap-2">
                  Tester <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/demo/mobile"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">App Mobile</h3>
                <p className="text-slate-300 text-sm mb-3">Timer, dépenses photo, QR scan</p>
                <div className="text-purple-400 text-sm font-medium flex items-center gap-2">
                  Ouvrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/demo"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                          px-12 py-4 rounded-xl text-xl font-semibold
                          hover:from-emerald-600 hover:to-emerald-700 transition-all
                          shadow-xl shadow-emerald-500/25 inline-flex items-center gap-3"
              >
                <Play className="w-6 h-6" />
                Lancer la Démo Complète
                <Zap className="w-5 h-5" />
              </Link>
              <p className="text-slate-400 text-sm mt-3">
                ✨ Données temporaires • 🔒 Aucune sauvegarde • 📧 Contact après 5 min
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Plans & Tarifs RÉELS */}
      <section id="pricing" className="bg-white/5 border-y border-white/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tarification C-Secur360
            </h2>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto">
              <strong>Un seul plan. Toutes les fonctionnalités.</strong><br />
              Solution complète pour toutes les entreprises canadiennes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Plan Principal - VRAIS PRIX */}
            <div className="bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm 
                           rounded-2xl p-8 border-2 border-emerald-400/30 hover:border-emerald-400/50 
                           transition-all transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white 
                               px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  PLAN RECOMMANDÉ
                </span>
              </div>
              
              <div className="text-center mb-6">
                <Building className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">C-Secur360 Complet</h3>
                <p className="text-slate-300">Solution tout inclus pour toutes les entreprises</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-emerald-400 mb-2">
                  250<span className="text-2xl text-slate-300">$/mois</span>
                </div>
                <div className="text-emerald-300 font-medium mb-2">ou</div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">
                  3000<span className="text-xl text-slate-300">$/année</span>
                </div>
                <div className="text-sm text-emerald-300 bg-emerald-500/20 rounded-full px-3 py-1 inline-block">
                  💰 Économisez 1000$ avec le plan annuel
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-4 text-center">Tout inclus:</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <Users className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Utilisateurs illimités</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <Shield className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">AST illimités + conformité provinces</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <Clock className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Feuilles temps + app mobile</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <QrCode className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Inventaire QR + étiquettes</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <Car className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Gestion flotte véhicules</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <DollarSign className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Facturation Stripe intégrée</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <Headphones className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Support téléphonique prioritaire</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <Lock className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">MFA + SSO + audit complet</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-white mb-2">Sites additionnels</h4>
                <p className="text-sm text-emerald-300">
                  📍 Site principal inclus<br />
                  📍 Sites additionnels: <strong>+50$/mois</strong> ou <strong>+600$/année</strong>
                </p>
              </div>

              <button
                onClick={() => window.location.href = '/register?plan=professional'}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
                         hover:from-emerald-600 hover:to-emerald-700 py-4 rounded-xl 
                         font-semibold transition-all shadow-lg text-lg flex items-center justify-center gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-emerald-300 mt-3">
                ✨ Essai gratuit 14 jours - Aucune carte requise
              </p>
            </div>

            {/* Plan Entreprise - VRAIS PRIX */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Solution Entreprise</h3>
                <p className="text-slate-300">Pour grandes organisations avec besoins spécifiques</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-slate-300 mb-2">Sur demande</div>
                <p className="text-slate-400">Tarification personnalisée selon besoins</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-4 text-center">Plan Complet +</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Intégration ERP sur mesure (SAP, Oracle, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Support technique dédié 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Formation personnalisée sur site</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Développement fonctionnalités spécifiques</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Architecture dédiée et sécurisée</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">SLA personnalisé avec garanties</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Migration données assistée</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => window.open('https://calendly.com/c-secur360/demo', '_blank')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                         hover:from-purple-700 hover:to-indigo-700 py-4 rounded-xl 
                         font-semibold transition-all shadow-lg text-lg flex items-center justify-center gap-2"
              >
                Demander une démo
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-slate-400 mt-3">
                💼 Contactez notre équipe commerciale
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 mb-4">
              🔒 Données chiffrées • 📊 Conformité PIPEDA • 🛡️ ISO 27001 • 🇨🇦 Toutes provinces
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
              <span>💳 Paiement: Cartes de crédit • Virement PAD/ACSS</span>
            </div>
            <Link 
              href="/demo" 
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-center gap-2"
            >
              Tester gratuitement avant d'acheter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section Contact & Support */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Prêt à transformer votre gestion d'entreprise ?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Rejoignez des centaines d'entreprises qui font confiance à C-Secur360
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/demo"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                          px-8 py-4 rounded-xl text-lg font-semibold
                          hover:from-emerald-600 hover:to-emerald-700 transition-all
                          shadow-xl shadow-emerald-500/25 flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Essayer Maintenant
              </Link>
              
              <a
                href="mailto:info@c-secur360.ca"
                className="border border-white/30 text-white hover:bg-white/10
                          px-8 py-4 rounded-xl text-lg font-medium transition-all
                          flex items-center gap-3"
              >
                <Headphones className="w-5 h-5" />
                Nous Contacter
              </a>
            </div>

            <div className="flex items-center justify-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Configuration gratuite
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Formation incluse
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Migration assistée
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/5">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/">
                <Image 
                  src="/c-secur360-logo.png" 
                  alt="C-Secur360" 
                  width={150} 
                  height={40}
                  className="h-10 w-auto mb-4"
                  priority
                />
              </Link>
              <p className="text-slate-400 text-sm">
                La plateforme AST & ERP la plus sécurisée du marché canadien.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
                <li><Link href="/demo" className="hover:text-white">Démo</Link></li>
                <li><a href="#pricing" className="hover:text-white">Tarifs</a></li>
                <li><Link href="/login" className="hover:text-white">Connexion</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="mailto:info@c-secur360.ca" className="hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white">Confidentialité</a></li>
                <li><a href="/terms" className="hover:text-white">Conditions</a></li>
                <li><a href="/security" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="mailto:support@c-secur360.ca" className="hover:text-white">Aide</a></li>
                <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                <li><a href="/status" className="hover:text-white">Statut</a></li>
                <li><a href="tel:+15145551234" className="hover:text-white">Urgence 24/7</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 C-Secur360. Tous droits réservés. 🇨🇦 Fièrement canadien.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Certifications:</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">ISO 27001</span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">SOC 2</span>
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">PIPEDA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Script pour les onglets interactifs */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Attendre le DOM
            document.addEventListener('DOMContentLoaded', function() {
              const tabs = document.querySelectorAll('.module-tab');
              const contents = document.querySelectorAll('.module-content');
              
              // Fonction pour changer d'onglet
              function switchTab(targetModule) {
                // Désactiver tous les onglets
                tabs.forEach(tab => {
                  tab.classList.remove('bg-emerald-500');
                  tab.classList.add('bg-slate-600', 'hover:bg-slate-500');
                });
                
                // Cacher tous les contenus
                contents.forEach(content => {
                  content.classList.add('hidden');
                });
                
                // Activer l'onglet sélectionné
                const activeTab = document.querySelector('[data-module="' + targetModule + '"]');
                if (activeTab) {
                  activeTab.classList.add('bg-emerald-500');
                  activeTab.classList.remove('bg-slate-600', 'hover:bg-slate-500');
                }
                
                // Afficher le contenu correspondant
                const activeContent = document.getElementById('module-' + targetModule);
                if (activeContent) {
                  activeContent.classList.remove('hidden');
                }
              }
              
              // Ajouter les event listeners
              tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                  const targetModule = this.getAttribute('data-module');
                  switchTab(targetModule);
                });
              });
              
              // Auto-rotation des onglets (toutes les 8 secondes)
              const modules = ['ast', 'timesheet', 'inventory', 'vehicles', 'billing'];
              let currentIndex = 0;
              
              setInterval(() => {
                currentIndex = (currentIndex + 1) % modules.length;
                switchTab(modules[currentIndex]);
              }, 8000);
              
              console.log('🎯 Onglets modules interactifs activés');
            });
          `
        }}
      />
    </div>
  );
}