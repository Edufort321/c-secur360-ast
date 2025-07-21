// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/GENERATORS/QRGENERATOR.TS ===================
// Générateur QR codes pour espaces clos avec tracking avancé et intégration Supabase
"use client";

// =================== TYPES LOCAUX POUR QR GENERATOR ===================

export interface LocalGeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocalBilingualText {
  fr: string;
  en: string;
}

// =================== TYPES QR CODES ===================

export interface QRCodeOptions {
  size: number;                           // Taille en pixels
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'; // Niveau correction erreur
  margin: number;                         // Marge en modules
  color: {
    dark: string;                         // Couleur modules sombres
    light: string;                        // Couleur fond
  };
  logo?: {
    image: string;                        // URL/Base64 logo
    size: number;                         // Taille logo (% du QR)
    margin: number;                       // Marge autour logo
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  };
  format: 'PNG' | 'JPEG' | 'SVG' | 'PDF';
  quality: number;                        // Qualité 0-100
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number;                   // Degrés pour linear
  };
  customPattern?: {
    finder: 'square' | 'circle' | 'rounded';
    alignment: 'square' | 'circle' | 'rounded';
    timing: 'square' | 'circle';
    darkModule: 'square' | 'circle' | 'diamond';
  };
  batch?: {
    count: number;                        // Nombre QR à générer
    prefix?: string;                      // Préfixe IDs
    sequence?: 'numeric' | 'alphanumeric' | 'uuid';
  };
}

export interface ConfinedSpaceData {
  id: string;                             // ID unique espace
  name: LocalBilingualText;                    // Nom espace
  type: 'tank' | 'vessel' | 'pit' | 'trench' | 'silo' | 'tunnel' | 'shaft' | 'vault' | 'bin' | 'other';
  description: LocalBilingualText;             // Description
  location: {
    coordinates: LocalGeoCoordinates;          // Position GPS
    address: LocalBilingualText;               // Adresse complète
    building?: string;                    // Bâtiment
    floor?: string;                       // Étage
    room?: string;                        // Local
    zone?: string;                        // Zone
    landmark?: LocalBilingualText;             // Point repère
  };
  specifications: {
    dimensions: {                         // Dimensions
      length?: number;                    // Longueur (m)
      width?: number;                     // Largeur (m)
      height?: number;                    // Hauteur (m)
      diameter?: number;                  // Diamètre (m)
      volume?: number;                    // Volume (m³)
      capacity?: number;                  // Capacité (L)
    };
    materials: {                         // Matériaux
      construction: string[];             // Construction
      lining?: string[];                  // Revêtement
      insulation?: string[];              // Isolation
    };
    access: {                            // Accès
      entries: Array<{                   // Entrées
        type: 'manhole' | 'hatch' | 'door' | 'opening';
        size: string;                     // Dimensions
        location: string;                 // Emplacement
        restrictions?: LocalBilingualText;     // Restrictions
      }>;
      emergencyExits: Array<{            // Sorties urgence
        type: string;
        location: string;
        equipment?: string[];             // Équipement requis
      }>;
    };
    hazards: Array<{                     // Dangers
      type: string;                       // Type danger
      description: LocalBilingualText;         // Description
      severity: 'low' | 'medium' | 'high' | 'critical';
      controls: LocalBilingualText[];          // Contrôles
      monitoring?: string;                // Surveillance
    }>;
  };
  ventilation: {                         // Ventilation
    natural: {
      available: boolean;
      effectiveness: 'poor' | 'fair' | 'good' | 'excellent';
      description?: LocalBilingualText;
    };
    mechanical: {
      available: boolean;
      capacity?: number;                  // CFM ou m³/h
      type?: 'exhaust' | 'supply' | 'both';
      effectiveness?: 'poor' | 'fair' | 'good' | 'excellent';
    };
    forced: {
      required: boolean;
      capacity?: number;
      equipment?: string[];
    };
  };
  emergencyEquipment: Array<{            // Équipement urgence
    type: 'tripod' | 'winch' | 'ventilator' | 'communication' | 'lighting' | 'breathing_apparatus' | 'rescue_equipment';
    location: string;                     // Emplacement
    specifications: string;               // Spécifications
    inspection: {                        // Inspection
      lastDate: string;
      nextDate: string;
      responsible: string;
      status: 'operational' | 'maintenance' | 'out_of_service';
    };
    accessibility: LocalBilingualText;         // Accessibilité
  }>;
  contacts: {                            // Contacts
    emergency: Array<{                   // Urgence
      name: string;
      role: string;
      phone: string;
      available: '24/7' | 'business_hours' | 'on_call';
      response_time: string;              // Temps réponse
    }>;
    maintenance: Array<{                 // Maintenance
      name: string;
      department: string;
      phone: string;
      email?: string;
      specialization: string[];
    }>;
    safety: Array<{                      // Sécurité
      name: string;
      role: string;
      phone: string;
      certifications: string[];
    }>;
  };
  regulations: {                         // Réglementations
    applicable: string[];                 // Standards applicables
    jurisdiction: string;                 // Juridiction
    lastReview: string;                   // Dernière révision
    nextReview: string;                   // Prochaine révision
    inspector?: string;                   // Inspecteur
  };
  metadata: {
    created: string;                      // Date création
    lastModified: string;                 // Dernière modification
    version: number;                      // Version
    status: 'active' | 'inactive' | 'under_maintenance' | 'decommissioned';
    tags: string[];                       // Tags
    notes?: LocalBilingualText;                // Notes
  };
}

