/**
 * @fileoverview Authentifizierungskontext für die Verwaltung des Benutzerstatus
 * @module AuthContext
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  login as loginService, 
  register as registerService,
  requestPasswordReset as requestPasswordResetService,
  validateResetToken as validateResetTokenService,
  resetPassword as resetPasswordService
} from '../services/authService';

/**
 * @typedef {Object} User
 * @property {string} id - Benutzer-ID
 * @property {string} name - Benutzername
 * @property {string} email - E-Mail-Adresse des Benutzers
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user - Aktuell eingeloggter Benutzer
 * @property {boolean} isAuthenticated - Authentifizierungsstatus
 * @property {Function} login - Funktion zum Einloggen
 * @property {Function} register - Funktion zum Registrieren
 * @property {Function} logout - Funktion zum Ausloggen
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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  
  const navigate = useNavigate();


  /**
   * Führt den Logout-Prozess durch
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  /**
   * Prüft beim Laden der Komponente, ob ein gültiger Token existiert
   * und lädt die Benutzerdaten aus dem localStorage
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && !savedUser) {
      // Se tiver token mas não tiver dados do usuário, fazer logout
      logout();
    } else if (!token && savedUser) {
      // Se tiver dados do usuário mas não tiver token, fazer logout
      logout();
    } else if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        logout();
      }
    }
   }, [logout]);

  /**
   * Führt den Login-Prozess durch
   * @async
   * @param {string} email - E-Mail-Adresse des Benutzers
   * @param {string} password - Passwort des Benutzers
   * @returns {Promise<boolean>} True bei erfolgreicher Anmeldung
   * @throws {Error} Bei ungültigen Anmeldeinformationen
   */
  const login = async (email, password) => {
    try {
      const response = await loginService(email, password);
      
      if (!response || !response.token || !response.benutzer) {
        throw new Error('Ungültige Antwort vom Server');
      }

      const userData = {
        id: response.benutzer.id,
        name: response.benutzer.name,
        email: response.benutzer.email,
        rolle: response.benutzer.rolle || 'benutzer'
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      navigate('/rezepte');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Ungültige E-Mail oder Passwort';
            break;
          case 404:
            errorMessage = 'Benutzer nicht gefunden';
            break;
          case 422:
            errorMessage = 'Ungültige Eingabedaten';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(errorMessage);
    }
  };

  /**
   * Führt den Registrierungsprozess durch
   * @async
   * @param {string} name - Name des Benutzers
   * @param {string} email - E-Mail-Adresse des Benutzers
   * @param {string} password - Passwort des Benutzers
   * @returns {Promise<void>}
   * @throws {Error} Bei Validierungsfehlern
   */
  const register = async (name, email, password) => {
    try {
      const response = await registerService(name, email, password);
      
      if (!response || !response.token || !response.benutzer) {
        throw new Error('Ungültige Antwort vom Server');
      }

      const userData = {
        id: response.benutzer.id,
        name: response.benutzer.name,
        email: response.benutzer.email,
        rolle: response.benutzer.rolle || 'benutzer'
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      navigate('/rezepte');
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 409:
            errorMessage = 'Diese E-Mail-Adresse ist bereits registriert';
            break;
          case 422:
            errorMessage = 'Ungültige Eingabedaten';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(errorMessage);
    }
  };

  /**
   * Fordert einen Passwort-Reset-Link an
   * @async
   * @param {string} email - E-Mail-Adresse des Benutzers
   * @returns {Promise<void>}
   * @throws {Error} Bei ungültiger E-Mail oder Serverfehler
   */
  const requestPasswordReset = async (email) => {
    try {
      await requestPasswordResetService(email);
    } catch (error) {
      console.error('Password reset request error:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Benutzer nicht gefunden';
            break;
          case 422:
            errorMessage = 'Ungültige E-Mail-Adresse';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Überprüft die Gültigkeit eines Reset-Tokens
   * @async
   * @param {string} token - Reset-Token
   * @returns {Promise<boolean>}
   * @throws {Error} Bei ungültigem oder abgelaufenem Token
   */
  const validateResetToken = async (token) => {
    try {
      await validateResetTokenService(token);
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Ungültiger Token';
            break;
          case 404:
            errorMessage = 'Token nicht gefunden';
            break;
          case 410:
            errorMessage = 'Token ist abgelaufen';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Setzt das Passwort mit einem gültigen Token zurück
   * @async
   * @param {string} token - Reset-Token
   * @param {string} newPassword - Neues Passwort
   * @returns {Promise<void>}
   * @throws {Error} Bei ungültigem Token oder Passwort
   */
  const resetPassword = async (token, newPassword) => {
    try {
      await resetPasswordService(token, newPassword);
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Ungültiger Token oder Passwort';
            break;
          case 404:
            errorMessage = 'Token nicht gefunden';
            break;
          case 410:
            errorMessage = 'Token ist abgelaufen';
            break;
          case 422:
            errorMessage = 'Ungültiges Passwort';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    validateResetToken,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
