'use client';

import { useParams, useRouter } from 'next/navigation';
import InspectionForm from '@/components/InspectionForm';

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const id = params.id as string;

  return (
    <InspectionForm
      tenant={tenant}
      inspectionId={id}
      onClose={() => router.push(`/${tenant}/inspections`)}
      onSaved={() => router.push(`/${tenant}/inspections`)}
    />
  );
}
