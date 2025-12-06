const { ref, onMounted } = Vue;

const filtersApp = {
  setup() {
    // Bestehende Filter-Optionen
    const filterOptions = ref({
      type: [
        { label: 'Hotel', value: 'Hotel' },
        { label: 'Wohnung', value: 'Wohnung' },
        { label: 'Hostel', value: 'Hostel' }
      ],
      rating: [], // Jetzt leer - Sterne übernehmen das
      features: [] // wird dynamisch aus der API befüllt
    });

    // Erweiterte Filter inklusive NEU: priceSort
    // Erweiterte Filter inklusive Preisbereich & Sortierung
const selected = ref({
  type: [],
  rating: [],          // ungenutzt, aber ok
  ratingStars: null,
  features: [],
  priceSort: '',       // 'asc', 'desc' oder ''
  minPrice: 30,        // NEU: Mindestpreis
  maxPrice: 400        // NEU: Höchstpreis
});

// Global für app.js verfügbar
window.filtersSelected = selected;

// Filter in localStorage speichern
const saveFiltersToStorage = () => {
  localStorage.setItem('savedFilters', JSON.stringify(selected.value));
};

// Filter aus localStorage laden
const loadFiltersFromStorage = () => {
  const saved = localStorage.getItem('savedFilters');
  if (saved) {
    try {
      const filters = JSON.parse(saved);
      selected.value = { ...selected.value, ...filters };
    } catch (err) {
      console.error('Fehler beim Laden gespeicherter Filter:', err);
    }
  }
};

// Filter beobachten und speichern
Vue.watch(() => selected.value, saveFiltersToStorage, { deep: true });


    // Bestehender Sternen-Code bleibt gleich
    const hoverStars = ref(0);
    const handleStarEnter = (n) => { hoverStars.value = n; };
    const handleStarLeave = () => { hoverStars.value = 0; };
    // DEIN bewährter Stern-Klick Handler (ersetzt die alte)
const handleStarClick = (event) => {
  const star = event.target.closest('.star');
  if (!star) return;
  
  const stars = parseInt(star.dataset.stars);
  // Toggle: Klick auf aktuell ausgewählten Stern = zurücksetzen
  selected.value.ratingStars = selected.value.ratingStars === stars ? null : stars;
};


    // Lade verfügbare Features dynamisch aus dem Backend
    async function loadFeatures() {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/accommodations');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const daten = await res.json();

        const set = new Set();
        daten.forEach(item => {
          if (!item.features) return;
          // item.features sollte ein Array sein (Server teilt es so)
          item.features.forEach(f => {
            if (!f) return;
            set.add(String(f).trim());
          });
        });

        const features = Array.from(set).filter(Boolean).sort((a,b)=> a.localeCompare(b, 'de'));
        filterOptions.value.features = features.map(f => ({ label: f, value: f }));
      } catch (err) {
        console.error('Fehler beim Laden der Features:', err);
        // Falls Fehler, einfach nichts anzeigen (oder Defaults belassen)
      }
    }

    // NEU: Sortierungs-Update (Trigger für app.js)
    const updateSorting = () => {
      console.log('Preis-Sortierung geändert:', selected.value.priceSort);
    };

    onMounted(() => {
      loadFiltersFromStorage();
      loadFeatures();
    });

    return {
      filterOptions, selected, hoverStars,
      handleStarEnter, handleStarLeave, handleStarClick, updateSorting
    };
  },
  template: `
    <div>
      <!-- Typ-Filter (bestehend) -->
      <div class="filter-category">
        <h4>Typ</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.type" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.type">
            {{ opt.label }}
          </label>
        </div>
      </div>

      <!-- Bewertung Sterne Filter (NEU) -->
      <div class="filter-category">
        <h4>Bewertung</h4>
        <div class="star-rating-filter">
          <span v-for="n in 5" 
          :key="n" 
          class="star" 
          :data-stars="n"
          :class="{ 
            'filled': (hoverStars >= n) || (selected.ratingStars >= n)
          }"
                 @mouseenter="handleStarEnter(n)"
                 @mouseleave="handleStarLeave"
                 @click="handleStarClick">★</span>
          <small>{{ selected.ratingStars ? ('Ab ' + selected.ratingStars + ' Sterne') : 'Alle' }}</small>
        </div>
      </div>

      <!-- NEU: Preis-Sortierung -->
      <div class="filter-category">
        <h4>Preis sortieren</h4>
        <select v-model="selected.priceSort" class="price-sort-select" @change="updateSorting">
          <option value="">Standard</option>
          <option value="asc">Preis aufsteigend</option>
          <option value="desc">Preis absteigend</option>
        </select>
      </div>

      <!-- Budget (pro Nacht) -->
      <div class="filter-category">
        <h4>Ihr Budget (pro Nacht)</h4>

        <div class="price-labels">
          <span>€ {{ selected.minPrice }}</span>
          <span>€ {{ selected.maxPrice }}+</span>
        </div>

        <div class="double-price-slider">
          <input
            type="range"
            min="30"
            max="400"
            step="5"
            v-model.number="selected.minPrice"
            @input="selected.minPrice = Math.min(selected.minPrice, selected.maxPrice - 10)"
            class="price-slider"
          />
          <input
            type="range"
            min="30"
            max="400"
            step="5"
            v-model.number="selected.maxPrice"
            @input="selected.maxPrice = Math.max(selected.maxPrice, selected.minPrice + 10)"
            class="price-slider"
          />
        </div>

      </div>

      <!-- Ausstattung (bestehend) -->
      <div class="filter-category">
        <h4>Ausstattung</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.features" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.features">
            {{ opt.label }}
          </label>
        </div>
      </div>
    </div>
   
  `
};

// Nur mounten, wenn das Ziel-Element auf der Seite existiert
const _filtersMountEl = document.getElementById('filters-container');
if (_filtersMountEl) {
  Vue.createApp(filtersApp).mount(_filtersMountEl);
}
