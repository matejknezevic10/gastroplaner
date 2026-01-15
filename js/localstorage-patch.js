// ==========================================
// LOCALSTORAGE PATCH für Tenant-Isolation
// Leitet alle gastro-* localStorage Aufrufe automatisch um
// ==========================================

(function() {
    console.log('🔧 LocalStorage Patch wird angewendet...');
    
    // Warte bis TenantStorage verfügbar ist
    if (typeof TenantStorage === 'undefined') {
        console.error('❌ TenantStorage nicht geladen!');
        return;
    }
    
    // Original localStorage Methoden speichern
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    
    // Liste der gastro-Keys die umgeleitet werden sollen
    const gastroKeys = [
        'gastro-mitarbeiter',
        'gastro-schichten',
        'gastro-notizen',
        'gastro-lager',
        'gastro-zeiterfassung',
        'gastro-kassenstände',
        'gastro-tausch-anfragen',
        'gastro-checklist'
    ];
    
    // Patch getItem
    Storage.prototype.getItem = function(key) {
        // Wenn es ein gastro-Key ist, verwende TenantStorage
        if (gastroKeys.includes(key)) {
            const result = TenantStorage.getItem(key);
            console.log(`📥 GET: ${key} → tenant-spezifisch`);
            return result;
        }
        
        // Ansonsten normal
        return originalGetItem.call(this, key);
    };
    
    // Patch setItem
    Storage.prototype.setItem = function(key, value) {
        // Wenn es ein gastro-Key ist, verwende TenantStorage
        if (gastroKeys.includes(key)) {
            console.log(`📤 SET: ${key} → tenant-spezifisch`);
            TenantStorage.setItem(key, value);
            // KEINE Change-Detection mehr - Auto-Sync läuft alle 30 Sek
            return;
        }
        
        // Ansonsten normal
        return originalSetItem.call(this, key, value);
    };
    
    // Patch removeItem
    Storage.prototype.removeItem = function(key) {
        // Wenn es ein gastro-Key ist, verwende TenantStorage
        if (gastroKeys.includes(key)) {
            console.log(`🗑️ REMOVE: ${key} → tenant-spezifisch`);
            TenantStorage.removeItem(key);
            return;
        }
        
        // Ansonsten normal
        return originalRemoveItem.call(this, key);
    };
    
    console.log('✅ LocalStorage Patch aktiv!');
    console.log('📌 Tenant:', TenantStorage.getTenantId());
    console.log('🔐 Alle gastro-* Keys werden automatisch tenant-spezifisch');
    console.log('🔄 Auto-Sync läuft alle 30 Sekunden (stumm im Hintergrund)');
    
    // Test
    setTimeout(() => {
        const testKey = 'gastro-mitarbeiter';
        const data = localStorage.getItem(testKey);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log(`✅ Test erfolgreich: ${parsed.length} Mitarbeiter geladen`);
            } catch (e) {
                console.log(`⚠️ Test: Daten vorhanden aber Parse-Fehler`);
            }
        } else {
            console.log(`ℹ️ Test: Noch keine Mitarbeiter-Daten`);
        }
    }, 500);
    
})();
