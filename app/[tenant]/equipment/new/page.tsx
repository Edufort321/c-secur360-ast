'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EquipmentForm from '@/components/EquipmentForm';

export default function EquipmentNewPage() {
  const { tenant } = useParams() as { tenant: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToInspect = searchParams.get('redirect') === 'inspect';

  return (
    <EquipmentForm
      tenant={tenant}
      onClose={() => router.push(`/${tenant}/equipment`)}
      onSaved={(id) => router.push(
        redirectToInspect
          ? `/${tenant}/equipment/${id}/inspect`
          : `/${tenant}/equipment/${id}`
      )}
    />
  );
}
