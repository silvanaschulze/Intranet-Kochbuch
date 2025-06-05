# Frontend-Dokumentation - Intranet-Kochbuch

## Projektübersicht

Das Frontend des Intranet-Kochbuchs ist eine moderne React-Webanwendung, die eine intuitive und responsive Benutzeroberfläche für die Rezeptverwaltung bietet. Die Anwendung nutzt aktuelle Webtechnologien und folgt bewährten UI/UX-Praktiken.

## Technische Architektur

### Verwendete Technologien
- **Framework:** React 18.2.0
- **Routing:** React Router DOM 6.8.0
- **UI-Framework:** Bootstrap 5.2.3 mit React-Bootstrap
- **HTTP-Client:** Axios 1.3.2
- **State Management:** React Context API
- **Styling:** CSS3 mit Custom Properties
- **Build-Tool:** Create React App
- **Testing:** Jest und React Testing Library

### Projektstruktur
```
frontend/
├── public/                   # Statische Dateien
│   ├── index.html           # HTML-Vorlage
│   ├── manifest.json        # PWA-Konfiguration
│   └── logo-kochbuch.svg    # Anwendungslogo
├── src/                     # Quellcode
│   ├── components/          # React-Komponenten
│   │   ├── Auth/           # Authentifizierung
│   │   ├── Layout/         # Layout-Komponenten
│   │   ├── Recipe/         # Rezept-Komponenten
│   │   └── UI/            # UI-Hilfselemente
│   ├── pages/              # Seiten-Komponenten
│   ├── services/           # API-Services
│   ├── context/           # React Context
│   ├── styles/            # CSS-Dateien
│   └── __tests__/         # Test-Dateien
└── package.json            # Abhängigkeiten
```

## Implementierte Komponenten

### 1. Authentifizierung (`components/Auth/`)
**Komponenten:** `Login.jsx`, `Register.jsx`, `Profile.jsx`, `PrivateRoute.jsx`

**Funktionalitäten:**
- JWT-basierte Benutzeranmeldung
- Registrierungsformular mit Validierung
- Profilbearbeitung mit Bildupload
- Geschützte Routen für authentifizierte Benutzer
- Automatische Token-Erneuerung

### 2. Layout (`components/Layout/`)
**Komponenten:** `Header.jsx`, `Footer.jsx`, `Layout.jsx`

**Funktionalitäten:**
- Responsive Navigation mit Bootstrap Navbar
- Benutzerabhängige Menüanzeige
- Breadcrumb-Navigation
- Footer mit Projektinformationen
- Mobile-optimierte Darstellung

### 3. Rezeptverwaltung (`components/Recipe/`)
**Komponenten:** `RecipeCard.jsx`, `RecipeForm.jsx`, `RecipeList.jsx`, `ImageUpload.jsx`

**Funktionalitäten:**
- Card-basierte Rezeptdarstellung
- Formulare für Rezepterstellung und -bearbeitung
- Bildupload mit Vorschau
- Suchfunktionalität mit Filtern
- Favoritenverwaltung

### 4. Seiten (`pages/`)
**Komponenten:** `Home.jsx`, `About.jsx`, `RecipeListPage.jsx`, `CreateRecipe.jsx`, `FavoriteRecipes.jsx`

**Funktionalitäten:**
- Responsive Startseite mit Hero-Section
- Über-uns-Seite mit Teaminformationen
- Rezeptübersicht mit Paginierung
- Formulare für CRUD-Operationen
- Benutzerspezifische Favoritenliste

## State Management

### Context-Provider
**Dateien:** `context/AuthContext.jsx`, `context/LoadingContext.jsx`

**AuthContext:**
- Globales Benutzermanagement
- JWT-Token-Speicherung
- Anmeldestatus-Verwaltung
- Automatische Abmeldung bei Token-Ablauf

**LoadingContext:**
- Zentrale Loading-States
- Spinner-Verwaltung
- Async-Operation-Tracking

## API-Integration

### Service-Layer (`services/`)
**Dateien:** `api.js`, `authService.js`, `recipeService.js`, `favoriteService.js`

