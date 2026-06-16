'use client';

// Rapport SOUMISSION imprimable (HTML), même qualité/structure que les rapports DGA/terrain :
// PAGE DE GARDE + lettre de présentation soignée + en-tête/pied répétés (run-table) + barres de section.
// Visible UNIQUEMENT à l'impression (classe .soum-print-only). Sections cochables à l'export.
import React from 'react';
import {
  computeLigneMontant, computeItemTotal, computeSoumissionTotal, applyMarkup,
  CATEGORIE_LABELS, type CatalogueTaux, type Soumission, type SoumissionItem, type Categorie,
} from '@/lib/soumissions';

const CATS: Categorie[] = ['mo_bureau', 'mo_chantier', 'voyagement', 'subsistance', 'hebergement', 'materiaux'];
const money = (n: number) => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';

export type SoumissionSections = { cover: boolean; items: boolean; conditions: boolean; rates: boolean };

export function SoumissionPrintReport(props: {
  soumission: Soumission; items: SoumissionItem[]; cat: CatalogueTaux | null;
  companyName: string; logo: string | null; headerColor: string;
  sections: SoumissionSections; breakdownMode: 'detaille' | 'par_item' | 'global_desc';
  conditions: { titre: string; contenu: string }[];
  preparedBy?: string;
  cover?: { to?: string; date?: string; body?: string; salutation?: string; signataire_nom?: string; signataire_titre?: string; signature_url?: string | null; ville?: string } | null;
}) {
  const { soumission: s, items, cat, companyName, logo, headerColor, sections, breakdownMode, conditions, cover, preparedBy } = props;
  const band = headerColor || '#0f52ba';
  const raw = computeSoumissionTotal(items, cat);
  const final = applyMarkup(raw, s.markup_pct);
  const mode = breakdownMode || 'detaille';
  const today = new Date().toLocaleDateString('fr-CA');
  const clientName = s.client_snapshot?.name || '—';
  const projet = (s.client_snapshot as any)?.projet || '';

  const SP: Record<string, React.CSSProperties> = {
    wrap: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#1a1a1a', fontSize: 11 },
    sectionBar: { background: band, color: '#fff', fontWeight: 700, fontSize: 12, padding: '6px 10px', borderRadius: 4, margin: '14px 0 8px' },
    itemHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1.5px solid ${band}`, paddingBottom: 3, margin: '10px 0 6px' },
    catLbl: { fontWeight: 700, fontSize: 8.5, color: '#777', textTransform: 'uppercase', margin: '6px 0 2px' },
    row: { display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', borderBottom: '0.5px solid #eee', fontSize: 10 },
    calc: { color: '#888', fontSize: 9, flex: 1, textAlign: 'right', paddingRight: 8 },
    totalBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#fff', borderRadius: 6, padding: '10px 14px', marginTop: 14, fontSize: 14, fontWeight: 800 },
    rateRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '0.5px solid #eee', fontSize: 10.5 },
  };

  const ligneRemplie = (l: any) => computeLigneMontant(l, cat) > 0 || (l.description && l.description.trim());
  const ligneCalcul = (l: any): string => {
    const c = l.categorie;
    if (c === 'mo_bureau' || c === 'mo_chantier') {
      const taux = c === 'mo_bureau' ? (cat?.taux_mo_bureau || 0) : (cat?.taux_mo_chantier || 0);
      const parts: string[] = [];
      if (Number(l.reg)) parts.push(`${l.reg} h rég`);
      if (Number(l.supp)) parts.push(`${l.supp} h supp`);
      if (Number(l.maj)) parts.push(`${l.maj} h maj`);
      return `${Number(l.tech) || 1} tech × ${parts.join(' + ') || '0 h'} × ${money(taux)}/h`;
    }
    if (c === 'voyagement') return `${Number(l.tech) || 1} véh × ${Number(l.quantity) || 0} km × ${money(Number(l.unit_cost) || 0)}/km`;
    if (c === 'materiaux') return `${Number(l.quantity) || 0} × ${money(Number(l.unit_cost) || 0)}${Number(l.maj) ? ` + marge ${l.maj} %` : ''}`;
    return `${Number(l.quantity) || 0} × ${money(Number(l.unit_cost) || 0)}`;
  };

  return (
    <div className="soum-print-only" style={SP.wrap}>
      {/* ══ PAGE DE GARDE (toujours) ══ */}
      <div className="soum-title" style={{ pageBreakAfter: 'always', position: 'relative', minHeight: '250mm' }}>
        <div style={{ height: 10, background: band }} />
        <div style={{ padding: '0 6mm' }}>
          {logo && <img src={logo} alt="" style={{ height: 54, marginTop: 24 }} />}
          <div style={{ marginTop: '70mm', textAlign: 'center' }}>
            <div style={{ fontSize: 13, letterSpacing: 3, color: '#888', fontWeight: 700 }}>OFFRE DE SERVICE</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: band, margin: '6px 0 2px' }}>SOUMISSION</div>
            <div style={{ fontSize: 16, color: '#444', fontWeight: 700 }}>N° {s.numero}{s.revision && s.revision > 1 ? ` · rév. ${s.revision}` : ''}</div>
          </div>
          <table style={{ width: '80%', margin: '24mm auto 0', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              {[
                ['Client', clientName],
                ['Projet / mandat', projet || '—'],
                ['Lieu', s.client_snapshot?.lieu || '—'],
                ['Date', today],
                ['Préparé par', preparedBy || cover?.signataire_nom || companyName || '—'],
                ['Montant total', money(final)],
              ].map(([k, v], i) => (
                <tr key={i} style={{ borderBottom: '0.5px solid #e5e5e5' }}>
                  <td style={{ padding: '7px 8px', color: '#888', fontWeight: 600, width: '40%' }}>{k}</td>
                  <td style={{ padding: '7px 8px', fontWeight: 700, color: i === 5 ? band : '#222', fontSize: i === 5 ? 15 : 12 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: band }} />
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#888' }}>{companyName || 'C-Secur360'}</div>
      </div>

      {/* ══ LETTRE DE PRÉSENTATION (si cochée) ══ */}
      {sections.cover && cover && (
        <div className="soum-letter" style={{ pageBreakAfter: 'always', minHeight: '250mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${band}`, paddingBottom: 10, marginBottom: 24 }}>
            {logo ? <img src={logo} alt="" style={{ height: 42 }} /> : <span style={{ fontWeight: 800, fontSize: 16, color: band }}>{companyName || 'C-Secur360'}</span>}
            <div style={{ textAlign: 'right', fontSize: 10, color: '#666' }}>{companyName || 'C-Secur360'}<br />Soumission {s.numero}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#444', marginBottom: 22 }}>{cover.ville ? `${cover.ville}, ` : ''}{cover.date || today}</div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{cover.to || clientName}</div>
          {s.client_snapshot?.lieu && <div style={{ fontSize: 11, color: '#555' }}>{s.client_snapshot.lieu}</div>}
          <div style={{ margin: '20px 0 4px', fontWeight: 700 }}>Objet : Soumission {s.numero}{projet ? ` — ${projet}` : ''}</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginTop: 12 }}>{cover.body || ''}</div>
          <div style={{ marginTop: 18, fontSize: 11.5, lineHeight: 1.6 }}>{cover.salutation || ''}</div>
          {/* Signature légale + soumission faite par */}
          <div style={{ marginTop: 36 }}>
            {cover.signature_url && <img src={cover.signature_url} alt="" style={{ height: 50, display: 'block', marginBottom: 2 }} />}
            <div style={{ borderTop: '1px solid #999', width: 230, paddingTop: 3 }}>
              <div style={{ fontWeight: 700 }}>{cover.signataire_nom || preparedBy || '—'}</div>
              <div style={{ fontSize: 10, color: '#666' }}>{cover.signataire_titre || ''}{companyName ? ` · ${companyName}` : ''}</div>
              <div style={{ fontSize: 9.5, color: '#999', marginTop: 4 }}>Soumission préparée par : {preparedBy || cover.signataire_nom || companyName || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CORPS (en-tête/pied répétés) ══ */}
      <table className="soum-runtable" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><td>
            <div className="run-head" style={{ borderBottomColor: band }}>
              {logo ? <img src={logo} alt="" style={{ height: 26 }} /> : <span style={{ fontWeight: 700 }}>{companyName || 'C-Secur360'}</span>}
              <span style={{ fontSize: 9, color: '#555', textAlign: 'right' }}>{companyName || 'C-Secur360'}<br />Soumission {s.numero}{s.revision && s.revision > 1 ? ` · rév. ${s.revision}` : ''}</span>
            </div>
          </td></tr>
        </thead>
        <tfoot><tr><td><div className="run-foot">{companyName || 'C-Secur360'} · Soumission {s.numero} · {today}</div></td></tr></tfoot>
        <tbody>
          <tr><td>
            <div style={{ ...SP.sectionBar }}>SOUMISSION {s.numero}</div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{clientName}</div>
            {(() => { const meta = [s.client_snapshot?.lieu, s.year ? `Année ${s.year}` : '', companyName].filter(Boolean).join('  ·  '); return meta ? <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>{meta}</div> : null; })()}

            {/* Détail des items / coûts */}
            {sections.items && items.map((it, i) => {
              const itTotal = computeItemTotal(it, cat);
              return (
                <div key={i} className="soum-avoid" style={{ breakInside: 'avoid' }}>
                  <div style={SP.itemHead}>
                    <span style={{ fontWeight: 700, fontSize: 12 }}>{it.name || `Item ${i + 1}`}</span>
                    {mode !== 'global_desc' && <span style={{ fontWeight: 700, fontSize: 12 }}>{money(itTotal)}</span>}
                  </div>
                  {mode === 'par_item' ? (
                    (it.lignes || []).filter(ligneRemplie).map((l, j) => {
                      const d = l.description || CATEGORIE_LABELS[l.categorie] || '';
                      return d ? <div key={j} style={{ fontSize: 10, color: '#5a5a5a', padding: '1px 0 1px 10px' }}>• {d}</div> : null;
                    })
                  ) : CATS.map(c => {
                    const ls = (it.lignes || []).filter(l => l.categorie === c && (mode === 'global_desc' ? (l.description && l.description.trim()) : ligneRemplie(l)));
                    if (!ls.length) return null;
                    return (
                      <div key={c}>
                        <div style={SP.catLbl}>{String(CATEGORIE_LABELS[c] || c)}</div>
                        {ls.map((l, j) => {
                          const desc = l.description || CATEGORIE_LABELS[c] || '';
                          if (mode === 'global_desc') return <div key={j} style={{ fontSize: 10, padding: '1px 0 1px 10px' }}>{desc}</div>;
                          return (
                            <div key={j} style={SP.row}>
                              <span style={{ flex: 1 }}>{desc}</span>
                              <span style={SP.calc}>{ligneCalcul(l)}</span>
                              <span style={{ fontWeight: 600, minWidth: 70, textAlign: 'right' }}>{money(computeLigneMontant(l, cat))}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Liste de taux */}
            {sections.rates && cat && (
              <div className="soum-avoid" style={{ breakInside: 'avoid' }}>
                <div style={SP.sectionBar}>LISTE DE TAUX</div>
                <div style={SP.rateRow}><span>Main-d’œuvre bureau</span><span>{money(cat.taux_mo_bureau || 0)} /h</span></div>
                <div style={SP.rateRow}><span>Main-d’œuvre chantier</span><span>{money(cat.taux_mo_chantier || 0)} /h</span></div>
                <div style={SP.rateRow}><span>Majoration temps supplémentaire</span><span>× {(cat as any).mult_supp ?? 1.5}</span></div>
                <div style={SP.rateRow}><span>Majoration temps double</span><span>× {(cat as any).mult_maj ?? 2}</span></div>
                {Object.entries({ km: 'Kilométrage (/km)', sub_h5: 'Subsistance 5h', sub_h12: 'Subsistance 12h', sub_h15: 'Subsistance 15h', sub_nuitee: 'Subsistance nuitée', hebergement: 'Hébergement', fuel_price: 'Carburant (/L)' } as Record<string, string>)
                  .filter(([k]) => (cat as any).extras?.[k] != null)
                  .map(([k, lbl]) => <div key={k} style={SP.rateRow}><span>{lbl}</span><span>{money(Number((cat as any).extras[k]) || 0)}</span></div>)}
                {((cat as any).custom_rates || []).map((r: any, i: number) => <div key={i} style={SP.rateRow}><span>{r.label || '—'}</span><span>{money(Number(r.value) || 0)}</span></div>)}
              </div>
            )}

            {/* Total final */}
            <div style={SP.totalBox}>
              <span>TOTAL{s.markup_pct ? ` (majoration ${s.markup_pct} %)` : ''}</span>
              <span>{money(final)}</span>
            </div>

            {/* Conditions et modalités */}
            {sections.conditions && conditions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={SP.sectionBar}>CONDITIONS ET MODALITÉS</div>
                {conditions.map((c, i) => (
                  <div key={i} style={{ breakInside: 'avoid', marginBottom: 8 }}>
                    {c.titre && <div style={{ fontWeight: 700, fontSize: 10.5, color: band, marginBottom: 2 }}>{c.titre}</div>}
                    <div style={{ fontSize: 10, lineHeight: 1.35, whiteSpace: 'pre-wrap', color: '#333' }}>{c.contenu}</div>
                  </div>
                ))}
              </div>
            )}
          </td></tr>
        </tbody>
      </table>
    </div>
  );
}

export const SOUM_PRINT_CSS = `
@media screen { .soum-print-only { display: none !important; } }
@media print {
  @page { size: letter portrait; margin: 12mm; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(.soum-print-only) { display: none !important; }
  body * { visibility: hidden !important; }
  .soum-print-only, .soum-print-only * { visibility: visible !important; }
  .soum-print-only { display: block !important; position: static; width: 100%; color: #1a1a1a; }
  .soum-title, .soum-letter { box-sizing: border-box; }
  .soum-runtable { width: 100%; border-collapse: collapse; }
  .soum-runtable thead { display: table-header-group; }
  .soum-runtable tfoot { display: table-footer-group; }
  .soum-runtable > tbody > tr > td, .soum-runtable > thead > tr > td, .soum-runtable > tfoot > tr > td { padding: 0; border: none; }
  .run-head { display: flex !important; align-items: center; justify-content: space-between; padding: 0 1mm 4px; margin-bottom: 8px; height: 12mm; border-bottom: 1.5px solid #0f52ba; background: #fff; }
  .run-foot { display: flex !important; align-items: center; justify-content: center; padding: 4px 1mm 0; margin-top: 8px; height: 8mm; font-size: 8.5px; color: #888; border-top: 1px solid #ddd; background: #fff; }
  .soum-avoid, .soum-runtable table { break-inside: avoid; page-break-inside: avoid; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
}
`;
