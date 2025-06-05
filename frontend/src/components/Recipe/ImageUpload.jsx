/**
 * @fileoverview Komponente für Bild-Upload und Vorschau bei Rezepten
 * @component ImageUpload
 */

import React from 'react';
import { Form, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * ImageUpload Komponente
 * Ermöglicht das Hochladen und die Vorschau von Bildern für Rezepte
 * @param {Object} props - Eigenschaften der Komponente
 * @param {Function} props.onImageChange - Callback-Funktion für Bildänderungen
 * @param {string} props.previewUrl - URL für die Bildvorschau
 * @returns {JSX.Element} ImageUpload Komponente
 */
const ImageUpload = ({ onImageChange, previewUrl }) => {
  const [error, setError] = React.useState('');

  /**
   * Behandelt die Bildauswahl und Validierung
   * @param {Event} e - Das Change-Event des File-Inputs
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Größenvalidierung (5MB für Rezeptbilder)
      if (file.size > 5 * 1024 * 1024) {
        setError('Die Bilddatei ist zu groß. Maximale Größe: 5MB');
        e.target.value = ''; // Input zurücksetzen
        return;
      }
      
      // Dateityp-Validierung
      if (!file.type.startsWith('image/')) {
        setError('Bitte wählen Sie eine gültige Bilddatei (JPG, PNG, GIF, AVIF, WebP)');
        e.target.value = ''; // Input zurücksetzen
        return;
      }
      
      setError(''); // Vorherige Fehler löschen
      
      // Datei lesen und Vorschau erstellen
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
        isInvalid={!!error}
      />
      <Form.Text className="text-muted">
        Max. 5MB, JPG/PNG/GIF/AVIF/WebP
      </Form.Text>
      {error && (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      )}
      {previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Bildvorschau"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'contain',
              border: '1px solid #dee2e6',
              borderRadius: '4px'
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