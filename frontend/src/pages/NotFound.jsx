import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaHome, FaUtensils, FaExclamationTriangle, FaSearch, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
  return (
    <>
      {/* Hero Section für 404 */}
      <section className="notfound-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-100">
              <Col lg={8} className="mx-auto text-center">
                <div className="notfound-content">
                  {/* Große 404 Nummer mit Animation */}
                  <div className="error-number-container mb-4">
                    <h1 className="error-number display-1 fw-bold text-warning">
                      4<span className="text-white">0</span>4
                    </h1>
                    <div className="floating-icons">
                      <FaUtensils className="floating-icon icon-1 text-warning" size={30} />
                      <FaExclamationTriangle className="floating-icon icon-2 text-danger" size={25} />
                      <FaSearch className="floating-icon icon-3 text-info" size={28} />
                    </div>
                  </div>

                  <h2 className="display-4 fw-bold text-white mb-4">
                    Seite nicht gefunden
                  </h2>
                  <p className="lead text-white-50 mb-5 fs-4">
                    Ups! Die angeforderte Seite scheint verschwunden zu sein, 
                    genau wie ein Keks aus der Dose. 🍪
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="d-flex gap-3 justify-content-center flex-wrap mb-5">
                    <Button 
                      as={Link} 
                      to="/" 
                      variant="warning" 
                      size="lg"
                      className="px-4 fw-bold"
                    >
                      <FaHome className="me-2" />
                      Zurück zur Startseite
                    </Button>
                    <Button 
                      as={Link} 
                      to="/rezepte" 
                      variant="outline-light" 
                      size="lg"
                      className="fw-bold"
                    >
                      <FaUtensils className="me-2" />
                      Rezepte entdecken
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Helpful Links Section */}
      <section className="helpful-links py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h3 className="fw-bold text-primary mb-3">Vielleicht finden Sie hier, was Sie suchen</h3>
              <p className="text-muted">Beliebte Bereiche unserer Kochbuch-Plattform</p>
            </Col>
          </Row>
          
          <Row className="g-4">
            <Col md={3} sm={6}>
              <Card className="h-100 border-0 shadow-sm text-center quick-link-card">
                <Card.Body className="p-4">
                  <div className="quick-link-icon bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaHome size={25} />
                  </div>
                  <h6 className="fw-bold mb-2">Startseite</h6>
                  <p className="text-muted small mb-3">Zurück zum Hauptmenü</p>
                  <Button as={Link} to="/" variant="outline-primary" size="sm">
                    Besuchen
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} sm={6}>
              <Card className="h-100 border-0 shadow-sm text-center quick-link-card">
                <Card.Body className="p-4">
                  <div className="quick-link-icon bg-warning text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaUtensils size={25} />
                  </div>
                  <h6 className="fw-bold mb-2">Alle Rezepte</h6>
                  <p className="text-muted small mb-3">Durchstöbern Sie unsere Sammlung</p>
                  <Button as={Link} to="/rezepte" variant="outline-warning" size="sm">
                    Entdecken
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} sm={6}>
              <Card className="h-100 border-0 shadow-sm text-center quick-link-card">
                <Card.Body className="p-4">
                  <div className="quick-link-icon bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaSearch size={25} />
                  </div>
                  <h6 className="fw-bold mb-2">Suche</h6>
                  <p className="text-muted small mb-3">Finden Sie spezifische Rezepte</p>
                  <Button as={Link} to="/rezepte" variant="outline-success" size="sm">
                    Suchen
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} sm={6}>
              <Card className="h-100 border-0 shadow-sm text-center quick-link-card">
                <Card.Body className="p-4">
                  <div className="quick-link-icon bg-info text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <FaArrowLeft size={25} />
                  </div>
                  <h6 className="fw-bold mb-2">Zurück</h6>
                  <p className="text-muted small mb-3">Zur vorherigen Seite</p>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => window.history.back()}
                  >
                    Zurück
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Fun Cooking Quote */}
      <section className="cooking-quote py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <div className="quote-container">
                <FaUtensils size={40} className="text-warning mb-3" />
                <blockquote className="blockquote mb-4">
                  <p className="mb-0 fs-4 fw-light fst-italic">
                    "Kochen ist eine Liebeserklärung an die Zukunft."
                  </p>
                </blockquote>
                <figcaption className="blockquote-footer text-white-50">
                  Ein weiser Koch
                </figcaption>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default NotFound; 