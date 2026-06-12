'use client';

import { useEffect, useState } from 'react';
import { Shield, Plus, Loader2, KeyRound, Trash2, Power, UserCheck } from 'lucide-react';

// Gestion des COMPTES ADMINISTRATEURS de la plateforme.
// Un admin = un utilisateur `users` de rôle `super_admin` rattaché au tenant `cerdia`. Avec ce rôle :
//   • il accède à l'espace /admin (le middleware autorise super_admin) ;
//   • il accède aussi au tenant cerdia (il EST un utilisateur cerdia).
// On réutilise l'API serveur existante /api/admin/users (mot de passe haché, protégée requireAdmin).
const TENANT = 'cerdia';

type U = { id: string; email: string; name?: string | null; role: string; is_active?: boolean };

export default function AdminAccountsTab() {
  const [all, setAll] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', name: '', password: '' });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/users?tenant=${TENANT}`, { credentials: 'include' });
      const j = await r.json();
      setAll(Array.isArray(j.users) ? j.users : []);
    } catch { setAll([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const admins = all.filter(u => u.role === 'super_admin');

  async function create() {
    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) { setNotice('Courriel et mot de passe requis.'); return; }
    if (form.password.length < 8) { setNotice('Mot de passe : 8 caractères minimum.'); return; }
    setSaving(true); setNotice(null);
    try {
      // Crée (ou met à jour le mot de passe si l'email existe déjà). role=super_admin, tenant=cerdia.
      const r = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ tenant: TENANT, email, name: form.name || null, role: 'super_admin', password: form.password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Création impossible');
      // Si l'utilisateur existait déjà (autre rôle), on garantit l'élévation en super_admin + le nom.
      await load();
      const existing = (await fetch(`/api/admin/users?tenant=${TENANT}`, { credentials: 'include' }).then(x => x.json()).catch(() => ({}))).users || [];
      const u = (existing as U[]).find(x => x.email === email);
      if (u && (u.role !== 'super_admin' || (form.name && u.name !== form.name))) {
        await fetch('/api/admin/users', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ id: u.id, role: 'super_admin', is_active: true, ...(form.name ? { name: form.name } : {}) }),
        });
      }
      setForm({ email: '', name: '', password: '' });
      setNotice(`✓ Accès administrateur accordé à ${email}. Il peut se connecter à /admin et au tenant ${TENANT} avec ce mot de passe.`);
      await load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'inconnue')); }
    finally { setSaving(false); }
  }

  async function resetPwd(u: U) {
    const pwd = prompt(`Nouveau mot de passe pour ${u.email} (8 caractères min.) :`) || '';
    if (!pwd) return;
    if (pwd.length < 8) { alert('Mot de passe : 8 caractères minimum.'); return; }
    const r = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id: u.id, password: pwd }),
    });
    setNotice(r.ok ? `✓ Mot de passe réinitialisé pour ${u.email}.` : 'Erreur lors de la réinitialisation.');
  }

  async function toggleActive(u: U) {
    const r = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id: u.id, is_active: u.is_active === false }),
    });
    if (r.ok) load();
  }

  async function revoke(u: U) {
    if (!confirm(`Retirer l'accès administrateur de ${u.email} ?\n\nSon compte reste dans le tenant ${TENANT} mais il n'aura plus accès à /admin.`)) return;
    // Rétrograde en utilisateur standard du tenant (ne supprime pas le compte cerdia).
    const r = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id: u.id, role: 'client_admin' }),
    });
    setNotice(r.ok ? `Accès administrateur retiré pour ${u.email} (compte ${TENANT} conservé).` : 'Erreur.');
    if (r.ok) load();
  }

  async function remove(u: U) {
    if (!confirm(`SUPPRIMER définitivement le compte ${u.email} ?\n\nCette action est irréversible : le compte et ses sessions sont supprimés (admin ET accès ${TENANT}).`)) return;
    const r = await fetch(`/api/admin/users?id=${encodeURIComponent(u.id)}`, { method: 'DELETE', credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    setNotice(r.ok ? `🗑 Compte ${u.email} supprimé définitivement.` : 'Erreur : ' + (j.error || 'suppression impossible'));
    if (r.ok) load();
  }

  const inp = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <Shield size={18} className="text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">Administrateurs</h2>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Créez des comptes administrateurs (courriel + mot de passe que vous définissez). Chaque admin peut accéder
        à cet espace <code className="rounded bg-gray-100 px-1">/admin</code> <strong>et</strong> au tenant
        <code className="rounded bg-gray-100 px-1">{TENANT}</code> avec le même mot de passe.
      </p>

      {/* Formulaire de création */}
      <div className="mb-5 grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input className={inp} placeholder="Courriel" type="email" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <input className={inp} placeholder="Nom (optionnel)" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className={inp} placeholder="Mot de passe (8+ car.)" type="text" value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        <button onClick={create} disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Donner accès
        </button>
      </div>

      {notice && <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{notice}</div>}

      {/* Liste des admins */}
      {loading ? (
        <div className="grid place-items-center py-10 text-gray-400"><Loader2 className="animate-spin" /></div>
      ) : admins.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">
          Aucun administrateur pour l'instant. Créez-en un ci-dessus.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Administrateur</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map(u => (
                <tr key={u.id} className={u.is_active === false ? 'opacity-50' : ''}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {(u.name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{u.name || u.email}</div>
                        {u.name && <div className="text-xs text-gray-400">{u.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {u.is_active === false
                      ? <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-500">Désactivé</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"><UserCheck size={11} /> Actif</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button onClick={() => resetPwd(u)} title="Réinitialiser le mot de passe"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        <KeyRound size={12} /> Mot de passe
                      </button>
                      <button onClick={() => toggleActive(u)} title={u.is_active === false ? 'Réactiver' : 'Désactiver'}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        <Power size={12} /> {u.is_active === false ? 'Réactiver' : 'Désactiver'}
                      </button>
                      <button onClick={() => revoke(u)} title="Retirer l'accès administrateur (garde le compte cerdia)"
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        Retirer
                      </button>
                      <button onClick={() => remove(u)} title="Supprimer définitivement le compte"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
