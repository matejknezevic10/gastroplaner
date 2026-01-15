# 🛠️ Development Guide

## Projekt-Setup in VS Code

### 1. Visual Studio Code installieren
Download: https://code.visualstudio.com/

### 2. Empfohlene Extensions installieren
VS Code öffnen → Extensions (Ctrl+Shift+X) → Folgende installieren:
- **Live Server** (ritwickdey.LiveServer) - Für lokale Entwicklung
- **Prettier** (esbenp.prettier-vscode) - Code Formatting
- **ESLint** (dbaeumer.vscode-eslint) - JavaScript Linting

### 3. Projekt öffnen
```bash
code /pfad/zu/gastro-planer-pro
```

## 🔥 Firebase Integration

### Schritt-für-Schritt Migration von localStorage zu Firebase

#### 1. Firebase Config einfügen
Öffne `js/firebase-config.js` und füge deine Firebase-Credentials ein.

#### 2. localStorage Calls ersetzen

**Vorher (localStorage):**
```javascript
localStorage.setItem('gastro-mitarbeiter', JSON.stringify(mitarbeiter));
mitarbeiter = JSON.parse(localStorage.getItem('gastro-mitarbeiter') || '[]');
```

**Nachher (Firebase):**
```javascript
// Schreiben
await getCollection('mitarbeiter').doc(String(mitarbeiter.id)).set(mitarbeiter);

// Lesen
const snapshot = await getCollection('mitarbeiter').get();
mitarbeiter = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
```

#### 3. Echtzeit-Listener hinzufügen

```javascript
// Echtzeit-Updates für Mitarbeiter
getCollection('mitarbeiter').onSnapshot(snapshot => {
    mitarbeiter = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    updateMitarbeiterListe(); // UI aktualisieren
});
```

### Collections Mapping

| localStorage Key | Firebase Collection |
|-----------------|---------------------|
| `gastro-mitarbeiter` | `mitarbeiter` |
| `gastro-schichten` | `schichten` |
| `gastro-notizen` | `notizen` |
| `gastro-lager` | `lagerBestand` |
| `gastro-zeiterfassung` | `zeiterfassung` |
| `gastro-checklist` | `checklistItems` |
| `gastro-tages-checklist` | `tagesCheckliste` |
| `gastro-kassenstände` | `kassenstände` |
| `gastro-tausch-anfragen` | `tauschAnfragen` |

## 📝 Code-Konventionen

### Naming Conventions
```javascript
// Variablen: camelCase
let mitarbeiterListe = [];
let currentUserId = null;

// Konstanten: UPPER_SNAKE_CASE
const RESTAURANT_ID = 'restaurant_1';
const MAX_ITEMS = 100;

// Funktionen: camelCase mit Verb
function updateMitarbeiterListe() { }
function deleteMitarbeiter(id) { }

// Collections: camelCase (Plural)
getCollection('mitarbeiter')
getCollection('schichten')
```

### Kommentare
```javascript
// Deutsch für fachliche Kommentare
// Zeige nur aktive Mitarbeiter an

// Englisch für technische Kommentare
// TODO: Implement pagination
// FIXME: Memory leak in listener
```

### Async/Await Pattern
```javascript
// ✅ Gut
async function loadData() {
    try {
        const snapshot = await getCollection('mitarbeiter').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        return [];
    }
}

// ❌ Schlecht
function loadData() {
    getCollection('mitarbeiter').get().then(snapshot => {
        return snapshot.docs.map(doc => doc.data());
    });
}
```

## 🧪 Testing

### 1. Lokales Testing mit Live Server
```
Rechtsklick auf index.html → Open with Live Server
```

### 2. Browser DevTools nutzen
```javascript
// F12 öffnen → Console

// Firebase-Status prüfen
firebase.app()

// Aktuelle Daten ansehen
console.log('Mitarbeiter:', mitarbeiter);

// Collection manuell lesen
getCollection('mitarbeiter').get().then(s => console.log(s.docs.map(d => d.data())));
```

### 3. Firestore Emulator (Optional)
```bash
# Firebase CLI installieren
npm install -g firebase-tools

# Im Projekt-Ordner
firebase init emulators
firebase emulators:start
```

## 🐛 Debugging

### Häufige Fehler

#### 1. "Permission denied" in Firebase
**Ursache:** Firestore Rules zu strikt
**Lösung:** Prüfe Rules in Firebase Console

```javascript
// Für Development (NICHT für Produktion!)
allow read, write: if true;
```

