/**
 * @fileoverview Komponente zur Anzeige einer Rezeptkarte
 * @component RecipeCard
 */

import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import FavoriteButton from './FavoriteButton';

// URL base para imagens do backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const placeholderImage = 'https://placehold.co/400x300/e9ecef/495057?text=Kein+Bild';

/**
 * RecipeCard Komponente
 * Zeigt eine Vorschau eines Rezepts in Kartenform an
 * 
 * @param {Object} props - Komponenteneigenschaften
 * @param {Object} props.recipe - Das anzuzeigende Rezept
 * @param {string|number} props.recipe.id - ID des Rezepts
 * @param {string} props.recipe.titel - Titel des Rezepts
 * @param {Object} props.recipe.bild_pfad - URLs zum Bild des Rezepts
 * @param {string} props.recipe.kategorie_name - Name der Kategorie
 * @param {boolean} [props.isFavorite] - Ob das Rezept ein Favorit ist
 * @param {Function} [props.onFavoriteToggle] - Callback wenn Favorit-Status geändert wird
 * @returns {JSX.Element} Die gerenderte RecipeCard Komponente
 */
const RecipeCard = ({ recipe, isFavorite = false, onFavoriteToggle }) => {
  const {
    id,
    titel: title,
    bild_pfad: image = null,
    kategorie_name: category = 'Ohne Kategorie'
  } = recipe;

  const [imageError, setImageError] = useState(false);

  // Função para construir URL da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath || imageError) return placeholderImage;
    try {
      // Se for um objeto com thumb_url
      if (typeof imagePath === 'object' && imagePath.thumb_url) {
        return `${API_URL}/${imagePath.thumb_url}`;
      }
      
      // Se for uma string
      if (typeof imagePath === 'string') {
        // Se já for uma URL completa
        if (imagePath.startsWith('http')) {
          return imagePath;
        }
        // Se for um caminho relativo
        return `${API_URL}/${imagePath}`;
      }
    } catch (error) {
      console.error('Erro ao processar URL da imagem:', error);
      return placeholderImage; 
    }
    
    return placeholderImage;
  };

  return (
    <Card className="h-100 shadow-sm">
      <div className="card-img-wrapper" style={{ height: '200px', overflow: 'hidden' }}>
        <Card.Img 
          variant="top" 
          src={getImageUrl(image)} 
          alt={title}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            console.error('Erro ao carregar imagem:', e.target.src);
            setImageError(true);
            e.target.src = placeholderImage;
          }}
        />
      </div>
      <Card.Body>
        <Card.Title className="text-truncate" title={title}>{title}</Card.Title>
        <div className="mb-3">
          <Badge bg="secondary">{category}</Badge>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <FavoriteButton
            recipeId={id}
            initialIsFavorite={isFavorite}
            onToggle={onFavoriteToggle}
          />
          <Link 
            to={`/rezepte/${id}`}  
            className="btn btn-sm btn-outline-primary"
            aria-label={`Details für ${title} anzeigen`}
          >
            Details
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    titel: PropTypes.string.isRequired,
    bild_pfad: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        image_url: PropTypes.string,
        thumb_url: PropTypes.string
      })
    ]),
    kategorie_name: PropTypes.string
  }).isRequired,
  isFavorite: PropTypes.bool,
  onFavoriteToggle: PropTypes.func
};

export default RecipeCard;