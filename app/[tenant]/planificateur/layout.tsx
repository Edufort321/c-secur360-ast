// CSS du module Planificateur (porté) — scopé sous .planner-app (reset/body neutralisés).
import '@/components/planner/styles/original.css';
import { PortalHeader } from '@/components/PortalHeader';

export default function PlanificateurLayout({ children, params }: { children: React.ReactNode; params: { tenant: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={params.tenant} />
      {children}
    </div>
  );
}
