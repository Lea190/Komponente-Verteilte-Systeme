import sqlite3
import csv
import os

# Pfad zur Datenbank
DB_PATH = "/Users/lea.betz/Studium/3.Semester/Komponente_verteilte_Systeme/buchenDB.db"
CSV_PATH = "/Users/lea.betz/Studium/3.Semester/Komponente_verteilte_Systeme/Daten.csv"

# Datenbank erstellen/überschreiben
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"Alte Datenbank gelöscht: {DB_PATH}")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Tabelle erstellen (Namen entsprechen genau den CSV-Spalten)
cursor.execute("""
    CREATE TABLE Unterkunft (
        "Unterkunft ID" INTEGER PRIMARY KEY,
        "Name" TEXT NOT NULL,
        "Bezeichnung" TEXT NOT NULL,
        "Sterne" INTEGER,
        "Stadt" TEXT,
        "Preis_pro_Nacht" REAL,
        "max_Personen" INTEGER,
        "Beschreibung" TEXT,
        "Eigenschaften" TEXT,
        "Bild_URL" TEXT
    )
""")

# CSV-Daten importieren
with open(CSV_PATH, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute("""
            INSERT INTO Unterkunft 
            ("Unterkunft ID", "Name", "Bezeichnung", "Sterne", "Stadt", 
             "Preis_pro_Nacht", "max_Personen", "Beschreibung", "Eigenschaften", "Bild_URL")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            int(row['UnterkunftID']),
            row['Name'],
            row['Bezeichnung'],
            int(row['Sterne']),
            row['Stadt'],
            float(row['Preis_pro_Nacht']),
            int(row['max_Personen']),
            row['Beschreibung'],
            row['Eigenschaften'],
            row['Bild_URL']
        ))

conn.commit()

# Überprüfung: Anzahl der importierten Datensätze
cursor.execute("SELECT COUNT(*) FROM Unterkunft")
count = cursor.fetchone()[0]
print(f"✓ Datenbank erfolgreich erstellt: {DB_PATH}")
print(f"✓ {count} Unterkünfte importiert")

conn.close()
