"""
@fileoverview E-Mail-Versand-Utilities für das Intranet-Kochbuch
@module email_utils
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app, url_for

def email_senden(empfaenger, betreff, inhalt_html):
    """
    Sendet eine E-Mail mit HTML-Inhalt.
    
    @param {string} empfaenger - E-Mail-Adresse des Empfängers
    @param {string} betreff - Betreff der E-Mail
    @param {string} inhalt_html - HTML-Inhalt der E-Mail
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    try:
        # E-Mail-Konfiguration aus der App-Konfiguration lesen
        smtp_server = current_app.config.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = current_app.config.get('SMTP_PORT', 587)
        smtp_user = current_app.config.get('SMTP_USER')
        smtp_password = current_app.config.get('SMTP_PASSWORD')
        absender = current_app.config.get('MAIL_SENDER', 'noreply@intranet-kochbuch.de')

        # E-Mail erstellen
        msg = MIMEMultipart('alternative')
        msg['Subject'] = betreff
        msg['From'] = f"Intranet-Kochbuch <{absender}>"
        msg['To'] = empfaenger

        # HTML-Inhalt hinzufügen
        html_part = MIMEText(inhalt_html, 'html')
        msg.attach(html_part)

        # Verbindung zum SMTP-Server herstellen und E-Mail senden
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.send_message(msg)

        return True
    except Exception as fehler:
        print(f"Fehler beim Senden der E-Mail: {fehler}")
        return False

def registrierungs_email_senden(empfaenger, name):
    """
    Sendet eine Registrierungsbestätigungs-E-Mail.
    
    @param {string} empfaenger - E-Mail-Adresse des neuen Benutzers
    @param {string} name - Name des Benutzers
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    betreff = "Willkommen beim Intranet-Kochbuch!"
    inhalt_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Willkommen beim Intranet-Kochbuch, {name}!</h2>
            <p>Vielen Dank für Ihre Registrierung. Ihr Konto wurde erfolgreich erstellt.</p>
            <p>Sie können sich jetzt mit Ihrer E-Mail-Adresse anmelden und Ihre Lieblingsrezepte teilen!</p>
            <p>Falls Sie Ihr Passwort vergessen, können Sie es jederzeit über die "Passwort vergessen" Funktion zurücksetzen.</p>
            <p style="margin-top: 30px;">Viel Spaß beim Kochen!</p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht darauf.<br>
                Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.
            </p>
        </div>
    </body>
    </html>
    """
    
    return email_senden(empfaenger, betreff, inhalt_html)

def passwort_reset_email_senden(empfaenger, name, reset_token):
    """
    Sendet eine E-Mail mit Link zum Zurücksetzen des Passworts.
    
    @param {string} empfaenger - E-Mail-Adresse des Benutzers
    @param {string} name - Name des Benutzers
    @param {string} reset_token - Token für das Zurücksetzen des Passworts
    @return {boolean} True bei Erfolg, False bei Fehler
    """
    betreff = "Passwort zurücksetzen - Intranet-Kochbuch"
    
    # Frontend-URL für das Zurücksetzen des Passworts
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/passwort-zuruecksetzen/{reset_token}"
    
    inhalt_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Passwort zurücksetzen</h2>
            <p>Hallo {name},</p>
            <p>Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den folgenden Link, um ein neues Passwort zu erstellen:</p>
            <p style="margin: 30px 0;">
                <a href="{reset_url}" 
                   style="background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
                    Passwort zurücksetzen
                </a>
            </p>
            <p>Dieser Link ist aus Sicherheitsgründen nur eine Stunde gültig.</p>
            <p>Falls Sie kein neues Passwort angefordert haben, können Sie diese E-Mail ignorieren.</p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht darauf.
            </p>
        </div>
    </body>
    </html>
    """
    
    return email_senden(empfaenger, betreff, inhalt_html) 