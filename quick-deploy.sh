#!/bin/bash

# 🚀 Quick Deploy Script für GastroPlaner
# Nutzung: ./quick-deploy.sh

echo "🚀 GastroPlaner Deploy wird gestartet..."
echo ""

# Prüfe ob firebase-tools installiert ist
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI nicht gefunden!"
    echo "📦 Installiere Firebase Tools..."
    npm install
    echo "✅ Installation abgeschlossen!"
    echo ""
fi

# Prüfe Firebase Login
echo "🔐 Prüfe Firebase Login..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Nicht eingeloggt!"
    echo "🔑 Starte Login..."
    firebase login
fi

echo "✅ Login erfolgreich!"
echo ""

# Deploy
echo "🚀 Starte Deployment..."
echo "📁 Projekt: gastroplaner-f2a35"
echo "🌐 URL: https://gastroplaner-f2a35.web.app"
echo ""

firebase deploy --only hosting

echo ""
echo "✅ Deploy abgeschlossen!"
echo "🌐 App verfügbar unter: https://gastroplaner-f2a35.web.app"
echo ""
echo "💡 Tipp: Cache im Browser löschen (Ctrl+Shift+R)"
