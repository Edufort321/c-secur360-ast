'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';
import { BackLink } from '@/components/BackLink';

// Guide / Mode d'emploi — description détaillée de l'ensemble des modules C-Secur360 et de leurs
// fonctionnalités. Page de référence (présentation, formation, support). Recherche + sections pliables.

type Mod = { key: string; icon: string; title: string; tagline: string; features: string[] };

const MODULES: Mod[] = [
  {
    key: 'rapports', icon: '📋', title: 'Rapports terrain', tagline: "Constructeur de rapports techniques assisté par IA, du terrain au PDF professionnel.",
    features: [
      "Gabarits réutilisables (inspection, essais, devis, générique) + gabarits personnalisés du tenant, avec numéro unique imprimé (GAB-XXX).",
      "Assemblage par blocs : zones (Bâtiment Nord/Sud…), sections (libellé→valeur), tableaux multi-colonnes, grilles d'inspection (conforme/anomalie/N-A + gravité), texte, photos, pages PDF.",
      "Import IA : PDF (OCR fidèle), document manuscrit, multi-photos — l'IA classe les données au bon type de bloc et respecte l'ordre/hiérarchie.",
      "Reconnaissance DANS un gabarit existant (standardisation) : l'IA remplit la structure exacte du gabarit.",
      "Assemblage mixte app + manuscrit : scannez des pages manuscrites, l'IA les replace au bon endroit (même section).",
      "Rapport vocal : dictez librement, l'IA structure la narration en sections.",
      "OCR plaque signalétique : photo → n° série / fabricant / tension / puissance en section.",
      "Détection IA de défauts : photo d'équipement → anomalies visibles (corrosion, fuite, fissure, surchauffe…) avec gravité.",
      "Anomalies & recommandations : annotations classables, indicateur « à chiffrer », dashboard consolidé (tous rapports), historique par équipement, marquer corrigé.",
      "Anomalies → soumission : sélectionnez les items à chiffrer, ouvre une soumission pré-remplie (1 item/anomalie) dans le module Projets.",
      "QR codes : un par rapport + un par équipement (identité stable) — le client colle l'étiquette, le scan ouvre la bonne section ; planche d'étiquettes imprimable.",
      "Interconnexion : lier un rapport à un Projet et à un événement du Planner ; le statut remonte au projet/facturation.",
      "Export PDF pro : page couverture, lettre de présentation éditable (pré-remplie), table des matières, en-tête/pied répétés, récap anomalies, mode condensé, pagination Lettre optimisée, nom du fichier = n° de dossier.",
      "Modes : « à compléter à la main » (valeurs en pâle), « mises à jour seulement » (addenda).",
      "Partage au vérificateur : lien tokenisé lecture/révision (commentaires) ou édition encadrée par des dates (sous-traitant externe) — sans compte.",
      "Temps réel : présence des collaborateurs, verrou souple par section, synchro de contenu en direct. Hors-ligne : modifications mises en file et synchronisées au retour en ligne.",
    ],
  },
  {
    key: 'projects', icon: '🏗️', title: 'Projets', tagline: "Le hub central : soumissions, projets, coûts et facturation.",
    features: [
      "Soumissions : catalogue de taux (main-d'œuvre bureau/chantier, voyagement, subsistance, hébergement, matériaux), items et lignes, calcul automatique, majoration, révisions.",
      "Calculateur de ressources (durée + couverture → personnel/véhicules/subsistances), numérotation automatique (préfixe site/département).",
      "Suivi des soumissions, approbation par niveau, commission au vendeur, transfert en projet à l'acceptation.",
      "Projets : numéro de projet, statut (soumission → vente → en cours → facturé), bons de commande, estimé, coûts réels (feuilles de temps), facturation.",
      "Interconnexions : AST liés, permis liés, rapports terrain liés (avec statut), matériel consommé (Inventaire).",
    ],
  },
  {
    key: 'planner', icon: '📅', title: 'Planificateur', tagline: "Calendrier des mandats + Gantt par projet, ressources et équipes.",
    features: [
      "Vue calendrier (mois) et grille des ressources (personnel / projets / équipements). Vue par défaut : grille sur poste, mois + « mes événements » sur mobile.",
      "Création d'événement/mandat : dates, lieu, priorité, succursale, personnel et équipements assignés, équipes, horaires par jour/individuels.",
      "Pré-remplir depuis une soumission : génère le Gantt à partir des items/lignes du projet (chaque item = tâche, chaque ligne MO = étape).",
      "Heures-homme → durée : la durée s'ajuste automatiquement au nombre de personnes (durée = heures-homme ÷ personnes), le Gantt suit la plage horaire.",
      "Modes d'ordonnancement : en suite (séquentiel), parallèle, ou personnalisé. Dépendances, chemin critique, baseline.",
      "Filtres « Mes tâches » et « À contrôler ». Temps réel (synchro Supabase).",
    ],
  },
  {
    key: 'ast', icon: '🦺', title: 'AST / Sécurité', tagline: "Analyses sécuritaires de tâches (JSA) conformes, avec QR public.",
    features: [
      "Formulaire AST complet : info générale, discussion d'équipe, isolation/cadenassage, dangers, mesures de contrôle, travailleurs, photos.",
      "Numéro AST unique automatique, conformité provinciale (CNESST, etc.).",
      "Création publique via QR (sans compte) pour signature terrain ; liste protégée (renseignements personnels) côté serveur.",
      "Liaison au projet (numéro de projet), export PDF.",
    ],
  },
  {
    key: 'permits', icon: '📄', title: 'Permis', tagline: "Permis de travail et d'espace clos.",
    features: [
      "Permis de travail (work permits) et permis d'espace clos (confined space).",
      "Liaison au projet (n° de projet), statut, suivi.",
      "Export et historique.",
    ],
  },
  {
    key: 'accidents', icon: '⚠️', title: 'Accidents et incidents', tagline: "Déclaration d'accidents/quasi-accidents + compteurs de jours sans incident.",
    features: [
      "Déclaration structurée (type, province, données, photos), statut (brouillon/soumis).",
      "Compteurs de jours sans accident / sans quasi-accident, record battu.",
      "Lecture/écriture sécurisées par routes serveur (scope tenant). Alimente le panneau d'anomalies du tableau de bord.",
    ],
  },
  {
    key: 'dga', icon: '🧪', title: 'Diagnostic DGA', tagline: "Analyse des gaz dissous (transformateurs) : laboratoire → diagnostic.",
    features: [
      "Dossiers transformateurs (identité, série, kV, MVA, type d'huile, OLTC).",
      "Mesures : gaz (H2, CH4, C2H2, C2H4…), TDCG, condition IEEE, zone Duval, défaut, qualité d'huile, furanes, BPC.",
      "Diagnostic IA, recommandations, prochaine date, tendances graphiques.",
      "Rapport PDF laboratoire complet, QR de fiche en lecture seule, photos/anomalies/inspections.",
      "Insérable dans un rapport terrain (résumé embarqué).",
    ],
  },
  {
    key: 'inventory', icon: '📦', title: 'Inventaire', tagline: "Gestion des articles, étiquettes QR et mouvements.",
    features: [
      "Catalogue d'articles, succursales/départements, quantités, seuils.",
      "Étiquettes QR par article (modèles), scan pour entrée/sortie depuis la fiche publique.",
      "Mouvements entrée/sortie, consommation liée aux projets.",
    ],
  },
  {
    key: 'timesheets', icon: '⏱️', title: 'Feuille de temps', tagline: "Saisie des heures par employé et par projet.",
    features: [
      "Saisie des heures (régulières, supplémentaires) par jour, par projet/mandat.",
      "Agrégation des coûts réels remontée dans les Projets (coûts vs estimé).",
      "Lien avec la paie et le planificateur.",
    ],
  },
  {
    key: 'logbook', icon: '🚚', title: 'Logbook véhicules', tagline: "Registre des véhicules (km, inspections, entretien).",
    features: [
      "Suivi des véhicules : kilométrage, inspections de ronde, entretien.",
      "Historique par véhicule, alertes d'entretien.",
    ],
  },
  {
    key: 'todo', icon: '✅', title: 'To-Do / Tâches', tagline: "Tâches et suivis personnels/équipe.",
    features: [
      "Création de tâches, échéances, assignation, statut.",
      "Suivi des actions à faire (relances, correctifs).",
    ],
  },
  {
    key: 'conges', icon: '🌴', title: 'Congés', tagline: "Demandes et suivi des absences.",
    features: [
      "Demandes de congé (vacances, maladie…), approbation, calendrier des absences.",
      "Intégration avec le planificateur (disponibilité du personnel).",
    ],
  },
  {
    key: 'admin', icon: '⚙️', title: 'Administration', tagline: "Paramètres du tenant, RH, finances, sécurité.",
    features: [
      "Réglages de l'entreprise (raison sociale, adresse, taxes TPS/TVQ, préfixe de facture, coordonnées de paiement, logo).",
      "Sites/succursales et départements (cascade), personnel, postes, taux, grilles salariales.",
      "RH : dossiers, documents, certifications, accueil (onboarding) — accès protégé (routes serveur).",
      "Conformité Loi 25 / RGPD : droits libre-service, minimisation IA, purge, politique de confidentialité.",
      "Activation/désactivation des modules par tenant (entitlements), deux niveaux d'admin (super-admin / admin tenant).",
    ],
  },
];

