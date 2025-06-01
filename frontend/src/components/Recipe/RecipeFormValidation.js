/**
 * Valida os dados do formulário de receita
 * @param {Object} formData - Dados do formulário
 * @param {string} formData.titel - Título da receita
 * @param {Array} formData.zutaten - Lista de ingredientes
 * @param {string} formData.zubereitung - Instruções de preparo
 * @param {string|number} formData.kategorie_id - ID da categoria
 * @returns {Object} Objeto com erros de validação
 */
export const validateRecipeForm = (formData) => {
  const errors = {};

  // Validação do título
  if (!formData.titel?.trim()) {
    errors.titel = 'Titel ist erforderlich';
  }

  // Validação da descrição
  if (!formData.zubereitung?.trim()) {
    errors.zubereitung = 'Zubereitungsanleitung ist erforderlich';
  }

  // Validação da categoria
  if (!formData.kategorie_id) {
    errors.kategorie_id = 'Bitte wählen Sie eine Kategorie';
  }

  // Validação dos ingredientes
  const hasValidIngredients = formData.zutaten?.every(zutat => 
    zutat.name.trim() && zutat.menge.trim()
  );

  if (!hasValidIngredients) {
    errors.zutaten = 'Alle Zutatenfelder müssen ausgefüllt sein';
  }

  return errors;
};

/**
 * Verifica se há erros de validação
 * @param {Object} errors - Objeto com erros de validação
 * @returns {boolean} True se não houver erros
 */
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
}; 