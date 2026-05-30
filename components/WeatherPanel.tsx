'use client';

import { useEffect, useState } from 'react';

// Panneau meteo reutilisable (planificateur + AST). Interroge /api/weather (cle cote serveur).
// Affiche la meteo courante, une prevision pour une date optionnelle, et une ALERTE ORAGE proeminente.
// Silencieux si la meteo est indisponible (cle absente/invalide, lieu introuvable) pour ne pas polluer l'UI.
type WeatherData = {
  available: boolean;
  location?: string | null;
  current?: { temp: number; feels: number; description: string | null; icon: string | null; wind: number; humidity: number | null };
  dayForecast?: { date: string; tempMin: number; tempMax: number; description: string | null; icon: string | null; storm: boolean } | null;
  alerts?: { type: string; when: string; label: string }[];
};

export function WeatherPanel({ location, date, className = '' }: { location?: string | null; date?: string | null; className?: string }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loc = (location || '').trim();
    if (!loc) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ q: loc });
    if (date) params.set('date', date);
    fetch(`/api/weather?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [location, date]);

  if (!location || !location.trim()) return null;
  if (loading) return <div className={`text-xs text-gray-400 ${className}`}>🌤️ Météo…</div>;
  if (!data || !data.available || !data.current) return null; // silencieux si indisponible

  const icon = (code: string | null) => (code ? `https://openweathermap.org/img/wn/${code}@2x.png` : null);
  const storm = (data.alerts || []).filter((a) => a.type === 'orage');

  return (
    <div className={`rounded-lg border border-gray-200 bg-gradient-to-br from-sky-50 to-white p-3 ${className}`}>
      {storm.length > 0 && (
        <div className="mb-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
          <span className="text-lg leading-none">⛈️</span>
          <div className="text-xs">
            <div className="font-bold">Alerte orage</div>
            <div>{storm[0].when === 'maintenant' ? 'Orage en cours sur le lieu des travaux.' : `Orage prévu : ${storm[0].when}.`}</div>
            {storm.length > 1 && <div className="text-amber-600">+ {storm.length - 1} autre(s) créneau(x) orageux prévu(s).</div>}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        {icon(data.current.icon) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon(data.current.icon) as string} alt="" width={48} height={48} className="shrink-0" />
        )}
        <div className="text-sm">
          <div className="font-semibold text-gray-800">
            {data.location ? `${data.location} — ` : ''}{data.current.temp}°C
            <span className="ml-1 font-normal text-gray-500">(ressenti {data.current.feels}°C)</span>
          </div>
          <div className="capitalize text-gray-600">{data.current.description}</div>
          <div className="text-xs text-gray-500">💨 {data.current.wind} km/h{data.current.humidity != null ? ` · 💧 ${data.current.humidity}%` : ''}</div>
        </div>
      </div>
      {data.dayForecast && (
        <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-600">
          {icon(data.dayForecast.icon) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon(data.dayForecast.icon) as string} alt="" width={32} height={32} />
          )}
          <span>
            <b>{data.dayForecast.date}</b> : {data.dayForecast.tempMin}° / {data.dayForecast.tempMax}°C · <span className="capitalize">{data.dayForecast.description}</span>
            {data.dayForecast.storm && <span className="ml-1 font-semibold text-amber-700">⛈️ orage</span>}
          </span>
        </div>
      )}
    </div>
  );
}
