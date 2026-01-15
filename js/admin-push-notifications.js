// ==========================================
// PUSH-BENACHRICHTIGUNGEN für Admin
// Benachrichtigt Admin bei neuen Notizen & Benachrichtigungen
// ==========================================

class AdminPushNotifications {
    constructor() {
        this.supported = 'Notification' in window && 'serviceWorker' in navigator;
        this.permission = null;
        this.lastNotificationCount = 0;
        this.checkInterval = null;
    }
    
    // Init: Frage nach Permission
    async init() {
        if (!this.supported) {
            console.log('📱 Push-Benachrichtigungen werden von diesem Browser nicht unterstützt');
            return false;
        }
        
        // Prüfe aktuelle Permission
        this.permission = Notification.permission;
        
        if (this.permission === 'default') {
            // Frage nach Permission
            this.permission = await Notification.requestPermission();
        }
        
        if (this.permission === 'granted') {
            console.log('✅ Push-Benachrichtigungen aktiviert');
            this.startMonitoring();
            return true;
        } else {
            console.log('❌ Push-Benachrichtigungen abgelehnt');
            return false;
        }
    }
    
    // Starte Monitoring für neue Notizen/Benachrichtigungen
    startMonitoring() {
        // Initial Count
        this.lastNotificationCount = this.getCurrentCount();
        
        // Prüfe alle 30 Sekunden
        this.checkInterval = setInterval(() => {
            this.checkForNew();
        }, 30000);
        
        console.log('👀 Monitoring für neue Benachrichtigungen gestartet');
    }
    
    // Stoppe Monitoring
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    
    // Hole aktuelle Anzahl ungelesener Items
    getCurrentCount() {
        const notizen = JSON.parse(localStorage.getItem('gastro-notizen') || '[]');
        const kassenstände = JSON.parse(localStorage.getItem('gastro-kassenstände') || '[]');
        
        const ungelesenNotizen = notizen.filter(n => !n.gelesen).length;
        const ungelesenKassen = kassenstände.filter(k => !k.gelesen).length;
        
        return ungelesenNotizen + ungelesenKassen;
    }
    
    // Prüfe auf neue Items
    async checkForNew() {
        const currentCount = this.getCurrentCount();
        
        if (currentCount > this.lastNotificationCount) {
            const anzahlNeu = currentCount - this.lastNotificationCount;
            await this.sendNotification(anzahlNeu);
        }
        
        this.lastNotificationCount = currentCount;
    }
    
    // Sende Push-Notification
    async sendNotification(anzahl) {
        if (this.permission !== 'granted') return;
        
        // Hole letzte Notiz/Benachrichtigung
        const notizen = JSON.parse(localStorage.getItem('gastro-notizen') || '[]');
        const kassenstände = JSON.parse(localStorage.getItem('gastro-kassenstände') || '[]');
        
        const letzteNotiz = notizen[notizen.length - 1];
        const letzterKassenstand = kassenstände[kassenstände.length - 1];
        
        let title = '🔔 Neue Benachrichtigung';
        let body = `Sie haben ${anzahl} neue Benachrichtigung(en)`;
        let icon = '🔔';
        
        // Bestimme spezifischen Inhalt
        if (letzteNotiz && (!letzterKassenstand || new Date(letzteNotiz.datum) > new Date(letzterKassenstand.datum))) {
            icon = '💬';
            title = '💬 Neue Notiz';
            body = `${letzteNotiz.mitarbeiterName}: ${letzteNotiz.betreff}`;
        } else if (letzterKassenstand) {
            icon = '💰';
            title = '💰 Neuer Kassenstand';
            body = `${letzterKassenstand.mitarbeiterName}: €${letzterKassenstand.betrag}`;
        }
        
        try {
            const notification = new Notification(title, {
                body: body,
                icon: icon,
                badge: icon,
                tag: 'gastro-admin', // Gruppiere Notifications
                requireInteraction: false, // Auto-close nach ein paar Sekunden
                silent: false // Mit Sound
            });
            
            // Bei Klick: Öffne Kommunikations-Tab
            notification.onclick = () => {
                window.focus();
                if (typeof showSection === 'function') {
                    showSection('admin-kommunikation');
                }
                notification.close();
            };
            
            // Auto-close nach 10 Sekunden
            setTimeout(() => notification.close(), 10000);
            
        } catch (error) {
            console.error('❌ Notification-Fehler:', error);
        }
    }
    
    // Manuelle Test-Notification
    async testNotification() {
        if (this.permission !== 'granted') {
            alert('Bitte erlauben Sie Push-Benachrichtigungen in den Browser-Einstellungen!');
            await this.init();
            return;
        }
        
        const notification = new Notification('🧪 Test-Benachrichtigung', {
            body: 'Push-Benachrichtigungen funktionieren! ✅',
            icon: '🧪',
            badge: '🧪'
        });
        
        setTimeout(() => notification.close(), 5000);
    }
}

// Globale Instanz
window.adminPushNotifications = new AdminPushNotifications();

// Auto-Init wenn Admin eingeloggt ist
window.addEventListener('load', () => {
    // Warte 2 Sekunden damit User Zeit hat einzuloggen
    setTimeout(async () => {
        // Prüfe ob Admin-Modus aktiv
        const isAdmin = localStorage.getItem('admin-logged-in') === 'true';
        
        if (isAdmin) {
            console.log('👑 Admin-Modus erkannt - Initialisiere Push-Notifications');
            await window.adminPushNotifications.init();
        }
    }, 2000);
});

// Stoppe Monitoring beim Logout
window.addEventListener('beforeunload', () => {
    if (window.adminPushNotifications) {
        window.adminPushNotifications.stopMonitoring();
    }
});

console.log('✅ Admin Push-Notifications Modul geladen');
