'use client';

import { useEffect, useRef, useState } from 'react';

// Widget du chatbot PUBLIC (marketing). Bouton flottant + panneau. Anonyme.
// Ouverture auto une fois par session. CTA démo + contact. Disclaimer. Appelle /api/assistant/public-chat.
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@cerdia.ai';
const SUGGESTIONS = ["Qu'est-ce que C-Secur360 ?", 'Quels modules sont offerts ?', 'Comment voir une démo ?'];

type Msg = { role: 'user' | 'assistant'; content: string };

export function PublicChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Ouverture uniquement au clic (pas d'ouverture automatique).
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

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/assistant/public-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages(m => [...m, { role: 'assistant', content: data?.reply || `Écrivez-nous à ${CONTACT}.` }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: `Écrivez-nous à ${CONTACT}.` }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        ref={fabRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Assistant C-Secur360"
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#0D1F3C] text-2xl text-white shadow-lg ring-2 ring-orange-500/60 transition hover:bg-[#16294a]"
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div ref={panelRef} className="fixed bottom-24 right-5 z-[60] flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-[#0D1F3C] px-4 py-3 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="C-Secur360" className="h-6 w-auto" />
            <div className="text-sm font-bold">Assistant C-Secur360</div>
            <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" aria-hidden />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-gray-600">Bonjour ! Je peux vous présenter C-Secur360 et organiser une démo. 👋</p>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-700 hover:border-orange-400">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-[#0D1F3C] text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">L'assistant écrit…</div>}
            <div ref={endRef} />
          </div>

          {/* CTA permanents */}
          <div className="flex gap-2 border-t border-gray-100 px-3 py-2">
            <a href="/?demo=1" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-orange-500 px-2 py-1.5 text-center text-xs font-semibold text-white hover:bg-orange-600">Voir la démo</a>
            <a href={`mailto:${CONTACT}`} className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50">Nous écrire</a>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-gray-100 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">➤</button>
          </form>
          <p className="px-3 pb-2 text-[10px] leading-tight text-gray-400">Assistant informatif — peut faire des erreurs. Pour une réponse officielle, contactez-nous.</p>
        </div>
      )}
    </>
  );
}
