-- Tabelle für Passwort-Reset-Tokens
CREATE TABLE IF NOT EXISTS passwort_reset (
    id INT AUTO_INCREMENT PRIMARY KEY,
    benutzer_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    ablauf DATETIME NOT NULL,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (benutzer_id) REFERENCES benutzer(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    UNIQUE KEY unique_benutzer (benutzer_id)
); 