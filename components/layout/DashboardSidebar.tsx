'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  AlertTriangle,
  Shield,
  Users,
  Building,
  BarChart3,
  Settings,
  MapPin,
  Target,
  DollarSign,
  Calendar,
  BookOpen,
  HelpCircle,
  PlusCircle,
  Activity,
  ClipboardList,
  Wrench
} from 'lucide-react';
import { useTheme } from './UniversalLayout';

interface MenuItem {
  id: string;
  label: { fr: string; en: string };
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: { fr: string; en: string };
  children?: MenuItem[];
}

interface DashboardSidebarProps {
  tenant: string;
  userRole?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ tenant, userRole = 'user' }) => {
  const pathname = usePathname();
  const { isDark, language } = useTheme();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: { fr: 'Tableau de bord', en: 'Dashboard' },
      href: `/${tenant}/dashboard`,
      icon: Home,
      description: { fr: 'Vue d\'ensemble de vos activités', en: 'Overview of your activities' }
    },
    {
      id: 'ast',
      label: { fr: 'Analyses AST', en: 'JSA Analysis' },
      href: `/${tenant}/ast`,
      icon: FileText,
      description: { fr: 'Gestion des analyses sécuritaires', en: 'Safety analysis management' },
      children: [
        {
          id: 'ast-new',
          label: { fr: 'Nouvelle AST', en: 'New JSA' },
          href: `/${tenant}/ast/nouveau`,
          icon: PlusCircle,
          description: { fr: 'Créer une nouvelle analyse', en: 'Create new analysis' }
        },
        {
          id: 'ast-list',
          label: { fr: 'Liste des AST', en: 'JSA List' },
          href: `/${tenant}/ast/liste`,
          icon: ClipboardList,
          description: { fr: 'Consulter toutes vos analyses', en: 'View all your analyses' }
        }
      ]
    },
    {
      id: 'accidents',
      label: { fr: 'Déclarations', en: 'Incident Reports' },
      href: `/${tenant}/accidents`,
      icon: AlertTriangle,
      description: { fr: 'Déclarations d\'accidents conformes', en: 'Compliant incident reports' }
    },
    {
      id: 'permits',
      label: { fr: 'Permis de travail', en: 'Work Permits' },
      href: `/${tenant}/permits`,
      icon: Shield,
      description: { fr: 'Gestion des permis et autorisations', en: 'Permits and authorizations management' }
    },
    {
      id: 'equipment',
      label: { fr: 'Équipements', en: 'Equipment' },
      href: `/${tenant}/equipment`,
      icon: Wrench,
      description: { fr: 'Inventaire et maintenance', en: 'Inventory and maintenance' }
    },
    {
      id: 'sites',
      label: { fr: 'Multi-Sites', en: 'Multi-Sites' },
      href: `/${tenant}/sites`,
      icon: MapPin,
      description: { fr: 'Gestion de plusieurs emplacements', en: 'Multiple locations management' }
    },
    {
      id: 'team',
      label: { fr: 'Équipe', en: 'Team' },
      href: `/${tenant}/team`,
      icon: Users,
      description: { fr: 'Gestion des utilisateurs', en: 'User management' }
    },
    {
      id: 'reports',
      label: { fr: 'Rapports', en: 'Reports' },
      href: `/${tenant}/reports`,
      icon: BarChart3,
      description: { fr: 'Analytics et statistiques', en: 'Analytics and statistics' }
    },
    {
      id: 'improvements',
      label: { fr: 'Améliorations', en: 'Improvements' },
      href: `/${tenant}/improvements`,
      icon: Target,
      description: { fr: 'Suggestions d\'amélioration', en: 'Improvement suggestions' }
    }
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: 'billing',
      label: { fr: 'Facturation', en: 'Billing' },
      href: `/${tenant}/billing`,
      icon: DollarSign,
      description: { fr: 'Gestion de votre abonnement', en: 'Subscription management' }
    },
    {
      id: 'settings',
      label: { fr: 'Paramètres', en: 'Settings' },
      href: `/${tenant}/settings`,
      icon: Settings,
      description: { fr: 'Configuration de votre espace', en: 'Workspace configuration' }
    },
    {
      id: 'help',
      label: { fr: 'Aide', en: 'Help' },
      href: `/${tenant}/help`,
      icon: HelpCircle,
      description: { fr: 'Support et documentation', en: 'Support and documentation' }
    }
  ];

  const isActive = (href: string) => {
    if (href === `/${tenant}/dashboard`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    
    return (
      <div key={item.id}>
        <Link
          href={item.href}
          className={`group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
            depth > 0 ? 'ml-6' : ''
          } ${
            active
              ? isDark
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-500 text-white shadow-md'
              : isDark
                ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Icon className={`w-5 h-5 mr-3 transition-colors ${
            active 
              ? 'text-white' 
              : isDark 
                ? 'text-slate-400 group-hover:text-white' 
                : 'text-slate-400 group-hover:text-slate-600'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {item.label[language]}
            </p>
            {item.description && !active && depth === 0 && (
              <p className={`text-xs truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {item.description[language]}
              </p>
            )}
          </div>
          {item.badge && (
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              active
                ? 'bg-white/20 text-white'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {item.badge}
            </span>
          )}
        </Link>
        
        {item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation principale */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>

      {/* Actions rapides */}
      <div className={`p-4 border-t ${
        isDark ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className={`p-3 rounded-lg ${
          isDark ? 'bg-slate-700' : 'bg-blue-50'
        }`}>
          <div className="flex items-center">
            <PlusCircle className={`w-5 h-5 mr-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <span className={`text-sm font-medium ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}>
              {language === 'fr' ? 'Actions rapides' : 'Quick actions'}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <Link
              href={`/${tenant}/ast/nouveau`}
              className={`flex items-center text-sm ${
                isDark 
                  ? 'text-slate-300 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              } transition-colors`}
            >
              <FileText className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Nouvelle AST' : 'New JSA'}
            </Link>
            <Link
              href={`/${tenant}/accidents`}
              className={`flex items-center text-sm ${
                isDark 
                  ? 'text-slate-300 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              } transition-colors`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Déclarer accident' : 'Report incident'}
            </Link>
          </div>
        </div>
      </div>

      {/* Menu du bas */}
      <div className={`p-4 border-t ${
        isDark ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <nav className="space-y-1">
          {bottomMenuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>

      {/* Footer avec info client */}
      <div className={`p-4 border-t ${
        isDark ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className={`text-center text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <p className="font-medium mb-1">C-SECUR360</p>
          <p>{tenant.charAt(0).toUpperCase() + tenant.slice(1)}</p>
          <p className="mt-2 opacity-75">© 2024 CERDIA</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;