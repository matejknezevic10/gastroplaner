// ==========================================
// FIREBASE MULTI-TENANCY MANAGER
// Jedes Restaurant isoliert - keine gegenseitige Sichtbarkeit
// ==========================================

// ==========================================
// KONFIGURATION
// ==========================================
// Die Firebase Config wird aus js/firebase-config.js geladen
// Falls nicht vorhanden, werden Platzhalter verwendet (funktioniert nicht!)
// 
// SETUP:
// 1. Kopiere js/firebase-config.example.js zu js/firebase-config.js
// 2. Trage deine echten Firebase-Daten ein
// ==========================================

const firebaseConfig = window.FIREBASE_CONFIG || {
    apiKey: "NICHT_KONFIGURIERT",
    authDomain: "NICHT_KONFIGURIERT.firebaseapp.com",
    projectId: "NICHT_KONFIGURIERT",
    storageBucket: "NICHT_KONFIGURIERT.appspot.com",
    messagingSenderId: "000000000000",
    appId: "NICHT_KONFIGURIERT"
};

// ==========================================
// FIREBASE INITIALISIERUNG
// ==========================================

let db;
let currentTenantId = null;

function initFirebase() {
    try {
        // Prüfe ob Config vorhanden
        if (firebaseConfig.apiKey === "NICHT_KONFIGURIERT") {
            console.error('❌ Firebase nicht konfiguriert! Bitte js/firebase-config.js erstellen.');
            return false;
        }
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        console.log('✅ Firebase initialisiert');
        return true;
    } catch (error) {
        console.error('❌ Firebase Initialisierung fehlgeschlagen:', error);
        return false;
    }
}

// ==========================================
// TENANT MANAGEMENT (Isoliert)
// ==========================================

