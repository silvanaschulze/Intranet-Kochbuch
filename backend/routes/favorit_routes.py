"""
@fileoverview Favoritenrouten für das Intranet-Kochbuch
@module favorit_routes

Dieses Modul implementiert die API-Endpunkte für Favoritenverwaltung:
- Markieren von Rezepten als Favorit
- Entfernen von Favoriten
- Abrufen der Favoritenliste
"""

from flask import Blueprint, jsonify
from models.favorit import (
    favorit_hinzufuegen,
    favorit_entfernen,
    favoriten_auflisten,
    ist_favorit
)
from utils.token import token_erforderlich

favorit_bp = Blueprint('favorit', __name__)

@favorit_bp.route('/rezept/<int:rezept_id>', methods=['POST'])
@token_erforderlich
def favorit_hinzufuegen_route(token_daten, rezept_id):
    """
    Markiert ein Rezept als Favorit für den eingeloggten Benutzer.
    
    @route POST /api/favoriten/rezept/{rezept_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des Rezepts
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {401} Bei fehlendem oder ungültigem Token
    @throws {500} Bei Serverfehler
    """
    benutzer_id = token_daten['benutzer_id']
    
    if favorit_hinzufuegen(benutzer_id, rezept_id):
        return jsonify({
            "nachricht": "Rezept wurde zu Favoriten hinzugefügt"
        }), 200
    else:
        return jsonify({
            "fehler": "Fehler beim Hinzufügen zu Favoriten"
        }), 500

@favorit_bp.route('/rezept/<int:rezept_id>', methods=['DELETE'])
@token_erforderlich
def favorit_entfernen_route(token_daten, rezept_id):
    """
    Entfernt ein Rezept aus den Favoriten des eingeloggten Benutzers.
    
    @route DELETE /api/favoriten/rezept/{rezept_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des Rezepts
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {401} Bei fehlendem oder ungültigem Token
    @throws {500} Bei Serverfehler
    """
    benutzer_id = token_daten['benutzer_id']
    
    if favorit_entfernen(benutzer_id, rezept_id):
        return jsonify({
            "nachricht": "Rezept wurde aus Favoriten entfernt"
        }), 200
    else:
        return jsonify({
            "fehler": "Fehler beim Entfernen aus Favoriten"
        }), 500

@favorit_bp.route('', methods=['GET'])
@token_erforderlich
def favoriten_liste(token_daten):
    """
    Ruft alle Favoritenrezepte des eingeloggten Benutzers ab.
    
    @route GET /api/favoriten
    
    @auth Erfordert gültigen JWT-Token
    
    @return {Object} response
    @return {Array<Object>} response.favoriten - Liste der Favoritenrezepte
    
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    benutzer_id = token_daten['benutzer_id']
    favoriten = favoriten_auflisten(benutzer_id)
    
    return jsonify({
        "favoriten": favoriten
    }), 200

@favorit_bp.route('/rezept/<int:rezept_id>/status', methods=['GET'])
@token_erforderlich
def favorit_status(token_daten, rezept_id):
    """
    Prüft, ob ein Rezept ein Favorit des eingeloggten Benutzers ist.
    
    @route GET /api/favoriten/rezept/{rezept_id}/status
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des Rezepts
    
    @return {Object} response
    @return {boolean} response.ist_favorit - True wenn Favorit, False wenn nicht
    
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    benutzer_id = token_daten['benutzer_id']
    status = ist_favorit(benutzer_id, rezept_id)
    
    return jsonify({
        "ist_favorit": status
    }), 200 