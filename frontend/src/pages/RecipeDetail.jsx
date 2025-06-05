/**
 * @fileoverview Seite zur Anzeige der Rezeptdetails
 * @component RecipeDetailPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../services/recipeService';
import { rateRecipe, getUserRating, getAverageRating } from '../services/ratingService';
import { useAuth } from '../context/AuthContext';
import FavoriteButton from '../components/Recipe/FavoriteButton';
import CommentSection from '../components/Recipe/CommentSection';
import { FaUserTie, FaEdit, FaTrash, FaCarrot, FaConciergeBell, FaComments } from 'react-icons/fa';

// Basis-URL für Backend-Bilder
const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.64.3:5000';

/**
 * Erstellt vollständige URL für Rezeptbild
 * @param {string} imagePath - Relativer Pfad zum Bild
 * @returns {string} Vollständige URL zum Rezeptbild
 */
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Bereits vollständige URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Relativer Pfad - vollständige URL erstellen
  let fullUrl;
  if (imagePath.startsWith('static/uploads/')) {
    // Hat bereits den vollständigen Pfad
    fullUrl = `${API_URL}/${imagePath}`;
  } else if (imagePath.startsWith('uploads/')) {
    // Fehlt nur das static/
    fullUrl = `${API_URL}/static/${imagePath}`;
  } else {
    // Hat nur den Dateinamen - static/uploads/ hinzufügen
    fullUrl = `${API_URL}/static/uploads/${imagePath}`;
  }
  
  return fullUrl;
};

/**
 * Stern-Bewertungs-Komponente
 */
