'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, ArrowLeft, ArrowRight, Upload, Trash2 } from 'lucide-react';

// Types
interface Worker {
  name: string;
  departureTime: string;
}

interface IsolationCircuit {
  id: string;
  name: string;
  padlock: boolean;
  voltage: boolean;
  grounding: boolean;
}

interface Photo {
  id: string;
  name: string;
  data: string;
  type: string;
}

interface NearMissIncident {
  id: string;
  date: string;
  time: string;
  description: string;
  personnel: string;
  solution: string;
  photos: Photo[];
}

interface ASTFormData {
  datetime: string;
  language: string;
  client: string;
  projectNumber: string;
  workLocation: string;
  clientRep: string;
  emergencyNumber: string;
  astMdlNumber: string;
  astClientNumber: string;
  workDescription: string;
  teamDiscussion: string[];
  isolation: {
    point: string;
    circuits: IsolationCircuit[];
    groundingRemoval: string;
  };
  hazards: string[];
  customHazards: string[];
  controlMeasures: Record<string, string[]>;
  workers: Worker[];
  photos: Record<string, Photo[]>;
}

export default function ASTForm() {
  const [currentTab, setCurrentTab] = useState<'ast' | 'nearmiss'>('ast');
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [formData, setFormData] = useState<ASTFormData>({
    datetime: '',
    language: 'fr',
    client: '',
    projectNumber: '',
    workLocation: '',
    clientRep: '',
    emergencyNumber: '',
    astMdlNumber: '',
    astClientNumber: '',
    workDescription: '',
    teamDiscussion: [],
    isolation: {
      point: '',
      circuits: [],
      groundingRemoval: ''
    },
    hazards: [],
    customHazards: [],
    controlMeasures: {},
    workers: [],
    photos: {}
  });

  // Near Miss
  const [nearMissIncidents, setNearMissIncidents] = useState<NearMissIncident[]>([]);

  // UI State
  const [selectedHazards, setSelectedHazards] = useState<Set<string>>(new Set());
  const [hazardControls, setHazardControls] = useState<Record<string, string[]>>({});
  const [customHazardInput, setCustomHazardInput] = useState('');
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    photos: Photo[];
    currentIndex: number;
  }>({ isOpen: false, photos: [], currentIndex: 0 });

  // File inputs refs
  const hazardPhotoRefs = useRef<Record<string, HTMLInputElement>>({});
  const controlPhotoRefs = useRef<Record<string, HTMLInputElement>>({});
  // Traductions
  const translations = {
    fr: {
      subtitle: "Analyse Sécuritaire de Tâches",
      ast_tab: "📋 Formulaire AST",
      near_miss_tab: "⚠️ Passé proche",
      general_info: "📋 Informations Générales",
      client: "Client",
      client_placeholder: "Nom du client",
      project_number: "Numéro de projet",
      project_number_placeholder: "N° de projet",
      work_location: "Endroit des travaux",
      work_location_placeholder: "Lieu des travaux",
      client_rep: "Représentant du client",
      client_rep_placeholder: "Nom du représentant",
      emergency_number: "Numéro d'urgence",
      emergency_number_placeholder: "Numéro d'urgence",
      ast_mdl_number: "N° AST MDL",
      ast_mdl_number_placeholder: "Numéro AST MDL",
      ast_client_number: "N° AST du client",
      ast_client_number_placeholder: "Numéro AST client",
      work_description: "Description des travaux",
      work_description_placeholder: "ENTRETIEN ÉLECTRIQUE 2024",
      team_discussion: "💬 Information à discuter avec l'équipe",
      first_aid: "Trousse de premiers soins",
      spill_control: "Matériel de contrôle de déversement",
      evacuation: "Évacuation, point de rassemblement",
      fire_extinguisher: "Extincteur portatif",
      emergency_shower: "Douche d'urgence / Bain oculaire",
      first_aider: "Secouriste désigné / Infirmerie au site",
      emergency_plan: "Plan d'intervention d'urgence",
      ppe: "EPI",
      break_location: "Emplacement des pauses",
      electrical_isolation: "⚡ Isolation Électrique",
      isolation_point: "Point d'isolement",
      isolation_point_placeholder: "Point d'isolement",
      add_isolation_circuit: "+ Ajouter un circuit d'isolement",
      grounding_removal: "Retrait des mise à la terre",
      grounding_removal_placeholder: "Retrait mises à la terre",
      potential_hazards: "⚠️ Dangers Potentiels",
      add_custom_hazard: "➕ Ajouter un danger personnalisé",
      custom_hazard_placeholder: "Décrire le danger personnalisé...",
      add_hazard_btn: "Ajouter",
      workers: "👷 Nom des Travailleurs",
      add_worker: "+ Ajouter un travailleur",
      reset: "🗑️ Réinitialiser",
      share: "📤 Partager",
      hazard_controls: "🛠️ Moyens de contrôle pour ce danger",
      add_control_for_hazard: "+ Ajouter un moyen de contrôle",
      hazard_photos: "📸 Photos du danger",
      control_photos: "📸 Photos des moyens de contrôle",
      add_photo: "📷 Ajouter photo",
      select_control_measure: "-- Sélectionner un moyen de contrôle --",
      custom_entry: "📝 Saisie personnalisée...",
      custom_control_placeholder: "Saisir un moyen de contrôle personnalisé",
      circuit_name: "Nom du circuit",
      circuit_name_placeholder: "Ex: Disjoncteur principal 400A",
      padlocks_applied: "Cadenas appliqués",
      voltage_absence: "Absence de tension fait",
      grounding_installed: "Mise à la terre installée",
      worker_name: "Nom du travailleur",
      full_name_placeholder: "Nom complet",
      departure_time: "Heure de départ",
      near_miss_incidents: "⚠️ Passé proche ou accidents",
      add_near_miss: "+ Ajouter un événement",
      incident_description: "Description de l'événement",
      incident_description_placeholder: "Décrire l'événement, les circonstances, etc.",
      involved_personnel: "Personnel impliqué",
      involved_personnel_placeholder: "Noms des personnes impliquées",
      corrective_solution: "Solution pour corriger la situation",
      corrective_solution_placeholder: "Mesures prises ou à prendre pour éviter la récurrence",
      incident_photos: "📸 Photos de l'événement",
      incident_date: "Date de l'événement",
      incident_time: "Heure de l'événement",
      form_shared: "✅ Formulaire partagé avec succès!",
      form_reset: "Formulaire réinitialisé",
      confirm_reset: "Êtes-vous sûr de vouloir réinitialiser le formulaire ?",
      isolation_circuit: "Circuit d'isolement"
    },
    en: {
      subtitle: "Job Safety Analysis",
      ast_tab: "📋 JSA Form",
      near_miss_tab: "⚠️ Near miss",
      general_info: "📋 General Information",
      client: "Client",
      client_placeholder: "Client name",
      project_number: "Project number",
      project_number_placeholder: "Project #",
      work_location: "Work location",
      work_location_placeholder: "Work location",
      client_rep: "Client representative",
      client_rep_placeholder: "Representative name",
      emergency_number: "Emergency number",
      emergency_number_placeholder: "Emergency number",
      ast_mdl_number: "JSA MDL #",
      ast_mdl_number_placeholder: "JSA MDL number",
      ast_client_number: "Client JSA #",
      ast_client_number_placeholder: "Client JSA number",
      work_description: "Work description",
      work_description_placeholder: "ELECTRICAL MAINTENANCE 2024",
      team_discussion: "💬 Information to discuss with team",
      first_aid: "First aid kit",
      spill_control: "Spill control material",
      evacuation: "Evacuation, assembly point",
      fire_extinguisher: "Portable fire extinguisher",
      emergency_shower: "Emergency shower / Eye wash",
      first_aider: "Designated first aider / Site infirmary",
      emergency_plan: "Emergency response plan",
      ppe: "PPE",
      break_location: "Break location",
      electrical_isolation: "⚡ Electrical Isolation",
      isolation_point: "Isolation point",
      isolation_point_placeholder: "Isolation point",
      add_isolation_circuit: "+ Add isolation circuit",
      grounding_removal: "Grounding removal",
      grounding_removal_placeholder: "Grounding removal",
      potential_hazards: "⚠️ Potential Hazards",
      add_custom_hazard: "➕ Add custom hazard",
      custom_hazard_placeholder: "Describe the custom hazard...",
      add_hazard_btn: "Add",
      workers: "👷 Worker Names",
      add_worker: "+ Add worker",
      reset: "🗑️ Reset",
      share: "📤 Share",
      hazard_controls: "🛠️ Control measures for this hazard",
      add_control_for_hazard: "+ Add control measure",
      hazard_photos: "📸 Hazard photos",
      control_photos: "📸 Control measure photos",
      add_photo: "📷 Add photo",
      select_control_measure: "-- Select a control measure --",
      custom_entry: "📝 Custom entry...",
      custom_control_placeholder: "Enter a custom control measure",
      circuit_name: "Circuit name",
      circuit_name_placeholder: "Ex: Main breaker 400A",
      padlocks_applied: "Padlocks applied",
      voltage_absence: "Voltage absence verified",
      grounding_installed: "Grounding installed",
      worker_name: "Worker name",
      full_name_placeholder: "Full name",
      departure_time: "Departure time",
      near_miss_incidents: "⚠️ Near miss or accidents",
      add_near_miss: "+ Add incident",
      incident_description: "Incident description",
      incident_description_placeholder: "Describe the incident, circumstances, etc.",
      involved_personnel: "Involved personnel",
      involved_personnel_placeholder: "Names of involved persons",
      corrective_solution: "Solution to correct the situation",
      corrective_solution_placeholder: "Measures taken or to be taken to prevent recurrence",
      incident_photos: "📸 Incident photos",
      incident_date: "Incident date",
      incident_time: "Incident time",
      form_shared: "✅ Form shared successfully!",
      form_reset: "Form reset",
      confirm_reset: "Are you sure you want to reset the form?",
      isolation_circuit: "Isolation circuit"
    }
  };
  const hazardsData = {
    fr: [
      "Appareillage sous-tension",
      "Machines-outils rotatif",
      "Circuit sous charge capacitive",
      "Génératrice (réseau d'urgence)",
      "Circuit adjacents / auxiliaire",
      "Zone de travail superposé",
      "Travail isolé et seul",
      "Travaux de levage",
      "Risque de chutes",
      "Échelles/escabeaux (3 points d'appui)",
      "Réalimentation partiel durant travaux",
      "Produit chimiques",
      "Zone de travail partagée (co-activité)",
      "État des lieux",
      "Ergonomie",
      "Éclairage",
      "Ligne de tire",
      "Déversement",
      "Travaux en espace clos (remplir le formulaire)",
      "Travail à chaud",
      "Ligne électrique à proximité",
      "Climat (vent, pluie, brume, glace et neige)",
      "Contrainte thermique (chaud, froid)",
      "Co-activité avec engin motorisée (chariot élévateur, nacelle, camion lourd etc...)"
    ],
    en: [
      "Live electrical equipment",
      "Rotating machinery",
      "Capacitive charged circuit",
      "Generator (emergency network)",
      "Adjacent / auxiliary circuits",
      "Overlapping work zone",
      "Isolated and alone work",
      "Lifting operations",
      "Fall risk",
      "Ladders/stepladders (3-point contact)",
      "Partial re-energization during work",
      "Chemical products",
      "Shared work zone (co-activity)",
      "Site conditions",
      "Ergonomics",
      "Lighting",
      "Line of fire",
      "Spill",
      "Confined space work (fill the form)",
      "Hot work",
      "Nearby power line",
      "Weather (wind, rain, fog, ice and snow)",
      "Thermal stress (hot, cold)",
      "Co-activity with motorized equipment"
    ]
  };

  const controlMeasuresData = {
    fr: [
      "Consignation électrique (LOTO)",
      "Vérification d'absence de tension",
      "Mise à la terre et en court-circuit",
      "Balisage et signalisation de la zone",
      "Port des EPI obligatoires (casque, gants, chaussures)",
      "Surveillance continue par personne qualifiée",
      "Formation et briefing sécurité",
      "Inspection des outils avant usage",
      "Maintien des distances de sécurité",
      "Utilisation d'outils isolés",
      "Détecteur de gaz si nécessaire",
      "Ventilation forcée en espace confiné",
      "Système de communication d'urgence",
      "Échafaudage certifié et inspecté",
      "Harnais de sécurité et point d'ancrage",
      "Éclairage d'appoint suffisant",
      "Protection contre les intempéries",
      "Isolation thermique si nécessaire",
      "Procédure de travail à chaud",
      "Extincteur à proximité",
      "Trousse de premiers soins accessible",
      "Évacuation d'urgence planifiée",
      "Test d'atmosphère avant entrée",
      "Double vérification des consignations",
      "Supervision par chef d'équipe",
      "Rotation des équipes si fatigue",
      "Pause régulière en cas de chaleur",
      "Protection auditive si bruit",
      "Masque respiratoire si poussière",
      "Gants adaptés au type de travail",
      "Chaussures antidérapantes",
      "Gilet haute visibilité",
      "Protection oculaire",
      "Casque avec jugulaire",
      "Vêtements de protection ignifuges"
    ],
    en: [
      "Electrical lockout/tagout (LOTO)",
      "Voltage absence verification",
      "Grounding and short-circuiting",
      "Zone marking and signalization",
      "Mandatory PPE (helmet, gloves, shoes)",
      "Continuous monitoring by qualified person",
      "Safety training and briefing",
      "Tool inspection before use",
      "Maintaining safety distances",
      "Use of insulated tools",
      "Gas detector if necessary",
      "Forced ventilation in confined space",
      "Emergency communication system",
      "Certified and inspected scaffolding",
      "Safety harness and anchor point",
      "Sufficient auxiliary lighting",
      "Weather protection",
      "Thermal insulation if necessary",
      "Hot work procedure",
      "Fire extinguisher nearby",
      "Accessible first aid kit",
      "Planned emergency evacuation",
      "Atmosphere testing before entry",
      "Double verification of lockouts",
      "Supervision by team leader",
      "Team rotation if fatigue",
      "Regular breaks in case of heat",
      "Hearing protection if noise",
      "Respiratory mask if dust",
      "Gloves adapted to work type",
      "Non-slip shoes",
      "High visibility vest",
      "Eye protection",
      "Helmet with chin strap",
      "Fire-resistant protective clothing"
    ]
  };

  const teamDiscussionItems = {
    fr: [
      "Trousse de premiers soins",
      "Matériel de contrôle de déversement",
      "Évacuation, point de rassemblement",
      "Extincteur portatif",
      "Douche d'urgence / Bain oculaire",
      "Secouriste désigné / Infirmerie au site",
      "Plan d'intervention d'urgence",
      "EPI",
      "Emplacement des pauses"
    ],
    en: [
      "First aid kit",
      "Spill control material",
      "Evacuation, assembly point",
      "Portable fire extinguisher",
      "Emergency shower / Eye wash",
      "Designated first aider / Site infirmary",
      "Emergency response plan",
      "PPE",
      "Break location"
    ]
  };

  const getText = (key: string) => {
    return translations[currentLanguage as keyof typeof translations]?.[key as keyof typeof translations.fr] || key;
  };
  const updateDateTime = () => {
    const now = new Date();
    const formatted = now.toLocaleString(currentLanguage === 'en' ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setFormData(prev => ({ ...prev, datetime: `📅 ${formatted}` }));
  };

  const saveFormData = () => {
    try {
      const dataToSave = {
        formData,
        selectedHazards: Array.from(selectedHazards),
        hazardControls,
        nearMissIncidents,
        currentLanguage
      };
      localStorage.setItem('ast_mdl_draft', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const loadFormData = () => {
    try {
      const saved = localStorage.getItem('ast_mdl_draft');
      if (saved) {
        const data = JSON.parse(saved);
        setFormData(data.formData || formData);
        setSelectedHazards(new Set(data.selectedHazards || []));
        setHazardControls(data.hazardControls || {});
        setNearMissIncidents(data.nearMissIncidents || []);
        setCurrentLanguage(data.currentLanguage || 'fr');
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  useEffect(() => {
    updateDateTime();
    loadFormData();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveFormData();
  }, [formData, selectedHazards, hazardControls, nearMissIncidents, currentLanguage]);

  const toggleHazard = (hazardId: string) => {
    setSelectedHazards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hazardId)) {
        newSet.delete(hazardId);
        setHazardControls(prevControls => {
          const newControls = { ...prevControls };
          delete newControls[hazardId];
          return newControls;
        });
      } else {
        newSet.add(hazardId);
      }
      return newSet;
    });
  };

  const toggleTeamDiscussion = (item: string) => {
    setFormData(prev => ({
      ...prev,
      teamDiscussion: prev.teamDiscussion.includes(item)
        ? prev.teamDiscussion.filter(i => i !== item)
        : [...prev.teamDiscussion, item]
    }));
  };

  const addControlMeasure = (hazardId: string, measure: string) => {
    setHazardControls(prev => ({
      ...prev,
      [hazardId]: [...(prev[hazardId] || []), measure]
    }));
  };

  const removeControlMeasure = (hazardId: string, index: number) => {
    setHazardControls(prev => ({
      ...prev,
      [hazardId]: prev[hazardId].filter((_, i) => i !== index)
    }));
  };

  const addCustomHazard = () => {
    if (customHazardInput.trim()) {
      const hazardId = `custom_${Date.now()}`;
      setFormData(prev => ({
        ...prev,
        customHazards: [...prev.customHazards, customHazardInput.trim()]
      }));
      setSelectedHazards(prev => new Set([...prev, hazardId]));
      setCustomHazardInput('');
    }
  };

  const addWorker = () => {
    setFormData(prev => ({
      ...prev,
      workers: [...prev.workers, { name: '', departureTime: '' }]
    }));
  };

  const updateWorker = (index: number, field: keyof Worker, value: string) => {
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.map((worker, i) => 
        i === index ? { ...worker, [field]: value } : worker
      )
    }));
  };

  const removeWorker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.filter((_, i) => i !== index)
    }));
  };

  const addIsolationCircuit = () => {
    const newCircuit: IsolationCircuit = {
      id: `circuit_${Date.now()}`,
      name: '',
      padlock: false,
      voltage: false,
      grounding: false
    };
    setFormData(prev => ({
      ...prev,
      isolation: {
        ...prev.isolation,
        circuits: [...prev.isolation.circuits, newCircuit]
      }
    }));
  };

  const updateIsolationCircuit = (id: string, field: keyof IsolationCircuit, value: any) => {
    setFormData(prev => ({
      ...prev,
      isolation: {
        ...prev.isolation,
        circuits: prev.isolation.circuits.map(circuit => 
          circuit.id === id ? { ...circuit, [field]: value } : circuit
        )
      }
    }));
  };

  const removeIsolationCircuit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      isolation: {
        ...prev.isolation,
        circuits: prev.isolation.circuits.filter(circuit => circuit.id !== id)
      }
    }));
  };

  const handlePhotoUpload = (files: FileList | null, category: string, hazardId?: string) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo: Photo = {
          id: `photo_${Date.now()}_${Math.random()}`,
          name: file.name,
          data: e.target?.result as string,
          type: file.type
        };

        const photoKey = hazardId ? `${category}_${hazardId}` : category;
        setFormData(prev => ({
          ...prev,
          photos: {
            ...prev.photos,
            [photoKey]: [...(prev.photos[photoKey] || []), photo]
          }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (category: string, photoId: string, hazardId?: string) => {
    const photoKey = hazardId ? `${category}_${hazardId}` : category;
    setFormData(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [photoKey]: prev.photos[photoKey]?.filter(photo => photo.id !== photoId) || []
      }
    }));
  };

  const openPhotoModal = (photos: Photo[], index: number) => {
    setPhotoModal({
      isOpen: true,
      photos,
      currentIndex: index
    });
  };

  const closePhotoModal = () => {
    setPhotoModal({
      isOpen: false,
      photos: [],
      currentIndex: 0
    });
  };

  const navigatePhoto = (direction: number) => {
    setPhotoModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + direction + prev.photos.length) % prev.photos.length
    }));
  };

  const addNearMissIncident = () => {
    const newIncident: NearMissIncident = {
      id: `incident_${Date.now()}`,
      date: '',
      time: '',
      description: '',
      personnel: '',
      solution: '',
      photos: []
    };
    setNearMissIncidents(prev => [...prev, newIncident]);
  };

  const updateNearMissIncident = (id: string, field: keyof NearMissIncident, value: any) => {
    setNearMissIncidents(prev => prev.map(incident => 
      incident.id === id ? { ...incident, [field]: value } : incident
    ));
  };

  const removeNearMissIncident = (id: string) => {
    setNearMissIncidents(prev => prev.filter(incident => incident.id !== id));
  };
  const resetForm = () => {
    if (confirm(getText('confirm_reset'))) {
      setFormData({
        datetime: '',
        language: 'fr',
        client: '',
        projectNumber: '',
        workLocation: '',
        clientRep: '',
        emergencyNumber: '',
        astMdlNumber: '',
        astClientNumber: '',
        workDescription: '',
        teamDiscussion: [],
        isolation: {
          point: '',
          circuits: [],
          groundingRemoval: ''
        },
        hazards: [],
        customHazards: [],
        controlMeasures: {},
        workers: [],
        photos: {}
      });
      setSelectedHazards(new Set());
      setHazardControls({});
      setNearMissIncidents([]);
      setCustomHazardInput('');
      localStorage.removeItem('ast_mdl_draft');
      alert(getText('form_reset'));
    }
  };

  const shareForm = async () => {
    try {
      const formText = generateShareText();
      
      if (navigator.share) {
        await navigator.share({
          title: 'AST MDL - Analyse Sécuritaire de Tâches',
          text: formText
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(formText);
        alert(getText('form_shared'));
      } else {
        const blob = new Blob([formText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AST_MDL_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        alert(getText('form_shared'));
      }
    } catch (error) {
      console.error('Error sharing form:', error);
      alert('Erreur lors du partage');
    }
  };

  const generateShareText = () => {
    let text = `🛡️ ANALYSE SÉCURITAIRE DE TÂCHES - MDL\n`;
    text += `${formData.datetime}\n\n`;
    
    text += `📋 INFORMATIONS GÉNÉRALES\n`;
    text += `Client: ${formData.client}\n`;
    text += `Projet: ${formData.projectNumber}\n`;
    text += `Lieu: ${formData.workLocation}\n`;
    text += `Représentant: ${formData.clientRep}\n`;
    text += `Urgence: ${formData.emergencyNumber}\n`;
    text += `AST MDL: ${formData.astMdlNumber}\n`;
    text += `AST Client: ${formData.astClientNumber}\n`;
    text += `Description: ${formData.workDescription}\n\n`;

    if (formData.teamDiscussion.length > 0) {
      text += `💬 INFORMATION À DISCUTER AVEC L'ÉQUIPE\n`;
      formData.teamDiscussion.forEach(item => text += `✓ ${item}\n`);
      text += `\n`;
    }

    if (formData.isolation.point || formData.isolation.circuits.length > 0) {
      text += `⚡ ISOLATION ÉLECTRIQUE\n`;
      text += `Point: ${formData.isolation.point}\n`;
      formData.isolation.circuits.forEach((circuit, index) => {
        text += `Circuit ${index + 1}: ${circuit.name}\n`;
        text += `  Cadenas: ${circuit.padlock ? '✓' : '✗'}\n`;
        text += `  Tension: ${circuit.voltage ? '✓' : '✗'}\n`;
        text += `  Terre: ${circuit.grounding ? '✓' : '✗'}\n`;
      });
      text += `Retrait terre: ${formData.isolation.groundingRemoval}\n\n`;
    }

    if (selectedHazards.size > 0) {
      text += `⚠️ DANGERS IDENTIFIÉS\n`;
      selectedHazards.forEach(hazardId => {
        if (hazardId.startsWith('hazard_')) {
          const index = parseInt(hazardId.split('_')[1]);
          const hazard = hazardsData[currentLanguage as keyof typeof hazardsData]?.[index];
          if (hazard) {
            text += `• ${index + 1} - ${hazard}\n`;
            if (hazardControls[hazardId]) {
              hazardControls[hazardId].forEach(control => {
                text += `  → ${control}\n`;
              });
            }
          }
        } else if (hazardId.startsWith('custom_')) {
          const customHazard = formData.customHazards.find(h => h.length > 0);
          if (customHazard) {
            text += `• ⚠️ ${customHazard}\n`;
            if (hazardControls[hazardId]) {
              hazardControls[hazardId].forEach(control => {
                text += `  → ${control}\n`;
              });
            }
          }
        }
      });
      text += `\n`;
    }

    if (formData.workers.length > 0) {
      text += `👷 TRAVAILLEURS\n`;
      formData.workers.forEach(worker => {
        text += `• ${worker.name}`;
        if (worker.departureTime) text += ` (Départ: ${worker.departureTime})`;
        text += `\n`;
      });
      text += `\n`;
    }

    if (nearMissIncidents.length > 0) {
      text += `⚠️ PASSÉ PROCHE / ACCIDENTS\n`;
      nearMissIncidents.forEach((incident, index) => {
        text += `=== Incident ${index + 1} ===\n`;
        text += `Date: ${incident.date}\n`;
        text += `Heure: ${incident.time}\n`;
        text += `Description: ${incident.description}\n`;
        text += `Personnel: ${incident.personnel}\n`;
        text += `Solution: ${incident.solution}\n\n`;
      });
    }

    text += `🛡️ Généré par AST MDL App`;
    return text;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-2">
      <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-blue-600 text-white p-5 text-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setCurrentLanguage('fr')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentLanguage === 'fr' ? 'bg-white/90 text-slate-700' : 'bg-white/20'
              }`}
            >
              🇫🇷 FR
            </button>
            <button 
              onClick={() => setCurrentLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentLanguage === 'en' ? 'bg-white/90 text-slate-700' : 'bg-white/20'
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
          <div className="text-2xl font-bold mb-1">🛡️ AST MDL</div>
          <div className="text-sm opacity-90">{getText('subtitle')}</div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gradient-to-r from-slate-700 to-blue-600 border-b border-white/20">
          <button
            onClick={() => setCurrentTab('ast')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all border-b-3 ${
              currentTab === 'ast' 
                ? 'text-white border-orange-400 bg-white/10' 
                : 'text-white/70 border-transparent hover:bg-white/10'
            }`}
          >
            {getText('ast_tab')}
          </button>
          <button
            onClick={() => setCurrentTab('nearmiss')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all border-b-3 ${
              currentTab === 'nearmiss' 
                ? 'text-white border-orange-400 bg-white/10' 
                : 'text-white/70 border-transparent hover:bg-white/10'
            }`}
          >
            {getText('near_miss_tab')}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {currentTab === 'ast' ? (
            <div className="space-y-6">
              {/* DateTime Display */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl text-center font-bold text-green-700 border-2 border-green-200">
                {formData.datetime}
              </div>

              {/* General Information */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('general_info')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('client')}
                    </label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('client_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('project_number')}
                    </label>
                    <input
                      type="text"
                      value={formData.projectNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectNumber: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('project_number_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('work_location')}
                    </label>
                    <input
                      type="text"
                      value={formData.workLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, workLocation: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('work_location_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('client_rep')}
                    </label>
                    <input
                      type="text"
                      value={formData.clientRep}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientRep: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('client_rep_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('emergency_number')}
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyNumber: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('emergency_number_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('ast_mdl_number')}
                    </label>
                    <input
                      type="text"
                      value={formData.astMdlNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, astMdlNumber: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('ast_mdl_number_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('ast_client_number')}
                    </label>
                    <input
                      type="text"
                      value={formData.astClientNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, astClientNumber: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('ast_client_number_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('work_description')}
                    </label>
                    <textarea
                      value={formData.workDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, workDescription: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('work_description_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Team Discussion */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('team_discussion')}</h3>
                <div className="space-y-2">
                  {teamDiscussionItems[currentLanguage as keyof typeof teamDiscussionItems].map((item, index) => (
                    <div
                      key={index}
                      onClick={() => toggleTeamDiscussion(item)}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.teamDiscussion.includes(item)
                          ? 'bg-purple-50 border-purple-300 shadow-md' 
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center ${
                        formData.teamDiscussion.includes(item)
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-gray-300'
                      }`}>
                        {formData.teamDiscussion.includes(item) && (
                          <span className="text-white font-bold text-sm">✓</span>
                        )}
                      </div>
                      <label className="flex-1 cursor-pointer text-sm font-medium">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Electrical Isolation */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-yellow-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('electrical_isolation')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('isolation_point')}
                    </label>
                    <input
                      type="text"
                      value={formData.isolation.point}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        isolation: { ...prev.isolation, point: e.target.value }
                      }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors"
                      placeholder={getText('isolation_point_placeholder')}
                    />
                  </div>

                  {/* Isolation Circuits */}
                  {formData.isolation.circuits.map((circuit, index) => (
                    <div key={circuit.id} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-slate-700">
                          {getText('isolation_circuit')} {index + 1}
                        </h4>
                        <button
                          onClick={() => removeIsolationCircuit(circuit.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            {getText('circuit_name')}
                          </label>
                          <input
                            type="text"
                            value={circuit.name}
                            onChange={(e) => updateIsolationCircuit(circuit.id, 'name', e.target.value)}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                            placeholder={getText('circuit_name_placeholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <div
                            onClick={() => updateIsolationCircuit(circuit.id, 'padlock', !circuit.padlock)}
                            className={`flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                              circuit.padlock 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 mr-2 flex items-center justify-center ${
                              circuit.padlock ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                              {circuit.padlock && <span className="text-white font-bold text-xs">✓</span>}
                            </div>
                            <span className="text-sm font-medium">{getText('padlocks_applied')}</span>
                          </div>
                          <div
                            onClick={() => updateIsolationCircuit(circuit.id, 'voltage', !circuit.voltage)}
                            className={`flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                              circuit.voltage 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 mr-2 flex items-center justify-center ${
                              circuit.voltage ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                              {circuit.voltage && <span className="text-white font-bold text-xs">✓</span>}
                            </div>
                            <span className="text-sm font-medium">{getText('voltage_absence')}</span>
                          </div>
                          <div
                            onClick={() => updateIsolationCircuit(circuit.id, 'grounding', !circuit.grounding)}
                            className={`flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                              circuit.grounding 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 mr-2 flex items-center justify-center ${
                              circuit.grounding ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                              {circuit.grounding && <span className="text-white font-bold text-xs">✓</span>}
                            </div>
                            <span className="text-sm font-medium">{getText('grounding_installed')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addIsolationCircuit}
                    className="w-full p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105"
                  >
                    {getText('add_isolation_circuit')}
                  </button>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('grounding_removal')}
                    </label>
                    <input
                      type="text"
                      value={formData.isolation.groundingRemoval}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        isolation: { ...prev.isolation, groundingRemoval: e.target.value }
                      }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors"
                      placeholder={getText('grounding_removal_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Hazards */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-red-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('potential_hazards')}</h3>
                <div className="space-y-2">
                  {hazardsData[currentLanguage as keyof typeof hazardsData]?.map((hazard, index) => {
                    const hazardId = `hazard_${index}`;
                    const isSelected = selectedHazards.has(hazardId);
                    
                    return (
                      <div key={hazardId} className="space-y-2">
                        <div
                          onClick={() => toggleHazard(hazardId)}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-red-50 border-red-300 shadow-md' 
                              : 'bg-white border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-red-500 border-red-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="text-white font-bold text-sm">✗</span>}
                          </div>
                          <label className="flex-1 cursor-pointer text-sm font-medium">
                            {index + 1} - {hazard}
                          </label>
                        </div>
                        
                        {isSelected && (
                          <div className="ml-9 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 animate-slideDown">
                            <h4 className="font-bold text-orange-600 mb-3 text-sm">
                              {getText('hazard_controls')}
                            </h4>
                            <div className="space-y-2">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addControlMeasure(hazardId, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full p-2 border-2 border-gray-200 rounded-lg text-sm"
                              >
                                <option value="">{getText('select_control_measure')}</option>
                                {controlMeasuresData[currentLanguage as keyof typeof controlMeasuresData]?.map((measure, i) => (
                                  <option key={i} value={measure}>{measure}</option>
                                ))}
                              </select>
                              
                              {hazardControls[hazardId] && (
                                <div className="space-y-1">
                                  {hazardControls[hazardId].map((control, i) => (
                                    <div key={i} className="flex items-center justify-between bg-green-100 p-2 rounded text-sm">
                                      <span className="text-green-800">{control}</span>
                                      <button
                                        onClick={() => removeControlMeasure(hazardId, i)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Photos pour ce danger */}
                            <div className="mt-4 space-y-3">
                              <div>
                                <h5 className="font-semibold text-sm text-slate-700 mb-2">{getText('hazard_photos')}</h5>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handlePhotoUpload(e.target.files, 'hazard', hazardId)}
                                  className="hidden"
                                  ref={el => {
                                    if (el) hazardPhotoRefs.current[hazardId] = el;
                                  }}
                                />
                                <button
                                  onClick={() => hazardPhotoRefs.current[hazardId]?.click()}
                                  className="w-full p-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                  {getText('add_photo')}
                                </button>
                                {formData.photos[`hazard_${hazardId}`] && (
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {formData.photos[`hazard_${hazardId}`].map((photo, photoIndex) => (
                                      <div key={photo.id} className="relative">
                                        <img
                                          src={photo.data}
                                          alt={photo.name}
                                          className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                          onClick={() => openPhotoModal(formData.photos[`hazard_${hazardId}`], photoIndex)}
                                        />
                                        <button
                                          onClick={() => removePhoto('hazard', photo.id, hazardId)}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm text-slate-700 mb-2">{getText('control_photos')}</h5>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handlePhotoUpload(e.target.files, 'control', hazardId)}
                                  className="hidden"
                                  ref={el => {
                                    if (el) controlPhotoRefs.current[hazardId] = el;
                                  }}
                                />
                                <button
                                  onClick={() => controlPhotoRefs.current[hazardId]?.click()}
                                  className="w-full p-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                >
                                  {getText('add_photo')}
                                </button>
                                {formData.photos[`control_${hazardId}`] && (
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {formData.photos[`control_${hazardId}`].map((photo, photoIndex) => (
                                      <div key={photo.id} className="relative">
                                        <img
                                          src={photo.data}
                                          alt={photo.name}
                                          className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                          onClick={() => openPhotoModal(formData.photos[`control_${hazardId}`], photoIndex)}
                                        />
                                        <button
                                          onClick={() => removePhoto('control', photo.id, hazardId)}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Hazards */}
                <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-green-700 mb-3 text-sm">{getText('add_custom_hazard')}</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customHazardInput}
                      onChange={(e) => setCustomHazardInput(e.target.value)}
                      className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder={getText('custom_hazard_placeholder')}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomHazard()}
                    />
                    <button
                      onClick={addCustomHazard}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {getText('add_hazard_btn')}
                    </button>
                  </div>
                </div>
              </div>
              {/* Workers */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-green-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('workers')}</h3>
                <div className="space-y-3">
                  {formData.workers.map((worker, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-700">
                          {getText('worker_name')} {index + 1}
                        </h4>
                        <button
                          onClick={() => removeWorker(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            {getText('worker_name')}
                          </label>
                          <input
                            type="text"
                            value={worker.name}
                            onChange={(e) => updateWorker(index, 'name', e.target.value)}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                            placeholder={getText('full_name_placeholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            {getText('departure_time')}
                          </label>
                          <input
                            type="time"
                            value={worker.departureTime}
                            onChange={(e) => updateWorker(index, 'departureTime', e.target.value)}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addWorker}
                    className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                  >
                    {getText('add_worker')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Near Miss Tab
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-yellow-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('near_miss_incidents')}</h3>
                
                <button
                  onClick={addNearMissIncident}
                  className="w-full p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 mb-4"
                >
                  {getText('add_near_miss')}
                </button>

                <div className="space-y-4">
                  {nearMissIncidents.map((incident, index) => (
                    <div key={incident.id} className="bg-white p-4 rounded-lg border-2 border-yellow-300">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-slate-700">
                          {getText('near_miss_incidents')} {index + 1}
                        </h4>
                        <button
                          onClick={() => removeNearMissIncident(incident.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              {getText('incident_date')}
                            </label>
                            <input
                              type="date"
                              value={incident.date}
                              onChange={(e) => updateNearMissIncident(incident.id, 'date', e.target.value)}
                              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                              {getText('incident_time')}
                            </label>
                            <input
                              type="time"
                              value={incident.time}
                              onChange={(e) => updateNearMissIncident(incident.id, 'time', e.target.value)}
                              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            {getText('incident_description')}
                          </label>
                          <textarea
                            value={incident.description}
                            onChange={(e) => updateNearMissIncident(incident.id, 'description', e.target.value)}
                            rows={3}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                            placeholder={getText('incident_description_placeholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            {getText('involved_personnel')}
                          </label>
                          <input
                            type="text"
                            value={incident.personnel}
                            onChange={(e) => updateNearMissIncident(incident.id, 'personnel', e.target.value)}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                            placeholder={getText('involved_personnel_placeholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            {getText('corrective_solution')}
                          </label>
                          <textarea
                            value={incident.solution}
                            onChange={(e) => updateNearMissIncident(incident.id, 'solution', e.target.value)}
                            rows={3}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                            placeholder={getText('corrective_solution_placeholder')}
                          />
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm text-slate-700 mb-2">{getText('incident_photos')}</h5>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePhotoUpload(e.target.files, 'incident', incident.id)}
                            className="hidden"
                            id={`incidentPhoto_${incident.id}`}
                          />
                          <button
                            onClick={() => document.getElementById(`incidentPhoto_${incident.id}`)?.click()}
                            className="w-full p-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                          >
                            {getText('add_photo')}
                          </button>
                          {formData.photos[`incident_${incident.id}`] && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {formData.photos[`incident_${incident.id}`].map((photo, photoIndex) => (
                                <div key={photo.id} className="relative">
                                  <img
                                    src={photo.data}
                                    alt={photo.name}
                                    className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                    onClick={() => openPhotoModal(formData.photos[`incident_${incident.id}`], photoIndex)}
                                  />
                                  <button
                                    onClick={() => removePhoto('incident', photo.id, incident.id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4">
          <button 
            onClick={resetForm}
            className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105"
          >
            {getText('reset')}
          </button>
          <button 
            onClick={shareForm}
            className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            {getText('share')}
          </button>
        </div>
      </div>

      {/* Photo Modal */}
      {photoModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={closePhotoModal}>
          <div className="relative max-w-4xl max-h-4xl p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={photoModal.photos[photoModal.currentIndex]?.data}
              alt={photoModal.photos[photoModal.currentIndex]?.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={closePhotoModal}
              className="absolute top-2 right-2 bg-white/90 text-black rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            {photoModal.photos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto(-1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-black rounded-full w-8 h-8 flex items-center justify-center"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => navigatePhoto(1)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-black rounded-full w-8 h-8 flex items-center justify-center"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
