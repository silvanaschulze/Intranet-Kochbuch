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
# AVIF-Unterstützung aktivieren
try:
    from pillow_avif import AvifImagePlugin
    print("✅ AVIF support loaded successfully")
except ImportError:
    print("⚠️ AVIF support not available")
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models.rezept import (
    rezept_erstellen, 
    rezept_abrufen, 
    rezepte_auflisten, 
    rezepte_auflisten_erweitert,
    rezept_aktualisieren, 
    rezept_loeschen, 
    rezepte_suchen,
    rezepte_suchen_erweitert
)
from utils.token import token_erforderlich as token_required
import json
import jwt as pyjwt  # Renomear para evitar conflitos

# Blueprint für Rezepte erstellen
rezept_bp = Blueprint('rezept', __name__)

# Explizit erlaubte Dateierweiterungen definieren
ERLAUBTE_ERWEITERUNGEN = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}
# Maximale Dateigröße definieren (5 MB)
MAX_BILD_GROESSE_MB = 5
# Maximale Bildabmessungen definieren
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
        # Unterstützung für AVIF und andere Formate hinzufügen
        valid_formats = {'png', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'}
        
        # Für AVIF und andere Formate, die imghdr nicht erkennt
        if not format:
            # Versuche die Datei mit PIL zu öffnen
            try:
                file_stream.seek(0)
                with Image.open(file_stream) as test_img:
                    return test_img.format.lower() in {'png', 'jpeg', 'jpg', 'gif', 'webp', 'avif', 'bmp', 'tiff'}
            except Exception:
                return False
            finally:
                file_stream.seek(0)
        
        return format in valid_formats
    except Exception:
        return False

def optimize_image(image_path, max_size):
    """
    Optimiert ein Bild durch Größenänderung und Komprimierung.
    
    @param {string} image_path - Pfad zum Bild
    @param {tuple} max_size - Maximale Größe (Breite, Höhe)
    @return {Image} Optimiertes Bild
    """
    try:
        print(f"Debug - Opening image: {image_path}")
        with Image.open(image_path) as img:
            print(f"Debug - Image format: {img.format}, mode: {img.mode}, size: {img.size}")
            
            # In RGB konvertieren falls notwendig (für JPEG-Ausgabe)
            if img.mode in ('RGBA', 'P', 'LA'):
                print(f"Debug - Converting from {img.mode} to RGB")
                img = img.convert('RGB')
            elif img.mode == 'L':  # Grayscale
                print(f"Debug - Converting from grayscale to RGB")
                img = img.convert('RGB')
            
            # Größe ändern unter Beibehaltung des Seitenverhältnisses falls größer als max_size
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                print(f"Debug - Resizing from {img.size} to max {max_size}")
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                print(f"Debug - New size: {img.size}")
            
            return img
    except Exception as e:
        print(f"Debug - Error in optimize_image: {e}")
        raise

def create_thumbnail(image_path, thumb_path, size):
    """
    Erstellt eine Miniaturansicht des Bildes.
    
    @param {string} image_path - Pfad zum ursprünglichen Bild
    @param {string} thumb_path - Pfad zum Speichern der Miniaturansicht
    @param {tuple} size - Größe der Miniaturansicht (Breite, Höhe)
    """
    try:
        with Image.open(image_path) as img:
            print(f"Debug - Creating thumbnail from {img.format} image")
            
            # In RGB konvertieren für JPEG-Ausgabe
            if img.mode in ('RGBA', 'P', 'LA', 'L'):
                img = img.convert('RGB')
            
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumb_path, 'JPEG', quality=85, optimize=True)
            print(f"Debug - Thumbnail saved: {thumb_path}")
    except Exception as e:
        print(f"Debug - Error creating thumbnail: {e}")
        raise

