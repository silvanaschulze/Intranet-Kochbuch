import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} Ingredient
 * @property {string} name - Nome do ingrediente
 * @property {string} menge - Quantidade do ingrediente
 */

/**
 * Componente para gerenciar lista de ingredientes
 * @param {Object} props - Propriedades do componente
 * @param {Ingredient[]} props.ingredients - Lista de ingredientes
 * @param {Function} props.onChange - Função chamada quando a lista é alterada
 * @param {string} [props.error] - Mensagem de erro
 * @returns {JSX.Element} Componente IngredientList
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
    onChange([...ingredients, { name: '', menge: '' }]);
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
          <Col>
            <Form.Control
              type="text"
              placeholder="Name der Zutat"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              isInvalid={!!error}
            />
          </Col>
          <Col>
            <Form.Control
              type="text"
              placeholder="Menge"
              value={ingredient.menge}
              onChange={(e) => handleIngredientChange(index, 'menge', e.target.value)}
              isInvalid={!!error}
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-danger"
              onClick={() => removeIngredient(index)}
              disabled={ingredients.length === 1}
            >
              <i className="bi bi-trash"></i>
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
        variant="outline-primary"
        type="button"
        onClick={addIngredient}
        className="mt-2"
      >
        <i className="bi bi-plus"></i> Zutat hinzufügen
      </Button>
    </Form.Group>
  );
};

IngredientList.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      menge: PropTypes.string.isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default IngredientList; 