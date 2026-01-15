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
    apiKey: "DEIN_API_KEY_HIER",
    authDomain: "DEIN_PROJECT_ID.firebaseapp.com",
    projectId: "DEIN_PROJECT_ID",
    storageBucket: "DEIN_PROJECT_ID.appspot.com",
    messagingSenderId: "DEINE_SENDER_ID",
    appId: "DEINE_APP_ID"
};

// Nicht ändern - wird von anderen Dateien verwendet
window.FIREBASE_CONFIG = firebaseConfig;
