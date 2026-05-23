import ManagerDashboard from './ManagerDashboard'

interface DashboardPageProps {
  params: { tenant: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const tenant = {
    id: '1',
    subdomain: params.tenant,
    companyName: params.tenant === 'demo' ? 'Version Démo C-Secur360' : 
                 params.tenant === 'futureclient' ? 'Client Potentiel' : 
                 params.tenant === 'c-secur360' ? 'C-Secur360 (Admin)' :
                 params.tenant.charAt(0).toUpperCase() + params.tenant.slice(1)
  }

  return <ManagerDashboard tenant={tenant} />
}
