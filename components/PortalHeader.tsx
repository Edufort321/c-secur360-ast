'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, LayoutGrid, List, Plus, FolderKanban, ShieldCheck, FileText, Home, Globe, LogOut, KeyRound, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSite } from '@/contexts/SiteContext';
import { MODULES } from '@/lib/modules/registry';
import { supabase } from '@/lib/supabase';
import { useEntitlements } from '@/lib/entitlements';
import { InstallPWA } from '@/components/InstallPWA';
import { NotificationBell } from '@/components/NotificationBell';

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
  const router = useRouter();
  const pathname = usePathname();
  // Flèche retour UNIFORME : présente sur toute page module (sauf l'accueil « modules »). Recule dans
  // l'historique, avec repli sur l'accueil du tenant si pas d'historique.
  const onModulesHome = !!tenant && pathname === `/${tenant}/modules`;
  const goBack = () => { if (typeof window !== 'undefined' && window.history.length > 1) router.back(); else if (tenant) router.push(`/${tenant}/modules`); };
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string | null>(null); // couleur du header (réglage tenant)
  const [firstLogin, setFirstLogin] = useState(false); // 1re connexion : inviter à changer le mot de passe
  const entitlements = useEntitlements(tenant || '');

  // Préférences d'AFFICHAGE du tableau de bord (par navigateur = par utilisateur). Le dashboard les relit
  // via l'événement 'dash-view-change'. On n'affiche ces options QUE sur l'accueil modules.
  const [vArrange, setVArrange] = useState<'grouped' | 'flat' | 'custom'>('grouped');
  const [vView, setVView] = useState<'grid' | 'list'>('grid');
  useEffect(() => {
    if (!tenant) return;
    try {
      const a = localStorage.getItem(`dashArrange_${tenant}`); if (a === 'grouped' || a === 'flat' || a === 'custom') setVArrange(a);
      const v = localStorage.getItem(`dashView_${tenant}`); if (v === 'grid' || v === 'list') setVView(v);
    } catch { /* ignore */ }
  }, [tenant, menuOpen]);
  const setDash = (kind: 'arrange' | 'view', val: string) => {
    try { localStorage.setItem(kind === 'arrange' ? `dashArrange_${tenant}` : `dashView_${tenant}`, val); } catch { /* ignore */ }
    if (kind === 'arrange') setVArrange(val as any); else setVView(val as any);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('dash-view-change'));
  };

  // Modules visibles selon entitlements — admin toujours présent, fallback = tout afficher pendant le chargement
  const visibleModules = !tenant || entitlements === null
    ? MODULES
    : MODULES.filter(m => m.key === 'admin' || entitlements.includes(m.key));

  // Mapping clé QUICK_CREATES → clé module (les deux ne sont pas identiques)
  const QC_MODULE: Record<string, string> = { project: 'projects', ast: 'ast', permit: 'permits' };
  const visibleQuickCreates = !tenant || entitlements === null
    ? QUICK_CREATES
    : QUICK_CREATES.filter(a => entitlements.includes(QC_MODULE[a.key] ?? a.key));

  useEffect(() => {
    if (!tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
    // Couleur de marque du header (réglée par le tenant dans Admin > Modèles PDF).
    supabase.from('company_settings').select('pdf_styles').eq('tenant_id', tenant).maybeSingle()
      .then(({ data }) => { const c = (data as any)?.pdf_styles?.brand_color; if (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)) setBrandColor(c); }, () => {});
  }, [tenant]);

  // 1re connexion : on invite (sans bloquer) à remplacer le mot de passe fourni par l'admin.
  useEffect(() => {
    if (!tenant) return;
    fetch('/api/auth/me', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(j => { if (j?.user?.firstLogin) setFirstLogin(true); }, () => {});
  }, [tenant]);

  const close = () => setMenuOpen(false);

  // DÉCONNEXION : détruit la session serveur + supprime le cookie, puis purge les éventuelles traces
  // locales (planner) et redirige vers la connexion du tenant — empêche la reconnexion automatique.
  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch { /* ignore */ }
    try {
      // Purge des sessions locales connues (planner / divers) pour éviter toute reconnexion auto.
      Object.keys(localStorage).forEach(k => { if (/auth|session|token|user|connect/i.test(k)) localStorage.removeItem(k); });
      sessionStorage.clear();
    } catch { /* ignore */ }
    window.location.href = tenant ? `/${tenant}/login` : '/auth/admin';
  }

  return (
    <header className="sticky top-0 z-40 text-white shadow" style={{ backgroundColor: brandColor || '#111827' }}>
      <div className="flex w-full items-center justify-between px-4 py-2 lg:px-6">
        <div className="flex items-center gap-2">
          {tenant && !onModulesHome && (
            <button
              onClick={goBack}
              title={lang === 'fr' ? 'Retour' : 'Back'}
              aria-label={lang === 'fr' ? 'Retour' : 'Back'}
              className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link href={tenant ? `/${tenant}/modules` : '/admin/dashboard'} className="flex items-center gap-3">
          <img src={logoUrl || "/logo.png"} alt="C-Secur360" className="h-16 w-auto" />
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-white">C-Secur360</div>
            <div className="text-xs text-gray-400">{subtitle || (tenant ? `${t('platform')} · ${tenant}` : (lang === 'fr' ? 'Panneau multi-clients' : 'Multi-client panel'))}</div>
          </div>
          </Link>
        </div>

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

          {tenant && <NotificationBell lang={lang} />}

          <button
            onClick={toggle}
            title="Jour / Nuit"
            aria-label="Jour / Nuit"
            className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Bascule FR/EN au clic (toggle), pas une sélection */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
            aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
            className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10"
          >
            <span className="text-white">{lang === 'fr' ? 'FR' : 'EN'}</span>
            <span className="mx-1 opacity-40">⇄</span>
            <span className="opacity-50">{lang === 'fr' ? 'EN' : 'FR'}</span>
          </button>

          {tenant && (
            <Link
              href={`/${tenant}/modules`}
              title={lang === 'fr' ? 'Accueil' : 'Home'}
              className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <Home size={18} />
            </Link>
          )}

          {tenant && (
            <button
              onClick={logout}
              title={lang === 'fr' ? 'Déconnexion' : 'Log out'}
              aria-label={lang === 'fr' ? 'Déconnexion' : 'Log out'}
              className="rounded-lg p-2 text-gray-300 transition hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut size={18} />
            </button>
          )}

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
                        {visibleQuickCreates.map(a => {
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
                      <Link href="/" onClick={close}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-white/10">
                        <Globe size={16} className="shrink-0 text-gray-400" />
                        {lang === 'fr' ? 'Page publique' : 'Public page'}
                      </Link>
                      <div className="mt-1 max-h-64 overflow-y-auto">
                        {visibleModules.map(m => {
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

                    {/* Affichage du tableau de bord (uniquement sur l'accueil modules) */}
                    {onModulesHome && (
                      <div className="border-t border-gray-700 px-3 py-2">
                        <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                          <LayoutGrid size={12} /> {lang === 'fr' ? 'Affichage' : 'View'}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {([['grouped', 'Par type', 'By type'], ['flat', 'Compact', 'Compact'], ['custom', 'Perso.', 'Custom']] as const).map(([k, fr, en]) => (
                            <button key={k} onClick={() => setDash('arrange', k)} className={`rounded-lg px-2 py-1.5 text-xs font-medium ${vArrange === k ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{lang === 'fr' ? fr : en}</button>
                          ))}
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-1">
                          <button onClick={() => setDash('view', 'grid')} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${vView === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}><LayoutGrid size={13} /> {lang === 'fr' ? 'Galerie' : 'Gallery'}</button>
                          <button onClick={() => setDash('view', 'list')} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${vView === 'list' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}><List size={13} /> {lang === 'fr' ? 'Liste' : 'List'}</button>
                        </div>
                      </div>
                    )}

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

                    {/* Confidentialité — Loi 25 (droits des personnes) */}
                    <div className="border-t border-gray-700 px-3 py-2">
                      <Link href={`/${tenant}/account/confidentialite`} onClick={close}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-white/10">
                        <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                        {lang === 'fr' ? 'Mes renseignements (Loi 25)' : 'My personal data (Law 25)'}
                      </Link>
                      <Link href={`/${tenant}/account/change-password`} onClick={close}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-white/10">
                        <KeyRound size={16} className="shrink-0 text-amber-400" />
                        {lang === 'fr' ? 'Mon mot de passe' : 'My password'}
                      </Link>
                    </div>

                    {/* Déconnexion */}
                    <div className="border-t border-gray-700 px-3 py-2">
                      <button onClick={() => { close(); logout(); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10">
                        <LogOut size={16} className="shrink-0" />
                        {lang === 'fr' ? 'Déconnexion' : 'Log out'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 1re connexion : invitation (non bloquante) à personnaliser le mot de passe */}
      {firstLogin && tenant && (
        <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-semibold text-amber-950">
          <KeyRound size={13} />
          {lang === 'fr' ? 'Première connexion — pensez à changer votre mot de passe.' : 'First login — please change your password.'}
          <Link href={`/${tenant}/account/change-password`} className="ml-1 rounded bg-amber-950/15 px-2 py-0.5 underline hover:bg-amber-950/25">{lang === 'fr' ? 'Changer maintenant' : 'Change now'}</Link>
        </div>
      )}
    </header>
  );
}
