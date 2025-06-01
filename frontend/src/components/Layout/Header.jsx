/**
 * @fileoverview Header-Komponente mit Navigation und Authentifizierungsstatus
 * @component Header
 */

import React, { useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaUser, FaBook, FaHeart, FaSignOutAlt } from 'react-icons/fa';

/**
 * Header-Komponente mit Navigationsmenü
 * Zeigt verschiedene Menüoptionen basierend auf dem Authentifizierungsstatus an
 * @returns {JSX.Element} Die gerenderte Header-Komponente
 */
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const userName = user?.name || user?.email || 'Benutzer';

  return (
    <Navbar 
      bg={theme === 'dark' ? 'dark' : 'light'} 
      variant={theme === 'dark' ? 'dark' : 'light'} 
      expand="lg" 
      className="border-bottom"
      fixed="top"
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/"
          className="d-flex align-items-center"
        >
          <img
            src="/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="Intranet-Kochbuch Logo"
          />
          <span className="d-none d-sm-inline">Intranet-Kochbuch</span>
        </Navbar.Brand>

        <div className="d-flex align-items-center order-lg-2">
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
            size="sm"
            className="me-2"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </Button>
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            className="ms-2"
          />
        </div>

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
                    <FaUser className="me-2" />
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
  );
};

export default Header;
