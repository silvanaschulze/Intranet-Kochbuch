/**
 * @fileoverview FavoriteButton Komponente für Rezepte
 * @component FavoriteButton
 */

import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/**
 * FavoriteButton Komponente
 * Ermöglicht das Hinzufügen/Entfernen von Rezepten zu/von Favoriten
 * 
 * @param {Object} props - Komponenteneigenschaften
 * @param {number} props.recipeId - ID des Rezepts
 * @param {boolean} [props.isFavorite=false] - Anfänglicher Favoritenstatus
 * @param {function} [props.onToggle] - Callback-Funktion beim Umschalten
 * @returns {JSX.Element} Die gerenderte FavoriteButton Komponente
 */
const FavoriteButton = ({ recipeId, isFavorite = false, onToggle }) => {
  const { user } = useAuth();
  const [favoriteStatus, setFavoriteStatus] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  // Status synchronisieren wenn sich isFavorite prop ändert
  useEffect(() => {
    console.log(`🔄 FavoriteButton ${recipeId}: Prop geändert zu ${isFavorite}`);
    setFavoriteStatus(isFavorite);
  }, [isFavorite, recipeId]);

  const toggleFavorite = async () => {
    if (!user) {
      console.log('❌ Benutzer nicht angemeldet');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      console.log(`🔄 Toggle Favorit für Rezept ${recipeId}: ${favoriteStatus ? 'entfernen' : 'hinzufügen'}`);

      if (favoriteStatus) {
        // Favorit entfernen - rota corrigida
        console.log(`🗑️ Entferne Favorit: Rezept ${recipeId}`);
        await api.delete(`/api/favoriten/rezept/${recipeId}`);
        console.log('✅ Favorit erfolgreich entfernt');
        setFavoriteStatus(false);
      } else {
        // Favorit hinzufügen - rota corrigida
        console.log(`❤️ Füge Favorit hinzu: Rezept ${recipeId}`);
        await api.post(`/api/favoriten/rezept/${recipeId}`);
        console.log('✅ Favorit erfolgreich hinzugefügt');
        setFavoriteStatus(true);
      }

      // Callback aufrufen wenn vorhanden
      if (onToggle) {
        onToggle(!favoriteStatus);
      }

    } catch (error) {
      console.error('❌ Fehler beim Umschalten des Favoriten:', error);
      
      // Error handling je nach Status
      if (error.response?.status === 401) {
        console.error('❌ Nicht authentifiziert');
      } else if (error.response?.status === 404) {
        console.error('❌ Rezept oder Favorit nicht gefunden');
      } else {
        console.error('❌ Unbekannter Fehler:', error.response?.data || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Nicht angemeldet = kein Button
  }

  return (
    <Button
      variant={favoriteStatus ? 'danger' : 'outline-danger'}
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      style={{ 
        minWidth: '80px',
        backgroundColor: 'white',
        borderColor: '#e91e63',
        color: '#e91e63'
      }}
    >
      {loading ? 'Laden...' : (favoriteStatus ? 'Entfernen' : 'Favoriten')}
    </Button>
  );
};

FavoriteButton.propTypes = {
  recipeId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  isFavorite: PropTypes.bool,
  onToggle: PropTypes.func
};

export default FavoriteButton; 