#### 2. "Cannot read property of undefined"
**Ursache:** Daten noch nicht geladen
**Lösung:** Warte auf Promise oder nutze Optional Chaining

```javascript
// ✅ Gut
const name = mitarbeiter?.find(m => m.id === id)?.name || 'Unbekannt';

// ❌ Schlecht
const name = mitarbeiter.find(m => m.id === id).name;
```

#### 3. Listener läuft mehrmals
**Ursache:** Listener wird nicht abgemeldet
**Lösung:** Unsubscribe speichern und aufrufen

```javascript
let unsubscribe = getCollection('mitarbeiter').onSnapshot(snapshot => {
    // Update UI
});

// Beim Logout
function cleanup() {
    unsubscribe();
}
```

## 📊 Performance-Tipps

### 1. Batch Writes verwenden
```javascript
// ✅ Gut - Batch Write (eine Operation)
const batch = db.batch();
mitarbeiter.forEach(m => {
    batch.set(getCollection('mitarbeiter').doc(String(m.id)), m);
});
await batch.commit();

// ❌ Schlecht - Einzelne Writes (viele Operationen)
for (let m of mitarbeiter) {
    await getCollection('mitarbeiter').doc(String(m.id)).set(m);
}
```

### 2. Queries einschränken
```javascript
// ✅ Gut - Nur aktuelle Woche
const heute = new Date().toISOString().split('T')[0];
getCollection('schichten')
    .where('datum', '>=', heute)
    .limit(14)

// ❌ Schlecht - Alle Schichten aller Zeiten
getCollection('schichten').get()
```

### 3. Offline Persistence aktivieren
```javascript
firebase.firestore().enablePersistence()
    .then(() => console.log('✅ Offline Mode aktiv'))
    .catch(err => console.error('❌ Offline Mode Fehler:', err));
```

## 🔒 Sicherheit für Produktion

### 1. Environment Variables
```javascript
// .env Datei erstellen (nicht in Git!)
FIREBASE_API_KEY=dein_api_key
FIREBASE_AUTH_DOMAIN=dein_auth_domain

// In Code nutzen
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ...
};
```

### 2. Firestore Security Rules (Produktion)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Nur authentifizierte User
    match /restaurants/{restaurantId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.restaurantId == restaurantId;
      
      match /{collection}/{document=**} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
  }
}
```

### 3. Admin-Rechte implementieren
```javascript
// Custom Claims in Firebase Auth
// Backend (Cloud Function):
admin.auth().setCustomUserClaims(uid, {
    admin: true,
    restaurantId: 'restaurant_1'
});

// Frontend:
const idTokenResult = await firebase.auth().currentUser.getIdTokenResult();
if (idTokenResult.claims.admin) {
    // Admin UI zeigen
}
```

## 📦 Deployment

### Option 1: Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

### Option 2: Netlify
1. Drag & Drop Projekt-Ordner auf netlify.com
2. Fertig!

### Option 3: Eigener Server
```bash
# Dateien auf Server kopieren
scp -r gastro-planer-pro/ user@server:/var/www/
```

## 🔄 Git Workflow

```bash
# Initiales Setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/dein-username/gastro-planer-pro.git
git push -u origin main

# Täglicher Workflow
git add .
git commit -m "Feature: Schicht-Tausch verbessert"
git push
```

## 📱 Progressive Web App (PWA) - Optional

### 1. manifest.json erstellen
```json
{
  "name": "Gastro Planer Pro",
  "short_name": "Gastro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b6f47",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker registrieren
```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registered'));
}
```

## 💡 Nächste Features (Ideen)

- [ ] Firebase Authentication für echte User
- [ ] Push-Benachrichtigungen für Tausch-Anfragen
- [ ] PDF-Export für Dienstpläne
- [ ] Dark Mode
- [ ] Multi-Language Support
- [ ] Urlaubs-Verwaltung
- [ ] Schichtvorlagen (Templates)
- [ ] Statistik-Dashboard mit Charts
- [ ] Mobile Apps (React Native / Flutter)

## 🆘 Hilfe & Ressourcen

- **Firebase Docs:** https://firebase.google.com/docs/firestore
- **VS Code Docs:** https://code.visualstudio.com/docs
- **MDN Web Docs:** https://developer.mozilla.org/
- **Stack Overflow:** https://stackoverflow.com/

## 📞 Support

Bei Fragen:
1. Prüfe Browser Console (F12)
2. Prüfe Firebase Console für DB-Fehler
3. Suche in Stack Overflow
4. Frage in Firebase Discord
