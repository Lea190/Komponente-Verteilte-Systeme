from flask import Flask, jsonify, request # Flask stellt das Webframework bereit, jsonify wandelt Python-Objekte in JSON, request liest Daten aus HTTP-Requests
from flask_cors import CORS # CORS erlaubt Aufrufe vom Browser aus einer anderen Domain/Port (z.B. Frontend auf :5500, Backend auf :5000)
import sqlite3 # sqlite3 ist das Python-Modul für SQLite-Datenbanken
import os # os wird genutzt, um Dateipfade zu prüfen (z.B. ob die DB-Datei existiert)

app = Flask(__name__)# Erstellt eine neue Flask-Anwendung; 'app' ist das zentrale Objekt für alle Routen und Einstellungen
CORS(app, resources={# Aktiviert CORS für diese Flask-App, damit das Frontend im Browser auf das Backend zugreifen darf
    r"/api/*": {# Beschränkt CORS auf alle Routen, die mit /api/ anfangen
        "origins": [ # Liste der erlaubten Ursprungs-Adressen (Frontend-URLs)
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ]
    }
})  


DB_PATH = "/Users/lea.betz/Studium/3.Semester/Komponente_verteilte_Systeme/buchenDB.db"# Absoluter Pfad zur SQLite-Datenbankdatei, aus der die Unterkünfte gelesen werden


def get_db_connection():# Hilfsfunktion, um eine neue Datenbankverbindung herzustellen
   
    if not os.path.exists(DB_PATH): # Prüft, ob die Datenbankdatei physisch vorhanden ist
        raise FileNotFoundError(f"SQLite-Datei nicht gefunden unter: {DB_PATH}")# Wirft einen Fehler, damit man direkt erkennt, wenn der Pfad falsch ist
    conn = sqlite3.connect(DB_PATH)# Stellt eine Verbindung zur SQLite-Datenbank her
    conn.row_factory = sqlite3.Row# row_factory sorgt dafür, dass wir Spalten per Namen ansprechen können (z.B. row["Name"])
    return conn# Gibt die offene Verbindung zurück


def fetch_accommodations():# Funktion, um alle Unterkünfte aus der Datenbank zu laden und in ein JSON-taugliches Format zu bringen
    
    conn = get_db_connection()# Neue DB-Verbindung holen
    cur = conn.cursor()# Cursor-Objekt erzeugen, mit dem SQL-Befehle ausgeführt werden

    cur.execute("""
        SELECT
            "Unterkunft ID"      AS UnterkunftID,
            Name                 AS Name,
            Bezeichnung          AS Bezeichnung,
            Sterne               AS Sterne,
            Stadt                AS Stadt,
            Preis_pro_Nacht      AS Preis_pro_Nacht,
            max_Personen         AS max_Personen,
            Beschreibung         AS Beschreibung,
            Eigenschaften        AS Eigenschaften,
            Bild_URL             AS Bild_URL
        FROM Unterkunft;
    """)# SQL-Query: liest alle relevanten Spalten aus der Tabelle 'Unterkunft' und gibt ihnen sprechende Aliasnamen
    rows = cur.fetchall()# Holt alle Ergebniszeilen auf einmal in eine Liste
    conn.close()# Schließt die Datenbankverbindung, um Ressourcen freizugeben

    accommodations = []# Leere Python-Liste, in die jede Unterkunft als Wörterbuch (dict) eingefügt wird
    for row in rows:# Iteration über alle Datensätze aus dem SELECT
        accommodations.append({ # Für jede Zeile wird ein dict gebaut, das direkt ans Frontend gesendet werden kann
            "id": row["UnterkunftID"],
            "name": row["Name"],
            "type": row["Bezeichnung"],
            "description": row["Beschreibung"],
            "rating": row["Sterne"],
            "city": row["Stadt"],
            "price": row["Preis_pro_Nacht"],
            "max_persons": row["max_Personen"],
            "features": row["Eigenschaften"].split(";") if row["Eigenschaften"] else [],
            "image": row["Bild_URL"],
        })
    return accommodations # Gibt die fertige Liste aus dicts zurück, die dann über die API als JSON ausgeliefert wird


WISHLIST = []# In-Memory-Merkliste im Python-Prozess; wird zur Laufzeit gefüllt, aber nicht dauerhaft in der Datenbank gespeichert


@app.get("/api/accommodations") # Definiert eine GET-Route unter /api/accommodations
def get_accommodations():# Handler-Funktion für diese Route; wird aufgerufen, wenn das Frontend Unterkünfte anfragt
    
    accommodations = fetch_accommodations()# Holt alle Unterkünfte aus der Datenbank
    return jsonify(accommodations) # Wandelt die Python-Liste in JSON um und schickt sie als HTTP-Antwort zurück


@app.get("/api/wishlist")# GET-Route für /api/wishlist, um die aktuelle Merkliste abzufragen
def get_wishlist(): # Handler-Funktion für das Abfragen der Merkliste
    
    return jsonify(WISHLIST)# Gibt den aktuellen Inhalt der In-Memory-Merkliste als JSON zurück


