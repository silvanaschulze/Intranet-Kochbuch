/**
 * @fileoverview Konfiguration der Axios-Instanz für API-Kommunikation
 * @module api
 */

import axios from 'axios';

/**
 * Basis-URL für alle API-Anfragen
 * @constant {string}
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.64.3:5000';

/**
 * @typedef {Object} ApiError
 * @property {string} message - Die Fehlermeldung
 * @property {number} [status] - Der HTTP-Statuscode
 * @property {string} [code] - Ein optionaler Fehlercode
 */

/**
 * Konfigurierte Axios-Instanz für API-Anfragen
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Request-Interceptor für automatische Token-Hinzufügung
 * @param {import('axios').AxiosRequestConfig} config - Die Axios-Konfiguration
 * @returns {import('axios').AxiosRequestConfig} Die modifizierte Konfiguration
 */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  error => {
    console.error('Request-Fehler:', error);
    return Promise.reject(error);
  }
);

/**
 * Behandelt API-Fehler und formatiert sie einheitlich
 * @param {import('axios').AxiosError} error - Der aufgetretene Fehler
 * @returns {ApiError} Ein formatierter Fehler
 */
const handleApiError = (error) => {
  let apiError = {
    message: 'Ein unerwarteter Fehler ist aufgetreten',
    status: 500
  };

  if (error.response) {
    const { data, status } = error.response;
    apiError = {
      message: data.message || apiError.message,
      status,
      code: data.code
    };

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        apiError.message = 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.';
        break;
      case 403:
        apiError.message = 'Sie haben keine Berechtigung für diese Aktion.';
        break;
      case 404:
        apiError.message = 'Die angeforderte Ressource wurde nicht gefunden.';
        break;
      case 413:
        apiError.message = 'Die hochgeladene Datei ist zu groß.';
        break;
      case 415:
        apiError.message = 'Das Dateiformat wird nicht unterstützt.';
        break;
      case 422:
        apiError.message = 'Die eingegebenen Daten sind ungültig.';
        break;
      case 429:
        apiError.message = 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
        break;
      case 500:
        apiError.message = 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
        break;
    }
  } else if (error.request) {
    apiError = {
      message: 'Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung.',
      status: 0,
      code: 'NETWORK_ERROR'
    };
  }

  console.error(`API-Fehler (${apiError.status}):`, apiError.message);
  return apiError;
};

/**
 * Response-Interceptor für Fehlerbehandlung
 */
api.interceptors.response.use(
  response => {
    if (!response.data && response.status !== 204) {
      return Promise.reject(new Error('Leere Serverantwort erhalten'));
    }
    return response;
  },
  error => Promise.reject(handleApiError(error))
);

/**
 * Hilfsfunktion für Bildupload
 * @param {File} file - Die hochzuladende Datei
 * @param {string} endpoint - Der API-Endpunkt für den Upload
 * @returns {Promise<Object>} Die Server-Antwort
 * @throws {ApiError} Wenn der Upload fehlschlägt
 */
api.uploadImage = async (file, endpoint) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (file.size > maxSize) {
    throw {
      message: 'Die Datei ist zu groß. Maximale Größe ist 5MB.',
      status: 413,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    throw {
      message: 'Nicht unterstütztes Dateiformat. Erlaubt sind JPEG, PNG und GIF.',
      status: 415,
      code: 'INVALID_FILE_TYPE'
    };
  }

  const formData = new FormData();
  formData.append('bild', file);

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default api;