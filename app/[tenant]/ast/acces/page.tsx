'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ClipboardList, Plus, Search, Loader2, ArrowRight, MapPin, User, Calendar } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);

type ASTRow = {
  permit_number: string;
  updated_at: string;
  data: {
    status?: string;
    province?: string;
    taskInfo?: {
      workLocation?: string; supervisor?: string; taskDate?: string;
      taskDescription?: string; projectNumber?: string; contractor?: string;
    };
  };
};

// Page d'accueil publique (cible du QR code). Un sous-traitant scanne, arrive ici,
// puis crée un nouvel AST OU recherche un AST existant (même recherche que l'app :
// numéro, lieu, superviseur, #projet, entrepreneur, description).
function AccesInner() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const tenant = (params?.tenant as string) || 'demo';

  const [rows, setRows] = useState<ASTRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('ast_permits')
          .select('permit_number, data, updated_at')
          .eq('tenant_id', tenant)
          .order('updated_at', { ascending: false });
        if (active) setRows((data ?? []) as ASTRow[]);
      } catch {
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenant]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter(r => [
          r.permit_number,
          r.data?.taskInfo?.workLocation,
          r.data?.taskInfo?.supervisor,
          r.data?.taskInfo?.projectNumber,
          r.data?.taskInfo?.contractor,
          r.data?.taskInfo?.taskDescription,
        ].filter(Boolean).some(v => String(v).toLowerCase().includes(q)))
      : rows;
    return list.slice(0, 30);
  }, [rows, query]);

  const dateLocale = lang === 'fr' ? 'fr-CA' : 'en-CA';

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
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tr('Numéro, lieu, superviseur, projet…', 'Number, location, supervisor, project…')}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mt-3 space-y-2">
            {loading ? (
              <div className="grid place-items-center py-8 text-slate-400"><Loader2 className="animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                {query ? tr('Aucun AST correspondant.', 'No matching JSA.') : tr('Aucun AST pour le moment.', 'No JSA yet.')}
              </p>
            ) : (
              filtered.map(r => {
                const ti = r.data?.taskInfo;
                const date = new Date(ti?.taskDate || r.updated_at).toLocaleDateString(dateLocale);
                return (
                  <button
                    key={r.permit_number}
                    type="button"
                    onClick={() => router.push(`/${tenant}/ast/view/${encodeURIComponent(r.permit_number)}`)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-teal-300 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs font-semibold uppercase tracking-wide text-slate-500">{r.permit_number}</p>
                      {(ti?.workLocation || ti?.taskDescription) && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-sm font-medium text-slate-800">
                          <MapPin size={12} className="shrink-0 text-slate-400" /> {ti?.workLocation || ti?.taskDescription}
                        </p>
                      )}
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        {ti?.supervisor && <span className="flex items-center gap-1"><User size={11} /> {ti.supervisor}</span>}
                        <span className="flex items-center gap-1"><Calendar size={11} /> {date}</span>
                        {ti?.projectNumber && <span># {ti.projectNumber}</span>}
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-slate-300" />
                  </button>
                );
              })
            )}
          </div>
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
