/**
 * Validiert die Daten des Rezeptformulars
 * @param {Object} formData - Formulardaten
 * @param {string} formData.titel - Titel des Rezepts
 * @param {Array} formData.zutaten - Liste der Zutaten
 * @param {string} formData.zubereitung - Zubereitungsanleitung
 * @param {string|number} formData.kategorie_id - ID der Kategorie
 * @returns {Object} Objekt mit Validierungsfehlern
 */
export const validateRecipeForm = (formData) => {
  const errors = {};

  // Validierung des Titels
  if (!formData.titel?.trim()) {
    errors.titel = 'Titel ist erforderlich';
  }

  // Validierung der Beschreibung
  if (!formData.zubereitung?.trim()) {
    errors.zubereitung = 'Zubereitungsanleitung ist erforderlich';
  }

  // Validierung der Kategorie
  if (!formData.kategorie_id) {
    errors.kategorie_id = 'Bitte wählen Sie eine Kategorie';
  }

  // Validierung der Zutaten
  const hasValidIngredients = formData.zutaten?.every(zutat => 
    zutat.name.trim() && zutat.menge.trim()
  );

  if (!hasValidIngredients) {
    errors.zutaten = 'Alle Zutatenfelder müssen ausgefüllt sein';
  }

  return errors;
};

/**
 * Überprüft, ob Validierungsfehler vorhanden sind
 * @param {Object} errors - Objekt mit Validierungsfehlern
 * @returns {boolean} True wenn keine Fehler vorhanden sind
 */
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
}; 