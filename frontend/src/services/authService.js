/**
 * @fileoverview Service für Authentifizierung und Benutzerverwaltung
 * @module authService
 */

import api from './api';

/**
 * @typedef {Object} User
 * @property {number} id - ID des Benutzers
 * @property {string} name - Name des Benutzers
 * @property {string} email - E-Mail des Benutzers
 * @property {string} rolle - Rolle des Benutzers
 * @property {Date} created_at - Erstellungsdatum
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token - JWT Token für die Authentifizierung
 * @property {User} benutzer - Benutzerinformationen
 */

/**
 * @typedef {Object} AuthError
 * @property {string} message - Fehlermeldung
 * @property {string} field - Betroffenes Formularfeld
 */

/**
 * Validiert die Benutzeranmeldeinformationen
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @param {string} password - Passwort des Benutzers
 * @throws {AuthError} Bei ungültigen Eingaben
 */
const validateLoginInput = (email, password) => {
  if (!email) {
    throw { message: 'E-Mail-Adresse ist erforderlich', field: 'email' };
  }
  if (!email.includes('@')) {
    throw { message: 'Ungültige E-Mail-Adresse', field: 'email' };
  }
  if (!password) {
    throw { message: 'Passwort ist erforderlich', field: 'password' };
  }
  if (password.length < 8) {
    throw { message: 'Das Passwort muss mindestens 8 Zeichen lang sein', field: 'password' };
  }
};

/**
 * Führt den Login-Prozess durch
 * @async
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @param {string} password - Passwort des Benutzers
 * @returns {Promise<LoginResponse>} Login-Antwort mit Token und Benutzerinformationen
 * @throws {AuthError} Bei ungültigen Anmeldeinformationen oder Netzwerkfehlern
 */
export const login = async (email, password) => {
  try {
    validateLoginInput(email, password);

    const response = await api.post('/api/benutzer/login', {
      email,
      passwort: password
    });
    
    if (!response.data?.token || !response.data?.benutzer) {
      throw { message: 'Ungültige Serverantwort' };
    }

    // Token und Benutzer im localStorage speichern
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.benutzer));
    
    return response.data;
  } catch (error) {
    // Lokale Daten bei Fehler löschen
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (error.field) throw error;
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};

/**
 * Validiert die Registrierungsdaten
 * @param {string} name - Name des Benutzers
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @param {string} password - Passwort des Benutzers
 * @throws {AuthError} Bei ungültigen Eingaben
 */
const validateRegisterInput = (name, email, password) => {
  if (!name) {
    throw { message: 'Name ist erforderlich', field: 'name' };
  }
  if (name.length < 2) {
    throw { message: 'Der Name muss mindestens 2 Zeichen lang sein', field: 'name' };
  }
  if (!email) {
    throw { message: 'E-Mail-Adresse ist erforderlich', field: 'email' };
  }
  if (!email.includes('@')) {
    throw { message: 'Ungültige E-Mail-Adresse', field: 'email' };
  }
  if (!password) {
    throw { message: 'Passwort ist erforderlich', field: 'password' };
  }
  if (password.length < 8) {
    throw { message: 'Das Passwort muss mindestens 8 Zeichen lang sein', field: 'password' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw {
      message: 'Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten',
      field: 'password'
    };
  }
};

/**
 * Registriert einen neuen Benutzer
 * @async
 * @param {string} name - Name des Benutzers
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @param {string} password - Passwort des Benutzers
 * @returns {Promise<LoginResponse>} Registrierungsantwort
 * @throws {AuthError} Bei Validierungsfehlern oder Netzwerkfehlern
 */
export const register = async (name, email, password) => {
  try {
    validateRegisterInput(name, email, password);

    const response = await api.post('/api/benutzer/register', {
      name,
      email,
      passwort: password
    });

    if (!response.data?.token || !response.data?.benutzer) {
      throw { message: 'Ungültige Serverantwort' };
    }

    // Nach erfolgreicher Registrierung automatisch einloggen
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.benutzer));

    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};

/**
 * Aktualisiert das Benutzerprofil
 * @async
 * @param {Object} userData - Neue Benutzerdaten
 * @param {string} [userData.name] - Neuer Name
 * @param {string} [userData.current_password] - Aktuelles Passwort
 * @param {string} [userData.new_password] - Neues Passwort
 * @returns {Promise<User>} Aktualisierte Benutzerdaten
 * @throws {AuthError} Bei Validierungsfehlern oder Netzwerkfehlern
 */
