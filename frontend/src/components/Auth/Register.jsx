/**
 * @fileoverview Registrierungsseite für neue Benutzer
 * @component Register
 */

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addNotification } from '../Layout/Layout';
import * as Yup from 'yup';
import { Formik } from 'formik';

// Validierungsschema für das Registrierungsformular
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(50, 'Name darf maximal 50 Zeichen lang sein')
    .required('Name ist erforderlich'),
  email: Yup.string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  password: Yup.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten'
    )
    .required('Passwort ist erforderlich'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwörter müssen übereinstimmen')
    .required('Passwortbestätigung ist erforderlich')
});

/**
 * Register Komponente
 * Stellt ein Formular für die Benutzerregistrierung bereit
 * @returns {JSX.Element} Die gerenderte Register Komponente
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      await register(values.name, values.email, values.password);
      addNotification('Registrierung erfolgreich! Willkommen bei Intranet-Kochbuch.', 'success');
      navigate('/rezepte');
    } catch (err) {
      console.error('Registrierungsfehler:', err);
      setServerError(
        err.message || 
        'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      );
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="shadow">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Registrieren
            </Card.Header>
            <Card.Body className="p-4">
              {serverError && (
                <Alert variant="danger" className="mb-4">
                  {serverError}
                </Alert>
              )}

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                }}
                validationSchema={RegisterSchema}
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
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                        placeholder="Ihr Name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
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
                        placeholder="Mindestens 8 Zeichen"
                        autoComplete="new-password"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, 
                        einen Kleinbuchstaben und eine Zahl enthalten.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Passwort bestätigen</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.confirmPassword && errors.confirmPassword}
                        placeholder="Passwort wiederholen"
                        autoComplete="new-password"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
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
                          Registrierung läuft...
                        </>
                      ) : (
                        'Registrieren'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="text-center py-3 bg-light">
              <p className="mb-0">
                Bereits registriert?{' '}
                <Link to="/login" className="text-primary text-decoration-none">
                  Jetzt anmelden
                </Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
