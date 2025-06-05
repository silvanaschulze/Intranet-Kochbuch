/**
 * @fileoverview Haupteinstiegspunkt der React-Anwendung
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// Globale Fehlerbehandlung
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Globaler Fehler:', { message, source, lineno, colno, error });
  return false;
};

/**
 * Globale Behandlung von nicht behandelten Promise-Ablehnungen
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unbehandelte Promise-Ablehnung:', event.reason);
  // Hier können Sie den Fehler an einen Logging-Service senden
});

// Performance-Überwachung
const reportPerformance = (metric) => {
  console.log(metric); // Ersetzen Sie dies durch Ihren Analytics-Service
};

/**
 * Rendert die Hauptanwendung in das DOM
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker für PWA registrieren
serviceWorkerRegistration.register({
  onSuccess: () => console.log('Service Worker wurde erfolgreich registriert'),
  onUpdate: (registration) => {
    // Benachrichtigung über neue Version
    const shouldUpdate = window.confirm(
      'Eine neue Version ist verfügbar. Möchten Sie die Seite neu laden, um die Updates zu erhalten?'
    );
    if (shouldUpdate) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
});

// Performance-Metriken melden
reportWebVitals(reportPerformance);
