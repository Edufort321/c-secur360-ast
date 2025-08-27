'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Crown,
  Users,
  Activity,
  Database,
  Settings,
  CheckCircle,
  DollarSign,
  Mail,
  BarChart3,
  Zap,
  Target,
  Menu,
  X,
  LogOut,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      id: 'ultimate-dashboard',
      title: 'Dashboard Principal',
      icon: <Crown className="w-5 h-5" />,
      path: '/admin/ultimate-dashboard',
      color: 'text-yellow-600'
    },
    {
      id: 'financial-dashboard',
      title: 'Finance Temps Réel',
      icon: <DollarSign className="w-5 h-5" />,
      path: '/admin/financial-dashboard',
      color: 'text-green-600'
    },
    {
      id: 'tenant-management',
      title: 'Gestion Clients',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/tenant-management',
      color: 'text-blue-600'
    },
    {
      id: 'marketing-automation',
      title: 'Marketing Auto',
      icon: <Zap className="w-5 h-5" />,
      path: '/admin/marketing-automation',
      color: 'text-purple-600'
    },
    {
      id: 'todo',
      title: 'Gestionnaire Tâches',
      icon: <CheckCircle className="w-5 h-5" />,
      path: '/admin/todo',
      color: 'text-teal-600'
    },
    {
      id: 'prospects',
      title: 'Prospection IA',
      icon: <Target className="w-5 h-5" />,
      path: '/admin/prospects',
      color: 'text-orange-600'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/admin/analytics',
      color: 'text-indigo-600'
    },
    {
      id: 'system',
      title: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/system',
      color: 'text-gray-600'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('c360_admin_token');
    localStorage.removeItem('c360_admin_email');
    router.push('/admin');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image 
              src="/c-secur360-logo.png" 
              alt="C-SECUR360" 
              width={32} 
              height={32}
              className="rounded-lg shadow-sm"
            />
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin</h1>
              <p className="text-xs text-gray-600">C-Secur360</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className={`${isActive(item.path) ? 'text-blue-600' : item.color}`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Eric Dufort</p>
              <p className="text-xs text-green-600">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={24} 
                height={24}
                className="rounded"
              />
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}