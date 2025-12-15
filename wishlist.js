const wishlistApp = {// Eigenständige Vue-App für die Merkliste
  setup() {// setup-Funktion: hier definiere ich Zustand und Logik der Merkliste
    const wishlist = Vue.ref([]);// Reaktive Liste aller gemerkten Unterkünfte; Änderungen werden automatisch im UI angezeigt
    const notification = Vue.ref("");// Reaktiver Text für kurze Statusmeldungen (Fehler/Erfolg) oben auf der Seite

    async function loadWishlist() {// Lädt die Merkliste vom Backend und bereitet die Daten für die Anzeige auf
      try {
        const res = await fetch("http://127.0.0.1:5000/api/wishlist");// GET-Request an die Wishlist-API
        if (!res.ok) throw new Error('HTTP ' + res.status);// Fehler, wenn HTTP-Status nicht im Erfolgsbereich ist
        const raw = await res.json();// Raw-Daten (Array) aus der Antwort in JavaScript-Objekte umwandeln
        wishlist.value = raw.map(it => {// Jedes Element der Merkliste normalisieren, damit das Frontend damit arbeiten kann
          const priceNum = parseFloat(it.price) || 0;// Preis aus den Daten in eine Zahl umwandeln, Fallback 0
          const persons = Number(it.persons) || 1;// Anzahl Personen sicher in Zahl konvertieren, Fallback 1
          const nights = Number(it.nights) || 1;// Anzahl Nächte sicher in Zahl konvertieren, Fallback 1
          const totalPrice = (it.totalPrice !== undefined && it.totalPrice !== null)
            ? Number(it.totalPrice)// Wenn totalPrice schon gespeichert ist, diesen Wert verwenden
            : priceNum * persons * nights;// Sonst Gesamtpreis aus Preis × Personen × Nächten berechnen
          return {
            ...it,// Alle ursprünglichen Felder übernehmen
            persons,// Normalisierte Personenanzahl
            nights,// Normalisierte Nächteanzahl
            totalPrice,// Berechneter oder gespeicherter Gesamtpreis
            max_persons: Number(it.max_persons || it.maxpersons || it.maxPersonen || it.max_Personen) || 1,// max_persons aus verschiedenen möglichen Feldnamen zusammenführen und in Zahl konvertieren
            image: it.image || it.image_url || it.Bild_URL || it.BildURL || ''// Bild-URL aus verschiedenen möglichen Feldnamen holen, Fallback leerer String
          };
        });
      } catch (err) {
        console.error('Fehler beim Laden der Merkliste', err);// Konsole für Debugging
        notification.value = 'Fehler beim Laden der Merkliste';// Nutzerfreundliche Fehlermeldung
      }
    }

    async function removeFromWishlist(item) {// Entfernt einen Eintrag aus der Merkliste über das Backend
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${item.id}`, {
          method: "DELETE"// HTTP-Methode DELETE: Eintrag mit dieser ID löschen
        });
        const data = await res.json();// Antwort des Servers lesen (z.B. Bestätigungstext)
        notification.value = data.message || 'Entfernt';// Meldung aus der Antwort oder Fallback anzeigen
        await loadWishlist();    // Nach dem Löschen die Liste neu laden, damit das UI aktuell ist
      } catch (err) {
        console.error('Fehler beim Entfernen', err);// Fehlermeldung in der Konsole
        notification.value = 'Fehler beim Entfernen';// Kurze Info für den Nutzer
      }
      setTimeout(() => (notification.value = ''), 2500);// Notification nach 2,5 Sekunden automatisch ausblenden
    }

    const editingItem = Vue.ref(null);// Reaktives Objekt für den Eintrag, der gerade im Bearbeitungs-Popup geöffnet ist
    const editPersons = Vue.ref(1);// Reaktive Personenanzahl im Bearbeitungsdialog
    const editNights = Vue.ref(1);// Reaktive Nächteanzahl im Bearbeitungsdialog
    const bookingConfirm = Vue.ref(null);// Name der Unterkunft, für die gerade eine „Buchung“ bestätigt wurde

    function openEditPopup(item) {// Öffnet das Bearbeitungs-Popup für einen bestimmten Merkliste-Eintrag
      editingItem.value = item;// Setzt das aktuell zu bearbeitende Item
      editPersons.value = Number(item.persons) || 1;// Initialisiert die Personenanzahl im Formular anhand der gespeicherten Werte
      editNights.value = Number(item.nights) || 1;// Initialisiert die Nächteanzahl im Formular
    }

    function cancelEdit() {// Schließt das Bearbeitungs-Popup ohne zu speichern
      editingItem.value = null;// Entfernt das aktuell bearbeitete Item, dadurch wird das Popup ausgeblendet
    }


    const editTotal = Vue.computed(() => {// Berechneter Gesamtpreis im Bearbeitungsdialog (live, abhängig von editPersons/editNights)
      const price = parseFloat(editingItem.value?.price) || 0;// Preis des bearbeiteten Items als Zahl
      return (price * (Number(editPersons.value) || 1) * (Number(editNights.value) || 1));// Formel: Preis × Personen × Nächte mit Fallbacks
    });

    async function saveEdit() {// Speichert geänderte Personen-/Nächtewerte für einen Eintrag in der Merkliste
      if (!editingItem.value) return;// Sicherheitscheck: ohne aktives Item nichts tun
      const updated = {// Objekt mit den aktualisierten Werten, die ans Backend gesendet werden
        persons: Number(editPersons.value) || 1,
        nights: Number(editNights.value) || 1,
        totalPrice: Number(editTotal.value) || 0
      };

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${editingItem.value.id}`, {
          method: 'PUT',// HTTP-Methode PUT: vorhandenen Eintrag aktualisieren
          headers: { 'Content-Type': 'application/json' },// Der Body ist JSON
          body: JSON.stringify(updated)// Aktualisierte Werte als JSON-String senden
        });
        const data = await res.json();// Antwort des Servers lesen (z.B. Bestätigungsnachricht)
        notification.value = data.message || 'Aktualisiert';// Meldung anzeigen
        if (res.ok) {// Nur bei erfolgreichem Statuscode
          await loadWishlist();// Merkliste neu laden, um die Änderungen sichtbar zu machen
          editingItem.value = null;// Bearbeitungs-Popup schließen
        }
      } catch (err) {
        console.error('Fehler beim Aktualisieren', err);// Fehlermeldung in der Konsole
        notification.value = 'Fehler beim Aktualisieren';// Nutzerfreundliche Fehlermeldung
      }
      setTimeout(() => (notification.value = ''), 2500);// Notification nach 2,5 Sekunden ausblenden
    }

    async function bookAndRemove() {// Simuliert eine Buchung: Eintrag wird aktualisiert, bestätigt und danach aus der Merkliste entfernt
      if (!editingItem.value) return;// Ohne ausgewähltes Item keine Aktion
      const itemId = editingItem.value.id;// ID des zu buchenden Eintrags
      const itemName = editingItem.value.name;// Name der Unterkunft, um ihn in der Bestätigung anzuzeigen
      
      const updated = {// Aktualisierte Buchungsdaten (Personen/Nächte/Gesamtpreis)
        persons: Number(editPersons.value) || 1,
        nights: Number(editNights.value) || 1,
        totalPrice: Number(editTotal.value) || 0
      };

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${itemId}`, {
          method: 'PUT',// Erst ein Update des Eintrags, damit die gebuchten Werte gespeichert sind
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        
        if (res.ok) {// Nur wenn das Update erfolgreich war, wird die „Buchung“ bestätigt
          editingItem.value = null;// Bearbeitungs-Popup schließen
          bookingConfirm.value = itemName;// Name der Unterkunft setzen, um eine Buchungsbestätigung im UI anzuzeigen
          await new Promise(resolve => setTimeout(resolve, 3000));// Bestätigung für ca. 3 Sekunden sichtbar lassen
          
          
          try {
            await fetch(`http://127.0.0.1:5000/api/wishlist/${itemId}`, {
              method: "DELETE"// Danach den Eintrag endgültig von der Merkliste entfernen
            });
            await loadWishlist();// Merkliste erneut laden, damit der Eintrag verschwindet
          } catch (err) {
            console.error('Fehler beim Entfernen', err);// Fehler beim Entfernen separat loggen
          }
          
          bookingConfirm.value = null;// Bestätigungszustand zurücksetzen
        }
      } catch (err) {
        console.error('Fehler beim Buchen', err);// Fehler beim Buchungsvorgang loggen
        notification.value = 'Fehler beim Buchen';// Nutzerfreundliche Fehlermeldung
      }
      setTimeout(() => (notification.value = ''), 3000);// Notification nach 3 Sekunden ausblende
    }

    
    loadWishlist();// Direkt beim Laden der Seite die aktuelle Merkliste vom Backend holen

    return { wishlist, removeFromWishlist, openEditPopup, notification, editingItem, editPersons, editNights, saveEdit, cancelEdit, editTotal, bookAndRemove, bookingConfirm };
  },// Alle Zustände und Funktionen, die im Template verwendet werden
  template: `
    <div>
      <h1>Merkliste</h1>
      <div class="notification" v-if="notification">{{ notification }}</div>
      <div class="accommodation-grid" v-if="wishlist.length">
        <div v-for="item in wishlist" :key="item.id" class="accommodation-card wishlist-card">
          <div class="card-image-container">
            <img :src="item.image" alt="Bild" class="card-image" v-if="item.image" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <div>
                <h3 class="card-title">{{ item.name }}</h3>
                <p class="card-location">{{ item.city }} • {{ item.type }}</p>
              </div>
              <div class="card-persons-badge">{{ item.persons }} 👤</div>
            </div>

            <p class="card-nights-info">{{ item.nights }} Nacht{{ item.nights > 1 ? 'e' : '' }}</p>

            <p class="card-description">{{ item.description }}</p>

            <div class="card-footer">
              <div class="footer-total">
                <span class="total-label">Gesamtpreis</span>
                <span class="total-amount">{{ item.totalPrice.toFixed(2) }} €</span>
              </div>
            </div>

            <div class="wishlist-actions-bottom">
              <button class="wishlist-btn-alt danger" @click="removeFromWishlist(item)">Löschen</button>
              <button class="wishlist-btn-alt primary" @click="openEditPopup(item)">Ändern</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else>Die Merkliste ist leer.</p>

      <!-- Booking Confirmation Popup -->
      <div v-if="bookingConfirm" class="booking-popup-overlay">
        <div class="booking-popup booking-confirm-modal">
          <div class="confirm-content">
            <h2>✅ Unterkunft erfolgreich gebucht!</h2>
            <p>{{ bookingConfirm }}</p>
          </div>
        </div>
      </div>

      
      <div v-if="editingItem" class="booking-popup-overlay" @click="cancelEdit">
        <div class="booking-popup" @click.stop>
          <div class="popup-header">
            <h2>{{ editingItem.name }}</h2>
            <button class="popup-close" @click="cancelEdit">×</button>
          </div>
          <div class="popup-details">
            <img :src="editingItem.image" alt="" class="popup-image" v-if="editingItem.image" />
            <div class="hotel-info">
              <p><strong>{{ editingItem.city }}</strong> • {{ editingItem.type }}</p>
              <p class="price-per-night">{{ parseFloat(editingItem.price).toFixed(2) }} € / Nacht</p>
              <p v-if="editingItem.rating">⭐ {{ editingItem.rating }}/5</p>
              <p>Max. {{ editingItem.max_persons }} Personen</p>
            </div>
          </div>
          <div class="popup-description">
            <p><strong>Beschreibung:</strong> {{ editingItem.description }}</p>
            <p v-if="editingItem.features && editingItem.features.length">
              <strong>Ausstattung:</strong> {{ editingItem.features.join(', ') }}
            </p>
          </div>
          <div class="booking-form">
            <div class="form-group">
              <label>Anzahl Personen:</label>
              <select v-model.number="editPersons" class="form-input">
                <option v-for="p in editingItem.max_persons" :key="p" :value="p">{{ p }} Person{{ p>1? 'en':'e' }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Anzahl Nächte:</label>
              <input type="number" v-model.number="editNights" min="1" max="60" class="form-input" />
            </div>
            <div class="total-price">
              <h3>Gesamtpreis: {{ editTotal.toFixed(2) }} €</h3>
            </div>
            <div style="display:flex;gap:.8rem;margin-top:14px;">
              <button class="book-now-btn danger-popup" @click="saveEdit">Schließen</button>
              <button class="book-now-btn" @click="bookAndRemove">Buchen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

Vue.createApp(wishlistApp).mount('#wishlist-app');