export const updateProfile = async (userData) => {
  try {
    if (userData.new_password) {
      if (!userData.current_password) {
        throw { message: 'Aktuelles Passwort ist erforderlich', field: 'current_password' };
      }
      if (userData.new_password.length < 8) {
        throw { message: 'Das neue Passwort muss mindestens 8 Zeichen lang sein', field: 'new_password' };
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.new_password)) {
        throw {
          message: 'Das neue Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten',
          field: 'new_password'
        };
      }
    }

    const response = await api.put('/api/benutzer/profil', userData);

    if (!response.data) {
      throw { message: 'Fehler beim Aktualisieren des Profils' };
    }

    // Aktualisierte Benutzerdaten im localStorage speichern
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};

/**
 * Ruft das Benutzerprofil ab
 * @async
 * @returns {Promise<User>} Benutzerprofilinformationen
 * @throws {AuthError} Bei fehlender Authentifizierung oder Netzwerkfehlern
 */
export const getUserProfile = async () => {
  try {
    if (!isAuthenticated()) {
      throw { message: 'Benutzer nicht authentifiziert' };
    }

    const response = await api.get('/api/benutzer/profil');
    
    if (!response.data) {
      throw { message: 'Fehler beim Laden des Benutzerprofils' };
    }

    // Benutzerdaten im localStorage aktualisieren
    localStorage.setItem('user', JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};

/**
 * Prüft, ob ein Benutzer eingeloggt ist
 * @returns {boolean} True wenn ein Token und Benutzerdaten vorhanden sind
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Gibt den aktuell eingeloggten Benutzer zurück
 * @returns {User|null} Benutzerdaten oder null wenn nicht eingeloggt
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Loggt den aktuellen Benutzer aus
 * @async
 */
export const logout = async () => {
  try {
    // Optional: Logout auf dem Server durchführen
    await api.post('/api/benutzer/logout');
  } catch (error) {
    console.warn('Fehler beim Server-Logout:', error);
  } finally {
    // Lokale Daten in jedem Fall löschen
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Validiert die E-Mail-Adresse für das Zurücksetzen des Passworts
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @throws {AuthError} Bei ungültiger E-Mail-Adresse
 */
const validateResetEmail = (email) => {
  if (!email) {
    throw { message: 'E-Mail-Adresse ist erforderlich', field: 'email' };
  }
  if (!email.includes('@')) {
    throw { message: 'Ungültige E-Mail-Adresse', field: 'email' };
  }
};

/**
 * Validiert das neue Passwort für das Zurücksetzen
 * @param {string} password - Neues Passwort
 * @throws {AuthError} Bei ungültigem Passwort
 */
const validateNewPassword = (password) => {
  if (!password) {
    throw { message: 'Passwort ist erforderlich', field: 'password' };
  }
  if (password.length < 8) {
    throw { message: 'Das Passwort muss mindestens 8 Zeichen lang sein', field: 'password' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw {
      message: 'Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten',
      field: 'password'
    };
  }
};

/**
 * Fordert einen Link zum Zurücksetzen des Passworts an
 * @async
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @returns {Promise<void>}
 * @throws {AuthError} Bei ungültiger E-Mail oder Netzwerkfehlern
 */
export const requestPasswordReset = async (email) => {
  try {
    validateResetEmail(email);

    const response = await api.post('/api/benutzer/passwort-vergessen', { email });

    if (!response.data?.success) {
      throw { message: 'Fehler beim Senden des Reset-Links' };
    }
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};

/**
 * Überprüft die Gültigkeit eines Reset-Tokens
 * @async
 * @param {string} token - Reset-Token
 * @returns {Promise<boolean>}
 * @throws {AuthError} Bei ungültigem Token oder Netzwerkfehlern
 */
export const validateResetToken = async (token) => {
  try {
    if (!token) {
      throw { message: 'Token ist erforderlich' };
    }

    const response = await api.get(`/api/benutzer/passwort-reset/${token}/validieren`);

    return response.data?.valid === true;
  } catch (error) {
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};

/**
 * Setzt das Passwort mit einem gültigen Token zurück
 * @async
 * @param {string} token - Reset-Token
 * @param {string} newPassword - Neues Passwort
 * @returns {Promise<void>}
 * @throws {AuthError} Bei ungültigem Token, Passwort oder Netzwerkfehlern
 */
export const resetPassword = async (token, newPassword) => {
  try {
    if (!token) {
      throw { message: 'Token ist erforderlich' };
    }

    validateNewPassword(newPassword);

    const response = await api.post(`/api/benutzer/passwort-reset/${token}`, {
      passwort: newPassword
    });

    if (!response.data?.success) {
      throw { message: 'Fehler beim Zurücksetzen des Passworts' };
    }
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
};