def bild_speichern(bild):
    """
    Speichert ein hochgeladenes Bild sicher ab.
    
    @param {FileStorage} bild - Das hochgeladene Bild
    @return {dict|None} Dictionary mit Bildpfaden oder None bei Fehler
    """
    if not bild or not bild.filename:
        print("Debug - No image or filename provided")
        return None
        
    if not datei_erlaubt(bild.filename):
        print(f"Debug - File extension not allowed: {bild.filename}")
        return None
        
    try:
        print(f"Debug - Processing image: {bild.filename}")
        
        # Sicheren Dateinamen erstellen
        dateiname = secure_filename(bild.filename)
        base_name = str(uuid.uuid4())
        original_extension = dateiname.rsplit('.', 1)[1].lower() if '.' in dateiname else 'jpg'
        
        print(f"Debug - Original extension: {original_extension}, Base name: {base_name}")
        
        # Pfade definieren - alle Ausgabebilder werden als JPEG gespeichert
        upload_ordner = os.path.join(current_app.static_folder, 'uploads')
        os.makedirs(upload_ordner, exist_ok=True)
        print(f"Debug - Upload folder: {upload_ordner}")
        
        # Pfade für temporäres Original, optimiert und Thumbnail (alle als JPEG)
        temp_original_name = f"{base_name}_temp.{original_extension}"
        optimized_name = f"{base_name}.jpg"  # Immer JPEG
        thumb_name = f"{base_name}_thumb.jpg"  # Immer JPEG
        
        temp_original_path = os.path.join(upload_ordner, temp_original_name)
        optimized_path = os.path.join(upload_ordner, optimized_name)
        thumb_path = os.path.join(upload_ordner, thumb_name)
        
        # Temporäres Original speichern
        print(f"Debug - Saving temporary original to: {temp_original_path}")
        bild.save(temp_original_path)
        
        # Überprüfen ob die Datei gespeichert wurde
        if not os.path.exists(temp_original_path):
            print("Debug - Failed to save temporary file")
            return None
            
        print(f"Debug - File size: {os.path.getsize(temp_original_path)} bytes")
        
        # Überprüfen ob es sich um ein gültiges Bild handelt
        try:
            with Image.open(temp_original_path) as test_img:
                print(f"Debug - Image verified: {test_img.format}, {test_img.mode}, {test_img.size}")
        except Exception as e:
            print(f"Debug - Invalid image file: {e}")
            if os.path.exists(temp_original_path):
                os.remove(temp_original_path)
            return None
        
        # Optimieren und als JPEG speichern
        print(f"Debug - Optimizing image...")
        optimized_img = optimize_image(temp_original_path, MAX_IMAGE_SIZE)
        optimized_img.save(optimized_path, 'JPEG', quality=90, optimize=True)
        print(f"Debug - Optimized image saved to: {optimized_path}")
        
        # Thumbnail erstellen und als JPEG speichern
        print(f"Debug - Creating thumbnail...")
        create_thumbnail(temp_original_path, thumb_path, THUMB_SIZE)
        print(f"Debug - Thumbnail saved to: {thumb_path}")
        
        # Temporäres Original nach Verarbeitung entfernen
        if os.path.exists(temp_original_path):
            os.remove(temp_original_path)
            print(f"Debug - Temporary file removed")
        
        result = {
            'image_url': f"static/uploads/{optimized_name}",
            'thumb_url': f"static/uploads/{thumb_name}"
        }
        print(f"Debug - Image processing successful: {result}")
        return result
        
    except Exception as e:
        print(f"Debug - Error in bild_speichern: {type(e).__name__}: {e}")
        import traceback
        print(f"Debug - Traceback: {traceback.format_exc()}")
        
        # Limpeza em caso de erro
        cleanup_files = [
            os.path.join(upload_ordner, f"{base_name}_temp.{original_extension}") if 'original_extension' in locals() else None,
            os.path.join(upload_ordner, f"{base_name}.jpg") if 'base_name' in locals() else None,
            os.path.join(upload_ordner, f"{base_name}_thumb.jpg") if 'base_name' in locals() else None
        ]
        
        for file_path in cleanup_files:
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"Debug - Cleaned up: {file_path}")
                except:
                    pass
                    
        return None

# Route für statische Bilder
@rezept_bp.route('/uploads/<path:filename>')
def serve_image(filename):
    """
    Stellt statische Bilder aus dem Upload-Verzeichnis bereit.
    
    @route GET /api/rezepte/uploads/{filename}
    
    @param {string} filename - Name der Datei
    @return {Response} Bilddatei
    """
    return send_from_directory(current_app.static_folder + '/uploads', filename)

