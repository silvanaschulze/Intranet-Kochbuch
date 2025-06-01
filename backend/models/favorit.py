"""
@fileoverview Favoritenmodell für das Intranet-Kochbuch
@module favorit

Dieses Modul implementiert die Datenbankoperationen für Rezeptfavoriten:
- Markieren von Rezepten als Favorit
- Entfernen von Favoriten
- Abrufen von Favoritenlisten
"""

from db import get_db

def favorit_hinzufuegen(benutzer_id, rezept_id):
    """
    Markiert ein Rezept als Favorit für einen Benutzer.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {int} rezept_id - ID des Rezepts
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        sql = """
            INSERT INTO favoriten (benutzer_id, rezept_id)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE benutzer_id = benutzer_id
        """
        cursor.execute(sql, (benutzer_id, rezept_id))
        db.commit()
        
        return True
    except Exception as e:
        print(f"Fehler beim Hinzufügen des Favoriten: {e}")
        return False
    finally:
        cursor.close()

def favorit_entfernen(benutzer_id, rezept_id):
    """
    Entfernt ein Rezept aus den Favoriten eines Benutzers.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {int} rezept_id - ID des Rezepts
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        sql = """
            DELETE FROM favoriten 
            WHERE benutzer_id = %s AND rezept_id = %s
        """
        cursor.execute(sql, (benutzer_id, rezept_id))
        db.commit()
        
        return True
    except Exception as e:
        print(f"Fehler beim Entfernen des Favoriten: {e}")
        return False
    finally:
        cursor.close()

def favoriten_auflisten(benutzer_id):
    """
    Listet alle Favoritenrezepte eines Benutzers auf.
    
    @param {int} benutzer_id - ID des Benutzers
    @return {list} Liste der Favoritenrezepte
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = """
            SELECT r.* 
            FROM rezepte r
            JOIN favoriten f ON r.id = f.rezept_id
            WHERE f.benutzer_id = %s
            ORDER BY r.titel
        """
        cursor.execute(sql, (benutzer_id,))
        favoriten = cursor.fetchall()
        
        return favoriten
    except Exception as e:
        print(f"Fehler beim Abrufen der Favoriten: {e}")
        return []
    finally:
        cursor.close()

def ist_favorit(benutzer_id, rezept_id):
    """
    Prüft, ob ein Rezept ein Favorit des Benutzers ist.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {int} rezept_id - ID des Rezepts
    @return {boolean} True wenn Favorit, False wenn nicht
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        sql = """
            SELECT COUNT(*) 
            FROM favoriten 
            WHERE benutzer_id = %s AND rezept_id = %s
        """
        cursor.execute(sql, (benutzer_id, rezept_id))
        (count,) = cursor.fetchone()
        
        return count > 0
    except Exception as e:
        print(f"Fehler beim Prüfen des Favoriten: {e}")
        return False
    finally:
        cursor.close() 