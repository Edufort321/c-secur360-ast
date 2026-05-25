'use client';

import ManagerDashboard from './ManagerDashboard';
import { PortalHeader } from '@/components/PortalHeader';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const params = useParams() as { tenant: string };
  const tenantId = params.tenant;

  const tenant = {
    id: '1',
    subdomain: tenantId,
    companyName: tenantId === 'demo' ? 'Version Démo C-Secur360' :
                 tenantId === 'futureclient' ? 'Client Potentiel' :
                 tenantId === 'c-secur360' ? 'C-Secur360 (Admin)' :
                 tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
  };

  return (
    <>
      <PortalHeader tenant={tenantId} />
      <ManagerDashboard tenant={tenant} />
    </>
  );
}
