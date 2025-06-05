/**
 * @fileoverview Service für die Verwaltung von Kategorien
 * @module categoryService
 */

import api from './api';

/**
 * @typedef {Object} Kategorie
 * @property {number} id - ID der Kategorie
 * @property {string} name - Name der Kategorie
 * @property {string} [beschreibung] - Beschreibung der Kategorie
 * @property {number} rezepte_anzahl - Anzahl der Rezepte in der Kategorie
 * @property {Date} created_at - Erstellungsdatum
 * @property {Date} updated_at - Letztes Aktualisierungsdatum
 */

/**
 * @typedef {Object} KategorieListe
 * @property {Kategorie[]} kategorien - Liste der Kategorien
 * @property {number} total - Gesamtanzahl der Kategorien
 */

/**
 * @typedef {Object} KategorieRezeptListe
 * @property {Object[]} rezepte - Liste der Rezepte in der Kategorie
 * @property {number} total - Gesamtanzahl der Rezepte
 * @property {number} seite - Aktuelle Seite
 * @property {number} seiten - Gesamtanzahl der Seiten
 */

/**
 * Validiert die Kategoriedaten
 * @param {Object} categoryData - Zu validierende Kategoriedaten
 * @param {string} categoryData.name - Name der Kategorie
 * @param {string} [categoryData.beschreibung] - Beschreibung der Kategorie
 * @throws {Error} Bei ungültigen Daten
 */
const validateCategory = (categoryData) => {
  if (!categoryData.name?.trim()) {
    throw { message: 'Name ist erforderlich', field: 'name' };
  }
  if (categoryData.name.length < 2) {
    throw { message: 'Name muss mindestens 2 Zeichen lang sein', field: 'name' };
  }
  if (categoryData.name.length > 50) {
    throw { message: 'Name darf maximal 50 Zeichen lang sein', field: 'name' };
  }
  if (categoryData.beschreibung && categoryData.beschreibung.length > 200) {
    throw { message: 'Beschreibung darf maximal 200 Zeichen lang sein', field: 'beschreibung' };
  }
};

/**
 * Ruft alle Kategorien ab
 * @async
 * @param {boolean} [mitRezepteAnzahl=false] - Ob die Anzahl der Rezepte pro Kategorie mitgeliefert werden soll
 * @returns {Promise<Kategorie[]>} Liste der Kategorien
 */
export const getCategories = async (mitRezepteAnzahl = false) => {
  try {
    const response = await api.get('/api/kategorien', {
      params: { mit_rezepte_anzahl: mitRezepteAnzahl }
    });
    return Array.isArray(response.data?.kategorien) ? response.data.kategorien : [];
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
    return [];
  }
};

/**
 * Ruft eine einzelne Kategorie ab
 * @async
 * @param {number} categoryId - ID der Kategorie
 * @returns {Promise<Kategorie>} Die abgerufene Kategorie
 */
export const getCategory = async (categoryId) => {
  try {
    const response = await api.get(`/api/kategorien/${categoryId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Kategorie nicht gefunden');
    }
    throw error.response?.data || error;
  }
};

/**
 * Erstellt eine neue Kategorie
 * @async
 * @param {Object} categoryData - Daten der neuen Kategorie
 * @param {string} categoryData.name - Name der Kategorie
 * @param {string} [categoryData.beschreibung] - Beschreibung der Kategorie
 * @returns {Promise<Kategorie>} Die erstellte Kategorie
 */
export const createCategory = async (categoryData) => {
  try {
    validateCategory(categoryData);

    const response = await api.post('/api/kategorien', {
      name: categoryData.name.trim(),
      beschreibung: categoryData.beschreibung?.trim()
    });
    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.status === 409) {
      throw { message: 'Eine Kategorie mit diesem Namen existiert bereits', field: 'name' };
    }
    throw error.response?.data || error;
  }
};

/**
 * Aktualisiert eine Kategorie
 * @async
 * @param {number} categoryId - ID der Kategorie
 * @param {Object} categoryData - Neue Daten der Kategorie
 * @param {string} categoryData.name - Neuer Name der Kategorie
 * @param {string} [categoryData.beschreibung] - Neue Beschreibung der Kategorie
 * @returns {Promise<Kategorie>} Die aktualisierte Kategorie
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    validateCategory(categoryData);

    const response = await api.put(`/api/kategorien/${categoryId}`, {
      name: categoryData.name.trim(),
      beschreibung: categoryData.beschreibung?.trim()
    });
    return response.data;
  } catch (error) {
    if (error.field) throw error;
    if (error.response?.status === 404) {
      throw new Error('Kategorie nicht gefunden');
    }
    if (error.response?.status === 409) {
      throw { message: 'Eine Kategorie mit diesem Namen existiert bereits', field: 'name' };
    }
    throw error.response?.data || error;
  }
};

/**
 * Löscht eine Kategorie
 * @async
 * @param {number} categoryId - ID der Kategorie
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    await api.delete(`/api/kategorien/${categoryId}`);
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Kategorie nicht gefunden');
    }
    if (error.response?.status === 409) {
      throw { message: 'Kategorie kann nicht gelöscht werden, da sie noch Rezepte enthält' };
    }
    throw error.response?.data || error;
  }
};

/**
 * Ruft alle Rezepte einer Kategorie ab
 * @async
 * @param {number} categoryId - ID der Kategorie
 * @param {number} [page=1] - Aktuelle Seite
 * @param {number} [limit=10] - Anzahl der Rezepte pro Seite
 * @param {string} [sortierung='newest'] - Sortierungsoption (newest, oldest, name_asc, name_desc)
 * @returns {Promise<KategorieRezeptListe>} Liste der Rezepte in der Kategorie mit Paginierungsinformationen
 */
export const getCategoryRecipes = async (categoryId, page = 1, limit = 10, sortierung = 'newest') => {
  try {
    const response = await api.get(`/api/kategorien/${categoryId}/rezepte`, {
      params: { page, limit, sortierung }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Kategorie nicht gefunden');
    }
    throw error.response?.data || error;
  }
}; 