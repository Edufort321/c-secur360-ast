// ============== HOOK GOOGLE DRIVE ==============
// Hook pour la synchronisation avec Google Drive

import { useState, useEffect } from 'react';
import { GOOGLE_CONFIG } from '@/components/planner/config/constants.js';

export function useGoogleDrive() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);

    // Configuration Google Drive - avec fallbacks sécurisés
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || GOOGLE_CONFIG.CLIENT_ID || 'demo-mode';
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || GOOGLE_CONFIG.API_KEY || 'demo-mode';
    const DISCOVERY_DOC = GOOGLE_CONFIG.DISCOVERY_DOC;
    const SCOPES = GOOGLE_CONFIG.SCOPES;
    const DATA_FILE_NAME = GOOGLE_CONFIG.FILENAME;

    // Vérifier si Google Drive est disponible
    const isGoogleDriveAvailable = GOOGLE_CLIENT_ID !== 'demo-mode' && GOOGLE_API_KEY !== 'demo-mode';

    // Initialisation Google API avec gestion d'erreur robuste
    const initializeGoogleAPI = async () => {
        // Si Google Drive n'est pas configuré, ne pas essayer d'initialiser
        if (!isGoogleDriveAvailable) {
            setError('Configuration Google Drive requise');
            setIsInitialized(true); // Marquer comme initialisé pour éviter les boucles
            return;
        }

        // Vérifier que les APIs Google sont chargées
        if (typeof window.gapi === 'undefined' || typeof window.google === 'undefined') {
            console.warn('⚠️ APIs Google non disponibles');
            setError('APIs Google non disponibles');
            setIsInitialized(true);
            return;
        }

        try {

            // Initialiser gapi avec timeout
            const gapiLoaded = await Promise.race([
                new Promise((resolve) => {
                    window.gapi.load('client', resolve);
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout gapi.load')), 5000)
                )
            ]);

            await Promise.race([
                window.gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout gapi.client.init')), 5000)
                )
            ]);

            // Initialiser Google Identity Services
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse.access_token) {
                        setIsAuthenticated(true);
                        setError(null);
                    }
                },
            });

            window.googleTokenClient = tokenClient;
            setIsInitialized(true);

            // Vérifier si l'utilisateur est déjà connecté
            if (window.gapi.client.getToken()) {
                setIsAuthenticated(true);
            }

        } catch (error) {
            console.error('❌ Erreur initialisation Google Drive:', error);
            setError('Google Drive indisponible');
            setIsInitialized(true); // Marquer comme initialisé même en cas d'erreur
        }
    };

    // Connexion Google Drive
    const signIn = () => {
        if (!isGoogleDriveAvailable) {
            setError('Configuration Google Drive requise');
            return;
        }

        if (!isInitialized) {
            setError('Google Drive pas encore initialisé');
            return;
        }

        try {
            if (window.googleTokenClient) {
                window.googleTokenClient.requestAccessToken();
            } else {
                throw new Error('Token client non disponible');
            }
        } catch (error) {
            console.error('❌ Erreur connexion Google Drive:', error);
            setError('Erreur de connexion');
        }
    };

    // Déconnexion Google Drive
    const signOut = () => {
        try {
            const token = window.gapi.client.getToken();
            if (token !== null) {
                window.google.accounts.oauth2.revoke(token.access_token, () => {
                });
                window.gapi.client.setToken(null);
            }
            setIsAuthenticated(false);
            setLastSync(null);
        } catch (error) {
            console.error('❌ Erreur déconnexion Google Drive:', error);
        }
    };

    // Rechercher le fichier de données
    const findDataFile = async () => {
        try {
            const response = await window.gapi.client.drive.files.list({
                q: `name='${DATA_FILE_NAME}' and trashed=false`,
                spaces: 'drive',
                fields: 'files(id, name, modifiedTime)',
            });

            const files = response.result.files;
            return files && files.length > 0 ? files[0] : null;
        } catch (error) {
            console.error('❌ Erreur recherche fichier:', error);
            throw error;
        }
    };

    // Sauvegarder les données sur Google Drive
    const saveToGoogleDrive = async (data) => {
        if (!isAuthenticated) {
            throw new Error('Non connecté à Google Drive');
        }

        setIsSyncing(true);
        setError(null);

        try {

            const dataToSave = {
                ...data,
                lastModified: new Date().toISOString(),
                version: '1.0'
            };

            const existingFile = await findDataFile();

            const metadata = {
                name: DATA_FILE_NAME,
                parents: ['appDataFolder']
            };

            const multipart =
                '--314159265358979323846\n' +
                'Content-Type: application/json\n\n' +
                JSON.stringify(metadata) + '\n' +
                '--314159265358979323846\n' +
                'Content-Type: application/json\n\n' +
                JSON.stringify(dataToSave) + '\n' +
                '--314159265358979323846--';

            const request = existingFile
                ? window.gapi.client.request({
                    path: `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`,
                    method: 'PATCH',
                    params: { uploadType: 'multipart' },
                    headers: { 'Content-Type': 'multipart/related; boundary="314159265358979323846"' },
                    body: multipart
                })
                : window.gapi.client.request({
                    path: 'https://www.googleapis.com/upload/drive/v3/files',
                    method: 'POST',
                    params: { uploadType: 'multipart' },
                    headers: { 'Content-Type': 'multipart/related; boundary="314159265358979323846"' },
                    body: multipart
                });

            await request;
            setLastSync(new Date());

        } catch (error) {
            console.error('❌ Erreur sauvegarde Google Drive:', error);
            setError('Erreur de sauvegarde');
            throw error;
        } finally {
            setIsSyncing(false);
        }
    };

    // Charger les données depuis Google Drive
    const loadFromGoogleDrive = async () => {
        if (!isAuthenticated) {
            return null;
        }

        setIsSyncing(true);
        setError(null);

        try {

            const file = await findDataFile();
            if (!file) {
                return null;
            }

            const response = await window.gapi.client.drive.files.get({
                fileId: file.id,
                alt: 'media'
            });

            const data = JSON.parse(response.body);
            setLastSync(new Date(file.modifiedTime));

            return data;

        } catch (error) {
            console.error('❌ Erreur chargement Google Drive:', error);
            setError('Erreur de chargement');
            return null;
        } finally {
            setIsSyncing(false);
        }
    };

    // Initialisation au montage du composant
    useEffect(() => {
        // Approche défensive pour l'initialisation Google Drive
        const safeInitialize = async () => {
            try {
                // Vérification approfondie de la disponibilité des APIs
                if (typeof window.gapi === 'undefined' || typeof window.google === 'undefined') {
                    console.warn('⚠️ APIs Google non disponibles - fonctionnement en mode local');
                    setError('APIs Google non chargées');
                    setIsInitialized(true);
                    return;
                }

                // Vérifier que les objects gapi et google sont complètement chargés
                if (!window.gapi.load || !window.google.accounts) {
                    console.warn('⚠️ APIs Google incomplètement chargées');
                    setError('APIs Google non prêtes');
                    setIsInitialized(true);
                    return;
                }

                // Si tout est OK, initialiser
                await initializeGoogleAPI();
            } catch (error) {
                console.error('❌ Erreur lors de l\'initialisation sécurisée:', error);
                setError('Erreur d\'initialisation Google Drive');
                setIsInitialized(true);
            }
        };

        // Délai pour s'assurer que les scripts Google sont complètement chargés
        const initTimer = setTimeout(safeInitialize, 100);

        return () => clearTimeout(initTimer);
    }, []);

    return {
        isAuthenticated,
        isInitialized,
        isSyncing,
        lastSync,
        error,
        signIn,
        signOut,
        saveToGoogleDrive,
        loadFromGoogleDrive
    };
}