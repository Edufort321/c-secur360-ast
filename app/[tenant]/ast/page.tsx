'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, Hash, Globe
} from 'lucide-react';
import { AST } from '../types/ast'; // Import selon ta structure exacte

// Interface ASTForm compatible avec ton AST
interface ASTFormProps {
  formData: Partial<AST>;
  onDataChange: (section: string, data: any) => void;
  tenant: string;
  language?: 'fr' | 'en';
}

// Interface pour les steps
interface StepProps {
  formData: Partial<AST>;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
  onDataChange: (section: string, data: any) => void;
}

const translations = {
  fr: {
    title: "Analyse de Sécurité des Tâches",
    subtitle: "Évaluation complète des risques et mesures de contrôle",
    steps: {
      1: "Informations Projet",
      2: "Participants",
      3: "Identification Dangers", 
      4: "Mesures Contrôle",
      5: "Procédures Urgence",
      6: "Documentation"
    },
    navigation: {
      previous: "Précédent",
      next: "Suivant",
      save: "Sauvegarder",
      complete: "Terminer"
    },
    status: {
      draft: "Brouillon",
      in_progress: "En cours",
      under_review: "En révision", 
      approved: "Approuvé",
      rejected: "Rejeté"
    }
  },
  en: {
    title: "Job Safety Analysis",
    subtitle: "Complete risk assessment and control measures",
    steps: {
      1: "Project Information",
      2: "Participants", 
      3: "Hazard Identification",
      4: "Control Measures",
      5: "Emergency Procedures",
      6: "Documentation"
    },
    navigation: {
      previous: "Previous",
      next: "Next", 
      save: "Save",
      complete: "Complete"
    },
    status: {
      draft: "Draft",
      in_progress: "In Progress",
      under_review: "Under Review",
      approved: "Approved", 
      rejected: "Rejected"
    }
  }
};

// Configuration des steps avec couleurs
const stepsConfig = [
  { id: 1, color: '#3b82f6', icon: Building },
  { id: 2, color: '#10b981', icon: Users },
  { id: 3, color: '#f59e0b', icon: AlertTriangle },
  { id: 4, color: '#8b5cf6', icon: Shield },
  { id: 5, color: '#ef4444', icon: Phone },
  { id: 6, color: '#06b6d4', icon: FileText }
];

export default function ASTForm({ 
  formData, 
  onDataChange, 
  tenant, 
  language = 'fr' 
}: ASTFormProps) {
  const t = translations[language];
  
  // Hooks mobiles
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en'>(language);
  
  // État AST avec structure complète selon ton interface
  const [astData, setAstData] = useState<Partial<AST>>(() => ({
    ...formData,
    id: formData.id || '',
    tenant: formData.tenant || tenant,
    status: formData.status || 'draft',
    createdAt: formData.createdAt || new Date(),
    updatedAt: formData.updatedAt || new Date()
  }));

  // Refs pour éviter les boucles
  const isUpdatingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Hook responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync avec le parent de manière stable
  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(astData)) {
      setAstData(prev => ({
        ...prev,
        ...formData,
        updatedAt: new Date()
      }));
    }
  }, [formData]);

  // Handler ultra-stable pour éviter les boucles
  const stableDataChangeHandler = useCallback((section: string, data: any) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    // Clear timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setAstData(prev => {
      const newData = {
        ...prev,
        [section]: data,
        updatedAt: new Date()
      };
      
      // Sync différée avec le parent
      timeoutRef.current = setTimeout(() => {
        onDataChange(section, data);
        isUpdatingRef.current = false;
      }, 100);
      
      return newData;
    });
  }, [onDataChange]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleLanguageChange = useCallback((newLanguage: 'fr' | 'en') => {
    setCurrentLanguage(newLanguage);
  }, []);

  // Calcul du pourcentage de completion
  const getCompletionPercentage = useCallback(() => {
    let completed = 0;
    const total = 6;
    
    if (astData.projectInfo?.work
