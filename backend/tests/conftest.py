"""
Konfiguration für pytest - Test-Setup für das Intranet-Kochbuch Backend
"""

import pytest
import sys
import os
from pathlib import Path

# Backend-Verzeichnis zum Python-Pfad hinzufügen
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import create_app

@pytest.fixture(scope='session')
def app():
    """
    Flask-App für Tests erstellen
    """
    # Test-Konfiguration
    test_config = {
        'TESTING': True,
        'SECRET_KEY': 'test-secret-key',
        'DATABASE_URL': 'mysql://test_user:test_password@localhost/test_kochbuch',
        'SSL_ENABLED': False
    }
    
    app = create_app(test_config)
    
    # Test-Kontext erstellen
    with app.app_context():
        yield app

@pytest.fixture(scope='session')
def client(app):
    """
    Test-Client für API-Anfragen
    """
    return app.test_client()

@pytest.fixture(scope='function')
def auth_headers():
    """
    Authentifizierungs-Header für Tests
    """
    # Mock JWT Token für Tests
    return {
        'Authorization': 'Bearer test-jwt-token',
        'Content-Type': 'application/json'
    }

@pytest.fixture(scope='function') 
def sample_user():
    """
    Beispiel-Benutzer für Tests
    """
    return {
        'id': 1,
        'name': 'Test Benutzer',
        'email': 'test@example.com',
        'rolle': 'user'
    }

@pytest.fixture(scope='function') 
def sample_user_data():
    """
    Beispiel-Benutzerdaten für Registrierung
    """
    return {
        'name': 'Test Benutzer',
        'email': 'test@example.com',
        'passwort': 'sicheres_passwort123'
    }

@pytest.fixture(scope='function')
def sample_recipe():
    """
    Beispiel-Rezept für Tests
    """
    return {
        'id': 1,
        'titel': 'Test Rezept',
        'zutaten': [
            {'name': 'Mehl', 'menge': '500', 'einheit': 'g'},
            {'name': 'Wasser', 'menge': '300', 'einheit': 'ml'}
        ],
        'zubereitung': 'Mehl und Wasser vermischen.',
        'zubereitungszeit': '30 Minuten',
        'schwierigkeitsgrad': 'Einfach',
        'kategorie_id': 1,
        'benutzer_id': 1
    }

@pytest.fixture(scope='function')
def sample_recipe_data():
    """
    Beispiel-Rezeptdaten für Erstellung
    """
    return {
        'titel': 'Test Rezept',
        'zutaten': [
            {'name': 'Mehl', 'menge': '500', 'einheit': 'g'},
            {'name': 'Wasser', 'menge': '300', 'einheit': 'ml'}
        ],
        'zubereitung': 'Mehl und Wasser vermischen.',
        'zubereitungszeit': '30 Minuten',
        'schwierigkeitsgrad': 'Einfach',
        'kategorie_id': 1
    } 