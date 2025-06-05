#!/usr/bin/env python3
"""
@fileoverview Hauptanwendungsmodul für das Intranet-Kochbuch Backend
@module app

Dieses Modul initialisiert die Flask-Anwendung und konfiguriert:
- CORS für Cross-Origin-Anfragen
- HTTPS/SSL-Unterstützung
- Statische Datei-Uploads
- API-Routen für alle Module
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
from pathlib import Path

# Aktuelles Verzeichnis zum Python Path hinzufügen
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from routes.benutzer_routes import benutzer_bp
from routes.rezept_routes import rezept_bp
from routes.kategorie_routes import kategorie_bp
from routes.favorit_routes import favorit_bp
from routes.kommentar_routes import kommentar_bp
from routes.bewertung_routes import bewertung_bp
from dotenv import load_dotenv

# SSL-Konfiguration importieren mit Fallback
try:
    from ssl_config import setup_https_config
    SSL_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  SSL-Modul nicht verfügbar: {e}")
    SSL_AVAILABLE = False
    
    def setup_https_config():
        """Fallback-Funktion ohne SSL"""
        return {'host': '0.0.0.0', 'port': 5000}

# Umgebungsvariablen laden
load_dotenv()


def create_app(config=None):
    """
    Flask-Anwendung erstellen und konfigurieren
    
    @param {dict} [config] - Optionale Konfiguration für Tests
    @return {Flask} Konfigurierte Flask-Anwendung
    """
    app = Flask(__name__, static_folder='static')
    
    # Configuração da chave secreta para JWT (mesma que utils/token.py usa)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'sua-chave-secreta-muito-segura-aqui-2024')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB maximale Dateigröße
    
    # Test-Konfiguration überschreiben falls vorhanden
    if config:
        app.config.update(config)
    
    # Configuração CORS mais permissiva para desenvolvimento
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://192.168.64.1:3000", "http://192.168.64.3:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True
        },
        r"/static/*": {
            "origins": ["http://localhost:3000", "http://192.168.64.1:3000", "http://192.168.64.3:3000"],
            "methods": ["GET"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        }
    })
    
    # Configuração das pastas de uploads
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
    app.config['PROFILE_FOLDER'] = os.path.join(app.root_path, 'static', 'profile_images')

    # Criar diretórios se não existirem
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PROFILE_FOLDER'], exist_ok=True)

    # Rota para servir arquivos estáticos da pasta uploads
    @app.route('/static/uploads/<path:filename>')
    def serve_upload(filename):
        """
        Serve arquivos estáticos da pasta uploads
        """
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Rota para servir arquivos estáticos da pasta profile_images
    @app.route('/static/profile_images/<path:filename>')
    def serve_profile_image(filename):
        """
        Serve arquivos estáticos da pasta profile_images
        """
        return send_from_directory(app.config['PROFILE_FOLDER'], filename)

    # Blueprints registrieren
    app.register_blueprint(benutzer_bp, url_prefix='/api/benutzer')
    app.register_blueprint(rezept_bp, url_prefix='/api/rezepte')
    app.register_blueprint(kategorie_bp, url_prefix='/api/kategorien')
    app.register_blueprint(favorit_bp, url_prefix='/api/favoriten')
    app.register_blueprint(kommentar_bp, url_prefix='/api/kommentare')
    app.register_blueprint(bewertung_bp, url_prefix='/api/bewertungen')

    # Hauptrouten
    @app.route("/")
    def home():
        """
        Rota principal para verificar se o servidor está funcionando.
        
        @route GET /
        
        @return {Object} response
        @return {string} response.message - Mensagem de status
        @return {string} response.status - Status do servidor
        """
        return jsonify({
            "message": "Intranet-Kochbuch Backend is running",
            "status": "online",
            "version": "1.0.0"
        }), 200

    @app.route('/api/health')
    def health_check():
        """
        Gesundheitsprüfung für Load Balancer
        
        @return {dict} Status der Anwendung
        """
        return jsonify({
            "status": "healthy", 
            "message": "Backend is running",
            "ssl_enabled": app.config.get('SSL_ENABLED', False)
        })

    @app.errorhandler(404)
    def not_found(error):
        """
        Behandelt 404-Fehler (Nicht gefunden).
        
        @param {Object} error - Fehlerobjekt
        @return {Object} JSON-Antwort mit Fehlermeldung
        """
        return jsonify({
            "error": "Endpoint nicht gefunden",
            "message": "Die angeforderte Route existiert nicht"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        """
        Behandelt 500-Fehler (Interner Serverfehler).
        
        @param {Object} error - Fehlerobjekt
        @return {Object} JSON-Antwort mit Fehlermeldung
        """
        return jsonify({
            "error": "Interner Serverfehler",
            "message": "Ein unerwarteter Fehler ist aufgetreten"
        }), 500
        
    return app


if __name__ == "__main__":
    # Flask-App erstellen
    app = create_app()
    
    # HTTPS-Konfiguration laden
    https_config = setup_https_config()
    
    # SSL-Status in App-Config setzen
    app.config['SSL_ENABLED'] = SSL_AVAILABLE and 'ssl_context' in https_config
    
    print("=" * 60)
    print("🍳 INTRANET-KOCHBUCH BACKEND")
    print("=" * 60)
    
    if app.config['SSL_ENABLED']:
        print(f"🔒 HTTPS-Server startet auf Port {https_config['port']}")
        print(f"📍 URL: https://localhost:{https_config['port']}")
        print(f"📍 VM URL: https://192.168.64.3:{https_config['port']}")
        print("⚠️  Bei selbstsignierten Zertifikaten Browser-Warnung ignorieren")
    else:
        print(f"🌐 HTTP-Server startet auf Port {https_config['port']}")
        print(f"📍 URL: http://localhost:{https_config['port']}")
        print(f"📍 VM URL: http://192.168.64.3:{https_config['port']}")
        if not SSL_AVAILABLE:
            print("⚠️  SSL-Modul nicht verfügbar - verwende HTTP...")
        else:
            print("⚠️  HTTPS nicht verfügbar - nur für Entwicklung verwenden!")
    
    print("📋 Verfügbare Endpunkte:")
    print("   • /api/benutzer   - Benutzerverwaltung")
    print("   • /api/rezepte    - Rezeptverwaltung")
    print("   • /api/kategorien - Kategorieverwaltung")
    print("   • /api/favoriten  - Favoritenverwaltung")
    print("   • /api/kommentare - Kommentarverwaltung")
    print("   • /api/bewertungen - Bewertungsverwaltung")
    print("   • /api/health     - Gesundheitsprüfung")
    print("=" * 60)
    
    # Konfiguration für Entwicklung
    if app.config.get('ENV') == 'development':
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True
        )
    else:
        # Konfiguration für Produktion mit HTTPS
        # Für die Produktionsnutzung müssen gültige SSL-Zertifikate vorhanden sein
        # Ersetzen Sie 'cert.pem' und 'key.pem' durch Ihre echten Zertifikate
        try:
            # Versuch mit SSL auszuführen
            app.run(
                host='0.0.0.0',
                port=443,
                debug=False,
                ssl_context='adhoc'  # Für Entwicklung: generiert selbstsigniertes Zertifikat
                # ssl_context=('cert.pem', 'key.pem')  # Für Produktion mit echten Zertifikaten
            )
        except Exception as e:
            print(f"⚠️  SSL nicht verfügbar: {e}")
            print("🔄 Ausführung in HTTP für Entwicklung...")
            app.run(
                host='0.0.0.0',
                port=5000,
                debug=False
            )

