'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, X, Flashlight, RotateCcw, AlertCircle } from 'lucide-react';
import { parseQRCode, type QRScanResult } from '@/lib/inventory-utils';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: QRScanResult) => void;
  title?: string;
}

export default function QRScanner({ 
  isOpen, 
  onClose, 
  onScan,
  title = "Scanner QR Code"
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, facingMode]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Vérifier les permissions caméra
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (permission.state === 'denied') {
        throw new Error('Permission caméra refusée');
      }

      // Obtenir les devices vidéo
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('Aucune caméra détectée');
      }

      // Configuration de la caméra
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        }
      };

      // Obtenir le stream vidéo
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Vérifier support flashlight
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      setHasFlashlight(!!capabilities?.torch);

      // Initialiser le reader ZXing
      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      // Démarrer le scan
      const videoElement = videoRef.current;
      if (videoElement) {
        codeReader.current.decodeFromVideoDevice(
          undefined,
          videoElement,
          (result, error) => {
            if (result) {
              const qrResult = parseQRCode(result.getText());
              onScan(qrResult);
              if (qrResult.success) {
                stopScanning();
                onClose();
              }
            }
            // Ignorer les erreurs de scan (pas de QR détecté)
          }
        );
      }
    } catch (err) {
      console.error('Erreur démarrage scanner:', err);
      setError(err instanceof Error ? err.message : 'Erreur de scan');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setFlashlightOn(false);
  };

  const toggleFlashlight = async () => {
    if (!streamRef.current || !hasFlashlight) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !flashlightOn } as any]
      });
      setFlashlightOn(!flashlightOn);
    } catch (err) {
      console.error('Erreur flashlight:', err);
    }
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    stopScanning();
  };

  const handleRetry = () => {
    setError(null);
    startScanning();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative w-full h-full">
        {isScanning && !error ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Overlay de scan */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Zone de scan */}
                <div className="relative w-64 h-64 border-2 border-white/50">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                  
                  {/* Ligne de scan animée */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="absolute bottom-32 left-0 right-0 text-center text-white">
                  <p className="text-lg font-medium">Centrez le QR code dans le carré</p>
                  <p className="text-sm opacity-75 mt-1">Le scan se fera automatiquement</p>
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Erreur de scan</h3>
            <p className="text-center text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Démarrage de la caméra...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {isScanning && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 p-4">
          <div className="flex items-center justify-center gap-4">
            {/* Flashlight */}
            {hasFlashlight && (
              <button
                onClick={toggleFlashlight}
                className={`p-4 rounded-full transition-colors ${
                  flashlightOn 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Flashlight className="w-6 h-6" />
              </button>
            )}
            
            {/* Switch Camera */}
            <button
              onClick={switchCamera}
              className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center text-white/75 text-sm mt-2">
            <p>Appuyez sur le bouton retour pour annuler</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook pour utiliser le scanner
export function useQRScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastResult, setLastResult] = useState<QRScanResult | null>(null);

  const openScanner = () => setIsOpen(true);
  const closeScanner = () => setIsOpen(false);
  
  const handleScan = (result: QRScanResult) => {
    setLastResult(result);
  };

  return {
    isOpen,
    openScanner,
    closeScanner,
    handleScan,
    lastResult,
    clearResult: () => setLastResult(null)
  };
}