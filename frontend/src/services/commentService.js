/**
 * @fileoverview Service für die Verwaltung von Kommentaren
 * @module commentService
 */

import api from './api';

/**
 * @typedef {Object} Kommentar
 * @property {number} id - ID des Kommentars
 * @property {string} text - Text des Kommentars
 * @property {number} benutzer_id - ID des Kommentarautors
 * @property {string} benutzer_name - Name des Kommentarautors
 * @property {number} rezept_id - ID des zugehörigen Rezepts
 * @property {Date} created_at - Erstellungsdatum
 * @property {Date} updated_at - Letztes Aktualisierungsdatum
 */

/**
 * @typedef {Object} KommentarListe
 * @property {Kommentar[]} kommentare - Liste der Kommentare
 * @property {number} total - Gesamtanzahl der Kommentare
 * @property {number} seite - Aktuelle Seite
 * @property {number} seiten - Gesamtanzahl der Seiten
 */

/**
 * Validiert den Kommentartext
 * @param {string} text - Zu validierender Kommentartext
 * @throws {Error} Bei ungültigem Text
 */
const validateCommentText = (text) => {
  if (!text?.trim()) {
    throw { message: 'Kommentartext ist erforderlich', field: 'text' };
  }
  if (text.length < 3) {
    throw { message: 'Kommentar muss mindestens 3 Zeichen lang sein', field: 'text' };
  }
  if (text.length > 1000) {
    throw { message: 'Kommentar darf maximal 1000 Zeichen lang sein', field: 'text' };
  }
};

/**
 * Ruft die Kommentare eines Rezepts ab
 * @async
 * @param {number} recipeId - ID des Rezepts
 * @param {number} [page=1] - Aktuelle Seite
 * @param {number} [limit=10] - Anzahl der Kommentare pro Seite
 * @param {string} [sortierung='newest'] - Sortierungsoption (newest, oldest)
 * @returns {Promise<KommentarListe>} Liste der Kommentare mit Paginierungsinformationen
 */
export const getComments = async (recipeId, page = 1, limit = 10, sortierung = 'newest') => {
  try {
    const response = await api.get(`/api/kommentare/rezept/${recipeId}`, {
      params: { page, limit, sortierung }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Rezept nicht gefunden');
    }
    throw error.response?.data || error;
  }
};

/**
 * Fügt einen Kommentar zu einem Rezept hinzu
 * @async
 * @param {number} recipeId - ID des Rezepts
 * @param {string} text - Text des Kommentars
 * @returns {Promise<Kommentar>} Der erstellte Kommentar
 */
export const addComment = async (recipeId, text) => {
  try {
    validateCommentText(text);

    const response = await api.post(`/api/kommentare/rezept/${recipeId}`, {
      text: text.trim()
    });
    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.status === 404) {
      throw new Error('Rezept nicht gefunden');
    }
    throw error.response?.data || error;
  }
};

/**
 * Aktualisiert einen Kommentar
 * @async
 * @param {number} commentId - ID des Kommentars
 * @param {string} text - Neuer Text des Kommentars
 * @returns {Promise<Kommentar>} Der aktualisierte Kommentar
 */
export const updateComment = async (commentId, text) => {
  try {
    validateCommentText(text);

    const response = await api.put(`/api/kommentare/${commentId}`, {
      text: text.trim()
    });
    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.status === 404) {
      throw new Error('Kommentar nicht gefunden');
    }
    if (error.response?.status === 403) {
      throw new Error('Keine Berechtigung zum Bearbeiten dieses Kommentars');
    }
    throw error.response?.data || error;
  }
};

/**
 * Löscht einen Kommentar
 * @async
 * @param {number} commentId - ID des Kommentars
 * @returns {Promise<void>}
 */
export const deleteComment = async (commentId) => {
  try {
    await api.delete(`/api/kommentare/${commentId}`);
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Kommentar nicht gefunden');
    }
    if (error.response?.status === 403) {
      throw new Error('Keine Berechtigung zum Löschen dieses Kommentars');
    }
    throw error.response?.data || error;
  }
};

/**
 * Meldet einen Kommentar
 * @async
 * @param {number} commentId - ID des Kommentars
 * @param {string} grund - Grund für die Meldung
 * @returns {Promise<void>}
 */
export const reportComment = async (commentId, grund) => {
  try {
    if (!grund?.trim()) {
      throw { message: 'Bitte geben Sie einen Grund für die Meldung an', field: 'grund' };
    }

    await api.post(`/api/kommentare/${commentId}/melden`, {
      grund: grund.trim()
    });
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.status === 404) {
      throw new Error('Kommentar nicht gefunden');
    }
    throw error.response?.data || error;
  }
}; 