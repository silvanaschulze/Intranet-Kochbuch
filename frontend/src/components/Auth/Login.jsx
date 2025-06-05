/**
 * @fileoverview Login-Komponente zur Benutzeranmeldung
 * @component Login
 */

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addNotification } from '../Layout/Layout';

// Login-Schema für Formularvalidierung
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  password: Yup.string()
    .required('Passwort ist erforderlich')
});

/**
 * Login-Komponente
 * Behandelt die Benutzeranmeldung mit E-Mail und Passwort
 * @returns {JSX.Element} Gerenderte Login-Komponente
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');

  // Prüfen, ob eine Weiterleitungs-URL vorhanden ist
  const from = location.state?.from?.pathname || '/rezepte';

  // Benachrichtigung anzeigen, wenn Benutzer von geschützter Route weitergeleitet wurde
  useEffect(() => {
    if (location.state?.from) {
      addNotification('Bitte melden Sie sich an, um fortzufahren', 'info');
    }
  }, [location.state]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError('');
      await login(values.email, values.password);
      addNotification('Anmeldung erfolgreich!', 'success');
      navigate(from);
    } catch (err) {
      console.error('Fehler beim Anmelden:', err);
      setLoginError(
        err.message || 
        'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="shadow">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Anmelden
            </Card.Header>
            <Card.Body className="p-4">
              {loginError && (
                <Alert variant="danger" className="mb-4">
                  {loginError}
                </Alert>
              )}

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>E-Mail</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                        placeholder="ihre.email@beispiel.com"
                        autoComplete="email"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Passwort</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                        placeholder="Ihr Passwort"
                        autoComplete="current-password"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                      <div className="d-flex justify-content-end mt-1">
                        <Link 
                          to="/passwort-vergessen" 
                          className="text-primary text-decoration-none small"
                        >
                          Passwort vergessen?
                        </Link>
                      </div>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mb-3" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Anmelden...
                        </>
                      ) : (
                        'Anmelden'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="text-center py-3 bg-light">
              <p className="mb-0">
                Noch kein Konto?{' '}
                <Link to="/register" className="text-primary text-decoration-none">
                  Registrieren
                </Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
