"""
@fileoverview Kategorierouten für das Intranet-Kochbuch
@module kategorie_routes

Dieses Modul implementiert die API-Endpunkte für Kategorieverwaltung:
- Erstellen von Kategorien
- Auflisten von Kategorien
- Abrufen von Rezepten einer Kategorie
- Zuordnen von Rezepten zu Kategorien
"""

from flask import Blueprint, request, jsonify
from models.kategorie import (
    kategorie_erstellen,
    kategorie_abrufen,
    kategorien_auflisten,
    rezept_kategorie_zuordnen,
    rezept_kategorien_abrufen,
    rezepte_nach_kategorie_abrufen
)
from utils.token import token_erforderlich

kategorie_bp = Blueprint('kategorie', __name__)

@kategorie_bp.route('', methods=['POST'])
@token_erforderlich
def neue_kategorie(token_daten):
    """
    Erstellt eine neue Kategorie.
    
    @route POST /api/kategorien
    
    @auth Erfordert gültigen JWT-Token
    
    @body {Object} request_body
    @body {string} request_body.name - Name der Kategorie
    @body {string} [request_body.beschreibung] - Optionale Beschreibung
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {int} response.kategorie_id - ID der erstellten Kategorie
    
    @throws {400} Bei fehlenden oder ungültigen Daten
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    daten = request.get_json()
    name = daten.get('name')
    beschreibung = daten.get('beschreibung')

    if not name:
        return jsonify({"fehler": "Kategoriename ist erforderlich"}), 400

    kategorie_id = kategorie_erstellen(name, beschreibung)
    
    if kategorie_id:
        return jsonify({
            "nachricht": "Kategorie erfolgreich erstellt",
            "kategorie_id": kategorie_id
        }), 201
    else:
        return jsonify({"fehler": "Fehler beim Erstellen der Kategorie"}), 500

@kategorie_bp.route('', methods=['GET'])
def kategorien_liste():
    """
    Listet alle verfügbaren Kategorien auf.
    
    @route GET /api/kategorien
    
    @return {Object} response
    @return {Array<Object>} response.kategorien - Liste aller Kategorien
    
    @throws {500} Bei Serverfehler
    """
    kategorien = kategorien_auflisten()
    return jsonify({"kategorien": kategorien}), 200

@kategorie_bp.route('/<int:kategorie_id>/rezepte', methods=['GET'])
def kategorie_rezepte(kategorie_id):
    """
    Ruft alle Rezepte einer bestimmten Kategorie ab.
    
    @route GET /api/kategorien/{kategorie_id}/rezepte
    
    @param {int} kategorie_id - ID der Kategorie
    
    @return {Object} response
    @return {Array<Object>} response.rezepte - Liste der Rezepte in dieser Kategorie
    
    @throws {404} Wenn Kategorie nicht gefunden
    @throws {500} Bei Serverfehler
    """
    kategorie = kategorie_abrufen(kategorie_id)
    if not kategorie:
        return jsonify({"fehler": "Kategorie nicht gefunden"}), 404

    rezepte = rezepte_nach_kategorie_abrufen(kategorie_id)
    return jsonify({"rezepte": rezepte}), 200

@kategorie_bp.route('/rezept/<int:rezept_id>', methods=['POST'])
@token_erforderlich
def rezept_kategorien_zuordnen(token_daten, rezept_id):
    """
    Ordnet ein Rezept einer oder mehreren Kategorien zu.
    
    @route POST /api/kategorien/rezept/{rezept_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des Rezepts
    
    @body {Object} request_body
    @body {Array<int>} request_body.kategorie_ids - Liste der Kategorie-IDs
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {400} Bei fehlenden oder ungültigen Daten
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    daten = request.get_json()
    kategorie_ids = daten.get('kategorie_ids', [])

    if not kategorie_ids:
        return jsonify({"fehler": "Keine Kategorien angegeben"}), 400

    erfolge = []
    for kategorie_id in kategorie_ids:
        if rezept_kategorie_zuordnen(rezept_id, kategorie_id):
            erfolge.append(kategorie_id)

    if erfolge:
        return jsonify({
            "nachricht": "Kategorien erfolgreich zugeordnet",
            "zugeordnete_kategorien": erfolge
        }), 200
    else:
        return jsonify({"fehler": "Fehler beim Zuordnen der Kategorien"}), 500

@kategorie_bp.route('/rezept/<int:rezept_id>', methods=['GET'])
def rezept_kategorien_liste(rezept_id):
    """
    Ruft alle Kategorien eines Rezepts ab.
    
    @route GET /api/kategorien/rezept/{rezept_id}
    
    @param {int} rezept_id - ID des Rezepts
    
    @return {Object} response
    @return {Array<Object>} response.kategorien - Liste der Kategorien des Rezepts
    
    @throws {500} Bei Serverfehler
    """
    kategorien = rezept_kategorien_abrufen(rezept_id)
    return jsonify({"kategorien": kategorien}), 200 