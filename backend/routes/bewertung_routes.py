"""
@fileoverview Bewertungsrouten für das Intranet-Kochbuch
@module bewertung_routes

Dieses Modul implementiert die API-Endpunkte für Bewertungsverwaltung:
- Erstellen/Aktualisieren von Bewertungen
- Abrufen von Bewertungen
- Löschen von Bewertungen
- Berechnen von Durchschnittsbewertungen
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from utils.token import token_erforderlich
from models.bewertung import (
    bewertung_erstellen,
    bewertung_abrufen,
    bewertungen_fuer_rezept_abrufen,
    durchschnittsbewertung_berechnen,
    bewertung_loeschen
)

bewertung_bp = Blueprint('bewertung', __name__)

@bewertung_bp.route('/rezept/<int:rezept_id>', methods=['POST'])
@token_erforderlich
def bewertung_hinzufuegen(token_daten, rezept_id):
    """
    Erstellt oder aktualisiert eine Bewertung für ein Rezept.
    
    @route POST /api/bewertungen/rezept/{rezept_id}
    @header {string} Authorization - Bearer Token
    @param {int} rezept_id - ID des Rezepts
    @body {int} request_body.bewertung - Bewertung (1-5)
    @return {object} response - Erfolgsmeldung
    @return {string} response.nachricht - Statusnachricht
    @throws {400} Ungültige Bewertung
    @throws {401} Unauthorized
    @throws {500} Serverfehler
    """
    try:
        daten = request.get_json()
        if not daten:
            return jsonify({"fehler": "JSON-Daten erforderlich"}), 400

        bewertung = daten.get('bewertung')
        if not bewertung or bewertung < 1 or bewertung > 5:
            return jsonify({"fehler": "Bewertung muss zwischen 1 und 5 liegen"}), 400

        benutzer_id = token_daten['benutzer_id']
        
        if bewertung_erstellen(rezept_id, benutzer_id, bewertung):
            # Durchschnitt neu berechnen
            stats = durchschnittsbewertung_berechnen(rezept_id)
            return jsonify({
                "nachricht": "Bewertung erfolgreich gespeichert",
                "bewertung": bewertung,
                "durchschnitt": stats['durchschnitt'],
                "anzahl_bewertungen": stats['anzahl']
            }), 200
        else:
            return jsonify({"fehler": "Fehler beim Speichern der Bewertung"}), 500

    except Exception as e:
        print(f"Fehler in bewertung_hinzufuegen: {e}")
        return jsonify({"fehler": "Interner Serverfehler"}), 500

@bewertung_bp.route('/rezept/<int:rezept_id>', methods=['GET'])
def bewertungen_abrufen(rezept_id):
    """
    Ruft alle Bewertungen für ein Rezept ab.
    
    @route GET /api/bewertungen/rezept/{rezept_id}
    @param {int} rezept_id - ID des Rezepts
    @return {object} response - Bewertungsdaten
    @return {array} response.bewertungen - Liste der Bewertungen
    @return {object} response.statistiken - Durchschnitt und Anzahl
    """
    try:
        bewertungen = bewertungen_fuer_rezept_abrufen(rezept_id)
        stats = durchschnittsbewertung_berechnen(rezept_id)
        
        return jsonify({
            "bewertungen": bewertungen,
            "statistiken": stats
        }), 200

    except Exception as e:
        print(f"Fehler in bewertungen_abrufen: {e}")
        return jsonify({"fehler": "Interner Serverfehler"}), 500

@bewertung_bp.route('/rezept/<int:rezept_id>/benutzer', methods=['GET'])
@token_erforderlich
def eigene_bewertung_abrufen(token_daten, rezept_id):
    """
    Ruft die eigene Bewertung für ein Rezept ab.
    
    @route GET /api/bewertungen/rezept/{rezept_id}/benutzer
    @header {string} Authorization - Bearer Token
    @param {int} rezept_id - ID des Rezepts
    @return {object} response - Bewertungsdaten
    @return {object|null} response.bewertung - Eigene Bewertung oder null
    @throws {401} Unauthorized
    @throws {500} Serverfehler
    """
    try:
        benutzer_id = token_daten['benutzer_id']
        bewertung = bewertung_abrufen(rezept_id, benutzer_id)
        
        return jsonify({"bewertung": bewertung}), 200

    except Exception as e:
        print(f"Fehler in eigene_bewertung_abrufen: {e}")
        return jsonify({"fehler": "Interner Serverfehler"}), 500

@bewertung_bp.route('/rezept/<int:rezept_id>', methods=['DELETE'])
@token_erforderlich
def bewertung_entfernen(token_daten, rezept_id):
    """
    Löscht die eigene Bewertung für ein Rezept.
    
    @route DELETE /api/bewertungen/rezept/{rezept_id}
    @header {string} Authorization - Bearer Token
    @param {int} rezept_id - ID des Rezepts
    @return {object} response - Erfolgsmeldung
    @return {string} response.nachricht - Statusnachricht
    @throws {401} Unauthorized
    @throws {404} Bewertung nicht gefunden
    @throws {500} Serverfehler
    """
    try:
        benutzer_id = token_daten['benutzer_id']
        
        if bewertung_loeschen(rezept_id, benutzer_id):
            # Durchschnitt neu berechnen
            stats = durchschnittsbewertung_berechnen(rezept_id)
            return jsonify({
                "nachricht": "Bewertung erfolgreich gelöscht",
                "durchschnitt": stats['durchschnitt'],
                "anzahl_bewertungen": stats['anzahl']
            }), 200
        else:
            return jsonify({"fehler": "Bewertung nicht gefunden"}), 404

    except Exception as e:
        print(f"Fehler in bewertung_entfernen: {e}")
        return jsonify({"fehler": "Interner Serverfehler"}), 500

@bewertung_bp.route('/rezept/<int:rezept_id>/statistiken', methods=['GET'])
def bewertungsstatistiken(rezept_id):
    """
    Ruft Bewertungsstatistiken für ein Rezept ab.
    
    @route GET /api/bewertungen/rezept/{rezept_id}/statistiken
    @param {int} rezept_id - ID des Rezepts
    @return {object} response - Statistiken
    @return {float} response.durchschnitt - Durchschnittsbewertung
    @return {int} response.anzahl - Anzahl der Bewertungen
    """
    try:
        stats = durchschnittsbewertung_berechnen(rezept_id)
        return jsonify(stats), 200

    except Exception as e:
        print(f"Fehler in bewertungsstatistiken: {e}")
        return jsonify({"fehler": "Interner Serverfehler"}), 500 