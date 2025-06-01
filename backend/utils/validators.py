"""
@fileoverview Validierungsutilitäten für das Intranet-Kochbuch
@module validators

Dieses Modul stellt Funktionen für die Validierung von Benutzereingaben bereit:
- E-Mail-Validierung
- Passwort-Validierung
"""

import re

def email_validieren(email):
    """
    Überprüft, ob eine E-Mail-Adresse ein gültiges Format hat.
    
    @param {string} email - Die zu überprüfende E-Mail-Adresse
    
    @return {boolean} True wenn das Format gültig ist, sonst False
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def passwort_validieren(passwort):
    """
    Überprüft, ob ein Passwort die Sicherheitsanforderungen erfüllt.
    
    Anforderungen:
    - Mindestens 8 Zeichen
    - Mindestens ein Großbuchstabe
    - Mindestens eine Zahl
    - Mindestens ein Sonderzeichen
    
    @param {string} passwort - Das zu überprüfende Passwort
    
    @return {boolean} True wenn alle Anforderungen erfüllt sind, sonst False
    """
    if len(passwort) < 8:
        return False
    
    # Verificar letra maiúscula
    if not re.search(r'[A-Z]', passwort):
        return False
    
    # Verificar número
    if not re.search(r'[0-9]', passwort):
        return False
    
    # Verificar caractere especial
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', passwort):
        return False
    
    return True
