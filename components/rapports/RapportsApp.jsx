"use client";
// __rpt_storage_shim : data layer base sur localStorage (la version HTML avait window.storage).
if (typeof window !== "undefined" && !window.storage) { window.storage = { get: async (k)=>{ try{ const v=localStorage.getItem(k); return v==null?null:{value:v}; }catch{ return null; } }, set: async (k,v)=>{ try{ localStorage.setItem(k,v); }catch{} }, delete: async (k)=>{ try{ localStorage.removeItem(k); }catch{} } }; }
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
//  RAPPORTS TERRAIN — Générateur de documents à gabarit (tenant)
//  Prototype HTML autonome. Dépose un document -> l'IA extrait
//  et propose un gabarit -> édition mixte (sections + texte libre
//  + zones photo) -> historique réutilisable.
// ============================================================

// ---------- LANGUE / I18N ----------
let LANG = "fr";
const I18N = {
  fr: {
    appName:"Rapports Terrain", tagline:"Générateur de documents à gabarit",
    backAll:"← Tous les rapports", newReport:"Nouveau rapport", importDoc:"📄 Importer un document",
    settings:"Réglages", search:"Rechercher (titre, client, type)…",
    filterAll:"Tous", stInProgress:"En cours", stReview:"En révision", stApproved:"Approuvé", stSent:"Envoyé",
    templates:"Gabarits", chooseTemplate:"Choisir un gabarit", templateSuggested:"Gabarit proposé",
    create:"Créer", cancel:"Annuler", save:"Enregistrer", saved:"Enregistré ✓",
    del:"Supprimer", duplicate:"Dupliquer", newVersion:"Nouvelle version", export:"Exporter PDF",
    title:"Titre", client:"Client", location:"Lieu", projectNo:"N° de projet", date:"Date",
    addSection:"+ Section", addText:"+ Texte libre", addPhotos:"+ Zone photo", addField:"+ Champ",
    sectionTitle:"Titre de section", fieldLabel:"Libellé", fieldValue:"Valeur",
    freeText:"Texte libre…", photoZone:"Zone photo", addPhoto:"+ Photo", noPhoto:"Aucune photo",
    delPhoto:"Supprimer cette photo?", photoCaption:"Légende…",
    photoLayout:"Disposition", layout1:"1 colonne", layout2:"2 côte à côte", layout4:"Grille 2×2", noPhotoSlot:"Aucune zone. Ajoute des zones photo ci-dessous.", photoAddHere:"Ajouter une photo", photoAddSlot:"+ 1 zone", photoAdd2:"+ 2 zones", photoReplace:"Remplacer",
    importing:"Lecture du document…", importErr:"Échec de l'import :", importNoKey:"Ajoute une clé API dans Réglages.", importBatch:"Traitement des pages",
    importSnap:"Capture des pages", importOriginalPages:"Pages originales (copie du PDF)",
    importReview:"Vérifie et choisis le gabarit", extractedContent:"Contenu extrait",
    applyImport:"Créer le rapport", noReports:"Aucun rapport. Importe un document ou crée-en un.",
    status:"Statut", lastEdit:"Modifié", version:"v", createdFrom:"Créé à partir de",
    apiKeyTitle:"Clé API Anthropic", apiKeyHint:"Pour démo. Clé en stockage local = lisible sur ce poste. En prod : serveur.",
    storeMem:"Mémoire seule", storeLocal:"Stocker sur ce poste", testConn:"Tester", deleteKey:"Supprimer la clé",
    keyActive:"Clé active", keyNone:"Aucune clé", confirmDel:"Supprimer ce rapport définitivement?",
    moveUp:"Monter", moveDown:"Descendre", removeBlock:"Retirer ce bloc", blockType:"Type de bloc", blockActions:"Actions", insertHere:"Insérer ici", addBlockBtn:"Ajouter un bloc",
    tplInspection:"Rapport d'inspection", tplTesting:"Rapport d'essais", tplQuote:"Soumission / Devis", tplGeneric:"Rapport générique",
    truncWarn:"⚠ Document long : l'extraction a pu être coupée à la fin. Vérifie les derniers blocs et complète au besoin.",
    tabReports:"Rapports", tabTemplates:"Modèles / Gabarits",
    tplManage:"Gestion des gabarits", tplNew:"+ Nouveau gabarit", tplName:"Nom du gabarit", tplEdit:"Modifier", tplDefault:"(par défaut)",
    insertPage:"Insérer une page gabarit", insertWhere:"Insérer après le bloc n°", insertConfirm:"Insérer ici", insertPos:"Position",
    annotations:"Anomalies & commentaires", addAnomaly:"+ Anomalie", addComment:"+ Commentaire",
    anomaly:"Anomalie", comment:"Commentaire", severity:"Gravité", equipment:"Équipement concerné",
    sevMinor:"Mineur", sevMajor:"Majeur", sevCritical:"Critique",
    annTitle:"Titre", annDesc:"Description", annPhoto:"Photo", noAnnotations:"Aucune anomalie ni commentaire.",
    genReport:"Générer le récap", recapAnomalies:"SOMMAIRE DES ANOMALIES", recapComments:"SOMMAIRE DES COMMENTAIRES",
    fixReport:"✨ Corriger le rapport", fixing:"Correction en cours…", fixDone:"Rapport corrigé ✓",
    translateReport:"🌐 Traduire le rapport", translateDone:"Rapport traduit ✓",
    fixNoKey:"Ajoute une clé API dans Réglages pour la correction IA.",
    annotateBlock:"💬 Annoter", delAnnotation:"Supprimer cette annotation?",
    savedTag:"Enregistré ✓", dupBlock:"Dupliquer ce bloc", dragHint:"Glisser pour réordonner",
    treeAll:"Tous les rapports", treeOrder:"Classement", treeEmpty:"(vide)", noClient:"Sans client", noLocation:"Sans lieu", noYear:"Sans année", noJob:"Sans n° projet",
    navTitle:"Navigation", navBlocks:"sections",
    navAll:"Tout", navNone:"Aucun élément de ce type", navTypeSection:"Section", navTypeTable:"Tableau", navTypeInspect:"Inspection", navTypePhotos:"Photos", navTypePdf:"Page PDF", navTypeText:"Texte",
    lvlYear:"Année", lvlClient:"Client", lvlLocation:"Endroit", lvlJob:"N° de projet",
    cover:"Page couverture", coverShow:"Inclure une page couverture", coverSubtitle:"Sous-titre / note", coverEdit:"Personnaliser la couverture",
    coverCustomize:"Personnaliser la couverture", coverKickerLbl:"Surtitre (ex: INSPECTION)", coverTitleOverride:"Titre (remplace le titre du rapport)", coverPreparedBy:"Préparé par", coverBg:"Image de fond / bannière", coverBgAdd:"Ajouter une image", coverBgChange:"Changer l'image", coverBgRemove:"Retirer", coverBgHint:"L'image est atténuée pour garder le texte lisible.",
    tocShow:"Table des matières", tocTitle:"Table des matières", layoutOptions:"Mise en page du rapport", anomRecapShow:"Sommaire des anomalies",
    addPdfPage:"+ Page PDF externe", pdfPageZone:"Page PDF importée", importingPdf:"Conversion du PDF en images…", pdfPages:"page(s)",
    addTable:"+ Tableau", tableTitle:"Titre du tableau", addRow:"+ Ligne", addCol:"+ Colonne", delRow:"Supprimer la ligne", delCol:"Supprimer la colonne",
    addInspect:"+ Grille d'inspection", inspectTitle:"Inspection visuelle", inspectPoint:"Point d'inspection", inspectAddPoint:"+ Point", inspectNote:"Description de l'anomalie",
    addEquip:"+ Équipement", dupEquip:"Dupliquer tout l'équipement (section + inspection + photos)", copyTag:"(copie)", equipNew:"Nouvel équipement", equipFab:"Fabricant", equipModel:"Modèle", equipSerial:"N° de série", equipLoc:"Emplacement",
    inspLoadList:"Charger une liste", inspLoadHint:"Remplace les points actuels :", inspReplaceConfirm:"Remplacer les points actuels de cette grille ?",
    convertInspect:"Convertir en grille d'inspection (états Bon/Anomalie/N-V)", convertEmpty:"Ajoute d'abord des libellés aux champs.",
    convertSection:"Reconvertir en section (annuler)", inspPhoto:"Photo",
    libTransfo:"Transformateur", libBreaker:"Disjoncteur", libContactor:"Contacteur", libGeneral:"Général",
    inspGood:"Bon", inspNormal:"Normal", inspAnomaly:"Anomalie", inspNA:"N/V",
    anomRecapTitle:"Sommaire des anomalies", anomLoc:"Emplacement", anomPoint:"Point", anomSeverity:"Gravité", anomDesc:"Description", anomBanner:"anomalie(s) relevée(s)",
    cellClear:"Vider la cellule", cellSplit:"Diviser (nouvelle ligne)", cellMerge:"Fusionner avec la droite", cellActions:"Actions cellule",
    tplDefaults:"Gabarits par défaut", tplCustom:"Mes gabarits", tplImportPdf:"📄 Importer un PDF comme gabarit", tplImporting:"Création du gabarit…",
    tplSaveName:"Nom du gabarit", tplUse:"Utiliser", tplDelete:"Supprimer ce gabarit?", tplNoCustom:"Aucun gabarit personnalisé. Importe un PDF pour en créer un.",
    handwriting:"✍ Brouillon manuscrit", handwritingImport:"✍ Importer un brouillon manuscrit (photo)", handwritingBusy:"Lecture de l'écriture…",
    uncertainBadge:"à vérifier", uncertainNote:"⚠ Les valeurs marquées « à vérifier » ont été lues sur l'écriture manuscrite et peuvent contenir des erreurs. Vérifie-les avant de finaliser.",
    themeTitle2:"Couleurs de mise en page", themeReset:"Réinitialiser", themeHint:"S'applique à l'app et aux rapports PDF (charte globale).",
    themeSecBar:"Bandeaux de section", themeTableHd:"En-têtes de tableau", themeAccent:"Accent (boutons)", themeTitle:"Titres", themeText:"Texte", themeBorder:"Bordures",
    compareView:"🔍 Comparer à la source", compareTitle:"Comparaison source vs extrait", compareSource:"Document source (texte)", compareExtract:"Contenu extrait", compareHint:"Vérifie qu'aucune donnée ne manque. Ce qui est dans la source mais absent de l'extrait doit être ajouté manuellement.", compareNoSource:"Texte source non disponible (réimporte le PDF pour comparer).",
  },
  en: {
    appName:"Field Reports", tagline:"Template-based document generator",
    backAll:"← All reports", newReport:"New report", importDoc:"📄 Import a document",
    settings:"Settings", search:"Search (title, client, type)…",
    filterAll:"All", stInProgress:"In progress", stReview:"In review", stApproved:"Approved", stSent:"Sent",
    templates:"Templates", chooseTemplate:"Choose a template", templateSuggested:"Suggested template",
    create:"Create", cancel:"Cancel", save:"Save", saved:"Saved ✓",
    del:"Delete", duplicate:"Duplicate", newVersion:"New version", export:"Export PDF",
    title:"Title", client:"Client", location:"Location", projectNo:"Project No.", date:"Date",
    addSection:"+ Section", addText:"+ Free text", addPhotos:"+ Photo zone", addField:"+ Field",
    sectionTitle:"Section title", fieldLabel:"Label", fieldValue:"Value",
    freeText:"Free text…", photoZone:"Photo zone", addPhoto:"+ Photo", noPhoto:"No photo",
    delPhoto:"Delete this photo?", photoCaption:"Caption…",
    photoLayout:"Layout", layout1:"1 column", layout2:"2 side by side", layout4:"Grid 2×2", noPhotoSlot:"No zone. Add photo zones below.", photoAddHere:"Add a photo", photoAddSlot:"+ 1 zone", photoAdd2:"+ 2 zones", photoReplace:"Replace",
    importing:"Reading document…", importErr:"Import failed:", importNoKey:"Add an API key in Settings.", importBatch:"Processing pages",
    importSnap:"Capturing pages", importOriginalPages:"Original pages (PDF copy)",
    importReview:"Review and choose template", extractedContent:"Extracted content",
    applyImport:"Create report", noReports:"No reports. Import a document or create one.",
    status:"Status", lastEdit:"Edited", version:"v", createdFrom:"Created from",
    apiKeyTitle:"Anthropic API key", apiKeyHint:"Demo only. Local-stored key is readable on this machine. In prod: server.",
    storeMem:"Memory only", storeLocal:"Store on this machine", testConn:"Test", deleteKey:"Delete key",
    keyActive:"Key active", keyNone:"No key", confirmDel:"Delete this report permanently?",
    moveUp:"Up", moveDown:"Down", removeBlock:"Remove block", blockType:"Block type", blockActions:"Actions", insertHere:"Insert here", addBlockBtn:"Add a block",
    tplInspection:"Inspection report", tplTesting:"Testing report", tplQuote:"Quote / Proposal", tplGeneric:"Generic report",
    truncWarn:"⚠ Long document: extraction may have been cut off at the end. Check the last blocks and complete as needed.",
    tabReports:"Reports", tabTemplates:"Templates",
    tplManage:"Template management", tplNew:"+ New template", tplName:"Template name", tplEdit:"Edit", tplDefault:"(default)",
    insertPage:"Insert template page", insertWhere:"Insert after block #", insertConfirm:"Insert here", insertPos:"Position",
    annotations:"Anomalies & comments", addAnomaly:"+ Anomaly", addComment:"+ Comment",
    anomaly:"Anomaly", comment:"Comment", severity:"Severity", equipment:"Related equipment",
    sevMinor:"Minor", sevMajor:"Major", sevCritical:"Critical",
    annTitle:"Title", annDesc:"Description", annPhoto:"Photo", noAnnotations:"No anomaly or comment.",
    genReport:"Generate summary", recapAnomalies:"ANOMALY SUMMARY", recapComments:"COMMENT SUMMARY",
    fixReport:"✨ Fix report", fixing:"Fixing…", fixDone:"Report fixed ✓",
    translateReport:"🌐 Translate report", translateDone:"Report translated ✓",
    fixNoKey:"Add an API key in Settings for AI correction.",
    annotateBlock:"💬 Annotate", delAnnotation:"Delete this annotation?",
    savedTag:"Saved ✓", dupBlock:"Duplicate this block", dragHint:"Drag to reorder",
    treeAll:"All reports", treeOrder:"Grouping", treeEmpty:"(empty)", noClient:"No client", noLocation:"No location", noYear:"No year", noJob:"No project no.",
    navTitle:"Navigation", navBlocks:"sections",
    navAll:"All", navNone:"No item of this type", navTypeSection:"Section", navTypeTable:"Table", navTypeInspect:"Inspection", navTypePhotos:"Photos", navTypePdf:"PDF page", navTypeText:"Text",
    lvlYear:"Year", lvlClient:"Client", lvlLocation:"Location", lvlJob:"Project No.",
    cover:"Cover page", coverShow:"Include a cover page", coverSubtitle:"Subtitle / note", coverEdit:"Customize cover",
    coverCustomize:"Customize cover", coverKickerLbl:"Kicker (e.g. INSPECTION)", coverTitleOverride:"Title (overrides report title)", coverPreparedBy:"Prepared by", coverBg:"Background image / banner", coverBgAdd:"Add an image", coverBgChange:"Change image", coverBgRemove:"Remove", coverBgHint:"The image is dimmed to keep text readable.",
    tocShow:"Table of contents", tocTitle:"Table of contents", layoutOptions:"Report layout", anomRecapShow:"Anomaly summary",
    addPdfPage:"+ External PDF page", pdfPageZone:"Imported PDF page", importingPdf:"Converting PDF to images…", pdfPages:"page(s)",
    addTable:"+ Table", tableTitle:"Table title", addRow:"+ Row", addCol:"+ Column", delRow:"Delete row", delCol:"Delete column",
    addInspect:"+ Inspection grid", inspectTitle:"Visual inspection", inspectPoint:"Inspection point", inspectAddPoint:"+ Point", inspectNote:"Anomaly description",
    addEquip:"+ Equipment", dupEquip:"Duplicate whole equipment (section + inspection + photos)", copyTag:"(copy)", equipNew:"New equipment", equipFab:"Manufacturer", equipModel:"Model", equipSerial:"Serial no.", equipLoc:"Location",
    inspLoadList:"Load a list", inspLoadHint:"Replaces current points:", inspReplaceConfirm:"Replace the current points of this grid?",
    convertInspect:"Convert to inspection grid (Good/Anomaly/N-V states)", convertEmpty:"Add labels to the fields first.",
    convertSection:"Convert back to section (undo)", inspPhoto:"Photo",
    libTransfo:"Transformer", libBreaker:"Breaker", libContactor:"Contactor", libGeneral:"General",
    inspGood:"Good", inspNormal:"Normal", inspAnomaly:"Anomaly", inspNA:"N/V",
    anomRecapTitle:"Anomaly summary", anomLoc:"Location", anomPoint:"Point", anomSeverity:"Severity", anomDesc:"Description", anomBanner:"anomaly(ies) found",
    cellClear:"Clear cell", cellSplit:"Split (new row)", cellMerge:"Merge with right", cellActions:"Cell actions",
    tplDefaults:"Default templates", tplCustom:"My templates", tplImportPdf:"📄 Import a PDF as template", tplImporting:"Creating template…",
    tplSaveName:"Template name", tplUse:"Use", tplDelete:"Delete this template?", tplNoCustom:"No custom template. Import a PDF to create one.",
    handwriting:"✍ Handwritten draft", handwritingImport:"✍ Import a handwritten draft (photo)", handwritingBusy:"Reading handwriting…",
    uncertainBadge:"to verify", uncertainNote:"⚠ Values marked \"to verify\" were read from handwriting and may contain errors. Check them before finalizing.",
    themeTitle2:"Layout colors", themeReset:"Reset", themeHint:"Applies to the app and PDF reports (global brand).",
    themeSecBar:"Section bars", themeTableHd:"Table headers", themeAccent:"Accent (buttons)", themeTitle:"Titles", themeText:"Text", themeBorder:"Borders",
    compareView:"🔍 Compare to source", compareTitle:"Source vs extract comparison", compareSource:"Source document (text)", compareExtract:"Extracted content", compareHint:"Check that no data is missing. Anything in the source but absent from the extract must be added manually.", compareNoSource:"Source text not available (re-import the PDF to compare).",
  },
};
function t(k){ return (I18N[LANG] && I18N[LANG][k]) || (I18N.fr[k]) || k; }

// ---------- GABARITS (templates tenant) ----------
// Chaque gabarit = ensemble de blocs par défaut. blocs : section | text | photos
function tplBlocks(id){
  const sec=(title,fields)=>({type:"section", id:bid(), title, fields:fields.map(f=>({id:bid(),label:f,value:""}))});
  const txt=(ph)=>({type:"text", id:bid(), value:"", placeholder:ph});
  const ph=(title)=>({type:"photos", id:bid(), title, photos:[]});
  if(id==="inspection") return [
    sec(LANG==="en"?"Equipment":"Équipement", LANG==="en"?["Name","Serial No.","Voltage","Manufacturer","Year"]:["Nom","N° de série","Tension","Fabricant","Année"]),
    txt(LANG==="en"?"Visual inspection observations…":"Observations de l'inspection visuelle…"),
    ph(LANG==="en"?"Field photos":"Photos terrain"),
    sec(LANG==="en"?"Measurements":"Mesures", LANG==="en"?["Insulation resistance","Contact resistance","Notes"]:["Résistance d'isolement","Résistance de contact","Notes"]),
    txt(LANG==="en"?"Conclusion and recommendations…":"Conclusion et recommandations…"),
  ];
  if(id==="testing") return [
    sec(LANG==="en"?"Equipment under test":"Équipement testé", LANG==="en"?["Designation","Type","Rating"]:["Désignation","Type","Calibre"]),
    sec(LANG==="en"?"Test conditions":"Conditions d'essai", LANG==="en"?["Temperature","Humidity","Instrument"]:["Température","Humidité","Instrument"]),
    txt(LANG==="en"?"Test results…":"Résultats des essais…"),
    ph(LANG==="en"?"Test setup photos":"Photos du montage"),
    txt(LANG==="en"?"Verdict…":"Verdict…"),
  ];
  if(id==="quote") return [
    sec(LANG==="en"?"Mandate":"Mandat", LANG==="en"?["Client","Site","Scope"]:["Client","Site","Portée"]),
    txt(LANG==="en"?"Work description…":"Description des travaux…"),
    sec(LANG==="en"?"Pricing":"Prix", LANG==="en"?["Lump sum","Hourly rate","Validity"]:["Forfaitaire","Taux horaire","Validité"]),
    txt(LANG==="en"?"Terms and conditions…":"Conditions et modalités…"),
  ];
  // generic
  return [
    sec(LANG==="en"?"General information":"Informations générales", LANG==="en"?["Subject","Reference"]:["Objet","Référence"]),
    txt(LANG==="en"?"Content…":"Contenu…"),
    ph(LANG==="en"?"Photos":"Photos"),
  ];
}
const TEMPLATES = [
  { id:"inspection", key:"tplInspection", num:"GAB-INS-01" },
  { id:"testing",    key:"tplTesting",    num:"GAB-TST-01" },
  { id:"quote",      key:"tplQuote",      num:"GAB-DEV-01" },
  { id:"generic",    key:"tplGeneric",    num:"GAB-GEN-01" },
];
// Numéro UNIQUE d'un gabarit (défaut ou custom) — sert d'identifiant imprimé en bas de page
// ET de clé de reconnaissance IA (remplir la même structure si le gabarit est rempli à la main).
function tplNumOf(tplId, customTpls){
  const c=(customTpls||[]).find(x=>x.id===tplId); if(c) return c.num || ("GAB-"+String(c.id).replace(/[^A-Za-z0-9]/g,"").slice(-6).toUpperCase());
  const d=TEMPLATES.find(x=>x.id===tplId); return d?d.num:"";
}

// ---------- IDs ----------
let _seq=0;
function bid(){ _seq++; return "b_"+Date.now().toString(36)+"_"+_seq; }
// Identité d'ÉQUIPEMENT stable (cible des QR de section). Contrairement à l'id de bloc, l'eqId
// persiste à travers les éditions ; une étiquette QR collée sur un équipement reste donc valide.
function eqid(){ _seq++; return "eq_"+Date.now().toString(36)+"_"+_seq; }
// Présence temps réel : couleur stable par utilisateur + petit hash.
const PRESENCE_COLORS=["#2a6f97","#9d0208","#2a9d8f","#6b4e9d","#e0a96d","#0e7490","#b45309","#4f46e5"];
function hashInt(s){ let h=0; const str=String(s||""); for(let i=0;i<str.length;i++){ h=(h*31+str.charCodeAt(i))>>>0; } return h; }
function initials(name){ const p=String(name||"").trim().split(/\s+/); return ((p[0]?.[0]||"")+(p[1]?.[0]||"")).toUpperCase()||"?"; }
// Parseur JSON TOLÉRANT pour les réponses IA potentiellement TRONQUÉES (max_tokens) : on tente
// JSON.parse ; en cas d'échec on répare (retire les virgules traînantes, ferme les chaînes et les
// crochets/accolades laissés ouverts, retire une clé pendante) puis on réessaie.
function repairJsonParse(raw){
  let s=String(raw||"").replace(/```json|```/g,"").trim();
  const i=s.indexOf("{"); if(i>0) s=s.slice(i);
  try{ return JSON.parse(s); }catch{}
  // 1) virgules traînantes
  try{ return JSON.parse(s.replace(/,\s*([}\]])/g,"$1")); }catch{}
  // 2) reconstruction depuis une coupure : on rejoue en suivant chaînes et profondeur
  let out=""; let inStr=false; let esc=false; const stack=[];
  for(let k=0;k<s.length;k++){ const c=s[k]; out+=c;
    if(inStr){ if(esc) esc=false; else if(c==="\\") esc=true; else if(c==='"') inStr=false; continue; }
    if(c==='"'){ inStr=true; continue; }
    if(c==="{"||c==="[") stack.push(c==="{"?"}":"]");
    else if(c==="}"||c==="]") stack.pop();
  }
  if(inStr) out+='"';                                  // chaîne coupée -> on la ferme
  out=out.replace(/[\s,]+$/,"");                        // espaces / virgule finale
  out=out.replace(/,?\s*"[^"]*"\s*:\s*$/,"");           // clé pendante « "k": » sans valeur -> retire
  out=out.replace(/[\s,]+$/,"");
  // Dans un OBJET, une chaîne seule sans « : » = clé incomplète -> retire (vs élément de tableau).
  if(stack[stack.length-1]==="}") out=out.replace(/,?\s*"[^"]*"\s*$/,"");
  out=out.replace(/[\s,]+$/,"");
  while(stack.length){ out+=stack.pop(); }             // ferme accolades/crochets ouverts
  out=out.replace(/,\s*([}\]])/g,"$1");
  return JSON.parse(out);                               // si ça échoue encore -> erreur remontée
}
// Clone profond d'un bloc avec de nouveaux ids partout (pour duplication sûre)
function cloneBlockFresh(src){
  const copy=JSON.parse(JSON.stringify(src)); copy.id=bid();
  if(copy.type==="section") copy.eqId=eqid(); // une copie = un AUTRE équipement -> nouvelle identité QR
  if(copy.fields) copy.fields=copy.fields.map(f=>({...f,id:bid()}));
  if(copy.photos) copy.photos=copy.photos.map(p=>({...p,id:bid()}));
  if(copy.items) copy.items=copy.items.map(it=>({...it,id:bid()}));
  return copy;
}

// ---------- STOCKAGE ----------
const DB_KEY = "rpt_reports_v1";
const LOGO_KEY = "rpt_logo_v1";
const LANG_KEY = "rpt_lang_v1";
const TPL_KEY = "rpt_templates_v1";
const HIDDEN_TPL_KEY = "rpt_hidden_tpls_v1";
const THEME_KEY = "rpt_theme_v1";
let HIDDEN_TPLS = [];
function visTpls(){ return TEMPLATES.filter(t=>!HIDDEN_TPLS.includes(t.id)); }
async function loadHidden(){ try{ const r=await window.storage.get(HIDDEN_TPL_KEY); return r?JSON.parse(r.value):[]; }catch{ return []; } }
async function saveHidden(list){ try{ await window.storage.set(HIDDEN_TPL_KEY, JSON.stringify(list)); }catch{} }
const DEFAULT_THEME = {
  secBar:  "#1e293b",  // bandeaux de section
  tableHd: "#34495e",  // en-têtes de tableau
  accent:  "#9d0208",  // accent (lignes, IPS)
  title:   "#0f172a",  // titres
  text:    "#0f172a",  // texte courant
  border:  "#e2e8f0",  // bordures
};
let THEME = {...DEFAULT_THEME};
async function loadTheme(){ try{ const r=await window.storage.get(THEME_KEY); return r?{...DEFAULT_THEME,...JSON.parse(r.value)}:{...DEFAULT_THEME}; }catch{ return {...DEFAULT_THEME}; } }
async function saveTheme(th){ try{ await window.storage.set(THEME_KEY, JSON.stringify(th)); }catch(e){ console.error(e); } }
// Persistance SERVEUR (Supabase via /api/rapports/data) + cache localStorage pour le hors-ligne.
async function loadDB(){
  try{ const r=await fetch("/api/rapports/data?kind=reports",{credentials:"include"}); if(r.ok){ const j=await r.json(); const items=(j.items||[]).map(x=>({ ...(x.data||{}), id:x.id, status:x.status||x.data?.status||"in_progress" })); try{ await window.storage.set(DB_KEY, JSON.stringify(items)); }catch{} return items; } }catch{}
  try{ const c=await window.storage.get(DB_KEY); return c?JSON.parse(c.value):[]; }catch{ return []; } // repli hors-ligne
}
async function saveDB(list){ try{ await window.storage.set(DB_KEY, JSON.stringify(list)); }catch{} } // cache local (write-through)

// ---------- FILE DE SYNCHRONISATION HORS-LIGNE ----------
// Toute écriture serveur qui échoue (hors-ligne / erreur réseau) est mise en file dans localStorage
// et rejouée automatiquement à la reconnexion (événement `online`) — aucune modif n'est perdue.
const PENDING_KEY = "rpt_pending_v1";
function loadPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY)||"[]"); }catch{ return []; } }
function savePending(q){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(q.slice(-200))); }catch{} }
function queueOp(op){
  // Déduplique : un upsert du même rapport remplace le précédent en attente.
  const q=loadPending().filter(o=>!(o.kind===op.kind && o.action===op.action && o.id===op.id));
  q.push(op); savePending(q);
}
let _flushing=false;
async function flushPending(){
  if(_flushing) return; _flushing=true;
  let q=loadPending();
  const keep=[];
  for(const op of q){
    try{
      let res;
      if(op.action==="upsert") res=await fetch("/api/rapports/data",{ method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ kind:op.kind, item:op.item }) });
      else res=await fetch(`/api/rapports/data?kind=${op.kind}&id=${encodeURIComponent(op.id)}`,{ method:"DELETE", credentials:"include" });
      if(!res.ok && res.status!==401) keep.push(op); // 401 = session expirée : on n'empile pas indéfiniment
    }catch{ keep.push(op); } // toujours hors-ligne : on garde
  }
  savePending(keep); _flushing=false;
  return keep.length;
}
function pendingCount(){ return loadPending().length; }
if(typeof window!=="undefined"){ window.addEventListener("online", ()=>{ flushPending(); }); }

// Push serveur d'UN rapport (debounce par id, car l'édition déclenche à chaque frappe).
const _rapTimers={};
function pushReport(report){ if(!report?.id) return; clearTimeout(_rapTimers[report.id]); _rapTimers[report.id]=setTimeout(()=>{
  fetch("/api/rapports/data",{ method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ kind:"reports", item:report }) })
    .then(r=>{ if(!r.ok && r.status!==401) queueOp({kind:"reports",action:"upsert",id:report.id,item:report}); })
    .catch(()=>queueOp({kind:"reports",action:"upsert",id:report.id,item:report})); // hors-ligne -> file
},600); }
function pushDelete(id){ fetch("/api/rapports/data?kind=reports&id="+id,{ method:"DELETE", credentials:"include" })
  .then(r=>{ if(!r.ok && r.status!==401) queueOp({kind:"reports",action:"delete",id}); })
  .catch(()=>queueOp({kind:"reports",action:"delete",id})); }
function pushTpl(tpl){ if(!tpl?.id) return; fetch("/api/rapports/data",{ method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ kind:"templates", item:tpl }) }).catch(()=>{}); }
function pushTplDelete(id){ fetch("/api/rapports/data?kind=templates&id="+id,{ method:"DELETE", credentials:"include" }).catch(()=>{}); }
async function loadLogo(){ try{ const r=await window.storage.get(LOGO_KEY); return r?r.value:null; }catch{ return null; } }
async function saveLogo(d){ try{ await window.storage.set(LOGO_KEY, d); }catch(e){ console.error(e); } }
async function clearLogo(){ try{ await window.storage.delete(LOGO_KEY); }catch(e){ console.error(e); } }
async function loadTemplates(){
  try{ const r=await fetch("/api/rapports/data?kind=templates",{credentials:"include"}); if(r.ok){ const j=await r.json(); const items=(j.items||[]).map(x=>({ id:x.id, name:x.name, num:x.num, blocks:x.blocks||[] })); try{ await window.storage.set(TPL_KEY, JSON.stringify(items)); }catch{} return items; } }catch{}
  try{ const c=await window.storage.get(TPL_KEY); return c?JSON.parse(c.value):[]; }catch{ return []; }
}
async function saveTemplates(list){ try{ await window.storage.set(TPL_KEY, JSON.stringify(list)); }catch{} }

// Vide toutes les valeurs d'un ensemble de blocs (pour transformer un rapport en gabarit)
function emptyBlockValues(blocks){
  return (blocks||[]).map(b=>{
    if(b.type==="section"){ const {eqId,...rest}=b; return {...rest, id:bid(), fields:(b.fields||[]).map(f=>({...f,id:bid(),value:""}))}; } // gabarit = pas d'eqId (assigné par instance)
    if(b.type==="table") return {...b, id:bid(), rows:(b.rows||[]).map(r=>r.map(()=>""))};
    if(b.type==="inspect") return {...b, id:bid(), items:(b.items||[]).map(it=>({...it,id:bid(),state:"good",note:"",severity:"minor",photo:null}))};
    if(b.type==="text") return {...b, id:bid(), value:""};
    if(b.type==="photos") return {...b, id:bid(), photos:[]};
    if(b.type==="pdfpage") return {...b, id:bid(), pages:[]};
    return {...b, id:bid()};
  });
}

// ---------- CLÉ API ----------
const APIKEY_LS = "rpt_api_key_v1";
let MEM_KEY = null;
function getApiKey(){ return "server"; /* cle geree cote serveur via /api/rapports/ai */ }
function setApiKeyMem(k){ MEM_KEY=k||null; }
function setApiKeyLocal(k){ try{ localStorage.setItem(APIKEY_LS,k); }catch(e){} MEM_KEY=k; }
function clearApiKey(){ MEM_KEY=null; try{ localStorage.removeItem(APIKEY_LS); }catch(e){} }
function isKeyStored(){ try{ return !!localStorage.getItem(APIKEY_LS); }catch{ return false; } }

