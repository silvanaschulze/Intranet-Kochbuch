/**
 * @fileoverview Footer-Komponente mit Links und Copyright-Information
 * @component Footer
 */

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Footer-Komponente
 * Zeigt Links, Copyright-Informationen und andere Footer-Inhalte an
 * @returns {JSX.Element} Die gerenderte Footer-Komponente
 */
const Footer = () => (
  <footer className="bg-dark text-light py-4">
    <Container>
      <Row>
        <Col md={4} className="mb-3 mb-md-0">
          <h5 className="text-white">Intranet-Kochbuch</h5>
          <p className="text-light small mb-0">
            Ihre digitale Plattform zum Teilen und Entdecken von Rezepten.
          </p>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <h5 className="text-white">Schnellzugriff</h5>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <Link to="/rezepte" className="text-light text-decoration-none">
                Alle Rezepte
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/kategorien" className="text-light text-decoration-none">
                Kategorien
              </Link>
            </li>
            <li>
              <Link to="/favoriten" className="text-light text-decoration-none">
               Favoriten
              </Link>
            </li>
          </ul>
        </Col>
        <Col md={4}>
          <h5 className="text-white">Legal</h5>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <Link to="/datenschutz" className="text-light text-decoration-none">
                Datenschutz
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/impressum" className="text-light text-decoration-none">
                Impressum
              </Link>
            </li>
            <li>
              <Link to="/nutzungsbedingungen" className="text-light text-decoration-none">
                Nutzungsbedingungen
              </Link>
            </li>
          </ul>
        </Col>
      </Row>
      <hr className="border-light opacity-25 my-4" />
      <Row>
        <Col className="text-center">
          <p className="text-light small mb-0">
            &copy; 2024 Intranet-Kochbuch. Entwickelt mit von Silvana Schulze.
          </p>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;