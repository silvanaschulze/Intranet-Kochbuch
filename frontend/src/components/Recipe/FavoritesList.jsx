/**
 * @fileoverview Komponente zur Anzeige der Favoritenliste des Benutzers
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/api';
import RecipeCard from './RecipeCard';

/**
 * Komponente zur Anzeige der Liste der favorisierten Rezepte des Benutzers
 * @component
 */
const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/favoriten');
      setFavorites(response.data.favoriten || []);
      setError(null);
    } catch (error) {
      console.error('Fehler beim Laden der Favoriten:', error);
      setError('Ihre Lieblings-Rezepte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Wird geladen...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      </Container>
    );
  }

  if (favorites.length === 0) {
    return (
      <Container>
        <Alert variant="info" className="my-3">
          Sie haben noch keine Lieblings-Rezepte. Entdecken Sie unsere Rezepte und fügen Sie einige zu Ihren Favoriten hinzu!
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Meine Lieblings-Rezepte</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {favorites.map(recipe => (
          <Col key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              onFavoriteToggle={loadFavorites}
              isFavorite={true}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FavoritesList; 