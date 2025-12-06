const App = {
  setup() {
    // 🔥 NEU: Filters initialisieren (für Startseite wichtig!)
    if (!window.filtersSelected) {
      window.filtersSelected = Vue.ref({
        type: [],
        rating: [],
        features: []
      });
    }

    const accommodations = Vue.ref([]);
    
    // 🔥 GEÄNDERT: Reaktiv auf window.filtersSelected hören
    const selected = Vue.computed(() => window.filtersSelected.value);
    
    const wishlist = Vue.ref([]);              // wird vom Backend geladen
    const selectedAccommodation = Vue.ref(null);
    const notification = Vue.ref("");
    const persons = Vue.ref(1);
    const nights = Vue.ref(1);

    const totalPrice = Vue.computed(() => {
      if (!selectedAccommodation.value) return 0;
      return persons.value * nights.value * parseFloat(selectedAccommodation.value.price);
    });

    // Unterkünfte vom Backend laden
    async function loadAccommodations() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/accommodations");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        accommodations.value = await res.json();
        // Stadt-Parameter aus localStorage statt URL
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
          accommodations.value = accommodations.value.filter(hotel => hotel.city === savedCity);
          console.log(`Gefiltert nach Stadt: ${savedCity}`);
        }
        console.log("✓ Unterkünfte geladen:", accommodations.value.length);
      } catch (err) {
        console.error("✗ Fehler beim Laden der Unterkünfte:", err);
        notification.value = "Fehler beim Laden der Unterkünfte";
      }
    }

    // Merkliste vom Backend laden
    async function loadWishlist() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/wishlist");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        wishlist.value = await res.json();
        console.log("✓ Merkliste geladen");
      } catch (err) {
        console.error("✗ Fehler beim Laden der Merkliste:", err);
      }
    }


    // Direkt beim Start Daten ziehen
    loadAccommodations();
    loadWishlist();

  const filteredAccommodations = Vue.computed(() => {
  const s = selected.value;
 

  
  // Filter aktiv? (inkl. Preis-Sortierung)
  const filtersActive =
  s.type?.length > 0 ||
  s.ratingStars > 0 ||
  s.features?.length > 0 ||
  s.priceSort ||
  s.minPrice !== 30 ||
  s.maxPrice !== 400;

  
  if (!filtersActive) return accommodations.value;
  
  // ALLE Filter KORREKT pro Hotel anwenden
 let result = accommodations.value.filter(hotel => {
  const typeOk =
    !s.type || s.type.length === 0 || s.type.includes(hotel.type);

  const ratingOk =
    !s.ratingStars || parseInt(hotel.rating) >= s.ratingStars;

  const featOk =
    !s.features || s.features.length === 0 ||
    // Änderung: OR-Verhalten — mindestens eine ausgewählte Eigenschaft genügt
    s.features.some(f => hotel.features.includes(f));

  const price = parseFloat(hotel.price); // kommt vom Backend als Zahl/String
  const priceOk =
    (!s.minPrice || price >= s.minPrice) &&
    (!s.maxPrice || price <= s.maxPrice);

  return typeOk && ratingOk && featOk && priceOk;
});

  
  // NEU: Preis-Sortierung NACH dem Filtern
  if (s.priceSort === 'asc') {
    result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (s.priceSort === 'desc') {
    result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }
  
  return result;
});


    function selectAccommodation(item) {
  selectedAccommodation.value = item;
  persons.value = 1;
  nights.value = 1;
}



    async function addToWishlist(item) {
      const res = await fetch("http://127.0.0.1:5000/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      notification.value = data.message || "Fehler beim Aktualisieren der Merkliste";

      if (res.ok) {
        await loadWishlist();
      }

      setTimeout(() => {
        notification.value = "";
      }, 3000);
    }
    async function addToWishlistWithSelection() {
  if (!selectedAccommodation.value) return;

  const item = {
    ...selectedAccommodation.value,
    persons: persons.value,
    nights: nights.value,
    totalPrice: totalPrice.value,
  };

  try {
    const res = await fetch("http://127.0.0.1:5000/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    const data = await res.json();
    notification.value = data.message || "Zur Merkliste hinzugefügt";

    if (res.ok) {
      await loadWishlist();
      closePopup();
    }
  } catch (err) {
    console.error("Fehler beim Aktualisieren der Merkliste", err);
    notification.value = "Fehler beim Aktualisieren der Merkliste";
  }

  setTimeout(() => (notification.value = ""), 3000);
}


    function closePopup() {
  selectedAccommodation.value = null;
}
function confirmBooking() {
  alert(
    `Buchung bestätigt:\n${selectedAccommodation.value.name}\n` +
    `${persons.value} Personen, ${nights.value} Nächte\n` +
    `Gesamt: ${totalPrice.value.toFixed(2)} €`
  );
  closePopup();
}


    return {
      filteredAccommodations,
      selectAccommodation,
      selectedAccommodation,
      addToWishlist,
      addToWishlistWithSelection,
      closePopup,
      notification,
      wishlist,
      persons,
      nights,
      totalPrice,
    };

  },

  template: `
  <div class="app">
    <div class="notification" v-if="notification">
      {{ notification }}
    </div>

    <div class="accommodation-grid">
  <div 
    v-for="item in filteredAccommodations" 
    :key="item.id" 
    class="accommodation-card" 
    @click="selectAccommodation(item)"
  >
    <!-- 🔥 GEÄNDERT: hotelImages auskommentiert (Backend liefert Bilder) -->
    <img 
      :src="item.image" 
      alt="Unterkunft" 
      class="card-image"
    >
    <div class="card-content">
      <h3 class="card-title">{{ item.name }}</h3>
      <p class="card-location">{{ item.city }} • {{ item.type }}</p>
      <p class="card-price">{{ item.price.toFixed(2) }} € / Nacht</p>
      <p class="card-rating">⭐ {{ item.rating }}/5 </p>
      <p class="person-icons">
        <span 
          v-for="n in item.max_persons" 
          :key="n" 
          class="person-icon"
        >👤</span>
      </p>
    </div>
  </div>
</div>

    <div v-if="selectedAccommodation" class="booking-popup-overlay" @click="closePopup">
  <div class="booking-popup" @click.stop>
    <div class="popup-header">
      <h2>{{ selectedAccommodation.name }}</h2>
      <div class="star-rating">
        <span
          v-for="n in 5"
          :key="n"
          class="star"
          :class="{ filled: n <= Math.round(selectedAccommodation.rating) }"
        >
          ★
        </span>
        <span class="rating-text">({{ selectedAccommodation.rating }} / 5)</span>
      </div>
      <button class="popup-close" @click="closePopup">×</button>
    </div>

    <div class="popup-details">
      <img
        :src="selectedAccommodation.image"
        :alt="selectedAccommodation.name"
        class="popup-image"
      >
      <div class="hotel-info">
        <p><strong>{{ selectedAccommodation.city }}</strong> • {{ selectedAccommodation.type }}</p>
        <p class="price-per-night">{{ selectedAccommodation.price.toFixed(2) }} € / Nacht</p>
        <p>Max. {{ selectedAccommodation.max_persons }} Personen</p>
      </div>
    </div>
    <div class="popup-description">
  <p><strong>Beschreibung:</strong> {{ selectedAccommodation.description }}</p>
  <p>
    <strong>Ausstattung:</strong>
    {{
      selectedAccommodation.features && selectedAccommodation.features.length
        ? selectedAccommodation.features.join(', ')
        : 'Keine'
    }}
  </p>
</div>

    <div class="booking-form">
      <div class="form-group">
        <label>Anzahl Personen:</label>
        <select v-model="persons" class="form-input">
          <option
            v-for="p in selectedAccommodation.max_persons"
            :key="p"
            :value="p"
          >
            {{ p }} Person{{ p > 1 ? 'en' : 'e' }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Anzahl Nächte:</label>
        <input
          type="number"
          v-model.number="nights"
          min="1"
          max="30"
          class="form-input"
        >
      </div>

      <div class="total-price">
        <h3>Gesamtpreis: {{ totalPrice.toFixed(2) }} €</h3>
        <p class="price-breakdown">
          ({{ persons }} Personen × {{ nights }} Nächte × {{ selectedAccommodation.price.toFixed(2) }} €)
        </p>
      </div>

      <button class="book-now-btn" style="margin-top:10px;background:#2ecc71"
        @click="addToWishlistWithSelection">
        Zur Merkliste
      </button>
    </div>
  </div>
</div>

    </div>
  </div>
  `
};

// Vue-App starten und an HTML-Element binden
Vue.createApp(App).mount('#app');
