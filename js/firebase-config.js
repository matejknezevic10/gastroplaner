// ==========================================
// FIREBASE KONFIGURATION - BEISPIEL
// ==========================================
// 
// ANLEITUNG:
// 1. Kopiere diese Datei und benenne sie um zu: firebase-config.js
// 2. Ersetze die Platzhalter mit deinen echten Firebase-Daten
// 3. Die Datei firebase-config.js wird NICHT auf GitHub hochgeladen!
//
// So findest du deine Firebase Config:
// 1. Gehe zu https://console.firebase.google.com
// 2. Wähle dein Projekt
// 3. Klicke auf das Zahnrad ⚙️ → Projekteinstellungen
// 4. Scrolle zu "Deine Apps" → Web-App
// 5. Kopiere die firebaseConfig Werte
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyB3v6Sl8Ju-NFlEEg8bBQcxmv9OjCOwOqY",
  authDomain: "gastroplaner-f2a35.firebaseapp.com",
  projectId: "gastroplaner-f2a35",
  storageBucket: "gastroplaner-f2a35.firebasestorage.app",
  messagingSenderId: "83078966224",
  appId: "1:83078966224:web:4044c1df28fff5684f67d5"
};

// Nicht ändern - wird von anderen Dateien verwendet
window.FIREBASE_CONFIG = firebaseConfig;
