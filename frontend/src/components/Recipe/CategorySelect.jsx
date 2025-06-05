import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import api from '../../services/api';

/**
 * Komponente für Kategorieauswahl
 * @component
 */
const CategorySelect = ({ value, onChange, isInvalid, feedback }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/kategorien');
      setCategories(response.data.kategorien || []);
      setError(null);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      setError('Kategorien konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Form.Group className="mb-3">
        <Form.Label>Kategorie</Form.Label>
        <Form.Select disabled>
          <option>Kategorien werden geladen...</option>
        </Form.Select>
      </Form.Group>
    );
  }

  if (error) {
    return (
      <Form.Group className="mb-3">
        <Form.Label>Kategorie</Form.Label>
        <Form.Select disabled>
          <option>Fehler beim Laden der Kategorien</option>
        </Form.Select>
      </Form.Group>
    );
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Kategorie</Form.Label>
      <Form.Select
        value={value}
        onChange={onChange}
        isInvalid={isInvalid}
      >
        <option value="">Kategorie auswählen</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Form.Select>
      {isInvalid && (
        <Form.Control.Feedback type="invalid">
          {feedback}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

CategorySelect.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onChange: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
  feedback: PropTypes.string
};

export default CategorySelect; 