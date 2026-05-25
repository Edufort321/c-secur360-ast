'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClipboardList, Plus, Search, Loader2, ArrowRight } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

// Page d'accueil publique (cible du QR code). Un sous-traitant scanne, arrive ici,
// puis choisit de créer un nouvel AST ou de rechercher un AST existant — ce qui
// évite la création d'AST vides à chaque scan.
function AccesInner() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const tenant = (params?.tenant as string) || 'demo';

  const [num, setNum] = useState('');

  const openExisting = () => {
    const n = num.trim();
    if (!n) return;
    router.push(`/${tenant}/ast/view/${encodeURIComponent(n)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{tr('Analyse Sécurité au Travail', 'Job Safety Analysis')}</h1>
            <p className="text-sm text-slate-500">{tenant}</p>
          </div>
        </div>

        {/* Créer un nouvel AST */}
        <button
          type="button"
          onClick={() => router.push(`/${tenant}/ast/nouveau`)}
          className="mb-4 flex w-full items-center gap-4 rounded-2xl border border-teal-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-400 hover:shadow-md"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-600 text-white">
            <Plus size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">{tr('Créer un nouvel AST', 'Create a new JSA')}</div>
            <div className="text-sm text-slate-500">{tr('Remplir une nouvelle analyse de sécurité', 'Fill out a new safety analysis')}</div>
          </div>
          <ArrowRight size={18} className="text-teal-500" />
        </button>

        {/* Rechercher un AST existant */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <Search size={18} className="text-slate-400" />
            {tr('Rechercher un AST existant', 'Find an existing JSA')}
          </div>
          <div className="flex gap-2">
            <input
              value={num}
              onChange={e => setNum(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); openExisting(); } }}
              placeholder={tr('Numéro AST (ex. AST-…)', 'JSA number (e.g. AST-…)')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={openExisting}
              disabled={!num.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-40"
            >
              <Search size={15} /> {tr('Ouvrir', 'Open')}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {tr('Ouvre la version lecture seule de l’AST (et son PDF).', 'Opens the read-only version of the JSA (and its PDF).')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccesASTPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-slate-400" /></div>}>
      <AccesInner />
    </Suspense>
  );
}
