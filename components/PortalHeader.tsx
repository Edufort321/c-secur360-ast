'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X, LayoutGrid, Plus, FolderKanban, ShieldCheck, FileText } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSite } from '@/contexts/SiteContext';
import { MODULES } from '@/lib/modules/registry';
import { supabase } from '@/lib/supabase';
import { InstallPWA } from '@/components/InstallPWA';

const QUICK_CREATES = [
  { key: 'project', path: 'projects', labelFr: 'Nouveau projet',  labelEn: 'New project',  icon: FolderKanban, color: 'bg-blue-600' },
  { key: 'ast',     path: 'ast',      labelFr: 'Nouvel AST',      labelEn: 'New JSA',       icon: ShieldCheck,  color: 'bg-emerald-600' },
  { key: 'permit',  path: 'permits',  labelFr: 'Nouveau permis',  labelEn: 'New permit',    icon: FileText,     color: 'bg-amber-600' },
];

// En-tête unifié : logo officiel à gauche ; à droite Jour/Nuit + FR/EN + hamburger (navigation modules).
export function PortalHeader({ tenant, subtitle }: { tenant?: string; subtitle?: string }) {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { sites, siteId, setSiteId } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-gray-900 text-white shadow">
      <div className="flex w-full items-center justify-between px-4 py-2 lg:px-6">
        <Link href={tenant ? `/${tenant}/modules` : '/admin/dashboard'} className="flex items-center gap-3">
          <img src={logoUrl || "/logo.png"} alt="C-Secur360" className="h-16 w-auto" />
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-white">C-Secur360</div>
            <div className="text-xs text-gray-400">{subtitle || (tenant ? `${t('platform')} · ${tenant}` : (lang === 'fr' ? 'Panneau multi-clients' : 'Multi-client panel'))}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {tenant && sites.length > 0 && (
            <select
              value={siteId}
              onChange={e => setSiteId(e.target.value)}
              className="hidden sm:block max-w-[150px] truncate rounded-lg border border-white/15 bg-gray-800 px-2 py-1.5 text-xs font-semibold text-gray-200 outline-none"
            >
              <option value="all">{lang === 'fr' ? 'Tous les sites' : 'All sites'}</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}

          <button
            onClick={toggle}
            title="Jour / Nuit"
            aria-label="Jour / Nuit"
            className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex overflow-hidden rounded-lg border border-white/15 text-xs font-semibold">
            <button onClick={() => setLang('fr')} className={lang === 'fr' ? 'bg-blue-600 px-2.5 py-1.5 text-white' : 'px-2.5 py-1.5 text-gray-300 hover:bg-white/10'}>FR</button>
            <button onClick={() => setLang('en')} className={lang === 'en' ? 'bg-blue-600 px-2.5 py-1.5 text-white' : 'px-2.5 py-1.5 text-gray-300 hover:bg-white/10'}>EN</button>
          </div>

          <InstallPWA />

          {/* Hamburger : navigation + actions rapides */}
          {tenant && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu"
                className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={close} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 text-white shadow-2xl">

                    {/* Actions rapides */}
                    <div className="border-b border-gray-700 px-3 py-2">
                      <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Plus size={12} /> {lang === 'fr' ? 'Créer' : 'Create'}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {QUICK_CREATES.map(a => {
                          const Icon = a.icon;
                          return (
                            <Link key={a.key} href={`/${tenant}/${a.path}`} onClick={close}
                              className="flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-center text-xs font-medium text-gray-200 hover:bg-white/10">
                              <div className={`grid h-8 w-8 place-items-center rounded-lg ${a.color}`}>
                                <Icon size={15} />
                              </div>
                              {lang === 'fr' ? a.labelFr.replace(/^Nouveau\s+|^Nouvel\s+/i, '') : a.labelEn.replace(/^New\s+/i, '')}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navigation modules */}
                    <div className="px-3 py-2">
                      <div className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        {lang === 'fr' ? 'Modules' : 'Modules'}
                      </div>
                      <Link href={`/${tenant}/modules`} onClick={close}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-200 hover:bg-white/10">
                        <LayoutGrid size={16} className="shrink-0 text-blue-400" />
                        <span className="font-semibold">{t('modules')}</span>
                      </Link>
                      <div className="mt-1 max-h-64 overflow-y-auto">
                        {MODULES.map(m => {
                          const Icon = m.icon;
                          const label = lang === 'fr' ? m.labelFr : m.labelEn;
                          const href = m.status === 'available' ? `/${tenant}/${m.basePath}` : `/${tenant}/modules`;
                          return (
                            <Link key={m.key} href={href} onClick={close}
                              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-white/10">
                              <Icon size={16} className="shrink-0 text-gray-400" /> {label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sélecteur de site (mobile seulement) */}
                    {sites.length > 0 && (
                      <div className="border-t border-gray-700 px-3 py-2 sm:hidden">
                        <div className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">Site</div>
                        <select value={siteId} onChange={e => { setSiteId(e.target.value); close(); }}
                          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-2 py-1.5 text-sm text-gray-200 outline-none">
                          <option value="all">{lang === 'fr' ? 'Tous les sites' : 'All sites'}</option>
                          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
