const wishlistApp = {
  setup() {
    const wishlist = Vue.ref([]);
    const notification = Vue.ref("");

    async function loadWishlist() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/wishlist");
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.json();
        wishlist.value = raw.map(it => {
          const priceNum = parseFloat(it.price) || 0;
          const persons = Number(it.persons) || 1;
          const nights = Number(it.nights) || 1;
          const totalPrice = (it.totalPrice !== undefined && it.totalPrice !== null)
            ? Number(it.totalPrice)
            : priceNum * persons * nights;
          return {
            ...it,
            persons,
            nights,
            totalPrice,
            max_persons: Number(it.max_persons || it.maxpersons || it.maxPersonen || it.max_Personen) || 1,
            image: it.image || it.image_url || it.Bild_URL || it.BildURL || ''
          };
        });
      } catch (err) {
        console.error('Fehler beim Laden der Merkliste', err);
        notification.value = 'Fehler beim Laden der Merkliste';
      }
    }

    async function removeFromWishlist(item) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${item.id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        notification.value = data.message || 'Entfernt';
        await loadWishlist();   // Liste aktualisieren
      } catch (err) {
        console.error('Fehler beim Entfernen', err);
        notification.value = 'Fehler beim Entfernen';
      }
      setTimeout(() => (notification.value = ''), 2500);
    }

    const editingItem = Vue.ref(null);
    const editPersons = Vue.ref(1);
    const editNights = Vue.ref(1);
    const bookingConfirm = Vue.ref(null);
    const expandedId = Vue.ref(null);

    function openEditPopup(item) {
      editingItem.value = item;
      editPersons.value = Number(item.persons) || 1;
      editNights.value = Number(item.nights) || 1;
    }

    function cancelEdit() {
      editingItem.value = null;
    }

    function toggleDescription(item) {
      expandedId.value = expandedId.value === item.id ? null : item.id;
    }

    const editTotal = Vue.computed(() => {
      const price = parseFloat(editingItem.value?.price) || 0;
      return (price * (Number(editPersons.value) || 1) * (Number(editNights.value) || 1));
    });

    async function saveEdit() {
      if (!editingItem.value) return;
      const updated = {
        persons: Number(editPersons.value) || 1,
        nights: Number(editNights.value) || 1,
        totalPrice: Number(editTotal.value) || 0
      };

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${editingItem.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        const data = await res.json();
        notification.value = data.message || 'Aktualisiert';
        if (res.ok) {
          await loadWishlist();
          editingItem.value = null;
        }
      } catch (err) {
        console.error('Fehler beim Aktualisieren', err);
        notification.value = 'Fehler beim Aktualisieren';
      }
      setTimeout(() => (notification.value = ''), 2500);
    }

    async function bookAndRemove() {
      if (!editingItem.value) return;
      const itemId = editingItem.value.id;
      const itemName = editingItem.value.name;
      
      const updated = {
        persons: Number(editPersons.value) || 1,
        nights: Number(editNights.value) || 1,
        totalPrice: Number(editTotal.value) || 0
      };

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        
        if (res.ok) {
          editingItem.value = null;
          bookingConfirm.value = itemName;
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Jetzt das Item löschen
          try {
            await fetch(`http://127.0.0.1:5000/api/wishlist/${itemId}`, {
              method: "DELETE"
            });
            await loadWishlist();
          } catch (err) {
            console.error('Fehler beim Entfernen', err);
          }
          
          bookingConfirm.value = null;
        }
      } catch (err) {
        console.error('Fehler beim Buchen', err);
        notification.value = 'Fehler beim Buchen';
      }
      setTimeout(() => (notification.value = ''), 3000);
    }

    // beim Start laden
    loadWishlist();

    return { wishlist, removeFromWishlist, openEditPopup, notification, editingItem, editPersons, editNights, saveEdit, cancelEdit, editTotal, expandedId, toggleDescription, bookAndRemove, bookingConfirm };
  },
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

      <!-- Edit Popup -->
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