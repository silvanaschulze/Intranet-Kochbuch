"""
@fileoverview Kategoriemodell für das Intranet-Kochbuch
@module kategorie

Dieses Modul implementiert die Datenbankoperationen für Rezeptkategorien:
- Erstellen von Kategorien
- Abrufen von Kategorien
- Zuordnen von Rezepten zu Kategorien
"""

from db import get_db

def kategorie_erstellen(name, beschreibung=None):
    """
    Erstellt eine neue Kategorie in der Datenbank.
    
    @param {string} name - Name der Kategorie
    @param {string} [beschreibung] - Optionale Beschreibung der Kategorie
    @return {int|None} ID der erstellten Kategorie oder None bei Fehler
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = """
            INSERT INTO kategorien (name, beschreibung)
            VALUES (%s, %s)
        """
        cursor.execute(sql, (name, beschreibung))
        db.commit()
        
        return cursor.lastrowid
    except Exception as e:
        print(f"Fehler beim Erstellen der Kategorie: {e}")
        return None
    finally:
        cursor.close()

def kategorie_abrufen(kategorie_id):
    """
    Ruft eine spezifische Kategorie ab.
    
    @param {int} kategorie_id - ID der abzurufenden Kategorie
    @return {dict|None} Kategoriedaten oder None wenn nicht gefunden
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = "SELECT * FROM kategorien WHERE id = %s"
        cursor.execute(sql, (kategorie_id,))
        kategorie = cursor.fetchone()
        
        return kategorie
    except Exception as e:
        print(f"Fehler beim Abrufen der Kategorie: {e}")
        return None
    finally:
        cursor.close()

def kategorien_auflisten():
    """
    Listet alle verfügbaren Kategorien auf.
    
    @return {list} Liste aller Kategorien
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = "SELECT * FROM kategorien ORDER BY name"
        cursor.execute(sql)
        kategorien = cursor.fetchall()
        
        return kategorien
    except Exception as e:
        print(f"Fehler beim Auflisten der Kategorien: {e}")
        return []
    finally:
        cursor.close()

def rezept_kategorie_zuordnen(rezept_id, kategorie_id):
    """
    Ordnet ein Rezept einer Kategorie zu.
    
    @param {int} rezept_id - ID des Rezepts
    @param {int} kategorie_id - ID der Kategorie
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        sql = """
            INSERT INTO rezept_kategorien (rezept_id, kategorie_id)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE rezept_id = rezept_id
        """
        cursor.execute(sql, (rezept_id, kategorie_id))
        db.commit()
        
        return True
    except Exception as e:
        print(f"Fehler beim Zuordnen der Kategorie: {e}")
        return False
    finally:
        cursor.close()

def rezept_kategorien_abrufen(rezept_id):
    """
    Ruft alle Kategorien eines Rezepts ab.
    
    @param {int} rezept_id - ID des Rezepts
    @return {list} Liste der Kategorien des Rezepts
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = """
            SELECT k.* 
            FROM kategorien k
            JOIN rezept_kategorien rk ON k.id = rk.kategorie_id
            WHERE rk.rezept_id = %s
        """
        cursor.execute(sql, (rezept_id,))
        kategorien = cursor.fetchall()
        
        return kategorien
    except Exception as e:
        print(f"Fehler beim Abrufen der Rezeptkategorien: {e}")
        return []
    finally:
        cursor.close()

def rezepte_nach_kategorie_abrufen(kategorie_id):
    """
    Ruft alle Rezepte einer bestimmten Kategorie ab.
    
    @param {int} kategorie_id - ID der Kategorie
    @return {list} Liste der Rezepte in dieser Kategorie
    """
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        sql = """
            SELECT r.* 
            FROM rezepte r
            JOIN rezept_kategorien rk ON r.id = rk.rezept_id
            WHERE rk.kategorie_id = %s
        """
        cursor.execute(sql, (kategorie_id,))
        rezepte = cursor.fetchall()
        
        return rezepte
    except Exception as e:
        print(f"Fehler beim Abrufen der Rezepte nach Kategorie: {e}")
        return []
    finally:
        cursor.close() 