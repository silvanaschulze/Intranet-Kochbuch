"""
@fileoverview Kommentarmodell für das Intranet-Kochbuch
@module kommentar

Dieses Modul implementiert die Datenbankoperationen für Rezeptkommentare:
- Erstellen von Kommentaren
- Abrufen von Kommentaren
- Löschen von Kommentaren
"""

from db import get_db
from datetime import datetime

def kommentar_erstellen(benutzer_id, rezept_id, text):
    """
    Erstellt einen neuen Kommentar zu einem Rezept.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {int} rezept_id - ID des Rezepts
    @param {string} text - Kommentartext
    @return {int|None} ID des erstellten Kommentars oder None bei Fehler
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        sql = """
            INSERT INTO kommentare (benutzer_id, rezept_id, text, erstellt_am)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (benutzer_id, rezept_id, text, datetime.now()))
        db.commit()
        
        return cursor.lastrowid
    except Exception as e:
        print(f"Fehler beim Erstellen des Kommentars: {e}")
        return None
    finally:
        cursor.close()

def kommentar_loeschen(kommentar_id, benutzer_id):
    """
    Löscht einen Kommentar, wenn er dem Benutzer gehört.
    
    @param {int} kommentar_id - ID des Kommentars
    @param {int} benutzer_id - ID des Benutzers
    @return {boolean} True bei Erfolg, False bei Fehler oder nicht berechtigt
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Prüfen, ob der Kommentar dem Benutzer gehört
        check_sql = """
            SELECT benutzer_id 
            FROM kommentare 
            WHERE id = %s
        """
        cursor.execute(check_sql, (kommentar_id,))
        result = cursor.fetchone()
        
        if not result or result[0] != benutzer_id:
            return False
            
        # Kommentar löschen
        delete_sql = "DELETE FROM kommentare WHERE id = %s"
        cursor.execute(delete_sql, (kommentar_id,))
        db.commit()
        
        return True
    except Exception as e:
        print(f"Fehler beim Löschen des Kommentars: {e}")
        return False
    finally:
        cursor.close()

def kommentare_abrufen(rezept_id):
    """
    Ruft alle Kommentare zu einem Rezept ab.
    
    @param {int} rezept_id - ID des Rezepts
    @return {list} Liste der Kommentare mit Benutzerdaten
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = """
            SELECT 
                k.id,
                k.text,
                k.erstellt_am,
                k.benutzer_id,
                b.name as benutzer_name
            FROM kommentare k
            JOIN benutzer b ON k.benutzer_id = b.id
            WHERE k.rezept_id = %s
            ORDER BY k.erstellt_am DESC
        """
        cursor.execute(sql, (rezept_id,))
        kommentare = cursor.fetchall()
        
        # Formatiere das Datum für jeden Kommentar
        for kommentar in kommentare:
            kommentar['erstellt_am'] = kommentar['erstellt_am'].strftime('%d.%m.%Y %H:%M')
        
        return kommentare
    except Exception as e:
        print(f"Fehler beim Abrufen der Kommentare: {e}")
        return []
    finally:
        cursor.close()

def kommentar_details(kommentar_id):
    """
    Ruft die Details eines spezifischen Kommentars ab.
    
    @param {int} kommentar_id - ID des Kommentars
    @return {dict|None} Kommentardaten oder None wenn nicht gefunden
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = """
            SELECT 
                k.id,
                k.text,
                k.erstellt_am,
                k.benutzer_id,
                k.rezept_id,
                b.name as benutzer_name
            FROM kommentare k
            JOIN benutzer b ON k.benutzer_id = b.id
            WHERE k.id = %s
        """
        cursor.execute(sql, (kommentar_id,))
        kommentar = cursor.fetchone()
        
        if kommentar:
            kommentar['erstellt_am'] = kommentar['erstellt_am'].strftime('%d.%m.%Y %H:%M')
        
        return kommentar
    except Exception as e:
        print(f"Fehler beim Abrufen der Kommentardetails: {e}")
        return None
    finally:
        cursor.close() 