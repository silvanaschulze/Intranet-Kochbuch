/**
 * @fileoverview Header-Komponente mit Navigation und Authentifizierungsstatus
 * @component Header
 */

import React, { useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Image, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBook, FaHeart, FaSignOutAlt, FaUtensils, FaClock } from 'react-icons/fa';
import api from '../../services/api';

/**
 * Header-Komponente mit Navigationsmenü
 * Zeigt verschiedene Menüoptionen basierend auf dem Authentifizierungsstatus an
 * @returns {JSX.Element} Die gerenderte Header-Komponente
 */
const Header = () => {
  const { isAuthenticated, user, logout, sessionExpiredMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Auth Status:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  /**
   * Behandelt den Logout-Prozess
   * Löscht den Token und leitet zur Login-Seite weiter
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Erstellt vollständige URL für Profilbild
   * @param {string} imagePath - Relativer oder absoluter Pfad zum Bild
   * @returns {string} Vollständige URL zum Profilbild
   */
  const getProfileImageUrl = (imagePath) => {
    console.log('🖼️ Header getProfileImageUrl Debug:', {
      imagePath,
      baseURL: api.defaults.baseURL,
      userProfilbild: user?.profilbild
    });
    
    if (!imagePath) {
      console.log('🖼️ Keine imagePath, verwende Placeholder');
      return 'https://via.placeholder.com/32x32/667eea/ffffff?text=User';
    }
    
    // Falls bereits vollständige URL, direkt zurückgeben
    if (imagePath.startsWith('http')) {
      console.log('🖼️ Vollständige URL erkannt:', imagePath);
      return imagePath;
    }
    
    // Vollständige URL mit API-Basis erstellen
    let fullUrl;
    if (imagePath.startsWith('static/')) {
      // Hat bereits den vollständigen Pfad
      fullUrl = `${api.defaults.baseURL}/${imagePath}`;
    } else {
      // Hat nur den Dateinamen - static/profile_images/ hinzufügen
      fullUrl = `${api.defaults.baseURL}/static/profile_images/${imagePath}`;
    }
    
    console.log('🖼️ Vollständige URL erstellt:', fullUrl);
    return fullUrl;
  };

  const userName = user?.name || user?.email || 'Benutzer';

  return (
    <>
      {/* Warnung für abgelaufene Sitzung */}
      {sessionExpiredMessage && (
        <Alert variant="warning" className="mb-0 text-center">
          <strong><FaClock className="me-1" /> {sessionExpiredMessage}</strong>
        </Alert>
      )}
      
      <Navbar 
        bg="light" 
        variant="light" 
        expand="lg" 
        className="border-bottom"
        fixed="top"
        style={{ top: sessionExpiredMessage ? '48px' : '0' }}
      >
        <Container>
          <Navbar.Brand 
            as={Link} 
            to="/"
            className="d-flex align-items-center"
          >
            <img
              src="/logo-kochbuch.svg"
              width="32"
              height="32"
              className="d-inline-block align-top me-2"
              alt="Intranet-Kochbuch Logo"
              onError={(e) => {
                // Fallback für Emoji, falls das SVG nicht lädt
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span 
              style={{ display: 'none', fontSize: '1.5rem' }}
              role="img" 
              aria-label="cooking"
            >
              <FaUtensils />
            </span>
            <span className="d-none d-sm-inline fw-bold">Intranet-Kochbuch</span>
          </Navbar.Brand>

          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            className="ms-2"
          />

          <Navbar.Collapse id="basic-navbar-nav" className="order-lg-1">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                active={location.pathname === '/'}
                className="px-3"
              >
                Startseite
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/uber" 
                active={location.pathname === '/uber'}
                className="px-3"
              >
                Über
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/rezepte" 
                active={location.pathname === '/rezepte'}
                className="px-3"
              >
                Rezepte
              </Nav.Link>
              {isAuthenticated && (
                <Nav.Link 
                  as={Link} 
                  to="/rezept-erstellen"
                  active={location.pathname === '/rezept-erstellen'}
                  className="px-3"
                >
                  Rezept erstellen
                </Nav.Link>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      <Image
                        src={getProfileImageUrl(user?.profilbild)}
                        width={32}
                        height={32}
                        className="rounded-circle me-2"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/32x32/667eea/ffffff?text=User';
                        }}
                      />
                      <span className="d-none d-sm-inline">{userName}</span>
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                  className="px-3"
                >
                  <NavDropdown.Item 
                    as={Link} 
                    to="/profil"
                    active={location.pathname === '/profil'}
                  >
                    <FaUser className="me-2" />
                    Mein Profil
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    as={Link} 
                    to="/meine-rezepte"
                    active={location.pathname === '/meine-rezepte'}
                  >
                    <FaBook className="me-2" />
                    Meine Rezepte
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    as={Link} 
                    to="/favoriten"
                    active={location.pathname === '/favoriten'}
                  >
                    <FaHeart className="me-2" />
                    Meine Favoriten
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item 
                    onClick={handleLogout}
                    className="text-danger"
                  >
                    <FaSignOutAlt className="me-2" />
                    Abmelden
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <div className="d-flex flex-column flex-sm-row">
                  <Nav.Link 
                    as={Link} 
                    to="/login"
                    active={location.pathname === '/login'}
                    className="px-3"
                  >
                    Anmelden
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/register"
                    active={location.pathname === '/register'}
                    className="px-3"
                  >
                    Registrieren
                  </Nav.Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
