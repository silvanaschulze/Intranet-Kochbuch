"""
@fileoverview Token-Utilitäten für das Intranet-Kochbuch
@module token

Dieses Modul stellt Funktionen für die JWT-Token-Verwaltung bereit:
- Token-Generierung (Access und Refresh)
- Token-Verifizierung
- Token-Blacklisting
- Geschützte Routen mit Token-Authentifizierung
"""

import jwt
import datetime
from functools import wraps
from flask import request, jsonify
import os
from typing import Dict, Tuple, Optional

# Configurações
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'mein_geheimer_schluessel')
ACCESS_TOKEN_EXPIRE = datetime.timedelta(minutes=30)
REFRESH_TOKEN_EXPIRE = datetime.timedelta(days=7)

# Blacklist para tokens revogados (em produção, use Redis ou banco de dados)
token_blacklist = set()

def generate_tokens(benutzer_id: int, email: str) -> Tuple[str, str]:
    """
    Generiert Access und Refresh Tokens für einen authentifizierten Benutzer.
    
    @param {int} benutzer_id - ID des Benutzers
    @param {string} email - E-Mail-Adresse des Benutzers
    
    @return {Tuple[str, str]} Tupla contendo (access_token, refresh_token)
    """
    # Access Token
    access_payload = {
        'benutzer_id': benutzer_id,
        'email': email,
        'exp': datetime.datetime.utcnow() + ACCESS_TOKEN_EXPIRE,
        'type': 'access'
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm='HS256')
    
    # Refresh Token
    refresh_payload = {
        'benutzer_id': benutzer_id,
        'email': email,
        'exp': datetime.datetime.utcnow() + REFRESH_TOKEN_EXPIRE,
        'type': 'refresh'
    }
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm='HS256')
    
    return access_token, refresh_token

def token_verifizieren(token: str) -> Optional[Dict]:
    """
    Verifiziert und dekodiert einen JWT-Token.
    
    @param {string} token - Der zu verifizierende JWT-Token
    
    @return {Optional[Dict]} Die dekodierten Token-Daten oder None bei ungültigem Token
    @return {int} return.benutzer_id - ID des Benutzers
    @return {string} return.email - E-Mail-Adresse des Benutzers
    @return {datetime} return.exp - Ablaufzeitpunkt
    @return {string} return.type - Token-Typ ('access' oder 'refresh')
    
    @throws {jwt.ExpiredSignatureError} Bei abgelaufenem Token
    @throws {jwt.InvalidTokenError} Bei ungültigem Token
    """
    try:
        if token in token_blacklist:
            return None
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_blacklisten(token: str) -> None:
    """
    Fügt einen Token zur Blacklist hinzu.
    
    @param {string} token - Der zu sperrende Token
    """
    token_blacklist.add(token)

def token_erforderlich(f):
    """
    Dekorator für geschützte Routen, die einen gültigen JWT-Token erfordern.
    
    @decorator
    @param {function} f - Die zu schützende Route
    
    @return {function} Die geschützte Route
    
    @throws {403} Wenn kein Token vorhanden ist
    @throws {401} Bei ungültigem oder abgelaufenem Token
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            bearer = request.headers['Authorization']
            if bearer.startswith('Bearer '):
                token = bearer.replace('Bearer ', '', 1)

        if not token:
            return jsonify({'nachricht': 'Token erforderlich'}), 403

        daten = token_verifizieren(token)
        if daten is None:
            return jsonify({'nachricht': 'Ungültiger oder abgelaufener Token'}), 401
            
        # Verificar se é um token de acesso
        if daten.get('type') != 'access':
            return jsonify({'nachricht': 'Ungültiger Token-Typ'}), 401

        kwargs['token_daten'] = daten
        return f(*args, **kwargs)
    return decorated

# Alias para compatibilidade com código existente
token_generieren = generate_tokens
