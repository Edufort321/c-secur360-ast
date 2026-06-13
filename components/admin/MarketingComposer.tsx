'use client';

// Assembleur vidéo IN-APP (Studio marketing). Remplace l'ancien export composition.json + rendu Remotion
// en ligne de commande. Tout se passe dans le navigateur :
//  • fond = SLIDES (images, défilement chronométré) OU une VIDÉO de fond ;
//  • un AVATAR qui parle, incrusté dans un coin (« se tasse ») ou plein cadre ;
//  • sous-titres incrustés ;
//  • aperçu en DIRECT (canvas) = exactement ce qui sera enregistré ;
//  • enregistrement d'un vrai fichier .webm (canvas + audio de l'avatar) — téléchargeable ou rangé en galerie.
// Les médias viennent du bucket public « marketing » (même origine logique) -> crossOrigin OK pour
// l'enregistrement. Repli automatique sans crossOrigin (aperçu seulement) si l'origine refuse le CORS.

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Slide = { url: string; seconds: number; caption?: string };
type AvatarPos = 'br' | 'bl' | 'tr' | 'tl' | 'center' | 'hidden';
type Aspect = '16:9' | '9:16' | '1:1';
type Style = 'tiktok' | 'canva' | 'powerpoint' | 'fade' | 'cut';

const STYLE_OPTIONS: { v: Style; l: string; d: string }[] = [
  { v: 'canva', l: '🎨 Canva', d: 'zoom & panoramique doux (Ken Burns)' },
  { v: 'tiktok', l: '⚡ TikTok', d: 'zoom punché, coupe rapide' },
  { v: 'powerpoint', l: '📊 PowerPoint', d: 'glissement (push) latéral' },
  { v: 'fade', l: '🌫 Fondu', d: 'fondu enchaîné' },
  { v: 'cut', l: '✂ Coupe', d: 'coupe franche, sans animation' },
];
const easeOut = (p: number) => 1 - (1 - p) * (1 - p);

interface Props {
  avatarVideos: { id: string; url: string; created_at?: string }[];
  library: { id: string; url: string; name?: string }[];
  bgVideos?: { id: string; url: string; name?: string }[];
  storyboard?: any[];
  onNotice: (m: { msg: string; ok: boolean }) => void;
  uploadFile: (file: File, prefix: string) => Promise<string>;
  saveVideoToGallery: (url: string) => Promise<void>;
}

const DIMS: Record<Aspect, { w: number; h: number }> = {
  '16:9': { w: 1280, h: 720 },
  '9:16': { w: 720, h: 1280 },
  '1:1': { w: 1000, h: 1000 },
};

