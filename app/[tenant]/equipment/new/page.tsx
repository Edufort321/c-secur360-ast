'use client';
import { Suspense, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EquipmentForm from '@/components/EquipmentForm';
import { Loader2 } from 'lucide-react';

function EquipmentNewInner() {
  const { tenant } = useParams() as { tenant: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToInspect = searchParams.get('redirect') === 'inspect';
  const [showVehiclePrompt, setShowVehiclePrompt] = useState(false);
  const [savedEquipId, setSavedEquipId] = useState<string | null>(null);

  function handleSaved(id: string, equipmentType?: string) {
    setSavedEquipId(id);
    if (equipmentType === 'vehicle') {
      setShowVehiclePrompt(true);
    } else if (redirectToInspect) {
      router.push(`/${tenant}/equipment/${id}/inspect`);
    }
  }

  return (
    <>
      <EquipmentForm
        tenant={tenant}
        onClose={() => router.push(`/${tenant}/equipment`)}
        onSaved={(id, type) => handleSaved(id, type)}
      />
      {showVehiclePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-bold">Ajouter dans les ressources?</h2>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
              Ce véhicule a été créé dans le module inspection. Voulez-vous l'ajouter également dans les ressources admin (Véhicules) pour le calcul d'avantages imposables et la feuille de temps?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/${tenant}/admin?tab=vehicules`)}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Oui, ajouter dans les ressources
              </button>
              <button
                onClick={() => {
                  setShowVehiclePrompt(false);
                  if (redirectToInspect && savedEquipId) router.push(`/${tenant}/equipment/${savedEquipId}/inspect`);
                  else router.push(`/${tenant}/equipment`);
                }}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
                Non, rester dans inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
