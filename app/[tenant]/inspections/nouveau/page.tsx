'use client';

import { useParams, useRouter } from 'next/navigation';
import InspectionForm from '@/components/InspectionForm';

export default function NouvelleInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  return (
    <InspectionForm
      tenant={tenant}
      onClose={() => router.push(`/${tenant}/inspections`)}
      onSaved={() => router.push(`/${tenant}/inspections`)}
    />
  );
}
