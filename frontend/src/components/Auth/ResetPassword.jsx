/**
 * @fileoverview Komponente zum Zurücksetzen des Passworts mit Token
 * @component ResetPassword
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { addNotification } from '../Layout/Layout';

// Validierungsschema
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten'
    )
    .required('Passwort ist erforderlich'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Die Passwörter müssen übereinstimmen')
    .required('Passwortbestätigung ist erforderlich')
});

/**
 * ResetPassword Komponente
 * Stellt ein Formular zum Zurücksetzen des Passworts mit Token bereit
 * @returns {JSX.Element} Die gerenderte Komponente
 */
const ResetPassword = () => {
  const { resetPassword, validateResetToken } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();
  const [serverError, setServerError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await validateResetToken(token);
        setIsValidToken(true);
      } catch (err) {
        setServerError('Ungültiger oder abgelaufener Token. Bitte fordern Sie ein neues Passwort-Reset an.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, validateResetToken]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      await resetPassword(token, values.password);
      addNotification('Passwort wurde erfolgreich zurückgesetzt!', 'success');
      navigate('/login');
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

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <span className="spinner-border text-primary" role="status" />
        <p className="mt-2">Token wird überprüft...</p>
      </Container>
    );
  }

  if (!isValidToken) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Alert variant="danger">
              <Alert.Heading>Ungültiger Token</Alert.Heading>
              <p>{serverError}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Link to="/forgot-password" className="btn btn-outline-danger">
                  Neues Passwort-Reset anfordern
                </Link>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="shadow">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Passwort zurücksetzen
            </Card.Header>
            <Card.Body className="p-4">
              {serverError && (
                <Alert variant="danger" className="mb-4">
                  {serverError}
                </Alert>
              )}

              <Formik
                initialValues={{
                  password: '',
                  confirmPassword: ''
                }}
                validationSchema={ResetPasswordSchema}
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
                      <Form.Label>Neues Passwort</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                        placeholder="Geben Sie Ihr neues Passwort ein"
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
                      <Form.Label>Neues Passwort bestätigen</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.confirmPassword && errors.confirmPassword}
                        placeholder="Bestätigen Sie Ihr neues Passwort"
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
                          Wird zurückgesetzt...
                        </>
                      ) : (
                        'Passwort zurücksetzen'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword; 