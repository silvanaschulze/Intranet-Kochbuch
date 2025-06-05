/**
 * @fileoverview Profilseite des Benutzers
 * @component Profile
 */

import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col, Image } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, getUserStatistics } from '../../services/authService';
import { addNotification } from '../Layout/Layout';
import api from '../../services/api';
import { FaHeart, FaFileAlt, FaEdit, FaUser } from 'react-icons/fa';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Aktualisierte Statistiken laden, wenn die Komponente gemountet wird
  useEffect(() => {
    const loadUserStatistics = async () => {
      try {
        const statistics = await getUserStatistics();
        updateUser(statistics);
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerstatistiken:', error);
      }
    };

    // Nur laden, wenn der Benutzer existiert und eine ID hat
    if (user?.id) {
      loadUserStatistics();
    }   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Entfernt alle Abhängigkeiten um den Loop zu stoppen

  // Funktion zum Erstellen der vollständigen Bild-URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/120x120/667eea/ffffff?text=User';
    
    // Wenn bereits eine vollständige URL vorliegt, diese zurückgeben
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Vollständige URL mit der API-Basis-URL erstellen
    let fullUrl;
    if (imagePath.startsWith('static/')) {
      // Hat bereits den vollständigen Pfad
      fullUrl = `${api.defaults.baseURL}/${imagePath}`;
    } else {
      // Hat nur den Dateinamen - static/profile_images/ hinzufügen
      fullUrl = `${api.defaults.baseURL}/static/profile_images/${imagePath}`;
    }
    
    return fullUrl;
  };

  // Handler für Formularänderungen
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Formularvalidierung
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

  // Profilbild hochladen
  const uploadProfileImage = async (file) => {
    try {
      console.log('🔄 Bild-Upload wird gestartet:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      console.log('🌐 API Basis-URL:', api.defaults.baseURL);
      
      // Debug des JWT-Tokens
      const token = localStorage.getItem('token');
      console.log('🔑 Token vorhanden:', !!token);
      console.log('🔑 Token (erste 50 Zeichen):', token ? token.substring(0, 50) + '...' : 'KEINES');
      console.log('👤 Benutzer aus AuthContext:', user);

      const formData = new FormData();
      formData.append('bild', file);
      
      console.log('📡 Sende an:', '/api/benutzer/profil/bild');
      console.log('📡 Vollständige URL:', `${api.defaults.baseURL}/api/benutzer/profil/bild`);
      
      const response = await api.post('/api/benutzer/profil/bild', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 60 Sekunden Timeout für Bild-Upload
      });
      
      console.log('✅ Upload erfolgreich:', response.data);
      
      const updatedUser = { ...user, profilbild: response.data.bild_url };
      updateUser(updatedUser);
      
      addNotification('Profilbild erfolgreich hochgeladen!', 'success');
      return response.data.bild_url;
    } catch (err) {
      console.error('❌ Upload-Fehler:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          baseURL: err.config?.baseURL
        }
      });
      
      let errorMessage = 'Fehler beim Hochladen des Bildes';
      
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Netzwerkfehler: Backend nicht erreichbar';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload-Timeout: Versuchen Sie es erneut';
      } else if (err.response) {
        errorMessage = err.response.data?.message || `Server Fehler: ${err.response.status}`;
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Bild hochladen, falls vorhanden
      if (selectedFile) {
        await uploadProfileImage(selectedFile);
        setSelectedFile(null);
        setImagePreview(null);
      }

      // Profildaten aktualisieren, falls geändert
      if (formData.name !== user.name || formData.newPassword) {
        const updateData = {
          name: formData.name,
          current_password: formData.currentPassword,
          ...(formData.newPassword && { new_password: formData.newPassword })
        };

        await updateProfile(updateData);
        addNotification('Profil erfolgreich aktualisiert', 'success');
      }
      
      setIsEditing(false);
      
      // Bei Passwort-Änderung Benutzer abmelden
      if (formData.newPassword) {
        addNotification('Bitte melden Sie sich mit Ihrem neuen Passwort an', 'info');
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  // Bildauswahl verarbeiten
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Auf 2MB reduziert
        setError('Die Bilddatei ist zu groß. Maximale Größe: 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Bitte wählen Sie eine gültige Bilddatei');
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Bildauswahl entfernen
  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          {/* Profile Header */}
          <div className="profile-header mb-4">
            <div className="text-center">
              <Image
                src={imagePreview || getImageUrl(user?.profilbild)}
                className="profile-avatar"
                roundedCircle
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/120x120/667eea/ffffff?text=User';
                }}
              />
              <h2 className="mt-3 mb-1">{user?.name}</h2>
              <p className="mb-0 opacity-75">{user?.email}</p>
            </div>
          </div>

          {/* User Statistics */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center h-100 project-card">
                <Card.Body>
                  <div className="project-icon bg-danger text-white mb-2 mx-auto">
                    <FaHeart />
                  </div>
                  <h5 className="card-title text-sucess">Meine Favoriten</h5>
                  <p className="h4 mb-0">{user?.favorites_count || 0}</p>
                  <small className="text-muted">Gespeicherte Rezepte</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100 project-card">
                <Card.Body>
                  <div className="project-icon bg-success text-white mb-2 mx-auto">
                    <FaFileAlt />
                  </div>
                  <h5 className="card-title text-success">Meine Rezepte</h5>
                  <p className="h4 mb-0">{user?.recipes_count || 0}</p>
                  <small className="text-muted">Erstellte Rezepte</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100 project-card">
                <Card.Body>
                  <div className="project-icon bg-info text-white mb-2 mx-auto">
                    <FaUser />
                  </div>
                  <h5 className="card-title text-info">Letzter Login</h5>
                  <p className="h6 mb-0">
                    {user?.last_login 
                      ? new Date(user.last_login).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Heute'
                    }
                  </p>
                  <small className="text-muted">
                    {user?.last_login 
                      ? new Date(user.last_login).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : new Date().toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                    }
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Profilinformationen</h3>
              {!isEditing && (
                <Button 
                  variant="outline-light"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Bearbeiten
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  {/* Profile Image Upload */}
                  <div className="text-center mb-4">
                    <h5>Profilbild</h5>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <div className="text-center">
                        <Image
                          src={imagePreview}
                          width={100}
                          height={100}
                          className="rounded-circle mb-3"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={removeImage}
                          >
                            Entfernen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUser /> Profilbild hochladen
                      </Button>
                    )}
                    <Form.Text className="text-muted d-block">
                      Max. 2MB, JPG/PNG
                    </Form.Text>
                  </div>

                  <hr />

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>E-Mail</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <h5>🔒 Passwort ändern</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Aktuelles Passwort</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Neues Passwort</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Passwort bestätigen</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-3">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        removeImage();
                        setError('');
                      }}
                      disabled={loading}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Speichern...' : 'Speichern'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <Row>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded mb-3">
                      <h6 className="text-muted mb-1">Name</h6>
                      <p className="h5 mb-0">{user?.name}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded mb-3">
                      <h6 className="text-muted mb-1">E-Mail</h6>
                      <p className="h6 mb-0">{user?.email}</p>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
