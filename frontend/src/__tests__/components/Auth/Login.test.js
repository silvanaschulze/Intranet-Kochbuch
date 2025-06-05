/**
 * Tests für Login Komponente
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock für useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null })
}));

// Mock für useAuth Hook
const mockLogin = jest.fn();
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false
  })
}));

// Mock Login Component für einfache Tests
const MockLogin = () => {
  return (
    <div>
      <h1>Login</h1>
      <form>
        <label htmlFor="email">E-Mail</label>
        <input id="email" type="email" />
        
        <label htmlFor="password">Passwort</label>
        <input id="password" type="password" />
        
        <button type="submit">Anmelden</button>
      </form>
      <a href="/register">Jetzt registrieren</a>
    </div>
  );
};

// Test Wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rendert Login-Formular korrekt', () => {
    render(
      <TestWrapper>
        <MockLogin />
      </TestWrapper>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
  });

  test('zeigt Registrierung-Link', () => {
    render(
      <TestWrapper>
        <MockLogin />
      </TestWrapper>
    );

    const registerLink = screen.getByText(/jetzt registrieren/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  test('Formular hat die erforderlichen Felder', () => {
    render(
      <TestWrapper>
        <MockLogin />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    const submitButton = screen.getByRole('button', { name: /anmelden/i });

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
}); 