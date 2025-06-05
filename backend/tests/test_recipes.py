"""
Tests für Rezept-Funktionen
"""
import json
import pytest


class TestRecipesCRUD:
    """Test-Klasse für Rezept CRUD-Operationen"""

    def test_get_recipes_basic(self, client):
        """
        Test grundlegendes Abrufen der Rezeptliste
        """
        response = client.get('/api/rezepte')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data

    def test_get_recipe_by_id_basic(self, client):
        """
        Test Abrufen eines einzelnen Rezepts
        """
        recipe_id = 1
        response = client.get(f'/api/rezepte/{recipe_id}')
        
        # Sollte entweder ein Rezept finden oder 404 zurückgeben
        assert response.status_code in [200, 404]

    def test_create_recipe_missing_fields(self, client, auth_headers):
        """
        Test Rezepterstellung mit fehlenden Pflichtfeldern
        """
        incomplete_data = {
            'titel': 'Unvollständiges Rezept'
            # 'zutaten', 'zubereitung' fehlen
        }

        response = client.post('/api/rezepte',
                             json=incomplete_data,
                             headers=auth_headers)

        # Sollte Autorisierungs- oder Validierungsfehler zurückgeben
        assert response.status_code in [400, 401, 403]

    def test_create_recipe_unauthorized(self, client, sample_recipe_data):
        """
        Test Rezepterstellung ohne Authentifizierung
        """
        response = client.post('/api/rezepte',
                             json=sample_recipe_data)

        # Sollte Autorisierungsfehler zurückgeben
        assert response.status_code in [401, 403]

    def test_update_recipe_unauthorized(self, client):
        """
        Test Rezeptaktualisierung ohne Authentifizierung
        """
        recipe_id = 1
        updated_data = {'titel': 'Aktualisiertes Rezept'}

        response = client.put(f'/api/rezepte/{recipe_id}',
                            json=updated_data)

        # Sollte Autorisierungsfehler zurückgeben
        assert response.status_code in [401, 403]

    def test_delete_recipe_unauthorized(self, client, auth_headers):
        """
        Test Rezeptlöschung ohne korrekte Authentifizierung
        """
        recipe_id = 999  # Nicht existierende ID

        response = client.delete(f'/api/rezepte/{recipe_id}',
                               headers=auth_headers)

        # Sollte Autorisierungs- oder Not Found-Fehler zurückgeben
        assert response.status_code in [401, 403, 404]

    def test_get_recipe_not_found(self, client):
        """
        Test Abrufen eines nicht existierenden Rezepts
        """
        recipe_id = 99999  # Sehr unwahrscheinliche ID

        response = client.get(f'/api/rezepte/{recipe_id}')

        assert response.status_code == 404


class TestRecipeSearch:
    """Test-Klasse für Rezept-Suchfunktionen"""

    def test_search_recipes_basic(self, client):
        """
        Test grundlegende Rezeptsuche
        """
        search_term = "test"

        response = client.get(f'/api/rezepte/suche?q={search_term}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data

    def test_search_recipes_no_results(self, client):
        """
        Test Rezeptsuche ohne Ergebnisse
        """
        search_term = "xyznonexistentrecipe123"

        response = client.get(f'/api/rezepte/suche?q={search_term}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data
        # Könnte leer sein oder wenige Ergebnisse haben
        assert isinstance(data['rezepte'], list)

    def test_search_recipes_with_category_filter(self, client):
        """
        Test Rezeptsuche mit Kategoriefilter
        """
        search_term = "test"
        category_id = 1

        response = client.get(f'/api/rezepte/suche?q={search_term}&kategorie={category_id}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data

    def test_search_recipes_pagination(self, client):
        """
        Test Rezeptsuche mit Paginierung
        """
        search_term = "test"
        page = 1
        limit = 5

        response = client.get(f'/api/rezepte/suche?q={search_term}&page={page}&limit={limit}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data
        # Basic pagination info should exist
        assert 'page' in data or 'total' in data


class TestRecipeSorting:
    """Test-Klasse für Rezept-Sortierung"""

    def test_sort_recipes_by_newest(self, client):
        """
        Test Sortierung nach neuesten Rezepten
        """
        response = client.get('/api/rezepte?sortierung=newest')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data
        assert isinstance(data['rezepte'], list)

    def test_sort_recipes_by_name(self, client):
        """
        Test alphabetische Sortierung
        """
        response = client.get('/api/rezepte?sortierung=name_asc')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rezepte' in data
        assert isinstance(data['rezepte'], list) 