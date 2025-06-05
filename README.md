# 🍳 Intranet-Kochbuch

Ein Rezept-Management-System für Intranets, entwickelt mit React (Frontend) und Flask (Backend).

## 📋 Voraussetzungen

- Node.js 16+ und npm
- Python 3.8+
- MySQL 8.0+
- Git

## ⚙️ Konfiguration

### Backend (Flask)

1. **Repository klonen:**
```bash
git clone <repository-url>
cd Intranet-Kochbuch
```

2. **Backend konfigurieren:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

3. **Datenbank konfigurieren:**
```bash
# Datenbank-Dump importieren
mysql -u root -p < ../schulze_dbdump.sql
```

4. **Umgebungsvariablen konfigurieren:**
Datei `.env` im Ordner `backend` erstellen:
```
DB_HOST=localhost
DB_USER=silvana
DB_PASSWORD=123456
DB_NAME=fi37_schulze_fpadw
SECRET_KEY=ihr-geheimer-schluessel-hier
```

### Frontend (React)

1. **Frontend konfigurieren:**
```bash
cd frontend
npm install
```

2. **Umgebungsvariablen konfigurieren:**
Datei `.env` im Ordner `frontend` erstellen:
```
REACT_APP_API_URL=http://192.168.64.3:5000
REACT_APP_NAME=Intranet-Kochbuch
```

## 🚀 Ausführung

### Backend starten:
```bash
cd backend
source venv/bin/activate
python app.py
```
Backend läuft unter: `http://192.168.64.3:5000`

### Frontend starten:
```bash
cd frontend
npm start
```
Frontend läuft unter: `http://localhost:3000`

## 🏗️ Projektstruktur

```
Intranet-Kochbuch/
├── backend/                 # Flask API
│   ├── routes/             # API-Routen
│   ├── static/             # Statische Dateien
│   ├── .env               # Backend-Konfiguration
│   └── app.py            # Hauptanwendung
├── frontend/               # React-Interface
│   ├── src/               # Quellcode
│   ├── public/            # Öffentliche Dateien
│   ├── .env              # Frontend-Konfiguration
│   └── package.json      # Abhängigkeiten
└── docs/                  # Dokumentation
```

## 🔧 Funktionalitäten

- ✅ JWT-Authentifizierung
- ✅ Bild-Upload (Rezepte und Profil)
- ✅ Favoriten-System
- ✅ Rezept-Kategorisierung
- ✅ Suche und Filter
- ✅ Responsive Benutzeroberfläche
- ✅ PWA (Progressive Web App)

## 🐛 Fehlerbehebung

### Fehler 401 (Token abgelaufen)
- Melden Sie sich ab und wieder an
- Überprüfen Sie, ob das Backend läuft

### Bilder werden nicht geladen
- Überprüfen Sie, ob `REACT_APP_API_URL` in `.env` korrekt ist
- Bestätigen Sie, dass das Backend Berechtigung für `static/uploads` hat

### CORS-Fehler
- Überprüfen Sie, ob die Frontend-URL in der CORS-Liste des Backends steht
- Bestätigen Sie, dass beide Server laufen

## 👥 Mitwirkung

1. Forken Sie das Projekt
2. Erstellen Sie einen Branch für Ihr Feature
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. 