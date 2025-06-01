"""
@fileoverview Benutzerrouten für das Intranet-Kochbuch
@module benutzer_routes

Dieses Modul implementiert die API-Endpunkte für Benutzerverwaltung:
- Registrierung
- Anmeldung
- Profilzugriff und -aktualisierung
- Token-Refresh
- Logout
- Passwort-Wiederherstellung
"""

from flask import Blueprint, request, jsonify, current_app
from models.user import (
    benutzer_registrieren,
    benutzer_anmelden,
    benutzer_profil_abrufen,
    benutzer_profil_aktualisieren,
    profilbild_speichern,
    benutzer_per_email_finden,
    reset_token_erstellen,
    reset_token_validieren,
    passwort_zuruecksetzen
)
from utils.validators import email_validieren, passwort_validieren
from utils.token import (
    generate_tokens,
    token_erforderlich,
    token_blacklisten,
    token_verifizieren
)
from utils.email import registrierungs_email_senden
import os

benutzer_bp = Blueprint('benutzer', __name__)

@benutzer_bp.route("/register", methods=["POST"])
def register():
    """
    Endpunkt für die Benutzerregistrierung.
    
    @route POST /api/benutzer/register
    
    @body {Object} request_body
    @body {string} request_body.name - Benutzername (min. 3 Zeichen)
    @body {string} request_body.email - E-Mail-Adresse
    @body {string} request_body.passwort - Passwort (min. 8 Zeichen)
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {string} response.token - JWT Token
    @return {Object} response.benutzer - Benutzerdaten
    @return {string} [response.fehler] - Fehlermeldung bei Misserfolg
    
    @throws {400} - Bei ungültigen Eingabedaten
    @throws {500} - Bei Serverfehler
    """
    daten = request.get_json()
    name = daten.get("name")
    email = daten.get("email")
    passwort = daten.get("passwort")

    if not name or len(name) < 3:
        return jsonify({"fehler": "Name muss mindestens 3 Zeichen haben."}), 400

    if not email or not email_validieren(email):
        return jsonify({"fehler": "Ungültige E-Mail-Adresse."}), 400

    if not passwort or not passwort_validieren(passwort):
        return jsonify({"fehler": "Passwort muss mindestens 8 Zeichen, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten."}), 400

    benutzer = benutzer_registrieren(name, email, passwort)
    if benutzer:
        # Remove o hash da senha antes de enviar
        benutzer_daten = {
            'id': benutzer['id'],
            'name': benutzer['name'],
            'email': benutzer['email']
        }
        access_token, refresh_token = generate_tokens(benutzer['id'], benutzer['email'])
        
        # E-Mail mit Registrierungsbestätigung senden
        registrierungs_email_senden(email, name)
        
        return jsonify({
            "nachricht": "Benutzer erfolgreich registriert. Eine Bestätigungs-E-Mail wurde an Sie gesendet.",
            "token": access_token,
            "benutzer": benutzer_daten
        }), 201
    else:
        return jsonify({"fehler": "Registrierung fehlgeschlagen."}), 500

@benutzer_bp.route("/login", methods=["POST"])
def login():
    """
    Endpunkt für die Benutzeranmeldung.
    
    @route POST /api/benutzer/login
    
    @body {Object} request_body
    @body {string} request_body.email - E-Mail-Adresse
    @body {string} request_body.passwort - Passwort
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {string} response.access_token - JWT Access Token
    @return {string} response.refresh_token - JWT Refresh Token
    @return {Object} response.benutzer - Benutzerdaten
    @return {string} [response.fehler] - Fehlermeldung bei Misserfolg
    
    @throws {400} - Bei fehlenden Anmeldedaten
    @throws {401} - Bei ungültigen Anmeldedaten
    """
    daten = request.get_json()
    email = daten.get("email")
    passwort = daten.get("passwort")

    if not email or not passwort:
        return jsonify({"fehler": "E-Mail und Passwort sind erforderlich."}), 400

    benutzer = benutzer_anmelden(email, passwort)

    if benutzer:
        # Remove o hash da senha antes de enviar
        benutzer_daten = {
            'id': benutzer['id'],
            'name': benutzer['name'],
            'email': benutzer['email']
        }
        access_token, refresh_token = generate_tokens(benutzer['id'], benutzer['email'])
        return jsonify({
            "nachricht": "Login erfolgreich", 
            "access_token": access_token,
            "refresh_token": refresh_token,
            "benutzer": benutzer_daten
        }), 200
    else:
        return jsonify({"fehler": "Ungültige E-Mail oder Passwort."}), 401

