# 🚀 Firebase Deploy Setup für VS Code

## ✅ Einmalige Installation

### 1. Firebase CLI installieren
```bash
npm install
```

### 2. Firebase Login (einmalig)
```bash
npm run firebase:login
```

Oder in VS Code:
- `Ctrl+Shift+P` → Tasks: Run Task → `🔐 Firebase Login`

---

## 🎯 Deploy-Methoden

### Option 1: Keyboard Shortcuts (Schnellste!)

- **`Ctrl+Shift+D`** → Komplettes Deploy (Hosting + Rules)
- **`Ctrl+Shift+H`** → Nur Hosting Deploy
- **`Ctrl+Shift+S`** → Local Firebase Serve

### Option 2: VS Code Tasks

1. **`Ctrl+Shift+P`** (Command Palette öffnen)
2. Tippe: **"Tasks: Run Task"**
3. Wähle:
   - 🚀 **Firebase Deploy** (Alles)
   - 🌐 **Firebase Deploy (Hosting only)** (Schneller)
   - 🔒 **Firebase Deploy (Rules only)** (Nur Rules)
   - 👀 **Firebase Serve (Local)** (Lokaler Test)

### Option 3: Terminal

```bash
# Komplettes Deploy
npm run deploy

# Nur Hosting
npm run deploy:hosting

# Nur Firestore Rules
npm run deploy:rules

# Lokaler Test
npm run firebase:serve
```

### Option 4: Standard Terminal

```bash
firebase deploy
```

---

## 📊 Workflow

### Empfohlener Deploy-Workflow:

1. **Änderungen machen** in VS Code
2. **Speichern** (Ctrl+S)
3. **Deployen** (Ctrl+Shift+H)
4. **Warten** (~10-30 Sekunden)
5. **Testen** im Browser (Ctrl+Shift+R für Hard-Reload)

---

## 🎨 UI Deploy Button (Optional)

Du kannst auch einen Deploy-Button in der Status Bar haben:

**Extensions installieren:**
- "Task Runner" Extension
- "Firebase" Extension

Dann erscheint ein 🚀 Button unten rechts!

---

## 🔧 Troubleshooting

### "firebase: command not found"
```bash
npm install
npm run firebase:login
```

### "Not logged in"
```bash
npm run firebase:login
```

### "Project not found"
Prüfe `.firebaserc`:
```json
{
  "projects": {
    "default": "gastroplaner-f2a35"
  }
}
```

### Deploy dauert ewig
```bash
# Nur Hosting deployen (schneller)
npm run deploy:hosting
```

---

## 💡 Tipps

### Schnelles Deploy:
- **`Ctrl+Shift+H`** statt **`Ctrl+Shift+D`**
- Deployed nur Hosting (keine Rules)
- ~10 Sekunden statt 30

### Local Testing:
```bash
npm run firebase:serve
```
Öffnet: http://localhost:5000

### Cache löschen nach Deploy:
Im Browser: **`Ctrl+Shift+R`** (Hard Reload)

---

## ✅ Fertig!

Jetzt kannst du mit **`Ctrl+Shift+H`** in Sekunden deployen! 🚀