const StarRating = ({ rating, onRate, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const renderStar = (index) => {
    const filled = (hoverRating || rating) >= index + 1;
    return (
      <span
        key={index}
        className={`star ${filled ? 'filled' : ''} ${!readOnly ? 'clickable' : ''}`}
        onClick={() => !readOnly && onRate && onRate(index + 1)}
        onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        style={{
          fontSize: '1.5rem',
          color: filled ? '#ffc107' : '#e4e5e9',
          cursor: readOnly ? 'default' : 'pointer',
          marginRight: '0.2rem'
        }}
      >
        ★
      </span>
    );
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => renderStar(index))}
      {rating && (
        <span className="ms-2 text-muted">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

/**
 * RecipeDetailPage Komponente
 * Zeigt die Details eines einzelnen Rezepts an
 * @returns {JSX.Element} Die gerenderte RecipeDetailPage Komponente
 */
const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State-Verwaltung
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  /**
   * Lädt die eigene Bewertung des Benutzers
   */
  const loadUserRating = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await getUserRating(id);
      if (response.bewertung) {
        setUserRating(response.bewertung.bewertung);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerbewertung:', error);
      // Ignoriere Fehler - kann bedeuten, dass noch keine Bewertung vorhanden ist
    }
  }, [id, user]);

  /**
   * Lädt die Bewertungsstatistiken
   */
  const loadRatingStats = useCallback(async () => {
    try {
      const response = await getAverageRating(id);
      setAverageRating(response.durchschnitt || 0);
    } catch (error) {
      console.error('Fehler beim Laden der Bewertungsstatistiken:', error);
    }
  }, [id]);

  /**
   * Lädt die Details eines spezifischen Rezepts
   * @async
   */
  const loadRecipeDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipe(id);
      setRecipe(data);
    } catch (err) {
      console.error('Fehler beim Laden des Rezepts:', err);
      setError('Das Rezept konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Lädt die Rezeptdetails beim ersten Render
   */
  useEffect(() => {
    loadRecipeDetails();
    loadUserRating();
    loadRatingStats();
  }, [loadRecipeDetails, loadUserRating, loadRatingStats]);

  /**
   * Verarbeitet das Löschen eines Rezepts
   * @async
   */
  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      setShowDeleteModal(false);
      navigate('/rezepte');
    } catch (err) {
      console.error('Fehler beim Löschen des Rezepts:', err);
      setError('Das Rezept konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.');
    }
  };

  /**
   * Behandelt die Bewertungsabgabe
   */
  const handleRate = async (rating) => {
    try {
      const response = await rateRecipe(id, rating);
      console.log('✅ Bewertung erfolgreich gespeichert:', response);
      setUserRating(rating);
      
      // Bewertungsstatistiken neu laden
      await loadRatingStats();
    } catch (err) {
      console.error('Fehler beim Bewerten:', err);
      setError('Ihre Bewertung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Wird geladen...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container className="py-4">
        <Alert variant="info">Rezept nicht gefunden.</Alert>
      </Container>
    );
  }

  const isOwner = user && recipe.benutzer_id === user.id;

  return (
    <Container className="py-4">
      {/* Rezept-Kopfbereich mit Bild */}
      <div className="recipe-hero mb-4">
        <Row>
          <Col lg={6}>
            {recipe.bild_pfad ? (
              <div className="recipe-image-container">
                <img
                  src={getImageUrl(recipe.bild_pfad)}
                  alt={`Bild von ${recipe.titel}`}
                  className="img-fluid rounded-3 shadow-sm"
                  style={{ 
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ) : (
              <div 
                className="recipe-placeholder d-flex align-items-center justify-content-center rounded-3 bg-light"
                style={{ height: '400px' }}
              >
                <span className="text-muted fs-1">🍽️</span>
              </div>
            )}
          </Col>
          <Col lg={6} className="d-flex flex-column justify-content-center">
            <div className="recipe-info p-4">
              <div className="mb-3">
                <Badge bg="primary" className="mb-2">{recipe.kategorie_name}</Badge>
                <h1 className="display-5 fw-bold mb-3">{recipe.titel}</h1>
              </div>

              {/* Creator Info */}
              <div className="creator-info mb-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <div className="creator-avatar me-3">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ width: '50px', height: '50px' }}
                    >
                      <FaUserTie size={20} />
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-1">Erstellt von</h6>
                    <p className="mb-1 fw-bold">{recipe.benutzer?.name || 'Unbekannt'}</p>
                    <small className="text-muted">
                      {new Date(recipe.erstellungsdatum).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="rating-section mb-4">
                <h6 className="mb-2">Bewertung</h6>
                
                {/* Durchschnittsbewertung */}
                {averageRating > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">Durchschnitt:</small>
                    <div className="d-flex align-items-center">
                      <StarRating 
                        rating={averageRating} 
                        readOnly={true}
                      />
                      <span className="ms-2 text-muted small">
                        ({averageRating.toFixed(1)} Sterne)
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Benutzerbewertung */}
                {user && (
                  <div>
                    <small className="text-muted">
                      {userRating > 0 ? 'Ihre Bewertung:' : 'Bewerten Sie dieses Rezept:'}
                    </small>
                    <StarRating 
                      rating={userRating} 
                      onRate={handleRate}
                      readOnly={false}
                    />
                    <small className="text-muted d-block mt-1">
                      {userRating > 0 ? 
                        `Sie haben ${userRating} von 5 Sternen gegeben` : 
                        'Klicken Sie auf die Sterne zum Bewerten'
                      }
                    </small>
                  </div>
                )}
                
                {!user && averageRating === 0 && (
                  <div className="text-muted">
                    <small>Noch keine Bewertungen vorhanden</small>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="action-buttons d-flex gap-2 flex-wrap">
                {user && (
                  <FavoriteButton
                    recipeId={recipe.id}
                    initialIsFavorite={recipe.is_favorite}
                    className="btn-lg"
                  />
                )}
                {isOwner && (
                  <>
                    <Button
                      variant="warning"
                      size="lg"
                      onClick={() => navigate(`/rezepte/${id}/bearbeiten`)}
                      className="d-flex align-items-center"
                    >
                      <FaEdit className="me-2" /> Bearbeiten
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => setShowDeleteModal(true)}
                      className="d-flex align-items-center"
                    >
                      <FaTrash className="me-2" /> Löschen
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Recipe Content */}
      <Row className="g-4">
        {/* Zutaten-Seitenleiste */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Header className="bg-gradient text-white">
              <h5 className="mb-0">
                <FaCarrot className="me-2" />
                Zutaten
              </h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                {recipe.zutaten.map((zutat, index) => (
                  <li key={index} className="mb-2 p-2 bg-light rounded">
                    <span className="fw-bold text-primary">{zutat.menge}</span>
                    {zutat.einheit && <span className="text-muted"> {zutat.einheit}</span>}
                    <span className="ms-2">{zutat.name}</span>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Anweisungen */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-gradient text-white">
              <h5 className="mb-0">
                <FaConciergeBell className="me-2" />
                Zubereitung
              </h5>
            </Card.Header>
            <Card.Body>
              <div 
                className="preparation-steps"
                style={{ 
                  whiteSpace: 'pre-line',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}
              >
                {recipe.zubereitung}
              </div>
            </Card.Body>
          </Card>

          {/* Kommentarbereich */}
          {user && (
            <Card>
              <Card.Header className="bg-gradient text-white">
                <h5 className="mb-0">
                  <FaComments className="me-2" />
                  Kommentare
                </h5>
              </Card.Header>
              <Card.Body>
                <CommentSection recipeId={recipe.id} />
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Lösch-Bestätigungsdialog */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rezept löschen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sind Sie sicher, dass Sie das Rezept "{recipe.titel}" löschen möchten?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Löschen
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecipeDetailPage;
