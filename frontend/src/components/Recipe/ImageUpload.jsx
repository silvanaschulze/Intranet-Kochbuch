import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Componente para upload e preview de imagens
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onImageChange - Função chamada quando uma imagem é selecionada
 * @param {string} [props.previewUrl] - URL da imagem para preview
 * @returns {JSX.Element} Componente ImageUpload
 */
const ImageUpload = ({ onImageChange, previewUrl }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Bild</Form.Label>
      <Form.Control
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      {previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Vorschau"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'contain'
            }}
          />
        </div>
      )}
    </Form.Group>
  );
};

ImageUpload.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  previewUrl: PropTypes.string
};

export default ImageUpload; 