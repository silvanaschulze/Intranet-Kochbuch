/**
 * @fileoverview Komponente für Passwort-Wiederherstellung
 * @component ForgotPassword
 */

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { addNotification } from '../Layout/Layout';

// Validierungsschema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich')
});

/**
 * ForgotPassword Komponente
 * Stellt ein Formular für die Passwort-Wiederherstellung bereit
 * @returns {JSX.Element} Die gerenderte Komponente
 */
const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  const [serverError, setServerError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      await requestPasswordReset(values.email);
      setEmailSent(true);
      addNotification('Anweisungen zum Zurücksetzen des Passworts wurden gesendet!', 'success');
    } catch (err) {
      console.error('Fehler beim Zurücksetzen des Passworts:', err);
      setServerError(
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
              Passwort wiederherstellen
            </Card.Header>
            <Card.Body className="p-4">
              {serverError && (
                <Alert variant="danger" className="mb-4">
                  {serverError}
                </Alert>
              )}

              {emailSent ? (
                <Alert variant="success">
                  <Alert.Heading>E-Mail gesendet!</Alert.Heading>
                  <p>
                    Bitte überprüfen Sie Ihren Posteingang und folgen Sie den Anweisungen,
                    um Ihr Passwort zurückzusetzen. Der Link ist 1 Stunde gültig.
                  </p>
                  <hr />
                  <p className="mb-0">
                    Keine E-Mail erhalten?{' '}
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => setEmailSent(false)}
                    >
                      Erneut versuchen
                    </Button>
                  </p>
                </Alert>
              ) : (
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={ForgotPasswordSchema}
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
                    <Form noValidate onSubmit={handleSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label>E-Mail-Adresse</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && errors.email}
                          placeholder="ihre.email@beispiel.de"
                          autoComplete="email"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Geben Sie die E-Mail-Adresse ein, die mit Ihrem Konto verknüpft ist,
                          um Anweisungen zum Zurücksetzen des Passworts zu erhalten.
                        </Form.Text>
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
                            Wird gesendet...
                          </>
                        ) : (
                          'Anweisungen senden'
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </Card.Body>
            <Card.Footer className="text-center py-3 bg-light">
              <p className="mb-0">
                Passwort wieder eingefallen?{' '}
                <Link to="/login" className="text-primary text-decoration-none">
                  Zurück zum Login
                </Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword; 