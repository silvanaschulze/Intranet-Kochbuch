import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import RecipeForm from '../components/Recipe/RecipeForm';
import { useLoading } from '../context/LoadingContext';
import { addNotification } from '../components/Layout/Layout';
import api from '../services/api';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        addNotification('Fehler beim Laden des Rezepts', 'error');
        navigate('/my-recipes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate, setIsLoading]);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      await api.put(`/api/recipes/${id}`, formData);
      addNotification('Rezept erfolgreich aktualisiert', 'success');
      navigate(`/recipes/${id}`);
    } catch (error) {
      addNotification('Fehler beim Aktualisieren des Rezepts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!recipe) {
    return null;
  }

  return (
    <Container>
      <h1>Rezept bearbeiten</h1>
      <RecipeForm
        initialData={recipe}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/recipes/${id}`)}
        isEditing
      />
    </Container>
  );
};

export default EditRecipe; 