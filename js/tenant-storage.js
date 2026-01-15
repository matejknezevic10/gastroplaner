// ==========================================
// TENANT-STORAGE INTERFACE
// Zentrales Interface für tenant-spezifischen localStorage
// ==========================================

window.TenantStorage = {
    // Hole Tenant-ID
    getTenantId() {
        return localStorage.getItem('tenantId') || null;
    },
    
    // Erstelle tenant-spezifischen Key
    getTenantKey(key) {
        const tenantId = this.getTenantId();
        if (!tenantId) {
            console.warn('⚠️ Kein Tenant eingeloggt!');
            return key; // Fallback
        }
        return `tenant_${tenantId}_${key}`;
    },
    
    // GET Item
    getItem(key) {
        const tenantKey = this.getTenantKey(key);
        return localStorage.getItem(tenantKey);
    },
    
    // SET Item
    setItem(key, value) {
        const tenantKey = this.getTenantKey(key);
        localStorage.setItem(tenantKey, value);
    },
    
    // REMOVE Item
    removeItem(key) {
        const tenantKey = this.getTenantKey(key);
        localStorage.removeItem(tenantKey);
    },
    
    // CLEAR alle Tenant-Daten
    clearTenantData() {
        const tenantId = this.getTenantId();
        if (!tenantId) return;
        
        const prefix = `tenant_${tenantId}_`;
        const keysToDelete = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => localStorage.removeItem(key));
    }
};

// Convenience Functions für häufige Collections
window.GastroStorage = {
    // Mitarbeiter
    getMitarbeiter() {
        return JSON.parse(TenantStorage.getItem('gastro-mitarbeiter') || '[]');
    },
    setMitarbeiter(data) {
        TenantStorage.setItem('gastro-mitarbeiter', JSON.stringify(data));
    },
    
    // Schichten
    getSchichten() {
        return JSON.parse(TenantStorage.getItem('gastro-schichten') || '[]');
    },
    setSchichten(data) {
        TenantStorage.setItem('gastro-schichten', JSON.stringify(data));
    },
    
    // Notizen
    getNotizen() {
        return JSON.parse(TenantStorage.getItem('gastro-notizen') || '[]');
    },
    setNotizen(data) {
        TenantStorage.setItem('gastro-notizen', JSON.stringify(data));
    },
    
    // Lager
    getLager() {
        return JSON.parse(TenantStorage.getItem('gastro-lager') || '[]');
    },
    setLager(data) {
        TenantStorage.setItem('gastro-lager', JSON.stringify(data));
    },
    
    // Zeiterfassung
    getZeiterfassung() {
        return JSON.parse(TenantStorage.getItem('gastro-zeiterfassung') || '[]');
    },
    setZeiterfassung(data) {
        TenantStorage.setItem('gastro-zeiterfassung', JSON.stringify(data));
    },
    
    // Kassenstände
    getKassenstände() {
        return JSON.parse(TenantStorage.getItem('gastro-kassenstände') || '[]');
    },
    setKassenstände(data) {
        TenantStorage.setItem('gastro-kassenstände', JSON.stringify(data));
    },
    
    // Tausch-Anfragen
    getTauschAnfragen() {
        return JSON.parse(TenantStorage.getItem('gastro-tausch-anfragen') || '[]');
    },
    setTauschAnfragen(data) {
        TenantStorage.setItem('gastro-tausch-anfragen', JSON.stringify(data));
    }
};

console.log('✅ TenantStorage Interface geladen');
console.log('📦 Aktueller Tenant:', TenantStorage.getTenantId());
