// ============== ÉCRAN DE CONNEXION ==============
// Page de login en amont de l'application, style Planificateur C-Secur360

import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Eye, EyeOff, User, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { Logo } from '../UI/Logo';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen = () => {
  const { login, loading, users } = useAuth();

  // États pour le flow en 2 étapes
  const [etapeLogin, setEtapeLogin] = useState('nom'); // 'nom' ou 'password'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [utilisateurIdentifie, setUtilisateurIdentifie] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState('');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Normaliser les chaînes pour la comparaison (enlever accents, casse, espaces)
  const normaliserChaine = (chaine) => {
    if (!chaine) return '';
    return chaine
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // enlever accents
      .replace(/\s+/g, ' ') // normaliser espaces
      .trim();
  };

  // Filtrer les utilisateurs en fonction de la recherche (dès la première lettre)
  useEffect(() => {
    if (users && users.length > 0) {
      if (!username || username.trim() === '') {
        setFilteredUsers(users);
        setShowDropdown(false);
      } else {
        const searchTerm = normaliserChaine(username);
        const filtered = users
          .filter(u => {
            const usernameNorm = normaliserChaine(u.username);
            const firstNameNorm = normaliserChaine(u.firstName);
            const lastNameNorm = normaliserChaine(u.lastName);
            const fullNameNorm = normaliserChaine(u.firstName + ' ' + u.lastName);

            return usernameNorm.includes(searchTerm) ||
                   firstNameNorm.includes(searchTerm) ||
                   lastNameNorm.includes(searchTerm) ||
                   fullNameNorm.includes(searchTerm);
          })
          .slice(0, 8); // Limiter à 8 résultats
        setFilteredUsers(filtered);
        // Afficher dès la première lettre tapée
        setShowDropdown(filtered.length > 0);
      }
    }
  }, [username, users]);

  // Gérer les clics en dehors du dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sélectionner un utilisateur depuis la liste
  const selectUser = (user) => {
    setUsername(user.username);
    setUtilisateurIdentifie(user);
    setShowDropdown(false);
    setEtapeLogin('password');
    setError('');
  };

  // Étape 1: Sélection de l'utilisateur par nom
  const handleNomSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || username.trim() === '') {
      return;
    }

    const searchNormalise = normaliserChaine(username);

    // Chercher l'utilisateur correspondant (username exact ou nom complet)
    const utilisateurTrouve = users.find(u => {
      const usernameNorm = normaliserChaine(u.username);
      const fullNameNorm = normaliserChaine(u.firstName + ' ' + u.lastName);
      const reverseNameNorm = normaliserChaine(u.lastName + ' ' + u.firstName);

      return usernameNorm === searchNormalise ||
             fullNameNorm === searchNormalise ||
             reverseNameNorm === searchNormalise;
    });

    if (utilisateurTrouve) {
      setUtilisateurIdentifie(utilisateurTrouve);
      setEtapeLogin('password');
      setShowDropdown(false);
    } else {
      setError('Utilisateur non trouvé. Sélectionnez un nom dans la liste ou vérifiez l\'orthographe.');
    }
  };

  // Étape 2: Vérification du mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.trim() === '') {
      return;
    }

    const result = await login(utilisateurIdentifie.username, password);

    if (!result || !result.success) {
      setError(result?.error || 'Mot de passe incorrect');
      setPassword(''); // Vider le mot de passe en cas d'erreur
    }
  };

  // Retour à l'étape précédente
  const retourEtapeNom = () => {
    setEtapeLogin('nom');
    setUtilisateurIdentifie(null);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-700/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Conteneur principal */}
      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Carte de login */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header navy comme le Planificateur */}
          <div className="flex items-center justify-between p-6 bg-gray-900">
            <div className="flex items-center gap-4">
              <Logo size="normal" showText={false} />
              <div>
                <h2 className="text-xl font-bold text-white">Connexion C-Secur360</h2>
                <p className="text-sm text-gray-300">Gestion d'Inventaire - Authentification sécurisée</p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Étape 1: Sélection nom utilisateur */}
            {etapeLogin === 'nom' && (
              <form onSubmit={handleNomSubmit} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <User size={16} className="inline mr-2" />
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setShowDropdown(filteredUsers.length > 0 && username.length > 0)}
                      placeholder="Tapez pour rechercher ou cliquez pour voir la liste..."
                      className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      autoFocus
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!showDropdown && users.length > 0) {
                          setFilteredUsers(users);
                          setShowDropdown(true);
                        } else {
                          setShowDropdown(!showDropdown);
                        }
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* Liste déroulante */}
                  {showDropdown && filteredUsers.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUser(user)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {user.role === 'admin' ? 'Administrateur' :
                               user.role === 'manager' ? 'Gestionnaire' :
                               user.role === 'technician' ? 'Technicien' : 'Visualisation'}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message si aucun résultat */}
                  {showDropdown && filteredUsers.length === 0 && username.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 dark:text-gray-400">
                      Aucun utilisateur trouvé pour "{username}"
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!username}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight size={20} />
                </button>
              </form>
            )}

            {/* Étape 2: Saisie mot de passe */}
            {etapeLogin === 'password' && utilisateurIdentifie && (
              <div>
                {/* Utilisateur identifié */}
                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-600 dark:border-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mr-3">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {utilisateurIdentifie.firstName} {utilisateurIdentifie.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{utilisateurIdentifie.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {utilisateurIdentifie.role === 'admin' ? 'Administrateur' :
                         utilisateurIdentifie.role === 'manager' ? 'Gestionnaire' :
                         utilisateurIdentifie.role === 'technician' ? 'Technicien' : 'Visualisation'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulaire mot de passe */}
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={retourEtapeNom}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={20} />
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={!password || loading}
                      className="flex-1 py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Connexion...
                        </>
                      ) : (
                        <>
                          Se connecter
                          <LogIn size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Footer avec version */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
              C-Secur360 Gestion d'Inventaire • {new Date().getFullYear()} • Session 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
