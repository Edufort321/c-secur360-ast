'use client';

import { useEffect, useState } from 'react';
import { MODULES as MODULE_REGISTRY } from '@/lib/modules/registry';
import MarketingComposer from '@/components/admin/MarketingComposer';
import { supabase as sbBrowser } from '@/lib/supabase';

// Studio MARKETING IA (espace /admin). Porté du prototype C:\C-Secur360\Marketing.
// 3 sections : Studio vidéo · Prospection · Conformité. Les actions génératives appellent la VRAIE
// route IA serveur /api/admin/marketing/ai (clé côté serveur, prompt légal imposé). Le verrou de
// conformité (consentement LCAP) bloque toute programmation d'envoi.

type View = 'assistant' | 'studio' | 'prospect' | 'compliance';
type ChatMsg = { role: 'user' | 'assistant'; content: string };
const CHAT_STARTERS = [
  'Quels secteurs prospecter en premier au Québec pour le module DGA transformateurs ?',
  'Propose 3 angles d\'accroche pour les mutuelles de prévention SST.',
  'Donne-moi un plan de contenu LinkedIn sur 4 semaines.',
  'Comment cadrer une 1re campagne conforme LCAP pour un nouveau segment ?',
];

// Modèles de brief prêts à l'emploi pour la rédaction IA du script d'avatar.
// Deux incontournables demandés : présentation GLOBALE de l'app + programme VENDEUR/affilié.
const SCRIPT_TEMPLATES: { k: string; label: string; ideas: string }[] = [
  {
    k: 'app',
    label: '🏢 Présentation de l\'app (globale)',
    ideas: "Présenter C-Secur360 dans son ensemble : une plateforme SST/industrielle modulaire et tout-en-un pour les entreprises (AST, permis, inspections d'équipement, planificateur, feuilles de temps, DGA transformateurs, RH, rapports). Insister sur : un seul outil au lieu de plusieurs, conformité (Loi 25, normes SST), assistance IA intégrée, mobile et terrain (QR, photos), hébergement canadien. Ton : confiant, professionnel, accessible. Public : dirigeants, responsables SST et maintenance. Terminer par un appel à l'action pour une démo.",
  },
  {
    k: 'affil',
    label: '🤝 Programme d\'affiliation (vendeur)',
    ideas: "Présenter le programme d'affiliation / co-vendeur de C-Secur360 : comment un partenaire ou vendeur peut référer des clients et toucher des commissions récurrentes. Insister sur : produit québécois en forte demande (SST, conformité), commissions sur abonnement, outils de vente fournis, contrat clair, accompagnement. Ton : motivant, orienté opportunité d'affaires. Public : vendeurs, consultants SST, partenaires, représentants. Terminer par un appel à l'action pour rejoindre le programme.",
  },
];

// Source UNIQUE et réelle des modules = le registre (lib/modules/registry.ts). Pas de liste recopiée :
// quand un module est ajouté au produit, il apparaît automatiquement ici. (On exclut 'admin', interne.)
// Deux sujets transverses en tête (au-delà des modules) : la présentation GLOBALE de l'app et le
// programme d'AFFILIATION/vendeur — pour générer du marketing sur l'offre entière et le recrutement de vendeurs.
const MODULES = [
  "Présentation globale de l'app (toutes les fonctionnalités)",
  "Programme d'affiliation / vendeur",
  ...MODULE_REGISTRY.filter(m => m.key !== 'admin').map(m => m.labelFr),
];
const CLBL = { expres: 'Exprès', tacite: 'Tacite', bloque: 'Bloqué' } as const;
const PLAT_ICON: Record<string, string> = { LinkedIn: '💼', Facebook: '📘', Instagram: '📸', TikTok: '🎵', 'X (Twitter)': '𝕏', X: '𝕏', Twitter: '𝕏', YouTube: '▶️' };

