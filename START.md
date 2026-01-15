# 🚀 Gastro Planer Pro - Quick Start

## Ohne Installation (Empfohlen für Anfang)

### Option 1: Direkt im Browser öffnen
```bash
# Einfach Doppelklick auf index.html
# Oder:
open index.html  # MacOS
start index.html # Windows
xdg-open index.html # Linux
```

## Mit npm (Professionell)

### Erstmaliges Setup
```bash
# Node.js installieren von: https://nodejs.org/
# Dann im Projekt-Ordner:
npm install
```

### Entwicklung starten
```bash
npm run dev
# Öffnet automatisch http://localhost:8080
# Kein Code-Injection wie bei Live Server!
```

### Produktions-Server
```bash
npm start
# Startet einfachen HTTP-Server auf Port 8080
```

### Alternative: Serve (Minimal)
```bash
npm run serve
# Nutzt 'serve' Package (sehr leichtgewichtig)
```

## Andere Methoden (ohne npm)

### Python (falls installiert)
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Dann öffne: http://localhost:8080
```

### PHP (falls installiert)
```bash
php -S localhost:8080
```

### Node.js direkt (ohne package.json)
```bash
npx http-server -p 8080 -o
```

## 🎯 Empfohlene Methode

**Für Entwicklung:**
```bash
npm run dev
```

**Für schnellen Test:**
```bash
# Einfach Doppelklick auf index.html
```

**Keine Probleme mehr mit:**
- ✅ Kein Code-Injection
- ✅ Kein Caching
- ✅ Saubere URLs
- ✅ Funktioniert überall gleich

## 🔥 Firebase Deploy (später)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 💡 Tipps

- **Port ändern:** Ändere `8080` zu `3000` oder beliebig in package.json
- **Auto-Reload:** Browser-Extension "LiveReload" nutzen (optional)
- **Production:** Für echtes Deployment → Firebase Hosting oder Netlify

## ⚙️ VS Code Integration

Erstelle `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "npm",
      "script": "dev",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Dann: `Ctrl+Shift+B` → "Start Dev Server"
