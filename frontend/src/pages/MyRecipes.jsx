/**
 * @fileoverview Seite für die Anzeige der eigenen Rezepte
 * @component MyRecipesPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Alert, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUserRecipes, deleteRecipe } from '../services/recipeService';
import RecipeList from '../components/Recipe/RecipeList';
import { addNotification } from '../components/Layout/Layout';

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
      setRecipes(userRecipes);
    } catch (err) {
      console.error('Fehler beim Laden der Rezepte:', err);
      setError('Die Rezepte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
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
      addNotification('Rezept erfolgreich gelöscht', 'success');
      setRecipeToDelete(null);
      setDeleteModalShow(false);
      loadUserRecipes();
    } catch (err) {
      console.error('Fehler beim Löschen des Rezepts:', err);
      addNotification('Fehler beim Löschen des Rezepts', 'error');
    }
  };

  const confirmDelete = (recipeId) => {
    setRecipeToDelete(recipeId);
    setDeleteModalShow(true);
  };

  // Transformar as receitas para incluir botões de ação
  const recipesWithActions = recipes.map(recipe => ({
    ...recipe,
    actions: (
      <div className="d-flex gap-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleEdit(recipe.id)}
        >
          Bearbeiten
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => confirmDelete(recipe.id)}
        >
          Löschen
        </Button>
      </div>
    )
  }));

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Meine Rezepte</h1>
        <Button 
          variant="primary" 
          onClick={() => navigate('/rezept-erstellen')}
        >
          Neues Rezept erstellen
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {recipes.length === 0 && !loading ? (
        <Alert variant="info">
          Sie haben noch keine Rezepte erstellt. 
          Klicken Sie auf "Neues Rezept erstellen", um Ihr erstes Rezept zu erstellen!
        </Alert>
      ) : (
        <RecipeList 
          recipes={recipesWithActions} 
          loading={loading}
        />
      )}

      {/* Modal für Löschbestätigung */}
      <Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rezept löschen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sind Sie sicher, dass Sie dieses Rezept löschen möchten? 
          Diese Aktion kann nicht rückgängig gemacht werden.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalShow(false)}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Löschen
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyRecipesPage; 