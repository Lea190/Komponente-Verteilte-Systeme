# Komponente-Verteilte-Systeme

Dieses Repository zeigt die Umsetzung eines funktionalen Buchungsservices als Einzelportfolio im Rahmen der DHBW-Vorlesung “Verteilte Systeme und Webentwicklung”. Der Fokus liegt auf einer suchbasierten Unterkunftsübersicht mit Filtermöglichkeiten, Detail-Popups, dynamischer Preisberechnung und einer Merkliste, die über ein Flask-Backend bereitgestellte JSON-APIs nutzt.

## Features

- **Stadtbasierte Suche:** Auf Startseite mit Suchfeld und Dropdown-Vorschlägen kann nach der Stadt für Ihr Reiseziel gesucht werden. 
- **Filter & Sortierung:**  
  - Filter Sie nach der Unterkunftsart (Hotel, Wohnung, Hostel).  
  - Wählen Sie die Sterne, die Ihre Unterkunft haben soll über interaktive Sterne-Leiste.  
  - Die Verschiedenen Ausstattungen der Unterkunft können Sie über Ausstattungs-Filter wählen. 
  - Das Budget für ihre Unterkunft können Sie eunfach im Preisbereich per Doppelslider auswählen.  
  - Sortieren Sie einfach nach Preis.
- **Ergebnisliste:** Karten-Layout der Unterkünfte mit kurzen Informationen über die Unterkunft
- **Detail-Popup & Preislogik:**  
  - Wenn Sie auf eine Unterkunft klicken öffnet ein Popup mit einer genaueren Beschreibung.  
  - Hier können Sie die Personenanzahl und die Nächten auswählen
  - Der Gesamtpreis der Unterkunft wird Live berechnet.
- **Merkliste:**  
  - Unterkünfte können inklusive der zuvor getroffenen Auswahl auf die Merkliste gelegt.  
  - Hier können die Unterkünfte noch einmal angepasst werden, bevor sie gebucht werden können. 

## Technologie-Stack

| Kategorie         | Technologie                                |
| :---------------- | :------------------------------------------ |
| **Backend**       | Python, Flask, Flask-CORS         |
| **Datenbank**   | SQLite  |
| **Frontend**      | HTML, CSS, JavaScript, Vue.js 3       |
| **Layout/Design** | Custom CSS (Responsive Cards, Hero, Navbar)|


## Projektarchitektur

### Frontend

Das Frontend besteht aus drei HTML-Seiten (`index.html`, `buchen.html`, `merkliste.html`), die jeweils spezialisierte JavaScript-Module einbinden.[file:10][file:5][file:6]

- **Startseite (`index.html` + `startseite.js`):**  
  - Hero-Bereich mit Suchfeld.  
  - Stadtvorschläge werden clientseitig aus einer Liste angeboten.  
  - Die ausgewählte Stadt wird in `localStorage` gespeichert und beim Wechsel zur Ergebnis-Seite verwendet.[file:10][file:4]

- **Ergebnis-/Buchungsseite (`buchen.html` + `filters.js` + `app.js`):**  
  - Linke Spalte: Filter-Komponente (Typ, Sterne, Ausstattung, Preisbereich, Preis-Sortierung), umgesetzt mit einem eigenen Vue-App (`filtersApp`).[file:9][file:1]  
  - Rechte Spalte: Haupt-App (`App` in `app.js`) für das Laden, Filtern, Paginieren und Anzeigen der Unterkünfte sowie das Öffnen des Detail-Popups.[file:4]  
  - Die Filter-Auswahl wird über ein globales `window.filtersSelected` zwischen `filters.js` und `app.js` geteilt und zusätzlich im `localStorage` gesichert.[file:9][file:4]

- **Merkliste-Seite (`merkliste.html` + `wishlist.js`):**  
  - Eigenes Vue-App (`wishlistApp`), das die Merkliste vom Backend lädt und als Kacheln anzeigt.[file:2][file:5]  
  - Edit-Dialog mit separatem Preis-Computed (`editTotal`) und Bestätigungs-Popup für „erfolgreich gebucht“.[file:2]

### Backend

Das Backend ist ein schlankes Flask-Projekt mit reiner JSON-API und CORS-Freigabe für den Frontend-Port.[file:3]

- **Endpoints (Auszug):**
  - `GET /api/accommodations` – liefert alle Unterkünfte.[file:3]  
  - `GET /api/accommodations/<stadt>` – filtert Unterkünfte nach Stadt.[file:3]  
  - `GET /api/wishlist` – gibt die aktuelle Merkliste zurück.[file:3]  
  - `POST /api/wishlist` – fügt ein neues Element zur Merkliste hinzu (id, name, city, price, maxpersons, persons, nights, totalPrice, …).[file:3][file:4]  
  - `PUT /api/wishlist/<id>` – aktualisiert Personen, Nächte und Gesamtpreis eines Eintrags.[file:3][file:2]  
  - `DELETE /api/wishlist/<id>` – entfernt einen Eintrag aus der Merkliste.[file:3][file:2]

- **Datenzugriff:**  
  - SQLite-Verbindung über `sqlite3`, Pfad zur DB in `DBPATH`.  
  - Unterkünfte werden aus der Tabelle `Unterkunft` geladen, deren Spalten zu den Feldern in `Daten.csv` passen (z.B. `UnterkunftID`, `Name`, `Stadt`, `PreisproNacht`, `maxPersonen`, `Eigenschaften`, `BildURL`).[file:3][file:6]  
  - Die Feldwerte werden in Python-Dictionaries gemappt und als JSON an das Frontend zurückgegeben (inkl. `features`-Array und `image`-URL).[file:3]

- **Merkliste-Implementierung:**  
  - Die Merkliste liegt bewusst nur im Arbeitsspeicher (globale Python-Liste `WISHLIST`), da die Persistenz hier nicht im Fokus steht.[file:3]  

### Datenbasis (`Daten.csv`)

`Daten.csv` liefert realistische Beispieldaten für Hotels, Wohnungen und Hostels in verschiedenen europäischen Städten.[file:6]

- **Spalten (Auszug):** `UnterkunftID`, `Name`, `Bezeichnung`, `Sterne`, `Stadt`, `PreisproNacht`, `maxPersonen`, `Beschreibung`, `Eigenschaften`, `BildURL`.[file:6]
- **Beispiele:**  
  - Stadthotels in Berlin, Hostels in Paris, Apartments in Rom, Grachtenwohnungen in Amsterdam und Strandunterkünfte in Barcelona.[file:6]  
  - Eigenschaften-Kombinationen wie „WLAN“, „Frühstück“, „Küche“, „Balkon“, „Spa“, „Kinderbett“, „Shuttle“ werden für die Filter-Logik genutzt.[file:6][file:9]

## Setup und Ausführung

1. **Repository klonen**

