"""
@fileoverview Rezeptrouten für das Intranet-Kochbuch
@module rezept_routes

Dieses Modul implementiert die API-Endpunkte für Rezeptverwaltung:
- Auflisten und Suchen von Rezepten
- Erstellen neuer Rezepte
- Aktualisieren bestehender Rezepte
- Löschen von Rezepten
- Bildupload-Funktionalität
"""

import os
import uuid
import imghdr
from PIL import Image
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models.rezept import (rezept_erstellen, rezept_abrufen, rezepte_auflisten,
                          rezept_aktualisieren, rezept_loeschen, rezepte_suchen)
from utils.token import token_erforderlich as token_required
import json

# Blueprint für Rezepte erstellen
rezept_bp = Blueprint('rezept', __name__)

# Definir explicitamente as extensões permitidas
ERLAUBTE_ERWEITERUNGEN = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
# Definir tamanho máximo de arquivo (5 MB)
MAX_BILD_GROESSE_MB = 5
# Definir dimensões máximas da imagem
MAX_IMAGE_SIZE = (1920, 1080)  # Full HD
THUMB_SIZE = (300, 200)  # Thumbnail

def datei_erlaubt(dateiname):
    """
    Überprüft, ob die Dateierweiterung erlaubt ist.
    
    @param {string} dateiname - Name der zu prüfenden Datei
    @return {boolean} True wenn die Erweiterung erlaubt ist, sonst False
    """
    return '.' in dateiname and \
           dateiname.rsplit('.', 1)[1].lower() in ERLAUBTE_ERWEITERUNGEN

def ist_bild(file_stream):
    """
    Überprüft, ob der Dateiinhalt tatsächlich ein Bild ist.
    
    @param {FileStorage} file_stream - Der zu prüfende Datei-Stream
    @return {boolean} True wenn die Datei ein gültiges Bild ist, sonst False
    """
    try:
        # Lesen Sie die ersten Bytes, um den Dateityp zu überprüfen
        header = file_stream.read(512)
        file_stream.seek(0)  # Zurück zum Anfang
        
        # Überprüfen Sie den Dateiheader auf gängige Bildformate
        format = imghdr.what(None, header)
        return format in ERLAUBTE_ERWEITERUNGEN
    except Exception:
        return False

def optimize_image(image_path, max_size):
    """
    Otimiza uma imagem redimensionando-a e comprimindo-a.
    
    @param {string} image_path - Caminho da imagem
    @param {tuple} max_size - Tamanho máximo (largura, altura)
    @return {Image} Imagem otimizada
    """
    with Image.open(image_path) as img:
        # Converter para RGB se necessário
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Redimensionar mantendo proporção se maior que max_size
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        return img

def create_thumbnail(image_path, thumb_path, size):
    """
    Cria uma miniatura da imagem.
    
    @param {string} image_path - Caminho da imagem original
    @param {string} thumb_path - Caminho para salvar a miniatura
    @param {tuple} size - Tamanho da miniatura (largura, altura)
    """
    with Image.open(image_path) as img:
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(thumb_path, 'JPEG', quality=85, optimize=True)

def bild_speichern(bild):
    """
    Speichert ein hochgeladenes Bild sicher ab.
    
    @param {FileStorage} bild - Das hochgeladene Bild
    @return {dict|None} Dictionary mit Bildpfaden oder None bei Fehler
    """
    if not bild or not bild.filename:
        return None
        
    if not datei_erlaubt(bild.filename):
        return None
        
    try:
        # Sicheren Dateinamen erstellen
        dateiname = secure_filename(bild.filename)
        base_name = str(uuid.uuid4())
        extension = dateiname.rsplit('.', 1)[1].lower()
        
        # Pfade definieren
        upload_ordner = os.path.join(current_app.static_folder, 'uploads')
        os.makedirs(upload_ordner, exist_ok=True)
        
        # Pfade für original, otimizado e thumbnail
        original_name = f"{base_name}_original.{extension}"
        optimized_name = f"{base_name}.{extension}"
        thumb_name = f"{base_name}_thumb.jpg"
        
        original_path = os.path.join(upload_ordner, original_name)
        optimized_path = os.path.join(upload_ordner, optimized_name)
        thumb_path = os.path.join(upload_ordner, thumb_name)
        
        # Salvar original
        bild.save(original_path)
        
        # Otimizar e salvar
        optimized_img = optimize_image(original_path, MAX_IMAGE_SIZE)
        optimized_img.save(optimized_path, quality=85, optimize=True)
        
        # Criar e salvar thumbnail
        create_thumbnail(original_path, thumb_path, THUMB_SIZE)
        
        # Remover original após processamento
        os.remove(original_path)
        
        return {
            'image_url': f"static/uploads/{optimized_name}",
            'thumb_url': f"static/uploads/{thumb_name}"
        }
    except Exception as e:
        print(f"Fehler beim Speichern des Bildes: {e}")
        return None

