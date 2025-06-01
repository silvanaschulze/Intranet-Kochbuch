"""
@fileoverview Datenbankverbindungsmodul für das Intranet-Kochbuch
@module db

Dieses Modul stellt Funktionen für die Verwaltung der Datenbankverbindung bereit.
Es verwendet Umgebungsvariablen aus der .env-Datei für die Verbindungsdetails.
"""

import os
import mysql.connector
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

def get_db():
    """
    Stellt eine Verbindung zur MySQL-Datenbank her.
    
    Die Verbindungsdetails werden aus den Umgebungsvariablen gelesen:
    - DB_HOST: Hostname des Datenbankservers
    - DB_USER: Datenbankbenutzer
    - DB_PASSWORD: Datenbankpasswort
    - DB_NAME: Name der Datenbank
    
    @return {mysql.connector.connection.MySQLConnection|None} Datenbankverbindung oder None bei Fehler
    """
    try:
        verbindung = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        print("Verbindung zur Datenbank erfolgreich hergestellt.")
        return verbindung
    except mysql.connector.Error as fehler:
        print(f"Fehler bei der Verbindung zur Datenbank: {fehler}")
        return None

# Alias für Kompatibilität
verbinden = get_db

def verbindung_schliessen(verbindung):
    """
    Schließt die Datenbankverbindung sicher.
    
    @param {mysql.connector.connection.MySQLConnection} verbindung - Die zu schließende Datenbankverbindung
    """
    if verbindung and verbindung.is_connected():
        verbindung.close()
        print("Datenbankverbindung sicher geschlossen.")

if __name__ == "__main__":
    conn = get_db()
    if conn:
        verbindung_schliessen(conn)