**api.js:**
- Zentrale Axios-Konfiguration
- Request/Response-Interceptors
- Automatische Token-Anhängung
- Fehlerbehandlung

**Funktionalitäten:**
- RESTful API-Kommunikation
- Automatische Token-Erneuerung
- Offline-Erkennung
- Request-Caching

## Design System

### CSS-Framework (`styles/theme.css`)
**Features:**
- CSS Custom Properties für Theming
- Mobile-First Responsive Design
- Flexbox und Grid-Layouts
- Smooth Animations und Transitions
- Accessibility-optimierte Farbkontraste

**Komponenten:**
- Typografie-System mit clamp()-Funktionen
- Konsistente Spacing-Skala
- Shadow-System für Tiefe
- Button-Varianten mit Hover-Effekten
- Card-System mit Animationen

### Responsive Breakpoints
```css
Mobile:    max-width: 639px
Tablet:    640px - 1023px
Desktop:   min-width: 1024px
Large:     min-width: 1440px
```

## Benutzerinteraktionen

### Formularverwaltung
- Controlled Components mit useState
- Client-side Validierung
- Inline-Fehlermeldungen
- Optimistic Updates

### Navigation
- React Router mit geschützten Routen
- Programmatische Navigation
- URL-Parameter für Zustandsmanagement
- Browser-History-Integration

### Feedback-System
- Toast-Benachrichtigungen
- Loading-Spinner
- Erfolgs-/Fehlermeldungen
- Progress-Indikatoren

## Performance-Optimierungen

### Code-Splitting
- Lazy Loading für Seitenkomponenten
- React.Suspense für Fallback-UI
- Bundle-Optimierung

### Bilder-Optimierung
- Responsive Images
- Lazy Loading
- WebP-Format-Unterstützung
- Placeholder während Ladezeit

### Caching-Strategien
- Service Worker für PWA
- Browser-Cache-Optimierung
- API-Response-Caching

## Testing

### Unit-Tests (`__tests__/`)
**Dateien:** `RecipeCard.test.js`, `Login.test.js`

**Test-Coverage:**
- Komponenten-Rendering
- Benutzerinteraktionen
- API-Integration
- Routing-Verhalten

**Test-Tools:**
- Jest für Unit-Tests
- React Testing Library für DOM-Tests
- MSW für API-Mocking

## Accessibility (WCAG 2.1)

### Implementierte Features
- Semantische HTML-Struktur
- ARIA-Labels und -Beschreibungen
- Keyboard-Navigation
- Screen Reader-Unterstützung
- Farbkontrast-Compliance
- Focus-Management

### Browser-Kompatibilität
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

## Deployment

### Build-Prozess
```bash
npm run build
```
Erstellt optimierte Produktions-Builds mit:
- Minifizierung
- Tree Shaking
- Asset-Optimierung
- Service Worker-Generierung

### Umgebungsvariablen
```bash
REACT_APP_API_URL=http://192.168.64.3:5000
REACT_APP_NAME=Intranet-Kochbuch
```

### Progressive Web App (PWA)
- Service Worker für Offline-Funktionalität
- App-Manifest für Installation
- Push-Benachrichtigungen (optional)
- Cache-First-Strategie

## Entwicklungsstandards

### Code-Konventionen
- ES6+ JavaScript
- Funktionale Komponenten mit Hooks
- PropTypes für Type-Checking
- Deutsche Kommentare und JSDoc

### Ordnerstruktur-Konventionen
- Komponenten in PascalCase
- Services in camelCase
- CSS-Klassen in kebab-case
- BEM-Methodologie für CSS

## Zukünftige Erweiterungen

### Geplante Features
- Dark Mode Toggle
- Internationalisierung (i18n)
- Real-time Benachrichtigungen
- Erweiterte Suchfilter
- Social Sharing-Features

### Performance-Verbesserungen
- Virtual Scrolling für große Listen
- Image CDN-Integration
- GraphQL-Migration
- Server-Side Rendering (Next.js)

---

**Entwickelt von:** Silvana Schulze  
**Datum:** Juni 2025  
**Version:** 1.0  
**Framework-Version:** React 18.2.0


