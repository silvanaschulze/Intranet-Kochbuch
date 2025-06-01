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
          <h5>Intranet-Kochbuch</h5>
          <p className="text-muted small mb-0">
            Sua plataforma digital para compartilhar e descobrir receitas.
          </p>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <h5>Acesso Rápido</h5>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <Link to="/rezepte" className="text-light text-decoration-none">
                Todas as Receitas
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/kategorien" className="text-light text-decoration-none">
                Categorias
              </Link>
            </li>
            <li>
              <Link to="/favoriten" className="text-light text-decoration-none">
                Favoritos
              </Link>
            </li>
          </ul>
        </Col>
        <Col md={4}>
          <h5>Legal</h5>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <Link to="/datenschutz" className="text-light text-decoration-none">
                Privacidade
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/impressum" className="text-light text-decoration-none">
                Impressum
              </Link>
            </li>
            <li>
              <Link to="/nutzungsbedingungen" className="text-light text-decoration-none">
                Termos de Uso
              </Link>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
