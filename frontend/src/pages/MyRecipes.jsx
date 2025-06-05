/**
 * @fileoverview Seite für die Anzeige der eigenen Rezepte
 * @component MyRecipesPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Alert, Button, Modal, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUtensils, FaPlus, FaEdit, FaTrash, FaUser, FaCrown, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { getUserRecipes, deleteRecipe } from '../services/recipeService';
import RecipeCard from '../components/Recipe/RecipeCard';
import { toast } from 'react-toastify';
import api from '../services/api';

/**
 * MyRecipesPage Komponente
 * Zeigt alle Rezepte des eingeloggten Benutzers an
 * @returns {JSX.Element} Die gerenderte MyRecipesPage Komponente
 */
const MyRecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  /**
   * Lädt die Rezepte des Benutzers
   */
  const loadUserRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const userRecipes = await getUserRecipes();
      // Handle different possible response structures
      let recipesArray = [];
      
      if (Array.isArray(userRecipes)) {
        recipesArray = userRecipes;
      } else if (userRecipes && userRecipes.rezepte && Array.isArray(userRecipes.rezepte)) {
        recipesArray = userRecipes.rezepte;
      } else if (userRecipes && userRecipes.data && Array.isArray(userRecipes.data)) {
        recipesArray = userRecipes.data;
      } else {
        // If none of the above, make sure it's an empty array
        recipesArray = [];
      }
      
      setRecipes(recipesArray);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Rezepte:', err);
      setError('Die Rezepte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      setRecipes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserRecipes();
  }, [loadUserRecipes]);

  const handleEdit = (recipeId) => {
    navigate(`/rezepte/${recipeId}/bearbeiten`);
  };

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    try {
      await deleteRecipe(recipeToDelete);
      toast.success('Rezept erfolgreich gelöscht');
      setRecipeToDelete(null);
      setDeleteModalShow(false);
      loadUserRecipes();
    } catch (err) {
      console.error('Fehler beim Löschen des Rezepts:', err);
      toast.error('Fehler beim Löschen des Rezepts');
    }
  };

  const confirmDelete = (recipeId) => {
    setRecipeToDelete(recipeId);
    setDeleteModalShow(true);
  };

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
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, is_favorite: newFavoriteStatus }
            : recipe
        )
      );
    } catch (error) {
      console.error('Fehler beim Umschalten der Favoriten:', error);
      toast.error('Fehler beim Umschalten der Favoriten');
    }
  };

  if (loading) {
    return (
      <>
        {/* Hero Section für Loading */}
        <section className="myrecipes-hero-section">
          <div className="hero-overlay">
            <Container>
              <Row className="align-items-center min-vh-50">
                <Col lg={8} className="mx-auto text-center">
                  <div className="loading-content">
                    <FaUser size={60} className="text-warning mb-4 pulse-animation" />
                    <h1 className="display-4 fw-bold text-white mb-4">Meine Rezepte</h1>
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Wird geladen...</span>
                    </div>
                    <p className="text-white-50 mt-3">Lade Ihre Rezepte...</p>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section für Meine Rezepte */}
      <section className="myrecipes-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={8} className="mx-auto text-center">
                <div className="myrecipes-hero-content">
                  <div className="hero-icon-container mb-4">
                    <FaCrown size={80} className="text-warning mb-3 pulse-animation" />
                    <div className="floating-chef-icons">
                      <FaUtensils className="floating-chef-icon chef-1 text-success" size={20} />
                      <FaEdit className="floating-chef-icon chef-2 text-info" size={16} />
                      <FaPlus className="floating-chef-icon chef-3 text-warning" size={18} />
                    </div>
                  </div>
                  <h1 className="display-3 fw-bold mb-4">
                    <span className="text-warning">Meine Rezepte</span>
                  </h1>
                  <p className="lead text-white-50 mb-5 fs-4">
                    Ihre persönliche Rezeptsammlung - 
                    erstellt, verwaltet und geteilt von Ihnen
                  </p>
                  {recipes.length > 0 && (
                    <div className="stats-container">
                      <div className="stat-item">
                        <div className="stat-number text-warning fw-bold fs-2">{recipes.length}</div>
                        <div className="stat-label text-white-50">Erstellte Rezepte</div>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Content Section */}
      <section className="myrecipes-content py-5">
        <Container>
          {error && (
            <Alert variant="danger" className="mb-4">
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                {error}
              </div>
            </Alert>
          )}

          {recipes.length === 0 && !loading ? (
            /* Empty State - Visually Rich */
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <Card className="empty-state-card border-0 shadow-lg">
                  <Card.Body className="p-5">
                    <div className="empty-state-icon mb-4">
                      <FaUtensils size={80} className="text-muted" />
                    </div>
                    <h3 className="fw-bold text-primary mb-3">Noch keine Rezepte erstellt</h3>
                    <p className="text-muted mb-4 fs-5">
                      Sie haben noch keine Rezepte erstellt. 
                      Teilen Sie Ihre kulinarischen Kreationen mit der Community!
                    </p>
                    
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <Button 
                        onClick={() => navigate('/rezept-erstellen')}
                        variant="primary" 
                        size="lg"
                        className="px-4 fw-bold"
                      >
                        <FaPlus className="me-2" />
                        Erstes Rezept erstellen
                      </Button>
                      <Button 
                        as={Link} 
                        to="/rezepte" 
                        variant="outline-primary" 
                        size="lg"
                        className="fw-bold"
                      >
                        <FaSearch className="me-2" />
                        Inspiration finden
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
                
                {/* Tipps für neue Benutzer */}
                <div className="tips-section mt-5">
                  <h4 className="text-center mb-4 text-primary">Tipps für Ihr erstes Rezept</h4>
                  <Row className="g-3">
                    <Col md={4}>
                      <Card className="tip-card border-0 shadow-sm h-100">
                        <Card.Body className="text-center p-4">
                          <div className="tip-icon bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                            <FaEdit size={25} />
                          </div>
                          <h6 className="fw-bold">Detailliert beschreiben</h6>
                          <p className="text-muted small">Genaue Mengenangaben und Schritte helfen anderen beim Nachkochen</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="tip-card border-0 shadow-sm h-100">
                        <Card.Body className="text-center p-4">
                          <div className="tip-icon bg-warning text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                            <FaUtensils size={25} />
                          </div>
                          <h6 className="fw-bold">Bilder hinzufügen</h6>
                          <p className="text-muted small">Ein appetitliches Foto macht Ihr Rezept noch attraktiver</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="tip-card border-0 shadow-sm h-100">
                        <Card.Body className="text-center p-4">
                          <div className="tip-icon bg-info text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                            <FaCrown size={25} />
                          </div>
                          <h6 className="fw-bold">Persönliche Note</h6>
                          <p className="text-muted small">Fügen Sie Ihre eigenen Tipps und Variationen hinzu</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          ) : (
            /* Recipes Grid */
            <>
              <Row className="mb-4">
                <Col>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="fw-bold text-primary mb-2">Ihre Rezeptsammlung</h2>
                      <p className="text-muted">
                        {recipes.length} {recipes.length === 1 ? 'Rezept' : 'Rezepte'} von Ihnen erstellt
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        onClick={() => navigate('/rezept-erstellen')}
                        variant="primary"
                        className="d-flex align-items-center"
                      >
                        <FaPlus className="me-2" />
                        Neues Rezept
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row xs={1} md={2} lg={3} className="g-4">
                {Array.isArray(recipes) && recipes.map(recipe => (
                  <Col key={recipe.id}>
                    <RecipeCard 
                      recipe={recipe}
                      onEdit={handleEdit}
                      onDelete={confirmDelete}
                      onFavoriteToggle={handleFavoriteToggle}
                      showFavoriteButton={true}
                    />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Container>
      </section>

      {/* Call to Action für mehr Engagement */}
      {recipes.length > 0 && (
        <section className="cta-engagement py-5 bg-light">
          <Container>
            <Row className="text-center">
              <Col lg={8} className="mx-auto">
                <h3 className="fw-bold text-primary mb-3">Teilen Sie mehr Ihre kulinarischen Kreationen</h3>
                <p className="text-muted mb-4">
                  Inspirieren Sie andere mit Ihren Rezepten und entdecken Sie neue Gerichte
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button 
                    onClick={() => navigate('/rezept-erstellen')}
                    variant="primary" 
                    size="lg"
                  >
                    <FaPlus className="me-2" />
                    Weiteres Rezept erstellen
                  </Button>
                  <Button 
                    as={Link} 
                    to="/rezepte" 
                    variant="outline-primary" 
                    size="lg"
                  >
                    <FaSearch className="me-2" />
                    Andere Rezepte entdecken
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* Modal für Löschbestätigung */}
      <Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            Rezept löschen
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="delete-icon mb-3">
            <FaTrash size={50} className="text-danger" />
          </div>
          <h5 className="mb-3">Sind Sie sicher?</h5>
          <p className="text-muted">
            Sind Sie sicher, dass Sie dieses Rezept löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button variant="outline-secondary" onClick={() => setDeleteModalShow(false)}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" />
            Löschen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyRecipesPage; 