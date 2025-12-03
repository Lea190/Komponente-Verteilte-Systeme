//const hotelImages = {
  //1: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  //2: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80",
  //3: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80",
  //4: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=400&q=80"
//};

const App = {
  setup() {
    const accommodations = Vue.ref([]);
    const selected = window.filtersSelected?.value || { type: [], rating: [], features: [] };
    const wishlist = Vue.ref([]);              // wird vom Backend geladen
    const selectedAccommodation = Vue.ref(null);
    const notification = Vue.ref("");

    // Unterkünfte vom Backend laden
    async function loadAccommodations() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/accommodations");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        accommodations.value = await res.json();
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
      const filtersActive =
        selected.type.length > 0 ||
        selected.rating.length > 0 ||
        selected.features.length > 0;

      if (!filtersActive) return accommodations.value;

      return accommodations.value.filter(hotel => {
        const typeOk   = !selected.type.length   || selected.type.includes(hotel.type);
        const ratingOk = !selected.rating.length || selected.rating.some(r => hotel.rating >= r);
        const featOk   = !selected.features.length || selected.features.every(f => hotel.features.includes(f));
        return typeOk && ratingOk && featOk;
      });
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

    <div class="cards">
      <div
        v-for="item in filteredAccommodations"
        :key="item.id"
        class="card"
        @click="selectAccommodation(item)"
      >
        <img :src="item.image || hotelImages[item.id]" alt="" class="card-image" />
        <h3>{{ item.name }}</h3>
        <p>{{ item.city }} · {{ item.type }}</p>
        <p>{{ item.price.toFixed(2) }} € pro Nacht · max. {{ item.max_persons }} Personen</p>
        <p>Bewertung: {{ item.rating }}</p>
      </div>
    </div>

    <div v-if="selectedAccommodation" class="popup">
      <div class="popup-content">
        <button class="popup-close" @click="closePopup">×</button>

        <img :src="selectedAccommodation.image || hotelImages[selectedAccommodation.id]" alt="" class="popup-image" />

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