export default function MarketingTab() {
  const [view, setView] = useState<View>('assistant');

  // ── Assistant IA conversationnel (stratégie prospection & marketing) ─────
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  async function sendChat(text?: string) {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatSending) return;
    const next: ChatMsg[] = [...chat, { role: 'user', content: msg }];
    setChat(next); setChatInput(''); setChatSending(true);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'chat', messages: next }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setChat([...next, { role: 'assistant', content: j.reply || '(réponse vide)' }]);
    } catch (e: any) {
      setChat([...next, { role: 'assistant', content: '⚠ Erreur : ' + (e?.message || 'IA indisponible') }]);
    } finally { setChatSending(false); }
  }

  const [notice, setNotice] = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Studio : atelier « 1 brief → N livrables » (script, hooks, sous-titres, post, courriel, miniature)
  const ALL_FORMATS = [
    { k: '16:9', label: '16:9 · LinkedIn/YouTube' },
    { k: '9:16', label: '9:16 · Reels/TikTok' },
    { k: '1:1', label: '1:1 · Carré' },
  ];
  const [sModule, setSModule] = useState(MODULES[0]);
  const [sAudience, setSAudience] = useState(''); // vide -> l'IA déduit le public du module choisi
  const [sMsg, setSMsg] = useState('');
  const [sCta, setSCta] = useState('Réserver une démo');
  const [sLang, setSLang] = useState<'fr' | 'en'>('fr');
  const [sFormats, setSFormats] = useState<Record<string, boolean>>({ '16:9': true, '9:16': true, '1:1': false });
  const [pack, setPack] = useState<any>(null);
  const [genPack, setGenPack] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [savingAsset, setSavingAsset] = useState(false);

  async function generatePack() {
    setGenPack(true); setNotice(null); setPack(null);
    try {
      const formats = Object.entries(sFormats).filter(([, v]) => v).map(([k]) => k);
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'studio-pack', module: sModule, audience: sAudience, message: sMsg, cta: sCta, formats, lang: sLang }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec IA');
      setPack(j.pack || null);
      setNotice({ msg: '✓ Pack marketing généré (script, hooks, sous-titres, post, courriel, miniature).', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur IA : ' + (e?.message || 'inconnue') + (String(e?.message || '').includes('web') ? '' : ''), ok: false }); }
    finally { setGenPack(false); }
  }
  async function translatePack() {
    if (!pack) return;
    const target = sLang === 'fr' ? 'en' : 'fr';
    setTranslating(true);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'translate-pack', pack, target }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setPack(j.pack || pack); setSLang(target);
      setNotice({ msg: `✓ Pack traduit (${target.toUpperCase()}).`, ok: true });
    } catch (e: any) { setNotice({ msg: 'Traduction : ' + (e?.message || ''), ok: false }); }
    finally { setTranslating(false); }
  }
  async function saveAsset() {
    if (!pack) return;
    setSavingAsset(true);
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'save-asset', kind: 'script', module: sModule, data: { ...pack, lang: sLang, audience: sAudience, cta: sCta } }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setNotice({ msg: '✓ Pack enregistré dans les actifs marketing.', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setSavingAsset(false); }
  }
  function copyText(t: string) { try { navigator.clipboard?.writeText(t); setNotice({ msg: '✓ Copié.', ok: true }); } catch { /* */ } }

  // Plan de capture : l'IA prépare le scénario (pages + actions à filmer) que le robot Playwright exécute.
  const [capturePlan, setCapturePlan] = useState<any>(null);
  const [genPlan, setGenPlan] = useState(false);
  async function generateCapturePlan() {
    if (!pack?.storyboard) return;
    setGenPlan(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'capture-plan', storyboard: pack.storyboard }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setCapturePlan(j.plan || null);
      setNotice({ msg: '✓ Plan de capture généré. Télécharge-le et lance le robot Playwright.', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setGenPlan(false); }
  }
  function downloadPlan() {
    if (!capturePlan) return;
    const blob = new Blob([JSON.stringify(capturePlan, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'capture-plan.json'; a.click();
  }
  // Lance la capture RÉELLE côté serveur (Playwright) : le robot se connecte en compte démo et range les
  // écrans capturés dans la médiathèque (images), prêts à servir de slides.
  const [capturing, setCapturing] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  async function runCapture() {
    if (!capturePlan?.steps?.length) { setNotice({ msg: '⚠ Génère d\'abord le plan de capture.', ok: false }); return; }
    setCapturing(true); setNotice({ msg: '📸 Capture en cours (connexion démo + écrans réels)…', ok: true });
    try {
      const r = await fetch('/api/admin/marketing/capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ plan: capturePlan, tenant: 'cerdia', demoEmail: demoEmail.trim() || undefined, demoPassword: demoPassword || undefined }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setNotice({ msg: `✓ ${j.captured?.length || 0}/${j.total || 0} écran(s) capturé(s) et rangé(s) dans 📷 Photos & images.${j.errors?.length ? ` (${j.errors.length} ignoré[s])` : ''}`, ok: true });
      loadAssets();
    } catch (e: any) { setNotice({ msg: 'Capture : ' + (e?.message || ''), ok: false }); }
    finally { setCapturing(false); }
  }

  // Avatar présentateur (D-ID) : une photo dans public/ + un script -> vidéo qui parle.
  const AVA_VOICES = [
    { v: 'fr-CA-SylvieNeural', l: 'FR-CA · Sylvie (femme)' },
    { v: 'fr-CA-AntoineNeural', l: 'FR-CA · Antoine (homme)' },
    { v: 'fr-CA-JeanNeural', l: 'FR-CA · Jean (homme)' },
    { v: 'fr-FR-DeniseNeural', l: 'FR · Denise (jeune femme)' },
    { v: 'fr-FR-CoralieNeural', l: 'FR · Coralie (jeune)' },
    { v: 'fr-FR-EloiseNeural', l: 'FR · Éloïse (très jeune)' },
    { v: 'fr-FR-HenriNeural', l: 'FR · Henri (jeune homme)' },
    { v: 'fr-FR-YvetteNeural', l: 'FR · Yvette (jeune)' },
    { v: 'en-US-AriaNeural', l: 'EN · Aria (jeune femme)' },
    { v: 'en-US-AnaNeural', l: 'EN · Ana (très jeune)' },
    { v: 'en-US-JennyNeural', l: 'EN · Jenny (femme)' },
    { v: 'en-US-GuyNeural', l: 'EN · Guy (homme)' },
  ];
  const [avaVoice, setAvaVoice] = useState('fr-CA-SylvieNeural');
  const [avaDelay, setAvaDelay] = useState(800); // délai (ms) de silence avant que l'avatar parle
  const [avaText, setAvaText] = useState('');
  const [avaUrl, setAvaUrl] = useState('');
  const [avaBusy, setAvaBusy] = useState(false);
  const [avaMsg, setAvaMsg] = useState<{ msg: string; ok: boolean } | null>(null); // statut affiché DANS la carte
  const aMsg = (m: { msg: string; ok: boolean }) => { setAvaMsg(m); setNotice(m); };
  // Mode « texte IA » : idées + durée -> script calibré.
  const [avaIdeas, setAvaIdeas] = useState('');
  const [avaSeconds, setAvaSeconds] = useState(30);
  const [avaWriting, setAvaWriting] = useState(false);
  async function writeAvatarScript() {
    if (!avaIdeas.trim()) { aMsg({ msg: '⚠ Donne quelques idées d\'abord.', ok: false }); return; }
    setAvaWriting(true); setAvaMsg(null);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'avatar-script', ideas: avaIdeas, seconds: avaSeconds, lang: sLang }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setAvaText(j.text || '');
      aMsg({ msg: `✓ Texte rédigé (~${j.words || '?'} mots ≈ ${avaSeconds}s).`, ok: true });
    } catch (e: any) { aMsg({ msg: 'Texte IA : ' + (e?.message || ''), ok: false }); }
    finally { setAvaWriting(false); }
  }

  // ── Réglages du Studio : PLUSIEURS avatars (nom + voix par défaut) + bibliothèque d'images ──
  type Avatar = { id: string; url: string; name?: string; voice?: string };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [newAvatarName, setNewAvatarName] = useState('');
  const [newAvatarVoice, setNewAvatarVoice] = useState('fr-CA-SylvieNeural');
  const [library, setLibrary] = useState<{ id: string; url: string; name?: string }[]>([]);
  const [avaVideos, setAvaVideos] = useState<{ id: string; url: string; created_at?: string }[]>([]);
  const [bgVideos, setBgVideos] = useState<{ id: string; url: string; name?: string }[]>([]);
  const [compositions, setCompositions] = useState<{ id: string; url: string; created_at?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const selectedAvatar = avatars.find(a => a.id === selectedAvatarId) || null;

  async function loadAssets() {
    try {
      const j = await fetch('/api/admin/marketing/data?resource=assets', { credentials: 'include' }).then(r => r.json());
      const avs: Avatar[] = (j.avatars || []).map((a: any) => ({ id: a.id, url: a.data?.url, name: a.data?.name, voice: a.data?.voice })).filter((x: any) => x.url);
      setAvatars(avs);
      setSelectedAvatarId(prev => (prev && avs.some(a => a.id === prev)) ? prev : (avs[0]?.id || ''));
      setLibrary((j.library || []).map((a: any) => ({ id: a.id, url: a.data?.url, name: a.data?.name })).filter((x: any) => x.url));
      setAvaVideos((j.videos || []).map((a: any) => ({ id: a.id, url: a.data?.url, created_at: a.created_at })).filter((x: any) => x.url));
      setBgVideos((j.bgVideos || []).map((a: any) => ({ id: a.id, url: a.data?.url, name: a.data?.name })).filter((x: any) => x.url));
      setCompositions((j.compositions || []).map((a: any) => ({ id: a.id, url: a.data?.url, created_at: a.created_at })).filter((x: any) => x.url));
    } catch { /* */ }
  }
  useEffect(() => { loadAssets(); }, []);
  // La voix suit l'avatar choisi (modifiable ensuite).
  useEffect(() => { if (selectedAvatar?.voice) setAvaVoice(selectedAvatar.voice); }, [selectedAvatarId]); // eslint-disable-line

  // Upload DIRECT navigateur -> Supabase via une URL signée par le serveur (service_role, requireAdmin).
  // Contourne la limite de 4,5 Mo des fonctions serverless Vercel (images HD, vidéos de fond, rendus).
  // Sécurité conservée : la signature est réservée super-admin ; le jeton n'autorise QUE ce chemin.
  async function uploadToMarketing(file: File, prefix: string): Promise<string> {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const r = await fetch('/api/admin/marketing/sign-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ prefix, ext }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Upload échoué');
    const { error } = await sbBrowser.storage.from('marketing').uploadToSignedUrl(j.path, j.token, file, { contentType: file.type || undefined });
    if (error) {
      const mb = Math.round(file.size / 1048576);
      if (/exceed|maximum|too large|payload|size/i.test(error.message || '')) {
        throw new Error(`Fichier trop volumineux (${mb} Mo) pour Supabase Storage. Applique la migration 167 et relève « Upload file size limit » dans Project Settings > Storage du tableau de bord Supabase.`);
      }
      throw new Error(`${error.message} (fichier ${mb} Mo)`);
    }
    return j.publicUrl as string;
  }
  async function uploadAvatarModel(file: File) {
    setUploading(true); setNotice(null);
    try {
      const url = await uploadToMarketing(file, 'avatar');
      const name = newAvatarName.trim() || file.name.replace(/\.[a-z0-9]+$/i, '');
      await fetch('/api/admin/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'save-asset', kind: 'avatar_model', data: { url, name, voice: newAvatarVoice } }) });
      setNewAvatarName('');
      setNotice({ msg: `✓ Avatar « ${name} » ajouté.`, ok: true }); loadAssets();
    } catch (e: any) { setNotice({ msg: 'Upload : ' + (e?.message || ''), ok: false }); }
    finally { setUploading(false); }
  }
  async function uploadLibrary(files: FileList) {
    setUploading(true); setNotice(null);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadToMarketing(file, 'library');
        await fetch('/api/admin/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'save-asset', kind: 'library_image', data: { url, name: file.name } }) });
      }
      setNotice({ msg: '✓ Image(s) ajoutée(s) à la bibliothèque.', ok: true }); loadAssets();
    } catch (e: any) { setNotice({ msg: 'Upload : ' + (e?.message || ''), ok: false }); }
    finally { setUploading(false); }
  }
  async function uploadBgVideos(files: FileList) {
    setUploading(true); setNotice(null);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadToMarketing(file, 'bg');
        await fetch('/api/admin/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'save-asset', kind: 'bg_video', data: { url, name: file.name } }) });
      }
      setNotice({ msg: '✓ Vidéo(s) de fond ajoutée(s) à la médiathèque.', ok: true }); loadAssets();
    } catch (e: any) { setNotice({ msg: 'Upload : ' + (e?.message || ''), ok: false }); }
    finally { setUploading(false); }
  }
  // Téléchargement forcé (l'attribut download est ignoré cross-origin) : on récupère le blob.
  async function downloadAsset(url: string, filename: string) {
    try {
      const blob = await fetch(url).then(r => r.blob());
      const a = document.createElement('a'); const obj = URL.createObjectURL(blob);
      a.href = obj; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(obj), 4000);
    } catch { window.open(url, '_blank'); }
  }
  // Range une vidéo ASSEMBLÉE (composition finale) dans sa galerie dédiée.
  async function saveVideoToGallery(url: string) {
    await fetch('/api/admin/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'save-asset', kind: 'composition_video', data: { url } }) });
    loadAssets();
  }
  async function deleteAsset(id: string) {
    await fetch('/api/admin/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'delete-asset', id }) });
    loadAssets();
  }
  async function updateAvatar(id: string, patch: any) {
    await fetch('/api/admin/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'update-asset', id, patch }) });
    loadAssets();
  }
  async function pollAvatar(id: string) {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const j = await fetch(`/api/admin/marketing/avatar?id=${encodeURIComponent(id)}`, { credentials: 'include' }).then(r => r.json());
        if (j.status === 'done' && j.url) { setAvaUrl(j.url); aMsg({ msg: '✓ Avatar généré.' + (j.stored === false ? ' ⚠ Bucket non public — lecture via lien D-ID temporaire ; applique la migration 165 (bucket « marketing » PUBLIC) pour conserver la vidéo.' : ''), ok: true }); setAvaBusy(false); loadAssets(); return; }
        if (j.status === 'error') { aMsg({ msg: 'Avatar : échec du rendu (vérifie que le modèle est une vraie photo de visage).', ok: false }); setAvaBusy(false); return; }
      } catch { /* retry */ }
    }
    aMsg({ msg: 'Avatar : rendu plus long que prévu — réessaie dans un instant.', ok: false }); setAvaBusy(false);
  }
  async function generateAvatar() {
    setAvaMsg(null);
    const text = avaText.trim() || (pack?.storyboard ? pack.storyboard.map((s: any) => s.voiceover).filter(Boolean).join(' ') : '');
    if (!selectedAvatar?.url) { aMsg({ msg: '⚠ Ajoute (et choisis) un avatar dans ⚙ Réglages du Studio (en haut).', ok: false }); return; }
    if (!text) { aMsg({ msg: '⚠ Entre le texte à narrer (ou clique « Remplir depuis le storyboard »).', ok: false }); return; }
    setAvaBusy(true); setAvaUrl('');
    try {
      const r = await fetch('/api/admin/marketing/avatar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ image: selectedAvatar.url, text, voice: avaVoice, delayMs: avaDelay }),
      });
      const j = await r.json();
      if (!r.ok) { aMsg({ msg: 'Avatar : ' + (j.error || 'échec'), ok: false }); setAvaBusy(false); return; }
      if (j.status === 'done' && j.url) { setAvaUrl(j.url); aMsg({ msg: '✓ Avatar généré.' + (j.stored === false ? ' ⚠ Bucket non public — lecture via lien D-ID temporaire ; applique la migration 165 (bucket « marketing » PUBLIC).' : ''), ok: true }); setAvaBusy(false); loadAssets(); }
      else if (j.id) { aMsg({ msg: '⏳ Rendu de l\'avatar en cours (10-40 s)…', ok: true }); pollAvatar(j.id); }
      else { aMsg({ msg: 'Avatar : réponse inattendue.', ok: false }); setAvaBusy(false); }
    } catch (e: any) { aMsg({ msg: 'Avatar : ' + (e?.message || 'réseau'), ok: false }); setAvaBusy(false); }
  }


  // ── Prospection ────────────────────────────────────────────────────────
  const [segment, setSegment] = useState('');
  const [pModule, setPModule] = useState(MODULES[0]);
  const [angle, setAngle] = useState('');
  const [seuil, setSeuil] = useState(55);
  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false, c4: false });
  const [emailDraft, setEmailDraft] = useState<any>(null);
  const [genEmail, setGenEmail] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const allChecks = checks.c1 && checks.c2 && checks.c3 && checks.c4;

  // Prospects RÉELS (base marketing_prospects via la route serveur). Aucune donnée de démo.
  type Row = { company: string; email: string; consent: 'expres' | 'tacite' | 'bloque'; score: number; blocked: boolean };
  const [rows, setRows] = useState<Row[]>([]);
  const [unsubCount, setUnsubCount] = useState(0);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [np, setNp] = useState({ company: '', email: '', segment: '', consent_type: 'express', consent_source: '', score: 60 });

  async function loadProspects() {
    setLoadingProspects(true);
    try {
      const j = await fetch('/api/admin/marketing/data?resource=prospects', { credentials: 'include' }).then(r => r.json());
      if (Array.isArray(j.prospects)) {
        setRows(j.prospects.map((p: any) => ({
          company: p.company || '—', email: p.email,
          consent: (p._blocked ? 'bloque' : p.consent_type === 'express' ? 'expres' : p.consent_type === 'tacit' ? 'tacite' : 'bloque') as Row['consent'],
          score: Number(p.score) || 0, blocked: !!p._blocked,
        })));
        setUnsubCount(Number(j.unsubscribes) || 0);
      }
    } catch { /* base indisponible -> liste vide */ }
    finally { setLoadingProspects(false); }
  }
  useEffect(() => { loadProspects(); }, []);

  const hasProspects = rows.length > 0;
  const aboveSeuil = rows.filter(p => !p.blocked && p.score >= seuil).length;

  // ── Recherche de prospection légale par IA (QC -> Canada) ──────────────
  const [researchRegion, setResearchRegion] = useState<'QC' | 'Canada'>('QC');
  const [researchSector, setResearchSector] = useState('');
  const [researching, setResearching] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState(false);

  async function runResearch() {
    setResearching(true); setNotice(null); setCandidates([]);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'research', region: researchRegion === 'Canada' ? 'Canada' : 'QC', sector: researchSector, count: 8 }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec recherche');
      const list = Array.isArray(j.candidates) ? j.candidates : [];
      setCandidates(list);
      setPicked(Object.fromEntries(list.map((c: any) => [String(c.email).toLowerCase(), true])));
      setNotice({ msg: list.length ? `✓ ${list.length} entreprises trouvées (adresses publiées vérifiables).` : 'Aucune adresse publiée vérifiable trouvée pour ce secteur/région.', ok: list.length > 0 });
    } catch (e: any) { setNotice({ msg: 'Recherche IA : ' + (e?.message || '') + ' (l\'outil de recherche web doit être activé sur la clé Anthropic).', ok: false }); }
    finally { setResearching(false); }
  }
  async function importSelected() {
    const chosen = candidates.filter(c => picked[String(c.email).toLowerCase()]);
    if (!chosen.length) { setNotice({ msg: 'Sélectionne au moins une entreprise.', ok: false }); return; }
    setImporting(true);
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'import-candidates', candidates: chosen, segment: researchSector }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec import');
      setNotice({ msg: `✓ ${j.imported} prospect(s) importé(s) avec consentement tacite (source publiée conservée).`, ok: true });
      setCandidates([]); loadProspects();
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setImporting(false); }
  }

  async function addProspect() {
    if (!np.email.trim()) { setNotice({ msg: 'Courriel requis.', ok: false }); return; }
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'upsert-prospect', ...np }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setNotice({ msg: `✓ Prospect ${np.email} enregistré avec son consentement.`, ok: true });
      setNp({ company: '', email: '', segment: '', consent_type: 'express', consent_source: '', score: 60 });
      setAddOpen(false); loadProspects();
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
  }

  async function generateEmail() {
    setGenEmail(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'email', module: pModule, segment, angle }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Échec IA');
      setEmailDraft(j);
      setNotice({ msg: '✓ Courriel conforme LCAP généré par l\'IA.', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur IA : ' + (e?.message || 'inconnue'), ok: false }); }
    finally { setGenEmail(false); }
  }
  async function scheduleCampaign() {
    if (!allChecks) { setNotice({ msg: '⚠ Le verrou de conformité bloque l\'envoi : active les 4 conditions.', ok: false }); return; }
    if (!emailDraft) { setNotice({ msg: '⚠ Génère d\'abord le courriel (IA) — c\'est lui qui sera envoyé.', ok: false }); return; }
    if (!hasProspects) { setNotice({ msg: '⚠ Aucun prospect en base. Ajoute (ou recherche via l\'IA) des prospects consentants avant d\'envoyer.', ok: false }); return; }
    if (!confirm(`Programmer et ENVOYER la campagne aux destinataires consentants au-dessus du seuil (${aboveSeuil}) ?`)) return;
    setScheduling(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          action: 'save-campaign', module: pModule, segment, angle, min_score: seuil,
          sequence: [{ day: 0 }, { day: 4 }, { day: 9 }], content: emailDraft,
          compliance_ack: checks,
        }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      const msg = j.mailConfigured
        ? `✓ Campagne programmée — ${j.sent} courriel(s) envoyé(s), ${j.queued} en file (sur ${j.recipients} éligibles).`
        : `✓ Campagne enregistrée — ${j.recipients} destinataires en file. ⚠ Envoi inactif : configure RESEND_API_KEY pour l'envoi réel.`;
      setNotice({ msg, ok: true });
      loadProspects();
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setScheduling(false); }
  }

  const TABS: { k: View; ico: string; label: string }[] = [
    { k: 'assistant', ico: '💬', label: 'Assistant IA' },
    { k: 'studio', ico: '🎬', label: 'Studio vidéo' },
    { k: 'prospect', ico: '✉', label: 'Prospection' },
    { k: 'compliance', ico: '⚖', label: 'Conformité' },
  ];

  return (
    <div className="mktwrap">
      <header className="mkt-top">
        <div>
          <div className="eyebrow"><span className="live" /> Studio marketing · IA + conformité</div>
          <h1>Studio <span>marketing IA</span></h1>
          <p className="sub">Vidéos promo réalistes et prospection performante — l'IA rédige et monte ; le verrou de conformité décide ce qui peut partir.</p>
        </div>
        <div className="guard">
          <strong>◇ Verrou de conformité</strong> — Aucun envoi sans consentement prouvé. Aucune vidéo avec données client réelles.
          <span className="law">LCAP · Loi 25 · Loi sur la concurrence</span>
        </div>
      </header>

      <div className="mkt-tabs">
        {TABS.map(t => (
          <button key={t.k} className={`mkt-tab ${view === t.k ? 'active' : ''}`} onClick={() => setView(t.k)}>
            <span className="ico">{t.ico}</span> {t.label}
          </button>
        ))}
      </div>

      {notice && <div className={`mkt-notice ${notice.ok ? 'ok' : 'err'}`}>{notice.msg}</div>}

      {/* ================= ASSISTANT IA ================= */}
      {view === 'assistant' && (
        <div className="card">
          <h2>Assistant IA <span className="chip">stratégie prospection &amp; marketing</span></h2>
          <p className="hint">Discute avec l'IA pour cadrer ce que tu veux : segments, secteurs (QC → Canada), angles, idées de contenu, séquences. Elle propose des pistes concrètes et rappelle la conformité.</p>

          <div className="chatwin">
            {chat.length === 0 && (
              <div className="chatempty">
                <div style={{ fontSize: 30 }}>💬</div>
                <p>Donne une piste de ce que tu veux, ou pars d'une suggestion :</p>
                <div className="starters">
                  {CHAT_STARTERS.map((s, i) => <button key={i} className="starter" onClick={() => sendChat(s)}>{s}</button>)}
                </div>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                <div className="brole">{m.role === 'user' ? 'Toi' : 'IA'}</div>
                <div className="btext">{m.content}</div>
              </div>
            ))}
            {chatSending && <div className="bubble assistant"><div className="brole">IA</div><div className="btext muted">…réflexion</div></div>}
          </div>

          <div className="chatbar">
            <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Écris ta piste ou ta question… (Entrée pour envoyer, Maj+Entrée = nouvelle ligne)" rows={2} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-violet" onClick={() => sendChat()} disabled={chatSending || !chatInput.trim()}>Envoyer</button>
              {chat.length > 0 && <button className="btn btn-ghost" onClick={() => setChat([])}>Effacer</button>}
            </div>
          </div>
        </div>
      )}

      {/* ================= STUDIO (1 brief -> N livrables) ================= */}
      {view === 'studio' && (
        <>
          {/* Médiathèque : avatars + images/photos + vidéos de fond (tout le matériel du studio) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer' }} onClick={() => setSettingsOpen(o => !o)}>
              <h2 style={{ margin: 0 }}>🗂 Médiathèque du Studio <span className="chip">avatars · photos · vidéos</span></h2>
              <span style={{ color: 'var(--mist)' }}>{settingsOpen ? '▲ replier' : '▼ déplier'}</span>
            </div>
            <p className="hint" style={{ marginTop: 6, marginBottom: 0 }}>Tout le matériel réutilisable du studio au même endroit : tes <b>avatars</b> (visages qui parlent), tes <b>photos/images</b> (logos, captures, B-roll) et tes <b>vidéos d'arrière-plan</b>. Tout est piochable dans l'assembleur vidéo plus bas.</p>
            {settingsOpen && (
              <div style={{ marginTop: 12 }}>
                <div className="grid">
                  {/* Avatars (plusieurs, avec nom + voix par défaut) */}
                  <div>
                    <label>Avatars (PNG/JPG d'un visage) — chacun avec sa voix par défaut</label>
                    <div className="dropzone">
                      {avatars.length === 0 && <span style={{ color: 'var(--mist)', fontSize: 12 }}>Aucun avatar. Ajoute-en un ci-dessous.</span>}
                      {avatars.map(av => (
                        <div key={av.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(35,44,58,.5)' }}>
                          <img src={av.url} alt={av.name || ''} style={{ width: 46, height: 46, borderRadius: 9, objectFit: 'cover', border: '1px solid var(--line)' }} />
                          <input value={av.name || ''} onChange={e => setAvatars(list => list.map(x => x.id === av.id ? { ...x, name: e.target.value } : x))} onBlur={e => updateAvatar(av.id, { name: e.target.value })} placeholder="Nom" style={{ width: 120 }} />
                          <select value={av.voice || 'fr-CA-SylvieNeural'} onChange={e => updateAvatar(av.id, { voice: e.target.value })} style={{ width: 150 }}>
                            {AVA_VOICES.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                          </select>
                          <button className="copy" style={{ color: 'var(--rust)', marginLeft: 'auto' }} onClick={() => deleteAsset(av.id)}>supprimer</button>
                        </div>
                      ))}
                      {/* Ajout d'un avatar */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
                        <input value={newAvatarName} onChange={e => setNewAvatarName(e.target.value)} placeholder="Nom du nouvel avatar" style={{ width: 160 }} />
                        <select value={newAvatarVoice} onChange={e => setNewAvatarVoice(e.target.value)} style={{ width: 150 }}>{AVA_VOICES.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}</select>
                        <label className="btn btn-ghost" style={{ display: 'inline-flex' }}>
                          {uploading ? 'Téléversement…' : '＋ Ajouter un avatar'}
                          <input type="file" accept="image/*" hidden disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatarModel(f); e.currentTarget.value = ''; }} />
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Photos / images */}
                  <div>
                    <label>📷 Photos &amp; images (logos, captures, visuels, B-roll)</label>
                    <div className="dropzone">
                      <div className="libgrid">
                        {library.map(im => (
                          <div key={im.id} className="libitem">
                            <img src={im.url} alt={im.name || ''} />
                            <button className="libdel" onClick={() => deleteAsset(im.id)}>×</button>
                          </div>
                        ))}
                        {library.length === 0 && <span style={{ color: 'var(--mist)', fontSize: 12 }}>Aucune image.</span>}
                      </div>
                      <label className="btn btn-ghost" style={{ marginTop: 8, display: 'inline-flex' }}>
                        {uploading ? 'Téléversement…' : '＋ Ajouter des photos/images'}
                        <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={e => { const fs = e.target.files; if (fs && fs.length) uploadLibrary(fs); e.currentTarget.value = ''; }} />
                      </label>
                    </div>
                  </div>
                  {/* Vidéos d'arrière-plan */}
                  <div>
                    <label>🎞 Vidéos d'arrière-plan (B-roll en mouvement)</label>
                    <div className="dropzone">
                      <div className="libgrid">
                        {bgVideos.map(v => (
                          <div key={v.id} className="libitem">
                            <video src={v.url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                            <button className="libdel" onClick={() => deleteAsset(v.id)}>×</button>
                          </div>
                        ))}
                        {bgVideos.length === 0 && <span style={{ color: 'var(--mist)', fontSize: 12 }}>Aucune vidéo de fond.</span>}
                      </div>
                      <label className="btn btn-ghost" style={{ marginTop: 8, display: 'inline-flex' }}>
                        {uploading ? 'Téléversement…' : '＋ Ajouter des vidéos de fond'}
                        <input type="file" accept="video/*" multiple hidden disabled={uploading} onChange={e => { const fs = e.target.files; if (fs && fs.length) uploadBgVideos(fs); e.currentTarget.value = ''; }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="note">Tout est stocké dans le bucket public <code>marketing</code> (Supabase Storage). L'avatar parlant utilise l'API D-ID (clé <code>DID_API_KEY</code>). N'utilise que des images/voix de personnes consentantes.</div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Brief créatif <span className="chip">IA · multi-livrables</span></h2>
            <p className="hint">Un seul brief → l'IA produit un <b>pack complet</b> : accroches, storyboard adapté à chaque format, sous-titres, post LinkedIn, courriel de suivi et concept de miniature. Démo fictive crédible ; allégations chiffrées signalées si non sourcées.</p>
            <div className="row2">
              <div><label>Module</label><select value={sModule} onChange={e => setSModule(e.target.value)}>{MODULES.map(m => <option key={m}>{m}</option>)}</select></div>
              <div><label>Public cible</label><input value={sAudience} onChange={e => setSAudience(e.target.value)} placeholder="Ex. : responsables SST, chefs de maintenance…" /></div>
            </div>
            <label>Message clé (doit être démontrable à l'écran)</label>
            <textarea value={sMsg} onChange={e => setSMsg(e.target.value)} placeholder="Ex. : Un rapport d'inspection produit en scannant le QR de l'équipement, photos et résumé d'anomalies générés par l'IA." />
            <div className="row2">
              <div><label>Appel à l'action (CTA)</label><input value={sCta} onChange={e => setSCta(e.target.value)} /></div>
              <div><label>Langue</label><select value={sLang} onChange={e => setSLang(e.target.value as any)}><option value="fr">Français</option><option value="en">English</option></select></div>
            </div>
            <label>Formats à produire</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_FORMATS.map(f => (
                <label key={f.k} className={`fmtchip ${sFormats[f.k] ? 'on' : ''}`}>
                  <input type="checkbox" checked={!!sFormats[f.k]} onChange={e => setSFormats(s => ({ ...s, [f.k]: e.target.checked }))} style={{ width: 'auto' }} /> {f.label}
                </label>
              ))}
            </div>
            <div className="actions">
              <button className="btn btn-violet" onClick={generatePack} disabled={genPack}>{genPack ? '✦ Génération du pack…' : '✦ Générer le pack marketing (IA)'}</button>
              {pack && <button className="btn btn-ghost" onClick={() => setPack(null)}>Vider</button>}
            </div>
          </div>

          {pack && (
            <>
              <div className="packbar">
                <span className="chip">Langue : {sLang.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" onClick={translatePack} disabled={translating}>{translating ? 'Traduction…' : `🌐 Traduire en ${sLang === 'fr' ? 'EN' : 'FR'}`}</button>
                  <button className="btn btn-signal" onClick={saveAsset} disabled={savingAsset}>{savingAsset ? 'Enregistrement…' : '💾 Enregistrer dans les actifs'}</button>
                </div>
              </div>

              {Array.isArray(pack.warnings) && pack.warnings.length > 0 && (
                <div className="warnbox"><strong>⚠ Allégations à sourcer (Loi sur la concurrence)</strong><ul>{pack.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></div>
              )}

              <div className="grid">
                {/* Hooks */}
                {Array.isArray(pack.hooks) && (
                  <div className="card"><h2>Accroches <span className="chip">{pack.hooks.length}</span></h2>
                    {pack.hooks.map((h: string, i: number) => (
                      <div key={i} className="hookrow"><span>{h}</span><button className="copy" onClick={() => copyText(h)}>copier</button></div>
                    ))}
                  </div>
                )}
                {/* Sous-titres */}
                {pack.captions && (
                  <div className="card"><h2>Sous-titres <span className="chip">prêts</span></h2>
                    <pre className="ebody">{pack.captions}</pre>
                    <button className="btn btn-ghost" onClick={() => copyText(pack.captions)}>Copier les sous-titres</button>
                  </div>
                )}
              </div>

              {/* Storyboard */}
              {Array.isArray(pack.storyboard) && (
                <div className="card">
                  <h2>Storyboard <span className="chip">{pack.storyboard.reduce((s: number, x: any) => s + (Number(x.seconds) || 0), 0)} s</span></h2>
                  <div className="tablewrap"><table>
                    <thead><tr><th>#</th><th>Scène</th><th>s</th><th>Plan</th><th>Texte écran</th><th>Voix off</th></tr></thead>
                    <tbody>{pack.storyboard.map((sc: any, i: number) => (
                      <tr key={i}><td>{i + 1}</td><td>{sc.scene}</td><td>{sc.seconds}</td><td>{sc.shot}</td><td>{sc.onscreen_text}</td><td>{sc.voiceover}</td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}

              {/* Plan de capture réel (scénario filmé sur le tenant démo CERDIA) */}
              {Array.isArray(pack.storyboard) && (
                <div className="card">
                  <h2>Plan de capture <span className="chip">scénario réel · CERDIA démo</span></h2>
                  <p className="hint">L'IA prépare le scénario (pages à montrer + actions à filmer). Le robot Playwright se connecte à <b>CERDIA</b> avec un <b>compte démo</b> (sécurité/RLS respectées, données fictives) et capture les écrans réels.</p>
                  {/* Compte démo : saisi ici (transmis seulement pour la capture, jamais stocké) OU via env Vercel. */}
                  <div className="addbox">
                    <label style={{ marginTop: 0 }}>Compte démo CERDIA (connexion du robot — non enregistré)</label>
                    <div className="row2">
                      <input type="email" autoComplete="off" value={demoEmail} onChange={e => setDemoEmail(e.target.value)} placeholder="email du compte démo" />
                      <input type="password" autoComplete="new-password" value={demoPassword} onChange={e => setDemoPassword(e.target.value)} placeholder="mot de passe" />
                    </div>
                    <p className="note" style={{ marginTop: 8 }}>Utilise un <b>compte normal</b> du tenant CERDIA (données fictives). Laisse vide si tu as défini <code>MKT_DEMO_EMAIL</code>/<code>MKT_DEMO_PASSWORD</code> sur Vercel. Les identifiants servent uniquement à cette capture et ne sont jamais sauvegardés.</p>
                  </div>
                  <div className="actions">
                    <button className="btn btn-violet" onClick={generateCapturePlan} disabled={genPlan}>{genPlan ? '✦ Préparation…' : '✦ Générer le plan de capture (IA)'}</button>
                    {capturePlan && <button className="btn btn-reel" onClick={runCapture} disabled={capturing}>{capturing ? '📸 Capture en cours…' : '📸 Lancer la capture réelle'}</button>}
                    {capturePlan && <button className="btn btn-ghost" onClick={downloadPlan}>↧ Plan (.json)</button>}
                  </div>
                  {capturePlan && Array.isArray(capturePlan.steps) && (
                    <>
                      <div className="tablewrap" style={{ marginTop: 12 }}><table>
                        <thead><tr><th>#</th><th>Scène</th><th>Page</th><th>Actions</th><th>Surligner</th></tr></thead>
                        <tbody>{capturePlan.steps.map((st: any, i: number) => (
                          <tr key={i}><td>{i + 1}</td><td>{st.scene}</td><td className="mono">{st.route}</td><td>{(st.actions || []).map((a: any) => a.type === 'wait' ? `wait ${a.ms}ms` : `${a.type} ${a.selector || ''}`).join(' · ') || '—'}</td><td className="mono">{st.highlight || '—'}</td></tr>
                        ))}</tbody>
                      </table></div>
                      <div className="note"><b>📸 Lancer la capture réelle</b> exécute le robot <b>côté serveur</b> : il se connecte à CERDIA avec le compte démo ci-dessus (sécurité/RLS respectées) et range les écrans capturés directement dans <b>📷 Photos &amp; images</b> (prêts à servir de slides). Le bouton « Plan (.json) » reste disponible pour un usage hors-ligne via <code>scripts/marketing-capture.mjs</code>.
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Formats */}
              {Array.isArray(pack.formats) && pack.formats.length > 0 && (
                <div className="card"><h2>Déclinaisons par format <span className="chip">{pack.formats.length}</span></h2>
                  <div className="grid">{pack.formats.map((f: any, i: number) => (
                    <div key={i} className="fmtcard"><div className="fmttop"><b>{f.ratio}</b> · {f.platform} · {f.duration_s}s</div><div className="fmtnotes">{f.edit_notes}</div></div>
                  ))}</div>
                </div>
              )}

              {/* Publications prêtes à pousser — une version par plateforme */}
              {Array.isArray(pack.social_posts) && pack.social_posts.length > 0 && (
                <div className="card">
                  <h2>Publications par plateforme <span className="chip">copier &amp; pousser</span></h2>
                  <p className="hint">Chaque réseau a sa version adaptée (ton, longueur, hashtags). Copie celle que tu veux et publie-la.</p>
                  <div className="grid">
                    {pack.social_posts.map((sp: any, i: number) => {
                      const full = `${sp.caption}${Array.isArray(sp.hashtags) && sp.hashtags.length ? `\n\n${sp.hashtags.join(' ')}` : ''}`;
                      return (
                        <div key={i} className="platcard">
                          <div className="plathead"><b>{PLAT_ICON[sp.platform] || '◆'} {sp.platform}</b><button className="copy" onClick={() => copyText(full)}>copier</button></div>
                          <pre className="ebody">{sp.caption}</pre>
                          {Array.isArray(sp.hashtags) && sp.hashtags.length > 0 && <div className="tags-row">{sp.hashtags.map((t: string, j: number) => <span key={j} className="htag">{t}</span>)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid">
                {/* Courriel de suivi -> interconnexion prospection */}
                {pack.follow_up_email && (
                  <div className="card"><h2>Courriel de suivi <span className="chip">→ prospection</span></h2>
                    <div className="er"><span>Objet</span><b>{pack.follow_up_email.subject}</b></div>
                    <pre className="ebody">{pack.follow_up_email.body}</pre>
                    <div className="actions">
                      <button className="btn btn-ghost" onClick={() => copyText(`${pack.follow_up_email.subject}\n\n${pack.follow_up_email.body}`)}>Copier</button>
                      <button className="btn btn-violet" onClick={() => {
                        setEmailDraft({ subjectA: pack.follow_up_email.subject, subjectB: pack.follow_up_email.subject, body: pack.follow_up_email.body, footer: 'C-Secur360 · [Adresse postale C-Secur360] · [Lien de désabonnement]', compliance: ['Vérifier le consentement avant envoi (LCAP).'] });
                        setView('prospect');
                        setNotice({ msg: '✓ Courriel chargé dans Prospection — vérifie le consentement avant d\'envoyer.', ok: true });
                      }}>↗ Utiliser dans Prospection</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Miniature */}
              {pack.thumbnail && (
                <div className="card"><h2>Concept de miniature</h2><p className="hint" style={{ marginBottom: 0 }}>{pack.thumbnail}</p></div>
              )}

              <div className="note">Production : le pack (script, sous-titres, posts, courriel) est prêt. Passe à l'<b>avatar</b> puis à l'<b>assembleur</b> ci-dessous — le storyboard remplit déjà les slides automatiquement.</div>
            </>
          )}

          {/* Avatar présentateur (parle ton script) */}
          <div className="card">
            <h2>Avatar présentateur <span className="chip">parle &amp; explique</span></h2>
            <p className="hint">Choisis un <b>avatar</b> (déposé dans la Médiathèque) ; il prononce ton script (lip-sync, via D-ID).</p>
            {avatars.length === 0 && <div className="warnbox" style={{ marginTop: 0 }}>Ajoute d'abord un <b>avatar</b> dans 🗂 Médiathèque du Studio (en haut).</div>}
            <div className="row3">
              <div><label>Avatar</label>
                <select value={selectedAvatarId} onChange={e => setSelectedAvatarId(e.target.value)}>
                  {avatars.length === 0 && <option value="">— aucun —</option>}
                  {avatars.map(a => <option key={a.id} value={a.id}>{a.name || 'avatar'}</option>)}
                </select>
              </div>
              <div><label>Voix</label><select value={avaVoice} onChange={e => setAvaVoice(e.target.value)}>{AVA_VOICES.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}</select></div>
              <div><label>Délai au début</label>
                <select value={avaDelay} onChange={e => setAvaDelay(+e.target.value)}>
                  <option value={0}>aucun</option><option value={500}>0,5 s</option><option value={800}>0,8 s</option><option value={1200}>1,2 s</option><option value={2000}>2 s</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
              {selectedAvatar?.url && <img src={selectedAvatar.url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--line)' }} />}
              {pack?.storyboard && <button className="btn btn-ghost" onClick={() => setAvaText(pack.storyboard.map((s: any) => s.voiceover).filter(Boolean).join(' '))}>Remplir depuis le storyboard</button>}
            </div>
            {/* Mode « texte IA » : idées + durée -> script calibré */}
            <div className="addbox">
              <label style={{ marginTop: 0 }}>✦ Rédiger le texte par IA — donne tes idées</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ color: 'var(--mist)', fontSize: 11, alignSelf: 'center' }}>Modèles :</span>
                {SCRIPT_TEMPLATES.map(t => (
                  <button key={t.k} type="button" className="copy" onClick={() => setAvaIdeas(t.ideas)}>{t.label}</button>
                ))}
              </div>
              <textarea value={avaIdeas} onChange={e => setAvaIdeas(e.target.value)} placeholder="Ex. : présenter le module DGA, gain de temps, capture QR, public technique…" rows={2} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 6 }}>
                <div><label style={{ marginTop: 0 }}>Durée</label>
                  <select value={avaSeconds} onChange={e => setAvaSeconds(+e.target.value)} style={{ width: 130 }}>
                    <option value={10}>10 secondes</option><option value={20}>20 secondes</option>
                    <option value={30}>30 secondes</option><option value={45}>45 secondes</option><option value={60}>60 secondes</option>
                  </select>
                </div>
                <button className="btn btn-violet" onClick={writeAvatarScript} disabled={avaWriting}>{avaWriting ? '✦ Rédaction…' : '✦ Rédiger le texte'}</button>
              </div>
            </div>

            <label>Texte à narrer</label>
            <textarea value={avaText} onChange={e => setAvaText(e.target.value)} placeholder="Ce que l'avatar dit à l'écran… (ou rédige-le par IA ci-dessus)" rows={3} />
            <div className="actions">
              <button className="btn btn-reel" onClick={generateAvatar} disabled={avaBusy}>{avaBusy ? '🎬 Génération…' : '🎬 Générer l\'avatar qui parle'}</button>
            </div>
            {avaMsg && <div className={`mkt-notice ${avaMsg.ok ? 'ok' : 'err'}`} style={{ marginTop: 10, marginBottom: 0 }}>{avaMsg.msg}</div>}
            {avaUrl && (
              <div style={{ marginTop: 12 }}>
                <video src={avaUrl} controls style={{ width: '100%', borderRadius: 10, border: '1px solid var(--line)' }} />
                <div className="actions"><a className="btn btn-ghost" href={avaUrl} target="_blank" rel="noreferrer" download>↧ Télécharger la vidéo</a></div>
              </div>
            )}
          </div>

          {/* Assembleur vidéo IN-APP : aperçu en direct + enregistrement réel (.webm). */}
          <MarketingComposer
            avatarVideos={avaVideos}
            library={library}
            bgVideos={bgVideos}
            storyboard={pack?.storyboard}
            onNotice={(m) => setNotice(m)}
            uploadFile={uploadToMarketing}
            saveVideoToGallery={saveVideoToGallery}
          />

          {/* Galerie UNIQUE : clips d'avatar + montages assemblés, tout ensemble. */}
          <div className="card">
            <h2>📁 Mes vidéos enregistrées <span className="chip">{avaVideos.length + compositions.length}</span></h2>
            <p className="hint">Tout est conservé ici (stockage Supabase) : tes <b>clips d'avatar</b> et tes <b>montages assemblés</b> (badge). Revois, télécharge (↧) ou supprime (🗑). Les montages y arrivent via « 💾 Enregistrer dans la galerie » de l'assembleur.</p>
            {(() => {
              const all = [
                ...compositions.map(v => ({ ...v, tag: 'Montage', tc: 'var(--reel)' })),
                ...avaVideos.map(v => ({ ...v, tag: 'Avatar', tc: 'var(--violet)' })),
              ].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
              return all.length === 0 ? (
                <div style={{ color: 'var(--mist)', fontSize: 12, padding: '6px 0' }}>Aucune vidéo enregistrée pour l'instant.</div>
              ) : (
                <div className="vidgrid">
                  {all.map(v => (
                    <div key={v.id} className="vidcard">
                      <video src={v.url} controls preload="metadata" />
                      <div className="vrow">
                        <span className="chip" style={{ color: v.tc, borderColor: v.tc }}>{v.tag}</span>
                        <span style={{ display: 'flex', gap: 8 }}>
                          <button className="copy" onClick={() => downloadAsset(v.url, `${(v.tag || 'video').toLowerCase()}-${v.id.slice(0, 6)}.${v.url.split('.').pop()?.split('?')[0] || 'mp4'}`)} title="Télécharger">↧</button>
                          <button className="copy" style={{ color: 'var(--rust)' }} onClick={() => { if (confirm('Supprimer définitivement cette vidéo ?')) deleteAsset(v.id); }}>🗑</button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* ================= PROSPECTION ================= */}
      {view === 'prospect' && (
        <>
          <div className="kpis">
            <Kpi n={String(rows.length)} l="Prospects en base" />
            <Kpi n={String(rows.filter(p => !p.blocked).length)} l="Éligibles à l'envoi" c="var(--signal)" />
            <Kpi n={String(aboveSeuil)} l="Au-dessus du seuil" c="var(--violet)" />
            <Kpi n={String(unsubCount)} l="Bloqués / désab." c="var(--rust)" />
          </div>

          {/* Recherche de prospection LÉGALE par IA (QC -> Canada) */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2>Recherche de prospects <span className="chip">IA · web</span></h2>
            <p className="hint">L'IA cherche sur le web des entreprises pertinentes et ne retient que les <b>adresses d'affaires publiées publiquement</b> (base du consentement tacite CASL), avec l'<b>URL source</b> comme preuve. Aucune adresse devinée, aucun scraping.</p>
            <div className="row3" style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 11, alignItems: 'end' }}>
              <div><label>Région</label>
                <select value={researchRegion} onChange={e => setResearchRegion(e.target.value as any)}>
                  <option value="QC">Québec</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div><label>Secteur ciblé</label><input value={researchSector} onChange={e => setResearchSector(e.target.value)} placeholder="Ex. : mutuelles SST, location d'équipement, manufacturiers MT…" /></div>
              <button className="btn btn-violet" onClick={runResearch} disabled={researching}>{researching ? '✦ Recherche…' : '✦ Rechercher (IA)'}</button>
            </div>

            {candidates.length > 0 && (
              <div className="candbox">
                <div className="candhead">
                  <span>{candidates.length} entreprises — adresses publiées vérifiables</span>
                  <button className="btn btn-signal" style={{ padding: '7px 12px' }} onClick={importSelected} disabled={importing}>{importing ? 'Import…' : '↧ Importer les sélectionnées (consentement tacite)'}</button>
                </div>
                {candidates.map((c, i) => {
                  const key = String(c.email).toLowerCase();
                  return (
                    <label key={i} className="cand">
                      <input type="checkbox" checked={!!picked[key]} onChange={e => setPicked(p => ({ ...p, [key]: e.target.checked }))} />
                      <div className="candinfo">
                        <div className="candc">{c.company} <span className="candcity">{c.city ? `· ${c.city}` : ''} · {c.region || researchRegion}</span></div>
                        <div className="mono candmail">{c.email}</div>
                        {c.relevance && <div className="candrel">{c.relevance}</div>}
                        {c.source_url && <a className="candsrc" href={c.source_url} target="_blank" rel="noreferrer">⚖ source publiée</a>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="grid">
            <div className="card">
              <h2>Campagne <span className="chip">module + angle</span></h2>
              <p className="hint">« Recherche » = enrichir des fiches <b>déjà consentantes</b>, jamais scraper au hasard.</p>
              <div className="row2">
                <div><label>Module promu</label><select value={pModule} onChange={e => setPModule(e.target.value)}>{MODULES.map(m => <option key={m}>{m}</option>)}</select></div>
                <div><label>Segment ciblé</label><input value={segment} onChange={e => setSegment(e.target.value)} placeholder="Ex. : mutuelles SST, location d'équipement, manufacturiers MT…" /></div>
              </div>
              <label>Angle d'accroche</label>
              <textarea value={angle} onChange={e => setAngle(e.target.value)} placeholder="Ex. : Réduire le temps de production des rapports terrain grâce au workflow QR + IA." />
              <label>Seuil de score minimum pour l'envoi : <b style={{ color: 'var(--reel)' }}>{seuil}</b></label>
              <input type="range" min={0} max={90} step={5} value={seuil} onChange={e => setSeuil(+e.target.value)} style={{ accentColor: 'var(--reel)' }} />

              <div className="gate">
                <div className="gate-title">⚠ Verrou de conformité — requis pour activer l'envoi</div>
                {[
                  ['c1', 'Consentement valide vérifié par destinataire', 'Exprès, ou tacite < 24 mois'],
                  ['c2', 'Désabonnés & plaintes exclus', 'Synchro temps réel'],
                  ['c3', 'Identité + adresse + désabonnement injectés', 'Dans chaque courriel (LCAP)'],
                  ['c4', 'Validation humaine de la 1re campagne du segment', 'Tu approuves avant automatisation'],
                ].map(([k, t, s]) => (
                  <label key={k} className="check">
                    <input type="checkbox" checked={(checks as any)[k]} onChange={e => setChecks(c => ({ ...c, [k]: e.target.checked }))} />
                    <span>{t}<small>{s}</small></span>
                  </label>
                ))}
              </div>
              <div className="actions">
                <button className="btn btn-violet" onClick={generateEmail} disabled={genEmail}>{genEmail ? '✦ Génération…' : '✦ Générer le courriel (IA)'}</button>
                <button className="btn btn-signal" onClick={scheduleCampaign} disabled={!allChecks || scheduling} title={allChecks ? '' : 'Active les 4 conditions de conformité'}>{scheduling ? '▶ Envoi…' : '▶ Programmer & envoyer'}</button>
              </div>

              {emailDraft && (
                <div className="emailbox">
                  <div className="er"><span>Objet A</span><b>{emailDraft.subjectA}</b></div>
                  <div className="er"><span>Objet B</span><b>{emailDraft.subjectB}</b></div>
                  <pre className="ebody">{emailDraft.body}</pre>
                  <div className="efoot">{emailDraft.footer}</div>
                  {Array.isArray(emailDraft.compliance) && emailDraft.compliance.length > 0 && (
                    <ul className="ecomp">{emailDraft.compliance.map((c: string, i: number) => <li key={i}>⚖ {c}</li>)}</ul>
                  )}
                </div>
              )}
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <h2>File de prospects <span className="chip">base réelle</span></h2>
                <button className="btn btn-ghost" style={{ padding: '6px 11px' }} onClick={() => setAddOpen(o => !o)}>＋ Prospect</button>
              </div>
              <p className="hint">Score d'intérêt par prospect. Sous le seuil, bloqué ou désabonné = exclu automatiquement.</p>

              {addOpen && (
                <div className="addbox">
                  <div className="row2">
                    <div><label>Entreprise</label><input value={np.company} onChange={e => setNp(s => ({ ...s, company: e.target.value }))} /></div>
                    <div><label>Courriel *</label><input value={np.email} onChange={e => setNp(s => ({ ...s, email: e.target.value }))} /></div>
                  </div>
                  <div className="row2">
                    <div><label>Type de consentement</label>
                      <select value={np.consent_type} onChange={e => setNp(s => ({ ...s, consent_type: e.target.value }))}>
                        <option value="express">Exprès (opt-in)</option>
                        <option value="tacit">Tacite (relation &lt; 24 mois)</option>
                        <option value="none">Aucun (jamais d'envoi)</option>
                      </select>
                    </div>
                    <div><label>Source du consentement</label><input value={np.consent_source} onChange={e => setNp(s => ({ ...s, consent_source: e.target.value }))} placeholder="formulaire, salon, relation d'affaires…" /></div>
                  </div>
                  <div className="row2">
                    <div><label>Segment</label><input value={np.segment} onChange={e => setNp(s => ({ ...s, segment: e.target.value }))} /></div>
                    <div><label>Score ({np.score})</label><input type="range" min={0} max={100} value={np.score} onChange={e => setNp(s => ({ ...s, score: +e.target.value }))} /></div>
                  </div>
                  <div className="actions"><button className="btn btn-violet" onClick={addProspect}>Enregistrer le prospect</button></div>
                </div>
              )}

              <div className="tablewrap">
                <table>
                  <thead><tr><th>Entreprise</th><th>Courriel</th><th>Consent.</th><th>Score</th><th>Statut</th></tr></thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--steel)', padding: '22px 8px' }}>
                        {loadingProspects ? 'Chargement…' : 'Aucun prospect en base. Ajoute-en un, ou lance la recherche IA ci-dessous.'}
                      </td></tr>
                    )}
                    {rows.map((p, i) => {
                      const under = !p.blocked && p.score < seuil; const elig = !p.blocked && !under;
                      return (
                        <tr key={i}>
                          <td>{p.company}</td><td className="mono">{p.email}</td>
                          <td><span className={`tag ${p.consent}`}>{CLBL[p.consent]}</span></td>
                          <td>{p.blocked ? <span style={{ color: 'var(--rust)' }}>—</span> : <span className="scoredot" style={{ background: p.score >= 70 ? 'var(--signal)' : p.score >= 45 ? 'var(--amber)' : 'var(--rust)' }}>{p.score}</span>}</td>
                          <td style={{ color: elig ? 'var(--signal)' : 'var(--rust)' }}>{p.blocked ? 'Bloqué/désab.' : under ? 'Sous seuil' : 'Éligible'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="note">Base réelle protégée (Loi 25, RLS). Chaque envoi fige un <b>instantané de consentement</b> (horodatage, type, source), conservé comme preuve (CRTC / Commission d'accès à l'information).</div>
            </div>
          </div>
        </>
      )}

      {/* ================= CONFORMITÉ ================= */}
      {view === 'compliance' && (
        <>
          <div className="grid">
            <LawCard title="✉ Prospection courriel" tag="LCAP / CASL" rules={[
              ['!', 'Consentement par destinataire', 'Exprès (opt-in) ou tacite (relation < 24 mois, ou adresse publiée sans mention « pas de sollicitation »).'],
              ['!', 'Identité + adresse physique', 'Nom et adresse postale valides dans chaque courriel.'],
              ['!', 'Désabonnement fonctionnel', 'Lien clair, traité sous 10 jours ouvrables.'],
              ['✓', 'Registre de preuve', 'Source et date de consentement conservées. Amendes jusqu\'à 10 M$ par violation.'],
            ]} />
            <LawCard title="🛡 Données personnelles" tag="Loi 25 — QC" rules={[
              ['!', 'Courriel nominatif = renseignement personnel', 'marc.tremblay@… est protégé ; info@… reste encadré.'],
              ['!', 'Finalité documentée', 'Pouvoir dire d\'où vient chaque contact et pourquoi.'],
              ['✓', 'Politique de confidentialité + responsable (PRP)', 'Publiée, accessible, responsable désigné.'],
              ['✓', 'Droit d\'accès et de retrait', 'Consultation et suppression sur demande.'],
            ]} />
            <LawCard title="🎬 Vidéos promo" tag="Concurrence / LPC" rules={[
              ['!', 'Pas de données client réelles à l\'écran', 'Compte démo à données fictives. Une vraie capture = fuite de renseignements.'],
              ['!', 'Allégations démontrables', '« −70 % de temps » doit reposer sur une mesure réelle.'],
              ['✓', 'Autorisation pour témoignage', 'Un témoignage client exige son accord écrit.'],
            ]} />
            <LawCard title="🤖 Agent autonome" tag="bonnes pratiques" rules={[
              ['!', 'Validation humaine au départ', 'L\'IA prépare ; tu approuves la 1re campagne de chaque segment.'],
              ['!', 'Pas de scraping aveugle', 'Enrichir des fiches légitimes, jamais collecter sans base de consentement.'],
              ['✓', 'Cadence + warm-up', 'Envoi étalé pour la délivrabilité et sous les seuils de plainte.'],
            ]} />
          </div>
          <div className="note">Guide opérationnel, pas un avis juridique. Pour une campagne d'envergure, fais valider ton processus de consentement par un conseiller juridique au fait de la LCAP et de la Loi 25.</div>
        </>
      )}

      <style jsx>{`
        .mktwrap{--bg:#0a0e14;--panel:#11161f;--panel2:#161d28;--line:#232c3a;--steel:#5b7185;--mist:#8b9bad;--paper:#eef2f6;--reel:#ff7a45;--signal:#2ee6a6;--signal-dim:#1c8c66;--violet:#7c8cff;--amber:#f5b945;--rust:#ff6b5e;
          background:radial-gradient(1100px 560px at 82% -12%,rgba(255,122,69,.06),transparent 60%),var(--bg);color:var(--paper);border-radius:16px;padding:22px;font-family:Inter,system-ui,sans-serif;line-height:1.5;}
        .mkt-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:18px;}
        .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mist);display:flex;align-items:center;gap:9px;}
        .live{width:9px;height:9px;border-radius:50%;background:var(--signal);box-shadow:0 0 0 0 rgba(46,230,166,.6);}
        h1{font-size:26px;font-weight:700;letter-spacing:-.02em;margin-top:5px;} h1 span{color:var(--reel);}
        .sub{color:var(--mist);font-size:13px;margin-top:6px;max-width:560px;}
        .guard{border:1px solid var(--signal-dim);background:rgba(46,230,166,.07);border-radius:10px;padding:11px 15px;font-size:12px;max-width:270px;}
        .guard strong{color:var(--signal);} .guard .law{font-size:10px;color:var(--mist);display:block;margin-top:4px;}
        .mkt-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
        .mkt-tab{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--mist);font-weight:600;font-size:14px;cursor:pointer;}
        .mkt-tab:hover{color:var(--paper);} .mkt-tab.active{background:rgba(255,122,69,.12);color:var(--paper);border-color:var(--reel);}
        .mkt-notice{margin-bottom:14px;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:500;}
        .mkt-notice.ok{background:rgba(46,230,166,.1);border:1px solid var(--signal-dim);color:var(--signal);}
        .mkt-notice.err{background:rgba(255,107,94,.1);border:1px solid var(--rust);color:var(--rust);}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:880px){.grid{grid-template-columns:1fr;}}
        .card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:18px;}
        .card h2{font-size:15px;font-weight:600;display:flex;align-items:center;gap:9px;margin-bottom:3px;}
        .card .hint{font-size:12px;color:var(--mist);margin-bottom:12px;}
        .chip{font-size:10px;padding:2px 8px;border-radius:5px;border:1px solid var(--line);color:var(--mist);}
        label{display:block;font-size:11.5px;color:var(--mist);margin:11px 0 5px;font-weight:500;}
        :global(.mktwrap) input,:global(.mktwrap) select,:global(.mktwrap) textarea{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--paper);border-radius:8px;padding:9px 11px;font-size:13px;font-family:inherit;}
        :global(.mktwrap) option{background:#11161f;color:#eef2f6;}
        textarea{resize:vertical;min-height:64px;}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
        .row3{display:grid;grid-template-columns:1fr 1fr 130px;gap:11px;}
        .togs{margin-top:13px;border-top:1px solid rgba(35,44,58,.5);}
        .actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;}
        .btn{border:none;border-radius:8px;padding:10px 15px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
        .btn:disabled{opacity:.5;cursor:not-allowed;}
        .btn-reel{background:var(--reel);color:#2a1006;} .btn-violet{background:var(--violet);color:#0a1030;}
        .btn-signal{background:var(--signal);color:#04241a;} .btn-ghost{background:transparent;border:1px solid var(--line);color:var(--paper);}
        .warnbox{margin-top:13px;border:1px solid var(--amber);background:rgba(245,185,69,.08);border-radius:9px;padding:10px 13px;font-size:12px;color:var(--amber);}
        .warnbox ul{margin:6px 0 0 16px;color:var(--paper);}
        .ruler{display:flex;height:20px;border:1px solid var(--line);border-radius:7px 7px 0 0;border-bottom:none;background:var(--panel2);align-items:center;padding:0 10px;justify-content:space-between;font-size:10px;color:var(--steel);margin-top:16px;}
        .track{border:1px solid var(--line);border-radius:0 0 7px 7px;background:var(--panel2);padding:10px;display:flex;gap:8px;overflow-x:auto;min-height:92px;}
        .track-empty{color:var(--steel);font-size:12px;align-self:center;padding:0 8px;}
        .clip{flex:0 0 auto;border-radius:8px;border:1px solid var(--line);background:linear-gradient(180deg,var(--panel2),var(--panel));padding:9px 10px;cursor:pointer;text-align:left;color:var(--paper);}
        .clip.sel{border-color:var(--reel);box-shadow:0 0 0 1px var(--reel);}
        .clip .num{font-size:9px;color:var(--steel);} .clip .cttl{font-size:12px;font-weight:600;margin:3px 0;} .clip .cfx{font-size:9.5px;color:var(--violet);} .clip .cdur{font-size:10px;color:var(--reel);margin-top:4px;}
        .vstage{background:var(--bg);border:1px solid var(--line);border-radius:10px;min-height:140px;display:grid;place-items:center;padding:14px;}
        .vmock{width:100%;min-height:110px;border-radius:8px;background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);position:relative;padding:10px;}
        .vmock.muted{display:grid;place-items:center;color:var(--steel);font-size:12px;}
        .vscene{font-size:10px;color:var(--mist);} .vsub{position:absolute;bottom:10px;left:10px;right:10px;background:rgba(0,0,0,.6);border-radius:6px;padding:6px 9px;font-size:12px;}
        .pipeline{margin-top:14px;display:flex;flex-direction:column;gap:7px;}
        .stage{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:9px;padding:8px 11px;background:var(--panel2);}
        .sico{width:26px;height:26px;border-radius:7px;background:rgba(124,140,255,.15);color:var(--violet);display:grid;place-items:center;font-size:14px;}
        .snm{font-size:12.5px;font-weight:600;} .stool{font-size:10.5px;color:var(--mist);}
        .progress{margin-top:12px;height:7px;border-radius:5px;background:var(--panel2);overflow:hidden;} .progress i{display:block;height:100%;background:var(--reel);transition:width .1s;}
        .progmeta{display:flex;justify-content:space-between;font-size:11px;color:var(--mist);margin-top:5px;}
        .note{margin-top:14px;font-size:11px;color:var(--steel);line-height:1.5;border-left:2px solid var(--line);padding-left:10px;}
        .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px;}
        @media(max-width:680px){.kpis{grid-template-columns:1fr 1fr;}}
        .kpi{background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:13px 15px;} .kpi .n{font-size:24px;font-weight:700;} .kpi .l{font-size:11px;color:var(--mist);margin-top:2px;}
        .addbox{margin:6px 0 12px;border:1px solid var(--line);background:var(--panel2);border-radius:10px;padding:12px;}
        .fmtchip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:7px 11px;font-size:12px;color:var(--mist);cursor:pointer;}
        .fmtchip.on{border-color:var(--reel);color:var(--paper);background:rgba(255,122,69,.08);}
        .packbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:14px 0;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);}
        .hookrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid rgba(35,44,58,.5);font-size:13px;}
        .hookrow:last-child{border-bottom:none;}
        .copy{background:none;border:1px solid var(--line);color:var(--mist);border-radius:6px;padding:3px 9px;font-size:11px;cursor:pointer;flex:0 0 auto;}
        .copy:hover{color:var(--paper);border-color:var(--steel);}
        .fmtcard{border:1px solid var(--line);border-radius:9px;background:var(--panel2);padding:11px;}
        .fmttop{font-size:12.5px;margin-bottom:5px;} .fmtnotes{font-size:11.5px;color:var(--mist);}
        .tags-row{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0;} .htag{font-size:11px;color:var(--violet);background:rgba(124,140,255,.1);border-radius:5px;padding:1px 7px;}
        .platcard{border:1px solid var(--line);border-radius:10px;background:var(--panel2);padding:12px;}
        .plathead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:13px;}
        .chatwin{margin-top:12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);padding:12px;min-height:240px;max-height:460px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}
        .chatempty{margin:auto;text-align:center;color:var(--mist);font-size:13px;}
        .starters{display:flex;flex-direction:column;gap:7px;margin-top:12px;max-width:520px;}
        .starter{text-align:left;border:1px solid var(--line);background:var(--panel2);color:var(--paper);border-radius:9px;padding:9px 12px;font-size:12.5px;cursor:pointer;}
        .starter:hover{border-color:var(--violet);}
        .bubble{max-width:88%;border-radius:11px;padding:9px 12px;font-size:13px;line-height:1.55;}
        .bubble.user{align-self:flex-end;background:rgba(124,140,255,.14);border:1px solid rgba(124,140,255,.3);}
        .bubble.assistant{align-self:flex-start;background:var(--panel2);border:1px solid var(--line);}
        .brole{font-size:10px;color:var(--mist);margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em;}
        .btext{white-space:pre-wrap;}
        .chatbar{margin-top:11px;display:flex;gap:10px;align-items:stretch;}
        .chatbar textarea{flex:1;min-height:46px;}
        .dropzone{border:1px dashed var(--line);border-radius:10px;background:var(--bg);padding:12px;margin-top:5px;}
        .libgrid{display:flex;flex-wrap:wrap;gap:8px;}
        .libitem{position:relative;width:58px;height:58px;}
        .libitem img{width:58px;height:58px;object-fit:cover;border-radius:8px;border:1px solid var(--line);}
        .vidgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}
        .vidcard{border:1px solid var(--line);border-radius:9px;background:var(--panel2);padding:6px;}
        .vidcard video{width:100%;border-radius:6px;display:block;aspect-ratio:16/9;object-fit:cover;background:#000;}
        .vidcard .vrow{display:flex;justify-content:space-between;align-items:center;margin-top:5px;}
        .libdel{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:none;background:var(--rust);color:#fff;font-size:12px;line-height:1;cursor:pointer;}
        .candbox{margin-top:14px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);overflow:hidden;}
        .candhead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--mist);flex-wrap:wrap;}
        .cand{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-bottom:1px solid rgba(35,44,58,.5);cursor:pointer;}
        .cand:last-child{border-bottom:none;} .cand input{width:auto;margin-top:3px;}
        .candinfo{min-width:0;} .candc{font-size:13px;font-weight:600;} .candcity{color:var(--mist);font-weight:400;font-size:11px;}
        .candmail{font-size:12px;color:var(--signal);margin:2px 0;} .candrel{font-size:11px;color:var(--mist);}
        .candsrc{font-size:11px;color:var(--violet);text-decoration:none;}
        .gate{margin-top:14px;border:1px solid var(--amber);background:rgba(245,185,69,.06);border-radius:10px;padding:12px;}
        .gate-title{font-size:12px;font-weight:600;color:var(--amber);margin-bottom:8px;}
        .check{display:flex;gap:9px;align-items:flex-start;padding:6px 0;font-size:12.5px;color:var(--paper);cursor:pointer;}
        .check input{width:auto;margin-top:2px;} .check small{display:block;color:var(--mist);font-size:10.5px;}
        .emailbox{margin-top:14px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);padding:12px;font-size:12.5px;}
        .er{display:flex;gap:8px;margin-bottom:5px;} .er span{color:var(--mist);min-width:54px;font-size:11px;}
        .ebody{white-space:pre-wrap;background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:10px;margin:8px 0;font-family:inherit;font-size:12.5px;color:var(--paper);}
        .efoot{font-size:11px;color:var(--mist);border-top:1px solid var(--line);padding-top:8px;}
        .ecomp{margin:8px 0 0 0;list-style:none;font-size:11px;color:var(--signal);} .ecomp li{margin-top:3px;}
        .tablewrap{overflow-x:auto;} table{width:100%;border-collapse:collapse;font-size:12px;}
        th{text-align:left;color:var(--mist);font-weight:600;font-size:10.5px;padding:6px 8px;border-bottom:1px solid var(--line);}
        td{padding:8px;border-bottom:1px solid rgba(35,44,58,.5);} .mono{font-size:11px;color:var(--mist);}
        .tag{font-size:10px;padding:2px 7px;border-radius:5px;} .tag.expres{background:rgba(46,230,166,.15);color:var(--signal);} .tag.tacite{background:rgba(245,185,69,.15);color:var(--amber);} .tag.bloque{background:rgba(255,107,94,.15);color:var(--rust);}
        .scoredot{display:inline-block;min-width:26px;text-align:center;border-radius:5px;padding:1px 6px;font-weight:700;font-size:11px;color:#04241a;}
        .law-card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px;}
        .law-card h3{font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}
        .tagx{font-size:10px;color:var(--mist);border:1px solid var(--line);border-radius:5px;padding:2px 7px;}
        .rule{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-top:1px solid rgba(35,44,58,.5);}
        .mk{width:18px;height:18px;border-radius:5px;display:grid;place-items:center;font-size:11px;font-weight:700;flex:0 0 auto;}
        .mk.req{background:rgba(255,107,94,.15);color:var(--rust);} .mk.ok{background:rgba(46,230,166,.15);color:var(--signal);}
        .rule b{font-size:12.5px;} .rule small{display:block;color:var(--mist);font-size:11px;margin-top:2px;}
        /* Anti-débordement global + retours à la ligne des longs contenus (URLs, scripts). */
        .mktwrap, .mktwrap *{min-width:0;box-sizing:border-box;}
        .mktwrap{overflow-x:hidden;}
        .ebody, .btext, .er b{overflow-wrap:anywhere;word-break:break-word;}
        :global(.mktwrap) img,:global(.mktwrap) video,:global(.mktwrap) canvas{max-width:100%;}
        /* ───────── Responsive mobile ───────── */
        @media(max-width:680px){
          .row2,.row3{grid-template-columns:1fr;}
          .grid{grid-template-columns:1fr;}
        }
        @media(max-width:560px){
          .mktwrap{padding:13px;}
          h1{font-size:21px;}
          .mkt-top{gap:12px;margin-bottom:14px;}
          .guard{max-width:100%;}
          .card{padding:14px;}
          .mkt-tabs{gap:5px;}
          .mkt-tab{padding:8px 11px;font-size:12.5px;border-radius:9px;}
          .actions{gap:8px;}
          .actions .btn{flex:1 1 auto;justify-content:center;}
          .btn{padding:9px 12px;font-size:12.5px;}
        }
      `}</style>
    </div>
  );
}

function Kpi({ n, l, c }: { n: string; l: string; c?: string }) {
  return <div className="kpi"><div className="n" style={{ color: c || 'var(--paper)' }}>{n}</div><div className="l">{l}</div></div>;
}
function LawCard({ title, tag, rules }: { title: string; tag: string; rules: string[][] }) {
  return (
    <div className="law-card">
      <h3>{title} <span className="tagx">{tag}</span></h3>
      {rules.map((r, i) => (
        <div className="rule" key={i}><div className={`mk ${r[0] === '✓' ? 'ok' : 'req'}`}>{r[0]}</div><div><b>{r[1]}</b><small>{r[2]}</small></div></div>
      ))}
    </div>
  );
}