const CROSS = [
  "🔒 Sécurité multi-tenant : isolation stricte par tenant, lectures sensibles via routes serveur (jamais en anon), anti-IDOR.",
  "🤖 IA encadrée : clé serveur (jamais dans le navigateur), budget IA par tenant, anti-injection, rate-limit.",
  "📱 PWA installable (icône navy), responsive mobile, mode jour/nuit, FR/EN suivant le header.",
  "🔗 Interconnexion : Soumission → Projet → Planner → Facturation → Rapports, avec QR et liens partagés.",
  "📊 Tableau de bord : compteurs par module, anomalies, conformité.",
];

export default function GuidePage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({ rapports: true });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MODULES;
    return MODULES.filter(m => (m.title + ' ' + m.tagline + ' ' + m.features.join(' ')).toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} subtitle="Guide / Mode d'emploi" />
      <div className="px-4 pt-3"><BackLink fallback={`/${tenant}/modules`} /></div>
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-2">
        <h1 className="font-black text-3xl" style={{ fontFamily: 'Archivo, sans-serif' }}>Guide des modules</h1>
        <p className="mt-1 text-sm text-gray-500">Description détaillée et mode d'emploi de l'ensemble des fonctionnalités de la plateforme C-Secur360.</p>

        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher une fonctionnalité, un module…"
          className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" />

        {/* Atouts transversaux */}
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/20">
          <div className="font-bold text-sm">✨ Atouts transversaux</div>
          <ul className="mt-2 space-y-1 text-sm">{CROSS.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map(m => {
            const isOpen = q.trim() ? true : !!open[m.key];
            return (
              <div key={m.key} className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button onClick={() => setOpen(o => ({ ...o, [m.key]: !o[m.key] }))}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <span>
                      <span className="block font-extrabold" style={{ fontFamily: 'Archivo, sans-serif' }}>{m.title}</span>
                      <span className="block text-xs text-gray-500">{m.tagline}</span>
                    </span>
                  </span>
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <ul className="space-y-1.5 px-5 pb-4 text-sm leading-relaxed">
                    {m.features.map((f, i) => (
                      <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#277da1]" />{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-10 text-center text-gray-400">Aucun résultat.</div>}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">© {new Date().getFullYear()} Commerce CERDIA inc. — C-Secur360</p>
      </div>
    </div>
  );
}
