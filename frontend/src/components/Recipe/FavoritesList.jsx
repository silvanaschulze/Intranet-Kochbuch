import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/api';
import RecipeCard from './RecipeCard';

/**
 * Componente para exibir a lista de receitas favoritas do usuário
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
      console.error('Erro ao carregar favoritos:', error);
      setError('Não foi possível carregar suas receitas favoritas. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
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
          Você ainda não tem receitas favoritas. Explore nossas receitas e adicione algumas aos seus favoritos!
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Minhas Receitas Favoritas</h2>
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