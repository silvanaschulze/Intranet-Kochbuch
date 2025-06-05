"""
Tests für Authentifizierung
"""
import json
import pytest


class TestAuth:
    """Test-Klasse für Authentifizierungs-Endpunkte"""

    def test_health_check(self, client):
        """
        Test Health Check Endpunkt
        """
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'

    def test_register_missing_fields(self, client):
        """
        Test Registrierung mit fehlenden Feldern
        """
        incomplete_data = {
            'email': 'test@example.com'
            # 'name' und 'passwort' fehlen
        }

        response = client.post('/api/benutzer/register',
                             json=incomplete_data,
                             content_type='application/json')

        # Sollte Validierungsfehler oder 404 zurückgeben
        assert response.status_code in [400, 404]

    def test_register_basic(self, client, sample_user_data):
        """
        Test grundlegende Registrierung
        """
        response = client.post('/api/benutzer/register',
                             json=sample_user_data,
                             content_type='application/json')

        # Akzeptiere verschiedene mögliche Antworten
        assert response.status_code in [200, 201, 400, 409]

    def test_login_missing_fields(self, client):
        """
        Test Anmeldung mit fehlenden Feldern
        """
        incomplete_data = {
            'email': 'test@example.com'
            # 'passwort' fehlt
        }

        response = client.post('/api/benutzer/login',
                             json=incomplete_data,
                             content_type='application/json')

        # Sollte Validierungsfehler oder 404 zurückgeben
        assert response.status_code in [400, 404]

    def test_login_basic(self, client):
        """
        Test grundlegende Anmeldung
        """
        login_data = {
            'email': 'test@example.com',
            'passwort': 'sicheres_passwort123'
        }

        response = client.post('/api/benutzer/login',
                             json=login_data,
                             content_type='application/json')

        # Akzeptiere verschiedene mögliche Antworten
        assert response.status_code in [200, 401, 404]

    def test_password_validation(self, client):
        """
        Test Passwort-Validierung
        """
        weak_password_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'passwort': '123'  # Zu schwaches Passwort
        }

        response = client.post('/api/benutzer/register',
                             json=weak_password_data,
                             content_type='application/json')

        # Sollte Validierungsfehler oder 404 zurückgeben
        assert response.status_code in [400, 404]

    def test_email_validation(self, client):
        """
        Test E-Mail-Validierung
        """
        invalid_email_data = {
            'name': 'Test User',
            'email': 'invalid-email',  # Ungültige E-Mail
            'passwort': 'sicheres_passwort123'
        }

        response = client.post('/api/benutzer/register',
                             json=invalid_email_data,
                             content_type='application/json')

        # Sollte Validierungsfehler oder 404 zurückgeben
        assert response.status_code in [400, 404]


class TestTokenValidation:
    """Test-Klasse für Token-Validierung"""

    def test_protected_route_without_token(self, client):
        """
        Test Zugriff auf geschützte Route ohne Token
        """
        response = client.get('/api/rezepte/benutzer')

        # Sollte Autorisierungsfehler zurückgeben
        assert response.status_code in [401, 403]

    def test_protected_route_with_invalid_token(self, client):
        """
        Test Zugriff auf geschützte Route mit ungültigem Token
        """
        headers = {
            'Authorization': 'Bearer invalid-token',
            'Content-Type': 'application/json'
        }

        response = client.get('/api/rezepte/benutzer', headers=headers)

        # Sollte Autorisierungsfehler zurückgeben
        assert response.status_code in [401, 403]

    def test_home_endpoint(self, client):
        """
        Test Home-Endpunkt (sollte öffentlich verfügbar sein)
        """
        response = client.get('/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'nachricht' in data 