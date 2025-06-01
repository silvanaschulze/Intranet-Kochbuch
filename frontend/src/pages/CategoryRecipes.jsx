import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import RecipeCard from '../components/Recipe/RecipeCard';
import { useLoading } from '../context/LoadingContext';
import { addNotification } from '../components/Layout/Layout';
import api from '../services/api';

const CategoryRecipes = () => {
  const { categoryId } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [category, setCategory] = useState(null);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const fetchCategoryAndRecipes = async () => {
      try {
        setIsLoading(true);
        const [categoryResponse, recipesResponse] = await Promise.all([
          api.get(`/api/categories/${categoryId}`),
          api.get(`/api/categories/${categoryId}/recipes`)
        ]);
        setCategory(categoryResponse.data);
        setRecipes(recipesResponse.data);
      } catch (error) {
        addNotification('Fehler beim Laden der Rezepte', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndRecipes();
  }, [categoryId, setIsLoading]);

  if (!category) {
    return null;
  }

  return (
    <Container>
      <h1>{category.name}</h1>
      {recipes.length === 0 ? (
        <p>Keine Rezepte in dieser Kategorie.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {recipes.map(recipe => (
            <Col key={recipe.id}>
              <RecipeCard recipe={recipe} showFavoriteButton />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CategoryRecipes; 