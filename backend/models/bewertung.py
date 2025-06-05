"""
@fileoverview Bewertungsmodell für das Intranet-Kochbuch
@module bewertung

Dieses Modul implementiert die Datenbankoperationen für Bewertungen:
- Erstellen von Bewertungen
- Abrufen von Bewertungen
- Aktualisieren von Bewertungen
- Löschen von Bewertungen
- Berechnen von Durchschnittsbewertungen
"""

from db import verbinden, verbindung_schliessen

def bewertung_erstellen(rezept_id, benutzer_id, bewertung):
    """
    Erstellt eine neue Bewertung oder aktualisiert eine bestehende.
    
    @param {int} rezept_id - ID des Rezepts
    @param {int} benutzer_id - ID des Benutzers
    @param {int} bewertung - Bewertung (1-5)
    @return {bool} True bei Erfolg, False bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return False

        cursor = verbindung.cursor()
        
        # INSERT ... ON DUPLICATE KEY UPDATE für upsert
        sql = """
        INSERT INTO bewertungen (rezept_id, benutzer_id, bewertung) 
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE 
        bewertung = VALUES(bewertung),
        aktualisierungsdatum = CURRENT_TIMESTAMP
        """
        
        cursor.execute(sql, (rezept_id, benutzer_id, bewertung))
        verbindung.commit()
        return True

    except Exception as fehler:
        print(f"Fehler beim Erstellen/Aktualisieren der Bewertung: {fehler}")
        if verbindung:
            verbindung.rollback()
        return False

    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def bewertung_abrufen(rezept_id, benutzer_id):
    """
    Ruft die Bewertung eines Benutzers für ein Rezept ab.
    
    @param {int} rezept_id - ID des Rezepts
    @param {int} benutzer_id - ID des Benutzers
    @return {dict|None} Bewertungsdaten oder None
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return None

        cursor = verbindung.cursor(dictionary=True)
        
        sql = """
        SELECT id, rezept_id, benutzer_id, bewertung, 
               erstellungsdatum, aktualisierungsdatum
        FROM bewertungen 
        WHERE rezept_id = %s AND benutzer_id = %s
        """
        
        cursor.execute(sql, (rezept_id, benutzer_id))
        return cursor.fetchone()

    except Exception as fehler:
        print(f"Fehler beim Abrufen der Bewertung: {fehler}")
        return None

    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def bewertungen_fuer_rezept_abrufen(rezept_id):
    """
    Ruft alle Bewertungen für ein Rezept ab.
    
    @param {int} rezept_id - ID des Rezepts
    @return {list} Liste der Bewertungen
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return []

        cursor = verbindung.cursor(dictionary=True)
        
        sql = """
        SELECT b.id, b.rezept_id, b.benutzer_id, b.bewertung,
               b.erstellungsdatum, b.aktualisierungsdatum,
               u.name as benutzer_name
        FROM bewertungen b
        JOIN benutzer u ON b.benutzer_id = u.id
        WHERE b.rezept_id = %s
        ORDER BY b.aktualisierungsdatum DESC
        """
        
        cursor.execute(sql, (rezept_id,))
        return cursor.fetchall()

    except Exception as fehler:
        print(f"Fehler beim Abrufen der Bewertungen: {fehler}")
        return []

    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def durchschnittsbewertung_berechnen(rezept_id):
    """
    Berechnet die Durchschnittsbewertung für ein Rezept.
    
    @param {int} rezept_id - ID des Rezepts
    @return {dict} Durchschnitt und Anzahl der Bewertungen
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return {'durchschnitt': 0, 'anzahl': 0}

        cursor = verbindung.cursor()
        
        sql = """
        SELECT AVG(bewertung) as durchschnitt, COUNT(*) as anzahl
        FROM bewertungen 
        WHERE rezept_id = %s
        """
        
        cursor.execute(sql, (rezept_id,))
        result = cursor.fetchone()
        
        if result and result[0] is not None:
            return {
                'durchschnitt': round(float(result[0]), 1),
                'anzahl': int(result[1])
            }
        else:
            return {'durchschnitt': 0, 'anzahl': 0}

    except Exception as fehler:
        print(f"Fehler beim Berechnen der Durchschnittsbewertung: {fehler}")
        return {'durchschnitt': 0, 'anzahl': 0}

    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

def bewertung_loeschen(rezept_id, benutzer_id):
    """
    Löscht die Bewertung eines Benutzers für ein Rezept.
    
    @param {int} rezept_id - ID des Rezepts
    @param {int} benutzer_id - ID des Benutzers
    @return {bool} True bei Erfolg, False bei Fehler
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            return False

        cursor = verbindung.cursor()
        
        sql = "DELETE FROM bewertungen WHERE rezept_id = %s AND benutzer_id = %s"
        cursor.execute(sql, (rezept_id, benutzer_id))
        
        verbindung.commit()
        return cursor.rowcount > 0

    except Exception as fehler:
        print(f"Fehler beim Löschen der Bewertung: {fehler}")
        if verbindung:
            verbindung.rollback()
        return False

    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung) 