export interface QRCodeData {
  version: string;                        // Version format données
  type: 'confined_space' | 'permit' | 'equipment' | 'inspection' | 'emergency';
  id: string;                            // ID unique
  url: string;                           // URL accès complet
  shortUrl?: string;                     // URL courte
  data: any;                             // Données encodées
  checksum: string;                      // Somme contrôle
  created: number;                       // Timestamp création
  expires?: number;                      // Expiration (optionnel)
  tracking: {
    utmSource: string;                   // Source UTM
    utmMedium: string;                   // Medium UTM
    utmCampaign: string;                 // Campagne UTM
    utmContent?: string;                 // Contenu UTM
    custom?: Record<string, string>;     // Paramètres custom
  };
  security: {
    encrypted: boolean;                  // Données chiffrées
    signed: boolean;                     // Signature numérique
    hash: string;                        // Hash intégrité
    salt?: string;                       // Sel chiffrement
  };
}

export interface QRCodeResult {
  success: boolean;                       // Succès génération
  qrCode?: {
    dataUrl: string;                     // URL données image
    blob: Blob;                          // Blob image
    svg?: string;                        // SVG si demandé
    size: number;                        // Taille finale
    modules: number;                     // Nombre modules
    version: number;                     // Version QR
    errorCorrectionLevel: string;        // Niveau correction
  };
  data: QRCodeData;                      // Données encodées
  printable?: {
    pdf: Blob;                           // PDF imprimable
    instructions: LocalBilingualText;         // Instructions
    qrPosition: { x: number; y: number; }; // Position QR
  };
  error?: string;                        // Erreur si échec
  warnings?: string[];                   // Avertissements
  metadata: {
    generationTime: number;              // Temps génération (ms)
    dataSize: number;                    // Taille données (octets)
    compressionRatio?: number;           // Taux compression
    estimatedScanDistance: number;       // Distance scan estimée (cm)
  };
}

export interface QRBatchResult {
  success: boolean;                       // Succès batch
  total: number;                         // Total demandé
  generated: number;                     // Générés avec succès
  failed: number;                        // Échecs
  results: Array<{                       // Résultats individuels
    id: string;
    success: boolean;
    qrCode?: QRCodeResult;
    error?: string;
  }>;
  archive?: {                           // Archive ZIP
    blob: Blob;
    filename: string;
    size: number;
  };
  summary: {                            // Résumé
    totalSize: number;                   // Taille totale
    averageGenerationTime: number;       // Temps moyen
    errorTypes: Record<string, number>;  // Types erreurs
  };
}

export interface PrintableQROptions {
  format: 'A4' | 'Letter' | 'Label' | 'Sticker';
  layout: 'single' | 'grid_2x2' | 'grid_3x3' | 'grid_4x4' | 'custom';
  customGrid?: { rows: number; cols: number; };
  elements: {
    qrCode: boolean;                     // QR code
    title: boolean;                      // Titre
    description: boolean;                // Description
    instructions: boolean;               // Instructions
    emergencyContacts: boolean;          // Contacts urgence
    hazardWarnings: boolean;             // Avertissements
    logo: boolean;                       // Logo entreprise
    border: boolean;                     // Bordure
  };
  styling: {
    colors: {
      primary: string;
      secondary: string;
      warning: string;
      emergency: string;
    };
    fonts: {
      title: string;
      body: string;
      emergency: string;
    };
    sizes: {
      qrCode: number;                    // Taille QR (%)
      title: number;                     // Taille titre
      body: number;                      // Taille texte
    };
  };
  durability: {
    waterproof: boolean;                 // Résistant eau
    uvResistant: boolean;                // Résistant UV
    temperatureRange: {                 // Plage température
      min: number;                      // °C
      max: number;                      // °C
    };
    adhesive: 'permanent' | 'removable' | 'repositionable';
    lamination: 'none' | 'matte' | 'gloss';
  };
}

