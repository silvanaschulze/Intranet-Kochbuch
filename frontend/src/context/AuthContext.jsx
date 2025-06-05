/**
 * @fileoverview Authentifizierungskontext für die Verwaltung des Benutzerstatus
 * @module AuthContext
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {string} id - Benutzer-ID
 * @property {string} name - Benutzername
 * @property {string} email - E-Mail-Adresse des Benutzers
 * @property {string} [profilbild] - URL des Profilbilds
 * @property {string} [beschreibung] - Profilbeschreibung
 * @property {string} [rolle] - Benutzerrolle
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user - Aktuell eingeloggter Benutzer
 * @property {boolean} isAuthenticated - Authentifizierungsstatus
 * @property {boolean} loading - Gibt an, ob die Authentifizierung initialisiert wird
 * @property {Function} login - Funktion zum Einloggen
 * @property {Function} register - Funktion zum Registrieren
 * @property {Function} logout - Funktion zum Ausloggen
 * @property {Function} updateUser - Funktion zum Aktualisieren der Benutzerdaten
 * @property {Function} requestPasswordReset - Funktion zum Anfordern eines Passwort-Reset
 * @property {Function} validateResetToken - Funktion zum Überprüfen eines Reset-Tokens
 * @property {Function} resetPassword - Funktion zum Zurücksetzen des Passworts
 */

/**
 * Authentifizierungskontext
 * @type {React.Context<AuthContextType>}
 */
const AuthContext = createContext(null);

