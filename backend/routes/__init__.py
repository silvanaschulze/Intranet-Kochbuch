"""
@fileoverview Initialisierungsmodul für das Routes-Paket
@module routes

Dieses Modul macht die Route-Blueprints für die Anwendung verfügbar.
"""

from .benutzer_routes import benutzer_bp
from .rezept_routes import rezept_bp
from .kategorie_routes import kategorie_bp
from .favorit_routes import favorit_bp
from .kommentar_routes import kommentar_bp
from .bewertung_routes import bewertung_bp

__all__ = [
    'benutzer_bp',
    'rezept_bp',
    'kategorie_routes',
    'favorit_bp',
    'kommentar_bp'
     'bewertung_bp'
] 