// =================== GÉNÉRATEUR PRINCIPAL ===================

export class QRGenerator {
  private defaultOptions: QRCodeOptions;
  
  constructor() {
    this.defaultOptions = {
      size: 256,
      errorCorrectionLevel: 'M',
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      format: 'PNG',
      quality: 90,
      customPattern: {
        finder: 'square',
        alignment: 'square',
        timing: 'square',
        darkModule: 'square'
      }
    };
  }

  // =================== MÉTHODES PRINCIPALES ===================

  /**
   * Génère un QR code pour un espace clos
   */
  async generateConfinedSpaceQR(
    spaceData: ConfinedSpaceData,
    options: Partial<QRCodeOptions> = {}
  ): Promise<QRCodeResult> {
    try {
      const finalOptions = { ...this.defaultOptions, ...options };
      const startTime = performance.now();

      // Préparer les données QR
      const qrData = this.prepareQRData(spaceData, 'confined_space');
      
      // Générer l'URL d'accès
      const accessUrl = this.generateAccessURL(spaceData.id, qrData.tracking);
      qrData.url = accessUrl;
      
      // Ajouter sécurité
      qrData.security = await this.addSecurity(qrData);
      
      // Calculer checksum
      qrData.checksum = await this.calculateChecksum(qrData);
      
      // Générer le QR code
      const qrCodeGeneration = await this.generateQRCodeImage(
        JSON.stringify(qrData), 
        finalOptions
      );
      
      const generationTime = performance.now() - startTime;
      
      return {
        success: true,
        qrCode: qrCodeGeneration,
        data: qrData,
        metadata: {
          generationTime,
          dataSize: JSON.stringify(qrData).length,
          compressionRatio: this.calculateCompressionRatio(qrData),
          estimatedScanDistance: this.estimateScanDistance(finalOptions.size)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        data: this.prepareQRData(spaceData, 'confined_space'),
        error: error instanceof Error ? error.message : 'Erreur génération QR code',
        metadata: {
          generationTime: 0,
          dataSize: 0,
          estimatedScanDistance: 0
        }
      };
    }
  }

  /**
   * Génère un PDF imprimable avec QR code
   */
  async generatePrintableQR(
    spaceData: ConfinedSpaceData,
    qrResult: QRCodeResult,
    printOptions: Partial<PrintableQROptions> = {}
  ): Promise<Blob> {
    const options = this.mergePrintOptions(printOptions);
    
    // Créer le contenu PDF
    const pdfContent = await this.createPrintablePDF(spaceData, qrResult, options);
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Génère plusieurs QR codes en lot
   */
  async generateBatch(
    spacesData: ConfinedSpaceData[],
    options: Partial<QRCodeOptions> = {}
  ): Promise<QRBatchResult> {
    const startTime = performance.now();
    const results: QRBatchResult['results'] = [];
    let generated = 0;
    let failed = 0;
    
    for (const spaceData of spacesData) {
      try {
        const qrResult = await this.generateConfinedSpaceQR(spaceData, options);
        
        results.push({
          id: spaceData.id,
          success: qrResult.success,
          qrCode: qrResult,
          error: qrResult.error
        });
        
        if (qrResult.success) {
          generated++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          id: spaceData.id,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        failed++;
      }
    }
    
    // Créer archive ZIP si succès
    let archive: QRBatchResult['archive'];
    if (generated > 0) {
      archive = await this.createBatchArchive(results.filter(r => r.success));
    }
    
    const endTime = performance.now();
    
    return {
      success: generated > 0,
      total: spacesData.length,
      generated,
      failed,
      results,
      archive,
      summary: {
        totalSize: results.reduce((sum, r) => sum + (r.qrCode?.qrCode?.size || 0), 0),
        averageGenerationTime: (endTime - startTime) / spacesData.length,
        errorTypes: this.analyzeErrorTypes(results)
      }
    };
  }

  /**
   * Valide un QR code existant
   */
  async validateQRCode(qrCodeData: string): Promise<{
    valid: boolean;
    data?: QRCodeData;
    errors?: string[];
    security?: {
      checksumValid: boolean;
      signatureValid: boolean;
      notExpired: boolean;
    };
  }> {
    try {
      // Parser les données QR
      const data: QRCodeData = JSON.parse(qrCodeData);
      
      // Validations
      const errors: string[] = [];
      
      // Vérifier structure
      if (!data.version || !data.type || !data.id) {
        errors.push('Structure données invalide');
      }
      
      // Vérifier checksum
      const calculatedChecksum = await this.calculateChecksum(data);
      const checksumValid = calculatedChecksum === data.checksum;
      if (!checksumValid) {
        errors.push('Checksum invalide');
      }
      
      // Vérifier expiration
      const notExpired = !data.expires || Date.now() < data.expires;
      if (!notExpired) {
        errors.push('QR code expiré');
      }
      
      // Vérifier signature si présente
      let signatureValid = true;
      if (data.security.signed) {
        signatureValid = await this.verifySignature(data);
        if (!signatureValid) {
          errors.push('Signature invalide');
        }
      }
      
      return {
        valid: errors.length === 0,
        data: errors.length === 0 ? data : undefined,
        errors: errors.length > 0 ? errors : undefined,
        security: {
          checksumValid,
          signatureValid,
          notExpired
        }
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: ['Format QR code invalide']
      };
    }
  }

  /**
   * Met à jour un QR code existant
   */
  async updateQRCode(
    existingData: QRCodeData,
    updates: Partial<ConfinedSpaceData>,
    options: Partial<QRCodeOptions> = {}
  ): Promise<QRCodeResult> {
    // Merger les données
    const updatedSpaceData = { ...existingData.data, ...updates };
    
    // Incrémenter version
    const newVersion = existingData.data.metadata?.version + 1 || 1;
    updatedSpaceData.metadata = {
      ...updatedSpaceData.metadata,
      version: newVersion,
      lastModified: new Date().toISOString()
    };
    
    // Générer nouveau QR code
    return this.generateConfinedSpaceQR(updatedSpaceData, options);
  }

  // =================== MÉTHODES PRIVÉES ===================

  private prepareQRData(spaceData: ConfinedSpaceData, type: QRCodeData['type']): QRCodeData {
    return {
      version: '1.0',
      type,
      id: spaceData.id,
      url: '', // Sera rempli plus tard
      data: spaceData,
      checksum: '', // Sera calculé plus tard
      created: Date.now(),
      tracking: {
        utmSource: 'qr_code',
        utmMedium: 'print',
        utmCampaign: 'confined_space_access',
        utmContent: spaceData.type,
        custom: {
          space_id: spaceData.id,
          space_type: spaceData.type,
          generation_date: new Date().toISOString().split('T')[0]
        }
      },
      security: {
        encrypted: false,
        signed: false,
        hash: '', // Sera calculé plus tard
      }
    };
  }

  private generateAccessURL(spaceId: string, tracking: QRCodeData['tracking']): string {
    const baseUrl = 'https://app.permits.ca/confined-spaces';
    const params = new URLSearchParams({
      utm_source: tracking.utmSource,
      utm_medium: tracking.utmMedium,
      utm_campaign: tracking.utmCampaign,
      utm_content: tracking.utmContent || '',
      ...tracking.custom
    });
    
    return `${baseUrl}/${spaceId}?${params.toString()}`;
  }

  private async addSecurity(qrData: QRCodeData): Promise<QRCodeData['security']> {
    // Calculer hash des données
    const dataString = JSON.stringify({
      ...qrData,
      security: undefined // Exclure security du hash
    });
    
    const hash = await this.calculateHash(dataString);
    
    return {
      encrypted: false, // Implémentation future
      signed: false,    // Implémentation future
      hash,
      salt: this.generateSalt()
    };
  }

  private async calculateChecksum(data: QRCodeData): Promise<string> {
    const dataString = JSON.stringify({
      ...data,
      checksum: undefined // Exclure checksum du calcul
    });
    
    return this.calculateHash(dataString);
  }

  private async calculateHash(data: string): Promise<string> {
    // Simulation SHA-256 (remplacer par vraie implémentation)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async generateQRCodeImage(
    data: string, 
    options: QRCodeOptions
  ): Promise<QRCodeResult['qrCode']> {
    // Simulation génération QR code (remplacer par vraie bibliothèque QR)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = options.size;
    canvas.height = options.size;
    
    // Fond
    ctx.fillStyle = options.color.light;
    ctx.fillRect(0, 0, options.size, options.size);
    
    // Simulation pattern QR
    ctx.fillStyle = options.color.dark;
    const moduleSize = (options.size - 2 * options.margin) / 21; // 21x21 modules version 1
    
    // Dessiner les finders (coins)
    this.drawFinder(ctx, options.margin, options.margin, moduleSize, options.customPattern?.finder);
    this.drawFinder(ctx, options.size - options.margin - 7 * moduleSize, options.margin, moduleSize, options.customPattern?.finder);
    this.drawFinder(ctx, options.margin, options.size - options.margin - 7 * moduleSize, moduleSize, options.customPattern?.finder);
    
    // Dessiner modules données (simulation)
    for (let i = 0; i < 21; i++) {
      for (let j = 0; j < 21; j++) {
        if (Math.random() > 0.5) { // Simulation pattern
          const x = options.margin + i * moduleSize;
          const y = options.margin + j * moduleSize;
          this.drawModule(ctx, x, y, moduleSize, options.customPattern?.darkModule);
        }
      }
    }
    
    // Ajouter logo si spécifié
    if (options.logo) {
      await this.addLogo(canvas, ctx, options.logo);
    }
    
    // Convertir en blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 
        options.format === 'PNG' ? 'image/png' : 'image/jpeg',
        options.quality / 100
      );
    });
    
    return {
      dataUrl: canvas.toDataURL(),
      blob,
      svg: options.format === 'SVG' ? this.generateSVG(data, options) : undefined,
      size: options.size,
      modules: 21,
      version: 1,
      errorCorrectionLevel: options.errorCorrectionLevel
    };
  }