async function testApiConnection(key){
  const r=await fetch("/api/rapports/ai",{ method:"POST",
    headers:{ "Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:16, messages:[{role:"user",content:"ping"}] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,200)}`); }
  return true;
}

// Extraction + proposition de gabarit à partir d'un PDF
async function extractDocWithApi(key, base64Pdf){
  const langName = LANG==="en"?"English":"français";
  const prompt = `Tu transcris INTÉGRALEMENT un document technique (rapport d'essais, analyse d'huile, soumission…) dans une structure éditable, en restant FIDÈLE AU MOT PRÈS.
Retourne UNIQUEMENT un objet JSON valide (sans texte autour, sans backticks) :
{
 "title": "titre exact du document",
 "client": "nom du client si présent, sinon ''",
 "location": "lieu/site si présent",
 "projectNo": "numéro de dossier/projet/P.O./Sample No si présent",
 "suggestedTemplate": "inspection | testing | quote | generic (le plus proche)",
 "blocks": [
   {"type":"section","title":"titre exact de section","fields":[{"label":"libellé exact","value":"valeur exacte"}]},
   {"type":"table","title":"titre exact du tableau","columns":["Colonne 1","Colonne 2","..."],"rows":[["cellule","cellule","..."]]},
   {"type":"text","value":"texte recopié intégralement, mot pour mot"},
   {"type":"photos","title":"titre/légende de la zone (ex: Imagerie thermique, Photos)","count":2,"layout":"2col"}
 ]
}
RÈGLES STRICTES DE FIDÉLITÉ :
- RECOPIE le texte VERBATIM, mot pour mot. NE RÉSUME PAS, NE REFORMULE PAS, NE RACCOURCIS PAS.
- N'OMETS AUCUNE SECTION. Capture TOUT : Reference, Equipment, DGA, OIL QUALITY, ADDITIONAL TESTS, Comments, conditions, prix, etc. Si le document a une section "Oil Quality" / "Qualité d'huile" avec humidité, tension interfaciale, acidité, facteur de puissance, densité, inhibiteur d'oxydation, PCB, furanes — TU DOIS TOUTES LES INCLURE.
- TABLEAUX MULTI-COLONNES (TRÈS IMPORTANT) : si un tableau a PLUSIEURS colonnes de valeurs (ex: deux dates 2025-08-22 et 2025-12-09 côte à côte), tu DOIS utiliser le type "table" et GARDER TOUTES LES COLONNES. NE choisis JAMAIS une seule colonne. Mets les en-têtes exacts dans "columns" (incluant les dates) et chaque ligne complète dans "rows". Recopie les valeurs dans le bon ordre de colonnes.
- Conserve la numérotation et les libellés d'origine (ex: "2.1", "B.7a", "D.15", codes de méthode comme "D 1533-20").
- Une "section" = champs à UNE seule valeur. Un "table" = données à PLUSIEURS colonnes. Un "text" = paragraphe ou liste.
- ZONES PHOTO (IMPORTANT) : quand une page contient des PHOTOS, des IMAGES, des IMAGERIES THERMIQUES ou des SCHÉMAS, ajoute un bloc {"type":"photos"} À CET ENDROIT dans l'ordre du document, avec "count" = le NOMBRE d'images sur la page (ex: une page d'imagerie thermique avec image thermique + photo réelle = count:2), "layout":"2col" si 2 images côte à côte, "1col" si une seule, "grid" si 4+. Donne un "title" décrivant la zone (ex: "Imagerie thermique - ASC A1"). NE mets PAS les images elles-mêmes (on placera les photos manuellement), mets seulement le bon nombre de cases vides au bon endroit.
- NE PAS inventer de valeurs absentes (mettre '' ou '—'). Garder la langue d'origine.
Objectif : quelqu'un qui lit les blocs doit avoir EXACTEMENT le même contenu que le PDF, AVEC toutes les colonnes, toutes les sections, et des zones photo au bon endroit, sans aucune perte.`;
  const r=await fetch("/api/rapports/ai",{ method:"POST",
    headers:{ "Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:8192, messages:[{ role:"user", content:[
      { type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64Pdf } },
      { type:"text", text:prompt } ] }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,300)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  // Avertir si la réponse a probablement été tronquée (limite de tokens atteinte)
  const truncated = data.stop_reason==="max_tokens";
  const parsed = JSON.parse(m?m[0]:clean);
  parsed.__truncated = truncated;
  return parsed;
}

// Extraction d'un brouillon MANUSCRIT depuis une image (jpg/png)
async function extractHandwritingWithApi(key, base64Image, mediaType){
  const langName = LANG==="en"?"English":"français";
  const prompt = `Tu lis un BROUILLON MANUSCRIT (écrit à la main) photographié, et tu le transformes en rapport technique structuré.
Retourne UNIQUEMENT un objet JSON valide (sans texte autour, sans backticks) :
{
 "title": "titre du rapport si lisible, sinon ''",
 "client": "", "location": "", "projectNo": "",
 "suggestedTemplate": "inspection | testing | quote | generic",
 "blocks": [
   {"type":"section","title":"titre","fields":[{"label":"libellé","value":"valeur","uncertain":true|false}]},
   {"type":"table","title":"titre","columns":["..."],"rows":[["..."]],"uncertainCells":[[ri,ci],...]},
   {"type":"text","value":"texte transcrit","uncertain":true|false}
 ]
}
RÈGLES IMPORTANTES :
- Transcris fidèlement l'écriture manuscrite. Structure le contenu en sections/tableaux/texte selon le sens.
- INCERTITUDE : pour CHAQUE valeur dont la lecture n'est PAS certaine (chiffre ambigu, mot illisible, rature), marque "uncertain": true sur le field ou le bloc text. Pour un tableau, liste les coordonnées [ligne,colonne] douteuses dans "uncertainCells".
- Sois HONNÊTE sur l'incertitude : un chiffre technique mal lu est dangereux. En cas de doute, marque uncertain.
- Si une zone est totalement illisible, mets "???" comme valeur et uncertain:true.
- NE PAS inventer de données qui ne sont pas dans le brouillon. Garder la langue d'origine (${langName}).
- RÉFÉRENCE PÂLE : si des valeurs IMPRIMÉES TRÈS PÂLES/grises servent de trame de référence et que des valeurs MANUSCRITES (plus foncées) sont écrites par-dessus ou à côté, lis UNIQUEMENT le MANUSCRIT (les valeurs pâles sont l'ancienne version, à ignorer). Si un champ pâle n'a PAS été réécrit à la main, traite-le comme vide.`;
  const r=await fetch("/api/rapports/ai",{ method:"POST",
    headers:{ "Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:6144, messages:[{ role:"user", content:[
      { type:"image", source:{ type:"base64", media_type:mediaType||"image/jpeg", data:base64Image } },
      { type:"text", text:prompt } ] }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,300)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  return repairJsonParse(m?m[0]:clean);
}

// Extraction depuis PLUSIEURS PHOTOS (caméra, prises à la suite) -> UN SEUL rapport structuré
async function extractMultiPhotoWithApi(images){ // images = [{base64, mediaType}]
  const langName = LANG==="en"?"English":"français";
  const prompt = `On te fournit PLUSIEURS PHOTOS (prises à la suite) d'un même relevé de terrain (pages, sections, tableaux, notes manuscrites ou imprimées). Combine TOUT en UN SEUL rapport technique structuré, dans l'ordre des photos.
Retourne UNIQUEMENT un objet JSON valide (sans texte autour, sans backticks) :
{"title":"","client":"","location":"","projectNo":"","suggestedTemplate":"inspection | testing | quote | generic",
 "templateNum":"<si un NUMÉRO DE GABARIT est imprimé (souvent en BAS de page, ex GAB-INS-01 / GAB-XXXXX), recopie-le ; sinon ''>",
 "blocks":[
   {"type":"section","title":"titre","fields":[{"label":"libellé","value":"valeur","uncertain":true|false}]},
   {"type":"table","title":"titre","columns":["..."],"rows":[["..."]],"uncertainCells":[[ri,ci],...]},
   {"type":"text","value":"texte","uncertain":true|false}
 ]}
RÈGLES : recopie fidèlement (verbatim si imprimé) ; pour le manuscrit/illisible marque "uncertain":true ; n'invente rien ; conserve TOUTES les sections et colonnes de TOUTES les photos ; cherche le NUMÉRO DE GABARIT en bas de page ; garde la langue d'origine (${langName}). RÉFÉRENCE PÂLE : si des valeurs imprimées TRÈS PÂLES servent de trame et que du MANUSCRIT plus foncé est écrit par-dessus/à côté, lis le MANUSCRIT (le pâle = ancienne version à ignorer ; champ pâle non réécrit = vide).`;
  const content = images.map(im=>({ type:"image", source:{ type:"base64", media_type:im.mediaType||"image/jpeg", data:im.base64 } }));
  content.push({ type:"text", text:prompt });
  const r=await fetch("/api/rapports/ai",{ method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ max_tokens:8192, messages:[{ role:"user", content }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,300)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  const parsed=repairJsonParse(m?m[0]:clean);
  parsed.__truncated = data.stop_reason==="max_tokens";
  return parsed;
}

// Reconnaissance DANS un GABARIT EXISTANT (standardisation) : l'IA remplit EXACTEMENT la
// structure du gabarit (mêmes sections/libellés/colonnes) avec les valeurs lues sur les photos.
async function extractIntoTemplate(images, tplBlocks){
  const langName = LANG==="en"?"English":"français";
  const schema = (tplBlocks||[]).map(b=>{
    if(b.type==="section") return { type:"section", title:b.title||"", fields:(b.fields||[]).map(f=>({label:f.label||""})) };
    if(b.type==="table") return { type:"table", title:b.title||"", columns:(b.columns||[]).slice() };
    return { type:"text", title:b.title||"" };
  });
  const prompt = `On te fournit une ou plusieurs PHOTOS d'un relevé de terrain (souvent manuscrit) ET un GABARIT cible. Remplis EXACTEMENT la structure du gabarit avec les valeurs lues sur les photos, pour STANDARDISER le rapport.
GABARIT (structure à remplir — NE CHANGE PAS les titres, libellés de champ ni colonnes de tableau) :
${JSON.stringify(schema)}
Retourne UNIQUEMENT un objet JSON valide, MÊME structure que le gabarit, avec les valeurs :
{"title":"","client":"","location":"","projectNo":"","blocks":[
  {"type":"section","title":"<identique au gabarit>","fields":[{"label":"<identique>","value":"<valeur lue>","uncertain":true|false}]},
  {"type":"table","title":"<identique>","columns":["<identiques>"],"rows":[["<valeurs>"]],"uncertainCells":[[ri,ci]]},
  {"type":"text","title":"<identique>","value":"<texte>"}
]}
RÈGLES : conserve EXACTEMENT les mêmes sections, libellés et colonnes que le gabarit (même ordre). Mets la valeur lue pour chaque champ/cellule ; absente -> '' ; lecture incertaine -> "uncertain":true. N'invente rien. RÉFÉRENCE PÂLE : si des valeurs imprimées TRÈS PÂLES servent de trame et que du MANUSCRIT plus foncé est écrit par-dessus/à côté, lis le MANUSCRIT (le pâle = ancienne version à ignorer ; champ pâle non réécrit = vide). Langue : ${langName}.`;
  const content = images.map(im=>({ type:"image", source:{ type:"base64", media_type:im.mediaType||"image/jpeg", data:im.base64 } }));
  content.push({ type:"text", text:prompt });
  const r=await fetch("/api/rapports/ai",{ method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ max_tokens:8192, messages:[{ role:"user", content }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,300)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  const parsed=repairJsonParse(m?m[0]:clean);
  parsed.__truncated = data.stop_reason==="max_tokens";
  return parsed;
}

// Normalise les blocs extraits vers le format interne (avec ids)
function normalizeBlocks(blocks){
  if(!Array.isArray(blocks)) return [];
  return blocks.map(b=>{
    if(b.type==="section") return { type:"section", id:bid(), title:b.title||"", fields:(b.fields||[]).map(f=>({id:bid(),label:f.label||"",value:f.value||"",uncertain:!!f.uncertain})) };
    if(b.type==="table") return { type:"table", id:bid(), title:b.title||"", columns:(b.columns||[]).slice(), rows:(b.rows||[]).map(r=>Array.isArray(r)?r.slice():[String(r)]), uncertainCells:(b.uncertainCells||[]).map(c=>c.slice()) };
    if(b.type==="photos"){
      const n=Math.max(1,Math.min(8, b.count||2));
      const layout = b.layout==="1col"||b.layout==="grid"?b.layout:"2col";
      return { type:"photos", id:bid(), title:b.title||t("photoZone"), layout, photos:Array.from({length:n},()=>({id:bid(),data:null,caption:""})) };
    }
    return { type:"text", id:bid(), value:b.value||"", placeholder:t("freeText"), uncertain:!!b.uncertain };
  });
}

// ---------- ANNOTATIONS (anomalies / commentaires) ----------
const SEVERITIES = [
  { id:"minor",    key:"sevMinor",    color:"#577590" },
  { id:"major",    key:"sevMajor",    color:"#e0a96d" },
  { id:"critical", key:"sevCritical", color:"#9d0208" },
];
function sevColor(id){ return (SEVERITIES.find(s=>s.id===id)||{}).color || "#577590"; }
function sevLabel(id){ const s=SEVERITIES.find(x=>x.id===id); return s?t(s.key):id; }

// États d'un point d'inspection (façon rapport TAFISA)
const INSP_STATES = [
  { id:"good",    key:"inspGood",    color:"#2a9d8f" },  // Bon / Bonne
  { id:"normal",  key:"inspNormal",  color:"#2a9d8f" },  // Normal
  { id:"anomaly", key:"inspAnomaly", color:"#9d0208" },  // Anomalie
  { id:"na",      key:"inspNA",      color:"#64748b" },  // N/V (non vérifié)
];
function inspColor(id){ return (INSP_STATES.find(s=>s.id===id)||{}).color || "#64748b"; }
function inspLabel(id){ const s=INSP_STATES.find(x=>x.id===id); return s?t(s.key):id; }

// Bibliothèques de points d'inspection pré-faites par type d'équipement
const INSP_LIBRARIES = [
  { id:"transfo", key:"libTransfo", points:[
    "Propreté générale","État de la cuve","Étanchéité / fuites d'huile","Niveau d'huile","Indicateur de température",
    "Traversées (bushings)","Connexions primaires","Connexions secondaires","Mise à la terre","Radiateurs / ventilation",
    "Relais de pression (Buchholz)","Silicagel / déshydrateur","Plaque signalétique","Absence de corrosion","Bruit / vibrations" ] },
  { id:"breaker", key:"libBreaker", points:[
    "Propreté générale","État du boîtier","Contacts principaux","Mécanisme de manœuvre","Chambre de coupure",
    "Connexions / serrage","Mise à la terre","Indicateur d'usure des contacts","Dispositif de déclenchement","Étiquetage / identification",
    "Absence de corrosion","Lubrification mécanique" ] },
  { id:"contactor", key:"libContactor", points:[
    "Propreté générale","Contacts de puissance","Bobine de commande","Contacts auxiliaires","Connexions / serrage",
    "Relais de surcharge","État du boîtier","Identification","Absence de surchauffe","Fonctionnement mécanique" ] },
  { id:"general", key:"libGeneral", points:[
    "Propreté générale","Connexions / serrage","Mise à la terre","Identification / étiquetage","Absence de corrosion",
    "Absence de surchauffe","État général","Conformité au code" ] },
];

// ---------- STATUTS DE RAPPORT (cycle de vie) ----------
const STATUSES = [
  { id:"in_progress", key:"stInProgress", color:"#577590" },
  { id:"review",      key:"stReview",     color:"#e0a96d" },
  { id:"approved",    key:"stApproved",   color:"#2a9d8f" },
  { id:"sent",        key:"stSent",       color:"#1e293b" },
];
function statusColor(id){ return (STATUSES.find(s=>s.id===id)||{}).color || "#577590"; }
function statusLabel(id){ const s=STATUSES.find(x=>x.id===id); return s?t(s.key):id; }
// Migration des anciens statuts (draft/final)
function migrateStatus(s){ if(s==="draft")return "in_progress"; if(s==="final")return "approved"; if(STATUSES.some(x=>x.id===s))return s; return "in_progress"; }

// Correction IA du texte + nettoyage mise en page
async function fixReportWithApi(key, report, lang){
  const langName = lang==="en"?"English":"français";
  // On envoie les blocs texte et titres pour correction, on garde la structure
  const payload = {
    title: report.title,
    blocks: report.blocks.map(b=>({
      type:b.type, id:b.id,
      title: b.title||"",
      value: b.value||"",
      fields: (b.fields||[]).map(f=>({id:f.id,label:f.label,value:f.value})),
    })),
  };
  const prompt = `Tu es correcteur professionnel de rapports techniques en ${langName}.
On te donne la structure JSON d'un rapport. Corrige l'orthographe, la grammaire, la ponctuation et la typographie de TOUS les textes (title, value, fields.label, fields.value), et améliore la clarté SANS changer le sens technique ni les valeurs numériques/unités.
Ne supprime aucun bloc, ne change aucun id, ne réorganise pas l'ordre. Garde exactement la même structure.
Retourne UNIQUEMENT le même objet JSON corrigé (même forme, mêmes ids), sans texte autour, sans backticks.
Rapport : ${JSON.stringify(payload)}`;
  const r=await fetch("/api/rapports/ai",{ method:"POST",
    headers:{ "Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:8192, messages:[{ role:"user", content:prompt }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,300)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  const fixed=JSON.parse(m?m[0]:clean);
  // Réintégrer les corrections dans les blocs existants (par id), sans toucher aux photos
  const byId={}; (fixed.blocks||[]).forEach(b=>{ byId[b.id]=b; });
  const newBlocks=report.blocks.map(b=>{
    const f=byId[b.id]; if(!f) return b;
    if(b.type==="section") return {...b, title:f.title??b.title, fields:(b.fields||[]).map(fl=>{ const ff=(f.fields||[]).find(x=>x.id===fl.id); return ff?{...fl,label:ff.label??fl.label,value:ff.value??fl.value}:fl; })};
    if(b.type==="text") return {...b, value:f.value??b.value};
    if(b.type==="photos") return {...b, title:f.title??b.title};
    return b;
  });
  return { title: fixed.title??report.title, blocks:newBlocks };
}

// Traduction IA du rapport complet (contenu saisi) vers la langue cible
async function translateReportWithApi(key, report, targetLang){
  const target = targetLang==="en"?"English":"français";
  const payload = {
    title: report.title, client: report.client, location: report.location,
    cover: report.cover ? { subtitle: report.cover.subtitle||"" } : null,
    blocks: report.blocks.map(b=>({
      type:b.type, id:b.id, title:b.title||"", value:b.value||"",
      fields:(b.fields||[]).map(f=>({id:f.id,label:f.label,value:f.value})),
      columns:b.columns||undefined, rows:b.rows||undefined,
    })),
    annotations:(report.annotations||[]).map(a=>({id:a.id,title:a.title,desc:a.desc,equipment:a.equipment})),
  };
  const prompt = `Tu es traducteur technique professionnel. Traduis TOUT le contenu textuel de ce rapport vers ${target}.
RÈGLES :
- Traduis : title, client (si nom traduisible), location, cover.subtitle, et dans chaque bloc : title, value, fields.label, fields.value, columns (en-têtes de tableau), rows (cellules de tableau), et les annotations (title, desc, equipment).
- NE TRADUIS PAS les valeurs numériques, unités, codes (ex: "34.5 kV", "212051041", "D 1533-20"), noms propres d'entreprises et identifiants d'équipement.
- Garde EXACTEMENT la même structure : mêmes ids, même ordre, mêmes dimensions de tableaux (mêmes nombres de colonnes/lignes).
- Retourne UNIQUEMENT le même objet JSON traduit, sans texte autour, sans backticks.
Rapport : ${JSON.stringify(payload)}`;
  const r=await fetch("/api/rapports/ai",{ method:"POST",
    headers:{ "Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:8192, messages:[{ role:"user", content:prompt }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,300)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  const tr=JSON.parse(m?m[0]:clean);
  const byId={}; (tr.blocks||[]).forEach(b=>{ byId[b.id]=b; });
  const annById={}; (tr.annotations||[]).forEach(a=>{ annById[a.id]=a; });
  const newBlocks=report.blocks.map(b=>{
    const tb=byId[b.id]; if(!tb) return b;
    if(b.type==="section") return {...b, title:tb.title??b.title, fields:(b.fields||[]).map(fl=>{ const ff=(tb.fields||[]).find(x=>x.id===fl.id); return ff?{...fl,label:ff.label??fl.label,value:ff.value??fl.value}:fl; })};
    if(b.type==="table") return {...b, title:tb.title??b.title, columns:(tb.columns&&tb.columns.length===(b.columns||[]).length)?tb.columns:b.columns, rows:(tb.rows&&tb.rows.length===(b.rows||[]).length)?tb.rows:b.rows};
    if(b.type==="text") return {...b, value:tb.value??b.value};
    if(b.type==="photos") return {...b, title:tb.title??b.title};
    return b;
  });
  const newAnnotations=(report.annotations||[]).map(a=>{ const ta=annById[a.id]; return ta?{...a,title:ta.title??a.title,desc:ta.desc??a.desc,equipment:ta.equipment??a.equipment}:a; });
  return {
    title: tr.title??report.title, client: tr.client??report.client, location: tr.location??report.location,
    cover: report.cover ? {...report.cover, subtitle: (tr.cover&&tr.cover.subtitle!=null)?tr.cover.subtitle:report.cover.subtitle} : report.cover,
    blocks:newBlocks, annotations:newAnnotations,
  };
}

// Convertit une URL d'image (ex. logo tenant distant) en data URL base64, pour qu'elle
// s'embarque dans le rapport et s'IMPRIME de façon fiable (sinon non chargée à temps au print).
async function urlToDataUrl(url){
  try{
    const r=await fetch(url,{ mode:"cors", credentials:"omit" });
    if(!r.ok) return null;
    const blob=await r.blob();
    return await new Promise((res)=>{ const fr=new FileReader(); fr.onload=()=>res(String(fr.result)); fr.onerror=()=>res(null); fr.readAsDataURL(blob); });
  }catch{ return null; }
}

function compressImage(file, maxDim=1200, quality=0.7){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{ const img=new Image(); img.onload=()=>{
      let {width:w,height:h}=img;
      if(w>maxDim||h>maxDim){ const r=Math.min(maxDim/w,maxDim/h); w=Math.round(w*r); h=Math.round(h*r); }
      const c=document.createElement("canvas"); c.width=w; c.height=h;
      c.getContext("2d").drawImage(img,0,0,w,h); resolve(c.toDataURL("image/jpeg",quality));
    }; img.onerror=reject; img.src=reader.result; };
    reader.onerror=reject; reader.readAsDataURL(file);
  });
}

// Convertit chaque page d'un PDF en image (pleine page) via PDF.js
// Capture toutes les pages d'un PDF en images (pour joindre une copie visuelle fidèle)
async function pdfFileToPageSnapshots(file, onProgress, scale=1.4){
  const lib=window.pdfjsLib; if(!lib) throw new Error("PDF.js non chargé");
  const buf=await file.arrayBuffer();
  const pdf=await lib.getDocument({ data: buf }).promise;
  const out=[];
  const total=pdf.numPages;
  for(let i=1;i<=total;i++){
    if(onProgress) onProgress(i,total);
    const page=await pdf.getPage(i);
    const viewport=page.getViewport({ scale });
    const canvas=document.createElement("canvas");
    canvas.width=viewport.width; canvas.height=viewport.height;
    const ctx=canvas.getContext("2d");
    await page.render({ canvasContext:ctx, viewport }).promise;
    out.push(canvas.toDataURL("image/jpeg", 0.7));
    canvas.width=0; canvas.height=0; // libérer la mémoire
  }
  return out;
}

async function pdfFileToImages(file, scale=2, maxPages=20){
  const lib = window.pdfjsLib;
  if(!lib) throw new Error("PDF.js non chargé");
  const buf = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: buf }).promise;
  const out=[];
  const n=Math.min(pdf.numPages, maxPages);
  for(let i=1;i<=n;i++){
    const page=await pdf.getPage(i);
    const viewport=page.getViewport({ scale });
    const canvas=document.createElement("canvas");
    canvas.width=viewport.width; canvas.height=viewport.height;
    const ctx=canvas.getContext("2d");
    await page.render({ canvasContext:ctx, viewport }).promise;
    // compresser un peu (jpeg) pour limiter le poids en stockage
    out.push(canvas.toDataURL("image/jpeg", 0.82));
  }
  return out;
}

// Extrait le texte brut d'un PDF (pour comparaison source vs extrait)
async function pdfPageCount(file){
  const lib=window.pdfjsLib; if(!lib) return 0;
  try{ const buf=await file.arrayBuffer(); const pdf=await lib.getDocument({data:buf}).promise; return pdf.numPages; }catch{ return 0; }
}
// Extrait le texte d'une plage de pages [from..to] (1-indexé)
async function pdfTextRange(file, from, to){
  const lib=window.pdfjsLib; if(!lib) return "";
  const buf=await file.arrayBuffer();
  const pdf=await lib.getDocument({data:buf}).promise;
  const end=Math.min(to, pdf.numPages);
  let txt="";
  for(let i=from;i<=end;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    txt += `\n----- PAGE ${i} -----\n` + content.items.map(it=>it.str).join(" ")+"\n";
  }
  return txt;
}
// Extraction depuis du TEXTE (pour gros PDF >90 pages, contourne la limite de 100 pages de l'API PDF)
async function extractDocFromText(key, textChunk, isFirst){
  const langName=LANG==="en"?"English":"français";
  const prompt = `Tu transcris INTÉGRALEMENT le texte d'un document technique dans une structure éditable, FIDÈLE AU MOT PRÈS.
Retourne UNIQUEMENT un objet JSON valide (sans texte autour, sans backticks) :
{${isFirst?'\n "title": "titre exact", "client": "client si présent", "location": "lieu si présent", "projectNo": "n° projet/dossier si présent", "suggestedTemplate": "inspection|testing|quote|generic",':''}
 "blocks": [
   {"type":"section","title":"titre exact","fields":[{"label":"libellé","value":"valeur"}]},
   {"type":"table","title":"titre","columns":["C1","C2"],"rows":[["a","b"]]},
   {"type":"text","value":"texte recopié mot pour mot"}
 ]
}
RÈGLES : recopie VERBATIM, n'omets aucune section, garde TOUTES les colonnes des tableaux, conserve numérotation/codes. Ne pas inventer (mettre '' ou '—'). Voici le texte à structurer :
${textChunk}`;
  const r=await fetch("/api/rapports/ai",{ method:"POST",
    headers:{ "Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:8192, messages:[{ role:"user", content:prompt }] }) });
  if(!r.ok){ const e=await r.text(); throw new Error(`${r.status}: ${e.slice(0,200)}`); }
  const data=await r.json();
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
  const clean=txt.replace(/```json|```/g,"").trim();
  const m=clean.match(/\{[\s\S]*\}/);
  const parsed=repairJsonParse(m?m[0]:clean);
  parsed.__truncated = data.stop_reason==="max_tokens";
  return parsed;
}
// Import d'un gros PDF par lots de pages (texte), fusionne les blocs
async function extractLargePdf(key, file, onProgress){
  const total=await pdfPageCount(file);
  const BATCH=40; // pages par lot (marge sous la limite)
  let merged={ title:"", client:"", location:"", projectNo:"", suggestedTemplate:"generic", blocks:[], __truncated:false };
  let first=true;
  for(let from=1; from<=total; from+=BATCH){
    const to=Math.min(from+BATCH-1, total);
    if(onProgress) onProgress(from, to, total);
    const chunk=await pdfTextRange(file, from, to);
    if(!chunk.trim()) continue;
    const part=await extractDocFromText(key, chunk, first);
    if(first){ merged.title=part.title||""; merged.client=part.client||""; merged.location=part.location||""; merged.projectNo=part.projectNo||""; merged.suggestedTemplate=part.suggestedTemplate||"generic"; first=false; }
    merged.blocks=merged.blocks.concat(part.blocks||[]);
    merged.__truncated = merged.__truncated || !!part.__truncated;
  }
  return merged;
}

async function pdfFileToText(file, maxPages=20){
  const lib = window.pdfjsLib;
  if(!lib) return "";
  // Ne jamais bloquer l'import : timeout de sécurité
  const work = (async()=>{
    const buf = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: buf }).promise;
    const n=Math.min(pdf.numPages, maxPages);
    let txt="";
    for(let i=1;i<=n;i++){
      const page=await pdf.getPage(i);
      const content=await page.getTextContent();
      txt += content.items.map(it=>it.str).join(" ")+"\n\n";
    }
    return txt;
  })();
  const timeout = new Promise(res=>setTimeout(()=>res(""), 8000));
  try{ return await Promise.race([work, timeout]); }catch{ return ""; }
}

//  APP
// ============================================================
export default function App(){
  const [db,setDb]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [logo,setLogo]=useState(null);
  const [lang,setLang]=useState("fr");
  const [view,setView]=useState("list");   // list | editor
  const [tab,setTab]=useState("reports");   // reports | templates
  const [selId,setSelId]=useState(null);
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [showSettings,setShowSettings]=useState(false);
  const [showAnomDash,setShowAnomDash]=useState(false); // dashboard anomalies/recos consolidé (tous rapports)
  const [pendingN,setPendingN]=useState(0);       // modifications en attente de synchro (hors-ligne)
  const [online,setOnline]=useState(true);
  const [importing,setImporting]=useState(false);
  const [importErr,setImportErr]=useState(null);
  const [importPreview,setImportPreview]=useState(null);
  const [photoCap,setPhotoCap]=useState(null); // capture caméra multi-photos : null=fermé, {photos:[],tplId:""}=ouvert
  const [hwImport,setHwImport]=useState(null);  // import manuscrit : null=fermé, {file,tplId,query}=demande d'association gabarit
  const [customTpls,setCustomTpls]=useState([]);
  const [hiddenTpls,setHiddenTpls]=useState([]);
  const [theme,setTheme]=useState({...DEFAULT_THEME});

  function hideDefaultTpl(id){ const next=[...new Set([...hiddenTpls,id])]; HIDDEN_TPLS=next; setHiddenTpls(next); saveHidden(next); }
  function restoreDefaultTpls(){ HIDDEN_TPLS=[]; setHiddenTpls([]); saveHidden([]); }

  useEffect(()=>{ (async()=>{
    const [d,l,ct,th,hid]=await Promise.all([loadDB(),loadLogo(),loadTemplates(),loadTheme(),loadHidden()]);
    HIDDEN_TPLS=hid||[]; setHiddenTpls(HIDDEN_TPLS);
    // La langue suit le SITE (header principal) : on lit 'cs-lang' (repli rpt_lang_v1).
    let lg="fr"; try{ lg=localStorage.getItem("cs-lang")||localStorage.getItem(LANG_KEY)||"fr"; }catch{}
    LANG=lg; setLang(lg);
    THEME=th; setTheme(th);
    const migrated=d.map(r=>({...r, status:migrateStatus(r.status)}));
    setDb(migrated); setCustomTpls(ct);
    // Logo : TOUJOURS celui du TENANT (comme les autres modules), sinon le logo C-Secur360 par
    // défaut (comme DGA). Pas de logo propre au module. Converti en data URL pour qu'il s'imprime.
    {
      let url=null;
      try{
        const tn=(window.location.pathname.split("/")[1])||"";
        if(tn){
          const {data:cs}=await supabase.from("company_settings").select("logo_url").eq("tenant_id",tn).maybeSingle();
          url=cs?.logo_url||null;
          if(!url){ const {data:tnt}=await supabase.from("tenants").select("logo_url").eq("id",tn).maybeSingle(); url=tnt?.logo_url||null; }
        }
      }catch{}
      if(!url) url="/c-secur360-logo.png"; // repli défaut C-Secur360 (comme DGA)
      try{ const dataUrl=await urlToDataUrl(url); setLogo(dataUrl||url); }catch{ setLogo(url); }
    }
    setLoaded(true);
  })(); },[]);

  // Deep-link QR : ?r=<id> (scan d'un QR de page) ouvre directement le rapport dans l'éditeur.
  // Un rapport = un seul QR (couvre toutes ses pages) ; ?blk=<id> permet de viser une page.
  const [deepDone,setDeepDone]=useState(false);
  useEffect(()=>{
    if(!loaded||deepDone) return; setDeepDone(true);
    try{
      const sp=new URLSearchParams(window.location.search);
      const rid=sp.get("r"); const eq=sp.get("eq"); const blk=sp.get("blk");
      // Résolution du rapport cible : r=<id> si présent, sinon par identité d'équipement (eq) —
      // on ouvre le rapport le PLUS RÉCENT qui contient cet équipement (étiquette réutilisable).
      let target=null;
      if(rid && db.find(x=>x.id===rid)) target=db.find(x=>x.id===rid);
      else if(eq){ const cands=db.filter(x=>(x.blocks||[]).some(b=>b.type==="section"&&b.eqId===eq)); cands.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)); target=cands[0]||null; }
      if(target){
        setSelId(target.id); setView("editor");
        // Saut vers la bonne section : par bloc (blk) ou par équipement (eq).
        let jumpBlk=blk;
        if(!jumpBlk && eq){ const sec=(target.blocks||[]).find(b=>b.type==="section"&&b.eqId===eq); if(sec) jumpBlk=sec.id; }
        if(jumpBlk) setTimeout(()=>{ const el=document.getElementById("blk-"+jumpBlk); if(el){ el.scrollIntoView({behavior:"smooth",block:"start"}); el.style.boxShadow="0 0 0 3px #1e293b"; setTimeout(()=>{el.style.boxShadow="";},900); } },400);
        const u=new URL(window.location.href); u.searchParams.delete("r"); u.searchParams.delete("blk"); u.searchParams.delete("eq"); window.history.replaceState({},"",u.pathname+u.search);
      }
    }catch{}
  },[loaded]);

  // Synchro hors-ligne : flush de la file au démarrage + à la reconnexion ; suivi du compteur.
  useEffect(()=>{
    const refresh=()=>{ setOnline(typeof navigator==="undefined"||navigator.onLine); setPendingN(pendingCount()); };
    const tick=async()=>{ await flushPending(); refresh(); };
    tick();
    const onOnline=()=>tick(); const onOffline=()=>refresh();
    window.addEventListener("online",onOnline); window.addEventListener("offline",onOffline);
    const iv=setInterval(refresh,5000);
    return ()=>{ window.removeEventListener("online",onOnline); window.removeEventListener("offline",onOffline); clearInterval(iv); };
  },[]);

  // Synchronise la langue avec le header principal du site (cs-lang-change + storage).
  useEffect(()=>{
    const apply=()=>{ try{ const lg=localStorage.getItem("cs-lang")||"fr"; LANG=lg; setLang(lg); }catch{} };
    window.addEventListener("cs-lang-change",apply);
    window.addEventListener("storage",apply);
    return ()=>{ window.removeEventListener("cs-lang-change",apply); window.removeEventListener("storage",apply); };
  },[]);

  function persist(next){ setDb(next); saveDB(next); }
  function persistTpls(next){ setCustomTpls(next); saveTemplates(next); }
  function applyTheme(next){ THEME=next; setTheme({...next}); saveTheme(next); }
  function toggleLang(){ const nx=lang==="fr"?"en":"fr"; setLang(nx); LANG=nx; try{ localStorage.setItem(LANG_KEY,nx); }catch{} }

  // Crée un nouveau rapport à partir d'un gabarit (défaut ou custom)
  function blocksForTemplate(tplId){
    const custom=customTpls.find(c=>c.id===tplId);
    if(custom) return emptyBlockValues(JSON.parse(JSON.stringify(custom.blocks||[])));
    return tplBlocks(tplId);
  }

  const sel = db.find(r=>r.id===selId)||null;

  function newReport(tplId){
    const r={ id:"r_"+Date.now(), title:"", client:"", location:"", projectNo:"", date:new Date().toISOString().slice(0,10),
      template:tplId, num:tplNumOf(tplId, customTpls), status:"in_progress", version:1, createdFrom:null, blocks:blocksForTemplate(tplId), annotations:[], cover:{show:true,subtitle:""}, updatedAt:Date.now() };
    persist([r,...db]); pushReport(r); setSelId(r.id); setView("editor");
  }
  function updateReport(id,patch){ const next=db.map(r=>r.id===id?{...r,...patch,updatedAt:Date.now()}:r); persist(next); const upd=next.find(r=>r.id===id); if(upd) pushReport(upd); }
  // Mise à jour d'une annotation (anomalie/reco) d'un rapport depuis le dashboard consolidé.
  function updateReportAnnotation(reportId,annId,patch){
    const rep=db.find(x=>x.id===reportId); if(!rep) return;
    const anns=(rep.annotations||[]).map(a=>a.id===annId?{...a,...patch}:a);
    updateReport(reportId,{annotations:anns});
  }
  // Met à jour un CONSTAT (depuis le dashboard) qu'il vienne d'une annotation OU d'une grille d'inspection.
  function updateReportFinding(f,patch){
    const rep=db.find(x=>x.id===f.reportId); if(!rep) return;
    if(f.source==="inspect"){
      const blocks=(rep.blocks||[]).map(b=> b.id===f.blkId ? {...b, items:(b.items||[]).map(it=>it.id===f.id?{...it,...patch}:it)} : b);
      updateReport(f.reportId,{blocks});
    } else {
      const anns=(rep.annotations||[]).map(a=>a.id===f.id?{...a,...patch}:a);
      updateReport(f.reportId,{annotations:anns});
    }
  }
  function deleteReport(id){ if(!confirm(t("confirmDel")))return; persist(db.filter(r=>r.id!==id)); pushDelete(id); if(selId===id){setSelId(null);setView("list");} }
  function duplicateReport(id, asVersion){
    const src=db.find(r=>r.id===id); if(!src)return;
    const copy=JSON.parse(JSON.stringify(src));
    copy.id="r_"+Date.now(); copy.updatedAt=Date.now();
    if(asVersion){ copy.version=(src.version||1)+1; copy.createdFrom=src.title||src.id; copy.status="in_progress"; }
    else { copy.version=1; copy.createdFrom=src.title||src.id; copy.title=(src.title||"")+" (copie)"; }
    persist([copy,...db]); pushReport(copy); setSelId(copy.id); setView("editor");
  }

  async function handleImport(file){
    const key=getApiKey();
    if(!key){ alert(t("importNoKey")); setShowSettings(true); return; }
    setImporting(true); setImportErr(null);
    try{
      const pages=await pdfPageCount(file);
      const sourceText=await pdfFileToText(file);
      let out;
      if(pages>90){
        // Gros PDF : extraction par lots de pages (texte) pour contourner la limite API de 100 pages
        out=await extractLargePdf(key, file, (from,to,total)=>{ setImportErr(`${t("importBatch")} ${from}-${to} / ${total}…`); });
        setImportErr(null);
      } else {
        const b64=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result).split(",")[1]); r.onerror=()=>rej(new Error("read")); r.readAsDataURL(file); });
        out=await extractDocWithApi(key,b64);
      }
      // Joindre une copie visuelle fidèle de chaque page (photos, schémas, mise en page d'origine)
      let pageImages=[];
      try{
        setImportErr(`${t("importSnap")} 0 / ${pages}…`);
        pageImages=await pdfFileToPageSnapshots(file,(i,tot)=>{ setImportErr(`${t("importSnap")} ${i} / ${tot}…`); });
        setImportErr(null);
      }catch(snapErr){ pageImages=[]; }
      const blocks=normalizeBlocks(out.blocks);
      if(pageImages.length){
        blocks.push({ type:"pdfpage", id:bid(), name:t("importOriginalPages"), pages:pageImages });
      }
      setImportPreview({
        title:out.title||"", client:out.client||"", location:out.location||"", projectNo:out.projectNo||"",
        template: ["inspection","testing","quote","generic"].includes(out.suggestedTemplate)?out.suggestedTemplate:"generic",
        blocks, truncated: !!out.__truncated, sourceText, pageCount:pageImages.length,
      });
    }catch(e){ setImportErr(e.message); }
    setImporting(false);
  }
  function applyImport(){
    if(!importPreview)return;
    const ip=importPreview;
    const r={ id:"r_"+Date.now(), title:ip.title, client:ip.client, location:ip.location, projectNo:ip.projectNo,
      date:new Date().toISOString().slice(0,10), template:ip.template, status:"in_progress", version:1, createdFrom:"import",
      num:tplNumOf(ip.template, customTpls),
      blocks: ip.blocks.length?ip.blocks:tplBlocks(ip.template), annotations:[], cover:{show:true,subtitle:""}, sourceText:ip.sourceText||"", updatedAt:Date.now() };
    persist([r,...db]); pushReport(r); setSelId(r.id); setImportPreview(null); setView("editor");
  }

  // Importer un PDF directement comme GABARIT (structure conservée, valeurs vidées)
  async function importPdfAsTemplate(file){
    const key=getApiKey();
    if(!key){ alert(t("importNoKey")); setShowSettings(true); return; }
    setImporting(true); setImportErr(null);
    try{
      const pages=await pdfPageCount(file);
      let out;
      if(pages>90){
        out=await extractLargePdf(key, file, (from,to,total)=>{ setImportErr(`${t("importBatch")} ${from}-${to} / ${total}…`); });
        setImportErr(null);
      } else {
        const b64=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result).split(",")[1]); r.onerror=()=>rej(new Error("read")); r.readAsDataURL(file); });
        out=await extractDocWithApi(key,b64);
      }
      const blocks=emptyBlockValues(normalizeBlocks(out.blocks));
      const name=(out.title||file.name||"Gabarit").replace(/\.pdf$/i,"");
      const tpl={ id:"ct_"+Date.now(), name, blocks, num:"GAB-"+Date.now().toString(36).slice(-5).toUpperCase() };
      persistTpls([tpl,...customTpls]); pushTpl(tpl);
    }catch(e){ setImportErr(e.message); }
    setImporting(false);
  }
  function deleteTemplate(id){ if(!confirm(t("tplDelete")))return; persistTpls(customTpls.filter(c=>c.id!==id)); pushTplDelete(id); }

  // Importer un BROUILLON MANUSCRIT (image) -> rapport avec valeurs "à vérifier"
  // Import manuscrit : on demande d'abord (modal) d'associer ou non à un gabarit, puis on extrait.
  async function runHandwriting(file, tplId){
    setHwImport(null);
    setImporting(true); setImportErr(null);
    try{
      const dataUrl=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result)); r.onerror=()=>rej(new Error("read")); r.readAsDataURL(file); });
      const b64=dataUrl.split(",")[1];
      const mt=(file.type||"image/jpeg");
      let out;
      if(tplId){
        // Associé à un gabarit -> on remplit EXACTEMENT sa structure (standardisation)
        const tBlocks = customTpls.find(c=>c.id===tplId)?.blocks || tplBlocks(tplId);
        out=await extractIntoTemplate([{base64:b64,mediaType:mt}], tBlocks);
        out.suggestedTemplate=tplId;
      } else {
        out=await extractHandwritingWithApi("server",b64,mt);
      }
      const blocks=normalizeBlocks(out.blocks);
      setImportPreview({
        title:out.title||"", client:out.client||"", location:out.location||"", projectNo:out.projectNo||"",
        template: tplId || (["inspection","testing","quote","generic"].includes(out.suggestedTemplate)?out.suggestedTemplate:"generic"),
        blocks, truncated:!!out.__truncated, sourceText:"", handwriting:true,
      });
    }catch(e){ setImportErr(e.message); }
    setImporting(false);
  }

  // Caméra MULTI-PHOTOS : on prend plusieurs photos à la suite, puis on génère le rapport.
  function addCapPhotos(files){ (async()=>{ const next=[...(photoCap?.photos||[])]; for(const f of files){ try{ const d=await compressImage(f,1500,0.72); next.push({ id:bid(), data:d }); }catch{} } setPhotoCap(p=>({ ...(p||{tplId:""}), photos:next })); })(); }
  async function handleMultiPhoto(){
    const photos=photoCap?.photos||[]; if(!photos.length) return;
    setImporting(true); setImportErr(null);
    try{
      const images=photos.map(p=>({ base64:p.data.split(",")[1], mediaType:(p.data.match(/^data:(.*?);/)||[])[1]||"image/jpeg" }));
      const tplId=photoCap?.tplId||"";
      let out;
      if(tplId){
        // Reconnaissance DANS un gabarit existant (standardisation)
        const tBlocks = customTpls.find(c=>c.id===tplId)?.blocks || tplBlocks(tplId);
        out=await extractIntoTemplate(images, tBlocks);
        out.suggestedTemplate=tplId;
      } else {
        out=await extractMultiPhotoWithApi(images);
      }
      const blocks=normalizeBlocks(out.blocks);
      setPhotoCap(null);
      setImportPreview({
        title:out.title||"", client:out.client||"", location:out.location||"", projectNo:out.projectNo||"",
        template: tplId || (["inspection","testing","quote","generic"].includes(out.suggestedTemplate)?out.suggestedTemplate:"generic"),
        blocks, truncated:!!out.__truncated, sourceText:"", handwriting:true,
      });
    }catch(e){ setImportErr(e.message); }
    setImporting(false);
  }

  const filtered = db.filter(r=>{
    if(statusFilter!=="all" && r.status!==statusFilter) return false;
    if(!query.trim()) return true;
    const q=query.toLowerCase();
    const tplLabel=t((TEMPLATES.find(x=>x.id===r.template)||{}).key||"");
    return [r.title,r.client,r.location,r.projectNo,tplLabel].filter(Boolean).some(v=>String(v).toLowerCase().includes(q));
  });

  if(!loaded) return <div style={S.page} className="app-page"><style>{CSS}</style>…</div>;

  return (
    <div style={S.page} className="app-page">
      <style>{CSS}</style>
      <header style={S.header} className="screen-only">
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {logo && <img src={logo} alt="" style={{maxHeight:42,maxWidth:120,objectFit:"contain"}}/>}
          <div>
            <div style={S.kicker}>{t("tagline").toUpperCase()}</div>
            <div style={S.h1}>{t("appName")}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          {/* FR/EN retiré : la langue suit le header principal du site (cs-lang). */}
          {(!online || pendingN>0) && (
            <span title={LANG==="en"?"Changes are saved locally and will sync when back online":"Les modifications sont enregistrées localement et se synchroniseront au retour en ligne"}
              style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:11,padding:"4px 10px",borderRadius:20,border:"1px solid",...(online?{color:"#b45309",background:"#fff7ed",borderColor:"#fed7aa"}:{color:"#9d0208",background:"#fdf0ee",borderColor:"#e3a0a0"})}}>
              {online ? `⟳ ${pendingN} ${LANG==="en"?"to sync":"à synchro."}` : `⚠ ${LANG==="en"?"Offline":"Hors ligne"}${pendingN>0?` · ${pendingN}`:""}`}
            </span>
          )}
          <button style={S.gearBtn} onClick={()=>setShowSettings(true)} title={t("settings")}>⚙</button>
          {view!=="list" && <button style={S.btnGhost} onClick={()=>{setView("list");setSelId(null);}}>{t("backAll")}</button>}
        </div>
      </header>

      {showSettings && <SettingsModal logo={logo} onLogo={(d)=>{ setLogo(d); if(d) saveLogo(d); else clearLogo(); }} theme={theme} onTheme={applyTheme} onClose={()=>setShowSettings(false)}/>}

      {importing && <div style={S.overlay}><div style={{...S.modal,maxWidth:340,textAlign:"center"}}><div style={{fontSize:32,marginBottom:10}}>📄</div><div style={{fontFamily:"'Archivo'",fontWeight:700}}>{t("importing")}</div></div></div>}
      {importErr && <div style={S.overlay} onClick={()=>setImportErr(null)}><div style={{...S.modal,maxWidth:440}} onClick={e=>e.stopPropagation()}><h2 style={{...S.h2,color:"#c1121f"}}>{t("importErr")}</h2><p style={{fontSize:13,wordBreak:"break-word"}}>{importErr}</p><div style={{marginTop:14}}><button style={S.btnGhost} onClick={()=>setImportErr(null)}>{t("cancel")}</button></div></div></div>}

      {importPreview && <ImportReview ip={importPreview} setIp={setImportPreview} onApply={applyImport} onCancel={()=>{ setImportPreview(null); setImporting(false); setImportErr(null); }}/>}

      {/* Caméra multi-photos -> rapport (avec format de gabarit optionnel pour standardiser) */}
      {photoCap!==null && (
        <div style={S.overlay} onClick={()=>{ if(!importing) setPhotoCap(null); }}>
          <div style={{...S.modal,maxWidth:600,maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h2 style={S.h2}>📷 {LANG==="en"?"Photos → report":"Photos → rapport"}</h2>
            <p style={{...S.hint,marginTop:0}}>{LANG==="en"?"Take several photos in a row, then generate the report.":"Prenez plusieurs photos à la suite, puis générez le rapport."}</p>
            <label style={{...S.btnDark,cursor:"pointer",display:"inline-flex",alignItems:"center"}}>
              📷 {LANG==="en"?"Add photos":"Ajouter des photos"}
              <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{ const fs=[...(e.target.files||[])]; e.target.value=""; if(fs.length) addCapPhotos(fs); }}/>
            </label>
            {(photoCap.photos||[]).length>0 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:8,margin:"12px 0"}}>
                {photoCap.photos.map(p=>(
                  <div key={p.id} style={{position:"relative"}}>
                    <img src={p.data} alt="" style={{width:"100%",height:84,objectFit:"cover",borderRadius:8,border:"1px solid #e2e8f0"}}/>
                    <button onClick={()=>setPhotoCap(pc=>({...pc,photos:pc.photos.filter(x=>x.id!==p.id)}))} style={{position:"absolute",top:2,right:2,width:20,height:20,borderRadius:"50%",border:"none",background:"rgba(157,2,8,.9)",color:"#fff",cursor:"pointer",fontSize:12,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            )}
            <label style={S.label}>{LANG==="en"?"Output format (standardization)":"Format de sortie (standardisation)"}</label>
            <select style={S.input} value={photoCap.tplId} onChange={e=>setPhotoCap(pc=>({...pc,tplId:e.target.value}))}>
              <option value="">{LANG==="en"?"Auto-detect structure":"Auto-détecter la structure"}</option>
              {visTpls().map(tp=>(<option key={tp.id} value={tp.id}>{t(tp.key)}</option>))}
              {(customTpls||[]).map(c=>(<option key={c.id} value={c.id}>★ {c.name}</option>))}
            </select>
            <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
              <button style={S.btnPrimary} disabled={importing||!(photoCap.photos||[]).length} onClick={handleMultiPhoto}>{importing?"…":(LANG==="en"?`Generate report (${(photoCap.photos||[]).length})`:`Générer le rapport (${(photoCap.photos||[]).length})`)}</button>
              <button style={S.btnGhost} onClick={()=>{ if(!importing) setPhotoCap(null); }}>{t("cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Import manuscrit -> associer (ou non) à un gabarit, avec recherche dynamique */}
      {hwImport!==null && (()=>{
        const tplRow={display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,textAlign:"left",border:"1px solid #e2e8f0",borderRadius:8,padding:"9px 12px",background:"#fff",cursor:"pointer",fontSize:13};
        const tplRowOn={border:"2px solid #1e293b",background:"#f1f5f9",fontWeight:700};
        const opts=[...visTpls().map(tp=>({id:tp.id,name:t(tp.key),num:tp.num})), ...(customTpls||[]).map(c=>({id:c.id,name:"★ "+(c.name||""),num:c.num}))]
          .filter(o=>{ const q=(hwImport.query||"").toLowerCase(); return !q || (o.name||"").toLowerCase().includes(q) || (o.num||"").toLowerCase().includes(q); });
        return (
        <div style={S.overlay} onClick={()=>{ if(!importing) setHwImport(null); }}>
          <div style={{...S.modal,maxWidth:480,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h2 style={S.h2}>✍ {LANG==="en"?"Handwritten import":"Import manuscrit"}</h2>
            <p style={{...S.hint,marginTop:0}}>{LANG==="en"?"Associate this sheet with a template? The AI will fill its exact structure (standardization). Otherwise it auto-detects.":"Associer cette feuille à un gabarit ? L'IA remplira sa structure exacte (standardisation). Sinon, auto-détection."}</p>
            <input style={{...S.input,marginBottom:8}} placeholder={LANG==="en"?"Search a template…":"Rechercher un gabarit…"} value={hwImport.query} onChange={e=>setHwImport(h=>({...h,query:e.target.value}))}/>
            <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              <button onClick={()=>setHwImport(h=>({...h,tplId:""}))} style={{...tplRow, ...(hwImport.tplId===""?tplRowOn:{})}}>🔎 {LANG==="en"?"Auto-detect (no template)":"Auto-détecter (aucun gabarit)"}</button>
              {opts.map(o=>(<button key={o.id} onClick={()=>setHwImport(h=>({...h,tplId:o.id}))} style={{...tplRow, ...(hwImport.tplId===o.id?tplRowOn:{})}}><span>{o.name}</span>{o.num && <span style={{fontSize:11,color:"#94a3b8"}}>{o.num}</span>}</button>))}
              {opts.length===0 && <div style={{fontSize:12,color:"#94a3b8",padding:"6px 2px"}}>{LANG==="en"?"No template found.":"Aucun gabarit trouvé."}</div>}
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button style={S.btnPrimary} disabled={importing} onClick={()=>runHandwriting(hwImport.file, hwImport.tplId)}>{importing?"…":(LANG==="en"?"Continue":"Continuer")}</button>
              <button style={S.btnGhost} onClick={()=>{ if(!importing) setHwImport(null); }}>{t("cancel")}</button>
            </div>
          </div>
        </div>
        );
      })()}

      {view==="list" && (
        <>
          <div style={S.tabRow} className="screen-only">
            <button style={{...S.tab,...(tab==="reports"?S.tabOn:{})}} onClick={()=>setTab("reports")}>{t("tabReports")}</button>
            <button style={{...S.tab,...(tab==="templates"?S.tabOn:{})}} onClick={()=>setTab("templates")}>{t("tabTemplates")}</button>
          </div>
          {tab==="reports" ? (
            <ListView db={filtered} all={db} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              onOpen={(id)=>{setSelId(id);setView("editor");}} onOpenAnomDash={()=>setShowAnomDash(true)} onNew={newReport} onImport={handleImport} onHandwriting={(file)=>setHwImport({file,tplId:"",query:""})} onPhotos={()=>setPhotoCap({photos:[],tplId:""})} customTpls={customTpls} onDelete={deleteReport} onDuplicate={duplicateReport}/>
          ) : (
            <TemplatesView custom={customTpls} onImportPdf={importPdfAsTemplate} onDelete={deleteTemplate} onUse={(tplId)=>newReport(tplId)} onHide={hideDefaultTpl} onRestore={restoreDefaultTpls} hiddenCount={hiddenTpls.length}/>
          )}
        </>
      )}
      {view==="editor" && sel && <Editor report={sel} logo={logo} customTpls={customTpls} onUpdate={(patch)=>updateReport(sel.id,patch)} onDuplicate={duplicateReport}/>}

      {/* DASHBOARD ANOMALIES / RECOMMANDATIONS CONSOLIDÉ (tous les rapports) */}
      {showAnomDash && <AnomalyDashboard db={db} onClose={()=>setShowAnomDash(false)}
        onOpen={(reportId,blk)=>{ setShowAnomDash(false); setSelId(reportId); setView("editor"); if(blk) setTimeout(()=>{ const el=document.getElementById("blk-"+blk); if(el){ el.scrollIntoView({behavior:"smooth",block:"start"}); el.style.boxShadow="0 0 0 3px #1e293b"; setTimeout(()=>{el.style.boxShadow="";},900); } },350); }}
        onUpdate={updateReportFinding}/>}
    </div>
  );
}

// ============================================================
//  VUE LISTE
// ============================================================
// Niveaux d'arborescence disponibles
const TREE_LEVELS = [
  { id:"year",     key:"lvlYear",     get:(r)=> (r.date||"").slice(0,4) || t("noYear") },
  { id:"client",   key:"lvlClient",   get:(r)=> (r.client||"").trim() || t("noClient") },
  { id:"job",      key:"lvlJob",      get:(r)=> (r.projectNo||"").trim() || t("noJob") },
  { id:"location", key:"lvlLocation", get:(r)=> (r.location||"").trim() || t("noLocation") },
];

// Agrège les CONSTATS (anomalies + recommandations) d'un rapport : annotations (kind anomaly/reco)
// + anomalies des grilles d'inspection. Utilisé par le dashboard consolidé et son compteur.
function collectFindings(report){
  const out=[]; const rd=report.date||""; const rnum=report.num||report.projectNo||"";
  (report.annotations||[]).forEach(a=>{ if(a.kind==="anomaly"||a.kind==="reco"){
    out.push({ source:"ann", reportId:report.id, reportTitle:report.title||"", reportDate:rd, reportNum:rnum, id:a.id, kind:a.kind, title:a.title||"", desc:a.desc||"", severity:a.severity||"minor", equipment:a.equipment||"", priceWanted:a.priceWanted, corrected:!!a.corrected, correctedAt:a.correctedAt||null });
  }});
  (report.blocks||[]).forEach(b=>{ if(b.type==="inspect"){ (b.items||[]).forEach(it=>{ if(it.state==="anomaly"){
    out.push({ source:"inspect", reportId:report.id, reportTitle:report.title||"", reportDate:rd, reportNum:rnum, id:it.id, blkId:b.id, kind:"anomaly", title:it.label||"", desc:it.note||"", severity:it.severity||"minor", equipment:b.title||"", corrected:!!it.corrected, correctedAt:it.correctedAt||null });
  }}); }});
  return out;
}
function collectAllFindings(list){ return (list||[]).flatMap(collectFindings); }

function ListView({ db, all, query, setQuery, statusFilter, setStatusFilter, onOpen, onOpenAnomDash, onNew, onImport, onHandwriting, onPhotos, customTpls, onDelete, onDuplicate }){
  const anomTotal=collectAllFindings(all).length;
  const [showTpl,setShowTpl]=useState(false);
  const [rView,setRView]=useState("gallery"); // galerie (cartes) | grille (lignes compactes)
  const [order,setOrder]=useState(["client","job","location"]); // ordre des niveaux
  const [treePath,setTreePath]=useState([]); // ex: ["2025","Hydro","Poste 12"]
  const [narrow,setNarrow]=useState(typeof window!=="undefined" && window.innerWidth<640);
  useEffect(()=>{ const h=()=>setNarrow(window.innerWidth<640); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);
  const [impOpen,setImpOpen]=useState(false); // menu « Importer »
  const [clsOpen,setClsOpen]=useState(false); // menu « Classement »
  const counts={ all:all.length }; STATUSES.forEach(s=>{ counts[s.id]=all.filter(r=>r.status===s.id).length; });

  const levelGet=(id)=> (TREE_LEVELS.find(l=>l.id===id)||{}).get || (()=> "");

  // Construit l'arbre à partir de TOUS les rapports (db = déjà filtré par recherche+statut)
  function buildTree(list){
    const root={};
    list.forEach(r=>{
      let node=root;
      order.forEach(lvlId=>{
        const k=levelGet(lvlId)(r);
        node[k]=node[k]||{__count:0,__children:{}};
        node[k].__count++;
        node=node[k].__children;
      });
    });
    return root;
  }
  const tree=buildTree(db);

  // Rapports correspondant au chemin sélectionné dans l'arbre
  const treeFiltered = db.filter(r=> treePath.every((seg,i)=> levelGet(order[i])(r)===seg));

  function TreeNode({ node, path }){
    const keys=Object.keys(node).sort((a,b)=> b.localeCompare(a)); // années récentes d'abord, sinon alpha inverse
    return (
      <div style={{marginLeft:path.length?12:0}}>
        {keys.map(k=>{
          const here=[...path,k];
          const active = treePath.length>=here.length && here.every((s,i)=>treePath[i]===s);
          const isLeafSel = treePath.length===here.length && active;
          const children=node[k].__children;
          const hasChildren=Object.keys(children).length>0;
          return (
            <div key={k}>
              <div style={{...S.treeNode,...(isLeafSel?S.treeNodeOn:{})}} onClick={()=> setTreePath(isLeafSel? here.slice(0,-1) : here)}>
                <span style={{opacity:.5,fontSize:10}}>{hasChildren?(active?"▼":"▶"):"•"}</span>
                <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}</span>
                <span style={S.treeCount}>{node[k].__count}</span>
              </div>
              {hasChildren && active && <TreeNode node={children} path={here}/>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {/* Bandeau de statistiques. Sur mobile : 5 colonnes compactes sur UNE seule ligne. */}
      <div style={{display:"grid",gridTemplateColumns:narrow?"repeat(5,1fr)":"repeat(auto-fit,minmax(min(100%,110px),1fr))",gap:narrow?5:10,marginBottom:16}}>
        {[["all",t("filterAll"),counts.all,"#1e293b"], ...STATUSES.map(s=>[s.id,t(s.key),counts[s.id],s.color])].map(([k,lbl,c,col])=>(
          <button key={k} onClick={()=>setStatusFilter(k)} style={{textAlign:narrow?"center":"left",cursor:"pointer",background:"#fff",border:statusFilter===k?`2px solid ${col}`:"1px solid #e2e8f0",borderRadius:narrow?9:12,padding:narrow?"7px 3px":"14px 16px",boxShadow:"0 1px 2px rgba(0,0,0,.04)",minWidth:0}}>
            <div style={{fontSize:narrow?18:26,fontWeight:800,color:col,fontFamily:"'Archivo'",lineHeight:1}}>{c}</div>
            <div style={{fontSize:narrow?8.5:11,color:"#64748b",marginTop:narrow?2:4,textTransform:"uppercase",letterSpacing:narrow?0:.5,fontWeight:700,lineHeight:1.1,overflow:"hidden"}}>{lbl}</div>
          </button>
        ))}
      </div>

      {/* Actions : Importer ▾ · (Anomalies) · + Nouveau — UNE seule ligne (icônes compactes sur mobile) */}
      <div style={{display:"flex",gap:narrow?6:8,alignItems:"center",flexWrap:narrow?"nowrap":"wrap",marginBottom:16}}>
        <div style={{position:"relative",flexShrink:0}}>
          <button style={{...S.btnDark,cursor:"pointer",...(narrow?{padding:"9px 12px"}:{})}} onClick={()=>{setImpOpen(v=>!v);setClsOpen(false);}}>📥{narrow?" ▾":` ${LANG==="en"?"Import":"Importer"} ▾`}</button>
          {impOpen && (
            <div style={{position:"absolute",left:0,top:"110%",zIndex:50,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 28px rgba(0,0,0,.18)",padding:6,minWidth:210}} onMouseLeave={()=>setImpOpen(false)}>
              <label style={{...S.blockMenuItem,display:"block",cursor:"pointer",fontWeight:700}}>📄 {t("importDoc")}
                <input type="file" accept="application/pdf" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; setImpOpen(false); if(f) onImport(f); e.target.value=""; }}/>
              </label>
              <label style={{...S.blockMenuItem,display:"block",cursor:"pointer",fontWeight:700}}>✍ {t("handwriting")}
                <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; setImpOpen(false); if(f) onHandwriting(f); e.target.value=""; }}/>
              </label>
              <button style={{...S.blockMenuItem,fontWeight:700}} onClick={()=>{setImpOpen(false);onPhotos();}}>📷 {LANG==="en"?"Photos":"Photos"}</button>
            </div>
          )}
        </div>
        {anomTotal>0 && <button style={{...S.btnGhost,borderColor:"#e3a0a0",color:"#9d0208",flexShrink:0,...(narrow?{padding:"9px 12px"}:{})}} onClick={onOpenAnomDash} title={LANG==="en"?"All anomalies & recommendations":"Toutes les anomalies et recommandations"}>⚠ {anomTotal}</button>}
        <button style={{...S.btnPrimary,flexShrink:0,...(narrow?{padding:"9px 14px"}:{})}} onClick={()=>setShowTpl(true)}>+{narrow?"":` ${t("newReport")}`}</button>
      </div>

      {/* Recherche pleine largeur (le filtrage par statut se fait via les cartes de stats ci-dessus) */}
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
        <input style={{...S.input,flex:1,minWidth:0}} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("search")}/>
        <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden",background:"#fff",flexShrink:0}}>
          {[["gallery","▦"],["grid","≣"]].map(([v,ic])=>(
            <button key={v} onClick={()=>setRView(v)} title={v==="gallery"?(LANG==="en"?"Gallery":"Galerie"):(LANG==="en"?"List":"Grille")} style={{border:"none",background:rView===v?"#1e293b":"transparent",color:rView===v?"#fff":"#64748b",padding:"7px 12px",cursor:"pointer",fontSize:15,lineHeight:1}}>{ic}</button>
          ))}
        </div>
      </div>

      {showTpl && (
        <div style={S.overlay} onClick={()=>setShowTpl(false)}>
          <div style={{...S.modal,maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <h2 style={S.h2}>{t("chooseTemplate")}</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {visTpls().map(tp=>(<button key={tp.id} style={S.tplCard} onClick={()=>{setShowTpl(false);onNew(tp.id);}}>{t(tp.key)}</button>))}
              {(customTpls||[]).map(c=>(<button key={c.id} style={{...S.tplCard,borderColor:"#6b4e9d",color:"#6b4e9d"}} onClick={()=>{setShowTpl(false);onNew(c.id);}}>★ {c.name}</button>))}
            </div>
            <div style={{marginTop:14}}><button style={S.btnGhost} onClick={()=>setShowTpl(false)}>{t("cancel")}</button></div>
          </div>
        </div>
      )}

      {/* CLASSEMENT : barre horizontale compacte (comme la recherche), AU-DESSUS des cartes.
          Fil d'Ariane + dossiers du niveau courant cliquables. */}
      <div>
        {db.length>0 && (()=>{
          let cur=tree; for(const seg of treePath){ cur=(cur[seg]&&cur[seg].__children)||{}; }
          const curKeys=Object.keys(cur).sort((a,b)=>b.localeCompare(a));
          return (
          <div style={{display:"flex",gap:8,alignItems:"center",overflowX:"auto",WebkitOverflowScrolling:"touch",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"8px 12px",marginBottom:14}}>
            <div style={{position:"relative",flexShrink:0}}>
              <button style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,fontSize:12.5,color:"#475569"}} onClick={()=>{setClsOpen(v=>!v);setImpOpen(false);}} title={t("treeOrder")}>⇅ ▾</button>
              {clsOpen && (
                <div style={{position:"absolute",left:0,top:"110%",zIndex:50,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 28px rgba(0,0,0,.18)",padding:8,minWidth:200}} onMouseLeave={()=>setClsOpen(false)}>
                  <div style={{fontSize:10.5,color:"#64748b",padding:"0 4px 6px"}}>{LANG==="en"?"Tap a level to move it first":"Touchez un niveau pour le mettre en premier"}</div>
                  {order.map((lvlId,i)=>(
                    <button key={lvlId} style={{...S.blockMenuItem,fontWeight:700}} onClick={()=>{ const next=[lvlId,...order.filter(x=>x!==lvlId)]; setOrder(next); setTreePath([]); setClsOpen(false); }}>{i+1}. {t((TREE_LEVELS.find(l=>l.id===lvlId)||{}).key)}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={()=>setTreePath([])} style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:6,border:"none",background:treePath.length===0?"#1e293b":"transparent",color:treePath.length===0?"#fff":"#1e293b",borderRadius:7,padding:"5px 11px",cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,fontSize:12.5}}>📁 {t("treeAll")} <span style={{...S.treeCount,background:treePath.length===0?"rgba(255,255,255,.2)":undefined,color:treePath.length===0?"#fff":undefined}}>{db.length}</span></button>
            {treePath.map((seg,i)=>(<span key={i} style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:8}}><span style={{color:"#94a3b8"}}>›</span><button onClick={()=>setTreePath(treePath.slice(0,i+1))} style={{border:"none",background:"transparent",cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,fontSize:12.5,color:"#1e293b",whiteSpace:"nowrap"}}>{seg}</button></span>))}
            {curKeys.length>0 && <span style={{flexShrink:0,width:1,height:18,background:"#e2e8f0"}}/>}
            {curKeys.map(k=>(<button key={k} onClick={()=>setTreePath([...treePath,k])} style={{...S.treeOrderChip,flexShrink:0,whiteSpace:"nowrap"}}>{k} <span style={S.treeCount}>{cur[k].__count}</span></button>))}
          </div>
          );
        })()}

        <div style={{minWidth:0}}>
          {treeFiltered.length===0 ? <div style={{textAlign:"center",color:"#64748b",padding:"48px 0"}}>{t("noReports")}</div> : (
            rView==="grid" ? (
              /* GRILLE = lignes compactes */
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {treeFiltered.map(r=>{
                  const tpl=t((TEMPLATES.find(x=>x.id===r.template)||{}).key||"");
                  return (
                    <div key={r.id} onClick={()=>onOpen(r.id)} style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",cursor:"pointer"}}>
                      <span style={{...S.pill,background:statusColor(r.status)}}>{statusLabel(r.status)}</span>
                      <div style={{minWidth:160,flex:1}}>
                        <div style={{fontWeight:700,color:"#0f172a"}}>{r.title||"(sans titre)"}</div>
                        <div style={{fontSize:12,color:"#64748b"}}>{tpl}{r.client?` · ${r.client}`:""}{r.projectNo?` · ${r.projectNo}`:""}</div>
                      </div>
                      <span style={{fontSize:11,color:"#94a3b8"}}>{t("version")}{r.version} · {new Date(r.updatedAt).toLocaleDateString()}</span>
                      <span style={{display:"flex",gap:8,marginLeft:"auto"}}>
                        <button style={S.miniBtn} onClick={(e)=>{e.stopPropagation();onDuplicate(r.id,true);}}>{t("newVersion")}</button>
                        <button style={S.miniBtnDel} onClick={(e)=>{e.stopPropagation();onDelete(r.id);}}>{t("del")}</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
            <div style={S.grid}>
              {treeFiltered.map(r=>{
                const tpl=t((TEMPLATES.find(x=>x.id===r.template)||{}).key||"");
                return (
                  <div key={r.id} style={S.card} onClick={()=>onOpen(r.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={S.cardTitle}>{r.title||"(sans titre)"}</div>
                      <span style={{...S.pill,background:statusColor(r.status)}}>{statusLabel(r.status)}</span>
                    </div>
                    <div style={S.cardMeta}>{tpl}{r.client?` · ${r.client}`:""}{r.projectNo?` · ${r.projectNo}`:""}</div>
                    <div style={S.cardFoot}>
                      <span>{t("version")}{r.version} · {t("lastEdit")} {new Date(r.updatedAt).toLocaleDateString()}</span>
                      <span style={{display:"flex",gap:8}}>
                        <button style={S.miniBtn} onClick={(e)=>{e.stopPropagation();onDuplicate(r.id,true);}}>{t("newVersion")}</button>
                        <button style={S.miniBtnDel} onClick={(e)=>{e.stopPropagation();onDelete(r.id);}}>{t("del")}</button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  VUE GABARITS (modèles)
// ============================================================
function TemplatesView({ custom, onImportPdf, onDelete, onUse, onHide, onRestore, hiddenCount }){
  const [preview,setPreview]=useState(null); // {kind:'default'|'custom', id}
  const [tView,setTView]=useState("gallery"); // galerie (cartes) | grille (lignes)
  // Ligne compacte (mode grille) — réutilisée pour custom et défauts.
  const Row=({ id, name, count, onName, onDel })=>(
    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"8px 14px"}}>
      <div style={{minWidth:160,flex:1,cursor:"pointer",fontWeight:700,color:"#0f172a"}} onClick={onName}>{name}</div>
      <span style={{fontSize:12,color:"#64748b"}}>{count} {LANG==="en"?"blocks":"blocs"}</span>
      <span style={{display:"flex",gap:8,marginLeft:"auto"}}>
        <button style={{...S.btnPrimary,fontSize:12,padding:"5px 12px"}} onClick={()=>onUse(id)}>{t("tplUse")}</button>
        <button style={S.miniBtnDel} onClick={onDel}>{t("del")}</button>
      </span>
    </div>
  );
  function blocksOf(p){ return p.kind==="custom" ? (custom.find(c=>c.id===p.id)||{}).blocks||[] : tplBlocks(p.id); }
  function nameOf(p){ return p.kind==="custom" ? (custom.find(c=>c.id===p.id)||{}).name||"" : t((TEMPLATES.find(x=>x.id===p.id)||{}).key); }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:8}}>
        <h2 style={{...S.h2,margin:0}}>{t("tplManage")}</h2>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden",background:"#fff"}}>
            {[["gallery","▦"],["grid","≣"]].map(([v,ic])=>(
              <button key={v} onClick={()=>setTView(v)} style={{border:"none",background:tView===v?"#1e293b":"transparent",color:tView===v?"#fff":"#64748b",padding:"7px 12px",cursor:"pointer",fontSize:15,lineHeight:1}}>{ic}</button>
            ))}
          </div>
          <label style={{...S.btnDark,cursor:"pointer",display:"inline-flex",alignItems:"center"}}>{t("tplImportPdf")}
            <input type="file" accept="application/pdf" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; if(f) onImportPdf(f); e.target.value=""; }}/>
          </label>
        </div>
      </div>
      <p style={{...S.hint,marginBottom:16}}>{LANG==="en"?"Import a PDF to turn its structure into a reusable empty template.":"Importe un PDF pour transformer sa structure en gabarit réutilisable vierge."}</p>

      <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#475569",marginBottom:8}}>{t("tplCustom")}</div>
      {custom.length===0 ? <div style={{color:"#64748b",fontSize:13,marginBottom:18}}>{t("tplNoCustom")}</div> : tView==="grid" ? (
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {custom.map(c=>(<Row key={c.id} id={c.id} name={c.name||"(gabarit)"} count={(c.blocks||[]).length} onName={()=>setPreview({kind:"custom",id:c.id})} onDel={()=>onDelete(c.id)}/>))}
        </div>
      ) : (
        <div style={{...S.grid,marginBottom:20}}>
          {custom.map(c=>(
            <div key={c.id} style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={S.cardTitle} onClick={()=>setPreview({kind:"custom",id:c.id})}>{c.name||"(gabarit)"}</div>
                <button style={S.miniBtnDel} onClick={()=>onDelete(c.id)}>{t("del")}</button>
              </div>
              <div style={S.cardMeta}>{(c.blocks||[]).length} {LANG==="en"?"blocks":"blocs"}</div>
              <div style={{marginTop:8,fontSize:11,color:"#64748b"}}>
                {(c.blocks||[]).slice(0,8).map((b,i)=>(<span key={i} style={S.tplTag}>{b.type==="section"?"§ "+b.title:b.type==="table"?"▦ "+b.title:b.type==="photos"?"🖼":"¶"}</span>))}
              </div>
              <button style={{...S.btnPrimary,marginTop:10,fontSize:12,padding:"7px 14px"}} onClick={()=>onUse(c.id)}>{t("tplUse")}</button>
            </div>
          ))}
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8,flexWrap:"wrap"}}>
        <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#475569"}}>{t("tplDefaults")}</div>
        {hiddenCount>0 && <button style={{...S.miniBtn}} onClick={onRestore}>↺ {LANG==="en"?`Restore defaults (${hiddenCount})`:`Restaurer les défauts (${hiddenCount})`}</button>}
      </div>
      {tView==="grid" ? (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {visTpls().map(tp=>(<Row key={tp.id} id={tp.id} name={t(tp.key)} count={tplBlocks(tp.id).length} onName={()=>setPreview({kind:"default",id:tp.id})} onDel={()=>{ if(confirm(LANG==="en"?"Hide this default template?":"Masquer ce gabarit par défaut ?")) onHide(tp.id); }}/>))}
        </div>
      ) : (
      <div style={S.grid}>
        {visTpls().map(tp=>{
          const blocks=tplBlocks(tp.id);
          return (
            <div key={tp.id} style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={S.cardTitle} onClick={()=>setPreview({kind:"default",id:tp.id})}>{t(tp.key)}</div>
                <button style={S.miniBtnDel} title={LANG==="en"?"Hide this template":"Masquer ce gabarit"} onClick={()=>{ if(confirm(LANG==="en"?"Hide this default template?":"Masquer ce gabarit par défaut ?")) onHide(tp.id); }}>{t("del")}</button>
              </div>
              <div style={S.cardMeta}>{blocks.length} {LANG==="en"?"blocks":"blocs"}</div>
              <div style={{marginTop:8,fontSize:11,color:"#64748b"}}>
                {blocks.map((b,i)=>(<span key={i} style={S.tplTag}>{b.type==="section"?"§ "+b.title:b.type==="photos"?"🖼 "+b.title:"¶"}</span>))}
              </div>
              <button style={{...S.btnPrimary,marginTop:10,fontSize:12,padding:"7px 14px"}} onClick={()=>onUse(tp.id)}>{t("tplUse")}</button>
            </div>
          );
        })}
      </div>
      )}

      {preview && (()=>{ const blocks=blocksOf(preview); return (
        <div style={S.overlay} onClick={()=>setPreview(null)}>
          <div style={{...S.modal,maxWidth:560,maxHeight:"82vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h2 style={S.h2}>{nameOf(preview)}</h2>
            {blocks.map((b,i)=>(
              <div key={i} style={{marginBottom:10,padding:10,border:"1px solid #e2e8f0",borderRadius:8,background:"#f8fafc"}}>
                <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#1e293b"}}>{b.type==="section"?"§ "+b.title:b.type==="table"?"▦ "+b.title:b.type==="photos"?"🖼 "+b.title:"¶ "+t("freeText")}</div>
                {b.type==="section" && <div style={{fontSize:12,color:"#475569",marginTop:4}}>{(b.fields||[]).map(f=>f.label).join(" · ")}</div>}
                {b.type==="table" && <div style={{fontSize:12,color:"#475569",marginTop:4}}>{(b.columns||[]).join(" | ")}</div>}
              </div>
            ))}
            <button style={S.btnGhost} onClick={()=>setPreview(null)}>{t("cancel")}</button>
          </div>
        </div>
      ); })()}
    </div>
  );
}

// ============================================================
//  PRÉVISUALISATION IMPORT (choix gabarit)
// ============================================================
function ImportReview({ ip, setIp, onApply, onCancel }){
  return (
    <div style={S.overlay} onClick={onCancel}>
      <div style={{...S.modal,maxWidth:640,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h2 style={S.h2}>{ip.handwriting?"✍":"📄"} {t("importReview")}</h2>
        {ip.truncated && <div style={{background:"#fef6ec",border:"1.5px solid #e0a96d",borderRadius:8,padding:"8px 10px",marginBottom:12,fontSize:12,color:"#9d6b2e"}}>{t("truncWarn")}</div>}
        {ip.handwriting && <div style={{background:"#f3eefb",border:"1.5px solid #b9a3dd",borderRadius:8,padding:"8px 10px",marginBottom:12,fontSize:12,color:"#5a3d8c"}}>{t("uncertainNote")}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><label style={S.label}>{t("title")}</label><input style={S.input} value={ip.title} onChange={e=>setIp({...ip,title:e.target.value})}/></div>
          <div><label style={S.label}>{t("client")}</label><input style={S.input} value={ip.client} onChange={e=>setIp({...ip,client:e.target.value})}/></div>
          <div><label style={S.label}>{t("location")}</label><input style={S.input} value={ip.location} onChange={e=>setIp({...ip,location:e.target.value})}/></div>
          <div><label style={S.label}>{t("projectNo")}</label><input style={S.input} value={ip.projectNo} onChange={e=>setIp({...ip,projectNo:e.target.value})}/></div>
        </div>
        <label style={S.label}>{t("templateSuggested")}</label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {visTpls().map(tp=>(<button key={tp.id} onClick={()=>setIp({...ip,template:tp.id})} style={{...S.chip,...(ip.template===tp.id?S.chipOn:{})}}>{t(tp.key)}</button>))}
        </div>
        <label style={S.label}>{t("extractedContent")} ({ip.blocks.length})</label>
        <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:10,maxHeight:240,overflowY:"auto",background:"#f8fafc",fontSize:12}}>
          {ip.blocks.map((b,i)=>(
            <div key={i} style={{marginBottom:8}}>
              {b.type==="section" && <><b>§ {b.title}</b>{(b.fields||[]).map((f,j)=><div key={j} style={{paddingLeft:10,color:"#475569"}}>{f.label}: {f.value||"—"}</div>)}</>}
              {b.type==="text" && <div style={{color:"#1e293b"}}>{b.value?b.value.slice(0,160):"—"}{b.value&&b.value.length>160?"…":""}</div>}
              {b.type==="photos" && <i style={{color:"#999"}}>🖼 {t("photoZone")}</i>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <button style={S.btnPrimary} onClick={onApply}>{t("applyImport")}</button>
          <button style={S.btnGhost} onClick={onCancel}>{t("cancel")}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  RÉGLAGES
// ============================================================
function SettingsModal({ logo, onLogo, theme, onTheme, onClose }){
  // Clé IA gérée côté serveur (proxy /api/rapports/ai) : plus de champ clé ici.
  const [th,setTh]=useState({...theme});
  function setColor(k,v){ const next={...th,[k]:v}; setTh(next); onTheme(next); }
  function resetTheme(){ setTh({...DEFAULT_THEME}); onTheme({...DEFAULT_THEME}); }
  const COLOR_FIELDS=[["secBar","themeSecBar"],["tableHd","themeTableHd"],["accent","themeAccent"],["title","themeTitle"],["text","themeText"],["border","themeBorder"]];
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:520,maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h2 style={S.h2}>⚙ {t("settings")}</h2>
        {/* Le logo vient automatiquement du TENANT (ou C-Secur360 par défaut), comme les autres
            modules : aucun réglage de logo propre au module ici. */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          {logo && <img src={logo} alt="" style={{maxHeight:40,maxWidth:120,objectFit:"contain"}}/>}
          <span style={{fontSize:12,color:"#64748b"}}>{LANG==="en"?"Logo from your organization (automatic)":"Logo de votre organisation (automatique)"}</span>
        </div>

        {/* THÈME DE COULEURS */}
        <div style={{borderTop:"1px solid #e2e8f0",paddingTop:14,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{...S.label,margin:0}}>🎨 {t("themeTitle2")}</div>
            <button style={{...S.btnGhost,fontSize:11,padding:"5px 10px"}} onClick={resetTheme}>{t("themeReset")}</button>
          </div>
          <p style={{...S.hint,marginTop:0,marginBottom:10}}>{t("themeHint")}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {COLOR_FIELDS.map(([k,lblKey])=>(
              <label key={k} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#1e293b"}}>
                <input type="color" value={th[k]} onChange={e=>setColor(k,e.target.value)} style={{width:34,height:30,border:"1px solid #e2e8f0",borderRadius:6,padding:0,cursor:"pointer",background:"none"}}/>
                <span>{t(lblKey)}</span>
              </label>
            ))}
          </div>
          {/* aperçu */}
          <div style={{marginTop:12,border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden"}}>
            <div style={{background:th.secBar,color:"#fff",fontFamily:"'Archivo'",fontWeight:700,fontSize:11,padding:"4px 10px"}}>{LANG==="en"?"Section title":"Titre de section"}</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead><tr><th style={{background:th.tableHd,color:"#fff",padding:"3px 8px",textAlign:"left"}}>Col A</th><th style={{background:th.tableHd,color:"#fff",padding:"3px 8px",textAlign:"left"}}>Col B</th></tr></thead>
              <tbody><tr><td style={{padding:"3px 8px",borderTop:"1px solid "+th.border,color:th.text}}>{LANG==="en"?"Sample":"Exemple"}</td><td style={{padding:"3px 8px",borderTop:"1px solid "+th.border,color:th.text}}>123</td></tr></tbody>
            </table>
            <div style={{padding:"6px 10px",fontFamily:"'Archivo'",fontWeight:900,color:th.title,fontSize:13}}>{LANG==="en"?"Report title":"Titre du rapport"}</div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <button style={S.btnPrimary} onClick={onClose}>{LANG==="en"?"Done":"Terminé"}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  ÉDITEUR DE RAPPORT
// ============================================================
function Editor({ report, logo, customTpls, onUpdate, onDuplicate }){
  const [r,setR]=useState(report);
  const tplLabel=t((TEMPLATES.find(x=>x.id===r.template)||{}).key||"");
  const [lightbox,setLightbox]=useState(null);
  const [showAnn,setShowAnn]=useState(false);
  const [showInsert,setShowInsert]=useState(false);
  const [showCompare,setShowCompare]=useState(false);
  const [fixing,setFixing]=useState(false);
  const [fixMsg,setFixMsg]=useState(null);
  const [savedFlash,setSavedFlash]=useState(false);
  const [paleExport,setPaleExport]=useState(false); // export "à compléter à la main" (valeurs en pâle)
  const [updatesExport,setUpdatesExport]=useState(false); // export "mises à jour seulement"
  const [showLink,setShowLink]=useState(false);   // panneau "Lier au projet / événement"
  const [showSoum,setShowSoum]=useState(false);   // constructeur de soumission depuis anomalies/recos
  const [showTools,setShowTools]=useState(false); // menu "⋯" (actions repliées sur mobile)
  const [qr,setQr]=useState(null);                // { url, data } QR du rapport (deep-link ?r=)
  const [qrMap,setQrMap]=useState({});            // { sectionId: {url,data} } QR par section/équipement
  const [showQr,setShowQr]=useState(false);
  const [showShare,setShowShare]=useState(false); // partage au vérificateur (lien tokenisé)
  const [showNav,setShowNav]=useState(false);
  const [showCover,setShowCover]=useState(false);
  const [showLetter,setShowLetter]=useState(false); // éditeur de lettre de présentation
  const [showDga,setShowDga]=useState(false);       // sélecteur d'analyse DGA à insérer
  const [insertAt,setInsertAt]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [navFilter,setNavFilter]=useState("all");
  function jumpToBlock(bid){
    const el=document.getElementById("blk-"+bid);
    if(el){ el.scrollIntoView({behavior:"smooth",block:"start"}); el.style.transition="box-shadow .3s"; el.style.boxShadow="0 0 0 3px #1e293b"; setTimeout(()=>{el.style.boxShadow="";},900); }
    setShowNav(false);
  }
  const [dragId,setDragId]=useState(null);
  const [overId,setOverId]=useState(null);
  const [narrow,setNarrow]=useState(typeof window!=="undefined" && window.innerWidth<640);
  const [openMenuId,setOpenMenuId]=useState(null);
  useEffect(()=>{ const h=()=>setNarrow(window.innerWidth<640); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);
  const [pdfBusy,setPdfBusy]=useState(false);
  useEffect(()=>{ setR(report); },[report.id]);
  // Identité d'équipement stable : toute section sans eqId en reçoit un (création gabarit, import,
  // ajout manuel, anciens rapports). C'est la cible « logique » des QR — l'étiquette reste valide.
  useEffect(()=>{
    const secs=(report.blocks||[]).filter(b=>b.type==="section");
    if(secs.length && secs.some(b=>!b.eqId)){
      const blocks=(report.blocks||[]).map(b=> (b.type==="section"&&!b.eqId)?{...b,eqId:eqid()}:b);
      commit({...report, blocks});
    }
  // eslint-disable-next-line
  },[report.id]);
  // QR codes du rapport. DEUX niveaux (comme les étiquettes d'équipement DGA) :
  //  • QR RAPPORT  -> /{tenant}/rapports?r=<id>            (ouvre le rapport complet)
  //  • QR SECTION  -> /{tenant}/rapports?r=<id>&blk=<sec>  (ouvre DIRECTEMENT cette section/équipement)
  // Le client colle le QR de section sur l'équipement ; le scan ouvre la bonne page à remplir, en
  // direct, et tout s'assemble dans le rapport complet. Généré client-only (import dynamique).
  const sectionIds=(r.blocks||[]).filter(b=>b.type==="section").map(b=>b.id).join(",");
  useEffect(()=>{ let on=true; (async()=>{
    try{
      const QR=(await import("qrcode")).default;
      const tn=(window.location.pathname.split("/").filter(Boolean)[0])||"";
      const base=`${window.location.origin}/${tn}/rapports?r=${report.id}`;
      const data=await QR.toDataURL(base,{margin:1,width:240});
      const map={};
      for(const b of (r.blocks||[]).filter(x=>x.type==="section")){
        // Cible l'identité d'équipement STABLE (eqId) ; repli sur l'id de bloc si pas encore assigné.
        const target = b.eqId ? `${base}&eq=${b.eqId}` : `${base}&blk=${b.id}`;
        map[b.id]={ url:target, data: await QR.toDataURL(target,{margin:1,width:200}) };
      }
      if(on){ setQr({url:base,data}); setQrMap(map); }
    }catch(e){ if(on){ setQr(null); setQrMap({}); } }
  })(); return ()=>{on=false;}; },[report.id, sectionIds]);

  // PRÉSENCE TEMPS RÉEL (Supabase Realtime) : qui est sur ce rapport + quelle section il édite.
  const presenceChan=useRef(null);
  const myInfo=useRef(null);
  const editTimer=useRef(null);
  const myEditingBlock=useRef(null); // bloc que J'édite (préservé lors d'une fusion distante)
  const rRef=useRef(report);         // dernière version locale (pour la fusion sans dépendances)
  const bcTimer=useRef(null);
  const [peers,setPeers]=useState([]);
  useEffect(()=>{ let cancelled=false;
    (async()=>{
      let me={ id:"u_"+Math.random().toString(36).slice(2,9), name:LANG==="en"?"Collaborator":"Collaborateur" };
      try{ const res=await fetch("/api/auth/me",{credentials:"include"}); if(res.ok){ const j=await res.json(); if(j.user){ me={ id:j.user.id||me.id, name:j.user.name||j.user.email||me.name }; } } }catch{}
      me.color=PRESENCE_COLORS[hashInt(me.id)%PRESENCE_COLORS.length];
      myInfo.current=me;
      if(cancelled) return;
      let chan;
      try{
        chan=supabase.channel("rapport:"+report.id,{ config:{ presence:{ key:me.id } } });
        chan.on("presence",{event:"sync"},()=>{
          const st=chan.presenceState(); const list=[];
          Object.keys(st||{}).forEach(k=>{ const m=(st[k]&&st[k][0])||{}; if(m.id && m.id!==me.id) list.push(m); });
          setPeers(list);
        });
        // Synchro de contenu en direct : on applique les blocs distants, SAUF celui qu'on édite
        // (validate-before-merge léger : mon édition en cours gagne localement, je verrai la leur après).
        chan.on("broadcast",{event:"blocks"},({payload})=>{
          if(!payload || payload.from===me.id || !Array.isArray(payload.blocks)) return;
          setR(prev=>{
            const incoming=new Map(payload.blocks.map(b=>[b.id,b]));
            let changed=false;
            const merged=(prev.blocks||[]).map(b=>{
              if(b.id===myEditingBlock.current) return b;           // je l'édite -> je garde le mien
              const inc=incoming.get(b.id);
              if(inc && JSON.stringify(inc)!==JSON.stringify(b)){ changed=true; return inc; }
              return b;
            });
            if(!changed) return prev;
            const next={...prev,blocks:merged};
            rRef.current=next;
            return next; // setR direct (pas onUpdate) : l'émetteur a déjà sauvegardé côté serveur
          });
        });
        chan.subscribe(async(status)=>{ if(status==="SUBSCRIBED" && !cancelled){ try{ await chan.track({ ...me, blockId:null, at:Date.now() }); }catch{} } });
        presenceChan.current=chan;
      }catch{}
    })();
    return ()=>{ cancelled=true; try{ presenceChan.current && supabase.removeChannel(presenceChan.current); }catch{} presenceChan.current=null; setPeers([]); };
  // eslint-disable-next-line
  },[report.id]);
  // Diffuse la section en cours d'édition (verrou souple : les autres voient « X édite »).
  function broadcastEditing(blockId){
    myEditingBlock.current=blockId;
    const ch=presenceChan.current, me=myInfo.current; if(!ch||!me) return;
    try{ ch.track({ ...me, blockId, at:Date.now() }); }catch{}
    clearTimeout(editTimer.current);
    editTimer.current=setTimeout(()=>{ myEditingBlock.current=null; try{ ch.track({ ...me, blockId:null, at:Date.now() }); }catch{} },4000);
  }
  // Diffuse l'état des blocs aux collaborateurs (debounce ; ils fusionnent sans toucher leur édition).
  function broadcastBlocks(next){
    const ch=presenceChan.current, me=myInfo.current; if(!ch||!me) return;
    clearTimeout(bcTimer.current);
    bcTimer.current=setTimeout(()=>{ try{ ch.send({ type:"broadcast", event:"blocks", payload:{ from:me.id, blocks:next.blocks||[] } }); }catch{} },500);
  }

  function commit(next){ rRef.current=next; setR(next); onUpdate(next); setSavedFlash(true); broadcastBlocks(next); }
  useEffect(()=>{ if(!savedFlash) return; const id=setTimeout(()=>setSavedFlash(false),1200); return ()=>clearTimeout(id); },[savedFlash]);
  function setField(k,v){ commit({...r,[k]:v}); }
  function setBlocks(blocks){ commit({...r,blocks}); }
  function updBlock(id,patch){ broadcastEditing(id); setBlocks(r.blocks.map(b=>b.id===id?{...b,...patch}:b)); }
  function removeBlock(id){ setBlocks(r.blocks.filter(b=>b.id!==id)); }
  function moveBlock(id,dir){ const i=r.blocks.findIndex(b=>b.id===id); const j=i+dir; if(j<0||j>=r.blocks.length)return; const a=[...r.blocks]; [a[i],a[j]]=[a[j],a[i]]; setBlocks(a); }
  function duplicateBlock(id){
    const i=r.blocks.findIndex(b=>b.id===id); if(i<0)return;
    const src=r.blocks[i];
    const copy=cloneBlockFresh(src);
    const a=[...r.blocks]; a.splice(i+1,0,copy); setBlocks(a);
  }
  // Un "équipement" = une section + tous les blocs qui suivent jusqu'à la prochaine section
  function groupRange(startIdx){
    let end=startIdx+1;
    while(end<r.blocks.length && r.blocks[end].type!=="section") end++;
    return [startIdx, end]; // [début inclus, fin exclue]
  }
  function duplicateGroup(id){
    const i=r.blocks.findIndex(b=>b.id===id); if(i<0||r.blocks[i].type!=="section")return;
    const [s,e]=groupRange(i);
    const clones=r.blocks.slice(s,e).map(cloneBlockFresh);
    // marquer le titre de la section dupliquée
    if(clones[0]) clones[0].title=(clones[0].title||"")+" "+t("copyTag");
    const a=[...r.blocks]; a.splice(e,0,...clones); setBlocks(a);
  }
  // Ajouter un équipement complet (section infos + grille inspection + photos)
  function addEquipment(){
    const sec={type:"section",id:bid(),title:t("equipNew"),fields:[
      {id:bid(),label:t("equipFab"),value:""},{id:bid(),label:t("equipModel"),value:""},
      {id:bid(),label:t("equipSerial"),value:""},{id:bid(),label:t("equipLoc"),value:""}
    ]};
    const insp={type:"inspect",id:bid(),title:t("inspectTitle"),items:[
      {id:bid(),label:"",state:"good",note:""}
    ]};
    const ph={type:"photos",id:bid(),title:t("photoZone"),photos:[]};
    setBlocks([...r.blocks,sec,insp,ph]);
  }
  function reorderBlocks(fromId,toId){
    if(fromId===toId) return;
    const a=[...r.blocks];
    const fi=a.findIndex(b=>b.id===fromId), ti=a.findIndex(b=>b.id===toId);
    if(fi<0||ti<0) return;
    const [moved]=a.splice(fi,1); a.splice(ti,0,moved); setBlocks(a);
  }
  // Convertir une section (libellé→valeur) en grille d'inspection (chaque libellé devient un point)
  function convertToInspect(id){
    const i=r.blocks.findIndex(b=>b.id===id); if(i<0||r.blocks[i].type!=="section")return;
    const sec=r.blocks[i];
    const items=(sec.fields||[]).filter(f=>(f.label||"").trim()).map(f=>({id:bid(),label:f.label,state:"good",note:""}));
    if(items.length===0){ alert(t("convertEmpty")); return; }
    const insp={type:"inspect",id:bid(),title:sec.title||t("inspectTitle"),items};
    const a=[...r.blocks]; a[i]=insp; setBlocks(a);
  }
  // Reconvertir une grille d'inspection en section (le libellé reste, l'état devient la valeur)
  function convertToSection(id){
    const i=r.blocks.findIndex(b=>b.id===id); if(i<0||r.blocks[i].type!=="inspect")return;
    const insp=r.blocks[i];
    const fields=(insp.items||[]).map(it=>({ id:bid(), label:it.label||"", value: it.state==="anomaly" ? (inspLabel("anomaly")+(it.note?" — "+it.note:"")) : (it.state&&it.state!=="good"?inspLabel(it.state):inspLabel("good")) }));
    const sec={type:"section",id:bid(),title:insp.title||t("sectionTitle"),fields: fields.length?fields:[{id:bid(),label:"",value:""}]};
    const a=[...r.blocks]; a[i]=sec; setBlocks(a);
  }
  function makeBlock(type){
    if(type==="zone") return {type:"zone",id:bid(),title:LANG==="en"?"New zone":"Nouvelle zone",newPage:true};
    if(type==="section") return {type:"section",id:bid(),title:t("sectionTitle"),fields:[{id:bid(),label:"",value:""}]};
    if(type==="table") return {type:"table",id:bid(),title:t("tableTitle"),columns:["",""],rows:[["",""]]};
    if(type==="inspect") return {type:"inspect",id:bid(),title:t("inspectTitle"),items:[{id:bid(),label:"",state:"good",note:""}]};
    if(type==="photos") return {type:"photos",id:bid(),title:t("photoZone"),layout:"2col",photos:[{id:bid(),data:null,caption:""},{id:bid(),data:null,caption:""}]};
    return {type:"text",id:bid(),value:"",placeholder:t("freeText")};
  }
  function addBlock(type, atIndex){
    const b=makeBlock(type);
    if(atIndex==null || atIndex>=r.blocks.length){ setBlocks([...r.blocks,b]); }
    else { const a=[...r.blocks]; a.splice(atIndex,0,b); setBlocks(a); }
    return b.id;
  }
  // Insère une analyse DGA (résumé embarqué = snapshot, s'imprime même hors-ligne / après évolution).
  function insertDgaBlock(summary){
    const b={ type:"dga", id:bid(), summary, importedAt:new Date().toISOString() };
    setBlocks([...r.blocks, b]); setShowDga(false);
  }
  // Importer un PDF externe -> bloc "pdfpage" avec une image par page
  async function addPdfPageBlock(file){
    setPdfBusy(true);
    try{
      const images=await pdfFileToImages(file);
      const b={ type:"pdfpage", id:bid(), name:file.name, pages:images };
      setBlocks([...r.blocks, b]);
    }catch(e){ alert((LANG==="en"?"PDF error: ":"Erreur PDF : ")+e.message); }
    setPdfBusy(false);
  }
  // Insérer une page gabarit à une position (après l'index donné)
  function insertTemplatePage(tplId, afterIdx){
    const custom=(customTpls||[]).find(c=>c.id===tplId);
    let newBlocks = custom ? emptyBlockValues(JSON.parse(JSON.stringify(custom.blocks||[]))) : tplBlocks(tplId);
    // ré-attribuer des ids uniques pour éviter les collisions avec les blocs existants
    newBlocks = newBlocks.map(b=>({...b, id:bid()}));
    const a=[...r.blocks];
    a.splice(afterIdx+1, 0, ...newBlocks);
    setBlocks(a); setShowInsert(false);
  }
  // Annotations
  const annotations = r.annotations||[];
  function setAnnotations(list){ commit({...r,annotations:list}); }
  function addAnnotation(kind){ setAnnotations([...annotations, { id:bid(), kind, title:"", desc:"", severity:"minor", equipment:r.title||"", photo:null, priceWanted: kind!=="comment" }]); }
  function updAnnotation(id,patch){ setAnnotations(annotations.map(a=>a.id===id?{...a,...patch}:a)); }
  function delAnnotation(id){ if(!confirm(t("delAnnotation")))return; setAnnotations(annotations.filter(a=>a.id!==id)); }

  async function doFix(){
    const key=getApiKey(); if(!key){ alert(t("fixNoKey")); return; }
    setFixing(true); setFixMsg(null);
    try{ const res=await fixReportWithApi(key, r, LANG); commit({...r, title:res.title, blocks:res.blocks}); setFixMsg(t("fixDone")); }
    catch(e){ setFixMsg(t("importErr")+" "+e.message); }
    setFixing(false);
  }
  async function doTranslate(){
    const key=getApiKey(); if(!key){ alert(t("fixNoKey")); return; }
    const target = LANG; // traduit vers la langue active de l'interface
    setFixing(true); setFixMsg(null);
    try{ const res=await translateReportWithApi(key, r, target); commit({...r, ...res}); setFixMsg(t("translateDone")); }
    catch(e){ setFixMsg(t("importErr")+" "+e.message); }
    setFixing(false);
  }

  // Numéro de DOSSIER = nom du fichier PDF à l'enregistrement (obligatoire). Priorité : n° dossier
  // (projectNo) > n° de rapport (num) > titre.
  function dossierName(){ return (r.projectNo||r.num||r.title||"").trim(); }
  // Imprime en posant document.title = numéro de dossier (le navigateur l'utilise comme nom de
  // fichier PDF), puis restaure le titre d'origine.
  function printWithName(){
    const dossier=dossierName();
    if(!dossier){ alert(LANG==="en"?"A file/dossier number is required before export (set the project no. or report no.).":"Un numéro de dossier est obligatoire avant l'export (renseignez le n° de dossier ou le n° de rapport)."); return false; }
    const safe=dossier.replace(/[\\/:*?"<>|]+/g,"-");
    const prev=document.title;
    document.title=safe;
    const restore=()=>{ document.title=prev; window.removeEventListener("afterprint",restore); };
    window.addEventListener("afterprint",restore);
    window.print();
    setTimeout(restore,4000); // filet de sécurité si afterprint ne se déclenche pas
    return true;
  }
  function doExport(){
    // Avertir si des champs de section sont vides (non remplis / non validés) avant l'export.
    let emptyN=0;
    (r.blocks||[]).forEach(b=>{ if(b.type==="section") (b.fields||[]).forEach(f=>{ if(!String(f.value||"").trim() && !f.validated) emptyN++; }); });
    if(emptyN>0 && !confirm(LANG==="en"
      ? `${emptyN} empty field(s) remain (set N/V, N/A, validate or remove them in the report). Export to PDF anyway?`
      : `${emptyN} champ(s) encore vide(s) (inscrire N/V, N/A, valider ou les retirer dans le rapport). Exporter en PDF quand même ?`)) return;
    setTimeout(()=>printWithName(),200);
  }
  // Export « à compléter à la main » : valeurs en pâle (référence) pour réécrire par-dessus.
  function doExportHandwrite(){
    if(!dossierName()){ alert(LANG==="en"?"A file/dossier number is required before export.":"Un numéro de dossier est obligatoire avant l'export."); return; }
    setPaleExport(true);
    setTimeout(()=>{ printWithName(); setTimeout(()=>setPaleExport(false),600); },250);
  }
  const updatedCount = (r.blocks||[]).filter(b=>b.updated).length;
  // Export « mises à jour seulement » : n'imprime que les blocs marqués 🔁 (addendum/révision).
  function doExportUpdates(){
    if(updatedCount===0){ alert(LANG==="en"?"No block marked as updated (use the 🔁 button on a block).":"Aucun bloc marqué comme mis à jour (bouton 🔁 sur un bloc)."); return; }
    if(!dossierName()){ alert(LANG==="en"?"A file/dossier number is required before export.":"Un numéro de dossier est obligatoire avant l'export."); return; }
    setUpdatesExport(true);
    setTimeout(()=>{ printWithName(); setTimeout(()=>setUpdatesExport(false),600); },250);
  }
  // Lien vers un PROJET (hub) et un ÉVÉNEMENT du planner. Stocké dans r.link ; les colonnes
  // project_id / planner_job_id sont renseignées côté serveur (le statut du rapport remonte
  // alors au projet et à la facturation, et le rapport suit l'événement).
  function setLink(link){ commit({...r, link:{...(r.link||{}), ...link}}); }
  // Items chiffrables = anomalies + recommandations du rapport (pour « Faire une soumission »).
  const priceItems = (annotations||[]).filter(a=>a.kind==="anomaly"||a.kind==="reco");

  return (
    <div>
      {/* BARRE D'OUTILS */}
      <div style={S.toolbar} className="screen-only">
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {STATUSES.map(s=>(
            <button key={s.id} style={{...S.statusToggle,...(r.status===s.id?{background:s.color,color:"#fff",borderColor:s.color}:{})}} onClick={()=>setField("status",s.id)}>{t(s.key)}</button>
          ))}
          <span style={{fontSize:12,color:"#64748b"}}>{t("version")}{r.version}{r.createdFrom?` · ${t("createdFrom")} ${r.createdFrom}`:""}</span>
          <span style={{...S.savedBadge, opacity:savedFlash?1:0}}>{t("savedTag")}</span>
          {peers.length>0 && (
            <span style={{display:"inline-flex",alignItems:"center",gap:3}} title={(LANG==="en"?"Also here: ":"Aussi présent : ")+peers.map(p=>p.name).join(", ")}>
              {peers.slice(0,4).map((p,i)=>(<span key={p.id||i} style={{width:24,height:24,borderRadius:"50%",background:p.color||"#577590",color:"#fff",fontSize:10,fontWeight:800,fontFamily:"'Archivo'",display:"inline-flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff",marginLeft:i?-8:0,boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}>{initials(p.name)}</span>))}
              {peers.length>4 && <span style={{fontSize:11,color:"#64748b",marginLeft:2}}>+{peers.length-4}</span>}
              <span style={{fontSize:11,color:"#2a9d8f",fontWeight:700,marginLeft:4}}>● {LANG==="en"?"live":"en direct"}</span>
            </span>
          )}
        </div>
        {(()=>{
          // Actions de l'éditeur. Sur écran étroit (mobile), elles se replient dans un menu « ⋯ ».
          const actions=[
            { key:"link", label:`🔗 ${(r.link&&r.link.projectId)?(r.link.projectNumber||(LANG==="en"?"Linked":"Lié")):(LANG==="en"?"Link":"Lier")}`, on:()=>setShowLink(true), style:(r.link&&r.link.projectId)?{borderColor:"#2a9d8f",color:"#2a9d8f"}:{}, title:LANG==="en"?"Link to a project / scheduler event":"Lier à un projet / événement" },
            { key:"qr", label:`🔳 ${LANG==="en"?"QR / page":"QR / page"}`, on:()=>setShowQr(true), title:LANG==="en"?"Page QR code — scan to open & edit this report":"QR code de page — scanner pour ouvrir et éditer ce rapport" },
            { key:"share", label:`📤 ${LANG==="en"?"Share":"Partager"}`, on:()=>setShowShare(true), title:LANG==="en"?"Share a read/review link with a verifier":"Partager un lien lecture/révision à un vérificateur" },
            { key:"ann", label:`💬 ${t("annotations")}${annotations.length>0?` (${annotations.length})`:""}`, on:()=>setShowAnn(true) },
            priceItems.length>0 && { key:"soum", label:`💲 ${LANG==="en"?"Quote":"Soumission"} (${priceItems.length})`, on:()=>setShowSoum(true), style:{borderColor:"#2a6f97",color:"#2a6f97"}, title:LANG==="en"?"Create a quote from the anomalies/recommendations the client wants priced":"Créer une soumission à partir des anomalies/recommandations à chiffrer" },
            r.sourceText && { key:"cmp", label:t("compareView"), on:()=>setShowCompare(true) },
            { key:"ins", label:t("insertPage"), on:()=>setShowInsert(true) },
            { key:"fix", label:fixing?t("fixing"):t("fixReport"), on:doFix, disabled:fixing },
            { key:"tr", label:t("translateReport"), on:doTranslate, disabled:fixing },
            { key:"dup", label:t("duplicate"), on:()=>onDuplicate(r.id,false) },
            { key:"ver", label:t("newVersion"), on:()=>onDuplicate(r.id,true) },
            { key:"hw", label:`🖊 ${LANG==="en"?"To complete (handwrite)":"À compléter (manuscrit)"}`, on:doExportHandwrite, title:LANG==="en"?"Print with pale values to fill by hand":"Imprimer avec les valeurs en pâle pour compléter à la main" },
            updatedCount>0 && { key:"upd", label:`🔁 ${LANG==="en"?"Export updates":"Export MAJ"} (${updatedCount})`, on:doExportUpdates, style:{borderColor:"#e0a96d",color:"#b45309"}, title:LANG==="en"?"Export only the blocks marked as updated":"Exporter uniquement les blocs marqués comme mis à jour" },
          ].filter(Boolean);
          if(narrow){
            return (
              <div style={{display:"flex",gap:8,position:"relative"}}>
                <button style={S.btnDark} onClick={doExport}>🖨 {t("export")}</button>
                <button style={{...S.btnGhost,padding:"9px 14px"}} onClick={()=>setShowTools(v=>!v)} title={LANG==="en"?"More actions":"Plus d'actions"}>⋯</button>
                {showTools && (
                  <div style={{position:"absolute",right:0,top:"110%",zIndex:60,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 28px rgba(0,0,0,.22)",padding:6,minWidth:230,maxHeight:"60vh",overflowY:"auto"}} onMouseLeave={()=>setShowTools(false)}>
                    {actions.map(a=>(
                      <button key={a.key} disabled={a.disabled} onClick={()=>{ setShowTools(false); a.on(); }} title={a.title||""} style={{...S.blockMenuItem,...(a.style||{}),opacity:a.disabled?0.5:1,fontWeight:700}}>{a.label}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {actions.map(a=>(
                <button key={a.key} style={{...S.btnGhost,...(a.style||{})}} disabled={a.disabled} onClick={a.on} title={a.title||""}>{a.label}</button>
              ))}
              <button style={S.btnDark} onClick={doExport}>🖨 {t("export")}</button>
            </div>
          );
        })()}
      </div>
      {fixMsg && <div style={{...S.card,padding:"10px 16px",color:fixMsg.includes("✓")?"#2a9d8f":"#c1121f",fontWeight:600,fontSize:13}} className="screen-only">{fixMsg}</div>}

      {/* PANNEAU ANNOTATIONS */}
      {showAnn && <AnnotationsPanel annotations={annotations} onAdd={addAnnotation} onUpd={updAnnotation} onDel={delAnnotation} onClose={()=>setShowAnn(false)} onZoom={setLightbox}/>}

      {/* PANNEAU LIER (projet + événement planner) */}
      {showLink && <LinkPanel report={r} onSet={setLink} onClose={()=>setShowLink(false)}/>}

      {/* MODALE QR (un seul QR pour tout le rapport + navigation par page/section) */}
      {showQr && <QrPanel report={r} qr={qr} qrMap={qrMap} onJump={(bid)=>{ setShowQr(false); const el=document.getElementById("blk-"+bid); if(el){ el.scrollIntoView({behavior:"smooth",block:"start"}); el.style.transition="box-shadow .3s"; el.style.boxShadow="0 0 0 3px #1e293b"; setTimeout(()=>{el.style.boxShadow="";},900); } }} onClose={()=>setShowQr(false)}/>}

      {/* MODALE PARTAGE AU VÉRIFICATEUR (lien lecture/révision) */}
      {showShare && <ShareModal report={r} onClose={()=>setShowShare(false)}/>}

      {/* CONSTRUCTEUR DE SOUMISSION (anomalies/recommandations sélectionnées) */}
      {showSoum && <SoumissionBuilder report={r} items={priceItems} onClose={()=>setShowSoum(false)}/>}

      {/* MODALE INSÉRER PAGE GABARIT */}
      {showInsert && (
        <div style={S.overlay} onClick={()=>setShowInsert(false)}>
          <div style={{...S.modal,maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h2 style={S.h2}>{t("insertPage")}</h2>
            <InsertPageForm blocks={r.blocks} customTpls={customTpls} onInsert={insertTemplatePage} onCancel={()=>setShowInsert(false)}/>
          </div>
        </div>
      )}

      {/* MODALE COMPARAISON SOURCE vs EXTRAIT */}
      {showCompare && (
        <div style={S.overlay} onClick={()=>setShowCompare(false)}>
          <div style={{...S.modal,maxWidth:980,maxHeight:"88vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <h2 style={S.h2}>{t("compareTitle")}</h2>
            <p style={{...S.hint,marginTop:0,marginBottom:12}}>{t("compareHint")}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1,minHeight:0}}>
              <div style={{display:"flex",flexDirection:"column",minHeight:0}}>
                <div style={S.compareHead}>{t("compareSource")}</div>
                <div style={S.comparePane}>{r.sourceText ? <pre style={S.comparePre}>{r.sourceText}</pre> : <i style={{color:"#999"}}>{t("compareNoSource")}</i>}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",minHeight:0}}>
                <div style={{...S.compareHead,background:"#1e293b"}}>{t("compareExtract")}</div>
                <div style={S.comparePane}>
                  {r.blocks.map((b,i)=>(
                    <div key={b.id} style={{marginBottom:8,paddingBottom:8,borderBottom:"1px solid #eee"}}>
                      {b.type==="section" && <><b>§ {b.title}</b>{(b.fields||[]).map(f=><div key={f.id} style={{paddingLeft:8,color:"#555"}}>{f.label}: {f.value||"—"}</div>)}</>}
                      {b.type==="table" && <><b>▦ {b.title}</b><div style={{fontSize:11,color:"#555",paddingLeft:8}}>{(b.columns||[]).join(" | ")}<br/>{(b.rows||[]).map((row,ri)=><div key={ri}>{row.join(" | ")}</div>)}</div></>}
                      {b.type==="text" && <div style={{color:"#333",whiteSpace:"pre-wrap"}}>{b.value}</div>}
                      {b.type==="photos" && <i style={{color:"#999"}}>🖼 {b.title}</i>}
                      {b.type==="pdfpage" && <i style={{color:"#999"}}>📄 {b.name}</i>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{marginTop:12,textAlign:"right"}}><button style={S.btnGhost} onClick={()=>setShowCompare(false)}>{t("cancel")}</button></div>
          </div>
        </div>
      )}
      <div style={S.card} className="screen-only">
        <div style={{display:"grid",gridTemplateColumns:narrow?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:10}}>
          <div style={{gridColumn:"1 / 3"}}><label style={S.label}>{t("title")}</label><input style={S.input} value={r.title} onChange={e=>setField("title",e.target.value)}/></div>
          <div><label style={S.label}>{t("date")}</label><input type="date" style={S.input} value={r.date} onChange={e=>setField("date",e.target.value)}/></div>
          <div><label style={S.label}>{t("projectNo")}</label><input style={S.input} value={r.projectNo} onChange={e=>setField("projectNo",e.target.value)}/></div>
          <div><label style={S.label}>{t("client")}</label><input style={S.input} value={r.client} onChange={e=>setField("client",e.target.value)}/></div>
          <div style={{gridColumn:"2 / 5"}}><label style={S.label}>{t("location")}</label><input style={S.input} value={r.location} onChange={e=>setField("location",e.target.value)}/></div>
        </div>
        {(()=>{ let n=0,crit=0; (r.blocks||[]).forEach(b=>{ if(b.type==="inspect")(b.items||[]).forEach(it=>{ if(it.state==="anomaly"){n++; if((it.severity||"minor")==="critical")crit++;} }); });
          if(n===0) return null;
          return <div style={{marginTop:10,padding:"7px 12px",borderRadius:8,background:crit>0?"#fdeaea":"#fff6ea",border:"1px solid "+(crit>0?"#e3a0a0":"#e0c89a"),fontSize:13,color:"#7a3030",fontWeight:600}}>⚠ {n} {t("anomBanner")}{crit>0?` — ${crit} ${sevLabel("critical").toLowerCase()}`:""}</div>;
        })()}
        <div style={{marginTop:12,borderTop:"1px solid #e2e8f0",paddingTop:12}}>
          <div style={{fontSize:11,fontWeight:700,fontFamily:"'Archivo'",color:"#64748b",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>{t("layoutOptions")}</div>
          <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}}>
              <input type="checkbox" checked={(r.cover||{}).show!==false} onChange={e=>setField("cover",{...(r.cover||{}),show:e.target.checked})}/>
              📄 {t("coverShow")}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}}>
              <input type="checkbox" checked={!!r.toc} onChange={e=>setField("toc",e.target.checked)}/>
              📑 {t("tocShow")}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}}>
              <input type="checkbox" checked={r.anomRecap!==false} onChange={e=>setField("anomRecap",e.target.checked)}/>
              ⚠ {t("anomRecapShow")}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}} title={LANG==="en"?"Each section/equipment starts on its own page (fresh template header)":"Chaque section/équipement commence sur sa propre page (nouvelle entête de gabarit)"}>
              <input type="checkbox" checked={!!r.sectionPerPage} onChange={e=>setField("sectionPerPage",e.target.checked)}/>
              📃 {LANG==="en"?"One page per section":"Une page par section"}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}} title={LANG==="en"?"Condensed: tighter spacing to fit more per page":"Condensé : espacement réduit pour densifier la page"}>
              <input type="checkbox" checked={!!r.condensed} onChange={e=>setField("condensed",e.target.checked)}/>
              🗜 {LANG==="en"?"Condensed":"Condensé"}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}} title={LANG==="en"?"Include QR codes in the exported PDF (footer + per section)":"Inclure les QR codes dans le PDF exporté (pied de page + par section)"}>
              <input type="checkbox" checked={r.qrShow!==false} onChange={e=>setField("qrShow",e.target.checked)}/>
              🔳 {LANG==="en"?"QR in export":"QR à l'export"}
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",fontFamily:"'Archivo'",fontWeight:700,color:"#475569"}} title={LANG==="en"?"Attach a presentation letter as the first page":"Joindre une lettre de présentation en première page"}>
              <input type="checkbox" checked={!!(r.letter&&r.letter.show)} onChange={e=>{
                const on=e.target.checked; const base=r.letter||{};
                // Pré-remplit la lettre depuis les infos DÉJÀ enregistrées du rapport (1re activation).
                const seed=(on && !base.subject && !base.company && !base.fileRef)
                  ? { company:r.client||"", subject:r.title||"", fileRef:r.num||r.projectNo||"", attachment:base.attachment||(LANG==="en"?"Report":"Rapport") } : {};
                setField("letter",{...base,...seed,show:on});
              }}/>
              ✉ {LANG==="en"?"Cover letter":"Lettre de présentation"}
            </label>
          </div>
          {(r.cover||{}).show!==false && (
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
              <input style={{...S.input,flex:1,minWidth:180}} value={(r.cover||{}).subtitle||""} placeholder={t("coverSubtitle")} onChange={e=>setField("cover",{...(r.cover||{}),subtitle:e.target.value})}/>
              <button style={S.btnGhost} onClick={()=>setShowCover(true)}>🎨 {t("coverCustomize")}</button>
            </div>
          )}
          {(r.letter&&r.letter.show) && (
            <div style={{marginTop:10}}>
              <button style={S.btnGhost} onClick={()=>setShowLetter(true)}>✉ {LANG==="en"?"Edit the cover letter":"Éditer la lettre de présentation"}</button>
            </div>
          )}
        </div>
      </div>

      {/* MODALE PERSONNALISATION COUVERTURE */}
      {showCover && (()=>{ const cv=r.cover||{}; const setCv=(patch)=>setField("cover",{...cv,...patch});
        return (
        <div style={S.overlay} className="screen-only" onClick={()=>setShowCover(false)}>
          <div style={{...S.modal,maxWidth:560,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{...S.h2,margin:0}}>🎨 {t("coverCustomize")}</h2>
              <button style={S.miniBtn} onClick={()=>setShowCover(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={S.label}>{t("coverKickerLbl")}</label><input style={S.input} value={cv.kicker||""} placeholder={tplLabel} onChange={e=>setCv({kicker:e.target.value})}/></div>
              <div><label style={S.label}>{t("coverTitleOverride")}</label><input style={S.input} value={cv.titleOverride||""} placeholder={r.title} onChange={e=>setCv({titleOverride:e.target.value})}/></div>
              <div><label style={S.label}>{t("coverSubtitle")}</label><input style={S.input} value={cv.subtitle||""} onChange={e=>setCv({subtitle:e.target.value})}/></div>
              <div><label style={S.label}>{t("coverPreparedBy")}</label><input style={S.input} value={cv.preparedBy||""} placeholder="Frédéric Brochu, tech." onChange={e=>setCv({preparedBy:e.target.value})}/></div>
              <div>
                <label style={S.label}>{t("coverBg")}</label>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  {cv.bg && <img src={cv.bg} alt="" style={{height:56,width:90,objectFit:"cover",borderRadius:6,border:"1px solid #cbd5e1"}}/>}
                  <label style={{...S.btnGhost,cursor:"pointer",fontSize:13}}>{cv.bg?t("coverBgChange"):t("coverBgAdd")}
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{ const f=e.target.files?.[0]; if(f){ const d=await compressImage(f,1400,0.72); setCv({bg:d}); } e.target.value=""; }}/>
                  </label>
                  {cv.bg && <button style={{...S.btnGhost,fontSize:13,color:"#9d0208"}} onClick={()=>setCv({bg:null})}>{t("coverBgRemove")}</button>}
                </div>
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{t("coverBgHint")}</div>
              </div>
            </div>
            <div style={{marginTop:16,textAlign:"right"}}><button style={S.btnDark} onClick={()=>setShowCover(false)}>{t("save")}</button></div>
          </div>
        </div>
        );
      })()}

      {/* MODALE LETTRE DE PRÉSENTATION */}
      {showLetter && <LetterModal report={r} onSet={(patch)=>setField("letter",{...(r.letter||{}),...patch})} onClose={()=>setShowLetter(false)}/>}

      {/* SÉLECTEUR D'ANALYSE DGA À INSÉRER */}
      {showDga && <DgaPicker onPick={insertDgaBlock} onClose={()=>setShowDga(false)}/>}

      {/* BLOCS ÉDITABLES */}
      <div className="screen-only" style={{paddingBottom:80}}>
        {r.blocks.map((b,idx)=>{
          const icon = b.type==="zone"?"🗂":b.type==="dga"?"🧪":b.type==="section"?"§":b.type==="photos"?"🖼":b.type==="pdfpage"?"📄":b.type==="table"?"▦":b.type==="inspect"?"☑":"¶";
          const label = (b.type==="photos"||b.type==="section"||b.type==="table"||b.type==="inspect"||b.type==="zone") ? (b.title||"").trim() : b.type==="pdfpage" ? (b.name||t("pdfPageZone")) : b.type==="dga" ? ("DGA · "+((b.summary||{}).equipment||"")) : (b.value||"").trim().slice(0,40);
          const fallback = b.type==="zone"?(LANG==="en"?"Zone":"Zone"):b.type==="dga"?"DGA":b.type==="section"?t("addSection").replace("+ ",""):b.type==="photos"?t("photoZone"):b.type==="table"?t("tableTitle"):b.type==="inspect"?t("inspectTitle"):b.type==="pdfpage"?t("pdfPageZone"):t("freeText").replace("…","");
          const startsNewPage = (b.type==="section" && (b.newPage || (r.sectionPerPage && idx!==r.blocks.findIndex(x=>x.type==="section")))) || (b.type==="zone" && b.newPage!==false);
          return (
          <React.Fragment key={b.id}>
          {startsNewPage && (
            <div className="screen-only" style={{display:"flex",alignItems:"center",gap:8,margin:"12px 2px 4px",color:"#94a3b8",fontSize:10.5,fontFamily:"'Archivo'",fontWeight:700,letterSpacing:1}}>
              <span style={{flex:1,height:0,borderTop:"2px dashed #cbd5e1"}}/>
              📄 {LANG==="en"?"NEW PAGE":"NOUVELLE PAGE"}
              <span style={{flex:1,height:0,borderTop:"2px dashed #cbd5e1"}}/>
            </div>
          )}
          <div id={"blk-"+b.id}
            draggable
            onDragStart={(e)=>{ setDragId(b.id); e.dataTransfer.effectAllowed="move"; }}
            onDragOver={(e)=>{ e.preventDefault(); if(overId!==b.id) setOverId(b.id); }}
            onDragEnd={()=>{ setDragId(null); setOverId(null); }}
            onDrop={(e)=>{ e.preventDefault(); if(dragId) reorderBlocks(dragId,b.id); setDragId(null); setOverId(null); }}
            style={{...S.blockCard, ...(dragId===b.id?{opacity:.4}:{}), ...(overId===b.id&&dragId&&dragId!==b.id?{borderTop:"3px solid #1e293b"}:{})}}>
            <div style={S.blockToolbar}>
              <span style={S.blockType}><span style={S.dragHandle} title={t("dragHint")}>⠿</span> {icon} {label||fallback}
                {(()=>{ const on=peers.filter(p=>p.blockId===b.id); return on.length>0 ? (
                  <span style={{marginLeft:8,display:"inline-flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:800,fontFamily:"'Archivo'",color:on[0].color||"#9d0208",background:"#fff",border:`1.5px solid ${on[0].color||"#9d0208"}`,borderRadius:20,padding:"1px 8px"}} title={on.map(p=>p.name).join(", ")}>
                    🔒 {on.map(p=>p.name.split(" ")[0]).join(", ")} {LANG==="en"?"editing":"édite"}
                  </span>
                ) : null; })()}
              </span>
              <span style={{display:"flex",gap:6,position:"relative"}}>
                {!narrow ? <>
                  <button style={S.miniBtn} onClick={()=>moveBlock(b.id,-1)} disabled={idx===0}>↑</button>
                  <button style={S.miniBtn} onClick={()=>moveBlock(b.id,1)} disabled={idx===r.blocks.length-1}>↓</button>
                  <button style={S.miniBtn} onClick={()=>duplicateBlock(b.id)} title={t("dupBlock")}>⧉</button>
                  {b.type==="section" && <button style={{...S.miniBtn,color:"#2a9d8f",borderColor:"#9bd4cc"}} onClick={()=>duplicateGroup(b.id)} title={t("dupEquip")}>⧉⧉</button>}
                  {b.type==="section" && <button style={{...S.miniBtn,color:"#2a9d8f",borderColor:"#9bd4cc"}} onClick={()=>convertToInspect(b.id)} title={t("convertInspect")}>☑</button>}
                  {b.type==="section" && <button style={{...S.miniBtn,...(b.newPage?{color:"#2a6f97",borderColor:"#2a6f97",background:"#eef5fa"}:{})}} onClick={()=>updBlock(b.id,{newPage:!b.newPage})} title={LANG==="en"?"Start this section on a new page":"Commencer cette section sur une nouvelle page"}>📄</button>}
                  {b.type==="inspect" && <button style={{...S.miniBtn,color:"#1e293b",borderColor:"#a9cddc"}} onClick={()=>convertToSection(b.id)} title={t("convertSection")}>§</button>}
                  <button style={{...S.miniBtn,...(b.updated?{color:"#b45309",borderColor:"#e0a96d",background:"#fff7ed"}:{})}} onClick={()=>updBlock(b.id,{updated:!b.updated})} title={LANG==="en"?"Mark as updated (for the 'updates only' export)":"Marquer comme mis à jour (pour l'export « MAJ seulement »)"}>🔁</button>
                  <button style={S.miniBtnDel} onClick={()=>removeBlock(b.id)}>✕</button>
                </> : <>
                  <button style={S.miniBtn} onClick={()=>setOpenMenuId(openMenuId===b.id?null:b.id)} title={t("blockActions")}>⋯</button>
                  {openMenuId===b.id && (
                    <div style={S.blockMenu} onMouseLeave={()=>setOpenMenuId(null)}>
                      <button style={{...S.blockMenuItem,...(idx===0?{opacity:.4,pointerEvents:"none"}:{})}} onClick={()=>{moveBlock(b.id,-1);}}>↑ {t("moveUp")}</button>
                      <button style={{...S.blockMenuItem,...(idx===r.blocks.length-1?{opacity:.4,pointerEvents:"none"}:{})}} onClick={()=>{moveBlock(b.id,1);}}>↓ {t("moveDown")}</button>
                      <button style={S.blockMenuItem} onClick={()=>{duplicateBlock(b.id);setOpenMenuId(null);}}>⧉ {t("dupBlock")}</button>
                      {b.type==="section" && <button style={S.blockMenuItem} onClick={()=>{duplicateGroup(b.id);setOpenMenuId(null);}}>⧉⧉ {t("dupEquip")}</button>}
                      {b.type==="section" && <button style={S.blockMenuItem} onClick={()=>{convertToInspect(b.id);setOpenMenuId(null);}}>☑ {t("convertInspect")}</button>}
                      {b.type==="section" && <button style={S.blockMenuItem} onClick={()=>{updBlock(b.id,{newPage:!b.newPage});setOpenMenuId(null);}}>📄 {b.newPage?(LANG==="en"?"No page break":"Sans saut de page"):(LANG==="en"?"Page break before":"Saut de page avant")}</button>}
                      {b.type==="inspect" && <button style={S.blockMenuItem} onClick={()=>{convertToSection(b.id);setOpenMenuId(null);}}>§ {t("convertSection")}</button>}
                      <button style={S.blockMenuItem} onClick={()=>{updBlock(b.id,{updated:!b.updated});setOpenMenuId(null);}}>🔁 {b.updated?(LANG==="en"?"Unmark updated":"Retirer « mis à jour »"):(LANG==="en"?"Mark updated":"Marquer mis à jour")}</button>
                      <button style={{...S.blockMenuItem,color:"#9d0208"}} onClick={()=>{removeBlock(b.id);setOpenMenuId(null);}}>✕ {t("removeBlock")}</button>
                    </div>
                  )}
                </>}
              </span>
            </div>
            {b.type==="zone" && (
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:20}}>🗂</span>
                <input style={{...S.input,fontWeight:900,fontFamily:"'Archivo'",fontSize:16,background:"#eef2ff",borderColor:"#a9b6e8"}} value={b.title||""} onChange={e=>updBlock(b.id,{title:e.target.value})} placeholder={LANG==="en"?"Zone name (e.g. North Building)":"Nom de la zone (ex. Bâtiment Nord)"}/>
                <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:b.newPage!==false?"#2a6f97":"#94a3b8",cursor:"pointer",whiteSpace:"nowrap"}} title={LANG==="en"?"Start this zone on a new page":"Démarrer cette zone sur une nouvelle page"}>
                  <input type="checkbox" checked={b.newPage!==false} onChange={e=>updBlock(b.id,{newPage:e.target.checked})}/>📄
                </label>
              </div>
            )}
            {b.type==="section" && <SectionEditor block={b} onChange={patch=>updBlock(b.id,patch)}/>}
            {b.type==="table" && <TableEditor block={b} onChange={patch=>updBlock(b.id,patch)}/>}
            {b.type==="inspect" && <InspectEditor block={b} onChange={patch=>updBlock(b.id,patch)} onZoom={setLightbox}/>}
            {b.type==="text" && <textarea style={{...S.input,minHeight:90,resize:"vertical",fontFamily:"'Spline Sans'"}} value={b.value} placeholder={b.placeholder||t("freeText")} onChange={e=>updBlock(b.id,{value:e.target.value})}/>}
            {b.type==="dga" && (
              <div style={{border:"1px solid #bfdbfe",background:"#eff6ff",borderRadius:8,padding:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontFamily:"'Archivo'",fontWeight:800,fontSize:12,color:"#1e40af"}}>🧪 {LANG==="en"?"DGA analysis (snapshot)":"Analyse DGA (instantané)"}</span>
                  <span style={{fontSize:10.5,color:"#64748b"}}>{(b.importedAt||"").slice(0,10)}</span>
                </div>
                <DgaSummaryView s={b.summary}/>
              </div>
            )}
            {b.type==="photos" && <PhotosEditor block={b} onChange={patch=>updBlock(b.id,patch)} onZoom={setLightbox}/>}
            {b.type==="pdfpage" && (
              <div>
                <div style={{fontSize:12,color:"#475569",marginBottom:8}}>{(b.pages||[]).length} {t("pdfPages")}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8}}>
                  {(b.pages||[]).map((p,i)=>(<img key={i} src={p} alt="" style={{width:"100%",border:"1px solid #ddd",borderRadius:4,cursor:"pointer"}} onClick={()=>setLightbox(p)}/>))}
                </div>
              </div>
            )}
          </div>
          {/* Insérer un bloc ICI (après ce bloc) */}
          <div className="screen-only" style={{position:"relative",display:"flex",justifyContent:"center",margin:"2px 0"}}>
            {insertAt===idx+1 ? (
              <div style={S.insertMenu} onMouseLeave={()=>setInsertAt(null)}>
                <button style={S.insertChip} onClick={()=>{ const id=addBlock("section",idx+1); setInsertAt(null); setTimeout(()=>jumpToBlock(id),60); }}>§ {t("addSection").replace("+ ","")}</button>
                <button style={S.insertChip} onClick={()=>{ const id=addBlock("inspect",idx+1); setInsertAt(null); setTimeout(()=>jumpToBlock(id),60); }}>☑ {t("inspectTitle")}</button>
                <button style={S.insertChip} onClick={()=>{ const id=addBlock("table",idx+1); setInsertAt(null); setTimeout(()=>jumpToBlock(id),60); }}>▦ {t("tableTitle")}</button>
                <button style={S.insertChip} onClick={()=>{ const id=addBlock("photos",idx+1); setInsertAt(null); setTimeout(()=>jumpToBlock(id),60); }}>🖼 {t("photoZone")}</button>
                <button style={S.insertChip} onClick={()=>{ const id=addBlock("text",idx+1); setInsertAt(null); setTimeout(()=>jumpToBlock(id),60); }}>¶ {t("freeText").replace("…","")}</button>
                <button style={{...S.insertChip,color:"#9d0208"}} onClick={()=>setInsertAt(null)}>✕</button>
              </div>
            ) : (
              <button className="insert-line-btn" style={S.insertLine} onClick={()=>setInsertAt(idx+1)} title={t("insertHere")}>+ {t("insertHere")}</button>
            )}
          </div>
          </React.Fragment>
          );
        })}
      </div>

      {/* NAVIGATION INTERNE — bouton flottant + panneau de sauts */}
      <button className="screen-only" style={S.navFab} onClick={()=>setShowNav(s=>!s)} title={t("navTitle")}>☰ {t("navTitle")}</button>
      {showNav && (()=>{
        const TYPE_META={ zone:{ic:"🗂",col:"#4f46e5",key:"navTypeZone"}, section:{ic:"§",col:"#1e293b",key:"navTypeSection"}, dga:{ic:"🧪",col:"#1e40af",key:"navTypeDga"}, table:{ic:"▦",col:"#6b4e9d",key:"navTypeTable"}, inspect:{ic:"☑",col:"#2a9d8f",key:"navTypeInspect"}, photos:{ic:"🖼",col:"#e0a96d",key:"navTypePhotos"}, pdfpage:{ic:"📄",col:"#577590",key:"navTypePdf"}, text:{ic:"¶",col:"#64748b",key:"navTypeText"} };
        const blkLabel=(b)=> (b.type==="photos"||b.type==="section"||b.type==="table"||b.type==="inspect"||b.type==="zone")?(b.title||"").trim():b.type==="pdfpage"?(b.name||t("pdfPageZone")):b.type==="dga"?("DGA · "+((b.summary||{}).equipment||"")):(b.value||"").trim().slice(0,40);
        const filtered = r.blocks.map((b,i)=>({b,i})).filter(({b})=> navFilter==="all" || b.type===navFilter);
        return (
        <div className="screen-only" style={S.navPanel}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:13,color:"#1e293b"}}>{t("navTitle")}</span>
            <button style={S.miniBtn} onClick={()=>setShowNav(false)}>✕</button>
          </div>
          {/* Filtres par type */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            <button onClick={()=>setNavFilter("all")} style={{...S.navChip,...(navFilter==="all"?{background:"#1e293b",color:"#fff",borderColor:"#1e293b"}:{})}}>{t("navAll")} ({r.blocks.length})</button>
            {["zone","section","dga","inspect","table","photos","pdfpage","text"].map(tp=>{ const c=r.blocks.filter(b=>b.type===tp).length; if(!c)return null; const m=TYPE_META[tp];
              return <button key={tp} onClick={()=>setNavFilter(tp)} style={{...S.navChip,...(navFilter===tp?{background:m.col,color:"#fff",borderColor:m.col}:{color:m.col,borderColor:m.col})}}>{m.ic} {c}</button>;
            })}
          </div>
          <div style={{maxHeight:"58vh",overflowY:"auto"}}>
            {filtered.map(({b,i})=>{
              const m=TYPE_META[b.type]||TYPE_META.text;
              const isZone = b.type==="zone";
              const isHead = b.type==="section";
              return <button key={b.id} onClick={()=>jumpToBlock(b.id)}
                style={{...S.navItem, ...(isZone?{fontWeight:900,fontSize:13,color:"#fff",background:m.col,borderRadius:6,marginTop:6,paddingLeft:8}:isHead?{fontWeight:700,fontSize:13,color:m.col,borderLeft:"3px solid "+m.col,paddingLeft:8,marginTop:4,background:"#faf6ee"}:{paddingLeft:18,fontSize:12,color:"#475569"})}}>
                <span style={{color:isZone?"rgba(255,255,255,.7)":"#b3a690",marginRight:6,fontSize:10}}>{i+1}</span>
                <span style={{marginRight:5}}>{m.ic}</span>{blkLabel(b)||t(m.key)}
              </button>;
            })}
            {filtered.length===0 && <div style={{fontSize:12,color:"#999",padding:"10px 4px"}}>{t("navNone")}</div>}
          </div>
        </div>
        );
      })()}

      {/* BOUTON FLOTTANT D'AJOUT (toujours visible) */}
      <button className="screen-only" style={S.addFab} onClick={()=>setShowAdd(s=>!s)} title={t("addBlockBtn")}>{showAdd?"✕":"＋"}</button>
      {showAdd && (
        <div className="screen-only" style={S.addPanel} onMouseLeave={()=>setShowAdd(false)}>
          <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#1e293b",marginBottom:8}}>{t("addBlockBtn")}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button style={{...S.addPanelItem,background:"#eef2ff",borderColor:"#a9b6e8"}} onClick={()=>{ addBlock("zone"); setShowAdd(false); }}>🗂 {LANG==="en"?"Zone (separator)":"Zone (séparateur)"}</button>
            <button style={S.addPanelItem} onClick={()=>{ addBlock("section"); setShowAdd(false); }}>§ {t("addSection").replace("+ ","")}</button>
            <button style={{...S.addPanelItem,background:"#e6f5f1",borderColor:"#9bd4cc"}} onClick={()=>{ addEquipment(); setShowAdd(false); }}>🔧 {t("addEquip").replace("+ ","")}</button>
            <button style={S.addPanelItem} onClick={()=>{ addBlock("inspect"); setShowAdd(false); }}>☑ {t("addInspect").replace("+ ","")}</button>
            <button style={S.addPanelItem} onClick={()=>{ addBlock("table"); setShowAdd(false); }}>▦ {t("addTable").replace("+ ","")}</button>
            <button style={S.addPanelItem} onClick={()=>{ addBlock("photos"); setShowAdd(false); }}>🖼 {t("addPhotos").replace("+ ","")}</button>
            <button style={S.addPanelItem} onClick={()=>{ addBlock("text"); setShowAdd(false); }}>¶ {t("addText").replace("+ ","")}</button>
            <button style={{...S.addPanelItem,background:"#eff6ff",borderColor:"#93c5fd"}} onClick={()=>{ setShowAdd(false); setShowDga(true); }}>🧪 {LANG==="en"?"DGA analysis":"Analyse DGA"}</button>
            <label style={{...S.addPanelItem,cursor:"pointer"}}>📄 {pdfBusy?t("importingPdf"):t("addPdfPage").replace("+ ","")}
              <input type="file" accept="application/pdf" style={{display:"none"}} disabled={pdfBusy} onChange={e=>{ const f=e.target.files?.[0]; if(f){ addPdfPageBlock(f); setShowAdd(false); } e.target.value=""; }}/>
            </label>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && <div style={S.overlay} className="screen-only" onClick={()=>setLightbox(null)}><img src={lightbox} alt="" style={{maxWidth:"92vw",maxHeight:"92vh",borderRadius:8}}/></div>}

      {/* RAPPORT IMPRIMABLE */}
      <PrintDoc report={r} logo={logo} pale={paleExport} qr={qr&&qr.data} qrMap={qrMap} updatesOnly={updatesExport}/>
    </div>
  );
}

function SectionEditor({ block, onChange }){
  const fields=block.fields||[];
  function setF(id,patch){ onChange({fields:fields.map(f=>f.id===id?{...f,...patch}:f)}); }
  function addF(){ onChange({fields:[...fields,{id:bid(),label:"",value:""}]}); }
  function delF(id){ onChange({fields:fields.filter(f=>f.id!==id)}); }
  return (
    <div>
      <input style={{...S.input,fontWeight:700,fontFamily:"'Archivo'",marginBottom:8}} value={block.title} onChange={e=>onChange({title:e.target.value})}/>
      {(()=>{ const emptyN=fields.filter(f=>!String(f.value||"").trim() && !f.validated).length; return emptyN>0 ? (
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,fontSize:11,color:"#9d6b2e",background:"#fffaf0",border:"1px solid #e0a96d",borderRadius:6,padding:"6px 10px"}}>
          ⚠ {emptyN} {LANG==="en"?"empty field(s) — set N/V, N/A, validate, or remove":"champ(s) vide(s) — inscrire N/V, N/A, valider ou retirer"}
        </div>
      ) : null; })()}
      {fields.map(f=>{
        const empty=!String(f.value||"").trim() && !f.validated;
        const eb={fontFamily:"'Archivo'",fontWeight:700,fontSize:10,padding:"5px 7px",borderRadius:6,border:"1px solid #e0a96d",background:"#fff",color:"#9d6b2e",cursor:"pointer"};
        return (
          <div key={f.id} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
            <input style={{...S.input,flex:"0 0 38%",minWidth:120}} value={f.label} onChange={e=>setF(f.id,{label:e.target.value})}/>
            <input style={{...S.input,flex:1,minWidth:120,...(f.uncertain?{borderColor:"#b9a3dd",background:"#faf7ff"}:empty?{borderColor:"#e0a96d",background:"#fffaf0"}:{})}} value={f.value} onChange={e=>setF(f.id,{value:e.target.value,uncertain:false,validated:false})}/>
            {f.uncertain && <span style={S.uncertainTag} title={t("uncertainNote")}>{t("uncertainBadge")}</span>}
            {empty && (
              <span style={{display:"flex",gap:4}}>
                <button style={eb} title={LANG==="en"?"Not verified":"Non vérifié"} onClick={()=>setF(f.id,{value:"N/V",uncertain:false})}>N/V</button>
                <button style={eb} title={LANG==="en"?"Not applicable":"Non applicable"} onClick={()=>setF(f.id,{value:"N/A",uncertain:false})}>N/A</button>
                <button style={{...eb,borderColor:"#2a9d8f",color:"#2a9d8f"}} title={LANG==="en"?"Validate (leave empty)":"Valider (laisser vide)"} onClick={()=>setF(f.id,{validated:true})}>✓</button>
              </span>
            )}
            <button style={S.miniBtnDel} title={LANG==="en"?"Remove field":"Retirer le champ"} onClick={()=>delF(f.id)}>✕</button>
          </div>
        );
      })}
      <button style={S.addBtnSm} onClick={addF}>{t("addField")}</button>
    </div>
  );
}

function TableEditor({ block, onChange }){
  const columns=block.columns||[]; const rows=block.rows||[];
  const [menu,setMenu]=useState(null); // {ri,ci}
  function setCol(i,v){ const c=[...columns]; c[i]=v; onChange({columns:c}); }
  function setCell(ri,ci,v){ const rr=rows.map(r=>[...r]); rr[ri][ci]=v; onChange({rows:rr}); }
  function addCol(){ onChange({columns:[...columns,""], rows:rows.map(r=>[...r,""])}); }
  function delCol(ci){ onChange({columns:columns.filter((_,i)=>i!==ci), rows:rows.map(r=>r.filter((_,i)=>i!==ci))}); }
  function addRow(){ onChange({rows:[...rows, columns.map(()=>"")]}); }
  function delRow(ri){ onChange({rows:rows.filter((_,i)=>i!==ri)}); }
  // Actions par cellule
  function clearCell(ri,ci){ setCell(ri,ci,""); setMenu(null); }
  function splitCell(ri,ci){
    // crée une nouvelle ligne sous ri ; déplace le contenu de la cellule vers la nouvelle ligne
    const rr=rows.map(r=>[...r]);
    const newRow=columns.map(()=>"");
    newRow[ci]=rr[ri][ci]||"";   // le contenu descend dans la nouvelle ligne
    rr[ri][ci]="";               // la cellule d'origine se vide (divisée)
    rr.splice(ri+1,0,newRow);
    onChange({rows:rr}); setMenu(null);
  }
  function mergeRight(ri,ci){
    if(ci>=columns.length-1) { setMenu(null); return; }
    const rr=rows.map(r=>[...r]);
    const a=(rr[ri][ci]||"").trim(), b=(rr[ri][ci+1]||"").trim();
    rr[ri][ci]=[a,b].filter(Boolean).join(" ");  // concatène
    rr[ri][ci+1]="";                              // vide la cellule de droite
    onChange({rows:rr}); setMenu(null);
  }
  return (
    <div>
      <input style={{...S.input,fontWeight:700,fontFamily:"'Archivo'",marginBottom:8}} value={block.title} onChange={e=>onChange({title:e.target.value})}/>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}>
          <thead><tr>
            {columns.map((c,ci)=>(<th key={ci} style={{border:"1px solid #ddd",padding:2,background:"#f1f5f9"}}>
              <div style={{display:"flex",gap:2,alignItems:"center"}}>
                <input style={{...S.input,fontWeight:700,fontSize:11,padding:"4px 6px",minWidth:70}} value={c} onChange={e=>setCol(ci,e.target.value)}/>
                <button style={{...S.miniBtnDel,padding:"2px 5px"}} title={t("delCol")} onClick={()=>delCol(ci)}>✕</button>
              </div>
            </th>))}
            <th style={{border:"none",padding:2}}><button style={S.addBtnSm} onClick={addCol}>{t("addCol")}</button></th>
          </tr></thead>
          <tbody>
            {rows.map((r,ri)=>(<tr key={ri}>
              {columns.map((_,ci)=>(
                <td key={ci} style={{border:"1px solid #eee",padding:2,position:"relative"}} className="cell-host">
                  <div style={{display:"flex",alignItems:"center",gap:2}}>
                    <input style={{...S.input,fontSize:12,padding:"4px 18px 4px 6px",minWidth:70,width:"100%"}} value={r[ci]||""} onChange={e=>setCell(ri,ci,e.target.value)}/>
                    <button className="cell-menu-btn" title={t("cellActions")} onClick={()=>setMenu(menu&&menu.ri===ri&&menu.ci===ci?null:{ri,ci})}
                      style={{position:"absolute",right:3,top:"50%",transform:"translateY(-50%)",border:"none",background:"rgba(157,2,8,0.06)",borderRadius:4,cursor:"pointer",color:"#9d0208",fontSize:14,fontWeight:700,lineHeight:1,padding:"3px 5px"}}>⋮</button>
                  </div>
                  {menu&&menu.ri===ri&&menu.ci===ci && (
                    <div style={S.cellMenu} onMouseLeave={()=>setMenu(null)}>
                      <button style={S.cellMenuItem} onClick={()=>clearCell(ri,ci)}>🧹 {t("cellClear")}</button>
                      <button style={S.cellMenuItem} onClick={()=>splitCell(ri,ci)}>✂ {t("cellSplit")}</button>
                      <button style={{...S.cellMenuItem,...(ci>=columns.length-1?{opacity:.4,pointerEvents:"none"}:{})}} onClick={()=>mergeRight(ri,ci)}>⇥ {t("cellMerge")}</button>
                    </div>
                  )}
                </td>
              ))}
              <td style={{border:"none",padding:2}}><button style={{...S.miniBtnDel,padding:"2px 6px"}} title={t("delRow")} onClick={()=>delRow(ri)}>✕</button></td>
            </tr>))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
        <button style={S.addBtnSm} onClick={addRow}>{t("addRow")}</button>
        <button style={S.addBtnSm} onClick={addCol}>{t("addCol")}</button>
      </div>
    </div>
  );
}

function InspectEditor({ block, onChange, onZoom }){
  const items=block.items||[];
  const [showLib,setShowLib]=useState(false);
  function setItem(i,patch){ const a=items.map((it,k)=>k===i?{...it,...patch}:it); onChange({items:a}); }
  function addItem(){ onChange({items:[...items,{id:bid(),label:"",state:"good",note:""}]}); }
  function delItem(i){ onChange({items:items.filter((_,k)=>k!==i)}); }
  function loadLibrary(lib){
    const newItems=lib.points.map(p=>({id:bid(),label:p,state:"good",note:""}));
    onChange({items:newItems}); setShowLib(false);
  }
  // numérotation auto des anomalies
  let anomCount=0;
  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
        <input style={{...S.input,fontWeight:700,fontFamily:"'Archivo'",flex:"1 1 200px"}} value={block.title} onChange={e=>onChange({title:e.target.value})}/>
        <div style={{position:"relative"}}>
          <button style={{...S.btnGhost,fontSize:12,padding:"7px 12px"}} onClick={()=>setShowLib(s=>!s)}>📋 {t("inspLoadList")}</button>
          {showLib && (
            <div style={{position:"absolute",right:0,top:"110%",zIndex:30,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 6px 20px rgba(0,0,0,.2)",padding:6,minWidth:200}} onMouseLeave={()=>setShowLib(false)}>
              <div style={{fontSize:10,color:"#64748b",padding:"2px 8px 6px"}}>{t("inspLoadHint")}</div>
              {INSP_LIBRARIES.map(lib=>(
                <button key={lib.id} style={{display:"block",width:"100%",textAlign:"left",border:"none",background:"transparent",cursor:"pointer",padding:"7px 8px",fontSize:13,color:"#1e293b",borderRadius:6}} onClick={()=>{ if(items.some(it=>it.label.trim()) && !confirm(t("inspReplaceConfirm"))) return; loadLibrary(lib); }}>
                  {t(lib.key)} <span style={{color:"#9a8c78",fontSize:11}}>({lib.points.length})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {items.map((it,i)=>{
          const isAnom = it.state==="anomaly";
          const num = isAnom ? (++anomCount) : null;
          return (
          <div key={it.id} style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",borderBottom:"1px solid #f1f5f9",paddingBottom:6}}>
            {num!=null && <span style={{...DP.annNum,background:"#9d0208",minWidth:16,height:16,fontSize:9}}>{String(num).padStart(2,"0")}</span>}
            <input style={{...S.input,flex:"1 1 160px",minWidth:120}} value={it.label} onChange={e=>setItem(i,{label:e.target.value})}/>
            <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
              {INSP_STATES.map(st=>(
                <button key={st.id} onClick={()=>setItem(i,{state:st.id})}
                  style={{...S.chip, fontSize:11, padding:"4px 8px", ...(it.state===st.id?{background:st.color,color:"#fff",borderColor:st.color}:{color:st.color,borderColor:st.color})}}>
                  {t(st.key)}
                </button>
              ))}
            </div>
            {isAnom && <div style={{display:"flex",gap:6,flex:"1 1 100%",flexWrap:"wrap",alignItems:"center"}}>
              <div style={{display:"flex",gap:3}}>
                {SEVERITIES.map(sv=>(
                  <button key={sv.id} onClick={()=>setItem(i,{severity:sv.id})}
                    style={{...S.chip, fontSize:10, padding:"3px 7px", ...((it.severity||"minor")===sv.id?{background:sv.color,color:"#fff",borderColor:sv.color}:{color:sv.color,borderColor:sv.color})}}>
                    {sevLabel(sv.id)}
                  </button>
                ))}
              </div>
              <input style={{...S.input,flex:"1 1 200px",fontSize:12}} value={it.note||""} onChange={e=>setItem(i,{note:e.target.value})}/>
              {it.photo
                ? <div style={{position:"relative",flexShrink:0}}>
                    <img src={it.photo} alt="" style={{height:42,width:42,objectFit:"cover",borderRadius:6,border:"1px solid #cbd5e1",cursor:"pointer"}} onClick={()=>onZoom&&onZoom(it.photo)}/>
                    <button onClick={()=>setItem(i,{photo:null})} title={t("del")} style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",border:"none",background:"#9d0208",color:"#fff",fontSize:11,cursor:"pointer",lineHeight:1}}>✕</button>
                  </div>
                : <label style={{...S.chip,fontSize:11,padding:"4px 9px",cursor:"pointer",color:"#1e293b",borderColor:"#a9cddc",flexShrink:0}}>📷 {t("inspPhoto")}
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{ const f=e.target.files?.[0]; if(f){ const d=await compressImage(f,1000,0.7); setItem(i,{photo:d}); } e.target.value=""; }}/>
                  </label>}
            </div>}
            <button style={{...S.miniBtnDel,padding:"3px 7px"}} onClick={()=>delItem(i)}>✕</button>
          </div>
          );
        })}
      </div>
      <button style={{...S.addBtnSm,marginTop:8}} onClick={addItem}>{t("inspectAddPoint")}</button>
    </div>
  );
}

function PhotosEditor({ block, onChange, onZoom }){
  const photos=block.photos||[];
  const layout=block.layout||"grid"; // 1col | 2col | grid
  const cols = layout==="1col"?1 : layout==="2col"?2 : 2;
  function setLayout(l){ onChange({layout:l}); }
  function addSlot(){ onChange({photos:[...photos,{id:bid(),data:null,caption:""}]}); }
  function addSlots(n){ const add=Array.from({length:n},()=>({id:bid(),data:null,caption:""})); onChange({photos:[...photos,...add]}); }
  async function fillSlot(id,file){ try{ const d=await compressImage(file); onChange({photos:photos.map(x=>x.id===id?{...x,data:d}:x)}); }catch{} }
  function clearSlot(id){ onChange({photos:photos.map(x=>x.id===id?{...x,data:null}:x)}); }
  function delSlot(id){ onChange({photos:photos.filter(x=>x.id!==id)}); }
  function setCap(id,v){ onChange({photos:photos.map(x=>x.id===id?{...x,caption:v}:x)}); }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8,flexWrap:"wrap"}}>
        <input style={{...S.input,fontWeight:700,fontFamily:"'Archivo'",flex:1,minWidth:140}} value={block.title} onChange={e=>onChange({title:e.target.value})}/>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#64748b",marginRight:2}}>{t("photoLayout")}</span>
          <button style={{...S.chip,fontSize:11,padding:"4px 9px",...(layout==="1col"?{background:"#1e293b",color:"#fff",borderColor:"#1e293b"}:{})}} onClick={()=>setLayout("1col")} title={t("layout1")}>▭</button>
          <button style={{...S.chip,fontSize:11,padding:"4px 9px",...(layout==="2col"?{background:"#1e293b",color:"#fff",borderColor:"#1e293b"}:{})}} onClick={()=>setLayout("2col")} title={t("layout2")}>▯▯</button>
          <button style={{...S.chip,fontSize:11,padding:"4px 9px",...(layout==="grid"?{background:"#1e293b",color:"#fff",borderColor:"#1e293b"}:{})}} onClick={()=>setLayout("grid")} title={t("layout4")}>⊞</button>
        </div>
      </div>
      {photos.length===0
        ? <div style={{textAlign:"center",color:"#64748b",fontSize:13,padding:"10px 0"}}>{t("noPhotoSlot")}</div>
        : <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
            {photos.map(p=>(
              <div key={p.id} style={{position:"relative",border:"1px dashed #cbd5e1",borderRadius:8,overflow:"hidden",background:"#faf6ee"}}>
                {p.data
                  ? <>
                      <img src={p.data} alt="" style={{width:"100%",height:140,objectFit:"cover",cursor:"pointer",display:"block"}} onClick={()=>onZoom&&onZoom(p.data)}/>
                      <button onClick={()=>clearSlot(p.id)} title={t("photoReplace")} style={{position:"absolute",top:5,right:30,border:"none",background:"rgba(0,0,0,.55)",color:"#fff",borderRadius:5,fontSize:11,cursor:"pointer",padding:"2px 6px"}}>↺</button>
                    </>
                  : <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:140,cursor:"pointer",color:"#1e293b"}}>
                      <span style={{fontSize:26,lineHeight:1}}>＋</span>
                      <span style={{fontSize:12,marginTop:4,fontWeight:700,fontFamily:"'Archivo'"}}>{t("photoAddHere")}</span>
                      <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; if(f) fillSlot(p.id,f); e.target.value=""; }}/>
                    </label>}
                <button onClick={()=>delSlot(p.id)} title={t("del")} style={{position:"absolute",top:5,right:5,border:"none",background:"rgba(157,2,8,.8)",color:"#fff",borderRadius:5,fontSize:12,cursor:"pointer",padding:"2px 6px"}}>✕</button>
                <input style={{...S.input,border:"none",borderTop:"1px solid #e2e8f0",borderRadius:0,fontSize:12}} value={p.caption||""} placeholder={t("photoCaption")} onChange={e=>setCap(p.id,e.target.value)}/>
              </div>
            ))}
          </div>}
      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
        <button style={S.addBtnSm} onClick={addSlot}>{t("photoAddSlot")}</button>
        <button style={S.addBtnSm} onClick={()=>addSlots(2)}>{t("photoAdd2")}</button>
      </div>
    </div>
  );
}

// ============================================================
//  PANNEAU ANNOTATIONS (anomalies / commentaires)
// ============================================================
// Panneau « Lier » : rattache le rapport à un PROJET (hub) et à un ÉVÉNEMENT du planner.
// Le lien rend le statut du rapport visible côté projet/facturation et le rattache à l'événement.
function LinkPanel({ report, onSet, onClose }){
  const [loading,setLoading]=useState(true);
  const [projects,setProjects]=useState([]);
  const [jobs,setJobs]=useState([]);
  const [qp,setQp]=useState(""); const [qj,setQj]=useState("");
  const link=report.link||{};
  useEffect(()=>{ (async()=>{
    try{ const res=await fetch("/api/rapports/links?kind=all",{credentials:"include"});
      if(res.ok){ const d=await res.json(); setProjects(d.projects||[]); setJobs(d.jobs||[]); } }
    catch(e){}
    setLoading(false);
  })(); },[]);
  function pickProject(p){ onSet({ projectId:p.id, projectNumber:p.number, projectTitle:p.title, clientName:p.client||link.clientName||"" }); }
  function pickJob(j){ onSet({ jobId:j.id, jobNumber:j.number||j.title, projectId: j.projectId||link.projectId||"" , clientName: j.client||link.clientName||"" }); }
  const fp=projects.filter(p=>{ const s=(qp||"").toLowerCase(); return !s || (p.number+" "+p.title+" "+p.client).toLowerCase().includes(s); });
  const fj=jobs.filter(j=>{ const s=(qj||"").toLowerCase(); return !s || (j.number+" "+j.title+" "+j.client).toLowerCase().includes(s); });
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:640,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h2 style={{...S.h2,margin:0}}>🔗 {LANG==="en"?"Link the report":"Lier le rapport"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#64748b",marginTop:0}}>{LANG==="en"?"Linking a project makes the report status visible to the project & invoicing; linking a scheduler event attaches the report to that event.":"Lier un projet rend le statut du rapport visible au projet et à la facturation ; lier un événement rattache le rapport à cet événement."}</p>

        {(link.projectId||link.jobId) && (
          <div style={{background:"#eef7f4",border:"1.5px solid #2a9d8f",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:13}}>
            <b>{LANG==="en"?"Current link":"Lien actuel"} :</b>{" "}
            {link.projectNumber?`📁 ${link.projectNumber}${link.projectTitle?" — "+link.projectTitle:""}`:""}
            {link.jobNumber?`  ·  📅 ${link.jobNumber}`:""}
            {link.clientName?`  ·  👤 ${link.clientName}`:""}
            <button style={{...S.btnGhost,fontSize:11,padding:"3px 8px",marginLeft:10}} onClick={()=>onSet({projectId:"",projectNumber:"",projectTitle:"",jobId:"",jobNumber:""})}>{LANG==="en"?"Detach":"Détacher"}</button>
          </div>
        )}

        {loading ? <div style={{textAlign:"center",color:"#64748b",padding:"20px 0"}}>…</div> : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:14}}>
          <div>
            <label style={S.label}>📁 {LANG==="en"?"Project":"Projet"}</label>
            <input style={S.input} placeholder={LANG==="en"?"Search…":"Rechercher…"} value={qp} onChange={e=>setQp(e.target.value)}/>
            <div style={{maxHeight:240,overflowY:"auto",marginTop:6,border:"1px solid #e2e8f0",borderRadius:8}}>
              {fp.length===0 ? <div style={{padding:10,fontSize:12,color:"#94a3b8"}}>{LANG==="en"?"No project":"Aucun projet"}</div> :
                fp.map(p=>(<button key={p.id} onClick={()=>pickProject(p)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",border:"none",borderBottom:"1px solid #f1f5f9",background:link.projectId===p.id?"#e0f2ec":"#fff",cursor:"pointer",fontSize:12.5}}>
                  <b>{p.number||"—"}</b> {p.title?"· "+p.title:""}<br/><span style={{color:"#64748b",fontSize:11}}>{p.client} {p.status?"· "+p.status:""}</span>
                </button>))}
            </div>
          </div>
          <div>
            <label style={S.label}>📅 {LANG==="en"?"Scheduler event":"Événement (planner)"}</label>
            <input style={S.input} placeholder={LANG==="en"?"Search…":"Rechercher…"} value={qj} onChange={e=>setQj(e.target.value)}/>
            <div style={{maxHeight:240,overflowY:"auto",marginTop:6,border:"1px solid #e2e8f0",borderRadius:8}}>
              {fj.length===0 ? <div style={{padding:10,fontSize:12,color:"#94a3b8"}}>{LANG==="en"?"No event":"Aucun événement"}</div> :
                fj.map(j=>(<button key={j.id} onClick={()=>pickJob(j)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",border:"none",borderBottom:"1px solid #f1f5f9",background:link.jobId===j.id?"#e0f2ec":"#fff",cursor:"pointer",fontSize:12.5}}>
                  <b>{j.number||j.title||"—"}</b><br/><span style={{color:"#64748b",fontSize:11}}>{j.client} {j.date?"· "+j.date:""} {j.status?"· "+j.status:""}</span>
                </button>))}
            </div>
          </div>
        </div>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button style={S.btnPrimary} onClick={onClose}>{LANG==="en"?"Done":"Terminé"}</button></div>
      </div>
    </div>
  );
}

// Résumé d'une analyse DGA (snapshot embarqué) — rendu commun écran/impression.
function DgaSummaryView({ s, print }){
  if(!s) return null;
  const g=s.gases||{};
  const gas=[["H₂",g.h2],["CH₄",g.ch4],["C₂H₆",g.c2h6],["C₂H₄",g.c2h4],["C₂H₂",g.c2h2],["CO",g.co],["CO₂",g.co2],["TDCG",s.tdcg]];
  const condColor = s.condition>=4?"#9d0208":s.condition===3?"#e85d04":s.condition===2?"#e0a96d":"#2a9d8f";
  const fs=print?10.5:13;
  return (
    <div style={{fontSize:fs}}>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8}}><tbody>
        <tr>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea",background:"#eef2f5",fontWeight:600,width:"22%"}}>{LANG==="en"?"Equipment":"Équipement"}</td>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea"}}>{s.equipment||"—"}{s.serial?` (${s.serial})`:""}</td>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea",background:"#eef2f5",fontWeight:600,width:"18%"}}>{LANG==="en"?"Date":"Date"}</td>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea"}}>{s.analysisDate||"—"}</td>
        </tr>
        <tr>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea",background:"#eef2f5",fontWeight:600}}>{LANG==="en"?"Location":"Localisation"}</td>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea"}}>{s.location||"—"}</td>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea",background:"#eef2f5",fontWeight:600}}>{LANG==="en"?"Rating":"Caract."}</td>
          <td style={{padding:"3px 6px",border:"0.5px solid #dde5ea"}}>{[s.kv?`${s.kv} kV`:"",s.mva?`${s.mva} MVA`:""].filter(Boolean).join(" · ")||"—"}</td>
        </tr>
      </tbody></table>
      {s.gases && (
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8,textAlign:"center"}}>
          <thead><tr>{gas.map(([k])=>(<th key={k} style={{padding:"3px 4px",border:"0.5px solid #dde5ea",background:"#34495e",color:"#fff",fontSize:print?9:11}}>{k}</th>))}</tr></thead>
          <tbody><tr>{gas.map(([k,v],i)=>(<td key={i} style={{padding:"3px 4px",border:"0.5px solid #dde5ea"}}>{v==null?"—":v}</td>))}</tr></tbody>
        </table>
      )}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>
        {s.condition!=null && <span style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:print?10:12,color:"#fff",background:condColor,borderRadius:6,padding:"3px 10px"}}>{LANG==="en"?"Condition":"Condition"} {s.condition}</span>}
        {s.duval && <span style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:print?10:12,color:"#1e293b",background:"#e2e8f0",borderRadius:6,padding:"3px 10px"}}>Duval : {s.duval}</span>}
        {s.fault && <span style={{fontSize:print?10:12,color:"#475569",alignSelf:"center"}}>⚠ {s.fault}</span>}
      </div>
      {s.recommendation && <div style={{fontSize:print?10:12.5,background:"#fffaf0",border:"1px solid #e0d5c2",borderRadius:6,padding:"6px 9px",marginBottom:4}}><b>{LANG==="en"?"Recommendation":"Recommandation"} :</b> {s.recommendation}</div>}
      {s.nextDate && <div style={{fontSize:print?9.5:11.5,color:"#64748b"}}>{LANG==="en"?"Next analysis":"Prochaine analyse"} : {s.nextDate}</div>}
    </div>
  );
}

// Sélecteur d'ANALYSE DGA : liste les dossiers du tenant (route serveur), puis insère un RÉSUMÉ
// embarqué (snapshot) de la dernière mesure dans le rapport terrain.
function DgaPicker({ onPick, onClose }){
  const [loading,setLoading]=useState(true);
  const [list,setList]=useState([]);
  const [q,setQ]=useState("");
  const [busy,setBusy]=useState("");
  useEffect(()=>{ (async()=>{
    try{ const r=await fetch("/api/dga/list",{credentials:"include"}); if(r.ok){ const j=await r.json(); setList(j.dossiers||[]); } }catch(e){}
    setLoading(false);
  })(); },[]);
  async function pick(id){
    setBusy(id);
    try{ const r=await fetch("/api/dga/list?dossierId="+encodeURIComponent(id),{credentials:"include"}); const j=await r.json();
      if(r.ok && j.summary) onPick(j.summary); else alert(j.error||"Erreur"); }
    catch(e){ alert(LANG==="en"?"Network error":"Erreur réseau"); }
    setBusy("");
  }
  const f=list.filter(d=>{ const s=(q||"").toLowerCase(); return !s || (d.ident+" "+d.serie+" "+d.client).toLowerCase().includes(s); });
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:560,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <h2 style={{...S.h2,margin:0}}>🧪 {LANG==="en"?"Insert a DGA analysis":"Insérer une analyse DGA"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#64748b",marginTop:0}}>{LANG==="en"?"A printable summary of the latest measurement is embedded into the report.":"Un résumé imprimable de la dernière mesure est embarqué dans le rapport."}</p>
        <input style={{...S.input,marginBottom:8}} placeholder={LANG==="en"?"Search equipment…":"Rechercher un équipement…"} value={q} onChange={e=>setQ(e.target.value)}/>
        {loading ? <div style={{textAlign:"center",color:"#94a3b8",padding:"20px 0"}}>…</div> :
          f.length===0 ? <div style={{fontSize:12,color:"#94a3b8",padding:"10px 0"}}>{LANG==="en"?"No DGA dossier.":"Aucun dossier DGA."}</div> :
          <div style={{maxHeight:"54vh",overflowY:"auto"}}>
            {f.map(d=>(
              <button key={d.id} onClick={()=>pick(d.id)} disabled={!!busy} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,width:"100%",textAlign:"left",border:"1px solid #e2e8f0",borderRadius:9,padding:"9px 11px",marginBottom:6,background:"#fff",cursor:"pointer",fontSize:13}}>
                <span><b>{d.ident||"—"}</b>{d.serie?<span style={{color:"#64748b"}}> · {d.serie}</span>:null}<br/><span style={{fontSize:11,color:"#94a3b8"}}>{d.client||""}{d.kv?` · ${d.kv} kV`:""}{d.mva?` · ${d.mva} MVA`:""}</span></span>
                <span style={{color:"#2a6f97",fontWeight:700,fontSize:12}}>{busy===d.id?"…":(LANG==="en"?"Insert ›":"Insérer ›")}</span>
              </button>
            ))}
          </div>}
      </div>
    </div>
  );
}

// Modale PARTAGE : génère un lien tokenisé pour un VÉRIFICATEUR externe (lecture ou révision),
// avec expiration optionnelle. Liste les liens actifs (révocables) et les commentaires reçus.
function ShareModal({ report, onClose }){
  const [mode,setMode]=useState("review");
  const [exp,setExp]=useState("0"); // jours ; 0 = sans expiration
  const [startD,setStartD]=useState(""); const [endD,setEndD]=useState(""); // fenêtre (mode édition)
  const [busy,setBusy]=useState(false);
  const [link,setLink]=useState(null);
  const [copied,setCopied]=useState(false);
  const [shares,setShares]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [err,setErr]=useState(null);
  async function load(){
    try{ const r=await fetch(`/api/rapports/share?reportId=${encodeURIComponent(report.id)}`,{credentials:"include"});
      if(r.ok){ const j=await r.json(); setShares(j.shares||[]); setReviews(j.reviews||[]); } }catch(e){}
  }
  useEffect(()=>{ load(); },[]);
  async function create(){
    setBusy(true); setErr(null); setLink(null);
    try{
      const payload={ reportId:report.id, mode };
      if(mode==="edit" && (startD||endD)){ if(startD) payload.startsAt=startD; if(endD) payload.endsAt=endD; }
      else { payload.expiresInDays = exp==="0"?null:Number(exp); }
      const r=await fetch("/api/rapports/share",{ method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include",
        body:JSON.stringify(payload) });
      const j=await r.json();
      if(!r.ok){ setErr(j.error||(LANG==="en"?"Error (save the report first?)":"Erreur (enregistrer le rapport d'abord ?)")); }
      else { setLink(j.url); load(); }
    }catch(e){ setErr(LANG==="en"?"Network error":"Erreur réseau"); }
    setBusy(false);
  }
  async function revoke(token){ try{ await fetch(`/api/rapports/share?token=${encodeURIComponent(token)}`,{method:"DELETE",credentials:"include"}); load(); }catch(e){} }
  function copy(){ try{ navigator.clipboard.writeText(link||""); setCopied(true); setTimeout(()=>setCopied(false),1500); }catch(e){} }
  const active=shares.filter(s=>!s.revoked);
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:600,maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <h2 style={{...S.h2,margin:0}}>📤 {LANG==="en"?"Share with a verifier":"Partager à un vérificateur"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#64748b",marginTop:0}}>{LANG==="en"?"Generate a private link. The verifier opens the report without an account.":"Générez un lien privé. Le vérificateur ouvre le rapport sans compte."}</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",marginBottom:10}}>
          <div>
            <label style={S.label}>{LANG==="en"?"Access":"Accès"}</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button style={{...S.chip,...(mode==="view"?S.chipOn:{})}} onClick={()=>setMode("view")}>👁 {LANG==="en"?"Read":"Lecture"}</button>
              <button style={{...S.chip,...(mode==="review"?S.chipOn:{})}} onClick={()=>setMode("review")}>✍ {LANG==="en"?"Review":"Révision"}</button>
              <button style={{...S.chip,...(mode==="edit"?S.chipOn:{})}} onClick={()=>setMode("edit")} title={LANG==="en"?"External subcontractor can fill values within the allowed window":"Le sous-traitant externe peut saisir les valeurs dans la fenêtre autorisée"}>🛠 {LANG==="en"?"Edit (values)":"Édition (valeurs)"}</button>
            </div>
          </div>
          {mode==="edit" ? (
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <div><label style={S.label}>{LANG==="en"?"From":"Du"}</label><input type="date" style={{...S.input,width:"auto"}} value={startD} onChange={e=>setStartD(e.target.value)}/></div>
              <div><label style={S.label}>{LANG==="en"?"To":"Au"}</label><input type="date" style={{...S.input,width:"auto"}} value={endD} onChange={e=>setEndD(e.target.value)}/></div>
            </div>
          ) : (
            <div>
              <label style={S.label}>{LANG==="en"?"Expiry":"Expiration"}</label>
              <select style={{...S.input,width:"auto"}} value={exp} onChange={e=>setExp(e.target.value)}>
                <option value="0">{LANG==="en"?"No expiry":"Sans expiration"}</option>
                <option value="7">7 {LANG==="en"?"days":"jours"}</option>
                <option value="30">30 {LANG==="en"?"days":"jours"}</option>
                <option value="90">90 {LANG==="en"?"days":"jours"}</option>
              </select>
            </div>
          )}
          <button style={S.btnPrimary} onClick={create} disabled={busy}>{busy?"…":(LANG==="en"?"Create link":"Créer le lien")}</button>
        </div>
        {mode==="edit" && <div style={{fontSize:11,color:"#64748b",marginTop:-4,marginBottom:8}}>{LANG==="en"?"The external user can only fill field/inspection values during the window — never change the structure.":"L'externe ne peut que saisir les valeurs (champs/inspections) pendant la fenêtre — jamais modifier la structure."}</div>}
        {err && <div style={{fontSize:12,color:"#9d0208",marginBottom:8}}>{err}</div>}
        {link && (
          <div style={{background:"#eef7f4",border:"1.5px solid #2a9d8f",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{fontSize:11,color:"#475569",marginBottom:4}}>{LANG==="en"?"Share this link:":"Partagez ce lien :"}</div>
            <div style={{fontSize:12,wordBreak:"break-all",color:"#0f172a"}}>{link}</div>
            <button style={{...S.btnGhost,fontSize:12,padding:"5px 10px",marginTop:6}} onClick={copy}>{copied?(LANG==="en"?"Copied ✓":"Copié ✓"):(LANG==="en"?"Copy":"Copier")}</button>
          </div>
        )}
        {active.length>0 && (
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#475569",marginBottom:6}}>{LANG==="en"?"Active links":"Liens actifs"} ({active.length})</div>
            {active.map(s=>(
              <div key={s.token} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 10px",marginBottom:6,fontSize:12}}>
                <span>{s.mode==="edit"?"🛠":s.mode==="review"?"✍":"👁"} {s.mode==="edit"?(LANG==="en"?"Edit":"Édition"):s.mode==="review"?(LANG==="en"?"Review":"Révision"):(LANG==="en"?"Read":"Lecture")} · {String(s.created_at).slice(0,10)}{s.expires_at?` · ${LANG==="en"?"until":"jusqu'au"} ${String(s.expires_at).slice(0,10)}`:""}</span>
                <button style={S.miniBtnDel} onClick={()=>revoke(s.token)}>{LANG==="en"?"Revoke":"Révoquer"}</button>
              </div>
            ))}
          </div>
        )}
        <div>
          <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#475569",marginBottom:6}}>💬 {LANG==="en"?"Reviewer comments":"Commentaires de révision"} {reviews.length>0?`(${reviews.length})`:""}</div>
          {reviews.length===0 ? <div style={{fontSize:12,color:"#94a3b8"}}>{LANG==="en"?"None yet.":"Aucun pour le moment."}</div> :
            reviews.map(rv=>(
              <div key={rv.id} style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:2}}><b style={{color:"#0f172a"}}>{rv.author||(LANG==="en"?"Verifier":"Vérificateur")}</b> · {String(rv.created_at).slice(0,16).replace("T"," ")}</div>
                <div style={{fontSize:13,whiteSpace:"pre-wrap"}}>{rv.comment}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Modale QR : un SEUL QR couvre tout le rapport (toutes ses pages). Le scan ouvre le rapport dans
// l'éditeur (deep-link ?r=). On liste les « pages » (sections/équipements) pour sauter directement
// à l'une d'elles — logique terrain : même QR, on choisit / on passe à la page suivante.
function QrPanel({ report, qr, qrMap, onJump, onClose }){
  const sections=(report.blocks||[]).filter(b=>b.type==="section");
  const [copied,setCopied]=useState(null);
  const [sel,setSel]=useState(()=>{ const o={report:true}; sections.forEach(b=>o[b.id]=true); return o; });
  const [size,setSize]=useState("M"); // taille d'étiquette : S | M | L
  function copy(url,key){ try{ navigator.clipboard.writeText(url||""); setCopied(key); setTimeout(()=>setCopied(null),1500); }catch(e){} }
  // Planche d'étiquettes QR (impression groupée) — comme les étiquettes du module Inventaire.
  function printSheet(){
    const px = size==="S"?120 : size==="L"?230 : 170;
    const labels=[];
    if(sel.report && qr) labels.push({ t:(LANG==="en"?"Full report":"Rapport complet")+" — "+(report.title||""), d:qr.data, u:qr.url });
    sections.forEach((b,k)=>{ const q=(qrMap||{})[b.id]; if(sel[b.id] && q) labels.push({ t:`#${k+1} ${b.title||""}`, d:q.data, u:q.url }); });
    if(labels.length===0){ alert(LANG==="en"?"Select at least one QR.":"Sélectionnez au moins un QR."); return; }
    const sub=(report.num?(report.num+" · "):"")+(report.client||"");
    const cells=labels.map(l=>`<div style="border:1px solid #cbd5e1;border-radius:8px;padding:10px;text-align:center;break-inside:avoid;page-break-inside:avoid">
      <div style="font-weight:700;font-size:12px;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(l.t||"").replace(/</g,"")}</div>
      <div style="font-size:9px;color:#777;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(sub||"").replace(/</g,"")}</div>
      <img src="${l.d}" style="width:${px}px;height:${px}px"/>
      <div style="font-size:7.5px;color:#999;margin-top:4px;word-break:break-all">${(l.u||"").replace(/</g,"")}</div>
    </div>`).join("");
    const w=window.open("","_blank","width=900,height=1000"); if(!w) return;
    w.document.write(`<html><head><title>QR — ${(report.title||"").replace(/</g,"")}</title>
      <style>@page{size:letter portrait;margin:10mm} body{font-family:Archivo,Arial,sans-serif;margin:0;padding:8mm}
      .grid{display:grid;grid-template-columns:repeat(${size==="L"?2:size==="S"?4:3},1fr);gap:8px}</style></head>
      <body><div class="grid">${cells}</div><script>setTimeout(function(){window.print();},300);</script></body></html>`);
    w.document.close();
  }
  const selCount=(sel.report?1:0)+sections.filter(b=>sel[b.id]).length;
  // Imprime une seule étiquette QR (à coller sur l'équipement) dans une fenêtre dédiée.
  function printLabel(title,dataUrl,url){
    const w=window.open("","_blank","width=420,height=520"); if(!w) return;
    w.document.write(`<html><head><title>QR — ${(title||"").replace(/</g,"")}</title></head>
      <body style="font-family:Archivo,Arial,sans-serif;text-align:center;padding:24px;margin:0">
      <div style="font-weight:900;font-size:18px;margin-bottom:6px">${(title||"").replace(/</g,"")||"Équipement"}</div>
      <div style="font-size:11px;color:#555;margin-bottom:12px">${(report.title||"").replace(/</g,"")} ${report.num?("· "+report.num):""}</div>
      <img src="${dataUrl}" style="width:280px;height:280px"/>
      <div style="font-size:9px;color:#888;margin-top:10px;word-break:break-all">${(url||"").replace(/</g,"")}</div>
      <script>setTimeout(function(){window.print();},250);</script></body></html>`);
    w.document.close();
  }
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:600,maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <h2 style={{...S.h2,margin:0}}>🔳 {LANG==="en"?"QR codes":"QR codes"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#64748b",marginTop:0}}>{LANG==="en"?"One QR for the whole report, plus one per section/equipment. Stick the equipment QR on the equipment: scanning opens that exact section to fill in — live — and everything assembles into the full report.":"Un QR pour le rapport complet, et un par section/équipement. Collez le QR d'un équipement dessus : le scan ouvre directement cette section à remplir — en direct — et tout s'assemble dans le rapport complet."}</p>

        {/* Planche d'étiquettes : imprimer les QR cochés d'un coup (taille réglable) */}
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 10px",marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:700,color:"#475569"}}>🖨 {LANG==="en"?"Label sheet":"Planche d'étiquettes"}</span>
          <span style={{fontSize:11,color:"#64748b"}}>{LANG==="en"?"Size":"Taille"}:</span>
          {["S","M","L"].map(s=>(<button key={s} onClick={()=>setSize(s)} style={{...S.miniBtn,...(size===s?{background:"#1e293b",color:"#fff",borderColor:"#1e293b"}:{})}}>{s}</button>))}
          <button style={{...S.btnPrimary,padding:"6px 12px",fontSize:12}} onClick={printSheet}>🖨 {LANG==="en"?"Print sheet":"Imprimer la planche"} ({selCount})</button>
          <button style={{...S.miniBtn}} onClick={()=>{ const o={report:true}; sections.forEach(b=>o[b.id]=true); setSel(o); }}>{LANG==="en"?"All":"Tout"}</button>
          <button style={{...S.miniBtn}} onClick={()=>{ const o={report:false}; sections.forEach(b=>o[b.id]=false); setSel(o); }}>{LANG==="en"?"None":"Aucun"}</button>
        </div>

        {/* QR RAPPORT COMPLET */}
        <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",border:"1.5px solid #1e293b",borderRadius:12,padding:12,marginBottom:14}}>
          {qr ? <img src={qr.data||qr} alt="QR" style={{width:120,height:120}}/> : <div style={{width:120,height:120,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}>…</div>}
          <div style={{flex:"1 1 200px",minWidth:170}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="checkbox" checked={!!sel.report} onChange={e=>setSel(s=>({...s,report:e.target.checked}))}/><span style={{fontFamily:"'Archivo'",fontWeight:900,fontSize:14}}>{LANG==="en"?"Full report":"Rapport complet"}</span></label>
            <div style={{fontSize:10.5,color:"#64748b",wordBreak:"break-all",margin:"4px 0 8px"}}>{qr?qr.url:""}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button style={{...S.miniBtn}} onClick={()=>copy(qr&&qr.url,"rep")}>{copied==="rep"?"✓":(LANG==="en"?"Copy":"Copier")}</button>
              {qr && <button style={{...S.miniBtn}} onClick={()=>printLabel(report.title||(LANG==="en"?"Full report":"Rapport complet"),qr.data,qr.url)}>🖨 {LANG==="en"?"Label":"Étiquette"}</button>}
            </div>
          </div>
        </div>

        {/* QR PAR SECTION / ÉQUIPEMENT */}
        <div style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:"#475569",marginBottom:6}}>{LANG==="en"?"Per section / equipment":"Par section / équipement"} ({sections.length})</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,160px),1fr))",gap:10}}>
          {sections.length===0 ? <div style={{fontSize:12,color:"#94a3b8"}}>{LANG==="en"?"No section yet.":"Aucune section."}</div> :
            sections.map((b,k)=>{ const q=(qrMap||{})[b.id];
              return (
              <div key={b.id} style={{border:`1px solid ${sel[b.id]?"#1e293b":"#e2e8f0"}`,borderRadius:10,padding:10,textAlign:"center",background:"#fff",position:"relative"}}>
                <input type="checkbox" checked={!!sel[b.id]} onChange={e=>setSel(s=>({...s,[b.id]:e.target.checked}))} style={{position:"absolute",left:8,top:8}}/>
                {q ? <img src={q.data} alt="QR" style={{width:100,height:100}}/> : <div style={{width:100,height:100,margin:"0 auto",color:"#cbd5e1"}}>…</div>}
                <div style={{fontWeight:700,fontSize:12,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={b.title||""}>{LANG==="en"?"Page":"Page"} {k+1} · {b.title||(LANG==="en"?"(untitled)":"(sans titre)")}</div>
                <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:7,flexWrap:"wrap"}}>
                  <button style={{...S.miniBtn,fontSize:10.5,padding:"3px 7px"}} onClick={()=>onJump(b.id)}>{LANG==="en"?"Edit":"Éditer"}</button>
                  {q && <button style={{...S.miniBtn,fontSize:10.5,padding:"3px 7px"}} onClick={()=>copy(q.url,b.id)}>{copied===b.id?"✓":(LANG==="en"?"Copy":"Copier")}</button>}
                  {q && <button style={{...S.miniBtn,fontSize:10.5,padding:"3px 7px"}} onClick={()=>printLabel(b.title,q.data,q.url)}>🖨</button>}
                </div>
              </div>
            ); })}
        </div>
      </div>
    </div>
  );
}

// Constructeur de soumission : l'utilisateur coche les anomalies/recommandations que le client
// veut faire chiffrer ; chaque item devient une ligne de soumission. On transmet un brouillon au
// module Soumissions (via sessionStorage) puis on y navigue — la soumission s'ouvre pré-remplie.
function SoumissionBuilder({ report, items, onClose }){
  const [sel,setSel]=useState(()=>{ const o={}; (items||[]).forEach(a=>{ o[a.id]= a.priceWanted!==false; }); return o; });
  const link=report.link||{};
  const chosen=(items||[]).filter(a=>sel[a.id]);
  function toggle(id){ setSel(s=>({...s,[id]:!s[id]})); }
  function go(){
    if(chosen.length===0){ alert(LANG==="en"?"Select at least one item.":"Sélectionnez au moins un item."); return; }
    const draft={
      from:"rapport", reportId:report.id, reportTitle:report.title||"",
      projectId:link.projectId||"", projectNumber:link.projectNumber||"", clientName:link.clientName||"",
      createdAt:new Date().toISOString(),
      items: chosen.map((a,i)=>({
        name: (a.title||a.desc||((LANG==="en"?"Item ":"Item ")+(i+1))).slice(0,120),
        description: [a.title&&a.desc?a.desc:"", a.kind==="anomaly"?(LANG==="en"?"(Anomaly":"(Anomalie")+(a.severity?" — "+a.severity:"")+")":(LANG==="en"?"(Recommendation)":"(Recommandation)"), a.equipment?("• "+a.equipment):""].filter(Boolean).join("  ").trim(),
        kind:a.kind, severity:a.severity||"", equipment:a.equipment||"",
      })),
    };
    try{ window.sessionStorage.setItem("cs_soum_prefill_v1", JSON.stringify(draft)); }catch(e){}
    const tenant=(typeof window!=="undefined" ? (window.location.pathname.split("/").filter(Boolean)[0]||"") : "");
    window.location.href = `/${tenant}/projects/soumissions?prefill=rapport`;
  }
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:620,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <h2 style={{...S.h2,margin:0}}>💲 {LANG==="en"?"Create a quote":"Faire une soumission"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#64748b",marginTop:0}}>{LANG==="en"?"Select the anomalies/recommendations the client wants priced — each becomes a quote item.":"Sélectionnez les anomalies/recommandations que le client veut faire chiffrer — chacune devient un item de la soumission."}</p>
        {!link.projectId && <div style={{fontSize:12,color:"#b45309",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"7px 10px",marginBottom:10}}>{LANG==="en"?"Tip: link a project first (🔗) so the quote attaches to it.":"Astuce : liez d'abord un projet (🔗) pour y rattacher la soumission."}</div>}
        <div style={{maxHeight:"48vh",overflowY:"auto"}}>
          {(items||[]).map(a=>(
            <label key={a.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 10px",border:"1px solid #e2e8f0",borderRadius:9,marginBottom:7,cursor:"pointer",background:sel[a.id]?"#f0f7fb":"#fff"}}>
              <input type="checkbox" checked={!!sel[a.id]} onChange={()=>toggle(a.id)} style={{marginTop:3}}/>
              <span style={{fontSize:13}}>
                <b style={{color:a.kind==="anomaly"?"#9d0208":"#2a6f97"}}>{a.kind==="anomaly"?"⚠ ":"➤ "}{a.title||(LANG==="en"?"(untitled)":"(sans titre)")}</b>
                {a.equipment?<span style={{color:"#64748b"}}> · {a.equipment}</span>:null}
                {a.desc?<><br/><span style={{color:"#475569",fontSize:12}}>{a.desc}</span></>:null}
              </span>
            </label>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#64748b"}}>{chosen.length} {LANG==="en"?"item(s) selected":"item(s) sélectionné(s)"}</span>
          <div style={{display:"flex",gap:8}}>
            <button style={S.btnGhost} onClick={onClose}>{t("cancel")}</button>
            <button style={S.btnPrimary} onClick={go}>💲 {LANG==="en"?"Open the quote":"Ouvrir la soumission"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard CONSOLIDÉ des anomalies/recommandations de TOUS les rapports — gestion instantanée :
// filtrer, marquer corrigé, ajuster la gravité, ouvrir le rapport à l'endroit exact.
function AnomalyDashboard({ db, onClose, onOpen, onUpdate }){
  const all=collectAllFindings(db);
  const [kind,setKind]=useState("all");     // all | anomaly | reco
  const [stat,setStat]=useState("open");    // open (à traiter) | corrected | all
  const [sev,setSev]=useState("all");       // all | critical | major | minor
  const [q,setQ]=useState("");
  const [byEquip,setByEquip]=useState(false); // vue « historique par équipement »
  const filtered=all.filter(f=>{
    if(kind!=="all" && f.kind!==kind) return false;
    if(stat==="open" && f.corrected) return false;
    if(stat==="corrected" && !f.corrected) return false;
    if(sev!=="all" && f.kind==="anomaly" && (f.severity||"minor")!==sev) return false;
    const s=(q||"").toLowerCase();
    if(s && !((f.title+" "+f.desc+" "+f.equipment+" "+f.reportTitle).toLowerCase().includes(s))) return false;
    return true;
  });
  const order={critical:0,major:1,minor:2};
  filtered.sort((a,b)=>(a.corrected?1:0)-(b.corrected?1:0) || (order[a.severity]??3)-(order[b.severity]??3));
  const cAnom=all.filter(f=>f.kind==="anomaly").length, cReco=all.filter(f=>f.kind==="reco").length, cCorr=all.filter(f=>f.corrected).length, cOpen=all.length-cCorr;
  const chip=(on)=>({...S.chip,...(on?S.chipOn:{})});
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:820,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
          <h2 style={{...S.h2,margin:0}}>⚠ {LANG==="en"?"Anomalies & recommendations":"Anomalies & recommandations"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:11,color:"#64748b",marginBottom:10}}>
          <span>⚠ {LANG==="en"?"Anomalies":"Anomalies"} : <b>{cAnom}</b></span>
          <span>➤ {LANG==="en"?"Reco.":"Reco."} : <b>{cReco}</b></span>
          <span style={{color:"#b45309"}}>○ {LANG==="en"?"Open":"À traiter"} : <b>{cOpen}</b></span>
          <span style={{color:"#2a9d8f"}}>✓ {LANG==="en"?"Corrected":"Corrigées"} : <b>{cCorr}</b></span>
        </div>
        <input style={{...S.input,marginBottom:8}} placeholder={LANG==="en"?"Search…":"Rechercher…"} value={q} onChange={e=>setQ(e.target.value)}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
          <button style={chip(kind==="all")} onClick={()=>setKind("all")}>{LANG==="en"?"All types":"Tous"}</button>
          <button style={chip(kind==="anomaly")} onClick={()=>setKind("anomaly")}>⚠ {LANG==="en"?"Anomalies":"Anomalies"}</button>
          <button style={chip(kind==="reco")} onClick={()=>setKind("reco")}>➤ {LANG==="en"?"Recommendations":"Recommandations"}</button>
          <span style={{width:1,height:20,background:"#e2e8f0"}}/>
          <button style={chip(stat==="open")} onClick={()=>setStat("open")}>○ {LANG==="en"?"To handle":"À traiter"}</button>
          <button style={chip(stat==="corrected")} onClick={()=>setStat("corrected")}>✓ {LANG==="en"?"Corrected":"Corrigées"}</button>
          <button style={chip(stat==="all")} onClick={()=>setStat("all")}>{LANG==="en"?"All":"Toutes"}</button>
          <span style={{width:1,height:20,background:"#e2e8f0"}}/>
          {["all","critical","major","minor"].map(sv=>(<button key={sv} style={chip(sev===sv)} onClick={()=>setSev(sv)}>{sv==="all"?(LANG==="en"?"All sev.":"Toute grav."):sevLabel(sv)}</button>))}
          <span style={{width:1,height:20,background:"#e2e8f0"}}/>
          <button style={chip(byEquip)} onClick={()=>setByEquip(v=>!v)} title={LANG==="en"?"Group by equipment (history)":"Regrouper par équipement (historique)"}>🔧 {LANG==="en"?"By equipment":"Par équipement"}</button>
        </div>
        <div style={{fontSize:11,color:"#94a3b8",margin:"4px 0 8px"}}>{filtered.length} {LANG==="en"?"result(s)":"résultat(s)"}</div>
        {(()=>{
          // Ligne réutilisable (constat).
          const Row=(f)=>(
              <div key={f.reportId+":"+f.id} style={{border:"1px solid #e2e8f0",borderLeft:`4px solid ${f.kind==="anomaly"?sevColor(f.severity):"#2a6f97"}`,borderRadius:9,padding:"9px 11px",marginBottom:7,background:f.corrected?"#f6faf8":"#fff",opacity:f.corrected?0.78:1}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <div style={{flex:"1 1 280px",minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,textDecoration:f.corrected?"line-through":"none"}}>
                      {f.kind==="anomaly"?"⚠ ":"➤ "}{f.title||(LANG==="en"?"(untitled)":"(sans titre)")}
                      {f.kind==="anomaly" && <span style={{...S.uncertainTag,marginLeft:8,color:sevColor(f.severity),background:"#fff",borderColor:sevColor(f.severity)}}>{sevLabel(f.severity)}</span>}
                    </div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2}}>📄 {f.reportTitle||"—"}{f.reportDate?`  ·  ${f.reportDate}`:""}{!byEquip&&f.equipment?`  ·  🔧 ${f.equipment}`:""}{f.source==="inspect"?`  ·  ☑`:""}</div>
                    {f.desc && <div style={{fontSize:12,color:"#475569",marginTop:3}}>{f.desc}</div>}
                    {f.correctedAt && <div style={{fontSize:10.5,color:"#2a9d8f",marginTop:2}}>✓ {LANG==="en"?"Corrected":"Corrigée"} {String(f.correctedAt).slice(0,10)}</div>}
                  </div>
                  <div style={{display:"flex",gap:5,flexDirection:"column",alignItems:"flex-end"}}>
                    <button style={{...S.miniBtn}} onClick={()=>onOpen(f.reportId, f.source==="inspect"?f.blkId:undefined)}>{LANG==="en"?"Open ›":"Ouvrir ›"}</button>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
                      {f.kind==="anomaly" && !f.corrected && SEVERITIES.map(s=>(<button key={s.id} onClick={()=>onUpdate(f,{severity:s.id})} title={sevLabel(s.id)} style={{width:18,height:18,borderRadius:"50%",border:f.severity===s.id?`2px solid ${s.color}`:"1px solid #cbd5e1",background:f.severity===s.id?s.color:"#fff",cursor:"pointer",padding:0}}/>))}
                      <button style={{...S.miniBtn,...(f.corrected?{color:"#2a9d8f",borderColor:"#9bd4cc",background:"#eef7f3"}:{})}} onClick={()=>onUpdate(f, f.corrected?{corrected:false,correctedAt:null}:{corrected:true,correctedAt:new Date().toISOString()})}>{f.corrected?"✓ "+(LANG==="en"?"Corrected":"Corrigé"):(LANG==="en"?"Mark corrected":"Marquer corrigé")}</button>
                    </div>
                  </div>
                </div>
              </div>
          );
          if(filtered.length===0) return <div style={{textAlign:"center",color:"#94a3b8",padding:"24px 0"}}>{LANG==="en"?"Nothing here.":"Rien ici."}</div>;
          if(!byEquip) return <div>{filtered.map(Row)}</div>;
          // VUE HISTORIQUE PAR ÉQUIPEMENT : groupe par nom d'équipement, trie les constats du + récent
          // au + ancien (date du rapport). Les corrigés restent visibles = l'historique de l'équipement.
          const groups={};
          filtered.forEach(f=>{ const k=(f.equipment||"(—)").trim()||"(—)"; (groups[k]=groups[k]||[]).push(f); });
          const names=Object.keys(groups).sort((a,b)=>a.localeCompare(b));
          return <div>{names.map(name=>{
            const items=groups[name].slice().sort((a,b)=>String(b.reportDate||"").localeCompare(String(a.reportDate||"")));
            const open=items.filter(f=>!f.corrected).length, corr=items.length-open;
            return (
              <div key={name} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:"#f1f5f9",borderRadius:8,padding:"7px 11px",marginBottom:6}}>
                  <span style={{fontFamily:"'Archivo'",fontWeight:800,fontSize:13}}>🔧 {name}</span>
                  <span style={{fontSize:11,color:"#64748b"}}>{items.length} {LANG==="en"?"finding(s)":"constat(s)"} · <b style={{color:"#b45309"}}>{open}</b> {LANG==="en"?"open":"à traiter"} · <b style={{color:"#2a9d8f"}}>{corr}</b> {LANG==="en"?"corrected":"corrigé(s)"}</span>
                </div>
                {items.map(Row)}
              </div>
            );
          })}</div>;
        })()}
      </div>
    </div>
  );
}

// Éditeur de LETTRE DE PRÉSENTATION (page couverture jointe au rapport). Tous les champs sont
// éditables et VIDES par défaut (aucune donnée d'exemple). Un bouton génère un corps type.
function LetterModal({ report, onSet, onClose }){
  const L=report.letter||{};
  const set=(k,v)=>onSet({[k]:v});
  function genBody(){
    const subj=L.subject||report.title||"";
    const body = LANG==="en"
      ? `Please find enclosed our report regarding ${subj||"the inspection"}.\n\nWe hope it meets your full satisfaction. Do not hesitate to contact us for any additional information.\n\nYours sincerely,`
      : `Veuillez trouver ci-joint notre rapport concernant ${subj||"l'inspection"}.\n\nNous espérons le tout à votre entière satisfaction. N'hésitez pas à communiquer avec nous pour toute information supplémentaire.\n\nNous vous prions d'agréer, Madame, Monsieur, nos sincères salutations.`;
    set("body",body);
  }
  const F=(label,key,opt={})=>(
    <div style={{gridColumn:opt.full?"1 / -1":"auto"}}>
      <label style={S.label}>{label}</label>
      <input style={S.input} value={L[key]||""} onChange={e=>set(key,e.target.value)} placeholder={opt.ph||""}/>
    </div>
  );
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:640,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <h2 style={{...S.h2,margin:0}}>✉ {LANG==="en"?"Cover letter":"Lettre de présentation"}</h2>
          <button style={S.miniBtnDel} onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#64748b",marginTop:0}}>{LANG==="en"?"Editable letter attached as the first page of the export.":"Lettre éditable jointe en première page de l'export."}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:10}}>
          {F(LANG==="en"?"City":"Ville", "city", {ph:LANG==="en"?"Sherbrooke":"Sherbrooke"})}
          {F(LANG==="en"?"Date":"Date", "date", {ph:LANG==="en"?"June 9, 2026":"le 9 juin 2026"})}
          {F(LANG==="en"?"Recipient":"Destinataire", "recipientName", {ph:LANG==="en"?"Mr. John Smith":"Monsieur Jean Tremblay"})}
          {F(LANG==="en"?"Company":"Entreprise", "company")}
          {F(LANG==="en"?"Address line 1":"Adresse (ligne 1)", "addr1")}
          {F(LANG==="en"?"Address line 2":"Adresse (ligne 2)", "addr2")}
          {F(LANG==="en"?"Subject":"Objet", "subject", {full:true})}
          {F(LANG==="en"?"Their client":"Votre client", "clientRef")}
          {F(LANG==="en"?"Their order #":"Votre commande", "orderRef")}
          {F(LANG==="en"?"Our file #":"Notre dossier", "fileRef")}
          {F(LANG==="en"?"Attachment":"Pièce jointe", "attachment", {ph:LANG==="en"?"Report":"Rapport"})}
        </div>
        <div style={{marginTop:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <label style={S.label}>{LANG==="en"?"Body":"Corps de la lettre"}</label>
            <button style={{...S.miniBtn,marginBottom:4}} onClick={genBody}>✨ {LANG==="en"?"Generate text":"Générer le texte type"}</button>
          </div>
          <textarea style={{...S.input,minHeight:120,resize:"vertical",fontFamily:"'Spline Sans'"}} value={L.body||""} onChange={e=>set("body",e.target.value)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:10,marginTop:10}}>
          {F(LANG==="en"?"Signatory":"Signataire", "signName")}
          {F(LANG==="en"?"Title":"Titre", "signTitle", {ph:LANG==="en"?"tech.":"tech."})}
          {F(LANG==="en"?"Initials":"Initiales", "initials")}
        </div>
        <div style={{marginTop:16,textAlign:"right"}}><button style={S.btnDark} onClick={onClose}>{t("save")}</button></div>
      </div>
    </div>
  );
}

function AnnotationsPanel({ annotations, onAdd, onUpd, onDel, onClose, onZoom }){
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{...S.modal,maxWidth:680,maxHeight:"86vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <h2 style={{...S.h2,margin:0}}>💬 {t("annotations")}</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button style={{...S.btnDark,background:"#9d0208",fontSize:12,padding:"7px 12px"}} onClick={()=>onAdd("anomaly")}>{t("addAnomaly")}</button>
            <button style={{...S.btnDark,background:"#2a6f97",fontSize:12,padding:"7px 12px"}} onClick={()=>onAdd("reco")}>{LANG==="en"?"+ Recommendation":"+ Recommandation"}</button>
            <button style={{...S.btnDark,fontSize:12,padding:"7px 12px"}} onClick={()=>onAdd("comment")}>{t("addComment")}</button>
          </div>
        </div>
        {annotations.length===0 ? <div style={{textAlign:"center",color:"#64748b",padding:"24px 0"}}>{t("noAnnotations")}</div> : (
          annotations.map((a,i)=>(
            <div key={a.id} style={{border:`1.5px solid ${a.kind==="anomaly"?"#e3a0a0":a.kind==="reco"?"#9ec5db":"#aebdc8"}`,borderRadius:10,padding:12,marginBottom:10,background:a.kind==="anomaly"?"#fdf0ee":a.kind==="reco"?"#eef5fa":"#eef2f5"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8,flexWrap:"wrap"}}>
                <span style={{fontFamily:"'Archivo'",fontWeight:700,fontSize:12,color:a.kind==="anomaly"?"#9d0208":a.kind==="reco"?"#2a6f97":"#34607a"}}>
                  {a.kind==="anomaly"?"⚠ "+t("anomaly"):a.kind==="reco"?(LANG==="en"?"➤ Recommendation":"➤ Recommandation"):"💬 "+t("comment")} #{i+1}
                </span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {(a.kind==="anomaly"||a.kind==="reco") && (
                    <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:a.priceWanted!==false?"#2a6f97":"#94a3b8",cursor:"pointer"}} title={LANG==="en"?"Include in the quote (client wants a price)":"Inclure dans la soumission (le client veut un prix)"}>
                      <input type="checkbox" checked={a.priceWanted!==false} onChange={e=>onUpd(a.id,{priceWanted:e.target.checked})}/>
                      💲 {LANG==="en"?"To price":"À chiffrer"}
                    </label>
                  )}
                  <button style={S.miniBtnDel} onClick={()=>onDel(a.id)}>✕</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div><label style={S.label}>{t("annTitle")}</label><input style={S.input} value={a.title} onChange={e=>onUpd(a.id,{title:e.target.value})}/></div>
                <div><label style={S.label}>{t("equipment")}</label><input style={S.input} value={a.equipment} onChange={e=>onUpd(a.id,{equipment:e.target.value})}/></div>
              </div>
              {a.kind==="anomaly" && (
                <div style={{marginBottom:8}}>
                  <label style={S.label}>{t("severity")}</label>
                  <div style={{display:"flex",gap:6}}>
                    {SEVERITIES.map(s=>(<button key={s.id} onClick={()=>onUpd(a.id,{severity:s.id})} style={{...S.chip,...(a.severity===s.id?{background:s.color,color:"#fff",borderColor:s.color}:{color:s.color,borderColor:s.color})}}>{t(s.key)}</button>))}
                  </div>
                </div>
              )}
              <label style={S.label}>{t("annDesc")}</label>
              <textarea style={{...S.input,minHeight:60,resize:"vertical",fontFamily:"'Spline Sans'"}} value={a.desc} onChange={e=>onUpd(a.id,{desc:e.target.value})}/>
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
                {a.photo ? <img src={a.photo} alt="" style={{height:54,borderRadius:6,cursor:"pointer"}} onClick={()=>onZoom(a.photo)}/> : null}
                <label style={{...S.btnGhost,cursor:"pointer",fontSize:12,padding:"6px 12px"}}>{a.photo?"Changer":t("annPhoto")}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{ const f=e.target.files?.[0]; if(f){ const d=await compressImage(f,800,0.7); onUpd(a.id,{photo:d}); } e.target.value=""; }}/>
                </label>
                {a.photo && <button style={S.miniBtnDel} onClick={()=>onUpd(a.id,{photo:null})}>{t("del")}</button>}
              </div>
            </div>
          ))
        )}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><button style={S.btnPrimary} onClick={onClose}>{t("genReport")}</button></div>
      </div>
    </div>
  );
}

function InsertPageForm({ blocks, customTpls, onInsert, onCancel }){
  const [tplId,setTplId]=useState("inspection");
  const [afterIdx,setAfterIdx]=useState(blocks.length-1);
  const customs=customTpls||[];
  return (
    <div>
      <label style={S.label}>{t("chooseTemplate")}</label>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
        {visTpls().map(tp=>(<button key={tp.id} onClick={()=>setTplId(tp.id)} style={{...S.chip,...(tplId===tp.id?S.chipOn:{})}}>{t(tp.key)}</button>))}
      </div>
      {customs.length>0 && <>
        <div style={{fontSize:11,color:"#6b4e9d",fontWeight:700,margin:"6px 0 4px"}}>★ {t("tplCustom")}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {customs.map(c=>(<button key={c.id} onClick={()=>setTplId(c.id)} style={{...S.chip,...(tplId===c.id?{...S.chipOn,background:"#6b4e9d",borderColor:"#6b4e9d"}:{borderColor:"#6b4e9d",color:"#6b4e9d"})}}>★ {c.name}</button>))}
        </div>
      </>}
      <label style={S.label}>{t("insertWhere")}</label>
      <select style={S.input} value={afterIdx} onChange={e=>setAfterIdx(parseInt(e.target.value))}>
        <option value={-1}>{LANG==="en"?"At the very beginning":"Tout au début"}</option>
        {blocks.map((b,i)=>(<option key={b.id} value={i}>#{i+1} — {b.type==="section"?b.title:b.type==="photos"?"🖼 "+b.title:"¶ "+(b.value||t("freeText")).slice(0,30)}</option>))}
      </select>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <button style={S.btnPrimary} onClick={()=>onInsert(tplId,afterIdx)}>{t("insertConfirm")}</button>
        <button style={S.btnGhost} onClick={onCancel}>{t("cancel")}</button>
      </div>
    </div>
  );
}

// ============================================================
//  RAPPORT IMPRIMABLE
// ============================================================
function PrintDoc({ report, logo, pale, qr, qrMap, updatesOnly }){
  const r=report; const today=new Date().toISOString().slice(0,10);
  const tplLabel=t((TEMPLATES.find(x=>x.id===r.template)||{}).key||"");
  // Export « mises à jour seulement » : ne garder que les blocs marqués 🔁 (addendum).
  const printBlocks = updatesOnly ? (r.blocks||[]).filter(b=>b.updated) : (r.blocks||[]);
  return (
    <div className={"print-only"+(pale?" pale":"")+(r.condensed?" cond":"")+(r.sectionPerPage?" secpage":"")} style={DP.wrap}>
      {/* LETTRE DE PRÉSENTATION (optionnelle) — tout en première page. Champs vides repliés sur
          les infos déjà enregistrées du rapport. */}
      {!updatesOnly && (r.letter&&r.letter.show) && (()=>{
        const L=r.letter||{};
        const company=L.company||r.client||"";
        const subject=L.subject||r.title||"";
        const fileRef=L.fileRef||r.num||r.projectNo||"";
        const dateStr=L.date||today;
        const attachment=L.attachment||(LANG==="en"?"Report":"Rapport");
        // Salutation d'ouverture (norme lettre d'affaires) : reprend la civilité du destinataire
        // si reconnue, sinon « Madame, Monsieur, ».
        const rn=(L.recipientName||"").trim();
        const civ = /^(monsieur|m\.|mr)\b/i.test(rn) ? (LANG==="en"?"Dear Sir,":"Monsieur,")
                  : /^(madame|mme|mrs|ms)\b/i.test(rn) ? (LANG==="en"?"Dear Madam,":"Madame,")
                  : (LANG==="en"?"Dear Sir or Madam,":"Madame, Monsieur,");
        return (
        <div className="letter-page-print" style={{minHeight:"245mm",display:"flex",flexDirection:"column",fontFamily:"'Spline Sans',sans-serif",fontSize:11.5,lineHeight:1.55,color:"#1a1a1a",padding:"4mm 6mm"}}>
          {/* En-tête : logo dimensionné + filet de séparation */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:10}}>
            {logo ? <img src={logo} alt="" style={{maxHeight:74,maxWidth:230,objectFit:"contain"}}/> : <span/>}
          </div>
          <div style={{borderBottom:"2px solid "+THEME.secBar,marginBottom:26}}/>
          {/* Lieu et date, alignés à droite */}
          <div style={{textAlign:"right",marginBottom:26}}>{[L.city,dateStr].filter(Boolean).join(", ")}</div>
          {/* Bloc destinataire */}
          <div style={{marginBottom:22,lineHeight:1.4}}>
            {L.recipientName && <div style={{fontWeight:700}}>{L.recipientName}</div>}
            {company && <div>{company}</div>}
            {L.addr1 && <div>{L.addr1}</div>}
            {L.addr2 && <div>{L.addr2}</div>}
          </div>
          {/* Objet (gras + souligné) */}
          {subject && <div style={{fontWeight:700,textDecoration:"underline",marginBottom:16}}>{LANG==="en"?"Subject":"Objet"} : {subject}</div>}
          {/* Références */}
          {(L.clientRef||L.orderRef||fileRef) && (
            <div style={{marginBottom:20,lineHeight:1.4}}>
              {L.clientRef && <div>{LANG==="en"?"Your client":"Votre client"} : {L.clientRef}</div>}
              {L.orderRef && <div>{LANG==="en"?"Your order":"Votre commande"} : {L.orderRef}</div>}
              {fileRef && <div>{LANG==="en"?"Our file":"Notre dossier"} : {fileRef}</div>}
            </div>
          )}
          {/* Appel */}
          <div style={{marginBottom:14}}>{civ}</div>
          {/* Corps justifié */}
          <div style={{whiteSpace:"pre-wrap",textAlign:"justify",marginBottom:30,flex:1}}>{L.body||""}</div>
          {/* Signature : espace pour signature manuscrite + nom/titre */}
          <div style={{marginTop:"auto"}}>
            {L.signName && <>
              <div style={{height:"16mm"}}/>
              <div style={{fontWeight:700}}>{L.signName}</div>
              {L.signTitle && <div style={{fontSize:11}}>{L.signTitle}</div>}
            </>}
            {(L.initials||attachment) && <div style={{borderTop:"1px solid #d9d9d9",marginTop:14,paddingTop:8}}>
              {L.initials && <div style={{fontSize:10,color:"#666"}}>{L.initials}</div>}
              {attachment && <div style={{fontSize:11,marginTop:4}}>{LANG==="en"?"Enclosure":"Pièce jointe"} : {attachment}</div>}
            </div>}
          </div>
        </div>
        );
      })()}
      {/* PAGE COUVERTURE (optionnelle) — hors du tableau d'en-tête/pied répété */}
      {!updatesOnly && (r.cover||{}).show!==false && (()=>{
        const cv=r.cover||{};
        const bg=cv.bg; // image de fond optionnelle
        return (
        <div style={{...DP.coverPage, position:"relative", overflow:"hidden", ...(bg?{justifyContent:"flex-start",paddingTop:"30mm"}:{})}} className="cover-page-print">
          {bg && <img src={bg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0}}/>}
          {bg && <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.74)",zIndex:0}}/>}
          <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
            {logo && <img src={logo} alt="" style={{maxHeight:80,maxWidth:240,objectFit:"contain",marginBottom:30}}/>}
            <div style={DP.coverKicker}>{(cv.kicker||tplLabel).toUpperCase()}</div>
            <h1 style={DP.coverTitle}>{cv.titleOverride||r.title||"—"}</h1>
            {cv.subtitle && <div style={DP.coverSubtitle}>{cv.subtitle}</div>}
            <div style={DP.coverMeta}>
              {r.client && <div><b>{t("client")} :</b> {r.client}</div>}
              {r.location && <div><b>{t("location")} :</b> {r.location}</div>}
              {r.projectNo && <div><b>{t("projectNo")} :</b> {r.projectNo}</div>}
              {r.date && <div><b>{t("date")} :</b> {r.date}</div>}
              {cv.preparedBy && <div style={{marginTop:14}}><b>{t("coverPreparedBy")} :</b> {cv.preparedBy}</div>}
            </div>
          </div>
        </div>
        );
      })()}

      {/* TABLE DES MATIÈRES (optionnelle) — sa propre page, hors table en-tête/pied */}
      {!updatesOnly && r.toc && (r.blocks||[]).length>0 && (
        <div className="toc-page-print" style={DP.tocPage}>
          <h2 style={DP.tocTitle}>{t("tocTitle")}</h2>
          <div>
            {(()=>{ let secNo=0; return (r.blocks||[]).map((b,i)=>{
              const isZone=b.type==="zone";
              const isHead=b.type==="section";
              if(isHead) secNo++;
              const ic = b.type==="section"?"":b.type==="zone"?"🗂 ":b.type==="dga"?"🧪 ":b.type==="photos"?"🖼 ":b.type==="pdfpage"?"📄 ":b.type==="table"?"▦ ":b.type==="inspect"?"☑ ":"¶ ";
              const lbl=(b.type==="photos"||b.type==="section"||b.type==="table"||b.type==="inspect"||b.type==="zone")?(b.title||"").trim():b.type==="pdfpage"?(b.name||t("pdfPageZone")):b.type==="dga"?("DGA · "+((b.summary||{}).equipment||"")):(b.value||"").trim().slice(0,60);
              if(isZone) return <div key={b.id} style={{fontFamily:"'Archivo'",fontWeight:900,fontSize:13,color:THEME.title,marginTop:i?12:0,marginBottom:3,borderBottom:"1px solid "+THEME.border,paddingBottom:2}}>{ic}{lbl}</div>;
              return <div key={b.id} style={isHead?DP.tocHead:DP.tocSub}>
                {isHead && <span style={{color:THEME.secBar,fontWeight:700,marginRight:8}}>{secNo}.</span>}
                {ic}{lbl||t("freeText").replace("…","")}
              </div>;
            }); })()}
          </div>
        </div>
      )}

      {/* CONTENU avec en-tête/pied répétés via thead/tfoot (réservent l'espace) */}
      <table className="rpt-runtable">
        <thead><tr><td>
          <div className="run-head" style={{borderBottom:"1.5px solid "+THEME.secBar}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>{logo && <img src={logo} alt="" style={{maxHeight:26,maxWidth:90,objectFit:"contain"}}/>}<span style={{fontFamily:"'Archivo'",fontWeight:900,fontSize:11,color:THEME.title}}>{r.title||tplLabel}</span></div>
            <span style={{fontSize:9,color:"#888"}}>{today}</span>
          </div>
        </td></tr></thead>
        <tfoot><tr><td>
          <div className="run-foot" style={{borderTop:"1px solid "+THEME.border}}>
            <span>{tplLabel} · {r.num || (TEMPLATES.find(x=>x.id===r.template)||{}).num || ""}{r.projectNo?` · ${t("projectNo")} ${r.projectNo}`:""}</span>
            <span style={{display:"flex",alignItems:"center",gap:8}}>
              <span>{t("version")}{r.version} · {t("status")} {statusLabel(r.status)}</span>
              {qr && r.qrShow!==false && <img src={qr} alt="QR" style={{height:30,width:30}}/>}
            </span>
          </div>
        </td></tr></tfoot>
        <tbody><tr><td>
        <div className="rpt-content">
      <div style={DP.titleRow}>
        <div>
          <div style={DP.kicker}>{tplLabel.toUpperCase()}</div>
          <h1 style={DP.h1}>{r.title||"—"}</h1>
        </div>
        {logo && <img src={logo} alt="" style={{maxHeight:54,maxWidth:150,objectFit:"contain"}}/>}
      </div>
      <table style={DP.metaTable}><tbody>
        <tr><td style={DP.mLbl}>{t("client")}</td><td style={DP.mVal}>{r.client||"—"}</td><td style={DP.mLbl}>{t("date")}</td><td style={DP.mVal}>{r.date||"—"}</td></tr>
        <tr><td style={DP.mLbl}>{t("location")}</td><td style={DP.mVal}>{r.location||"—"}</td><td style={DP.mLbl}>{t("projectNo")}</td><td style={DP.mVal}>{r.projectNo||"—"}</td></tr>
      </tbody></table>

      {/* RÉCAP GLOBAL DES ANOMALIES D'INSPECTION (toutes grilles, trié par gravité) */}
      {!updatesOnly && r.anomRecap!==false && (()=>{
        const collected=[];
        (r.blocks||[]).forEach(b=>{ if(b.type==="inspect"){ (b.items||[]).forEach(it=>{ if(it.state==="anomaly"){ collected.push({ section:b.title||"", label:it.label||"", note:it.note||"", severity:it.severity||"minor" }); } }); } });
        if(collected.length===0) return null;
        const order={critical:0,major:1,minor:2};
        collected.sort((a,b)=>(order[a.severity]??3)-(order[b.severity]??3));
        const counts={critical:0,major:0,minor:0}; collected.forEach(c=>counts[c.severity]=(counts[c.severity]||0)+1);
        return (
          <div style={{marginTop:14, breakInside:"avoid"}}>
            <div className="secBar-print" style={{...DP.secBar,background:"#9d0208"}}>{t("anomRecapTitle")} ({collected.length})</div>
            <div style={{display:"flex",gap:14,fontSize:10,margin:"6px 2px 8px"}}>
              {SEVERITIES.slice().reverse().map(sv=> counts[sv.id]>0 && <span key={sv.id} style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:9,height:9,borderRadius:"50%",background:sv.color,display:"inline-block"}}></span>{sevLabel(sv.id)} : <b>{counts[sv.id]}</b></span>)}
            </div>
            <table style={DP.dataTable}><thead><tr>
              <th style={{...DP.thCell,width:"7%"}}>#</th>
              <th style={{...DP.thCell,width:"26%"}}>{t("anomLoc")}</th>
              <th style={{...DP.thCell,width:"22%"}}>{t("anomPoint")}</th>
              <th style={{...DP.thCell,width:"13%"}}>{t("anomSeverity")}</th>
              <th style={DP.thCell}>{t("anomDesc")}</th>
            </tr></thead><tbody>
              {collected.map((c,i)=>(<tr key={i}>
                <td style={{...DP.tdCell,textAlign:"center",fontWeight:700,color:"#9d0208"}}>{String(i+1).padStart(2,"0")}</td>
                <td style={DP.tdCell}>{c.section||"—"}</td>
                <td style={DP.tdCell}>{c.label||"—"}</td>
                <td style={{...DP.tdCell,color:sevColor(c.severity),fontWeight:700}}>{sevLabel(c.severity)}</td>
                <td style={DP.tdCell}>{c.note||"—"}</td>
              </tr>))}
            </tbody></table>
          </div>
        );
      })()}

      {/* RÉCAP ANOMALIES (en début de rapport, numéroté) */}
      {(()=>{ const anns=(r.annotations||[]); const anomalies=anns.filter(a=>a.kind==="anomaly"); const comments=anns.filter(a=>a.kind==="comment");
        return (<>
          {anomalies.length>0 && (
            <div style={{marginTop:14, breakInside:"avoid"}}>
              <div style={{...DP.secBar, background:"#9d0208"}}>{t("recapAnomalies")} ({anomalies.length})</div>
              {anomalies.map((a,i)=>(
                <div key={a.id} style={DP.annRow}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{...DP.annNum, background:sevColor(a.severity)}}>{i+1}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:11}}>{a.title||"—"} <span style={{...DP.sevTag,color:sevColor(a.severity),borderColor:sevColor(a.severity)}}>{sevLabel(a.severity)}</span></div>
                      {a.equipment && <div style={{fontSize:9,color:"#777"}}>{t("equipment")}: {a.equipment}</div>}
                      {a.desc && <div style={{fontSize:10,marginTop:2}}>{a.desc}</div>}
                    </div>
                    {a.photo && <img src={a.photo} alt="" style={{height:48,borderRadius:4,border:"1px solid #ddd"}}/>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {comments.length>0 && (
            <div style={{marginTop:12, breakInside:"avoid"}}>
              <div style={{...DP.secBar, background:"#34607a"}}>{t("recapComments")} ({comments.length})</div>
              {comments.map((a,i)=>(
                <div key={a.id} style={DP.annRow}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{...DP.annNum, background:"#34607a"}}>{i+1}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:11}}>{a.title||"—"}</div>
                      {a.equipment && <div style={{fontSize:9,color:"#777"}}>{t("equipment")}: {a.equipment}</div>}
                      {a.desc && <div style={{fontSize:10,marginTop:2}}>{a.desc}</div>}
                    </div>
                    {a.photo && <img src={a.photo} alt="" style={{height:48,borderRadius:4,border:"1px solid #ddd"}}/>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>);
      })()}

      {updatesOnly && (
        <div style={{background:"#fff7ed",border:"1.5px solid #e0a96d",color:"#9a3412",borderRadius:8,padding:"8px 14px",margin:"10px 0",fontFamily:"'Archivo'",fontWeight:800,fontSize:13}}>
          🔁 {LANG==="en"?"UPDATE / ADDENDUM":"MISE À JOUR / ADDENDA"} — {today}
        </div>
      )}
      {(()=>{ const firstSecIdx=printBlocks.findIndex(x=>x.type==="section"); return printBlocks.map((b,bi)=>{
        const isSection=b.type==="section";
        const isZone=b.type==="zone";
        // Saut de page avant cette section/zone : demande explicite (b.newPage) ou option globale.
        const pageBreak = (isSection && (b.newPage || (r.sectionPerPage && bi!==firstSecIdx))) || (isZone && b.newPage!==false && bi!==0);
        return (
        <div key={b.id} className={(isSection?"section-print ":"")+(pageBreak?"pagebreak-print":"")} style={{marginTop:isZone?0:12, breakInside:(b.type==="table"&&(b.rows||[]).length>6)?"auto":"avoid"}}>
          {b.type==="zone" && (
            <div style={{background:THEME.title,color:"#fff",borderRadius:6,padding:"10px 14px",margin:"4px 0 10px",fontFamily:"'Archivo'",fontWeight:900,fontSize:15,letterSpacing:.5,display:"flex",alignItems:"center",gap:8}}>
              <span style={{opacity:.85}}>▣</span>{b.title||""}
            </div>
          )}
          {b.type==="section" && <>
            <div className="secBar-print" style={{...DP.secBar,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <span>{b.title}</span>
              {r.qrShow!==false && qrMap&&qrMap[b.id] && <img src={qrMap[b.id].data} alt="QR" title={b.title||""} style={{height:34,width:34,background:"#fff",padding:2,borderRadius:3,flexShrink:0}}/>}
            </div>
            <table style={DP.fieldTable}><tbody>{(b.fields||[]).map(f=>(<tr key={f.id}><td style={DP.fLbl}>{f.label}</td><td style={DP.fVal}>{f.value||"—"}</td></tr>))}</tbody></table>
          </>}
          {b.type==="table" && (b.columns||[]).length>0 && <>
            <div className="secBar-print" style={DP.secBar}>{b.title}</div>
            <table style={DP.dataTable}><thead><tr>{b.columns.map((c,i)=>(<th key={i} style={DP.thCell}>{c}</th>))}</tr></thead>
            <tbody>{(b.rows||[]).map((row,ri)=>(<tr key={ri}>{b.columns.map((_,ci)=>(<td key={ci} style={DP.tdCell}>{row[ci]||""}</td>))}</tr>))}</tbody></table>
          </>}
          {b.type==="text" && <p style={DP.text}>{b.value}</p>}
          {b.type==="dga" && <>
            <div className="secBar-print" style={DP.secBar}>🧪 {LANG==="en"?"DGA analysis":"Analyse DGA"}{(b.summary||{}).equipment?` — ${b.summary.equipment}`:""}</div>
            <DgaSummaryView s={b.summary} print/>
          </>}
          {b.type==="inspect" && (b.items||[]).length>0 && (()=>{
            const items=b.items||[]; let n=0;
            const anomalies=items.filter(it=>it.state==="anomaly").map(it=>({...it,num:++n}));
            let m=0;
            return <>
              <div className="secBar-print" style={DP.secBar}>{b.title}</div>
              <table style={DP.inspGrid}><tbody>
                {Array.from({length:Math.ceil(items.length/2)},(_,ri)=>(
                  <tr key={ri}>
                    {[0,1].map(col=>{ const it=items[ri*2+col]; if(!it) return <React.Fragment key={col}><td style={DP.inspEmpty}></td><td style={DP.inspEmpty}></td></React.Fragment>;
                      const isA=it.state==="anomaly"; const num=isA?(++m):null;
                      return <React.Fragment key={col}>
                        <td style={DP.inspLbl}>{num!=null && <b style={{color:"#9d0208"}}>{String(num).padStart(2,"0")} </b>}{it.label||"—"}</td>
                        <td style={{...DP.inspVal,color:inspColor(it.state),fontWeight:isA?700:400}}>{inspLabel(it.state)}</td>
                      </React.Fragment>;
                    })}
                  </tr>
                ))}
              </tbody></table>
              {anomalies.length>0 && <table style={{...DP.fieldTable,marginTop:6}}><tbody>
                {anomalies.map(a=>(<tr key={a.id}>
                  <td style={{...DP.fLbl,width:"6%",color:"#9d0208",fontWeight:700,textAlign:"center"}}>{String(a.num).padStart(2,"0")}</td>
                  <td style={DP.fVal}>{a.note||"—"}</td>
                  {a.photo && <td style={{...DP.fVal,width:"22%",textAlign:"center"}}><img src={a.photo} alt="" style={{maxHeight:90,maxWidth:"100%",objectFit:"contain",borderRadius:3}}/></td>}
                </tr>))}
              </tbody></table>}
            </>;
          })()}
          {b.type==="photos" && (b.photos||[]).filter(p=>p.data).length>0 && (()=>{
            const filled=(b.photos||[]).filter(p=>p.data);
            const cols = b.layout==="1col"?1 : 2;
            return <>
              <div className="secBar-print" style={DP.secBar}>{b.title}</div>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
                {filled.map(p=>(<div key={p.id} style={{breakInside:"avoid"}}><img src={p.data} alt="" style={DP.photoPrint}/>{p.caption && <div style={DP.cap}>{p.caption}</div>}</div>))}
              </div>
            </>;
          })()}
          {b.type==="pdfpage" && (b.pages||[]).map((p,i)=>(
            <div key={i} className="pdf-page-print"><img src={p} alt="" style={DP.pdfPagePrint}/></div>
          ))}
        </div>
        ); }); })()}
        </div>
        </td></tr></tbody>
      </table>
    </div>
  );
}

// ============================================================
//  STYLES
// ============================================================
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;900&family=Spline+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;}
.cell-menu-btn{ opacity:0.55; transition:opacity .15s; }
.insert-line-btn:hover{ opacity:1 !important; border-color:#1e293b !important; color:#1e293b !important; }
.cell-host:hover .cell-menu-btn{ opacity:1; }
.cell-menu-btn:hover{ color:#9d0208 !important; opacity:1 !important; }
.print-only{display:none;}
@media screen{ .run-head,.run-foot{display:none;} .rpt-runtable thead,.rpt-runtable tfoot{display:none;} }
@media print{
  @page{ size:letter portrait; margin:12mm; @bottom-right{ content: counter(page); font-family:'Spline Sans',sans-serif; font-size:9px; color:#888; } }
  @page covpage{ @bottom-right{ content: ""; } }
  html,body{ background:#fff !important; margin:0 !important; padding:0 !important; }
  #root,.app-page{ background:#fff !important; padding:0 !important; min-height:0 !important; }
  body *{ visibility:hidden !important; }
  .screen-only{ display:none !important; }
  .print-only, .print-only *{ visibility:visible !important; }
  .print-only{ display:block !important; position:absolute !important; left:0; top:0; width:100%; }
  /* Export "à compléter à la main" : valeurs/contenu en pâle (référence) pour réécrire par-dessus. */
  .print-only.pale .rpt-content, .print-only.pale .cover-page-print, .print-only.pale .toc-page-print{ opacity:0.32 !important; }
  .letter-page-print{ page: covpage; page-break-after:always; break-after:page; }
  .cover-page-print{ page: covpage; page-break-after:always; break-after:page; }
  .toc-page-print{ page-break-after:always; break-after:page; }
  .rpt-content{ counter-reset: page 0; }
  /* Table porteuse : thead/tfoot se répètent sur chaque page ET réservent l'espace */
  .rpt-runtable{ width:100%; border-collapse:collapse; }
  .rpt-runtable thead{ display:table-header-group; }
  .rpt-runtable tfoot{ display:table-footer-group; }
  .rpt-runtable > tbody > tr > td, .rpt-runtable > thead > tr > td, .rpt-runtable > tfoot > tr > td{ padding:0; border:none; }
  .run-head{ display:flex !important; align-items:center; justify-content:space-between; padding:0 1mm 4px; margin-bottom:6px; height:13mm; border-bottom:1.5px solid #1e293b; background:#fff; }
  .run-foot{ display:flex !important; align-items:center; justify-content:space-between; padding:4px 1mm 0; margin-top:6px; height:8mm; font-size:8.5px; color:#888; border-top:1px solid #e2e8f0; background:#fff; }
  .pdf-page-print{ page-break-before:always; break-before:page; page-break-inside:avoid; }
  /* Un import PDF garde 1 page = 1 page : l'image tient dans la zone utile (≈ Lettre - marges - en-tête/pied). */
  .pdf-page-print img{ max-width:100% !important; max-height:225mm !important; object-fit:contain; display:block; margin:0 auto; }
  /* Saut de page avant une section (option « une page par section » ou saut manuel). */
  .pagebreak-print{ page-break-before:always !important; break-before:page !important; }
  /* Mode CONDENSÉ : espacements et tailles réduits pour densifier la page Lettre. */
  .print-only.cond .rpt-content{ font-size:9.5px !important; }
  .print-only.cond .rpt-content > div{ margin-top:7px !important; }
  .print-only.cond .secBar-print{ padding:2px 8px !important; font-size:10.5px !important; }
  .print-only.cond .rpt-content td{ padding:2px 6px !important; }
  .print-only.cond .run-head{ height:11mm !important; }
  .rpt-content table{ page-break-inside:auto; }
  .rpt-content tr{ page-break-inside:avoid; break-inside:avoid; }
  .rpt-content thead{ display:table-header-group; }
  .rpt-content .secBar-print{ break-after:avoid; page-break-after:avoid; }
  *{ -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
}`;

const S = {
  page:{ fontFamily:"'Spline Sans',sans-serif", background:"linear-gradient(160deg,#f1f5f9 0%,#f1f5f9 100%)", minHeight:"100vh", width:"100%", padding:"16px clamp(10px,2vw,28px)", color:"#0f172a" },
  header:{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16, marginBottom:22, borderBottom:"3px solid #0f172a", paddingBottom:16 },
  kicker:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:11, letterSpacing:3, color:"#1e293b" },
  h1:{ fontFamily:"'Archivo'", fontWeight:900, fontSize:"clamp(20px,5vw,30px)", margin:"2px 0", lineHeight:1 },
  h2:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:16, margin:"0 0 14px" },
  label:{ display:"block", fontSize:11, fontWeight:600, color:"#475569", marginBottom:4, fontFamily:"'Archivo'" },
  hint:{ fontSize:12, color:"#64748b", margin:"6px 0 0" },
  input:{ width:"100%", padding:"9px 11px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#ffffff", fontSize:14, fontFamily:"'Spline Sans'", color:"#0f172a" },
  card:{ background:"#ffffff", borderRadius:14, padding:18, marginBottom:14, boxShadow:"0 2px 10px rgba(80,60,30,.06)" },
  get btnPrimary(){ return { fontFamily:"'Archivo'", fontWeight:700, cursor:"pointer", border:"none", borderRadius:8, padding:"10px 18px", fontSize:13, background:THEME.accent, color:"#fff" }; },
  get btnDark(){ return { fontFamily:"'Archivo'", fontWeight:700, cursor:"pointer", border:"none", borderRadius:8, padding:"10px 18px", fontSize:13, background:THEME.secBar, color:"#fff" }; },
  btnGhost:{ fontFamily:"'Archivo'", fontWeight:700, cursor:"pointer", borderRadius:8, padding:"9px 16px", fontSize:13, background:"transparent", color:"#475569", border:"1.5px solid #cbd5e1" },
  langBtn:{ display:"flex", border:"1.5px solid #cbd5e1", borderRadius:8, overflow:"hidden", cursor:"pointer", background:"#fff" },
  langOpt:{ padding:"7px 10px", fontSize:12, fontFamily:"'Archivo'", fontWeight:700, color:"#64748b" },
  langOptOn:{ background:"#0f172a", color:"#fff" },
  gearBtn:{ fontSize:18, width:40, height:38, borderRadius:8, border:"1.5px solid #cbd5e1", background:"#fff", cursor:"pointer", color:"#475569", lineHeight:1 },
  overlay:{ position:"fixed", inset:0, background:"rgba(43,33,24,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"clamp(8px,2.5vw,20px)" },
  modal:{ background:"#ffffff", borderRadius:14, padding:"clamp(14px,3vw,24px)", maxWidth:440, width:"100%", boxShadow:"0 12px 48px rgba(0,0,0,.3)" },
  grid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))", gap:14 },
  cardTitle:{ fontFamily:"'Archivo'", fontWeight:900, fontSize:16, lineHeight:1.2 },
  cardMeta:{ fontSize:12, color:"#64748b", marginTop:4 },
  cardFoot:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, fontSize:11, color:"#64748b", flexWrap:"wrap", gap:8 },
  pill:{ color:"#fff", fontFamily:"'Archivo'", fontWeight:700, fontSize:10, padding:"3px 9px", borderRadius:20, whiteSpace:"nowrap" },
  miniBtn:{ fontSize:11, fontWeight:700, cursor:"pointer", border:"1.5px solid #cbd5e1", background:"#fff", color:"#475569", borderRadius:6, padding:"4px 8px" },
  miniBtnDel:{ fontSize:11, fontWeight:700, cursor:"pointer", border:"1.5px solid #e3a0a0", background:"#fff", color:"#9d0208", borderRadius:6, padding:"4px 8px" },
  filterRow:{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 },
  filterTab:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:12, padding:"6px 12px", borderRadius:20, border:"1.5px solid", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:6 },
  filterCount:{ fontSize:11, background:"rgba(0,0,0,.12)", borderRadius:10, padding:"1px 7px" },
  tplCard:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:14, padding:"22px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#ffffff", cursor:"pointer", color:"#0f172a" },
  tabRow:{ display:"flex", gap:4, marginBottom:18, borderBottom:"2px solid #e2e8f0" },
  tab:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:14, padding:"10px 20px", border:"none", background:"transparent", color:"#64748b", cursor:"pointer", borderBottom:"3px solid transparent", marginBottom:"-2px" },
  tabOn:{ color:"#9d0208", borderBottom:"3px solid #9d0208" },
  tplTag:{ display:"inline-block", background:"#f1f5f9", borderRadius:4, padding:"2px 6px", margin:"2px 3px 0 0", fontSize:10 },
  treeLayout:{ display:"flex", flexDirection:"column", gap:14, alignItems:"stretch" },
  treePanel:{ width:"100%", maxHeight:230, overflowY:"auto", background:"#ffffff", borderRadius:12, padding:14, boxShadow:"0 2px 10px rgba(80,60,30,.06)" },
  treeNode:{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", borderRadius:7, cursor:"pointer", fontSize:13, color:"#1e293b", marginTop:2 },
  treeNodeOn:{ background:"#eef2f5", color:"#1e293b", fontWeight:600 },
  treeCount:{ fontSize:10, background:"rgba(0,0,0,.08)", borderRadius:10, padding:"1px 7px", color:"#475569" },
  treeOrderChip:{ fontSize:11, fontFamily:"'Archivo'", fontWeight:700, padding:"4px 8px", borderRadius:6, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", cursor:"pointer" },
  breadcrumb:{ fontSize:13, color:"#475569", marginBottom:12, fontFamily:"'Archivo'", fontWeight:600 },
  compareHead:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:12, color:"#fff", background:"#475569", padding:"6px 10px", borderRadius:"6px 6px 0 0" },
  comparePane:{ flex:1, overflowY:"auto", border:"1px solid #e2e8f0", borderTop:"none", borderRadius:"0 0 6px 6px", padding:10, background:"#f8fafc", fontSize:12, minHeight:200 },
  comparePre:{ whiteSpace:"pre-wrap", fontFamily:"'Spline Sans'", fontSize:11, margin:0, color:"#1e293b" },
  cellMenu:{ position:"absolute", right:0, top:"100%", zIndex:60, background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:8, boxShadow:"0 6px 20px rgba(0,0,0,.18)", padding:4, minWidth:180, marginTop:2 },
  cellMenuItem:{ display:"block", width:"100%", textAlign:"left", border:"none", background:"transparent", padding:"7px 10px", fontSize:12, fontFamily:"'Spline Sans'", color:"#1e293b", cursor:"pointer", borderRadius:6, whiteSpace:"nowrap" },
  uncertainTag:{ fontSize:9, fontWeight:700, fontFamily:"'Archivo'", color:"#6b4e9d", background:"#f3eefb", border:"1px solid #b9a3dd", borderRadius:10, padding:"2px 7px", whiteSpace:"nowrap" },
  chip:{ fontFamily:"'Spline Sans'", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:20, border:"1.5px solid #e2e8f0", background:"#fff", color:"#577590", cursor:"pointer" },
  chipOn:{ background:"#1e293b", color:"#fff", borderColor:"#1e293b" },
  toolbar:{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:14, background:"#ffffff", borderRadius:12, padding:"12px 16px", boxShadow:"0 2px 10px rgba(80,60,30,.06)" },
  statusToggle:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:12, padding:"6px 14px", borderRadius:20, border:"1.5px solid #cbd5e1", background:"#fff", color:"#64748b", cursor:"pointer" },
  statusDraft:{ background:"#577590", color:"#fff", borderColor:"#577590" },
  statusFinal:{ background:"#2a9d8f", color:"#fff", borderColor:"#2a9d8f" },
  blockCard:{ background:"#ffffff", borderRadius:12, padding:14, marginBottom:12, border:"1px solid #e2e8f0" },
  blockToolbar:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  blockType:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:11, color:"#1e293b", letterSpacing:1, display:"flex", alignItems:"center", gap:6 },
  dragHandle:{ cursor:"grab", color:"#94a3b8", fontSize:14, letterSpacing:-2 },
  savedBadge:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:11, color:"#2a9d8f", background:"#e7f5f2", border:"1px solid #aeddd4", borderRadius:20, padding:"3px 10px", transition:"opacity .3s" },
  addBtn:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:13, padding:"10px 16px", borderRadius:8, border:"1.5px dashed #cbd5e1", background:"#ffffff", color:"#475569", cursor:"pointer" },
  addBar:{ position:"sticky", bottom:0, zIndex:50, display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", padding:"12px", margin:"0 -24px -28px", background:"linear-gradient(to top, #f1f5f9 70%, rgba(233,221,201,0))", borderTop:"1px solid #e2e8f0" },
  navFab:{ position:"fixed", right:18, bottom:78, zIndex:60, fontFamily:"'Archivo'", fontWeight:700, fontSize:13, cursor:"pointer", border:"none", borderRadius:24, padding:"10px 16px", background:"#1e293b", color:"#fff", boxShadow:"0 3px 12px rgba(0,0,0,.25)" },
  addFab:{ position:"fixed", left:18, bottom:78, zIndex:60, fontFamily:"'Archivo'", fontWeight:700, fontSize:24, cursor:"pointer", border:"none", borderRadius:"50%", width:52, height:52, background:"#9d0208", color:"#fff", boxShadow:"0 3px 14px rgba(0,0,0,.3)", lineHeight:1 },
  addPanel:{ position:"fixed", left:18, bottom:140, zIndex:60, width:240, maxWidth:"82vw", background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:14, boxShadow:"0 8px 30px rgba(0,0,0,.25)" },
  addPanelItem:{ display:"block", width:"100%", textAlign:"left", border:"1px solid #e0d5c2", background:"#faf6ee", cursor:"pointer", padding:"9px 11px", fontSize:13, color:"#1e293b", borderRadius:8, fontFamily:"'Archivo'", fontWeight:700 },
  navPanel:{ position:"fixed", right:18, bottom:120, zIndex:60, width:330, maxWidth:"88vw", background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:14, boxShadow:"0 8px 30px rgba(0,0,0,.25)" },
  navChip:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:10.5, cursor:"pointer", border:"1.5px solid #cbd5e1", borderRadius:14, padding:"3px 9px", background:"#fff", color:"#475569" },
  insertLine:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:11, cursor:"pointer", border:"1px dashed #c3b59c", borderRadius:14, padding:"3px 14px", background:"#fff", color:"#9a8c78", opacity:0.5, transition:"opacity .15s" },
  insertMenu:{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center", background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:"6px 8px", boxShadow:"0 4px 16px rgba(0,0,0,.15)" },
  insertChip:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:11.5, cursor:"pointer", border:"1px solid #cbd5e1", borderRadius:8, padding:"5px 10px", background:"#faf6ee", color:"#1e293b" },
  navItem:{ display:"block", width:"100%", textAlign:"left", border:"none", borderBottom:"1px solid #f1f5f9", background:"transparent", cursor:"pointer", padding:"8px 6px", fontSize:12.5, color:"#1e293b", fontFamily:"'Spline Sans'", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  blockMenu:{ position:"absolute", right:0, top:"110%", zIndex:40, background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, boxShadow:"0 6px 20px rgba(0,0,0,.22)", padding:5, minWidth:210 },
  blockMenuItem:{ display:"block", width:"100%", textAlign:"left", border:"none", background:"transparent", cursor:"pointer", padding:"9px 10px", fontSize:13, color:"#1e293b", borderRadius:6, fontFamily:"'Spline Sans'" },
  addBtnSm:{ fontFamily:"'Archivo'", fontWeight:700, fontSize:12, padding:"5px 12px", borderRadius:6, border:"1.5px dashed #cbd5e1", background:"#fff", color:"#475569", cursor:"pointer" },
  photoGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,140px),1fr))", gap:10 },
  photoThumb:{ borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0", background:"#f8fafc" },
  photoImg:{ width:"100%", height:110, objectFit:"cover", cursor:"pointer", display:"block" },
  photoDel:{ position:"relative", float:"right", marginTop:-104, marginRight:4, width:22, height:22, borderRadius:"50%", background:"rgba(157,2,8,.9)", color:"#fff", border:"2px solid #fff", cursor:"pointer", fontSize:13, lineHeight:1, padding:0 },
  photoCap:{ width:"100%", border:"none", borderTop:"1px solid #e2e8f0", padding:"6px 8px", fontSize:11, fontFamily:"'Spline Sans'", background:"#ffffff" },
};

const DP = {
  wrap:{ fontFamily:"'Spline Sans',sans-serif", color:"#1a1a1a" },
  titleRow:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:10, marginBottom:10, get borderBottom(){return "2px solid "+THEME.secBar;} },
  get kicker(){ return { fontFamily:"'Archivo'", fontWeight:700, fontSize:9, letterSpacing:2, color:THEME.secBar }; },
  get h1(){ return { fontFamily:"'Archivo'", fontWeight:900, fontSize:22, margin:"2px 0 0", color:THEME.title }; },
  metaTable:{ width:"100%", borderCollapse:"collapse", fontSize:10 },
  annRow:{ padding:"6px 4px", borderBottom:"0.5px solid #eee" },
  annNum:{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:18, height:18, borderRadius:"50%", color:"#fff", fontSize:10, fontWeight:700, flexShrink:0 },
  sevTag:{ fontSize:8, fontWeight:700, border:"1px solid", borderRadius:4, padding:"1px 5px", marginLeft:6 },
  mLbl:{ background:"#eef2f5", fontWeight:600, padding:"4px 6px", border:"0.5px solid #dde5ea", color:"#34495e", width:"14%" },
  mVal:{ padding:"4px 6px", border:"0.5px solid #dde5ea", width:"36%" },
  get secBar(){ return { background:THEME.secBar, color:"#fff", fontFamily:"'Archivo'", fontWeight:700, fontSize:11, padding:"4px 10px", borderRadius:3, marginBottom:6 }; },
  fieldTable:{ width:"100%", borderCollapse:"collapse", fontSize:10 },
  inspGrid:{ width:"100%", borderCollapse:"collapse", fontSize:9.5 },
  get inspLbl(){ return { width:"30%", padding:"3px 6px", border:"0.5px solid "+THEME.border, color:THEME.text }; },
  inspVal:{ width:"20%", padding:"3px 6px", border:"0.5px solid #e3eaef", textAlign:"center" },
  inspEmpty:{ border:"none" },
  fLbl:{ background:"#f4f7f9", fontWeight:600, padding:"3px 8px", border:"0.5px solid #e3eaef", width:"32%", color:"#34495e" },
  fVal:{ padding:"3px 8px", border:"0.5px solid #e3eaef" },
  dataTable:{ width:"100%", borderCollapse:"collapse", fontSize:9.5, marginTop:2 },
  get thCell(){ return { background:THEME.tableHd, color:"#fff", fontWeight:700, padding:"3px 6px", border:"0.5px solid rgba(0,0,0,.25)", textAlign:"left" }; },
  tdCell:{ padding:"3px 6px", border:"0.5px solid #e3eaef" },
  get text(){ return { fontSize:11, lineHeight:1.5, margin:"0 0 4px", whiteSpace:"pre-wrap", color:THEME.text }; },
  photoGridPrint:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  photoPrint:{ width:"100%", borderRadius:6, border:"1px solid #ddd", display:"block" },
  pdfPagePrint:{ width:"100%", display:"block", border:"1px solid #ddd" },
  coverPage:{ pageBreakAfter:"always", breakAfter:"page", minHeight:"86vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"0 20px" },
  tocPage:{ padding:"4mm 0" },
  get tocTitle(){ return { fontFamily:"'Archivo'", fontWeight:900, fontSize:20, color:THEME.title, borderBottom:"2px solid "+THEME.secBar, paddingBottom:8, marginBottom:14 }; },
  get tocHead(){ return { fontFamily:"'Archivo'", fontWeight:700, fontSize:12.5, color:THEME.title, padding:"6px 0 3px", borderBottom:"0.5px dotted "+THEME.border }; },
  tocSub:{ fontSize:11, color:"#475569", padding:"2px 0 2px 22px" },
  get coverKicker(){ return { fontFamily:"'Archivo'", fontWeight:700, fontSize:12, letterSpacing:3, color:THEME.secBar, marginBottom:6 }; },
  get coverTitle(){ return { fontFamily:"'Archivo'", fontWeight:900, fontSize:34, margin:"0 0 14px", lineHeight:1.1, maxWidth:600, color:THEME.title }; },
  coverSubtitle:{ fontSize:15, color:"#555", marginBottom:30, maxWidth:520, whiteSpace:"pre-wrap" },
  get coverMeta(){ return { fontSize:12, color:"#333", lineHeight:1.9, borderTop:"2px solid "+THEME.secBar, paddingTop:16, marginTop:10 }; },
  cap:{ fontSize:9, color:"#666", marginTop:2, textAlign:"center" },
};
