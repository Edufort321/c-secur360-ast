'use client';
// Éditeur de causerie sécurité (TBM) / observation (BBS) — version riche :
//  • MULTI-LIGNES : liste de participants (recherche dynamique du personnel + présence) et liste de
//    points abordés (autant de lignes que voulu).
//  • ENREGISTREMENT : dictée vocale (Web Speech API → transcription), captation AUDIO et VIDÉO de la
//    séance (MediaRecorder → bucket public hse-meetings), et/ou LIEN d'une séance Teams/Zoom/Meet.
// Donnée opérationnelle (pas de donnée santé). La saisie libre reste permise (sous-traitants/tiers).
import React, { useEffect, useRef, useState } from 'react';
import {
  Plus, Trash2, Loader2, Mic, MicOff, Video, Square, Link2, Radio, FileAudio, FileVideo, X, Save, FileDown, PenLine,
} from 'lucide-react';
import { EntitySearch, type EntityOption } from '@/components/ui/EntitySearch';
import { useTenantDirectory } from '@/lib/useTenantDirectory';
import {
  saveSafetyMeeting, uploadMeetingMedia,
  type HseSafetyMeeting, type HseParticipant, type HsePoint, type HseMedia,
} from '@/lib/hse/safetyMeetings';
import { generateCauseriePdf } from '@/lib/hse/causeriePdf';
import { SignaturePad } from '@/components/ui/SignaturePad';

const today = () => new Date().toISOString().slice(0, 10);

export function blankMeeting(): HseSafetyMeeting {
  return { kind: 'tbm', meeting_date: today(), location: '', topic: '', attendees: '', notes: '', participants: [], points: [], media: [], meeting_url: '', transcript: '' };
}