const TenantManager = {
    
    // Genereriere eindeutige Tenant-ID
    generateTenantId() {
        // Format: GASTRO-XXXXX (5 Zeichen: Buchstaben + Zahlen)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Ohne 0, O, I, 1 (Verwechslungsgefahr)
        let id = 'GASTRO-';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },
    
    // Neues Restaurant registrieren
    async registerTenant(registrationData) {
        try {
            // Geneneriere Tenant-ID
            const tenantId = this.generateTenantId();
            
            // Prüfe ob ID bereits existiert (sehr unwahrscheinlich)
            const existingDoc = await db.collection('tenants').doc(tenantId).get();
            if (existingDoc.exists) {
                // Rekursiv neue ID generieren
                return await this.registerTenant(registrationData);
            }
            
            // Erstelle Tenant-Dokument
            await db.collection('tenants').doc(tenantId).set({
                restaurantName: registrationData.restaurantName,
                adminPin: registrationData.adminPin,
                contactEmail: registrationData.contactEmail || '',
                contactPhone: registrationData.contactPhone || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true,
                // Weitere Metadaten OHNE sensitive Daten
                metadata: {
                    employeeCount: 0,
                    version: '1.0'
                }
            });
            
            // Erstelle Demo-Daten für neuen Tenant
            await this.createInitialData(tenantId);
            
            // Speichere Tenant-ID lokal
            this.setTenant(tenantId);
            
            console.log('✅ Tenant registriert:', tenantId);
            return { 
                success: true, 
                tenantId,
                message: `Restaurant erfolgreich registriert!\n\nIhre Restaurant-ID: ${tenantId}\n\n⚠️ WICHTIG: Bewahren Sie diese ID sicher auf! Sie wird für den Zugang benötigt.`
            };
        } catch (error) {
            console.error('❌ Fehler bei Registrierung:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Tenant-Zugang validieren
    async validateTenant(tenantId, adminPin) {
        try {
            const doc = await db.collection('tenants').doc(tenantId).get();
            
            if (!doc.exists) {
                return { 
                    success: false, 
                    error: 'Restaurant-ID nicht gefunden' 
                };
            }
            
            const data = doc.data();
            
            if (!data.isActive) {
                return { 
                    success: false, 
                    error: 'Restaurant-Zugang deaktiviert' 
                };
            }
            
            if (data.adminPin !== adminPin) {
                return { 
                    success: false, 
                    error: 'Falscher Admin-PIN' 
                };
            }
            
            // Erfolgreicher Login
            this.setTenant(tenantId);
            
            // Update: Letzter Zugriff
            await db.collection('tenants').doc(tenantId).update({
                lastAccess: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { 
                success: true,
                restaurantName: data.restaurantName
            };
        } catch (error) {
            console.error('❌ Validierungsfehler:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Aktuellen Tenant setzen
    setTenant(tenantId) {
        currentTenantId = tenantId;
        localStorage.setItem('tenantId', tenantId);
        console.log('🏪 Tenant gesetzt:', tenantId);
    },
    
    // Aktuellen Tenant laden
    getTenant() {
        if (!currentTenantId) {
            currentTenantId = localStorage.getItem('tenantId');
        }
        return currentTenantId;
    },
    
    // Tenant-Daten aktualisieren (nur eigene)
    async updateTenantSettings(updates) {
        try {
            const tenantId = this.getTenant();
            if (!tenantId) {
                throw new Error('Kein Tenant ausgewählt');
            }
            
            // Nur erlaubte Felder updaten
            const allowedUpdates = {};
            const allowedFields = ['restaurantName', 'contactEmail', 'contactPhone', 'adminPin'];
            
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    allowedUpdates[key] = updates[key];
                }
            });
            
            allowedUpdates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('tenants').doc(tenantId).update(allowedUpdates);
            
            return { success: true };
        } catch (error) {
            console.error('❌ Update-Fehler:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Initial-Daten für neuen Tenant
    async createInitialData(tenantId) {
        const batch = db.batch();
        
        // Demo-Mitarbeiter
        const mitarbeiterRef = db.collection('tenants').doc(tenantId).collection('mitarbeiter');
        batch.set(mitarbeiterRef.doc(), {
            id: 1,
            name: 'Anna Müller',
            position: 'Kellner/in',
            telefon: '+43 664 1234567',
            pin: '1111',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        batch.set(mitarbeiterRef.doc(), {
            id: 2,
            name: 'Max Weber',
            position: 'Koch',
            telefon: '+43 664 7654321',
            pin: '2222',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Demo-Lagerbestand
        const lagerRef = db.collection('tenants').doc(tenantId).collection('lager');
        const lagerItems = [
            { id: 1, name: 'Cola', status: 'ok' },
            { id: 2, name: 'Fanta', status: 'niedrig' },
            { id: 3, name: 'Sprite', status: 'leer' },
            { id: 4, name: 'Bier', status: 'ok' }
        ];
        
        lagerItems.forEach(item => {
            batch.set(lagerRef.doc(), {
                ...item,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        // Checklist
        const settingsRef = db.collection('tenants').doc(tenantId).collection('settings');
        batch.set(settingsRef.doc('checklist'), {
            items: ['Kasse zählen', 'Tische abwischen', 'Küche aufräumen']
        });
        
        await batch.commit();
        console.log('✅ Initial-Daten erstellt für:', tenantId);
    },
    
    // Logout
    logout() {
        currentTenantId = null;
        localStorage.removeItem('tenantId');
        console.log('👋 Tenant-Session beendet');
    }
};

// ==========================================
// DATENBANK OPERATIONEN (Tenant-isoliert)
// ==========================================

const TenantDatabase = {
    
    // Collection-Referenz (automatisch tenant-isoliert)
    getCollection(collectionName) {
        const tenantId = TenantManager.getTenant();
        if (!tenantId) {
            throw new Error('❌ Kein Tenant-Zugang! Bitte einloggen.');
        }
        return db.collection('tenants').doc(tenantId).collection(collectionName);
    },
    
    // CREATE
    async create(collectionName, data) {
        try {
            const ref = this.getCollection(collectionName);
            const docRef = await ref.add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ ${collectionName} erstellt:`, docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error(`❌ Create-Fehler:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // READ ALL
    async readAll(collectionName) {
        try {
            const snapshot = await this.getCollection(collectionName).get();
            const items = [];
            
            snapshot.forEach(doc => {
                items.push({ 
                    _firebaseId: doc.id,
                    ...doc.data() 
                });
            });
            
            console.log(`✅ ${collectionName} geladen:`, items.length);
            return { success: true, items };
        } catch (error) {
            console.error(`❌ Read-Fehler:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // READ ONE
    async readOne(collectionName, docId) {
        try {
            const doc = await this.getCollection(collectionName).doc(docId).get();
            
            if (!doc.exists) {
                return { success: false, error: 'Dokument nicht gefunden' };
            }
            
            return { 
                success: true, 
                item: { _firebaseId: doc.id, ...doc.data() }
            };
        } catch (error) {
            console.error(`❌ Read-Fehler:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // UPDATE
    async update(collectionName, docId, data) {
        try {
            await this.getCollection(collectionName).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ ${collectionName} aktualisiert:`, docId);
            return { success: true };
        } catch (error) {
            console.error(`❌ Update-Fehler:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // DELETE
    async delete(collectionName, docId) {
        try {
            await this.getCollection(collectionName).doc(docId).delete();
            console.log(`✅ ${collectionName} gelöscht:`, docId);
            return { success: true };
        } catch (error) {
            console.error(`❌ Delete-Fehler:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // BATCH WRITE (für mehrere Operationen)
    async batchWrite(operations) {
        try {
            const batch = db.batch();
            
            operations.forEach(op => {
                const ref = this.getCollection(op.collection).doc(op.docId || undefined);
                
                switch(op.type) {
                    case 'set':
                        batch.set(ref, op.data);
                        break;
                    case 'update':
                        batch.update(ref, op.data);
                        break;
                    case 'delete':
                        batch.delete(ref);
                        break;
                }
            });
            
            await batch.commit();
            console.log(`✅ Batch-Operation erfolgreich (${operations.length} ops)`);
            return { success: true };
        } catch (error) {
            console.error('❌ Batch-Fehler:', error);
            return { success: false, error: error.message };
        }
    },
    
    // REALTIME LISTENER
    onSnapshot(collectionName, callback) {
        return this.getCollection(collectionName).onSnapshot(snapshot => {
            const items = [];
            snapshot.forEach(doc => {
                items.push({ _firebaseId: doc.id, ...doc.data() });
            });
            callback(items);
        }, error => {
            console.error('❌ Snapshot-Fehler:', error);
        });
    }
};

// ==========================================
// SYNC MANAGER (LocalStorage <-> Firebase)
// ==========================================

const TenantSync = {
    
    // Von Firebase laden und in localStorage speichern
    async syncFromFirebase(collectionName, localStorageKey) {
        try {
            const result = await TenantDatabase.readAll(collectionName);
            
            if (result.success) {
                // Speichere MIT _firebaseId damit wir später eindeutig zuordnen können!
                localStorage.setItem(localStorageKey, JSON.stringify(result.items));
                console.log(`✅ ${collectionName} synchronisiert: ${result.items.length} items (mit Firebase-IDs)`);
                return result.items;
            }
            
            return [];
        } catch (error) {
            console.error('❌ Sync-Fehler:', error);
            return [];
        }
    },
    
    // Von localStorage zu Firebase hochladen (SICHER - Intelligenter Merge)
    async syncToFirebase(collectionName, localStorageKey) {
        try {
            const localData = localStorage.getItem(localStorageKey);
            
            // Wenn localStorage leer ist, NICHT löschen!
            if (!localData || localData === '[]' || localData === 'null') {
                console.log(`⏭️ ${collectionName}: localStorage leer - Skip upload`);
                return { success: true };
            }
            
            const items = JSON.parse(localData);
            
            if (items.length === 0) {
                console.log(`⏭️ ${collectionName}: Keine Items - Skip upload`);
                return { success: true };
            }
            
            // Lade existierende Firebase-Daten
            const existingSnapshot = await TenantDatabase.getCollection(collectionName).get();
            const existingItems = [];
            
            existingSnapshot.forEach(doc => {
                existingItems.push({
                    docId: doc.id,
                    data: doc.data()
                });
            });
            
            const batch = db.batch();
            let updateCount = 0;
            let createCount = 0;
            let deleteCount = 0;
            
            // Merge: Vergleiche Items intelligent
            items.forEach(localItem => {
                // Suche passendes Item in Firebase
                // PRIORITÄT 1: Nach _firebaseId (falls vorhanden)
                // PRIORITÄT 2: Nach Name/ID als Fallback
                const matchingFirebaseItem = existingItems.find(fbItem => {
                    // Wenn localStorage-Item eine Firebase-ID hat, verwende diese!
                    if (localItem._firebaseId) {
                        return fbItem.docId === localItem._firebaseId;
                    }
                    
                    // Fallback: Vergleiche nach Name/ID
                    if (collectionName === 'mitarbeiter') {
                        return fbItem.data.name === localItem.name;
                    }
                    if (collectionName === 'lager') {
                        return fbItem.data.name === localItem.name;
                    }
                    return fbItem.data.id === localItem.id;
                });
                
                if (matchingFirebaseItem) {
                    // UPDATE: Item existiert bereits
                    const docRef = TenantDatabase.getCollection(collectionName).doc(matchingFirebaseItem.docId);
                    const { _firebaseId, ...cleanData } = localItem;
                    batch.update(docRef, {
                        ...cleanData,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    updateCount++;
                } else {
                    // CREATE: Neues Item
                    const docRef = TenantDatabase.getCollection(collectionName).doc();
                    const { _firebaseId, ...cleanData } = localItem;
                    batch.set(docRef, {
                        ...cleanData,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    createCount++;
                }
            });
            
            // DELETE-DETECTION: Lösche Items die in Firebase sind aber nicht mehr in localStorage
            existingItems.forEach(fbItem => {
                // Suche ob dieses Firebase-Item noch in localStorage existiert
                const stillExists = items.find(localItem => {
                    // PRIORITÄT 1: Vergleich nach _firebaseId
                    if (localItem._firebaseId) {
                        return localItem._firebaseId === fbItem.docId;
                    }
                    
                    // Fallback: Vergleich nach Name/ID
                    if (collectionName === 'mitarbeiter') {
                        return localItem.name === fbItem.data.name;
                    }
                    if (collectionName === 'lager') {
                        return localItem.name === fbItem.data.name;
                    }
                    return localItem.id === fbItem.data.id;
                });
                
                if (!stillExists) {
                    // DELETE: Item existiert nicht mehr in localStorage
                    const docRef = TenantDatabase.getCollection(collectionName).doc(fbItem.docId);
                    batch.delete(docRef);
                    deleteCount++;
                    console.log(`🗑️ Lösche: ${fbItem.data.name || fbItem.data.id} (Firebase-ID: ${fbItem.docId})`);
                }
            });
            
            if (updateCount > 0 || createCount > 0 || deleteCount > 0) {
                await batch.commit();
                console.log(`✅ ${collectionName}: ${createCount} neu, ${updateCount} aktualisiert, ${deleteCount} gelöscht`);
            } else {
                console.log(`⏭️ ${collectionName}: Keine Änderungen`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Upload-Fehler:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Alle Collections synchronisieren
    async syncAll() {
        const collections = [
            { name: 'mitarbeiter', key: 'gastro-mitarbeiter' },
            { name: 'schichten', key: 'gastro-schichten' },
            { name: 'notizen', key: 'gastro-notizen' },
            { name: 'lager', key: 'gastro-lager' },
            { name: 'zeiterfassung', key: 'gastro-zeiterfassung' },
            { name: 'kassenstände', key: 'gastro-kassenstände' },
            { name: 'tauschAnfragen', key: 'gastro-tausch-anfragen' }
        ];
        
        for (const col of collections) {
            await this.syncFromFirebase(col.name, col.key);
        }
        
        console.log('✅ Alle Daten synchronisiert!');
    },
    
    // Auto-Sync aktivieren (alle 5 Minuten)
    startAutoSync(intervalMinutes = 5) {
        setInterval(() => {
            console.log('🔄 Auto-Sync läuft...');
            this.syncAll();
        }, intervalMinutes * 60 * 1000);
        
        console.log(`✅ Auto-Sync aktiviert (alle ${intervalMinutes} Min)`);
    }
};

// ==========================================
// EXPORT & AUTO-INIT
// ==========================================

if (typeof firebase !== 'undefined') {
    initFirebase();
}

console.log('🔥 Firebase Multi-Tenancy Manager geladen!');
console.log('📋 Verfügbare Manager:');
console.log('  - TenantManager: Tenant-Verwaltung (isoliert)');
console.log('  - TenantDatabase: CRUD Operationen (tenant-spezifisch)');
console.log('  - TenantSync: LocalStorage <-> Firebase Sync');
