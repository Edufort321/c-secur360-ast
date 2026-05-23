// ============== SÉLECTEUR D'EMPLACEMENT ==============
// Composant pour sélectionner un emplacement et saisir tablette/espace manuellement

import React, { useState, useEffect } from 'react';
import { MapPin, Package } from 'lucide-react';

export const LocationSelector = ({
  department,
  storageUnits = [],
  value,
  onChange,
  onDepartmentUpdate,
  className = ''
}) => {
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [manualMode, setManualMode] = useState(false);

  // Filtrer les emplacements de stockage pour cette succursale
  const departmentStorages = storageUnits.filter(unit => unit.departmentId === department?.id) || [];

  // Récupérer l'emplacement de stockage sélectionné
  const selectedStorageUnit = React.useMemo(() => {
    return departmentStorages.find(unit => unit.code === selectedStorage || unit.id === selectedStorage);
  }, [selectedStorage, departmentStorages]);

  // Générer le code automatique quand emplacement, tablette et espace sont remplis
  useEffect(() => {
    if (selectedStorage && selectedShelf && selectedSpace && !manualMode) {
      const storageCode = selectedStorageUnit?.code || selectedStorageUnit?.name || selectedStorage;
      const code = `${storageCode}-${selectedShelf}-${selectedSpace}`;
      setGeneratedCode(code);
      onChange(code);
    }
  }, [selectedStorage, selectedShelf, selectedSpace, selectedStorageUnit, manualMode, onChange]);

  // Si on a déjà un code en value, parser et initialiser
  useEffect(() => {
    if (value && !selectedStorage && !manualMode) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setSelectedStorage(parts[0]);
        setSelectedShelf(parts[1]);
        setSelectedSpace(parts[2]);
        setGeneratedCode(value);
      }
    }
  }, [value, selectedStorage, manualMode]);

  const handleStorageChange = (e) => {
    const storageId = e.target.value;
    setSelectedStorage(storageId);
    setSelectedShelf(''); // Reset shelf when storage changes
    setSelectedSpace(''); // Reset space when storage changes
    setGeneratedCode('');
  };

  const handleManualCodeChange = (e) => {
    const code = e.target.value;
    onChange(code);
  };

  const toggleManualMode = () => {
    setManualMode(!manualMode);
    if (!manualMode) {
      // Switching to manual mode
      setSelectedStorage('');
      setSelectedShelf('');
      setSelectedSpace('');
      setGeneratedCode('');
    }
  };

  if (!department) {
    return (
      <div className={className}>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
          placeholder="Ex: A-1-1"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          <MapPin className="inline-block mr-1" size={14} />
          Emplacement
        </label>
        <button
          type="button"
          onClick={toggleManualMode}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {manualMode ? 'Mode sélection' : 'Mode manuel'}
        </button>
      </div>

      {manualMode ? (
        // Mode manuel complet
        <div>
          <input
            type="text"
            value={value || ''}
            onChange={handleManualCodeChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
            placeholder="Ex: A-1-1, B-2-3..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: Emplacement-Tablette-Espace
          </p>
        </div>
      ) : (
        // Mode assisté (sélection + saisie manuelle)
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {/* Sélection de l'Emplacement */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Unité
              </label>
              <select
                value={selectedStorage}
                onChange={handleStorageChange}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              >
                <option value="">--</option>
                {departmentStorages.map(storage => (
                  <option key={storage.id} value={storage.id}>
                    {storage.code || storage.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Saisie Tablette */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Tablette
              </label>
              <input
                type="text"
                value={selectedShelf}
                onChange={(e) => {
                  const val = e.target.value;
                  // Accepter seulement des chiffres
                  if (val === '' || /^\d+$/.test(val)) {
                    setSelectedShelf(val);
                  }
                }}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
                placeholder=""
              />
              {selectedStorageUnit && selectedStorageUnit.numberOfShelves > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  1-{selectedStorageUnit.numberOfShelves}
                </p>
              )}
            </div>

            {/* Saisie Espace */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Espace
              </label>
              <input
                type="text"
                value={selectedSpace}
                onChange={(e) => {
                  const val = e.target.value;
                  // Accepter seulement des chiffres
                  if (val === '' || /^\d+$/.test(val)) {
                    setSelectedSpace(val);
                  }
                }}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
                placeholder=""
              />
              {selectedStorageUnit && selectedStorageUnit.numberOfSpaces > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  1-{selectedStorageUnit.numberOfSpaces}
                </p>
              )}
            </div>
          </div>

          {/* Code généré */}
          {generatedCode && (
            <div className="px-2 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <div className="flex items-center gap-2">
                <Package size={12} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">
                  Code:
                </span>
                <code className="text-xs font-bold text-green-700 dark:text-green-400">
                  {generatedCode}
                </code>
              </div>
            </div>
          )}

          {departmentStorages.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Aucun emplacement configuré - utilisez le mode manuel.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