export default function CauserieEditor({ tenant, value, userEmail, lang, onSaved, onCancel }: {
  tenant: string; value: HseSafetyMeeting; userEmail?: string; lang: 'fr' | 'en';
  onSaved: () => void; onCancel: () => void;
}) {
  const fr = lang === 'fr';
  const t = (a: string, b: string) => (fr ? a : b);
  const { personnel, projects } = useTenantDirectory(tenant);
  const [f, setF] = useState<HseSafetyMeeting>({ ...blankMeeting(), ...value, participants: value.participants || [], points: value.points || [], media: value.media || [] });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [sigOpen, setSigOpen] = useState<number | null>(null);   // participant dont le pad de signature est ouvert
  const inp = 'mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
  const lbl = 'text-xs font-semibold text-gray-500';

  // ── helpers de liste ───────────────────────────────────────────────────────
  const set = (patch: Partial<HseSafetyMeeting>) => setF(p => ({ ...p, ...patch }));
  const parts = f.participants || []; const points = f.points || []; const media = f.media || [];
  const addPart = () => set({ participants: [...parts, { name: '', present: true }] });
  const upPart = (i: number, p: Partial<HseParticipant>) => set({ participants: parts.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const delPart = (i: number) => set({ participants: parts.filter((_, j) => j !== i) });
  const addPoint = () => set({ points: [...points, { text: '' }] });
  const upPoint = (i: number, text: string) => set({ points: points.map((x, j) => (j === i ? { text } : x)) });
  const delPoint = (i: number) => set({ points: points.filter((_, j) => j !== i) });
  const addMedia = (m: HseMedia) => setF(p => ({ ...p, media: [...(p.media || []), m] }));
  const delMedia = (i: number) => set({ media: media.filter((_, j) => j !== i) });

  // ── dictée vocale (Web Speech API) ─────────────────────────────────────────
  const recogRef = useRef<any>(null);
  const [dictating, setDictating] = useState(false);
  const baseTranscript = useRef('');
  const speechOk = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  function toggleDictation() {
    if (dictating) { try { recogRef.current?.stop(); } catch {} setDictating(false); return; }
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) return;
    const r = new Rec(); r.lang = fr ? 'fr-CA' : 'en-CA'; r.continuous = true; r.interimResults = true;
    baseTranscript.current = (f.transcript || '').trim();
    r.onresult = (e: any) => {
      let finalTxt = ''; let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTxt += tr + ' '; else interim += tr;
      }
      if (finalTxt.trim()) {
        // Chaque segment finalisé est HORODATÉ sur sa propre ligne ([HH:MM]).
        const ts = new Date().toLocaleTimeString(fr ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' });
        baseTranscript.current = (baseTranscript.current + `\n[${ts}] ` + finalTxt.trim()).trim();
      }
      setF(p => ({ ...p, transcript: (baseTranscript.current + (interim ? ' ' + interim : '')).trim() }));
    };
    r.onerror = () => { setDictating(false); };
    r.onend = () => { if (recogRef.current === r && dictating) { try { r.start(); } catch {} } };
    recogRef.current = r; try { r.start(); setDictating(true); } catch {}
  }

  // ── captation audio/vidéo (MediaRecorder) ──────────────────────────────────
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [recMode, setRecMode] = useState<'audio' | 'video' | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Sélection de la caméra et du micro AVANT de démarrer (énumération des périphériques).
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState('');
  const [micId, setMicId] = useState('');
  async function refreshDevices() {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const cams = devs.filter(d => d.kind === 'videoinput'); const ms = devs.filter(d => d.kind === 'audioinput');
      setCameras(cams); setMics(ms);
      setCamId(prev => prev || cams[0]?.deviceId || ''); setMicId(prev => prev || ms[0]?.deviceId || '');
    } catch { /* énumération indisponible */ }
  }
  useEffect(() => { refreshDevices(); /* eslint-disable-next-line */ }, []);

  async function startRec(mode: 'audio' | 'video') {
    try {
      const audioC: any = micId ? { deviceId: { exact: micId } } : true;
      const videoC: any = { width: 1280, ...(camId ? { deviceId: { exact: camId } } : {}) };
      const stream = await navigator.mediaDevices.getUserMedia(mode === 'video' ? { audio: audioC, video: videoC } : { audio: audioC });
      refreshDevices(); // les libellés des périphériques deviennent visibles une fois la permission accordée
      streamRef.current = stream;
      if (mode === 'video' && previewRef.current) { previewRef.current.srcObject = stream; previewRef.current.muted = true; await previewRef.current.play().catch(() => {}); }
      const mime = mode === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mode === 'video' ? 'video/webm' : 'audio/webm' });
        stream.getTracks().forEach(tk => tk.stop()); streamRef.current = null;
        if (previewRef.current) previewRef.current.srcObject = null;
        setUploading(mode === 'video' ? t('Téléversement de la vidéo…', 'Uploading video…') : t('Téléversement de l’audio…', 'Uploading audio…'));
        const res = await uploadMeetingMedia(tenant, blob, 'webm');
        setUploading(null);
        if (res.url) addMedia({ kind: mode, url: res.url, path: res.path, label: `${mode === 'video' ? '🎥' : '🎙️'} ${new Date().toLocaleString(fr ? 'fr-CA' : 'en-CA')}` });
        else alert((fr ? 'Échec du téléversement : ' : 'Upload failed: ') + (res.error || ''));
      };
      mediaRecRef.current = mr; mr.start(); setRecMode(mode); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (e: any) {
      alert(t('Micro/caméra inaccessible : ', 'Mic/camera unavailable: ') + (e?.message || ''));
    }
  }
  function stopRec() {
    try { mediaRecRef.current?.stop(); } catch {}
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecMode(null);
  }
  useEffect(() => () => { // nettoyage au démontage
    try { recogRef.current?.stop(); } catch {}
    try { mediaRecRef.current?.stop(); } catch {}
    streamRef.current?.getTracks().forEach(tk => tk.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);
  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── lien de séance / d'enregistrement (Teams/Zoom/Meet) ────────────────────
  const [linkVal, setLinkVal] = useState('');
  function addLink() {
    const url = linkVal.trim(); if (!url) return;
    addMedia({ kind: 'link', url, label: t('Enregistrement / séance', 'Recording / session') });
    setLinkVal('');
  }

  // ── export PDF (style DGA + feuille de présence signée) ────────────────────
  const [pdfBusy, setPdfBusy] = useState(false);
  async function exportPdf() {
    setPdfBusy(true);
    const attendees = parts.length ? parts.map(p => p.name).filter(Boolean).join(', ') : (f.attendees || '');
    try { await generateCauseriePdf({ meeting: { ...f, attendees }, lang, tenant }); }
    catch (e: any) { alert((fr ? 'Échec de l’export PDF : ' : 'PDF export failed: ') + (e?.message || '')); }
    finally { setPdfBusy(false); }
  }

  async function submit() {
    setBusy(true);
    // Synchronise le résumé texte « attendees » (rétrocompat dashboard) à partir des participants.
    const attendees = parts.length ? parts.map(p => p.name).filter(Boolean).join(', ') : (f.attendees || '');
    const r = await saveSafetyMeeting(tenant, { ...f, attendees, created_by: userEmail || null });
    setBusy(false);
    if (r.error) { alert((fr ? 'Échec de l’enregistrement : ' : 'Save failed: ') + r.error); return; }
    onSaved();
  }

  const card = 'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
  const recording = recMode !== null;

  return (
    <div className={`${card} space-y-5`}>
      {/* En-tête */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={lbl}>{t('Type', 'Type')}
          <select value={f.kind} onChange={e => set({ kind: e.target.value as any })} className={inp}>
            <option value="tbm">{t('Causerie sécurité (TBM)', 'Toolbox talk (TBM)')}</option>
            <option value="observation">{t('Observation sécurité', 'Safety observation')}</option>
          </select>
        </label>
        <label className={lbl}>{t('Date', 'Date')}<input type="date" value={f.meeting_date} onChange={e => set({ meeting_date: e.target.value })} className={inp} /></label>
        <label className={lbl}>{t('Lieu / chantier', 'Location / site')}
          <div className="mt-1"><EntitySearch value={f.location || ''} onText={v => set({ location: v })} onPick={(o: EntityOption) => set({ location: o.label })} options={projects} placeholder={t('Chantier ou lieu…', 'Site or location…')} /></div>
        </label>
        <label className={lbl}>{t('Sujet', 'Topic')}<input value={f.topic || ''} onChange={e => set({ topic: e.target.value })} className={inp} /></label>
        <label className={lbl}>{t('Lien de séance (Teams/Zoom/Meet)', 'Session link (Teams/Zoom/Meet)')}
          <input value={f.meeting_url || ''} onChange={e => set({ meeting_url: e.target.value })} placeholder="https://teams.microsoft.com/…" className={inp} />
        </label>
        <label className={lbl}>{t('Durée (min)', 'Duration (min)')}<input type="number" min={0} value={f.duration_min ?? ''} onChange={e => set({ duration_min: e.target.value === '' ? null : Number(e.target.value) })} className={inp} /></label>
      </div>

      {/* Participants (multi-lignes) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-bold">{t('Participants', 'Attendees')} ({parts.length})</h4>
          <button onClick={addPart} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700"><Plus size={13} /> {t('Ajouter un participant', 'Add attendee')}</button>
        </div>
        <div className="space-y-2">
          {parts.map((p, i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-1.5 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="flex-1"><EntitySearch value={p.name} onText={v => upPart(i, { name: v })} onPick={(o: EntityOption) => upPart(i, { name: o.label, role: o.sub || p.role })} options={personnel} placeholder={t('Nom du participant…', 'Attendee name…')} /></div>
                <input value={p.role || ''} onChange={e => upPart(i, { role: e.target.value })} placeholder={t('Poste', 'Role')} className="w-32 rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900" />
                <label className="flex items-center gap-1 text-xs text-gray-500" title={t('Présent', 'Present')}><input type="checkbox" checked={p.present !== false} onChange={e => upPart(i, { present: e.target.checked })} /> {t('Présent', 'Present')}</label>
                <button onClick={() => setSigOpen(sigOpen === i ? null : i)} className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${p.signature ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/10' : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600'}`}>
                  <PenLine size={12} /> {p.signature ? t('Signé', 'Signed') : t('Signer', 'Sign')}
                </button>
                <button onClick={() => delPart(i)} className="text-rose-500 hover:text-rose-700"><Trash2 size={15} /></button>
              </div>
              {sigOpen === i && (
                <div className="mt-2 max-w-sm">
                  <SignaturePad value={p.signature || ''} onChange={dataUrl => upPart(i, { signature: dataUrl })} label={t('Signature de ', 'Signature of ') + (p.name || `#${i + 1}`)} />
                </div>
              )}
            </div>
          ))}
          {parts.length === 0 && <p className="text-xs text-gray-400">{t('Aucun participant — cliquez « Ajouter un participant ».', 'No attendee yet — click “Add attendee”.')}</p>}
        </div>
      </div>

      {/* Points abordés (multi-lignes) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-bold">{t('Points abordés', 'Topics covered')} ({points.length})</h4>
          <button onClick={addPoint} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700"><Plus size={13} /> {t('Ajouter une ligne', 'Add line')}</button>
        </div>
        <div className="space-y-2">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 text-xs font-semibold text-gray-400">{i + 1}.</span>
              <input value={p.text} onChange={e => upPoint(i, e.target.value)} placeholder={t('Point de discussion…', 'Discussion point…')} className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <button onClick={() => delPoint(i)} className="mt-1.5 text-rose-500 hover:text-rose-700"><Trash2 size={15} /></button>
            </div>
          ))}
          {points.length === 0 && <p className="text-xs text-gray-400">{t('Aucun point — ajoutez autant de lignes que nécessaire.', 'No topic yet — add as many lines as needed.')}</p>}
        </div>
      </div>

      {/* Enregistrement de la séance */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-indigo-800 dark:text-indigo-200"><Radio size={15} /> {t('Enregistrement de la séance', 'Session recording')}</h4>
        <div className="flex flex-wrap items-center gap-2">
          {/* Dictée vocale */}
          {speechOk && (
            <button onClick={toggleDictation} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${dictating ? 'bg-rose-600 text-white' : 'border border-gray-300 hover:bg-white dark:border-gray-600'}`}>
              {dictating ? <MicOff size={15} /> : <Mic size={15} />} {dictating ? t('Arrêter la dictée', 'Stop dictation') : t('Dictée vocale', 'Voice dictation')}
            </button>
          )}
          {/* Audio */}
          {recMode !== 'video' && (
            <button onClick={() => (recMode === 'audio' ? stopRec() : startRec('audio'))} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${recMode === 'audio' ? 'bg-rose-600 text-white' : 'border border-gray-300 hover:bg-white dark:border-gray-600'}`}>
              {recMode === 'audio' ? <Square size={14} /> : <FileAudio size={15} />} {recMode === 'audio' ? t('Arrêter', 'Stop') + ` ${mmss(seconds)}` : t('Enregistrer l’audio', 'Record audio')}
            </button>
          )}
          {/* Vidéo */}
          {recMode !== 'audio' && (
            <button onClick={() => (recMode === 'video' ? stopRec() : startRec('video'))} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${recMode === 'video' ? 'bg-rose-600 text-white' : 'border border-gray-300 hover:bg-white dark:border-gray-600'}`}>
              {recMode === 'video' ? <Square size={14} /> : <Video size={15} />} {recMode === 'video' ? t('Arrêter', 'Stop') + ` ${mmss(seconds)}` : t('Enregistrer la vidéo', 'Record video')}
            </button>
          )}
          {uploading && <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Loader2 size={13} className="animate-spin" /> {uploading}</span>}
        </div>
        {/* Choix des périphériques AVANT l'enregistrement */}
        {recMode === null && (cameras.length > 0 || mics.length > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {cameras.length > 0 && (
              <label className="inline-flex items-center gap-1"><Video size={13} />
                <select value={camId} onChange={e => setCamId(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900">
                  {cameras.map((c, i) => <option key={c.deviceId || i} value={c.deviceId}>{c.label || `${t('Caméra', 'Camera')} ${i + 1}`}</option>)}
                </select>
              </label>
            )}
            {mics.length > 0 && (
              <label className="inline-flex items-center gap-1"><Mic size={13} />
                <select value={micId} onChange={e => setMicId(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900">
                  {mics.map((mi, i) => <option key={mi.deviceId || i} value={mi.deviceId}>{mi.label || `${t('Micro', 'Mic')} ${i + 1}`}</option>)}
                </select>
              </label>
            )}
            <button type="button" onClick={refreshDevices} className="text-gray-400 hover:text-gray-600 underline">{t('Rafraîchir', 'Refresh')}</button>
          </div>
        )}
        {/* Aperçu vidéo */}
        <video ref={previewRef} className={`mt-2 w-full max-w-md rounded-lg bg-black ${recMode === 'video' ? '' : 'hidden'}`} playsInline />
        {/* Lien Teams/enregistrement */}
        <div className="mt-2 flex items-center gap-2">
          <Link2 size={15} className="text-gray-400" />
          <input value={linkVal} onChange={e => setLinkVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addLink(); }} placeholder={t('Coller un lien d’enregistrement Teams/Zoom…', 'Paste a Teams/Zoom recording link…')} className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <button onClick={addLink} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-white dark:border-gray-600">{t('Ajouter', 'Add')}</button>
        </div>
        {/* Liste des médias */}
        {media.length > 0 && (
          <ul className="mt-2 space-y-1">
            {media.map((m, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-sm dark:bg-gray-900">
                {m.kind === 'video' ? <FileVideo size={15} className="text-indigo-500" /> : m.kind === 'audio' ? <FileAudio size={15} className="text-indigo-500" /> : <Link2 size={15} className="text-indigo-500" />}
                <a href={m.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-indigo-600 hover:underline dark:text-indigo-300">{m.label || m.url}</a>
                <button onClick={() => delMedia(i)} className="text-rose-500 hover:text-rose-700"><X size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Transcription + notes */}
      <label className={`${lbl} block`}>{t('Transcription (dictée vocale)', 'Transcript (voice dictation)')}
        <textarea value={f.transcript || ''} onChange={e => set({ transcript: e.target.value })} rows={3} placeholder={t('La dictée vocale écrit ici en direct — modifiable.', 'Voice dictation writes here live — editable.')} className={inp} />
      </label>
      <label className={`${lbl} block`}>{t('Notes', 'Notes')}
        <textarea value={f.notes || ''} onChange={e => set({ notes: e.target.value })} rows={2} className={inp} />
      </label>

      <div className="flex flex-wrap justify-end gap-2">
        <button onClick={exportPdf} disabled={pdfBusy} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600">{pdfBusy ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />} {t('Exporter PDF', 'Export PDF')}</button>
        <button onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{t('Annuler', 'Cancel')}</button>
        <button onClick={submit} disabled={busy || recording} title={recording ? t('Arrêtez l’enregistrement avant d’enregistrer', 'Stop recording before saving') : ''} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {t('Enregistrer', 'Save')}
        </button>
      </div>
    </div>
  );
}
