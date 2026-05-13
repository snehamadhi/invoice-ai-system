import sqlite3

conn = sqlite3.connect("invoices.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT,
    date TEXT,
    amount TEXT,
    status TEXT
)
""")

conn.commit()
