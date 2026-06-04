import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../UI/Icon';
import { Logo } from '../UI/Logo';

export function UserLoginModal({
    isOpen,
    personnel,
    loginForm,
    setLoginForm,
    onLogin,
    onClose
}) {
    const [etapeLogin, setEtapeLogin] = useState('nom'); // 'nom' ou 'password'
    const [utilisateurIdentifie, setUtilisateurIdentifie] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [motDePasseLocal, setMotDePasseLocal] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredPersonnel, setFilteredPersonnel] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Debug: vérifier les données personnel reçues
    useEffect(() => {
        if (personnel && personnel.length > 0) {
        } else {
            console.warn('⚠️ Aucun personnel reçu dans UserLoginModal');
        }
    }, [personnel]);

    // Filtrer le personnel en fonction de la recherche
    useEffect(() => {
        if (personnel && personnel.length > 0) {
            if (!loginForm.nom || loginForm.nom.trim() === '') {
                setFilteredPersonnel(personnel.filter(p => p.visibleChantier !== false));
                setShowDropdown(false);
            } else {
                const searchTerm = normaliserChaine(loginForm.nom);
                const filtered = personnel
                    .filter(p => p.visibleChantier !== false)
                    .filter(p => normaliserChaine(p.nom).includes(searchTerm))
                    .slice(0, 8); // Limiter à 8 résultats
                setFilteredPersonnel(filtered);
                setShowDropdown(filtered.length > 0 && loginForm.nom.length > 0);
            }
        }
    }, [loginForm.nom, personnel]);

    // Réinitialiser à l'ouverture
    useEffect(() => {
        if (isOpen) {
            setEtapeLogin('nom');
            setUtilisateurIdentifie(null);
            setMotDePasseLocal('');
            setShowDropdown(false);
            setLoginForm({ nom: '', motDePasse: '' });
        }
    }, [isOpen, setLoginForm]);

    // Gerer les clics en dehors du dropdown
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

    // Sélectionner un utilisateur depuis la liste
    const selectUser = (user) => {
        setLoginForm({ ...loginForm, nom: user.nom });
        setUtilisateurIdentifie(user);
        setShowDropdown(false);
        // Si aucun mot de passe défini, connexion directe (auth portail suffit)
        if (user.motDePasse) {
            setEtapeLogin('password');
        } else {
            onLogin(user, null);
        }
    };

    // Étape 1: Sélection de l'utilisateur par nom
    const handleNomSubmit = (e) => {
        e.preventDefault();

        if (!loginForm.nom || loginForm.nom.trim() === '') {
            return;
        }

        const nomNormalise = normaliserChaine(loginForm.nom);

        // Chercher l'utilisateur correspondant
        const utilisateurTrouve = personnel.find(p => {
            const nomPersonneNormalise = normaliserChaine(p.nom);
            return nomPersonneNormalise === nomNormalise;
        });

        if (utilisateurTrouve) {
            setUtilisateurIdentifie(utilisateurTrouve);
            setShowDropdown(false);
            if (utilisateurTrouve.motDePasse) {
                setEtapeLogin('password');
            } else {
                onLogin(utilisateurTrouve, null);
            }
        } else {
            console.warn('❌ Utilisateur non trouvé pour:', loginForm.nom);
            alert('Utilisateur non trouvé. Sélectionnez un nom dans la liste ou vérifiez l\'orthographe.');
        }
    };

    // Gérer les touches clavier dans le dropdown
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown' && filteredPersonnel.length > 0) {
            e.preventDefault();
            setShowDropdown(true);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    // Étape 2: Vérification du mot de passe
    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        if (!motDePasseLocal || motDePasseLocal.trim() === '') {
            return;
        }

        // Appeler la fonction parent avec les données
        onLogin(utilisateurIdentifie, motDePasseLocal);
    };

    // Retour à l'étape précédente
    const retourEtapeNom = () => {
        setEtapeLogin('nom');
        setUtilisateurIdentifie(null);
        setMotDePasseLocal('');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Modal avec header noir personnalisé */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] flex flex-col">
                        {/* Header noir comme le principal */}
                        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-gray-900 rounded-t-xl">
                            <div className="flex items-center gap-4">
                                <Logo size="normal" showText={false} />
                                <div>
                                    <h2 className="text-xl font-bold text-white">Connexion C-Secur360</h2>
                                    <p className="text-sm text-gray-300">Version 6.7 - Authentification sécurisée</p>
                                </div>
                            </div>
                        </div>

                        {/* Contenu scrollable */}
                        <div className="flex-1 p-6 overflow-y-auto min-h-0">
                            <div className="space-y-6">

                {/* Étape 1: Sélection nom utilisateur */}
                {etapeLogin === 'nom' && (
                    <form onSubmit={handleNomSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                <Icon name="user" size={16} className="inline mr-2" />
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={loginForm.nom}
                                    onChange={(e) => setLoginForm({ ...loginForm, nom: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setShowDropdown(filteredPersonnel.length > 0 && loginForm.nom.length > 0)}
                                    placeholder="Tapez pour rechercher ou cliquez pour voir la liste..."
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    autoFocus
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!showDropdown && personnel.length > 0) {
                                            setFilteredPersonnel(personnel.filter(p => p.visibleChantier !== false));
                                            setShowDropdown(true);
                                        } else {
                                            setShowDropdown(!showDropdown);
                                        }
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors"
                                >
                                    <Icon name={showDropdown ? "chevronUp" : "chevronDown"} size={20} />
                                </button>
                            </div>

                            {/* Liste déroulante */}
                            {showDropdown && filteredPersonnel.length > 0 && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                                >
                                    {filteredPersonnel.map((person) => (
                                        <button
                                            key={person.id}
                                            type="button"
                                            onClick={() => selectUser(person)}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                {person.nom.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{person.nom}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">{person.poste}</div>
                                                {person.succursale && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{person.succursale}</div>
                                                )}
                                            </div>
                                            <Icon name="chevronRight" size={16} className="text-gray-400 dark:text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Message si aucun résultat */}
                            {showDropdown && filteredPersonnel.length === 0 && loginForm.nom.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 dark:text-gray-400">
                                    Aucun utilisateur trouvé pour "{loginForm.nom}"
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!loginForm.nom}
                            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
                        >
                            Continuer
                            <Icon name="chevronRight" size={20} className="inline ml-2" />
                        </button>
                    </form>
                )}

                {/* Étape 2: Saisie mot de passe */}
                {etapeLogin === 'password' && utilisateurIdentifie && (
                    <div>
                        {/* Utilisateur identifié */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <Icon name="user" size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{utilisateurIdentifie.nom}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{utilisateurIdentifie.poste}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{utilisateurIdentifie.succursale}</p>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire mot de passe */}
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    <Icon name="key" size={16} className="inline mr-2" />
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={motDePasseLocal}
                                        onChange={(e) => setMotDePasseLocal(e.target.value)}
                                        placeholder="Entrez votre mot de passe..."
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                        autoFocus
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors"
                                        title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        <Icon name={showPassword ? "eye_off" : "eye"} size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={retourEtapeNom}
                                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Icon name="chevronLeft" size={20} className="inline mr-2" />
                                    Retour
                                </button>
                                <button
                                    type="submit"
                                    disabled={!motDePasseLocal}
                                    className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                                >
                                    Se connecter
                                    <Icon name="login" size={20} className="inline ml-2" />
                                </button>
                            </div>
                        </form>

                        {/* Note aide */}
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-700">
                                💡 <strong>Aide :</strong> Si vous oubliez votre mot de passe, contactez votre administrateur système.
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer avec version */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 border-t pt-4">
                    C-Secur360 Planificateur V6.7 • {new Date().getFullYear()}
                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}