  private drawFinder(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    moduleSize: number, 
    pattern?: string
  ): void {
    const size = 7 * moduleSize;
    
    switch (pattern) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - moduleSize, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'rounded':
        this.drawRoundedRect(ctx, x, y, size, size, moduleSize/2);
        break;
      default:
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }
  }

  private drawModule(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    pattern?: string
  ): void {
    switch (pattern) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size/2);
        ctx.lineTo(x + size/2, y + size);
        ctx.lineTo(x, y + size/2);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        ctx.fillRect(x, y, size, size);
    }
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private async addLogo(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    logoOptions: QRCodeOptions['logo']
  ): Promise<void> {
    if (!logoOptions) return;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const logoSize = (canvas.width * logoOptions.size) / 100;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        
        // Fond blanc pour logo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
          x - logoOptions.margin,
          y - logoOptions.margin,
          logoSize + 2 * logoOptions.margin,
          logoSize + 2 * logoOptions.margin
        );
        
        // Dessiner logo
        ctx.drawImage(img, x, y, logoSize, logoSize);
        resolve();
      };
      img.src = logoOptions.image;
    });
  }

  private generateSVG(data: string, options: QRCodeOptions): string {
    // Génération SVG simplifiée
    return `
      <svg width="${options.size}" height="${options.size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${options.color.light}"/>
        <!-- Modules QR seraient générés ici -->
        <text x="50%" y="50%" text-anchor="middle" fill="${options.color.dark}">QR</text>
      </svg>
    `;
  }

  private calculateCompressionRatio(qrData: QRCodeData): number {
    const originalSize = JSON.stringify(qrData.data).length;
    const compressedSize = JSON.stringify(qrData).length;
    return originalSize / compressedSize;
  }

  private estimateScanDistance(qrSize: number): number {
    // Estimation distance scan en cm (formule approximative)
    return Math.round(qrSize / 10);
  }

  private mergePrintOptions(options: Partial<PrintableQROptions>): PrintableQROptions {
    return {
      format: 'A4',
      layout: 'single',
      elements: {
        qrCode: true,
        title: true,
        description: true,
        instructions: true,
        emergencyContacts: true,
        hazardWarnings: true,
        logo: false,
        border: true
      },
      styling: {
        colors: {
          primary: '#1e3a8a',
          secondary: '#64748b',
          warning: '#f59e0b',
          emergency: '#dc2626'
        },
        fonts: {
          title: 'Arial Bold',
          body: 'Arial',
          emergency: 'Arial Bold'
        },
        sizes: {
          qrCode: 30,
          title: 18,
          body: 12
        }
      },
      durability: {
        waterproof: true,
        uvResistant: true,
        temperatureRange: { min: -20, max: 60 },
        adhesive: 'permanent',
        lamination: 'matte'
      },
      ...options
    };
  }

  private async createPrintablePDF(
    spaceData: ConfinedSpaceData,
    qrResult: QRCodeResult,
    options: PrintableQROptions
  ): Promise<string> {
    // Simulation création PDF (remplacer par vraie bibliothèque PDF)
    const pdfContent = {
      format: options.format,
      content: {
        qrCode: qrResult.qrCode?.dataUrl,
        title: spaceData.name,
        description: spaceData.description,
        instructions: {
          fr: 'Scannez ce code QR pour accéder aux informations complètes de cet espace clos',
          en: 'Scan this QR code to access complete information about this confined space'
        },
        emergencyContacts: spaceData.contacts.emergency,
        hazards: spaceData.specifications.hazards
      },
      styling: options.styling
    };
    
    return JSON.stringify(pdfContent);
  }

  private async createBatchArchive(
    successfulResults: QRBatchResult['results']
  ): Promise<QRBatchResult['archive']> {
    // Simulation création archive ZIP
    const archiveContent = successfulResults.map(result => ({
      filename: `${result.id}_qr.png`,
      data: result.qrCode?.qrCode?.blob
    }));
    
    const archiveSize = archiveContent.reduce(
      (sum, item) => sum + (item.data?.size || 0), 
      0
    );
    
    return {
      blob: new Blob([JSON.stringify(archiveContent)], { type: 'application/zip' }),
      filename: `qr_codes_batch_${Date.now()}.zip`,
      size: archiveSize
    };
  }

  private analyzeErrorTypes(results: QRBatchResult['results']): Record<string, number> {
    const errorTypes: Record<string, number> = {};
    
    results.filter(r => !r.success).forEach(result => {
      const errorType = result.error?.split(':')[0] || 'Unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    return errorTypes;
  }

  private async verifySignature(data: QRCodeData): Promise<boolean> {
    // Simulation vérification signature (implémentation future)
    return true;
  }
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Crée une instance du générateur QR
 */
export function createQRGenerator(): QRGenerator {
  return new QRGenerator();
}

/**
 * Génère rapidement un QR code pour espace clos
 */
export async function generateQuickQR(
  spaceData: ConfinedSpaceData,
  size: number = 256
): Promise<QRCodeResult> {
  const generator = createQRGenerator();
  return generator.generateConfinedSpaceQR(spaceData, { size });
}

/**
 * Génère un QR code avec logo personnalisé
 */
export async function generateBrandedQR(
  spaceData: ConfinedSpaceData,
  logoUrl: string,
  brandColors: { primary: string; secondary: string; }
): Promise<QRCodeResult> {
  const generator = createQRGenerator();
  return generator.generateConfinedSpaceQR(spaceData, {
    size: 512,
    errorCorrectionLevel: 'H', // Niveau élevé pour logo
    logo: {
      image: logoUrl,
      size: 20, // 20% du QR
      margin: 4
    },
    color: {
      dark: brandColors.primary,
      light: '#ffffff'
    },
    gradient: {
      type: 'linear',
      colors: [brandColors.primary, brandColors.secondary],
      direction: 45
    }
  });
}

/**
 * Génère un QR code haute résolution pour impression
 */
export async function generatePrintQR(
  spaceData: ConfinedSpaceData
): Promise<QRCodeResult> {
  const generator = createQRGenerator();
  return generator.generateConfinedSpaceQR(spaceData, {
    size: 1024, // Haute résolution
    errorCorrectionLevel: 'H',
    margin: 8,
    format: 'PNG',
    quality: 100,
    customPattern: {
      finder: 'rounded',
      alignment: 'rounded',
      timing: 'square',
      darkModule: 'square'
    }
  });
}

/**
 * Valide et decode un QR code scanné
 */
export async function validateScannedQR(qrCodeData: string): Promise<{
  valid: boolean;
  spaceData?: ConfinedSpaceData;
  errors?: string[];
}> {
  const generator = createQRGenerator();
  const validation = await generator.validateQRCode(qrCodeData);
  
  return {
    valid: validation.valid,
    spaceData: validation.data?.type === 'confined_space' ? validation.data.data : undefined,
    errors: validation.errors
  };
}

// =================== EXPORT ===================

export default QRGenerator;
export {
  type QRCodeOptions,
  type ConfinedSpaceData,
  type QRCodeData,
  type QRCodeResult,
  type QRBatchResult,
  type PrintableQROptions
};
