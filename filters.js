const { createApp, ref } = Vue;

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
      features: [
        { label: 'Terrasse', value: 'Terrasse' },
        { label: 'Spa', value: 'Spa' }
      ]
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


    // NEU: Sortierungs-Update (Trigger für app.js)
    const updateSorting = () => {
      console.log('Preis-Sortierung geändert:', selected.value.priceSort);
    };

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
          <small>{{ selected.ratingStars ? \`Ab \${selected.ratingStars} Sterne\` : 'Alle' }}</small>
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
      <!-- NEU: Preis-Sortierung -->
      <div class="filter-category">
        <h4>Preis sortieren</h4>
        <select v-model="selected.priceSort" class="price-sort-select" @change="updateSorting">
          <option value="">Standard</option>
          <option value="asc">Preis aufsteigend</option>
          <option value="desc">Preis absteigend</option>
        </select>
      </div>
    </div>
   
  `
};

createApp(filtersApp).mount('#filters-container');
