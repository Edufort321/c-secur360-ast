'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Car, ChevronLeft, ChevronRight, Download, Loader2,
  Plus, Save, Truck, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';

/* ------------------------------------------------------------------ types */
type Vehicle = {
  id: string; name: string; make: string; model: string;
  year: number | null; plate: string; type: string; employee_name: string;
};

type LogEntry = {
  id?: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_type: string;
  week_start: string;
  odometer_start: number;
  odometer_end: number;
  km_personal: number;
  notes: string;
  dirty?: boolean;
};

/* ------------------------------------------------------------------ utils */
function weekMonday(d = new Date()) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}
function addWeeks(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().slice(0, 10);
}
function weekLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const end = new Date(iso + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
const km = (n: number) => `${Math.round(n).toLocaleString('fr-CA')} km`;

/* ================================================================ PAGE === */
export default function LogbookPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekStart, setWeekStart] = useState(weekMonday());
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  /* load current user + vehicles */
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || 'local';
      const uname = user?.user_metadata?.name || user?.email || 'Employé';
      setEmployeeId(uid);
      setEmployeeName(uname);
      const { data } = await supabase.from('vehicles')
        .select('id,name,make,model,year,plate,type,employee_name')
        .eq('tenant_id', tenant).eq('active', true);
      setVehicles(data || []);
    }
    init();
  }, [tenant]);

  /* load entries for selected week */
  useEffect(() => {
    if (!employeeId) return;
    loadWeek();
  }, [weekStart, employeeId]); // eslint-disable-line

  async function loadWeek() {
    setLoading(true);
    const { data } = await supabase.from('vehicle_logbook')
      .select('*')
      .eq('tenant_id', tenant)
      .eq('employee_id', employeeId)
      .eq('week_start', weekStart);

    const existingByVehicle = new Map((data || []).map((e: any) => [e.vehicle_id, e]));

    // Build one row per active vehicle assigned to this employee (or company vehicles)
    const rows: LogEntry[] = vehicles
      .filter(v => v.type === 'company' || v.employee_name === employeeName)
      .map(v => {
        const saved = existingByVehicle.get(v.id);
        return saved ? {
          id: saved.id,
          vehicle_id: v.id,
          vehicle_name: saved.vehicle_name || v.name,
          vehicle_type: v.type,
          week_start: weekStart,
          odometer_start: Number(saved.odometer_start),
          odometer_end: Number(saved.odometer_end),
          km_personal: Number(saved.km_personal),
          notes: saved.notes || '',
          dirty: false,
        } : {
          vehicle_id: v.id,
          vehicle_name: v.name,
          vehicle_type: v.type,
          week_start: weekStart,
          odometer_start: 0,
          odometer_end: 0,
          km_personal: 0,
          notes: '',
          dirty: false,
        };
      });
    setEntries(rows);
    setLoading(false);
  }

  function update(vehicleId: string, field: keyof LogEntry, value: any) {
    setEntries(prev => prev.map(e =>
      e.vehicle_id === vehicleId ? { ...e, [field]: value, dirty: true } : e
    ));
  }

  async function saveAll() {
    setSaving(true);
    const dirty = entries.filter(e => e.dirty);
    for (const e of dirty) {
      const row = {
        tenant_id: tenant,
        employee_id: employeeId,
        employee_name: employeeName,
        vehicle_id: e.vehicle_id,
        vehicle_name: e.vehicle_name,
        vehicle_type: e.vehicle_type,
        week_start: weekStart,
        odometer_start: e.odometer_start,
        odometer_end: e.odometer_end,
        km_personal: e.km_personal,
        notes: e.notes,
        updated_at: new Date().toISOString(),
      };
      if (e.id) {
        await supabase.from('vehicle_logbook').update(row).eq('id', e.id);
      } else {
        const { data } = await supabase.from('vehicle_logbook')
          .upsert(row, { onConflict: 'tenant_id,employee_id,vehicle_id,week_start' })
          .select().single();
        if (data) {
          setEntries(prev => prev.map(x =>
            x.vehicle_id === e.vehicle_id ? { ...x, id: data.id, dirty: false } : x
          ));
        }
      }
    }
    setEntries(prev => prev.map(e => ({ ...e, dirty: false })));
    setSaving(false);
  }

  /* ---- annual summary ---- */
  const [annualData, setAnnualData] = useState<any[]>([]);
  useEffect(() => {
    if (!employeeId) return;
    supabase.from('vehicle_logbook')
      .select('*')
      .eq('tenant_id', tenant)
      .eq('employee_id', employeeId)
      .gte('week_start', `${yearFilter}-01-01`)
      .lte('week_start', `${yearFilter}-12-31`)
      .order('week_start')
      .then(({ data }) => setAnnualData(data || []));
  }, [tenant, employeeId, yearFilter]); // eslint-disable-line

  const annualStats = useMemo(() => {
    const byVehicle: Record<string, { name: string; type: string; total: number; personal: number; professional: number }> = {};
    for (const e of annualData) {
      const total = Number(e.odometer_end) - Number(e.odometer_start);
      const personal = Number(e.km_personal);
      const professional = Math.max(0, total - personal);
      if (!byVehicle[e.vehicle_id]) {
        byVehicle[e.vehicle_id] = { name: e.vehicle_name, type: e.vehicle_type, total: 0, personal: 0, professional: 0 };
      }
      byVehicle[e.vehicle_id].total += total;
      byVehicle[e.vehicle_id].personal += personal;
      byVehicle[e.vehicle_id].professional += professional;
    }
    return Object.values(byVehicle);
  }, [annualData]);

  /* ---- CSV export (TP-41 / T777 format) ---- */
  function exportCSV() {
    if (!annualData.length) { alert('Aucune donnée pour cette année.'); return; }
    const rows = [
      ['Semaine','Véhicule','Type','Odomètre début','Odomètre fin','Km total','Km personnel','Km professionnel','Notes'].join(','),
      ...annualData.map(e => {
        const total = Number(e.odometer_end) - Number(e.odometer_start);
        const personal = Number(e.km_personal);
        const professional = Math.max(0, total - personal);
        return [
          e.week_start,
          `"${e.vehicle_name}"`,
          e.vehicle_type === 'company' ? 'Entreprise' : 'Personnel',
          e.odometer_start, e.odometer_end,
          total, personal, professional,
          `"${(e.notes || '').replace(/"/g, '""')}"`,
        ].join(',');
      }),
      '',
      ['RÉSUMÉ ANNUEL ' + yearFilter, '', '', '', '', '', '', '', ''].join(','),
      ...annualStats.map(s => [
        '', `"${s.name}"`,
        s.type === 'company' ? 'Entreprise' : 'Personnel',
        '', '', s.total, s.personal, s.professional, '',
      ].join(',')),
    ].join('\n');

    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })),
      download: `logbook_${yearFilter}_${employeeName.replace(/\s+/g, '_')}_${tenant}.csv`,
    });
    a.click();
  }

  const hasDirty = entries.some(e => e.dirty);
  const years = useMemo(() => {
    const y = new Set(annualData.map(e => new Date(e.week_start).getFullYear()));
    y.add(new Date().getFullYear());
    return [...y].sort((a, b) => b - a);
  }, [annualData]);

  /* ================================================================ JSX === */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Car size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Logbook véhicules</h1>
              <p className="text-sm text-slate-500">
                {employeeName} · <span className="font-medium text-slate-700">{tenant}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download size={15} /> Export TP-41 / T777
            </button>
            {hasDirty && (
              <button onClick={saveAll} disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
              </button>
            )}
          </div>
        </div>

        {/* Week navigator */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setWeekStart(w => addWeeks(w, -1))}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
            <ChevronLeft size={16} />
          </button>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            Semaine du {weekLabel(weekStart)}
          </div>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setWeekStart(weekMonday())}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Cette semaine
          </button>
        </div>

        {/* No vehicles notice */}
        {!loading && vehicles.filter(v => v.type === 'company' || v.employee_name === employeeName).length === 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Aucun véhicule assigné. Ajoutez des véhicules dans <strong>Administration → Véhicules</strong>.
            </p>
          </div>
        )}

        {/* Weekly entry table */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">Véhicule</th>
                  <th className="px-4 py-3">Odomètre début (km)</th>
                  <th className="px-4 py-3">Odomètre fin (km)</th>
                  <th className="px-4 py-3">Km total</th>
                  <th className="px-4 py-3">Km personnel</th>
                  <th className="px-4 py-3">Km professionnel</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const total = Math.max(0, e.odometer_end - e.odometer_start);
                  const professional = Math.max(0, total - e.km_personal);
                  const pct = total > 0 ? Math.round((professional / total) * 100) : 0;
                  return (
                    <tr key={e.vehicle_id} className={`border-t border-slate-100 ${e.dirty ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {e.vehicle_type === 'company'
                            ? <Truck size={14} className="text-slate-500 shrink-0" />
                            : <Car size={14} className="text-teal-600 shrink-0" />}
                          <div>
                            <div className="font-medium text-slate-800">{e.vehicle_name}</div>
                            <div className="text-xs text-slate-400">
                              {e.vehicle_type === 'company' ? 'Entreprise' : 'Personnel autorisé'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min={0} step={1}
                          value={e.odometer_start || ''}
                          onChange={ev => update(e.vehicle_id, 'odometer_start', Number(ev.target.value))}
                          className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min={0} step={1}
                          value={e.odometer_end || ''}
                          onChange={ev => update(e.vehicle_id, 'odometer_end', Number(ev.target.value))}
                          className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{km(total)}</td>
                      <td className="px-4 py-3">
                        {e.vehicle_type === 'company' ? (
                          <input type="number" min={0} max={total} step={1}
                            value={e.km_personal || ''}
                            onChange={ev => update(e.vehicle_id, 'km_personal', Math.min(Number(ev.target.value), total))}
                            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-teal-700">{km(professional)}</div>
                        {e.vehicle_type === 'company' && total > 0 && (
                          <div className="mt-0.5 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" placeholder="Optionnel"
                          value={e.notes}
                          onChange={ev => update(e.vehicle_id, 'notes', ev.target.value)}
                          className="w-40 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                      </td>
                    </tr>
                  );
                })}
                {entries.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Aucun véhicule assigné pour cette semaine.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Annual summary */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-bold text-slate-800">Résumé annuel</h2>
            <div className="flex gap-1 rounded-xl border border-slate-200 p-1">
              {(years.length ? years : [new Date().getFullYear()]).map(y => (
                <button key={y} onClick={() => setYearFilter(y)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${yearFilter === y ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          {annualStats.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">Aucune donnée pour {yearFilter}.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">Véhicule</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Km total</th>
                  <th className="px-4 py-3">Km personnel</th>
                  <th className="px-4 py-3">Km professionnel</th>
                  <th className="px-4 py-3">% professionnel</th>
                </tr>
              </thead>
              <tbody>
                {annualStats.map((s, i) => {
                  const pct = s.total > 0 ? Math.round((s.professional / s.total) * 100) : 0;
                  return (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {s.type === 'company'
                            ? <Truck size={14} className="text-slate-500" />
                            : <Car size={14} className="text-teal-600" />}
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.type === 'company' ? 'Entreprise' : 'Personnel'}
                      </td>
                      <td className="px-4 py-3 font-medium">{km(s.total)}</td>
                      <td className="px-4 py-3 text-slate-600">{km(s.personal)}</td>
                      <td className="px-4 py-3 font-semibold text-teal-700">{km(s.professional)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Export info */}
        <p className="mt-4 text-xs text-slate-400 text-center">
          Export CSV compatible formulaire TP-41 (Revenu Québec) et T777 (Agence du revenu du Canada).
          Conservez vos relevés d&apos;odomètre à titre de pièces justificatives.
        </p>
      </div>
    </div>
  );
}
