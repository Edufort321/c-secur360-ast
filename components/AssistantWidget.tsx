'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { PointerEvent as ReactPointerEvent, CSSProperties } from 'react';
import { supabase } from '@/lib/supabase';

// Assistant TENANT (dashboard). Ne s'affiche que pour un utilisateur connecté.
// Envoie le token Bearer de la session Supabase (le cookie de session sert de repli côté serveur).
const SUGGESTIONS = [
  'Comment créer un AST conforme ?',
  "Quels champs sont obligatoires pour un permis d'espace clos ?",
  'Quels sont les trois droits du travailleur au Canada ?',
  "Comment monter le Gantt d'un mandat ?",
  "Qu'est-ce que la hiérarchie des moyens de maîtrise ?",
];

type Msg = { role: 'user' | 'assistant'; content: string };

// Bulle deplacable : dimensions (px) pour le calcul de position + cle de persistance.
const FAB_SIZE = 56;  // h-14 w-14
const PANEL_W = 352;  // w-[22rem]
const PANEL_H = 448;  // h-[28rem]

export function AssistantWidget() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Position de la bulle (coin haut-gauche, px). null = pas encore initialisee.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ px: 0, py: 0, x: 0, y: 0 });

  useEffect(() => {
    let active = true;
    // L'utilisateur peut être connecté via Supabase Auth OU via la session maison
    // (cookie httpOnly auth_token, illisible en JS) -> on vérifie /api/auth/me en repli.
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) { if (active) setAuthed(true); return; }
      } catch { /* ignore */ }
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (active) setAuthed(res.ok);
      } catch { if (active) setAuthed(false); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) setAuthed(true); });
    return () => { active = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Fermeture en cliquant à côté du panneau (hors panneau et hors bouton flottant).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || fabRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // ── Bulle deplacable (clic maintenu + glisser), position memorisee ─────────
  const clampPos = (x: number, y: number) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    return {
      x: Math.max(8, Math.min(vw - FAB_SIZE - 8, x)),
      y: Math.max(8, Math.min(vh - FAB_SIZE - 8, y)),
    };
  };

  // Position PAR DÉFAUT : coin bas-droite. La bulle reste déplaçable, mais sa position n'est
  // PAS mémorisée — elle revient à sa place par défaut à chaque changement de page (voir effet
  // sur `pathname` ci-dessous).
  const defaultPos = () => clampPos(window.innerWidth - FAB_SIZE - 20, window.innerHeight - FAB_SIZE - 20);

  useEffect(() => {
    setPos(defaultPos());
    const onResize = () => setPos(p => (p ? clampPos(p.x, p.y) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retour à la position par défaut (bas-droite) à CHAQUE changement de page ; on ferme aussi le chat.
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPos(defaultPos());
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const onFabPointerDown = (e: ReactPointerEvent) => {
    const cur = pos ?? clampPos(window.innerWidth - FAB_SIZE - 20, window.innerHeight - FAB_SIZE - 20);
    draggingRef.current = true;
    movedRef.current = false;
    startRef.current = { px: e.clientX, py: e.clientY, x: cur.x, y: cur.y };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onFabPointerMove = (e: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.px;
    const dy = e.clientY - startRef.current.py;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    setPos(clampPos(startRef.current.x + dx, startRef.current.y + dy));
  };
  const onFabPointerUp = (e: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    // Pas de persistance : la position est volontairement réinitialisée au changement de page.
  };
  const onFabClick = () => {
    // Si on vient de glisser la bulle, on ne (de)clenche pas l'ouverture du chat.
    if (movedRef.current) { movedRef.current = false; return; }
    setOpen(o => !o);
  };

  // Panneau de chat ancre pres de la bulle, maintenu dans l'ecran.
  const panelStyle = (): CSSProperties => {
    if (!pos || typeof window === 'undefined') return { right: 20, bottom: 96 };
    const vw = window.innerWidth, vh = window.innerHeight;
    const left = Math.max(8, Math.min(pos.x, vw - PANEL_W - 8));
    const top = pos.y > vh / 2
      ? Math.max(8, pos.y - PANEL_H - 8)
      : Math.max(8, Math.min(vh - PANEL_H - 8, pos.y + FAB_SIZE + 8));
    return { left, top };
  };

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      // Tenant = 1er segment d'URL (routes [tenant]). Exclut les routes systeme -> aucune contamination.
      const seg = (pathname || '').split('/').filter(Boolean)[0] || '';
      const tenant = ['admin', 'api', 'login', 'scan', 'pricing', 'privacy', 'terms'].includes(seg) ? '' : seg;
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: next, tenant }),
      });
      const json = await res.json().catch(() => ({}));
      setMessages(m => [...m, { role: 'assistant', content: json?.reply || json?.error || 'Réponse indisponible.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Réponse indisponible.' }]);
    }
    setLoading(false);
  }

  if (!authed) return null;

  return (
    <>
      <button
        ref={fabRef}
        onPointerDown={onFabPointerDown}
        onPointerMove={onFabPointerMove}
        onPointerUp={onFabPointerUp}
        onClick={onFabClick}
        aria-label="Assistant C-Secur360 — glisser pour déplacer"
        title="Glissez pour déplacer la bulle"
        style={pos ? { left: pos.x, top: pos.y, touchAction: 'none' } : { right: 20, bottom: 20, touchAction: 'none' }}
        className="fixed z-[60] grid h-14 w-14 cursor-grab touch-none select-none place-items-center rounded-full bg-[#0D1F3C] text-2xl text-white shadow-lg ring-2 ring-orange-500/60 transition hover:bg-[#16294a] active:cursor-grabbing"
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div ref={panelRef} style={panelStyle()} className="fixed z-[60] flex h-[28rem] max-h-[calc(100vh-2rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-[#0D1F3C] px-4 py-3 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="C-Secur360" className="h-6 w-auto" />
            <div className="text-sm font-bold">Assistant C-Secur360</div>
            <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" aria-hidden />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-gray-600">Bonjour ! Je peux vous aider à utiliser la plateforme. Je ne vois aucune donnée de votre organisation. 🔒</p>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-700 hover:border-orange-400">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-[#0D1F3C] text-white' : 'border border-gray-200 bg-white text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">L'assistant écrit…</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-gray-100 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40">➤</button>
          </form>
          <p className="px-3 pb-2 text-[10px] leading-tight text-gray-400">Assistant informatif — ne voit aucune donnée réelle. Validez toute décision de sécurité avec votre responsable HSE/SST.</p>
        </div>
      )}
    </>
  );
}
