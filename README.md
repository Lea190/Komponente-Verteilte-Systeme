# Komponente-Verteilte-Systeme

Dieses Repository zeigt die Umsetzung eines funktionalen Buchungsservices als Einzelportfolio im Rahmen der DHBW-Vorlesung “Verteilte Systeme und Webentwicklung”. Der Fokus liegt auf einer suchbasierten Unterkunftsübersicht mit Filtermöglichkeiten und einer Merkliste, die über ein Flask-Backend bereitgestellte JSON-APIs nutzt.

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

## Designentscheidungen

- Frontend mit Vue 3 als leichtgewichtiges SPA ohne Build-Tooling, um eine reaktive UI für Filter, Paginierung, Merkliste und Buchungs-Popup mit minimaler Komplexität umzusetzen.
- Verwendung von Flask als Backend‑Framework: Schlankes Python‑Framework, mit dem sich eine kleine REST‑API für Unterkünfte und Merkliste mit wenig Boilerplate umsetzen lässt
- SQLite als Datenbank: Leichtgewichtige, dateibasierte DB ohne zusätzlichen Server

## Integration und Abgrenzug zum Architectual Concept Design (ACD)
Dieser Abschnitt ordnet die vorliegende Implementierung in das im Gruppenprojekt erarbeitete Architecture Concept Document (ACD) ein und begründet bewusste Abweichungen für dieses Einzelportfolio.

### Integration in das Gesamtsystem 
Im Kontext des ACDs, das eine service‑orientierte Architektur mit mehreren entkoppelten Services vorsieht, repräsentiert dieses Repository einen schlanken Prototypen für den Buchungs‑ und Rechercheteil („Suchen & Merken“).  Die Komponente stellt eine eigenständige Weboberfläche bereit, die über eine REST‑API mit einem kleinen Flask‑Backend kommuniziert und damit fachlich an den im ACD beschriebenen Buchungsservice anknüpft. 
- Interne Struktur: Die Implementierung ist als monolithische Client‑Server‑Anwendung aufgebaut; ein Flask‑Backend kapselt die Datenzugriffe auf eine lokale SQLite‑Datenbank, während das Frontend aus statischem HTML/CSS/JavaScript mit Vue‑Unterstützung besteht.
- Schnittstellen: Das Backend stellt JSON‑basierte REST‑Endpunkte ( /api/accommodations ,  /api/wishlist ) bereit, über die das Frontend Unterkünfte lädt, filtert und Merklisteneinträge verwaltet; diese API kann perspektivisch durch einen im ACD beschriebenen zentralen Buchungsservice ersetzt oder dahinter geschaltet werden.

### Abweichung vom ACD
Im Vergleich zur im ACD beschriebenen Zielarchitektur wurden für das Einzelportfolio gezielt technologische und architektonische Vereinfachungen vorgenommen. 
| Bereich        | Geplant im ACD (Ziel)                      | Implementiert im Portfolio (Ist)      | Begründung der Abweichung                     |
| :------------ | :------------------------------------------ | :---------------- | :------------------------------------------ |
| **Architekturstil**       | PService‑Orientierte Architektur mit mehreren Backend‑Services und zentralem Integrationslayer        | Monolithische Webapplikation mit kombiniertem Frontend und Flask‑Backend     | Reduktion der Komplexität, da eine verteilte SOA für einen lokalen Prototypen nicht notwendig ist.       |
| **Kommunikation**   | Orchestrierung über zentrale Integrations‑ und Routing‑Komponenten | Direkte HTTP‑Kommunikation zwischen Browser und Flask‑API     | MFür den Laborbetrieb genügt eine direkte REST‑Anbindung; zusätzliche Infrastruktur würde keinen Mehrwert für die Kernfunktionen bringen.  |
| **Frontend**      | Moderne SPA mit eigenem Build‑Prozess      | Statisches HTML/CSS/JS mit etwas Vue 3 via CDN     | Fokus auf schnelle Prototyp‑Entwicklung ohne Build‑Tooling; die UI bleibt leichtgewichtig und einfach deploybar.      |
| **Backend‑Technologie** | Mehrere skalierbare Services auf Cloud‑Infrastruktur|Ein einzelnes Python‑Flask‑Backend auf dem Entwicklerrechner    | Ein einzelner Service ist für die Umsetzung von Suche, Filterung und Merkliste ausreichend und erleichtert Debugging und Verständnis.      |
| **Datenbank** | Zentrale, hochverfügbare Datenhaltung (z.B. PostgreSQL)| Lokale SQLite‑Datenbank im Dateisystem    | SQLite benötigt keine separate Server‑Installation und reicht für Testdaten und einen Einzelbenutzer‑Prototyp aus.     |

Durch diese Vereinfachungen konzentriert sich das Portfolio auf die fachliche Kernlogik „Unterkunft suchen, filtern, merken und Buchung anstoßen“, während Skalierung, Hochverfügbarkeit und Sicherheitsmechanismen aus dem ACD bewusst ausgeklammert und nur konzeptionell vorbereitet sind. 
