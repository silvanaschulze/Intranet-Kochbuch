/**
 * @fileoverview Komponente zur Anzeige einer Rezeptkarte
 * @component RecipeCard
 */

import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// Basis-URL für Backend-Bilder
const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.64.3:5000';
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
 * @param {string} props.recipe.benutzer_name - Name des Erstellers
 * @param {number} props.recipe.benutzer_id - ID des Erstellers
 * @param {boolean} [props.isFavorite] - Ob das Rezept ein Favorit ist
 * @param {Function} [props.onFavoriteToggle] - Callback wenn Favorit-Status geändert wird
 * @param {Function} [props.onEdit] - Callback für Bearbeitung
 * @param {Function} [props.onDelete] - Callback für Löschung
 * @param {boolean} [props.showFavoriteButton=true] - Ob der Favorit-Button angezeigt werden soll
 * @returns {JSX.Element} Die gerenderte RecipeCard Komponente
 */
const RecipeCard = ({ 
  recipe, 
  isFavorite = false, 
  onFavoriteToggle, 
  onEdit, 
  onDelete,
  showFavoriteButton = true 
}) => {
  // All hooks must be called at the top, before any conditional logic
  const [imageError, setImageError] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user;
  } catch (error) {
    console.warn('Auth context not available:', error);
  }

  // Safety check for recipe object (after all hooks)
  if (!recipe) {
    return null;
  }
  
  const {
    id,
    titel: title,
    bild_pfad: image = null,
    kategorie_name: category = 'Ohne Kategorie',
    benutzer_name: creatorName = 'Unbekannt',
    erstellungsdatum: createdAt,
    is_favorite
  } = recipe;

  // Use is_favorite from recipe object if available, otherwise fallback to prop
  const favoriteStatus = is_favorite !== undefined ? is_favorite : isFavorite;

  // Formatiere das Erstellungsdatum
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    } catch (error) {
      return '';
    }
  };

  /**
   * Erstellt vollständige URL für Rezeptbild
   * @param {string|Object} imagePath - Relativer Pfad oder Bild-Objekt
   * @returns {string} Vollständige URL zum Rezeptbild
   */
  const getImageUrl = (imagePath) => {
    if (!imagePath || imageError) {
      return placeholderImage;
    }

    try {
      // Wenn imagePath ein Objekt ist (mit thumb_url)
      if (typeof imagePath === 'object' && imagePath.thumb_url) {
        const thumbUrl = imagePath.thumb_url.startsWith('http') 
          ? imagePath.thumb_url 
          : `${API_URL}/static/uploads/${imagePath.thumb_url}`;
        return thumbUrl;
      }
      
      // Wenn imagePath ein Objekt ist (mit image_url)
      if (typeof imagePath === 'object' && imagePath.image_url) {
        const imageUrl = imagePath.image_url.startsWith('http')
          ? imagePath.image_url
          : `${API_URL}/static/uploads/${imagePath.image_url}`;
        return imageUrl;
      }
      
      // Wenn imagePath ein String ist
      if (typeof imagePath === 'string') {
        // Bereits vollständige URL
        if (imagePath.startsWith('http')) {
          return imagePath;
        }
        
        // Relativer Pfad - vollständige URL erstellen
        let fullUrl;
        if (imagePath.startsWith('static/uploads/')) {
          fullUrl = `${API_URL}/${imagePath}`;
        } else if (imagePath.startsWith('uploads/')) {
          fullUrl = `${API_URL}/static/${imagePath}`;
        } else {
          fullUrl = `${API_URL}/static/uploads/${imagePath}`;
        }
        
        return fullUrl;
      }
    } catch (error) {
      console.error('🖼️ Fehler beim Verarbeiten der Bild-URL:', error);
    }
    
    return placeholderImage;
  };

  const handleFavoriteToggle = async (event) => {
    event.preventDefault();
    setLoadingFavorite(true);
    try {
      await onFavoriteToggle(id, !favoriteStatus);
    } catch (error) {
      console.error('Fehler beim Ändern des Favoriten-Status:', error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleDeleteClick = (event) => {
    event.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card className="recipe-card">
      <div className="card-img-wrapper">
        <Card.Img 
          variant="top" 
          src={getImageUrl(image)} 
          alt={title}
          onError={(e) => {
            console.error('Fehler beim Laden des Bildes:', e.target.src);
            setImageError(true);
            e.target.src = placeholderImage;
          }}
        />
      </div>
      <Card.Body>
        <Card.Title title={title}>{title}</Card.Title>
        
        <div className="recipe-meta">
          <Badge bg="secondary" className="badge">{category}</Badge>
          <small className="text-muted">von {creatorName}</small>
        </div>
        
        {createdAt && (
          <div className="mb-3">
            <small className="text-muted">erstellt am {formatDate(createdAt)}</small>
          </div>
        )}
        
        {/* Moderne Button-Gruppe */}
        <div className="btn-group">
          {/* Favoriten-Button - erscheint immer wenn Benutzer eingeloggt ist */}
          {user && (
            <Button
              onClick={handleFavoriteToggle}
              className={`favorite-button ${favoriteStatus ? 'favorited' : ''}`}
              disabled={loadingFavorite}
            >
              {loadingFavorite ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  <FaHeart />
                  {favoriteStatus ? 'Favorit' : 'Zu Favoriten'}
                </>
              )}
            </Button>
          )}
          
          {/* Details-Button - erscheint immer */}
          <Button
            as={Link}
            to={`/rezepte/${recipe.id}`}
            variant="primary"
            className="btn-primary"
          >
            <FaEye />
            Details
          </Button>
          
          {/* Bearbeiten-Button - nur für Besitzer */}
          {user && recipe.benutzer_id === user.id && (
            <Button
              as={Link}
              to={`/rezepte/${recipe.id}/bearbeiten`}
              variant="warning"
              className="btn-warning"
            >
              <FaEdit />
              Bearbeiten
            </Button>
          )}
          
          {/* Löschen-Button - nur für Besitzer */}
          {user && recipe.benutzer_id === user.id && (
            <Button
              onClick={handleDeleteClick}
              variant="danger"
              className="btn-danger"
            >
              <FaTrash />
              Löschen
            </Button>
          )}
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
    kategorie_name: PropTypes.string,
    benutzer_name: PropTypes.string,
    benutzer_id: PropTypes.number,
    is_favorite: PropTypes.bool
  }).isRequired,
  isFavorite: PropTypes.bool,
  onFavoriteToggle: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showFavoriteButton: PropTypes.bool
};

export default RecipeCard;