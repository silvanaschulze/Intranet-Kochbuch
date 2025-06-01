/**
 * @fileoverview Profilseite des Benutzers
 * @component ProfilePage
 */

import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/authService';
import { addNotification } from '../Layout/Layout';

/**
 * ProfilePage Komponente
 * Zeigt die Profilinformationen des eingeloggten Benutzers an
 * @returns {JSX.Element} Die gerenderte ProfilePage Komponente
 */
const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.newPassword && formData.newPassword.length < 8) {
      setError('Das neue Passwort muss mindestens 8 Zeichen lang sein');
      return false;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Die neuen Passwörter stimmen nicht überein');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const updateData = {
        name: formData.name,
        current_password: formData.currentPassword,
        ...(formData.newPassword && { new_password: formData.newPassword })
      };

      await updateProfile(updateData);
      addNotification('Profil erfolgreich aktualisiert', 'success');
      setIsEditing(false);
      
      // Wenn das Passwort geändert wurde, ausloggen
      if (formData.newPassword) {
        addNotification('Bitte melden Sie sich mit Ihrem neuen Passwort an', 'info');
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Mein Profil</h3>
              {!isEditing && (
                <Button 
                  variant="outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Profil bearbeiten
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>E-Mail</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Die E-Mail-Adresse kann nicht geändert werden
                    </Form.Text>
                  </Form.Group>

                  <hr className="my-4" />
                  <h5>Passwort ändern</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Aktuelles Passwort</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Neues Passwort</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Neues Passwort bestätigen</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Wird gespeichert...' : 'Speichern'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div className="mb-3">
                    <strong>Name:</strong> {user?.name || 'Nicht angegeben'}
                  </div>
                  <div className="mb-3">
                    <strong>E-Mail:</strong> {user?.email}
                  </div>
                  <div className="mb-3">
                    <strong>Mitglied seit:</strong> {
                      user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('de-DE')
                        : 'Nicht verfügbar'
                    }
                  </div>
                  <div className="mb-3">
                    <strong>Rolle:</strong> {user?.rolle || 'Benutzer'}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
