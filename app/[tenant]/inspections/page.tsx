'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import InspectionForm from '@/components/InspectionForm';

export default function InspectionsPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  return (
    <InspectionForm
      tenant={tenant}
      onClose={() => router.push(`/${tenant}/modules`)}
      embedded
    />
  );
}
