'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, ClipboardCheck, QrCode, BarChart2, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const sb = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
})();

export default function BienvenuePage() {
  const { tenant } = useParams() as { tenant: string };
  const { lang, setLang } = useLanguage();
  const fr = lang === 'fr';
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sb || !tenant) return;
    sb.from('tenants').select('logo_url, name').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  const features = [
    { Icon: ClipboardCheck, titleFr: 'Inspections d\'équipement',   titleEn: 'Equipment inspections',   descFr: 'Listes de vérification conformes CNESST/CSA, photos, actions correctives.',     descEn: 'CNESST/CSA-compliant checklists, photos, corrective actions.' },
    { Icon: QrCode,         titleFr: 'Code QR par équipement',       titleEn: 'Equipment QR codes',       descFr: 'Scannez pour accéder instantanément au statut et à l\'historique.',              descEn: 'Scan to instantly access status and history.' },
    { Icon: ShieldCheck,    titleFr: 'Analyse sécuritaire de tâches', titleEn: 'Job Safety Analysis',     descFr: 'AST numériques, permis de travail, gestion des risques.',                        descEn: 'Digital JSA, work permits, risk management.' },
    { Icon: BarChart2,      titleFr: 'Rapports et conformité',        titleEn: 'Reports & compliance',    descFr: 'Tableaux de bord, traçabilité complète, exportation PDF.',                       descEn: 'Dashboards, full traceability, PDF export.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoUrl || '/c-secur360-logo.png'} alt="Logo" className="h-12 w-auto object-contain" />
          <div>
            <div className="font-bold text-white">C-Secur360</div>
            <div className="text-xs text-gray-400">c-secur360.ca</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded border border-white/20 text-xs font-semibold">
            <button onClick={() => setLang('fr')} className={fr ? 'bg-blue-600 px-2.5 py-1 text-white' : 'px-2.5 py-1 text-gray-300 hover:bg-white/10'}>FR</button>
            <button onClick={() => setLang('en')} className={!fr ? 'bg-blue-600 px-2.5 py-1 text-white' : 'px-2.5 py-1 text-gray-300 hover:bg-white/10'}>EN</button>
          </div>
          <Link href={`/${tenant}/login`}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg">
            <LogIn size={14} />
            {fr ? 'Se connecter' : 'Sign in'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gray-900 text-white text-center px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
          {fr ? 'Sécurité au travail simplifiée' : 'Workplace safety, simplified'}
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
          {fr
            ? 'Gérez vos inspections d\'équipement, AST et permis de travail en conformité avec la réglementation.'
            : 'Manage your equipment inspections, JSAs and work permits in compliance with regulations.'}
        </p>
        <Link href={`/${tenant}/login`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-lg shadow-lg">
          <LogIn size={18} />
          {fr ? 'Accéder à mon espace' : 'Access my workspace'}
        </Link>
      </div>

      {/* Features */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map(({ Icon, titleFr, titleEn, descFr, descEn }) => (
          <div key={titleFr} className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={20} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{fr ? titleFr : titleEn}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{fr ? descFr : descEn}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()} C-Secur360 · <a href="https://c-secur360.ca" className="hover:underline">c-secur360.ca</a>
      </footer>
    </div>
  );
}
