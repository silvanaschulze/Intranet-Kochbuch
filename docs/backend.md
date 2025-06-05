# Backend-Dokumentation - Intranet-Kochbuch

## Projektübersicht

Das Intranet-Kochbuch ist eine Flask-basierte Webanwendung zur Verwaltung von Rezepten in einem Unternehmensintranet. Die Backend-API bietet umfassende Funktionalitäten für Benutzerauthentifizierung, Rezeptverwaltung und Dateienhandling.

## Technische Architektur

### Verwendete Technologien
- **Framework:** Flask 2.3.3
- **Datenbank:** MySQL 8.0+
- **Authentifizierung:** JWT (JSON Web Tokens)
- **Password-Hashing:** bcrypt
- **Datei-Upload:** Werkzeug
- **API-Format:** REST JSON

### Projektstruktur
```
backend/
├── app.py                    # Hauptanwendung
├── db.py                     # Datenbankverbindung
├── requirements.txt          # Python-Abhängigkeiten
├── models/                   # Datenmodelle
│   ├── user.py              # Benutzerverwaltung
│   ├── rezept.py            # Rezeptverwaltung
│   ├── kommentar.py         # Kommentarsystem
│   └── favorit.py           # Favoritenverwaltung
├── routes/                   # API-Routen
│   ├── benutzer_routes.py   # Benutzer-Endpoints
│   ├── rezept_routes.py     # Rezept-Endpoints
│   ├── kommentar_routes.py  # Kommentar-Endpoints
│   └── favorit_routes.py    # Favoriten-Endpoints
├── utils/                    # Hilfsfunktionen
│   └── token.py             # JWT-Verwaltung
└── static/                   # Statische Dateien
    └── uploads/             # Hochgeladene Bilder
```

## Implementierte Module

### 1. Benutzerauthentifizierung
**Datei:** `models/user.py`, `routes/benutzer_routes.py`

**Funktionalitäten:**
- Benutzerregistrierung mit E-Mail-Validierung
- Sichere Passwort-Hashung mit bcrypt
- JWT-basierte Anmeldung
- Profilbildverwaltung
- Token-Refresh-Mechanismus

**API-Endpoints:**
- `POST /api/benutzer/registrieren` - Neue Benutzeranmeldung
- `POST /api/benutzer/anmelden` - Benutzeranmeldung
- `GET /api/benutzer/profil` - Profilabfrage
- `PUT /api/benutzer/profil` - Profilaktualisierung

### 2. Rezeptverwaltung
**Datei:** `models/rezept.py`, `routes/rezept_routes.py`

**Funktionalitäten:**
- CRUD-Operationen für Rezepte
- Bildupload mit Validierung
- Suchfunktionalität
- Kategorisierung
- Paginierung

**API-Endpoints:**
- `GET /api/rezepte` - Rezeptliste mit Paginierung
- `GET /api/rezepte/<id>` - Einzelrezept abrufen
- `POST /api/rezepte` - Neues Rezept erstellen
- `PUT /api/rezepte/<id>` - Rezept bearbeiten
- `DELETE /api/rezepte/<id>` - Rezept löschen
- `GET /api/rezepte/suche` - Rezeptsuche

### 3. Favoritensystem
**Datei:** `models/favorit.py`, `routes/favorit_routes.py`

**Funktionalitäten:**
- Rezepte zu Favoriten hinzufügen
- Favoritenliste verwalten
- Favoritenstatus abfragen

**API-Endpoints:**
- `GET /api/favoriten` - Benutzerfavoriten abrufen
- `POST /api/favoriten/rezept/<id>` - Favorit hinzufügen
- `DELETE /api/favoriten/rezept/<id>` - Favorit entfernen

### 4. Kommentarsystem
**Datei:** `models/kommentar.py`, `routes/kommentar_routes.py`

**Funktionalitäten:**
- Kommentare zu Rezepten hinzufügen
- Kommentarverwaltung
- Chronologische Sortierung

## Sicherheitsmaßnahmen

### Authentifizierung
- JWT-Token mit Ablaufzeit
- Sichere Passwort-Hashung (bcrypt)
- Token-Validierung bei geschützten Routen

### Datenschutz
- Eingabevalidierung bei allen Endpoints
- SQL-Injection-Schutz durch prepared statements
- Sichere Dateiuploads mit Typprüfung

### CORS-Konfiguration
- Konfigurierte Cross-Origin-Requests für Frontend-Integration
- Spezifische Header-Berechtigungen

## Datenbankschema

### Tabelle: benutzer
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100), NOT NULL)
- email (VARCHAR(150), UNIQUE, NOT NULL)
- passwort_hash (VARCHAR(255), NOT NULL)
- profilbild (VARCHAR(200))
- registriert_am (DATETIME, DEFAULT CURRENT_TIMESTAMP)
```

### Tabelle: rezepte
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- titel (VARCHAR(200), NOT NULL)
- zutaten (JSON, NOT NULL)
- zubereitung (TEXT, NOT NULL)
- bild (VARCHAR(200))
- kategorie_id (INT)
- benutzer_id (INT, FOREIGN KEY)
- erstellungsdatum (DATETIME, DEFAULT CURRENT_TIMESTAMP)
```

### Tabelle: favoriten
```sql
- benutzer_id (INT, FOREIGN KEY)
- rezept_id (INT, FOREIGN KEY)
- hinzugefuegt_am (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- PRIMARY KEY (benutzer_id, rezept_id)
```

## Deployment-Hinweise

### Umgebungsvariablen
```bash
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=fi37_schulze_fpadw
SECRET_KEY=your_secret_key_here
```

### Systemanforderungen
- Python 3.8+
- MySQL 8.0+
- Mindestens 512MB RAM
- 5GB Speicherplatz für Uploads

### Installation
```bash
pip install -r requirements.txt
python app.py
```

## Entwicklungsrichtlinien

### Code-Qualität
- Verwendung von Docstrings für alle Funktionen
- Konsistente Fehlerbehandlung
- Logging für kritische Operationen
- Deutsche Kommentare und Variablennamen

### Testing
- Unit-Tests für kritische Funktionen
- API-Endpoint-Tests
- Datenbankintegrationstests

## Zukünftige Erweiterungen

### Geplante Features
- Bewertungssystem für Rezepte
- E-Mail-Benachrichtigungen
- Export-Funktionalität
- Erweiterte Suchfilter
- Admin-Dashboard

### Performance-Optimierungen
- Datenbankindikatoren
- Caching für häufige Abfragen
- Bildkomprimierung
- API-Rate-Limiting

---

**Entwickelt von:** Silvana Schulze  
**Datum:** Juni 2025  
**Version:** 1.0


