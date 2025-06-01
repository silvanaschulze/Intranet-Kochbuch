/**
 * @fileoverview Startseite der Anwendung
 * @component HomePage
 */

import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

/**
 * HomePage Komponente
 * Zeigt die Startseite der Anwendung an
 * @returns {JSX.Element} Die gerenderte HomePage Komponente
 */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5 text-center">
      <h1 className="display-4 mb-4">Willkommen beim Intranet-Kochbuch</h1>
      <p className="lead mb-4">
        Entdecken Sie die kulinarische Vielfalt unserer Gemeinschaft
      </p>
      <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigate('/rezepte')}
        >
          Rezepte entdecken
        </Button>
        <Button 
          variant="outline-primary" 
          size="lg"
          onClick={() => navigate('/rezept-erstellen')}
        >
          Rezept erstellen
        </Button>
      </div>
    </Container>
  );
};

export default HomePage;