// Extrahiertes JavaScript
        // Daten mit sicherer Fehlerbehandlung
        let mitarbeiter = [];
        let schichten = [];
        let notizen = [];
        let lagerBestand = [];
        let checklistItems = [];
        let zeiterfassung = [];
        let tagesCheckliste = {};
        
        try {
            mitarbeiter = JSON.parse(localStorage.getItem('gastro-mitarbeiter') || '[]');
        } catch(e) {
            console.error('Fehler beim Laden der Mitarbeiter:', e);
            mitarbeiter = [];
        }
        
        try {
            schichten = JSON.parse(localStorage.getItem('gastro-schichten') || '[]');
        } catch(e) {
            console.error('Fehler beim Laden der Schichten:', e);
            schichten = [];
        }
        
        try {
            notizen = JSON.parse(localStorage.getItem('gastro-notizen') || '[]');
        } catch(e) {
            console.error('Fehler beim Laden der Notizen:', e);
            notizen = [];
        }
        
        try {
            lagerBestand = JSON.parse(localStorage.getItem('gastro-lager') || '[]');
        } catch(e) {
            console.error('Fehler beim Laden des Lagers:', e);
            lagerBestand = [];
        }
        
        try {
            checklistItems = JSON.parse(localStorage.getItem('gastro-checklist') || '["Kasse zählen", "Tische abwischen", "Küche aufräumen"]');
        } catch(e) {
            console.error('Fehler beim Laden der Checkliste:', e);
            checklistItems = ["Kasse zählen", "Tische abwischen", "Küche aufräumen"];
        }
        
        try {
            zeiterfassung = JSON.parse(localStorage.getItem('gastro-zeiterfassung') || '[]');
        } catch(e) {
            console.error('Fehler beim Laden der Zeiterfassung:', e);
            zeiterfassung = [];
        }
        
        try {
            tagesCheckliste = JSON.parse(localStorage.getItem('gastro-tages-checklist') || '{}');
        } catch(e) {
            console.error('Fehler beim Laden der Tages-Checkliste:', e);
            tagesCheckliste = {};
        }
        
        let adminPin = localStorage.getItem('gastro-admin-pin') || '1234';
        let loggedInMitarbeiter = null;
        let currentLagerItemId = null;
        let stempelStatus = null;
        let currentNotizId = null;
        let schichtGestartet = false;
        let schichtChecklistStatus = {};
        let kassenstände = JSON.parse(localStorage.getItem('gastro-kassenstände') || '[]');
        let tauschAnfragen = JSON.parse(localStorage.getItem('gastro-tausch-anfragen') || '[]');

        // Init
        function init() {
            // Demo-Daten erstellen falls leer
            if (mitarbeiter.length === 0) {
                mitarbeiter = [
                    {id: 1, name: 'Anna Müller', position: 'Kellner/in', telefon: '+43 664 1234567', pin: '1111'},
                    {id: 2, name: 'Max Weber', position: 'Koch', telefon: '+43 664 7654321', pin: '2222'}
                ];
                localStorage.setItem('gastro-mitarbeiter', JSON.stringify(mitarbeiter));
            }

            if (lagerBestand.length === 0) {
                lagerBestand = [
                    {id: 1, name: 'Cola', status: 'ok'},
                    {id: 2, name: 'Fanta', status: 'niedrig'},
                    {id: 3, name: 'Sprite', status: 'leer'},
                    {id: 4, name: 'Bier', status: 'ok'},
                    {id: 5, name: 'Wein', status: 'niedrig'},
                    {id: 6, name: 'Kaffee', status: 'ok'}
                ];
                localStorage.setItem('gastro-lager', JSON.stringify(lagerBestand));
            }

            updateMitarbeiterSelect();
            startClock();
        }

        // Uhr für Stempeluhr
        function startClock() {
            updateClock();
            setInterval(updateClock, 1000);
        }

        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
            const dateStr = now.toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'});
            
            const timeEl = document.getElementById('aktuelle-uhrzeit');
            const dateEl = document.getElementById('aktuelles-datum');
            
            if (timeEl) timeEl.textContent = timeStr;
            if (dateEl) dateEl.textContent = dateStr;
        }

        // Hilfsfunktion für Initialen
        function getInitials(name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase();
        }

        // Login Functions
        // Login Functions
        function showAdminLogin() {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('admin-login-screen').classList.remove('hidden');
        }

        function showMitarbeiterLogin() {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('mitarbeiter-login-screen').classList.remove('hidden');
        }

        function backToMain() {
            document.getElementById('admin-login-screen').classList.add('hidden');
            document.getElementById('mitarbeiter-login-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        }

        function loginAdmin(e) {
            e.preventDefault();
            const pin = document.getElementById('admin-pin').value;
            if (pin === adminPin) {
                document.getElementById('admin-login-screen').classList.add('hidden');
                document.getElementById('admin-content').classList.remove('hidden');
                updateAdminUI();
                // Statistik initialisieren
                updateStatistik();
            } else {
                alert('❌ Falscher PIN!');
            }
        }

        function loginMitarbeiter(e) {
            e.preventDefault();
            const maId = parseInt(document.getElementById('mitarbeiter-select').value);
            const pin = document.getElementById('mitarbeiter-pin').value;
            const ma = mitarbeiter.find(m => m.id === maId);
            
            if (ma && ma.pin === pin) {
                loggedInMitarbeiter = ma;
                document.getElementById('mitarbeiter-login-screen').classList.add('hidden');
                document.getElementById('mitarbeiter-content').classList.remove('hidden');
                updateMitarbeiterUI();
                // Setze Standarddatum für manuelle Zeiterfassung
                const manuelDatum = document.getElementById('manuel-datum');
                if (manuelDatum) {
                    manuelDatum.value = new Date().toISOString().split('T')[0];
                }
            } else {
                alert('❌ Falscher PIN!');
            }
        }

        function logout() {
            loggedInMitarbeiter = null;
            stempelStatus = null;
            document.getElementById('admin-content').classList.add('hidden');
            document.getElementById('mitarbeiter-content').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('admin-pin').value = '';
            document.getElementById('mitarbeiter-pin').value = '';
        }

        // Navigation
        function showSection(sectionId, eventObj) {
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            if (eventObj) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                eventObj.target.closest('.nav-item').classList.add('active');
            }

            // Quick-Add Button nur im Plan-Tab zeigen
            const quickAddBtn = document.querySelector('.quick-add-btn');
            if (quickAddBtn) {
                if (sectionId === 'admin-wochenplan') {
                    quickAddBtn.style.display = 'flex';
                } else {
                    quickAddBtn.style.display = 'none';
                }
            }

            // Bei Team-Tab zur Übersicht springen
            if (sectionId === 'admin-team') {
                switchTeamTab('team-uebersicht');
            }
        }

        function switchTeamTab(tabId) {
            // Tabs umschalten
            document.querySelectorAll('.team-tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Buttons umschalten
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            if (tabId === 'team-uebersicht') {
                document.getElementById('tab-uebersicht').classList.add('active');
            } else if (tabId === 'team-neu') {
                document.getElementById('tab-neu').classList.add('active');
            } else if (tabId === 'team-zeit') {
                document.getElementById('tab-zeit').classList.add('active');
            }
        }

        function switchKommTab(tabId) {
            // Tabs umschalten
            document.querySelectorAll('.komm-tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Buttons umschalten
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            if (tabId === 'komm-notizen') {
                document.getElementById('tab-komm-notizen').classList.add('active');
                updateNotizenListe();
            } else if (tabId === 'komm-benachrichtigungen') {
                document.getElementById('tab-komm-benachrichtigungen').classList.add('active');
                updateBenachrichtigungen();
            }
        }

        // Schicht-Funktionen
        function schichtAktion() {
            const heute = new Date().toISOString().split('T')[0];
            
            if (!schichtGestartet) {
                // Prüfe ob Mitarbeiter heute Schicht hat
                const heuteSchicht = schichten.find(s => 
                    s.mitarbeiterId === loggedInMitarbeiter.id && 
                    s.datum === heute
                );
                
                if (!heuteSchicht) {
                    alert('❌ Du hast heute keine Schicht eingeplant!');
                    return;
                }
                
                // Prüfe ob Schicht heute bereits gestartet wurde
                const schichtKey = `schicht-gestartet-${loggedInMitarbeiter.id}-${heute}`;
                if (localStorage.getItem(schichtKey)) {
                    alert('❌ Du hast deine Schicht heute bereits gestartet!');
                    schichtGestartet = true;
                    updateSchichtButton();
                    return;
                }
                
                // Schicht starten
                localStorage.setItem(schichtKey, 'true');
                schichtGestartet = true;
                updateSchichtButton();
                alert('✅ Schicht gestartet!');
            } else {
                // Schicht beenden - Modal öffnen
                openSchichtBeendenModal();
            }
        }

        function updateSchichtButton() {
            const button = document.getElementById('schicht-button');
            const text = document.getElementById('schicht-button-text');
            const statusText = document.getElementById('schicht-status-text');
            
            if (!button) return;
            
            const heute = new Date().toISOString().split('T')[0];
            
            // Prüfe ob Schicht bereits gestartet wurde
            const schichtKey = `schicht-gestartet-${loggedInMitarbeiter.id}-${heute}`;
            if (localStorage.getItem(schichtKey)) {
                schichtGestartet = true;
            }
            
            // Prüfe ob heute Schicht
            const heuteSchicht = schichten.find(s => 
                s.mitarbeiterId === loggedInMitarbeiter.id && 
                s.datum === heute
            );
            
            if (!heuteSchicht && !schichtGestartet) {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
                button.className = 'stempel-btn einstempeln';
                text.innerHTML = '❌ Keine Schicht heute';
                statusText.innerHTML = 'Du hast heute keine Schicht eingeplant';
                return;
            }
            
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            
            if (schichtGestartet) {
                button.className = 'stempel-btn ausstempeln';
                text.innerHTML = '⏹️ Schicht beenden';
                statusText.innerHTML = '✅ Schicht läuft';
            } else {
                button.className = 'stempel-btn einstempeln';
                text.innerHTML = '▶️ Schicht starten';
                statusText.innerHTML = 'Schicht nicht gestartet';
            }
        }

        function openSchichtBeendenModal() {
            // Checkliste für Modal vorbereiten
            const checklistContainer = document.getElementById('schicht-beenden-checklist');
            schichtChecklistStatus = {};
            
            checklistContainer.innerHTML = checklistItems.map((item, i) => {
                schichtChecklistStatus[i] = false;
                return `
                    <div class="checklist-item" onclick="toggleSchichtChecklistItem(${i})" id="schicht-check-${i}">
                        <div class="checklist-checkbox"></div>
                        <div class="checklist-text">${item}</div>
                    </div>
                `;
            }).join('');
            
            document.getElementById('schicht-beenden-modal').classList.add('active');
            updateSchichtBeendenButton();
        }

        function toggleSchichtChecklistItem(index) {
            schichtChecklistStatus[index] = !schichtChecklistStatus[index];
            const item = document.getElementById(`schicht-check-${index}`);
            
            if (schichtChecklistStatus[index]) {
                item.classList.add('erledigt');
                item.querySelector('.checklist-checkbox').innerHTML = '✓';
            } else {
                item.classList.remove('erledigt');
                item.querySelector('.checklist-checkbox').innerHTML = '';
            }
            
            updateSchichtBeendenButton();
        }

        function updateSchichtBeendenButton() {
            const alleErledigt = Object.keys(schichtChecklistStatus).length === checklistItems.length &&
                                  Object.values(schichtChecklistStatus).every(v => v === true);
            
            const button = document.getElementById('schicht-beenden-btn');
            button.disabled = !alleErledigt;
            
            if (alleErledigt) {
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            } else {
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            }
        }

        // Tausch-Funktionen
        let currentTauschSchichtId = null;

        function openTauschModal(schichtId) {
            currentTauschSchichtId = schichtId;
            const schicht = schichten.find(s => s.id == schichtId);
            if (!schicht) return;
            
            const datum = new Date(schicht.datum).toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
            });
            const typText = schicht.typ === 'frueh' ? 'Frühschicht' : 'Spätschicht';
            
            document.getElementById('tausch-info').innerHTML = `
                <strong>Du möchtest diese Schicht weggeben:</strong><br>
                ${datum} - ${typText}
            `;
            
            // Mitarbeiter-Auswahl (ohne sich selbst)
            const select = document.getElementById('tausch-mitarbeiter');
            select.innerHTML = '<option value="">Bitte wählen...</option>' + 
                mitarbeiter
                    .filter(m => m.id !== loggedInMitarbeiter.id)
                    .map(m => `<option value="${m.id}">${m.name} - ${m.position}</option>`)
                    .join('');
            
            // Reset Schicht-Auswahl
            document.getElementById('tausch-schicht-gruppe').style.display = 'none';
            document.getElementById('tausch-angebot-schicht').innerHTML = '<option value="">Bitte wählen...</option>';
            
            document.getElementById('tausch-modal').classList.add('active');
        }

        function updateTauschSchichten() {
            const zielMitarbeiterId = parseInt(document.getElementById('tausch-mitarbeiter').value);
            if (!zielMitarbeiterId) {
                document.getElementById('tausch-schicht-gruppe').style.display = 'none';
                return;
            }
            
            // Zeige Schichten des Ziel-Mitarbeiters
            const heute = new Date().toISOString().split('T')[0];
            const zielSchichten = schichten.filter(s => 
                s.mitarbeiterId === zielMitarbeiterId && 
                s.datum >= heute
            );
            
            const select = document.getElementById('tausch-angebot-schicht');
            
            if (zielSchichten.length === 0) {
                select.innerHTML = '<option value="">Keine zukünftigen Schichten verfügbar</option>';
                document.getElementById('tausch-schicht-gruppe').style.display = 'block';
                return;
            }
            
            select.innerHTML = '<option value="">Bitte wählen...</option>' + 
                zielSchichten.map(s => {
                    const datum = new Date(s.datum).toLocaleDateString('de-DE', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit'
                    });
                    const typText = s.typ === 'frueh' ? 'Früh' : 'Spät';
                    return `<option value="${s.id}">${datum} - ${typText}</option>`;
                }).join('');
            
            document.getElementById('tausch-schicht-gruppe').style.display = 'block';
        }

        function updateTauschAnfragen() {
            const meineAnfragen = tauschAnfragen.filter(t => 
                t.zielMitarbeiterId === loggedInMitarbeiter.id && 
                t.status === 'ausstehend'
            );
            
            const badge = document.getElementById('tausch-badge');
            const card = document.getElementById('tausch-anfragen-card');
            const liste = document.getElementById('tausch-anfragen-liste');
            
            if (meineAnfragen.length === 0) {
                badge.style.display = 'none';
                card.style.display = 'none';
                return;
            }
            
            badge.style.display = 'block';
            badge.textContent = meineAnfragen.length;
            card.style.display = 'block';
            
            liste.innerHTML = meineAnfragen.map(anfrage => {
                const schichtAbsender = schichten.find(s => s.id == anfrage.schichtId);
                const schichtAngebot = schichten.find(s => s.id == anfrage.angebotSchichtId);
                const absender = mitarbeiter.find(m => m.id == anfrage.absenderId);
                
                if (!schichtAbsender || !schichtAngebot || !absender) return '';
                
                const datumAbsender = new Date(schichtAbsender.datum).toLocaleDateString('de-DE', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit'
                });
                const typTextAbsender = schichtAbsender.typ === 'frueh' ? 'Früh' : 'Spät';
                
                const datumAngebot = new Date(schichtAngebot.datum).toLocaleDateString('de-DE', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit'
                });
                const typTextAngebot = schichtAngebot.typ === 'frueh' ? 'Früh' : 'Spät';
                
                return `
                    <div class="list-item" style="flex-direction: column; align-items: stretch;">
                        <div class="list-item-info">
                            <strong>🔄 Tausch-Anfrage von ${absender.name}</strong>
                            <div style="margin-top: 12px; background: white; padding: 12px; border-radius: 8px;">
                                <p style="margin: 0; color: #333;">
                                    <strong>Du gibst ab:</strong> ${datumAngebot} - ${typTextAngebot}<br>
                                    <strong>Du bekommst:</strong> ${datumAbsender} - ${typTextAbsender}
                                </p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn btn-primary" onclick="akzeptiereTausch('${anfrage.id}')" style="flex: 1;">✅ Akzeptieren</button>
                            <button class="btn btn-secondary" onclick="lehneTauschAb('${anfrage.id}')" style="flex: 1;">❌ Ablehnen</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function akzeptiereTausch(anfrageId) {
            const anfrage = tauschAnfragen.find(a => a.id == anfrageId);
            if (!anfrage) return;
            
            const schichtAbsender = schichten.find(s => s.id == anfrage.schichtId);
            const schichtZiel = schichten.find(s => s.id == anfrage.angebotSchichtId);
            
            if (!schichtAbsender || !schichtZiel) return;
            
            // Schichten tauschen
            const tempMitarbeiterId = schichtAbsender.mitarbeiterId;
            schichtAbsender.mitarbeiterId = schichtZiel.mitarbeiterId;
            schichtZiel.mitarbeiterId = tempMitarbeiterId;
            
            // Status aktualisieren
            anfrage.status = 'akzeptiert';
            
            // Speichern
            localStorage.setItem('gastro-schichten', JSON.stringify(schichten));
            localStorage.setItem('gastro-tausch-anfragen', JSON.stringify(tauschAnfragen));
            
            // Benachrichtigung an Admin
            const absender = mitarbeiter.find(m => m.id == anfrage.absenderId);
            const ziel = mitarbeiter.find(m => m.id == anfrage.zielMitarbeiterId);
            
            const datumAbsender = new Date(schichtAbsender.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'});
            const datumZiel = new Date(schichtZiel.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'});
            
            const notiz = {
                id: Date.now(),
                typ: 'benachrichtigung',
                betreff: 'Schichttausch durchgeführt',
                text: `${absender.name} und ${ziel.name} haben ihre Schichten getauscht:\n• ${absender.name}: ${datumAbsender} → ${datumZiel}\n• ${ziel.name}: ${datumZiel} → ${datumAbsender}`,
                mitarbeiterId: anfrage.absenderId,
                mitarbeiterName: absender.name,
                datum: new Date().toISOString(),
                antwort: null,
                antwortDatum: null
            };
            notizen.push(notiz);
            localStorage.setItem('gastro-notizen', JSON.stringify(notizen));
            
            updateTauschAnfragen();
            updateMitarbeiterCalendar();
            alert('✅ Tausch akzeptiert! Der Dienstplan wurde aktualisiert.');
        }

        function lehneTauschAb(anfrageId) {
            const anfrage = tauschAnfragen.find(a => a.id == anfrageId);
            if (!anfrage) return;
            
            anfrage.status = 'abgelehnt';
            localStorage.setItem('gastro-tausch-anfragen', JSON.stringify(tauschAnfragen));
            
            updateTauschAnfragen();
            alert('❌ Tausch-Anfrage abgelehnt.');
        }

        function showMitarbeiterSection(sectionId, eventObj) {
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            if (eventObj) {
                document.querySelectorAll('#mitarbeiter-nav .nav-item').forEach(item => item.classList.remove('active'));
                eventObj.target.closest('.nav-item').classList.add('active');
            }

            // Update spezifische Sections
            if (sectionId === 'mitarbeiter-plan') {
                updateMitarbeiterCalendar();
            } else if (sectionId === 'mitarbeiter-schicht') {
                updateMeineSchichten();
                updateSchichtButton();
            } else if (sectionId === 'mitarbeiter-zeiten') {
                updateMeineZeiten();
            } else if (sectionId === 'mitarbeiter-lager') {
                updateMitarbeiterLagerGrid();
            } else if (sectionId === 'mitarbeiter-notizen') {
                updateMeineNotizen();
                updateTauschAnfragen();
            }
        }

        // Modal Functions
        function openQuickAddModal() {
            document.getElementById('quick-add-modal').classList.add('active');
            document.getElementById('quick-datum').value = new Date().toISOString().split('T')[0];
            updateQuickAddSelect();
        }

        function openLagerModal() {
            document.getElementById('lager-modal').classList.add('active');
        }

        function openEditMitarbeiterModal(id) {
            const ma = mitarbeiter.find(m => m.id === id);
            if (ma) {
                document.getElementById('edit-ma-id').value = ma.id;
                document.getElementById('edit-ma-name').value = ma.name;
                document.getElementById('edit-ma-position').value = ma.position;
                document.getElementById('edit-ma-telefon').value = ma.telefon;
                document.getElementById('edit-ma-pin').value = ma.pin;
                document.getElementById('edit-mitarbeiter-modal').classList.add('active');
            }
        }

        function openZeitModal() {
            document.getElementById('zeit-modal').classList.add('active');
            document.getElementById('zeit-datum').value = new Date().toISOString().split('T')[0];
            updateZeitSelect();
        }

        function openLagerStatusModal(itemId) {
            currentLagerItemId = itemId;
            const item = lagerBestand.find(l => l.id === itemId);
            if (item) {
                document.getElementById('lager-item-name').textContent = item.name;
                document.getElementById('lager-status-modal').classList.add('active');
            }
        }

        function openAntwortModal(notizId) {
            currentNotizId = notizId;
            const notiz = notizen.find(n => n.id === notizId);
            if (notiz) {
                const typIcons = {
                    'info': 'ℹ️',
                    'frage': '❓',
                    'problem': '⚠️',
                    'idee': '💡'
                };
                const icon = typIcons[notiz.typ] || '💬';
                
                document.getElementById('original-betreff').textContent = icon + ' ' + notiz.betreff;
                document.getElementById('original-text').textContent = notiz.text;
                document.getElementById('original-autor').textContent = `Von ${notiz.mitarbeiterName} am ${new Date(notiz.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}`;
                document.getElementById('antwort-modal').classList.add('active');
            }
        }

        function saveLagerStatus(newStatus) {
            if (currentLagerItemId) {
                const item = lagerBestand.find(l => l.id === currentLagerItemId);
                if (item) {
                    item.status = newStatus;
                    localStorage.setItem('gastro-lager', JSON.stringify(lagerBestand));
                    updateMitarbeiterLagerGrid();
                    updateEinkaufsliste();
                    closeModal('lager-status-modal');
                    
                    // Benachrichtigung erstellen
                    const notiz = {
                        id: Date.now(),
                        typ: 'benachrichtigung',
                        betreff: 'Lagerbestand gemeldet',
                        text: `${item.name}: Status auf "${getStatusText(newStatus)}" geändert`,
                        mitarbeiterId: loggedInMitarbeiter.id,
                        mitarbeiterName: loggedInMitarbeiter.name,
                        datum: new Date().toISOString(),
                        antwort: null,
                        antwortDatum: null
                    };
                    notizen.push(notiz);
                    localStorage.setItem('gastro-notizen', JSON.stringify(notizen));
                    
                    alert('✅ Status aktualisiert!');
                }
            }
        }

        function getStatusText(status) {
            switch(status) {
                case 'ok': return 'Genügend vorhanden';
                case 'niedrig': return 'Bald nachbestellen';
                case 'leer': return 'Sofort einkaufen';
                default: return status;
            }
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Stempeluhr Funktionen
        // Manuelle Zeiterfassung
        function updateMeineZeiten() {
            const liste = document.getElementById('meine-zeiten-liste');
            if (!liste) return;
            
            const meineZeiten = zeiterfassung.filter(z => 
                z.mitarbeiterId === loggedInMitarbeiter.id
            ).sort((a, b) => new Date(b.datum) - new Date(a.datum));
            
            if (meineZeiten.length === 0) {
                liste.innerHTML = '<div class="empty-state"><p>Noch keine Zeiten erfasst</p></div>';
                return;
            }
            
            liste.innerHTML = meineZeiten.slice(0, 10).map(z => {
                const dauer = calculateHours(z.start, z.ende);
                return `
                    <div class="zeit-entry">
                        <strong>${new Date(z.datum).toLocaleDateString('de-DE', {weekday: 'short', day: '2-digit', month: '2-digit'})}</strong>
                        <small style="display: block; color: #666; margin-top: 4px;">
                            ${z.start} - ${z.ende} (${dauer}h)
                        </small>
                    </div>
                `;
            }).join('');
        }

        // Admin UI Updates
        function updateAdminUI() {
            updateCalendar();
            updateMitarbeiterListe();
            updateNotizenListe();
            updateEinkaufsliste();
            updateMasterChecklist();
            updateZeiterfassungListe();
        }

        function updateCalendar() {
            const grid = document.getElementById('calendar-grid');
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            
            const kw1 = getWeekNumber(startOfWeek);
            const kw2 = getWeekNumber(new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
            document.getElementById('aktuelle-kw').innerHTML = `KW ${kw1} & ${kw2}`;
            
            const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
            let html = '';
            
            // Erste Woche
            html += `<div style="width: 100%; margin-bottom: 20px;">`;
            html += `<h3 style="margin-bottom: 12px; color: #8b6f47; font-size: 1.1em;">📅 KW ${kw1}</h3>`;
            html += `<div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                
                const daySchichten = schichten.filter(s => s.datum === dateStr);
                
                html += `
                    <div class="calendar-day ${isToday ? 'heute' : ''}" style="min-width: 140px;">
                        <div class="calendar-day-header">
                            ${days[i]}<br>
                            <small>${date.getDate()}.${date.getMonth() + 1}</small>
                        </div>
                        ${daySchichten.length === 0 ? '<small style="color: #999; display: block; text-align: center; margin-top: 8px;">Keine Schichten</small>' : ''}
                        ${daySchichten.map(s => {
                            const m = mitarbeiter.find(ma => ma.id == s.mitarbeiterId);
                            const initials = m ? getInitials(m.name) : '??';
                            const typIcon = s.typ === 'frueh' ? '🌅' : '🌙';
                            const typText = s.typ === 'frueh' ? 'Früh' : 'Spät';
                            return `
                                <div class="schicht-item ${s.typ}" onclick="deleteSchicht(${s.id})" title="Klicken zum Löschen">
                                    <span class="schicht-initials">${initials}</span>
                                    <strong>${m ? m.name : 'Unbekannt'}</strong>
                                    <small style="display: block; margin-top: 4px;">${typIcon} ${typText}</small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            html += `</div></div>`;
            
            // Zweite Woche
            html += `<div style="width: 100%;">`;
            html += `<h3 style="margin-bottom: 12px; color: #8b6f47; font-size: 1.1em;">📅 KW ${kw2}</h3>`;
            html += `<div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">`;
            
            for (let i = 7; i < 14; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                
                const daySchichten = schichten.filter(s => s.datum === dateStr);
                
                html += `
                    <div class="calendar-day ${isToday ? 'heute' : ''}" style="min-width: 140px;">
                        <div class="calendar-day-header">
                            ${days[i - 7]}<br>
                            <small>${date.getDate()}.${date.getMonth() + 1}</small>
                        </div>
                        ${daySchichten.length === 0 ? '<small style="color: #999; display: block; text-align: center; margin-top: 8px;">Keine Schichten</small>' : ''}
                        ${daySchichten.map(s => {
                            const m = mitarbeiter.find(ma => ma.id == s.mitarbeiterId);
                            const initials = m ? getInitials(m.name) : '??';
                            const typIcon = s.typ === 'frueh' ? '🌅' : '🌙';
                            const typText = s.typ === 'frueh' ? 'Früh' : 'Spät';
                            return `
                                <div class="schicht-item ${s.typ}" onclick="deleteSchicht(${s.id})" title="Klicken zum Löschen">
                                    <span class="schicht-initials">${initials}</span>
                                    <strong>${m ? m.name : 'Unbekannt'}</strong>
                                    <small style="display: block; margin-top: 4px;">${typIcon} ${typText}</small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            html += `</div></div>`;
            
            grid.innerHTML = html;
        }

        function updateMitarbeiterListe() {
            const liste = document.getElementById('mitarbeiter-liste');
            if (mitarbeiter.length === 0) {
                liste.innerHTML = '<div class="empty-state"><div class="icon">👥</div><p>Keine Mitarbeiter</p></div>';
                return;
            }
            
            liste.innerHTML = mitarbeiter.map(m => `
                <div class="list-item">
                    <div class="list-item-info">
                        <strong>${m.name}</strong>
                        <small>${m.position} • 📞 ${m.telefon} • PIN: ${m.pin}</small>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-primary btn-small" onclick="openEditMitarbeiterModal(${m.id})">✏️</button>
                        <button class="btn btn-danger btn-small" onclick="deleteMitarbeiter(${m.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        function updateNotizenListe() {
            const liste = document.getElementById('notizen-liste');
            if (!liste) return;
            
            // Nur echte Notizen (keine Benachrichtigungen)
            const echteNotizen = notizen.filter(n => n.typ !== 'benachrichtigung');
            
            if (echteNotizen.length === 0) {
                liste.innerHTML = '<div class="empty-state"><div class="icon">💬</div><p>Keine Notizen</p></div>';
                return;
            }
            
            const sorted = [...echteNotizen].sort((a, b) => new Date(b.datum) - new Date(a.datum));
            
            // Icons für Notiztypen
            const typIcons = {
                'info': 'ℹ️',
                'frage': '❓',
                'problem': '⚠️',
                'idee': '💡'
            };
            
            liste.innerHTML = sorted.slice(0, 20).map(n => {
                const icon = typIcons[n.typ] || '💬';
                const hatAntwort = n.antwort && n.antwort.length > 0;
                
                return `
                    <div class="list-item" style="flex-direction: column; align-items: stretch;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div class="list-item-info" style="flex: 1;">
                                <strong>${icon} ${n.betreff}</strong>
                                <small>${n.mitarbeiterName} • ${new Date(n.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</small>
                                ${n.text ? `<p style="margin-top: 8px; color: #333; font-size: 0.95em;">${n.text}</p>` : ''}
                            </div>
                            ${!hatAntwort ? `<button class="btn btn-primary btn-small" onclick="openAntwortModal(${n.id})" style="margin-left: 12px;">↩️ Antworten</button>` : ''}
                        </div>
                        ${hatAntwort ? `
                            <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 8px; border-left: 4px solid #10b981;">
                                <strong style="color: #059669; font-size: 0.9em;">✅ Admin-Antwort:</strong>
                                <p style="color: #333; margin-top: 4px; font-size: 0.95em;">${n.antwort}</p>
                                <small style="color: #666; margin-top: 4px; display: block;">${new Date(n.antwortDatum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</small>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        function updateBenachrichtigungen() {
            const liste = document.getElementById('benachrichtigungen-liste');
            if (!liste) return;
            
            // Nur Benachrichtigungen
            const benachrichtigungen = notizen.filter(n => n.typ === 'benachrichtigung');
            const kassenMeldungen = kassenstände.map(k => ({
                ...k,
                typ: 'kassenstand',
                betreff: 'Kassenstand gemeldet'
            }));
            
            const alle = [...benachrichtigungen, ...kassenMeldungen].sort((a, b) => new Date(b.datum) - new Date(a.datum));
            
            if (alle.length === 0) {
                liste.innerHTML = '<div class="empty-state"><div class="icon">🔔</div><p>Keine Benachrichtigungen</p></div>';
                return;
            }
            
            liste.innerHTML = alle.slice(0, 30).map(n => {
                if (n.typ === 'kassenstand') {
                    return `
                        <div class="list-item">
                            <div class="list-item-info">
                                <strong>💰 ${n.betreff}</strong>
                                <small>${n.mitarbeiterName} • ${new Date(n.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</small>
                                <p style="margin-top: 8px; color: #333; font-size: 1.1em; font-weight: 600;">Betrag: €${parseFloat(n.betrag).toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="list-item">
                            <div class="list-item-info">
                                <strong>🛒 ${n.betreff}</strong>
                                <small>${n.mitarbeiterName} • ${new Date(n.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</small>
                                ${n.text ? `<p style="margin-top: 8px; color: #333; font-size: 0.95em;">${n.text}</p>` : ''}
                            </div>
                        </div>
                    `;
                }
            }).join('');
        }

        function updateEinkaufsliste() {
            const liste = document.getElementById('einkaufsliste');
            const sortiert = {
                leer: lagerBestand.filter(l => l.status === 'leer'),
                niedrig: lagerBestand.filter(l => l.status === 'niedrig'),
                ok: lagerBestand.filter(l => l.status === 'ok')
            };
            
            let html = '';
            
            if (sortiert.leer.length > 0) {
                html += '<h3 style="color: #ef4444; margin-bottom: 12px;">🔴 Sofort einkaufen!</h3>';
                sortiert.leer.forEach(item => {
                    html += `
                        <div class="list-item" style="border-left: 4px solid #ef4444;">
                            <div class="list-item-info">
                                <strong>${item.name}</strong>
                            </div>
                            <div class="status-buttons">
                                <button class="status-btn ok" onclick="changeStatus(${item.id}, 'ok')">✅</button>
                                <button class="status-btn niedrig" onclick="changeStatus(${item.id}, 'niedrig')">⚠️</button>
                                <button class="btn btn-danger btn-small" onclick="deleteLagerItem(${item.id})">🗑️</button>
                            </div>
                        </div>
                    `;
                });
            }
            
            if (sortiert.niedrig.length > 0) {
                html += '<h3 style="color: #f59e0b; margin: 20px 0 12px;">⚠️ Bald nachbestellen</h3>';
                sortiert.niedrig.forEach(item => {
                    html += `
                        <div class="list-item" style="border-left: 4px solid #f59e0b;">
                            <div class="list-item-info">
                                <strong>${item.name}</strong>
                            </div>
                            <div class="status-buttons">
                                <button class="status-btn ok" onclick="changeStatus(${item.id}, 'ok')">✅</button>
                                <button class="status-btn leer" onclick="changeStatus(${item.id}, 'leer')">🔴</button>
                                <button class="btn btn-danger btn-small" onclick="deleteLagerItem(${item.id})">🗑️</button>
                            </div>
                        </div>
                    `;
                });
            }
            
            if (sortiert.ok.length > 0) {
                html += '<h3 style="color: #10b981; margin: 20px 0 12px;">✅ Genügend vorhanden</h3>';
                sortiert.ok.forEach(item => {
                    html += `
                        <div class="list-item">
                            <div class="list-item-info">
                                <strong>${item.name}</strong>
                            </div>
                            <div class="status-buttons">
                                <button class="status-btn niedrig" onclick="changeStatus(${item.id}, 'niedrig')">⚠️</button>
                                <button class="status-btn leer" onclick="changeStatus(${item.id}, 'leer')">🔴</button>
                                <button class="btn btn-danger btn-small" onclick="deleteLagerItem(${item.id})">🗑️</button>
                            </div>
                        </div>
                    `;
                });
            }
            
            liste.innerHTML = html || '<div class="empty-state"><p>Keine Artikel</p></div>';
        }

        function updateZeiterfassungListe() {
            const liste = document.getElementById('zeiterfassung-liste');
            
            if (zeiterfassung.length === 0) {
                liste.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">⏰</div>
                        <p>Keine Zeiteinträge</p>
                    </div>
                    <button class="btn btn-primary" onclick="openZeitModal()">➕ Manuelle Erfassung</button>
                `;
                return;
            }

            // Sortiere nach Datum (neueste zuerst)
            const sorted = [...zeiterfassung].sort((a, b) => new Date(b.datum) - new Date(a.datum));
            
            // Filtere nur manuelle Einträge (type !== 'stempel')
            const manuelle = sorted.filter(z => z.type !== 'stempel');
            
            liste.innerHTML = `
                <button class="btn btn-primary" onclick="openZeitModal()" style="margin-bottom: 16px;">➕ Manuelle Erfassung</button>
                ${manuelle.length === 0 ? '<p style="color: #999; text-align: center;">Keine manuellen Einträge</p>' : ''}
                ${manuelle.slice(0, 10).map(z => {
                    const m = mitarbeiter.find(ma => ma.id == z.mitarbeiterId);
                    const dauer = calculateHours(z.start, z.ende);
                    return `
                        <div class="zeit-entry">
                            <strong>${m ? m.name : 'Unbekannt'}</strong>
                            <small style="display: block; color: #666; margin-top: 4px;">
                                ${new Date(z.datum).toLocaleDateString('de-DE')} • ${z.start} - ${z.ende} (${dauer}h)
                            </small>
                        </div>
                    `;
                }).join('')}
            `;
        }

        function calculateHours(start, ende) {
            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = ende.split(':').map(Number);
            const startMin = sh * 60 + sm;
            const endeMin = eh * 60 + em;
            return ((endeMin - startMin) / 60).toFixed(1);
        }

        function updateMasterChecklist() {
            const liste = document.getElementById('master-checklist');
            liste.innerHTML = checklistItems.map((item, i) => `
                <div class="list-item">
                    <span>${item}</span>
                    <button class="btn btn-danger btn-small" onclick="deleteChecklistItem(${i})">🗑️</button>
                </div>
            `).join('');
        }

        function updateSchichtSelect() {
            const select = document.getElementById('schicht-mitarbeiter');
            if (!select) return; // Element existiert nicht mehr
            select.innerHTML = '<option value="">Bitte wählen...</option>' + 
                mitarbeiter.map(m => `<option value="${m.id}">${m.name} - ${m.position}</option>`).join('');
        }

        function updateQuickAddSelect() {
            const select = document.getElementById('quick-mitarbeiter');
            select.innerHTML = '<option value="">Bitte wählen...</option>' + 
                mitarbeiter.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        }

        function updateZeitSelect() {
            const select = document.getElementById('zeit-mitarbeiter');
            select.innerHTML = '<option value="">Bitte wählen...</option>' + 
                mitarbeiter.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        }

        function updateMitarbeiterSelect() {
            const select = document.getElementById('mitarbeiter-select');
            select.innerHTML = '<option value="">Bitte wählen...</option>' + 
                mitarbeiter.map(m => `<option value="${m.id}">${m.name} - ${m.position}</option>`).join('');
        }

        // Mitarbeiter UI
        function updateMitarbeiterUI() {
            updateMitarbeiterCalendar();
            updateMeineSchichten();
            updateSchichtButton();
            updateTauschAnfragen();
        }

        function updateMitarbeiterCalendar() {
            const grid = document.getElementById('mitarbeiter-calendar-grid');
            if (!grid) return;
            
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            
            const kw1 = getWeekNumber(startOfWeek);
            const kw2 = getWeekNumber(new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
            const kwEl = document.getElementById('mitarbeiter-kw');
            if (kwEl) kwEl.innerHTML = `KW ${kw1} & ${kw2}`;
            
            const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
            let html = '';
            
            // Erste Woche
            html += `<div style="width: 100%; margin-bottom: 20px;">`;
            html += `<h3 style="margin-bottom: 12px; color: #8b6f47; font-size: 1.1em;">📅 KW ${kw1}</h3>`;
            html += `<div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                
                const daySchichten = schichten.filter(s => s.datum === dateStr);
                const meineSchicht = daySchichten.find(s => s.mitarbeiterId == loggedInMitarbeiter.id);
                
                html += `
                    <div class="calendar-day ${isToday ? 'heute' : ''}" style="min-width: 140px;">
                        <div class="calendar-day-header">
                            ${days[i]}<br>
                            <small>${date.getDate()}.${date.getMonth() + 1}</small>
                        </div>
                        ${daySchichten.length === 0 ? '<small style="color: #999; display: block; text-align: center; margin-top: 8px;">Keine Schichten</small>' : ''}
                        ${daySchichten.map(s => {
                            const m = mitarbeiter.find(ma => ma.id == s.mitarbeiterId);
                            const initials = m ? getInitials(m.name) : '??';
                            const typIcon = s.typ === 'frueh' ? '🌅' : '🌙';
                            const typText = s.typ === 'frueh' ? 'Früh' : 'Spät';
                            const istMeineSchicht = s.mitarbeiterId == loggedInMitarbeiter.id;
                            return `
                                <div class="schicht-item ${s.typ}" style="${istMeineSchicht ? 'border: 2px solid #c9a961; background: #fff3cd;' : ''}">
                                    <span class="schicht-initials">${initials}</span>
                                    <strong>${m ? m.name : 'Unbekannt'}</strong>
                                    <small style="display: block; margin-top: 4px;">${typIcon} ${typText}</small>
                                    ${istMeineSchicht ? `<button onclick="openTauschModal('${s.id}')" class="btn btn-primary btn-small" style="margin-top: 8px; width: 100%; font-size: 0.85em;">🔄 Tauschen</button>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            html += `</div></div>`;
            
            // Zweite Woche
            html += `<div style="width: 100%;">`;
            html += `<h3 style="margin-bottom: 12px; color: #8b6f47; font-size: 1.1em;">📅 KW ${kw2}</h3>`;
            html += `<div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">`;
            
            for (let i = 7; i < 14; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                
                const daySchichten = schichten.filter(s => s.datum === dateStr);
                
                html += `
                    <div class="calendar-day ${isToday ? 'heute' : ''}" style="min-width: 140px;">
                        <div class="calendar-day-header">
                            ${days[i - 7]}<br>
                            <small>${date.getDate()}.${date.getMonth() + 1}</small>
                        </div>
                        ${daySchichten.length === 0 ? '<small style="color: #999; display: block; text-align: center; margin-top: 8px;">Keine Schichten</small>' : ''}
                        ${daySchichten.map(s => {
                            const m = mitarbeiter.find(ma => ma.id == s.mitarbeiterId);
                            const initials = m ? getInitials(m.name) : '??';
                            const typIcon = s.typ === 'frueh' ? '🌅' : '🌙';
                            const typText = s.typ === 'frueh' ? 'Früh' : 'Spät';
                            const istMeineSchicht = s.mitarbeiterId == loggedInMitarbeiter.id;
                            return `
                                <div class="schicht-item ${s.typ}" style="${istMeineSchicht ? 'border: 2px solid #c9a961; background: #fff3cd;' : ''}">
                                    <span class="schicht-initials">${initials}</span>
                                    <strong>${m ? m.name : 'Unbekannt'}</strong>
                                    <small style="display: block; margin-top: 4px;">${typIcon} ${typText}</small>
                                    ${istMeineSchicht ? `<button onclick="openTauschModal('${s.id}')" class="btn btn-primary btn-small" style="margin-top: 8px; width: 100%; font-size: 0.85em;">🔄 Tauschen</button>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            html += `</div></div>`;
            
            grid.innerHTML = html;
        }

        function updateMeineSchichten() {
            const liste = document.getElementById('meine-schichten');
            const today = new Date().toISOString().split('T')[0];
            const meineSchichten = schichten.filter(s => s.mitarbeiterId == loggedInMitarbeiter.id && s.datum >= today);
            
            if (meineSchichten.length === 0) {
                liste.innerHTML = '<div class="empty-state"><div class="icon">📅</div><p>Keine anstehenden Schichten</p></div>';
                return;
            }
            
            // Sortiere nach Datum
            const sorted = [...meineSchichten].sort((a, b) => new Date(a.datum) - new Date(b.datum));
            
            liste.innerHTML = sorted.slice(0, 5).map(s => {
                const typText = s.typ === 'frueh' ? '🌅 Frühschicht' : '🌙 Spätschicht';
                const zeitText = s.typ === 'frueh' ? '6:00 - 14:00' : '14:00 - 22:00';
                const isToday = s.datum === today;
                return `
                    <div class="list-item" style="${isToday ? 'border-left: 4px solid #c9a961;' : ''}">
                        <div class="list-item-info">
                            <strong>${new Date(s.datum).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: '2-digit'})}${isToday ? ' (Heute)' : ''}</strong>
                            <small>${typText} • ${zeitText}</small>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateMeineNotizen() {
            const liste = document.getElementById('meine-notizen-liste');
            if (!liste) return; // Element existiert nicht (Admin-Bereich)
            if (!loggedInMitarbeiter) return; // Kein Mitarbeiter eingeloggt
            
            const meineNotizen = notizen.filter(n => n.mitarbeiterId === loggedInMitarbeiter.id);
            
            if (meineNotizen.length === 0) {
                liste.innerHTML = '<div class="empty-state"><p>Noch keine Notizen geschrieben</p></div>';
                return;
            }
            
            const sorted = [...meineNotizen].sort((a, b) => new Date(b.datum) - new Date(a.datum));
            
            const typIcons = {
                'info': 'ℹ️',
                'frage': '❓',
                'problem': '⚠️',
                'idee': '💡'
            };
            
            liste.innerHTML = sorted.map(n => {
                const icon = typIcons[n.typ] || '💬';
                const hatAntwort = n.antwort && n.antwort.length > 0;
                
                return `
                    <div class="list-item" style="flex-direction: column; align-items: stretch;">
                        <div class="list-item-info">
                            <strong>${icon} ${n.betreff}</strong>
                            <small>${new Date(n.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</small>
                            ${n.text ? `<p style="margin-top: 8px; color: #333; font-size: 0.95em;">${n.text}</p>` : ''}
                        </div>
                        ${hatAntwort ? `
                            <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 12px; border-left: 4px solid #10b981;">
                                <strong style="color: #059669; font-size: 0.9em;">✅ Admin-Antwort:</strong>
                                <p style="color: #333; margin-top: 4px; font-size: 0.95em;">${n.antwort}</p>
                                <small style="color: #666; margin-top: 4px; display: block;">${new Date(n.antwortDatum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</small>
                            </div>
                        ` : `<small style="color: #f59e0b; margin-top: 8px; display: block;">⏳ Wartet auf Antwort</small>`}
                    </div>
                `;
            }).join('');
        }

        function updateMitarbeiterLagerGrid() {
            const grid = document.getElementById('mitarbeiter-lager-grid');
            
            grid.innerHTML = lagerBestand.map(item => {
                let statusText = '';
                let statusClass = '';
                switch(item.status) {
                    case 'ok':
                        statusText = '✅ OK';
                        statusClass = 'ok';
                        break;
                    case 'niedrig':
                        statusText = '⚠️ Niedrig';
                        statusClass = 'niedrig';
                        break;
                    case 'leer':
                        statusText = '🔴 Leer';
                        statusClass = 'leer';
                        break;
                }
                
                return `
                    <div class="lager-item-btn ${item.status}" onclick="openLagerStatusModal(${item.id})">
                        <strong>${item.name}</strong>
                        <div class="lager-status-badge ${statusClass}">${statusText}</div>
                    </div>
                `;
            }).join('');
        }

        function updateMitarbeiterChecklist() {
            const liste = document.getElementById('mitarbeiter-checklist');
            const heute = new Date().toISOString().split('T')[0];
            
            if (!tagesCheckliste[heute]) {
                tagesCheckliste[heute] = {};
            }
            
            if (checklistItems.length === 0) {
                liste.innerHTML = '<div class="empty-state"><p>Keine Checklisten-Punkte vorhanden</p></div>';
                return;
            }
            
            liste.innerHTML = checklistItems.map((item, i) => {
                const isErledigt = tagesCheckliste[heute][i] === true;
                return `
                    <div class="checklist-item ${isErledigt ? 'erledigt' : ''}" onclick="toggleChecklistItem(${i})">
                        <div class="checklist-checkbox">
                            ${isErledigt ? '✓' : ''}
                        </div>
                        <div class="checklist-text">${item}</div>
                    </div>
                `;
            }).join('');
        }

        function toggleChecklistItem(index) {
            const heute = new Date().toISOString().split('T')[0];
            
            if (!tagesCheckliste[heute]) {
                tagesCheckliste[heute] = {};
            }
            
            tagesCheckliste[heute][index] = !tagesCheckliste[heute][index];
            localStorage.setItem('gastro-tages-checklist', JSON.stringify(tagesCheckliste));
            
            updateMitarbeiterChecklist();
        }

        // Form Handlers
        document.getElementById('mitarbeiter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const ma = {
                id: Date.now(),
                name: document.getElementById('ma-name').value,
                position: document.getElementById('ma-position').value,
                telefon: document.getElementById('ma-telefon').value,
                pin: document.getElementById('ma-pin').value
            };
            mitarbeiter.push(ma);
            localStorage.setItem('gastro-mitarbeiter', JSON.stringify(mitarbeiter));
            updateMitarbeiterListe();
            updateMitarbeiterSelect();
            e.target.reset();
            alert('✅ Mitarbeiter hinzugefügt!');
        });

        document.getElementById('edit-mitarbeiter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('edit-ma-id').value);
            const ma = mitarbeiter.find(m => m.id === id);
            if (ma) {
                ma.name = document.getElementById('edit-ma-name').value;
                ma.position = document.getElementById('edit-ma-position').value;
                ma.telefon = document.getElementById('edit-ma-telefon').value;
                ma.pin = document.getElementById('edit-ma-pin').value;
                localStorage.setItem('gastro-mitarbeiter', JSON.stringify(mitarbeiter));
                updateMitarbeiterListe();
                updateMitarbeiterSelect();
                updateCalendar();
                closeModal('edit-mitarbeiter-modal');
                alert('✅ Mitarbeiter aktualisiert!');
            }
        });

        document.getElementById('quick-add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const schicht = {
                id: Date.now(),
                datum: document.getElementById('quick-datum').value,
                mitarbeiterId: parseInt(document.getElementById('quick-mitarbeiter').value),
                typ: document.getElementById('quick-typ').value,
                status: 'geplant'
            };
            schichten.push(schicht);
            localStorage.setItem('gastro-schichten', JSON.stringify(schichten));
            updateCalendar();
            closeModal('quick-add-modal');
            e.target.reset();
            alert('✅ Schicht erstellt!');
        });

        document.getElementById('checklist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('checklist-text').value;
            checklistItems.push(text);
            localStorage.setItem('gastro-checklist', JSON.stringify(checklistItems));
            updateMasterChecklist();
            e.target.reset();
        });

        document.getElementById('lager-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const item = {
                id: Date.now(),
                name: document.getElementById('lager-name').value,
                status: document.getElementById('lager-status').value
            };
            lagerBestand.push(item);
            localStorage.setItem('gastro-lager', JSON.stringify(lagerBestand));
            updateEinkaufsliste();
            updateMitarbeiterLagerGrid();
            closeModal('lager-modal');
            e.target.reset();
            alert('✅ Artikel hinzugefügt!');
        });

        document.getElementById('zeit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const zeit = {
                id: Date.now(),
                mitarbeiterId: parseInt(document.getElementById('zeit-mitarbeiter').value),
                datum: document.getElementById('zeit-datum').value,
                start: document.getElementById('zeit-start').value,
                ende: document.getElementById('zeit-ende').value,
                type: 'manuell'
            };
            zeiterfassung.push(zeit);
            localStorage.setItem('gastro-zeiterfassung', JSON.stringify(zeiterfassung));
            updateZeiterfassungListe();
            closeModal('zeit-modal');
            e.target.reset();
            alert('✅ Zeiterfassung gespeichert!');
        });

        document.getElementById('pin-change-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('current-admin-pin').value;
            const newPin = document.getElementById('new-admin-pin').value;
            const confirm = document.getElementById('confirm-admin-pin').value;
            
            if (current !== adminPin) {
                alert('❌ Aktueller PIN ist falsch!');
                return;
            }
            
            if (newPin !== confirm) {
                alert('❌ PINs stimmen nicht überein!');
                return;
            }
            
            if (newPin.length !== 4) {
                alert('❌ PIN muss 4-stellig sein!');
                return;
            }
            
            adminPin = newPin;
            localStorage.setItem('gastro-admin-pin', adminPin);
            e.target.reset();
            alert('✅ Admin-PIN erfolgreich geändert!');
        });

        document.getElementById('mitarbeiter-notiz-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const notiz = {
                id: Date.now(),
                typ: document.getElementById('notiz-typ').value,
                betreff: document.getElementById('notiz-betreff').value,
                text: document.getElementById('notiz-text').value,
                mitarbeiterId: loggedInMitarbeiter.id,
                mitarbeiterName: loggedInMitarbeiter.name,
                datum: new Date().toISOString(),
                antwort: null,
                antwortDatum: null
            };
            notizen.push(notiz);
            localStorage.setItem('gastro-notizen', JSON.stringify(notizen));
            updateMeineNotizen();
            updateNotizenListe();
            e.target.reset();
            alert('✅ Notiz gesendet!');
        });

        document.getElementById('schicht-beenden-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const betrag = document.getElementById('kassenstand').value;
            const heute = new Date().toISOString().split('T')[0];
            
            // Kassenstand speichern
            const kassenEintrag = {
                id: Date.now(),
                mitarbeiterId: loggedInMitarbeiter.id,
                mitarbeiterName: loggedInMitarbeiter.name,
                betrag: parseFloat(betrag),
                datum: new Date().toISOString()
            };
            kassenstände.push(kassenEintrag);
            localStorage.setItem('gastro-kassenstände', JSON.stringify(kassenstände));
            
            // Schicht-Status zurücksetzen
            const schichtKey = `schicht-gestartet-${loggedInMitarbeiter.id}-${heute}`;
            localStorage.removeItem(schichtKey);
            schichtGestartet = false;
            
            updateSchichtButton();
            closeModal('schicht-beenden-modal');
            e.target.reset();
            
            alert('✅ Schicht erfolgreich beendet! Kassenstand: €' + parseFloat(betrag).toFixed(2));
        });

        document.getElementById('antwort-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const notiz = notizen.find(n => n.id === currentNotizId);
            if (notiz) {
                notiz.antwort = document.getElementById('antwort-text').value;
                notiz.antwortDatum = new Date().toISOString();
                localStorage.setItem('gastro-notizen', JSON.stringify(notizen));
                updateNotizenListe();
                closeModal('antwort-modal');
                e.target.reset();
                alert('✅ Antwort gesendet!');
            }
        });

        document.getElementById('manuel-zeit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const zeit = {
                id: Date.now(),
                mitarbeiterId: loggedInMitarbeiter.id,
                datum: document.getElementById('manuel-datum').value,
                start: document.getElementById('manuel-start').value,
                ende: document.getElementById('manuel-ende').value,
                type: 'manuell'
            };
            zeiterfassung.push(zeit);
            localStorage.setItem('gastro-zeiterfassung', JSON.stringify(zeiterfassung));
            updateMeineZeiten();
            e.target.reset();
            // Setze Datum auf heute
            document.getElementById('manuel-datum').value = new Date().toISOString().split('T')[0];
            alert('✅ Zeit erfolgreich gespeichert!');
        });

        document.getElementById('tausch-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const angebotSchichtId = parseInt(document.getElementById('tausch-angebot-schicht').value);
            if (!angebotSchichtId) {
                alert('❌ Bitte wähle eine Schicht zum Anbieten!');
                return;
            }
            
            const anfrage = {
                id: Date.now(),
                schichtId: currentTauschSchichtId,
                angebotSchichtId: angebotSchichtId,
                absenderId: loggedInMitarbeiter.id,
                zielMitarbeiterId: parseInt(document.getElementById('tausch-mitarbeiter').value),
                status: 'ausstehend',
                datum: new Date().toISOString()
            };
            
            tauschAnfragen.push(anfrage);
            localStorage.setItem('gastro-tausch-anfragen', JSON.stringify(tauschAnfragen));
            
            closeModal('tausch-modal');
            e.target.reset();
            alert('✅ Tausch-Anfrage gesendet!');
        });

        // Statistik-Funktionen
        function updateStatistik() {
            const zeitraum = document.getElementById('statistik-zeitraum').value;
            const inhalt = document.getElementById('statistik-inhalt');
            
            let gefiltert = [];
            const heute = new Date();
            
            if (zeitraum === 'tag') {
                const heuteStr = heute.toISOString().split('T')[0];
                gefiltert = kassenstände.filter(k => k.datum.startsWith(heuteStr));
            } else if (zeitraum === 'monat') {
                const monat = heute.toISOString().substring(0, 7); // YYYY-MM
                gefiltert = kassenstände.filter(k => k.datum.startsWith(monat));
            } else if (zeitraum === 'jahr') {
                const jahr = heute.getFullYear().toString();
                gefiltert = kassenstände.filter(k => k.datum.startsWith(jahr));
            }
            
            if (gefiltert.length === 0) {
                inhalt.innerHTML = '<div class="empty-state"><p>Keine Daten für diesen Zeitraum</p></div>';
                return;
            }
            
            const summe = gefiltert.reduce((sum, k) => sum + parseFloat(k.betrag), 0);
            const durchschnitt = summe / gefiltert.length;
            
            let zeitraumText = '';
            if (zeitraum === 'tag') zeitraumText = 'Heute';
            else if (zeitraum === 'monat') zeitraumText = heute.toLocaleDateString('de-DE', {month: 'long', year: 'numeric'});
            else zeitraumText = heute.getFullYear();
            
            inhalt.innerHTML = `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;" id="druck-inhalt">
                    <h3 style="margin-bottom: 16px; color: #8b6f47;">📊 ${zeitraumText}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div style="background: white; padding: 16px; border-radius: 8px;">
                            <strong style="color: #666; font-size: 0.9em;">Gesamtsumme</strong>
                            <p style="font-size: 1.6em; font-weight: 700; color: #10b981; margin-top: 8px; word-break: break-all;">€${summe.toFixed(2)}</p>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 8px;">
                            <strong style="color: #666; font-size: 0.9em;">Durchschnitt</strong>
                            <p style="font-size: 1.6em; font-weight: 700; color: #3b82f6; margin-top: 8px; word-break: break-all;">€${durchschnitt.toFixed(2)}</p>
                        </div>
                    </div>
                    <div style="background: white; padding: 16px; border-radius: 8px;">
                        <strong style="display: block; margin-bottom: 12px;">Einträge (${gefiltert.length})</strong>
                        ${gefiltert.sort((a, b) => new Date(b.datum) - new Date(a.datum)).map(k => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <div>
                                    <strong>${k.mitarbeiterName}</strong>
                                    <small style="display: block; color: #666;">${new Date(k.datum).toLocaleDateString('de-DE', {weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</small>
                                </div>
                                <strong style="color: #10b981;">€${parseFloat(k.betrag).toFixed(2)}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function druckeStatistik() {
            const druckInhalt = document.getElementById('druck-inhalt');
            if (!druckInhalt) {
                alert('Keine Daten zum Drucken vorhanden');
                return;
            }
            
            const zeitraum = document.getElementById('statistik-zeitraum').value;
            let titel = 'Kassenstatistik';
            if (zeitraum === 'tag') titel += ' - Heute';
            else if (zeitraum === 'monat') titel += ' - Monat';
            else titel += ' - Jahr';
            
            const druckFenster = window.open('', '', 'height=600,width=800');
            druckFenster.document.write('<html><head><title>' + titel + '</title>');
            druckFenster.document.write('<style>body{font-family: Arial; padding: 20px;} h1{color: #8b6f47;}</style>');
            druckFenster.document.write('</head><body>');
            druckFenster.document.write('<h1>🍽️ Gastro Planer - ' + titel + '</h1>');
            druckFenster.document.write(druckInhalt.innerHTML);
            druckFenster.document.write('</body></html>');
            druckFenster.document.close();
            druckFenster.print();
        }

        function deleteMitarbeiter(id) {
            if (confirm('Mitarbeiter wirklich löschen?')) {
                mitarbeiter = mitarbeiter.filter(m => m.id !== id);
                localStorage.setItem('gastro-mitarbeiter', JSON.stringify(mitarbeiter));
                updateMitarbeiterListe();
                updateMitarbeiterSelect();
            }
        }

        function deleteSchicht(id) {
            if (confirm('Schicht wirklich löschen?')) {
                schichten = schichten.filter(s => s.id !== id);
                localStorage.setItem('gastro-schichten', JSON.stringify(schichten));
                updateCalendar();
            }
        }

        function deleteChecklistItem(index) {
            checklistItems.splice(index, 1);
            localStorage.setItem('gastro-checklist', JSON.stringify(checklistItems));
            updateMasterChecklist();
        }

        function deleteLagerItem(id) {
            if (confirm('Artikel wirklich löschen?')) {
                lagerBestand = lagerBestand.filter(l => l.id !== id);
                localStorage.setItem('gastro-lager', JSON.stringify(lagerBestand));
                updateEinkaufsliste();
                updateMitarbeiterLagerGrid();
            }
        }

        function changeStatus(id, newStatus) {
            const item = lagerBestand.find(l => l.id === id);
            if (item) {
                item.status = newStatus;
                localStorage.setItem('gastro-lager', JSON.stringify(lagerBestand));
                updateEinkaufsliste();
                updateMitarbeiterLagerGrid();
            }
        }

        function getWeekNumber(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        }

        // Init on load - Warte bis DOM bereit ist
        document.addEventListener('DOMContentLoaded', function() {
            init();
        });

        // Globale Exports für onclick Handler
        window.openTauschModal = openTauschModal;
        window.updateTauschSchichten = updateTauschSchichten;
        window.akzeptiereTausch = akzeptiereTausch;
        window.lehneTauschAb = lehneTauschAb;
        window.changeStatus = changeStatus;
        window.deleteChecklistItem = deleteChecklistItem;
        window.deleteLagerItem = deleteLagerItem;
        window.deleteMitarbeiter = deleteMitarbeiter;
        window.deleteSchicht = deleteSchicht;
        window.openAntwortModal = openAntwortModal;
        window.openEditMitarbeiterModal = openEditMitarbeiterModal;
        window.openLagerStatusModal = openLagerStatusModal;
        window.openZeitModal = openZeitModal;
        window.toggleChecklistItem = toggleChecklistItem;
        window.toggleSchichtChecklistItem = toggleSchichtChecklistItem;
