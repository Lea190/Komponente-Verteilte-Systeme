const App = { // Haupt-Vue-Objekt für diese Seite; hier definiere ich Logik (setup) und HTML-Struktur (template)
  setup() { // setup-Funktion von Vue 3 (Composition API): alles hier drin ist die Logik meiner App

    if (!window.filtersSelected) { // Prüft, ob das globale Filterobjekt schon existiert, damit die Filter über mehrere Komponenten/Seiten gleich bleiben
      window.filtersSelected = Vue.ref({ // Erzeugt ein reaktives Objekt für die Filtereinstellungen, das Vue automatisch überwacht
        type: [], // Liste der ausgewählten Unterkunftstypen (z.B. Hotel, Apartment)
        rating: [], // Hier könnte man ausgewählte Bewertungsstufen speichern (wird in diesem File aber nicht weiter genutzt)
        features: [] // Liste der ausgewählten Ausstattungsmerkmale (z.B. WLAN, Pool)
      });
    }

    const accommodations = Vue.ref([]); // Reaktive Liste mit Unterkünften; Änderungen hier werden automatisch im UI aktualisiert
    const selected = Vue.computed(() => window.filtersSelected.value); // Computed-Eigenschaft, die immer den aktuellen globalen Filterzustand zurückgibt
    const wishlist = Vue.ref([]); // Reaktive Liste für die Merkliste; Einträge werden direkt in der Oberfläche angezeigt
    const selectedAccommodation = Vue.ref(null); // Reaktives Objekt für die aktuell ausgewählte Unterkunft (steuert das Detail-Popup)
    const notification = Vue.ref(""); // Reaktiver Text für kurze Statusmeldungen (Fehler/Erfolg), der oben eingeblendet wird
    const wishlistConfirm = Vue.ref(null); // Name der Unterkunft, die gerade zur Merkliste hinzugefügt oder überprüft wurde
    const wishlistStatus = Vue.ref(""); // Status für die Merkliste-Bestätigung („added“ oder „exists“) zur Unterscheidung der Anzeige
    const currentPage = Vue.ref(1); // Aktuell ausgewählte Seite der Paginierung; wird für die Seitennavigation genutzt
    const itemsPerPage = 9; // Feste Anzahl an Unterkunftskarten, die pro Seite angezeigt werden
    const persons = Vue.ref(1); // Reaktive Anzahl der Personen im Buchungsdialog; Änderungen aktualisieren direkt den Gesamtpreis
    const nights = Vue.ref(1); // Reaktive Anzahl der Nächte im Buchungsdialog; wirkt sich ebenfalls live auf den Gesamtpreis aus

    const totalPrice = Vue.computed(() => { // Computed-Eigenschaft für den Gesamtpreis; wird automatisch neu berechnet, wenn abhängige Werte sich ändern
      if (!selectedAccommodation.value) return 0; // Wenn noch keine Unterkunft ausgewählt ist, gibt es keinen Gesamtpreis
      return persons.value * nights.value * parseFloat(selectedAccommodation.value.price); // Formel: Personen × Nächte × Preis pro Nacht (Preis wird sicherheitshalber in Zahl umgewandelt)
    });

    async function loadAccommodations() { // Asynchrone Funktion zum Laden der Unterkünfte vom Backend (REST-API)
      try { // try/catch, damit Fehler beim Netzwerkzugriff sauber behandelt werden
        const res = await fetch("http://127.0.0.1:5000/api/accommodations"); // HTTP-GET-Request an das Backend, um alle Unterkünfte abzurufen
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // Wenn die Antwort keinen Erfolgsstatus hat (z.B. 404/500), werfe ich einen Fehler
        accommodations.value = await res.json(); // JSON-Antwort in ein JavaScript-Array umwandeln und in der reaktiven Liste speichern

        const savedCity = localStorage.getItem('selectedCity'); // Aus dem Local Storage eine zuvor gewählte Stadt auslesen, falls vorhanden
        if (savedCity) { // Wenn eine Stadt gespeichert ist, wird die Unterkunftsliste direkt lokal gefiltert
          accommodations.value = accommodations.value.filter(hotel => hotel.city === savedCity); // Nur Unterkünfte in der gespeicherten Stadt bleiben in der Liste
          console.log(`Gefiltert nach Stadt: ${savedCity}`); // Debug-Ausgabe zur Kontrolle, welche Stadt angewendet wurde
        }

        console.log("✓ Unterkünfte geladen:", accommodations.value.length); // Log-Ausgabe, wie viele Unterkünfte nach dem Laden vorliegen
      } catch (err) { // Falls ein Fehler auftritt (z.B. Server nicht erreichbar)
        console.error("✗ Fehler beim Laden der Unterkünfte:", err); // Fehlermeldung ausführlich in der Konsole
        notification.value = "Fehler beim Laden der Unterkünfte"; // Kurze, verständliche Fehlermeldung für den Nutzer
      }
    }

    async function loadWishlist() { // Asynchrone Funktion zum Laden der Merkliste vom Backend
      try {
        const res = await fetch("http://127.0.0.1:5000/api/wishlist"); // HTTP-GET-Request an die Wishlist-API
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // Bei nicht erfolgreichem Status wird ein Fehler ausgelöst
        wishlist.value = await res.json(); // Die vom Server gelieferte Merkliste als JSON einlesen und reaktiv speichern
        console.log("✓ Merkliste geladen"); // Bestätigungs-Log für die Entwicklerkonsole
      } catch (err) {
        console.error("✗ Fehler beim Laden der Merkliste:", err); // Ausführliche Fehlermeldung für Debugging
      }
    }

    loadAccommodations(); // Beim Initialisieren der App: automatisch Unterkünfte vom Backend laden
    loadWishlist(); // Beim Initialisieren der App: automatisch die Merkliste laden

    const filteredAccommodations = Vue.computed(() => { // Computed-Eigenschaft für die nach Filtern gefilterte Unterkunftsliste
      const s = selected.value; // Kurzreferenz auf das aktuelle Filterobjekt (z.B. Typ, Sterne, Preisbereich)
      const filtersActive =
        s.type?.length > 0 || // Es sind Typfilter gesetzt (z.B. nur Hotels)
        s.ratingStars > 0 || // Es ist ein Mindestbewertungsfilter gesetzt
        s.features?.length > 0 || // Es sind bestimmte Ausstattungsmerkmale ausgewählt
        s.priceSort || // Es wurde eine Sortierung nach Preis ausgewählt
        s.minPrice !== 30 || // Minimalpreis wurde gegenüber dem Standardwert verändert
        s.maxPrice !== 400; // Maximalpreis wurde gegenüber dem Standardwert verändert

      if (!filtersActive) return accommodations.value; // Wenn keine Filter aktiv sind, gebe ich direkt alle Unterkünfte zurück

      let result = accommodations.value.filter(hotel => { // Filtert die Unterkünfte mit mehreren Bedingungen basierend auf den aktuellen Filtern
        const typeOk =
          !s.type || s.type.length === 0 || s.type.includes(hotel.type); // Typ-Bedingung: entweder kein Filter oder der Unterkunftstyp ist in der Filterliste
        const ratingOk =
          !s.ratingStars || parseInt(hotel.rating) >= s.ratingStars; // Bewertungs-Bedingung: entweder kein Filter oder Hotelrating >= gewünschter Sternezahl
        const featOk =
          !s.features ||
          s.features.length === 0 ||
          s.features.some(f => hotel.features.includes(f)); // Feature-Bedingung: entweder keine Filter oder mindestens ein gewünschtes Merkmal ist vorhanden
        const price = parseFloat(hotel.price); // Preisstring in eine Zahl konvertieren, um Vergleiche korrekt durchzuführen
        const priceOk =
          (!s.minPrice || price >= s.minPrice) &&
          (!s.maxPrice || price <= s.maxPrice); // Preis-Bedingung: Preis liegt im definierten Min-/Max-Bereich

        return typeOk && ratingOk && featOk && priceOk; // Hotel bleibt nur dann in der Liste, wenn alle Filterbedingungen erfüllt sind
      });

      if (s.priceSort === 'asc') { // Falls der Nutzer aufsteigende Preissortierung gewählt hat
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); // Sortiere die Ergebnisliste von günstig nach teuer
      } else if (s.priceSort === 'desc') { // Falls der Nutzer absteigende Preissortierung gewählt hat
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); // Sortiere die Ergebnisliste von teuer nach günstig
      }

      return result; // Gefilterte und ggf. sortierte Liste zurückgeben
    });

    const paginatedAccommodations = Vue.computed(() => { // Computed-Eigenschaft für die Unterkünfte, die auf der aktuellen Seite angezeigt werden
      const start = (currentPage.value - 1) * itemsPerPage; // Startindex: ab welchem Element sollen wir anzeigen (seitenbasiert)
      const end = start + itemsPerPage; // Endindex: wie weit der Ausschnitt der Liste geht
      return filteredAccommodations.value.slice(start, end); // Schneidet die gefilterte Liste auf genau die Einträge für die aktuelle Seite zu
    });

    const totalPages = Vue.computed(() => { // Computed-Eigenschaft für die Gesamtzahl der Seiten
      return Math.ceil(filteredAccommodations.value.length / itemsPerPage); // Anzahl Seiten = gefilterte Elemente / Elemente pro Seite, mathematisch aufgerundet
    });

    const goToPage = (page) => { // Funktion zum Blättern zwischen den Seiten in der Paginierung
      if (page >= 1 && page <= totalPages.value) { // Prüft, ob die angeforderte Seite im gültigen Bereich liegt
        currentPage.value = page; // Aktualisiert die aktuelle Seite
        window.scrollTo(0, 0); // Scrollt die Seite nach oben, damit der Nutzer die neuen Ergebnisse direkt sieht
      }
    };

    function selectAccommodation(item) { // Wird aufgerufen, wenn der Nutzer auf eine Unterkunftskarte klickt
      selectedAccommodation.value = item; // Setzt die ausgewählte Unterkunft; das öffnet das Detail-Popup
      persons.value = 1; // Zurücksetzen der Personenanzahl auf 1 beim Öffnen des Popups
      nights.value = 1; // Zurücksetzen der Nächteanzahl auf 1 beim Öffnen des Popups
    }

    async function addToWishlist(item) { // Funktion, um eine Unterkunft (ohne Buchungsdetails) zur Merkliste hinzuzufügen
      const res = await fetch("http://127.0.0.1:5000/api/wishlist", { // HTTP-POST an die Wishlist-API
        method: "POST", // POST bedeutet: Daten anlegen/übermitteln
        headers: {
          "Content-Type": "application/json" // Der Body wird als JSON gesendet, damit das Backend ihn korrekt interpretieren kann
        },
        body: JSON.stringify(item) // Das übergebene Objekt wird in einen JSON-String umgewandelt und als Request-Body mitgesendet
      });

      const data = await res.json(); // Antwort des Servers als JSON lesen (z.B. Message)
      notification.value = data.message || "Fehler beim Aktualisieren der Merkliste"; // Meldung aus der Antwort anzeigen oder einen generischen Fehlertext

      if (res.ok) { // Wenn der Server mit einem Erfolgsstatus (2xx) geantwortet hat
        await loadWishlist(); // Merkliste neu vom Server laden, damit das Frontend den aktuellen Stand zeigt
      }

      setTimeout(() => { // Timer, um die Notification nach kurzer Zeit automatisch wieder zu verstecken
        notification.value = ""; // Leert den Notification-Text nach 3 Sekunden
      }, 3000);
    }

    async function addToWishlistWithSelection() { // Funktion zum Hinzufügen der aktuell ausgewählten Unterkunft mit Personen- und Nächteangaben zur Merkliste
      if (!selectedAccommodation.value) return; // Sicherheitsabfrage: Falls nichts ausgewählt ist, tue nichts

      const item = { // Neues Objekt, das als Eintrag in der Merkliste gespeichert werden soll
        ...selectedAccommodation.value, // Kopiert alle Felder der aktuell ausgewählten Unterkunft (Spread-Operator)
        persons: persons.value, // Ergänzt die Anzahl der Personen für diese Auswahl
        nights: nights.value, // Ergänzt die Anzahl der Nächte
        totalPrice: totalPrice.value, // Fügt den berechneten Gesamtpreis hinzu
      };

      try {
        const res = await fetch("http://127.0.0.1:5000/api/wishlist", { // HTTP-POST an die Wishlist-API mit den erweiterten Daten
          method: "POST", // Daten werden wieder per POST übertragen
          headers: {
            "Content-Type": "application/json" // Body ist JSON
          },
          body: JSON.stringify(item), // Das neue Objekt wird in JSON umgewandelt und gesendet
        });

        const data = await res.json(); // Serverantwort einlesen (z.B. Erfolgsmeldung)

        if (res.ok) { // Wenn die Speicherung auf dem Server erfolgreich war
          const itemName = selectedAccommodation.value.name; // Name der Unterkunft merken, um ihn in der Bestätigung anzuzeigen
          const itemId = selectedAccommodation.value.id; // ID der Unterkunft merken, um doppelte Einträge zu erkennen

          closePopup(); // Detail-Popup schließen, da der Eintrag erfolgreich verarbeitet wurde

          const alreadyExists = wishlist.value.some(w => w.id === itemId); // Prüfen, ob die Unterkunft bereits in der Merkliste vorhanden ist
          wishlistConfirm.value = itemName; // Name für die Bestätigungsmeldung setzen
          wishlistStatus.value = alreadyExists ? "exists" : "added"; // Status festlegen: entweder „exists“ oder „added“

          await loadWishlist(); // Merkliste neu laden, um den aktuellen Stand anzuzeigen

          await new Promise(resolve => setTimeout(resolve, 3000)); // Kurze künstliche Wartezeit, damit die Bestätigung einige Sekunden sichtbar bleibt
          wishlistConfirm.value = null; // Bestätigungsname zurücksetzen, danach verschwindet die Meldung
          wishlistStatus.value = ""; // Status zurücksetzen
        } else { // Falls der Server einen Fehlerstatus zurückgegeben hat
          notification.value = "Fehler beim Hinzufügen zur Merkliste"; // Fehlermeldung an den Nutzer
          setTimeout(() => (notification.value = ""), 3000); // Meldung nach 3 Sekunden automatisch ausblenden
        }
      } catch (err) { // Falls z.B. keine Verbindung zum Server besteht
        console.error("Fehler beim Aktualisieren der Merkliste", err); // Fehler in der Konsole protokollieren
        notification.value = "Fehler beim Aktualisieren der Merkliste"; // Nutzerfreundliche Fehlermeldung setzen
        setTimeout(() => (notification.value = ""), 3000); // Nach 3 Sekunden die Meldung wieder entfernen
      }
    }

    function closePopup() { // Hilfsfunktion, um das Detail-Popup zu schließen
      selectedAccommodation.value = null; // Entfernt die ausgewählte Unterkunft; dadurch blendet Vue das Popup aus
    }

    function confirmBooking() { // Funktion, die eine Buchungsbestätigung zeigt (aktuell nur als Browser-Alert, ohne echte Serverbuchung)
      alert( // Popup-Dialog des Browsers mit den wichtigsten Buchungsdaten// Zeigt den Namen der Unterkunft in einer neuen Zeile// Nächste Zeile: Personen und Nächte
        `Buchung bestätigt:\n${selectedAccommodation.value.name}\n` + 
        `${persons.value} Personen, ${nights.value} Nächte\n` + 
        `Gesamt: ${totalPrice.value.toFixed(2)} €` 
      );
      closePopup(); // Nach der Bestätigung wird das Detail-Popup geschlossen// Zeigt den Gesamtpreis mit zwei Nachkommastellen
    }

    return { // Hier exportiere ich alle Werte und Funktionen, die im Template verwendet werden sollen
      filteredAccommodations, // Gefilterte Unterkunftsliste (Basis für Anzeige und Paginierung)
      paginatedAccommodations, // Teilmenge der Unterkünfte für die jeweils aktuelle Seite
      currentPage, // Aktuelle Seite der Paginierung
      totalPages, // Gesamtanzahl der Seiten (für Anzeige und Button-Logik)
      goToPage, // Funktion, um die aktuelle Seite zu wechseln
      selectAccommodation, // Funktion zum Auswählen einer Unterkunft (öffnet das Popup)
      selectedAccommodation, // Aktuell ausgewählte Unterkunft (steuert die Anzeige des Popups)
      addToWishlist, // Funktion, um eine Unterkunft zur Merkliste hinzuzufügen (ohne Personen/Nächte)
      addToWishlistWithSelection, // Funktion, um die Auswahl (inkl. Personen/Nächte/Gesamtpreis) zur Merkliste hinzuzufügen
      closePopup, // Funktion zum Schließen des Popups
      notification, // Reaktiver Text für Statusmeldungen oben auf der Seite
      wishlist, // Reaktive Merkliste, die z.B. auf einer anderen Seite oder Komponente angezeigt werden kann
      persons, // Reaktive Personenanzahl im Buchungsbereich
      nights, // Reaktive Nächteanzahl im Buchungsbereich
      totalPrice, // Reaktiver berechneter Gesamtpreis
      wishlistConfirm, // Name der Unterkunft für die Bestätigungsmeldung nach dem Hinzufügen zur Merkliste
      wishlistStatus, // Status („added“ oder „exists“) zur Steuerung der Bestätigungsmeldung
    };
  },

 template: `
  <div class="app">
    <div class="notification" v-if="notification">
      {{ notification }}
    </div>

    <div class="accommodation-grid">
  <div 
    v-for="item in paginatedAccommodations" 
    :key="item.id" 
    class="accommodation-card" 
    @click="selectAccommodation(item)"
  >
    
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


<div v-if="totalPages > 1" class="pagination">
  <button 
    class="pagination-btn" 
    @click="goToPage(currentPage - 1)"
    :disabled="currentPage === 1"
  >
    ← Zurück
  </button>
  <span class="pagination-info">Seite {{ currentPage }} von {{ totalPages }}</span>
  <button 
    class="pagination-btn" 
    @click="goToPage(currentPage + 1)"
    :disabled="currentPage === totalPages"
  >
    Weiter →
  </button>
</div>

<div v-if="filteredAccommodations.length === 0" class="no-results">
  <h3>Keine Unterkünfte gefunden</h3>
  <p>Mit den gewählten Filteroptionen sind leider keine Unterkünfte verfügbar.</p>
  <p>Bitte setzen Sie die Filter zurück und versuchen Sie es erneut.</p>
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
            {{ p }} Person{{ p > 1 ? 'en' : '' }}
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


<div v-if="wishlistConfirm" class="booking-popup-overlay">
  <div class="booking-popup booking-confirm-modal">
    <div class="confirm-content">
      <h2 v-if="wishlistStatus === 'added'">✅ Unterkunft zur Merkliste hinzugefügt!</h2>
      <h2 v-if="wishlistStatus === 'exists'">ℹ️ Unterkunft ist bereits auf der Merkliste</h2>
      <p>{{ wishlistConfirm }}</p>
    </div>
  </div>
</div>

    </div>
  </div>
  `
};


Vue.createApp(App).mount('#app');