// ==========================================
// GASTRO PLANER PRO — Subscription Manager
// Client-side Abo-Verwaltung + Paywall
// ==========================================

class SubscriptionManager {
    constructor() {
        this.status = null; // trial, active, past_due, trial_expired, cancelled
        this.trialDaysLeft = null;
        this.currentPeriodEnd = null;
        this.TRIAL_DAYS = 14;
    }

    // Lade Subscription-Status aus Firestore
    async loadStatus() {
        const tenantId = TenantStorage.getTenantId();
        if (!tenantId || typeof db === 'undefined') return null;

        try {
            const doc = await db.collection('tenants').doc(tenantId).get();
            if (!doc.exists) return null;

            const tenant = doc.data();
            const subscription = tenant.subscription || {};
            const createdAt = tenant.createdAt?.toDate ? tenant.createdAt.toDate() : new Date(tenant.createdAt);

            // Trial-Berechnung
            const now = new Date();
            const trialEnd = new Date(createdAt.getTime() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000);
            this.trialDaysLeft = Math.max(0, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000)));

            // Status bestimmen
            if (subscription.status === 'active') {
                this.status = 'active';
                this.currentPeriodEnd = subscription.currentPeriodEnd;
            } else if (subscription.status === 'past_due') {
                this.status = 'past_due';
            } else if (subscription.status === 'cancelled' || subscription.status === 'trial_expired') {
                this.status = this.trialDaysLeft > 0 ? 'trial' : 'expired';
            } else if (this.trialDaysLeft > 0) {
                this.status = 'trial';
            } else {
                this.status = 'expired';
            }

