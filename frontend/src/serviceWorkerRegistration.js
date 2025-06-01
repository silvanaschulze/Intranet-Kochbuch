/**
 * @fileoverview Service Worker Registration für PWA-Funktionalität
 * 
 * Dieser Code ist verantwortlich für die Registrierung und Verwaltung des Service Workers,
 * der die PWA-Funktionalität ermöglicht (Offline-Zugriff, Push-Benachrichtigungen, etc.).
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Registriert den Service Worker
 * @param {Object} config Konfigurationsobjekt
 * @param {Function} config.onSuccess Callback bei erfolgreicher Registrierung
 * @param {Function} config.onUpdate Callback bei verfügbarem Update
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Diese Web-App wird von einem Service Worker zwischengespeichert.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });

    // Listener für Service Worker Updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
}

/**
 * Registriert einen gültigen Service Worker
 * @param {string} swUrl URL des Service Workers
 * @param {Object} config Konfigurationsobjekt
 */
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Überprüft regelmäßig auf Updates
      setInterval(() => {
        registration.update();
      }, 1000 * 60 * 60); // Jede Stunde

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('Neue Inhalte sind verfügbar und werden geladen, ' +
                        'wenn alle Tabs dieser Seite geschlossen werden.');

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Inhalte werden für den Offline-Zugriff zwischengespeichert.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Fehler während der Service Worker-Registrierung:', error);
    });
}

/**
 * Überprüft, ob ein Service Worker existiert und gültig ist
 * @param {string} swUrl URL des Service Workers
 * @param {Object} config Konfigurationsobjekt
 */
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Keine Internetverbindung gefunden. App läuft im Offline-Modus.');
    });
}

/**
 * Deregistriert den Service Worker
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 