const stadtInput = document.getElementById('stadt-input');
const dropdown   = document.getElementById('stadt-dropdown');
const suchenBtn  = document.getElementById('suchen-btn');

// Dropdown beim Klick auf das Feld öffnen
stadtInput.addEventListener('click', () => {
  dropdown.style.display = 'block';
});

// Städte aus der Datenbank holen
async function ladeStaedte() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/accommodations');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const daten = await res.json();

    // Einzigartige Städte extrahieren
    const staedte = [...new Set(daten.map(item => item.city))].sort();
    fuelleDropdown(staedte);
  } catch (err) {
    console.error('Fehler beim Laden der Städte:', err);
    dropdown.innerHTML = '<div class="dropdown-item">Fehler beim Laden der Städte</div>';
  }
}

function fuelleDropdown(staedte) {
  dropdown.innerHTML = '';
  staedte.forEach(stadt => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = stadt;
    item.addEventListener('click', () => {
      stadtInput.value = stadt;
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(item);
  });
}

ladeStaedte();

// Bei Klick auf „Suchen“ zur Buchen-Seite mit Stadt-Parameter
suchenBtn.addEventListener('click', () => {
  const stadt = stadtInput.value;
  if (stadt) {
    window.location.href = `buchen.html?stadt=${encodeURIComponent(stadt)}`;
  } else {
    alert('Bitte wählen Sie eine Stadt aus.');
  }
});

// Dropdown schließen, wenn man außerhalb klickt
document.addEventListener('click', (e) => {
  if (!stadtInput.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});
