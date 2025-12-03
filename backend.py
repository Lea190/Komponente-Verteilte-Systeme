from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ]
    }
})  # erlaubt Aufrufe von deinem Frontend

# Pfad zu deiner SQLite-Datei (prüfe, dass der exakt stimmt!)
DB_PATH = "/Users/lea.betz/Studium/3.Semester/Komponente_verteilte_Systeme/buchenDB.db"


def get_db_connection():
    """Stellt eine Verbindung zu SQLite her und liefert Row-Objekte mit Spaltennamen."""
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"SQLite-Datei nicht gefunden unter: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Zugriff per row["Spaltenname"]
    return conn


def fetch_accommodations():
    """Liest alle Unterkünfte aus der Datenbank und baut Python-Dicts fürs JSON."""
    conn = get_db_connection()
    cur = conn.cursor()

    # WICHTIG: Tabellenname muss exakt so heißen wie in deiner DB
    # In deinem Screenshot: Tabelle "Unterkunft", Spalten:
    # "Unterkunft ID", "Name", "Bezeichnung", "Sterne", "Stadt",
    # "Preis_pro_Nacht", "max_Personen", "Beschreibung", "Eigenschaften", "Bild_URL"
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
    """)
    rows = cur.fetchall()
    conn.close()

    accommodations = []
    for row in rows:
        accommodations.append({
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
    return accommodations


# sehr einfache Merkliste im Arbeitsspeicher
WISHLIST = []


@app.get("/api/accommodations")
def get_accommodations():
    """Gibt alle Unterkünfte aus der SQLite-Datenbank als JSON zurück."""
    accommodations = fetch_accommodations()
    return jsonify(accommodations)


@app.get("/api/wishlist")
def get_wishlist():
    """Gibt die aktuelle Merkliste zurück."""
    return jsonify(WISHLIST)


@app.post("/api/wishlist")
def add_to_wishlist():
    """
    Erwartet ein JSON-Objekt mit einer Unterkunft (mindestens 'id').
    Fügt sie zur Merkliste hinzu, falls sie noch nicht existiert.
    """
    item = request.get_json()
    if not item or "id" not in item:
        return jsonify({"error": "Ungültige Daten"}), 400

    already = any(entry["id"] == item["id"] for entry in WISHLIST)
    if already:
        return jsonify({"message": "Unterkunft ist bereits auf der Merkliste"}), 200

    WISHLIST.append(item)
    return jsonify({"message": "Unterkunft wurde auf die Merkliste gefügt"}), 201


@app.delete("/api/wishlist/<int:item_id>")
def remove_from_wishlist(item_id):
    global WISHLIST
    WISHLIST = [item for item in WISHLIST if item["id"] != item_id]
    return jsonify({"message": "Unterkunft von Merkliste entfernt"}), 200



if __name__ == "__main__":
    # Starte lokal auf Port 5000; Port kannst du bei Bedarf ändern.
    print(f"Nutze Datenbankdatei: {DB_PATH}")
    app.run(debug=True)


    
