#!/usr/bin/env python3
"""
Script para criar Backup/Dump do Banco de Dados
"""
import os
import subprocess
import tarfile
import zipfile
from datetime import datetime
from pathlib import Path


class DatabaseDumper:
    """
    Klasse für Datenbank-Backup-Operationen
    """
    
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'fi37_schulze_fpadw')
        }
        
        # Backup-Verzeichnis erstellen
        self.backup_dir = Path(__file__).parent.parent / 'backups'
        self.backup_dir.mkdir(exist_ok=True)
        
        # Dateinamen für Backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.dump_filename = f"schulze_dbdump_{timestamp}.sql"
        self.dump_path = self.backup_dir / self.dump_filename
        
    def create_mysql_dump(self):
        """
        Erstellt MySQL-Dump mit mysqldump
        
        @return {bool} True bei Erfolg, False bei Fehler
        """
        try:
            print(f"📋 Erstelle MySQL-Dump für Datenbank: {self.db_config['database']}")
            
            # mysqldump-Befehl zusammenstellen
            cmd = [
                'mysqldump',
                f"--host={self.db_config['host']}",
                f"--user={self.db_config['user']}",
                '--single-transaction',
                '--routines',
                '--triggers',
                '--add-drop-table',
                '--add-locks',
                '--create-options',
                '--quick',
                '--lock-tables=false'
            ]
            
            # Passwort hinzufügen wenn vorhanden
            if self.db_config['password']:
                cmd.append(f"--password={self.db_config['password']}")
            
            # Datenbankname hinzufügen
            cmd.append(self.db_config['database'])
            
            # Dump erstellen
            with open(self.dump_path, 'w', encoding='utf-8') as dump_file:
                result = subprocess.run(
                    cmd,
                    stdout=dump_file,
                    stderr=subprocess.PIPE,
                    text=True,
                    check=True
                )
            
            print(f"✅ MySQL-Dump erfolgreich erstellt: {self.dump_path}")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Fehler beim Erstellen des MySQL-Dumps: {e}")
            print(f"Stderr: {e.stderr}")
            return False
        except FileNotFoundError:
            print("❌ mysqldump nicht gefunden. Bitte MySQL installieren.")
            return False
        except Exception as e:
            print(f"❌ Unerwarteter Fehler: {e}")
            return False
    
    def create_python_dump(self):
        """
        Erstellt Datenbank-Dump mit Python (Fallback)
        
        @return {bool} True bei Erfolg, False bei Fehler
        """
        try:
            import mysql.connector
            from db import verbinden
            
            print(f"📋 Erstelle Python-Dump für Datenbank: {self.db_config['database']}")
            
            # Datenbankverbindung
            db = verbinden()
            if not db:
                print("❌ Keine Datenbankverbindung möglich")
                return False
            
            cursor = db.cursor()
            
            with open(self.dump_path, 'w', encoding='utf-8') as dump_file:
                # Header schreiben
                dump_file.write(f"-- MySQL Dump\n")
                dump_file.write(f"-- Erstellt am: {datetime.now()}\n")
                dump_file.write(f"-- Datenbank: {self.db_config['database']}\n")
                dump_file.write(f"-- --------------------------------------------------------\n\n")
                
                # Alle Tabellen abrufen
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                
                for (table_name,) in tables:
                    print(f"   📦 Exportiere Tabelle: {table_name}")
                    
                    # CREATE TABLE Statement
                    cursor.execute(f"SHOW CREATE TABLE `{table_name}`")
                    create_statement = cursor.fetchone()[1]
                    
                    dump_file.write(f"-- Struktur für Tabelle `{table_name}`\n")
                    dump_file.write(f"DROP TABLE IF EXISTS `{table_name}`;\n")
                    dump_file.write(f"{create_statement};\n\n")
                    
                    # Daten exportieren
                    cursor.execute(f"SELECT * FROM `{table_name}`")
                    rows = cursor.fetchall()
                    
                    if rows:
                        # Spaltennamen abrufen
                        cursor.execute(f"DESCRIBE `{table_name}`")
                        columns = [col[0] for col in cursor.fetchall()]
                        
                        dump_file.write(f"-- Daten für Tabelle `{table_name}`\n")
                        dump_file.write(f"INSERT INTO `{table_name}` (`{'`, `'.join(columns)}`) VALUES\n")
                        
                        for i, row in enumerate(rows):
                            # Daten formatieren
                            formatted_values = []
                            for value in row:
                                if value is None:
                                    formatted_values.append("NULL")
                                elif isinstance(value, str):
                                    # SQL-Injection verhindern
                                    escaped_value = value.replace("'", "''")
                                    formatted_values.append(f"'{escaped_value}'")
                                elif isinstance(value, datetime):
                                    formatted_values.append(f"'{value.strftime('%Y-%m-%d %H:%M:%S')}'")
                                else:
                                    formatted_values.append(str(value))
                            
                            values_str = f"({', '.join(formatted_values)})"
                            
                            if i == len(rows) - 1:
                                dump_file.write(f"{values_str};\n\n")
                            else:
                                dump_file.write(f"{values_str},\n")
            
            db.close()
            print(f"✅ Python-Dump erfolgreich erstellt: {self.dump_path}")
            return True
            
        except Exception as e:
            print(f"❌ Fehler beim Erstellen des Python-Dumps: {e}")
            return False
    
    def compress_dump(self, format='tar'):
        """
        Komprimiert den Dump
        
        @param {str} format - Komprimierungsformat ('tar' oder 'zip')
        @return {str|None} Pfad zur komprimierten Datei oder None bei Fehler
        """
        if not self.dump_path.exists():
            print("❌ Dump-Datei nicht gefunden")
            return None
        
        try:
            if format == 'tar':
                archive_path = self.dump_path.with_suffix('.tar.gz')
                with tarfile.open(archive_path, 'w:gz') as tar:
                    tar.add(self.dump_path, arcname=self.dump_path.name)
                print(f"✅ TAR-Archiv erstellt: {archive_path}")
                
            elif format == 'zip':
                archive_path = self.dump_path.with_suffix('.zip')
                with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    zipf.write(self.dump_path, self.dump_path.name)
                print(f"✅ ZIP-Archiv erstellt: {archive_path}")
                
            else:
                print(f"❌ Unbekanntes Format: {format}")
                return None
            
            # Original-Dump löschen
            self.dump_path.unlink()
            return str(archive_path)
            
        except Exception as e:
            print(f"❌ Fehler beim Komprimieren: {e}")
            return None
    
    def create_backup(self, compress=True, format='tar'):
        """
        Erstellt vollständigen Backup-Prozess
        
        @param {bool} compress - Ob das Backup komprimiert werden soll
        @param {str} format - Komprimierungsformat
        @return {str|None} Pfad zur Backup-Datei
        """
        print("🔧 Starte Datenbank-Backup...")
        
        # Versuche zuerst mysqldump, dann Python-Fallback
        success = self.create_mysql_dump()
        if not success:
            print("⚠️  mysqldump fehlgeschlagen, verwende Python-Fallback...")
            success = self.create_python_dump()
        
        if not success:
            print("❌ Backup fehlgeschlagen")
            return None
        
        # Komprimierung
        if compress:
            print(f"📦 Komprimiere Backup ({format})...")
            return self.compress_dump(format)
        else:
            return str(self.dump_path)


def main():
    """
    Hauptfunktion für Backup-Script
    """
    print("=" * 60)
    print("🗃️  INTRANET-KOCHBUCH DATENBANK-BACKUP")
    print("=" * 60)
    
    dumper = DatabaseDumper()
    
    # Backup erstellen
    backup_file = dumper.create_backup(compress=True, format='tar')
    
    if backup_file:
        print(f"✅ Backup erfolgreich erstellt: {backup_file}")
        
        # Dateigröße anzeigen
        file_size = Path(backup_file).stat().st_size
        size_mb = file_size / (1024 * 1024)
        print(f"📏 Dateigröße: {size_mb:.2f} MB")
        
        print("\n📋 Backup-Informationen:")
        print(f"   • Datei: {Path(backup_file).name}")
        print(f"   • Pfad: {backup_file}")
        print(f"   • Größe: {size_mb:.2f} MB")
        print(f"   • Erstellt: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
        
    else:
        print("❌ Backup fehlgeschlagen")
        return 1
    
    print("=" * 60)
    return 0


if __name__ == "__main__":
    exit(main()) 