# 🆘 DATENWIEDERHERSTELLUNG

## ❌ Was ist passiert?

Die alte `syncToFirebase` Funktion hatte einen kritischen Bug:
- Sie **löschte ALLE Firebase-Daten**
- Und ersetzte sie mit localStorage
- Wenn localStorage leer war → ALLE Daten weg! 😱

## ✅ Was wurde gefixt?

**Neue sichere Sync-Funktion:**
- ✅ Löscht KEINE Daten mehr
- ✅ Merged localStorage mit Firebase
- ✅ Wenn localStorage leer → Skip (keine Löschung!)
- ✅ Nur Updates & neue Einträge

**Auto-Sync:**
- ❌ Upload deaktiviert (vorerst)
- ✅ Download aktiv (alle 30 Sek)
- 🔒 Sicher vor Datenverlust

## 🔍 Daten prüfen

### In Firebase Console:

1. Öffne: https://console.firebase.google.com
2. Dein Projekt → Firestore Database → Daten
3. Prüfe: `tenants/GASTRO-XXXXX/mitarbeiter`
4. Sind Daten da?

### Mögliche Szenarien:

**Szenario A: Daten noch in Firebase ✅**
```
→ Einfach App neu laden
→ Daten werden automatisch heruntergeladen
```

**Szenario B: Daten teilweise da ⚠️**
```
→ Prüfe welcher Tenant betroffen ist
→ Siehe Recovery-Optionen unten
```

**Szenario C: Daten komplett weg ❌**
```
→ Siehe Recovery-Optionen unten
```

## 🔄 Recovery-Optionen

### Option 1: Browser-Cache prüfen

**Daten könnten noch im localStorage sein!**

1. **F12** → Developer Tools öffnen
2. **Application** → **Local Storage**
3. Suche nach Keys: `tenant_GASTRO-XXXXX_gastro-mitarbeiter`
4. Sind Werte da?
   - **JA** → Kopiere die Daten!
   - **NEIN** → Option 2

### Option 2: Demo-Daten neu erstellen

Die App erstellt automatisch Demo-Daten bei Registrierung:
- 2 Mitarbeiter (Anna Müller, Max Weber)
- 4 Lager-Items (Cola, Fanta, Sprite, Bier)

**Neu erstellen:**
```javascript
// In Browser-Console (F12):
await TenantManager.createInitialData('GASTRO-XXXXX');
```

### Option 3: Manuell neu eingeben

Falls nur wenige Einträge verloren:
- Einfach neu eingeben
- Werden automatisch gespeichert
- Bleiben diesmal erhalten! ✅

## 🛡️ Prävention

### Was jetzt anders ist:

**Alte Version (GEFÄHRLICH):**
```javascript
// Lösche ALLES in Firebase
existingSnapshot.forEach(doc => batch.delete(doc.ref));

// Ersetze mit localStorage
items.forEach(item => batch.set(...));
```

**Neue Version (SICHER):**
```javascript
// Wenn localStorage leer → SKIP!
if (!localData || items.length === 0) {
    return { success: true };
}

// Merge: Update oder Create (KEIN Delete!)
items.forEach(item => {
    if (exists) {
        batch.update(...);  // Update
    } else {
        batch.set(...);     // Neu
    }
});
```

### Neue Sicherheitsmaßnahmen:

1. ✅ **Kein Auto-Upload** mehr (vorerst)
2. ✅ **Nur Download** von Firebase
3. ✅ **Merge-Logik** statt Replace
4. ✅ **Skip wenn leer** statt löschen

## 📋 Checkliste: Was tun?

- [ ] Neue ZIP herunterladen
- [ ] Firebase Console prüfen (sind Daten da?)
- [ ] Wenn Daten weg: Recovery-Option wählen
- [ ] App mit neuer Version testen
- [ ] Neue Daten eingeben
- [ ] Prüfen: Bleiben Daten erhalten?

## 🎯 Nächste Schritte

### Für beide Restaurants:

**Restaurant 1:**
1. Login mit Tenant-ID-1
2. Prüfe Mitarbeiter/Lager
3. Falls leer: Neu eingeben
4. App neu laden → Daten bleiben!

**Restaurant 2:**
1. Login mit Tenant-ID-2
2. Prüfe Mitarbeiter/Lager
3. Falls leer: Neu eingeben
4. App neu laden → Daten bleiben!

### Test:

```
1. Mitarbeiter erstellen: "Test Person"
2. Browser schließen
3. Browser neu öffnen
4. Login mit gleicher Tenant-ID
5. Ist "Test Person" noch da? ✅
```

## 💾 Backup-Strategie (Empfehlung)

Für die Zukunft:

1. **Regelmäßige Firebase-Backups**
   - Firebase Console → Firestore → Export
   - Oder: Backup-Skript schreiben

2. **Export-Funktion in App** (TODO)
   - Button "Daten exportieren"
   - JSON-Download
   - Für manuelle Backups

3. **Firebase Firestore Rules**
   - Verhindert versehentliches Löschen
   - Soft-Delete statt Hard-Delete

## 🔧 Debug-Kommandos

### In Browser-Console (F12):

```javascript
// Aktuellen Tenant anzeigen
TenantManager.getTenant()

// LocalStorage für Tenant prüfen
localStorage.getItem('tenant_GASTRO-XXXXX_gastro-mitarbeiter')

// Firebase-Daten laden
await TenantDatabase.readAll('mitarbeiter')

// Demo-Daten erstellen
await TenantManager.createInitialData('GASTRO-XXXXX')

// Manuell syncen (nur Download)
await TenantSync.syncAll()
```

## ⚠️ Wichtig

**NICHT mehr verwenden:**
```javascript
await TenantSync.syncToFirebase(...)  // Vorerst unsicher!
```

**Sicher:**
```javascript
await TenantSync.syncFromFirebase(...)  // Nur Download ✅
await TenantSync.syncAll()             // Nur Download ✅
```

---

**Status:** 🔧 Behoben  
**Datum:** Januar 2026  
**Priorität:** 🔴 KRITISCH

**Die neue Version ist SICHER und löscht keine Daten mehr!** ✅
