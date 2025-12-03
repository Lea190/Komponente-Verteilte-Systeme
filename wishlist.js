const wishlistApp = {
  setup() {
    const wishlist = Vue.ref([]);

    async function loadWishlist() {
      const res = await fetch("http://127.0.0.1:5000/api/wishlist");
      wishlist.value = await res.json();
    }

    async function removeFromWishlist(item) {
      await fetch(`http://127.0.0.1:5000/api/wishlist/${item.id}`, {
        method: "DELETE"
      });
      await loadWishlist();   // Liste aktualisieren
    }

    // beim Start laden
    loadWishlist();

    return { wishlist, removeFromWishlist };
  },
  template: `
    <div>
      <h1>Merkliste</h1>
      <div class="accommodation-grid" v-if="wishlist.length">
        <div v-for="item in wishlist" :key="item.id" class="accommodation-card">
          <div class="card-content">
            <div class="card-title">
              {{ item.name }} <span class="card-type">{{ item.type }}</span>
            </div>
            <div class="card-rating">Bewertung: {{ item.rating }}</div>
            <div class="card-features">
              Ausstattung: {{ item.features && item.features.length ? item.features.join(', ') : 'Keine' }}
            </div>
            <div class="card-description">{{ item.description }}</div>
            <button @click="removeFromWishlist(item)">Löschen</button>
          </div>
        </div>
      </div>
      <p v-else>Die Merkliste ist leer.</p>
    </div>
  `
};

Vue.createApp(wishlistApp).mount('#wishlist-app');
