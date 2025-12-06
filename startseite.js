console.log('startseite.js geladen (NEU)');

const stadtInput = document.getElementById('stadt-input');
const dropdown   = document.getElementById('stadt-dropdown');
const suchenBtn  = document.getElementById('suchen-btn');

// Dropdown beim Klick auf das Feld öffnen/zu
stadtInput.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
   if (dropdown.style.display === 'block') {
        // Position exakt unter der Search-Bar
        const searchBarRect = dropdown.parentElement.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = (searchBarRect.bottom + window.scrollY) + 'px';
        dropdown.style.left = searchBarRect.left + 'px';
        dropdown.style.width = searchBarRect.width + 'px';
        dropdown.style.zIndex = '10000';
    }
});

// Städte aus der Datenbank holen
async function ladeStaedte() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/accommodations');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const daten = await res.json();

        // 1) STAEDTE wird erstellt und fuelleDropdown aufgerufen
const staedte = [...new Set(daten.map(item => item.city))].sort();
console.log('Städte:', staedte);
fuelleDropdown(staedte);

    } catch (err) {
        console.error('Fehler beim Laden der Städte:', err);
        dropdown.innerHTML = '<div class="dropdown-item">Fehler beim Laden</div>';
    }
}

// 2) Funktionsdefinition GENAU so geschrieben:
function fuelleDropdown(staedte) {
    dropdown.innerHTML = '';
    staedte.forEach(stadt => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = stadt;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            stadtInput.value = stadt;
            dropdown.style.display = 'block';
            // Position an Input-Feld anpassen
            const rect = stadtInput.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';                 
        });
        dropdown.appendChild(item);
    });
}

async function ladeStaedte() {
    try {
        console.log('ladeStaedte() startet');
        const res = await fetch('http://127.0.0.1:5000/api/accommodations');
        console.log('Antwortstatus:', res.status);

        if (!res.ok) throw new Error('HTTP ' + res.status);
        const daten = await res.json();
        console.log('Anzahl Unterkünfte:', daten.length);

        const staedte = [...new Set(daten.map(item => item.city))].sort();
        console.log('Städte:', staedte);
        fuelleDropdown(staedte);
    } catch (err) {
        console.error('Fehler beim Laden der Städte:', err);
        dropdown.style.display = 'block';
        dropdown.innerHTML = '<div class="dropdown-item">Fehler beim Laden der Städte</div>';
    }
}
ladeStaedte();


// Bei Klick auf „Suchen" zur Buchen-Seite mit Stadt-Parameter
suchenBtn.addEventListener('click', () => {
    const stadt = stadtInput.value;
    if (stadt) {
        localStorage.setItem('selectedCity', stadt);
        window.location.href = 'buchen.html';
    } else {
        alert('Bitte wählen Sie eine Stadt aus.');
    }
});

// Dropdown schließen, wenn man irgendwo sonst klickt
document.addEventListener('click', () => {
    dropdown.style.display = 'none';
});
