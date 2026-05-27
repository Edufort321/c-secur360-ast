'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Car, ChevronLeft, ChevronRight, Download, Info, Loader2,
  Save, Truck, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';

/* ------------------------------------------------------------------ types */
type Vehicle = {
  id: string; name: string; make: string; model: string;
  year: number | null; plate: string; type: string; employee_name: string;
  purchase_price: number | null; km_at_year_start: number; km_year_start_year: number | null;
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
  km_job_auto: number; // auto depuis feuilles de temps — non sauvegardé en DB
  notes: string;
  dirty?: boolean;
};

/* ------------------------------------------------------------------ taux ARC 2025 (fédéral / QC identique) */
const CRA_2025 = {
  standby_monthly_pct: 0.02,       // 2 %/mois × coût = frais de disponibilité
  standby_threshold_km: 20004,     // < 20 004 km/an → frais proratisés
  operating_per_km: 0.35,          // 0,35 $/km personnel = frais d'usage
  personal_first_km: 5000,
  personal_rate_first: 0.72,       // 0,72 $/km premiers 5 000 km (remb. non-imposable)
  personal_rate_after: 0.66,       // 0,66 $/km au-delà
} as const;

function computeTaxableBenefit(price: number, personalKm: number, totalKm: number, months = 12) {
  const fullStandby = price * CRA_2025.standby_monthly_pct * months;
  const standby = totalKm > 0 && personalKm < CRA_2025.standby_threshold_km
    ? (personalKm / CRA_2025.standby_threshold_km) * fullStandby
    : fullStandby;
  const operating = personalKm * CRA_2025.operating_per_km;
  return {
    standby:   Math.round(standby   * 100) / 100,
    operating: Math.round(operating * 100) / 100,
    total:     Math.round((standby + operating) * 100) / 100,
  };
}

