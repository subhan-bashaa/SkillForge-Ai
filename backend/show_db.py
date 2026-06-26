import sqlite3
import os

db_path = os.path.join("instance", "skillforge.db")

if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}. Run the backend server to create it.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Query all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("=" * 60)
print("           SKILLFORGE AI SQLite DATABASE SUMMARY")
print("=" * 60)

for table in tables:
    table_name = table[0]
    if table_name == "sqlite_sequence":
        continue
    
    # Get row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    
    # Get columns
    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"\nTable: {table_name} ({count} records)")
    print(f"   Columns: {', '.join(columns)}")

print("\n" + "=" * 60)
conn.close()
