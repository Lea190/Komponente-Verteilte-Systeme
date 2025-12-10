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

Das Frontend rendert die Benutzeroberfläche und handhabt interaktive Elemente wie Filter, Suchfunktion und Popups.

- Technologien: HTML, CSS, Vanilla JavaScript mit Vue.js (Vue 3).
-  Funktion: Darstellung von Startseite, Suchergebnissen, Merkliste sowie dynamische Filter, Hotelkarten und Wishlist-Logik.
- Vue.js-Integration: Vue.js steuert reaktive Komponenten wie Filter-Checkboxes, Sternbewertungen, Preisslider und Paginierung. Globale Zustände (window.filtersSelected) synchronisieren Filter zwischen Seiten.

### Backend

Das Backend enthält die Geschäftslogik der Anwendung und stellt dem Frontend die nötigen Daten und Funktionen über eine REST-API zur Verfügung.

- Technologien: Python, Flask Micro-Framework, Flask-CORS
- Funktion: Bereitstellung der Unterkunftsdaten aus der SQLite-Datenbank, Routing der API-Endpunkte und Verwaltung der Merkliste während des Buchungsprozesses.
- Flask: Ist ein Micro-Framework für Python zur Entwicklung von Webanwendungen und REST-APIs. Es bietet eine einfache und flexible Möglichkeit, Endpunkte zu definieren und JSON-Daten bereitzustellen, ohne die Komplexität eines großen, monolithischen Frameworks in Kauf nehmen zu müssen.



  
### Datenbank

Die Datenpersistenz wird durch eine SQLite-Datenbank realisiert, die direkt mit der Python-Standardbibliothek angesprochen wird.
- Technologien: sqlite3: Bibliothek zur Ausführung von SQL-Befehlen aus dem Flask-Backend, etwa für das Laden der Unterkünfte. 
    

## Setup und Ausführung

1. **Voraussetzungen:** Python 3.8+, Node.js nicht erforderlich (CDN für Vue.js).
2. **Backend starten:**
    pip install flask flask-cors
    python backend.py
3. Server läuft auf  http://127.0.0.1:5000 . SQLite-DB wird automatisch geladen.
4. **Frontend öffnen:** startseite.html im Browser (Live Server empfohlen, Port 5500).
5. **Testen:** Filter anwenden → Merkliste → Buchungsmodal → Bestätigung.

