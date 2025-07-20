// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USESIGNATURE.TS ===================
// Hook React pour signatures électroniques légales avec timestamp et audit trail complet
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CustomGeolocationPosition } from './useGeolocation';

// =================== INTERFACES SIGNATURES ===================

export interface ElectronicSignature {
  id: string;
  permitId: string;
  signerId: string;
  signerName: string;
  signerRole: SignerRole;
  signatureType: SignatureType;
  signatureData: SignatureData;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  deviceInfo: DeviceInfo;
  location?: CustomGeolocationPosition;
  biometricData?: BiometricData;
  legalConsent: LegalConsent;
  verificationMethod: VerificationMethod;
  isValid: boolean;
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
  auditTrail: AuditEvent[];
  metadata: SignatureMetadata;
}

export interface SignatureData {
  svgPath: string; // SVG path de la signature
  base64Image: string; // Image PNG base64
  strokeData: StrokePoint[]; // Points détaillés pour analyse
  duration: number; // Temps de signature en ms
  boundingBox: BoundingBox;
  complexity: SignatureComplexity;
  hash: string; // Hash SHA-256 pour intégrité
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number; // 0-1 si supporté
  timestamp: number; // Timestamp relatif en ms
  velocity: number; // Vélocité calculée
  angle: number; // Angle du trait
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignatureComplexity {
  strokeCount: number;
  totalLength: number;
  averageVelocity: number;
  pressureVariation: number;
  timeVariation: number;
  complexityScore: number; // 0-1
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  version: string;
  screenResolution: string;
  touchCapability: boolean;
  pressureSupport: boolean;
  deviceId: string; // Fingerprint unique
}

export interface BiometricData {
  facePhoto?: string; // Photo témoin base64
  fingerprint?: string; // Empreinte si disponible
  voicePrint?: string; // Échantillon vocal
  behavioralPattern: BehavioralPattern;
}

export interface BehavioralPattern {
  typingRhythm?: number[];
  mouseDynamics?: MousePattern[];
  gesturePattern?: GesturePattern;
  signingBehavior: SigningBehavior;
}

export interface MousePattern {
  x: number;
  y: number;
  timestamp: number;
  button: number;
  velocity: number;
}

export interface GesturePattern {
  swipeDirection: string;
  swipeVelocity: number;
  pinchScale: number;
  rotationAngle: number;
}

export interface SigningBehavior {
  hesitationTime: number; // Temps avant de commencer
  signingDuration: number;
  numberOfPauses: number;
  pauseDurations: number[];
  strokeOrder: number[];
  pressureConsistency: number;
}

export interface LegalConsent {
  consentText: string;
  consentVersion: string;
  consentTimestamp: Date;
  consentIPAddress: string;
  consentMethod: 'click' | 'voice' | 'biometric' | 'manual';
  witnessId?: string;
  witnessName?: string;
  consentLanguage: 'fr' | 'en';
  acknowledgments: string[];
  disclaimers: string[];
}

export interface VerificationMethod {
  primary: 'signature' | 'pin' | 'biometric' | 'token';
  secondary?: 'sms' | 'email' | 'voice' | 'witness';
  strength: 'basic' | 'enhanced' | 'advanced';
  factors: AuthenticationFactor[];
}

export interface AuthenticationFactor {
  type: 'knowledge' | 'possession' | 'inherence';
  method: string;
  verified: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  event: AuditEventType;
  userId: string;
  ipAddress: string;
  details: Record<string, any>;
  hash: string;
}

export interface SignatureMetadata {
  permitType: string;
  workDescription: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  regulatoryRequirements: string[];
  complianceStandards: string[];
  retentionPeriod: number; // années
  archiveDate: Date;
  legalJurisdiction: string;
  customFields: Record<string, any>;
}

// =================== TYPES ET ÉNUMÉRATIONS ===================

export type SignerRole = 
  | 'supervisor' | 'safety_officer' | 'manager' | 'entrant' | 'attendant' 
  | 'worker' | 'observer' | 'rescue_team' | 'fire_watch' | 'inspector'
  | 'engineer' | 'contractor' | 'client_representative' | 'authority'
  | 'competent_person' | 'qualified_person' | 'authorized_person';

export type SignatureType = 
  | 'approval' | 'acknowledgment' | 'witness' | 'verification'
  | 'completion' | 'inspection' | 'emergency' | 'modification';

export type AuditEventType =
  | 'signature_created' | 'signature_verified' | 'signature_revoked'
  | 'consent_given' | 'document_accessed' | 'biometric_captured'
  | 'location_recorded' | 'device_changed' | 'attempt_failed';

// =================== CONFIGURATION ===================

export interface SignatureConfig {
  enableBiometrics: boolean;
  enableGeolocation: boolean;
  enablePressure: boolean;
  requireConsent: boolean;
  requireWitness: boolean;
  minSignatureDuration: number; // ms
  maxSignatureDuration: number; // ms
  minComplexityScore: number;
  canvasWidth: number;
  canvasHeight: number;
  strokeWidth: number;
  strokeColor: string;
  backgroundColor: string;
  debugMode: boolean;
  legalRetentionYears: number;
  complianceStandards: string[];
}

const DEFAULT_CONFIG: SignatureConfig = {
  enableBiometrics: true,
  enableGeolocation: true,
  enablePressure: true,
  requireConsent: true,
  requireWitness: false,
  minSignatureDuration: 500, // 0.5 secondes
  maxSignatureDuration: 30000, // 30 secondes
  minComplexityScore: 0.3,
  canvasWidth: 400,
  canvasHeight: 200,
  strokeWidth: 2,
  strokeColor: '#000000',
  backgroundColor: '#ffffff',
  debugMode: false,
  legalRetentionYears: 7,
  complianceStandards: ['RSST', 'PIPEDA', 'eIDAS']
};

// =================== TEXTES LÉGAUX ===================

const LEGAL_TEXTS = {
  fr: {
    consentTitle: 'Consentement à la signature électronique',
    consentText: `
      En apposant ma signature électronique ci-dessous, je confirme et consens à ce qui suit :

      1. IDENTIFICATION ET AUTHENTIFICATION
      • Je confirme être [SIGNER_NAME] et occuper le rôle de [SIGNER_ROLE]
      • J'ai fourni une méthode d'authentification valide pour vérifier mon identité
      • Je comprends que cette signature a la même valeur légale qu'une signature manuscrite

      2. CONSENTEMENT ÉCLAIRÉ
      • J'ai lu et compris le contenu complet du permis de travail
      • Je confirme l'exactitude de toutes les informations fournies
      • J'accepte les responsabilités associées à mon rôle

      3. DONNÉES BIOMÉTRIQUES ET LOCALISATION
      • Je consens à la collecte de données biométriques (signature, photo témoin)
      • Je consens à l'enregistrement de ma localisation GPS au moment de la signature
      • Je comprends que ces données sont protégées selon la PIPEDA

      4. INTÉGRITÉ ET AUDIT
      • Je comprends que cette signature sera horodatée et géolocalisée
      • Je consens à l'enregistrement d'un audit trail complet
      • Je comprends que toute tentative de falsification est détectable

      5. CONSERVATION ET ACCÈS
      • Je comprends que cette signature sera conservée pendant [RETENTION_YEARS] ans
      • Je consens à ce que les autorités réglementaires puissent y accéder si requis
      • Je peux demander une copie de ce document signé à tout moment

      6. RÉVOCATION
      • Je comprends que je peux révoquer cette signature sous certaines conditions
      • Toute révocation doit être justifiée et documentée
      • La révocation n'annule pas les responsabilités déjà engagées
    `,
    acknowledgments: [
      'J\'ai lu et compris le contenu du permis',
      'Je confirme mon identité et mon autorisation',
      'J\'accepte la collecte de données biométriques',
      'Je comprends les implications légales de cette signature'
    ],
    disclaimers: [
      'Cette signature électronique a force légale au Canada',
      'Les données sont protégées selon les normes PIPEDA',
      'Un audit trail complet est maintenu pour conformité',
      'En cas de litige, cette signature peut être utilisée comme preuve'
    ]
  },
  en: {
    consentTitle: 'Electronic Signature Consent',
    consentText: `
      By affixing my electronic signature below, I confirm and consent to the following:

      1. IDENTIFICATION AND AUTHENTICATION
      • I confirm that I am [SIGNER_NAME] and hold the role of [SIGNER_ROLE]
      • I have provided valid authentication method to verify my identity
      • I understand this signature has the same legal value as a handwritten signature

      2. INFORMED CONSENT
      • I have read and understood the complete content of the work permit
      • I confirm the accuracy of all information provided
      • I accept the responsibilities associated with my role

      3. BIOMETRIC DATA AND LOCATION
      • I consent to the collection of biometric data (signature, witness photo)
      • I consent to recording my GPS location at the time of signing
      • I understand this data is protected under PIPEDA

      4. INTEGRITY AND AUDIT
      • I understand this signature will be timestamped and geolocated
      • I consent to recording a complete audit trail
      • I understand any falsification attempt is detectable

      5. RETENTION AND ACCESS
      • I understand this signature will be retained for [RETENTION_YEARS] years
      • I consent that regulatory authorities may access it if required
      • I may request a copy of this signed document at any time

      6. REVOCATION
      • I understand I may revoke this signature under certain conditions
      • Any revocation must be justified and documented
      • Revocation does not cancel responsibilities already undertaken
    `,
    acknowledgments: [
      'I have read and understood the permit content',
      'I confirm my identity and authorization',
      'I accept biometric data collection',
      'I understand the legal implications of this signature'
    ],
    disclaimers: [
      'This electronic signature has legal force in Canada',
      'Data is protected under PIPEDA standards',
      'A complete audit trail is maintained for compliance',
      'In case of dispute, this signature may be used as evidence'
    ]
  }
} as const;

// =================== HOOK PRINCIPAL ===================

export function useSignature(config: Partial<SignatureConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // État principal
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatures, setSignatures] = useState<Map<string, ElectronicSignature>>(new Map());
  const [currentSignature, setCurrentSignature] = useState<ElectronicSignature | null>(null);
  const [isCapturingBiometric, setIsCapturingBiometric] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Références pour canvas et capture
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokeDataRef = useRef<StrokePoint[]>([]);
  const startTimeRef = useRef<number>(0);
  const deviceFingerprintRef = useRef<string>('');

