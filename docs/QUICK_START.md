# ⚡ Quick Start Guide

## 🎯 Ziel
In 10 Minuten die App lokal zum Laufen bringen!

## 📋 Checkliste

### ☑️ Schritt 1: VS Code installieren (2 Min)
1. Download: https://code.visualstudio.com/
2. Installieren
3. Fertig!

### ☑️ Schritt 2: Projekt öffnen (1 Min)
1. VS Code starten
2. `Datei` → `Ordner öffnen...`
3. `gastro-planer-pro` Ordner auswählen

### ☑️ Schritt 3: Live Server Extension (2 Min)
1. In VS Code: Extensions-Symbol (Ctrl+Shift+X)
2. Suche: `Live Server`
3. Klicke "Install" bei "Live Server" von Ritwick Dey
4. Warte bis fertig

### ☑️ Schritt 4: App starten (1 Min)
1. Im Explorer (linke Seite) `index.html` anklicken
2. Rechtsklick auf `index.html`
3. Wähle: `Open with Live Server`
4. Browser öffnet sich automatisch!

### ☑️ Schritt 5: Einloggen & Testen (2 Min)
1. Wähle "Admin-Login"
2. PIN: `1234` eingeben
3. Erstelle einen Test-Mitarbeiter:
   - Name: "Max Mustermann"
   - Position: "Kellner"
   - Telefon: "0664123456"
   - PIN: "1111"
4. Erstelle eine Schicht im Wochenplan

### ☑️ Schritt 6: Als Mitarbeiter einloggen (2 Min)
1. Logout (unten rechts)
2. Wähle "Mitarbeiter-Login"
3. Wähle "Max Mustermann"
4. PIN: `1111`
5. Erkunde die Mitarbeiter-Ansicht!

## 🎉 Fertig!

Die App läuft jetzt lokal auf deinem PC!

---

## 🔥 Firebase aktivieren (Optional - später)

Wenn du die App auf mehreren Geräten nutzen willst:

### Zeit: ~15 Minuten

1. Öffne [docs/FIREBASE_SETUP.md](FIREBASE_SETUP.md)
2. Folge den Schritten
3. Aktiviere Echtzeit-Sync!

---

## 💡 Nächste Schritte

- [ ] Firebase Setup (für Multi-Device)
- [ ] Eigene Mitarbeiter anlegen
- [ ] Dienstplan für diese Woche erstellen
- [ ] Lagerartikel hinzufügen
- [ ] Checkliste anpassen
- [ ] Admin-PIN ändern

---

## 🆘 Probleme?

### "Live Server startet nicht"
→ Prüfe ob Extension installiert ist (Ctrl+Shift+X)

### "Seite lädt nicht"
→ Prüfe Console in VS Code (Ctrl+Shift+U)

### "Daten gehen verloren"
→ Normal! Aktuell nur im Browser gespeichert
→ Aktiviere Firebase für permanente Speicherung

### Andere Probleme?
→ Öffne Browser-Console (F12) und schau nach Fehlern
→ Siehe [docs/DEVELOPMENT.md](DEVELOPMENT.md) für Details