export default function MarketingComposer({ avatarVideos, library, bgVideos = [], storyboard, onNotice, uploadFile, saveVideoToGallery }: Props) {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bgMode, setBgMode] = useState<'slides' | 'video'>('slides');
  const [bgVideoUrl, setBgVideoUrl] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [avatarPos, setAvatarPos] = useState<AvatarPos>('br');
  const [avatarScale, setAvatarScale] = useState(30); // % de la hauteur du cadre (mode coin)
  const [aspect, setAspect] = useState<Aspect>('16:9');
  const [style, setStyle] = useState<Style>('canva'); // style de défilement des slides
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [mp4Url, setMp4Url] = useState('');
  const [savedUrl, setSavedUrl] = useState(''); // URL déjà rangée en galerie (évite le doublon)
  const [converting, setConverting] = useState(false);
  const [corsBlocked, setCorsBlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarVidRef = useRef<HTMLVideoElement | null>(null);
  const bgVidRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const clockRef = useRef<number>(0);          // horloge de repli (sans avatar) en ms d'origine perf
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const dims = DIMS[aspect];
  const slidesTotal = useMemo(() => slides.reduce((s, r) => s + (Number(r.seconds) || 0), 0), [slides]);

  // Charge un média en BLOB -> object URL (même origine). Le canvas dessinant un object URL n'est JAMAIS
  // « teinté » (contrairement à une image cross-origin, surtout quand le cache navigateur a déjà servi la
  // même URL SANS en-têtes CORS via une vignette). C'est la clé pour que l'enregistrement avec slides marche.
  const objUrlCache = useRef<Map<string, string>>(new Map());
  async function toBlobUrl(url: string): Promise<string> {
    const cached = objUrlCache.current.get(url);
    if (cached) return cached;
    const blob = await fetch(url, { cache: 'reload' }).then(r => { if (!r.ok) throw new Error('fetch ' + r.status); return r.blob(); });
    const obj = URL.createObjectURL(blob);
    objUrlCache.current.set(url, obj);
    return obj;
  }

  // ── Préchargement des images de slides (via blob -> jamais de canvas teinté) ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const s of slides) {
        if (!s.url || imgCache.current.has(s.url)) continue;
        try {
          const obj = await toBlobUrl(s.url);
          const img = new Image();
          await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('img')); img.src = obj; });
          if (!cancelled) imgCache.current.set(s.url, img);
        } catch {
          // Repli (rare) : chargement direct -> aperçu OK mais l'enregistrement peut être bloqué.
          const img = new Image(); img.onload = () => imgCache.current.set(s.url, img); img.src = s.url; setCorsBlocked(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [slides]);

  // ── Source des vidéos cachées (avatar + fond) via blob -> object URL (pas de taint, audio captable) ──
  useEffect(() => {
    const v = avatarVidRef.current; if (!v) return;
    if (!avatarUrl) { v.removeAttribute('src'); return; }
    let cancelled = false;
    (async () => {
      try {
        const obj = await toBlobUrl(avatarUrl);
        if (cancelled) return;
        v.removeAttribute('crossorigin'); v.src = obj; v.load();
      } catch {
        if (cancelled) return;
        v.src = avatarUrl; v.load(); setCorsBlocked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [avatarUrl]);
  useEffect(() => {
    const v = bgVidRef.current; if (!v) return;
    if (bgMode !== 'video' || !bgVideoUrl) { v.removeAttribute('src'); return; }
    v.muted = true;
    let cancelled = false;
    (async () => {
      try {
        const obj = await toBlobUrl(bgVideoUrl);
        if (cancelled) return;
        v.removeAttribute('crossorigin'); v.src = obj; v.load();
      } catch {
        if (cancelled) return;
        v.src = bgVideoUrl; v.load(); setCorsBlocked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [bgMode, bgVideoUrl]);
  // Libère les object URLs au démontage.
  useEffect(() => () => { objUrlCache.current.forEach(u => URL.revokeObjectURL(u)); objUrlCache.current.clear(); }, []);

  // ── Dessin « cover » d'un média dans un rectangle ──
  function drawCover(ctx: CanvasRenderingContext2D, media: CanvasImageSource, mw: number, mh: number, x: number, y: number, w: number, h: number) {
    if (!mw || !mh) return;
    const scale = Math.max(w / mw, h / mh);
    const dw = mw * scale, dh = mh * scale;
    ctx.drawImage(media, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  function drawContain(ctx: CanvasRenderingContext2D, media: CanvasImageSource, mw: number, mh: number, x: number, y: number, w: number, h: number) {
    if (!mw || !mh) return;
    const scale = Math.min(w / mw, h / mh);
    const dw = mw * scale, dh = mh * scale;
    ctx.drawImage(media, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  // Dessin « cover » plein cadre avec transformation (zoom + décalage + opacité) pour les styles de transition.
  function drawSlideFx(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, zoom: number, dx: number, dy: number, alpha: number) {
    const mw = img.naturalWidth, mh = img.naturalHeight; if (!mw || !mh) return;
    const base = Math.max(W / mw, H / mh) * zoom;
    const dw = mw * base, dh = mh * base;
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.drawImage(img, (W - dw) / 2 + dx, (H - dh) / 2 + dy, dw, dh);
    ctx.restore();
  }
  // Paramètres d'animation d'une slide selon le style et l'avancement local (0..dur).
  function slideFx(local: number, dur: number, W: number): { zoom: number; dx: number; dy: number; alpha: number; td: number; revealPrev: boolean } {
    const q = dur > 0 ? local / dur : 0; // avancement continu 0..1
    switch (style) {
      case 'canva': { const td = 0.6; return { zoom: 1.04 + 0.10 * q, dx: (q - 0.5) * W * 0.05, dy: 0, alpha: Math.min(1, local / 0.4), td, revealPrev: true }; }
      case 'tiktok': { const td = 0.32; const p = Math.min(1, local / td); return { zoom: (1.20 - 0.20 * easeOut(p)) + 0.04 * q, dx: 0, dy: 0, alpha: Math.min(1, local / 0.12), td, revealPrev: false }; }
      case 'powerpoint': { const td = 0.55; const p = Math.min(1, local / td); return { zoom: 1, dx: (1 - easeOut(p)) * W, dy: 0, alpha: 1, td, revealPrev: true }; }
      case 'fade': { const td = 0.6; return { zoom: 1, dx: 0, dy: 0, alpha: Math.min(1, local / td), td, revealPrev: true }; }
      default: return { zoom: 1, dx: 0, dy: 0, alpha: 1, td: 0, revealPrev: false }; // cut
    }
  }

  function currentSlideIndex(elapsed: number): number {
    if (!slides.length) return -1;
    let acc = 0;
    for (let i = 0; i < slides.length; i++) { acc += Number(slides[i].seconds) || 0; if (elapsed < acc) return i; }
    return slides.length - 1;
  }

  function renderFrame(elapsed: number) {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { w: W, h: H } = dims;
    ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);

    // ── Fond ──
    let caption = '';
    if (bgMode === 'video') {
      const bv = bgVidRef.current;
      if (bv && bv.readyState >= 2) drawCover(ctx, bv, bv.videoWidth, bv.videoHeight, 0, 0, W, H);
    } else {
      const idx = currentSlideIndex(elapsed);
      if (idx >= 0) {
        const img = imgCache.current.get(slides[idx].url);
        caption = slides[idx].caption || '';
        let start = 0; for (let i = 0; i < idx; i++) start += Number(slides[i].seconds) || 0;
        const dur = Number(slides[idx].seconds) || 0;
        const local = elapsed - start;
        const fx = slideFx(local, dur, W);
        // Pendant l'entrée, on révèle par-dessus la slide précédente (fondu/push) pour un vrai enchaînement.
        if (fx.revealPrev && local < fx.td && idx > 0) {
          const prev = imgCache.current.get(slides[idx - 1].url);
          if (prev) drawCover(ctx, prev, prev.naturalWidth, prev.naturalHeight, 0, 0, W, H);
        }
        if (img) drawSlideFx(ctx, img, W, H, fx.zoom, fx.dx, fx.dy, fx.alpha);
      }
    }

    // ── Avatar ──
    const av = avatarVidRef.current;
    if (av && avatarPos !== 'hidden' && av.readyState >= 2) {
      const vw = av.videoWidth, vh = av.videoHeight;
      if (avatarPos === 'center') {
        drawContain(ctx, av, vw, vh, 0, 0, W, H);
      } else {
        const bh = H * (avatarScale / 100);
        const bw = bh * (vw / vh || 0.75);
        const m = Math.round(H * 0.03);
        const x = avatarPos === 'bl' || avatarPos === 'tl' ? m : W - bw - m;
        const y = avatarPos === 'tl' || avatarPos === 'tr' ? m : H - bh - m;
        // cadre arrondi + ombre légère
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        roundRect(ctx, x, y, bw, bh, 14); ctx.fillStyle = '#000'; ctx.fill();
        ctx.restore();
        ctx.save(); roundRect(ctx, x, y, bw, bh, 14); ctx.clip();
        drawCover(ctx, av, vw, vh, x, y, bw, bh);
        ctx.restore();
      }
    }

    // ── Sous-titre incrusté (bas) ──
    if (caption) {
      const fs = Math.round(H * 0.045);
      ctx.font = `600 ${fs}px system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = wrapText(ctx, caption, W * 0.86);
      const lh = fs * 1.3;
      const blockH = lines.length * lh + fs * 0.6;
      const by = H - blockH - Math.round(H * 0.04);
      ctx.fillStyle = 'rgba(8,12,20,.62)';
      roundRect(ctx, W * 0.05, by, W * 0.9, blockH, 12); ctx.fill();
      ctx.fillStyle = '#fff';
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, by + fs * 0.5 + lh * (i + 0.5)));
    }
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const words = text.split(/\s+/); const lines: string[] = []; let line = '';
    for (const wd of words) {
      const test = line ? line + ' ' + wd : wd;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = wd; } else line = test;
    }
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  // ── Boucle d'animation ──
  function elapsedNow(): number {
    const av = avatarVidRef.current;
    if (av && avatarUrl && av.readyState >= 1) return av.currentTime;
    return (performance.now() - clockRef.current) / 1000;
  }
  function loop() {
    renderFrame(elapsedNow());
    rafRef.current = requestAnimationFrame(loop);
  }
  function startLoop() { if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop); }
  function stopLoop() { if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } }

  // Premier rendu statique + nettoyage.
  useEffect(() => { renderFrame(0); return () => stopLoop(); /* eslint-disable-next-line */ }, [aspect, slides, bgMode, bgVideoUrl, avatarPos, avatarScale, avatarUrl, style]);

  const totalDuration = useMemo(() => {
    // L'avatar (la voix) est la colonne vertébrale ; sinon la durée des slides.
    return slidesTotal || 10;
  }, [slidesTotal]);

  function syncMediaToStart() {
    clockRef.current = performance.now();
    const av = avatarVidRef.current; if (av && avatarUrl) { try { av.currentTime = 0; } catch {} }
    const bv = bgVidRef.current; if (bv && bgMode === 'video' && bgVideoUrl) { try { bv.currentTime = 0; bv.play().catch(() => {}); } catch {} }
  }

  async function play() {
    if (playing) { pause(); return; }
    setResultUrl('');
    syncMediaToStart();
    const av = avatarVidRef.current;
    if (av && avatarUrl) { av.muted = false; try { await av.play(); } catch {} }
    setPlaying(true);
    startLoop();
    const dur = (av && avatarUrl && av.duration && isFinite(av.duration)) ? av.duration : totalDuration;
    window.setTimeout(() => { if (!recorderRef.current) pause(); }, dur * 1000 + 400);
  }
  function pause() {
    setPlaying(false); stopLoop();
    const av = avatarVidRef.current; if (av) av.pause();
    const bv = bgVidRef.current; if (bv) bv.pause();
    renderFrame(elapsedNow());
  }

  // Préfère le MP4 NATIF (Chrome/Edge/Safari récents) -> aucun serveur requis, fichier direct TikTok.
  // Repli webm (Firefox/anciens) -> conversion serveur ensuite.
  function pickMime(): { mime: string; ext: 'mp4' | 'webm' } {
    const sup = (c: string) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c);
    const mp4 = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1.4D401E,mp4a.40.2', 'video/mp4'];
    for (const c of mp4) if (sup(c)) return { mime: c, ext: 'mp4' };
    const webm = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const c of webm) if (sup(c)) return { mime: c, ext: 'webm' };
    return { mime: '', ext: 'webm' };
  }

  async function record() {
    const canvas = canvasRef.current; if (!canvas) return;
    if (bgMode === 'slides' && slides.filter(s => s.url).length === 0) { onNotice({ msg: '⚠ Ajoute au moins une slide (ou choisis une vidéo de fond).', ok: false }); return; }
    if (corsBlocked) { onNotice({ msg: '⚠ Un média bloque le CORS (lien temporaire D-ID ?). Applique la migration 165 (bucket « marketing » PUBLIC) et régénère l\'avatar pour pouvoir enregistrer.', ok: false }); return; }
    setResultUrl(''); setSavedUrl(''); chunksRef.current = [];
    try {
      const canvasStream = (canvas as any).captureStream(30) as MediaStream;
      const tracks = [...canvasStream.getVideoTracks()];
      const av = avatarVidRef.current;
      if (av && avatarUrl) {
        av.muted = false;
        const as = (av as any).captureStream ? (av as any).captureStream() as MediaStream : null;
        const at = as?.getAudioTracks?.()[0];
        if (at) tracks.push(at);
      }
      const stream = new MediaStream(tracks);
      const fmt = pickMime();
      // Débit modéré : qualité nette tout en gardant le fichier sous la limite Supabase par défaut (50 Mo).
      const rec = new MediaRecorder(stream, fmt.mime ? { mimeType: fmt.mime, videoBitsPerSecond: 3_500_000 } : { videoBitsPerSecond: 3_500_000 });
      recorderRef.current = rec;
      rec.ondataavailable = e => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const nativeMp4 = fmt.ext === 'mp4';
        const blob = new Blob(chunksRef.current, { type: nativeMp4 ? 'video/mp4' : 'video/webm' });
        setMp4Url('');
        setResultUrl(URL.createObjectURL(blob));
        recorderRef.current = null; setRecording(false); setPlaying(false); stopLoop();
        // AUTO : téléverse puis CONVERTIT côté serveur (normalise H.264 + AJOUTE une piste audio
        // silencieuse si le montage n'a pas de son — sinon TikTok refuse « décodage impossible » alors
        // que Facebook l'accepte). On ne range QUE le .mp4 normalisé. Timeout pour ne jamais rester bloqué.
        (async () => {
          setSaving(true); setConverting(true);
          onNotice({ msg: '✓ Vidéo assemblée — conversion .mp4 (compatible TikTok)…', ok: true });
          const ctrl = new AbortController();
          const to = window.setTimeout(() => ctrl.abort(), 75000);
          try {
            const file = new File([blob], `composition-${aspect.replace(':', 'x')}.${fmt.ext}`, { type: blob.type });
            const uploadedUrl = await uploadFile(file, 'composition');
            const r = await fetch('/api/admin/marketing/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ url: uploadedUrl }), signal: ctrl.signal });
            const j = await r.json().catch(() => ({}));
            if (r.ok && j.url) {
              setMp4Url(j.url); await saveVideoToGallery(j.url); setSavedUrl(j.url);
              onNotice({ msg: '✓ Montage .mp4 enregistré dans « 📁 Mes vidéos enregistrées » (prêt pour TikTok).', ok: true });
            } else {
              onNotice({ msg: '⚠ Conversion .mp4 échouée : ' + (j.error || 'erreur serveur') + '. Réessaie ; si ça persiste, signale-le.', ok: false });
            }
          } catch (err: any) {
            onNotice({ msg: err?.name === 'AbortError' ? '⚠ Conversion .mp4 trop longue (serveur) — réessaie.' : 'Enregistrement : ' + (err?.message || 'échec'), ok: false });
          } finally { window.clearTimeout(to); setConverting(false); setSaving(false); }
        })();
      };

      // Lancement synchronisé.
      syncMediaToStart();
      if (av && avatarUrl) { try { await av.play(); } catch {} }
      setRecording(true); setPlaying(true); startLoop();
      rec.start();

      const dur = (av && avatarUrl && av.duration && isFinite(av.duration)) ? av.duration : totalDuration;
      const stop = () => { if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop(); const b = bgVidRef.current; if (b) b.pause(); if (av) av.pause(); };
      if (av && avatarUrl) av.onended = stop;
      window.setTimeout(stop, dur * 1000 + 300);
    } catch (e: any) {
      setRecording(false);
      const msg = String(e?.message || e);
      onNotice({ msg: 'Enregistrement impossible : ' + (msg.includes('tainted') || msg.includes('SecurityError') ? 'un média est en cross-origin sans CORS (lien temporaire). Active le bucket public (migration 165).' : msg), ok: false });
    }
  }

  // Convertit le .webm en .mp4 côté serveur : on téléverse d'abord le webm (URL stockée), puis ffmpeg.
  async function convertToMp4() {
    if (!resultUrl || converting) return;
    setConverting(true);
    try {
      const blob = await fetch(resultUrl).then(r => r.blob());
      const file = new File([blob], `composition-${aspect.replace(':', 'x')}.webm`, { type: 'video/webm' });
      const webmUrl = await uploadFile(file, 'composition');
      const r = await fetch('/api/admin/marketing/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ url: webmUrl }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setMp4Url(j.url);
      onNotice({ msg: '✓ Vidéo convertie en .mp4 (H.264) — prête pour TikTok/Meta.', ok: true });
    } catch (e: any) {
      onNotice({ msg: 'Conversion .mp4 : ' + (e?.message || 'échec'), ok: false });
    } finally { setConverting(false); }
  }


  // Téléchargement FORCÉ : l'attribut `download` est ignoré pour une URL cross-origin (Supabase) -> on
  // récupère le fichier en blob puis on déclenche le téléchargement local.
  async function downloadFile(url: string, filename: string) {
    try {
      const blob = url.startsWith('blob:') ? await fetch(url).then(r => r.blob()) : await fetch(url).then(r => r.blob());
      const a = document.createElement('a');
      const obj = URL.createObjectURL(blob);
      a.href = obj; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(obj), 4000);
    } catch (e: any) {
      onNotice({ msg: 'Téléchargement : ' + (e?.message || 'échec') + '. Astuce : clic droit sur la vidéo → « Enregistrer la vidéo sous… ».', ok: false });
    }
  }

  // ── Slides : helpers ──
  const addSlide = () => setSlides(rs => [...rs, { url: library[0]?.url || '', seconds: 6, caption: '' }]);
  const upSlide = (i: number, patch: Partial<Slide>) => setSlides(rs => rs.map((r, j) => j === i ? { ...r, ...patch } : r));
  const delSlide = (i: number) => setSlides(rs => rs.filter((_, j) => j !== i));
  const moveSlide = (i: number, d: number) => setSlides(rs => { const n = [...rs]; const j = i + d; if (j < 0 || j >= n.length) return rs; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const fillFromStoryboard = () => {
    if (!storyboard?.length) return;
    setSlides(storyboard.map((s: any, i: number) => ({ url: library[i]?.url || library[0]?.url || '', seconds: Number(s.seconds) || 6, caption: s.onscreen_text || s.voiceover || '' })));
    setBgMode('slides');
  };
  // Auto-remplissage : dès qu'un storyboard est disponible (généré dans le Brief créatif) et qu'aucune
  // slide n'a encore été créée, on pré-remplit automatiquement les slides à partir des scènes.
  const autoFilledRef = useRef(false);
  useEffect(() => {
    if (autoFilledRef.current) return;
    if (storyboard?.length && slides.length === 0) {
      autoFilledRef.current = true;
      setSlides(storyboard.map((s: any, i: number) => ({ url: library[i]?.url || library[0]?.url || '', seconds: Number(s.seconds) || 6, caption: s.onscreen_text || s.voiceover || '' })));
    }
  }, [storyboard, library, slides.length]);

  const stageW = aspect === '9:16' ? 260 : aspect === '1:1' ? 380 : 520;
  const stageH = Math.round(stageW * dims.h / dims.w);

  return (
    <div className="card cmp">
      <h2>🎬 Assembler la vidéo <span className="chip">aperçu + enregistrement</span></h2>
      <p className="hint">Compose ici la vidéo finale : un <b>fond</b> (tes slides qui défilent <i>ou</i> une vidéo) + l'<b>avatar</b> qui parle, incrusté dans un coin ou plein cadre, avec sous-titres. L'aperçu à droite est <b>exactement</b> ce qui sera enregistré. Aucun outil externe.</p>

      <div style={{ display: 'grid', gridTemplateColumns: `1fr ${stageW + 24}px`, gap: 16, alignItems: 'start' }} className="composer-grid">
        {/* ───────── Réglages (colonne gauche) ───────── */}
        <div>
          {/* Étape 1 : avatar */}
          <div className="addbox">
            <label style={{ marginTop: 0 }}>① Avatar qui parle <span style={{ color: 'var(--mist)' }}>(porte la voix)</span></label>
            <select value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}>
              <option value="">{avatarVideos.length ? '— Choisir une vidéo d\'avatar —' : '(génère d\'abord un avatar ci-dessus)'}</option>
              {avatarVideos.map((v, i) => <option key={v.id} value={v.url}>Avatar {i + 1}{v.created_at ? ` · ${new Date(v.created_at).toLocaleDateString('fr-CA')}` : ''}</option>)}
            </select>
            <div className="row2" style={{ marginTop: 8 }}>
              <div><label style={{ marginTop: 0 }}>Position de l'avatar</label>
                <select value={avatarPos} onChange={e => setAvatarPos(e.target.value as AvatarPos)}>
                  <option value="br">Coin bas-droite</option><option value="bl">Coin bas-gauche</option>
                  <option value="tr">Coin haut-droite</option><option value="tl">Coin haut-gauche</option>
                  <option value="center">Plein cadre (centre)</option><option value="hidden">Caché (fond seul)</option>
                </select>
              </div>
              <div><label style={{ marginTop: 0 }}>Taille (coin) — {avatarScale}%</label>
                <input type="range" min={18} max={55} value={avatarScale} disabled={avatarPos === 'center' || avatarPos === 'hidden'} onChange={e => setAvatarScale(+e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Étape 2 : fond */}
          <div className="addbox">
            <label style={{ marginTop: 0 }}>② Arrière-plan</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button type="button" className={`btn ${bgMode === 'slides' ? 'btn-violet' : 'btn-ghost'}`} onClick={() => setBgMode('slides')}>🖼 Slides (images)</button>
              <button type="button" className={`btn ${bgMode === 'video' ? 'btn-violet' : 'btn-ghost'}`} onClick={() => setBgMode('video')}>🎞 Vidéo de fond</button>
            </div>

            {bgMode === 'video' ? (
              <div>
                {bgVideos.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ marginTop: 0 }}>Depuis la médiathèque</label>
                    <select value={bgVideoUrl} onChange={e => setBgVideoUrl(e.target.value)}>
                      <option value="">— Choisir une vidéo de fond —</option>
                      {bgVideos.map(v => <option key={v.id} value={v.url}>{v.name || 'vidéo'}</option>)}
                    </select>
                  </div>
                )}
                <label style={{ marginTop: 0 }}>…ou une URL</label>
                <input value={bgVideoUrl} onChange={e => setBgVideoUrl(e.target.value)} placeholder="https://… .mp4 / .webm" />
                <label className="btn btn-ghost" style={{ marginTop: 8, cursor: 'pointer', display: 'inline-block' }}>
                  ↥ Téléverser une vidéo de fond
                  <input type="file" accept="video/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) { try { const u = await uploadFile(f, 'bg'); setBgVideoUrl(u); onNotice({ msg: '✓ Vidéo de fond téléversée.', ok: true }); } catch (err: any) { onNotice({ msg: 'Téléversement : ' + (err?.message || 'échec'), ok: false }); } } e.currentTarget.value = ''; }} />
                </label>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ color: 'var(--mist)', fontSize: 12 }}>{slides.length ? `${slides.length} slide(s) · ${slidesTotal}s` : 'Aucune slide.'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="copy" onClick={fillFromStoryboard} disabled={!storyboard?.length} title={storyboard?.length ? 'Recréer les slides depuis le storyboard' : 'Génère d\'abord un storyboard dans le Brief créatif'}>↡ depuis storyboard</button>
                    <button type="button" className="copy" onClick={addSlide}>＋ slide</button>
                  </div>
                </div>
                {!storyboard?.length && (
                  <p className="cmp-note" style={{ marginTop: 6 }}>Astuce : génère un <b>storyboard</b> dans le « Brief créatif » (plus bas) — les slides se rempliront automatiquement ici.</p>
                )}
                <div style={{ marginTop: 8 }}>
                  <label style={{ marginTop: 0 }}>Style de défilement</label>
                  <select value={style} onChange={e => setStyle(e.target.value as Style)}>
                    {STYLE_OPTIONS.map(s => <option key={s.v} value={s.v}>{s.l} — {s.d}</option>)}
                  </select>
                </div>
                {slides.map((row, i) => (
                  <div key={i} style={{ marginTop: 8, borderTop: i ? '1px solid rgba(35,44,58,.5)' : 'none', paddingTop: i ? 8 : 0 }}>
                    <div className="slide-row" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--mist)', fontSize: 11, width: 14 }}>{i + 1}</span>
                      {library.length > 0 ? (
                        <select value={row.url} onChange={e => upSlide(i, { url: e.target.value })} style={{ flex: 1, minWidth: 130 }}>
                          <option value="">— image —</option>
                          {library.map(im => <option key={im.id} value={im.url}>{im.name || 'image'}</option>)}
                        </select>
                      ) : (
                        <input value={row.url} onChange={e => upSlide(i, { url: e.target.value })} placeholder="URL de l'image" style={{ flex: 1, minWidth: 130 }} />
                      )}
                      <input type="number" min={1} value={row.seconds} onChange={e => upSlide(i, { seconds: +e.target.value })} style={{ width: 54 }} title="secondes" />
                      <button type="button" className="copy" onClick={() => moveSlide(i, -1)} title="monter">↑</button>
                      <button type="button" className="copy" onClick={() => moveSlide(i, 1)} title="descendre">↓</button>
                      <button type="button" className="copy" style={{ color: 'var(--rust)' }} onClick={() => delSlide(i)}>×</button>
                    </div>
                    <input value={row.caption || ''} onChange={e => upSlide(i, { caption: e.target.value })} placeholder="Sous-titre incrusté (optionnel)" style={{ width: '100%', marginTop: 5 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Étape 3 : format */}
          <div className="addbox">
            <label style={{ marginTop: 0 }}>③ Format</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['16:9', '9:16', '1:1'] as Aspect[]).map(a => (
                <button key={a} type="button" className={`btn ${aspect === a ? 'btn-violet' : 'btn-ghost'}`} onClick={() => setAspect(a)}>
                  {a === '16:9' ? '🖥 Paysage 16:9' : a === '9:16' ? '📱 Vertical 9:16' : '⬛ Carré 1:1'}
                </button>
              ))}
            </div>
          </div>

          {corsBlocked && <div className="warnbox" style={{ marginTop: 10 }}>⚠ Un média utilise un lien temporaire (CORS bloqué). L'aperçu fonctionne, mais l'enregistrement nécessite le bucket public — applique la <b>migration 165</b> et régénère l'avatar.</div>}
        </div>

        {/* ───────── Aperçu (colonne droite) ───────── */}
        <div style={{ position: 'sticky', top: 8 }}>
          <div style={{ width: stageW, maxWidth: '100%', margin: '0 auto' }}>
            <canvas ref={canvasRef} width={dims.w} height={dims.h} style={{ width: stageW, height: stageH, maxWidth: '100%', borderRadius: 12, border: '1px solid var(--line)', background: '#0b1220', display: 'block' }} />
            <div className="actions" style={{ justifyContent: 'center', marginTop: 10 }}>
              <button className="btn btn-ghost" onClick={play} disabled={recording}>{playing && !recording ? '⏸ Pause' : '▶ Aperçu'}</button>
              <button className="btn btn-reel" onClick={record} disabled={recording}>{recording ? '⏺ Enregistrement…' : '⏺ Assembler & enregistrer'}</button>
            </div>
          </div>

          {resultUrl && (
            <div style={{ marginTop: 12 }}>
              <video src={mp4Url || resultUrl} controls style={{ width: '100%', borderRadius: 10, border: '1px solid var(--line)' }} />
              <div className="actions" style={{ justifyContent: 'center' }}>
                {mp4Url
                  ? <button className="btn btn-signal" onClick={() => downloadFile(mp4Url, `composition-${aspect.replace(':', 'x')}.mp4`)}>↧ Télécharger le .mp4</button>
                  : <button className="btn btn-violet" onClick={convertToMp4} disabled={converting || saving}>{(converting || saving) ? '🎞 Conversion .mp4…' : '🎞 Convertir en .mp4'}</button>}
                {savedUrl && <span className="btn btn-ghost" style={{ cursor: 'default', opacity: 0.8 }}>✓ Enregistré</span>}
              </div>
              <p className="cmp-note" style={{ textAlign: 'center', marginTop: 6 }}>Le montage est <b>converti en .mp4</b> et <b>enregistré automatiquement</b> dans « 📁 Mes vidéos enregistrées » — c'est le seul format diffusable (TikTok/Meta).</p>
            </div>
          )}
        </div>
      </div>

      {/* Vidéos cachées (sources de dessin/audio). */}
      <video ref={avatarVidRef} playsInline preload="auto" style={{ display: 'none' }} />
      <video ref={bgVidRef} playsInline preload="auto" loop muted style={{ display: 'none' }} />

      {/* Styles propres au composeur (scopés). Reprennent les tokens de l'app (variables CSS héritées
          de .mktwrap) car les classes du studio sont scopées au composant parent et ne descendent pas. */}
      <style jsx>{`
        .cmp { background: var(--panel); border: 1px solid var(--line); border-radius: 13px; padding: 18px; }
        /* Contrôles de formulaire : fond sombre + texte clair garantis (évite le blanc sur blanc). */
        .cmp :global(input), .cmp :global(select), .cmp :global(textarea) {
          width: 100%; background: var(--bg); color: var(--paper); border: 1px solid var(--line);
          border-radius: 8px; padding: 9px 11px; font-size: 13px; font-family: inherit;
        }
        .cmp :global(option) { background: #11161f; color: #eef2f6; }
        .cmp :global(input[type="range"]) { padding: 0; accent-color: var(--violet); }
        .cmp :global(h2) { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 9px; margin: 0 0 3px; }
        .cmp :global(.hint) { font-size: 12px; color: var(--mist); margin-bottom: 14px; }
        .cmp :global(.chip) { font-size: 10px; padding: 2px 8px; border-radius: 5px; border: 1px solid var(--line); color: var(--mist); font-weight: 500; }
        .cmp :global(label) { display: block; font-size: 11.5px; color: var(--mist); margin: 11px 0 5px; font-weight: 500; }
        .cmp :global(.addbox) { margin: 0 0 12px; border: 1px solid var(--line); background: var(--panel2); border-radius: 10px; padding: 13px; }
        .cmp :global(.row2) { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .cmp :global(.actions) { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; }
        .cmp :global(.btn) { border: none; border-radius: 8px; padding: 10px 15px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; text-decoration: none; }
        .cmp :global(.btn:disabled) { opacity: .5; cursor: not-allowed; }
        .cmp :global(.btn-reel) { background: var(--reel); color: #2a1006; }
        .cmp :global(.btn-violet) { background: var(--violet); color: #0a1030; }
        .cmp :global(.btn-signal) { background: var(--signal); color: #04241a; }
        .cmp :global(.btn-ghost) { background: transparent; border: 1px solid var(--line); color: var(--paper); }
        .cmp :global(.copy) { background: none; border: 1px solid var(--line); color: var(--mist); border-radius: 6px; padding: 4px 9px; font-size: 11px; cursor: pointer; }
        .cmp :global(.copy:hover) { color: var(--paper); border-color: var(--steel); }
        .cmp :global(.warnbox) { border: 1px solid var(--amber); background: rgba(245,185,69,.08); border-radius: 9px; padding: 10px 13px; font-size: 12px; color: var(--amber); }
        .cmp :global(.cmp-note) { font-size: 11px; color: var(--steel); }
        .cmp, .cmp :global(*) { min-width: 0; box-sizing: border-box; }
        .cmp :global(input), .cmp :global(select), .cmp :global(textarea) { max-width: 100%; }
        @media (max-width: 760px) {
          .cmp :global(.composer-grid) { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .cmp { padding: 14px; }
          .cmp :global(.row2) { grid-template-columns: 1fr; }
          .cmp :global(.addbox) { padding: 11px; }
          /* Rangées de slides : les contrôles passent en pleine largeur plutôt que de déborder. */
          .cmp :global(.slide-row) { gap: 6px; }
          .cmp :global(.slide-row) > :global(select), .cmp :global(.slide-row) > :global(input[type="text"]) { flex: 1 1 100% !important; min-width: 0 !important; }
          .cmp :global(.btn) { padding: 9px 12px; font-size: 12.5px; flex: 1 1 auto; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
