"""
@fileoverview Benutzermodell für das Intranet-Kochbuch
@module user

Dieses Modul implementiert die Datenbankoperationen für Benutzer:
- Registrierung neuer Benutzer
- Benutzerauthentifizierung
- Profilverwaltung
- Passwort-Wiederherstellung
"""

from db import verbinden, verbindung_schliessen
from utils.security import passwort_hashen, passwort_verifizieren
import os
from werkzeug.utils import secure_filename
from PIL import Image
from datetime import datetime, timedelta
import secrets

def benutzer_registrieren(name, email, passwort):
    """
    Registriert einen neuen Benutzer in der Datenbank.
    
    @param {string} name - Name des Benutzers
    @param {string} email - E-Mail-Adresse des Benutzers
    @param {string} passwort - Unverschlüsseltes Passwort des Benutzers
    
    @return {dict|None} Benutzerdaten bei erfolgreicher Registrierung, None bei Fehler
    @return {int} return.id - Benutzer-ID
    @return {string} return.name - Benutzername
    @return {string} return.email - E-Mail-Adresse
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None
            
        cursor = verbindung.cursor(dictionary=True)
        passwort_hash = passwort_hashen(passwort)
        sql = "INSERT INTO benutzer (name, email, passwort) VALUES (%s, %s, %s)"
        werte = (name, email, passwort_hash)
        cursor.execute(sql, werte)
        benutzer_id = cursor.lastrowid
        verbindung.commit()

        # Benutzer nach der Registrierung abrufen
        sql = "SELECT id, name, email FROM benutzer WHERE id = %s"
        cursor.execute(sql, (benutzer_id,))
        benutzer = cursor.fetchone()
        
        return benutzer
    except Exception as fehler:
        print(f"Fehler beim Registrieren des Benutzers: {fehler}")
        # Verificar se é erro de email duplicado
        if "Duplicate entry" in str(fehler) and "email" in str(fehler):
            raise ValueError("Diese E-Mail-Adresse ist bereits registriert.")
        raise fehler
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def benutzer_anmelden(email, passwort):
    """
    Authentifiziert einen Benutzer anhand von E-Mail und Passwort.
    
    @param {string} email - E-Mail-Adresse des Benutzers
    @param {string} passwort - Unverschlüsseltes Passwort des Benutzers
    
    @return {dict|None} Benutzerdaten bei erfolgreicher Anmeldung, None bei Fehler
    @return {int} return.id - Benutzer-ID
    @return {string} return.name - Benutzername
    @return {string} return.email - E-Mail-Adresse
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None

        cursor = verbindung.cursor(dictionary=True)
        sql = """
            SELECT id, name, email, passwort, profilbild_url, beschreibung 
            FROM benutzer 
            WHERE email = %s
        """
        cursor.execute(sql, (email,))
        benutzer = cursor.fetchone()

        if benutzer and passwort_verifizieren(passwort, benutzer['passwort']):
            # Remove o hash da senha antes de retornar
            del benutzer['passwort']
            return benutzer

        return None
    except Exception as fehler:
        print(f"Fehler beim Anmelden des Benutzers: {fehler}")
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def benutzer_profil_abrufen(benutzer_id):
    """
    Ruft die Profildaten eines Benutzers ab mit Statistiken.
    
    @param {int} benutzer_id - ID des Benutzers
    @return {dict|None} Benutzerprofildaten mit Statistiken oder None bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None

        cursor = verbindung.cursor(dictionary=True)
        
        # Grundlegende Profildaten abrufen
        sql = """
            SELECT id, name, email, profilbild_url, beschreibung
            FROM benutzer 
            WHERE id = %s
        """
        cursor.execute(sql, (benutzer_id,))
        profil = cursor.fetchone()
        
        if profil:
            # Anzahl der Favoriten des Benutzers
            sql_favoriten = """
                SELECT COUNT(*) as favorites_count
                FROM favoriten 
                WHERE benutzer_id = %s
            """
            cursor.execute(sql_favoriten, (benutzer_id,))
            favoriten_result = cursor.fetchone()
            profil['favorites_count'] = favoriten_result['favorites_count'] if favoriten_result else 0
            
            # Anzahl der erstellten Rezepte des Benutzers
            sql_rezepte = """
                SELECT COUNT(*) as recipes_count
                FROM rezepte 
                WHERE benutzer_id = %s
            """
            cursor.execute(sql_rezepte, (benutzer_id,))
            rezepte_result = cursor.fetchone()
            profil['recipes_count'] = rezepte_result['recipes_count'] if rezepte_result else 0
            
            # Letzter Login (kann später implementiert werden)
            profil['last_login'] = None
        
        return profil
    except Exception as fehler:
        print(f"Fehler beim Abrufen des Benutzerprofils: {fehler}")
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def benutzer_profil_aktualisieren(benutzer_id, name=None, email=None, beschreibung=None):
    """
    Aktualisiert die Profildaten eines Benutzers.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {string} [name] - Neuer Name des Benutzers
    @param {string} [email] - Neue E-Mail-Adresse
    @param {string} [beschreibung] - Neue Profilbeschreibung
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return False

        cursor = verbindung.cursor()
        
        # Baue das Update-Statement dynamisch basierend auf den vorhandenen Werten
        update_fields = []
        values = []
        
        if name is not None:
            update_fields.append("name = %s")
            values.append(name)
        if email is not None:
            update_fields.append("email = %s")
            values.append(email)
        if beschreibung is not None:
            update_fields.append("beschreibung = %s")
            values.append(beschreibung)
            
        if not update_fields:
            return True  # Nichts zu aktualisieren
            
        values.append(benutzer_id)
        sql = f"""
            UPDATE benutzer 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        cursor.execute(sql, tuple(values))
        verbindung.commit()
        
        return True
    except Exception as fehler:
        print(f"Fehler beim Aktualisieren des Benutzerprofils: {fehler}")
        return False
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def profilbild_speichern(benutzer_id, bild_datei):
    """
    Speichert oder aktualisiert das Profilbild eines Benutzers.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {FileStorage} bild_datei - Hochgeladene Bilddatei
    @return {string|None} URL des gespeicherten Bildes oder None bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        print(f"🔄 Speichere Profilbild für Benutzer {benutzer_id}")
        
        # Sicherer Dateiname erstellen
        original_filename = secure_filename(bild_datei.filename)
        extension = original_filename.rsplit('.', 1)[1].lower()
        filename = f"profile_{benutzer_id}.{extension}"
        
        print(f"📁 Ursprünglicher Name: {original_filename}")
        print(f"📁 Neuer Name: {filename}")
        
        # Pfad zum Speichern
        upload_folder = os.path.join('static', 'profile_images')
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        
        print(f"💾 Speicherpfad: {filepath}")
        
        # Bild speichern
        bild_datei.save(filepath)
        print(f"✅ Datei gespeichert")
        
        # Bildoptimierung nur für unterstützte Formate
        try:
            with Image.open(filepath) as img:
                print(f"🖼️  Original Format: {img.format}, Größe: {img.size}")
                
                # Auf 500x500 Pixel beschränken
                if img.width > 500 or img.height > 500:
                    img.thumbnail((500, 500), Image.Resampling.LANCZOS)
                    print(f"📏 Größe angepasst auf: {img.size}")
                
                # Für AVIF und WebP: Beibehalten des Formats wenn möglich
                if extension in ['avif', 'webp']:
                    try:
                        img.save(filepath, format=img.format, quality=85, optimize=True)
                        print(f"✅ Optimiert als {img.format}")
                    except Exception as e:
                        print(f"⚠️  Konvertiere zu JPEG: {e}")
                        # Fallback zu JPEG
                        img = img.convert('RGB')
                        jpeg_filename = f"profile_{benutzer_id}.jpg"
                        jpeg_filepath = os.path.join(upload_folder, jpeg_filename)
                        img.save(jpeg_filepath, 'JPEG', quality=85)
                        # Alte Datei löschen
                        os.remove(filepath)
                        filename = jpeg_filename
                        filepath = jpeg_filepath
                else:
                    # Für andere Formate: Als JPEG speichern
                    img = img.convert('RGB')
                    img.save(filepath, 'JPEG', quality=85)
                    print(f"✅ Konvertiert zu JPEG")
                    
        except Exception as img_error:
            print(f"⚠️  Bildverarbeitung fehlgeschlagen: {img_error}")
            # Datei trotzdem behalten, falls sie verwendbar ist
        
        # URL in der Datenbank speichern
        print(f"💽 Speichere URL in Datenbank...")
        verbindung = verbinden()
        if not verbindung:
            print(f"❌ Datenbankverbindung fehlgeschlagen")
            return None

        cursor = verbindung.cursor()
        bild_url = f"static/profile_images/{filename}"
        sql = "UPDATE benutzer SET profilbild_url = %s WHERE id = %s"
        cursor.execute(sql, (bild_url, benutzer_id))
        verbindung.commit()
        
        print(f"✅ Profilbild erfolgreich gespeichert: {bild_url}")
        return bild_url
        
    except Exception as fehler:
        print(f"❌ Fehler beim Speichern des Profilbilds: {fehler}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def reset_token_erstellen(benutzer_id):
    """
    Erstellt einen Reset-Token für die Passwort-Wiederherstellung.
    
    @param {int} benutzer_id - ID des Benutzers
    @return {string|None} Reset-Token oder None bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None

        cursor = verbindung.cursor()
        
        # Token generieren
        token = secrets.token_urlsafe(32)
        ablauf = datetime.now() + timedelta(hours=1)
        
        # Alten Token löschen
        sql_delete = "DELETE FROM passwort_reset WHERE benutzer_id = %s"
        cursor.execute(sql_delete, (benutzer_id,))
        
        # Neuen Token speichern
        sql_insert = """
            INSERT INTO passwort_reset (benutzer_id, token, ablauf)
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql_insert, (benutzer_id, token, ablauf))
        verbindung.commit()
        
        return token
    except Exception as fehler:
        print(f"Fehler beim Erstellen des Reset-Tokens: {fehler}")
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def reset_token_validieren(token):
    """
    Überprüft die Gültigkeit eines Reset-Tokens.
    
    @param {string} token - Reset-Token
    @return {int|None} Benutzer-ID bei gültigem Token, None bei ungültigem Token
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None

        cursor = verbindung.cursor()
        
        sql = """
            SELECT benutzer_id
            FROM passwort_reset
            WHERE token = %s AND ablauf > NOW()
        """
        cursor.execute(sql, (token,))
        ergebnis = cursor.fetchone()
        
        return ergebnis[0] if ergebnis else None
    except Exception as fehler:
        print(f"Fehler beim Validieren des Reset-Tokens: {fehler}")
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def passwort_zuruecksetzen(token, neues_passwort):
    """
    Setzt das Passwort eines Benutzers mit einem gültigen Reset-Token zurück.
    
    @param {string} token - Reset-Token
    @param {string} neues_passwort - Neues Passwort
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return False

        cursor = verbindung.cursor()
        
        # Token validieren und Benutzer-ID abrufen
        benutzer_id = reset_token_validieren(token)
        if not benutzer_id:
            return False
            
        # Passwort aktualisieren
        passwort_hash = passwort_hashen(neues_passwort)
        sql_update = "UPDATE benutzer SET passwort = %s WHERE id = %s"
        cursor.execute(sql_update, (passwort_hash, benutzer_id))
        
        # Token löschen
        sql_delete = "DELETE FROM passwort_reset WHERE token = %s"
        cursor.execute(sql_delete, (token,))
        
        verbindung.commit()
        return True
    except Exception as fehler:
        print(f"Fehler beim Zurücksetzen des Passworts: {fehler}")
        return False
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def benutzer_per_email_finden(email):
    """
    Findet einen Benutzer anhand seiner E-Mail-Adresse.
    
    @param {string} email - E-Mail-Adresse des Benutzers
    @return {dict|None} Benutzerdaten oder None wenn nicht gefunden
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None

        cursor = verbindung.cursor(dictionary=True)
        sql = "SELECT id, name, email FROM benutzer WHERE email = %s"
        cursor.execute(sql, (email,))
        benutzer = cursor.fetchone()
        
        return benutzer
    except Exception as fehler:
        print(f"Fehler beim Suchen des Benutzers: {fehler}")
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)