'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ArrowRightLeft,
  Settings,
  Camera,
  MapPin,
  AlertTriangle,
  Package,
  FileText
} from 'lucide-react';
import type {
  InventoryItem,
  InventoryInstance,
  InventoryLocation,
  StockMovementRequest
} from '@/app/types/inventory';
import { 
  recordStockMovement, 
  validateProjectRequired 
} from '@/lib/inventory-utils';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  item: InventoryItem | null;
  instance: InventoryInstance | null;
  movementType: 'issue' | 'receive' | 'adjust' | 'transfer';
}

interface Project {
  id: string;
  name: string;
  code: string;
}

export default function StockMovementModal({
  isOpen,
  onClose,
  onComplete,
  item,
  instance,
  movementType
}: StockMovementModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // Localisation
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [fromLocationId, setFromLocationId] = useState<string>('');
  
  // Projet/Tâche
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [billingCode, setBillingCode] = useState<string>('');
  const [projectRequired, setProjectRequired] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
    }
  }, [isOpen, movementType]);

  const resetForm = () => {
    setQuantity(1);
    setNote('');
    setPhoto(null);
    setPhotoPreview('');
    setSelectedLocationId('');
    setFromLocationId('');
    setSelectedProjectId('');
    setTaskId('');
    setBillingCode('');
    setError('');
  };

  const loadInitialData = async () => {
    try {
      // Charger les emplacements (simulation)
      setLocations([
        { id: '1', client_id: 'client1', site_id: 'site1', name: 'Entrepôt principal', code: 'WH01', location_type: 'storage', temperature_controlled: false, outdoor: false, created_at: '' },
        { id: '2', client_id: 'client1', site_id: 'site1', name: 'Zone expédition', code: 'SHIP', location_type: 'shipping', temperature_controlled: false, outdoor: false, created_at: '' },
        { id: '3', client_id: 'client1', site_id: 'site1', name: 'Réception', code: 'REC', location_type: 'receiving', temperature_controlled: false, outdoor: false, created_at: '' }
      ]);

      // Charger les projets (simulation)
      setProjects([
        { id: 'proj1', name: 'Projet Alpha', code: 'ALPHA' },
        { id: 'proj2', name: 'Maintenance Q4', code: 'MAINT-Q4' },
        { id: 'proj3', name: 'Installation Beta', code: 'BETA' }
      ]);

      // Vérifier si projet requis pour les sorties
      if (item && movementType === 'issue') {
        const required = await validateProjectRequired(item.client_id, 'issue');
        setProjectRequired(!required);
      }

      // Pré-remplir l'emplacement source pour les transferts
      if (movementType === 'transfer') {
        if (instance?.location_id) {
          setFromLocationId(instance.location_id);
        } else if (item?.default_location_id) {
          setFromLocationId(item.default_location_id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    
    setError('');
    setLoading(true);

    try {
      // Validation
      if (movementType === 'transfer' && !fromLocationId) {
        throw new Error('Emplacement source requis pour le transfert');
      }
      
      if ((movementType === 'transfer' || movementType === 'receive') && !selectedLocationId) {
        throw new Error('Emplacement destination requis');
      }
      
      if (projectRequired && !selectedProjectId) {
        throw new Error('Projet requis pour les sorties');
      }

      // Calculer le delta selon le type de mouvement
      let delta = quantity;
      let reason: StockMovementRequest['reason'] = 'adjust';
      
      switch (movementType) {
        case 'issue':
          delta = -Math.abs(quantity);
          reason = 'issue';
          break;
        case 'receive':
          delta = Math.abs(quantity);
          reason = 'receipt';
          break;
        case 'transfer':
          delta = Math.abs(quantity);
          reason = 'transfer';
          break;
        case 'adjust':
          // Delta peut être positif ou négatif pour ajustement
          reason = 'adjust';
          break;
      }

      const request: StockMovementRequest = {
        item_id: item.id,
        instance_id: instance?.id,
        location_id: selectedLocationId || undefined,
        location_from_id: movementType === 'transfer' ? fromLocationId : undefined,
        delta,
        reason,
        project_id: selectedProjectId || undefined,
        task_id: taskId || undefined,
        billing_code: billingCode || undefined,
        note: note || undefined,
        photo: photo || undefined
      };

      const result = await recordStockMovement(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du mouvement de stock');
      }

      // Succès
      onComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (movementType) {
      case 'issue': return 'Sortie de stock';
      case 'receive': return 'Entrée de stock';
      case 'transfer': return 'Transfert de stock';
      case 'adjust': return 'Ajustement de stock';
      default: return 'Mouvement de stock';
    }
  };

  const getModalIcon = () => {
    switch (movementType) {
      case 'issue': return <Minus className="w-6 h-6 text-red-600" />;
      case 'receive': return <Plus className="w-6 h-6 text-green-600" />;
      case 'transfer': return <ArrowRightLeft className="w-6 h-6 text-blue-600" />;
      case 'adjust': return <Settings className="w-6 h-6 text-yellow-600" />;
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              {getModalIcon()}
              <div>
                <h3 className="text-lg font-semibold">{getModalTitle()}</h3>
                <p className="text-sm text-gray-600">
                  {instance ? instance.instance_code : item.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center text-lg font-semibold border rounded-lg px-3 py-2"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Unité: {item.uom}</p>
            </div>

            {/* Locations */}
            {(movementType === 'transfer' || movementType === 'receive') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Emplacement destination
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Sélectionner un emplacement</option>
                  {locations
                    .filter(loc => loc.id !== fromLocationId)
                    .map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {movementType === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emplacement source
                </label>
                <select
                  value={fromLocationId}
                  onChange={(e) => setFromLocationId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Sélectionner l'emplacement source</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Project (if required) */}
            {(projectRequired || selectedProjectId) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Projet {projectRequired && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required={projectRequired}
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Task ID & Billing Code */}
            {selectedProjectId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Tâche
                  </label>
                  <input
                    type="text"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    placeholder="ex: T-001"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code facturation
                  </label>
                  <input
                    type="text"
                    value={billingCode}
                    onChange={(e) => setBillingCode(e.target.value)}
                    placeholder="ex: MAINT"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Note (optionnel)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Raison du mouvement, contexte..."
                rows={3}
                className="w-full border rounded-lg px-3 py-2 resize-none"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-1" />
                Photo (optionnel)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Traitement...
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}