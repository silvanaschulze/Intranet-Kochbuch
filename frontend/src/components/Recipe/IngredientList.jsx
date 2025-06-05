import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} Ingredient
 * @property {string} name - Name der Zutat
 * @property {string} menge - Menge der Zutat
 * @property {string} einheit - Maßeinheit
 */

// Verfügbare Maßeinheiten
const EINHEITEN = [
  { value: '', label: 'Einheit wählen' },
  { value: 'g', label: 'Gramm (g)' },
  { value: 'kg', label: 'Kilogramm (kg)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'EL', label: 'Esslöffel (EL)' },
  { value: 'TL', label: 'Teelöffel (TL)' },
  { value: 'Stück', label: 'Stück' },
  { value: 'Prise', label: 'Prise' },
  { value: 'Tasse', label: 'Tasse' },
  { value: 'Bund', label: 'Bund' },
  { value: 'Packung', label: 'Packung' }
];

/**
 * Komponente für Zutatenliste mit Mengen und Einheiten
 * @param {Object} props - Eigenschaften des Komponenten
 * @param {Ingredient[]} props.ingredients - Liste der Zutaten
 * @param {Function} props.onChange - Funktion wird aufgerufen wenn Liste geändert wird
 * @param {string} [props.error] - Fehlermeldung
 * @returns {JSX.Element} IngredientList Komponente
 */
const IngredientList = ({ ingredients, onChange, error }) => {
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    onChange(newIngredients);
  };

  const addIngredient = () => {
    onChange([...ingredients, { name: '', menge: '', einheit: '' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      onChange(ingredients.filter((_, i) => i !== index));
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Zutaten</Form.Label>
      {ingredients.map((ingredient, index) => (
        <Row key={index} className="mb-2">
          <Col md={5}>
            <Form.Control
              type="text"
              placeholder="Name der Zutat"
              value={ingredient.name || ''}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              isInvalid={!!error}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              type="text"
              placeholder="Menge"
              value={ingredient.menge || ''}
              onChange={(e) => handleIngredientChange(index, 'menge', e.target.value)}
              isInvalid={!!error}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={ingredient.einheit || ''}
              onChange={(e) => handleIngredientChange(index, 'einheit', e.target.value)}
              isInvalid={!!error}
            >
              {EINHEITEN.map(einheit => (
                <option key={einheit.value} value={einheit.value}>
                  {einheit.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} xs="auto">
            <Button
              variant="outline-danger"
              onClick={() => removeIngredient(index)}
              disabled={ingredients.length === 1}
              className="w-100"
            >
              Delete
            </Button>
          </Col>
        </Row>
      ))}
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {error}
        </Form.Control.Feedback>
      )}
      <Button
        variant="success"
        type="button"
        onClick={addIngredient}
        className="mt-2 btn-add-ingredient"
      >
        + Zutat hinzufügen
      </Button>
    </Form.Group>
  );
};

IngredientList.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      menge: PropTypes.string.isRequired,
      einheit: PropTypes.string
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default IngredientList; 