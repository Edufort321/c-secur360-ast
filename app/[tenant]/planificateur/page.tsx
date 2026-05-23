'use client';

import dynamic from 'next/dynamic';

// Planner porté (app Vite) — monté client-only (ssr:false) pour éviter tout souci SSR
// (window/localStorage). L'accès est gardé par l'hôte ; le login interne est bypassé (admin par défaut).
const PlannerApp = dynamic(() => import('@/components/planner/App'), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center text-gray-400">Chargement du planificateur…</div>,
});

export default function PlanificateurPage() {
  return (
    <div className="planner-app">
      <PlannerApp />
    </div>
  );
}
