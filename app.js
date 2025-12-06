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

    // Unterkünfte vom Backend laden
    async function loadAccommodations() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/accommodations");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        accommodations.value = await res.json();
        const urlParams = new URLSearchParams(window.location.search);
        const selectedStadt = urlParams.get('stadt');
        if (selectedStadt) {
          accommodations.value = accommodations.value.filter(hotel => hotel.city === selectedStadt);
          // 🔥 GEÄNDERT: Sicherstellen dass window.filtersSelected existiert
          if (window.filtersSelected) {
            window.filtersSelected.value.stadt = [selectedStadt];
          }
          console.log(`Gefiltert nach Stadt: ${selectedStadt}`);
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
    s.features.every(f => hotel.features.includes(f));

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

    function closePopup() {
      selectedAccommodation.value = null;
      notification.value = ""; // Info-Kasten ausblenden bei Schließen
    }

    return {
      filteredAccommodations,
      selectAccommodation,
      selectedAccommodation,
      addToWishlist,
      closePopup,
      notification,
      wishlist
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

    <div v-if="selectedAccommodation" class="popup">
      <div class="popup-content">
        <button class="popup-close" @click="closePopup">×</button>

        <!-- 🔥 GEÄNDERT: hotelImages auskommentiert -->
        <img :src="selectedAccommodation.image" alt="" class="popup-image" />

        <h2>{{ selectedAccommodation.name }}</h2>
        <p>{{ selectedAccommodation.city }} · {{ selectedAccommodation.type }}</p>
        <p>Preis: {{ selectedAccommodation.price.toFixed(2) }} € pro Nacht</p>
        <p>Max. Personen: {{ selectedAccommodation.max_persons }}</p>

        <p>Beschreibung: {{ selectedAccommodation.description }}</p>

        <p>
          Ausstattung:
          {{
            selectedAccommodation.features && selectedAccommodation.features.length
              ? selectedAccommodation.features.join(', ')
              : 'Keine'
          }}
        </p>

        <button @click="addToWishlist(selectedAccommodation)">
          Zur Merkliste
        </button>
      </div>
    </div>
  </div>
  `
};

// Vue-App starten und an HTML-Element binden
Vue.createApp(App).mount('#app');
