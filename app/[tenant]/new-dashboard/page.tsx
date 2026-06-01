'use client';

import { useParams } from 'next/navigation';
import MainDashboard from '../../../components/dashboard/MainDashboard';

export default function NewDashboardPage() {
  const params = useParams() as { tenant: string };
  return <MainDashboard tenant={params.tenant} />;
}
