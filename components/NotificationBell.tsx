'use client';
// Cloche de notifications in-app (#36) — sonde /api/notifications, badge de non-lus, panneau
// déroulant. Lecture au clic + « Tout marquer lu ». Présente dans l'en-tête de tous les portails.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

type Notif = { id: string; title: string; body?: string; severity: string; link?: string; read_at?: string | null; created_at: string };

export function NotificationBell({ lang = 'fr' }: { lang?: string }) {
  const tr = (f: string, e: string) => (lang === 'en' ? e : f);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch('/api/notifications?limit=20', { credentials: 'include' });
      if (!r.ok) return; // non connecté / route absente : la cloche reste silencieuse
      const j = await r.json();
      setItems(j.entries || []); setUnread(j.unread || 0);
    } catch { /* silencieux */ }
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // sonde chaque minute
    return () => clearInterval(id);
  }, []);
  // Ferme au clic extérieur.
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function markRead(id: string) {
    setItems(list => list.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnread(u => Math.max(0, u - 1));
    try { await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id }) }); } catch { /* noop */ }
  }
  async function markAll() {
    setItems(list => list.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))); setUnread(0);
    try { await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'read_all' }) }); } catch { /* noop */ }
  }
  function openItem(n: Notif) {
    if (!n.read_at) markRead(n.id);
    if (n.link) { setOpen(false); router.push(n.link); }
  }
  const fmt = (s: string) => { try { return new Date(s).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
  const dot = (sev: string) => sev === 'critical' ? 'bg-rose-500' : sev === 'warning' ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(o => !o); if (!open) load(); }} title={tr('Notifications', 'Notifications')} aria-label="Notifications"
        className="relative rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white">
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
            <span className="text-sm font-bold">{tr('Notifications', 'Notifications')}</span>
            {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-blue-600 hover:underline">{tr('Tout marquer lu', 'Mark all read')}</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-400">{tr('Aucune notification.', 'No notifications.')}</div>
            ) : items.map(n => (
              <button key={n.id} onClick={() => openItem(n)} className={`flex w-full items-start gap-2 border-b border-gray-50 px-3 py-2.5 text-left hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/40 ${n.read_at ? 'opacity-60' : ''}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? 'bg-gray-300' : dot(n.severity)}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{n.title}</span>
                  {n.body && <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{n.body}</span>}
                  <span className="block text-[11px] text-gray-400">{fmt(n.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
