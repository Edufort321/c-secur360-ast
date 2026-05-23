// ============== GÉNÉRATEUR DE MOT DE PASSE AUTOMATIQUE ==============
// Génère un mot de passe selon le format: 3 chiffres + 1 lettre prénom + 2 lettres nom + 1 caractère spécial
// Exemple: Éric Dufort → 321Edu!

/**
 * Retire les accents d'une chaîne de caractères
 */
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Génère un mot de passe automatique selon le format C-Secur360
 * @param {string} firstName - Prénom de l'utilisateur
 * @param {string} lastName - Nom de famille de l'utilisateur
 * @returns {string} Mot de passe généré
 *
 * Format: 3 chiffres + 1 lettre prénom + 2 lettres nom + 1 caractère spécial
 * Exemple: Éric Dufort → 321Edu!
 */
export function generatePassword(firstName, lastName) {
  // Nettoyer et normaliser les entrées
  const cleanFirstName = removeAccents(firstName.trim());
  const cleanLastName = removeAccents(lastName.trim());

  // Validation
  if (!cleanFirstName || !cleanLastName) {
    throw new Error('Le prénom et le nom sont requis');
  }

  if (cleanFirstName.length < 1) {
    throw new Error('Le prénom doit contenir au moins 1 caractère');
  }

  if (cleanLastName.length < 2) {
    throw new Error('Le nom doit contenir au moins 2 caractères');
  }

  // 1. Générer 3 chiffres aléatoires (100-999)
  const randomNumbers = Math.floor(Math.random() * 900) + 100; // 100 à 999

  // 2. Première lettre du prénom (majuscule)
  const firstNameLetter = cleanFirstName.charAt(0).toUpperCase();

  // 3. Deux premières lettres du nom (minuscules)
  const lastNameLetters = cleanLastName.substring(0, 2).toLowerCase();

  // 4. Caractère spécial aléatoire
  const specialChars = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?'];
  const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];

  // Assembler le mot de passe
  const password = `${randomNumbers}${firstNameLetter}${lastNameLetters}${randomSpecialChar}`;

  return password;
}

/**
 * Génère un username à partir du prénom et nom
 * Format: première lettre prénom + nom (tout en minuscules, sans accents)
 * Exemple: Éric Dufort → edufort
 */
export function generateUsername(firstName, lastName) {
  const cleanFirstName = removeAccents(firstName.trim());
  const cleanLastName = removeAccents(lastName.trim());

  if (!cleanFirstName || !cleanLastName) {
    throw new Error('Le prénom et le nom sont requis');
  }

  const username = (cleanFirstName.charAt(0) + cleanLastName).toLowerCase();
  return username;
}

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {object} { isValid: boolean, strength: string, issues: string[] }
 */
export function validatePasswordStrength(password) {
  const issues = [];
  let strength = 'weak';

  if (!password || password.length < 6) {
    issues.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[!@#$%&*+=?]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  if (!hasNumber) issues.push('Doit contenir au moins un chiffre');
  if (!hasLetter) issues.push('Doit contenir au moins une lettre');
  if (!hasSpecial) issues.push('Doit contenir au moins un caractère spécial');

  const criteriaCount = [hasNumber, hasLetter, hasSpecial, hasUpperCase, hasLowerCase].filter(Boolean).length;

  if (criteriaCount >= 4 && password.length >= 8) {
    strength = 'strong';
  } else if (criteriaCount >= 3 && password.length >= 6) {
    strength = 'medium';
  }

  return {
    isValid: issues.length === 0,
    strength,
    issues
  };
}

/**
 * Génère plusieurs suggestions de mots de passe
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom
 * @param {number} count - Nombre de suggestions (défaut: 3)
 * @returns {string[]} Liste de mots de passe générés
 */
export function generatePasswordSuggestions(firstName, lastName, count = 3) {
  const suggestions = [];

  for (let i = 0; i < count; i++) {
    suggestions.push(generatePassword(firstName, lastName));
  }

  return suggestions;
}

export default {
  generatePassword,
  generateUsername,
  validatePasswordStrength,
  generatePasswordSuggestions
};
