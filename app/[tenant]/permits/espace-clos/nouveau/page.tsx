'use client';

// Espace clos — CARACTÉRISATION COMPLÈTE (création). Fiche normalisée (CSA Z1006 / identification +
// évaluation des risques + moyens de maîtrise + plan de sauvetage + plan d'action). Sécurité critique :
// rien n'est facultatif par paresse. Le conseiller IA reçoit TOUT le contexte saisi.
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wind, ArrowLeft, Sparkles, Loader2, Camera, ShieldAlert, ListChecks, Activity, Save, AlertTriangle, Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { PROVINCE_NORMS, getNorm } from '@/lib/confinedSpace/norms';
import { uploadPhoto } from '@/lib/utils/photo';

const SPACE_TYPES = [
  ['tank', 'Réservoir / cuve'], ['vessel', 'Capacité sous pression'], ['sewer', 'Égout / collecteur'],
  ['silo', 'Silo / trémie'], ['pit', 'Fosse / puisard'], ['vault', 'Chambre / voûte'], ['trench', 'Tranchée / excavation'],
  ['duct', 'Conduit / gaine'], ['tunnel', 'Tunnel / galerie'], ['manhole', 'Regard / trou d’homme'], ['boiler', 'Chaudière / four'], ['other', 'Autre'],
];
const SHAPES = ['Vertical', 'Horizontal', 'Sphérique', 'Rectangulaire', 'Irrégulier'];
const PHYS_HAZARDS = [
  'Pièces mobiles (agitateur, convoyeur, vis)', 'Énergie électrique', 'Énergie hydraulique/pneumatique',
  'Énergie thermique (chaleur/vapeur)', 'Ensevelissement (grain, sable, liquide)', 'Chute de hauteur',
  'Noyade / liquide', 'Bruit', 'Points de pincement/écrasement', 'Rayonnement', 'Danger biologique', 'Glissade/configuration',
];
const ATM_EXPECTED = [
  'Carence en oxygène (O₂ < 19,5 %)', 'Enrichissement en oxygène (O₂ > 23 %)', 'Gaz/vapeurs inflammables',
  'Sulfure d’hydrogène (H₂S)', 'Monoxyde de carbone (CO)', 'Gaz inertes (N₂, Ar, CO₂)', 'Vapeurs de solvants/produits', 'Poussières combustibles',
];
const RISK_COLOR: Record<string, string> = { 'faible': 'bg-emerald-100 text-emerald-700', 'moyen': 'bg-amber-100 text-amber-700', 'élevé': 'bg-orange-100 text-orange-700', 'critique': 'bg-red-100 text-red-700' };

