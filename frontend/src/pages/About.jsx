/**
 * @fileoverview Über das Projekt - Seite mit Projektinformationen
 * @component AboutPage
 */

import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaUtensils, FaBullseye, FaUsers, FaCode, FaHeart, FaLaptopCode, FaDatabase, FaPalette, FaRocket, FaGraduationCap, FaHandshake } from 'react-icons/fa';

/**
 * About Komponente
 * Zeigt Informationen über das Projekt, Entwicklerin und Technologien an
 * @returns {JSX.Element} Die gerenderte About Komponente
 */
const About = () => {
  const technologies = [
    { name: 'React.js', category: 'Frontend', color: 'info' },
    { name: 'Python', category: 'Backend', color: 'success' },
    { name: 'Flask', category: 'Backend', color: 'success' },
    { name: 'MySQL', category: 'Database', color: 'warning' },
    { name: 'Bootstrap', category: 'UI', color: 'primary' },
    { name: 'JWT', category: 'Auth', color: 'danger' }
  ];

  const features = [
    {
      icon: FaUsers,
      title: 'Benutzerprofile',
      description: 'Personalisierte Profile mit Profilbildern und persönlichen Informationen für eine individuelle Erfahrung.',
      color: 'success'
    },
    {
      icon: FaHeart,
      title: 'Favoriten-System',
      description: 'Markiere deine Lieblingsrezepte und greife schnell darauf zu. Erstelle deine persönliche Sammlung.',
      color: 'danger'
    },
    {
      icon: FaUtensils,
      title: 'Rezeptverwaltung',
      description: 'Erstelle, bearbeite und teile deine Rezepte mit der Community. Vollständige CRUD-Funktionalität.',
      color: 'warning'
    },
    {
      icon: FaPalette,
      title: 'Modernes Design',
      description: 'Responsive und benutzerfreundliche Oberfläche mit professionellem Design und intuitive Navigation.',
      color: 'info'
    },
    {
      icon: FaRocket,
      title: 'Performance',
      description: 'Optimierte Ladezeiten und effiziente Datenverarbeitung für eine reibungslose Benutzererfahrung.',
      color: 'primary'
    },
    {
      icon: FaHandshake,
      title: 'Community',
      description: 'Verbinde dich mit anderen Kochbegeisterten und teile deine kulinarischen Erfahrungen.',
      color: 'secondary'
    }
  ];

  return (
    <>
      {/* Hero Section mit Hintergrundbild */}
      <section className="about-hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={8} className="mx-auto text-center">
                <div className="about-hero-content">
                  <h1 className="display-2 fw-bold text-white mb-4">
                    <span className="text-warning">Über das Intranet-Kochbuch</span>
                  </h1>
                  <p className="lead text-white-50 mb-5 fs-4">
                    Ein modernes Rezept-Management-System, das Technologie und Kulinarik 
                    in einer benutzerfreundlichen Plattform vereint
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Projekt-Übersicht mit visuellen Elementen */}
      <section className="project-overview py-5 bg-light">
        <Container>
          <Row className="align-items-center mb-5">
            <Col lg={6}>
              <div className="project-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professionelles Kochen"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>
            </Col>
            <Col lg={6}>
              <h2 className="display-5 fw-bold text-primary mb-4">
                Willkommen in unserem digitalen Kochbuch!
              </h2>
              <p className="text-muted lead mb-4">
                Unser Intranet-Kochbuch ist eine innovative Plattform, die es Mitarbeitern ermöglicht, 
                ihre Lieblingsrezepte zu teilen, zu entdecken und gemeinsam kulinarische Erfahrungen zu sammeln.
              </p>
              <p className="text-muted mb-4">
                Mit modernster Webtechnologie entwickelt, bietet unsere Anwendung eine nahtlose 
                Erfahrung zwischen Desktop und Mobile, um Ihre kulinarische Reise zu begleiten.
              </p>
              <div className="tech-badges mb-4">
                {technologies.map((tech, index) => (
                  <Badge key={index} bg={tech.color} className="me-2 mb-2 p-2 fs-6">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Team-Sektion mit professionellem Design */}
      <section className="team-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary mb-3">Das Team</h2>
              <p className="lead text-muted">Entwickelt mit Leidenschaft für moderne Technologien</p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="team-card shadow-lg border-0 overflow-hidden">
                <div className="team-card-header bg-primary text-white p-4">
                  <Row className="align-items-center">
                    <Col lg={4} className="text-center">
                      <div className="team-avatar bg-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                        <FaGraduationCap size={50} className="text-primary" />
                      </div>
                    </Col>
                    <Col lg={8}>
                      <h3 className="mb-2 text-white">Silvana Schulze</h3>
                      <p className="mb-3 text-white" style={{ opacity: 0.9 }}>Webentwicklung Studentin</p>
                      <div className="d-flex flex-wrap gap-2">
                        <Badge bg="info" text="white" className="p-2">React.js</Badge>
                        <Badge bg="success" text="white" className="p-2">Python</Badge>
                        <Badge bg="warning" text="white" className="p-2">MySQL</Badge>
                        <Badge bg="primary" text="white" className="p-2">UI/UX</Badge>
                      </div>
                    </Col>
                  </Row>
                </div>
                <Card.Body className="p-4 bg-white">
                  <p className="text-dark mb-4">
                    Studentin der Webentwicklung mit Leidenschaft für moderne 
                    Frontend-Technologien und benutzerfreundliche Interfaces. 
                    Spezialisiert auf React.js, responsive Design und moderne 
                    Webentwicklungsstandards.
                  </p>
                  <p className="text-secondary small">
                    Dieses Projekt entstand als Teil des Studiums und demonstriert 
                    moderne Webentwicklungstechniken mit React, Python/Flask und MySQL. 
                    Es zeigt eine vollständige Full-Stack-Anwendung mit professionellem 
                    Design und umfassender Funktionalität.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section mit visuellen Icons */}
      <section className="features-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary mb-3">Hauptfunktionen</h2>
              <p className="lead text-muted">Entdecken Sie die vielfältigen Möglichkeiten unserer Plattform</p>
            </Col>
          </Row>
          
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <Card className="feature-card h-100 border-0 shadow-sm text-center">
                  <Card.Body className="p-4">
                    <div className={`feature-icon-container bg-${feature.color} text-white mx-auto mb-4`} 
                         style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                      <feature.icon size={35} className="d-flex align-items-center justify-content-center h-100 mx-auto" />
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

      {/* Tecnologia-Details */}
      <section className="tech-details py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold text-primary mb-4">
                <FaCode className="me-3" />
                Technologie-Stack
              </h2>
              
              <Row className="mb-4">
                <Col sm={6}>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Body className="p-3">
                      <h6 className="text-primary mb-3 fw-bold">
                        <FaLaptopCode className="me-2" />
                        Frontend
                      </h6>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">✓ React.js mit Hooks</li>
                        <li className="mb-2">✓ React Bootstrap</li>
                        <li className="mb-2">✓ React Router</li>
                        <li className="mb-2">✓ Axios für API-Kommunikation</li>
                        <li className="mb-2">✓ React Icons</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col sm={6}>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Body className="p-3">
                      <h6 className="text-success mb-3 fw-bold">
                        <FaDatabase className="me-2" />
                        Backend
                      </h6>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">✓ Python mit Flask</li>
                        <li className="mb-2">✓ MySQL Datenbank</li>
                        <li className="mb-2">✓ JWT-Authentifizierung</li>
                        <li className="mb-2">✓ Werkzeug für Datei-Uploads</li>
                        <li className="mb-2">✓ CORS & Security</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
            
            <Col lg={6}>
              <div className="tech-visualization">
                <img 
                  src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Webentwicklung"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ width: '100%', height: '350px', objectFit: 'cover' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Projektziele Section */}
      <section className="goals-section py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4">
                <FaBullseye className="me-3" />
                Projektziele
              </h2>
              <p className="lead mb-5">
                Unser Ziel ist es, eine benutzerfreundliche und moderne Plattform zu schaffen, 
                die das Teilen und Entdecken von Rezepten zu einem angenehmen Erlebnis macht.
              </p>
              
              <Row className="g-4">
                <Col md={3} sm={6}>
                  <div className="goal-item text-center">
                    <div className="goal-number bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '60px', height: '60px' }}>
                      1
                    </div>
                    <h6 className="fw-bold">Benutzerfreundlichkeit</h6>
                    <small className="opacity-75">Intuitive Navigation und klare Struktur</small>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="goal-item text-center">
                    <div className="goal-number bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '60px', height: '60px' }}>
                      2
                    </div>
                    <h6 className="fw-bold">Moderne Technologie</h6>
                    <small className="opacity-75">Aktuelle Web-Standards und Best Practices</small>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="goal-item text-center">
                    <div className="goal-number bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '60px', height: '60px' }}>
                      3
                    </div>
                    <h6 className="fw-bold">Sicherheit</h6>
                    <small className="opacity-75">Sichere Authentifizierung und Datenschutz</small>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="goal-item text-center">
                    <div className="goal-number bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '60px', height: '60px' }}>
                      4
                    </div>
                    <h6 className="fw-bold">Community</h6>
                    <small className="opacity-75">Verbindung zwischen Kochbegeisterten</small>
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

export default About; 