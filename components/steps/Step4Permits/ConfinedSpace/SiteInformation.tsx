"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Camera, Upload, ChevronLeft, ChevronRight, Trash2, Wind, Shield, QrCode, Download, Copy, ExternalLink
} from 'lucide-react';
import { generateQRCode } from '../../../../../app/utils/generateQRCode';

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface PhotoRecord {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation';
  taken_by: string;
  gps_location?: { 
    lat: number; 
    lng: number; 
    accuracy?: number;
    address?: string;
  };
  file_size?: number;
  file_name?: string;
}

interface RegulationData {
  name: string;
  authority: string;
  authority_phone: string;
  code: string;
  url?: string;
  atmospheric_testing: {
    frequency_minutes: number;
    continuous_monitoring_required?: boolean;
    documentation_required?: boolean;
  };
  personnel_requirements: {
    min_age: number;
    attendant_required: boolean;
    bidirectional_communication_required?: boolean;
    rescue_plan_required?: boolean;
    competent_person_required?: boolean;
    max_work_period_hours?: number;
  };
}

interface SiteInformationProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  setSelectedProvince: (province: ProvinceCode) => void;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  capturedPhotos: PhotoRecord[];
  setCapturedPhotos: (photos: PhotoRecord[] | ((prev: PhotoRecord[]) => PhotoRecord[])) => void;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: (index: number) => void;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
}

