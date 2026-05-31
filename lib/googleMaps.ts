// Chargeur unique de l'API Google Maps JS (librairie Places) côté client.
// La clé est publique par nature (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ; restreindre par référent/HTTP
// dans la console Google Cloud. Renvoie l'objet google.maps, ou null si pas de clé / échec.
let mapsPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const w = window as any;
  if (w.google?.maps?.places) return Promise.resolve(w.google.maps);

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.resolve(null);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve) => {
    const existing = document.getElementById('gmaps-js') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(w.google?.maps || null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const s = document.createElement('script');
    s.id = 'gmaps-js';
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=fr&region=CA`;
    s.onload = () => resolve(w.google?.maps || null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return mapsPromise;
}
