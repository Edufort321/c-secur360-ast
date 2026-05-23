'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X, LayoutGrid } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSite } from '@/contexts/SiteContext';
import { MODULES } from '@/lib/modules/registry';

// En-tête unifié : logo officiel à gauche ; à droite Jour/Nuit + FR/EN + hamburger (navigation modules).
export function PortalHeader({ tenant, subtitle }: { tenant?: string; subtitle?: string }) {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { sites, siteId, setSiteId } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gray-900 text-white shadow">
      <div className="flex w-full items-center justify-between px-4 py-3 lg:px-6">
        <Link href={tenant ? `/${tenant}/modules` : '/admin/dashboard'} className="flex items-center gap-3">
          <img src="/logo.png" alt="C-Secur360" className="h-9 w-auto" />
          <div className="leading-tight">
            <div className="font-bold text-white">C-Secur360</div>
            <div className="text-xs text-gray-400">{subtitle || (tenant ? `${t('platform')} · ${tenant}` : (lang === 'fr' ? 'Panneau multi-clients' : 'Multi-client panel'))}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {tenant && sites.length > 0 && (
            <select
              value={siteId}
              onChange={e => setSiteId(e.target.value)}
              title={lang === 'fr' ? 'Site' : 'Site'}
              className="max-w-[150px] truncate rounded-lg border border-white/15 bg-gray-800 px-2 py-1.5 text-xs font-semibold text-gray-200 outline-none"
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
            <button
              onClick={() => setLang('fr')}
              className={lang === 'fr' ? 'bg-blue-600 px-2.5 py-1.5 text-white' : 'px-2.5 py-1.5 text-gray-300 hover:bg-white/10'}
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={lang === 'en' ? 'bg-blue-600 px-2.5 py-1.5 text-white' : 'px-2.5 py-1.5 text-gray-300 hover:bg-white/10'}
            >
              EN
            </button>
          </div>

          {/* Hamburger : navigation modules (tenant uniquement) */}
          {tenant && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu modules"
              className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl">
                  <Link
                    href={`/${tenant}/modules`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                  >
                    <LayoutGrid size={18} className="text-blue-600" /> {t('modules')}
                  </Link>
                  {MODULES.map(m => {
                    const Icon = m.icon;
                    const label = lang === 'fr' ? m.labelFr : m.labelEn;
                    const href = m.status === 'available' ? `/${tenant}/${m.basePath}` : `/${tenant}/modules`;
                    return (
                      <Link
                        key={m.key}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <Icon size={18} className="text-gray-500" /> {label}
                      </Link>
                    );
                  })}
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
