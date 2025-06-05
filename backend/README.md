## 🔒 HTTPS/SSL Konfiguration

### Entwicklung
```bash
# Für Entwicklung wird ein selbst-signiertes Zertifikat automatisch generiert
export FLASK_ENV=production  # Aktiviert HTTPS-Modus
python app.py
```

### Produktion
Für Produktionsumgebung:

1. **Zertifikate beschaffen** (z.B. Let's Encrypt):
   ```bash
   # Beispiel mit Certbot für Let's Encrypt
   sudo certbot certonly --standalone -d ihre-domain.com
   ```

2. **Zertifikatpfade in app.py anpassen**:
   ```python
   ssl_context=('/path/to/cert.pem', '/path/to/key.pem')
   ```

3. **Firewall-Regeln anpassen**:
   ```bash
   # Port 443 für HTTPS öffnen
   sudo ufw allow 443/tcp
   ```

### Reverse Proxy (Empfohlen)
Für Produktionsumgebungen wird ein Reverse Proxy (Nginx/Apache) mit SSL-Terminierung empfohlen:

```nginx
server {
    listen 443 ssl;
    server_name ihre-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
``` 