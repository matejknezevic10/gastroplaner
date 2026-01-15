# 🚀 Quick Deploy Script für GastroPlaner (Windows PowerShell)
# Nutzung: .\quick-deploy.ps1

Write-Host "🚀 GastroPlaner Deploy wird gestartet..." -ForegroundColor Green
Write-Host ""

# Prüfe ob Node.js installiert ist
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    Write-Host "📦 Bitte Node.js installieren: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Prüfe ob npm installiert ist
try {
    $npmVersion = npm --version
    Write-Host "✅ npm gefunden: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Installiere Dependencies falls nötig
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installiere Dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Installation abgeschlossen!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Prüfe Firebase Login..." -ForegroundColor Cyan

# Prüfe Firebase Login
try {
    firebase projects:list 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Firebase Login OK!" -ForegroundColor Green
} catch {
    Write-Host "❌ Nicht eingeloggt!" -ForegroundColor Red
    Write-Host "🔑 Starte Login..." -ForegroundColor Yellow
    firebase login
}

Write-Host ""
Write-Host "🚀 Starte Deployment..." -ForegroundColor Green
Write-Host "📁 Projekt: gastroplaner-f2a35" -ForegroundColor Cyan
Write-Host "🌐 URL: https://gastroplaner-f2a35.web.app" -ForegroundColor Cyan
Write-Host ""

# Deploy
npm run deploy:hosting

Write-Host ""
Write-Host "✅ Deploy abgeschlossen!" -ForegroundColor Green
Write-Host "🌐 App verfügbar unter: https://gastroplaner-f2a35.web.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tipp: Cache im Browser löschen (Ctrl+Shift+R)" -ForegroundColor Yellow
