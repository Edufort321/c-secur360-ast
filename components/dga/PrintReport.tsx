'use client';

// ============================================================================
// RAPPORT IMPRIMABLE — port fidèle de PrintReport (dga-oil-app.jsx ~l.1641).
// Pages : couverture (InsideView commande+équipement, analyse globale, reco, suivi),
// résultats (paramètres × dates + méthodes), analyse & interprétation, tendances (SvgTrend).
// Visible uniquement à l'impression (classe .dga-print-only, CSS dans TransfoView).
// Clés adaptées au module (equip_no, oil_type, sample_id… ; huile/furanes dans oil_quality).
// ============================================================================
import React from 'react';
import type { Dossier, Measure, Anomaly, Inspection } from '@/lib/dga/dossiers';
import { GAS_FIELDS, COMBUSTIBLE, OIL_FIELDS, FURAN_FIELDS, IEEE_LIMITS, gl, fl, COND_LABELS, COND_COLORS, numOrNull, pcbStatus, latestPcb, type Lang } from '@/lib/dga/fields';
import { INSPECTION_CHECKLIST, il } from '@/lib/dga/inspection';
import { ZONE_COLORS } from '@/lib/dga/duval';
import { voltageClass } from '@/lib/dga/oil';
import { DuvalTriangle } from '@/components/dga/DuvalTriangle';

const SP: Record<string, React.CSSProperties> = {
  wrap: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#1a1a1a' },
  page: { padding: '2mm 0' },
  sectionBar: { background: '#277da1', color: '#fff', fontWeight: 700, fontSize: 11, padding: '5px 10px', borderRadius: 4, marginBottom: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 10 },
  th: { textAlign: 'left', padding: '5px 4px', borderBottom: '1.5px solid #1a1a1a', fontSize: 9 },
  thR: { textAlign: 'right', padding: '5px 4px', borderBottom: '1.5px solid #1a1a1a', fontSize: 9 },
  subHead: { background: '#e8f1f5', fontWeight: 700, fontSize: 9, padding: '3px 4px', color: '#277da1' },
  td: { padding: '3px 4px', borderBottom: '0.5px solid #eee' },
  tdR: { padding: '3px 4px', borderBottom: '0.5px solid #eee', textAlign: 'right' },
  tdMethod: { padding: '3px 4px', borderBottom: '0.5px solid #eee', textAlign: 'right', fontSize: 8, color: '#999' },
  condBig: { color: '#fff', fontWeight: 900, fontSize: 13, padding: '10px 14px', borderRadius: 8, textAlign: 'center', whiteSpace: 'nowrap' },
  zoneBadge: { color: '#fff', fontWeight: 900, fontSize: 18, width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  h3: { fontWeight: 700, fontSize: 11, margin: '10px 0 6px', color: '#277da1' },
  interp: { fontSize: 10, lineHeight: 1.35, padding: '6px 8px', borderLeft: '3px solid', borderRadius: '0 4px 4px 0', marginBottom: 5 },
  reco: { background: '#2b2118', color: '#fff', borderRadius: 6, padding: 10, marginTop: 8, fontSize: 11 },
  ratioMini: { background: '#f8f2e7', borderRadius: 5, padding: '4px 8px', fontSize: 10 },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 },
  coverBar: { background: '#5a6b7a', color: '#fff', fontWeight: 700, fontSize: 10, padding: '4px 10px', borderRadius: 3 },
  coverTable: { width: '100%', borderCollapse: 'collapse', fontSize: 9.5, marginTop: 4 },
  cLbl: { background: '#eef2f5', fontWeight: 600, padding: '4px 6px', border: '0.5px solid #dde5ea', color: '#34495e', width: '12%', verticalAlign: 'top' },
  cVal: { padding: '4px 6px', border: '0.5px solid #dde5ea', width: '21%', verticalAlign: 'top' },
};
const interpStyle = (lvl: string): React.CSSProperties => lvl === 'crit' ? { borderLeftColor: '#9d0208', background: '#fdecea' } : lvl === 'warn' ? { borderLeftColor: '#f4a261', background: '#fef6ec' } : { borderLeftColor: '#577590', background: '#eef3f6' };
const oilStyle = (s: string): React.CSSProperties => s === 'poor' ? { borderLeftColor: '#9d0208', background: '#fdecea' } : s === 'fair' ? { borderLeftColor: '#f4a261', background: '#fef6ec' } : { borderLeftColor: '#2a9d8f', background: '#eafaf5' };