// =================== COMPOSANT SITE INFORMATION ===================
const SiteInformation: React.FC<SiteInformationProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  setSelectedProvince,
  PROVINCIAL_REGULATIONS,
  capturedPhotos,
  setCapturedPhotos,
  currentPhotoIndex,
  setCurrentPhotoIndex,
  isMobile,
  language,
  styles,
  updateParentData
}) => {
  // Référence pour l'input file
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États pour le QR code
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // =================== GESTION QR CODE ===================
  
  // Génère l'URL ou les données pour le QR code
  const generateSpaceIdentifier = () => {
    if (!permitData.site_name || !permitData.space_location) {
      return null;
    }
    
    // Créer un identifiant unique basé sur les informations du site
    const spaceData = {
      site_name: permitData.site_name,
      space_location: permitData.space_location,
      space_description: permitData.space_description,
      site_address: permitData.site_address,
      province: selectedProvince,
      created_at: new Date().toISOString(),
      space_id: `${selectedProvince}-${permitData.site_name.replace(/\s+/g, '-').toLowerCase()}-${permitData.space_location.replace(/\s+/g, '-').toLowerCase()}`
    };
    
    // Pour l'environnement de production, utiliser l'URL réelle
    // const baseUrl = process.env.NODE_ENV === 'production' 
    //   ? 'https://votre-domaine.com' 
    //   : 'http://localhost:3000';
    
    const baseUrl = 'https://c-secur360.com';
    const queryUrl = `${baseUrl}/permits/confined-space/lookup?space_id=${encodeURIComponent(spaceData.space_id)}`;
    
    return {
      url: queryUrl,
      data: spaceData
    };
  };

  // Génère le QR code
  const handleGenerateQRCode = async () => {
    const spaceIdentifier = generateSpaceIdentifier();
    if (!spaceIdentifier) {
      alert(language === 'fr' 
        ? '⚠️ Veuillez remplir le nom du site et la localisation de l\'espace clos avant de générer le QR code.'
        : '⚠️ Please fill in the site name and confined space location before generating the QR code.'
      );
      return;
    }

    setIsGeneratingQR(true);
    try {
      const qrCodeBase64 = await generateQRCode(spaceIdentifier.url);
      setQrCodeData(qrCodeBase64);
      
      // Sauvegarder les données dans le permitData pour synchronisation avec Supabase
      updatePermitData({ 
        space_qr_code: qrCodeBase64,
        space_qr_url: spaceIdentifier.url,
        space_identifier: spaceIdentifier.data
      });
      
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      alert(language === 'fr' 
        ? '❌ Erreur lors de la génération du QR code.'
        : '❌ Error generating QR code.'
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Télécharge le QR code
  const downloadQRCode = () => {
    if (!qrCodeData) return;
    
    const link = document.createElement('a');
    link.download = `QR-ConfinedSpace-${permitData.permit_number || 'espace-clos'}.png`;
    link.href = qrCodeData;
    link.click();
  };

  // Copie l'URL dans le presse-papiers
  const copyQRUrl = async () => {
    const spaceIdentifier = generateSpaceIdentifier();
    if (!spaceIdentifier) return;
    
    try {
      await navigator.clipboard.writeText(spaceIdentifier.url);
      alert(language === 'fr' 
        ? '✅ URL copiée dans le presse-papiers!'
        : '✅ URL copied to clipboard!'
      );
    } catch (error) {
      console.error('Erreur copie URL:', error);
    }
  };

  // Génère automatiquement le QR code lors du changement des données critiques
  useEffect(() => {
    if (permitData.site_name && permitData.space_location && !qrCodeData) {
      // Délai pour éviter la génération multiple lors de la saisie
      const timeoutId = setTimeout(() => {
        handleGenerateQRCode();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [permitData.site_name, permitData.space_location, selectedProvince]);

  // Charge le QR code existant si disponible
  useEffect(() => {
    if (permitData.space_qr_code && !qrCodeData) {
      setQrCodeData(permitData.space_qr_code);
    }
  }, [permitData.space_qr_code]);

  // =================== FONCTIONS UTILITAIRES ===================
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number; accuracy?: number; address?: string } | undefined> => {
    try {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                address: 'Localisation GPS'
              });
            },
            () => resolve(undefined)
          );
        });
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
    }
    return undefined;
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      before: language === 'fr' ? 'Avant intervention' : 'Before work',
      during: language === 'fr' ? 'Pendant intervention' : 'During work', 
      after: language === 'fr' ? 'Après intervention' : 'After work',
      equipment: language === 'fr' ? 'Équipement' : 'Equipment',
      hazard: language === 'fr' ? 'Danger identifié' : 'Identified hazard',
      documentation: language === 'fr' ? 'Documentation' : 'Documentation'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      before: '#059669',
      during: '#d97706', 
      after: '#0891b2',
      equipment: '#7c3aed',
      hazard: '#dc2626',
      documentation: '#6366f1'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  // =================== GESTION DES PHOTOS ===================
  const handlePhotoCapture = async (category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation') => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = 'environment';
        fileInputRef.current.multiple = true;
        fileInputRef.current.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            files.forEach(file => processPhoto(file, category));
          }
        };
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  };

  const processPhoto = async (file: File, category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation') => {
    try {
      const photoUrl = URL.createObjectURL(file);
      const newPhoto: PhotoRecord = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: photoUrl,
        caption: `${getCategoryLabel(category)} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
        category,
        timestamp: new Date().toISOString(),
        taken_by: 'Opérateur',
        gps_location: await getCurrentLocation(),
        file_size: file.size,
        file_name: file.name
      };
      
      setCapturedPhotos(prev => {
        const newPhotos = [...prev, newPhoto];
        updateParentData('capturedPhotos', newPhotos);
        return newPhotos;
      });
      
      // Reset to show the new photo
      setCurrentPhotoIndex(capturedPhotos.length);
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  };

  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => {
      const newPhotos = prev.filter(photo => photo.id !== photoId);
      updateParentData('capturedPhotos', newPhotos);
      
      // Adjust current index if needed
      if (currentPhotoIndex >= newPhotos.length + 1) {
        setCurrentPhotoIndex(Math.max(0, newPhotos.length));
      }
      return newPhotos;
    });
  };

  // =================== CARROUSEL PHOTOS ===================
  const PhotoCarousel = ({ photos, onAddPhoto }: {
    photos: PhotoRecord[];
    onAddPhoto: () => void;
  }) => {
    const totalSlides = photos.length + 1; // +1 pour la slide "Ajouter"

    const nextSlide = () => setCurrentPhotoIndex((currentPhotoIndex + 1) % totalSlides);
    const prevSlide = () => setCurrentPhotoIndex(currentPhotoIndex === 0 ? totalSlides - 1 : currentPhotoIndex - 1);
    const goToSlide = (index: number) => setCurrentPhotoIndex(index);

    return (
      <div style={{
        position: 'relative',
        marginTop: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '280px' : '350px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            height: '100%',
            transform: `translateX(-${currentPhotoIndex * 100}%)`
          }}>
            {/* Photos existantes */}
            {photos.map((photo: PhotoRecord, index: number) => (
              <div key={photo.id} style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a'
              }}>
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
                {/* Overlay avec métadonnées */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))',
                  color: 'white',
                  padding: isMobile ? '24px 16px 16px' : '32px 24px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <h4 style={{ 
                      margin: '0 0 6px', 
                      fontSize: isMobile ? '15px' : '16px', 
                      fontWeight: '700',
                      color: '#ffffff'
                    }}>
                      {getCategoryLabel(photo.category)}
                    </h4>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: isMobile ? '12px' : '13px', 
                      opacity: 0.8,
                      color: '#e2e8f0'
                    }}>
                      📅 {new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                    {photo.gps_location && (
                      <p style={{ 
                        margin: '0', 
                        fontSize: isMobile ? '11px' : '12px', 
                        opacity: 0.7,
                        color: '#cbd5e1'
                      }}>
                        📍 {photo.gps_location.address}
                      </p>
                    )}
                    {photo.file_size && (
                      <p style={{ 
                        margin: '4px 0 0', 
                        fontSize: '11px', 
                        opacity: 0.6,
                        color: '#94a3b8'
                      }}>
                        📁 {(photo.file_size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <span style={{
                      fontSize: isMobile ? '11px' : '12px',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: getCategoryColor(photo.category),
                      color: 'white',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {getCategoryLabel(photo.category)}
                    </span>
                    <button 
                      onClick={() => deletePhoto(photo.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.9)',
                        border: '1px solid #ef4444',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        minHeight: '32px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                      title={language === 'fr' ? "Supprimer cette photo" : "Delete this photo"}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 1)';
                        (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.9)';
                        (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Slide "Ajouter photo" */}
            <div style={{
              minWidth: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
              border: '2px dashed rgba(59, 130, 246, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '16px' : '20px',
              position: 'relative'
            }}
            onClick={onAddPhoto}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))';
              (e.target as HTMLDivElement).style.borderColor = 'rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))';
              (e.target as HTMLDivElement).style.borderColor = 'rgba(59, 130, 246, 0.4)';
            }}>
              <div style={{
                width: isMobile ? '56px' : '64px',
                height: isMobile ? '56px' : '64px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}>
                <Camera style={{ 
                  width: isMobile ? '28px' : '32px', 
                  height: isMobile ? '28px' : '32px',
                  color: '#60a5fa'
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ 
                  margin: '0 0 8px', 
                  fontSize: isMobile ? '18px' : '20px', 
                  fontWeight: '700', 
                  color: '#60a5fa'
                }}>
                  {language === 'fr' ? 'Ajouter une photo' : 'Add photo'}
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '14px' : '15px', 
                  opacity: 0.8, 
                  textAlign: 'center', 
                  color: '#94a3b8',
                  maxWidth: '240px'
                }}>
                  {language === 'fr' ? 'Documentez cette étape avec une photo' : 'Document this step with a photo'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Boutons navigation */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  width: isMobile ? '44px' : '48px',
                  height: isMobile ? '44px' : '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.95)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.8)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
              </button>
              <button 
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  width: isMobile ? '44px' : '48px',
                  height: isMobile ? '44px' : '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.95)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.8)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
              </button>
            </>
          )}
          
          {/* Indicateurs de position */}
          {totalSlides > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div 
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: index === currentPhotoIndex ? '24px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: index === currentPhotoIndex ? 
                      'linear-gradient(135deg, #3b82f6, #6366f1)' : 
                      'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: index === currentPhotoIndex ? 
                      '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Compteur de photos */}
        {photos.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10
          }}>
            {currentPhotoIndex + 1} / {totalSlides}
          </div>
        )}
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      {/* Input caché pour capture photo */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        multiple
        style={{ display: 'none' }} 
      />

      {/* Section informations de base du permis */}
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div>
            <h2 style={styles.title}>
              {language === 'fr' ? "Permis d'Entrée en Espace Clos" : "Confined Space Entry Permit"}
            </h2>
            <p style={styles.subtitle}>
              {language === 'fr' ? "Conforme aux réglementations canadiennes 2023" : "Compliant with Canadian Regulations 2023"}
            </p>
            {!isMobile && (
              <div style={{ fontSize: '14px', color: '#93c5fd', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield style={{ width: '16px', height: '16px' }} />
                  📍 Province: {PROVINCIAL_REGULATIONS[selectedProvince].name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield style={{ width: '16px', height: '16px' }} />
                  Réglementation: {PROVINCIAL_REGULATIONS[selectedProvince].code}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield style={{ width: '16px', height: '16px' }} />
                  Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>N° Permis</label>
                <div style={{
                  ...styles.input,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: isMobile ? '15px' : '17px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #374151, #4b5563)',
                  border: '1px solid #60a5fa',
                  color: '#e2e8f0'
                }}>
                  {permitData.permit_number}
                </div>
              </div>
              <div>
                <label style={styles.label}>Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value as ProvinceCode)}
                  style={styles.input}
                >
                  {Object.entries(PROVINCIAL_REGULATIONS).map(([code, reg]) => (
                    <option key={code} value={code}>
                      {reg.name} ({code})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                  Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority}
                </div>
              </div>
            </div>
            
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Date d'émission</label>
                <input
                  type="date"
                  value={permitData.issue_date}
                  onChange={(e) => updatePermitData({ issue_date: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => updatePermitData({ issue_time: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Date d'expiration</label>
                <input
                  type="date"
                  value={permitData.expiry_date}
                  onChange={(e) => updatePermitData({ expiry_date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Heure d'expiration</label>
                <input
                  type="time"
                  value={permitData.expiry_time}
                  onChange={(e) => updatePermitData({ expiry_time: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section identification du site */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <MapPin style={{ width: '20px', height: '20px' }} />
          {language === 'fr' ? 'Identification du Site' : 'Site Identification'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Nom du site *</label>
              <input
                type="text"
                placeholder="Ex: Usine Pétrochimique Nord"
                value={permitData.site_name}
                onChange={(e) => updatePermitData({ site_name: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Adresse complète</label>
              <input
                type="text"
                placeholder="Ex: 123 Rue Industrielle, Ville, Province"
                value={permitData.site_address}
                onChange={(e) => updatePermitData({ site_address: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          
          <div>
            <label style={styles.label}>Localisation précise de l'espace clos *</label>
            <input
              type="text"
              placeholder="Ex: Réservoir T-101, Niveau sous-sol, Section B"
              value={permitData.space_location}
              onChange={(e) => updatePermitData({ space_location: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          
          <div>
            <label style={styles.label}>Description de l'espace clos *</label>
            <textarea
              placeholder="Ex: Réservoir cylindrique de 5m de diamètre et 8m de hauteur"
              value={permitData.space_description}
              onChange={(e) => updatePermitData({ space_description: e.target.value })}
              style={{ ...styles.input, height: isMobile ? '80px' : '100px', resize: 'vertical' }}
              required
            />
          </div>
          
          {/* Section QR Code d'identification */}
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            border: '2px solid #4b5563',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h4 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: 'white',
              marginBottom: isMobile ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <QrCode style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              📱 Code QR d'Identification Espace Clos
            </h4>
            
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              border: '1px solid rgba(107, 114, 128, 0.3)'
            }}>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '15px',
                lineHeight: 1.6,
                margin: '0 0 12px 0',
                fontWeight: '600'
              }}>
                📋 <strong>IDENTIFICATION UNIQUE</strong> : Le QR code permet l'identification rapide de l'espace clos et l'accès aux permis existants depuis la base de données Supabase.
              </p>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
                margin: 0,
                fontStyle: 'italic'
              }}>
                🔍 <strong>Consultation historique</strong> : Scannez le code pour consulter tous les permis précédents associés à cet espace clos.
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px',
              alignItems: 'start'
            }}>
              {/* Zone QR Code */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {qrCodeData ? (
                  <div style={{ width: '100%' }}>
                    <img 
                      src={qrCodeData} 
                      alt="QR Code Espace Clos"
                      style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        padding: '8px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                        margin: '0 auto'
                      }}
                    />
                    <div style={{
                      marginTop: '12px',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      QR Code généré pour:<br />
                      <strong style={{ color: '#d1d5db' }}>
                        {permitData.site_name} - {permitData.space_location}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div>
                    <QrCode style={{
                      width: '64px',
                      height: '64px',
                      color: '#6b7280',
                      marginBottom: '16px'
                    }} />
                    <p style={{
                      color: '#9ca3af',
                      fontSize: '14px',
                      margin: 0
                    }}>
                      {isGeneratingQR 
                        ? 'Génération en cours...' 
                        : 'Remplissez les informations du site pour générer le QR code'
                      }
                    </p>
                  </div>
                )}
              </div>
              
              {/* Actions QR Code */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleGenerateQRCode}
                  disabled={isGeneratingQR || !permitData.site_name || !permitData.space_location}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    justifyContent: 'center',
                    fontSize: '14px',
                    opacity: (!permitData.site_name || !permitData.space_location) ? 0.5 : 1,
                    cursor: (!permitData.site_name || !permitData.space_location) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <QrCode style={{ width: '16px', height: '16px' }} />
                  {isGeneratingQR ? 'Génération...' : '🔄 Générer QR Code'}
                </button>
                
                {qrCodeData && (
                  <>
                    <button
                      onClick={downloadQRCode}
                      style={{
                        ...styles.button,
                        ...styles.buttonSuccess,
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}
                    >
                      <Download style={{ width: '16px', height: '16px' }} />
                      📥 Télécharger QR
                    </button>
                    
                    <button
                      onClick={copyQRUrl}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                      📋 Copier URL
                    </button>
                    
                    <button
                      onClick={() => {
                        const spaceIdentifier = generateSpaceIdentifier();
                        if (spaceIdentifier) {
                          window.open(spaceIdentifier.url, '_blank');
                        }
                      }}
                      style={{
                        ...styles.button,
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}
                    >
                      <ExternalLink style={{ width: '16px', height: '16px' }} />
                      🔍 Voir Permis Existants
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Informations sur l'identifiant d'espace */}
            {qrCodeData && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #3b82f6',
                borderRadius: '12px'
              }}>
                <h5 style={{
                  color: '#93c5fd',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🏷️ Identifiant Unique de l'Espace Clos
                </h5>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: '#bfdbfe',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  wordBreak: 'break-all',
                  border: '1px solid rgba(147, 197, 253, 0.3)'
                }}>
                  {generateSpaceIdentifier()?.data.space_id}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '8px'
                }}>
                  Cet identifiant unique permet de retrouver tous les permis associés à cet espace clos dans la base de données.
                </div>
              </div>
            )}
          </div>
          
          {/* Section Photos Carrousel */}
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            border: '2px solid #4b5563',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h4 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: 'white',
              marginBottom: isMobile ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Camera style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              📸 Documentation Photos ({capturedPhotos.length})
            </h4>
            
            {capturedPhotos.length > 0 ? (
              <PhotoCarousel 
                photos={capturedPhotos}
                onAddPhoto={() => handlePhotoCapture('before')}
              />
            ) : (
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                padding: isMobile ? '40px 20px' : '56px 32px',
                textAlign: 'center',
                border: '2px dashed #6b7280',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <Camera style={{ 
                    width: isMobile ? '56px' : '72px', 
                    height: isMobile ? '56px' : '72px', 
                    margin: '0 auto 20px', 
                    color: '#6b7280',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                  }} />
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: isMobile ? '18px' : '20px', 
                    marginBottom: '12px',
                    fontWeight: '600'
                  }}>
                    Aucune photo documentée
                  </p>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: isMobile ? '14px' : '15px',
                    marginBottom: '24px',
                    lineHeight: 1.5,
                    maxWidth: '320px',
                    margin: '0 auto 24px'
                  }}>
                    Ajoutez des photos pour documenter l'espace clos avant, pendant et après l'intervention
                  </p>
                  
                  {/* Boutons d'action photos */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <button 
                      onClick={() => handlePhotoCapture('before')}
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        justifyContent: 'center',
                        fontSize: isMobile ? '15px' : '16px'
                      }}
                    >
                      <Camera style={{ width: '18px', height: '18px' }} />
                      📸 Prendre Photo
                    </button>
                    <button 
                      onClick={() => handlePhotoCapture('before')}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        justifyContent: 'center',
                        fontSize: isMobile ? '15px' : '16px'
                      }}
                    >
                      <Upload style={{ width: '18px', height: '18px' }} />
                      📁 Choisir Fichier
                    </button>
                  </div>
                  
                  {/* Catégories de photos */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: '12px'
                  }}>
                    {[
                      { label: '📋 Avant', color: '#059669', category: 'before' },
                      { label: '⚠️ Pendant', color: '#d97706', category: 'during' },
                      { label: '✅ Après', color: '#0891b2', category: 'after' },
                      { label: '🔧 Équipement', color: '#7c3aed', category: 'equipment' }
                    ].map((categoryItem, index) => (
                      <button
                        key={index}
                        onClick={() => handlePhotoCapture(categoryItem.category as any)}
                        style={{
                          backgroundColor: 'rgba(75, 85, 99, 0.4)',
                          padding: isMobile ? '12px 8px' : '14px 12px',
                          borderRadius: '10px',
                          textAlign: 'center',
                          border: `1px solid ${categoryItem.color}40`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: isMobile ? '13px' : '14px'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = `${categoryItem.color}25`;
                          (e.target as HTMLButtonElement).style.borderColor = `${categoryItem.color}60`;
                          (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(75, 85, 99, 0.4)';
                          (e.target as HTMLButtonElement).style.borderColor = `${categoryItem.color}40`;
                          (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <span style={{
                          color: categoryItem.color,
                          fontWeight: '600'
                        }}>
                          {categoryItem.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label style={styles.label}>Description des travaux à effectuer *</label>
            <textarea
              placeholder="Ex: Inspection visuelle, nettoyage des parois, réparation"
              value={permitData.work_description}
              onChange={(e) => updatePermitData({ work_description: e.target.value })}
              style={{ ...styles.input, height: isMobile ? '80px' : '100px', resize: 'vertical' }}
              required
            />
          </div>
          
          {/* Section Ventilation à Air Forcé */}
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            border: '2px solid #4b5563',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            marginTop: '20px'
          }}>
            <h4 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: 'white',
              marginBottom: isMobile ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Wind style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              💨 Ventilation à Air Forcé (Art. 302 RSST)
            </h4>
            
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              border: '1px solid rgba(107, 114, 128, 0.3)'
            }}>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '15px',
                lineHeight: 1.6,
                margin: '0 0 12px 0',
                fontWeight: '600'
              }}>
                ⚠️ <strong>OBLIGATION RÉGLEMENTAIRE</strong> : L'espace clos doit être ventilé par des moyens mécaniques pour maintenir une atmosphère conforme (O₂: 19,5-23%, LEL ≤10%, contaminants ≤VEMP).
              </p>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
                margin: 0,
                fontStyle: 'italic'
              }}>
                🔧 <strong>Système d'alarme obligatoire</strong> : Un système d'avertissement doit informer immédiatement en cas de défaillance des appareils de ventilation.
              </p>
            </div>
            
            {/* Exigence de ventilation */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id="ventilation_required"
                  checked={permitData.ventilation_required || false}
                  onChange={(e) => updatePermitData({ ventilation_required: e.target.checked })}
                  style={{
                    width: '24px',
                    height: '24px',
                    accentColor: '#3b82f6'
                  }}
                />
                <label 
                  htmlFor="ventilation_required"
                  style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🌪️ <strong>VENTILATION MÉCANIQUE REQUISE</strong> : La ventilation naturelle est insuffisante pour cet espace clos
                </label>
              </div>
            </div>
            
            {permitData.ventilation_required && (
              <>
                {/* Type de ventilation et débit */}
                <div style={styles.grid2}>
                  <div>
                    <label style={{ ...styles.label, color: '#9ca3af' }}>Type de ventilation mécanique *</label>
                    <select
                      value={permitData.ventilation_type || ''}
                      onChange={(e) => updatePermitData({ ventilation_type: e.target.value })}
                      style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
                      required
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="forced_air_supply">💨 Soufflage d'air forcé</option>
                      <option value="extraction_ventilation">🌪️ Ventilation par extraction</option>
                      <option value="combined_system">🔄 Système combiné (soufflage + extraction)</option>
                      <option value="local_extraction">🎯 Aspiration locale à la source</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ ...styles.label, color: '#9ca3af' }}>Débit d'air requis *</label>
                    <select
                      value={permitData.ventilation_flow_rate || ''}
                      onChange={(e) => updatePermitData({ ventilation_flow_rate: e.target.value })}
                      style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
                      required
                    >
                      <option value="">Sélectionner le débit</option>
                      <option value="low_flow">📊 Faible (≤500 CFM)</option>
                      <option value="medium_flow">📈 Moyen (500-1500 CFM)</option>
                      <option value="high_flow">📊 Élevé (1500-3000 CFM)</option>
                      <option value="very_high_flow">🚀 Très élevé (≥3000 CFM)</option>
                      <option value="calculated">🧮 Calculé selon volume</option>
                    </select>
                  </div>
                </div>
                
                {/* Validation système de ventilation */}
                <div style={{ 
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid #10b981'
                }}>
                  <input
                    type="checkbox"
                    id="ventilation_system_validated"
                    checked={permitData.ventilation_system_validated || false}
                    onChange={(e) => updatePermitData({ ventilation_system_validated: e.target.checked })}
                    style={{
                      width: '24px',
                      height: '24px',
                      accentColor: '#10b981'
                    }}
                    required={permitData.ventilation_required}
                  />
                  <label 
                    htmlFor="ventilation_system_validated"
                    style={{
                      color: '#86efac',
                      fontSize: isMobile ? '15px' : '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    ✅ <strong>VALIDATION VENTILATION</strong> : Je certifie que le système de ventilation mécanique est opérationnel avec alarme de défaillance fonctionnelle. {permitData.ventilation_required && '*'}
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteInformation;
