"""
@fileoverview Sicherheitsutilitäten für das Intranet-Kochbuch
@module security

Dieses Modul stellt Funktionen für die Passwortsicherheit bereit:
- Passwort-Hashing mit bcrypt
- Passwort-Verifizierung
"""

import bcrypt

def passwort_hashen(passwort):
    """
    Generiert einen sicheren Hash für ein Passwort.
    
    @param {string} passwort - Das zu hashende Passwort im Klartext
    @return {string} Der generierte Passwort-Hash (inklusive Salt)
    
    @throws {UnicodeEncodeError} Bei ungültigen Zeichen im Passwort
    """
    # Gera um hash da senha, incluindo um salt aleatório
    return bcrypt.hashpw(passwort.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def passwort_verifizieren(passwort, hash_gespeichert):
    """
    Überprüft, ob ein Passwort zu einem gespeicherten Hash passt.
    
    @param {string} passwort - Das zu überprüfende Passwort im Klartext
    @param {string} hash_gespeichert - Der gespeicherte Hash zum Vergleich
    
    @return {boolean} True wenn das Passwort korrekt ist, sonst False
    
    @throws {ValueError} Bei ungültigem Hash-Format
    @throws {Exception} Bei unerwarteten Fehlern
    """
    """
    Verifica se a senha fornecida corresponde ao hash armazenado.
    passwort: A senha em texto puro fornecida pelo usuário no login.
    hash_gespeichert: O hash da senha armazenado no banco de dados.
    """
    try:
        # bcrypt.checkpw espera bytes, então precisamos codificar ambos.
        # Certifique-se de que hash_gespeichert também está decodificado do DB como string
        # e então re-codificado para bytes para a comparação.
        return bcrypt.checkpw(passwort.encode('utf-8'), hash_gespeichert.encode('utf-8'))
    except ValueError:
        # Lida com casos onde o hash armazenado pode estar mal formatado ou não é um hash bcrypt válido
        print(f"Erro ao verificar senha: Hash armazenado inválido ou formato incorreto.")
        return False
    except Exception as e:
        print(f"Erro inesperado na verificação de senha: {e}")
        return False