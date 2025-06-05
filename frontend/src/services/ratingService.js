/**
 * @fileoverview Service für Rezeptbewertungen
 * Verwaltet CRUD-Operationen für Bewertungen
 */

import api from './api';

/**
 * Gibt eine Bewertung für ein Rezept ab
 * @param {number} recipeId - ID des Rezepts
 * @param {number} rating - Bewertung (1-5 Sterne)
 * @returns {Promise<Object>} API-Antwort mit Bewertungsdetails
 */
export const rateRecipe = async (recipeId, rating) => {
  try {
    const response = await api.post(`/api/bewertungen/rezept/${recipeId}`, {
      bewertung: rating
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Bewerten des Rezepts:', error);
    throw error;
  }
};

/**
 * Lädt die Bewertung des aktuellen Benutzers für ein Rezept
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<Object>} Benutzerbewertung
 */
export const getUserRating = async (recipeId) => {
  try {
    const response = await api.get(`/api/bewertungen/rezept/${recipeId}/benutzer`);
    return response.data;
  } catch (error) {
    // Wenn keine Bewertung gefunden wird, ist das normal
    if (error.response?.status === 404) {
      return { bewertung: null };
    }
    console.error('Fehler beim Laden der Benutzerbewertung:', error);
    throw error;
  }
};

/**
 * Lädt die Bewertungsstatistiken für ein Rezept
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<Object>} Bewertungsstatistiken (Durchschnitt, Anzahl)
 */
export const getAverageRating = async (recipeId) => {
  try {
    const response = await api.get(`/api/bewertungen/rezept/${recipeId}/statistiken`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Bewertungsstatistiken:', error);
    // Rückgabe von Standardwerten bei Fehler
    return {
      durchschnitt: 0,
      anzahl: 0
    };
  }
};

/**
 * Aktualisiert eine bestehende Bewertung
 * @param {number} recipeId - ID des Rezepts
 * @param {number} rating - Neue Bewertung (1-5 Sterne)
 * @returns {Promise<Object>} API-Antwort mit aktualisierten Bewertungsdetails
 */
export const updateRating = async (recipeId, rating) => {
  try {
    const response = await api.put(`/api/bewertungen/rezept/${recipeId}`, {
      bewertung: rating
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Bewertung:', error);
    throw error;
  }
};

/**
 * Löscht die Bewertung des aktuellen Benutzers für ein Rezept
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<Object>} API-Antwort
 */
export const deleteRating = async (recipeId) => {
  try {
    const response = await api.delete(`/api/bewertungen/rezept/${recipeId}`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Löschen der Bewertung:', error);
    throw error;
  }
};

/**
 * Lädt alle Bewertungen für ein Rezept (für Adminzwecke)
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<Array>} Liste aller Bewertungen
 */
export const getAllRatings = async (recipeId) => {
  try {
    const response = await api.get(`/api/bewertungen/rezept/${recipeId}/alle`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden aller Bewertungen:', error);
    throw error;
  }
}; 