function computePersonalReimbursement(km: number) {
  if (km <= CRA_2025.personal_first_km) return km * CRA_2025.personal_rate_first;
  return CRA_2025.personal_first_km * CRA_2025.personal_rate_first
       + (km - CRA_2025.personal_first_km) * CRA_2025.personal_rate_after;
}

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
  const d   = new Date(iso + 'T00:00:00');
  const end = new Date(iso + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
const fmt   = (n: number) => `${Math.round(n).toLocaleString('fr-CA')} km`;
const money = (n: number) => `${n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

/* ================================================================ PAGE === */
function LogbookInner() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const tenant       = (params?.tenant as string) || 'demo';

  const [vehicles,      setVehicles]     = useState<Vehicle[]>([]);
  const [entries,       setEntries]      = useState<LogEntry[]>([]);
  const [loading,       setLoading]      = useState(true);
  const [saving,        setSaving]       = useState(false);
  const [weekStart,     setWeekStart]    = useState(() => searchParams?.get('week') || weekMonday());
  const [employeeId,    setEmployeeId]   = useState('');
  const [employeeName,  setEmployeeName] = useState('');
  const [yearFilter,    setYearFilter]   = useState(new Date().getFullYear());
  const [annualData,    setAnnualData]   = useState<any[]>([]);

  /* ---- init : utilisateur + véhicules ---- */
  useEffect(() => {
    async function init() {
      let uid = 'local'; let uname = 'Employé';
      try {
        const res = await fetch('/api/auth/me');
        const { user } = await res.json();
        if (user) { uid = user.id; uname = user.name || user.email || 'Employé'; }
      } catch {}
      if (uid === 'local') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { uid = user.id; uname = user.user_metadata?.name || user.email || 'Employé'; }
      }
      setEmployeeId(uid);
      setEmployeeName(uname);
      const { data } = await supabase.from('vehicles')
        .select('id,name,make,model,year,plate,type,employee_name,purchase_price,km_at_year_start,km_year_start_year')
        .eq('tenant_id', tenant).eq('active', true);
      setVehicles((data || []).map((v: any) => ({
        ...v,
        purchase_price:     v.purchase_price != null ? Number(v.purchase_price) : null,
        km_at_year_start:   Number(v.km_at_year_start || 0),
        km_year_start_year: v.km_year_start_year ?? null,
      })));
    }
    init();
  }, [tenant]);

  /* ---- chargement semaine + km auto depuis feuilles de temps ---- */
  useEffect(() => {
    if (!employeeId || vehicles.length === 0) return;
    loadWeek();
  }, [weekStart, employeeId, vehicles]); // eslint-disable-line

  async function loadWeek() {
    setLoading(true);
    const weekEnd    = addWeeks(weekStart, 1);
    const currentYear = new Date(weekStart + 'T00:00:00').getFullYear();

    // Entrées logbook existantes pour cette semaine
    const { data: saved } = await supabase.from('vehicle_logbook')
      .select('*').eq('tenant_id', tenant).eq('employee_id', employeeId).eq('week_start', weekStart);

    // Odomètre fin de la semaine précédente → pré-remplissage odomètre début
    const prevWeek = addWeeks(weekStart, -1);
    const { data: prevSaved } = await supabase.from('vehicle_logbook')
      .select('vehicle_id, odometer_end')
      .eq('tenant_id', tenant).eq('employee_id', employeeId).eq('week_start', prevWeek);
    const prevOdom = new Map((prevSaved || []).map((e: any) => [e.vehicle_id, Number(e.odometer_end)]));

    // Km par véhicule depuis les feuilles de temps de cette semaine
    const kmJob: Record<string, number> = {};
    try {
      const { data: tsList } = await supabase.from('timesheets')
        .select('id').eq('tenant_id', tenant).eq('employee_id', employeeId)
        .lte('period_start', weekEnd).gte('period_end', weekStart);
      const tsIds = (tsList || []).map((t: any) => t.id);
      if (tsIds.length > 0) {
        const { data: tsEntries } = await supabase.from('timesheet_entries')
          .select('vehicle_id, km')
          .in('timesheet_id', tsIds)
          .gte('date', weekStart).lt('date', weekEnd)
          .not('vehicle_id', 'is', null).gt('km', 0);
        for (const e of tsEntries || []) {
          if (e.vehicle_id) kmJob[e.vehicle_id] = (kmJob[e.vehicle_id] || 0) + Number(e.km || 0);
        }
      }
    } catch { /* dégradé */ }

    const existingByVehicle = new Map((saved || []).map((e: any) => [e.vehicle_id, e]));

    const rows: LogEntry[] = vehicles
      .filter(v => v.type === 'company' || v.employee_name === employeeName)
      .map(v => {
        const prev     = existingByVehicle.get(v.id);
        const kmJobV   = Math.round(kmJob[v.id] || 0);

        if (prev) {
          return {
            id: prev.id,
            vehicle_id:   v.id,
            vehicle_name: prev.vehicle_name || v.name,
            vehicle_type: v.type,
            week_start:   weekStart,
            odometer_start: Number(prev.odometer_start),
            odometer_end:   Number(prev.odometer_end),
            km_personal:    Number(prev.km_personal),
            km_job_auto:    kmJobV,
            notes:          prev.notes || '',
            dirty: false,
          };
        }

        // Nouvelle entrée — pré-remplir l'odomètre début
        const prevOdomVal = prevOdom.get(v.id);
        const kmYearStart = v.km_year_start_year === currentYear ? v.km_at_year_start : 0;
        const odomStart   = prevOdomVal ?? kmYearStart;
        // Auto-calculer km_personnel = total estimé - km_job (si odomètre start connu)
        const autoPerso = odomStart > 0 ? Math.max(0, 0 - kmJobV) : 0; // 0 tant qu'odom fin non saisi

        return {
          vehicle_id:   v.id,
          vehicle_name: v.name,
          vehicle_type: v.type,
          week_start:   weekStart,
          odometer_start: odomStart,
          odometer_end:   odomStart,
          km_personal:    autoPerso,
          km_job_auto:    kmJobV,
          notes: '',
          dirty: false,
        };
      });

    setEntries(rows);
    setLoading(false);
  }

  function update(vehicleId: string, field: keyof LogEntry, value: any) {
    setEntries(prev => prev.map(e => {
      if (e.vehicle_id !== vehicleId) return e;
      const upd = { ...e, [field]: value, dirty: true };
      // Recalcul auto de km_personal quand l'odomètre change
      if (field === 'odometer_start' || field === 'odometer_end') {
        const total  = Math.max(0, upd.odometer_end - upd.odometer_start);
        const autoPerso = Math.max(0, total - upd.km_job_auto);
        upd.km_personal = autoPerso;
      }
      return upd;
    }));
  }

  async function saveAll() {
    setSaving(true);
    for (const e of entries.filter(x => x.dirty)) {
      const row = {
        tenant_id: tenant, employee_id: employeeId, employee_name: employeeName,
        vehicle_id: e.vehicle_id, vehicle_name: e.vehicle_name, vehicle_type: e.vehicle_type,
        week_start: weekStart,
        odometer_start: e.odometer_start, odometer_end: e.odometer_end,
        km_personal: e.km_personal, notes: e.notes,
        updated_at: new Date().toISOString(),
      };
      if (e.id) {
        await supabase.from('vehicle_logbook').update(row).eq('id', e.id);
      } else {
        const { data } = await supabase.from('vehicle_logbook')
          .upsert(row, { onConflict: 'tenant_id,employee_id,vehicle_id,week_start' })
          .select().single();
        if (data) setEntries(p => p.map(x => x.vehicle_id === e.vehicle_id ? { ...x, id: data.id, dirty: false } : x));
      }
    }
    setEntries(p => p.map(e => ({ ...e, dirty: false })));
    setSaving(false);
  }

  /* ---- résumé annuel ---- */
  useEffect(() => {
    if (!employeeId) return;
    supabase.from('vehicle_logbook').select('*').eq('tenant_id', tenant).eq('employee_id', employeeId)
      .gte('week_start', `${yearFilter}-01-01`).lte('week_start', `${yearFilter}-12-31`).order('week_start')
      .then(({ data }) => setAnnualData(data || []));
  }, [tenant, employeeId, yearFilter]); // eslint-disable-line

  type AnnualStat = {
    vehicle_id: string; name: string; type: string;
    total: number; personal: number; professional: number;
    purchase_price: number | null;
  };

  const annualStats = useMemo<AnnualStat[]>(() => {
    const byV: Record<string, AnnualStat> = {};
    for (const e of annualData) {
      const total      = Number(e.odometer_end) - Number(e.odometer_start);
      const personal   = Number(e.km_personal);
      const professional = Math.max(0, total - personal);
      if (!byV[e.vehicle_id]) {
        const veh = vehicles.find(v => v.id === e.vehicle_id);
        byV[e.vehicle_id] = {
          vehicle_id: e.vehicle_id, name: e.vehicle_name, type: e.vehicle_type,
          total: 0, personal: 0, professional: 0,
          purchase_price: veh?.purchase_price ?? null,
        };
      }
      byV[e.vehicle_id].total        += total;
      byV[e.vehicle_id].personal     += personal;
      byV[e.vehicle_id].professional += professional;
    }
    return Object.values(byV);
  }, [annualData, vehicles]);

  /* ---- export CSV TP-41 / T777 ---- */
  function exportCSV() {
    if (!annualData.length) { alert('Aucune donnée pour cette année.'); return; }
    const rows = [
      ['Semaine','Véhicule','Type','Odomètre début','Odomètre fin','Km total','Km personnel','Km professionnel','Notes'].join(','),
      ...annualData.map(e => {
        const total  = Number(e.odometer_end) - Number(e.odometer_start);
        const perso  = Number(e.km_personal);
        return [e.week_start, `"${e.vehicle_name}"`, e.vehicle_type === 'company' ? 'Entreprise' : 'Personnel',
          e.odometer_start, e.odometer_end, total, perso, Math.max(0, total - perso),
          `"${(e.notes || '').replace(/"/g, '""')}"`,
        ].join(',');
      }),
      '', ['RÉSUMÉ ANNUEL ' + yearFilter,'','','','','','','',''].join(','),
      ...annualStats.map(s => ['', `"${s.name}"`, s.type === 'company' ? 'Entreprise' : 'Personnel',
        '', '', s.total, s.personal, s.professional, ''].join(',')),
    ].join('\n');
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })),
      download: `logbook_${yearFilter}_${employeeName.replace(/\s+/g, '_')}_${tenant}.csv`,
    }).click();
  }

  const hasDirty = entries.some(e => e.dirty);
  const years    = useMemo(() => {
    const y = new Set(annualData.map(e => new Date(e.week_start).getFullYear()));
    y.add(new Date().getFullYear());
    return [...y].sort((a, b) => b - a);
  }, [annualData]);

  const assignedVehicles = vehicles.filter(v => v.type === 'company' || v.employee_name === employeeName);

  /* ================================================================ JSX === */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">

        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Car size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Logbook véhicules</h1>
              <p className="text-sm text-slate-500">{employeeName} · <span className="font-medium text-slate-700">{tenant}</span></p>
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

        {/* Bandeau taux ARC 2025 */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <Info size={16} className="mt-0.5 shrink-0 text-sky-500" />
          <div>
            <strong>Taux ARC 2025 (fédéral — QC identique pour TP-41) :</strong>{' '}
            Véhicule personnel : <strong>{CRA_2025.personal_rate_first} $/km</strong> (premiers {CRA_2025.personal_first_km.toLocaleString('fr-CA')} km) · <strong>{CRA_2025.personal_rate_after} $/km</strong> ensuite.{' '}
            Avantage imposable véhicule entreprise : <strong>2 %/mois</strong> du coût d'achat (frais de disponibilité) + <strong>{CRA_2025.operating_per_km} $/km</strong> personnel (frais d'usage).{' '}
            <span className="text-sky-600">Km travail (TS) = km saisis dans les feuilles de temps pour ce véhicule.</span>
          </div>
        </div>

        {/* Navigateur de semaine */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
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

        {/* Aucun véhicule */}
        {!loading && assignedVehicles.length === 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <AlertCircle size={18} className="shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Aucun véhicule assigné. Ajoutez-en dans <strong>Administration → Véhicules</strong>.
            </p>
          </div>
        )}

        {/* Tableau hebdomadaire */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">Véhicule</th>
                  <th className="px-4 py-3">Odom. début</th>
                  <th className="px-4 py-3">Odom. fin</th>
                  <th className="px-4 py-3">Km total</th>
                  <th className="px-4 py-3 text-teal-700">
                    Km travail <span className="font-normal text-teal-400">(feuilles de temps)</span>
                  </th>
                  <th className="px-4 py-3">Km personnel</th>
                  <th className="px-4 py-3">Km professionnel</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const total      = Math.max(0, e.odometer_end - e.odometer_start);
                  const professional = Math.max(0, total - e.km_personal);
                  const pct        = total > 0 ? Math.round((professional / total) * 100) : 0;
                  const hasJob     = e.km_job_auto > 0;

                  return (
                    <tr key={e.vehicle_id} className={`border-t border-slate-100 ${e.dirty ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                      {/* Véhicule */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {e.vehicle_type === 'company'
                            ? <Truck size={14} className="shrink-0 text-slate-500" />
                            : <Car   size={14} className="shrink-0 text-teal-600" />}
                          <div>
                            <div className="font-medium text-slate-800">{e.vehicle_name}</div>
                            <div className="text-xs text-slate-400">
                              {e.vehicle_type === 'company' ? 'Entreprise' : 'Personnel autorisé'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Odomètre début */}
                      <td className="px-4 py-3">
                        <input type="number" min={0} step={1} value={e.odometer_start || ''}
                          onChange={ev => update(e.vehicle_id, 'odometer_start', Number(ev.target.value))}
                          className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                      </td>

                      {/* Odomètre fin */}
                      <td className="px-4 py-3">
                        <input type="number" min={0} step={1} value={e.odometer_end || ''}
                          onChange={ev => update(e.vehicle_id, 'odometer_end', Number(ev.target.value))}
                          className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                      </td>

                      {/* Km total */}
                      <td className="px-4 py-3 font-medium text-slate-700">{fmt(total)}</td>

                      {/* Km travail (depuis feuilles de temps) */}
                      <td className="px-4 py-3">
                        <div className={`font-semibold ${hasJob ? 'text-teal-700' : 'text-slate-300'}`}>
                          {fmt(e.km_job_auto)}
                        </div>
                        {hasJob && (
                          <div className="text-xs text-teal-500">Auto depuis FS temps</div>
                        )}
                      </td>

                      {/* Km personnel */}
                      <td className="px-4 py-3">
                        {e.vehicle_type === 'company' ? (
                          <div>
                            <input type="number" min={0} max={total} step={1}
                              value={e.km_personal || ''}
                              onChange={ev => update(e.vehicle_id, 'km_personal', Math.min(Number(ev.target.value), total))}
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                            {hasJob && <div className="text-xs text-slate-400">Calculé auto</div>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Km professionnel */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-teal-700">{fmt(professional)}</div>
                        {e.vehicle_type === 'company' && total > 0 && (
                          <div className="mt-0.5 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3">
                        <input type="text" placeholder="Optionnel" value={e.notes}
                          onChange={ev => update(e.vehicle_id, 'notes', ev.target.value)}
                          className="w-40 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-200" />
                      </td>
                    </tr>
                  );
                })}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      Aucun véhicule assigné pour cette semaine.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Résumé annuel */}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                    <th className="px-4 py-3">Véhicule</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Km total</th>
                    <th className="px-4 py-3">Km personnel</th>
                    <th className="px-4 py-3">Km professionnel</th>
                    <th className="px-4 py-3">% professionnel</th>
                    <th className="px-4 py-3 text-amber-700">
                      Avantage imposable / Remb. <span className="font-normal">(ARC 2025)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {annualStats.map((s, i) => {
                    const pct     = s.total > 0 ? Math.round((s.professional / s.total) * 100) : 0;
                    const benefit = s.type === 'company' && s.purchase_price != null
                      ? computeTaxableBenefit(s.purchase_price, s.personal, s.total)
                      : null;
                    const reimb = s.type === 'personal'
                      ? computePersonalReimbursement(s.professional)
                      : null;

                    return (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {s.type === 'company'
                              ? <Truck size={14} className="text-slate-500" />
                              : <Car   size={14} className="text-teal-600" />}
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {s.type === 'company' ? 'Entreprise' : 'Personnel'}
                        </td>
                        <td className="px-4 py-3 font-medium">{fmt(s.total)}</td>
                        <td className="px-4 py-3 text-slate-600">{fmt(s.personal)}</td>
                        <td className="px-4 py-3 font-semibold text-teal-700">{fmt(s.professional)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {benefit ? (
                            <div className="space-y-0.5 text-xs">
                              <div className="text-slate-500">
                                Frais de disponibilité :
                                <span className="ml-1 font-semibold text-amber-700">{money(benefit.standby)}</span>
                              </div>
                              <div className="text-slate-500">
                                Frais d'usage ({CRA_2025.operating_per_km} $/km × {fmt(s.personal)}) :
                                <span className="ml-1 font-semibold text-amber-700">{money(benefit.operating)}</span>
                              </div>
                              <div className="font-bold text-amber-800">
                                Total avantage T4 : {money(benefit.total)}
                              </div>
                              <div className="text-slate-400">
                                2 %/mois × {money(s.purchase_price!)} · {s.personal > CRA_2025.standby_threshold_km ? 'taux plein' : 'proraté (< 20 004 km perso)'}
                              </div>
                            </div>
                          ) : reimb != null ? (
                            <div className="text-xs">
                              <div className="font-semibold text-teal-700">
                                Remb. non-imposable : {money(reimb)}
                              </div>
                              <div className="text-slate-400">
                                {CRA_2025.personal_rate_first} $/km (≤ 5 000 km) / {CRA_2025.personal_rate_after} $/km ensuite
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              {s.type === 'company'
                                ? "Entrez le prix d'achat dans Admin → Véhicules"
                                : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Export CSV compatible TP-41 (Revenu Québec) et T777 (ARC). Estimation — à valider par votre comptable.
        </p>
      </div>
    </div>
  );
}

export default function LogbookPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>}>
      <LogbookInner />
    </Suspense>
  );
}
