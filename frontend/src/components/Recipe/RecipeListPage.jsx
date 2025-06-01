/**
 * @fileoverview Seite zur Anzeige und Suche von Rezepten
 * @component RecipeListPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getRecipes, searchRecipes } from '../services/recipeService';
import { getCategories } from '../services/categoryService';
import RecipeList from '../components/Recipe/RecipeList';

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
  const navigate = useNavigate();
  
  // State-Verwaltung
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]); // Inicializado como array vazio
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9); // Anzahl der Rezepte pro Seite

  // Laden der Kategorien
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(Array.isArray(response) ? response : []); // Garantir que é um array
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
        setCategories([]); // Em caso de erro, definir como array vazio
      }
    };
    loadCategories();
  }, []);

  /**
   * Lädt die Rezepte von der API
   */
  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm) {
        response = await searchRecipes(searchTerm, selectedCategory, sortBy, page, limit);
      } else {
        response = await getRecipes(page, limit, selectedCategory, sortBy);
      }
      
      if (response && response.rezepte) {
        setRecipes(response.rezepte);
        setTotalPages(Math.ceil(response.total / limit));
      } else {
        setRecipes([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Rezepte:', err);
      setError('Die Rezepte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, selectedCategory, sortBy]);

  // Laden der Rezepte beim ersten Render und bei Änderungen der Parameter
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Handler für die Suche
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadRecipes();
  };

  // Handler für Kategorieänderung
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  // Handler für Sortierungsänderung
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  return (
    <div className="fixed-height-container">
      <Container className="recipe-list-container">
        {/* Barra de pesquisa e filtros */}
        <Row className="mb-4">
          <Col md={6}>
            <Form onSubmit={handleSearch}>
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Nach Rezepten suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="me-2"
                />
                <Button type="submit" variant="primary">Suchen</Button>
              </Form.Group>
            </Form>
          </Col>
          <Col md={3}>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mb-2 mb-md-0"
            >
              <option value="">Alle Kategorien</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Neueste zuerst</option>
              <option value="oldest">Älteste zuerst</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Mensagens de erro */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Lista de receitas */}
        <div className="scrollable-content">
          <RecipeList recipes={recipes} loading={loading} />
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Button 
              variant="outline-primary" 
              className="mx-1"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Vorherige
            </Button>
            <div className="d-flex align-items-center mx-2">
              <span>Seite {page} von {totalPages}</span>
            </div>
            <Button 
              variant="outline-primary" 
              className="mx-1"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Nächste
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default RecipeListPage; 