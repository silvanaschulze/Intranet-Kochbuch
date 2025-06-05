#!/usr/bin/env python3
"""
Script zum Erstellen von Beispielrezepten für jede Kategorie
Erstellt vollständige Rezepte mit allen notwendigen Informationen
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
from models.rezept import rezept_erstellen
from models.kategorie import kategorien_auflisten

def download_recipe_image(url, filename):
    """
    Lädt ein Bild von einer URL herunter und speichert es im Uploads-Verzeichnis
    """
    try:
        # Erstelle den Uploads-Ordner falls er nicht existiert
        uploads_dir = os.path.join('static', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Lade das Bild herunter
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Speichere das Bild
        upload_path = os.path.join(uploads_dir, filename)
        
        # Speichere das Bild
        with open(upload_path, 'wb') as f:
            f.write(response.content)
        
        return filename
    except Exception as e:
        print(f"Fehler beim Herunterladen des Bildes {url}: {e}")
        return None

def create_sample_recipes():
    """
    Erstellt Beispielrezepte für jede Kategorie
    """
    
    # Beispielrezepte für jede Kategorie
    sample_recipes = {
        'Vorspeise': {
            'titel': 'Klassischer Caesar Salad',
            'zutaten': [
                {'name': 'Römersalat', 'menge': '2', 'einheit': 'Köpfe'},
                {'name': 'Parmesan', 'menge': '100', 'einheit': 'g'},
                {'name': 'Croutons', 'menge': '1', 'einheit': 'Tasse'},
                {'name': 'Mayonnaise', 'menge': '3', 'einheit': 'EL'},
                {'name': 'Worcestershire-Sauce', 'menge': '1', 'einheit': 'TL'},
                {'name': 'Knoblauch', 'menge': '2', 'einheit': 'Zehen'},
                {'name': 'Zitronensaft', 'menge': '2', 'einheit': 'EL'},
                {'name': 'Olivenöl', 'menge': '3', 'einheit': 'EL'},
                {'name': 'Sardellen', 'menge': '4', 'einheit': 'Stück'}
            ],
            'zubereitung': '''1. Den Römersalat waschen, trockenschleudern und in mundgerechte Stücke zupfen.

2. Für das Dressing: Knoblauch fein hacken und mit Sardellen zu einer Paste zerdrücken.

3. Mayonnaise, Worcestershire-Sauce, Zitronensaft und Olivenöl unterrühren.

4. Den Salat mit dem Dressing vermengen und mit frisch geriebenem Parmesan bestreuen.

5. Mit Croutons garnieren und sofort servieren.

Tipp: Das Dressing kann auch mit einem rohen Ei zubereitet werden für ein authentischeres Ergebnis.''',
            'image_url': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop'
        },
        
        'Hauptgericht': {
            'titel': 'Spaghetti Carbonara',
            'zutaten': [
                {'name': 'Spaghetti', 'menge': '400', 'einheit': 'g'},
                {'name': 'Pancetta oder Guanciale', 'menge': '150', 'einheit': 'g'},
                {'name': 'Eier', 'menge': '4', 'einheit': 'Stück'},
                {'name': 'Pecorino Romano', 'menge': '100', 'einheit': 'g'},
                {'name': 'Schwarzer Pfeffer', 'menge': '1', 'einheit': 'TL'},
                {'name': 'Salz', 'menge': '1', 'einheit': 'Prise'},
                {'name': 'Olivenöl', 'menge': '2', 'einheit': 'EL'}
            ],
            'zubereitung': '''1. Einen großen Topf mit Salzwasser zum Kochen bringen und die Spaghetti nach Packungsanweisung al dente kochen.

2. Pancetta in kleine Würfel schneiden und in einer großen Pfanne ohne Öl bei mittlerer Hitze goldbraun braten.

3. In einer Schüssel die Eier mit dem geriebenen Pecorino und frisch gemahlenem schwarzen Pfeffer verquirlen.

4. Die al dente gekochten Spaghetti abgießen, dabei eine Tasse Nudelwasser aufbewahren.

5. Die heißen Spaghetti sofort zur Pancetta in die Pfanne geben und vom Herd nehmen.

6. Die Ei-Käse-Mischung schnell unter die Nudeln rühren. Bei Bedarf etwas Nudelwasser hinzufügen für eine cremige Konsistenz.

7. Sofort servieren, mit extra Pecorino und schwarzem Pfeffer bestreuen.

Wichtig: Die Pfanne sollte nicht zu heiß sein, damit die Eier nicht gerinnen!''',
            'image_url': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d30e?w=400&h=300&fit=crop'
        },
        
        'Nachspeise': {
            'titel': 'Tiramisu',
            'zutaten': [
                {'name': 'Löffelbiskuits', 'menge': '300', 'einheit': 'g'},
                {'name': 'Mascarpone', 'menge': '500', 'einheit': 'g'},
                {'name': 'Eier', 'menge': '4', 'einheit': 'Stück'},
                {'name': 'Zucker', 'menge': '100', 'einheit': 'g'},
                {'name': 'Starker Espresso', 'menge': '300', 'einheit': 'ml'},
                {'name': 'Kakaopulver', 'menge': '2', 'einheit': 'EL'},
                {'name': 'Amaretto', 'menge': '3', 'einheit': 'EL'},
                {'name': 'Dunkle Schokolade', 'menge': '50', 'einheit': 'g'}
            ],
            'zubereitung': '''1. Den Espresso kochen und mit Amaretto mischen. Abkühlen lassen.

2. Eigelb und Zucker in einer Schüssel schaumig schlagen, bis die Masse hell und cremig ist.

3. Mascarpone portionsweise unterrühren bis eine glatte Creme entsteht.

4. Eiweiß steif schlagen und vorsichtig unter die Mascarpone-Creme heben.

5. Die Löffelbiskuits kurz in den Espresso tauchen und in eine Form legen (erste Schicht).

6. Die Hälfte der Mascarpone-Creme darauf verteilen.

7. Diesen Vorgang wiederholen: Biskuits, dann restliche Creme.

8. Das Tiramisu mindestens 4 Stunden, besser über Nacht, im Kühlschrank ziehen lassen.

9. Vor dem Servieren mit Kakaopulver bestäuben und mit geraspelter Schokolade garnieren.

Tipp: Das Tiramisu schmeckt am besten, wenn es einen Tag lang durchgezogen ist.''',
            'image_url': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop'
        },
        
        'Snack': {
            'titel': 'Bruschetta alla Pomodoro',
            'zutaten': [
                {'name': 'Baguette oder Ciabatta', 'menge': '1', 'einheit': 'Stück'},
                {'name': 'Tomaten', 'menge': '4', 'einheit': 'Stück'},
                {'name': 'Knoblauch', 'menge': '3', 'einheit': 'Zehen'},
                {'name': 'Basilikum', 'menge': '1', 'einheit': 'Bund'},
                {'name': 'Olivenöl extra vergine', 'menge': '4', 'einheit': 'EL'},
                {'name': 'Balsamico-Essig', 'menge': '1', 'einheit': 'EL'},
                {'name': 'Salz', 'menge': '1', 'einheit': 'TL'},
                {'name': 'Schwarzer Pfeffer', 'menge': '1', 'einheit': 'Prise'}
            ],
            'zubereitung': '''1. Das Brot in 1,5 cm dicke Scheiben schneiden und goldbraun rösten (Grill, Pfanne oder Toaster).

2. Tomaten waschen, Stielansatz entfernen und in kleine Würfel schneiden.

3. Knoblauch schälen und fein hacken.

4. Basilikumblätter waschen, trocknen und in Streifen schneiden.

5. Tomaten, Knoblauch und Basilikum in einer Schüssel mischen.

6. Mit Olivenöl, Balsamico, Salz und Pfeffer würzen und 15 Minuten ziehen lassen.

7. Die gerösteten Brotscheiben mit einer halbierten Knoblauchzehe einreiben.

8. Die Tomatenmischung großzügig auf die Brotscheiben verteilen.

9. Sofort servieren, damit das Brot nicht aufweicht.

Variante: Mit Mozzarella oder gerösteten Pinienkernen verfeinern.''',
            'image_url': 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop'
        },
        
        'Alkoholfreie Getränke': {
            'titel': 'Frischer Ingwer-Zitronen-Eistee',
            'zutaten': [
                {'name': 'Grüner Tee', 'menge': '4', 'einheit': 'Beutel'},
                {'name': 'Frischer Ingwer', 'menge': '50', 'einheit': 'g'},
                {'name': 'Zitronen', 'menge': '2', 'einheit': 'Stück'},
                {'name': 'Honig', 'menge': '3', 'einheit': 'EL'},
                {'name': 'Wasser', 'menge': '1', 'einheit': 'l'},
                {'name': 'Eiswürfel', 'menge': '2', 'einheit': 'Tasse'},
                {'name': 'Minzblätter', 'menge': '10', 'einheit': 'Stück'},
                {'name': 'Limette', 'menge': '1', 'einheit': 'Stück'}
            ],
            'zubereitung': '''1. 500ml Wasser zum Kochen bringen.

2. Ingwer schälen und in dünne Scheiben schneiden.

3. Teebeutel und Ingwerscheiben mit dem kochenden Wasser übergießen und 5 Minuten ziehen lassen.

4. Teebeutel entfernen, Honig einrühren und den Tee abkühlen lassen.

5. Zitronen auspressen und den Saft zum abgekühlten Tee geben.

6. Restliches kaltes Wasser hinzufügen.

7. In einen Krug mit Eiswürfeln gießen.

8. Mit Zitronenscheiben, Limettenscheiben und frischen Minzblättern garnieren.

9. Gut umrühren und sofort servieren.

Tipp: Der Tee kann auch ohne Honig zubereitet und nach Geschmack gesüßt werden.''',
            'image_url': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
        },
        
        'Alkoholische Getränke': {
            'titel': 'Klassischer Mojito',
            'zutaten': [
                {'name': 'Weißer Rum', 'menge': '60', 'einheit': 'ml'},
                {'name': 'Limetten', 'menge': '1', 'einheit': 'Stück'},
                {'name': 'Rohrzucker', 'menge': '2', 'einheit': 'TL'},
                {'name': 'Frische Minze', 'menge': '10', 'einheit': 'Blätter'},
                {'name': 'Mineralwasser', 'menge': '120', 'einheit': 'ml'},
                {'name': 'Crushed Ice', 'menge': '1', 'einheit': 'Tasse'},
                {'name': 'Angostura Bitter', 'menge': '3', 'einheit': 'Tropfen'}
            ],
            'zubereitung': '''1. Die Limette in 8 Spalten schneiden.

2. Limettenspalten und Rohrzucker in ein hohes Glas geben.

3. Mit einem Muddler oder Holzlöffel die Limetten leicht andrücken, um den Saft zu extrahieren.

4. Minzblätter dazugeben und vorsichtig andrücken (nicht zerdrücken, nur die Öle freisetzen).

5. Das Glas mit Crushed Ice füllen.

6. Weißen Rum hinzugeben und gut umrühren.

7. Mit Mineralwasser auffüllen.

8. Nochmals vorsichtig umrühren.

9. Mit einem Minzzweig und einer Limettenscheibe garnieren.

10. Mit einem Strohhalm servieren.

Variante: Für einen fruchtigen Twist gefrorene Beeren hinzufügen.''',
            'image_url': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop'
        }
    }
    
    # Verbindung zur Datenbank herstellen
    connection = verbinden()
    if not connection:
        print("Fehler: Kann keine Verbindung zur Datenbank herstellen")
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Benutzer-ID 1 verwenden (Admin-Benutzer)
        admin_user_id = 1
        
        # Alle Kategorien abrufen
        kategorien = kategorien_auflisten()
        
        if not kategorien:
            print("Fehler: Keine Kategorien gefunden")
            return False
        
        print(f"Gefundene Kategorien: {[k['name'] for k in kategorien]}")
        
        # Für jede Kategorie ein Rezept erstellen
        created_count = 0
        for kategorie in kategorien:
            kategorie_name = kategorie['name']
            kategorie_id = kategorie['id']
            
            if kategorie_name not in sample_recipes:
                print(f"Warnung: Kein Beispielrezept für Kategorie '{kategorie_name}' gefunden")
                continue
            
            recipe_data = sample_recipes[kategorie_name]
            
            # Prüfen, ob bereits ein Rezept für diese Kategorie existiert
            check_sql = "SELECT id FROM rezepte WHERE kategorie_id = %s LIMIT 1"
            cursor.execute(check_sql, (kategorie_id,))
            existing = cursor.fetchone()
            
            if existing:
                print(f"Kategorie '{kategorie_name}' hat bereits ein Rezept (ID: {existing['id']})")
                continue
            
            # Bild herunterladen
            image_filename = f"{uuid.uuid4()}_{kategorie_name.lower().replace(' ', '_')}.jpg"
            image_path = download_recipe_image(recipe_data['image_url'], image_filename)
            
            if not image_path:
                print(f"Warnung: Bild für {kategorie_name} konnte nicht heruntergeladen werden")
                image_path = None
            
            # Rezept erstellen
            zutaten_json = json.dumps(recipe_data['zutaten'])
            
            rezept_id = rezept_erstellen(
                titel=recipe_data['titel'],
                zutaten=zutaten_json,
                zubereitung=recipe_data['zubereitung'],
                benutzer_id=admin_user_id,
                bild_pfad=image_path,
                kategorie_id=kategorie_id
            )
            
            if rezept_id:
                print(f"✓ Rezept '{recipe_data['titel']}' für Kategorie '{kategorie_name}' erstellt (ID: {rezept_id})")
                created_count += 1
            else:
                print(f"✗ Fehler beim Erstellen des Rezepts für Kategorie '{kategorie_name}'")
        
        print(f"\nErfolgreich {created_count} Rezepte erstellt!")
        return True
        
    except Exception as e:
        print(f"Fehler beim Erstellen der Rezepte: {e}")
        return False
    finally:
        if connection:
            verbindung_schliessen(connection)

if __name__ == "__main__":
    print("Starte das Erstellen von Beispielrezepten...")
    success = create_sample_recipes()
    
    if success:
        print("✓ Alle Beispielrezepte wurden erfolgreich erstellt!")
    else:
        print("✗ Fehler beim Erstellen der Beispielrezepte")
        sys.exit(1) 