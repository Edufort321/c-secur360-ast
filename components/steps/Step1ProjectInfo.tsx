import React, { useState } from 'react';

// -- Typages stricts (adaptés, à compléter selon tes types réels) --
interface WorkLocation {
  name: string;
}
interface LockoutPoint {
  name: string;
}
interface FormDataType {
  workLocations: WorkLocation[];
  lockoutPoints: LockoutPoint[];
}
interface Step1ProjectInfoProps {
  formData: FormDataType;
  onDataChange: (data: FormDataType) => void;
  errors: Record<string, string>;
}

const Step1ProjectInfo: React.FC<Step1ProjectInfoProps> = ({ formData, onDataChange, errors }) => {
  // Etat local pour la saisie en cours dans les modaux
  const [newLocation, setNewLocation] = useState<string>('');
  const [newLockout, setNewLockout] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isLockoutModalOpen, setIsLockoutModalOpen] = useState<boolean>(false);

  // Ajout emplacement sans éjecter la saisie
  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const updated = {
        ...formData,
        workLocations: [...formData.workLocations, { name: newLocation }],
      };
      onDataChange(updated);
      setNewLocation('');
      setIsLocationModalOpen(false);
    }
  };
  // Ajout LOTO sans éjecter la saisie
  const handleAddLockout = () => {
    if (newLockout.trim()) {
      const updated = {
        ...formData,
        lockoutPoints: [...formData.lockoutPoints, { name: newLockout }],
      };
      onDataChange(updated);
      setNewLockout('');
      setIsLockoutModalOpen(false);
    }
  };

  return (
    <div>
      <h3>Emplacements</h3>
      <button onClick={() => setIsLocationModalOpen(true)}>Ajouter emplacement</button>
      {isLocationModalOpen && (
        <div className="modal">
          <input
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
            placeholder="Nom de l'emplacement"
          />
          <button onClick={handleAddLocation}>Ajouter</button>
          <button onClick={() => setIsLocationModalOpen(false)}>Annuler</button>
        </div>
      )}
      <ul>
        {formData.workLocations?.map((loc, idx) => (
          <li key={idx}>{loc.name}</li>
        ))}
      </ul>

      <h3>Points de verrouillage LOTO</h3>
      <button onClick={() => setIsLockoutModalOpen(true)}>Ajouter verrouillage</button>
      {isLockoutModalOpen && (
        <div className="modal">
          <input
            value={newLockout}
            onChange={e => setNewLockout(e.target.value)}
            placeholder="Nom du point LOTO"
          />
          <button onClick={handleAddLockout}>Ajouter</button>
          <button onClick={() => setIsLockoutModalOpen(false)}>Annuler</button>
        </div>
      )}
      <ul>
        {formData.lockoutPoints?.map((pt, idx) => (
          <li key={idx}>{pt.name}</li>
        ))}
      </ul>

      {/* Gestion des erreurs example */}
      {errors.workLocations && <p style={{color:'red'}}>{errors.workLocations}</p>}
      {errors.lockoutPoints && <p style={{color:'red'}}>{errors.lockoutPoints}</p>}
    </div>
  );
};

export default Step1ProjectInfo;