/**
 * Hook für den Zugriff auf den Authentifizierungskontext
 * @returns {AuthContextType} Authentifizierungskontext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
  }
  return context;
};

/**
 * AuthProvider Komponente
 * Stellt Authentifizierungsfunktionalität für die Anwendung bereit
 * 
 * @param {Object} props - Komponenteneigenschaften
 * @param {React.ReactNode} props.children - Kindkomponenten
 * @returns {JSX.Element} Die gerenderte AuthProvider Komponente
 */
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🔄 AuthContext Init: Usuário carregado do localStorage:', userData);
        return userData;
      } catch (error) {
        console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const hasUser = !!localStorage.getItem('user');
    const authenticated = !!(token && hasUser);
    console.log('🔄 AuthContext Init: Authentifizierung:', { token: !!token, hasUser, authenticated });
    return authenticated;
  });

  // Neuer Zustand für Nachrichten über abgelaufene Sitzung
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');
  
  const navigate = useNavigate();

  /**
   * Initialize API token on startup
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ API Token initialized from localStorage');
    }
  }, [user]);

  /**
   * Listener para evento de token expirado
   */
  useEffect(() => {
    const handleTokenExpired = (event) => {
      console.log('🔑 Evento de token expirado recebido no AuthContext');
      setSessionExpiredMessage(event.detail.message);
      
      // Authentifizierungszustand löschen
      setUser(null);
      setIsAuthenticated(false);
      
      // Remove token from API headers
      delete api.defaults.headers.common['Authorization'];
      
      // Nachricht nach einigen Sekunden löschen
      setTimeout(() => {
        setSessionExpiredMessage('');
      }, 5000);
    };

    // Listener hinzufügen
    window.addEventListener('auth:token-expired', handleTokenExpired);

    // Aufräumen
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  /**
   * Führt den Logout-Prozess durch
   */
  const logout = useCallback(() => {
    console.log('🔄 Logout wird ausgeführt');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpiredMessage(''); // Sitzungs-abgelaufen-Nachricht löschen
    
    console.log('✅ Logout erfolgreich');
    navigate('/login');
  }, [navigate]);

  /**
   * Aktualisiert die Benutzerdaten im State und localStorage
   * @param {User} updatedUser - Aktualisierte Benutzerdaten
   */
  const updateUser = useCallback((updatedUser) => {
    console.log('🔄 Benutzer-Update:', updatedUser);
    
    setUser(prevUser => {
      const newUserData = { ...prevUser, ...updatedUser };
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      console.log('✅ Benutzer-State aktualisiert:', newUserData);
      return newUserData;
    });
  }, []);

  /**
   * Prüft beim Laden der Komponente, ob ein gültiger Token existiert
   * und lädt die Benutzerdaten aus dem localStorage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Authentifizierung wird initialisiert...');
      
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && !savedUser) {
        // Wenn Token vorhanden aber keine Benutzerdaten, Logout durchführen
        console.log('⚠️ Token ohne Benutzerdaten - Logout');
        logout();
      } else if (!token && savedUser) {
        // Wenn Benutzerdaten vorhanden aber kein Token, Logout durchführen
        console.log('⚠️ Benutzerdaten ohne Token - Logout');
        logout();
      } else if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('✅ Authentifizierung wiederhergestellt:', userData);
        } catch (error) {
          console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
          logout();
        }
      } else {
        console.log('💡 Keine gespeicherte Authentifizierung gefunden');
      }
      
      // Ladevorgang als abgeschlossen markieren
      setLoading(false);
      console.log('✅ Authentifizierungs-Initialisierung abgeschlossen');
    };

    initializeAuth();
  }, [logout]);

  /**
   * Führt den Login-Prozess durch
   * @async
   * @param {string} email - E-Mail-Adresse des Benutzers
   * @param {string} password - Passwort des Benutzers
   * @returns {Promise<boolean>} True bei erfolgreichem Login
   * @throws {Error} Bei fehlerhaften Anmeldedaten oder Verbindungsproblemen
   */
  const login = async (email, password) => {
    try {
      console.log('🔄 Login-Versuch für:', email);
      
      const response = await api.post('/api/benutzer/login', {
        email,
        passwort: password
      });
      
      if (!response.data || !response.data.token || !response.data.benutzer) {
        throw new Error('Ungültige Antwort vom Server');
      }

      const { token, benutzer } = response.data;
      
      // Prepare user data including profile image
      const userData = {
        id: benutzer.id,
        name: benutzer.name,
        email: benutzer.email,
        profilbild: benutzer.profilbild,  // Include profile image
        beschreibung: benutzer.beschreibung,
        rolle: benutzer.rolle || 'benutzer'
      };

      console.log('✅ Login erfolgreich:', {
        token: token ? token.substring(0, 20) + '...' : 'none',
        userData
      });

      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set API authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Abgelaufene Sitzungsnachricht bei erfolgreichem Login löschen
      setSessionExpiredMessage('');
      
      navigate('/rezepte');
      return true;
    } catch (error) {
      console.error('❌ Login-Fehler:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Ungültige E-Mail oder Passwort';
            break;
          case 400:
            errorMessage = 'Bitte geben Sie eine gültige E-Mail und ein Passwort ein';
            break;
          case 500:
            errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Führt den Registrierungsprozess durch
   * @async
   * @param {string} name - Name des Benutzers
   * @param {string} email - E-Mail-Adresse des Benutzers
   * @param {string} password - Passwort des Benutzers
   * @returns {Promise<boolean>} True bei erfolgreicher Registrierung
   * @throws {Error} Bei ungültigen Registrierungsdaten
   */
  const register = async (name, email, password) => {
    try {
      console.log('🔄 Registrierung für:', { name, email });
      
      const response = await api.post('/api/benutzer/register', {
        name,
        email,
        passwort: password
      });
      
      if (!response.data || !response.data.token || !response.data.benutzer) {
        throw new Error('Ungültige Antwort vom Server');
      }

      const { token, benutzer } = response.data;
      
      const userData = {
        id: benutzer.id,
        name: benutzer.name,
        email: benutzer.email,
        profilbild: benutzer.profilbild,
        beschreibung: benutzer.beschreibung,
        rolle: benutzer.rolle || 'benutzer'
      };

      console.log('✅ Registrierung erfolgreich:', {
        token: token ? token.substring(0, 20) + '...' : 'none',
        userData
      });

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      navigate('/rezepte');
      return true;
    } catch (error) {
      console.error('❌ Registrierungsfehler:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Ungültige Registrierungsdaten';
            break;
          case 409:
            errorMessage = 'Diese E-Mail-Adresse ist bereits registriert';
            break;
          case 500:
            errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Sendet eine Passwort-Reset-Anfrage
   * @async
   * @param {string} email - E-Mail-Adresse für das Passwort-Reset
   * @returns {Promise<boolean>} True bei erfolgreicher Anfrage
   * @throws {Error} Bei ungültiger E-Mail oder Serverfehler
   */
  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post('/api/benutzer/passwort-vergessen', { email });
      return response.data.success || true;
    } catch (error) {
      console.error('Fehler beim Anfordern des Passwort-Resets:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            break;
          case 404:
            errorMessage = 'Es wurde kein Konto mit dieser E-Mail-Adresse gefunden.';
            break;
          case 500:
            errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Überprüft die Gültigkeit eines Reset-Tokens
   * @async
   * @param {string} token - Reset-Token
   * @returns {Promise<boolean>} True wenn der Token gültig ist
   * @throws {Error} Bei ungültigem Token oder Serverfehler
   */
  const validateResetToken = async (token) => {
    try {
      const response = await api.get(`/api/benutzer/passwort-reset/${token}/validieren`);
      return response.data.gueltig || false;
    } catch (error) {
      console.error('Fehler beim Validieren des Reset-Tokens:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Ungültiger Reset-Link.';
            break;
          case 404:
            errorMessage = 'Der Reset-Link ist ungültig oder bereits abgelaufen.';
            break;
          case 500:
            errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Setzt das Passwort mit einem gültigen Reset-Token zurück
   * @async
   * @param {string} token - Reset-Token
   * @param {string} newPassword - Neues Passwort
   * @returns {Promise<boolean>} True bei erfolgreichem Reset
   * @throws {Error} Bei ungültigem Token oder Passwort
   */
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post(`/api/benutzer/passwort-reset/${token}`, { 
        passwort: newPassword 
      });
      return response.data.success || true;
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Passworts:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Ungültige Eingabedaten.';
            break;
          case 404:
            errorMessage = 'Der Reset-Link ist ungültig oder bereits abgelaufen.';
            break;
          case 500:
            errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    sessionExpiredMessage,
    login,
    register,
    logout,
    updateUser,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
