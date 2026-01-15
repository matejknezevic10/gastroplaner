# 🔥 Firebase Integration - Komplette Anleitung

## Phase 1: Firebase Projekt erstellen (5 Minuten)

### Schritt 1: Firebase Console
1. Gehe zu: https://console.firebase.google.com/
2. Klicke **"Projekt hinzufügen"** / **"Add project"**
3. **Projektname:** `gastro-planer-pro` (oder dein Name)
4. Klicke **"Weiter"**

### Schritt 2: Google Analytics (Optional)
- **Deaktivieren** für jetzt (kannst später aktivieren)
- Oder: Aktivieren und Standard-Account wählen
- Klicke **"Projekt erstellen"**
- Warte ~30 Sekunden

### Schritt 3: Projekt ist fertig!
- Klicke **"Weiter"**
- Du bist jetzt im Firebase Dashboard

---

## Phase 2: Firestore Database aktivieren (3 Minuten)

### Schritt 1: Firestore erstellen
1. Linke Sidebar → **"Build"** → **"Firestore Database"**
2. Klicke **"Datenbank erstellen"** / **"Create database"**

### Schritt 2: Sicherheitsmodus wählen
**WICHTIG:** Wähle **"Produktionsmodus"** / **"Production mode"**
- Testmodus ist NICHT sicher!
- Wir setzen gleich sichere Regeln

### Schritt 3: Region wählen
- Wähle: **"europe-west3 (Frankfurt)"** (am nächsten zu Österreich)
- Klicke **"Aktivieren"** / **"Enable"**
- Warte ~1 Minute

### Schritt 4: Sicherheitsregeln setzen
1. Gehe zu **"Regeln"** / **"Rules"** Tab
2. Ersetze den Inhalt mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restaurant-Dokumente
    match /restaurants/{restaurantId} {
      // Jeder kann lesen und schreiben
      // TODO: Später mit Authentication absichern!
      allow read, write: if true;
      
      // Alle Subcollections
      match /{collection}/{document=**} {
        allow read, write: if true;
      }
    }
  }
}
```

3. Klicke **"Veröffentlichen"** / **"Publish"**

**⚠️ WICHTIG:** Diese Regeln sind für Entwicklung! Für Produktion später mit Authentication absichern!

---

## Phase 3: Web-App registrieren (2 Minuten)

### Schritt 1: Web-App hinzufügen
1. Im Firebase Dashboard → **Projektübersicht** (oben links)
2. Klicke auf **"</>"** Symbol (Web)
3. **App-Spitzname:** `Gastro Planer Web`
4. **Firebase Hosting:** NICHT aktivieren (vorerst)
5. Klicke **"App registrieren"**

### Schritt 2: Firebase Config kopieren
Du siehst jetzt einen Code-Block:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "gastro-planer-pro.firebaseapp.com",
  projectId: "gastro-planer-pro",
  storageBucket: "gastro-planer-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**KOPIERE ALLE WERTE!** Du brauchst sie gleich!

---

## Phase 4: Config in die App einfügen

### Option A: Direkt in HTML (Schnell)

Öffne `index.html` und suche nach Zeile ~1415:

```javascript
// Aktuell (localStorage):
let mitarbeiter = [];
let schichten = [];
```

**ERSETZE** den ganzen Block bis ca. Zeile 1480 mit:

```javascript
// Firebase Config - ERSETZE MIT DEINEN WERTEN!
const firebaseConfig = {
    apiKey: "DEIN_API_KEY_HIER",
    authDomain: "DEIN_PROJECT_ID.firebaseapp.com",
    projectId: "DEIN_PROJECT_ID",
    storageBucket: "DEIN_PROJECT_ID.appspot.com",
    messagingSenderId: "DEINE_SENDER_ID",
    appId: "DEINE_APP_ID"
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Restaurant ID
const RESTAURANT_ID = 'restaurant_1';

// Helper-Funktionen
const getCollection = (collectionName) => {
    return db.collection('restaurants').doc(RESTAURANT_ID).collection(collectionName);
};

// Daten-Arrays (werden von Firebase gefüllt)
let mitarbeiter = [];
let schichten = [];
let notizen = [];
let lagerBestand = [];
let zeiterfassung = [];
let checklistItems = [];
let tagesCheckliste = {};
let kassenstände = [];
let tauschAnfragen = [];

let adminPin = '1234';
let loggedInMitarbeiter = null;
let currentLagerItemId = null;
let stempelStatus = null;
let currentNotizId = null;
let schichtGestartet = false;
let schichtChecklistStatus = {};
```

### Option B: Separate Config-Datei (Professionell)

Nutze die bereits vorhandene `js/firebase-config.js`:

1. Öffne `js/firebase-config.js`
2. Ersetze die Platzhalter mit deinen echten Werten
3. Füge in `index.html` im `<head>` hinzu:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="js/firebase-config.js"></script>
```

---

## Phase 5: localStorage durch Firebase ersetzen

Das ist der aufwändigste Teil. Ich erstelle dir eine fertige Version!

Aber das Prinzip:

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

---

## Phase 6: Testen

### Schritt 1: Erste Daten erstellen
1. Öffne die App (lokal oder Netlify)
2. Logge dich als Admin ein
3. Erstelle einen Test-Mitarbeiter

### Schritt 2: In Firebase Console prüfen
1. Gehe zu Firebase Console → Firestore Database
2. Du solltest sehen:
   ```
   restaurants/
     restaurant_1/
       mitarbeiter/
         1: {name: "...", position: "..."}
   ```

### Schritt 3: Multi-Device Test
1. Öffne die App auf deinem Handy
2. Erstelle eine Schicht auf dem PC
3. Schau ob sie sofort auf dem Handy erscheint! 🎉

---

## 🎯 Nächste Schritte

Ich erstelle dir jetzt:
1. **Fertige Firebase-Version** der index.html
2. **Migrations-Script** für bestehende localStorage-Daten
3. **Test-Anleitung**

Soll ich das machen?
