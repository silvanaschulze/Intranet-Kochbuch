/**
 * @fileoverview Login-Seite für die Benutzerauthentifizierung
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
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  password: Yup.string()
    .required('Senha é obrigatória')
});

/**
 * Login Componente
 * Fornece um formulário para autenticação do usuário
 * @returns {JSX.Element} Componente renderizado
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');

  // Verifica se há uma URL de redirecionamento
  const from = location.state?.from?.pathname || '/rezepte';

  // Mostra notificação se o usuário foi redirecionado de uma rota protegida
  useEffect(() => {
    if (location.state?.from) {
      addNotification('Por favor, faça login para continuar', 'info');
    }
  }, [location.state]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError('');
      await login(values.email, values.password);
      addNotification('Login realizado com sucesso!', 'success');
      navigate(from);
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setLoginError(
        err.message || 
        'Ocorreu um erro. Por favor, tente novamente mais tarde.'
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
              Login
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
                      <Form.Label>E-mail</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                        placeholder="seu.email@exemplo.com"
                        autoComplete="email"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                        placeholder="Sua senha"
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
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="text-center py-3 bg-light">
              <p className="mb-0">
                Ainda não tem uma conta?{' '}
                <Link to="/register" className="text-primary text-decoration-none">
                  Cadastre-se
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