export default function NouvelEspaceClos() {
  const { tenant } = useParams() as { tenant: string };
  const router = useRouter();

  const [f, setF] = useState<any>({
    name: '', space_type: 'tank', location: '', province: 'QC', usage: '', description: '',
    shape: 'Vertical', length: '', width: '', height: '', diameter: '', depth: '',
    access_count: '1', access_type: '', access_size: '', internal_config: '',
    content_current: '', content_previous: '', residues: '', feeds: '', engulfment: '',
    ventilation: 'Aucune', atm_expected: [] as string[], phys_hazards: [] as string[],
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  // Plan de sauvetage / urgence (structuré, pré-rempli par l'IA puis éditable). Sécurité critique.
  const [rescue, setRescue] = useState<any>({
    type: 'Sans entrée (récupération)', strategy: '', equipment: [] as string[], team: '', team_onsite: false,
    contacts: '', hospital_name: '', hospital_address: '', hospital_phone: '', hospital_distance: '', response_min: '',
    communication_plan: '', validated: false,
  });
  const setR = (k: string, v: any) => setRescue((p: any) => ({ ...p, [k]: v }));
  const toggleRescueEq = (v: string) => setRescue((p: any) => ({ ...p, equipment: p.equipment.includes(v) ? p.equipment.filter((x: string) => x !== v) : [...p.equipment, v] }));
  const [advice, setAdvice] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const toggle = (k: string, v: string) => setF((p: any) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x: string) => x !== v) : [...p[k], v] }));

  const volume = useMemo(() => {
    const n = (x: any) => Number(x) || 0;
    if (f.diameter) { const r = n(f.diameter) / 2; return +(Math.PI * r * r * n(f.height || f.depth)).toFixed(2); }
    if (f.length && f.width) return +(n(f.length) * n(f.width) * n(f.height || f.depth || 1)).toFixed(2);
    return 0;
  }, [f.diameter, f.length, f.width, f.height, f.depth]);

  async function onPhoto(file: File) {
    setUploading(true); setErr('');
    try { const url = await uploadPhoto(file, tenant, supabase as any); setPhotoUrl(url); }
    catch (e: any) { setErr('Photo : ' + (e?.message || 'échec')); }
    finally { setUploading(false); }
  }

  function spacePayloadForAi() {
    return {
      name: f.name, space_type: f.space_type, location: f.location, usage_normal: f.usage, description: f.description,
      shape: f.shape, dimensions: { length: f.length, width: f.width, height: f.height, diameter: f.diameter, depth: f.depth, volume_m3: volume },
      access: { count: f.access_count, type: f.access_type, size: f.access_size }, internal_config: f.internal_config,
      contents: { current: f.content_current, previous: f.content_previous, residues: f.residues, feeds: f.feeds, engulfment_risk: f.engulfment },
      ventilation: f.ventilation, atmospheric_expected: f.atm_expected, physical_hazards: f.phys_hazards,
    };
  }

  async function runAi() {
    if (!f.name.trim()) { setErr('Renseigne au moins le nom et le type.'); return; }
    setAiBusy(true); setErr('');
    try {
      const r = await fetch('/api/permits/espace-clos/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'advise', province: f.province, tenant, space: spacePayloadForAi() }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec IA');
      setAdvice(j.advice);
      // Pré-remplit le plan de sauvetage structuré à partir de la proposition IA (éditable ensuite).
      const rc = j.advice?.rescue;
      if (rc) setRescue((p: any) => ({
        ...p, type: rc.type === 'avec entrée' ? 'Avec entrée' : (rc.type === 'sans entrée' ? 'Sans entrée (récupération)' : p.type),
        strategy: rc.strategy || p.strategy, equipment: Array.isArray(rc.equipment) && rc.equipment.length ? rc.equipment : p.equipment,
        team: rc.team || p.team, contacts: rc.contacts || p.contacts, hospital_name: rc.nearest_hospital || p.hospital_name, communication_plan: rc.notes || p.communication_plan,
      }));
    } catch (e: any) { setErr('IA : ' + (e?.message || '')); }
    finally { setAiBusy(false); }
  }

  async function save() {
    if (!f.name.trim()) { setErr('Le nom est requis.'); return; }
    setSaving(true); setErr('');
    try {
      const norm = getNorm(f.province);
      const code = 'EC-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const characteristics = {
        usage: f.usage, shape: f.shape,
        dimensions: { length: f.length, width: f.width, height: f.height, diameter: f.diameter, depth: f.depth, volume_m3: volume },
        access: { count: f.access_count, type: f.access_type, size: f.access_size }, internal_config: f.internal_config,
        contents: { current: f.content_current, previous: f.content_previous, residues: f.residues, feeds: f.feeds, engulfment: f.engulfment },
        ventilation: f.ventilation, atmospheric_expected: f.atm_expected, physical_hazards: f.phys_hazards,
        // Sorties IA :
        synthese: advice?.characteristics?.synthese || '', particularites: advice?.characteristics?.particularites || '',
        controls: advice?.controls || [], atmospheric_focus: advice?.atmospheric_focus || [],
        risk_evaluation: advice?.risk_evaluation || [], action_plan: advice?.action_plan || [],
        missing_info: advice?.missing_info || [], rationale: advice?.rationale_fr || '',
      };
      const hazards = advice?.hazards ? advice.hazards.map((h: any) => typeof h === 'string' ? h : `${h.category ? `[${h.category}] ` : ''}${h.danger}${h.source ? ` (source : ${h.source})` : ''}`) : f.phys_hazards;
      const payload: any = {
        tenant_id: tenant, space_code: code, name: f.name.trim(), location: f.location || null, space_type: f.space_type,
        province: f.province, description: f.description || null, photo_url: photoUrl || null,
        characteristics,
        hazards,
        emergency: {
          type: rescue.type, strategy: rescue.strategy, equipment: rescue.equipment, team: rescue.team,
          contacts: rescue.contacts, communication_plan: rescue.communication_plan, validated: rescue.validated,
          response_min: rescue.response_min,
          hospital: { name: rescue.hospital_name, address: rescue.hospital_address, phone: rescue.hospital_phone, distance_km: rescue.hospital_distance },
        },
        risk_level: advice?.risk_level || null,
        retest_minutes: Number(advice?.recommended_retest_minutes) || norm.defaultRetestMinutes, status: 'active',
      };
      const { data, error } = await supabase.from('confined_spaces').insert(payload).select('id').single();
      if (error) throw error;
      router.push(`/${tenant}/permits/espace-clos/${data.id}`);
    } catch (e: any) { setErr('Erreur : ' + (e?.message || 'enregistrement')); setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => router.push(`/${tenant}/permits/espace-clos`)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={14} /> Espaces clos</button>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mt-1 mb-1"><Wind className="text-cyan-600" /> Caractérisation d’un espace clos</h1>
        <p className="text-sm text-gray-500 mb-5">Fiche normalisée (CSA Z1006). Plus la caractérisation est complète, plus l’analyse IA et l’évaluation des risques sont fiables.</p>

        {err && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{err}</div>}

        {/* 1. Identification */}
        <Sec title="1 · Identification & usage" icon={<Wind size={16} />}>
          <Grid>
            <F l="Nom de l’espace *"><input className="inp" value={f.name} onChange={e => set('name', e.target.value)} placeholder="ex. Réservoir T‑12" /></F>
            <F l="Type"><select className="inp" value={f.space_type} onChange={e => set('space_type', e.target.value)}>{SPACE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></F>
            <F l="Emplacement / chantier"><input className="inp" value={f.location} onChange={e => set('location', e.target.value)} /></F>
            <F l="Province (norme)"><select className="inp" value={f.province} onChange={e => set('province', e.target.value)}>{Object.values(PROVINCE_NORMS).map(n => <option key={n.province} value={n.province}>{n.label}</option>)}</select></F>
            <F l="Usage normal (à quoi sert l’espace)" full><input className="inp" value={f.usage} onChange={e => set('usage', e.target.value)} placeholder="ex. stockage d’eau de procédé, fosse de pompage…" /></F>
            <F l="Description / particularités" full><textarea className="inp" rows={2} value={f.description} onChange={e => set('description', e.target.value)} /></F>
          </Grid>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Photo de l’espace</label>
            <div className="flex items-center gap-3 flex-wrap">
              {photoUrl ? <img src={photoUrl} alt="" className="w-24 h-24 object-cover rounded-lg border" /> : <div className="w-24 h-24 rounded-lg border border-dashed grid place-items-center text-gray-300"><Camera size={22} /></div>}
              {/* Mobile : caméra directe (capture) + galerie (sans capture). */}
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm cursor-pointer hover:bg-cyan-700">{uploading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />} Prendre une photo<input type="file" accept="image/*" capture="environment" hidden onChange={e => { const file = e.target.files?.[0]; if (file) onPhoto(file); e.currentTarget.value = ''; }} /></label>
              <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"><ImageIcon size={14} /> Choisir une image<input type="file" accept="image/*" hidden onChange={e => { const file = e.target.files?.[0]; if (file) onPhoto(file); e.currentTarget.value = ''; }} /></label>
            </div>
          </div>
        </Sec>

        {/* 2. Dimensions & accès */}
        <Sec title="2 · Dimensions, accès & configuration" icon={<ListChecks size={16} />}>
          <Grid>
            <F l="Forme"><select className="inp" value={f.shape} onChange={e => set('shape', e.target.value)}>{SHAPES.map(s => <option key={s}>{s}</option>)}</select></F>
            <F l="Profondeur (m)"><input className="inp" inputMode="decimal" value={f.depth} onChange={e => set('depth', e.target.value)} /></F>
            <F l="Longueur (m)"><input className="inp" inputMode="decimal" value={f.length} onChange={e => set('length', e.target.value)} /></F>
            <F l="Largeur (m)"><input className="inp" inputMode="decimal" value={f.width} onChange={e => set('width', e.target.value)} /></F>
            <F l="Hauteur (m)"><input className="inp" inputMode="decimal" value={f.height} onChange={e => set('height', e.target.value)} /></F>
            <F l="Diamètre (m, si cylindrique)"><input className="inp" inputMode="decimal" value={f.diameter} onChange={e => set('diameter', e.target.value)} /></F>
            <F l="Volume estimé (m³)"><input className="inp bg-gray-50" disabled value={volume || '—'} /></F>
            <F l="Nombre d’accès"><input className="inp" inputMode="numeric" value={f.access_count} onChange={e => set('access_count', e.target.value)} /></F>
            <F l="Type d’accès"><input className="inp" value={f.access_type} onChange={e => set('access_type', e.target.value)} placeholder="trou d’homme, trappe, vertical…" /></F>
            <F l="Dimension de l’accès"><input className="inp" value={f.access_size} onChange={e => set('access_size', e.target.value)} placeholder="ex. Ø 60 cm" /></F>
            <F l="Configuration interne (obstacles, dénivelés, cloisons)" full><textarea className="inp" rows={2} value={f.internal_config} onChange={e => set('internal_config', e.target.value)} /></F>
          </Grid>
        </Sec>

        {/* 3. Contenu / produits */}
        <Sec title="3 · Contenu, produits & alimentation" icon={<AlertTriangle size={16} />}>
          <Grid>
            <F l="Contenu actuel"><input className="inp" value={f.content_current} onChange={e => set('content_current', e.target.value)} /></F>
            <F l="Dernier contenu / produit antérieur"><input className="inp" value={f.content_previous} onChange={e => set('content_previous', e.target.value)} /></F>
            <F l="Résidus / boues / dépôts"><input className="inp" value={f.residues} onChange={e => set('residues', e.target.value)} /></F>
            <F l="Tuyauterie / alimentations entrantes"><input className="inp" value={f.feeds} onChange={e => set('feeds', e.target.value)} placeholder="à isoler/cadenasser" /></F>
            <F l="Risque d’ensevelissement / d’engloutissement" full><input className="inp" value={f.engulfment} onChange={e => set('engulfment', e.target.value)} placeholder="grain, sable, liquide pouvant affluer…" /></F>
          </Grid>
        </Sec>

        {/* 4. Dangers */}
        <Sec title="4 · Dangers identifiés" icon={<ShieldAlert size={16} />}>
          <div className="text-xs font-semibold text-gray-600 mb-1">Dangers atmosphériques attendus</div>
          <Chips list={ATM_EXPECTED} sel={f.atm_expected} onToggle={v => toggle('atm_expected', v)} cls="cyan" />
          <div className="text-xs font-semibold text-gray-600 mt-3 mb-1">Dangers physiques / énergies (à isoler — cadenassage)</div>
          <Chips list={PHYS_HAZARDS} sel={f.phys_hazards} onToggle={v => toggle('phys_hazards', v)} cls="red" />
          <F l="Ventilation disponible"><select className="inp mt-2 max-w-xs" value={f.ventilation} onChange={e => set('ventilation', e.target.value)}><option>Aucune</option><option>Naturelle</option><option>Forcée (mécanique)</option><option>Forcée + extraction</option></select></F>
        </Sec>

        {/* 5. Conseiller IA */}
        <Sec title="5 · Analyse & évaluation des risques (IA)" icon={<Sparkles size={16} />}>
          <p className="text-sm text-gray-500 mb-2">L’IA utilise TOUTE la caractérisation ci-dessus pour évaluer les risques, proposer les moyens de maîtrise, le plan de sauvetage et le plan d’action selon la norme de la province.</p>
          <button onClick={runAi} disabled={aiBusy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">{aiBusy ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} {aiBusy ? 'Analyse en cours…' : '✦ Analyser et évaluer les risques'}</button>
          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

          {advice && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-gray-500">Niveau de risque global :</span><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[advice.risk_level] || 'bg-gray-100'}`}>{advice.risk_level}</span><span className="text-xs text-gray-400">· reprise atmosphérique {advice.recommended_retest_minutes} min</span></div>
              {advice.rationale_fr && <p className="text-xs text-gray-500 italic">{advice.rationale_fr}</p>}

              {Array.isArray(advice.risk_evaluation) && advice.risk_evaluation.length > 0 && (
                <div><div className="text-xs font-semibold text-gray-600 mb-1">Évaluation des risques</div>
                  <div className="overflow-x-auto"><table className="w-full text-xs border border-gray-200 rounded">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="text-left p-2">Danger</th><th className="p-2">Probabilité</th><th className="p-2">Gravité</th><th className="p-2">Niveau</th><th className="text-left p-2">Maîtrise</th></tr></thead>
                    <tbody>{advice.risk_evaluation.map((r: any, i: number) => <tr key={i} className="border-t border-gray-100"><td className="p-2">{r.hazard}</td><td className="p-2 text-center">{r.probability}</td><td className="p-2 text-center">{r.severity}</td><td className="p-2 text-center"><span className={`px-1.5 py-0.5 rounded ${RISK_COLOR[r.level] || ''}`}>{r.level}</span></td><td className="p-2">{r.control}</td></tr>)}</tbody>
                  </table></div>
                </div>
              )}
              {Array.isArray(advice.hazards) && <Block title="Dangers" items={advice.hazards.map((h: any) => typeof h === 'string' ? h : `${h.danger}${h.source ? ` — ${h.source}` : ''}`)} cls="text-red-700 bg-red-50" />}
              {Array.isArray(advice.controls) && <Block title="Moyens de maîtrise" items={advice.controls} cls="text-emerald-700 bg-emerald-50" />}
              {Array.isArray(advice.atmospheric_focus) && <Block title="Surveillance atmosphérique prioritaire" items={advice.atmospheric_focus} cls="text-cyan-700 bg-cyan-50" />}
              {advice.rescue?.strategy && <div className="rounded-lg bg-cyan-50 p-3 text-xs text-cyan-900"><b>Plan de sauvetage ({advice.rescue.type || 'à confirmer'}) : </b>{advice.rescue.strategy}{Array.isArray(advice.rescue.equipment) && advice.rescue.equipment.length ? <div className="mt-1"><b>Équipement : </b>{advice.rescue.equipment.join(', ')}</div> : null}{advice.rescue.team ? <div><b>Équipe : </b>{advice.rescue.team}</div> : null}{advice.rescue.contacts ? <div><b>Contacts : </b>{advice.rescue.contacts}</div> : null}</div>}
              {Array.isArray(advice.action_plan) && advice.action_plan.length > 0 && <div><div className="text-xs font-semibold text-gray-600 mb-1">Plan d’action</div><ol className="list-decimal ml-5 text-xs text-gray-700 space-y-0.5">{advice.action_plan.map((a: string, i: number) => <li key={i}>{a}</li>)}</ol></div>}
              {Array.isArray(advice.missing_info) && advice.missing_info.length > 0 && <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><b>⚠ Informations manquantes à obtenir : </b>{advice.missing_info.join(' · ')}</div>}
            </div>
          )}
        </Sec>

        {/* 6 · Plan de sauvetage & urgence (structuré) */}
        <Sec title="6 · Plan de sauvetage & mesures d’urgence" icon={<ShieldAlert size={16} />}>
          <p className="text-xs text-gray-500 mb-2">Le sauvetage <b>sans entrée</b> (récupération par treuil/trépied/harnais) est à privilégier. Ne jamais improviser un sauvetage : ~60 % des décès en espace clos sont des sauveteurs.</p>
          <Grid>
            <F l="Type de sauvetage"><select className="inp" value={rescue.type} onChange={e => setR('type', e.target.value)}><option>Sans entrée (récupération)</option><option>Avec entrée (équipe formée)</option><option>Services d’urgence (911)</option></select></F>
            <F l="Délai de réponse visé (min)"><input className="inp" inputMode="numeric" value={rescue.response_min} onChange={e => setR('response_min', e.target.value)} /></F>
            <F l="Stratégie / procédure" full><textarea className="inp" rows={2} value={rescue.strategy} onChange={e => setR('strategy', e.target.value)} /></F>
          </Grid>
          <div className="mt-2 text-xs font-semibold text-gray-600 mb-1">Équipement de sauvetage</div>
          <Chips list={['Harnais récupérateur', 'Trépied / treuil', 'SCBA / ARI', 'Détecteur 4 gaz', 'Radio / communication', 'Civière / panier', 'Ligne de vie', 'Ventilateur', 'Éclairage ATEX']} sel={rescue.equipment} onToggle={toggleRescueEq} cls="cyan" />
          <Grid>
            <F l="Équipe de sauvetage"><input className="inp" value={rescue.team} onChange={e => setR('team', e.target.value)} placeholder="interne formée / sous-traitant / 911" /></F>
            <F l="Plan de communication"><input className="inp" value={rescue.communication_plan} onChange={e => setR('communication_plan', e.target.value)} placeholder="radio canal X, vérif. aux 5 min…" /></F>
            <F l="Contacts d’urgence" full><input className="inp" value={rescue.contacts} onChange={e => setR('contacts', e.target.value)} placeholder="nom – téléphone ; …" /></F>
            <F l="Hôpital le plus proche"><input className="inp" value={rescue.hospital_name} onChange={e => setR('hospital_name', e.target.value)} /></F>
            <F l="Tél. urgences hôpital"><input className="inp" value={rescue.hospital_phone} onChange={e => setR('hospital_phone', e.target.value)} /></F>
            <F l="Adresse hôpital"><input className="inp" value={rescue.hospital_address} onChange={e => setR('hospital_address', e.target.value)} /></F>
            <F l="Distance (km)"><input className="inp" inputMode="decimal" value={rescue.hospital_distance} onChange={e => setR('hospital_distance', e.target.value)} /></F>
          </Grid>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={rescue.validated} onChange={e => setR('validated', e.target.checked)} /> Plan de sauvetage vérifié et réaliste (délai de réponse confirmé)</label>
        </Sec>

        <div className="flex justify-end gap-2 mt-6 pb-10">
          <button onClick={() => router.push(`/${tenant}/permits/espace-clos`)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Annuler</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer l’espace clos'}</button>
        </div>
      </div>
      <style jsx>{`:global(.inp){ width:100%; padding:8px 11px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </div>
  );
}

function Sec({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4"><h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">{icon} {title}</h2>{children}</div>;
}
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>; }
function F({ l, children, full }: { l: string; children: React.ReactNode; full?: boolean }) { return <div className={full ? 'sm:col-span-2' : ''}><label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>{children}</div>; }
function Chips({ list, sel, onToggle, cls }: { list: string[]; sel: string[]; onToggle: (v: string) => void; cls: 'cyan' | 'red' }) {
  const on = cls === 'cyan' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-red-600 text-white border-red-600';
  return <div className="flex flex-wrap gap-1.5">{list.map(v => <button key={v} type="button" onClick={() => onToggle(v)} className={`text-xs px-2.5 py-1 rounded-full border ${sel.includes(v) ? on : 'bg-white text-gray-600 border-gray-300'}`}>{v}</button>)}</div>;
}
function Block({ title, items, cls }: { title: string; items: string[]; cls: string }) {
  return <div><div className="text-xs font-semibold text-gray-600 mb-1">{title}</div><div className="flex flex-wrap gap-1.5">{items.map((it, i) => <span key={i} className={`text-[11px] px-2 py-1 rounded ${cls}`}>{it}</span>)}</div></div>;
}
