'use client';
// Outils IA pour un champ texte du rapport d'accident :
//  • Dictée vocale (Web Speech API) qui s'ajoute au texte ; à l'arrêt, AUTO-CORRECTION IA optionnelle.
//  • Bouton « Corriger (IA) » manuel (orthographe/grammaire/style, même langue, sens préservé).
import React, { useRef, useState } from 'react';
import { Mic, MicOff, Loader2, Wand2 } from 'lucide-react';
import { aiCorrect } from '@/lib/incidentAi';

export function AiTextTools({ value, onChange, lang, readOnly, voice = true, autoCorrect = true }: {
  value: string; onChange: (v: string) => void; lang: 'fr' | 'en'; readOnly?: boolean;
  voice?: boolean; autoCorrect?: boolean;
}) {
  const fr = lang === 'fr';
  const t = (a: string, b: string) => (fr ? a : b);
  const [busy, setBusy] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const recogRef = useRef<any>(null);
  const base = useRef('');
  const valueRef = useRef(value); valueRef.current = value;
  const speechOk = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  async function correctNow(text?: string) {
    const src = (text ?? valueRef.current) || '';
    if (!src.trim()) return;
    setBusy(true); setMsg(null);
    try { const out = await aiCorrect(src, lang); onChange(out); setMsg(t('Corrigé ✓', 'Corrected ✓')); setTimeout(() => setMsg(null), 1500); }
    catch (e: any) { setMsg((fr ? 'IA : ' : 'AI: ') + (e?.message || '')); }
    finally { setBusy(false); }
  }

  function toggleDictation() {
    if (dictating) { try { recogRef.current?.stop(); } catch {} return; }
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) return;
    const r = new Rec(); r.lang = fr ? 'fr-CA' : 'en-CA'; r.continuous = true; r.interimResults = true;
    base.current = (valueRef.current || '').trim();
    r.onresult = (e: any) => {
      let finalTxt = ''; let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) { const s = e.results[i][0].transcript; if (e.results[i].isFinal) finalTxt += s + ' '; else interim += s; }
      if (finalTxt.trim()) base.current = (base.current + ' ' + finalTxt.trim()).trim();
      onChange((base.current + (interim ? ' ' + interim : '')).trim());
    };
    r.onerror = () => setDictating(false);
    r.onend = () => {
      setDictating(false); recogRef.current = null;
      if (autoCorrect && base.current.trim()) correctNow(base.current);   // auto-correction à l'arrêt
    };
    recogRef.current = r; try { r.start(); setDictating(true); } catch {}
  }

  if (readOnly) return null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      {voice && speechOk && (
        <button type="button" onClick={toggleDictation} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${dictating ? 'bg-rose-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600'}`}>
          {dictating ? <MicOff size={12} /> : <Mic size={12} />} {dictating ? t('Arrêter la dictée', 'Stop dictation') : t('Dictée vocale', 'Voice dictation')}
        </button>
      )}
      <button type="button" onClick={() => correctNow()} disabled={busy || !value.trim()} className="inline-flex items-center gap-1 rounded-md border border-indigo-300 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-500/40 dark:text-indigo-300">
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} {t('Corriger (IA)', 'Correct (AI)')}
      </button>
      {dictating && autoCorrect && <span className="text-[10px] text-gray-400">{t('auto-correction à l’arrêt', 'auto-correct on stop')}</span>}
      {msg && <span className="text-[11px] text-gray-500">{msg}</span>}
    </div>
  );
}
