# 🔥 Firebase Setup Anleitung für Gastro Planer Pro

## Schritt 1: Firebase Projekt erstellen

1. Gehe zu: https://console.firebase.google.com/
2. Klicke auf "Projekt hinzufügen"
3. Projektname: `gastro-planer-pro` (oder dein Name)
4. Google Analytics: Optional (kannst du deaktivieren)
5. Klicke auf "Projekt erstellen"

## Schritt 2: Firestore Database aktivieren

1. Im Firebase-Dashboard: **Build** → **Firestore Database**
2. Klicke auf "Datenbank erstellen"
3. Wähle **Produktionsmodus** starten
4. Wähle eine Region (z.B. **europe-west3** für Frankfurt)
5. Klicke auf "Aktivieren"

## Schritt 3: Sicherheitsregeln setzen

Gehe zu **Firestore Database** → **Regeln** und ersetze den Inhalt mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restaurant-Dokumente
    match /restaurants/{restaurantId} {
      allow read, write: if true; // Für Entwicklung - später anpassen!
      
      // Alle Subcollections
      match /{collection}/{document=**} {
        allow read, write: if true; // Für Entwicklung - später anpassen!
      }
    }
  }
}
```

**WICHTIG:** Diese Regeln sind für Entwicklung! Für Produktion musst du Authentifizierung hinzufügen.

## Schritt 4: Web-App registrieren

1. Im Firebase-Dashboard: ⚙️ **Projekteinstellungen**
2. Scrolle runter zu "Deine Apps"
3. Klicke auf das **</> Web-Symbol**
4. App-Spitzname: `Gastro Planer Web`
5. Firebase Hosting: **Nicht** aktivieren (vorerst)
6. Klicke auf "App registrieren"

## Schritt 5: Konfiguration kopieren

Du siehst jetzt einen Code-Block wie diesen:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "gastro-planer-pro.firebaseapp.com",
  projectId: "gastro-planer-pro",
  storageBucket: "gastro-planer-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**KOPIERE DIESE WERTE!** Du brauchst sie gleich.

## Schritt 6: Config in die HTML einfügen

Öffne die `gastro-planer-pro-firebase.html` Datei und suche nach:

```javascript
const firebaseConfig = {
    apiKey: "DEIN_API_KEY",
    authDomain: "DEIN_PROJECT_ID.firebaseapp.com",
    // ...
};
```

Ersetze die Platzhalter mit deinen echten Werten von Schritt 5!

## Schritt 7: Testen

1. Öffne die HTML-Datei im Browser
2. Öffne die **Browser-Konsole** (F12)
3. Du solltest sehen: "✅ Alle Daten von Firebase geladen"
4. Logge dich als Admin ein (PIN: 1234)
5. Erstelle einen Test-Mitarbeiter

## Schritt 8: Daten in Firebase prüfen

1. Gehe zurück zu Firebase Console
2. **Firestore Database** → **Daten**
3. Du solltest jetzt sehen:
   - `restaurants` → `restaurant_1` → `mitarbeiter`

## 🎉 Fertig!

Jetzt hast du:
- ✅ Sichere Cloud-Datenbank
- ✅ Echtzeit-Synchronisation
- ✅ Automatische Backups
- ✅ Multi-Device Support

## 📱 Nächste Schritte (Optional):

### Multi-Restaurant Support
Um mehrere Restaurants zu unterstützen, ändere in der HTML:
```javascript
const RESTAURANT_ID = 'restaurant_1'; // → 'restaurant_2', etc.
```

### Bessere Sicherheit (Produktion)
1. Aktiviere **Firebase Authentication**
2. Ändere Firestore-Regeln um Auth zu erzwingen
3. Implementiere richtiges User-Management

### Firebase Hosting
1. Installiere Firebase CLI: `npm install -g firebase-tools`
2. `firebase login`
3. `firebase init hosting`
4. `firebase deploy`

## 🆘 Probleme?

**Fehler: "Permission denied"**
→ Prüfe Firestore-Regeln (Schritt 3)

**Fehler: "Failed to load"**
→ Prüfe firebaseConfig (Schritt 6)

**Daten werden nicht geladen**
→ Öffne Browser-Konsole (F12) und schau nach Fehlern

## 💰 Kosten

Firebase ist **KOSTENLOS** bis zu:
- 50.000 Lesevorgänge/Tag
- 20.000 Schreibvorgänge/Tag
- 1 GB Speicher

Für ein Restaurant mit 10 Mitarbeitern solltest du NIE das Limit erreichen!
