'use client';

// Enregistreur de VIDÉO RÉELLE (caméra + micro du device). Sert à filmer une vraie personne (ou une
// scène) puis à la monter avec des slides dans l'assembleur (la vidéo enregistrée devient un « clip »
// sélectionnable comme présentateur dans le composeur). Mobile : caméra avant/arrière. Upload direct.
import { useEffect, useRef, useState } from 'react';
import { Video, Square, RefreshCw, Camera, Loader2, Save, Trash2 } from 'lucide-react';

function pickMime(): { mime: string; ext: 'mp4' | 'webm' } {
  const sup = (c: string) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c);
  for (const c of ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4']) if (sup(c)) return { mime: c, ext: 'mp4' };
  for (const c of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) if (sup(c)) return { mime: c, ext: 'webm' };
  return { mime: '', ext: 'webm' };
}

export default function CameraRecorder({ uploadFile, saveClip, onNotice }: {
  uploadFile: (file: File, prefix: string) => Promise<string>;
  saveClip: (url: string) => Promise<void>;
  onNotice: (m: { msg: string; ok: boolean }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const fmtRef = useRef<{ mime: string; ext: 'mp4' | 'webm' }>({ mime: '', ext: 'webm' });
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [live, setLive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [secs, setSecs] = useState(0);

  useEffect(() => () => stopStream(), []);
  useEffect(() => { if (!recording) return; const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t); }, [recording]);

  function stopStream() { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; }

  async function startCamera(face: 'user' | 'environment' = facing) {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.muted = true; await videoRef.current.play().catch(() => {}); }
      setLive(true); setResultUrl('');
    } catch (e: any) {
      onNotice({ msg: 'Caméra : accès refusé ou indisponible (' + (e?.name || e?.message || '') + ').', ok: false });
    }
  }

  function switchCam() { const next = facing === 'user' ? 'environment' : 'user'; setFacing(next); if (live) startCamera(next); }

  function start() {
    const s = streamRef.current; if (!s) return;
    chunks.current = []; setResultUrl(''); setSecs(0);
    const fmt = pickMime(); fmtRef.current = fmt;
    const rec = new MediaRecorder(s, fmt.mime ? { mimeType: fmt.mime, videoBitsPerSecond: 4_000_000 } : { videoBitsPerSecond: 4_000_000 });
    recRef.current = rec;
    rec.ondataavailable = e => { if (e.data?.size) chunks.current.push(e.data); };
    rec.onstop = () => { const blob = new Blob(chunks.current, { type: fmtRef.current.ext === 'mp4' ? 'video/mp4' : 'video/webm' }); setResultUrl(URL.createObjectURL(blob)); setRecording(false); };
    rec.start(); setRecording(true);
  }
  function stop() { if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop(); }

  async function save() {
    if (!resultUrl) return;
    setSaving(true);
    try {
      const blob = await fetch(resultUrl).then(r => r.blob());
      const file = new File([blob], `clip-reel.${fmtRef.current.ext}`, { type: blob.type });
      const url = await uploadFile(file, 'clip');
      await saveClip(url);
      onNotice({ msg: '✓ Vidéo réelle enregistrée — disponible comme présentateur dans l’assembleur.', ok: true });
      setResultUrl('');
    } catch (e: any) { onNotice({ msg: 'Sauvegarde : ' + (e?.message || 'échec'), ok: false }); }
    finally { setSaving(false); }
  }

  return (
    <div className="card">
      <h2>🎥 Enregistrer une vidéo réelle <span className="chip">caméra + micro</span></h2>
      <p className="hint">Filme une vraie personne ou une scène avec la caméra de ton appareil, puis monte-la avec des slides dans l’assembleur (la vidéo devient un présentateur sélectionnable). Mobile : bascule caméra avant/arrière.</p>

      <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)', background: '#000', aspectRatio: '16/9', objectFit: 'cover', display: resultUrl ? 'none' : 'block' }} />
        {resultUrl && <video src={resultUrl} controls style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }} />}
        {recording && <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(220,38,38,.92)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>● REC {mmss(secs)}</div>}
      </div>

      <div className="actions" style={{ justifyContent: 'center' }}>
        {!live && !resultUrl && <button className="btn btn-reel" onClick={() => startCamera()}><Camera size={15} /> Activer la caméra</button>}
        {live && !recording && !resultUrl && <button className="btn btn-reel" onClick={start}><Video size={15} /> Enregistrer</button>}
        {live && !recording && <button className="btn btn-ghost" onClick={switchCam}><RefreshCw size={14} /> Caméra {facing === 'user' ? 'arrière' : 'avant'}</button>}
        {recording && <button className="btn btn-signal" onClick={stop}><Square size={14} /> Arrêter</button>}
        {resultUrl && <button className="btn btn-signal" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {saving ? 'Enregistrement…' : 'Enregistrer dans la galerie'}</button>}
        {resultUrl && <button className="btn btn-ghost" onClick={() => { setResultUrl(''); startCamera(); }}><Trash2 size={14} /> Refaire</button>}
      </div>
    </div>
  );
}

function mmss(s: number) { const m = Math.floor(s / 60), ss = s % 60; return `${m}:${String(ss).padStart(2, '0')}`; }
