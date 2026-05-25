'use client';
import { useParams, useRouter } from 'next/navigation';
import InspectionForm from '@/components/InspectionForm';

export default function EquipmentInspectPage() {
  const { tenant, id } = useParams() as { tenant: string; id: string };
  const router = useRouter();
  return (
    <InspectionForm
      tenant={tenant}
      equipmentId={id}
      onClose={() => router.push(`/${tenant}/inspections`)}
      onSaved={() => router.push(`/${tenant}/inspections`)}
    />
  );
}
