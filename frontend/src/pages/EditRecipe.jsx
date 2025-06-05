import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaEdit, FaSave, FaUtensils, FaHistory, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import RecipeForm from '../components/Recipe/RecipeForm';
import { getRecipe, updateRecipe } from '../services/recipeService';
import { addNotification } from '../components/Layout/Layout';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await getRecipe(id);
        setRecipe(data);
      } catch (error) {
        console.error('Fehler beim Laden des Rezepts:', error);
        addNotification('Fehler beim Laden des Rezepts', 'error');
        navigate('/meine-rezepte');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await updateRecipe(id, formData);
      addNotification('Rezept erfolgreich aktualisiert', 'success');
      navigate(`/rezepte/${id}`);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Rezepts:', error);
      addNotification('Fehler beim Aktualisieren des Rezepts', 'error');
    }
  };

  if (loading) {
    return (
      <>
        {/* Loading Hero Section */}
        <section className="edit-recipe-hero-section">
          <div className="hero-overlay">
            <Container>
              <Row className="align-items-center min-vh-50">
                <Col lg={8} className="mx-auto text-center">
                  <div className="loading-content">
                    <FaEdit size={60} className="text-warning mb-4 pulse-animation" />
                    <h1 className="display-4 fw-bold text-white mb-4">Rezept wird geladen</h1>
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Wird geladen...</span>
                    </div>
                    <p className="text-white-50 mt-3">Bereite Bearbeitung vor...</p>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </section>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        {/* Error Hero Section */}
        <section className="edit-recipe-hero-section">
          <div className="hero-overlay">
            <Container>
              <Row className="align-items-center min-vh-75">
                <Col lg={8} className="mx-auto text-center">
                  <div className="error-content">
                    <FaExclamationTriangle size={80} className="text-danger mb-4" />
                    <h1 className="display-4 fw-bold text-white mb-4">Rezept nicht gefunden</h1>
                    <p className="lead text-white-50 mb-5">
                      Das angeforderte Rezept konnte nicht geladen werden.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                      <button 
                        onClick={() => navigate('/meine-rezepte')}
                        className="btn btn-warning btn-lg px-4"
                      >
                        <FaArrowLeft className="me-2" />
                        Zu meinen Rezepten
                      </button>
                      <button 
                        onClick={() => navigate('/rezepte')}
                        className="btn btn-outline-light btn-lg"
                      >
                        <FaUtensils className="me-2" />
                        Alle Rezepte
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section für Rezept bearbeiten */}
      <section className="edit-recipe-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={8} className="mx-auto text-center">
                <div className="edit-recipe-hero-content">
                  <div className="hero-icon-container mb-4">
                    <FaEdit size={80} className="text-warning mb-3 pulse-animation" />
                    <div className="floating-edit-icons">
                      <FaSave className="floating-edit-icon edit-1 text-success" size={20} />
                      <FaUtensils className="floating-edit-icon edit-2 text-info" size={16} />
                      <FaHistory className="floating-edit-icon edit-3 text-warning" size={18} />
                    </div>
                  </div>
                  <h1 className="display-3 fw-bold text-white mb-4">
                    Rezept
                    <span className="text-warning d-block">bearbeiten</span>
                  </h1>
                  <p className="lead text-white-50 mb-5 fs-4">
                    Perfektionieren Sie Ihr Rezept und teilen Sie Ihre Verbesserungen 
                    mit der Community
                  </p>
                  {recipe && (
                    <div className="recipe-info-stats">
                      <div className="stat-badge bg-warning text-dark px-4 py-2 rounded-pill fw-bold">
                        <FaUtensils className="me-2" />
                        "{recipe.titel}"
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Edit Guidelines Section */}
      <section className="edit-guidelines py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary mb-3">Verbesserung leicht gemacht</h2>
              <p className="lead text-muted">
                Nutzen Sie diese Tipps, um Ihr Rezept noch besser zu machen
              </p>
            </Col>
          </Row>
          
          <Row className="g-4">
            <Col lg={4} md={6}>
              <Card className="guideline-card h-100 border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="guideline-icon bg-primary text-white mx-auto mb-4" 
                       style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaEdit size={25} className="d-flex align-items-center justify-content-center h-100 mx-auto" />
                  </div>
                  <h5 className="fw-bold mb-3">Details verfeinern</h5>
                  <p className="text-muted">
                    Verbessern Sie Zubereitungsschritte und Mengenangaben basierend auf Ihren Erfahrungen
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6}>
              <Card className="guideline-card h-100 border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="guideline-icon bg-success text-white mx-auto mb-4" 
                       style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaUtensils size={25} className="d-flex align-items-center justify-content-center h-100 mx-auto" />
                  </div>
                  <h5 className="fw-bold mb-3">Neue Variationen</h5>
                  <p className="text-muted">
                    Fügen Sie alternative Zutaten oder Zubereitungsmethoden hinzu
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6}>
              <Card className="guideline-card h-100 border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="guideline-icon bg-warning text-white mx-auto mb-4" 
                       style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaSave size={25} className="d-flex align-items-center justify-content-center h-100 mx-auto" />
                  </div>
                  <h5 className="fw-bold mb-3">Regelmäßig speichern</h5>
                  <p className="text-muted">
                    Vergessen Sie nicht, Ihre Änderungen regelmäßig zu speichern
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Recipe Edit Form Section */}
      <section className="recipe-edit-form-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <Card className="edit-form-card shadow-lg border-0">
                <div className="card-header-custom bg-gradient-primary text-white p-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <FaEdit size={30} className="me-3" />
                    <h3 className="mb-0 fw-bold">Rezept-Details bearbeiten</h3>
                  </div>
                  <p className="mb-0 mt-2 text-center opacity-75">
                    Nehmen Sie Ihre Änderungen vor und speichern Sie das aktualisierte Rezept
                  </p>
                </div>
                <Card.Body className="p-4">
                  <RecipeForm
                    initialData={recipe}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(`/rezepte/${id}`)}
                    isEditing
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h3 className="fw-bold text-primary mb-4">Schnellaktionen</h3>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button 
                  onClick={() => navigate(`/rezepte/${id}`)}
                  className="btn btn-outline-primary btn-lg"
                >
                  <FaArrowLeft className="me-2" />
                  Zurück zum Rezept
                </button>
                <button 
                  onClick={() => navigate('/meine-rezepte')}
                  className="btn btn-outline-secondary btn-lg"
                >
                  <FaUtensils className="me-2" />
                  Meine Rezepte
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default EditRecipe; 