# Rota para servir imagens estáticas
@rezept_bp.route('/uploads/<path:filename>')
def serve_image(filename):
    """
    Serve imagens estáticas do diretório de uploads.
    
    @route GET /api/rezepte/uploads/{filename}
    
    @param {string} filename - Nome do arquivo
    @return {Response} Arquivo de imagem
    """
    return send_from_directory(current_app.static_folder + '/uploads', filename)

@rezept_bp.route('', methods=['GET'])
def rezepte_liste():
    """
    Listet alle Rezepte auf, mit optionaler Paginierung und Filterung.
    
    @route GET /api/rezepte
    
    @query {int} [limit=10] - Maximale Anzahl der zurückzugebenden Rezepte
    @query {int} [offset=0] - Anzahl der zu überspringenden Rezepte
    @query {int} [benutzer_id] - Filter für Rezepte eines bestimmten Benutzers
    @query {int} [kategorie_id] - Filter für Rezepte einer bestimmten Kategorie
    @query {string} [suchbegriff] - Sucht nach Rezepten mit diesem Begriff
    
    @return {Object} response
    @return {Array<Object>} response.rezepte - Liste der gefundenen Rezepte
    @return {Object} response.meta - Metadaten zur Paginierung
    
    @throws {500} Bei internem Serverfehler
    """
    try:
        # Parameter aus der Anfrage extrahieren
        limit = request.args.get('limit', default=10, type=int)
        offset = request.args.get('offset', default=0, type=int)
        benutzer_id = request.args.get('benutzer_id', default=None, type=int)
        kategorie_id = request.args.get('kategorie_id', default=None, type=int)
        suchbegriff = request.args.get('suchbegriff', default=None, type=str)
        
        # Rezepte abrufen
        if suchbegriff:
            rezepte = rezepte_suchen(suchbegriff, limit, offset)
        else:
            rezepte = rezepte_auflisten(limit, offset, benutzer_id, kategorie_id)
        
        # Metadaten für Paginierung
        metadaten = {
            'anzahl': len(rezepte),
            'limit': limit,
            'offset': offset
        }
        
        return jsonify({
            'rezepte': rezepte,
            'meta': metadaten
        }), 200
    except Exception as fehler:
        print(f"Fehler beim Auflisten der Rezepte: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

@rezept_bp.route('/<int:rezept_id>', methods=['GET'])
def rezept_details(rezept_id):
    """
    Gibt die Details eines bestimmten Rezepts zurück.
    
    @route GET /api/rezepte/{rezept_id}
    
    @param {int} rezept_id - ID des abzurufenden Rezepts
    
    @return {Object} Das gefundene Rezept
    
    @throws {404} Wenn das Rezept nicht gefunden wurde
    @throws {500} Bei internem Serverfehler
    """
    try:
        rezept = rezept_abrufen(rezept_id)
        
        if rezept:
            return jsonify(rezept), 200
        else:
            return jsonify({'fehler': 'Rezept nicht gefunden'}), 404
    except Exception as fehler:
        print(f"Fehler beim Abrufen des Rezepts: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

@rezept_bp.route('', methods=['POST'])
@token_required
def rezept_erstellen_route(token_daten):
    """
    Erstellt ein neues Rezept.
    
    @route POST /api/rezepte
    
    @auth Erfordert gültigen JWT-Token
    
    @body {Object} request_body
    @body {string} request_body.titel - Titel des Rezepts
    @body {Array<Object>} request_body.zutaten - Liste der Zutaten
    @body {string} request_body.zubereitung - Zubereitungsanleitung
    @body {int} [request_body.kategorie_id] - ID der Kategorie
    
    @file {File} [bild] - Bild des Rezepts (max. 5MB, nur PNG/JPG/GIF)
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    @return {Object} response.rezept - Das erstellte Rezept
    
    @throws {400} Bei fehlenden oder ungültigen Daten
    @throws {500} Bei internem Serverfehler
    """
    try:
        # Daten aus der Anfrage extrahieren
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Formular-Daten verarbeiten
            daten = request.form.to_dict()
        else:
            # JSON-Daten verarbeiten
            daten = request.get_json()

        
        # Pflichtfelder überprüfen
        if not daten or 'titel' not in daten or 'zubereitung' not in daten:
            return jsonify({'fehler': 'Titel und Zubereitung sind erforderlich'}), 400

        
        # Zutaten aus JSON-String extrahieren, falls vorhanden
        zutaten = []
        if 'zutaten' in daten:
            if isinstance(daten['zutaten'], list):
                zutaten = daten['zutaten']
    # Wenn zutaten ein String ist, versuchen wir, ihn als JSON zu parsen
            elif isinstance(daten['zutaten'], str):
                try:
                    zutaten = json.loads(daten['zutaten'])
                except json.JSONDecodeError:
                    return jsonify({'fehler': 'Ungültiges JSON-Format für Zutaten'}), 400
        
        # Bild verarbeiten, falls vorhanden
        bild_pfad = None
        if 'bild' in request.files:
            bild = request.files['bild']
            bild_pfad = bild_speichern(bild)
            if bild and not bild_pfad:
                return jsonify({'fehler': 'Ungültiger Dateityp für Bild'}), 400
        
        # Kategorie-ID extrahieren, falls vorhanden
        kategorie_id = daten.get('kategorie_id')
        if kategorie_id:
            try:
                kategorie_id = int(kategorie_id)
            except ValueError:
                kategorie_id = None
        
        # Benutzer-ID aus Token extrahieren
        benutzer_id = token_daten['benutzer_id']
        
        # Rezept erstellen
        rezept_id = rezept_erstellen(
            titel=daten['titel'],
            zutaten=zutaten,
            zubereitung=daten['zubereitung'],
            benutzer_id=benutzer_id,
            bild_pfad=bild_pfad,
            kategorie_id=kategorie_id
        )
        
        if rezept_id:
            # Neu erstelltes Rezept abrufen
            neues_rezept = rezept_abrufen(rezept_id)
            return jsonify({
                'nachricht': 'Rezept erfolgreich erstellt',
                'rezept': neues_rezept
            }), 201
        else:
            return jsonify({'fehler': 'Fehler beim Erstellen des Rezepts'}), 500
    except Exception as fehler:
        print(f"Fehler beim Erstellen des Rezepts: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

@rezept_bp.route('/<int:rezept_id>', methods=['PUT'])
@token_required
def rezept_aktualisieren_route(token_daten, rezept_id):
    """
    Aktualisiert ein bestehendes Rezept.
    
    @route PUT /api/rezepte/{rezept_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des zu aktualisierenden Rezepts
    
    @body {Object} request_body
    @body {string} [request_body.titel] - Neuer Titel des Rezepts
    @body {Array<Object>} [request_body.zutaten] - Neue Liste der Zutaten
    @body {string} [request_body.zubereitung] - Neue Zubereitungsanleitung
    @body {int} [request_body.kategorie_id] - Neue ID der Kategorie
    
    @file {File} [bild] - Neues Bild des Rezepts (max. 5MB, nur PNG/JPG/GIF)
    
    @return {Object} Das aktualisierte Rezept
    
    @throws {403} Bei fehlender Berechtigung
    @throws {404} Wenn das Rezept nicht gefunden wurde
    @throws {500} Bei internem Serverfehler
    """
    try:
        # Benutzer-ID aus Token extrahieren
        benutzer_id = token_daten['benutzer_id']
        
        # Überprüfen, ob das Rezept existiert und dem Benutzer gehört
        rezept = rezept_abrufen(rezept_id)
        if not rezept:
            return jsonify({'fehler': 'Rezept nicht gefunden'}), 404
        
        if rezept['benutzer_id'] != benutzer_id:
            return jsonify({'fehler': 'Keine Berechtigung zum Aktualisieren dieses Rezepts'}), 403
        
        # Daten aus der Anfrage extrahieren
        daten = request.form.to_dict()
        
        # Zu aktualisierende Felder vorbereiten
        update_felder = {}
        
        # Titel aktualisieren, falls vorhanden
        if 'titel' in daten:
            update_felder['titel'] = daten['titel']
        
        # Zubereitung aktualisieren, falls vorhanden
        if 'zubereitung' in daten:
            update_felder['zubereitung'] = daten['zubereitung']
        
        # Zutaten aktualisieren, falls vorhanden
        if 'zutaten' in daten:
            try:
                update_felder['zutaten'] = json.loads(daten['zutaten'])
            except json.JSONDecodeError:
                return jsonify({'fehler': 'Ungültiges JSON-Format für Zutaten'}), 400
        
        # Kategorie-ID aktualisieren, falls vorhanden
        if 'kategorie_id' in daten:
            try:
                update_felder['kategorie_id'] = int(daten['kategorie_id'])
            except ValueError:
                update_felder['kategorie_id'] = None
        
        # Bild aktualisieren, falls vorhanden
        if 'bild' in request.files:
            bild = request.files['bild']
            bild_pfad = bild_speichern(bild)
            if bild and not bild_pfad:
                return jsonify({'fehler': 'Ungültiger Dateityp für Bild'}), 400
            update_felder['bild_pfad'] = bild_pfad
        
        # Rezept aktualisieren
        erfolg = rezept_aktualisieren(
            rezept_id=rezept_id,
            benutzer_id=benutzer_id,
            **update_felder
        )
        
        if erfolg:
            # Aktualisiertes Rezept abrufen
            aktualisiertes_rezept = rezept_abrufen(rezept_id)
            return jsonify({
                'nachricht': 'Rezept erfolgreich aktualisiert',
                'rezept': aktualisiertes_rezept
            }), 200
        else:
            return jsonify({'fehler': 'Fehler beim Aktualisieren des Rezepts'}), 500
    except Exception as fehler:
        print(f"Fehler beim Aktualisieren des Rezepts: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

@rezept_bp.route('/<int:rezept_id>', methods=['DELETE'])
@token_required
def rezept_loeschen_route(token_daten, rezept_id):
    """
    Löscht ein bestehendes Rezept.
    
    @route DELETE /api/rezepte/{rezept_id}
    
    @auth Erfordert gültigen JWT-Token
    
    @param {int} rezept_id - ID des zu löschenden Rezepts
    
    @return {Object} response
    @return {string} response.nachricht - Erfolgsmeldung
    
    @throws {403} Bei fehlender Berechtigung
    @throws {404} Wenn das Rezept nicht gefunden wurde
    @throws {500} Bei internem Serverfehler
    """
    try:
        # Benutzer-ID aus Token extrahieren
        benutzer_id = token_daten['benutzer_id']
        
        # Überprüfen, ob das Rezept existiert und dem Benutzer gehört
        rezept = rezept_abrufen(rezept_id)
        if not rezept:
            return jsonify({'fehler': 'Rezept nicht gefunden'}), 404
        
        if rezept['benutzer_id'] != benutzer_id:
            return jsonify({'fehler': 'Keine Berechtigung zum Löschen dieses Rezepts'}), 403
        
        # Rezept löschen
        erfolg = rezept_loeschen(rezept_id, benutzer_id)
        
        if erfolg:
            return jsonify({'nachricht': 'Rezept erfolgreich gelöscht'}), 200
        else:
            return jsonify({'fehler': 'Fehler beim Löschen des Rezepts'}), 500
    except Exception as fehler:
        print(f"Fehler beim Löschen des Rezepts: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

@rezept_bp.route('/suche', methods=['GET'])
def rezepte_suche_route():
    """
    Sucht nach Rezepten anhand eines Suchbegriffs.
    
    @route GET /api/rezepte/suche
    
    @query {string} suchbegriff - Der zu suchende Begriff
    @query {int} [limit=10] - Maximale Anzahl der Ergebnisse
    @query {int} [offset=0] - Anzahl der zu überspringenden Ergebnisse
    @query {int} [kategorie_id] - Filter für eine bestimmte Kategorie
    
    @return {Object} response
    @return {Array<Object>} response.rezepte - Liste der gefundenen Rezepte
    @return {Object} response.meta - Metadaten zur Paginierung
    
    @throws {500} Bei internem Serverfehler
    """
    try:
        # Suchbegriff aus der Anfrage extrahieren
        suchbegriff = request.args.get('q')
        
        # Suchbegriff ist erforderlich
        if not suchbegriff:
            return jsonify({'fehler': 'Suchbegriff ist erforderlich'}), 400

        #Kategorie-ID extrahieren, falss vorhanden
        kategorie_id = request.args.get('kategorie_id', type=int)
            

        # Paginierungsparameter
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Rezepte suchen
        rezepte, anzahl = rezepte_suchen(suchbegriff, limit, offset, kategorie_id)
        
        return jsonify({
              'rezepte': rezepte,
            'meta': {
                'anzahl': anzahl,
                'limit': limit,
                'offset': offset,
                'suchbegriff': suchbegriff,
                'kategorie_id': kategorie_id
            }
        })
    except Exception as fehler:
        print(f"Fehler bei der Rezeptsuche: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

     