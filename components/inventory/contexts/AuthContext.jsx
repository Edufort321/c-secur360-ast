// ============== AUTH CONTEXT (PONT HÔTE) ==============
// L'authentification réelle est gérée par l'app hôte (middleware + session + entitlements).
// Ce pont fournit un utilisateur courant pour que le module Inventaire fonctionne,
// sans écran de login propre. (Le LoginScreen d'origine n'est donc jamais rendu.)

'use client';

import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children, user }) {
  const currentUser = user || {
    id: 'host', username: 'admin', name: 'Administrateur', email: '', role: 'admin',
  };

  const value = {
    currentUser,
    isAuthenticated: true,
    isAdmin: currentUser.role === 'admin',
    isAdminMode: currentUser.role === 'admin',
    loading: false,
    users: [currentUser],
    // Actions no-op (gérées par l'hôte)
    login: async () => true,
    logout: () => {},
    loginAdmin: async () => true,
    logoutAdmin: () => {},
    addUser: () => {},
    updateUser: () => {},
    deleteUser: () => {},
    hasPermission: () => true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
