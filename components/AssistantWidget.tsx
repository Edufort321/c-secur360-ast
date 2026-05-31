'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Assistant TENANT (dashboard). Ne s'affiche que pour un utilisateur connecté.
// Envoie le token Bearer de la session Supabase (le cookie de session sert de repli côté serveur).
const SUGGESTIONS = [
  'Comment créer un AST conforme ?',
  'Quels champs sont obligatoires pour un permis ?',
  "Comment monter le Gantt d'un mandat ?",
];

type Msg = { role: 'user' | 'assistant'; content: string };

export function AssistantWidget() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setAuthed(!!data?.session); }).catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => { active = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: next }),
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
        onClick={() => setOpen(o => !o)}
        aria-label="Assistant C-Secur360"
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700"
      >
        {open ? '×' : '🤖'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-gray-900 px-4 py-3 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="C-Secur360" className="h-6 w-auto" />
            <div className="text-sm font-bold">Assistant C-Secur360</div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-gray-600">Bonjour ! Je peux vous aider à utiliser la plateforme. Je ne vois aucune donnée de votre organisation. 🔒</p>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-700 hover:border-blue-400">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-800'}`}>
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
              className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">➤</button>
          </form>
          <p className="px-3 pb-2 text-[10px] leading-tight text-gray-400">Assistant informatif — ne voit aucune donnée réelle. Validez toute décision de sécurité avec votre responsable HSE/SST.</p>
        </div>
      )}
    </>
  );
}
