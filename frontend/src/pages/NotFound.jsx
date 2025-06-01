import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1">404</h1>
          <h2>Seite nicht gefunden</h2>
          <p className="lead">
            Die angeforderte Seite konnte leider nicht gefunden werden.
          </p>
          <Button as={Link} to="/" variant="primary">
            Zurück zur Startseite
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 