/**
 * @fileoverview Komponente zur Anzeige einer Liste von Rezepten
 * @component RecipeList
 */

import React from 'react';
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import RecipeCard from './RecipeCard';

/**
 * RecipeList Komponente
 * Zeigt eine Liste von Rezepten in einem Raster an
 * 
 * @param {Object} props - Komponenteneigenschaften
 * @param {Array<Object>} props.recipes - Liste der anzuzeigenden Rezepte
 * @param {boolean} [props.loading=false] - Gibt an, ob die Rezepte geladen werden
 * @returns {JSX.Element} Die gerenderte RecipeList Komponente
 */
const RecipeList = ({ recipes, loading = false }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Wird geladen...</span>
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-4">
        <Alert variant="info">
          Keine Rezepte gefunden.
        </Alert>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
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
      schwierigkeitsgrad: PropTypes.string
    })
  ).isRequired,
  loading: PropTypes.bool
};

export default RecipeList;
