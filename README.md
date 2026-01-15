# 🍽️ GastroPlaner Pro - Multi-Tenancy Restaurant Management

Professionelle Restaurant-Management-Lösung mit Firebase Multi-Tenancy, komplett isolierten Mandanten und Echtzeit-Synchronisation.

## 🚀 Schnellstart

### 1. Firebase Config einrichten
```bash
# Kopiere die Beispiel-Config
cp js/firebase-config.example.js js/firebase-config.js
```

Öffne `js/firebase-config.js` und trage deine Firebase-Daten ein (aus Firebase Console → Projekteinstellungen → Web-App).

### 2. Firestore Rules setzen
Siehe `FIRESTORE-RULES-FIX.html` oder deploye mit:
```bash
firebase deploy --only firestore:rules
```

### 3. App starten
- **Restaurant registrieren:** Öffne `tenant-zugang.html`
- **App nutzen:** Öffne `index.html`

📖 **Ausführliche Anleitung:** `START-HIER.md`

## 🔐 Sicherheit

**WICHTIG:** Die Datei `js/firebase-config.js` enthält sensible Daten und wird **nicht** auf GitHub hochgeladen (siehe `.gitignore`). 

Jeder der das Projekt klont muss seine eigene `firebase-config.js` erstellen!

## 📁 Wichtige Dateien

### Haupt-App
- **`index.html`** - Hauptanwendung (Restaurant-Management)
- **`tenant-zugang.html`** - Login & Registrierung

### JavaScript
- **`js/firebase-config.example.js`** - Firebase Config Vorlage (KOPIEREN!)
- **`js/firebase-config.js`** - Deine echte Config (NICHT committen!)
- **`js/firebase-multi-tenancy.js`** - Multi-Tenancy Manager
- **`js/tenant-storage.js`** - Storage Interface für Tenant-Isolation
- **`js/localstorage-patch.js`** - Automatische Tenant-Isolation
- **`js/firebase-integration.js`** - Auto-Sync & Firebase-Integration
- **`js/sync-indicator.js`** - Visueller Sync-Status

### Konfiguration
- **`firestore.rules`** - Firebase Security Rules

### Debug & Hilfe
- **`firebase-diagnose.html`** - Diagnose-Tool für Firebase-Setup
- **`sync-debug.html`** - Debug-Tool für Synchronisation

### Dokumentation
- **`START-HIER.md`** - Hauptdokumentation 📖
- **`FIREBASE-CONFIG-FINDEN.html`** - Wo finde ich meine Firebase-Config?
- **`FIRESTORE-RULES-FIX.html`** - Firestore Rules Setup
- **`FIREBASE-ID-SYSTEM.md`** - Wie die eindeutige ID-Zuordnung funktioniert
- **`MULTI-TENANCY-DOKUMENTATION.md`** - Technische Multi-Tenancy Doku
- **`DATENWIEDERHERSTELLUNG.md`** - Daten-Recovery Guide

## ✨ Features

### Multi-Tenancy
- ✅ Komplette Daten-Isolation zwischen Restaurants
- ✅ Eindeutige Tenant-IDs (GASTRO-XXXXX)
- ✅ Tenant-ID + PIN Authentifizierung
- ✅ Kein Restaurant kann andere Restaurants sehen

### Synchronisation
- ✅ Automatische bidirektionale Firebase-Sync
- ✅ Auto-Sync alle 30 Sekunden
- ✅ Change-Detection mit sofortigem Upload (2 Sek)
- ✅ Visueller Sync-Indikator
- ✅ Firebase-ID basierte Zuordnung (keine Duplikate!)

### Restaurant-Management
- ✅ Mitarbeiterverwaltung mit PIN
- ✅ Schichtplanung (2-Wochen-Ansicht)
- ✅ Schicht-Tausch zwischen Mitarbeitern
- ✅ Lagerverwaltung & Einkaufsliste
- ✅ Zeiterfassung
- ✅ Notizen & Aufgaben
- ✅ Kassenstände
- ✅ Statistiken & Reporting

## 🔧 Technologie

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Firebase Firestore
- **Storage:** LocalStorage + Firebase Sync
- **Architecture:** Multi-Tenancy mit kompletter Isolation

## 📊 Kosten

- **Firebase Free Tier:** ~100 Restaurants kostenlos
- **Skalierung:** Bei Bedarf auf Paid Plan

## 🎯 Workflow

```
1. Restaurant registrieren (tenant-zugang.html)
   → Tenant-ID erhalten (z.B. GASTRO-A2B3C)
   → PIN vergeben

2. Mit Tenant-ID + PIN einloggen
   → localStorage wird automatisch tenant-spezifisch
   → Daten von Firebase geladen

3. App nutzen (index.html)
   → Änderungen sofort in localStorage
   → Nach 2 Sek automatisch zu Firebase
   → Alle 30 Sek bidirektionale Sync

4. Auf anderem Gerät einloggen
   → Gleiche Tenant-ID + PIN
   → Daten automatisch synchronisiert ✅
```

## 🔒 Sicherheit

- ✅ Tenant-spezifischer localStorage (tenant_ID_key)
- ✅ Firebase Security Rules enforced
- ✅ Tenant-ID ist geheim (nur Owner kennt sie)
- ✅ PIN-geschützte Tenant-Accounts
- ✅ Keine Cross-Tenant Queries möglich
- ✅ Firebase-ID System verhindert Duplikate

## 🐛 Troubleshooting

- **Sync funktioniert nicht:** Öffne `sync-debug.html`
- **Firebase-Fehler:** Öffne `firebase-diagnose.html`
- **Firestore Permissions:** Siehe `FIRESTORE-RULES-FIX.html`
- **Falscher Mitarbeiter gelöscht:** Siehe `FIREBASE-ID-SYSTEM.md`
- **Config nicht gefunden:** Siehe `FIREBASE-CONFIG-FINDEN.html`

## 📝 Changelog

### Version 2.0 (Januar 2026) ✅
- ✅ Multi-Tenancy mit kompletter Isolation
- ✅ Firebase-ID System für eindeutige Zuordnung
- ✅ Automatische bidirektionale Synchronisation
- ✅ LocalStorage-Patch für transparente Tenant-Isolation
- ✅ Delete-Detection mit korrekter Zuordnung
- ✅ Aufgeräumte Code-Basis
- ✅ Sync-Indikator für visuelles Feedback
- ✅ Debug-Tools für einfaches Troubleshooting

### Version 1.0
- Basis-App mit localStorage
- Single-Restaurant Management

## 👨‍💻 Entwicklung

```bash
# Lokaler Server
python -m http.server 8000

# Oder VS Code Live Server Extension
# Rechtsklick auf index.html → "Open with Live Server"
```

## 📄 Lizenz

Private Nutzung

---

**Status:** ✅ Produktionsbereit  
**Version:** 2.0  
**Datum:** Januar 2026  
**Entwickelt mit:** Claude (Anthropic)
