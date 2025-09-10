'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import UniversalLayout from '../../../components/layout/UniversalLayout';
import DashboardSidebar from '../../../components/layout/DashboardSidebar';
import PlanificateurTravaux from '../../../components/planificateur/PlanificateurTravaux';

export default function PlanificateurPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  // Mock user data - replace with real authentication
  const user = {
    name: 'Utilisateur Demo',
    email: 'demo@c-secur360.com',
    role: 'Manager',
    avatar: undefined
  };

  return (
    <UniversalLayout 
      tenant={tenant}
      user={user}
      notifications={0}
      isAdmin={false}
      sidebar={<DashboardSidebar tenant={tenant} />}
      className="bg-slate-50 dark:bg-slate-900"
    >
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Planificateur de Travaux
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestion moderne des projets et ressources pour {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
          </p>
        </div>
        
        <PlanificateurTravaux />
      </div>
    </UniversalLayout>
  );
}