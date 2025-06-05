import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaUtensils, FaSearch, FaPlus, FaHeartBroken } from 'react-icons/fa';
import RecipeCard from '../components/Recipe/RecipeCard';
import { addNotification } from '../components/Layout/Layout';
import api from '../services/api';

const FavoriteRecipes = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/favoriten');
      console.log('Favorites response:', response.data); // Debug log
      
      // Handle both possible response structures
      const favoritesData = response.data.favoriten || response.data || [];
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (error) {
      console.error('Fehler beim Laden der Favoriten:', error);
      addNotification('Fehler beim Laden der Favoriten', 'error');
      setFavorites([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (recipeId, newFavoriteStatus) => {
    try {
      if (newFavoriteStatus) {
        // Add to favorites (shouldn't happen in this page, but just in case)
        await api.post(`/api/favoriten/rezept/${recipeId}`);
        addNotification('Rezept zu Favoriten hinzugefügt', 'success');
      } else {
        // Remove from favorites
        await api.delete(`/api/favoriten/rezept/${recipeId}`);
        
        // Update local state immediately - remove from list
        setFavorites(prevFavorites => 
          prevFavorites.filter(recipe => recipe.id !== recipeId)
        );
        
        addNotification('Rezept aus Favoriten entfernt', 'success');
      }
    } catch (error) {
      console.error('Fehler beim Umschalten der Favoriten:', error);
      addNotification('Fehler beim Umschalten der Favoriten', 'error');
    }
  };

  if (loading) {
    return (
      <>
        {/* Hero Section für Loading */}
        <section className="favorites-hero-section">
          <div className="hero-overlay">
            <Container>
              <Row className="align-items-center min-vh-50">
                <Col lg={8} className="mx-auto text-center">
                  <div className="loading-content">
                    <FaHeart size={60} className="text-warning mb-4 pulse-animation" />
                    <h1 className="display-4 fw-bold text-white mb-4">Meine Favoriten</h1>
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Wird geladen...</span>
                    </div>
                    <p className="text-white-50 mt-3">Lade Ihre Lieblingsrezepte...</p>
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
      {/* Hero Section für Favoriten */}
      <section className="favorites-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={8} className="mx-auto text-center">
                <div className="favorites-hero-content">
                  <div className="hero-icon-container mb-4">
                    <FaHeart size={80} className="text-warning mb-3 pulse-animation" />
                    <div className="floating-hearts">
                      <FaHeart className="floating-heart heart-1 text-danger" size={20} />
                      <FaHeart className="floating-heart heart-2 text-warning" size={16} />
                      <FaHeart className="floating-heart heart-3 text-info" size={18} />
                    </div>
                  </div>
                  <h1 className="display-3 fw-bold mb-4">
                    <span className="text-warning">Meine Favoriten</span>
                  </h1>
                  <p className="lead text-white-50 mb-5 fs-4">
                    Ihre persönliche Sammlung der besten Rezepte - 
                    alle Ihre Lieblingsgerichte an einem Ort
                  </p>
                  {favorites.length > 0 && (
                    <div className="stats-container">
                      <div className="stat-item">
                        <div className="stat-number text-warning fw-bold fs-2">{favorites.length}</div>
                        <div className="stat-label text-white-50">Favorisierte Rezepte</div>
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
      <section className="favorites-content py-5">
        <Container>
          {favorites.length === 0 ? (
            /* Empty State - Visually Rich */
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <Card className="empty-state-card border-0 shadow-lg">
                  <Card.Body className="p-5">
                    <div className="empty-state-icon mb-4">
                      <FaHeartBroken size={80} className="text-muted" />
                    </div>
                    <h3 className="fw-bold text-primary mb-3">Noch keine Favoriten</h3>
                    <p className="text-muted mb-4 fs-5">
                      Sie haben noch keine Favoriten ausgewählt. 
                      Schauen Sie sich unsere köstlichen Rezepte an und fügen Sie einige zu Ihren Favoriten hinzu!
                    </p>
                    
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <Button 
                        as={Link} 
                        to="/rezepte" 
                        variant="primary" 
                        size="lg"
                        className="px-4 fw-bold"
                      >
                        <FaUtensils className="me-2" />
                        Rezepte entdecken
                      </Button>
                      <Button 
                        as={Link} 
                        to="/rezept-erstellen" 
                        variant="outline-primary" 
                        size="lg"
                        className="fw-bold"
                      >
                        <FaPlus className="me-2" />
                        Rezept erstellen
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
                
                {/* Suggestion Cards */}
                <div className="suggestions-section mt-5">
                  <h4 className="text-center mb-4 text-primary">Beliebte Kategorien entdecken</h4>
                  <Row className="g-3">
                    <Col md={4}>
                      <Card className="suggestion-card border-0 shadow-sm h-100">
                        <Card.Body className="text-center p-4">
                          <div className="suggestion-icon bg-warning text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                            <FaUtensils size={25} />
                          </div>
                          <h6 className="fw-bold">Hauptgerichte</h6>
                          <p className="text-muted small">Herzhafte Gerichte für jeden Tag</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="suggestion-card border-0 shadow-sm h-100">
                        <Card.Body className="text-center p-4">
                          <div className="suggestion-icon bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                            <FaUtensils size={25} />
                          </div>
                          <h6 className="fw-bold">Desserts</h6>
                          <p className="text-muted small">Süße Verführungen und Nachspeisen</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="suggestion-card border-0 shadow-sm h-100">
                        <Card.Body className="text-center p-4">
                          <div className="suggestion-icon bg-info text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                            <FaUtensils size={25} />
                          </div>
                          <h6 className="fw-bold">Vorspeisen</h6>
                          <p className="text-muted small">Leckere Appetizer und Snacks</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          ) : (
            /* Favorites Grid */
            <>
              <Row className="mb-4">
                <Col>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="fw-bold text-primary mb-2">Ihre Lieblingsrezepte</h2>
                      <p className="text-muted">
                        {favorites.length} {favorites.length === 1 ? 'Rezept' : 'Rezepte'} in Ihrer Sammlung
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        as={Link} 
                        to="/rezepte" 
                        variant="outline-primary"
                        className="d-flex align-items-center"
                      >
                        <FaSearch className="me-2" />
                        Mehr entdecken
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row xs={1} md={2} lg={3} className="g-4">
                {favorites.map(recipe => (
                  <Col key={recipe.id}>
                    <RecipeCard
                      recipe={{
                        ...recipe,
                        is_favorite: true // Marcar como favorito
                      }}
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

      {/* Call to Action für mehr Rezepte */}
      {favorites.length > 0 && (
        <section className="cta-more-recipes py-5 bg-light">
          <Container>
            <Row className="text-center">
              <Col lg={8} className="mx-auto">
                <h3 className="fw-bold text-primary mb-3">Entdecken Sie mehr köstliche Rezepte</h3>
                <p className="text-muted mb-4">
                  Erweitern Sie Ihre Favoritensammlung mit noch mehr leckeren Gerichten
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button 
                    as={Link} 
                    to="/rezepte" 
                    variant="primary" 
                    size="lg"
                  >
                    <FaUtensils className="me-2" />
                    Alle Rezepte ansehen
                  </Button>
                  <Button 
                    as={Link} 
                    to="/rezept-erstellen" 
                    variant="outline-primary" 
                    size="lg"
                  >
                    <FaPlus className="me-2" />
                    Eigenes Rezept erstellen
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </>
  );
};

export default FavoriteRecipes; 