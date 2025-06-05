/**
 * @fileoverview Startseite der Anwendung - Visuell reich
 * @component HomePage
 */

import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUtensils, FaUsers, FaHeart, FaUserTie, FaStar, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * HomePage Komponente
 * Zeigt die Startseite der Anwendung an
 * @returns {JSX.Element} Die gerenderte HomePage Komponente
 */
const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCreateRecipe = () => {
    if (isAuthenticated) {
      navigate('/rezept-erstellen');
    } else {
      navigate('/login');
    }
  };

  // Beispiel-Bilder für verschiedene Kategorien
  const featuredRecipes = [
    {
      title: "Italienische Pasta",
      image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Hauptgerichte"
    },
    {
      title: "Französische Desserts", 
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Desserts"
    },
    {
      title: "Gesunde Salate",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Vorspeisen"
    }
  ];

  const cookingImages = [
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      alt: "Chef beim Kochen"
    },
    {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", 
      alt: "Gemeinsam kochen"
    },
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      alt: "Professionelle Küche"
    }
  ];

  return (
    <>
      {/* Hero Section mit Hintergrundbild */}
      <section className="hero-section-home">
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={6}>
                <div className="hero-content-home">
                  <h1 className="display-3 fw-bold text-white mb-4">
                    Willkommen beim 
                    <span className="text-warning d-block">Intranet-Kochbuch</span>
                  </h1>
                  <p className="lead text-white-50 mb-4 fs-5">
                    Entdecken Sie die kulinarische Vielfalt unserer Gemeinschaft. 
                    Teilen Sie Ihre besten Rezepte und lassen Sie sich von anderen inspirieren.
                  </p>
                  <div className="d-flex gap-3 flex-wrap">
                    <Button 
                      as={Link} 
                      to="/rezepte" 
                      variant="warning" 
                      size="lg"
                      className="px-4 fw-bold"
                    >
                      <FaUtensils className="me-2" />
                      Rezepte entdecken
                    </Button>
                    <Button 
                      variant="outline-light" 
                      size="lg"
                      className="fw-bold"
                      onClick={handleCreateRecipe}
                    >
                      {isAuthenticated ? (
                        <>
                          <FaUserTie className="me-2" />
                          Rezept erstellen
                        </>
                      ) : (
                        '🔑 Jetzt anmelden'
                      )}
                    </Button>
                  </div>
                </div>
              </Col>
              <Col lg={6} className="d-none d-lg-block">
                <div className="hero-images">
                  <div className="floating-image floating-1">
                    <img 
                      src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Chef beim Kochen"
                      className="img-fluid rounded-circle shadow-lg"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="floating-image floating-2">
                    <img 
                      src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Leckeres Essen"
                      className="img-fluid rounded-3 shadow-lg"
                      style={{ width: '180px', height: '120px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="floating-image floating-3">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Gemeinsam kochen"
                      className="img-fluid rounded-3 shadow-lg"
                      style={{ width: '160px', height: '160px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="featured-recipes py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary mb-3">Beliebte Kategorien</h2>
              <p className="lead text-muted">
                Entdecken Sie unsere beliebtesten Rezeptkategorien
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {featuredRecipes.map((recipe, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border-0 shadow-sm recipe-card-home">
                  <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                    <Card.Img 
                      variant="top" 
                      src={recipe.image}
                      alt={recipe.title}
                      className="h-100 w-100"
                      style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    />
                    <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-dark bg-opacity-25 d-flex align-items-end">
                      <div className="p-3 text-white w-100">
                        <h5 className="mb-1 fw-bold">{recipe.title}</h5>
                        <small className="opacity-75">{recipe.category}</small>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Community Features */}
      <section className="community-features py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="display-5 fw-bold text-primary mb-4">
                Ihre kulinarische Community
              </h2>
              <p className="lead mb-4">
                Verbinden Sie sich mit Food-Enthusiasten, Köchen und allen, 
                die gerne neue Geschmackswelten entdecken.
              </p>
              
              <Row className="g-4 mb-4">
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div className="feature-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                      <FaUsers />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">Community</h6>
                      <small className="text-muted">Teilen und entdecken</small>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div className="feature-icon bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                      <FaHeart />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">Favoriten</h6>
                      <small className="text-muted">Sammeln und speichern</small>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div className="feature-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                      <FaStar />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">Bewertungen</h6>
                      <small className="text-muted">Feedback geben</small>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div className="feature-icon bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                      <FaClock />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">Schnell & Einfach</h6>
                      <small className="text-muted">Intuitive Bedienung</small>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="d-flex gap-3 flex-wrap">
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/rezepte')}
                >
                  <FaUtensils className="me-2" />
                  Rezepte durchstöbern
                </Button>
                {!isAuthenticated && (
                  <Button 
                    variant="outline-primary"
                    size="lg"
                    onClick={() => navigate('/register')}
                  >
                    Kostenlos registrieren
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className="community-images">
                <Row className="g-3">
                  {cookingImages.map((img, index) => (
                    <Col md={6} key={index}>
                      <div className={`cooking-image cooking-image-${index + 1}`}>
                        <img 
                          src={img.image}
                          alt={img.alt}
                          className="img-fluid rounded-3 shadow"
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-3">
                Bereit zum Kochen?
              </h2>
              <p className="lead mb-4">
                Werden Sie Teil unserer kulinarischen Community und entdecken Sie 
                endlose Möglichkeiten in der Welt des Kochens.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  variant="warning" 
                  size="lg"
                  className="fw-bold"
                  onClick={handleCreateRecipe}
                >
                  {isAuthenticated ? (
                    <>
                      <FaUserTie className="me-2" />
                      Mein erstes Rezept erstellen
                    </>
                  ) : (
                    <>
                      <FaUsers className="me-2" />
                      Jetzt registrieren
                    </>
                  )}
                </Button>
                <Button 
                  as={Link}
                  to="/uber"
                  variant="outline-light" 
                  size="lg"
                  className="fw-bold"
                >
                  Mehr erfahren
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default HomePage;