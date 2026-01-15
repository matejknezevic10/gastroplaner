// ==========================================
// SYNC STATUS INDIKATOR
// Zeigt visuell an wann synchronisiert wird
// ==========================================

(function() {
    // Warte bis Seite geladen ist
    window.addEventListener('load', () => {
        // Prüfe ob Firebase verfügbar
        if (typeof TenantSync === 'undefined') {
            return;
        }
        
        // Erstelle Sync-Indikator
        const indicator = document.createElement('div');
        indicator.id = 'sync-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            z-index: 9999;
            display: none;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s;
        `;
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Synchronisiere...';
        
        indicator.appendChild(spinner);
        indicator.appendChild(text);
        document.body.appendChild(indicator);
        
        // CSS Animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Globale Funktionen zum Anzeigen/Verstecken
        window.showSyncIndicator = function(message = 'Synchronisiere...') {
            text.textContent = message;
            indicator.style.display = 'flex';
        };
        
        window.hideSyncIndicator = function(delay = 0) {
            setTimeout(() => {
                indicator.style.display = 'none';
            }, delay);
        };
        
        window.showSyncSuccess = function(message = 'Synchronisiert ✓') {
            text.textContent = message;
            indicator.style.background = '#10b981';
            spinner.style.display = 'none';
            indicator.style.display = 'flex';
            
            setTimeout(() => {
                indicator.style.display = 'none';
                spinner.style.display = 'block';
                indicator.style.background = 'rgba(0,0,0,0.8)';
            }, 2000);
        };
        
        window.showSyncError = function(message = 'Sync fehlgeschlagen') {
            text.textContent = message;
            indicator.style.background = '#ef4444';
            spinner.style.display = 'none';
            indicator.style.display = 'flex';
            
            setTimeout(() => {
                indicator.style.display = 'none';
                spinner.style.display = 'block';
                indicator.style.background = 'rgba(0,0,0,0.8)';
            }, 3000);
        };
        
        console.log('✅ Sync-Indikator initialisiert');
    });
})();
