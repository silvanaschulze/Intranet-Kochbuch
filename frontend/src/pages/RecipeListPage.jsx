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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9); // Anzahl der Rezepte pro Seite

  useEffect(() => {
    loadRecipes();
    loadCategories();
  }, []);

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

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

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
    <Container className="recipe-list-container">
      <Row className="mb-4">
        <Col>
          <Form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap">
            <Form.Group className="flex-grow-1">
              <Form.Control
                type="text"
                placeholder="Buscar receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            <Form.Group style={{ minWidth: '200px' }}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Buscar
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Mensagens de erro */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Lista de receitas */}
      <RecipeList recipes={recipes} loading={loading} />

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-4">
          <Button 
            variant="outline-primary" 
            className="mx-1"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Anterior
          </Button>
          <div className="d-flex align-items-center mx-2">
            <span>Página {page} de {totalPages}</span>
          </div>
          <Button 
            variant="outline-primary" 
            className="mx-1"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Próxima
          </Button>
        </div>
      )}
    </Container>
  );
};

export default RecipeListPage; 