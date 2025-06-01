import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import api from '../../services/api';

/**
 * Componente para adicionar/remover receitas dos favoritos
 * @component
 */
const FavoriteButton = ({ recipeId, initialIsFavorite = false }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);
      if (isFavorite) {
        await api.delete(`/api/favoriten/rezept/${recipeId}`);
      } else {
        await api.post(`/api/favoriten/rezept/${recipeId}`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? "danger" : "outline-danger"}
      onClick={toggleFavorite}
      disabled={isLoading}
      className="favorite-button"
    >
      <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
      {isFavorite ? ' Remover dos Favoritos' : ' Adicionar aos Favoritos'}
    </Button>
  );
};

FavoriteButton.propTypes = {
  recipeId: PropTypes.number.isRequired,
  initialIsFavorite: PropTypes.bool
};

export default FavoriteButton; 