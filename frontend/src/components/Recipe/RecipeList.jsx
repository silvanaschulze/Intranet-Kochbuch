/**
 * @fileoverview Komponente zur Anzeige einer Liste von Rezepten
 * @component RecipeList
 */

import React, { useState } from 'react';
import { Alert, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import RecipeCard from './RecipeCard';
import api from '../../services/api';
import { toast } from 'react-toastify';

/**
 * RecipeList Komponente
 * Zeigt eine Liste von Rezepten in einem Raster an
 * 
 * @param {Object} props - Komponenteneigenschaften
 * @param {Array<Object>} props.recipes - Liste der anzuzeigenden Rezepte
 * @param {boolean} [props.loading=false] - Gibt an, ob die Rezepte geladen werden
 * @param {Function} [props.onRecipeUpdate] - Callback für Rezept-Updates
 * @returns {JSX.Element} Die gerenderte RecipeList Komponente
 */
const RecipeList = ({ recipes, loading = false, onRecipeUpdate }) => {
  const [localRecipes, setLocalRecipes] = useState(recipes);

  // Update local state when recipes prop changes
  React.useEffect(() => {
    setLocalRecipes(recipes);
  }, [recipes]);

  const handleFavoriteToggle = async (recipeId, newFavoriteStatus) => {
    try {
      if (newFavoriteStatus) {
        // Add to favorites
        await api.post(`/api/favoriten/rezept/${recipeId}`);
        toast.success('Rezept zu Favoriten hinzugefügt');
      } else {
        // Remove from favorites
        await api.delete(`/api/favoriten/rezept/${recipeId}`);
        toast.success('Rezept aus Favoriten entfernt');
      }
      
      // Update local state
      setLocalRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, is_favorite: newFavoriteStatus }
            : recipe
        )
      );
      
      // Call parent callback if provided
      if (onRecipeUpdate) {
        onRecipeUpdate(recipeId, { is_favorite: newFavoriteStatus });
      }
    } catch (error) {
      console.error('Fehler beim Umschalten der Favoriten:', error);
      toast.error('Fehler beim Umschalten der Favoriten');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Wird geladen...</span>
        </div>
      </div>
    );
  }

  if (!localRecipes || localRecipes.length === 0) {
    return (
      <div className="text-center py-4">
        <Alert variant="info">
          Keine Rezepte gefunden.
        </Alert>
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {localRecipes.map((recipe) => {
        console.log(`🔍 RecipeList: Rezept ${recipe.id} (${recipe.titel}) - is_favorite:`, recipe.is_favorite);
        return (
          <Col key={recipe.id}>
            <RecipeCard 
              recipe={recipe}
              onFavoriteToggle={handleFavoriteToggle}
              showFavoriteButton={true}
            />
          </Col>
        );
      })}
    </Row>
  );
};

RecipeList.propTypes = {
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      titel: PropTypes.string.isRequired,
      beschreibung: PropTypes.string,
      bild_url: PropTypes.string,
      zubereitungszeit: PropTypes.string,
      schwierigkeitsgrad: PropTypes.string,
      is_favorite: PropTypes.bool
    })
  ).isRequired,
  loading: PropTypes.bool,
  onRecipeUpdate: PropTypes.func
};

export default RecipeList;
