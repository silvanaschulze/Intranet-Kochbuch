/**
 * @fileoverview Seite zur Anzeige der Rezeptdetails
 * @component RecipeDetailPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import FavoriteButton from '../components/Recipe/FavoriteButton';
import CommentSection from '../components/Recipe/CommentSection';

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
  }, [loadRecipeDetails]);

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
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0">{recipe.titel}</h1>
          <div className="d-flex align-items-center">
            {user && (
              <FavoriteButton
                recipeId={recipe.id}
                initialIsFavorite={recipe.is_favorite}
                className="me-2"
              />
            )}
            {isOwner && (
              <>
                <Button
                  variant="outline-primary"
                  onClick={() => navigate(`/rezepte/${id}/bearbeiten`)}
                  className="me-2"
                >
                  Bearbeiten
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Löschen
                </Button>
              </>
            )}
          </div>
        </Card.Header>

        <Card.Body>
          {recipe.bild_url && (
            <div className="text-center mb-4">
              <img
                src={recipe.bild_url}
                alt={`Bild von ${recipe.titel}`}
                className="img-fluid rounded"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

          <Row>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header>
                  <strong>Details</strong>
                </Card.Header>
                <Card.Body>
                  <p><strong>Kategorie:</strong> {recipe.kategorie_name}</p>
                  {recipe.benutzer && (
                    <p><strong>Erstellt von:</strong> {recipe.benutzer.name}</p>
                  )}
                  <p><strong>Erstellt am:</strong> {new Date(recipe.erstellungsdatum).toLocaleDateString('de-DE')}</p>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <strong>Zutaten</strong>
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    {recipe.zutaten.map((zutat, index) => (
                      <li key={index}>
                        {zutat.menge} {zutat.einheit} {zutat.name}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <strong>Zubereitung</strong>
                </Card.Header>
                <Card.Body>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {recipe.zubereitung}
                  </div>
                </Card.Body>
              </Card>

              {user && (
                <Card>
                  <Card.Header>
                    <strong>Kommentare</strong>
                  </Card.Header>
                  <Card.Body>
                    <CommentSection recipeId={recipe.id} />
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
