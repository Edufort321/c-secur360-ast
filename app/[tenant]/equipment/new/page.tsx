'use client';
import { useParams, useRouter } from 'next/navigation';
import EquipmentForm from '@/components/EquipmentForm';

export default function EquipmentNewPage() {
  const { tenant } = useParams() as { tenant: string };
  const router = useRouter();
  return (
    <EquipmentForm
      tenant={tenant}
      onClose={() => router.push(`/${tenant}/equipment`)}
      onSaved={(id) => router.push(`/${tenant}/equipment/${id}`)}
    />
  );
}
