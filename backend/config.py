"""
@fileoverview Konfigurationsdatei für das Intranet-Kochbuch
@module config
"""

import os
from datetime import timedelta

class Config:
    """Basiskonfiguration für die Anwendung"""
    
    # Datenbank-Konfiguration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'kochbuch')
    
    # JWT-Konfiguration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Upload-Konfiguration
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max-limit
    
    # CORS-Konfiguration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # E-Mail-Konfiguration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USER = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    MAIL_SENDER = os.getenv('MAIL_SENDER', 'noreply@intranet-kochbuch.de')
    
    # Sicherheitskonfiguration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    
class DevelopmentConfig(Config):
    """Entwicklungskonfiguration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Produktionskonfiguration"""
    DEBUG = False
    
class TestingConfig(Config):
    """Testkonfiguration"""
    TESTING = True
    DEBUG = True
    
# Konfigurationswörterbuch
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 