"""
@fileoverview Script zum Erstellen der Datenbanktabellen
@module create_tables

Dieses Skript liest SQL-Dateien aus dem sql/-Verzeichnis und führt sie aus,
um die erforderlichen Datenbanktabellen zu erstellen.
"""

from db import verbinden, verbindung_schliessen
import os

def sql_dateien_ausfuehren():
    """
    Führt alle SQL-Dateien im sql/-Verzeichnis aus.
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            print("Fehler beim Verbinden mit der Datenbank")
            return False

        cursor = verbindung.cursor()
        
        sql_verzeichnis = os.path.join(os.path.dirname(__file__), 'sql')
        for dateiname in os.listdir(sql_verzeichnis):
            if dateiname.endswith('.sql'):
                print(f"Führe {dateiname} aus...")
                pfad = os.path.join(sql_verzeichnis, dateiname)
                
                with open(pfad, 'r') as datei:
                    sql = datei.read()
                    cursor.execute(sql)
                    
                print(f"{dateiname} erfolgreich ausgeführt")
        
        verbindung.commit()
        print("Alle SQL-Dateien wurden erfolgreich ausgeführt")
        return True
        
    except Exception as fehler:
        print(f"Fehler beim Ausführen der SQL-Dateien: {fehler}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

if __name__ == "__main__":
    sql_dateien_ausfuehren() 