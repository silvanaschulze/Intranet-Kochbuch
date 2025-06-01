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
 * Validiert die Rezeptdaten
 * @param {Rezept} recipe - Zu validierende Rezeptdaten
 * @throws {Error} Bei ungültigen Daten
 */
const validateRecipe = (recipe) => {
  if (!recipe.titel?.trim()) {
    throw { message: 'Titel ist erforderlich', field: 'titel' };
  }
  if (recipe.titel.length < 3) {
    throw { message: 'Titel muss mindestens 3 Zeichen lang sein', field: 'titel' };
  }
  if (!recipe.zutaten?.length) {
    throw { message: 'Mindestens eine Zutat ist erforderlich', field: 'zutaten' };
  }
  if (!recipe.zubereitung?.trim()) {
    throw { message: 'Zubereitung ist erforderlich', field: 'zubereitung' };
  }
  if (!recipe.zubereitungszeit?.trim()) {
    throw { message: 'Zubereitungszeit ist erforderlich', field: 'zubereitungszeit' };
  }
  if (!recipe.schwierigkeitsgrad?.trim()) {
    throw { message: 'Schwierigkeitsgrad ist erforderlich', field: 'schwierigkeitsgrad' };
  }
};

/**
 * Ruft eine Liste von Rezepten ab
 * @async
 * @param {number} [page=1] - Aktuelle Seite
 * @param {number} [limit=10] - Anzahl der Rezepte pro Seite
 * @param {string} [kategorie=''] - Kategorie-ID für Filterung
 * @param {string} [sortierung='newest'] - Sortierungsoption
 * @returns {Promise<RezeptListe>} Liste der Rezepte mit Paginierungsinformationen
 */
export const getRecipes = async (page = 1, limit = 10, kategorie = '', sortierung = 'newest') => {
  try {
    const response = await api.get('/api/rezepte', {
      params: { page, limit, kategorie, sortierung }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Sucht nach Rezepten
 * @async
 * @param {string} searchTerm - Suchbegriff
 * @param {string} [kategorie=''] - Kategorie-ID für Filterung
 * @param {string} [sortierung='newest'] - Sortierungsoption
 * @param {number} [page=1] - Aktuelle Seite
 * @param {number} [limit=10] - Anzahl der Rezepte pro Seite
 * @returns {Promise<RezeptListe>} Liste der gefundenen Rezepte
 */
export const searchRecipes = async (searchTerm, kategorie = '', sortierung = 'newest', page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/rezepte/suche', {
      params: {
        q: searchTerm,
        kategorie,
        sortierung,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Ruft ein einzelnes Rezept ab
 * @async
 * @param {string} id - ID des Rezepts
 * @returns {Promise<Rezept>} Das abgerufene Rezept
 */
export const getRecipe = async (id) => {
  try {
    const response = await api.get(`/api/rezepte/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw { message: 'Rezept nicht gefunden' };
    }
    throw error.response?.data || error;
  }
};

/**
 * Erstellt ein neues Rezept
 * @async
 * @param {Rezept} recipeData - Daten des neuen Rezepts
 * @returns {Promise<Rezept>} Das erstellte Rezept
 */
export const createRecipe = async (recipeData) => {
  try {
    validateRecipe(recipeData);

    const formData = new FormData();
    
    // Textfelder hinzufügen
    formData.append('titel', recipeData.titel.trim());
    formData.append('zubereitung', recipeData.zubereitung.trim());
    formData.append('zubereitungszeit', recipeData.zubereitungszeit.trim());
    formData.append('schwierigkeitsgrad', recipeData.schwierigkeitsgrad);
    
    // Zutaten bereinigen und als JSON-String hinzufügen
    const cleanedIngredients = recipeData.zutaten.map(zutat => ({
      name: zutat.name.trim(),
      menge: zutat.menge.trim(),
      einheit: zutat.einheit.trim()
    }));
    formData.append('zutaten', JSON.stringify(cleanedIngredients));
    
    // Kategorien hinzufügen, falls vorhanden
    if (recipeData.kategorien?.length) {
      formData.append('kategorien', JSON.stringify(recipeData.kategorien));
    }
    
    // Bild hinzufügen, falls vorhanden
    if (recipeData.bild) {
      formData.append('bild', recipeData.bild);
    }
    
    const response = await api.post('/api/rezepte', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.field) throw error;
    throw error.response?.data || error;
  }
};

/**
 * Aktualisiert ein bestehendes Rezept
 * @async
 * @param {string} id - ID des zu aktualisierenden Rezepts
 * @param {Rezept} recipeData - Neue Daten des Rezepts
 * @returns {Promise<Rezept>} Das aktualisierte Rezept
 */
export const updateRecipe = async (id, recipeData) => {
  try {
    validateRecipe(recipeData);

    const formData = new FormData();
    
    formData.append('titel', recipeData.titel.trim());
    formData.append('zubereitung', recipeData.zubereitung.trim());
    formData.append('zubereitungszeit', recipeData.zubereitungszeit.trim());
    formData.append('schwierigkeitsgrad', recipeData.schwierigkeitsgrad);
    
    const cleanedIngredients = recipeData.zutaten.map(zutat => ({
      name: zutat.name.trim(),
      menge: zutat.menge.trim(),
      einheit: zutat.einheit.trim()
    }));
    formData.append('zutaten', JSON.stringify(cleanedIngredients));
    
    if (recipeData.kategorien?.length) {
      formData.append('kategorien', JSON.stringify(recipeData.kategorien));
    }
    
    if (recipeData.bild) {
      formData.append('bild', recipeData.bild);
    }
    
    const response = await api.put(`/api/rezepte/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.status === 404) {
      throw { message: 'Rezept nicht gefunden' };
    }
    throw error.response?.data || error;
  }
};

/**
 * Löscht ein Rezept
 * @async
 * @param {string} id - ID des zu löschenden Rezepts
 * @returns {Promise<void>}
 */
export const deleteRecipe = async (id) => {
  try {
    await api.delete(`/api/rezepte/${id}`);
  } catch (error) {
    if (error.response?.status === 404) {
      throw { message: 'Rezept nicht gefunden' };
    }
    throw error.response?.data || error;
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