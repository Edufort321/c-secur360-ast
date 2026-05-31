import { NextRequest, NextResponse } from 'next/server';

// Météo serveur (OpenWeatherMap). La clé WEATHER_API_KEY reste cote serveur (jamais exposee au client).
// Utilise par le planificateur (meteo de l'endroit des travaux) et l'AST (conditions/dangers).
// Alerte orage derivee des codes meteo (groupe 2xx = Thunderstorm) -> fonctionne avec une cle de base
// (les alertes gouvernementales officielles necessiteraient l'abonnement One Call 3.0).
export const dynamic = 'force-dynamic';

const OWM = 'https://api.openweathermap.org/data/2.5';

// Securite (#20) : rate-limit simple par IP (en memoire ; cap l'abus par instance).
// Pour une garantie inter-instances, basculer vers un store partage (Redis/DB) ulterieurement.
const RATE: Map<string, { count: number; reset: number }> = (globalThis as any).__weatherRate || new Map();
(globalThis as any).__weatherRate = RATE;
function rateOk(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const e = RATE.get(ip);
  if (!e || now > e.reset) { RATE.set(ip, { count: 1, reset: now + windowMs }); return true; }
  if (e.count >= limit) return false;
  e.count++; return true;
}

const isStorm = (w: any[]): boolean =>
  Array.isArray(w) && w.some((x) => (x?.id >= 200 && x?.id < 300) || x?.main === 'Thunderstorm');

export async function GET(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!rateOk(ip)) return NextResponse.json({ available: false, reason: 'rate_limited' }, { status: 429 });
  const key = process.env.WEATHER_API_KEY;
  if (!key) return NextResponse.json({ available: false, reason: 'no_key' });

  const sp = req.nextUrl.searchParams;
  const lat = sp.get('lat');
  const lon = sp.get('lon');
  const q = sp.get('q');
  const date = sp.get('date'); // YYYY-MM-DD optionnel
  const loc = lat && lon ? `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}` : q ? `q=${encodeURIComponent(q)}` : null;
  if (!loc) return NextResponse.json({ available: false, reason: 'no_location' });

  const common = `${loc}&appid=${key}&units=metric&lang=fr`;
  try {
    const [curRes, fcRes] = await Promise.all([
      fetch(`${OWM}/weather?${common}`, { cache: 'no-store' }),
      fetch(`${OWM}/forecast?${common}`, { cache: 'no-store' }),
    ]);
    if (!curRes.ok) {
      const detail = (await curRes.text()).slice(0, 200);
      return NextResponse.json({ available: false, reason: 'api_error', status: curRes.status, detail });
    }
    const cur = await curRes.json();
    const fc = fcRes.ok ? await fcRes.json() : null;

    // Alertes orage (maintenant + creneaux a venir)
    const alerts: { type: string; when: string; label: string }[] = [];
    if (isStorm(cur.weather)) alerts.push({ type: 'orage', when: 'maintenant', label: 'Orage en cours' });
    if (fc?.list) {
      for (const s of fc.list.filter((x: any) => isStorm(x.weather)).slice(0, 6)) {
        alerts.push({ type: 'orage', when: s.dt_txt, label: `Orage prevu le ${s.dt_txt}` });
      }
    }

    // Prevision ciblee sur une date (agregation des creneaux 3h)
    let dayForecast: any = null;
    if (date && fc?.list) {
      const slots = fc.list.filter((s: any) => (s.dt_txt || '').startsWith(date));
      if (slots.length) {
        const mid = slots[Math.floor(slots.length / 2)];
        dayForecast = {
          date,
          tempMin: Math.round(Math.min(...slots.map((s: any) => s.main.temp_min))),
          tempMax: Math.round(Math.max(...slots.map((s: any) => s.main.temp_max))),
          description: mid.weather?.[0]?.description ?? null,
          icon: mid.weather?.[0]?.icon ?? null,
          storm: slots.some((s: any) => isStorm(s.weather)),
        };
      }
    }

    return NextResponse.json({
      available: true,
      location: cur.name ?? q ?? null,
      current: {
        temp: Math.round(cur.main?.temp ?? 0),
        feels: Math.round(cur.main?.feels_like ?? 0),
        description: cur.weather?.[0]?.description ?? null,
        icon: cur.weather?.[0]?.icon ?? null,
        wind: Math.round((cur.wind?.speed ?? 0) * 3.6), // m/s -> km/h
        humidity: cur.main?.humidity ?? null,
      },
      dayForecast,
      alerts,
    });
  } catch (e) {
    return NextResponse.json({ available: false, reason: 'fetch_failed', detail: String(e).slice(0, 200) });
  }
}