  // =================== UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    if (finalConfig.debugMode) {
      console.log(`[Signature] ${message}`, data || '');
    }
  }, [finalConfig.debugMode]);

  const generateId = useCallback(() => {
    return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const generateHash = useCallback(async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const getDeviceFingerprint = useCallback((): string => {
    if (deviceFingerprintRef.current) {
      return deviceFingerprintRef.current;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      canvas.toDataURL()
    ].join('|');

    deviceFingerprintRef.current = btoa(fingerprint).slice(0, 32);
    return deviceFingerprintRef.current;
  }, []);

  const getDeviceInfo = useCallback((): DeviceInfo => {
    const ua = navigator.userAgent;
    return {
      platform: navigator.platform,
      browser: ua.split(' ')[0],
      version: ua.match(/Version\/[\d.]+/)?.[0] || 'Unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      touchCapability: 'ontouchstart' in window,
      pressureSupport: 'force' in TouchEvent.prototype,
      deviceId: getDeviceFingerprint()
    };
  }, [getDeviceFingerprint]);

  const getIPAddress = useCallback(async (): Promise<string> => {
    try {
      // En production, utiliser un service d'IP ou API backend
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '127.0.0.1'; // Fallback
    }
  }, []);

  // =================== ANALYSE SIGNATURE ===================

  const calculateVelocity = useCallback((points: StrokePoint[]): void => {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      const timeDelta = curr.timestamp - prev.timestamp;
      curr.velocity = timeDelta > 0 ? distance / timeDelta : 0;
    }
  }, []);

  const calculateAngle = useCallback((points: StrokePoint[]): void => {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      curr.angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    }
  }, []);

  const calculateComplexity = useCallback((strokeData: StrokePoint[]): SignatureComplexity => {
    if (strokeData.length < 2) {
      return {
        strokeCount: 0,
        totalLength: 0,
        averageVelocity: 0,
        pressureVariation: 0,
        timeVariation: 0,
        complexityScore: 0
      };
    }

    // Calculer longueur totale
    let totalLength = 0;
    let totalVelocity = 0;
    const pressures: number[] = [];
    const timestamps: number[] = [];

    for (let i = 1; i < strokeData.length; i++) {
      const prev = strokeData[i - 1];
      const curr = strokeData[i];
      
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      totalLength += distance;
      totalVelocity += curr.velocity;
      pressures.push(curr.pressure);
      timestamps.push(curr.timestamp);
    }

    const averageVelocity = totalVelocity / (strokeData.length - 1);
    
    // Variation de pression
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const pressureVariation = Math.sqrt(
      pressures.reduce((sum, p) => sum + Math.pow(p - avgPressure, 2), 0) / pressures.length
    );

    // Variation temporelle
    const timeDiffs = [];
    for (let i = 1; i < timestamps.length; i++) {
      timeDiffs.push(timestamps[i] - timestamps[i - 1]);
    }
    const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const timeVariation = Math.sqrt(
      timeDiffs.reduce((sum, t) => sum + Math.pow(t - avgTimeDiff, 2), 0) / timeDiffs.length
    );

    // Score de complexité (0-1)
    const lengthScore = Math.min(totalLength / 1000, 1); // Normaliser à 1000px
    const velocityScore = Math.min(averageVelocity, 1);
    const pressureScore = Math.min(pressureVariation * 2, 1);
    const timeScore = Math.min(timeVariation / 100, 1);

    const complexityScore = (lengthScore + velocityScore + pressureScore + timeScore) / 4;

    return {
      strokeCount: 1, // Simplifié - en production, détecter les strokes séparés
      totalLength,
      averageVelocity,
      pressureVariation,
      timeVariation,
      complexityScore
    };
  }, []);

  const generateSVGPath = useCallback((strokeData: StrokePoint[]): string => {
    if (strokeData.length < 2) return '';

    let path = `M ${strokeData[0].x} ${strokeData[0].y}`;
    
    for (let i = 1; i < strokeData.length; i++) {
      const point = strokeData[i];
      path += ` L ${point.x} ${point.y}`;
    }

    return path;
  }, []);

  const canvasToBase64 = useCallback((): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png');
  }, []);

  // =================== CANVAS ET DESSIN ===================

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = finalConfig.canvasWidth;
    canvas.height = finalConfig.canvasHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = finalConfig.strokeColor;
    context.lineWidth = finalConfig.strokeWidth;
    context.fillStyle = finalConfig.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;
  }, [finalConfig.canvasWidth, finalConfig.canvasHeight, finalConfig.strokeColor, finalConfig.strokeWidth, finalConfig.backgroundColor]);

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (!contextRef.current || !canvasRef.current) return;

    setIsDrawing(true);
    startTimeRef.current = Date.now();
    strokeDataRef.current = [];

    const rect = canvasRef.current.getBoundingClientRect();
    const point = 'touches' in event ? event.touches[0] : event;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    const pressure = 'force' in point ? (point as any).force : 0.5;

    strokeDataRef.current.push({
      x,
      y,
      pressure,
      timestamp: 0,
      velocity: 0,
      angle: 0
    });

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  }, []);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point = 'touches' in event ? event.touches[0] : event;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    const pressure = 'force' in point ? (point as any).force : 0.5;
    const timestamp = Date.now() - startTimeRef.current;

    strokeDataRef.current.push({
      x,
      y,
      pressure,
      timestamp,
      velocity: 0, // Sera calculé plus tard
      angle: 0 // Sera calculé plus tard
    });

    // Ajuster l'épaisseur selon la pression si supporté
    if (finalConfig.enablePressure && 'force' in point) {
      contextRef.current.lineWidth = finalConfig.strokeWidth * (0.5 + pressure);
    }

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  }, [isDrawing, finalConfig.enablePressure, finalConfig.strokeWidth]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    
    // Calculer vélocité et angles
    calculateVelocity(strokeDataRef.current);
    calculateAngle(strokeDataRef.current);

    log('Signature terminée', {
      points: strokeDataRef.current.length,
      duration: Date.now() - startTimeRef.current
    });
  }, [isDrawing, calculateVelocity, calculateAngle, log]);

  const clearCanvas = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.fillStyle = finalConfig.backgroundColor;
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokeDataRef.current = [];
    setIsDrawing(false);
    log('Canvas effacé');
  }, [finalConfig.backgroundColor, log]);

  // =================== CAPTURE BIOMÉTRIQUE ===================

  const captureBiometricData = useCallback(async (): Promise<BiometricData | undefined> => {
    if (!finalConfig.enableBiometrics) return undefined;

    try {
      setIsCapturingBiometric(true);
      const biometricData: BiometricData = {
        behavioralPattern: {
          signingBehavior: {
            hesitationTime: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
            signingDuration: Date.now() - startTimeRef.current,
            numberOfPauses: 0, // À implémenter avec détection pauses
            pauseDurations: [],
            strokeOrder: [1], // Simplifié
            pressureConsistency: strokeDataRef.current.reduce((sum, p) => sum + p.pressure, 0) / strokeDataRef.current.length
          }
        }
      };

      // Capture photo témoin si disponible
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: 320, 
              height: 240, 
              facingMode: 'user' 
            } 
          });
          
          const video = document.createElement('video');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          video.srcObject = stream;
          await video.play();
          
          canvas.width = 320;
          canvas.height = 240;
          ctx.drawImage(video, 0, 0);
          
          biometricData.facePhoto = canvas.toDataURL('image/jpeg', 0.8);
          
          stream.getTracks().forEach(track => track.stop());
          log('Photo témoin capturée');
        } catch (error) {
          log('Erreur capture photo témoin', error);
        }
      }

      return biometricData;

    } catch (error) {
      log('Erreur capture biométrique', error);
      return undefined;
    } finally {
      setIsCapturingBiometric(false);
    }
  }, [finalConfig.enableBiometrics, log]);

  // =================== GESTION SIGNATURES ===================

  const createSignature = useCallback(async (
    permitId: string,
    signerInfo: {
      id: string;
      name: string;
      role: SignerRole;
    },
    signatureType: SignatureType,
    location?: CustomGeolocationPosition,
    witnessInfo?: {
      id: string;
      name: string;
    }
  ): Promise<ElectronicSignature | null> => {
    try {
      if (strokeDataRef.current.length < 2) {
        setError('Signature trop courte - veuillez signer à nouveau');
        return null;
      }

      const duration = Date.now() - startTimeRef.current;
      if (duration < finalConfig.minSignatureDuration) {
        setError(`Signature trop rapide - minimum ${finalConfig.minSignatureDuration}ms`);
        return null;
      }

      if (duration > finalConfig.maxSignatureDuration) {
        setError(`Signature trop lente - maximum ${finalConfig.maxSignatureDuration}ms`);
        return null;
      }

      const complexity = calculateComplexity(strokeDataRef.current);
      if (complexity.complexityScore < finalConfig.minComplexityScore) {
        setError(`Signature trop simple - score minimum ${finalConfig.minComplexityScore}`);
        return null;
      }

      const signatureId = generateId();
      const timestamp = new Date();
      const ipAddress = await getIPAddress();
      const deviceInfo = getDeviceInfo();

      // Données de signature
      const boundingBox: BoundingBox = {
        x: Math.min(...strokeDataRef.current.map(p => p.x)),
        y: Math.min(...strokeDataRef.current.map(p => p.y)),
        width: Math.max(...strokeDataRef.current.map(p => p.x)) - Math.min(...strokeDataRef.current.map(p => p.x)),
        height: Math.max(...strokeDataRef.current.map(p => p.y)) - Math.min(...strokeDataRef.current.map(p => p.y))
      };

      const svgPath = generateSVGPath(strokeDataRef.current);
      const base64Image = canvasToBase64();
      const dataString = JSON.stringify({
        strokeData: strokeDataRef.current,
        timestamp: timestamp.toISOString(),
        signerId: signerInfo.id
      });
      const hash = await generateHash(dataString);

      const signatureData: SignatureData = {
        svgPath,
        base64Image,
        strokeData: strokeDataRef.current,
        duration,
        boundingBox,
        complexity,
        hash
      };

      // Capture biométrique
      const biometricData = await captureBiometricData();

      // Consentement légal
      const legalConsent: LegalConsent = {
        consentText: LEGAL_TEXTS.fr.consentText
          .replace('[SIGNER_NAME]', signerInfo.name)
          .replace('[SIGNER_ROLE]', signerInfo.role)
          .replace('[RETENTION_YEARS]', finalConfig.legalRetentionYears.toString()),
        consentVersion: '2025.1',
        consentTimestamp: timestamp,
        consentIPAddress: ipAddress,
        consentMethod: 'click',
        witnessId: witnessInfo?.id,
        witnessName: witnessInfo?.name,
        consentLanguage: 'fr',
        acknowledgments: LEGAL_TEXTS.fr.acknowledgments,
        disclaimers: LEGAL_TEXTS.fr.disclaimers
      };

      // Méthode de vérification
      const verificationMethod: VerificationMethod = {
        primary: 'signature',
        secondary: witnessInfo ? 'witness' : undefined,
        strength: biometricData ? 'advanced' : witnessInfo ? 'enhanced' : 'basic',
        factors: [
          {
            type: 'inherence',
            method: 'handwritten_signature',
            verified: true,
            timestamp,
            metadata: { complexityScore: complexity.complexityScore }
          }
        ]
      };

      if (biometricData?.facePhoto) {
        verificationMethod.factors.push({
          type: 'inherence',
          method: 'facial_recognition',
          verified: true,
          timestamp,
          metadata: { photoQuality: 'standard' }
        });
      }

      // Métadonnées
      const metadata: SignatureMetadata = {
        permitType: 'work_permit', // À spécifier selon le contexte
        workDescription: 'Permit de travail', // À récupérer du contexte
        riskLevel: 'medium', // À calculer selon le permis
        regulatoryRequirements: ['RSST', 'CNESST'],
        complianceStandards: finalConfig.complianceStandards,
        retentionPeriod: finalConfig.legalRetentionYears,
        archiveDate: new Date(timestamp.getTime() + finalConfig.legalRetentionYears * 365 * 24 * 60 * 60 * 1000),
        legalJurisdiction: 'Canada/Quebec',
        customFields: {}
      };

      // Audit trail initial
      const initialAuditEvent: AuditEvent = {
        id: generateId(),
        timestamp,
        event: 'signature_created',
        userId: signerInfo.id,
        ipAddress,
        details: {
          signatureType,
          role: signerInfo.role,
          duration,
          complexityScore: complexity.complexityScore,
          deviceFingerprint: deviceInfo.deviceId
        },
        hash: await generateHash(`${signatureId}${timestamp.toISOString()}${signerInfo.id}`)
      };

      const signature: ElectronicSignature = {
        id: signatureId,
        permitId,
        signerId: signerInfo.id,
        signerName: signerInfo.name,
        signerRole: signerInfo.role,
        signatureType,
        signatureData,
        timestamp,
        ipAddress,
        userAgent: navigator.userAgent,
        deviceInfo,
        location,
        biometricData,
        legalConsent,
        verificationMethod,
        isValid: true,
        auditTrail: [initialAuditEvent],
        metadata
      };

      // Stocker la signature
      setSignatures(prev => new Map(prev.set(signatureId, signature)));
      setCurrentSignature(signature);
      
      log('Signature créée', {
        id: signatureId,
        signer: signerInfo.name,
        role: signerInfo.role,
        complexityScore: complexity.complexityScore
      });

      return signature;

    } catch (error: any) {
      setError(`Erreur création signature: ${error.message}`);
      log('Erreur création signature', error);
      return null;
    }
  }, [
    finalConfig.minSignatureDuration,
    finalConfig.maxSignatureDuration,
    finalConfig.minComplexityScore,
    finalConfig.legalRetentionYears,
    finalConfig.complianceStandards,
    calculateComplexity,
    generateId,
    getIPAddress,
    getDeviceInfo,
    generateSVGPath,
    canvasToBase64,
    generateHash,
    captureBiometricData,
    log
  ]);

  const getSignature = useCallback((signatureId: string): ElectronicSignature | undefined => {
    return signatures.get(signatureId);
  }, [signatures]);

  const getSignaturesByPermit = useCallback((permitId: string): ElectronicSignature[] => {
    return Array.from(signatures.values()).filter(sig => sig.permitId === permitId);
  }, [signatures]);

  const getSignaturesByRole = useCallback((permitId: string, role: SignerRole): ElectronicSignature[] => {
    return Array.from(signatures.values()).filter(sig => 
      sig.permitId === permitId && sig.signerRole === role
    );
  }, [signatures]);

  const revokeSignature = useCallback(async (
    signatureId: string,
    reason: string,
    revokedBy: string
  ): Promise<boolean> => {
    try {
      const signature = signatures.get(signatureId);
      if (!signature) {
        setError('Signature non trouvée');
        return false;
      }

      const timestamp = new Date();
      const ipAddress = await getIPAddress();

      // Événement d'audit pour révocation
      const revokeAuditEvent: AuditEvent = {
        id: generateId(),
        timestamp,
        event: 'signature_revoked',
        userId: revokedBy,
        ipAddress,
        details: {
          reason,
          originalTimestamp: signature.timestamp,
          originalSigner: signature.signerId
        },
        hash: await generateHash(`revoke_${signatureId}_${timestamp.toISOString()}_${revokedBy}`)
      };

      const updatedSignature: ElectronicSignature = {
        ...signature,
        isValid: false,
        revokedAt: timestamp,
        revokedBy,
        revokedReason: reason,
        auditTrail: [...signature.auditTrail, revokeAuditEvent]
      };

      setSignatures(prev => new Map(prev.set(signatureId, updatedSignature)));
      
      log('Signature révoquée', {
        id: signatureId,
        reason,
        revokedBy
      });

      return true;

    } catch (error: any) {
      setError(`Erreur révocation signature: ${error.message}`);
      log('Erreur révocation signature', error);
      return false;
    }
  }, [signatures, getIPAddress, generateId, generateHash, log]);

  const deleteSignature = useCallback((signatureId: string): boolean => {
    const success = signatures.delete(signatureId);
    if (success) {
      setSignatures(prev => {
        const newMap = new Map(prev);
        newMap.delete(signatureId);
        return newMap;
      });
      log('Signature supprimée', signatureId);
    }
    return success;
  }, [signatures, log]);

  // =================== VALIDATION ET VÉRIFICATION ===================

  const verifySignature = useCallback(async (signatureId: string): Promise<boolean> => {
    try {
      const signature = signatures.get(signatureId);
      if (!signature) return false;

      // Vérifier l'intégrité du hash
      const dataString = JSON.stringify({
        strokeData: signature.signatureData.strokeData,
        timestamp: signature.timestamp.toISOString(),
        signerId: signature.signerId
      });
      const computedHash = await generateHash(dataString);
      
      if (computedHash !== signature.signatureData.hash) {
        log('Échec vérification hash', { signatureId, expected: signature.signatureData.hash, computed: computedHash });
        return false;
      }

      // Vérifier la validité temporelle
      if (signature.revokedAt) {
        log('Signature révoquée', { signatureId, revokedAt: signature.revokedAt });
        return false;
      }

      // Vérifier la complexité
      if (signature.signatureData.complexity.complexityScore < finalConfig.minComplexityScore) {
        log('Échec vérification complexité', { signatureId, score: signature.signatureData.complexity.complexityScore });
        return false;
      }

      log('Signature vérifiée avec succès', signatureId);
      return true;

    } catch (error) {
      log('Erreur vérification signature', error);
      return false;
    }
  }, [signatures, generateHash, finalConfig.minComplexityScore, log]);

  // =================== UTILITAIRES ===================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAllSignatures = useCallback(() => {
    return Array.from(signatures.values());
  }, [signatures]);

  const getSignatureStats = useCallback(() => {
    const allSigs = Array.from(signatures.values());
    return {
      total: allSigs.length,
      valid: allSigs.filter(s => s.isValid).length,
      revoked: allSigs.filter(s => !s.isValid).length,
      byRole: allSigs.reduce((acc, sig) => {
        acc[sig.signerRole] = (acc[sig.signerRole] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: allSigs.reduce((acc, sig) => {
        acc[sig.signatureType] = (acc[sig.signatureType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [signatures]);

  // =================== EFFETS ===================

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  // =================== RETOUR DU HOOK ===================

  return {
    // État
    isDrawing,
    isCapturingBiometric,
    currentSignature,
    error,
    
    // Références canvas
    canvasRef,
    
    // Actions de dessin
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    initializeCanvas,
    
    // Gestion signatures
    createSignature,
    getSignature,
    getSignaturesByPermit,
    getSignaturesByRole,
    revokeSignature,
    deleteSignature,
    
    // Validation
    verifySignature,
    
    // Utilitaires
    clearError,
    getAllSignatures,
    getSignatureStats,
    
    // Données calculées
    hasSignatures: signatures.size > 0,
    signatureCount: signatures.size,
    
    // Configuration
    config: finalConfig,
    
    // Textes légaux
    legalTexts: LEGAL_TEXTS
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseSignatureReturn = ReturnType<typeof useSignature>;

export default useSignature;
