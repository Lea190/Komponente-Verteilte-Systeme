const { createApp, ref, computed } = Vue;

const filtersApp = {
  setup() {
    // Optionen für die Checkboxen
    const filterOptions = ref({
      type: [
        { label: "Hotel", value: "Hotel" },
        { label: "Wohnung", value: "Wohnung" },
        { label: "Hostel", value: "Hostel" }
      ],
      rating: [
        { label: "Ab 8,0", value: 8 },
        { label: "Ab 9,0", value: 9 }
      ],
      features: [
        { label: "Terrasse", value: "Terrasse" },
        { label: "Spa", value: "Spa" }
      ]
    });

    // Vom Nutzer ausgewählte Filter 
    const selected = ref({
      type: [],
      rating: [],
      features: []
    });

    // Für globalen Zugriff aus app.js
    window.filtersSelected = selected;

    return { filterOptions, selected };
  },
  template: `
    <div>
      <div class="filter-category">
        <h4>Typ</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.type" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.type" />
            {{ opt.label }}
          </label>
        </div>
      </div>
      <div class="filter-category">
        <h4>Bewertung</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.rating" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.rating" />
            {{ opt.label }}
          </label>
        </div>
      </div>
      <div class="filter-category">
        <h4>Ausstattung</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.features" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.features" />
            {{ opt.label }}
          </label>
        </div>
      </div>
    </div>
  `
};

createApp(filtersApp).mount("#filters");
