/**
 * @fileoverview Service für die Verwaltung von Favoriten
 * @module favoriteService
 */

import api from './api';

/**
 * @typedef {Object} FavoritListe
 * @property {Object[]} favoriten - Liste der favorisierten Rezepte
 * @property {number} total - Gesamtanzahl der Favoriten
 * @property {number} seite - Aktuelle Seite
 * @property {number} seiten - Gesamtanzahl der Seiten
 */

/**
 * @typedef {Object} FavoritStatus
 * @property {boolean} ist_favorit - Ob das Rezept ein Favorit ist
 * @property {number} favoriten_anzahl - Anzahl der Benutzer, die das Rezept favorisiert haben
 */

/**
 * Ruft die Liste der Favoriten des eingeloggten Benutzers ab
 * @async
 * @param {number} [page=1] - Aktuelle Seite
 * @param {number} [limit=10] - Anzahl der Favoriten pro Seite
 * @param {string} [sortierung='newest'] - Sortierungsoption (newest, oldest, name_asc, name_desc)
 * @returns {Promise<FavoritListe>} Liste der Favoriten mit Paginierungsinformationen
 */
export const getFavorites = async (page = 1, limit = 10, sortierung = 'newest') => {
  try {
    const response = await api.get('/api/favoriten', {
      params: { page, limit, sortierung }
    });
    
    // Handle the response structure - backend returns { favoriten: [...] }
    const favorites = response.data?.favoriten || response.data || [];
    
    return {
      favoriten: Array.isArray(favorites) ? favorites : [],
      total: Array.isArray(favorites) ? favorites.length : 0,
      page: page,
      limit: limit
    };
  } catch (error) {
    if (error.response?.status === 401) {
      throw { message: 'Bitte melden Sie sich an, um Ihre Favoriten zu sehen' };
    }
    console.error('Error fetching favorites:', error);
    throw error.response?.data || error;
  }
};

/**
 * Fügt ein Rezept zu den Favoriten hinzu
 * @async
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<FavoritStatus>} Status der Favoritenaktion
 */
export const addToFavorites = async (recipeId) => {
  try {
    const response = await api.post(`/api/favoriten/rezept/${recipeId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw { message: 'Bitte melden Sie sich an, um Rezepte zu favorisieren' };
    }
    if (error.response?.status === 404) {
      throw new Error('Rezept nicht gefunden');
    }
    if (error.response?.status === 409) {
      throw new Error('Rezept ist bereits favorisiert');
    }
    throw error.response?.data || error;
  }
};

/**
 * Entfernt ein Rezept aus den Favoriten
 * @async
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<FavoritStatus>} Status der Favoritenaktion
 */
export const removeFromFavorites = async (recipeId) => {
  try {
    const response = await api.delete(`/api/favoriten/rezept/${recipeId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw { message: 'Bitte melden Sie sich an, um Favoriten zu verwalten' };
    }
    if (error.response?.status === 404) {
      throw new Error('Rezept nicht gefunden oder nicht favorisiert');
    }
    throw error.response?.data || error;
  }
};

/**
 * Prüft, ob ein Rezept zu den Favoriten gehört
 * @async
 * @param {number} recipeId - ID des Rezepts
 * @returns {Promise<FavoritStatus>} Status des Rezepts
 */
export const getFavoriteStatus = async (recipeId) => {
  try {
    const response = await api.get(`/api/favoriten/status/${recipeId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return { ist_favorit: false, favoriten_anzahl: 0 };
    }
    if (error.response?.status === 404) {
      throw new Error('Rezept nicht gefunden');
    }
    throw error.response?.data || error;
  }
};

/**
 * Ruft die beliebtesten Rezepte ab (basierend auf Favoritenzahl)
 * @async
 * @param {number} [limit=5] - Anzahl der abzurufenden Rezepte
 * @returns {Promise<Object[]>} Liste der beliebtesten Rezepte
 */
export const getPopularRecipes = async (limit = 5) => {
  try {
    const response = await api.get('/api/favoriten/beliebt', {
      params: { limit }
    });
    return response.data.rezepte;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 