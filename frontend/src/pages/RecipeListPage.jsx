/**
 * @fileoverview Seite zur Anzeige und Suche von Rezepten
 * @component RecipeListPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getRecipes, searchRecipes } from '../services/recipeService';
import { getCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import RecipeList from '../components/Recipe/RecipeList';
import { FaUtensils, FaSearch, FaPlus, FaStar, FaUsers, FaHeart, FaTrophy, FaFilter } from 'react-icons/fa';

/**
 * @typedef {Object} Recipe
 * @property {number} id - Die eindeutige ID des Rezepts
 * @property {string} titel - Der Titel des Rezepts
 * @property {string} zubereitungszeit - Die Zubereitungszeit des Rezepts
 * @property {string} schwierigkeitsgrad - Der Schwierigkeitsgrad des Rezepts
 * @property {string} [bild_url] - Die URL zum Bild des Rezepts (optional)
 */

/**
 * RecipeListPage Komponente
 * Zeigt eine durchsuchbare, paginierte Liste von Rezepten an
 * @returns {JSX.Element} Die gerenderte RecipeListPage Komponente
 */
const RecipeListPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sortBy = 'newest'; // Fester Wert, da keine Benutzeroberfläche zum Ändern vorhanden ist
  const limit = 9;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadRecipes = useCallback(async () => {
    // Warten auf die Beendigung der Authentifizierung vor dem Laden von Rezepten
    if (authLoading) {
      console.log('🔄 Warte auf Authentifizierung...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Lade Rezepte...', { 
        user: !!user, 
        isAuthenticated, 
        token: !!localStorage.getItem('token') 
      });
      
      let response;
      if (searchTerm) {
        response = await searchRecipes(searchTerm, selectedCategory, sortBy, page, limit);
      } else {
        response = await getRecipes(page, limit, selectedCategory, sortBy);
      }
      
      if (response && response.rezepte) {
        console.log('✅ Rezepte geladen:', response.rezepte.length);
        setRecipes(response.rezepte);
        setTotalPages(Math.ceil(response.total / limit));
      } else {
        setRecipes([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('❌ Fehler beim Laden der Rezepte:', err);
      setError('Die Rezepte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, selectedCategory, authLoading, user, isAuthenticated]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    }
  };

  // Handler für Kategorieänderung
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    // Datenneuladen erzwingen
    setTimeout(() => {
      loadRecipes();
    }, 100);
  }, [loadRecipes]);

  // Handler für das Löschen von Filtern
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setPage(1);
    // Datenneuladen erzwingen
    setTimeout(() => {
      loadRecipes();
    }, 100);
  }, [loadRecipes]);

  // Handler für die Suche
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadRecipes();
  };

  // Falls die Authentifizierung noch lädt, Loading anzeigen
  if (authLoading) {
    return (
      <>
        {/* Loading Hero Section */}
        <section className="recipe-list-hero-section">
          <div className="hero-overlay">
            <Container>
              <Row className="align-items-center min-vh-50">
                <Col lg={8} className="mx-auto text-center">
                  <div className="loading-content">
                    <FaUtensils size={60} className="text-warning mb-4 pulse" />
                    <h1 className="hero-title">Rezepte werden geladen</h1>
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Wird geladen...</span>
                    </div>
                    <p className="hero-subtitle mt-3">Bereite Ihre kulinarische Reise vor...</p>
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
      {/* Enhanced Hero Section mit modernem Design */}
      <section className="recipe-list-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={8} className="mx-auto text-center">
                <div className="fade-in-up">
                  <div className="hero-icon-container mb-4">
                    <FaUtensils size={80} className="text-warning mb-3 pulse" />
                    <div className="floating-culinary-icons">
                      <FaStar className="floating-culinary-icon culinary-1 text-warning" size={20} />
                      <FaHeart className="floating-culinary-icon culinary-2 text-danger" size={16} />
                      <FaTrophy className="floating-culinary-icon culinary-3 text-success" size={18} />
                    </div>
                  </div>
                  <h1 className="hero-title">
                    Entdecke
                    <span className="text-warning d-block">leckere Rezepte</span>
                  </h1>
                  <p className="hero-subtitle">
                    Durchsuche unsere vielfältige Sammlung köstlicher Rezepte und 
                    finde dein nächstes Lieblingsgericht
                  </p>
                  {recipes.length > 0 && (
                    <div className="recipe-stats">
                      <div className="stat-item">
                        <FaUtensils className="me-2" />
                        <span className="stat-number">{recipes.length}</span>
                        <span className="stat-label">Rezepte verfügbar</span>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Enhanced Search Section mit modernem Design */}
      <section className="advanced-search-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary mb-3">Perfekte Rezepte finden</h2>
              <p className="lead text-muted">
                Nutzen Sie unsere erweiterte Suche, um genau das zu finden, was Sie suchen
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center mb-5">
            <Col lg={10} xl={8}>
              <Card className="search-card">
                <Card.Body>
                  <h4 className="text-center mb-4">
                    <FaSearch className="me-2" />
                    Rezept suchen
                  </h4>
                  
                  <Form onSubmit={handleSearch}>
                    <Row className="g-3 align-items-end">
                      {/* Suchfeld */}
                      <Col md={6}>
                        <Form.Label className="fw-semibold">Suchbegriff</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="z.B. Pasta, Chicken, Dessert..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          size="lg"
                          className="form-control"
                        />
                      </Col>
                      
                      {/* Kategorie */}
                      <Col md={3}>
                        <Form.Label className="fw-semibold">Kategorie</Form.Label>
                        <Form.Select 
                          value={selectedCategory} 
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          size="lg"
                          className="form-select"
                        >
                          <option value="">Alle Kategorien</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      
                      {/* Such-Button */}
                      <Col md={3}>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="lg"
                          className="w-100 btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="loading-spinner me-2" />
                              Suchen...
                            </>
                          ) : (
                            <>
                              <FaSearch className="me-2" />
                              Suchen
                            </>
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Quick Category Filters mit modernem Design */}
          {categories.length > 0 && (
            <Row className="text-center">
              <Col>
                <h5 className="text-muted mb-4">
                  <FaFilter className="me-2" />
                  Schnelle Kategorien-Filter:
                </h5>
                <div className="quick-filters">
                  <button
                    className={`filter-tag ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => handleClearFilters()}
                  >
                    Alle
                  </button>
                  {categories.slice(0, 6).map(category => (
                    <button
                      key={category.id}
                      className={`filter-tag ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category.id.toString())}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </section>

      {/* Inhaltsbereich */}
      <Container className="content-section py-5">
        {/* Fehlermeldungen */}
        {error && (
          <Alert variant="danger" className="mb-4 alert-danger">
            <strong>Fehler:</strong> {error}
          </Alert>
        )}

        {/* Suchergebnisse Header */}
        {(searchTerm || selectedCategory) && (
          <div className="search-results-header mb-4 p-4 bg-light rounded-3">
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-2 text-primary">
                  <FaSearch className="me-2" />
                  Suchergebnisse
                  {searchTerm && <span className="text-dark"> für "{searchTerm}"</span>}
                  {selectedCategory && categories.find(c => c.id.toString() === selectedCategory) && (
                    <span className="text-secondary"> in "{categories.find(c => c.id.toString() === selectedCategory).name}"</span>
                  )}
                </h5>
                <small className="text-muted">
                  {loading ? 'Wird geladen...' : `${recipes.length} Rezept${recipes.length !== 1 ? 'e' : ''} gefunden`}
                </small>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleClearFilters}
                  className="btn-outline-secondary"
                >
                  Filter löschen
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Liste der Rezepte mit Grid Layout */}
        <div className="recipe-results">
          <RecipeList recipes={recipes} loading={loading} />
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Rezept-Paginierung" className="pagination">
            <Button 
              variant="outline-primary" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="btn-outline-primary"
            >
              ← Vorherige
            </Button>
            
            <div className="pagination-info">
              Seite <span className="fw-bold">{page}</span> von <span className="fw-bold">{totalPages}</span>
            </div>
            
            <Button 
              variant="outline-primary" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="btn-outline-primary"
            >
              Nächste →
            </Button>
          </nav>
        )}
      </Container>

      {/* Call to Action mit modernem Design */}
      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <FaPlus size={60} className="mb-4 text-warning" />
            <h3 className="cta-title">Teilen Sie Ihre eigenen Rezepte!</h3>
            <p className="cta-subtitle">
              Haben Sie ein besonderes Rezept? Teilen Sie es mit unserer Community 
              und inspirieren Sie andere Kochbegeisterte.
            </p>
            <div className="cta-buttons">
              <Button 
                as={Link} 
                to="/rezept-erstellen" 
                variant="warning" 
                size="lg"
                className="btn-warning"
              >
                <FaPlus className="me-2" />
                Rezept erstellen
              </Button>
              <Button 
                as={Link} 
                to="/meine-rezepte" 
                variant="outline-light" 
                size="lg"
                className="btn-outline-light"
              >
                <FaUsers className="me-2" />
                Meine Rezepte
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default RecipeListPage; 