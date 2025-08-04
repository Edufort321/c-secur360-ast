// index.tsx - VERSION SANS SAFETYMANAGER pour test
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, RotateCcw, Download, Upload, Share2, QrCode, FileText, Save, Settings, Menu, X, ChevronRight, ChevronDown, ArrowLeft, ArrowRight, Plus, Trash2, Edit3, Eye, EyeOff, Calendar, User, Building, Phone, Mail, Shield, AlertCircle, Check, Info, Warning, Zap, Globe, Wifi, WifiOff, Volume2, VolumeX, Sun, Moon, Monitor, Smartphone, Tablet, Laptop, Printer, Camera as CameraIcon, Mic, MicOff, Video, VideoOff, Lock, Unlock, Key, Search, Filter, SortAsc, SortDesc, RefreshCw, MoreHorizontal, MoreVertical, ExternalLink, Copy, Clipboard, PenTool, Sliders, BarChart3, PieChart, TrendingUp, Target, Award, BookOpen, HelpCircle, MessageCircle, Bell, BellOff, Heart, Star, Bookmark, Flag, Tag, Folder, FolderOpen, File, FileCheck, FileX, FilePlus, Archive, Trash, RotateCcw as Reset, Maximize, Minimize, ZoomIn, ZoomOut, Move, CornerDownLeft, CornerDownRight } from 'lucide-react';

// Import des composants (sans SafetyManager)
import SiteInformation from './SiteInformation';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';
import RescuePlan from './RescuePlan';
import PermitManager from './PermitManager';

// =================== TYPES LOCAUX SIMPLIFIÉS ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type Language = 'fr' | 'en';
type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

// État local simplifié (sans SafetyManager)
interface LocalPermitData {
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  created_at: string;
  updated_at: string;
  
  // Données basiques pour compatibilité
  siteInformation: any;
  atmosphericTesting: any;
  entryRegistry: any;
  rescuePlan: any;
  validation: {
    percentage: number;
    errors: string[];
  };
}

interface ConfinedSpaceProps {
  language?: Language;
  selectedProvince?: ProvinceCode;
  isMobile?: boolean;
  regulations?: Record<ProvinceCode, any>;
  styles?: any;
}

// =================== COMPOSANT PRINCIPAL SANS SAFETYMANAGER ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  language = 'fr',
  selectedProvince = 'QC',
  isMobile = false,
  regulations = {},
  styles = {}
}) => {
  // ✅ ÉTAT LOCAL SIMPLE (sans SafetyManager)
  const [permitData, setPermitData] = useState<LocalPermitData>({
    permit_number: `CS-${selectedProvince}-${Date.now()}`,
    status: 'draft',
    province: selectedProvince,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    siteInformation: {},
    atmosphericTesting: { readings: [] },
    entryRegistry: { personnel: [] },
    rescuePlan: { emergencyContacts: [] },
    validation: { percentage: 0, errors: [] }
  });

  const [activeTab, setActiveTab] = useState('site');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // ✅ FONCTIONS LOCALES SIMPLIFIÉES
  const updateSection = useCallback((section: string, data: any) => {
    console.log(`🔄 Local update ${section}:`, data);
    
    setPermitData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof LocalPermitData], ...data },
      updated_at: new Date().toISOString()
    }));
    
    // Simulation auto-save local
    setTimeout(() => {
      setLastSaved(new Date().toISOString());
      console.log('💾 Local save completed');
    }, 1000);
  }, []);

  const calculateProgress = useCallback(() => {
    const sections = ['siteInformation', 'atmosphericTesting', 'entryRegistry', 'rescuePlan'];
    let completed = 0;
    
    sections.forEach(section => {
      const data = permitData[section as keyof LocalPermitData];
      if (data && Object.keys(data).length > 0) {
        completed++;
      }
    });
    
    return Math.round((completed / sections.length) * 100);
  }, [permitData]);

  // ✅ PROPS COMPATIBLES POUR LES COMPOSANTS
  const commonProps = {
    language,
    permitData,
    selectedProvince,
    regulations,
    isMobile,
    styles,
    // PAS de safetyManager - les composants vont utiliser leur état local
    updateParentData: (field: string, value: any) => updateSection(activeTab, { [field]: value }),
    onDataChange: (field: string, value: any) => updateSection(activeTab, { [field]: value }),
    updatePermitData: (data: any) => updateSection(activeTab, data)
  };

  // =================== INTERFACE ===================
  const tabs = [
    { id: 'site', label: 'Site', icon: Building, component: SiteInformation },
    { id: 'atmospheric', label: 'Tests', icon: Wind, component: AtmosphericTesting },
    { id: 'registry', label: 'Personnel', icon: Users, component: EntryRegistry },
    { id: 'rescue', label: 'Sauvetage', icon: Shield, component: RescuePlan },
    { id: 'permit', label: 'Permis', icon: FileText, component: PermitManager }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab?.component;

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white">
              🧪 TEST SANS SAFETYMANAGER
            </h1>
            <p className="text-sm text-slate-400">
              Permis: {permitData.permit_number} | Progression: {progress}%
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="text-sm text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Sauvé: {new Date(lastSaved).toLocaleTimeString()}
              </div>
            )}
            
            <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
              Mode Local Uniquement
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-400 bg-slate-700/50'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {CurrentComponent && (
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <Info className="w-4 h-4" />
                <span className="font-medium">Mode Test Local</span>
              </div>
              <p className="text-sm text-yellow-300 mt-1">
                SafetyManager désactivé. Les données sont stockées localement uniquement.
                {activeTab === 'permit' && ' (Fonctionnalités de permis limitées)'}
              </p>
            </div>
            
            <CurrentComponent {...commonProps} />
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Mode Local Actif</span>
        </div>
        <div className="text-slate-400 mt-1">
          Sections complétées: {Math.floor(progress/25)}/4
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpace;