// Mini-graphique SVG (fiable à l'impression). items = valeurs datées (null = manquant).
function SvgTrend({ items, title, color = '#2b2118', limit }: { items: { date: string; v: number | null }[]; title: string; color?: string; limit?: number }) {
  const w = 300, h = 150, pad = { l: 38, r: 10, t: 24, b: 34 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const vals = items.map(d => d.v);
  let max = Math.max(...vals.filter((v): v is number => v != null), limit || 0, 1);
  const min = Math.min(...vals.filter((v): v is number => v != null), 0);
  max = max * 1.1 || 1;
  const x = (i: number) => pad.l + (items.length <= 1 ? iw / 2 : (i / (items.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - ((v - min) / (max - min || 1)) * ih;
  const pts = items.map((d, i) => (d.v != null ? `${x(i)},${y(d.v)}` : null)).filter(Boolean).join(' ');
  let grid = '';
  for (let g = 0; g <= 3; g++) { const v = min + (max - min) * g / 3; const yy = y(v); grid += `<line x1="${pad.l}" y1="${yy}" x2="${pad.l + iw}" y2="${yy}" stroke="#eee3d2" stroke-width="0.5"/><text x="${pad.l - 4}" y="${yy + 3}" text-anchor="end" font-size="7" fill="#999">${Math.round(v)}</text>`; }
  let xl = ''; items.forEach((d, i) => { xl += `<text x="${x(i)}" y="${pad.t + ih + 12}" text-anchor="middle" font-size="6.5" fill="#888" transform="rotate(-30 ${x(i)} ${pad.t + ih + 12})">${d.date}</text>`; });
  const limLine = limit != null ? `<line x1="${pad.l}" y1="${y(limit)}" x2="${pad.l + iw}" y2="${y(limit)}" stroke="#e63946" stroke-width="1" stroke-dasharray="3 2"/>` : '';
  const dots = items.map((d, i) => (d.v != null ? `<circle cx="${x(i)}" cy="${y(d.v)}" r="2.5" fill="${color}"/>` : '')).join('');
  return (
    <div style={{ breakInside: 'avoid' }}>
      <div style={{ fontWeight: 700, fontSize: 10, color: '#277da1', marginBottom: 2 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" dangerouslySetInnerHTML={{
        __html: `<line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + ih}" stroke="#b8a890"/><line x1="${pad.l}" y1="${pad.t + ih}" x2="${pad.l + iw}" y2="${pad.t + ih}" stroke="#b8a890"/>${grid}${xl}${limLine}<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5"/>${dots}`,
      }} />
    </div>
  );
}

// Graphique d'évolution SVG (fidèle à l'impression, sans recharts) — page couverture.
function PrintEvolutionChart({ data, lang }: { data: Measure[]; lang: Lang }) {
  if (!data || data.length < 2) return null;
  const W = 680, H = 260, padL = 44, padR = 12, padT = 14, padB = 46;
  const series = GAS_FIELDS.filter(g => COMBUSTIBLE.includes(g.key));
  let maxY = 0;
  data.forEach(d => series.forEach(g => { const v = parseFloat(String((d as any)[g.key])); if (!isNaN(v) && v > maxY) maxY = v; }));
  if (maxY <= 0) maxY = 100;
  const niceMax = ((m: number) => { const p = Math.pow(10, Math.floor(Math.log10(m))); const n = Math.ceil(m / p) * p; return n < m * 1.05 ? n + p : n; })(maxY);
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const x = (i: number) => padL + (data.length === 1 ? plotW / 2 : (i * plotW / (data.length - 1)));
  const y = (v: number) => padT + plotH - (v / niceMax) * plotH;
  const gridVals = Array.from({ length: 5 }, (_, i) => Math.round(niceMax * i / 4));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      {gridVals.map((gv, i) => { const yy = y(gv); return (<g key={i}><line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#e8ddd0" strokeWidth="1" strokeDasharray="3 3" /><text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="9" fill="#888">{gv}</text></g>); })}
      {data.map((d, i) => <text key={'x' + i} x={x(i)} y={H - padB + 16} textAnchor="middle" fontSize="8.5" fill="#666">{d.sample_date}</text>)}
      {series.map(g => { const pts = data.map((d, i) => { const v = parseFloat(String((d as any)[g.key])); return isNaN(v) ? null : `${x(i)},${y(v)}`; }).filter(Boolean); if (pts.length < 2) return null; return <polyline key={g.u} points={pts.join(' ')} fill="none" stroke={g.color} strokeWidth="2" />; })}
      {series.map(g => data.map((d, i) => { const v = parseFloat(String((d as any)[g.key])); if (isNaN(v)) return null; return <circle key={g.u + i} cx={x(i)} cy={y(v)} r="2.5" fill="#fff" stroke={g.color} strokeWidth="1.5" />; }))}
      {series.map((g, i) => { const col = i % 3, row = Math.floor(i / 3); const lx = padL + col * ((W - padL - padR) / 3); const ly = (H - 20) + row * 11; return (<g key={'lg' + g.u} transform={`translate(${lx}, ${ly})`}><line x1="0" y1="-3" x2="14" y2="-3" stroke={g.color} strokeWidth="2" /><circle cx="7" cy="-3" r="2.5" fill="#fff" stroke={g.color} strokeWidth="1.5" /><text x="18" y="0" fontSize="8.5" fill="#444">{gl(g.u, lang)}</text></g>); })}
    </svg>
  );
}

export function PrintReport(props: {
  dossier: Dossier; data: Measure[]; cur: Measure; prev: Measure | null;
  zone: { code: string; label: string }; worst: number;
  items: { lvl: string; txt: string }[]; reco: { title: string; steps: string[] };
  oilEval: { status: string; txt: string }[]; furan: any; trendA: any; rogers: Record<string, number>;
  globalNote: string; manualReco: string; nextDate: string | null; due: any;
  projectNo: string; pages: { titlePage: boolean; cover: boolean; results: boolean; analysis: boolean; trends: boolean; coverChart: boolean; photos: boolean; anomalies: boolean; inspections: boolean };
  logoUrl: string | null; tenantName?: string; siteText?: string; lang: Lang; fal2ppb: number | null;
  photos?: { id: string; data: string; name?: string }[]; anomalies?: Anomaly[]; inspections?: Inspection[];
}) {
  const { dossier, data, cur, zone, worst, items, reco, oilEval, furan, trendA, rogers, globalNote, manualReco, nextDate, due, projectNo, pages, logoUrl, tenantName, siteText, lang, photos = [], anomalies = [], inspections = [] } = props;
  const anomReport = anomalies.filter(a => !a.archived);
  const lastInspection = inspections[0] || null;
  const EN = lang === 'en';
  const L = (fr: string, en: string) => (EN ? en : fr);
  const today = new Date().toISOString().slice(0, 10);

  const eqMap: Record<string, keyof Dossier> = {
    company: 'company', contact: 'contact', email: 'email', sampleId: 'sample_id', reportId: 'report_id', poNo: 'po_no',
    ident: 'ident', kv: 'kv', manufacturer: 'manufacturer', alarm: 'alarm', mva: 'mva', year: 'year', description: 'description',
    oilType: 'oil_type', preservation: 'preservation', client: 'client', oilVol: 'oil_vol', paperAT: 'paper_at',
    equipNo: 'equip_no', serie: 'serie', category: 'category', apparatus: 'apparatus', cooling: 'cooling',
    analyzedBy: 'analyzed_by', samplePoint: 'sample_point', authorizedBy: 'authorized_by',
  };
  const eqVal = (k: string) => { const dk = eqMap[k]; const v = dk ? (dossier as any)[dk] : undefined; return v != null && v !== '' ? v : '—'; };

  const combChart = [
    { key: 'h2', u: 'H2', c: '#e63946', lim: IEEE_LIMITS.h2[1] }, { key: 'c2h2', u: 'C2H2', c: '#9d0208', lim: 35 },
    { key: 'c2h4', u: 'C2H4', c: '#f3722c', lim: IEEE_LIMITS.c2h4[1] }, { key: 'ch4', u: 'CH4', c: '#f9c74f', lim: IEEE_LIMITS.ch4[1] },
    { key: 'c2h6', u: 'C2H6', c: '#90be6d', lim: IEEE_LIMITS.c2h6[1] }, { key: 'co', u: 'CO', c: '#577590', lim: IEEE_LIMITS.co[1] },
    { key: 'co2', u: 'CO2', c: '#277da1', lim: IEEE_LIMITS.co2[1] }, { key: 'tdcg', u: 'TDCG', c: '#9d0208', lim: 1920 },
  ];
  const oilChart = OIL_FIELDS.filter(f => !f.text && data.some(d => d.oil_quality?.[f.key] != null));
  const pcbV = pcbStatus(latestPcb(data), lang);
  const isOltc = !!(dossier as any).extra?.is_oltc;
  const parentSerie = (dossier as any).extra?.parent_serie || '';
  const datedItems = (get: (m: Measure) => number | null) => data.map(m => ({ date: m.sample_date || '', v: get(m) }));

  return (
    <div className="dga-print-only" style={SP.wrap}>
      {/* PAGE DE GARDE (titre) — hors table d'en-tête/pied répété */}
      {pages.titlePage && (
        <section className="title-page has-break" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '245mm', boxSizing: 'border-box', padding: '0 16px 30mm' }}>
          {logoUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt="" style={{ maxHeight: 90, maxWidth: 260, objectFit: 'contain', marginBottom: 12 }} />}
          {tenantName && <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a', marginBottom: siteText ? 4 : 22 }}>{tenantName}</div>}
          {siteText && <div style={{ fontSize: 12, color: '#277da1', fontWeight: 600, marginBottom: 22 }}>📍 {siteText}</div>}
          <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 3, color: '#277da1', marginBottom: 8 }}>{L("RAPPORT D'ANALYSE DE LABORATOIRE", 'LABORATORY ANALYSIS REPORT')}</div>
          {isOltc && <div style={{ display: 'inline-block', background: '#4f46e5', color: '#fff', fontWeight: 800, fontSize: 11, padding: '3px 10px', borderRadius: 6, marginBottom: 10 }}>{L('CHANGEUR DE PRISES EN CHARGE (OLTC)', 'ON-LOAD TAP CHANGER (OLTC)')}</div>}
          <h1 style={{ fontWeight: 900, fontSize: 32, margin: '0 0 8px', lineHeight: 1.1, maxWidth: 600, color: '#1a1a1a' }}>{dossier.ident || L("RAPPORT D'ANALYSE", 'ANALYSIS REPORT')}</h1>
          {isOltc && parentSerie && <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>{L('Transformateur parent', 'Parent transformer')} : SN {parentSerie}</div>}
          <div style={{ fontSize: 13, color: '#333', lineHeight: 2, borderTop: '2px solid #277da1', paddingTop: 18, marginTop: 8, minWidth: 280 }}>
            {eqVal('company') !== '—' && <div><b>{L('Client', 'Client')} :</b> {eqVal('company')}</div>}
            {eqVal('client') !== '—' && <div><b>{L('Localisation / Sous-station', 'Location / Substation')} :</b> {eqVal('client')}</div>}
            {projectNo && <div><b>{L('N° de projet', 'Project No.')} :</b> {projectNo}</div>}
            {cur?.sample_date && <div><b>{L("Date d'analyse", 'Analysis date')} :</b> {cur.sample_date}</div>}
            {dossier.serie && <div><b>{L('N° série', 'Serial No.')} :</b> {dossier.serie}</div>}
          </div>
        </section>
      )}

      {/* CONTENU avec en-tête/pied répétés via thead/tfoot (répétés ET réservant l'espace) */}
      <table className="rpt-runtable">
        <thead><tr><td>
          <div className="run-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {logoUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt="" style={{ maxHeight: 26, maxWidth: 80, objectFit: 'contain' }} />}
              <span style={{ fontWeight: 900, fontSize: 11 }}>{dossier.ident}</span>
              <span style={{ fontSize: 9, color: '#888' }}>{dossier.serie ? `SN ${dossier.serie}` : ''}{dossier.kv ? ` · ${dossier.kv} kV` : ''}</span>
            </div>
            <span style={{ fontSize: 9, color: '#888' }}>{L('Émis le', 'Issued')} {today}</span>
          </div>
        </td></tr></thead>
        <tfoot><tr><td>
          <div className="run-foot">
            <span>{L("RAPPORT D'ANALYSE", 'ANALYSIS REPORT')}{projectNo ? ` · ${L('N° de projet', 'Project No.')} ${projectNo}` : ''}</span>
            <span>{dossier.ident}</span>
          </div>
        </td></tr></tfoot>
        <tbody><tr><td>
        <div className="rpt-content">

      {/* PAGE COUVERTURE */}
      {pages.cover && (
        <section style={SP.page} className="rpt-page">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0 }}>{L("RAPPORT D'ANALYSE DE LABORATOIRE", 'LABORATORY ANALYSIS REPORT')}</h1>
            {logoUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt="" style={{ maxHeight: 54, maxWidth: 140, objectFit: 'contain' }} />}
          </div>

          <div style={SP.coverBar}>{L('Information de la commande', 'Order information')}</div>
          <table style={SP.coverTable}><tbody>
            <tr>
              <td style={SP.cLbl}>{L('Compagnie', 'Company')}</td><td style={SP.cVal}>{eqVal('company')}</td>
              <td style={SP.cLbl}>{L('ID échantillon', 'Sample ID')}</td><td style={SP.cVal}>{eqVal('sampleId')}</td>
              <td style={SP.cLbl}>{L('ID rapport', 'Report ID')}</td><td style={SP.cVal}>{eqVal('reportId')}</td>
            </tr>
            <tr>
              <td style={SP.cLbl}>{L('Contact', 'Contact')}</td><td style={SP.cVal}>{eqVal('contact')}</td>
              <td style={SP.cLbl}>{L("Date d'analyse", 'Analysis date')}</td><td style={SP.cVal}>{cur.sample_date}</td>
              <td style={SP.cLbl}>{L('N° de BC', 'PO No.')}</td><td style={SP.cVal}>{eqVal('poNo')}</td>
            </tr>
            <tr>
              <td style={SP.cLbl}>{L('Courriel', 'Email')}</td><td style={SP.cVal} colSpan={3}>{eqVal('email')}</td>
              <td style={SP.cLbl}>{L('N° de projet', 'Project No.')}</td><td style={SP.cVal}>{projectNo || '—'}</td>
            </tr>
          </tbody></table>

          <div style={{ ...SP.coverBar, marginTop: 12 }}>{L("Information de l'équipement", 'Equipment information')}</div>
          <table style={SP.coverTable}><tbody>
            <tr><td style={SP.cLbl}>{L('Nom', 'Name')}</td><td style={SP.cVal}>{eqVal('ident')}</td><td style={SP.cLbl}>{L('Classe kV', 'kV class')}</td><td style={SP.cVal}>{eqVal('kv')}</td><td style={SP.cLbl}>{L('Fabricant', 'Manufacturer')}</td><td style={SP.cVal}>{eqVal('manufacturer')}</td></tr>
            <tr><td style={SP.cLbl}>{L("Set d'alarme", 'Alarm set')}</td><td style={SP.cVal}>{eqVal('alarm')}</td><td style={SP.cLbl}>Max MVA</td><td style={SP.cVal}>{eqVal('mva')}</td><td style={SP.cLbl}>{L('Année', 'Year')}</td><td style={SP.cVal}>{eqVal('year')}</td></tr>
            <tr><td style={SP.cLbl}>Type</td><td style={SP.cVal}>{eqVal('description')}</td><td style={SP.cLbl}>{L("Type d'huile", 'Oil type')}</td><td style={SP.cVal}>{eqVal('oilType')}</td><td style={SP.cLbl}>{L('Préservation', 'Preservation')}</td><td style={SP.cVal}>{eqVal('preservation')}</td></tr>
            <tr><td style={SP.cLbl}>{L('Sous-station', 'Substation')}</td><td style={SP.cVal}>{eqVal('client')}</td><td style={SP.cLbl}>{L("Vol. d'huile (L)", 'Oil vol. (L)')}</td><td style={SP.cVal}>{eqVal('oilVol')}</td><td style={SP.cLbl}>{L('Papier A.T.', 'A.T. paper')}</td><td style={SP.cVal}>{eqVal('paperAT')}</td></tr>
            <tr><td style={SP.cLbl}>{L("N° d'équip.", 'Equip. No.')}</td><td style={SP.cVal}>{eqVal('equipNo')}</td><td style={SP.cLbl}>{L('N° série', 'Serial No.')}</td><td style={SP.cVal}>{eqVal('serie')}</td><td style={SP.cLbl}>{L('Catégorie', 'Category')}</td><td style={SP.cVal}>{eqVal('category')}</td></tr>
            <tr><td style={SP.cLbl}>{L('Appareil', 'Apparatus')}</td><td style={SP.cVal}>{eqVal('apparatus')}</td><td style={SP.cLbl}>{L('Refroid.', 'Cooling')}</td><td style={SP.cVal}>{eqVal('cooling')}</td><td style={SP.cLbl}>{L('Analysé par', 'Analyzed by')}</td><td style={SP.cVal}>{eqVal('analyzedBy')}</td></tr>
            <tr><td style={SP.cLbl}>{L("Point d'éch.", 'Sampling point')}</td><td style={SP.cVal}>{eqVal('samplePoint')}</td><td style={SP.cLbl}>{L('Autorisé par', 'Authorized by')}</td><td style={SP.cVal} colSpan={3}>{eqVal('authorizedBy')}</td></tr>
          </tbody></table>

          <div style={{ ...SP.coverBar, marginTop: 14, background: '#277da1' }}>{L('ANALYSE GLOBALE', 'GLOBAL ANALYSIS')}</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 4px' }}>
            <div style={{ ...SP.condBig, background: isOltc ? '#4f46e5' : COND_COLORS[worst], fontSize: 11, padding: '8px 10px' }}>{isOltc ? 'OLTC' : COND_LABELS[worst]}</div>
            <p style={{ fontSize: 11, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{isOltc ? L("Compartiment changeur de prises — interprétation selon IEEE C57.139 / CIGRE 443 (l'arc de commutation est normal ; voir l'interprétation détaillée).", 'Tap-changer compartment — interpreted per IEEE C57.139 / CIGRE 443 (switching arc is normal; see detailed interpretation).') : globalNote}</p>
          </div>
          {pcbV.code !== 'unknown' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '4px 4px' }}>
              <div style={{ ...SP.condBig, background: pcbV.color, fontSize: 11, padding: '8px 10px' }}>{pcbV.label}</div>
              <p style={{ fontSize: 11, lineHeight: 1.5, margin: 0 }}>{L('Teneur en BPC', 'PCB content')} : {pcbV.value != null ? `${pcbV.value} ppm` : '—'} — {pcbV.code === 'present' ? L('huile réglementée (≥ 50 ppm).', 'regulated oil (≥ 50 ppm).') : pcbV.code === 'trace' ? L('faible teneur (2–49 ppm).', 'low level (2–49 ppm).') : L('huile non-BPC (< 2 ppm).', 'non-PCB oil (< 2 ppm).')}</p>
            </div>
          )}
          {furan && (<><div style={{ ...SP.coverBar, marginTop: 8, background: '#2a9d8f' }}>{L('AUTRE', 'OTHER')}</div>
            <p style={{ fontSize: 11, lineHeight: 1.5, padding: '8px 4px', margin: 0 }}>{L('Isolation papier', 'Paper insulation')} : DP ≈ {furan.dp} — {furan.state}.</p></>)}
          {manualReco && manualReco.trim() && (<><div style={{ ...SP.coverBar, marginTop: 8, background: '#5a6b7a' }}>{L('Recommandation', 'Recommendation')}</div>
            <p style={{ fontSize: 11, lineHeight: 1.5, padding: '8px 4px', margin: 0, whiteSpace: 'pre-wrap' }}>{manualReco}</p></>)}
          {/* Graphique d'évolution (sous la description, optionnel) */}
          {pages.coverChart && data.length > 1 && (
            <div style={{ marginTop: 12, breakInside: 'avoid' }}>
              <div style={{ ...SP.coverBar, background: '#34607a' }}>{L('Évolution des gaz combustibles', 'Combustible gas evolution')}</div>
              <div style={{ padding: '8px 4px' }}><PrintEvolutionChart data={data} lang={lang} /></div>
            </div>
          )}
          {nextDate && (<div style={{ marginTop: 10, display: 'inline-block', background: due?.code === 'overdue' ? '#fdecea' : '#eef2f5', border: `1px solid ${due?.code === 'overdue' ? '#e63946' : '#cdd6dd'}`, borderRadius: 6, padding: '6px 12px', fontSize: 11 }}>
            <b>{L('Prochaine analyse', 'Next analysis')} :</b> {nextDate}{due?.days != null ? ` (${due.days < 0 ? `${-due.days} ${L('j. de retard', 'days late')}` : `${due.days} ${L('j. restants', 'days left')}`})` : ''}
          </div>)}
        </section>
      )}

      {/* PAGE RÉSULTATS */}
      {pages.results && (
        <section style={SP.page} className="rpt-page rpt-break">
          <div style={SP.sectionBar}>{L('Résultats (mesures)', 'Results (measurements)')}</div>
          <table style={SP.table}>
            <thead><tr><th style={SP.th}>{L('Paramètre', 'Parameter')}</th>{data.map((d, i) => <th key={d.id || i} style={SP.thR}>{d.sample_date}</th>)}<th style={SP.thR}>{L('Méthode', 'Method')}</th></tr></thead>
            <tbody>
              <tr><td colSpan={data.length + 2} style={SP.subHead}>DGA — IEEE C57.104</td></tr>
              {GAS_FIELDS.map(g => <tr key={g.u}><td style={SP.td}>{gl(g.u, lang)}</td>{data.map((d, i) => <td key={d.id || i} style={SP.tdR}>{(d as any)[g.key] ?? '—'}</td>)}<td style={SP.tdMethod}>D3612-17</td></tr>)}
              <tr><td style={SP.td}>TDCG</td>{data.map((d, i) => <td key={d.id || i} style={SP.tdR}>{Math.round(Number(d.tdcg) || 0)}</td>)}<td style={SP.tdMethod}>—</td></tr>
              {oilChart.length > 0 && <tr><td colSpan={data.length + 2} style={SP.subHead}>{L("Qualité de l'huile", 'Oil quality')} — ASTM</td></tr>}
              {OIL_FIELDS.map(f => data.some(d => d.oil_quality?.[f.key] != null) && (<tr key={f.key}><td style={SP.td}>{fl(f, lang)}</td>{data.map((d, i) => <td key={d.id || i} style={SP.tdR}>{d.oil_quality?.[f.key] ?? '—'}</td>)}<td style={SP.tdMethod}>{f.method}</td></tr>))}
              {FURAN_FIELDS.some(f => data.some(d => d.oil_quality?.[f.key] != null)) && <tr><td colSpan={data.length + 2} style={SP.subHead}>Furanes — D5837-15</td></tr>}
              {FURAN_FIELDS.map(f => data.some(d => d.oil_quality?.[f.key] != null) && (<tr key={f.key}><td style={SP.td}>{fl(f, lang)} (ppb)</td>{data.map((d, i) => <td key={d.id || i} style={SP.tdR}>{d.oil_quality?.[f.key] ?? '—'}</td>)}<td style={SP.tdMethod}>D5837-15</td></tr>))}
            </tbody>
          </table>
        </section>
      )}

      {/* PAGE ANALYSE & INTERPRÉTATION */}
      {pages.analysis && (
        <section style={SP.page} className="rpt-page rpt-break">
          <div style={SP.sectionBar}>{L('Analyse & interprétation', 'Analysis & interpretation')}</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ ...SP.condBig, background: isOltc ? '#4f46e5' : COND_COLORS[worst] }}>{isOltc ? 'OLTC' : COND_LABELS[worst]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 14 }}>{trendA.verdict}</div>
              <div style={{ fontSize: 11, lineHeight: 1.4, marginTop: 4 }}>{trendA.txt}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...SP.zoneBadge, background: ZONE_COLORS[zone.code] }}>{zone.code}</div>
              <div style={{ fontSize: 9, marginTop: 3, maxWidth: 90 }}>{zone.label}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={SP.h3}>🔍 {L('Interprétation DGA', 'DGA interpretation')}</div>
              {items.map((it, i) => <div key={i} style={{ ...SP.interp, ...interpStyle(it.lvl) }}>{it.txt}</div>)}
              <div style={SP.reco}><b style={{ color: '#ffd166' }}>{reco.title}</b><ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>{reco.steps.map((s, i) => <li key={i} style={{ fontSize: 10, marginBottom: 3 }}>{s}</li>)}</ul></div>
              {(() => {
                // Reprise d'échantillonnage recommandée (issue de l'analyse IA / réglages) — sur le rapport.
                const ex: any = (dossier as any).extra || {};
                const ta: string[] = Array.isArray(ex.targeted_analyses) ? ex.targeted_analyses : [];
                const tdays = Number(ex.targeted_days) || 0, tmonths = Number(ex.targeted_months) || 0;
                if (!ta.length && !ex.full_next_date) return null;
                return (
                  <div style={{ marginTop: 8, border: '1.5px solid #e63946', borderRadius: 8, padding: 10, background: '#fff5f5' }}>
                    <div style={{ fontWeight: 900, fontSize: 11, color: '#b00020' }}>🗓 {L('Reprise d’échantillonnage recommandée', 'Recommended resampling')}</div>
                    {ta.length > 0 && (
                      <div style={{ fontSize: 10, marginTop: 4 }}>
                        <b>{L('Suivi ciblé', 'Targeted follow-up')}{tdays ? ` — ${L('URGENT', 'URGENT')}` : ''} : </b>{nextDate || ex.next_date_manual || '—'}
                        {tdays ? ` (${L('dans', 'in')} ${tdays} ${L('jour(s)', 'day(s)')})` : tmonths ? ` (${tmonths} ${L('mois', 'months')})` : ''}
                        <div style={{ marginTop: 2 }}>{L('Analyses à reprendre', 'Analyses to repeat')} : <b>{ta.join(', ')}</b></div>
                      </div>
                    )}
                    {ex.full_next_date && <div style={{ fontSize: 10, marginTop: 4 }}><b>{L('Suivi complet', 'Full follow-up')} : </b>{ex.full_next_date} ({L('toutes les analyses', 'all analyses')})</div>}
                  </div>
                );
              })()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={SP.h3}>{L('Triangle de Duval 1', 'Duval Triangle 1')}</div>
              <div style={{ maxWidth: 240, margin: '0 auto 8px' }}>
                <DuvalTriangle points={data.map(m => ({ ch4: +(m.ch4 || 0), c2h2: +(m.c2h2 || 0), c2h4: +(m.c2h4 || 0), date: m.sample_date || undefined }))} selIdx={data.indexOf(cur)} lang={lang} />
              </div>
              {oilEval.length > 0 && (<><div style={SP.h3}>🛢️ {L('Interprétation qualité huile', 'Oil quality interpretation')}{dossier.kv ? ` (${voltageClass(dossier.kv, lang).label})` : ''}</div>
                {oilEval.map((it, i) => <div key={i} style={{ ...SP.interp, ...oilStyle(it.status) }}>{it.txt}</div>)}</>)}
              {furan && (<><div style={SP.h3}>{L("État de l'isolation papier", 'Paper insulation condition')}</div>
                <div style={{ textAlign: 'center', background: '#f8f2e7', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 22, color: furan.lvl === 'poor' ? '#9d0208' : furan.lvl === 'fair' ? '#c0651a' : '#2a9d8f' }}>DP ≈ {furan.dp}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{furan.state}</div>
                </div></>)}
              <div style={SP.h3}>{L('Ratios de Rogers', 'Rogers Ratios')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{Object.entries(rogers).map(([k, v]) => <div key={k} style={SP.ratioMini}><b>{(v as number).toFixed(2)}</b> {k}</div>)}</div>
            </div>
          </div>
        </section>
      )}

      {/* PAGE TENDANCES */}
      {pages.trends && (
        <section style={SP.page} className="rpt-page rpt-break">
          <div style={SP.sectionBar}>{L('TENDANCES', 'TRENDS')}</div>
          <div style={SP.chartGrid}>
            {combChart.map(c => <SvgTrend key={c.u} items={datedItems(m => (c.key === 'tdcg' ? (numOrNull(m.tdcg)) : numOrNull((m as any)[c.key])))} title={gl(c.u, lang)} color={c.c} limit={c.lim} />)}
          </div>
          {oilChart.length > 0 && (<>
            <div style={{ ...SP.sectionBar, marginTop: 14 }}>{L("Qualité de l'huile", 'Oil quality')}</div>
            <div style={SP.chartGrid}>
              {oilChart.map(f => <SvgTrend key={f.key} items={datedItems(m => numOrNull(m.oil_quality?.[f.key]))} title={fl(f, lang)} color="#277da1" />)}
            </div>
          </>)}
        </section>
      )}

      {/* PAGE PHOTOS */}
      {pages.photos && photos.length > 0 && (
        <section style={SP.page} className="rpt-page rpt-break">
          <div style={SP.sectionBar}>{L('Photos du transformateur', 'Transformer photos')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {photos.map(ph => (
              <div key={ph.id} style={{ breakInside: 'avoid' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.data} alt={ph.name || ''} style={{ width: '100%', borderRadius: 6, border: '1px solid #ddd' }} />
                {ph.name && <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>{ph.name}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PAGE RAPPORT D'ANOMALIE */}
      {pages.anomalies && anomReport.length > 0 && (
        <section style={SP.page} className="rpt-page rpt-break">
          <div style={SP.sectionBar}>{L("Rapport d'anomalie", 'Anomaly report')}</div>
          {anomReport.map(a => {
            const isAnom = a.kind === 'anomalie';
            const done = a.status === 'corrige';
            return (
              <div key={a.id} style={{ breakInside: 'avoid', border: '1px solid #e2e2e2', borderLeft: `4px solid ${isAnom ? '#e63946' : '#277da1'}`, borderRadius: 6, padding: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: isAnom ? '#9d0208' : '#277da1' }}>{isAnom ? '🔧 ' + L('Anomalie', 'Anomaly') : '💡 ' + L('Recommandation', 'Recommendation')}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: done ? '#dcfce7' : '#fef3c7', color: done ? '#15803d' : '#b45309' }}>{done ? L('Corrigé', 'Corrected') : L('À corriger', 'To fix')}</span>
                </div>
                {a.title && <div style={{ fontWeight: 700, fontSize: 12 }}>{a.title}</div>}
                {a.desc && <div style={{ fontSize: 11, lineHeight: 1.4, marginTop: 2, whiteSpace: 'pre-wrap' }}>{a.desc}</div>}
                {a.photos && a.photos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 6 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {a.photos.map(ph => <img key={ph.id} src={ph.data} alt={ph.name || ''} style={{ width: '100%', borderRadius: 4, border: '1px solid #ddd' }} />)}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* PAGE INSPECTION DE ROUTINE (dernière inspection) */}
      {pages.inspections && lastInspection && (
        <section style={SP.page} className="rpt-page rpt-break">
          <div style={SP.sectionBar}>{L('Inspection de routine', 'Routine inspection')}</div>
          <div style={{ fontSize: 11, marginBottom: 8 }}>
            <b>{L("Date d'inspection", 'Inspection date')} :</b> {lastInspection.date || '—'}
            {lastInspection.inspector ? <>{'   '}<b>{L('Inspecteur', 'Inspector')} :</b> {lastInspection.inspector}</> : null}
            {'   '}<b>{L('Anomalies', 'Anomalies')} :</b> {lastInspection.anomalyCount || 0}
          </div>
          {INSPECTION_CHECKLIST.map(cat => {
            const rows = cat.items.filter(it => (lastInspection.results || {})[it.key]?.status);
            if (!rows.length) return null;
            return (
              <div key={cat.id} style={{ breakInside: 'avoid', marginBottom: 6 }}>
                <div style={{ ...SP.subHead }}>{il(cat, lang)}</div>
                {rows.map(it => {
                  const r: any = (lastInspection.results || {})[it.key];
                  const col = r.status === 'anomalie' ? '#dc2626' : r.status === 'conforme' ? '#15803d' : '#777';
                  const lab = r.status === 'anomalie' ? L('Anomalie', 'Anomaly') : r.status === 'conforme' ? L('Conforme', 'Compliant') : 'N/A';
                  return (
                    <div key={it.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 9.5, padding: '2px 4px', borderBottom: '0.5px solid #eee' }}>
                      <span>{il(it, lang)}{r.note ? ` — ${r.note}` : ''}</span>
                      <span style={{ fontWeight: 700, color: col, flexShrink: 0 }}>{lab}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {(lang === 'en' ? lastInspection.advice?.en : lastInspection.advice?.fr) && (
            <div style={{ ...SP.reco, background: '#2b2118' }}>{lang === 'en' ? lastInspection.advice?.en : lastInspection.advice?.fr}</div>
          )}
          <p style={{ fontSize: 9, color: '#888', marginTop: 6 }}>{L('Les photos des anomalies figurent dans la section « Rapport d\'anomalie ».', 'Anomaly photos are in the "Anomaly report" section.')}</p>
        </section>
      )}
        </div>
        </td></tr></tbody>
      </table>
    </div>
  );
}

export default PrintReport;
