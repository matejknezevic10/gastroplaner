// ==========================================
// FIRESTORE HELPERS - Alle Collections
// ==========================================

class FirestoreHelpers {
    
    static getTenantId() {
        return TenantStorage.getTenantId();
    }
    
    // ==========================================
    // NOTIZEN
    // ==========================================
    
    static async loadNotizen() {
        const tenantId = this.getTenantId();
        if (!tenantId) return [];
        
        try {
            const snapshot = await db.collection('tenants')
                .doc(tenantId)
                .collection('notizen')
                .get();
            
            const notizen = [];
            snapshot.forEach(doc => {
                notizen.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('📝 Notizen geladen:', notizen.length);
            return notizen;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Notizen:', error);
            return [];
        }
    }
    
    static async createNotiz(notizData) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        const docRef = await db.collection('tenants')
            .doc(tenantId)
            .collection('notizen')
            .add({
                ...notizData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('✅ Notiz erstellt:', docRef.id);
        return docRef.id;
    }
    
    static async updateNotiz(notizId, updates) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        await db.collection('tenants')
            .doc(tenantId)
            .collection('notizen')
            .doc(notizId)
            .update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('✅ Notiz aktualisiert:', notizId);
    }
    
    static async deleteNotiz(notizId) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        await db.collection('tenants')
            .doc(tenantId)
            .collection('notizen')
            .doc(notizId)
            .delete();
        
        console.log('✅ Notiz gelöscht:', notizId);
    }
    
    static async deleteAllNotizen(filterFn = null) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        const snapshot = await db.collection('tenants')
            .doc(tenantId)
            .collection('notizen')
            .get();
        
        const batch = db.batch();
        let count = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!filterFn || filterFn({id: doc.id, ...data})) {
                batch.delete(doc.ref);
                count++;
            }
        });
        
        await batch.commit();
        console.log(`✅ ${count} Notizen gelöscht`);
        return count;
    }
    
    // ==========================================
    // ZEITERFASSUNG
    // ==========================================
    
    static async loadZeiterfassung() {
        const tenantId = this.getTenantId();
        if (!tenantId) return [];
        
        try {
            const snapshot = await db.collection('tenants')
                .doc(tenantId)
                .collection('zeiterfassung')
                .get();
            
            const zeiten = [];
            snapshot.forEach(doc => {
                zeiten.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('⏰ Zeiterfassung geladen:', zeiten.length);
            return zeiten;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Zeiterfassung:', error);
            return [];
        }
    }
    
    static async createZeit(zeitData) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        const docRef = await db.collection('tenants')
            .doc(tenantId)
            .collection('zeiterfassung')
            .add({
                ...zeitData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('✅ Zeit erstellt:', docRef.id);
        return docRef.id;
    }
    
    static async deleteZeit(zeitId) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        await db.collection('tenants')
            .doc(tenantId)
            .collection('zeiterfassung')
            .doc(zeitId)
            .delete();
        
        console.log('✅ Zeit gelöscht:', zeitId);
    }
    
    // ==========================================
    // KASSENSTÄNDE
    // ==========================================
    
    static async loadKassenstände() {
        const tenantId = this.getTenantId();
        if (!tenantId) return [];
        
        try {
            const snapshot = await db.collection('tenants')
                .doc(tenantId)
                .collection('kassenstände')
                .get();
            
            const kassen = [];
            snapshot.forEach(doc => {
                kassen.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('💰 Kassenstände geladen:', kassen.length);
            return kassen;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Kassenstände:', error);
            return [];
        }
    }
    
    static async createKassenstand(kassenData) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        const docRef = await db.collection('tenants')
            .doc(tenantId)
            .collection('kassenstände')
            .add({
                ...kassenData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('✅ Kassenstand erstellt:', docRef.id);
        return docRef.id;
    }
    
    // ==========================================
    // TAUSCH-ANFRAGEN
    // ==========================================
    
    static async loadTauschAnfragen() {
        const tenantId = this.getTenantId();
        if (!tenantId) return [];
        
        try {
            const snapshot = await db.collection('tenants')
                .doc(tenantId)
                .collection('tauschAnfragen')
                .get();
            
            const anfragen = [];
            snapshot.forEach(doc => {
                anfragen.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('🔄 Tausch-Anfragen geladen:', anfragen.length);
            return anfragen;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Tausch-Anfragen:', error);
            return [];
        }
    }
    
    static async createTauschAnfrage(anfrageData) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        const docRef = await db.collection('tenants')
            .doc(tenantId)
            .collection('tauschAnfragen')
            .add({
                ...anfrageData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('✅ Tausch-Anfrage erstellt:', docRef.id);
        return docRef.id;
    }
    
    static async updateTauschAnfrage(anfrageId, updates) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        await db.collection('tenants')
            .doc(tenantId)
            .collection('tauschAnfragen')
            .doc(anfrageId)
            .update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('✅ Tausch-Anfrage aktualisiert:', anfrageId);
    }
    
    static async deleteTauschAnfrage(anfrageId) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new Error('Keine Tenant-ID');
        
        await db.collection('tenants')
            .doc(tenantId)
            .collection('tauschAnfragen')
            .doc(anfrageId)
            .delete();
        
        console.log('✅ Tausch-Anfrage gelöscht:', anfrageId);
    }
}

// Global verfügbar machen
window.FirestoreHelpers = FirestoreHelpers;

console.log('✅ Firestore Helpers geladen!');
