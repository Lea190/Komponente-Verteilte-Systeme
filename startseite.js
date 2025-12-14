console.log('startseite.js geladen (NEU)');// Kurzer Konsolen-Log, um zu sehen, dass die Startseiten-Skripte korrekt eingebunden und ausgeführt werden

const stadtInput = document.getElementById('stadt-input');// Referenz auf das Texteingabefeld, in dem der Nutzer die Stadt auswählen/sehen kann
const dropdown   = document.getElementById('stadt-dropdown');// Referenz auf das Dropdown-Element, in dem die Städtevorschläge angezeigt werden
const suchenBtn  = document.getElementById('suchen-btn');// Referenz auf den „Suchen“-Button, der die Weiterleitung zur Ergebnisseite auslöst


stadtInput.addEventListener('click', (e) => {// Eventlistener: wird ausgelöst, wenn der Nutzer in das Stadtfeld klickt
    e.stopPropagation();// Verhindert, dass der Klick an übergeordnete Elemente weitergegeben wird (nützlich, wenn man global Klicks abfängt)
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';// Einfacher Toggle: ist das Dropdown sichtbar, wird es versteckt, sonst eingeblendet
   if (dropdown.style.display === 'block') {// Wenn das Dropdown gerade eingeblendet wurde
       
        const searchBarRect = dropdown.parentElement.getBoundingClientRect();// Berechnet die Position und Größe des übergeordneten Containers im Viewport
        dropdown.style.position = 'fixed';// Positionstyp „fixed“, damit das Dropdown relativ zum sichtbaren Fenster positioniert wird
        dropdown.style.top = (searchBarRect.bottom + window.scrollY) + 'px';// Setzt die obere Position direkt unter den Suchbereich, inkl. Scroll-Offset
        dropdown.style.left = searchBarRect.left + 'px';// Horizontale Position an die linke Kante des Suchbereichs anpassen
        dropdown.style.width = searchBarRect.width + 'px';// Dropdown-Breite gleich der Suchleiste setzen, damit es optisch bündig ist
        dropdown.style.zIndex = '10000';// Hohes z-index, damit das Dropdown über anderen Elementen liegt
    }
});


function fuelleDropdown(staedte) {// Hilfsfunktion, um das Dropdown mit einer Liste von Städten zu befüllen
    dropdown.innerHTML = '';// Bestehende Einträge im Dropdown zurücksetzen, damit nichts Altes übrig bleibt
    staedte.forEach(stadt => {// Für jede Stadt in der übergebenen Liste
        const item = document.createElement('div');// Neues <div>-Element für einen Dropdown-Eintrag erzeugen
        item.className = 'dropdown-item';// CSS-Klasse setzen, damit das Styling für Dropdown-Items greift
        item.textContent = stadt;// Sichtbaren Text des Eintrags auf den Stadtnamen setzen
        item.addEventListener('click', (e) => {// Klick-Event für den einzelnen Dropdown-Eintrag
            e.stopPropagation();// Verhindert, dass der Klick an andere Listener weitergereicht wird
            stadtInput.value = stadt;// Schreibt die ausgewählte Stadt in das Eingabefeld
            dropdown.style.display = 'block';// Lässt das Dropdown geöffnet (oder wieder sichtbar); kann je nach UX bewusst so gewählt sein
            
            const rect = stadtInput.getBoundingClientRect();// Ermittelt die Position des Eingabefelds im Viewport
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';  // Setzt das Dropdown direkt unter das Eingabefeld (falls sich durch Scrollen etwas verändert hat)               
        });
        dropdown.appendChild(item);// Fügt den erzeugten Eintrag in das Dropdown-Element ein
    });
}

async function ladeStaedte() {// Asynchrone Funktion, die alle verfügbaren Städte vom Backend holt
    try {
        console.log('ladeStaedte() startet');// Log-Ausgabe zur Kontrolle, dass die Funktion aufgerufen wurde
        const res = await fetch('http://127.0.0.1:5000/api/accommodations');// HTTP-GET-Request an das Backend, um alle Unterkünfte zu laden
        console.log('Antwortstatus:', res.status);// Loggt den HTTP-Status (z.B. 200, 404), hilfreich zum Debuggen

        if (!res.ok) throw new Error('HTTP ' + res.status);// Wenn kein erfolgreicher Status zurückkommt, wird ein Fehler geworfen
        const daten = await res.json();// Antwort-Body als JSON einlesen; ergibt ein Array mit Unterkunfts-Objekten
        console.log('Anzahl Unterkünfte:', daten.length);// Gibt die Anzahl der geladenen Unterkünfte aus

        const staedte = [...new Set(daten.map(item => item.city))].sort();// Extrahiert alle Städte, entfernt Duplikate per Set und sortiert alphabetisch
        console.log('Städte:', staedte);// Loggt die endgültige Liste der Städte
        fuelleDropdown(staedte);// Übergibt die Städte-Liste an die Hilfsfunktion, um das Dropdown zu befüllen
    } catch (err) {
        console.error('Fehler beim Laden der Städte:', err);// Fehlerlog, falls z.B. der Server nicht erreichbar ist oder JSON kaputt ist
        dropdown.style.display = 'block';// Zeigt das Dropdown trotzdem an, um ggf. eine Fehlermeldung einzublenden
        dropdown.innerHTML = '<div class="dropdown-item">Fehler beim Laden der Städte</div>';// Einfache Fehlermeldung im Dropdown, damit der Nutzer Feedback bekommt
    }
}
ladeStaedte();// Direkt beim Laden der Startseite werden die Städte vom Backend geladen und das Dropdown vorbereitet



suchenBtn.addEventListener('click', () => {// Eventlistener: wird ausgelöst, wenn der Nutzer auf den „Suchen“-Button klickt
    const stadt = stadtInput.value;// Liest den aktuellen Wert aus dem Eingabefeld und entfernt führende/trailing Leerzeichen
    if (stadt) {
        localStorage.setItem('selectedCity', stadt);
        window.location.href = 'buchen.html';
    } else {
        alert('Bitte wählen Sie eine Stadt aus.');// Einfache Meldung, um den Nutzer auf die fehlende Eingabe hinzuweisen
    }
});


document.addEventListener('click', () => {
    dropdown.style.display = 'none';
});
