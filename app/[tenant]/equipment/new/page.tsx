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
      onSaved={(id) => {
        // Si redirect=inspect, naviguer vers l'inspection; sinon rester sur le formulaire
        // pour que la section Code QR soit visible immédiatement après la sauvegarde.
        if (redirectToInspect) router.push(`/${tenant}/equipment/${id}/inspect`);
      }}
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
