"""
SSL-Konfiguration für HTTPS-Kommunikation
"""
import os
import ssl
from pathlib import Path


class SSLConfig:
    """
    Klasse für SSL-Konfiguration
    """
    
    def __init__(self):
        self.ssl_dir = Path(__file__).parent / 'ssl'
        self.cert_file = self.ssl_dir / 'cert.pem'
        self.key_file = self.ssl_dir / 'key.pem'
        
    def ensure_ssl_directory(self):
        """
        Stellt sicher, dass das SSL-Verzeichnis existiert
        """
        self.ssl_dir.mkdir(exist_ok=True)
        
    def generate_self_signed_certificate(self):
        """
        Generiert selbstsignierte Zertifikate für Entwicklung
        """
        import subprocess
        
        self.ensure_ssl_directory()
        
        if not self.cert_file.exists() or not self.key_file.exists():
            print("Generiere selbstsignierte SSL-Zertifikate...")
            
            # OpenSSL-Befehl für selbstsigniertes Zertifikat
            cmd = [
                'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
                '-keyout', str(self.key_file),
                '-out', str(self.cert_file),
                '-days', '365', '-nodes',
                '-subj', '/CN=localhost'
            ]
            
            try:
                subprocess.run(cmd, check=True, capture_output=True)
                print(f"SSL-Zertifikate erstellt in: {self.ssl_dir}")
            except subprocess.CalledProcessError as e:
                print(f"Fehler beim Erstellen der SSL-Zertifikate: {e}")
                return False
            except FileNotFoundError:
                print("OpenSSL nicht gefunden. Bitte installieren Sie OpenSSL.")
                return False
                
        return True
        
    def get_ssl_context(self):
        """
        Erstellt SSL-Kontext für Flask-Anwendung
        
        @return {ssl.SSLContext|None} SSL-Kontext oder None bei Fehlern
        """
        if not self.cert_file.exists() or not self.key_file.exists():
            if not self.generate_self_signed_certificate():
                return None
                
        try:
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            context.load_cert_chain(str(self.cert_file), str(self.key_file))
            return context
        except Exception as e:
            print(f"Fehler beim Erstellen des SSL-Kontexts: {e}")
            return None
            
    def is_ssl_available(self):
        """
        Prüft, ob SSL-Zertifikate verfügbar sind
        
        @return {bool} True wenn SSL verfügbar ist
        """
        return self.cert_file.exists() and self.key_file.exists()


def setup_https_config():
    """
    Konfiguriert HTTPS für die Flask-Anwendung
    
    @return {dict} Konfiguration für Flask run() Methode
    """
    # TEMPORÄR: HTTP erzwingen wegen SSL-Timeout-Problemen
    print("⚠️  Temporäre HTTP-Konfiguration aktiviert...")
    return {'host': '0.0.0.0', 'port': 5000}
    
    # Original SSL-Code auskommentiert
    """
    ssl_config = SSLConfig()
    
    # Für Produktion: Echte SSL-Zertifikate verwenden
    if os.getenv('FLASK_ENV') == 'production':
        cert_path = os.getenv('SSL_CERT_PATH')
        key_path = os.getenv('SSL_KEY_PATH')
        
        if cert_path and key_path and os.path.exists(cert_path) and os.path.exists(key_path):
            return {
                'ssl_context': (cert_path, key_path),
                'host': '0.0.0.0',
                'port': 443
            }
        else:
            print("WARNUNG: Produktionsumgebung ohne gültige SSL-Zertifikate!")
            return {'host': '0.0.0.0', 'port': 80}
    
    # Für Entwicklung: Selbstsignierte Zertifikate
    else:
        ssl_context = ssl_config.get_ssl_context()
        if ssl_context:
            return {
                'ssl_context': ssl_context,
                'host': '0.0.0.0',
                'port': 5443  # HTTPS Port für Entwicklung
            }
        else:
            print("WARNUNG: HTTPS nicht verfügbar, verwende HTTP...")
            return {'host': '0.0.0.0', 'port': 5000}
    """


def get_api_url():
    """
    Gibt die korrekte API-URL basierend auf SSL-Verfügbarkeit zurück
    
    @return {str} API-URL mit HTTPS oder HTTP
    """
    ssl_config = SSLConfig()
    
    if os.getenv('FLASK_ENV') == 'production':
        return 'https://yourdomain.com'
    elif ssl_config.is_ssl_available():
        return 'https://localhost:5443'
    else:
        return 'http://localhost:5000' 