@benutzer_bp.route("/refresh", methods=["POST"])
def refresh():
    """
    Endpunkt zum Erneuern des Access Tokens mittels Refresh Token.
    
    @route POST /api/benutzer/refresh
    
    @body {Object} request_body
    @body {string} request_body.refresh_token - Gültiger Refresh Token
    
    @return {Object} response
    @return {string} response.access_token - Neuer Access Token
    @return {string} [response.fehler] - Fehlermeldung bei Misserfolg
    
    @throws {401} - Bei ungültigem Refresh Token
    """
    refresh_token = request.json.get('refresh_token')
    if not refresh_token:
        return jsonify({"fehler": "Refresh Token erforderlich"}), 401

    token_data = token_verifizieren(refresh_token)
    if not token_data or token_data.get('type') != 'refresh':
        return jsonify({"fehler": "Ungültiger Refresh Token"}), 401

    # Gerar novo access token
    access_token, _ = generate_tokens(token_data['benutzer_id'], token_data['email'])
    
    return jsonify({
        "access_token": access_token
    }), 200

@benutzer_bp.route("/logout", methods=["POST"])
@token_erforderlich
def logout(token_daten):
    """
    Endpunkt für das Ausloggen eines Benutzers.
    
    @route POST /api/benutzer/logout
    
    @auth Erfordert gültigen JWT-Token
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {401} - Bei fehlendem oder ungültigem Token
    """
    token = request.headers.get('Authorization').split(' ')[1]
    token_blacklisten(token)
    
    return jsonify({
        "nachricht": "Erfolgreich ausgeloggt"
    }), 200

@benutzer_bp.route("/profil", methods=["GET"])
@token_erforderlich
def profil_abrufen(token_daten):
    """
    Ruft das Profil des eingeloggten Benutzers ab.
    
    @route GET /api/benutzer/profil
    
    @auth Erfordert gültigen JWT-Token
    
    @return {Object} response
    @return {Object} response.profil - Profildaten des Benutzers
    
    @throws {401} Bei fehlendem oder ungültigem Token
    @throws {404} Wenn Profil nicht gefunden
    """
    benutzer_id = token_daten["benutzer_id"]
    profil = benutzer_profil_abrufen(benutzer_id)
    
    if profil:
        return jsonify({
            "profil": profil
        }), 200
    else:
        return jsonify({
            "fehler": "Profil nicht gefunden"
        }), 404

@benutzer_bp.route("/profil", methods=["PUT"])
@token_erforderlich
def profil_aktualisieren(token_daten):
    """
    Aktualisiert das Profil des eingeloggten Benutzers.
    
    @route PUT /api/benutzer/profil
    
    @auth Erfordert gültigen JWT-Token
    
    @body {Object} request_body
    @body {string} [request_body.name] - Neuer Name
    @body {string} [request_body.email] - Neue E-Mail-Adresse
    @body {string} [request_body.beschreibung] - Neue Profilbeschreibung
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {400} Bei ungültigen Eingabedaten
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    benutzer_id = token_daten["benutzer_id"]
    daten = request.get_json()
    
    name = daten.get("name")
    email = daten.get("email")
    beschreibung = daten.get("beschreibung")
    
    # Validierung der Eingabedaten
    if email and not email_validieren(email):
        return jsonify({
            "fehler": "Ungültige E-Mail-Adresse"
        }), 400
        
    if name and len(name) < 3:
        return jsonify({
            "fehler": "Name muss mindestens 3 Zeichen haben"
        }), 400
    
    if benutzer_profil_aktualisieren(benutzer_id, name, email, beschreibung):
        return jsonify({
            "nachricht": "Profil erfolgreich aktualisiert"
        }), 200
    else:
        return jsonify({
            "fehler": "Fehler beim Aktualisieren des Profils"
        }), 500

@benutzer_bp.route("/profil/bild", methods=["POST"])
@token_erforderlich
def profilbild_hochladen(token_daten):
    """
    Lädt ein neues Profilbild für den eingeloggten Benutzer hoch.
    
    @route POST /api/benutzer/profil/bild
    
    @auth Erfordert gültigen JWT-Token
    
    @body {File} bild - Bilddatei (multipart/form-data)
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {string} response.bild_url - URL des gespeicherten Bildes
    
    @throws {400} Bei fehlender oder ungültiger Bilddatei
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    if 'bild' not in request.files:
        return jsonify({
            "fehler": "Keine Bilddatei hochgeladen"
        }), 400
        
    bild = request.files['bild']
    if not bild.filename:
        return jsonify({
            "fehler": "Keine Bilddatei ausgewählt"
        }), 400
        
    # Überprüfen des Dateityps
    erlaubte_typen = {'png', 'jpg', 'jpeg', 'gif'}
    if not '.' in bild.filename or \
       bild.filename.rsplit('.', 1)[1].lower() not in erlaubte_typen:
        return jsonify({
            "fehler": "Ungültiger Dateityp"
        }), 400
    
    benutzer_id = token_daten["benutzer_id"]
    bild_url = profilbild_speichern(benutzer_id, bild)
    
    if bild_url:
        return jsonify({
            "nachricht": "Profilbild erfolgreich hochgeladen",
            "bild_url": bild_url
        }), 200
    else:
        return jsonify({
            "fehler": "Fehler beim Hochladen des Profilbilds"
        }), 500

