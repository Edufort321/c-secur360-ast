'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Loader2, AlertTriangle, CheckCircle, FileText, Users, Wind,
  MapPin, Shield, QrCode, BarChart3, LogIn, LogOut, X,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);

// ── Read-only display helpers ──────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    active:    'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    draft: 'Brouillon', active: 'Actif', completed: 'Complété', cancelled: 'Annulé',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? map.draft}`}>
      {labels[status] ?? status}
    </span>
  );
}

function ReadingRow({ label, value, unit, limit }: { label: string; value?: number | null; unit: string; limit?: string }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-600">{label}</span>
      <div className="text-right">
        <span className="font-semibold text-slate-800">{value} {unit}</span>
        {limit && <span className="ml-2 text-xs text-slate-400">({limit})</span>}
      </div>
    </div>
  );
}

// ── Public read-only ConfinedSpace view ────────────────────────────────────

export default function ConfinedSpacePublicView() {
  const params = useParams();
  const tenant = params?.tenant as string;
  const permitNumber = params?.permitNumber as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [entryModal, setEntryModal] = useState(false);
  const [entryName, setEntryName] = useState('');
  const [entryCompany, setEntryCompany] = useState('');
  const [entryAction, setEntryAction] = useState<'entry' | 'exit'>('entry');
  const [entrySaving, setEntrySaving] = useState(false);
  const [entryDone, setEntryDone] = useState(false);

  useEffect(() => {
    if (!permitNumber) return;
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from('confined_space_permits')
          .select('data')
          .eq('permit_number', permitNumber)
          .eq('tenant_id', tenant)
          .single();
        if (error || !row) { setMissing(true); return; }
        setData(row.data);
      } catch {
        setMissing(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [permitNumber, tenant]);

  async function saveEntry() {
    if (!entryName.trim() || !data) return;
    setEntrySaving(true);
    try {
      // Fetch latest permit data to avoid overwriting concurrent changes
      const { data: latest } = await supabase.from('confined_space_permits').select('data').eq('permit_number', permitNumber).eq('tenant_id', tenant).single();
      const permit = latest?.data ?? data;
      const registry = permit.entryRegistry ?? { personnel: [], entryLog: [], activeEntrants: [] };
      // Find or create personnel entry
      const personnel = [...(registry.personnel ?? [])];
      let personIdx = personnel.findIndex((p: any) => p.name?.toLowerCase() === entryName.trim().toLowerCase());
      const newPersonId = personIdx >= 0 ? personnel[personIdx].id : `anon-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();
      if (personIdx < 0) {
        personnel.push({ id: newPersonId, name: entryName.trim(), company: entryCompany.trim(), role: 'entrant', addedAt: now });
        personIdx = personnel.length - 1;
      }
      // Set entryTime / exitTime on the person record so the registry display reflects it
      if (entryAction === 'entry') {
        personnel[personIdx] = { ...personnel[personIdx], entryTime: now.slice(0, 16).replace('T', ' ') };
      } else {
        personnel[personIdx] = { ...personnel[personIdx], exitTime: now.slice(0, 16).replace('T', ' ') };
      }
      registry.personnel = personnel;
      // Add entry/exit log
      const logEntry = { id: `log-${Date.now()}`, personnelId: newPersonId, action: entryAction, timestamp: now, authorizedBy: 'auto (QR)', notes: entryCompany.trim() || undefined };
      registry.entryLog = [...(registry.entryLog ?? []), logEntry];
      // Update activeEntrants
      if (entryAction === 'entry') {
        registry.activeEntrants = [...new Set([...(registry.activeEntrants ?? []), newPersonId])];
      } else {
        registry.activeEntrants = (registry.activeEntrants ?? []).filter((id: string) => id !== newPersonId);
      }
      const updated = { ...permit, entryRegistry: registry, updated_at: new Date().toISOString() };
      // onConflict (tenant_id, permit_number) : sans ça, la 2e entrée/sortie viole l'unicité (mig 227) →
      // l'écriture échouait et était avalée par le catch alors que l'UI affichait « ✓ » (journal non sauvé).
      const { error: upErr } = await supabase.from('confined_space_permits')
        .upsert({ permit_number: permitNumber, tenant_id: tenant, data: updated, updated_at: updated.updated_at }, { onConflict: 'tenant_id,permit_number' });
      if (upErr) throw upErr;
      setData(updated);
      setEntryDone(true);
      setEntryModal(false);
      setEntryName(''); setEntryCompany('');
      setTimeout(() => setEntryDone(false), 4000);
    } catch { if (typeof window !== 'undefined') window.alert('Échec de l’enregistrement du mouvement — réessayez.'); } finally { setEntrySaving(false); }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (missing || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
          <h2 className="mb-1 text-lg font-bold text-amber-900">Permis introuvable</h2>
          <p className="text-sm text-amber-700">
            Le numéro <code className="rounded bg-amber-100 px-1">{permitNumber}</code> n&apos;existe pas ou n&apos;est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const d = data;
  const si = d.siteInformation ?? {};
  const atm = d.atmosphericTesting ?? {};
  const reg = d.entryRegistry ?? {};
  const rescue = d.rescuePlan ?? {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-700 px-4 py-5 lg:px-8 print:bg-blue-100">
        <div className="mx-auto max-w-3xl flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wind className="text-blue-200" size={18} />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                Permis Espace Clos — Lecture seule
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{permitNumber}</h1>
            {si.spaceName && (
              <p className="mt-1 text-sm text-blue-100">{si.spaceName}</p>
            )}
          </div>
          {d.status && <Badge status={d.status} />}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">

        {/* Active entrants banner */}
        {d.status === 'active' && reg.activeEntrants?.length > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 px-5 py-3.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white font-bold text-lg">
              {reg.activeEntrants.length}
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">
                {reg.activeEntrants.length === 1 ? '1 personne à l\'intérieur' : `${reg.activeEntrants.length} personnes à l'intérieur`}
              </p>
              <p className="text-xs text-green-700">
                {(reg.personnel ?? []).filter((p: any) => (reg.activeEntrants ?? []).includes(p.id)).map((p: any) => p.name).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Site information */}
        <Section title="Informations du site" icon={<MapPin size={16} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Numéro de permis" value={permitNumber} />
            <InfoRow label="Province" value={d.province} />
            <InfoRow label="Nom de l'espace" value={si.spaceName} />
            <InfoRow label="Localisation" value={si.location} />
            <InfoRow label="Type d'espace" value={si.spaceType} />
            <InfoRow label="Superviseur" value={d.supervisor_name} />
            <InfoRow label="Certification" value={d.supervisor_cert} />
            <InfoRow label="Valide du" value={d.permit_valid_from?.replace('T', ' ').slice(0, 16)} />
            <InfoRow label="Valide au" value={d.permit_valid_to?.replace('T', ' ').slice(0, 16)} />
          </div>
          {si.workDescription && (
            <div className="pt-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description des travaux</span>
              <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{si.workDescription}</p>
            </div>
          )}
        </Section>

        {/* Atmospheric testing */}
        {atm.readings?.length > 0 && (
          <Section title={`Tests atmosphériques (${atm.readings.length} lectures)`} icon={<Wind size={16} />}>
            {atm.equipment?.deviceModel && (
              <p className="text-xs text-slate-500 mb-3">
                Appareil : <strong>{atm.equipment.deviceModel}</strong>
                {atm.equipment.calibrationDate ? ` — Calibré le ${atm.equipment.calibrationDate}` : ''}
              </p>
            )}
            <div className="space-y-2">
              {atm.readings.map((r: any, i: number) => {
                // Support both old field names (r.o2) and new ones (r.readings.oxygen)
                const rv = r.readings ?? r;
                const o2  = rv.oxygen   ?? r.o2;
                const lel = rv.combustibleGas ?? r.lel;
                const co  = rv.carbonMonoxide  ?? r.co;
                const h2s = rv.hydrogenSulfide  ?? r.h2s;
                const ts  = r.timestamp ? new Date(r.timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) : (r.time ?? '');
                const tester = r.testedBy ?? r.tester;
                return (
                <div key={r.id ?? i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-700 mb-2">
                    Lecture {i + 1} {ts ? `— ${ts}` : ''}
                    {tester ? ` — ${tester}` : ''}
                    {r.location ? ` — ${r.location}` : ''}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {o2 != null && (
                      <div className={`rounded px-2 py-1 text-center ${o2 >= 19.5 && o2 <= 23 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{o2}%</div>
                        <div className="text-slate-500">O₂</div>
                      </div>
                    )}
                    {lel != null && (
                      <div className={`rounded px-2 py-1 text-center ${lel < 10 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{lel}%</div>
                        <div className="text-slate-500">LIE</div>
                      </div>
                    )}
                    {co != null && (
                      <div className={`rounded px-2 py-1 text-center ${co < 35 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{co} ppm</div>
                        <div className="text-slate-500">CO</div>
                      </div>
                    )}
                    {h2s != null && (
                      <div className={`rounded px-2 py-1 text-center ${h2s < 10 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{h2s} ppm</div>
                        <div className="text-slate-500">H₂S</div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Entry registry */}
        {reg.personnel?.length > 0 && (
          <Section title={`Registre d'entrée (${reg.personnel.length} personnes)`} icon={<Users size={16} />}>
            <div className="space-y-2">
              {reg.personnel.map((p: any, i: number) => {
                const isInside = (reg.activeEntrants ?? []).includes(p.id);
                return (
                  <div key={p.id ?? i} className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${isInside ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.company ? `${p.company} · ` : ''}{p.role ?? 'entrant'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 text-xs text-slate-500">
                      {isInside && <span className="rounded-full bg-green-200 px-2 py-0.5 text-green-800 font-semibold">À l&apos;intérieur</span>}
                      {p.entryTime && <span>Entrée : {p.entryTime.slice(0, 16).replace('T', ' ')}</span>}
                      {p.exitTime && <span>Sortie : {p.exitTime.slice(0, 16).replace('T', ' ')}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Rescue plan */}
        {(rescue.evacuationProcedure || rescue.emergencyContacts?.length > 0) && (
          <Section title="Plan de sauvetage" icon={<Shield size={16} />}>
            {rescue.evacuationProcedure && (
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Procédure d&apos;évacuation</span>
                <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{rescue.evacuationProcedure}</p>
              </div>
            )}
            {rescue.emergencyContacts?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contacts d&apos;urgence</span>
                <div className="mt-1 space-y-1">
                  {rescue.emergencyContacts.map((c: any, i: number) => (
                    <p key={i} className="text-sm text-slate-800">
                      {c.name} {c.phone ? `— ${c.phone}` : ''} {c.role ? `(${c.role})` : ''}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Permitted work & notes */}
        {(d.permitted_work || d.restrictions || d.finalization_notes) && (
          <Section title="Travaux autorisés & notes" icon={<FileText size={16} />}>
            <InfoRow label="Travaux autorisés" value={d.permitted_work} />
            <InfoRow label="Restrictions" value={d.restrictions} />
            <InfoRow label="Notes finales" value={d.finalization_notes} />
          </Section>
        )}

        {/* Enregistrement entrée/sortie */}
        {d.status === 'active' && (
          <div className="mt-4">
            {entryDone && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle size={16} /> Mouvement enregistré ✓
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setEntryAction('entry'); setEntryModal(true); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all">
                <LogIn size={18} /> Enregistrer entrée
              </button>
              <button onClick={() => { setEntryAction('exit'); setEntryModal(true); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                <LogOut size={18} /> Enregistrer sortie
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
          <QrCode size={14} className="shrink-0 text-slate-400" />
          <span>Vue publique — {permitNumber}</span>
        </div>
      </div>

      {/* Entry modal */}
      {entryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {entryAction === 'entry' ? '👷 Enregistrer entrée' : '🚪 Enregistrer sortie'}
              </h2>
              <button onClick={() => setEntryModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nom complet *</label>
                <input
                  autoFocus
                  value={entryName}
                  onChange={e => setEntryName(e.target.value)}
                  placeholder="Prénom et nom"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Entreprise</label>
                <input
                  value={entryCompany}
                  onChange={e => setEntryCompany(e.target.value)}
                  placeholder="Nom de l'entreprise (optionnel)"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <p className="text-xs text-slate-400">Heure : {new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })} · Permis : {permitNumber}</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setEntryModal(false)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={saveEntry} disabled={!entryName.trim() || entrySaving}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${entryAction === 'entry' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'}`}>
                {entrySaving ? <Loader2 size={16} className="animate-spin" /> : entryAction === 'entry' ? <LogIn size={16} /> : <LogOut size={16} />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
