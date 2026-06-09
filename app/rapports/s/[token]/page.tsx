'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Page PUBLIQUE du vérificateur : ouvre un rapport partagé via un lien tokenisé (lecture seule, ou
// révision avec dépôt de commentaires). Aucune authentification ; tout passe par /api/rapports/share
// qui valide le token côté serveur. Aucune donnée du tenant n'est exposée hormis le rapport ciblé.
type Block = any;

const STATUS_FR: Record<string, string> = { in_progress: 'En cours', review: 'En révision', approved: 'Approuvé', sent: 'Envoyé', done: 'Terminé' };
const SEV: Record<string, { c: string; l: string }> = { critical: { c: '#9d0208', l: 'Critique' }, major: { c: '#e85d04', l: 'Majeure' }, minor: { c: '#e0a96d', l: 'Mineure' } };

export default function ShareViewerPage() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [err, setErr] = useState('');
  const [mode, setMode] = useState<'view' | 'review' | 'edit'>('view');
  const [canEdit, setCanEdit] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [draft, setDraft] = useState<Block[]>([]); // copie éditable des blocs (mode édition)
  const [dirty, setDirty] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/rapports/share?token=${encodeURIComponent(token)}`);
        const j = await r.json();
        if (!r.ok) { setErr(j.error || 'Lien invalide'); setState('error'); return; }
        setMode(j.mode); setCanEdit(!!j.canEdit); setReport(j.report); setLogo(j.logo || null); setReviews(j.reviews || []);
        setDraft(((j.report?.data?.blocks) || []).map((b: any) => ({ ...b })));
        setState('ok');
      } catch { setErr('Erreur de chargement'); setState('error'); }
    })();
  }, [token]);

  function setField(blockId: string, fieldId: string, value: string) {
    setDirty(true);
    setDraft(prev => prev.map(b => b.id === blockId ? { ...b, fields: (b.fields || []).map((f: any) => f.id === fieldId ? { ...f, value } : f) } : b));
  }
  function setInspect(blockId: string, itemId: string, patch: any) {
    setDirty(true);
    setDraft(prev => prev.map(b => b.id === blockId ? { ...b, items: (b.items || []).map((it: any) => it.id === itemId ? { ...it, ...patch } : it) } : b));
  }
  async function saveEdits() {
    setSavingEdit(true);
    const fields: any = {}; const inspects: any = {};
    draft.forEach(b => {
      if (b.type === 'section') { fields[b.id] = {}; (b.fields || []).forEach((f: any) => { fields[b.id][f.id] = f.value || ''; }); }
      if (b.type === 'inspect') { inspects[b.id] = {}; (b.items || []).forEach((it: any) => { inspects[b.id][it.id] = { state: it.state, note: it.note || '' }; }); }
    });
    try {
      const r = await fetch(`/api/rapports/share?token=${encodeURIComponent(token)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields, inspects }) });
      if (r.ok) { setDirty(false); setSavedEdit(true); setTimeout(() => setSavedEdit(false), 2500); }
      else { const j = await r.json(); alert(j.error || 'Erreur'); }
    } catch { alert('Erreur réseau'); }
    setSavingEdit(false);
  }

  async function submitComment() {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const r = await fetch(`/api/rapports/share?token=${encodeURIComponent(token)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, comment, blockRef: '' }),
      });
      if (r.ok) {
        setReviews(prev => [...prev, { id: Math.random().toString(36), author, comment, created_at: new Date().toISOString() }]);
        setComment(''); setSent(true); setTimeout(() => setSent(false), 2000);
      } else { const j = await r.json(); alert(j.error || 'Erreur'); }
    } catch { alert('Erreur réseau'); }
    setSending(false);
  }

  if (state === 'loading') return <Center>…</Center>;
  if (state === 'error') return <Center><div style={{ textAlign: 'center' }}><div style={{ fontSize: 40 }}>🔒</div><h1 style={{ fontFamily: 'Archivo, sans-serif' }}>Lien indisponible</h1><p style={{ color: '#64748b' }}>{err}</p></div></Center>;

  const r = report; const d = r.data || {}; const blocks: Block[] = d.blocks || [];
  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', fontFamily: "'Spline Sans', system-ui, sans-serif", color: '#0f172a' }}>
      {/* Bandeau */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo && <img src={logo} alt="" style={{ maxHeight: 30, maxWidth: 110, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 2 }} />}
          <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800 }}>Rapport partagé</span>
        </div>
        <span style={{ fontSize: 12, background: mode === 'edit' ? '#b45309' : mode === 'review' ? '#2a6f97' : '#475569', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>{mode === 'edit' ? '🛠 Édition (valeurs)' : mode === 'review' ? '✍ Révision' : '👁 Lecture seule'}</span>
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(12px,3vw,28px)' }}>
        {/* En-tête du rapport */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(16px,3vw,26px)', boxShadow: '0 2px 10px rgba(0,0,0,.05)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', margin: 0 }}>{r.title || '—'}</h1>
              <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{r.num ? `Dossier : ${r.num}` : ''}{d.client ? ` · ${d.client}` : ''}{d.date ? ` · ${d.date}` : ''}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#577590', padding: '4px 12px', borderRadius: 20 }}>{STATUS_FR[r.status] || r.status}</span>
          </div>
        </div>

        {canEdit && <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#9a3412', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>🛠 Vous pouvez saisir les <b>valeurs</b> (champs et inspections) puis enregistrer. La structure du rapport ne peut pas être modifiée.</div>}

        {/* Contenu (lecture seule, ou saisie des valeurs en mode édition) */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(16px,3vw,26px)', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          {(canEdit ? draft : blocks).length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Aucun contenu.</div>}
          {(canEdit ? draft : blocks).map((b, i) => <BlockView key={b.id || i} b={b} edit={canEdit} onField={setField} onInspect={setInspect} />)}
        </div>

        {canEdit && (
          <div style={{ position: 'sticky', bottom: 0, marginTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, background: 'linear-gradient(to top, #f1f5f9 60%, transparent)', padding: '12px 0' }}>
            {savedEdit && <span style={{ color: '#2a9d8f', fontWeight: 700, fontSize: 13 }}>✓ Enregistré</span>}
            <button onClick={saveEdits} disabled={savingEdit || !dirty} style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px 22px', background: '#b45309', color: '#fff', cursor: 'pointer', opacity: savingEdit || !dirty ? .55 : 1, boxShadow: '0 3px 12px rgba(0,0,0,.2)' }}>{savingEdit ? '…' : 'Enregistrer les valeurs'}</button>
          </div>
        )}

        {/* Révision */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(16px,3vw,26px)', boxShadow: '0 2px 10px rgba(0,0,0,.05)', marginTop: 16 }}>
          <h2 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16, marginTop: 0 }}>💬 Commentaires de révision {reviews.length > 0 ? `(${reviews.length})` : ''}</h2>
          {reviews.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun commentaire pour le moment.</div>}
          {reviews.map(rv => (
            <div key={rv.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}><b style={{ color: '#0f172a' }}>{rv.author || 'Vérificateur'}</b> · {String(rv.created_at).slice(0, 16).replace('T', ' ')}</div>
              <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{rv.comment}</div>
            </div>
          ))}
          {mode === 'review' ? (
            <div style={{ marginTop: 14, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Votre nom" style={inp} />
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Votre commentaire de révision…" style={{ ...inp, minHeight: 90, resize: 'vertical', marginTop: 8 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <button onClick={submitComment} disabled={sending || !comment.trim()} style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 18px', background: '#2a6f97', color: '#fff', cursor: 'pointer', opacity: sending || !comment.trim() ? .6 : 1 }}>{sending ? '…' : 'Envoyer le commentaire'}</button>
                {sent && <span style={{ color: '#2a9d8f', fontWeight: 700, fontSize: 13 }}>✓ Envoyé</span>}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>Ce lien est en lecture seule.</div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: '18px 0' }}>C-Secur360 · Rapport terrain</div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: "'Spline Sans', sans-serif" };

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#475569', fontFamily: "'Spline Sans', sans-serif" }}>{children}</div>;
}

function SecBar({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#1e293b', color: '#fff', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 13, padding: '7px 12px', borderRadius: 6, margin: '18px 0 8px' }}>{children}</div>;
}

function BlockView({ b, edit, onField, onInspect }: { b: Block; edit?: boolean; onField?: (bid: string, fid: string, v: string) => void; onInspect?: (bid: string, iid: string, patch: any) => void }) {
  if (b.type === 'section') return (
    <div>
      <SecBar>{b.title || 'Section'}</SecBar>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><tbody>
        {(b.fields || []).map((f: any) => (
          <tr key={f.id}>
            <td style={{ background: '#eef2f5', fontWeight: 600, padding: '5px 8px', border: '0.5px solid #dde5ea', width: '40%' }}>{f.label}</td>
            <td style={{ padding: edit ? 2 : '5px 8px', border: '0.5px solid #dde5ea' }}>
              {edit
                ? <input value={f.value || ''} onChange={e => onField?.(b.id, f.id, e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', fontSize: 13, background: f.value ? '#fff' : '#fffaf0' }} />
                : (f.value || '—')}
            </td>
          </tr>
        ))}
      </tbody></table>
    </div>
  );
  if (b.type === 'table' && (b.columns || []).length > 0) return (
    <div>
      <SecBar>{b.title || 'Tableau'}</SecBar>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr>{b.columns.map((c: string, i: number) => <th key={i} style={{ background: '#34495e', color: '#fff', padding: '5px 8px', border: '0.5px solid #2c3e50', textAlign: 'left' }}>{c}</th>)}</tr></thead>
          <tbody>{(b.rows || []).map((row: any[], ri: number) => <tr key={ri}>{b.columns.map((_: any, ci: number) => <td key={ci} style={{ padding: '5px 8px', border: '0.5px solid #dde5ea' }}>{row[ci] || ''}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
  if (b.type === 'inspect' && (b.items || []).length > 0) {
    const STATES = [['good', 'Conforme', '#2a9d8f'], ['anomaly', 'Anomalie', '#9d0208'], ['na', 'N/A', '#64748b'], ['nv', 'N/V', '#b45309']] as const;
    return (
      <div>
        <SecBar>{b.title || 'Inspection'}</SecBar>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><tbody>
          {(b.items || []).map((it: any) => {
            const anom = it.state === 'anomaly';
            if (edit) return (
              <tr key={it.id}>
                <td style={{ padding: '5px 8px', border: '0.5px solid #dde5ea' }}>
                  <div>{it.label || '—'}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {STATES.map(([st, lbl, col]) => (
                      <button key={st} onClick={() => onInspect?.(b.id, it.id, { state: st })} style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${col}`, background: it.state === st ? col : '#fff', color: it.state === st ? '#fff' : col }}>{lbl}</button>
                    ))}
                    <input value={it.note || ''} onChange={e => onInspect?.(b.id, it.id, { note: e.target.value })} placeholder="Note…" style={{ flex: 1, minWidth: 100, border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12 }} />
                  </div>
                </td>
              </tr>
            );
            return <tr key={it.id}><td style={{ padding: '5px 8px', border: '0.5px solid #dde5ea' }}>{anom && <b style={{ color: '#9d0208' }}>⚠ </b>}{it.label || '—'}{it.note ? <span style={{ color: '#64748b' }}> — {it.note}</span> : ''}</td><td style={{ padding: '5px 8px', border: '0.5px solid #dde5ea', textAlign: 'center', width: '22%', color: anom ? '#9d0208' : '#2a9d8f', fontWeight: anom ? 700 : 400 }}>{anom ? (SEV[it.severity]?.l || 'Anomalie') : (it.state === 'na' ? 'N/A' : 'Conforme')}</td></tr>;
          })}
        </tbody></table>
      </div>
    );
  }
  if (b.type === 'text') return <p style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: '12px 0' }}>{b.value}</p>;
  if (b.type === 'photos') return (
    <div>
      <SecBar>{b.title || 'Photos'}</SecBar>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,160px),1fr))', gap: 8 }}>
        {(b.photos || []).filter((p: any) => p.data).map((p: any) => (
          <figure key={p.id} style={{ margin: 0 }}><img src={p.data} alt="" style={{ width: '100%', borderRadius: 8, border: '1px solid #e2e8f0' }} />{p.caption && <figcaption style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.caption}</figcaption>}</figure>
        ))}
      </div>
    </div>
  );
  if (b.type === 'pdfpage') return (
    <div>
      <SecBar>📄 {b.name || 'Document'}</SecBar>
      {(b.pages || []).map((pg: string, i: number) => <img key={i} src={pg} alt="" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8 }} />)}
    </div>
  );
  return null;
}