@benutzer_bp.route("/passwort-vergessen", methods=["POST"])
def passwort_vergessen():
    """
    Endpunkt für die Anforderung eines Passwort-Reset-Links.
    
    @route POST /api/benutzer/passwort-vergessen
    
    @body {Object} request_body
    @body {string} request_body.email - E-Mail-Adresse des Benutzers
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {string} [response.fehler] - Fehlermeldung bei Misserfolg
    
    @throws {400} Bei ungültiger E-Mail-Adresse
    @throws {404} Wenn Benutzer nicht gefunden
    """
    daten = request.get_json()
    email = daten.get("email")

    if not email or not email_validieren(email):
        return jsonify({
            "fehler": "Bitte geben Sie eine gültige E-Mail-Adresse ein."
        }), 400

    benutzer = benutzer_per_email_finden(email)
    if not benutzer:
        return jsonify({
            "fehler": "Es wurde kein Konto mit dieser E-Mail-Adresse gefunden."
        }), 404

    token = reset_token_erstellen(benutzer["id"])
    if not token:
        return jsonify({
            "fehler": "Fehler beim Erstellen des Reset-Links."
        }), 500

    # TODO: E-Mail mit Reset-Link senden
    # Für Testzwecke geben wir den Token direkt zurück
    reset_url = f"{request.host_url}passwort-zuruecksetzen/{token}"
    
    return jsonify({
        "nachricht": "Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.",
        "reset_url": reset_url  # Nur für Testzwecke
    }), 200

@benutzer_bp.route("/passwort-reset/<token>/validieren", methods=["GET"])
def reset_token_pruefen(token):
    """
    Überprüft die Gültigkeit eines Passwort-Reset-Tokens.
    
    @route GET /api/benutzer/passwort-reset/:token/validieren
    
    @param {string} token - Reset-Token
    
    @return {Object} response
    @return {boolean} response.gueltig - Gibt an, ob der Token gültig ist
    
    @throws {400} Bei fehlendem Token
    """
    if not token:
        return jsonify({
            "fehler": "Kein Token angegeben."
        }), 400

    benutzer_id = reset_token_validieren(token)
    
    return jsonify({
        "gueltig": benutzer_id is not None
    }), 200

@benutzer_bp.route("/passwort-reset/<token>", methods=["POST"])
def passwort_reset(token):
    """
    Setzt das Passwort mit einem gültigen Reset-Token zurück.
    
    @route POST /api/benutzer/passwort-reset/:token
    
    @param {string} token - Reset-Token
    @body {Object} request_body
    @body {string} request_body.passwort - Neues Passwort
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {string} [response.fehler] - Fehlermeldung bei Misserfolg
    
    @throws {400} Bei ungültigem Token oder Passwort
    """
    if not token:
        return jsonify({
            "fehler": "Kein Token angegeben."
        }), 400

    daten = request.get_json()
    passwort = daten.get("passwort")

    if not passwort or not passwort_validieren(passwort):
        return jsonify({
            "fehler": "Das neue Passwort muss mindestens 8 Zeichen, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten."
        }), 400

    if passwort_zuruecksetzen(token, passwort):
        return jsonify({
            "nachricht": "Ihr Passwort wurde erfolgreich zurückgesetzt."
        }), 200
    else:
        return jsonify({
            "fehler": "Der Reset-Link ist ungültig oder abgelaufen."
        }), 400
