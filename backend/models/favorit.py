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
        print(f"🔄 Füge Favorit hinzu: Benutzer {benutzer_id}, Rezept {rezept_id}")
        
        db = get_db()
        if not db:
            print("❌ Datenbankverbindung fehlgeschlagen")
            return False
        
        cursor = db.cursor()
        
        sql = """
            INSERT INTO favoriten (benutzer_id, rezept_id)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE benutzer_id = benutzer_id
        """
        cursor.execute(sql, (benutzer_id, rezept_id))
        db.commit()
        
        print(f"✅ Favorit erfolgreich hinzugefügt: Benutzer {benutzer_id}, Rezept {rezept_id}")
        return True
    except Exception as e:
        print(f"❌ Fehler beim Hinzufügen des Favoriten: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()

def favorit_entfernen(benutzer_id, rezept_id):
    """
    Entfernt ein Rezept aus den Favoriten eines Benutzers.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {int} rezept_id - ID des Rezepts
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    try:
        print(f"🔄 Entferne Favorit: Benutzer {benutzer_id}, Rezept {rezept_id}")
        
        db = get_db()
        if not db:
            print("❌ Datenbankverbindung fehlgeschlagen")
            return False
        
        cursor = db.cursor()
        
        sql = """
            DELETE FROM favoriten 
            WHERE benutzer_id = %s AND rezept_id = %s
        """
        cursor.execute(sql, (benutzer_id, rezept_id))
        db.commit()
        
        print(f"✅ Favorit erfolgreich entfernt: Benutzer {benutzer_id}, Rezept {rezept_id}")
        return True
    except Exception as e:
        print(f"❌ Fehler beim Entfernen des Favoriten: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()

def favoriten_auflisten(benutzer_id):
    """
    Listet alle Favoritenrezepte eines Benutzers auf.
    
    @param {int} benutzer_id - ID des Benutzers
    @return {list} Liste der Favoritenrezepte
    """
    try:
        print(f"🔄 Lade Favoriten für Benutzer {benutzer_id}")
        
        db = get_db()
        if not db:
            print("❌ Datenbankverbindung fehlgeschlagen")
            return []
        
        cursor = db.cursor(dictionary=True)
        
        sql = """
            SELECT r.*, b.name as benutzer_name, k.name as kategorie_name,
                   r.erstellungsdatum as erstellungsdatum
            FROM rezepte r
            JOIN favoriten f ON r.id = f.rezept_id
            JOIN benutzer b ON r.benutzer_id = b.id
            LEFT JOIN kategorien k ON r.kategorie_id = k.id
            WHERE f.benutzer_id = %s
            ORDER BY r.titel
        """
        cursor.execute(sql, (benutzer_id,))
        favoriten = cursor.fetchall()
        
        print(f"✅ {len(favoriten)} Favoriten gefunden für Benutzer {benutzer_id}")
        
        # Process zutaten from JSON string to list for each recipe
        for favorit in favoriten:
            if favorit.get('zutaten'):
                try:
                    import json
                    favorit['zutaten'] = json.loads(favorit['zutaten'])
                except:
                    favorit['zutaten'] = []
            else:
                favorit['zutaten'] = []
            
            # Ensure kategorie_name has a default value if null
            if not favorit.get('kategorie_name'):
                favorit['kategorie_name'] = 'Ohne Kategorie'
        
        return favoriten
    except Exception as e:
        print(f"❌ Fehler beim Abrufen der Favoriten: {e}")
        return []
    finally:
        if 'cursor' in locals():
            cursor.close()

def ist_favorit(benutzer_id, rezept_id):
    """
    Prüft, ob ein Rezept ein Favorit des Benutzers ist.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {int} rezept_id - ID des Rezepts
    @return {boolean} True wenn Favorit, False wenn nicht
    """
    try:
        print(f"🔍 Prüfe Favorit: Benutzer {benutzer_id}, Rezept {rezept_id}")
        
        db = get_db()
        if not db:
            print("❌ Datenbankverbindung fehlgeschlagen")
            return False
        
        cursor = db.cursor()
        
        sql = """
            SELECT COUNT(*) 
            FROM favoriten 
            WHERE benutzer_id = %s AND rezept_id = %s
        """
        cursor.execute(sql, (benutzer_id, rezept_id))
        (count,) = cursor.fetchone()
        
        is_fav = count > 0
        print(f"✅ Favorit-Status: {is_fav} für Benutzer {benutzer_id}, Rezept {rezept_id}")
        
        return is_fav
    except Exception as e:
        print(f"❌ Fehler beim Prüfen des Favoriten: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close() 