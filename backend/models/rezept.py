"""
@fileoverview Rezeptmodell für das Intranet-Kochbuch
@module rezept

Dieses Modul implementiert die Datenbankoperationen für Rezepte:
- Erstellen neuer Rezepte
- Abrufen von Rezepten
- Aktualisieren bestehender Rezepte
- Löschen von Rezepten
- Suchen nach Rezepten
"""

from db import verbinden, verbindung_schliessen
import json
import mysql.connector
from db import get_db

def verarbeite_kategorie_info(rezept):
    """
    Hilfsfunktion zur Verarbeitung der Kategorieinformationen
    """
    if not rezept.get('kategorie_name'):
        rezept['kategorie_name'] = 'Ohne Kategorie'
    return rezept

def verarbeite_rezept_zutaten(rezept):
    """
    Hilfsfunktion zur Verarbeitung der Zutaten von JSON zu Liste
    """
    if isinstance(rezept.get('zutaten'), str):
        try:
            rezept['zutaten'] = json.loads(rezept['zutaten'])
        except:
            rezept['zutaten'] = []
    elif not rezept.get('zutaten'):
        rezept['zutaten'] = []
    return rezept

def rezept_erstellen(titel, zutaten, zubereitung, benutzer_id, bild_pfad=None, kategorie_id=None):
    """
    Erstellt ein neues Rezept in der Datenbank.
    
    @param {string} titel - Titel des Rezepts
    @param {list|string} zutaten - Liste der Zutaten oder JSON-String
    @param {string} zubereitung - Zubereitungsanleitung
    @param {int} benutzer_id - ID des Benutzers, der das Rezept erstellt
    @param {string} [bild_pfad] - Pfad zum Bild des Rezepts
    @param {int} [kategorie_id] - ID der Kategorie des Rezepts
    
    @return {int|None} ID des erstellten Rezepts bei Erfolg, None bei Fehler
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None
            
        cursor = verbindung.cursor()
        
        # Zutaten als JSON-String speichern, falls sie als Liste übergeben wurden
        if isinstance(zutaten, list):
            zutaten = json.dumps(zutaten)
        
        sql = """
        INSERT INTO rezepte (titel, zutaten, zubereitung, benutzer_id, bild_pfad, kategorie_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        werte = (titel, zutaten, zubereitung, benutzer_id, bild_pfad, kategorie_id)
        
        cursor.execute(sql, werte)
        verbindung.commit()
        
        # ID des erstellten Rezepts zurückgeben
        return cursor.lastrowid
    except Exception as fehler:
        print(f"Fehler beim Erstellen des Rezepts: {fehler}")
        if verbindung:
            verbindung.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezept_abrufen(rezept_id):
    """
    Ruft ein einzelnes Rezept anhand seiner ID ab.
    
    @param {int} rezept_id - Die ID des abzurufenden Rezepts
    
    @return {dict|None} Rezeptdaten oder None bei Fehler
    @return {int} return.id - Rezept-ID
    @return {string} return.titel - Titel des Rezepts
    @return {Array<Object>} return.zutaten - Liste der Zutaten
    @return {string} return.zubereitung - Zubereitungsanleitung
    @return {string} return.benutzer_name - Name des Erstellers
    @return {Object} return.benutzer - Vollständige Benutzerinformationen
    @return {string} [return.bild_pfad] - Pfad zum Rezeptbild
    @return {int} [return.kategorie_id] - ID der Kategorie
    
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
        SELECT r.*, 
               b.name as benutzer_name, 
               b.id as benutzer_id,
               b.email as benutzer_email,
               k.name as kategorie_name
        FROM rezepte r
        JOIN benutzer b ON r.benutzer_id = b.id
        LEFT JOIN kategorien k ON r.kategorie_id = k.id
        WHERE r.id = %s
        """
        cursor.execute(sql, (rezept_id,))
        rezept = cursor.fetchone()
        
        if rezept:
            # Erstelle benutzer-Objekt mit vollständigen Informationen
            rezept['benutzer'] = {
                'id': rezept.get('benutzer_id'),
                'name': rezept.get('benutzer_name', 'Unbekannt'),
                'email': rezept.get('benutzer_email')
            }
            
            # Verarbeite Zutaten von JSON-String zu Liste
            rezept = verarbeite_rezept_zutaten(rezept)
            # Verarbeite Kategorieinformationen
            rezept = verarbeite_kategorie_info(rezept)
            
        return rezept
    except Exception as fehler:
        print(f"Fehler beim Abrufen des Rezepts: {fehler}")
        return None
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezepte_auflisten(limit=10, offset=0, benutzer_id=None, kategorie_id=None):
    """
    Listet Rezepte mit optionaler Filterung und Paginierung auf.
    
    @param {int} [limit=10] - Maximale Anzahl der zurückzugebenden Rezepte
    @param {int} [offset=0] - Anzahl der zu überspringenden Rezepte
    @param {int} [benutzer_id] - Filter für Rezepte eines bestimmten Benutzers
    @param {int} [kategorie_id] - Filter für Rezepte einer bestimmten Kategorie
    
    @return {Array<Object>} Liste von Rezept-Objekten
    @return {int} return[].id - Rezept-ID
    @return {string} return[].titel - Titel des Rezepts
    @return {Array<Object>} return[].zutaten - Liste der Zutaten
    @return {string} return[].benutzer_name - Name des Erstellers
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return []
            
        cursor = verbindung.cursor(dictionary=True)
        
        # Basis-SQL-Abfrage
        sql = """
        SELECT r.*, b.name as benutzer_name, k.name as kategorie_name
        FROM rezepte r
        JOIN benutzer b ON r.benutzer_id = b.id
        LEFT JOIN kategorien k ON r.kategorie_id = k.id
        """
        
        # Filter hinzufügen
        bedingungen = []
        parameter = []
        
        if benutzer_id is not None:
            bedingungen.append("r.benutzer_id = %s")
            parameter.append(benutzer_id)
            
        if kategorie_id is not None:
            bedingungen.append("r.kategorie_id = %s")
            parameter.append(kategorie_id)
            
        if bedingungen:
            sql += " WHERE " + " AND ".join(bedingungen)
            
        # Sortierung und Paginierung
        sql += " ORDER BY r.erstellungsdatum DESC LIMIT %s OFFSET %s"
        parameter.extend([limit, offset])
        
        cursor.execute(sql, parameter)
        rezepte = cursor.fetchall()
        
        # Verarbeite alle Rezepte mit Hilfsfunktionen
        for rezept in rezepte:
            rezept = verarbeite_rezept_zutaten(rezept)
            rezept = verarbeite_kategorie_info(rezept)
        
        return rezepte
    except Exception as fehler:
        print(f"Fehler beim Auflisten der Rezepte: {fehler}")
        return []
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezepte_auflisten_erweitert(limit=10, offset=0, benutzer_id=None, kategorie_id=None, sortierung='newest'):
    """
    Listet Rezepte mit erweiterten Informationen und Kategorien auf.
    
    @param {int} [limit=10] - Maximale Anzahl der zurückzugebenden Rezepte
    @param {int} [offset=0] - Anzahl der zu überspringenden Rezepte
    @param {int} [benutzer_id] - Filter für Rezepte eines bestimmten Benutzers
    @param {int} [kategorie_id] - Filter für Rezepte einer bestimmten Kategorie
    @param {string} [sortierung='newest'] - Sortierungsoption
    
    @return {Array<Object>} Liste von Rezept-Objekten mit Kategorie-Informationen
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return []
            
        cursor = verbindung.cursor(dictionary=True)
        
        # Basis-SQL-Abfrage mit Kategorie-Informationen
        sql = """
        SELECT r.*, b.name as benutzer_name, k.name as kategorie_name
        FROM rezepte r
        JOIN benutzer b ON r.benutzer_id = b.id
        LEFT JOIN kategorien k ON r.kategorie_id = k.id
        """
        
        # Filter hinzufügen
        bedingungen = []
        parameter = []
        
        if benutzer_id is not None:
            bedingungen.append("r.benutzer_id = %s")
            parameter.append(benutzer_id)
            
        if kategorie_id is not None:
            bedingungen.append("r.kategorie_id = %s")
            parameter.append(kategorie_id)
            
        if bedingungen:
            sql += " WHERE " + " AND ".join(bedingungen)
            
        # Sortierung hinzufügen
        if sortierung == 'oldest':
            sql += " ORDER BY r.erstellungsdatum ASC"
        elif sortierung == 'name_asc':
            sql += " ORDER BY r.titel ASC"
        elif sortierung == 'name_desc':
            sql += " ORDER BY r.titel DESC"
        else:  # newest (default)
            sql += " ORDER BY r.erstellungsdatum DESC"
            
        # Paginierung nur hinzufügen wenn limit gesetzt ist
        if limit is not None:
            sql += " LIMIT %s OFFSET %s"
            parameter.extend([limit, offset])
        
        cursor.execute(sql, parameter)
        rezepte = cursor.fetchall()
        
        # Verarbeite alle Rezepte mit Hilfsfunktionen
        for rezept in rezepte:
            rezept = verarbeite_rezept_zutaten(rezept)
            rezept = verarbeite_kategorie_info(rezept)
        
        return rezepte
    except Exception as fehler:
        print(f"Fehler beim Auflisten der Rezepte (erweitert): {fehler}")
        return []
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezept_aktualisieren(rezept_id, titel=None, zutaten=None, zubereitung=None, bild_pfad=None, kategorie_id=None, benutzer_id=None):
    """
    Aktualisiert ein bestehendes Rezept.
    
    @param {int} rezept_id - ID des zu aktualisierenden Rezepts
    @param {string} [titel] - Neuer Titel des Rezepts
    @param {list|string} [zutaten] - Neue Liste der Zutaten oder JSON-String
    @param {string} [zubereitung] - Neue Zubereitungsanleitung
    @param {string} [bild_pfad] - Neuer Pfad zum Rezeptbild
    @param {int} [kategorie_id] - Neue Kategorie-ID
    @param {int} [benutzer_id] - ID des Benutzers für Berechtigungsprüfung
    
    @return {boolean} True bei erfolgreicher Aktualisierung, False bei Fehler
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return False
            
        cursor = verbindung.cursor()
        
        # Prüfen, ob der Benutzer berechtigt ist, das Rezept zu aktualisieren
        if benutzer_id is not None:
            cursor.execute("SELECT benutzer_id FROM rezepte WHERE id = %s", (rezept_id,))
            rezept = cursor.fetchone()
            if not rezept or rezept[0] != benutzer_id:
                return False
        
        # Zu aktualisierende Felder sammeln
        update_felder = []
        parameter = []
        
        if titel is not None:
            update_felder.append("titel = %s")
            parameter.append(titel)
            
        if zutaten is not None:
            # Zutaten als JSON-String speichern, falls sie als Liste übergeben wurden
            if isinstance(zutaten, list):
                zutaten = json.dumps(zutaten)
            update_felder.append("zutaten = %s")
            parameter.append(zutaten)
            
        if zubereitung is not None:
            update_felder.append("zubereitung = %s")
            parameter.append(zubereitung)
            
        if bild_pfad is not None:
            update_felder.append("bild_pfad = %s")
            parameter.append(bild_pfad)
            
        if kategorie_id is not None:
            update_felder.append("kategorie_id = %s")
            parameter.append(kategorie_id)
            
        # Wenn keine Felder aktualisiert werden sollen
        if not update_felder:
            return True
            
        # SQL-Abfrage erstellen
        sql = f"UPDATE rezepte SET {', '.join(update_felder)} WHERE id = %s"
        parameter.append(rezept_id)
        
        cursor.execute(sql, parameter)
        verbindung.commit()
        
        return cursor.rowcount > 0
    except Exception as fehler:
        print(f"Fehler beim Aktualisieren des Rezepts: {fehler}")
        return False
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezept_loeschen(rezept_id, benutzer_id=None):
    """
    Löscht ein Rezept aus der Datenbank.
    
    @param {int} rezept_id - ID des zu löschenden Rezepts
    @param {int} [benutzer_id] - ID des Benutzers für Berechtigungsprüfung
    
    @return {boolean} True bei erfolgreicher Löschung, False bei Fehler
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return False
            
        cursor = verbindung.cursor()
        
        # Prüfen, ob der Benutzer berechtigt ist, das Rezept zu löschen
        if benutzer_id is not None:
            cursor.execute("SELECT benutzer_id FROM rezepte WHERE id = %s", (rezept_id,))
            rezept = cursor.fetchone()
            if not rezept or rezept[0] != benutzer_id:
                return False
        
        cursor.execute("DELETE FROM rezepte WHERE id = %s", (rezept_id,))
        verbindung.commit()
        
        return cursor.rowcount > 0
    except Exception as fehler:
        print(f"Fehler beim Löschen des Rezepts: {fehler}")
        return False
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezepte_suchen(suchbegriff, limit=10, offset=0, kategorie_id=None):
    """
    Sucht nach Rezepten anhand eines Suchbegriffs.
    
    @param {string} suchbegriff - Der zu suchende Begriff
    @param {int} [limit=10] - Maximale Anzahl der Ergebnisse
    @param {int} [offset=0] - Anzahl der zu überspringenden Ergebnisse
    @param {int} [kategorie_id] - Filter für eine bestimmte Kategorie
    
    @return {tuple} (rezepte, gesamtanzahl)
    @return {Array<Object>} return[0] - Liste der gefundenen Rezepte
    @return {int} return[1] - Gesamtanzahl der gefundenen Rezepte
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return [], 0
            
        cursor = verbindung.cursor(dictionary=True)
        
        # Basis-SQL-Abfrage
        count_sql = "SELECT COUNT(*) as anzahl FROM rezepte WHERE titel LIKE %s"
        sql = """
        SELECT r.*, b.name as benutzer_name, k.name as kategorie_name
        FROM rezepte r
        LEFT JOIN benutzer b ON r.benutzer_id = b.id
        LEFT JOIN kategorien k ON r.kategorie_id = k.id
        WHERE r.titel LIKE %s
        """
        
        # Parameter für die Suche
        such_param = f"%{suchbegriff}%"
        params = [such_param]
        
        # Wenn eine Kategorie angegeben ist, füge sie zur Abfrage hinzu
        if kategorie_id:
            sql += " AND r.kategorie_id = %s"
            count_sql += " AND kategorie_id = %s"
            params.append(kategorie_id)
        
        # Sortierung und Paginierung
        sql += " ORDER BY r.erstellungsdatum DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        # Gesamtanzahl der Ergebnisse ermitteln
        cursor.execute(count_sql, params[:-2])  # Ohne limit und offset
        anzahl = cursor.fetchone()['anzahl']
        
        # Rezepte abrufen
        cursor.execute(sql, params)
        rezepte = cursor.fetchall()
        
        # Verarbeite alle Rezepte mit Hilfsfunktionen
        for rezept in rezepte:
            rezept = verarbeite_rezept_zutaten(rezept)
            rezept = verarbeite_kategorie_info(rezept)
        
        return rezepte, anzahl
        
    except Exception as fehler:
        print(f"Fehler beim Suchen von Rezepten: {fehler}")
        return [], 0
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def rezepte_suchen_erweitert(suchbegriff, limit=10, offset=0, kategorie_id=None, sortierung='newest'):
    """
    Sucht nach Rezepten mit erweiterten Informationen und Kategorien.
    
    @param {string} suchbegriff - Der zu suchende Begriff
    @param {int} [limit=10] - Maximale Anzahl der Ergebnisse
    @param {int} [offset=0] - Anzahl der zu überspringenden Ergebnisse
    @param {int} [kategorie_id] - Filter für eine bestimmte Kategorie
    @param {string} [sortierung='newest'] - Sortierungsoption
    
    @return {tuple} (rezepte, gesamtanzahl)
    @return {Array<Object>} return[0] - Liste der gefundenen Rezepte mit Kategorie-Informationen
    @return {int} return[1] - Gesamtanzahl der gefundenen Rezepte
    
    @throws {Exception} Bei Datenbankfehlern
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return [], 0
            
        cursor = verbindung.cursor(dictionary=True)
        
        # Basis-SQL-Abfrage mit Kategorie-Informationen
        count_sql = """
        SELECT COUNT(*) as anzahl 
        FROM rezepte r 
        WHERE r.titel LIKE %s
        """
        
        sql = """
        SELECT r.*, b.name as benutzer_name, k.name as kategorie_name
        FROM rezepte r
        LEFT JOIN benutzer b ON r.benutzer_id = b.id
        LEFT JOIN kategorien k ON r.kategorie_id = k.id
        WHERE r.titel LIKE %s
        """
        
        # Parameter für die Suche
        such_param = f"%{suchbegriff}%"
        params = [such_param]
        
        # Wenn eine Kategorie angegeben ist, füge sie zur Abfrage hinzu
        if kategorie_id:
            sql += " AND r.kategorie_id = %s"
            count_sql += " AND kategorie_id = %s"
            params.append(kategorie_id)
        
        # Sortierung hinzufügen
        if sortierung == 'oldest':
            sql += " ORDER BY r.erstellungsdatum ASC"
        elif sortierung == 'name_asc':
            sql += " ORDER BY r.titel ASC"
        elif sortierung == 'name_desc':
            sql += " ORDER BY r.titel DESC"
        else:  # newest (default)
            sql += " ORDER BY r.erstellungsdatum DESC"
        
        # Paginierung nur hinzufügen wenn limit gesetzt ist
        if limit is not None:
            sql += " LIMIT %s OFFSET %s"
            params_with_pagination = params + [limit, offset]
        else:
            params_with_pagination = params
        
        # Gesamtanzahl der Ergebnisse ermitteln
        cursor.execute(count_sql, params)
        anzahl = cursor.fetchone()['anzahl']
        
        # Rezepte abrufen
        cursor.execute(sql, params_with_pagination)
        rezepte = cursor.fetchall()
        
        # Verarbeite alle Rezepte mit Hilfsfunktionen
        for rezept in rezepte:
            rezept = verarbeite_rezept_zutaten(rezept)
            rezept = verarbeite_kategorie_info(rezept)
        
        return rezepte, anzahl
        
    except Exception as fehler:
        print(f"Fehler beim Suchen von Rezepten (erweitert): {fehler}")
        return [], 0
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)