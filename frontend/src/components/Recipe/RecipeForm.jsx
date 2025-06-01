/**
 * @fileoverview Formularkomponente für Rezepte
 * @component RecipeForm
 */

import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CategorySelect from './CategorySelect';
import ImageUpload from './ImageUpload';
import IngredientList from './IngredientList';
import { validateRecipeForm, isFormValid } from './RecipeFormValidation';

/**
 * @typedef {Object} Zutat
 * @property {string} name - Name der Zutat
 * @property {string} menge - Menge der Zutat
 */

/**
 * @typedef {Object} RecipeFormData
 * @property {string} titel - Titel des Rezepts
 * @property {Zutat[]} zutaten - Liste der Zutaten
 * @property {string} zubereitung - Zubereitungsanleitung
 * @property {number} kategorie_id - ID der Kategorie
 * @property {File} [bild] - Optionales Bild des Rezepts
 */

/**
 * RecipeForm Komponente
 * Wiederverwendbares Formular für das Erstellen und Bearbeiten von Rezepten
 * 
 * @param {Object} props - Komponenteneigenschaften
 * @param {RecipeFormData} [props.initialData] - Initiale Daten für das Formular
 * @param {boolean} [props.isEditing=false] - Gibt an, ob das Formular zum Bearbeiten verwendet wird
 * @param {Function} props.onSubmit - Callback-Funktion beim Absenden des Formulars
 * @param {Function} props.onCancel - Callback-Funktion beim Abbrechen
 * @returns {JSX.Element} Die gerenderte RecipeForm Komponente
 */
const RecipeForm = ({ initialData, isEditing = false, onSubmit, onCancel }) => {
  const defaultFormData = {
    titel: '',
    zutaten: [{ name: '', menge: '' }],
    zubereitung: '',
    kategorie_id: '',
    bild: null
  };

  const [formData, setFormData] = useState(initialData || defaultFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData?.bild_url) {
      setImagePreview(initialData.bild_url);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (file, preview) => {
    setFormData(prev => ({
      ...prev,
      bild: file
    }));
    setImagePreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRecipeForm(formData);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: 'Fehler beim Speichern des Rezepts. Bitte versuchen Sie es später erneut.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errors.submit && (
        <Alert variant="danger" className="mb-4">
          {errors.submit}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Titel</Form.Label>
        <Form.Control
          type="text"
          name="titel"
          value={formData.titel}
          onChange={handleChange}
          isInvalid={!!errors.titel}
        />
        <Form.Control.Feedback type="invalid">
          {errors.titel}
        </Form.Control.Feedback>
      </Form.Group>

      <CategorySelect
        value={formData.kategorie_id}
        onChange={(e) => handleChange({ target: { name: 'kategorie_id', value: e.target.value } })}
        isInvalid={!!errors.kategorie_id}
        feedback={errors.kategorie_id}
      />

      <IngredientList
        ingredients={formData.zutaten}
        onChange={(newIngredients) => setFormData(prev => ({ ...prev, zutaten: newIngredients }))}
        error={errors.zutaten}
      />

      <Form.Group className="mb-3">
        <Form.Label>Zubereitung</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          name="zubereitung"
          value={formData.zubereitung}
          onChange={handleChange}
          isInvalid={!!errors.zubereitung}
        />
        <Form.Control.Feedback type="invalid">
          {errors.zubereitung}
        </Form.Control.Feedback>
      </Form.Group>

      <ImageUpload
        onImageChange={handleImageChange}
        previewUrl={imagePreview}
      />

      <div className="d-flex gap-2 justify-content-end">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Speichern...' : (isEditing ? 'Aktualisieren' : 'Erstellen')}
        </Button>
      </div>
    </Form>
  );
};

RecipeForm.propTypes = {
  initialData: PropTypes.shape({
    titel: PropTypes.string,
    zutaten: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        menge: PropTypes.string
      })
    ),
    zubereitung: PropTypes.string,
    kategorie_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bild: PropTypes.object,
    bild_url: PropTypes.string
  }),
  isEditing: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default RecipeForm;
