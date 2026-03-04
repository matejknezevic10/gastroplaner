// ==========================================
// PUSH-BENACHRICHTIGUNGEN für Admin
// Firestore-basiert mit Service Worker
// ==========================================

class AdminPushNotifications {
    constructor() {
        this.supported = 'Notification' in window && 'serviceWorker' in navigator;
        this.permission = null;
        this.checkInterval = null;
        this.lastCheckTime = new Date().toISOString();
    }
    
    // Init: Permission anfragen + Service Worker registrieren
    async init() {
        if (!this.supported) {
            console.log('📱 Push-Benachrichtigungen werden von diesem Browser nicht unterstützt');
            return false;
        }
        
        // Service Worker registrieren
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registriert:', registration.scope);
        } catch (error) {
            console.error('❌ Service Worker Registrierung fehlgeschlagen:', error);
        }
        
        // Permission anfragen
        this.permission = Notification.permission;
        
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        
        if (this.permission === 'granted') {
            console.log('✅ Push-Benachrichtigungen aktiviert');
            this.startMonitoring();
            this.updateStatusUI();
            return true;
        } else {
            console.log('❌ Push-Benachrichtigungen abgelehnt');
            this.updateStatusUI();
            return false;
        }
    }
    
    // Status-UI aktualisieren
    updateStatusUI() {
        const statusEl = document.getElementById('push-status-text');
        if (!statusEl) return;
        
        if (this.permission === 'granted') {
            statusEl.textContent = '✅ Aktiv';
            statusEl.style.color = '#10b981';
        } else if (this.permission === 'denied') {
            statusEl.textContent = '❌ Blockiert (in Browser-Einstellungen ändern)';
            statusEl.style.color = '#dc2626';
        }
    }
    
    // Starte Monitoring — prüfe Firestore auf neue Notizen
    startMonitoring() {
        this.lastCheckTime = new Date().toISOString();
        
        // Prüfe alle 30 Sekunden
        this.checkInterval = setInterval(() => {
            this.checkForNew();
        }, 30000);
        
        console.log('👀 Firestore-Monitoring für neue Benachrichtigungen gestartet');
    }
    
    // Stoppe Monitoring
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    
    // Prüfe Firestore auf neue Notizen seit letztem Check
    async checkForNew() {
        if (typeof TenantStorage === 'undefined' || typeof db === 'undefined') return;
        
        const tenantId = TenantStorage.getTenantId();
        if (!tenantId) return;
        
        try {
            const snapshot = await db.collection('tenants')
                .doc(tenantId)
                .collection('notizen')
                .where('datum', '>', this.lastCheckTime)
                .get();
            
            if (!snapshot.empty) {
                const neueNotizen = [];
                snapshot.forEach(doc => neueNotizen.push({ id: doc.id, ...doc.data() }));
                
                // Nur Benachrichtigungen die nicht vom Admin selbst sind
                const relevante = neueNotizen.filter(n => n.mitarbeiterId !== 'admin');
                
                if (relevante.length > 0) {
                    await this.sendNotification(relevante);
                }
            }
            
            this.lastCheckTime = new Date().toISOString();
            
        } catch (error) {
            console.error('❌ Fehler beim Prüfen auf neue Notizen:', error);
        }
    }
    
    // Sende Push-Notification
    async sendNotification(notizen) {
        if (this.permission !== 'granted') return;
        
        const letzte = notizen[notizen.length - 1];
        
        let title = '🔔 Neue Benachrichtigung';
        let body = `${notizen.length} neue Nachricht(en)`;
        
        if (notizen.length === 1) {
            const typIcons = { 'info': 'ℹ️', 'frage': '❓', 'problem': '⚠️', 'idee': '💡', 'benachrichtigung': '🔔' };
            const icon = typIcons[letzte.typ] || '💬';
            title = `${icon} ${letzte.betreff || 'Neue Nachricht'}`;
            body = `${letzte.mitarbeiterName}: ${letzte.text ? letzte.text.substring(0, 100) : ''}`;
        }
        
        try {
            // Versuche Service Worker Notification (funktioniert im Hintergrund)
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: 'gastroplaner-admin',
                vibrate: [200, 100, 200],
                data: { url: '/' },
                requireInteraction: false
            });
        } catch (error) {
            // Fallback: Direkte Notification
            try {
                const notification = new Notification(title, {
                    body: body,
                    tag: 'gastroplaner-admin',
                    requireInteraction: false
                });
                
                notification.onclick = () => {
                    window.focus();
                    if (typeof showSection === 'function') {
                        showSection('admin-kommunikation');
                    }
                    notification.close();
                };
                
                setTimeout(() => notification.close(), 10000);
            } catch (e) {
                console.error('❌ Notification-Fehler:', e);
            }
        }
    }
    
    // Test-Notification
    async testNotification() {
        if (this.permission !== 'granted') {
            await this.init();
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('🧪 Test-Benachrichtigung', {
                body: 'Push-Benachrichtigungen funktionieren! ✅',
                icon: '/icons/icon-192.png',
                tag: 'gastroplaner-test',
                vibrate: [200]
            });
        } catch (error) {
            new Notification('🧪 Test-Benachrichtigung', {
                body: 'Push-Benachrichtigungen funktionieren! ✅'
            });
        }
    }
}

// Globale Instanz
window.adminPushNotifications = new AdminPushNotifications();

// Stoppe Monitoring beim Schließen
window.addEventListener('beforeunload', () => {
    if (window.adminPushNotifications) {
        window.adminPushNotifications.stopMonitoring();
    }
});

console.log('✅ Admin Push-Notifications Modul geladen (Firestore + Service Worker)');