@rezept_bp.route('', methods=['GET'])
def rezepte_liste():
    """
    Ruft alle Rezepte ab mit optionaler Filterung und Paginierung.
    
    @route GET /api/rezepte
    
    @query {int} [page=1] - Aktuelle Seite
    @query {int} [limit=10] - Anzahl der Rezepte pro Seite  
    @query {string} [kategorie=''] - Kategorie-ID für Filterung
    @query {string} [sortierung='newest'] - Sortierungsoption
    
    @return {Object} response
    @return {Array<Object>} response.rezepte - Liste der gefundenen Rezepte mit Favoritenstatus
    @return {Object} response.meta - Metadaten zur Paginierung
    
    @throws {500} Bei internem Serverfehler
    """
    try:
        # Parameter aus der Anfrage extrahieren
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=10, type=int)
        kategorie = request.args.get('kategorie', default='', type=str)
        sortierung = request.args.get('sortierung', default='newest', type=str)
        
        # Legacy-Parameter für Kompatibilität
        benutzer_id = request.args.get('benutzer_id', default=None, type=int)
        kategorie_id = request.args.get('kategorie_id', default=None, type=int)
        
        # Kategorie-ID aus dem kategorie-Parameter extrahieren
        if kategorie and kategorie.isdigit():
            kategorie_id = int(kategorie)
        
        # Offset aus Page berechnen
        offset = (page - 1) * limit
        
        # Rezepte abrufen mit verbesserter Funktion
        rezepte = rezepte_auflisten_erweitert(limit, offset, benutzer_id, kategorie_id, sortierung)
        
        # Gesamtanzahl für Paginierung berechnen (ohne Limit/Offset)
        total_rezepte = rezepte_auflisten_erweitert(None, 0, benutzer_id, kategorie_id, sortierung)
        total = len(total_rezepte)
        
        # Prüfe, ob der Benutzer angemeldet ist und füge Favoritenstatus hinzu
        authorization_header = request.headers.get('Authorization')
        current_user_id = None
        
        if authorization_header and authorization_header.startswith('Bearer '):
            try:
                token = authorization_header.split(' ')[1]
                
                try:
                    token_daten = pyjwt.decode(
                        token, 
                        current_app.config['SECRET_KEY'], 
                        algorithms=['HS256']
                    )
                    current_user_id = token_daten.get('benutzer_id')
                except Exception:
                    # Token ungültig oder abgelaufen - ignorieren
                    pass
            except Exception:
                # Fehler beim Verarbeiten - ignorieren
                pass
        
        # Favoritenstatus für jedes Rezept hinzufügen
        if current_user_id:
            from models.favorit import ist_favorit
            print(f"🔍 Adicionando status de favorito para usuário {current_user_id}")
            for rezept in rezepte:
                is_fav = ist_favorit(current_user_id, rezept['id'])
                rezept['is_favorite'] = is_fav
                print(f"  Rezept {rezept['id']} ({rezept['titel']}): is_favorite = {is_fav}")
        else:
            print("🔍 Nenhum usuário logado - marcando todos como não favoritos")
            for rezept in rezepte:
                rezept['is_favorite'] = False
        
        # Metadaten für Paginierung
        metadaten = {
            'anzahl': len(rezepte),
            'total': total,
            'page': page,
            'limit': limit,
            'pages': max(1, (total + limit - 1) // limit)
        }
        
        return jsonify({
            'rezepte': rezepte,
            'total': total,
            'page': page,
            'limit': limit,
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
    
    @return {Object} Das gefundene Rezept mit Favoritenstatus
    
    @throws {404} Wenn das Rezept nicht gefunden wurde
    @throws {500} Bei internem Serverfehler
    """
    try:
        rezept = rezept_abrufen(rezept_id)
        
        if rezept:
            # Prüfe, ob der Benutzer angemeldet ist und das Rezept als Favorit markiert hat
            from models.favorit import ist_favorit
            
            # Versuche Token zu extrahieren (optional)
            authorization_header = request.headers.get('Authorization')
            is_favorite = False
            
            if authorization_header and authorization_header.startswith('Bearer '):
                try:
                    token = authorization_header.split(' ')[1]
                    
                    # Versuche Token zu dekodieren ohne Fehler zu werfen
                    try:
                        token_daten = pyjwt.decode(
                            token, 
                            current_app.config['SECRET_KEY'], 
                            algorithms=['HS256']
                        )
                        benutzer_id = token_daten.get('benutzer_id')
                        if benutzer_id:
                            is_favorite = ist_favorit(benutzer_id, rezept_id)
                    except Exception:
                        # Token ungültig oder abgelaufen - ignorieren
                        pass
                except Exception:
                    # Fehler beim Verarbeiten - ignorieren
                    pass
            
            # Favoritenstatus zum Rezept hinzufügen
            rezept['is_favorite'] = is_favorite
            
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
            bild_result = bild_speichern(bild)
            if bild and not bild_result:
                return jsonify({'fehler': 'Ungültiger Dateityp für Bild'}), 400
            elif bild_result:
                # Extract the main image URL from the result dictionary
                bild_pfad = bild_result.get('image_url', bild_result) if isinstance(bild_result, dict) else bild_result
        
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
        try:
            daten = request.form.to_dict()
            print(f"Debug - Received form data: {daten}")
        except Exception as e:
            print(f"Error extracting form data: {e}")
            return jsonify({'fehler': 'Fehler beim Verarbeiten der Formulardaten'}), 400
        
        print(f"Debug - Starting field processing...")
        
        # Zu aktualisierende Felder vorbereiten
        update_felder = {}
        
        print(f"Debug - Processing titel...")
        # Titel aktualisieren, falls vorhanden
        if 'titel' in daten and daten['titel'].strip():
            update_felder['titel'] = daten['titel'].strip()
            print(f"Debug - Titel set: {update_felder['titel']}")
        
        print(f"Debug - Processing zubereitung...")
        # Zubereitung aktualisieren, falls vorhanden
        if 'zubereitung' in daten and daten['zubereitung'].strip():
            update_felder['zubereitung'] = daten['zubereitung'].strip()
            print(f"Debug - Zubereitung set: {update_felder['zubereitung']}")
        
        print(f"Debug - Processing zutaten...")
        # Zutaten aktualisieren, falls vorhanden
        if 'zutaten' in daten:
            print(f"Debug - Raw zutaten data: {daten['zutaten']}")
            print(f"Debug - Zutaten type: {type(daten['zutaten'])}")
            try:
                zutaten_data = json.loads(daten['zutaten'])
                print(f"Debug - Parsed zutaten data: {zutaten_data}")
                print(f"Debug - Parsed zutaten type: {type(zutaten_data)}")
                if isinstance(zutaten_data, list):
                    update_felder['zutaten'] = zutaten_data
                    print(f"Debug - Zutaten set: {update_felder['zutaten']}")
                else:
                    print(f"Debug - ERROR: Zutaten is not a list: {type(zutaten_data)}")
                    return jsonify({'fehler': 'Zutaten müssen eine Liste sein'}), 400
            except json.JSONDecodeError as e:
                print(f"JSON decode error for zutaten: {e}")
                return jsonify({'fehler': 'Ungültiges JSON-Format für Zutaten'}), 400
        
        print(f"Debug - Processing kategorie_id...")
        # Kategorie-ID aktualisieren, falls vorhanden
        if 'kategorie_id' in daten:
            print(f"Debug - Raw kategorie_id: {daten['kategorie_id']}")
            try:
                if daten['kategorie_id'].strip():
                    update_felder['kategorie_id'] = int(daten['kategorie_id'])
                    print(f"Debug - Kategorie_id set: {update_felder['kategorie_id']}")
                else:
                    update_felder['kategorie_id'] = None
                    print(f"Debug - Kategorie_id set to None")
            except (ValueError, AttributeError) as e:
                print(f"Error parsing kategorie_id: {e}")
                update_felder['kategorie_id'] = None
        
        print(f"Debug - Processing image...")
        # Bild aktualisieren, falls vorhanden
        if 'bild' in request.files:
            bild = request.files['bild']
            print(f"Debug - Image file: {bild.filename}")
            if bild.filename:  # Nur verarbeiten wenn eine Datei hochgeladen wurde
                try:
                    bild_result = bild_speichern(bild)
                    if not bild_result:
                        print(f"Debug - Image save failed")
                        return jsonify({'fehler': 'Ungültiger Dateityp für Bild'}), 400
                    else:
                        # Extract the main image URL from the result dictionary
                        bild_pfad = bild_result.get('image_url', bild_result) if isinstance(bild_result, dict) else bild_result
                        update_felder['bild_pfad'] = bild_pfad
                        print(f"Debug - Image saved: {bild_pfad}")
                except Exception as e:
                    print(f"Error processing image: {e}")
                    return jsonify({'fehler': 'Fehler beim Verarbeiten des Bildes'}), 400
        
        print(f"Debug - Update fields: {update_felder}")
        
        # Rezept aktualisieren
        try:
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
        except Exception as e:
            print(f"Error in rezept_aktualisieren: {e}")
            return jsonify({'fehler': 'Datenbankfehler beim Aktualisieren'}), 500
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
    
    @query {string} q - Der zu suchende Begriff
    @query {string} [kategorie=''] - Kategorie-ID für Filterung
    @query {string} [sortierung='newest'] - Sortierungsoption
    @query {int} [page=1] - Aktuelle Seite
    @query {int} [limit=10] - Anzahl der Rezepte pro Seite
    
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

        # Parameter extrahieren
        kategorie = request.args.get('kategorie', default='', type=str)
        sortierung = request.args.get('sortierung', default='newest', type=str)
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=10, type=int)
        
        # Kategorie-ID extrahieren
        kategorie_id = None
        if kategorie and kategorie.isdigit():
            kategorie_id = int(kategorie)
        
        # Legacy-Parameter für Kompatibilität
        if not kategorie_id:
            kategorie_id = request.args.get('kategorie_id', type=int)
        
        # Offset berechnen
        offset = (page - 1) * limit
        
        # Rezepte suchen mit erweiterter Funktion
        rezepte, total = rezepte_suchen_erweitert(suchbegriff, limit, offset, kategorie_id, sortierung)
        
        return jsonify({
            'rezepte': rezepte,
            'total': total,
            'page': page,
            'limit': limit,
            'meta': {
                'anzahl': len(rezepte),
                'total': total,
                'page': page,
                'limit': limit,
                'pages': max(1, (total + limit - 1) // limit),
                'suchbegriff': suchbegriff,
                'kategorie': kategorie
            }
        })
    except Exception as fehler:
        print(f"Fehler bei der Rezeptsuche: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

@rezept_bp.route('/benutzer', methods=['GET'])
@token_required
def benutzer_rezepte(token_daten):
    """
    Ruft alle Rezepte des eingeloggten Benutzers ab.
    
    @route GET /api/rezepte/benutzer
    
    @auth Erfordert gültigen JWT-Token
    
    @query {int} [limit=10] - Maximale Anzahl der zurückzugebenden Rezepte
    @query {int} [offset=0] - Anzahl der zu überspringenden Rezepte
    @query {int} [page=1] - Seitennummer (wird in offset umgewandelt)
    
    @return {Object} response
    @return {Array<Object>} response.rezepte - Liste der Benutzerrezepte
    @return {Object} response.meta - Metadaten zur Paginierung
    
    @throws {401} Bei fehlendem oder ungültigem Token
    """
    try:
        benutzer_id = token_daten['benutzer_id']
        
        # Parameter aus der Anfrage extrahieren
        limit = request.args.get('limit', default=10, type=int)
        page = request.args.get('page', default=1, type=int)
        offset = request.args.get('offset', default=(page-1)*limit, type=int)
        
        # Rezepte des Benutzers abrufen
        rezepte = rezepte_auflisten(limit, offset, benutzer_id, None)
        
        # Metadaten für Paginierung
        metadaten = {
            'anzahl': len(rezepte),
            'limit': limit,
            'offset': offset,
            'page': page
        }
        
        return jsonify({
            'rezepte': rezepte,
            'meta': metadaten
        }), 200
    except Exception as fehler:
        print(f"Fehler beim Abrufen der Benutzerrezepte: {fehler}")
        return jsonify({'fehler': 'Interner Serverfehler'}), 500

     