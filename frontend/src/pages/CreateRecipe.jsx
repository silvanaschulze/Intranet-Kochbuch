/**
 * @fileoverview Seite zum Erstellen eines neuen Rezepts
 * @component CreateRecipePage
 */

import React from 'react';
import { Container } from 'react-bootstrap';
import RecipeForm from '../components/Recipe/RecipeForm';
import { createRecipe } from '../services/recipeService';
import { useNavigate } from 'react-router-dom';

/**
 * CreateRecipePage Komponente
 * Stellt ein Formular zum Erstellen eines neuen Rezepts bereit
 * @returns {JSX.Element} Die gerenderte CreateRecipePage Komponente
 */
const CreateRecipePage = () => {
  const navigate = useNavigate();

  /**
   * Verarbeitet das Erstellen eines neuen Rezepts
   * @param {Object} recipeData - Die Daten des neuen Rezepts
   */
  const handleSubmit = async (recipeData) => {
    try {
      const newRecipe = await createRecipe(recipeData);
      navigate(`/rezepte/${newRecipe.id}`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Rezepts:', error);
      throw error;
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Neues Rezept erstellen</h1>
      <RecipeForm onSubmit={handleSubmit} />
    </Container>
  );
};

export default CreateRecipePage; 