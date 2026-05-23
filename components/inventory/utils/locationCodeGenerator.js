// ============== GÉNÉRATEUR DE CODES D'EMPLACEMENT ==============
// Génère automatiquement des codes d'emplacement basés sur les rackings

/**
 * Génère le prochain code d'emplacement pour un racking et une tablette
 * @param {string} rackingCode - Code du racking (ex: 'A', 'B')
 * @param {number} shelfNumber - Numéro de la tablette
 * @param {number} counter - Compteur actuel pour cette tablette
 * @returns {string} Code d'emplacement (ex: 'A-1-001')
 */
export const generateLocationCode = (rackingCode, shelfNumber, counter = 1) => {
  const paddedCounter = String(counter).padStart(3, '0');
  return `${rackingCode}-${shelfNumber}-${paddedCounter}`;
};

/**
 * Récupère le prochain numéro disponible pour un racking et une tablette
 * @param {object} department - Le département contenant les rackings
 * @param {string} rackingCode - Code du racking
 * @param {number} shelfNumber - Numéro de la tablette
 * @returns {number} Le prochain numéro disponible
 */
export const getNextLocationNumber = (department, rackingCode, shelfNumber) => {
  if (!department || !department.rackings) return 1;

  const racking = department.rackings.find(r => r.code === rackingCode);
  if (!racking) return 1;

  const key = `${shelfNumber}`;
  const currentCounter = racking.counters && racking.counters[key] ? racking.counters[key] : 0;

  return currentCounter + 1;
};

/**
 * Met à jour le compteur pour un racking et une tablette
 * @param {object} department - Le département contenant les rackings
 * @param {string} rackingCode - Code du racking
 * @param {number} shelfNumber - Numéro de la tablette
 * @returns {object} Département mis à jour
 */
export const incrementLocationCounter = (department, rackingCode, shelfNumber) => {
  if (!department || !department.rackings) return department;

  const updatedRackings = department.rackings.map(racking => {
    if (racking.code === rackingCode) {
      const key = `${shelfNumber}`;
      const counters = { ...racking.counters };
      counters[key] = (counters[key] || 0) + 1;

      return {
        ...racking,
        counters
      };
    }
    return racking;
  });

  return {
    ...department,
    rackings: updatedRackings
  };
};

/**
 * Parse un code d'emplacement pour en extraire les composants
 * @param {string} locationCode - Code d'emplacement (ex: 'A-1-001')
 * @returns {object} Objet avec rackingCode, shelfNumber, itemNumber
 */
export const parseLocationCode = (locationCode) => {
  if (!locationCode || typeof locationCode !== 'string') {
    return null;
  }

  const parts = locationCode.split('-');
  if (parts.length !== 3) {
    return null;
  }

  return {
    rackingCode: parts[0],
    shelfNumber: parseInt(parts[1]),
    itemNumber: parseInt(parts[2])
  };
};

/**
 * Génère le prochain code d'emplacement complet
 * @param {object} department - Le département
 * @param {string} rackingCode - Code du racking
 * @param {number} shelfNumber - Numéro de la tablette
 * @returns {string} Le code d'emplacement complet
 */
export const generateNextLocationCode = (department, rackingCode, shelfNumber) => {
  const nextNumber = getNextLocationNumber(department, rackingCode, shelfNumber);
  return generateLocationCode(rackingCode, shelfNumber, nextNumber);
};
