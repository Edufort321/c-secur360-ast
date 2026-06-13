import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { unsubToken } from '@/lib/marketingToken';

// Données du module MARKETING (prospects, désabonnements, campagnes). Réservé super-admin
// (requireAdmin), accès via service_role (RLS bloque la clé anon — Loi 25). tenant = 'cerdia'
// (marketing de la plateforme C-Secur360).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
const TENANT = 'cerdia';
const SEND_CAP = 80; // plafond par requête (anti-timeout / warm-up) ; le reste reste « queued »

// Construit le HTML d'un courriel de prospection CONFORME LCAP : corps + pied de page obligatoire
// (identité expéditeur + adresse postale réelle + lien de désabonnement fonctionnel).
function buildEmailHtml(bodyTxt: string, footerTxt: string, origin: string, email: string): string {
  const addr = process.env.MARKETING_POSTAL_ADDRESS || '';
  const unsubUrl = `${origin}/api/marketing/unsubscribe?token=${unsubToken(email)}`;
  const footer = (footerTxt || '')
    .replace(/\[Adresse postale[^\]]*\]/gi, addr || '[adresse postale à configurer : MARKETING_POSTAL_ADDRESS]')
    .replace(/\[Lien de désabonnement\]/gi, `<a href="${unsubUrl}">se désabonner</a>`);
  const bodyHtml = String(bodyTxt || '').replace(/\n/g, '<br>');
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;font-size:14px;line-height:1.6">
    <div>${bodyHtml}</div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0">
    <div style="color:#94a3b8;font-size:12px;line-height:1.6">${footer.replace(/\n/g, '<br>')}
      <br><a href="${unsubUrl}" style="color:#94a3b8">Se désabonner</a></div>
  </div>`;
}

async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false; // pas de clé -> on journalise « queued », rien n'est envoyé
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || 'noreply@csecur360.com', to, subject, html }),
  });
  return r.ok;
}

// GET ?resource=prospects → prospects actifs (désabonnés exclus) + compteurs.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const resource = new URL(req.url).searchParams.get('resource') || 'prospects';
  try {
    if (resource === 'prospects') {
      const [{ data: prospects }, { data: unsub }] = await Promise.all([
        supabaseAdmin.from('marketing_prospects').select('*').eq('tenant_id', TENANT).order('score', { ascending: false }),
        supabaseAdmin.from('marketing_unsubscribes').select('email').eq('tenant_id', TENANT),
      ]);
      const blocked = new Set((unsub || []).map((u: any) => String(u.email).toLowerCase()));
      const rows = (prospects || []).map((p: any) => ({ ...p, _blocked: blocked.has(String(p.email).toLowerCase()) || p.status !== 'active' }));
      return NextResponse.json({ ok: true, prospects: rows, unsubscribes: blocked.size });
    }
    if (resource === 'campaigns') {
      const { data } = await supabaseAdmin.from('marketing_campaigns').select('*').eq('tenant_id', TENANT).order('created_at', { ascending: false });
      return NextResponse.json({ ok: true, campaigns: data || [] });
    }
    if (resource === 'assets') {
      // Avatars + images + vidéos d'avatar + vidéos de fond + vidéos ASSEMBLÉES (compositions finales).
      const { data } = await supabaseAdmin.from('marketing_assets').select('id, kind, data, created_at').eq('tenant_id', TENANT).in('kind', ['avatar_model', 'library_image', 'avatar_video', 'bg_video', 'composition_video']).order('created_at', { ascending: false });
      const rows = data || [];
      const avatars = rows.filter((a: any) => a.kind === 'avatar_model');
      const library = rows.filter((a: any) => a.kind === 'library_image');
      const videos = rows.filter((a: any) => a.kind === 'avatar_video');
      const bgVideos = rows.filter((a: any) => a.kind === 'bg_video');
      const compositions = rows.filter((a: any) => a.kind === 'composition_video');
      return NextResponse.json({ ok: true, avatars, library, videos, bgVideos, compositions });
    }
    return NextResponse.json({ error: 'resource inconnue' }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const me = await getSessionUser(req);
  const who = me?.email || 'admin';
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = String(body.action || '');
  try {
    // Ajoute / met à jour un prospect avec son consentement (preuve LCAP).
    if (action === 'upsert-prospect') {
      const email = String(body.email || '').toLowerCase().trim();
      if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 });
      const ct = ['express', 'tacit', 'none'].includes(body.consent_type) ? body.consent_type : 'none';
      const consentAt = body.consent_at || new Date().toISOString();
      const expires = ct === 'tacit' ? new Date(new Date(consentAt).getTime() + 730 * 86400000).toISOString() : null;
      const row = {
        tenant_id: TENANT, email, company: body.company || null, segment: body.segment || null,
        consent_type: ct, consent_source: body.consent_source || null, consent_at: consentAt,
        consent_expires_at: expires, score: Number(body.score) || 0, status: 'active', updated_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from('marketing_prospects').upsert(row, { onConflict: 'tenant_id,email' });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    // Import des candidats issus de la RECHERCHE IA. Consentement TACITE (adresse d'affaires publiée),
    // avec l'URL source comme PREUVE, et expiration à 24 mois. Désabonnés exclus. Anti-doublon par email.
    if (action === 'import-candidates') {
      const cands = Array.isArray(body.candidates) ? body.candidates : [];
      const { data: unsub } = await supabaseAdmin.from('marketing_unsubscribes').select('email').eq('tenant_id', TENANT);
      const blocked = new Set((unsub || []).map((u: any) => String(u.email).toLowerCase()));
      const now = new Date();
      const rows = cands
        .map((c: any) => ({ email: String(c.email || '').toLowerCase().trim(), c }))
        .filter((x: any) => x.email && x.email.includes('@') && !blocked.has(x.email))
        .map((x: any) => ({
          tenant_id: TENANT, email: x.email, company: x.c.company || null, segment: x.c.sector || body.segment || null,
          consent_type: 'tacit', consent_source: x.c.source_url || x.c.website || 'recherche IA (adresse publiée)',
          consent_at: now.toISOString(), consent_expires_at: new Date(now.getTime() + 730 * 86400000).toISOString(),
          score: Number(x.c.score) || 50, status: 'active', enriched: { website: x.c.website, region: x.c.region, relevance: x.c.relevance, source_url: x.c.source_url }, updated_at: now.toISOString(),
        }));
      if (!rows.length) return NextResponse.json({ ok: true, imported: 0 });
      const { error } = await supabaseAdmin.from('marketing_prospects').upsert(rows, { onConflict: 'tenant_id,email' });
      if (error) throw error;
      return NextResponse.json({ ok: true, imported: rows.length });
    }

    // Enregistre un actif (pack studio, avatar, image de bibliothèque) dans marketing_assets.
    // Plusieurs avatars sont permis (chacun avec nom + voix par défaut).
    if (action === 'save-asset') {
      const { error } = await supabaseAdmin.from('marketing_assets').insert({
        tenant_id: TENANT, kind: body.kind || 'script', module: body.module || null,
        data: body.data || {}, status: 'draft', created_by: who,
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    // Met à jour les métadonnées d'un actif (ex. nom/voix d'un avatar) en fusionnant dans data.
    if (action === 'update-asset') {
      if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
      const { data: cur } = await supabaseAdmin.from('marketing_assets').select('data').eq('tenant_id', TENANT).eq('id', body.id).maybeSingle();
      const merged = { ...((cur as any)?.data || {}), ...(body.patch || {}) };
      const { error } = await supabaseAdmin.from('marketing_assets').update({ data: merged }).eq('tenant_id', TENANT).eq('id', body.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    if (action === 'delete-asset') {
      if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
      // Récupère l'actif pour supprimer aussi le FICHIER dans Storage (pas seulement la fiche).
      const { data: asset } = await supabaseAdmin.from('marketing_assets').select('data').eq('tenant_id', TENANT).eq('id', body.id).maybeSingle();
      const urls = [(asset as any)?.data?.stored_url, (asset as any)?.data?.url].filter(Boolean);
      const paths = urls.map((u: string) => { const m = String(u).match(/\/object\/public\/marketing\/(.+)$/); return m ? m[1] : null; }).filter(Boolean) as string[];
      if (paths.length) { try { await supabaseAdmin.storage.from('marketing').remove(paths); } catch { /* best-effort */ } }
      await supabaseAdmin.from('marketing_assets').delete().eq('tenant_id', TENANT).eq('id', body.id);
      return NextResponse.json({ ok: true });
    }

    // Désabonnement / plainte (registre + statut prospect). Obligation LCAP : honorer sous 10 j.
    if (action === 'unsubscribe') {
      const email = String(body.email || '').toLowerCase().trim();
      if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 });
      await supabaseAdmin.from('marketing_unsubscribes').upsert(
        { tenant_id: TENANT, email, reason: body.reason || 'unsubscribe', source: body.source || 'manuel' },
        { onConflict: 'tenant_id,email' });
      await supabaseAdmin.from('marketing_prospects').update({ status: 'unsubscribed', updated_at: new Date().toISOString() }).eq('tenant_id', TENANT).eq('email', email);
      return NextResponse.json({ ok: true });
    }
    // Programme une campagne : valide le verrou de conformité, fige un INSTANTANÉ DE CONSENTEMENT
    // par destinataire éligible (consentement valide, au-dessus du seuil, non désabonné).
    if (action === 'save-campaign') {
      const ack = body.compliance_ack || {};
      const allOk = ['c1', 'c2', 'c3', 'c4'].every(k => ack[k] === true);
      if (!allOk) return NextResponse.json({ error: 'Verrou de conformité : les 4 conditions doivent être confirmées.' }, { status: 422 });
      const minScore = Number(body.min_score) || 0;
      const { data: camp, error: ce } = await supabaseAdmin.from('marketing_campaigns').insert({
        tenant_id: TENANT, name: body.name || `${body.module || ''} · ${body.segment || ''}`.trim(),
        channel: 'email', module: body.module || null, segment: body.segment || null, angle: body.angle || null,
        sequence: body.sequence || [], content: body.content || {}, min_score: minScore,
        status: 'scheduled', compliance_ack: { ...ack, by: who, at: new Date().toISOString() },
        approved_by: who, approved_at: new Date().toISOString(), created_by: who,
      }).select('id').single();
      if (ce) throw ce;

      // Destinataires éligibles : consentement valide, non désabonné, score >= seuil.
      const [{ data: prospects }, { data: unsub }] = await Promise.all([
        supabaseAdmin.from('marketing_prospects').select('*').eq('tenant_id', TENANT).eq('status', 'active'),
        supabaseAdmin.from('marketing_unsubscribes').select('email').eq('tenant_id', TENANT),
      ]);
      const blocked = new Set((unsub || []).map((u: any) => String(u.email).toLowerCase()));
      const now = Date.now();
      const eligible = (prospects || []).filter((p: any) => {
        if (blocked.has(String(p.email).toLowerCase())) return false;
        if (Number(p.score) < minScore) return false;
        if (p.consent_type === 'express') return true;
        if (p.consent_type === 'tacit') return !p.consent_expires_at || new Date(p.consent_expires_at).getTime() > now;
        return false; // 'none' = pas de consentement -> jamais
      });
      // ENVOI RÉEL (étape J+0) : courriel IA + pied de page légal + lien de désabonnement, journalisé
      // avec l'instantané de consentement. A/B sur l'objet. Plafonné par requête (le reste = queued).
      const origin = new URL(req.url).origin;
      const content = body.content || {};
      const subjectA = content.subjectA || `${body.module || 'C-Secur360'}`;
      const subjectB = content.subjectB || subjectA;
      let sent = 0, queued = 0;
      for (let i = 0; i < eligible.length; i++) {
        const p = eligible[i];
        const subject = (i % 2 === 0) ? subjectA : subjectB;
        const base = {
          tenant_id: TENANT, campaign_id: (camp as any).id, prospect_id: p.id, email: p.email,
          consent_type: p.consent_type, consent_source: p.consent_source, consent_at: p.consent_at,
          step: 0, subject,
        };
        if (i < SEND_CAP) {
          let okSend = false;
          try { okSend = await sendViaResend(p.email, subject, buildEmailHtml(content.body, content.footer, origin, p.email)); } catch { okSend = false; }
          await supabaseAdmin.from('marketing_sends').insert({ ...base, status: okSend ? 'sent' : 'queued', sent_at: okSend ? new Date().toISOString() : null });
          if (okSend) sent++; else queued++;
        } else {
          await supabaseAdmin.from('marketing_sends').insert({ ...base, status: 'queued' });
          queued++;
        }
      }
      const hasKey = !!process.env.RESEND_API_KEY;
      return NextResponse.json({ ok: true, campaignId: (camp as any).id, recipients: eligible.length, sent, queued, mailConfigured: hasKey });
    }
    return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
