'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSite } from '@/contexts/SiteContext';
import {
  ClipboardList, Plus, Search, MapPin, User, Calendar,
  Clock, CheckCircle, XCircle, Loader2, BarChart3, QrCode, Printer,
  LayoutGrid, List as ListIcon, Trash2, Gauge, Download, ImageDown,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateAstsPdf } from '@/components/steps/Step4Permits/AST';
import type { ASTPermit } from '@/components/steps/Step4Permits/AST';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);

type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

type ASTRow = {
  permit_number: string;
  updated_at: string;
  site_id?: string | null;
  data: {
    status?: PermitStatus;
    province?: string;
    taskInfo?: {
      workLocation?: string;
      supervisor?: string;
      taskDate?: string;
      taskDescription?: string;
      projectNumber?: string;
      contractor?: string;
    };
    validation?: { percentage?: number };
  };
};

const STATUS: Record<PermitStatus, { label: string; cls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-600',    icon: Clock },
  active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  completed: { label: 'Complété',   cls: 'bg-blue-100 text-blue-700',      icon: CheckCircle },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-700',        icon: XCircle },
};

export default function ASTListPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const { siteId } = useSite(); // sélecteur de site global (en-tête)
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const qrUrl = origin ? `${origin}/${tenant}/ast/acces` : '';
  const qrPosterRef = useRef<HTMLDivElement>(null);

  // Logo : celui du tenant s'il est défini, sinon le logo C-Secur par défaut.
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);
  const logoSrc = logoUrl || (origin ? `${origin}/logo.png` : '/logo.png');

  const statusLabel = (s: PermitStatus) => ({
    draft: tr('Brouillon', 'Draft'), active: tr('Actif', 'Active'),
    completed: tr('Complété', 'Completed'), cancelled: tr('Annulé', 'Cancelled'),
  }[s]);

  // Téléchargement du QR en PNG via canvas
  const downloadQRpng = () => {
    const svgEl = qrPosterRef.current?.querySelector('svg');
    if (!svgEl) return;
    const size = 400;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = `qr-ast-${tenant}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
  };

  // Impression d'une affiche QR centrée : logo en haut, QR au centre, texte dessous.
  const printPoster = () => {
    const svg = qrPosterRef.current?.querySelector('svg')?.outerHTML ?? '';
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (!w) return;
    const caption = tr('Pense à faire ton AST', 'Remember to do your JSA');
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>AST QR — ${tenant}</title>` +
      `<style>` +
      `html,body{height:100%}` +
      `body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:48px;color:#0f172a;` +
      `display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center}` +
      `.logo{max-height:90px;width:auto;margin-bottom:32px}` +
      `.qrbox{padding:20px;border:2px solid #e2e8f0;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,.08)}` +
      `.qrbox svg{width:260px;height:260px;display:block}` +
      `.caption{font-size:26px;font-weight:800;margin-top:32px}` +
      `.url{margin-top:14px;font-size:13px;color:#64748b;word-break:break-all;max-width:340px}` +
      `</style></head>` +
      `<body>` +
      `<img class="logo" src="${logoSrc}" alt="logo" />` +
      `<div class="qrbox">${svg}</div>` +
      `<div class="caption">${caption}</div>` +
      `<div class="url">${qrUrl}</div>` +
      `</body></html>`,
    );
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const [rows, setRows]     = useState<ASTRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState<PermitStatus | 'all'>('all');
  const [period, setPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('ast_permits')
        .select('permit_number, data, updated_at, site_id')
        .eq('tenant_id', tenant)
        .order('updated_at', { ascending: false });
      setRows((data ?? []) as ASTRow[]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('ast_permits')
          .select('permit_number, data, updated_at, site_id')
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

  // Date de référence d'un AST (date de tâche si présente, sinon dernière maj).
  const rowDate = (r: ASTRow) => new Date(r.data?.taskInfo?.taskDate || r.updated_at);

  const inPeriod = (d: Date, p: typeof period) => {
    if (p === 'all') return true;
    const now = new Date();
    if (p === 'year') return d.getFullYear() === now.getFullYear();
    if (p === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    // semaine glissante (7 derniers jours)
    const diff = (now.getTime() - d.getTime()) / 86400000;
    return diff >= 0 && diff < 7;
  };

  const filtered = useMemo(() => {
    let list = rows;
    if (siteId && siteId !== 'all') list = list.filter(r => r.site_id === siteId);
    if (filter !== 'all') list = list.filter(r => (r.data?.status || 'draft') === filter);
    if (period !== 'all') list = list.filter(r => inPeriod(rowDate(r), period));
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(r =>
      [
        r.permit_number,
        r.data?.taskInfo?.workLocation,
        r.data?.taskInfo?.supervisor,
        r.data?.taskInfo?.projectNumber,
        r.data?.taskInfo?.contractor,
        r.data?.taskInfo?.taskDescription,
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [rows, filter, query, period, siteId]);

  // Stats HSE sur l'ensemble filtré par période (gestion de la fréquence + conformité).
  const stats = useMemo(() => {
    const scope = period === 'all' ? rows : rows.filter(r => inPeriod(rowDate(r), period));
    const completed = scope.filter(r => r.data?.status === 'completed').length;
    const avgFill = scope.length
      ? Math.round(scope.reduce((s, r) => s + (r.data?.validation?.percentage ?? 0), 0) / scope.length)
      : 0;
    const fullyFilled = scope.filter(r => (r.data?.validation?.percentage ?? 0) >= 100).length;
    return {
      total:      scope.length,
      active:     scope.filter(r => r.data?.status === 'active').length,
      draft:      scope.filter(r => !r.data?.status || r.data.status === 'draft').length,
      completed,
      avgFill,
      fullyFilled,
      completionRate: scope.length ? Math.round((completed / scope.length) * 100) : 0,
    };
  }, [rows, period]);

  // Fréquence (compteurs par fenêtre temporelle) — indicateurs HSE.
  const freq = useMemo(() => ({
    week:  rows.filter(r => inPeriod(rowDate(r), 'week')).length,
    month: rows.filter(r => inPeriod(rowDate(r), 'month')).length,
    year:  rows.filter(r => inPeriod(rowDate(r), 'year')).length,
  }), [rows]);

  // ── Sélection multiple + suppression ──────────────────────────────────────
  const toggleSelect = (pn: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(pn) ? next.delete(pn) : next.add(pn);
    return next;
  });
  const allVisibleSelected = filtered.length > 0 && filtered.every(r => selected.has(r.permit_number));
  const toggleSelectAll = () => setSelected(prev => {
    if (filtered.every(r => prev.has(r.permit_number))) return new Set();
    return new Set(filtered.map(r => r.permit_number));
  });

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const ok = window.confirm(tr(
      `Supprimer ${selected.size} AST définitivement ? Cette action est irréversible.`,
      `Permanently delete ${selected.size} JSA? This action cannot be undone.`,
    ));
    if (!ok) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('ast_permits')
        .delete()
        .eq('tenant_id', tenant)
        .in('permit_number', Array.from(selected));
      if (error) throw error;
      setSelected(new Set());
      await reload();
    } catch {
      alert(tr('Échec de la suppression.', 'Delete failed.'));
    } finally {
      setDeleting(false);
    }
  };

  // Logo (dataURL) pour l'export PDF en lot.
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!logoSrc) return;
      try {
        const resp = await fetch(logoSrc);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(blob);
        });
        if (!cancelled) setLogoDataUrl(dataUrl);
      } catch { /* logo optionnel */ }
    })();
    return () => { cancelled = true; };
  }, [logoSrc]);

  const [exporting, setExporting] = useState(false);
  const exportSelected = async () => {
    if (selected.size === 0) return;
    setExporting(true);
    try {
      const list = filtered.filter(r => selected.has(r.permit_number)).map(r => r.data as unknown as ASTPermit);
      await generateAstsPdf(list, lang, logoDataUrl);
    } catch {
      alert(tr('Échec de la génération du PDF.', 'PDF generation failed.'));
    } finally {
      setExporting(false);
    }
  };

  const dateLocale = lang === 'fr' ? 'fr-CA' : 'en-CA';

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">

        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tr('Analyses Sécurité au Travail', 'Job Safety Analyses')}</h1>
              <p className="text-sm text-slate-500">
                {tr('Espace', 'Workspace')} <span className="font-medium text-slate-700">{tenant}</span>
              </p>
            </div>
          </div>
          <Link
            href={`/${tenant}/ast/nouveau`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <Plus size={18} /> {tr('Nouvel AST', 'New JSA')}
          </Link>
        </div>

        {/* Stats (selon la période sélectionnée) */}
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: tr('Total', 'Total'),           v: stats.total,     c: 'text-slate-900' },
            { k: tr('Actifs', 'Active'),         v: stats.active,    c: 'text-emerald-600' },
            { k: tr('Brouillons', 'Drafts'),     v: stats.draft,     c: 'text-slate-500' },
            { k: tr('Complétés', 'Completed'),   v: stats.completed, c: 'text-blue-600' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-sm text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Indicateurs HSE + fréquence */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Gauge size={13} /> {tr('Taux complétion', 'Completion rate')}</div>
            <div className="mt-1 text-2xl font-bold text-teal-600">{stats.completionRate}%</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><BarChart3 size={13} /> {tr('Remplissage moyen', 'Average fill')}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.avgFill}%</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CheckCircle size={13} /> {tr('Remplis à 100%', 'Fully filled')}</div>
            <div className="mt-1 text-2xl font-bold text-green-600">{stats.fullyFilled}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{tr('Cette semaine', 'This week')}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{freq.week}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{tr('Ce mois', 'This month')}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{freq.month}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{tr('Cette année', 'This year')}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{freq.year}</div>
          </div>
        </div>

        {/* Affiche QR publique — un sous-traitant scanne et remplit l'AST du client (sans login) */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-teal-100 bg-teal-50 px-5 py-3">
            <QrCode size={18} className="text-teal-600" />
            <h3 className="flex-1 text-sm font-semibold text-slate-800">
              {tr('Code QR public — Créer un AST', 'Public QR code — Create a JSA')}
            </h3>
            <div className="flex gap-2">
              <button type="button" onClick={downloadQRpng}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50">
                <ImageDown size={14} /> PNG
              </button>
              <button type="button" onClick={printPoster}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700">
                <Printer size={14} /> {tr('Imprimer', 'Print')}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start">
            {/* Bloc imprimable (capturé tel quel dans la fenêtre d'impression) */}
            <div ref={qrPosterRef} className="shrink-0 flex flex-col items-center gap-3 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="C-Secur360" className="h-12 w-auto object-contain" />
              {qrUrl && (
                <div className="qrbox inline-block rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
                  <QRCodeSVG value={qrUrl} size={180} level="M" includeMargin={false} />
                </div>
              )}
              <p className="caption text-lg font-bold text-slate-800">
                {tr('Pense à faire ton AST', 'Remember to do your JSA')}
              </p>
              <p className="code text-xs text-slate-400 break-all">{qrUrl}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600">
                {tr(
                  "Imprimez et affichez ce code à l'entrée du site. En le scannant, on choisit de créer un nouvel AST ou d'en consulter un existant — aucune connexion requise. L'AST complété est enregistré dans votre répertoire et le sous-traitant peut télécharger le PDF.",
                  'Print and post this code at the site entrance. Scanning it lets anyone create a new JSA or look up an existing one — no login required. The completed JSA is saved to your repository and the subcontractor can download the PDF.',
                )}
              </p>
              {qrUrl && (
                <code className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 break-all select-all">
                  {qrUrl}
                </code>
              )}
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre par statut */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {(['all', 'active', 'draft', 'completed', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === s ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s === 'all' ? tr('Tous statuts', 'All statuses') : statusLabel(s)}
                </button>
              ))}
            </div>

            {/* Filtre par période */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {([
                ['all', tr('Tout', 'All')],
                ['week', tr('Semaine', 'Week')],
                ['month', tr('Mois', 'Month')],
                ['year', tr('Année', 'Year')],
              ] as const).map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    period === p ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Bascule galerie / liste */}
            <div className="ml-auto flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode('gallery')}
                title={tr('Galerie', 'Gallery')}
                className={`rounded-lg p-1.5 transition ${viewMode === 'gallery' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title={tr('Liste', 'List')}
                className={`rounded-lg p-1.5 transition ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tr('Rechercher (numéro, lieu, superviseur, projet…)', 'Search (number, location, supervisor, project…)')}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Barre de sélection / suppression */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="h-4 w-4 accent-teal-600" />
                {tr('Tout sélectionner', 'Select all')}
              </label>
              <span className="text-xs text-slate-400">
                {selected.size > 0 ? tr(`${selected.size} sélectionné(s)`, `${selected.size} selected`) : tr('Aucune sélection', 'No selection')}
              </span>
              <button
                type="button"
                onClick={exportSelected}
                disabled={selected.size === 0 || exporting}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-40"
              >
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {tr('Export PDF', 'Export PDF')}
              </button>
              <button
                type="button"
                onClick={deleteSelected}
                disabled={selected.size === 0 || deleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {tr('Supprimer', 'Delete')}
              </button>
            </div>
          )}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-400">
              <ClipboardList size={26} />
            </div>
            <p className="font-medium text-slate-700">{tr('Aucun AST', 'No JSA')}</p>
            <p className="max-w-sm text-sm text-slate-500">
              {tr(
                'Créez votre première Analyse Sécurité au Travail pour identifier les dangers et mesures préventives.',
                'Create your first Job Safety Analysis to identify hazards and preventive measures.',
              )}
            </p>
            <Link
              href={`/${tenant}/ast/nouveau`}
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
            >
              <Plus size={18} /> {tr('Nouvel AST', 'New JSA')}
            </Link>
          </div>
        ) : viewMode === 'gallery' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(r => {
              const ti     = r.data?.taskInfo;
              const status = (r.data?.status || 'draft') as PermitStatus;
              const st     = STATUS[status] || STATUS.draft;
              const StatusIcon = st.icon;
              const pct    = r.data?.validation?.percentage ?? 0;
              const date   = rowDate(r).toLocaleDateString(dateLocale);
              const isSel  = selected.has(r.permit_number);

              return (
                <div key={r.permit_number} className={`relative rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${isSel ? 'border-teal-400 ring-1 ring-teal-300' : 'border-slate-200 hover:border-teal-300'}`}>
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggleSelect(r.permit_number)}
                    className="absolute left-3 top-3 z-10 h-4 w-4 accent-teal-600"
                    aria-label={tr('Sélectionner', 'Select')}
                  />
                  <Link href={`/${tenant}/ast/${r.permit_number}`} className="group block p-5 pl-10">
                    {/* Top row */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50">
                          <ClipboardList size={17} className="text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {r.permit_number}
                          </p>
                          {r.data?.province && (
                            <p className="text-xs text-slate-400">{r.data.province}</p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>
                        <StatusIcon size={10} />
                        {statusLabel(status)}
                      </span>
                    </div>

                    {(ti?.workLocation || ti?.taskDescription) && (
                      <div className="mb-2 flex items-start gap-1.5 text-sm text-slate-700">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1 font-medium">
                          {ti.workLocation || ti.taskDescription}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {ti?.supervisor && (
                        <span className="flex items-center gap-1"><User size={11} /> {ti.supervisor}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar size={11} /> {date}</span>
                      {ti?.projectNumber && (
                        <span className="flex items-center gap-1"># {ti.projectNumber}</span>
                      )}
                    </div>

                    {pct > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <BarChart3 size={10} /> {pct}%
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* Mode liste (tableau) */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-3 py-3">{tr('Numéro', 'Number')}</th>
                  <th className="px-3 py-3">{tr('Statut', 'Status')}</th>
                  <th className="px-3 py-3">{tr('Lieu', 'Location')}</th>
                  <th className="px-3 py-3">{tr('Superviseur', 'Supervisor')}</th>
                  <th className="px-3 py-3">{tr('Date', 'Date')}</th>
                  <th className="px-3 py-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => {
                  const ti     = r.data?.taskInfo;
                  const status = (r.data?.status || 'draft') as PermitStatus;
                  const st     = STATUS[status] || STATUS.draft;
                  const pct    = r.data?.validation?.percentage ?? 0;
                  const date   = rowDate(r).toLocaleDateString(dateLocale);
                  const isSel  = selected.has(r.permit_number);
                  return (
                    <tr key={r.permit_number} className={isSel ? 'bg-teal-50/60' : 'hover:bg-slate-50'}>
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(r.permit_number)} className="h-4 w-4 accent-teal-600" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Link href={`/${tenant}/ast/${r.permit_number}`} className="font-mono text-xs font-semibold text-teal-700 hover:underline">
                          {r.permit_number}
                        </Link>
                        {r.data?.province && <span className="ml-2 text-xs text-slate-400">{r.data.province}</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>
                          {statusLabel(status)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 max-w-[220px] truncate">{ti?.workLocation || ti?.taskDescription || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-600">{ti?.supervisor || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{date}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
