#!/usr/bin/env python3
"""
Script zum Hinzufügen von funktionierenden Bildern zu den Rezepten
Lädt hochwertige Bilder herunter und aktualisiert die Rezepte
"""

import json
import os
import sys
import uuid
import requests
from io import BytesIO

# Füge das Backend-Verzeichnis zum Pfad hinzu
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import verbinden, verbindung_schliessen

def download_image_with_fallback(urls, filename):
    """
    Versucht mehrere URLs nacheinander bis eine funktioniert
    """
    for i, url in enumerate(urls):
        try:
            print(f"Versuche URL {i+1}: {url}")
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            
            # Erstelle den vollständigen Pfad
            upload_path = os.path.join('static', 'uploads', filename)
            
            # Stelle sicher, dass der uploads-Ordner existiert
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            
            # Speichere das Bild
            with open(upload_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ Bild erfolgreich heruntergeladen: {filename}")
            return filename
            
        except Exception as e:
            print(f"✗ Fehler mit URL {i+1}: {e}")
            continue
    
    print(f"✗ Alle URLs fehlgeschlagen für {filename}")
    return None

def update_recipe_images():
    """
    Aktualisiert die Bilder aller Rezepte mit funktionierenden URLs
    """
    
    # Bessere Bild-URLs für jede Kategorie mit Fallbacks
    recipe_images = {
        'Caesar Salad': [
            'https://cdn.pixabay.com/photo/2016/03/05/19/02/salad-1238250_640.jpg',
            'https://cdn.pixabay.com/photo/2015/05/31/13/59/salad-791891_640.jpg',
            'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Spaghetti Carbonara': [
            'https://cdn.pixabay.com/photo/2016/11/06/23/31/spaghetti-1804457_640.jpg',
            'https://cdn.pixabay.com/photo/2018/02/25/07/15/food-3179853_640.jpg',
            'https://images.pexels.com/photos/803963/pexels-photo-803963.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Tiramisu': [
            'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_640.jpg',
            'https://cdn.pixabay.com/photo/2016/11/22/18/52/cake-1851142_640.jpg',
            'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Bruschetta': [
            'https://cdn.pixabay.com/photo/2018/06/12/20/17/bruschetta-3471161_640.jpg',
            'https://cdn.pixabay.com/photo/2017/05/07/08/56/blanc-2290678_640.jpg',
            'https://images.pexels.com/photos/6107787/pexels-photo-6107787.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Mojito': [
            'https://cdn.pixabay.com/photo/2016/03/02/13/59/drink-1232276_640.jpg',
            'https://cdn.pixabay.com/photo/2017/06/02/18/24/fruit-2367029_640.jpg',
            'https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Eistee': [
            'https://cdn.pixabay.com/photo/2017/09/28/18/14/tea-2795210_640.jpg',
            'https://cdn.pixabay.com/photo/2016/08/23/15/52/fresh-1614253_640.jpg',
            'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Kartoffelsalat': [
            'https://images.pexels.com/photos/8500/food-dinner-lunch-unhealthy.jpg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Pizza': [
            'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Agua': [
            'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        'Teste': [
            'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]
    }
    
    # Verbindung zur Datenbank herstellen
    connection = verbinden()
    if not connection:
        print("Fehler: Kann keine Verbindung zur Datenbank herstellen")
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Alle Rezepte abrufen
        sql = "SELECT id, titel, bild_pfad FROM rezepte ORDER BY id"
        cursor.execute(sql)
        rezepte = cursor.fetchall()
        
        print(f"Gefunden: {len(rezepte)} Rezepte")
        
        updated_count = 0
        
        for rezept in rezepte:
            rezept_id = rezept['id']
            titel = rezept['titel']
            current_image = rezept['bild_pfad']
            
            print(f"\nBearbeite Rezept: {titel} (ID: {rezept_id})")
            
            # Bestimme die passenden Bild-URLs basierend auf dem Titel
            image_urls = None
            if 'Caesar' in titel:
                image_urls = recipe_images['Caesar Salad']
            elif 'Carbonara' in titel:
                image_urls = recipe_images['Spaghetti Carbonara']
            elif 'Tiramisu' in titel:
                image_urls = recipe_images['Tiramisu']
            elif 'Bruschetta' in titel:
                image_urls = recipe_images['Bruschetta']
            elif 'Mojito' in titel:
                image_urls = recipe_images['Mojito']
            elif 'Eistee' in titel or 'Tee' in titel:
                image_urls = recipe_images['Eistee']
            elif 'Kartoffelsalat' in titel:
                image_urls = recipe_images['Kartoffelsalat']
            elif 'Pizza' in titel:
                image_urls = recipe_images['Pizza']
            elif 'aqua' in titel.lower() or 'agua' in titel.lower():
                image_urls = recipe_images['Agua']
            elif 'Teste' in titel or 'Test' in titel:
                image_urls = recipe_images['Teste']
            
            if not image_urls:
                print(f"Keine passenden Bild-URLs für '{titel}' gefunden")
                continue
            
            # Neuen Dateinamen generieren
            safe_title = titel.lower().replace(' ', '_').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
            image_filename = f"{uuid.uuid4()}_{safe_title}.jpg"
            
            # Bild herunterladen
            image_path = download_image_with_fallback(image_urls, image_filename)
            
            if image_path:
                # Rezept aktualisieren
                update_sql = "UPDATE rezepte SET bild_pfad = %s WHERE id = %s"
                cursor.execute(update_sql, (image_path, rezept_id))
                connection.commit()
                
                print(f"✓ Rezept '{titel}' mit Bild aktualisiert")
                updated_count += 1
                
                # Altes Bild löschen falls vorhanden
                if current_image and current_image != image_path:
                    old_path = os.path.join('static', current_image)
                    try:
                        if os.path.exists(old_path):
                            os.remove(old_path)
                            print(f"  Altes Bild gelöscht: {current_image}")
                    except Exception as e:
                        print(f"  Warnung: Konnte altes Bild nicht löschen: {e}")
            else:
                print(f"✗ Kein Bild für '{titel}' heruntergeladen")
        
        print(f"\n✓ Erfolgreich {updated_count} Rezepte mit Bildern aktualisiert!")
        return True
        
    except Exception as e:
        print(f"Fehler beim Aktualisieren der Rezeptbilder: {e}")
        return False
    finally:
        if connection:
            verbindung_schliessen(connection)

def verify_images():
    """
    Überprüft alle Rezeptbilder und zeigt den Status an
    """
    connection = verbinden()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        sql = "SELECT id, titel, bild_pfad FROM rezepte ORDER BY id"
        cursor.execute(sql)
        rezepte = cursor.fetchall()
        
        print("\n" + "="*60)
        print("BILDSTATUS DER REZEPTE:")
        print("="*60)
        
        images_ok = 0
        images_missing = 0
        
        for rezept in rezepte:
            titel = rezept['titel']
            bild_pfad = rezept['bild_pfad']
            
            if bild_pfad:
                # Se o caminho já contém 'uploads/', usar como está
                # Se não, adicionar 'uploads/' antes do nome do arquivo
                if bild_pfad.startswith('uploads/'):
                    full_path = os.path.join('static', bild_pfad)
                else:
                    full_path = os.path.join('static', 'uploads', bild_pfad)
                
                if os.path.exists(full_path):
                    print(f"✓ {titel}: {bild_pfad}")
                    images_ok += 1
                else:
                    print(f"✗ {titel}: Datei nicht gefunden - {full_path}")
                    images_missing += 1
            else:
                print(f"✗ {titel}: Kein Bild")
                images_missing += 1
        
        print(f"\nZusammenfassung:")
        print(f"✓ Bilder OK: {images_ok}")
        print(f"✗ Bilder fehlen: {images_missing}")
        print(f"Gesamt: {len(rezepte)} Rezepte")
        
        return True
        
    except Exception as e:
        print(f"Fehler bei der Bildverifikation: {e}")
        return False
    finally:
        if connection:
            verbindung_schliessen(connection)

if __name__ == "__main__":
    print("Starte die Aktualisierung der Rezeptbilder...")
    
    # Bilder aktualisieren
    success = update_recipe_images()
    
    if success:
        print("\n" + "="*60)
        print("BILDAKTUALISIERUNG ABGESCHLOSSEN!")
        
        # Status überprüfen
        verify_images()
    else:
        print("✗ Fehler beim Aktualisieren der Bilder")
        sys.exit(1) 