@app.post("/api/wishlist") # POST-Route für /api/wishlist, um Einträge zur Merkliste hinzuzufügen
def add_to_wishlist(): # Handler-Funktion zum Hinzufügen eines neuen Wishlist-Eintrags
    
    item = request.get_json()# Liest den JSON-Body des Requests und wandelt ihn in ein Python-Dict um
    if not item or "id" not in item:# Validierung: Es muss ein Objekt vorhanden sein und eine 'id' enthalten
        return jsonify({"error": "Ungültige Daten"}), 400# HTTP-Status 400 (Bad Request), wenn die Daten unvollständig oder falsch sind

    already = any(entry["id"] == item["id"] for entry in WISHLIST)# Prüft, ob bereits ein Eintrag mit derselben ID in der Merkliste existiert
    if already:# Wenn der Eintrag schon vorhanden ist
        return jsonify({"message": "Unterkunft ist bereits auf der Merkliste"}), 200# Antwort mit Info, dass nichts Neues hinzugefügt wurde

    WISHLIST.append(item)# Fügt das neue Item zur in-memory-Merkliste hinzu
    return jsonify({"message": "Unterkunft wurde auf die Merkliste gefügt"}), 201# HTTP-Status 201 (Created) signalisiert einen neuen Eintrag


@app.delete("/api/wishlist/<int:item_id>")# DELETE-Route mit Pfadparameter item_id, um einen Eintrag nach ID zu löschen
def remove_from_wishlist(item_id):# Handler-Funktion, die einen Eintrag mit gegebener ID aus der Merkliste entfernt
    global WISHLIST# Markiert, dass wir die globale Variable WISHLIST verändern wollen
    WISHLIST = [item for item in WISHLIST if item["id"] != item_id]# Erzeugt eine neue Liste ohne das Item mit der übergebenen ID
    return jsonify({"message": "Unterkunft von Merkliste entfernt"}), 200# Bestätigung, dass der Eintrag gelöscht wurde


@app.put("/api/wishlist/<int:item_id>")# PUT-Route zum Aktualisieren eines existierenden Merkliste-Eintrags anhand seiner ID
def update_wishlist(item_id):# Handler-Funktion für Updates einzelner Einträge
    
    item = request.get_json()# Neue Daten für den Eintrag aus dem Request-Body lesen
    if not item:# Validierung: Es müssen überhaupt Daten gesendet worden sein
        return jsonify({"error": "Ungültige Daten"}), 400# Fehlerantwort, wenn kein gültiger Body vorliegt

    for idx, entry in enumerate(WISHLIST):# Iteration über alle Einträge mit Index, um nach der passenden ID zu suchen
        if entry.get("id") == item_id:# Wenn ein Eintrag mit der gesuchten ID gefunden wurde
            updated = dict(entry) # Kopie des bestehenden Eintrags erstellen
            updated.update(item)# Neue Felder oder Änderungen aus dem Request in die Kopie übernehmen
            WISHLIST[idx] = updated# Aktualisierten Eintrag wieder in die Liste zurückschreiben
            return jsonify({"message": "Merkliste aktualisiert"}), 200 #Erfolgsantwort, wenn das Update geklappt hat

    return jsonify({"error": "Eintrag nicht gefunden"}), 404# Falls kein Eintrag mit dieser ID existiert, wird ein 404 zurückgegeben



if __name__ == "__main__":# Dieser Block wird nur ausgeführt, wenn das Skript direkt gestartet wird (nicht beim Import als Modul)
    print(f"Nutze Datenbankdatei: {DB_PATH}")# Ausgabe im Terminal, welche Datenbankdatei verwendet wird
    app.run(debug=True)# Startet den Flask-Entwicklungsserver mit Debug-Modus (automatischer Reload und Fehlermeldungen)

@app.route('/api/accommodations/<stadt>')# Route mit Pfadparameter 'stadt' zum Filtern von Unterkünften nach Stadt
def get_accommodations_by_city(stadt):# Handler-Funktion, die alle Unterkünfte für eine bestimmte Stadt aus der Datenbank holt
    conn = get_db_connection()# Neue Datenbankverbindung herstellen
    cur = conn.cursor()# Cursor für SQL-Operationen erzeugen
    cur.execute("""
        SELECT UnterkunftID AS UnterkunftID, Name AS Name, Bezeichnung AS Bezeichnung, 
               Sterne AS Sterne, Stadt AS Stadt, PreisproNacht AS PreisproNacht, 
               maxPersonen AS maxPersonen, Beschreibung AS Beschreibung, 
               Eigenschaften AS Eigenschaften, BildURL AS BildURL 
        FROM Unterkunft WHERE Stadt = ?
    """, (stadt,))# SQL-Query mit Platzhalter; der Parameter 'stadt' wird sicher gebunden, um SQL-Injection zu vermeiden
    rows = cur.fetchall()# Alle gefundenen Zeilen aus der Datenbank holen
    conn.close()# Verbindung schließen
    accommodations = []# Liste für die gefilterten Unterkünfte vorbereiten
    for row in rows:# Für jede Zeile aus der Datenbank
        accommodations.append({
            'id': row['UnterkunftID'], 'name': row['Name'], 'type': row['Bezeichnung'],
            'description': row['Beschreibung'], 'rating': row['Sterne'], 'city': row['Stadt'],
            'price': row['PreisproNacht'], 'maxpersons': row['maxPersonen'],
            'features': row['Eigenschaften'].split(',') if row['Eigenschaften'] else [],
            'image': row['BildURL']
        })
    return jsonify(accommodations)# Gefilterte Unterkünfte als JSON-Antwort zurückgeben


