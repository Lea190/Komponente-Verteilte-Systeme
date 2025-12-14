const { ref, onMounted } = Vue;// Destrukturierung aus Vue: ref für reaktive Werte, onMounted für Code, der beim Mounten der Komponente ausgeführt wird

const filtersApp = {// Eigenständige Vue-App/Komponente für den Filterbereich
  setup() {// setup-Funktion der Composition API: hier definiere ich Zustand und Logik der Filter
    
    const filterOptions = ref({// Reaktives Objekt mit allen auswählbaren Filteroptionen, die das UI anzeigen soll
      type: [// Vordefinierte Auswahlmöglichkeiten für den Unterkunftstyp
        { label: 'Hotel', value: 'Hotel' },// Anzeige-Label und tatsächlicher Wert "Hotel"
        { label: 'Wohnung', value: 'Wohnung' },// "Wohnung" als weitere Option
        { label: 'Hostel', value: 'Hostel' }// "Hostel" als Option
      ],
      rating: [], // Platzhalter für mögliche Rating-Optionen (aktuell nicht befüllt)
      features: [] // Wird dynamisch mit Ausstattungsmerkmalen aus den Backend-Daten gefüllt
    });

    
const selected = ref({// Reaktives Objekt für die aktuell ausgewählten Filterwerte
      type: [], // Liste der ausgewählten Unterkunftstypen
      rating: [], // Liste der ausgewählten Rating-Optionen (nicht direkt genutzt, aber vorbereitet)
      ratingStars: null, // Ausgewählte Mindestanzahl an Sternen als Zahl (z.B. 4 Sterne)
      features: [], // Ausgewählte Ausstattungsmerkmale als Array von Strings
      priceSort: '', // Sortierreihenfolge für den Preis: '' (keine), 'asc' oder 'desc'
      minPrice: 30, // Untere Grenze für den Preisfilter (Standardwert)
      maxPrice: 400 // Obere Grenze für den Preisfilter (Standardwert)
});


window.filtersSelected = selected;// Speichert die reaktiven ausgewählten Filter global im window-Objekt, damit andere Dateien (z.B. app.js) darauf zugreifen können


const saveFiltersToStorage = () => {// Hilfsfunktion, um den aktuellen Filterzustand im Local Storage des Browsers zu speichern
  localStorage.setItem('savedFilters', JSON.stringify(selected.value));// Serialisiert das selected-Objekt als JSON-String und speichert es unter dem Schlüssel 'savedFilters'
};


const loadFiltersFromStorage = () => {// Hilfsfunktion, um gespeicherte Filter aus dem Local Storage wieder zu laden
  const saved = localStorage.getItem('savedFilters');// Holt den gespeicherten JSON-String, falls vorhanden
  if (saved) {// Nur weiter machen, wenn es überhaupt gespeicherte Filter gibt
    try {
      const filters = JSON.parse(saved);// JSON-String zurück in ein JavaScript-Objekt umwandeln
      selected.value = { ...selected.value, ...filters };// Bestehende Standardwerte mit den gespeicherten Werten überschreiben (Merge der Objekte)
    } catch (err) {
      console.error('Fehler beim Laden gespeicherter Filter:', err);// Fehler loggen, falls der JSON-String nicht lesbar ist
    }
  }
};


Vue.watch(() => selected.value, saveFiltersToStorage, { deep: true });// Vue-Watcher, der auf Änderungen am selected-Objekt reagiert// Beobachteter Ausdruck: das gesamte selected-Objekt
// Callback-Funktion, die bei jeder Änderung aufgerufen wird und die Filter speichert// deep: true bedeutet, dass auch Änderungen in verschachtelten Eigenschaften erkannt werden (z.B. Arrays)

    
    const hoverStars = ref(0);// Reaktive Zahl, die speichert, über wie vielen Sternen die Maus aktuell hovert (für Hover-Effekt der Sterne)
    const handleStarEnter = (n) => { hoverStars.value = n; };// Eventhandler, wenn die Maus über einen Stern fährt// Setzt die aktuell "gehoverte" Sternanzahl, um z.B. visuelles Feedback zu geben
    const handleStarLeave = () => { hoverStars.value = 0; };// Eventhandler, wenn die Maus den Sternebereich wieder verlässt// Setzt den Hover-Zustand zurück, damit keine Sterne mehr hervorgehoben sind
    
const handleStarClick = (event) => {// Eventhandler, wenn ein Stern angeklickt wird
  const star = event.target.closest('.star');// Sucht das nächste Element mit der Klasse .star (falls das Icon innerhalb liegt)
  if (!star) return;// Falls kein Stern-Element gefunden wurde, bricht die Funktion ohne Änderung ab
  
  const stars = parseInt(star.dataset.stars);// Liest aus dem data-stars-Attribut, wie viele Sterne dieser Klick repräsentiert (z.B. 3)
  // Toggle-Logik: Wenn der gleiche Stern erneut geklickt wird, wird der Filter wieder zurückgenommen
  selected.value.ratingStars = selected.value.ratingStars === stars ? null : stars;// Setzt den ausgewählten Sternwert oder entfernt ihn
};


    
    async function loadFeatures() {// Asynchrone Funktion, um alle Features (Ausstattungsmerkmale) aus den Unterkünften dynamisch zu generieren
      try {
        const res = await fetch('http://127.0.0.1:5000/api/accommodations');// HTTP-GET-Request an das Backend, um alle Unterkünfte zu laden
        if (!res.ok) throw new Error('HTTP ' + res.status);// Fehler werfen, wenn der HTTP-Status kein Erfolg ist
        const daten = await res.json();// Antwort-JSON in ein JavaScript-Array umwandeln

        const set = new Set();// Set, um doppelte Features zu vermeiden (jede Ausstattung nur einmal)
        daten.forEach(item => {// Für jede Unterkunft in den geladenen Daten
          if (!item.features) return;// Wenn keine Features vorhanden sind, diesen Eintrag überspringen
          
          item.features.forEach(f => {// Durch alle Features dieser Unterkunft iterieren
            if (!f) return;// Leere Einträge ignorieren
            set.add(String(f).trim());// Feature als String bereinigen (trim) und ins Set einfügen
          });
        });

        const features = Array.from(set).filter(Boolean).sort((a,b)=> a.localeCompare(b, 'de'));// Set wieder in ein Array umwandeln // Leere Strings herausfiltern, nur echte Werte behalten// Alphabetisch sortieren, mit deutscher Sortierlogik (Umlaute etc.)
        filterOptions.value.features = features.map(f => ({ label: f, value: f }));// Features in das Format {label, value} bringen, das die UI-Komponenten erwarten
      } catch (err) {
        console.error('Fehler beim Laden der Features:', err);// Fehlermeldung in der Konsole, falls der Request scheitert
        
      }
    }

    
    const updateSorting = () => {// Handler, der aufgerufen werden kann, wenn sich die Preis-Sortierung ändert
      console.log('Preis-Sortierung geändert:', selected.value.priceSort);// Loggt die aktuelle Sortierreihenfolge; hier könnte man später weitere Logik ergänzen
    };

    
    const resetFilters = () => {// Funktion, um alle Filtereinstellungen auf die Standardwerte zurückzusetzen
      selected.value = {// Setzt das selected-Objekt komplett auf die Anfangswerte zurück
        type: [],
        rating: [],
        ratingStars: null,
        features: [],
        priceSort: '',
        minPrice: 30,
        maxPrice: 400
      };
      localStorage.removeItem('savedFilters');// Entfernt den gespeicherten Filterzustand aus dem Local Storage, damit nichts Altes wiederhergestellt wird
      
      if (window.filtersSelected) window.filtersSelected.value = selected.value;// Aktualisiert das globale Filterobjekt, damit andere Komponenten den Reset ebenfalls sehen
    };

    onMounted(() => { // Lifecycle-Hook: wird automatisch ausgeführt, wenn die Filter-Komponente im DOM gerendert wurde
      loadFiltersFromStorage(); // Beim Start gespeicherte Filter aus dem Local Storage laden, damit der Zustand erhalten bleibt
      loadFeatures(); // Features aus dem Backend laden, damit die Ausstattungs-Checkboxen dynamisch auf den echten Daten basieren
    });

    return {// Werte und Funktionen, die im Template der Filter-Komponente verwendet werden können
      filterOptions, selected, hoverStars,
      handleStarEnter, handleStarLeave, handleStarClick, updateSorting, resetFilters
    };
  },
  template: `
    <div>
      
      <div class="filter-category">
        <h4>Typ</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.type" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.type">
            {{ opt.label }}
          </label>
        </div>
      </div>

      
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

      
      <div class="filter-category">
        <h4>Preis sortieren</h4>
        <select v-model="selected.priceSort" class="price-sort-select" @change="updateSorting">
          <option value="">Standard</option>
          <option value="asc">Preis aufsteigend</option>
          <option value="desc">Preis absteigend</option>
        </select>
      </div>

      
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

      
      <div class="filter-category">
        <h4>Ausstattung</h4>
        <div class="filter-list">
          <label v-for="opt in filterOptions.features" :key="opt.value">
            <input type="checkbox" :value="opt.value" v-model="selected.features">
            {{ opt.label }}
          </label>
        </div>
      </div>
      
      <div class="filter-category">
        <button @click="resetFilters" class="wishlist-btn secondary" style="width:100%; padding:10px; margin-top:8px;">Alle Filter zurücksetzen</button>
      </div>
    </div>
   
  `
};


const _filtersMountEl = document.getElementById('filters-container');
if (_filtersMountEl) {
  Vue.createApp(filtersApp).mount(_filtersMountEl);
}
