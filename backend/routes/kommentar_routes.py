"""
@fileoverview Kommentarrouten für das Intranet-Kochbuch
@module kommentar_routes

Dieses Modul implementiert die API-Endpunkte für Kommentarverwaltung:
- Erstellen von Kommentaren
- Abrufen von Kommentaren
- Löschen von Kommentaren
"""

from flask import Blueprint, request, jsonify
from models.kommentar import (
    kommentar_erstellen,
    kommentar_loeschen,
    kommentare_abrufen,
    kommentar_details,
    kommentar_bearbeiten
)
from utils.token import token_erforderlich

kommentar_bp = Blueprint('kommentar', __name__)

@kommentar_bp.route('/rezept/<int:rezept_id>', methods=['POST'])
@token_erforderlich
def kommentar_erstellen_route(token_daten, rezept_id):
    """
    Erstellt einen neuen Kommentar zu einem Rezept.
    
    @route POST /api/kommentare/rezept/{rezept_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des Rezepts
    
    @body {Object} request_body
    @body {string} request_body.text - Kommentartext
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {int} response.kommentar_id - ID des erstellten Kommentars
    
    @throws {400} Bei fehlendem oder ungültigem Text
    @throws {401} Bei fehlendem oder ungültigem Token
    @throws {500} Bei Serverfehler
    """
    daten = request.get_json()
    text = daten.get('text')
    
    if not text or not text.strip():
        return jsonify({
            "fehler": "Kommentartext ist erforderlich"
        }), 400
    
    benutzer_id = token_daten['benutzer_id']
    kommentar_id = kommentar_erstellen(benutzer_id, rezept_id, text.strip())
    
    if kommentar_id:
        return jsonify({
            "nachricht": "Kommentar erfolgreich erstellt",
            "kommentar_id": kommentar_id
        }), 201
    else:
        return jsonify({
            "fehler": "Fehler beim Erstellen des Kommentars"
        }), 500

@kommentar_bp.route('/<int:kommentar_id>', methods=['DELETE'])
@token_erforderlich
def kommentar_loeschen_route(token_daten, kommentar_id):
    """
    Löscht einen Kommentar, wenn er dem eingeloggten Benutzer gehört.
    
    @route DELETE /api/kommentare/{kommentar_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} kommentar_id - ID des Kommentars
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {401} Bei fehlendem oder ungültigem Token
    @throws {403} Wenn der Benutzer nicht berechtigt ist
    @throws {500} Bei Serverfehler
    """
    benutzer_id = token_daten['benutzer_id']
    
    if kommentar_loeschen(kommentar_id, benutzer_id):
        return jsonify({
            "nachricht": "Kommentar erfolgreich gelöscht"
        }), 200
    else:
        return jsonify({
            "fehler": "Nicht berechtigt oder Kommentar nicht gefunden"
        }), 403

@kommentar_bp.route('/rezept/<int:rezept_id>', methods=['GET'])
def rezept_kommentare(rezept_id):
    """
    Ruft alle Kommentare zu einem Rezept ab.
    
    @route GET /api/kommentare/rezept/{rezept_id}
    
    @param {int} rezept_id - ID des Rezepts
    
    @return {Object} response
    @return {Array<Object>} response.kommentare - Liste der Kommentare
    
    @throws {500} Bei Serverfehler
    """
    kommentare = kommentare_abrufen(rezept_id)
    return jsonify({
        "kommentare": kommentare
    }), 200

@kommentar_bp.route('/<int:kommentar_id>', methods=['GET'])
def kommentar_details_route(kommentar_id):
    """
    Ruft die Details eines spezifischen Kommentars ab.
    
    @route GET /api/kommentare/{kommentar_id}
    
    @param {int} kommentar_id - ID des Kommentars
    
    @return {Object} response
    @return {Object} response.kommentar - Kommentardetails
    
    @throws {404} Wenn Kommentar nicht gefunden
    @throws {500} Bei Serverfehler
    """
    kommentar = kommentar_details(kommentar_id)
    
    if kommentar:
        return jsonify({
            "kommentar": kommentar
        }), 200
    else:
        return jsonify({
            "fehler": "Kommentar nicht gefunden"
        }), 404

@kommentar_bp.route('/<int:kommentar_id>', methods=['PUT'])
@token_erforderlich
def kommentar_bearbeiten_route(token_daten, kommentar_id):
    """
    Bearbeitet einen Kommentar, wenn er dem eingeloggten Benutzer gehört.
    
    @route PUT /api/kommentare/{kommentar_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} kommentar_id - ID des Kommentars
    
    @body {Object} request_body
    @body {string} request_body.text - Neuer Kommentartext
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {400} Bei fehlendem oder ungültigem Text
    @throws {401} Bei fehlendem oder ungültigem Token
    @throws {403} Wenn der Benutzer nicht berechtigt ist
    @throws {500} Bei Serverfehler
    """
    daten = request.get_json()
    text = daten.get('text')
    
    if not text or not text.strip():
        return jsonify({
            "fehler": "Kommentartext ist erforderlich"
        }), 400
    
    benutzer_id = token_daten['benutzer_id']
    
    if kommentar_bearbeiten(kommentar_id, benutzer_id, text.strip()):
        return jsonify({
            "nachricht": "Kommentar erfolgreich bearbeitet"
        }), 200
    else:
        return jsonify({
            "fehler": "Nicht berechtigt oder Kommentar nicht gefunden"
        }), 403 