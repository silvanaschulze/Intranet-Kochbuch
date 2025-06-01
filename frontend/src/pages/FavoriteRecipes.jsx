import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import RecipeCard from '../components/Recipe/RecipeCard';
import { useLoading } from '../context/LoadingContext';
import { addNotification } from '../components/Layout/Layout';
import api from '../services/api';

const FavoriteRecipes = () => {
  const [favorites, setFavorites] = useState([]);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/favorites');
        setFavorites(response.data);
      } catch (error) {
        addNotification('Fehler beim Laden der Favoriten', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [setIsLoading]);

  const handleRemoveFromFavorites = async (recipeId) => {
    try {
      await api.delete(`/api/favorites/${recipeId}`);
      setFavorites(favorites.filter(recipe => recipe.id !== recipeId));
      addNotification('Rezept aus Favoriten entfernt', 'success');
    } catch (error) {
      addNotification('Fehler beim Entfernen aus Favoriten', 'error');
    }
  };

  return (
    <Container>
      <h1>Meine Favoriten</h1>
      {favorites.length === 0 ? (
        <p>Keine Favoriten vorhanden.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {favorites.map(recipe => (
            <Col key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                onRemoveFromFavorites={handleRemoveFromFavorites}
                showFavoriteButton
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FavoriteRecipes; 