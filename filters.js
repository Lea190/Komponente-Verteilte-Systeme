const { createApp, ref } = Vue;

const filtersApp = {
  setup() {
    // Optionen für Checkbox-Filter
    const filterOptions = ref({
      type: [
        { label: 'Hotel', value: 'Hotel' },
        { label: 'Wohnung', value: 'Wohnung' },
        { label: 'Hostel', value: 'Hostel' }
      ],
      features: [
        { label: 'Terrasse', value: 'Terrasse' },
        { label: 'Spa', value: 'Spa' }
      ]
    });

    // Ausgewählte Filter
    const selected = ref({
      type: [],
      ratingStars: null,   // 1–5
      features: []
    });

    // Für globalen Zugriff aus app.js
    window.filtersSelected = selected;

    const hoverStars = ref(0);

    const handleStarEnter = (n) => {
      hoverStars.value = n;
    };

    const handleStarLeave = () => {
      hoverStars.value = 0;
    };

    const handleStarClick = (n) => {
      // Toggle: erneuter Klick auf gleichen Stern setzt zurück
      selected.value.ratingStars =
        selected.value.ratingStars === n ? null : n;
    };

    return {
      filterOptions,
      selected,
      hoverStars,
      handleStarEnter,
      handleStarLeave,
      handleStarClick
    };
  },
  template: `
    <div>
      <!-- Typ -->
      <div class="filter-category">
        <h4>Typ</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.type" :key="opt.value">
            <input
              type="checkbox"
              :value="opt.value"
              v-model="selected.type"
            >
            {{ opt.label }}
          </label>
        </div>
      </div>

      <!-- Bewertung -->
      <div class="filter-category">
        <h4>Bewertung</h4>
        <div class="star-rating-filter">
          <span
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{
              filled:
                (hoverStars && n <= hoverStars) ||
                (!hoverStars && selected.ratingStars >= n)
            }"
            @mouseenter="handleStarEnter(n)"
            @mouseleave="handleStarLeave"
            @click="handleStarClick(n)"
          >
            ★
          </span>
          <small>{{ selected.ratingStars ? \`Ab \${selected.ratingStars} Sterne\` : 'Alle' }}</small>
        </div>
      </div>

      <!-- Ausstattung -->
      <div class="filter-category">
        <h4>Ausstattung</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.features" :key="opt.value">
            <input
              type="checkbox"
              :value="opt.value"
              v-model="selected.features"
            >
            {{ opt.label }}
          </label>
        </div>
      </div>
    </div>
  `
};

createApp(filtersApp).mount('#filters-container');
