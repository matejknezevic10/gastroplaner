// ==========================================
// FIREBASE INTEGRATION für index.html
// Stellt sicher dass jeder Tenant nur seine Daten sieht
// ==========================================

(async function() {
    console.log('🔥 Firebase Integration wird geladen...');
    
    // Prüfe ob Firebase verfügbar
    if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase nicht verfügbar - läuft im Offline-Modus');
        return;
    }
    
    if (typeof TenantManager === 'undefined') {
        console.warn('⚠️ TenantManager nicht verfügbar');
        return;
    }
    
    // Prüfe ob Tenant eingeloggt
    const tenantId = TenantManager.getTenant();
    
    if (!tenantId) {
        console.warn('⚠️ Kein Tenant eingeloggt - Weiterleitung zu tenant-zugang.html...');
        // Kein alert() - blockiert auf iOS PWA!
        window.location.replace('tenant-zugang.html');
        return;
    }
    
    console.log('✅ Tenant-ID:', tenantId);
    
    // localStorage-Override wurde entfernt - jetzt in localstorage-patch.js
    
    console.log('✅ LocalStorage wird über localstorage-patch.js gehandhabt');
    
    // ==========================================
    // FIREBASE SYNC
    // ==========================================
    
    // Synchronisiere Daten von Firebase
    console.log('🔄 Lade Daten von Firebase...');
    
    try {
        await TenantSync.syncAll();
        console.log('✅ Alle Daten von Firebase geladen!');
        
        // Zeige Erfolgsmeldung
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: 600;
            `;
            notification.textContent = '✅ Mit Firebase verbunden - Tenant: ' + tenantId;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Firebase Sync Fehler:', error);
        alert('Warnung: Daten konnten nicht von Firebase geladen werden.\n\n' + error.message);
    }
    
    // ==========================================
    // AUTO-SYNC (Bidirektional - STUMM aber HÄUFIG)
    // ==========================================
    
    // Bidirektionaler Sync alle 30 Sekunden (STUMM!)
    setInterval(async () => {
        try {
            console.log('🔄 Auto-Sync (30 Sek Intervall - stumm)...');
            // KEIN visueller Indikator!
            
            // 1. Lokale Änderungen zu Firebase hochladen
            // WICHTIG: Mitarbeiter, Lager, Schichten, Notizen & Tausch-Anfragen NICHT syncen (werden direkt in Firestore verwaltet)
            const collections = [
                // { name: 'mitarbeiter', key: 'gastro-mitarbeiter' }, // ← DEAKTIVIERT!
                // { name: 'schichten', key: 'gastro-schichten' }, // ← DEAKTIVIERT!
                // { name: 'notizen', key: 'gastro-notizen' }, // ← DEAKTIVIERT!
                // { name: 'lager', key: 'gastro-lager' }, // ← DEAKTIVIERT!
                // { name: 'tauschAnfragen', key: 'gastro-tausch-anfragen' }, // ← DEAKTIVIERT!
                { name: 'zeiterfassung', key: 'gastro-zeiterfassung' },
                { name: 'kassenstände', key: 'gastro-kassenstände' }
            ];
            
            for (const col of collections) {
                await TenantSync.syncToFirebase(col.name, col.key);
            }
            
            // 2. Änderungen von Firebase herunterladen
            await TenantSync.syncAll();
            
            console.log('✅ Auto-Sync erfolgreich (stumm im Hintergrund)');
        } catch (error) {
            console.error('❌ Auto-Sync Fehler:', error);
        }
    }, 30000); // 30 Sekunden - häufig genug um aktuell zu sein
    
    // Sync beim Verlassen der Seite
    window.addEventListener('beforeunload', async () => {
        try {
            // Sync kritischer Collections (OHNE Mitarbeiter, Lager, Schichten & Notizen!)
            // await TenantSync.syncToFirebase('mitarbeiter', 'gastro-mitarbeiter'); // ← DEAKTIVIERT!
            // await TenantSync.syncToFirebase('schichten', 'gastro-schichten'); // ← DEAKTIVIERT!
            // await TenantSync.syncToFirebase('notizen', 'gastro-notizen'); // ← DEAKTIVIERT!
        } catch (error) {
            console.error('❌ Sync beim Verlassen fehlgeschlagen:', error);
        }
    });
    
    console.log('✅ Auto-Sync aktiviert (alle 30 Sek - stumm)');
    
    // ==========================================
    // SYNC BEIM VERLASSEN DER SEITE
    // ==========================================
    
    // Wichtig: Sync IMMER beim Verlassen/Schließen der Seite
    window.addEventListener('beforeunload', async (e) => {
        try {
            console.log('🔄 Sync beim Verlassen...');
            
            // Alle Collections sofort syncen (OHNE Mitarbeiter, Lager, Schichten, Notizen & Tausch-Anfragen!)
            const collections = [
                // { name: 'mitarbeiter', key: 'gastro-mitarbeiter' }, // ← DEAKTIVIERT!
                // { name: 'schichten', key: 'gastro-schichten' }, // ← DEAKTIVIERT!
                // { name: 'notizen', key: 'gastro-notizen' }, // ← DEAKTIVIERT!
                // { name: 'lager', key: 'gastro-lager' }, // ← DEAKTIVIERT!
                // { name: 'tauschAnfragen', key: 'gastro-tausch-anfragen' }, // ← DEAKTIVIERT!
                { name: 'zeiterfassung', key: 'gastro-zeiterfassung' },
                { name: 'kassenstände', key: 'gastro-kassenstände' }
            ];
            
            for (const col of collections) {
                await TenantSync.syncToFirebase(col.name, col.key);
            }
            
            console.log('✅ Sync beim Verlassen abgeschlossen');
        } catch (error) {
            console.error('❌ Sync beim Verlassen fehlgeschlagen:', error);
        }
    });
    
    // ==========================================
    // TENANT INFO ANZEIGEN
    // ==========================================
    
    // Zeige Tenant-Info im Header (optional)
    window.addEventListener('load', () => {
        const header = document.querySelector('header h1');
        if (header) {
            const tenantInfo = document.createElement('span');
            tenantInfo.style.cssText = `
                font-size: 0.4em;
                color: rgba(255,255,255,0.7);
                margin-left: 15px;
                font-weight: normal;
            `;
            tenantInfo.textContent = `(${tenantId})`;
            header.appendChild(tenantInfo);
        }
    });
    
    console.log('🎉 Firebase Integration abgeschlossen!');
    
})();