            console.log('📋 Abo-Status:', this.status, '| Trial-Tage:', this.trialDaysLeft);
            return this.status;

        } catch (error) {
            console.error('❌ Fehler beim Laden des Abo-Status:', error);
            return null;
        }
    }

    // Prüfe ob Zugang erlaubt ist
    hasAccess() {
        return this.status === 'active' || this.status === 'trial' || this.status === 'past_due';
    }

    // Stripe Checkout starten
    async startCheckout() {
        const tenantId = TenantStorage.getTenantId();
        if (!tenantId) {
            alert('❌ Keine Restaurant-ID gefunden!');
            return;
        }

        try {
            // Zeige Ladeindikator
            this.showLoading('Weiterleitung zu Stripe...');

            const createCheckoutSession = firebase.functions().httpsCallable('createCheckoutSession');
            const result = await createCheckoutSession({ tenantId });

            if (result.data.url) {
                window.location.href = result.data.url;
            }
        } catch (error) {
            console.error('❌ Checkout-Fehler:', error);
            this.hideLoading();
            alert('❌ Fehler beim Starten des Bezahlvorgangs. Bitte versuche es erneut.');
        }
    }

    // Stripe Customer Portal öffnen (Abo verwalten/kündigen)
    async openPortal() {
        const tenantId = TenantStorage.getTenantId();
        if (!tenantId) return;

        try {
            this.showLoading('Abo-Verwaltung wird geladen...');

            const createPortalSession = firebase.functions().httpsCallable('createPortalSession');
            const result = await createPortalSession({ tenantId });

            if (result.data.url) {
                window.location.href = result.data.url;
            }
        } catch (error) {
            console.error('❌ Portal-Fehler:', error);
            this.hideLoading();
            alert('❌ Fehler beim Öffnen der Abo-Verwaltung.');
        }
    }

    // Trial-Banner anzeigen (oben in der App)
    showTrialBanner() {
        const existing = document.getElementById('trial-banner');
        if (existing) existing.remove();

        if (this.status === 'trial' && this.trialDaysLeft <= 7) {
            const urgency = this.trialDaysLeft <= 3 ? '#E74C3C' : '#F39C12';
            const banner = document.createElement('div');
            banner.id = 'trial-banner';
            banner.style.cssText = `
                background: ${urgency}; color: white; padding: 10px 16px;
                text-align: center; font-size: 0.9em; font-weight: 600;
                display: flex; align-items: center; justify-content: center; gap: 12px;
                flex-wrap: wrap;
            `;
            banner.innerHTML = `
                <span>⏰ Testphase endet in ${this.trialDaysLeft} Tag${this.trialDaysLeft !== 1 ? 'en' : ''}</span>
                <button onclick="window.subscriptionManager.startCheckout()" style="
                    background: white; color: ${urgency}; border: none;
                    padding: 6px 16px; border-radius: 6px; font-weight: 700;
                    cursor: pointer; font-size: 0.9em;
                ">Jetzt upgraden — €39/Monat</button>
            `;

            const adminContent = document.getElementById('admin-content');
            if (adminContent) {
                const header = adminContent.querySelector('.header');
                if (header) {
                    header.after(banner);
                }
            }
        }
    }

    // Paywall anzeigen (blockiert App-Zugriff)
    showPaywall() {
        const existing = document.getElementById('paywall-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'paywall-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85); z-index: 10001;
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
        `;

        let title, text, btnText;
        if (this.status === 'past_due') {
            title = '⚠️ Zahlung ausstehend';
            text = 'Deine letzte Zahlung konnte nicht verarbeitet werden. Bitte aktualisiere deine Zahlungsmethode, um Gastro Planer Pro weiter zu nutzen.';
            btnText = '💳 Zahlungsmethode aktualisieren';
        } else {
            title = '⏰ Testphase abgelaufen';
            text = 'Deine 14-tägige kostenlose Testphase ist beendet. Upgrade auf Gastro Planer Pro für nur €39/Monat, um dein Restaurant weiter digital zu verwalten.';
            btnText = '🚀 Jetzt upgraden — €39/Monat';
        }

        overlay.innerHTML = `
            <div style="
                background: white; border-radius: 24px; padding: 40px 32px;
                max-width: 460px; width: 100%; text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 3em; margin-bottom: 16px;">🍽️</div>
                <h2 style="font-size: 1.4em; color: #2C3E50; margin-bottom: 12px;">${title}</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">${text}</p>
                
                <button onclick="window.subscriptionManager.startCheckout()" style="
                    background: linear-gradient(135deg, #c9a961, #8b6f47);
                    color: white; border: none; padding: 16px 32px;
                    border-radius: 12px; font-size: 1.05em; font-weight: 700;
                    cursor: pointer; width: 100%; margin-bottom: 12px;
                    box-shadow: 0 4px 16px rgba(139,111,71,0.3);
                ">${btnText}</button>
                
                ${this.status === 'past_due' ? `
                    <button onclick="window.subscriptionManager.openPortal()" style="
                        background: none; border: 1px solid #ddd; padding: 12px 24px;
                        border-radius: 10px; color: #666; cursor: pointer; width: 100%;
                        font-size: 0.95em; margin-bottom: 12px;
                    ">Abo verwalten</button>
                ` : ''}
                
                <div style="margin-top: 16px;">
                    <p style="color: #999; font-size: 0.85em; line-height: 1.5;">
                        ✓ Unbegrenzte Mitarbeiter · ✓ Jederzeit kündbar · ✓ DSGVO-konform
                    </p>
                </div>
                
                <button onclick="logout()" style="
                    background: none; border: none; color: #999;
                    cursor: pointer; margin-top: 16px; font-size: 0.85em;
                ">← Zurück zum Login</button>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    // Abo-Status-Karte in Einstellungen
    getSettingsHTML() {
        let statusHTML = '';

        if (this.status === 'active') {
            const endDate = this.currentPeriodEnd
                ? new Date(this.currentPeriodEnd).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '—';
            statusHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">✓ Aktiv</span>
                </div>
                <p style="color: #666; font-size: 0.9em;">Nächste Abrechnung: ${endDate}</p>
                <button onclick="window.subscriptionManager.openPortal()" class="btn btn-secondary" style="margin-top: 12px;">
                    ⚙️ Abo verwalten / kündigen
                </button>
            `;
        } else if (this.status === 'trial') {
            statusHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">🧪 Testphase</span>
                </div>
                <p style="color: #666; font-size: 0.9em;">Noch <strong>${this.trialDaysLeft} Tag${this.trialDaysLeft !== 1 ? 'e' : ''}</strong> kostenlos testen</p>
                <div style="background: #f0f0f0; border-radius: 8px; height: 6px; margin: 12px 0;">
                    <div style="background: linear-gradient(90deg, #c9a961, #8b6f47); border-radius: 8px; height: 6px; width: ${Math.max(5, 100 - (this.trialDaysLeft / this.TRIAL_DAYS * 100))}%;"></div>
                </div>
                <button onclick="window.subscriptionManager.startCheckout()" class="btn btn-primary" style="margin-top: 8px;">
                    🚀 Jetzt upgraden — €39/Monat
                </button>
            `;
        } else if (this.status === 'past_due') {
            statusHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="background: #F59E0B; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">⚠️ Zahlung ausstehend</span>
                </div>
                <p style="color: #E65100; font-size: 0.9em;">Bitte Zahlungsmethode aktualisieren.</p>
                <button onclick="window.subscriptionManager.openPortal()" class="btn btn-primary" style="margin-top: 12px;">
                    💳 Zahlungsmethode aktualisieren
                </button>
            `;
        } else {
            statusHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="background: #EF4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">✕ Inaktiv</span>
                </div>
                <p style="color: #666; font-size: 0.9em;">Testphase abgelaufen. Upgrade für vollen Zugang.</p>
                <button onclick="window.subscriptionManager.startCheckout()" class="btn btn-primary" style="margin-top: 12px;">
                    🚀 Jetzt upgraden — €39/Monat
                </button>
            `;
        }

        return statusHTML;
    }

    // Lade-Indikator
    showLoading(text) {
        const loader = document.createElement('div');
        loader.id = 'stripe-loader';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); z-index: 10002;
            display: flex; align-items: center; justify-content: center;
        `;
        loader.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 32px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 12px;">⏳</div>
                <p style="color: #333; font-weight: 600;">${text}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('stripe-loader');
        if (loader) loader.remove();
    }
}

// Globale Instanz
window.subscriptionManager = new SubscriptionManager();

console.log('✅ Subscription Manager geladen');
