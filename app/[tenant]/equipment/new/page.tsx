'use client';
import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EquipmentForm from '@/components/EquipmentForm';
import { Loader2 } from 'lucide-react';

function EquipmentNewInner() {
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

export default function EquipmentNewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" />
      </div>
    }>
      <EquipmentNewInner />
    </Suspense>
  );
}
