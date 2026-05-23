import { NextResponse } from 'next/server';

/**
 * Récupère le prix courant du carburant ordinaire (sans plomb) au Québec
 * depuis Ressources naturelles Canada (données ouvertes, mise à jour hebdomadaire).
 * URL de référence : https://www.regie-energie.qc.ca
 * Source de données : https://www2.nrcan.gc.ca — Montréal (locationID=66)
 */
export async function GET() {
  try {
    const url =
      'https://www2.nrcan.gc.ca/eneene/sources/pripri/prices_bycity_e.cfm' +
      '?productID=1&locationID=66&freq=D&priceType=retail&currency=cdn';

    const res = await fetch(url, {
      next: { revalidate: 3600 },   // cache côté serveur 1h
      headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) throw new Error(`NRCan HTTP ${res.status}`);

    const html = await res.text();

    // Le prix est publié sous la forme "XXX.X ¢/L" dans un tableau HTML
    const match = html.match(/(\d{2,3}(?:\.\d)?)\s*[¢c]\/L/i);
    if (!match) throw new Error('Prix introuvable dans la page NRCan');

    const priceCents = parseFloat(match[1]);
    const priceDollars = Math.round(priceCents) / 100;

    return NextResponse.json({
      price: priceDollars,
      price_cents: priceCents,
      source: 'nrcan-montreal',
      region: 'Montréal (Québec)',
      date: new Date().toISOString().slice(0, 10),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message, note: 'Entrez le prix manuellement — consultez regie-energie.qc.ca' },
      { status: 502 }
    );
  }
}
