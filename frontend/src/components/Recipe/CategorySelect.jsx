import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import api from '../../services/api';

/**
 * Componente para seleção de categorias
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
      console.error('Erro ao carregar categorias:', error);
      setError('Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Form.Select disabled>
        <option>Carregando categorias...</option>
      </Form.Select>
    );
  }

  if (error) {
    return (
      <Form.Select disabled>
        <option>Erro ao carregar categorias</option>
      </Form.Select>
    );
  }

  return (
    <Form.Group>
      <Form.Label>Categoria</Form.Label>
      <Form.Select
        value={value}
        onChange={onChange}
        isInvalid={isInvalid}
      >
        <option value="">Selecione uma categoria</option>
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