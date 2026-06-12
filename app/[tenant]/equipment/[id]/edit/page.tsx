'use client';
import { useParams, useRouter } from 'next/navigation';
import EquipmentForm from '@/components/EquipmentForm';

export default function EquipmentEditPage() {
  const { tenant, id } = useParams() as { tenant: string; id: string };
  const router = useRouter();
  return (
    <EquipmentForm
      tenant={tenant}
      equipmentId={id}
      onClose={() => router.push(`/${tenant}/equipment/${id}`)}
      onSaved={() => {/* rester sur le formulaire — le Code QR reste visible */}}
      onDeleted={() => router.push(`/${tenant}/inspections`)}
    />
  );
}
