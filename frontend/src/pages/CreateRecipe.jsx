/**
 * @fileoverview Seite zum Erstellen eines neuen Rezepts
 * @component CreateRecipePage
 */

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUtensils, FaPlus, FaUsers, FaHeart, FaStar, FaEdit } from 'react-icons/fa';
import RecipeForm from '../components/Recipe/RecipeForm';
import { createRecipe } from '../services/recipeService';
import { useNavigate } from 'react-router-dom';

/**
 * CreateRecipePage Komponente
 * Stellt ein Formular zum Erstellen eines neuen Rezepts bereit
 * @returns {JSX.Element} Die gerenderte CreateRecipePage Komponente
 */
const CreateRecipePage = () => {
  const navigate = useNavigate();

  /**
   * Verarbeitet das Erstellen eines neuen Rezepts
   * @param {Object} recipeData - Die Daten des neuen Rezepts
   */
  const handleSubmit = async (recipeData) => {
    try {
      const newRecipe = await createRecipe(recipeData);
      navigate(`/rezepte/${newRecipe.id}`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Rezepts:', error);
      throw error;
    }
  };

  /**
   * Behandelt das Abbrechen des Formulars
   */
  const handleCancel = () => {
    navigate('/rezepte');
  };

  const creativeFeatures = [
    {
      icon: FaUtensils,
      title: 'Einfach erstellen',
      description: 'Intuitive Benutzeroberfläche für schnelle Rezepteingabe',
      color: 'primary'
    },
    {
      icon: FaUsers,
      title: 'Mit der Community teilen',
      description: 'Ihre Kreationen werden von anderen entdeckt und geliebt',
      color: 'success'
    },
    {
      icon: FaHeart,
      title: 'Favoriten sammeln',
      description: 'Andere können Ihr Rezept als Favorit markieren',
      color: 'danger'
    },
    {
      icon: FaStar,
      title: 'Bewertungen erhalten',
      description: 'Feedback und Bewertungen von der Community',
      color: 'warning'
    }
  ];

  return (
    <>
      {/* Hero Section für Rezept erstellen */}
      <section className="create-recipe-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={8} className="mx-auto text-center">
                <div className="create-recipe-hero-content">
                  <div className="hero-icon-container mb-4">
                    <FaPlus size={80} className="text-warning mb-3 pulse-animation" />
                  </div>
                  <h1 className="display-3 fw-bold mb-4">
                    <span className="text-warning">Neues Rezept erstellen</span>
                  </h1>
                  <p className="lead text-white-50 mb-5 fs-4">
                    Teilen Sie Ihre kulinarischen Kreationen mit der Welt - 
                    von der Idee bis zum fertigen Gericht
                  </p>
                  <div className="creativity-stats">
                    <div className="stat-badge bg-warning text-dark px-4 py-2 rounded-pill fw-bold">
                      <FaStar className="me-2" />
                      Werden Sie kreativ!
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="recipe-inspiration py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary mb-3">Warum Ihr Rezept wichtig ist</h2>
              <p className="lead text-muted">
                Jedes Rezept erzählt eine Geschichte und bringt Menschen zusammen
              </p>
            </Col>
          </Row>
          
          <Row className="g-4 mb-5">
            {creativeFeatures.map((feature, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="inspiration-card h-100 border-0 shadow-sm text-center">
                  <Card.Body className="p-4">
                    <div className={`inspiration-icon bg-${feature.color} text-white mx-auto mb-4`} 
                         style={{ width: '70px', height: '70px', borderRadius: '50%' }}>
                      <feature.icon size={30} className="d-flex align-items-center justify-content-center h-100 mx-auto" />
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Recipe Form Section */}
      <section className="recipe-form-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <Card className="form-card shadow-lg border-0">
                <div className="card-header-custom bg-gradient-primary text-white p-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <FaEdit size={30} className="me-3 text-white" />
                    <h3 className="mb-0 fw-bold text-white">Rezept-Details eingeben</h3>
                  </div>
                  <p className="mb-0 mt-2 text-center text-white">
                    Füllen Sie die folgenden Felder aus, um Ihr Rezept zu erstellen
                  </p>
                </div>
                <Card.Body className="p-4">
                  <div className="create-recipe-page">
                    <RecipeForm onSubmit={handleSubmit} onCancel={handleCancel} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Tips Section */}
      <section className="recipe-tips py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h3 className="fw-bold text-primary mb-4">💡 Tipps für ein großartiges Rezept</h3>
              <Row className="g-4">
                <Col md={4}>
                  <div className="tip-item p-3">
                    <div className="tip-number bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      1
                    </div>
                    <h6 className="fw-bold">Klare Anweisungen</h6>
                    <small className="text-muted">Schritt-für-Schritt Anleitungen helfen beim Nachkochen</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="tip-item p-3">
                    <div className="tip-number bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      2
                    </div>
                    <h6 className="fw-bold">Appetitliche Fotos</h6>
                    <small className="text-muted">Ein gutes Bild macht Lust aufs Nachkochen</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="tip-item p-3">
                    <div className="tip-number bg-warning text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      3
                    </div>
                    <h6 className="fw-bold">Persönliche Note</h6>
                    <small className="text-muted">Fügen Sie Ihre eigenen Tipps und Variationen hinzu</small>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default CreateRecipePage; 