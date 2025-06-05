/**
 * @fileoverview Konfiguration für API-Aufrufe
 * @module api
 */

import axios from 'axios';

// API-Basis-URL konfigurieren
const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.64.3:5000';

// Axios-Instanz erstellen
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 Sekunden Timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request-Interceptor für Authentifizierung
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 API-Anfrage:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization
    });
    
    return config;
  },
  (error) => {
    console.error('🚨 Request-Interceptor-Fehler:', error);
    return Promise.reject(error);
  }
);

// Response-Interceptor für Fehlerbehandlung
api.interceptors.response.use(
  (response) => {
    console.log('✅ API-Antwort:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API-Fehler:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // Token-spezifische Fehlerbehandlung
    if (error.response?.status === 401) {
      // Token abgelaufen oder ungültig
      localStorage.removeItem('token');
      // Optional: Weiterleitung zur Login-Seite
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
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
    const error = new Error('Die Datei ist zu groß. Maximale Größe ist 5MB.');
    error.status = 413;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  if (!allowedTypes.includes(file.type)) {
    const error = new Error('Nicht unterstütztes Dateiformat. Erlaubt sind JPEG, PNG und GIF.');
    error.status = 415;
    error.code = 'INVALID_FILE_TYPE';
    throw error;
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