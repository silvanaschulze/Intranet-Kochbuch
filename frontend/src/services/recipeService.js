/**
 * @fileoverview Service für die Verwaltung von Rezepten
 * @module recipeService
 */

import api from './api';

/**
 * @typedef {Object} Zutat
 * @property {string} name - Name der Zutat
 * @property {string} menge - Menge der Zutat
 * @property {string} einheit - Einheit der Menge (z.B. g, ml, Stück)
 */

/**
 * @typedef {Object} Rezept
 * @property {number} id - ID des Rezepts
 * @property {string} titel - Titel des Rezepts
 * @property {Zutat[]} zutaten - Liste der Zutaten
 * @property {string} zubereitung - Zubereitungsanleitung
 * @property {string} zubereitungszeit - Geschätzte Zubereitungszeit
 * @property {string} schwierigkeitsgrad - Schwierigkeitsgrad des Rezepts
 * @property {string} [bild_url] - URL des Rezeptbilds
 * @property {File} [bild] - Optionales Bild des Rezepts (nur beim Upload)
 * @property {number} benutzer_id - ID des Erstellers
 * @property {string} ersteller_name - Name des Erstellers
 * @property {Date} created_at - Erstellungsdatum
 * @property {Date} updated_at - Letztes Aktualisierungsdatum
 */

/**
 * @typedef {Object} RezeptListe
 * @property {Rezept[]} rezepte - Liste der Rezepte
 * @property {number} total - Gesamtanzahl der Rezepte
 * @property {number} seite - Aktuelle Seite
 * @property {number} seiten - Gesamtanzahl der Seiten
 */

/**
 * @typedef {Object} RezeptFilter
 * @property {string} [kategorie] - Kategorie-ID
 * @property {string} [sortierung] - Sortierungsoptionen (newest, oldest, name_asc, name_desc)
 * @property {string} [schwierigkeit] - Schwierigkeitsgrad
 */

/**
 * Lädt alle Rezepte mit Paginierung und Filterung
 * @param {number} [page=1] - Seitennummer
 * @param {number} [limit=10] - Anzahl der Rezepte pro Seite
 * @param {string} [category=''] - Kategorie-Filter
 * @param {string} [sort='newest'] - Sortierungsoption
 * @returns {Promise<Object>} Liste der Rezepte mit Metadaten
 */
export const getRecipes = async (page = 1, limit = 10, category = '', sort = 'newest') => {
  try {
    console.log('🔍 getRecipes aufgerufen mit:', { page, limit, category, sort });
    
    const response = await api.get('/api/rezepte', {
      params: {
        page,
        limit,
        kategorie: category,
        sortierung: sort
      }
    });
    
    console.log('✅ Rezept-Antwort:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Rezepte:', error);
    throw error;
  }
};

/**
 * Sucht nach Rezepten
 * @param {string} searchTerm - Suchbegriff
 * @param {string} [category=''] - Kategorie-Filter
 * @param {string} [sort='newest'] - Sortierungsoption
 * @param {number} [page=1] - Seitennummer
 * @param {number} [limit=10] - Anzahl der Rezepte pro Seite
 * @returns {Promise<Object>} Suchergebnisse
 */
export const searchRecipes = async (searchTerm, category = '', sort = 'newest', page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/rezepte/suche', {
      params: {
        q: searchTerm,
        kategorie: category,
        sortierung: sort,
        page,
        limit
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Fehler bei der Rezeptsuche:', error);
    throw error;
  }
};

/**
 * Lädt ein einzelnes Rezept
 * @param {number} id - ID des Rezepts
 * @returns {Promise<Object>} Rezeptdetails
 */
export const getRecipe = async (id) => {
  try {
    const response = await api.get(`/api/rezepte/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden des Rezepts:', error);
    throw error;
  }
};

/**
 * Erstellt ein neues Rezept
 * @param {Object} recipeData - Rezeptdaten
 * @returns {Promise<Object>} Erstelltes Rezept
 */
export const createRecipe = async (recipeData) => {
  try {
    const response = await api.post('/api/rezepte', recipeData);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Rezepts:', error);
    throw error;
  }
};

/**
 * Aktualisiert ein bestehendes Rezept
 * @param {number} id - ID des Rezepts
 * @param {Object} recipeData - Aktualisierte Rezeptdaten
 * @returns {Promise<Object>} Aktualisiertes Rezept
 */
export const updateRecipe = async (id, recipeData) => {
  try {
    const response = await api.put(`/api/rezepte/${id}`, recipeData);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Rezepts:', error);
    throw error;
  }
};

/**
 * Löscht ein Rezept
 * @param {number} id - ID des Rezepts
 * @returns {Promise<void>}
 */
export const deleteRecipe = async (id) => {
  try {
    await api.delete(`/api/rezepte/${id}`);
  } catch (error) {
    console.error('Fehler beim Löschen des Rezepts:', error);
    throw error;
  }
};

/**
 * Ruft die Rezepte des eingeloggten Benutzers ab
 * @async
 * @param {number} [page=1] - Aktuelle Seite
 * @param {number} [limit=10] - Anzahl der Rezepte pro Seite
 * @returns {Promise<RezeptListe>} Liste der Rezepte des Benutzers
 */
export const getUserRecipes = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/rezepte/benutzer', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Ruft die beliebtesten Rezepte ab
 * @async
 * @param {number} [limit=5] - Anzahl der abzurufenden Rezepte
 * @returns {Promise<Rezept[]>} Liste der beliebtesten Rezepte
 */
export const getPopularRecipes = async (limit = 5) => {
  try {
    const response = await api.get('/api/rezepte/beliebt', {
      params: { limit }
    });
    return response.data.rezepte;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Ruft die neuesten Rezepte ab
 * @async
 * @param {number} [limit=5] - Anzahl der abzurufenden Rezepte
 * @returns {Promise<Rezept[]>} Liste der neuesten Rezepte
 */
export const getLatestRecipes = async (limit = 5) => {
  try {
    const response = await api.get('/api/rezepte/neu', {
      params: { limit }
    });
    return response.data.rezepte;
  } catch (error) {
    throw error.response?.data || error;
  }
};