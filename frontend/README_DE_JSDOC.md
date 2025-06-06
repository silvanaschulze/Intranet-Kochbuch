# 📚 JSDoc Dokumentation - Intranet Kochbuch

Dieses Projekt verwendet **JSDoc** zur automatischen Generierung der Dokumentation für JavaScript/React Code.

## 🚀 Wie man die Dokumentation generiert

Führen Sie den Befehl aus, den der Professor erwähnt hat:

```bash
npm run docs
```

Oder den vollständigen Befehl:

```bash
jsdoc -c jsdoc.json
```

Die Dokumentation wird im Ordner `docs/` generiert und Sie können die Datei `docs/index.html` im Browser öffnen.

## 📝 Wie man React-Komponenten dokumentiert

### Grundlegendes Beispiel für eine Komponente:

```javascript
/**
 * @fileoverview Beschreibung der Datei
 * @component KomponentenName
 */

/**
 * Komponente zur Anzeige von Benutzerinformationen
 * 
 * @param {Object} props - Eigenschaften der Komponente
 * @param {string} props.name - Name des Benutzers
 * @param {string} props.email - E-Mail des Benutzers
 * @param {boolean} [props.aktiv=true] - Ob der Benutzer aktiv ist (optional)
 * @param {Function} props.onEdit - Callback zum Bearbeiten des Benutzers
 * @returns {JSX.Element} Gerenderte Komponente
 * 
 * @example
 * <UserCard 
 *   name="Ana Silva" 
 *   email="ana@beispiel.com"
 *   aktiv={true}
 *   onEdit={(id) => console.log('Bearbeiten:', id)}
 * />
 */
const UserCard = ({ name, email, aktiv = true, onEdit }) => {
  // Code der Komponente...
}
```

### Die meist verwendeten JSDoc-Tags:

- `@param {type} name - description` - Parameter der Funktion
- `@returns {type} description` - Was die Funktion zurückgibt
- `@example` - Verwendungsbeispiel
- `@component` - Markiert als React-Komponente
- `@fileoverview` - Beschreibung der Datei
- `@author` - Autor des Codes
- `@since` - Version seit der es existiert
- `@deprecated` - Markiert als veraltet

### Dokumentation von Hilfsfunktionen:

```javascript
/**
 * Formatiert ein Datum in das deutsche Format
 * @param {string|Date} datum - Zu formatierendes Datum
 * @param {boolean} [mitUhrzeit=false] - Ob die Uhrzeit eingeschlossen werden soll
 * @returns {string} Formatiertes Datum (TT.MM.JJJJ)
 * 
 * @example
 * formatiereDatum('2024-01-15') // "15.01.2024"
 * formatiereDatum(new Date(), true) // "15.01.2024 14:30"
 */
function formatiereDatum(datum, mitUhrzeit = false) {
  // Implementierung...
}
```

### Dokumentation von APIs/Services:

```javascript
/**
 * @fileoverview Services für die Kommunikation mit der Rezept-API
 */

/**
 * Holt alle Rezepte des Benutzers
 * @async
 * @param {number} benutzerId - ID des Benutzers
 * @param {Object} [filter] - Optionale Filter
 * @param {string} [filter.kategorie] - Nach Kategorie filtern
 * @param {string} [filter.suche] - Suchbegriff
 * @returns {Promise<Array<Object>>} Liste der Rezepte
 * @throws {Error} Fehler bei der API-Kommunikation
 */
async function holeRezepte(benutzerId, filter = {}) {
  // Implementierung...
}
```

## 🎯 Wichtige Tipps:

1. **Immer dokumentieren**:
   - Haupt-React-Komponenten
   - Hilfsfunktionen
   - API-Services
   - Benutzerdefinierte Hooks

2. **TypeScript-style Typen verwenden**:
   - `{string}` - Text
   - `{number}` - Zahl
   - `{boolean}` - Wahrheitswert
   - `{Array<string>}` - Array von Strings
   - `{Object}` - Objekt
   - `{Function}` - Funktion
   - `{JSX.Element}` - React-Komponente

3. **Optionale Parameter**: Verwenden Sie `[paramName]` oder `[paramName=defaultWert]`

4. **Immer Beispiele hinzufügen** mit `@example` zur Erleichterung der Verwendung

## 📁 Struktur der generierten Dokumentation:

```
docs/
├── index.html          # Hauptseite
├── global.html         # Globale Funktionen
├── components/         # Dokumentierte Komponenten
├── services/          # Dokumentierte Services
└── styles/            # CSS der Dokumentation
```

Öffnen Sie `docs/index.html` im Browser, um Ihre Dokumentation zu sehen!

## 💡 Praktisches Beispiel mit Ihrem Projekt:

Ihre `RecipeCard.jsx` Komponente ist bereits gut dokumentiert! Hier ein Beispiel:

```javascript
/**
 * RecipeCard Komponente
 * Zeigt eine Vorschau eines Rezepts in Kartenform an
 * 
 * @param {Object} props.recipe - Das anzuzeigende Rezept
 * @param {string|number} props.recipe.id - ID des Rezepts
 * @param {string} props.recipe.titel - Titel des Rezepts
 * @param {boolean} [props.isFavorite] - Ob das Rezept ein Favorit ist
 * @returns {JSX.Element} Gerenderte RecipeCard Komponente
 */
```

Führen Sie jetzt `npm run docs` aus und sehen Sie die Magie geschehen! 🎉 